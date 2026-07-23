# Security scanning

Every skill in this catalog is security-scanned with
[NVIDIA SkillSpector](https://github.com/NVIDIA/SkillSpector) (Apache-2.0) before it
reaches consumers of the registry. Skills execute with implicit trust in the agent that
loads them, so a malicious or vulnerable skill is a supply-chain risk for every
downstream user of `infer skills install`.

The scan is driven by [`scripts/scan-skills.mjs`](../scripts/scan-skills.mjs), which reads
`skills.yaml` and scans each entry:

- **Local skills** (`url` == this repo): the on-disk `skills/<name>/` directory.
- **External skills**: the `SKILL.md` fetched at the pinned `ref` - exactly what the
  catalog ships, not upstream's default branch.

It writes one SARIF report per skill into `./sarif/` for upload to the GitHub
code-scanning tab.

## Threshold policy

Gating uses SkillSpector's own verdict: a scan is **at/above threshold** when a skill's
risk score exceeds **50** (SkillSpector's `RISK_THRESHOLD`; exit code `1`). A scan error
is exit code `2`.

- **Warn-only (default).** `npm run scan` reports findings in the job summary and SARIF
  but never fails the build. Use this to baseline the catalog first.
- **Enforce.** Set `SKILLSPECTOR_ENFORCE=1` to fail the run when any skill is at/above
  threshold or errors. Flip this on once the catalog is clean (or false positives are
  suppressed via a SkillSpector baseline).

## Run it locally

```sh
# Install SkillSpector (uv fetches a compatible Python itself; no venv needed)
uv tool install git+https://github.com/NVIDIA/skillspector.git

npm run scan                 # warn-only
SKILLSPECTOR_ENFORCE=1 npm run scan   # gate on findings
```

Env knobs: `SKILLSPECTOR_CMD` (default `skillspector`), `SKILLSPECTOR_SARIF_DIR`
(default `sarif`), `SKILLSPECTOR_ENFORCE`.

## CI workflow

> The maintainer bot cannot commit under `.github/workflows/` (GitHub App workflow
> permission). A maintainer must add the file below as
> `.github/workflows/security-scan.yml`.

There is no published SkillSpector image or release tag yet, so CI installs it from source
with `uv` (lighter than building the Docker image every run) and pins a commit SHA for
reproducibility. Bump the SHA to re-verify against a newer SkillSpector.

```yaml
---
name: Security scan

on:
  pull_request:
    branches:
      - main
    paths:
      - "skills/**"
      - "skills.yaml"
      - "scripts/scan-skills.mjs"
  workflow_dispatch:

permissions:
  contents: read
  security-events: write # upload SARIF to code scanning

jobs:
  skillspector:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v7.0.0
        with:
          persist-credentials: false

      - uses: actions/setup-node@v7.0.0
        with:
          node-version: "24.15.0"

      - run: npm ci

      - uses: astral-sh/setup-uv@v5

      # Pin a commit SHA - SkillSpector has no releases yet. Bump to re-verify.
      - name: Install SkillSpector
        run: uv tool install "git+https://github.com/NVIDIA/skillspector.git@a54947c307fe19a24a43db55f6148e181a987a67"

      # Warn-only to baseline. Set SKILLSPECTOR_ENFORCE=1 here to gate.
      - name: Scan catalog skills
        run: npm run scan

      - name: Upload SARIF to code scanning
        if: always()
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: sarif
```

## Known v1 limits

- External skills scan the `SKILL.md` at the pinned `ref` only, not bundled
  scripts/references. To also scan those, clone the repo at `ref` and point SkillSpector
  at the skill subdirectory (see the `ponytail:` note in `scripts/scan-skills.mjs`).
- `--no-llm` keeps CI key-free and fast (static analysis only). For a deeper semantic
  pass, run SkillSpector locally with an `ANTHROPIC_API_KEY` and no `--no-llm`.
