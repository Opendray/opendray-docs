---
kind: concept
title: Providers — overview
tldr: A provider = catalogued CLI binary opendray can spawn. 4 bundled (claude / codex / gemini / shell). Each has runtime-editable exec path / args / env; overrides persist in DB on top of bundled JSON manifests.
status: stable
since: v0.1.0
topic: providers
related:
  - providers/bundled
  - providers/custom
  - providers/claude-accounts
references:
  capabilities: [providers]
x-implementation:
  - internal/catalog/
  - internal/catalog/builtins/
---

# Providers — overview

> **tldr:** A *provider* = catalogued CLI binary opendray can spawn. 4 bundled (`claude` / `codex` / `gemini` / `shell`). Each has runtime-editable exec path, args, env; overrides persist in DB on top of bundled JSON manifests.

## What it is

A provider is the catalogued definition of one CLI binary opendray
can spawn. Sessions point at a provider id, so "restart in place"
re-uses the same provider config for the new process.

| Capability JSON | Authoritative source |
|---|---|
| [/capabilities/providers.json](/capabilities/providers.json) | Bundled providers + custom manifest schema |

## Bundled

| id | vendor | binary | session resume | tool use | MCP |
|---|---|---|---|---|---|
| `claude` | Anthropic | `claude` | ✓ | ✓ | ✓ |
| `codex` | OpenAI | `codex` | ✗ | ✓ | ✗ |
| `gemini` | Google | `gemini` | ✗ | ✓ | ✗ |
| `shell` | system | `$SHELL` | ✓ | ✗ | ✗ |

Source: `internal/catalog/builtins/*.json`.

## Per-provider editable fields

| Field | Purpose | Override stored |
|---|---|---|
| `command` | Absolute path or PATH-resolved binary name | DB → applied at spawn |
| `default_args` | Appended to every spawn before user args | DB |
| `env` | Extra env vars merged into process env | DB (secrets encrypted) |
| `display_name` + `icon` | Shown in spawn dropdown / tab strip | DB |
| `cwd_hint` | Pre-fills spawn dialog's cwd field | DB |
| `enabled` | Hides from spawn dropdown when false | DB |
| `runtime_options` | Per-provider e.g. `bypass_permissions`, `max_turns`, `skills` for claude | DB |

## Reset to defaults

Every provider card has a **Reset** button → drops DB overrides →
restores bundled manifest. Useful when an experiment breaks the
provider; no opendray restart needed.

## When to use

| Goal | Where |
|---|---|
| Configure one of the 4 bundled CLIs | [bundled](./bundled) |
| Add a custom CLI (your own wrapper, less-common LLM CLI) | [custom](./custom) |
| Multi-account Claude (work + personal) | [claude-accounts](./claude-accounts) |

![Providers page](/tutorial/providers-layout.png)

<details>
<summary>📖 Narrative explanation</summary>

The bundled JSON manifests live in `internal/catalog/builtin/`
inside the binary. The web UI lets you override fields at runtime
without editing the source manifest — overrides are stored in the
DB and apply on top of the bundled defaults.

Claude has extras (multi-account binding, `bypass_permissions`,
`max_turns`, `skills`) because it's the primary provider and the
one most users configure deepest. Other providers use a single
credential set from env vars (`OPENAI_API_KEY` / `GOOGLE_API_KEY`).

</details>
