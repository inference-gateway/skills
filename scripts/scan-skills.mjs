#!/usr/bin/env node
// Security-scans every skill in `skills.yaml` with NVIDIA SkillSpector and
// writes one SARIF report per skill (into ./sarif) for CI to upload to the
// GitHub code-scanning tab. See docs/security-scanning.md for the policy.
//
// Gating is SkillSpector's own exit code: `scan` exits 1 when a skill's risk
// score exceeds its threshold (>50), 2 on a scan error, 0 otherwise. This
// script is WARN-ONLY by default (always exits 0). Set SKILLSPECTOR_ENFORCE=1
// to fail the run on any above-threshold or errored skill.
//
// Env knobs:
//   SKILLSPECTOR_CMD      command to invoke (default: skillspector)
//   SKILLSPECTOR_SARIF_DIR  output dir for SARIF (default: sarif)
//   SKILLSPECTOR_ENFORCE  1/true => non-zero exit on findings (default: warn)
//
// Run with: npm run scan
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import yaml from 'js-yaml';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SELF_URL = 'https://github.com/inference-gateway/skills';
const GITHUB_URL_RE = /^https:\/\/github\.com\/([^/]+)\/([^/]+?)\/?$/i;

const CMD = process.env.SKILLSPECTOR_CMD || 'skillspector';
const OUT_DIR = resolve(ROOT, process.env.SKILLSPECTOR_SARIF_DIR || 'sarif');
const ENFORCE = ['1', 'true', 'yes'].includes((process.env.SKILLSPECTOR_ENFORCE || '').toLowerCase());

// Derive scan targets from skills.yaml. Pure (no I/O) so it can be unit-tested.
// Local entries (url == this repo) scan the on-disk skill directory. External
// entries carry the pinned {owner, repo, ref, path} so we scan exactly what the
// catalog ships - not upstream's default branch.
export function scanTargets(sources) {
  return sources.map((entry, i) => {
    const label = `skills.yaml#skills[${i}]`;
    const m = String(entry.url || '').match(GITHUB_URL_RE);
    if (!m) throw new Error(`${label}: invalid or missing GitHub url '${entry.url}'`);
    const path = entry.path && entry.path.length ? entry.path : 'SKILL.md';
    const ref = entry.ref && entry.ref.length ? entry.ref : 'main';
    const isSelf = entry.url.replace(/\/+$/, '') === SELF_URL;
    // name = the skill folder (skills/<name>/SKILL.md), else the repo name.
    const dir = dirname(path);
    const name = dir === '.' ? m[2] : basename(dir);
    return { name, label, isSelf, owner: m[1], repo: m[2], ref, path, dir };
  });
}

function loadSources() {
  const raw = readFileSync(resolve(ROOT, 'skills.yaml'), 'utf8');
  const parsed = yaml.load(raw);
  return Array.isArray(parsed?.skills) ? parsed.skills : [];
}

// Resolve a target to a filesystem path SkillSpector can scan. For external
// entries we fetch just the SKILL.md at the pinned ref (mirrors
// build-catalog.mjs) into a temp dir.
// ponytail: external scan covers SKILL.md only, not bundled scripts/references.
// Upgrade path: clone owner/repo at ref and scan the `dir` subtree instead.
async function resolveTarget(t) {
  if (t.isSelf) {
    const p = resolve(ROOT, t.dir);
    if (!existsSync(p)) throw new Error(`${t.label}: local path '${t.dir}' not found`);
    return p;
  }
  const url = `https://raw.githubusercontent.com/${t.owner}/${t.repo}/${t.ref}/${t.path}`;
  const res = await fetch(url, { headers: { accept: 'text/plain, */*' } });
  if (!res.ok) throw new Error(`${t.label}: HTTP ${res.status} fetching ${url}`);
  const tmp = mkdtempSync(join(tmpdir(), `skillspector-${t.name}-`));
  writeFileSync(join(tmp, 'SKILL.md'), await res.text());
  return join(tmp, 'SKILL.md');
}

function scan(t, target, sarifPath) {
  const args = ['scan', target, '--no-llm', '--format', 'sarif', '--output', sarifPath];
  const r = spawnSync(CMD, args, { stdio: 'inherit' });
  if (r.error) throw r.error; // e.g. skillspector not installed
  return r.status; // 0 ok, 1 above threshold, 2 scan error
}

function appendSummary(md) {
  const f = process.env.GITHUB_STEP_SUMMARY;
  if (f) writeFileSync(f, md, { flag: 'a' });
}

// Give each SARIF run a unique automationDetails.id so the upload-sarif action
// can combine per-skill files without a category collision.
async function tagSarif(sarifPath, id) {
  const raw = JSON.parse(await readFile(sarifPath, 'utf8'));
  if (raw?.runs?.[0]) raw.runs[0].automationDetails = { id };
  await writeFile(sarifPath, JSON.stringify(raw, null, 2));
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const targets = scanTargets(loadSources());
  console.log(`Scanning ${targets.length} skill(s) with ${CMD} (${ENFORCE ? 'enforce' : 'warn-only'})`);

  const rows = [];
  let failures = 0;
  for (const t of targets) {
    const sarifPath = join(OUT_DIR, `${t.name}.sarif`);
    let status;
    try {
      status = scan(t, await resolveTarget(t), sarifPath);
      if (status !== 2) await tagSarif(sarifPath, t.name);
    } catch (err) {
      console.error(`  ✗ ${t.name}: ${err.message}`);
      status = 2;
    }
    const verdict = status === 0 ? 'OK' : status === 1 ? 'ABOVE THRESHOLD' : 'ERROR';
    if (status !== 0) failures++;
    rows.push(`| ${t.name} | ${t.isSelf ? 'local' : `${t.owner}/${t.repo}@${t.ref}`} | ${verdict} |`);
    console.log(`  ${status === 0 ? '✓' : '✗'} ${t.name}: ${verdict}`);
  }

  const summary = [
    '## SkillSpector security scan',
    '',
    `Mode: **${ENFORCE ? 'enforce' : 'warn-only'}** - threshold: SkillSpector risk score > 50.`,
    '',
    '| Skill | Source | Result |',
    '| --- | --- | --- |',
    ...rows,
    '',
  ].join('\n');
  console.log(`\n${summary}`);
  appendSummary(`${summary}\n`);

  if (failures > 0) {
    console.log(`${failures} skill(s) at/above threshold or errored.`);
    if (ENFORCE) process.exit(1);
    console.log('Warn-only mode: not failing the build. Set SKILLSPECTOR_ENFORCE=1 to gate.');
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  await main();
}
