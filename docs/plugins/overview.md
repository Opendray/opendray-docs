---
kind: concept
title: Plugins — overview
tldr: Tool extensions auto-injected into every spawned session. 3 kinds — Skills (markdown), MCP servers (stdio/http), Git host adapters (GitHub/Gitea/GitLab).
status: stable
since: v0.1.0
topic: plugins
related: [plugins/skills, plugins/mcp, plugins/git-hosts]
references:
  capabilities: [providers]
x-implementation: [internal/plugins/]
---

# Plugins — overview

> **tldr:** Tool extensions auto-injected into every spawned session. 3 kinds — Skills (markdown), MCP servers (stdio/http), Git host adapters (GitHub/Gitea/GitLab).

## Three plugin kinds

| Kind | What | Injected as |
|---|---|---|
| [Skills](./skills) | reusable markdown procedures Claude can invoke | system-prompt prefix |
| [MCP servers](./mcp) | external tools speaking Model Context Protocol | MCP server entries in session's `mcp.json` |
| [Git host adapters](./git-hosts) | GitHub / Gitea / GitLab API wrappers | Git tab in Inspector + Sessions Git workflow |

## Where to register

| Kind | UI |
|---|---|
| Skills | `/plugins` → Skills tab → builtins + vault-based |
| MCP servers | `/plugins` → MCP tab → stdio command or HTTP URL |
| Git hosts | `/settings/git-hosts` → PAT / OAuth per host |

## Auto-injection

| Kind | When | Where |
|---|---|---|
| Skills | session spawn | system-prompt prefix |
| MCP servers | session spawn | `mcp.json` rendered to ephemeral session dir |
| Git host | when Git tab opens | reads from settings store |

## Per-provider scope

| Provider | Skills | MCP | Git tab |
|---|---|---|---|
| `claude` | ✓ (via system prompt) | ✓ | ✓ |
| `codex` | ✓ | ✓ if `supportsMcp` | ✓ |
| `gemini` | ✓ | ✗ | ✓ |
| `shell` | ✗ | ✗ | ✓ |

![Plugins page](/tutorial/plugins-layout.png)
