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
2. **Skill bodies** - folders under `skills/` contain skill content authored by
   the Inference Gateway maintainers, covered by the repo-level [`LICENSE`](LICENSE)
   (Apache-2.0). Skills distilled from an upstream project credit it at the end of
   their `SKILL.md` and in the root [`NOTICE`](NOTICE).

## Installing a skill

Besides `infer skills install <name>`, every skill in the catalog can be
installed with the [`skills` CLI](https://github.com/vercel-labs/skills) - the
open standard for the agent skills ecosystem (Claude Code, Codex, Cursor,
OpenCode and more):

```sh
# every skill authored in this repo
npx skills add inference-gateway/skills

# a single skill, by its catalog name
npx skills add inference-gateway/skills --skill go

# or by the catalog entry's `source` URL (works for external skills too)
npx skills add https://github.com/inference-gateway/skills/tree/main/skills/go

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
    1-1024 chars). A license is **required** in one of two places - the
    `skills.yaml` entry or the SKILL.md frontmatter (`license:`) - and must be
    an [ADL Skill license enum](scripts/build-catalog.mjs) value; the build
    fails if neither sets one. The `skills.yaml` entry wins when both do.
  - **Skill body in another repo**: set `url` to the upstream repo and pin
    `ref:` to a release tag. The build job fetches the upstream `SKILL.md`,
    validates the frontmatter, and merges the entry into `catalog.json`.
- For a skill distilled from a third-party project, credits it at the end of
  the `SKILL.md` and adds the attribution to the root
  [`NOTICE`](NOTICE). If upstream content is vendored **verbatim**, also
  preserves the upstream `LICENSE` inside `skills/<name>/` and sets that
  license on the entry.

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

- Everything in this repo - repository-level files (`README.md`,
  `catalog.json`, `LICENSE`) and every skill under `skills/` - is Apache-2.0.
  No skill folder currently carries its own license.
- Skills distilled from an upstream project are still Apache-2.0 (the text is
  original); the upstream credit lives in the `SKILL.md` and the root
  [`NOTICE`](NOTICE).
- If a skill ever vendors upstream content verbatim, its upstream `LICENSE` is
  kept inside `skills/<name>/` and takes precedence for that skill's contents.
