<h1 align="center">Inference Gateway Skills</h1>

<p align="center">
  <!-- CI Status Badge -->
  <a href="https://github.com/inference-gateway/skills/actions/workflows/ci.yml?query=branch%3Amain">
    <img
      src="https://github.com/inference-gateway/skills/actions/workflows/ci.yml/badge.svg?branch=main"
      alt="CI Status"/>
  </a>
  <!-- License Badge -->
  <a href="https://github.com/inference-gateway/skills/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/inference-gateway/skills?color=blue&style=flat-square" alt="License"/>
  </a>
</p>

Curated catalog of [Agent Skills](https://github.com/anthropics/skills/tree/main/spec)
for the Inference Gateway ecosystem.

This repository serves two purposes:

1. **Catalog** — `catalog.json` is the source of truth for the skills listed at
   <https://registry.inference-gateway.com/skills/>. Entries can point at upstream
   skills hosted in vendor repos (e.g. `anthropics/skills`) or at skills hosted
   directly in this repo under `skills/`.
2. **Skill bodies** — folders under `skills/` contain skill content that the
   Inference Gateway maintainers have authored, vendored, or adapted. Each folder
   retains its own LICENSE.

## Adding a skill

Open a pull request that:

- Adds an entry to `catalog.json` with `name`, `description`, `source`,
  `vendor`, `license`, `tags`, `categories`, and optional `homepage`. The
  catalog is versioned as a whole via the repo's git tag (see [Releases](https://github.com/inference-gateway/skills/releases)),
  so per-entry refs aren't needed — consumers pin to a catalog version.
- If hosting the body here, also adds the skill folder under `skills/<name>/`
  with a valid `SKILL.md` (frontmatter `name` + `description`).
- For skills derived from a third party, preserves the upstream `LICENSE` inside
  the skill folder and adds a `NOTICE` file at the repo root recording the
  attribution.

The catalog is consumed by:

- [registry.inference-gateway.com/skills/](https://registry.inference-gateway.com/skills/)
  — human-browsable listing.
- [registry.inference-gateway.com/skills/index.json](https://registry.inference-gateway.com/skills/index.json)
  — machine-readable index used by `infer skills search` /
  `infer skills install <name>` in the
  [inference-gateway CLI](https://github.com/inference-gateway/cli).

## Licensing

- Repository-level files (`README.md`, `catalog.json`, `LICENSE`) and IG-authored
  skills under `skills/` are Apache-2.0.
- Skills derived from a third-party project carry their own license inside the
  skill folder; that license takes precedence for that skill's contents.
