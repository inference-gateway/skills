#!/usr/bin/env node
// Aggregates every Agent Skill listed in `skills.yaml` into `catalog.json`.
//
// Design contract (see issue #4):
//   * One source, one output: `skills.yaml` lists every skill, local or
//     external. No directory walk, no sidecar metadata files.
//   * Entries whose `url` matches this repo are read from the local working
//     tree at `path`; all other entries are fetched from
//     raw.githubusercontent.com at `<ref>/<path>`. This lets PRs that add a
//     new local skill build correctly before merging to main.
//   * `name` and `description` come from SKILL.md frontmatter (single source
//     of truth). `vendor`, `tags`, `categories`, `homepage`, and optional
//     `license` overrides come from the skills.yaml entry. `license` is read
//     from SKILL.md frontmatter when the entry omits it.
//   * Externally-aggregated entries carry a `_source: {url, ref, fetchedAt}`
//     block. Self-referencing (local) entries do not.
//   * `release` is preserved from the existing `catalog.json` so the daily
//     rebuild doesn't wipe semantic-release's version between releases.
//     `updated` is always rewritten (semantic-release's `prepareCmd` will
//     overwrite both at release time).
//   * Fail-closed: any fetch, parse, frontmatter, license, or dedupe error
//     aborts the catalog write - we never publish a partial catalog.
//
// Run with: npm run build
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import matter from 'gray-matter';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCES_FILE = resolve(ROOT, 'skills.yaml');
const OUTPUT_FILE = resolve(ROOT, 'catalog.json');

const SELF_URL = 'https://github.com/inference-gateway/skills';

const GITHUB_URL_RE = /^https:\/\/github\.com\/([^/]+)\/([^/]+?)\/?$/i;
const NAME_RE = /^[a-zA-Z0-9_][a-zA-Z0-9_-]*$/;
const DESCRIPTION_MIN = 1;
const DESCRIPTION_MAX = 1024;

// Mirrors the ADL Skill.license enum
// (https://github.com/inference-gateway/adl/blob/main/schema/v1/schema.json).
const ALLOWED_LICENSES = new Set([
  'MIT',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'GPL-2.0',
  'GPL-3.0',
  'LGPL-2.1',
  'LGPL-3.0',
  'MPL-2.0',
  'ISC',
  'CC0-1.0',
  'CC-BY-4.0',
  'CC-BY-SA-4.0',
  'Unlicense',
  'Proprietary',
]);

const RETRY_LIMIT = 3;
const RETRY_BACKOFF_MS = 750;

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function fetchWithRetry(url, label) {
  for (let attempt = 1; attempt <= RETRY_LIMIT; attempt++) {
    let res;
    try {
      res = await fetch(url, { headers: { accept: 'text/plain, */*' } });
    } catch (err) {
      if (attempt === RETRY_LIMIT) {
        throw new Error(`${label}: network error after ${RETRY_LIMIT} attempts: ${err.message}`);
      }
      await sleep(RETRY_BACKOFF_MS * attempt);
      continue;
    }
    if (res.ok) return res;
    const transient = res.status >= 500 || res.status === 429;
    if (!transient || attempt === RETRY_LIMIT) {
      throw new Error(`${label}: HTTP ${res.status} ${res.statusText} (${url})`);
    }
    await sleep(RETRY_BACKOFF_MS * attempt);
  }
  // unreachable
  throw new Error(`${label}: unreachable retry path`);
}

