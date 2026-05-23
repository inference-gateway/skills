# AGENTS.md - Inference Gateway Skills

A guide for AI agents working with the [`inference-gateway/skills`](https://github.com/inference-gateway/skills) repository.

---

## Project Overview

This repository is a **curated catalog of Agent Skills** for the
[Inference Gateway](https://github.com/inference-gateway) ecosystem. It follows the
[Agent Skills specification](https://github.com/anthropics/skills/tree/main/spec) from Anthropic.

**There is no application code - content is the product.** The repo serves two purposes:

1. **Catalog** - `catalog.json` is the machine-readable source of truth consumed by the
   [registry UI](https://registry.inference-gateway.com/skills/) and by
   `infer skills search` / `infer skills install` in the
   [Inference Gateway CLI](https://github.com/inference-gateway/cli).
2. **Skill bodies** - Folders under `skills/<name>/` contain `SKILL.md` files that agent runtimes read and load.

### Main Technologies

| Technology | Purpose |
| --- | --- |
| **Markdown** | All skill content (`SKILL.md` files) |
| **JSON** | Catalog manifest (`catalog.json`) |
| **Task** (Go Task runner) | Build/lint automation (`Taskfile.yml`) |
| **markdownlint-cli** | Markdown linting and quality control |
| **GitHub Actions** | CI and Claude Code automation |
| **Dependabot** | Automated dependency updates |

---

## Architecture & Structure

```text
./
├── catalog.json              # Machine-readable skill index (source of truth)
├── Taskfile.yml              # Task runner commands
├── CLAUDE.md                 # Guidance for Claude Code
├── AGENTS.md                 # Guidance for AI agents (this file)
├── LICENSE                   # Repository license (Apache-2.0)
├── .markdownlint.json        # Markdown linting configuration
├── .gitignore                # Git ignore rules
├── .github/
│   ├── workflows/
│   │   ├── ci.yml            # CI pipeline (markdownlint on PRs/pushes to main)
│   │   └── claude.yml        # Claude Code GitHub Actions integration
│   └── dependabot.yml        # Weekly dependency updates for GitHub Actions
└── skills/
    ├── skill-creator/
    │   ├── SKILL.md          # Skill body: guides creating new skills
    │   └── LICENSE           # Apache-2.0 (IG-authored)
    └── maintainer/
        ├── SKILL.md          # Skill body: ecosystem-wide maintenance guidance
        └── LICENSE           # Apache-2.0 (IG-authored)
```

### Two Things Must Stay in Sync

1. **`catalog.json`** - Must contain an entry for every skill. Each entry requires:
   `name`, `description`, `source`, `vendor`, `license`, `tags`, `categories`,
   and optional `homepage`. The catalog itself is versioned by the repo's git
   tag (semantic-release maintains `release` and `updated` at the top level),
   so per-entry refs aren't carried.

2. **`skills/<name>/SKILL.md`** - The folder name must match the `name:` field in the frontmatter **exactly**. Frontmatter requires `name` and `description` (1–1024 chars).

---

## Development Environment Setup

### Prerequisites

- **Node.js** (LTS) - Required for `markdownlint-cli`
- **Go Task** ([installation guide](https://taskfile.dev/installation/)) - For running task commands

### Quick Start

```sh
# Install markdownlint globally
npm install -g markdownlint-cli@0.48.0

# Verify setup by running the linter
task lint
```

### Optional Setup

- **`infer` CLI** - The [Inference Gateway CLI](https://github.com/inference-gateway/cli) for `infer skills search` / `infer skills install` commands used to consume skills.

---

## Key Commands

| Command | Description |
| --- | --- |
| `task lint` | Lint all `*.md` files with markdownlint |
| `task lint:fix` | Lint and auto-fix all `*.md` files |
| `task` (or `task --list`) | List all available task targets |
| `npm install -g markdownlint-cli@0.48.0` | Install the markdownlint CLI (globa-only tool, no `package.json`) |

### Running Lint on Specific Files

```sh
# Lint all markdown files (same as task lint)
markdownlint '**/*.md' --ignore node_modules

# Lint a specific file
markdownlint 'skills/my-skill/SKILL.md'

# Auto-fix
markdownlint '**/*.md' --ignore node_modules --fix
```

---

## Testing Instructions

This project does **not** have a formal test framework (no unit tests, no `package.json`). Quality is enforced through:

1. **Linting** - `task lint` runs markdownlint across all `*.md` files
2. **Structural validation** - CI checks that markdown passes lint rules
3. **Manual review** - PR reviewers validate:
   - SKILL.md frontmatter correctness (name matches folder, description is 1–1024 chars)
   - catalog.json entry completeness (all required fields present)
   - For third-party skills: LICENSE file preserved, NOTICE added

To validate a skill addition locally:

```sh
# 1. Lint your new SKILL.md
markdownlint 'skills/<name>/SKILL.md'

# 2. Verify catalog.json is valid JSON
python3 -m json.tool catalog.json > /dev/null && echo "Valid JSON"

# 3. Verify folder name matches frontmatter name
grep -A1 '^name:' skills/<name>/SKILL.md | head -1
```

---

## CI / GitHub Actions

### CI Pipeline (`.github/workflows/ci.yml`)

- **Triggers:** Push/PR to `main` branch
- **Runtime:** `ubuntu-24.04`
- **Steps:**
  1. Checkout code
  2. Setup Node.js (LTS)
  3. Install markdownlint-cli@0.48.0
  4. Run `markdownlint '**/*.md' --ignore node_modules`

### Claude Code Workflow (`.github/workflows/claude.yml`)

- **Triggers:** Issue comments, PR review comments, issue open/assign, PR review submission containing `@claude`
- **Runtime:** `ubuntu-24.04` with permissions for contents, PRs, issues write access
- **Steps:**
  1. Install Go Task
  2. Setup Node.js
  3. Install the maintainer skill from this repo
  4. Run Claude Code with `claude-opus-4-7` model
  5. Creates feature branches (`claude/` prefix) - never pushes to `main` directly
  6. Uses Conventional Commits style
  7. Integrates with Upstash Context7 MCP server

### Dependabot (`.github/dependabot.yml`)

- Weekly updates for GitHub Actions dependencies
- Groups all GitHub Actions updates together

---

## Linting Configuration

The `.markdownlint.json` file customizes markdownlint rules:

```json
{
  "MD013": {
    "line_length": 180,      // Allow lines up to 180 chars (default 80)
    "tables": false,          // Don't enforce line length in tables
    "code_blocks": false      // Don't enforce line length in code blocks
  },
  "MD029": false,             // Disable ordered list item prefix rule
  "MD033": false,             // Disable inline HTML rule
  "MD041": false              // Disable first-line heading rule
}
```

Key rule codes disabled/allowed:

- **MD013** (line-length): Extended to 180 chars, excluded for tables and code blocks
- **MD029** (ol-prefix): Disabled - allows any ordered list numbering style
- **MD033** (no-inline-html): Disabled - allows inline HTML for badges/images
- **MD041** (first-line-heading): Disabled - allows frontmatter before headings

---

## Project Conventions & Coding Standards

### Skill Authoring Conventions

- **Name format:** Lowercase, hyphenated, 1–64 characters, matching `^[a-z0-9-]+$`
- **Folder must match frontmatter name** exactly (case-sensitive)
- **Description:** 1–1024 characters - must let a reader decide whether to invoke the skill *without reading the body*
- **Body format:** Lead with trigger condition ("Use this skill when..."), then numbered steps, then optional notes
- **No preamble or marketing copy** - keep it tight and actionable

### What Skills SHOULD NOT Do

- Duplicate the runtime's built-in tools (file reads, web search, shell execution)
- Embed credentials, API keys, or environment-specific paths
- Embed screenshots, diagrams, or long code samples directly in `SKILL.md` (link to sibling files instead)
- Restate the description in the body body (the runtime already shows it)

### Commit Style

- **Conventional Commits:** `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`, optionally scoped (`chore(deps):`)
- `semantic-release` reads these to compute versions
- Format used in CI Claude Code: `feat(client): Add retry mechanism for streaming requests`

### Licensing

- **Repository-level files** (`README.md`, `catalog.json`, `LICENSE`, `Taskfile.yml`, configs) - Apache-2.0
- **IG-authored skills** (under `skills/<name>/`) - Apache-2.0 (each folder carries its own `LICENSE`)
- **Third-party/vendored skills** - Their own license takes precedence inside the skill folder; must preserve the upstream `LICENSE` and add a `NOTICE` file at the repo root
- **No em dash or en dash** in titles, bodies, comments, or footers when filing issues against `inference-gateway/docs` - use ASCII hyphen `-` (U+002D)

### Git Workflow

- **Branching:** Feature branches; never push directly to `main`
- **CI:** Runs on push/PR to `main`
- **PRs for new skills** must touch both `catalog.json` AND `skills/<name>/SKILL.md`

---

## Important Files & Configurations

| File | Purpose |
| --- | --- |
| **`catalog.json`** | Machine-readable skill catalog - source of truth consumed by registry and CLI. Must be kept in sync with `skills/` directory. |
| **`Taskfile.yml`** | Task runner definition with `lint` and `lint:fix` targets. Add new targets here if needed. |
| **`.markdownlint.json`** | Markdown linting rule overrides. Modify this if lint rules need adjustment. |
| **`.github/workflows/ci.yml`** | CI pipeline definition. Runs markdownlint on push/PR to main. |
| **`.github/workflows/claude.yml`** | Claude Code GitHub Action integration triggered by `@claude` mentions. |
| **`.github/dependabot.yml`** | Weekly dependency updates for GitHub Actions. |
| **`.gitignore`** | Currently ignores `**/.env` files only. |
| **`CLAUDE.md`** | Guidance for Claude Code when working in this repo. Read before making changes. |
| **`AGENTS.md`** | Guidance for AI agents working in this repo (this file). |
| **`LICENSE`** | Repository-level Apache 2.0 license. |
| **`skills/<name>/SKILL.md`** | Individual skill bodies. Each has frontmatter `name` and `description`, plus markdown body. |

---

## Adding a New Skill (Step-by-Step)

1. **Pick a name** - lowercase, hyphenated, `^[a-z0-9-]+$`, 1–64 chars
2. **Write a one-line description** - 1–1024 chars, must convey what it does and when to use it
3. **Create `skills/<name>/SKILL.md`** with frontmatter (`name`, `description`) and body
4. **Add an entry to `catalog.json`** with all required fields
5. **If derived from a third party:** preserve the upstream `LICENSE` in the skill folder and add a `NOTICE` at the repo root
6. **Validate:** `markdownlint 'skills/<name>/SKILL.md'`
7. **Open a PR** with both the `catalog.json` entry and the new `skills/<name>/` folder

### SKILL.md Template

```markdown
---
name: <skill-name>
description: <one sentence: what it does, when to use it>
---

# <Skill Title>

Use this skill when <trigger condition>.

## Steps

1. ...
2. ...

## Notes

- ...
```

### catalog.json Entry Template

```json
{
  "name": "<skill-name>",
  "description": "<one sentence>",
  "source": "https://github.com/inference-gateway/skills/tree/main/skills/<skill-name>",
  "vendor": "inference-gateway",
  "license": "Apache-2.0",
  "tags": ["tag1", "tag2"],
  "categories": ["developer-tools"],
  "homepage": "https://github.com/inference-gateway/skills"
}
```

---

## Cross-Repo Awareness

This repo (`inference-gateway/skills`) is part of a larger Inference Gateway polyrepo ecosystem. Other repos include:

- `inference-gateway/inference-gateway` - Main Go HTTP gateway
- `inference-gateway/cli` - Command-line client (`infer`)
- `inference-gateway/docs` - Next.js + MDX documentation site
- `inference-gateway/.github` - Org-level community health (issue templates, shared workflows)

For changes that might ripple beyond this repo, consult the **`maintainer` skill**
located at `skills/maintainer/SKILL.md`, which encodes ecosystem-wide guidance
covering cross-repo changes, issue filing procedures, and CI conventions.

---

## Reading This Repo From Other Skills/Agents

When another skill or agent needs to consult this repo (e.g., in CI where only one repo is checked out):

```sh
# Fetch a single file
gh api repos/inference-gateway/skills/contents/catalog.json -H 'Accept: application/vnd.github.raw'

# Fetch a skill body
gh api repos/inference-gateway/skills/contents/skills/maintainer/SKILL.md -H 'Accept: application/vnd.github.raw'

# Read on a specific ref
gh api repos/inference-gateway/skills/contents/skills/maintainer/SKILL.md?ref=main \
  -H 'Accept: application/vnd.github.raw'

# Clone read-only for bulk access
gh repo clone inference-gateway/skills -- --depth=1
```
