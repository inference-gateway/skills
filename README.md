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

1. **Catalog** - `catalog.json` is the generated index served at
   <https://registry.inference-gateway.com/skills/>. It is **not hand-edited** -
   `scripts/build-catalog.mjs` rebuilds it from two source-of-truth inputs:
   skills hosted directly under `skills/<name>/` and external skills listed in
   `skills.yaml`.
2. **Skill bodies** - folders under `skills/` contain skill content that the
   Inference Gateway maintainers have authored, vendored, or adapted. Each folder
   retains its own LICENSE.

## Adding a skill

There are two paths depending on where the skill body lives.

### Locally-hosted skill (body lives in this repo)

Open a pull request that:

- Adds `skills/<name>/SKILL.md` with valid Agent Skills frontmatter (`name`
  matching the folder, `description` 1-1024 chars). `license:` in the
  frontmatter is recommended.
- Adds `skills/<name>/catalog.yaml` with the catalog metadata that isn't in
  SKILL.md frontmatter: `vendor`, `tags`, `categories`, optional `homepage`,
  and optional `license` (override / fallback when the frontmatter omits one).
- For skills derived from a third party, preserves the upstream `LICENSE`
  inside the skill folder and adds a `NOTICE` file at the repo root recording
  the attribution.

You do not edit `catalog.json` by hand - the build script regenerates it.
Run `npm install && npm run build` locally to preview the resulting entry.

### Externally-hosted skill (body lives in another repo)

Open a pull request adding a single entry to `skills.yaml`. The build job
fetches the upstream `SKILL.md`, validates the frontmatter, and merges the
entry into `catalog.json`. See the comment block at the top of `skills.yaml`
for the entry schema. Pin a release tag (`ref:`) for third-party skills.

The catalog is versioned as a whole via the repo's git tag (see [Releases](https://github.com/inference-gateway/skills/releases)),
so per-entry refs aren't needed - consumers pin to a catalog version.

The catalog is consumed by:

- [registry.inference-gateway.com/skills/](https://registry.inference-gateway.com/skills/)
  - human-browsable listing.
- [registry.inference-gateway.com/skills/index.json](https://registry.inference-gateway.com/skills/index.json)
  - machine-readable index used by `infer skills search` /
  `infer skills install <name>` in the
  [inference-gateway CLI](https://github.com/inference-gateway/cli).

## Licensing

- Repository-level files (`README.md`, `catalog.json`, `LICENSE`) and IG-authored
  skills under `skills/` are Apache-2.0.
- Skills derived from a third-party project carry their own license inside the
  skill folder; that license takes precedence for that skill's contents.
