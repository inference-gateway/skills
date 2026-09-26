# Security scanning

Skills in this catalog are security-scanned with
[NVIDIA SkillSpector](https://github.com/NVIDIA/SkillSpector) (Apache-2.0) in CI. Skills
execute with implicit trust in the agent that loads them, so a malicious or vulnerable
skill is a supply-chain risk for every downstream user of `infer skills install`. Read
["Known v1 limits"](#known-v1-limits) for what the scan does *not* cover - notably
entries that track an upstream branch.

The scan is driven by [`scripts/scan-skills.mjs`](../scripts/scan-skills.mjs), which reads
`skills.yaml` and scans each entry:

- **Local skills** (`url` == this repo): the on-disk `skills/<name>/` directory.
- **External skills**: the `SKILL.md` fetched at the entry's `ref` (default `main` when
  omitted) - the same coordinates `scripts/build-catalog.mjs` uses, so the scan sees what
  the catalog ships *at scan time*.

It writes a single combined SARIF report to `./sarif/skills.sarif` for upload to the GitHub
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
`workflow_dispatch`. It uploads the combined SARIF to the code-scanning tab.

There is no published SkillSpector image or release tag yet, so CI installs it from source
with `uv` (lighter than building the Docker image every run) and pins a commit SHA for
reproducibility. Bump the SHA in the workflow to re-verify against a newer SkillSpector.

## Known v1 limits

- External skills scan the `SKILL.md` at the pinned `ref` only, not bundled
  scripts/references. To also scan those, clone the repo at `ref` and point SkillSpector
  at the skill subdirectory (see the `ponytail:` note in `scripts/scan-skills.mjs`).
- **Branch-tracked entries are scanned point-in-time, never rescanned.** `adl`,
  `opentask`, `mloda`, `mloda-plugins` and `video-editing` set `ref: main`; `tokenless`
  omits `ref`, which defaults to `main`. `main` is the default branch of each of those
  upstream repos, and the catalog `source` is a `tree/main` URL that `infer skills
  install` resolves at install time. The scan only runs on pull requests touching
  `skills/**`, `skills.yaml` or the scan script, plus `workflow_dispatch` - the daily
  `Build catalog` PR touches only `catalog.json` and does not trigger it. So an upstream
  commit to one of those six skills lands with consumers without being scanned. Run the
  workflow manually via `workflow_dispatch` to re-verify, or pin the entry to a release
  tag (as the third-party entries do) to make the scanned content immutable.
- `--no-llm` keeps CI key-free and fast (static analysis only). `bun run scan` always
  passes `--no-llm`, so a deeper semantic pass means calling SkillSpector directly.
  SkillSpector picks its provider from `SKILLSPECTOR_PROVIDER` and defaults to `nv_build`
  (an NVIDIA key), so select Anthropic explicitly:

  ```sh
  SKILLSPECTOR_PROVIDER=anthropic ANTHROPIC_API_KEY=sk-ant-... \
    skillspector scan skills/<name>
  ```