function validateFrontmatter(label, fm) {
  if (!fm || typeof fm !== 'object') {
    throw new Error(`${label}: SKILL.md is missing a YAML frontmatter block`);
  }
  if (typeof fm.name !== 'string' || !NAME_RE.test(fm.name)) {
    throw new Error(`${label}: frontmatter 'name' must match ${NAME_RE} (got: ${JSON.stringify(fm.name)})`);
  }
  if (typeof fm.description !== 'string') {
    throw new Error(`${label}: frontmatter 'description' must be a string`);
  }
  const desc = fm.description.trim().replace(/\s+/g, ' ');
  if (desc.length < DESCRIPTION_MIN || desc.length > DESCRIPTION_MAX) {
    throw new Error(
      `${label}: frontmatter 'description' length ${desc.length} outside [${DESCRIPTION_MIN}, ${DESCRIPTION_MAX}]`,
    );
  }
  return { name: fm.name, description: desc, license: typeof fm.license === 'string' ? fm.license : undefined };
}

function validateLicense(label, license) {
  if (!ALLOWED_LICENSES.has(license)) {
    const allowed = [...ALLOWED_LICENSES].join(', ');
    throw new Error(`${label}: license '${license}' is not in the ADL Skill enum (${allowed})`);
  }
}

function assertStringArray(label, field, value) {
  if (!Array.isArray(value) || value.some((v) => typeof v !== 'string' || v.length === 0)) {
    throw new Error(`${label}: '${field}' must be a non-empty array of strings`);
  }
}

function normalizeUrl(url) {
  return url.replace(/\/+$/, '');
}

function loadSources() {
  if (!existsSync(SOURCES_FILE)) {
    throw new Error(`${SOURCES_FILE}: missing - skills.yaml is required`);
  }
  const raw = readFileSync(SOURCES_FILE, 'utf8');
  const parsed = yaml.load(raw);
  if (parsed == null) return [];
  if (typeof parsed !== 'object' || !('skills' in parsed)) {
    throw new Error(`${SOURCES_FILE}: must contain top-level 'skills' key`);
  }
  if (parsed.skills == null) return [];
  if (!Array.isArray(parsed.skills)) {
    throw new Error(`${SOURCES_FILE}: top-level 'skills' must be an array`);
  }
  const selfUrl = normalizeUrl(SELF_URL);
  return parsed.skills.map((entry, i) => {
    const label = `${SOURCES_FILE}#skills[${i}]`;
    if (!entry || typeof entry !== 'object') {
      throw new Error(`${label}: entry must be a mapping`);
    }
    if (typeof entry.url !== 'string') {
      throw new Error(`${label}: 'url' is required (string)`);
    }
    const m = entry.url.match(GITHUB_URL_RE);
    if (!m) {
      throw new Error(`${label}: invalid GitHub URL '${entry.url}'`);
    }
    const url = normalizeUrl(entry.url);
    const ref = typeof entry.ref === 'string' && entry.ref.length > 0 ? entry.ref : 'main';
    const path = typeof entry.path === 'string' && entry.path.length > 0 ? entry.path : 'SKILL.md';
    if (typeof entry.vendor !== 'string' || !entry.vendor) {
      throw new Error(`${label}: 'vendor' is required (string)`);
    }
    assertStringArray(label, 'tags', entry.tags);
    assertStringArray(label, 'categories', entry.categories);
    if (entry.homepage !== undefined && typeof entry.homepage !== 'string') {
      throw new Error(`${label}: 'homepage' must be a string if provided`);
    }
    if (entry.license !== undefined) {
      if (typeof entry.license !== 'string') {
        throw new Error(`${label}: 'license' must be a string if provided`);
      }
      validateLicense(label, entry.license);
    }
    return {
      label,
      url,
      ref,
      path,
      owner: m[1],
      repo: m[2],
      isSelf: url === selfUrl,
      vendor: entry.vendor,
      license: entry.license,
      tags: entry.tags,
      categories: entry.categories,
      homepage: entry.homepage,
    };
  });
}

