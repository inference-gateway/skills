# Repository Guidelines

## Project Structure & Module Organization

This repository is a curated catalog of Agent Skills for the Inference Gateway ecosystem. `catalog.json` is the source of truth for the public registry and CLI skill
search/install flows. Locally hosted skill bodies live in `skills/<name>/` and must include `SKILL.md`; the folder name must match the `name:` frontmatter.
Third-party or adapted skills should keep their own `LICENSE` inside the skill folder. Root-level docs include `README.md`, `CLAUDE.md`, and generated release
history in `CHANGELOG.md`.

## Build, Test, and Development Commands

- `task` - lists available Taskfile commands.
- `task lint` - runs `markdownlint '**/*.md' --ignore node_modules`.
- `task lint:fix` - applies safe Markdown lint fixes.

There is no application build step. Content validation is primarily Markdown linting plus review of `catalog.json` and `SKILL.md` consistency.

## Coding Style & Naming Conventions

Markdown is the main authoring format. Follow `.markdownlint.json`: line length is 180 characters, and HTML is allowed where already used. Keep prose direct and
actionable. Use lowercase kebab-style skill directory names, for example `skills/skill-creator/`. Each hosted `SKILL.md` must include frontmatter with `name` and
`description`; the description should be specific enough for an agent to decide whether to invoke the skill without reading the full body.

## Testing Guidelines

Run `task lint` before opening a pull request. When adding or editing a hosted skill, manually verify both sides of the contract: `catalog.json` includes `name`,
`description`, `source`, `vendor`, `license`, `tags`, `categories`, and optional `homepage`, and `skills/<name>/SKILL.md` exists with matching frontmatter. For
third-party derived content, confirm license and attribution files are present.

## Commit & Pull Request Guidelines

Use Conventional Commits, matching the existing history: `feat:`, `fix:`, `docs:`, `chore:`, `ci:`, or scoped variants such as `chore(deps):`. Semantic-release uses
commit types for versioning; do not hand-edit `CHANGELOG.md` or manually bump generated `release` / `updated` fields in `catalog.json`. Pull requests should describe
the catalog change, list any added or modified skill folders, mention license or attribution implications, and include the `task lint` result.

## Agent-Specific Instructions

Keep `catalog.json` and local skill bodies synchronized. Before creating a new skill, read `skills/skill-creator/SKILL.md` for the full authoring contract. For
organization-wide maintenance or release questions, refer to `skills/maintainer/SKILL.md`.
