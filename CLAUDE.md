# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A curated catalog of [Agent Skills](https://github.com/anthropics/skills/tree/main/spec)
for the Inference Gateway ecosystem. There is no application code - content is the product.

Two things live here, and **they must stay in sync**:

1. `catalog.json` - the **generated** output served at
   <https://registry.inference-gateway.com/skills/> and consumed by
   `infer skills search` / `infer skills install` in the
   [CLI](https://github.com/inference-gateway/cli). **Do not hand-edit.** It is
   rebuilt by `scripts/build-catalog.mjs` from the single source-of-truth
   input below.
2. `skills.yaml` - **every** skill (local + external) is one entry here:
   `{url, ref?, path?, vendor, license?, tags, categories, homepage?}`. When
   `url` points at this repo (`https://github.com/inference-gateway/skills`),
   the build reads `path` from the local working tree so branch PRs build
   correctly before merging to `main`; otherwise it fetches from upstream at
   `<ref>/<path>`. Skill bodies for in-repo entries live under
   `skills/<name>/SKILL.md` and the folder name must match the SKILL.md
   frontmatter `name:` exactly.

The catalog is versioned **as a whole** via the repo's git tag - consumers pin to
a catalog version, not per-entry refs. Don't add per-entry refs to `catalog.json`.

## Commands

```sh
task lint        # markdownlint over all *.md (ignores node_modules)
task lint:fix    # same, with --fix
bun install      # one-time, before running the catalog build
task build       # regenerate catalog.json from skills/ + skills.yaml
task serve       # serve catalog.json at http://localhost:8787/skills/
```

CI (`.github/workflows/ci.yml`) runs the same lint with `markdownlint-cli@0.48.0`.
Lint config is `.markdownlint.json` - `MD013` allows 180-char lines; `MD029`,
`MD033`, `MD041` are disabled. Match these limits in new markdown.

The `Build catalog` workflow (`.github/workflows/build-catalog.yml`) runs
`bun run build` on every push that touches `skills.yaml`, `skills/**`,
`scripts/build-catalog.mjs`, or `package.json`, plus a daily cron at `0 4 * * *`
UTC and on `workflow_dispatch`. It opens an automated pull request (branch
`chore/rebuild-catalog`) titled `chore(catalog): Rebuild catalog.json`.

## Adding or editing a skill

Every PR that adds/edits a skill must include:

- An entry in `skills.yaml`. See the comment block at the top of that file
  for the entry schema. For a skill whose body lives in this repo, point
  `url` at `https://github.com/inference-gateway/skills` and set `path` to
  `skills/<name>/SKILL.md`. For a third-party skill, point `url` at its repo
  and pin a release `ref:` rather than `main` so upstream changes can't
  break the catalog mid-cycle.
- For in-repo entries: `skills/<name>/SKILL.md` with frontmatter `name`
  (matching the folder) and `description` (1-1024 chars; must let a reader
  decide whether to invoke the skill **without reading the body**).
  `license:` in the frontmatter is recommended (mirrors the ADL Skill license
  enum); the build script falls back to the skills.yaml entry if absent.

You do **not** edit `catalog.json` by hand - the build script regenerates it.
Run `bun run build` locally to preview the resulting entry.

The `skill-creator` skill (`skills/skill-creator/SKILL.md`) documents the
SKILL.md authoring contract in full - read it before adding new skills.

### Third-party derived skills

When a skill body is vendored or adapted from another project:

- Preserve the upstream `LICENSE` **inside** `skills/<name>/`.
- Add a `NOTICE` file at the repo root recording the attribution.
- That skill's contents are governed by its own license, **not** the repo-level
  Apache-2.0.

## Releases (don't hand-edit generated state)

Semantic-release (`.releaserc.yaml`) drives versioning from Conventional
Commits and writes the following at release time:

- `CHANGELOG.md` - do not hand-edit.
- `catalog.json` - the `release` and `updated` fields are rewritten by the
  release `prepareCmd` (a `jq` invocation). Don't manually bump them in PRs.
  The daily `Build catalog` workflow preserves the existing `release` field
  between releases so it doesn't get wiped by rebuilds.

Commit types that bump versions: `feat` (minor), `fix`/`refactor`/`perf`/`impr`
(patch), plus `ci`/`docs`/`chore`/`style`/`test`/`build` (patch). `chore(release)`
is excluded from version bumps. `chore(deps)` for dependency bumps is fine.

The `Release` workflow (`.github/workflows/release.yml`) is `workflow_dispatch`
only - releases are manual, not on every merge to `main`.

## Ecosystem awareness

This is one repo in the `inference-gateway/*`. For cross-repo concerns
(release flow, issue templates, the docs-ticket rule for `feat:`/`refactor:`
changes, etc.), consult `inference-gateway/.github` (the org-level `CLAUDE.md`
and `README.md`) and each repo's own `CLAUDE.md` / `AGENTS.md`.

**Don't conflate** this public catalog repo (`inference-gateway/skills`,
Apache-2.0, Agent Skills spec) with any private Claude Code skills directory on
a developer machine. They're different things with different scopes.