async function readSkillMarkdown(source) {
  if (source.isSelf) {
    const localPath = resolve(ROOT, source.path);
    if (!existsSync(localPath)) {
      throw new Error(`${source.label}: local path '${source.path}' not found in working tree`);
    }
    return { text: readFileSync(localPath, 'utf8'), label: `skills.yaml -> ${source.path}` };
  }
  const { owner, repo, ref, path, url } = source;
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${path}`;
  const label = `${url}@${ref} (${path})`;
  const res = await fetchWithRetry(rawUrl, label);
  return { text: await res.text(), label };
}

async function buildSkillEntry(source, fetchedAt) {
  const { text, label } = await readSkillMarkdown(source);

  let parsed;
  try {
    parsed = matter(text);
  } catch (err) {
    throw new Error(`${label}: SKILL.md frontmatter parse error: ${err.message}`);
  }
  const fm = validateFrontmatter(label, parsed.data);

  const license = source.license ?? fm.license;
  if (!license) {
    throw new Error(`${label}: 'license' missing (not in skills.yaml and not in SKILL.md frontmatter)`);
  }
  validateLicense(label, license);

  // `source` URL points at the directory containing SKILL.md when path is nested,
  // else at the repo tree at the given ref.
  const pathDir = source.path === 'SKILL.md' ? '' : dirname(source.path);
  const sourceUrl = pathDir
    ? `${source.url}/tree/${source.ref}/${pathDir}`
    : `${source.url}/tree/${source.ref}`;

  const entry = {
    name: fm.name,
    description: fm.description,
    source: sourceUrl,
    vendor: source.vendor,
    license,
    tags: source.tags,
    categories: source.categories,
  };
  if (source.homepage) entry.homepage = source.homepage;
  if (!source.isSelf) {
    entry._source = { url: source.url, ref: source.ref, fetchedAt };
  }
  return entry;
}

function loadExistingRelease() {
  if (!existsSync(OUTPUT_FILE)) return undefined;
  try {
    const existing = JSON.parse(readFileSync(OUTPUT_FILE, 'utf8'));
    return typeof existing.release === 'string' ? existing.release : undefined;
  } catch {
    return undefined;
  }
}

async function main() {
  const fetchedAt = new Date().toISOString();

  const sources = loadSources();
  console.log(`Loaded ${sources.length} skill source(s) from skills.yaml`);

  const seen = new Map();
  const entries = [];
  const errors = [];
  for (const source of sources) {
    const tag = source.isSelf ? `(local) ${source.path}` : `${source.url}@${source.ref}`;
    try {
      const entry = await buildSkillEntry(source, fetchedAt);
      if (seen.has(entry.name)) {
        throw new Error(`duplicate name '${entry.name}' (also claimed by ${seen.get(entry.name)})`);
      }
      seen.set(entry.name, tag);
      entries.push(entry);
      console.log(`  ✓ ${entry.name}  ←  ${tag}`);
    } catch (err) {
      errors.push(err.message);
      console.error(`  ✗ ${tag}`);
      console.error(`     ${err.message.replaceAll('\n', '\n     ')}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`${errors.length} skill(s) failed to aggregate; aborting catalog write`);
  }

  const skills = entries.sort((a, b) => a.name.localeCompare(b.name));

  if (skills.length === 0) {
    throw new Error('No skills discovered; refusing to write empty catalog');
  }

  const catalog = {
    version: 1,
    updated: fetchedAt,
    skills,
  };
  const release = loadExistingRelease();
  if (release !== undefined) catalog.release = release;

  const serialized = JSON.stringify(catalog, null, 2) + '\n';
  // Re-parse before writing: defends against any future code path that hands
  // us a non-serializable value (e.g. BigInt, function, circular ref) and
  // would otherwise replace a known-good catalog with an unreadable file.
  try {
    JSON.parse(serialized);
  } catch (err) {
    throw new Error(`Refusing to overwrite ${OUTPUT_FILE}: serialized catalog is not valid JSON: ${err.message}`);
  }

  writeFileSync(OUTPUT_FILE, serialized);
  console.log(`Wrote ${skills.length} skill(s) to ${OUTPUT_FILE}`);
}

await main();
