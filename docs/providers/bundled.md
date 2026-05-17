---
kind: capability
title: Bundled providers
tldr: Per-CLI reference. claude (anthropic, JSONL + multi-account + MCP), codex (openai, opaque PTY), gemini (google, env-based auth), shell ($SHELL fallback).
status: stable
since: v0.1.0
topic: providers
related:
  - providers/overview
  - providers/custom
  - providers/claude-accounts
capability:
  - claude
  - codex
  - gemini
  - shell
x-implementation:
  - internal/catalog/builtins/claude.json
  - internal/catalog/builtins/codex.json
  - internal/catalog/builtins/gemini.json
  - internal/catalog/builtins/shell.json
---

# Bundled providers

> **tldr:** Per-CLI reference. `claude` (anthropic, JSONL + multi-account + MCP), `codex` (openai, opaque PTY), `gemini` (google, env-based auth), `shell` ($SHELL fallback).

## At-a-glance

| Provider id | Vendor | Binary | Multi-account | JSONL transcript | MCP | Notes |
|---|---|---|---|---|---|---|
| `claude` | Anthropic | `claude` | ✓ | ✓ (`~/.claude/projects/`) | ✓ | primary provider; deepest config |
| `codex` | OpenAI | `codex` | env-only | ✗ | ✗ | screen snapshot for notify |
| `gemini` | Google | `gemini` | env-only | ✗ | ✗ | watch the free quota |
| `shell` | system | `$SHELL` | n/a | ✗ | ✗ | not AI — regular interactive shell |

## `claude` — Claude Code

| Field | Value |
|---|---|
| `command` | `claude` (resolved via `$PATH`) |
| `default_args` | none |
| Multi-account | ✓ via [Claude accounts](./claude-accounts) |
| Transcript | `~/.claude/projects/<encoded-cwd>/<session-id>.jsonl` |
| `runtime_options.bypass_permissions` | bool, default `false` (passes `--bypass-permissions`) |
| `runtime_options.max_turns` | int, default `0` (unlimited) |
| `runtime_options.skills` | bool, default `true` (opendray skill auto-injection) |
| Notification source | reads JSONL last turn (assistant text + tool calls + results) |
| TUI chrome filter | strips model bar, "bypass permissions" hint, status spinners, separators |
| Resume | `--continue` resumes most-recent conversation in cwd |

## `codex` — Codex CLI

| Field | Value |
|---|---|
| `command` | `codex` |
| `default_args` | none |
| Auth | env-based (`OPENAI_API_KEY`); one credential per env |
| Transcript | none — opendray uses vt10x screen snapshot |
| Tool use | OpenAI JSON-RPC; opendray treats as opaque PTY |
| Notification source | vt10x last N lines |
| TUI chrome filter | no-op (codex is shell-like, nothing to strip) |
| Rate limits | free-tier — surface in terminal if exceeded |

## `gemini` — Gemini CLI

| Field | Value |
|---|---|
| `command` | `gemini` |
| `default_args` | none |
| Auth | env-based (`GOOGLE_API_KEY`) |
| Transcript | none |
| Notification source | vt10x snapshot |
| TUI chrome filter | no-op |
| Daily quota | resets at midnight UTC; check Gemini dashboard if 429 |

## `shell` — Plain shell

| Field | Value |
|---|---|
| `command` | `$SHELL` |
| `default_args` | `-l` (login shell) |
| AI | ✗ — not an AI provider |
| Use case | quick interactive session on opendray host without SSH |
| Behaviour | identical PTY / idle detection / ring buffer as AI providers |

## Errors

| code | http | cause | fix |
|---|---|---|---|
| `provider_unavailable` | 503 | binary not on PATH or not executable | install or fix the absolute path in provider config |
| `provider_disabled` | 400 | `enabled: false` in DB override | toggle on in Providers page |
| `claude_account_not_bound` | 400 | spawn picked a Claude account that no longer exists | re-select account in spawn dialog |

<details>
<summary>📖 Narrative explanation</summary>

Claude is the deepest-configured provider because it's the
primary one. Other providers use a single credential set from env
vars without per-session binding — adequate for most use, but
not as flexible.

Codex uses its own JSON-RPC protocol for tool use; opendray treats
it as an opaque CLI and just relays bytes through the PTY. The
free-tier rate limits will surface in the terminal as-is —
opendray doesn't intercept.

Gemini's free quota resets daily; check the dashboard if a session
starts erroring with 429. Interactive prompt is more shell-like
than Claude's TUI; chrome filtering is a no-op.

For a regular shell session (no AI), register `shell` or any custom
provider pointing at `bash` / `zsh` / `fish` — same PTY, same idle
detection, same ring buffer. Useful when you need a quick remote
shell without SSH.

</details>
