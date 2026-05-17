---
kind: capability
title: Skills
tldr: Markdown procedures Claude can invoke. Loaded from builtins (in binary) + vault (operator-edited). Injected into system prompt on spawn. opendray skill CLI lists/loads.
status: stable
since: v0.1.0
topic: plugins
related: [plugins/overview, plugins/mcp, notes/overview]
capability: [builtin-skills, vault-skills, system-prompt-injection]
inbound: vault-watcher
outbound: system-prompt-prefix
x-implementation: [internal/skills/, cmd/opendray/skill.go]
---

# Skills

> **tldr:** Markdown procedures Claude can invoke. Loaded from builtins (in binary) + vault (operator-edited). Injected into system prompt on spawn. `opendray skill` CLI lists/loads.

## Skill file shape

```markdown
---
id: write-pr-description
name: Write PR description
description: Generate a PR description from staged changes
triggers:
  - "write pr description"
  - "generate pr text"
applies_to:
  providers: [claude, codex]
  cwd_glob: "**"
---

# Procedure

1. Run `git diff --staged` to get the change set.
2. Identify the WHY behind the change (link to issue if present).
3. Group changes into Summary / Changes / Test plan sections.
4. Output the formatted PR description.
```

## Frontmatter fields

| Field | Type | Required |
|---|---|---|
| `id` | string (kebab-case) | ✓ |
| `name` | string | ✓ |
| `description` | string | ✓ |
| `triggers` | string[] | optional — keyword aliases for the skill |
| `applies_to.providers` | string[] | optional — limits which providers see it |
| `applies_to.cwd_glob` | glob string | optional — limits to matching cwds |

## Two sources

| Source | Where | Editable |
|---|---|---|
| Builtins | embedded in Go binary via `go:embed` under `internal/skills/builtin/` | only by rebuild |
| Vault | `<vault>/skills/*.md` | live — operator edits in Notes page or external editor |

## CLI

```bash
opendray skill list                        # list all loaded skills (builtin + vault)
opendray skill show write-pr-description   # print the markdown
opendray skill load <file>                 # add to vault and reload
opendray skill validate <file>             # check frontmatter + structure
```

## Injection

| Provider | Behaviour |
|---|---|
| `claude` | skills appended to system prompt prefix as `<skills>...</skills>` block |
| `codex` | same |
| `gemini` | same |
| `shell` | not injected (no AI) |

## Capabilities

| feature | supported |
|---|---|
| Per-provider filtering | ✓ |
| Per-cwd glob filtering | ✓ |
| Hot reload on vault change | ✓ (file watcher) |
| Builtin override | ✓ (vault skill with same id wins) |
| Disable per-skill | ✓ (`enabled: false` in frontmatter) |

## Errors

| code | when | fix |
|---|---|---|
| `skill_invalid_id` | id contains non-kebab | use `[a-z0-9-]+` |
| `skill_id_conflict` | two skills with same id (after vault override) | rename or set `enabled: false` |
| `skill_frontmatter_missing` | required field absent | add field |
