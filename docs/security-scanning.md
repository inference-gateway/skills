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

- **Warn-only (default).** `bun run scan` reports findings in the job summary and SARIF
  but never fails the build. Use this to baseline the catalog first.
- **Enforce.** Set `SKILLSPECTOR_ENFORCE=1` to fail the run when any skill is at/above
  threshold or errors. Flip this on once the catalog is clean (or false positives are
  suppressed via a SkillSpector baseline).

## Run it locally

```sh
# Install SkillSpector (uv fetches a compatible Python itself; no venv needed)
uv tool install git+https://github.com/NVIDIA/skillspector.git

bun run scan                 # warn-only
SKILLSPECTOR_ENFORCE=1 bun run scan   # gate on findings
```

Env knobs: `SKILLSPECTOR_CMD` (default `skillspector`), `SKILLSPECTOR_SARIF_DIR`
(default `sarif`), `SKILLSPECTOR_ENFORCE`.

## CI workflow

The scan runs in
[`.github/workflows/security-scan.yml`](../.github/workflows/security-scan.yml) on pull
requests that touch `skills/**`, `skills.yaml`, or the scan script, and on
`workflow_dispatch`. It uploads the per-skill SARIF to the code-scanning tab.

There is no published SkillSpector image or release tag yet, so CI installs it from source
with `uv` (lighter than building the Docker image every run) and pins a commit SHA for
reproducibility. Bump the SHA in the workflow to re-verify against a newer SkillSpector.

## Known v1 limits

- External skills scan the `SKILL.md` at the pinned `ref` only, not bundled
  scripts/references. To also scan those, clone the repo at `ref` and point SkillSpector
  at the skill subdirectory (see the `ponytail:` note in `scripts/scan-skills.mjs`).
- `--no-llm` keeps CI key-free and fast (static analysis only). For a deeper semantic
  pass, run SkillSpector locally with an `ANTHROPIC_API_KEY` and no `--no-llm`.
