---
name: skill-creator
description: Author a new Agent Skill from a minimal SKILL.md template. Use when the user wants to create a new skill, scaffold one from scratch, or learn the SKILL.md frontmatter and body conventions.
---

# Skill Creator

Use this skill when the user wants to create a new Agent Skill.

## What a skill is

A skill is a folder containing a `SKILL.md` file. The frontmatter declares the
skill's `name` and `description` so an agent runtime can decide whether to load
it; the body is markdown instructions the runtime reads on demand.

The format is portable - the same folder works with any agent runtime that
follows the [spec](https://github.com/anthropics/skills/tree/main/spec).

## Steps

1. **Pick a name.** Lowercase, hyphenated, 1–64 characters, matching
   `^[a-z0-9-]+$`. The folder name must match the frontmatter `name` field
   exactly.
2. **Write a one-line description.** 1–1024 characters. Describe *what the
   skill does* and *when to invoke it* in a single sentence. The runtime
   decides whether to surface the skill from this string alone - vague
   descriptions get skipped.
3. **Create the folder and `SKILL.md`.** Place it under either
   `.infer/skills/<name>/SKILL.md` (project-local) or
   `~/.infer/skills/<name>/SKILL.md` (user-global). Project scope wins on name
   collisions.
4. **Write the body.** Lead with the trigger condition ("Use this skill
   when …"), then numbered steps, then any notes. Keep it tight - no preamble,
   no marketing copy.
5. **Validate before committing.** The folder name must match the frontmatter
   `name`. The description must let a reader decide whether to use the skill
   *without reading the body*.

## SKILL.md template

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

## What to avoid

- Don't restate the description in the body - the runtime already shows it.
- Don't embed screenshots, diagrams, or long code samples in `SKILL.md`. Put
  them in sibling files and link.
- Don't write skills that duplicate the runtime's built-in tools (file reads,
  web search, shell execution).
- Don't include credentials, API keys, or environment-specific paths.

## Installing the result

Once the folder is in place, the runtime picks it up automatically on next
start. To install someone else's skill from a public GitHub URL:

```sh
infer skills install https://github.com/<owner>/<repo>/tree/<ref>/<path>
```

To publish a skill in this catalog, open a PR against
[`inference-gateway/skills`](https://github.com/inference-gateway/skills)
adding both the `skills/<name>/SKILL.md` folder and a matching entry in
`catalog.json`.
