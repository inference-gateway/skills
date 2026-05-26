# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A curated catalog of [Agent Skills](https://github.com/anthropics/skills/tree/main/spec)
for the Inference Gateway ecosystem. There is no application code - content is the product.

Three things live here, and **they must stay in sync**:

1. `catalog.json` - the **generated** output served at
   <https://registry.inference-gateway.com/skills/> and consumed by
   `infer skills search` / `infer skills install` in the
   [CLI](https://github.com/inference-gateway/cli). **Do not hand-edit.** It is
   rebuilt by `scripts/build-catalog.mjs` from the two source-of-truth inputs
   below.
2. `skills/<name>/SKILL.md` + `skills/<name>/catalog.yaml` - bodies of skills
   hosted in this repo. The folder name must match the SKILL.md frontmatter
   `name:` exactly. The sidecar `catalog.yaml` carries the non-frontmatter
   catalog fields (`vendor`, `tags`, `categories`, `homepage`, optional
   `license` override).
3. `skills.yaml` - source list of **externally-hosted** skills (entries of
   `{url, ref, path?, vendor, license?, tags, categories, homepage}`). The
   build script fetches each upstream `SKILL.md`, validates the frontmatter,
   and merges the entries into `catalog.json` alongside the local ones.

The catalog is versioned **as a whole** via the repo's git tag - consumers pin to
a catalog version, not per-entry refs. Don't add per-entry refs to `catalog.json`.

## Commands

```sh
task lint        # markdownlint over all *.md (ignores node_modules)
task lint:fix    # same, with --fix
npm install      # one-time, before running the catalog build
npm run build    # regenerate catalog.json from skills/ + skills.yaml
```

CI (`.github/workflows/ci.yml`) runs the same lint with `markdownlint-cli@0.48.0`.
Lint config is `.markdownlint.json` - `MD013` allows 180-char lines; `MD029`,
`MD033`, `MD041` are disabled. Match these limits in new markdown.

The `Build catalog` workflow (`.github/workflows/build-catalog.yml`) runs
`npm run build` on every push that touches `skills.yaml`, `skills/**`,
`scripts/build-catalog.mjs`, or `package.json`, plus a daily cron at `0 4 * * *`
UTC and on `workflow_dispatch`. It auto-commits with
`chore(catalog): Rebuild catalog.json [skip ci]`.

## Adding or editing a locally hosted skill

Every PR that adds/edits a skill hosted here must include:

- `skills/<name>/SKILL.md` with frontmatter `name` (matching the folder) and
  `description` (1-1024 chars; must let a reader decide whether to invoke the
  skill **without reading the body**). `license:` in the frontmatter is
  recommended (mirrors the ADL Skill license enum); the build script falls back
  to the sidecar if absent.
- `skills/<name>/catalog.yaml` with `vendor`, `tags`, `categories`, optional
  `homepage`, and optional `license` (only needed if the SKILL.md frontmatter
  doesn't carry one or you want to override it).

You do **not** edit `catalog.json` by hand - the build script regenerates it.
Run `npm run build` locally to preview the resulting entry.

The `skill-creator` skill (`skills/skill-creator/SKILL.md`) documents the
SKILL.md authoring contract in full - read it before adding new skills.

## Adding an externally-hosted skill

Open a PR adding a single entry to `skills.yaml`. The build script will fetch
the upstream `SKILL.md`, validate its frontmatter, and merge the entry into
`catalog.json`. See the comment block at the top of `skills.yaml` for the
entry schema. Pin a release tag (`ref:`) rather than `main` for third-party
skills so upstream changes can't break the catalog mid-cycle.

### Third-party derived skills

When a skill body is vendored or adapted from another project:

- Preserve the upstream `LICENSE` **inside** `skills/<name>/` (see
  `skills/maintainer/LICENSE`, `skills/adl/LICENSE` for the pattern).
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

This is one repo in the `inference-gateway/*` polyrepo. For cross-repo concerns
(release flow, issue templates, the docs-ticket rule for `feat:`/`refactor:`
changes, etc.), defer to the `maintainer` skill (`skills/maintainer/SKILL.md`) -
it encodes the org-wide playbook rather than restating it here.

**Don't conflate** this public catalog repo (`inference-gateway/skills`,
Apache-2.0, Agent Skills spec) with any private Claude Code skills directory on
a developer machine. They're different things with different scopes.
