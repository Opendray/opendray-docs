---
kind: concept
title: Memory — Quickstart
tldr: Memory is on by default — no flag, no service, no API key. Spawn any session → opendray auto-attaches the memory MCP server → agent can search/store. Verify in Memory page (🧠 sidebar, shortcut g m).
status: stable
since: v0.1.0
topic: memory
related:
  - memory/overview
  - memory/scopes
  - memory/configuration
  - memory/troubleshooting
references:
  capabilities: [memory]
x-implementation:
  - internal/memory/
---

# Memory — Quickstart

> **tldr:** Memory is on by default — no flag, no service, no API key. Spawn any session → opendray auto-attaches the memory MCP server → agent can search/store. Verify in **Memory** page (🧠 sidebar, shortcut `g m`).

## What you DON'T need

| ✗ Not required |
|---|
| Install qdrant / chromadb |
| Run mem0 as subprocess |
| OpenAI / Voyage / Cohere account |
| Any environment variables |

## Steps

| # | Action | Verify |
|---|---|---|
| 1 | `go run ./cmd/opendray serve -config config.toml` | log: `INFO memory ready embedder=bm25 dimensions=384` |
| 2 | Sessions → Spawn → pick provider + cwd | per-session `mcp.json` includes `opendray-memory` |
| 3 | In a Claude session: `me: my preferred frontend frameworks are vue and react` | Claude calls `memory_store(...)` OR writes `.claude/.../memory/...md` (mirror picks up) |
| 4 | Open **Memory** page (🧠 sidebar) | Status badge `bm25 · 384-dim · enabled`; search "vue" returns the row |
| 5 | Spawn Codex in same cwd → `me: what frontend framework do I use?` | Codex calls `memory_search` → gets pnpm/vue fact |

## Verify mcp.json was rendered

```bash
ls /var/folders/.../opendray-sess-<id>/
cat /var/folders/.../opendray-sess-<id>/claude-mcp.json
# expect: an "opendray-memory" entry alongside any other MCP servers
```

## Two UI pages, deliberate split

| Page | Purpose |
|---|---|
| **Settings → Server → Memory** | configuration draft — embedder choice, ports, dim, restart-required fields. **Test embedder** here. |
| **Memory** (sidebar 🧠) | runtime inspector — browse, search, edit, delete actual rows |

## What's NOT happening

| ✗ Not in scope |
|---|
| Agent's response goes through opendray (only its tool calls) |
| Reading stdout for memory (nothing scraped from conversation) |
| Other operators see your memories (`scope_key` is your cwd; theirs differ) |

## Troubleshooting at a glance

| Symptom | First check |
|---|---|
| Agent never calls memory tools | spawn after system-prompt was added? restart opendray + session |
| `tool error: 401 unauthorized` | stale API key in mcp.json — restart session (re-renders) |
| Search returns no hits | BM25 = exact token match; use a literal word from the stored text |
| `connection refused` from mcp-memory | gateway crashed — `tail -f /tmp/opendray.log` |

Deep dive: [Troubleshooting](./troubleshooting).
