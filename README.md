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
  <!-- Security Scan Badge -->
  <a href="https://github.com/inference-gateway/skills/actions/workflows/security-scan.yml?query=branch%3Amain">
    <img
      src="https://github.com/inference-gateway/skills/actions/workflows/security-scan.yml/badge.svg?branch=main"
      alt="Security Scan"/>
  </a>
</p>

Curated catalog of [Agent Skills](https://github.com/anthropics/skills/tree/main/spec)
for the Inference Gateway ecosystem.

This repository serves two purposes:

1. **Catalog** - `catalog.json` is the generated index served at
   <https://registry.inference-gateway.com/skills/>. It is **not hand-edited** -
   `scripts/build-catalog.mjs` rebuilds it from a single source-of-truth
   input: `skills.yaml`, which lists every skill (local or external) as one
   entry. Local entries are read from `skills/<name>/SKILL.md` in this repo;
   external entries are fetched from upstream at the pinned `ref`.
2. **Skill bodies** - folders under `skills/` contain skill content that the
   Inference Gateway maintainers have authored, vendored, or adapted. Each folder
   retains its own LICENSE.

## Installing a skill

Besides `infer skills install <name>`, every skill in the catalog can be
installed with the [`skills` CLI](https://github.com/vercel-labs/skills) - the
open standard for the agent skills ecosystem (Claude Code, Codex, Cursor,
OpenCode and more):

```sh
# every skill authored in this repo
npx skills add inference-gateway/skills

# a single skill, by its catalog name
npx skills add inference-gateway/skills --skill adl

# or by the catalog entry's `source` URL (works for external skills too)
npx skills add https://github.com/inference-gateway/skills/tree/main/skills/adl

# list what's available without installing
npx skills add inference-gateway/skills --list
```

Add `-g` to install globally instead of into the current project, and
`-a claude-code` to target a specific agent.

## Adding a skill

Open a pull request that:

- Adds one entry to `skills.yaml`. See the comment block at the top of that
  file for the entry schema.
  - **Skill body in this repo**: set `url:
https://github.com/inference-gateway/skills` and `path:
skills/<name>/SKILL.md`. Also add `skills/<name>/SKILL.md` with valid
    Agent Skills frontmatter (`name` matching the folder, `description`
    1-1024 chars; `license:` recommended).
  - **Skill body in another repo**: set `url` to the upstream repo and pin
    `ref:` to a release tag. The build job fetches the upstream `SKILL.md`,
    validates the frontmatter, and merges the entry into `catalog.json`.
- For skills derived from a third party and vendored into this repo,
  preserves the upstream `LICENSE` inside the skill folder and adds a
  `NOTICE` file at the repo root recording the attribution.

You do not edit `catalog.json` by hand - the build script regenerates it.
Run `bun install && bun run build` and **commit the regenerated `catalog.json`
in the same pull request**; CI fails if it is stale. This keeps the catalog
consistent with every release tag, which is what `@latest` on the CDN serves.

The catalog is versioned as a whole via the repo's git tag (see [Releases](https://github.com/inference-gateway/skills/releases)),
so per-entry refs aren't needed - consumers pin to a catalog version.

The catalog is consumed by:

- [registry.inference-gateway.com/skills/](https://registry.inference-gateway.com/skills/)
  - human-browsable listing.
- [registry.inference-gateway.com/skills/index.json](https://registry.inference-gateway.com/skills/index.json)
  - machine-readable index used by `infer skills search` /
    `infer skills install <name>` in the
    [inference-gateway CLI](https://github.com/inference-gateway/cli).

## Security scanning

Every catalog skill is security-scanned with
[NVIDIA SkillSpector](https://github.com/NVIDIA/SkillSpector) - local skills and
external ones at their pinned `ref`. Run `bun run scan` locally (warn-only) or see
[docs/security-scanning.md](docs/security-scanning.md) for the threshold policy and the
CI workflow.

## Licensing

- Repository-level files (`README.md`, `catalog.json`, `LICENSE`) and IG-authored
  skills under `skills/` are Apache-2.0.
- Skills derived from a third-party project carry their own license inside the
  skill folder; that license takes precedence for that skill's contents.
