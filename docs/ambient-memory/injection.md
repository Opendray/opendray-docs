---
kind: capability
title: Ambient Memory — injection profiles
tldr: Profile = what gets injected into a session's initial context. 3 modes — dense (top-K via search), sparse (recent only), off. Picked per (provider, cwd) match.
status: stable
since: v0.1.0
topic: ambient-memory
related:
  - ambient-memory/overview
  - ambient-memory/capture-rules
  - memory/scopes
capability:
  - dense-injection
  - sparse-injection
  - off-mode
inbound: session-spawn
outbound: system-prompt-prefix
x-implementation:
  - internal/memory/injector/
---

# Ambient Memory — injection profiles

> **tldr:** Profile = what gets injected into a session's initial context. 3 modes — `dense` (top-K via search), `sparse` (recent only), `off`. Picked per (provider, cwd) match.

## Modes

| Mode | What gets injected | When to use |
|---|---|---|
| `dense` (default) | top-K hits from `memory_search("project context")` | rich context, agent gets relevant facts up front |
| `sparse` | last N most-recent memories (no search) | cheap, no embedding call on spawn |
| `off` | nothing | clean-slate sessions; pure tool-use |

## Config

```yaml
- id: "default-dense"
  match:
    provider: [claude]
    cwd_glob: "**"
  profile:
    mode: dense
    top_k: 5
    scope: [project, global]
    template: |
      # Project context (auto-loaded from memory)
      {{- range .hits }}
      - {{ .text }} (confidence {{ .score }})
      {{- end }}

- id: "codex-sparse"
  match:
    provider: [codex]
  profile:
    mode: sparse
    recent: 10

- id: "shell-off"
  match:
    provider: [shell]
  profile:
    mode: off
```

## What gets injected where

| Provider | Injection point |
|---|---|
| `claude` | system prompt prefix (via MCP) |
| `codex` | system prompt prefix (via MCP if supportsMcp; else skipped) |
| `gemini` | system prompt prefix |
| `shell` | nothing (no AI) |

## Capabilities

| feature | supported |
|---|---|
| Per-(provider, cwd) profile | ✓ |
| Template via Go text/template | ✓ |
| Cross-scope query (e.g. `[project, global]`) | ✓ |
| Profile match order | first matching rule wins |
| Disable per-spawn | ✓ (`X-OpenDray-Inject: off` header) |
| Live preview in Settings | ✓ |

## Errors

| code | http | cause | fix |
|---|---|---|---|
| `injection_template_invalid` | 400 | Go template syntax error | test in Settings → Preview |
| `injection_too_large` | 413 | rendered > 32 KB | reduce `top_k` or template length |
| `injection_skipped_off` | (log info) | rule matched `off` | by design |
