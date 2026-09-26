# AGENTS.md

Guidance for coding agents working in this repository. `README.md` is consumer-facing; `docs/security-scanning.md` covers the scan policy.

## What this repo is

A curated catalog of [Agent Skills](https://github.com/anthropics/skills/tree/main/spec) for the Inference Gateway ecosystem. Content is the product — there is no application code.

- `skills.yaml` — single source of truth: one entry per skill (local or external). The entry schema is documented in the comment block at the top of the file.
- `catalog.json` — **generated** by `scripts/build-catalog.mjs` from `skills.yaml`. Served at <https://registry.inference-gateway.com/skills/> and consumed by `infer skills search` / `infer skills install`. Never hand-edit it; never add per-entry refs (the catalog is versioned as a whole by the repo git tag).
- `skills/<name>/SKILL.md` — bodies of skills authored or vendored here. The folder name must equal the frontmatter `name:`.

## Commands

Requires [bun](https://bun.sh) >= 1.3 (`bun install` once first):

```sh
bun run build      # regenerate catalog.json from skills.yaml + skills/ (alias: task build)
task lint          # markdownlint over all *.md; task lint:fix to autofix
bun test           # node:test suites in scripts/*.test.mjs
bun run format     # prettier over all *.md; check with task format:check
task serve         # serve catalog.json at http://localhost:8787/skills/
bun run scan       # SkillSpector security scan - warn-only; SKILLSPECTOR_ENFORCE=1 gates it
```

Run `task build && task lint` before opening a PR. CI (`ci.yml`) lints with `markdownlint-cli@0.48.0` and fails if `catalog.json` is stale relative to `skills.yaml` + `skills/` — always commit the regenerated `catalog.json` in the same PR. (`.githooks/pre-commit` does this too, but is only active after `git config core.hooksPath .githooks`.)

## Adding or editing a skill

1. Add one entry to `skills.yaml`. Skill body in this repo: `url: https://github.com/inference-gateway/skills` + `path: skills/<name>/SKILL.md` — the build then reads the local working tree, so branch PRs build before merge. Third-party skill: point `url` at the upstream repo and pin `ref:` to a release tag, never `main`.
2. `SKILL.md` frontmatter: `name` must match the folder and be unique catalog-wide; `description` (1–1024 chars) must let an agent decide to invoke the skill **without reading the body**; a license (ADL Skill enum) is **required** in either the `skills.yaml` entry or the frontmatter `license:` (entry wins), and the build aborts with `'license' missing` when neither sets one. The build validates all of this and aborts rather than writing a partial catalog; optional `language:` adds a devicon logo.
3. Skills distilled from an upstream project (current practice: original text, nothing reproduced): credit the upstream at the end of the `SKILL.md` and in the root `NOTICE`; the skill stays Apache-2.0. Only if upstream content is vendored **verbatim** do you also keep the upstream `LICENSE` inside `skills/<name>/` and set that license on the entry — no skill folder does this today.

Read `skills/skill-creator/SKILL.md` before authoring new skills. The build preserves untouched entries' `fetchedAt`, so a skill PR's `catalog.json` diff stays exactly its own entry and parallel PRs merge cleanly.

## Markdown style

Configured in `.markdownlint.json`: 180-char lines (`MD013`; tables and code blocks exempt), `MD029` / `MD033` / `MD041` off. Prettier also formats all `*.md`. Skill folders are lowercase kebab-case.

## Commits & releases

Conventional Commits drive semantic-release: `feat` = minor; `fix`, `refactor`, `perf`, `impr`, `ci`, `docs`, `chore`, `style`, `test`, `build` = patch (`chore(release)` excluded). Do not hand-edit `CHANGELOG.md` or the `release` / `updated` fields in `catalog.json` — release tooling writes both, and the release workflow is manual (`workflow_dispatch`). PRs should describe the catalog change, list the skill folders touched, and note any license/attribution implications. For cross-repo conventions (e.g. docs tickets for `feat:`/`refactor:` changes), see the org-level `inference-gateway/.github` docs.