# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A curated catalog of [Agent Skills](https://github.com/anthropics/skills/tree/main/spec)
for the Inference Gateway ecosystem. There is no application code - content is the product.

Two things live here, and they must stay in sync:

1. `catalog.json` - the source of truth consumed by
   `https://registry.inference-gateway.com/skills/` and by `infer skills search` /
   `infer skills install` in the [CLI](https://github.com/inference-gateway/cli).
   Each entry can point at an upstream skill (e.g. in `anthropics/skills`) or at a
   locally hosted body in `skills/<name>/`.
2. `skills/<name>/SKILL.md` - bodies of skills hosted in this repo. The folder name
   must match the `name:` in the SKILL.md frontmatter exactly.

## Commands

```sh
task lint        # markdownlint over all *.md (ignores node_modules)
task lint:fix    # same, with --fix
```

CI (`.github/workflows/ci.yml`) runs `markdownlint '**/*.md' --ignore node_modules`
with `markdownlint-cli@0.48.0`. The lint config is `.markdownlint.json` - note
`MD013` allows 180-char lines, and `MD029/MD033/MD041` are disabled.

## Adding or editing a skill

When the entry is hosted in this repo, every PR must touch both sides:

- A `catalog.json` entry with `name`, `description`, `source`, `vendor`,
  `license`, `tags`, `categories`, optional `homepage`. The catalog is versioned
  as a whole by the repo's git tag (semantic-release writes `release` and
  `updated` at release time); per-entry refs aren't carried because consumers
  pin to a catalog version, not to individual skill refs.
- `skills/<name>/SKILL.md` with frontmatter `name` (matching the folder) and
  `description` (1–1024 chars, must let a reader decide whether to invoke without
  reading the body).

If the skill is derived from a third party:

- Preserve the upstream `LICENSE` inside `skills/<name>/`.
- Add a `NOTICE` file at the repo root recording the attribution.
- That skill's contents are governed by its own license, not the repo-level MIT.

The `skill-creator` skill in this repo documents the SKILL.md authoring contract:

- read it before adding new skills.

## House conventions (inherited from the org)

- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, ...).
  semantic-release reads these.
- **Don't conflate** this public catalog repo (`inference-gateway/skills`, MIT,
  Agent Skills spec) with any private Claude Code skills directory on a developer
  machine. They are different things.
- The `maintainer` skill in this repo encodes ecosystem-wide guidance for the
  broader `inference-gateway/*` polyrepo (release flow, cross-repo change checklist,
  issue-filing templates). Consult it when a change might ripple beyond this repo.
