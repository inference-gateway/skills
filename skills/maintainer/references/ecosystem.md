# Ecosystem Reference

Use this reference for repo ownership, CI behavior, cross-repo reads, and org-wide conventions.

## Repo Map

The `inference-gateway` GitHub organization. Each repository is separately versioned and released. Refer to
repos by their `inference-gateway/<repo>` GitHub slug rather than local paths. Public repos only; private repos are intentionally omitted.

| Repo (`inference-gateway/...`)                    | Purpose                                                                                                                                    |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `inference-gateway`                               | Main Go HTTP gateway. Vendors `openapi.yaml` from `schemas` for Go code generation.                                                        |
| `cli`                                             | Git-first CLI coding agent (`infer`).                                                                                                      |
| `operator`                                        | Kubernetes operator for the gateway's lifecycle, config, and scaling.                                                                      |
| `schemas`                                         | Source of truth for `openapi.yaml` and the shared MCP/A2A/JSON schemas; consumed by the gateway, SDKs, and docs.                           |
| `sdk`, `python-sdk`, `rust-sdk`, `typescript-sdk` | Client SDKs (Go, Python, Rust, TypeScript), generated from `schemas`.                                                                      |
| `adk`, `rust-adk`, `typescript-adk`               | Agent Development Kits for building A2A-compatible agents (Go, Rust, TypeScript).                                                          |
| `adl`, `adl-cli`                                  | Agent Definition Language (declarative agent manifests) and its scaffolding CLI.                                                           |
| `agents`                                          | Catalog of A2A agent servers.                                                                                                              |
| `*-agent`                                         | Individual A2A agent servers: `browser-agent`, `documentation-agent`, `google-calendar-agent`, `grafana-agent`, `mock-agent`, `n8n-agent`. |
| `a2a-debugger`                                    | A2A agent troubleshooting tool.                                                                                                            |
| `awesome-a2a`                                     | Curated list of tested A2A-compatible agents.                                                                                              |
| `registry`                                        | Website hosting A2A agents built with the ADK.                                                                                             |
| `docs`                                            | Next.js + MDX documentation site.                                                                                                          |
| `infer-action`                                    | GitHub Action wrapper for the `infer` CLI.                                                                                                 |
| `tools`                                           | Shared tooling (e.g., codegen) used across repos.                                                                                          |
| `skills`                                          | Public Agent Skills catalog, distinct from private/local skills directories.                                                               |
| `.github`                                         | Org-level community health repo with default issue templates and shared workflows.                                                         |

Every repo may have its own `CLAUDE.md` or `AGENTS.md`; read local instructions before assuming conventions.

## Determining Context

- In CI, use `$GITHUB_REPOSITORY` (`owner/repo`) and `$GITHUB_WORKSPACE`.
- Locally, use `gh repo view --json nameWithOwner -q .nameWithOwner` or `git remote get-url origin`.
- Treat the current working directory as the current repo. Do not assume sibling repos are checked out.

## Reading Other Repos

Use `gh` when another org repo is not present locally:

```sh
gh api repos/inference-gateway/<repo>/contents/<path> -H 'Accept: application/vnd.github.raw'
gh api repos/inference-gateway/<repo>/contents/<dir>
gh api repos/inference-gateway/<repo>/contents/<path>?ref=<branch-or-sha> -H 'Accept: application/vnd.github.raw'
gh repo clone inference-gateway/<repo> -- --depth=1
```

These work locally and in GitHub Actions when `GH_TOKEN` or `GITHUB_TOKEN` has access to the target repo.

## Cross-Repo Checklist

- Provider/API change in `schemas` `openapi.yaml` -> re-vendor to the gateway and add/update the docs page in `inference-gateway/docs` (`markdown/`)?
- New config env var -> regenerated `Configurations.md`, Helm `values.yaml`, and `examples/docker-compose/*/.env.example`?
- Schema change in `schemas` -> regenerate the SDKs (`sdk`, `python-sdk`, `rust-sdk`, `typescript-sdk`)?
- Main gateway release -> `operator` and Helm chart point at the new image tag?

When running in CI without an interactive user, put this scope note in the PR body, job summary, or issue comment.

## House Conventions

- Commit style: Conventional Commits. Semantic-release reads commit types to compute versions.
- Releases: semantic-release plus goreleaser where applicable. Do not hand-edit `CHANGELOG.md`.
- Go style: early returns, switch over if/else chains, lowercase log messages, code to interfaces, table-driven tests with `t.Run`.
- Mocks: generated via `mockgen` into `tests/mocks/` in the main gateway; refresh with `go generate ./...` or `task generate`.
- Main gateway pre-push confidence path: `task generate && task format && task lint && task build && task test`.
- Vision/multimodal: disabled by default (`ENABLE_VISION=false`); enable explicitly when testing vision flows.

## CI / GitHub Actions

- Prefer `$GITHUB_REPOSITORY`, `$GITHUB_REF`, `$GITHUB_SHA`, `$GITHUB_WORKSPACE`, and `$GITHUB_EVENT_PATH` over inference.
- Authenticate `gh` with `GH_TOKEN=${{ secrets.GITHUB_TOKEN }}` or a PAT for cross-repo access.
- Default `GITHUB_TOKEN` is usually scoped to the current repo. Cross-repo writes require a token with target access.
- Use paths relative to `$GITHUB_WORKSPACE` or `.`.
- Put human-facing results in the PR/issue body, job summary (`$GITHUB_STEP_SUMMARY`), or comment.
- Treat CI as ephemeral: no sibling repos, no developer-machine tools, no writes outside the workspace.

## Do Not

- Do not run `task generate`, push, force-push, or cut releases without explicit confirmation or an explicitly authorized CI step.
- Do not hand-edit generated files.
- Do not assume one repo's `CLAUDE.md` applies to another.
- Do not conflate this public `inference-gateway/skills` catalog with a private Claude Code or Codex skills directory.
- Do not bypass hooks (`--no-verify`, `--no-gpg-sign`) unless the user explicitly asks.
- When unsure which repo owns a concern, search the org: `gh search code --owner inference-gateway '<term>'`.
