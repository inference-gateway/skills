# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A curated catalog of [Agent Skills](https://github.com/anthropics/skills/tree/main/spec)
for the Inference Gateway ecosystem. There is no application code - content is the product.

Two things live here, and **they must stay in sync**:

1. `catalog.json` - the source of truth consumed by
   <https://registry.inference-gateway.com/skills/> and by `infer skills search` /
   `infer skills install` in the [CLI](https://github.com/inference-gateway/cli).
   Each entry can point at an upstream skill (e.g. in `anthropics/skills`) or at a
   locally hosted body in `skills/<name>/`.
2. `skills/<name>/SKILL.md` - bodies of skills hosted in this repo. The folder name
   must match the SKILL.md frontmatter `name:` exactly.

The catalog is versioned **as a whole** via the repo's git tag - consumers pin to
a catalog version, not per-entry refs. Don't add per-entry refs to `catalog.json`.

## Commands

```sh
task lint        # markdownlint over all *.md (ignores node_modules)
task lint:fix    # same, with --fix
```

CI (`.github/workflows/ci.yml`) runs the same lint with `markdownlint-cli@0.48.0`.
Lint config is `.markdownlint.json` - `MD013` allows 180-char lines; `MD029`,
`MD033`, `MD041` are disabled. Match these limits in new markdown.

## Adding or editing a locally hosted skill

Every PR that adds/edits a skill hosted here must touch **both sides**:

- A `catalog.json` entry with `name`, `description`, `source`, `vendor`,
  `license`, `tags`, `categories`, optional `homepage`.
- `skills/<name>/SKILL.md` with frontmatter `name` (matching the folder) and
  `description` (1-1024 chars; must let a reader decide whether to invoke the
  skill **without reading the body**).

The `skill-creator` skill (`skills/skill-creator/SKILL.md`) documents the
SKILL.md authoring contract in full - read it before adding new skills.

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
