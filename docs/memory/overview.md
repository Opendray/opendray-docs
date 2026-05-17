---
kind: concept
title: Memory — overview
tldr: Cross-CLI persistent memory layer. opendray auto-attaches a memory MCP server to every session. Claude / Codex / Gemini in the same cwd see each other's facts. Default backend BM25 (pure Go, no models, no API key).
status: stable
since: v0.1.0
topic: memory
related:
  - memory/quickstart
  - memory/scopes
  - memory/configuration
  - memory/mirror
  - memory/troubleshooting
  - ambient-memory/overview
  - project-memory/overview
  - memory-workers/overview
references:
  capabilities: [memory]
x-implementation:
  - internal/memory/
  - internal/memory/store_pgvector.go
  - internal/memory/embedder/
---

# Memory — overview

> **tldr:** Cross-CLI persistent memory layer. opendray auto-attaches a memory MCP server to every session. Claude / Codex / Gemini in the same `cwd` see each other's facts. Default backend BM25 (pure Go, no models, no API key).

## What it solves

Each CLI has private memory that doesn't talk to the others:

| CLI | Private store |
|---|---|
| Claude Code v2.1+ | `<project>/.claude/.../memory/` (markdown) |
| Codex | `~/.codex/sessions/` (rollouts) |
| Gemini | `~/.gemini/tmp/<project>/` (logs) |

Tell Claude "I prefer pnpm" → next Codex session in the same project
has no idea. opendray's memory subsystem is the **shared** layer all
three read and write through.

## Architecture

```
                          opendray gateway
                          ┌────────────────────────┐
   Claude/Codex/Gemini    │                         │
   (agent process)        │  /api/v1/memory/*       │
        │                 │       │                 │
        │ MCP             │       ▼                 │
   ┌────┴───────┐         │  Embedder (BM25 / ONNX / openai-compat) │
   │ opendray   │ HTTP    │       │                 │
   │ mcp-memory │─────────┤       ▼                 │
   │ subprocess │         │  pgvector store         │
   └────────────┘         │       │                 │
                          └───────┼─────────────────┘
                                  ▼
                          PostgreSQL (vector extension optional)
```

## MCP tools auto-attached to every spawn

| Tool | Purpose | Returns |
|---|---|---|
| `memory_search(query, scope?, limit?)` | find facts relevant to the query | ranked snippets with score |
| `memory_store(text, scope?, tags?)` | persist a durable fact | id |
| `memory_list(scope?, limit?)` | dump recent facts | array |

## Defaults

| Concern | Default | Override at |
|---|---|---|
| Backend | BM25 (pure Go, ~384-dim sparse) | [configuration](./configuration) |
| Store | pgvector on opendray's Postgres | `config.toml` |
| Scope | project (same cwd shares) | [scopes](./scopes) |
| Mirror Claude markdown | enabled | [mirror](./mirror) |
| Auto-capture on session.end | enabled | [ambient-memory](../ambient-memory/overview) |

## Cross-CLI walkthrough

| # | Action | What happens |
|---|---|---|
| 1 | Claude session, say "remember I prefer pnpm" | Claude either calls `memory_store` directly OR writes a `.claude/.../memory/preference_pnpm.md` |
| 2 | opendray ingests | mirror reads markdown → writes to pgvector under `project:<cwd>` scope |
| 3 | Codex session in same cwd, ask "what package manager?" | Codex calls `memory_search("package manager")` |
| 4 | Returns the pnpm fact | ranked first |

## When to read what

| Topic | Read |
|---|---|
| Quick start + agent tool calls | [Quickstart](./quickstart) |
| session vs project vs global scope | [Scopes](./scopes) |
| Settings UI + embedder choice + HTTP backend | [Configuration](./configuration) |
| Claude local-memory mirror (advanced) | [Mirror](./mirror) |
| Common errors + recovery | [Troubleshooting](./troubleshooting) |
| ONNX local embeddings | [local-onnx](./local-onnx) |
| Ollama walkthrough | [ollama-walkthrough](./ollama-walkthrough) |
| LM Studio walkthrough | [lmstudio-walkthrough](./lmstudio-walkthrough) |
| Cleanup, conflict detection, summarization | [maintenance](./maintenance) |

For third-party app developers calling `/api/v1/memory/*` directly,
see [Consuming opendray → REST API](../consuming/rest-api).
