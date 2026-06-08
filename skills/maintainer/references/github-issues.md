# GitHub Issues Reference

Use this reference when asked to file or draft issues in `inference-gateway/*`, or when CI/sync workflows need stable issue
metadata.

## Template Sources

Always check target-repo templates first:

```sh
gh api repos/inference-gateway/<repo>/contents/.github/ISSUE_TEMPLATE
```

If the target repo has no override, use org defaults from `inference-gateway/.github`:

```sh
gh api repos/inference-gateway/.github/contents/.github/ISSUE_TEMPLATE
gh api repos/inference-gateway/.github/contents/.github/ISSUE_TEMPLATE/bug_report.md -H 'Accept: application/vnd.github.raw'
```

Canonical org-default templates:

| Template                   | Title prefix      | Label           | Type      |
| -------------------------- | ----------------- | --------------- | --------- |
| `bug_report.md`            | `[BUG]`           | `bug`           | `Bug`     |
| `feature_request.md`       | `[FEATURE]`       | `enhancement`   | `Feature` |
| `documentation_request.md` | `[DOCS]`          | `documentation` | `Task`    |
| `refactor_request.md`      | `[TASK] Refactor` | `refactor`      | `Task`    |

The org defines only three issue types - `Bug`, `Feature`, `Task`. There is **no** `Documentation` type, so docs tickets
are typed `Task` and rely on the `documentation` label to stand out. Type is set by id (see the id tables under
[Roadmap 2026 board + Status lifecycle](#roadmap-2026-board--status-lifecycle)), not by name.

## Filing Procedure

An issue with no type, no label, and no place on the board is invisible to everyone who triages by type, by label, or off
the Roadmap - which defeats the point of filing it. So whenever you **actually create** an issue (a draft is just prepared
text, it doesn't count yet), give it all four pieces of metadata before you move on:

1. **Label** - set at create time with `gh issue create --label`. The template's `labels:` frontmatter only takes effect
   in the GitHub UI; it does nothing when you file through the API.
2. **Type** - set right after, via one GraphQL mutation (released `gh` still has no `--type` flag; the template's
   `type:` frontmatter is UI-only). In the bot CI shells the allow-list permits **only** that exact
   `updateIssueIssueType` mutation, sent as a single line - copy step 2 below byte-for-byte. If the org doesn't
   define the type you need, warn and continue - don't fail the filing over it.
3. **Roadmap 2026 membership** - add the issue to org project #7 so it surfaces as planned work, not just a stray issue.
4. **Status = Todo** - the board won't set this for you, and an item with no Status reads as "not really tracked."

Then the rules that keep sync orchestrators and the docs site happy: read the template first and fill every section (don't
paraphrase from memory - sections evolve), match the stable title prefix byte-exact, never write `@claude` anywhere (it
re-triggers downstream automation), and keep titles/bodies/comments ASCII when the target is `inference-gateway/docs` (use
`-`, not en/em dashes).

End to end, filing a feature issue against `<repo>` is four commands - create, type, add-to-board, set-status:

```sh
# 1. Create with the right label; capture the URL it prints.
URL=$(gh issue create --repo inference-gateway/<repo> \
  --title "[FEATURE] ..." --body-file body.md --label enhancement)

# 2. Set the issue type. Resolve the node id, then send the mutation as ONE line, byte-for-byte (the bot
#    allow-list matches only this exact updateIssueIssueType mutation). Swap the -f t=... id per the table below.
ISSUE_ID=$(gh issue view "$URL" --json id -q .id)
gh api graphql -f query='mutation($id:ID!,$t:ID!){updateIssueIssueType(input:{issueId:$id,issueTypeId:$t}){issue{number issueType{name}}}}' -f id="$ISSUE_ID" -f t="IT_kwDOC6ve6c4Bf3qi"

# 3. Add it to Roadmap 2026 (project #7); capture the project-item id.
ITEM_ID=$(gh project item-add 7 --owner inference-gateway --url "$URL" --format json -q .id)

# 4. Set Status = Todo.
gh project item-edit --id "$ITEM_ID" \
  --project-id PVT_kwDOC6ve6c4BNnSt \
  --field-id   PVTSSF_lADOC6ve6c4BNnStzg8jqxU \
  --single-select-option-id f75ad846
```

**Restricted CI shells (the @infer / @claude bots).** There, command substitution (`$(...)`) and shell variables are
disabled, and the Type mutation is the only `gh api graphql` the allow-list permits. So don't chain with `$(...)`: run
each command, read the value it prints, and paste the literal into the next - run `gh issue create` and read the URL;
run `gh issue view <url> --json id -q .id` and read the node id; then send the single-line step-2 mutation with that
literal id (and the literal `IT_...` type id), exactly as written. Do the same for the project-item id in step 4
(`gh project item-add ... --format json -q .id` prints it; paste it into `--id`).

Swap the label (step 1) and the type id (step 2) to match the issue kind - see the template table above for the label and
the id tables below for the type. The snippets use `gh`'s built-in `-q`/`--format json`, so no external `jq` is needed.

## Roadmap 2026 board + Status lifecycle

Every filed issue belongs on the org Roadmap board - project **#7**,
<https://github.com/orgs/inference-gateway/projects/7> - so planned work lives in one place. The ids below are org-stable;
hard-code them and only re-derive if a command rejects one (project or types recreated).

Issue type ids (`-f t=` in the type mutation):

| Issue type | id                    |
| ---------- | --------------------- |
| `Bug`      | `IT_kwDOC6ve6c4Bf3qh` |
| `Feature`  | `IT_kwDOC6ve6c4Bf3qi` |
| `Task`     | `IT_kwDOC6ve6c4Bf3qg` |

Roadmap 2026 Status field - project id `PVT_kwDOC6ve6c4BNnSt`, Status field id `PVTSSF_lADOC6ve6c4BNnStzg8jqxU`:

| Status        | `--single-select-option-id` |
| ------------- | --------------------------- |
| `Todo`        | `f75ad846`                  |
| `In progress` | `47fc9ee4`                  |
| `QA`          | `0a18abd7`                  |
| `Done`        | `98236657`                  |

**Status lifecycle.** The agent that files an issue is rarely the one that finishes it, so move Status the moment your own
work actually crosses each line - don't pre-set a state you haven't reached:

- **Todo** - at filing (step 4 above).
- **In progress** - when you start implementing what the issue describes.
- **QA** - when the implementing PR is open / under review.
- **Done** - when that PR merges or the issue closes.

To move an issue that is already on the board, resolve its project-item id from the issue URL, then edit the Status field:

```sh
ITEM_ID=$(gh project item-list 7 --owner inference-gateway --format json -L 1000 \
  -q '.items[] | select(.content.url=="<issue-url>") | .id')
gh project item-edit --id "$ITEM_ID" \
  --project-id PVT_kwDOC6ve6c4BNnSt \
  --field-id   PVTSSF_lADOC6ve6c4BNnStzg8jqxU \
  --single-select-option-id 47fc9ee4   # In progress
```

If an id is ever rejected, re-derive the current values:

```sh
gh project view 7       --owner inference-gateway --format json -q .id          # project id
gh project field-list 7 --owner inference-gateway --format json \
  -q '.fields[] | select(.name=="Status")'                                      # Status field id + option ids
gh api graphql -f query='{organization(login:"inference-gateway"){issueTypes(first:20){nodes{id name}}}}'  # type ids (run locally; not in the bot allow-list)
```

## Docs Tickets

For `feat:` or public-surface `refactor:` changes outside `inference-gateway/docs`, prepare a `[DOCS]` issue against
`inference-gateway/docs` using `documentation_request.md` (label `documentation`, type `Task`).

The draft must include:

- User-facing feature or changed behavior.
- Affected pages or proposed page locations.
- Code samples or examples to add, when applicable.
- Link back to the originating PR or issue.

Purely internal refactors may skip this only when the source PR body states `no docs ticket: internal-only refactor`.

## Drift Issue Titles

Use these exact titles for drift issues; do not improvise:

- `[FEATURE] Implement missing OpenAPI operations`
- `[TASK] Refactor regenerate models from latest spec`
- `[FEATURE] Add usage examples for missing operations`
- `[TASK] Refactor sync vendored openapi.yaml with schemas`
- `[DOCS] Document missing operations and schemas`
- `[FEATURE] Implement missing A2A JSON-RPC methods`
- `[TASK] Refactor regenerate A2A types from latest schema`
- `[DOCS] Add usage examples for missing A2A methods`
- `[TASK] Refactor sync vendored schema.yaml with schemas`
- `[TASK] Add tests for missing operations / methods`

Required labels:

- `sdk-drift` on `kind: sdk|docs` repos.
- `adk-drift` on `kind: adk` repos.

These labels must already exist on the target; orchestrators do not create them.

Drift issues are filed automatically, so they are the ones most likely to slip through untracked. Run the full
create -> type -> Roadmap 2026 -> Status=Todo sequence for each, exactly as in [Filing Procedure](#filing-procedure). The
`sdk-drift` / `adk-drift` label is added **on top of** the template label, not instead of it.
