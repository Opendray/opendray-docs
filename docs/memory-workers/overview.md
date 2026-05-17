---
kind: concept
title: Memory workers — overview
tldr: Background LLM workers powering ambient capture / summarization / project-memory scanner. Pluggable per task — assign Haiku for cheap, Sonnet for hard, local llama for free.
status: stable
since: v0.1.0
topic: memory-workers
related:
  - memory-workers/picking-a-worker
  - memory-workers/verification
  - ambient-memory/providers
  - project-memory/scanner-and-cleaner
references:
  capabilities: [memory]
x-implementation:
  - internal/memory/worker/
  - internal/memory/summarizer/
---

# Memory workers — overview

> **tldr:** Background LLM workers powering ambient capture / summarization / project-memory scanner. Pluggable per task — assign Haiku for cheap, Sonnet for hard, local llama for free.

## What runs in the background

| Worker task | Trigger | Provider config in |
|---|---|---|
| ambient-summarize | session.ended | `[memory.workers.ambient]` |
| project-scanner | session.ended in tracked cwd | `[memory.workers.scanner]` |
| project-cleaner | cron (default 2am daily) | `[memory.workers.cleaner]` |
| conflict-resolver | new write hits conflict threshold | `[memory.workers.conflict]` |
| migration-reembed | embedder backend change | `[memory.workers.migration]` |

## Why per-task provider choice

Different tasks have different cost / quality trade-offs:

| Task | Volume | Quality needed | Recommended |
|---|---|---|---|
| ambient-summarize | high | medium | Haiku or Ollama |
| project-scanner | medium | medium-high | Haiku or Sonnet |
| conflict-resolver | low | high | Sonnet |
| migration-reembed | high | n/a (just embedder) | not an LLM worker |

## Per-task config

```toml
[memory.workers.ambient]
provider = "openai-compat"
model    = "llama3.1:8b"
max_concurrent = 2

[memory.workers.scanner]
provider = "anthropic"
model    = "claude-haiku-4-5-20251001"
max_concurrent = 1

[memory.workers.conflict]
provider = "anthropic"
model    = "claude-sonnet-4-6"
max_concurrent = 1
```

## Capabilities

| feature | supported |
|---|---|
| Per-task provider | ✓ |
| `max_concurrent` per worker | ✓ |
| Cost tracking per worker | ✓ |
| Dead letter queue | ✓ |
| Manual run from UI | ✓ |
| Pause individual worker | ✓ |
| Worker metrics page | `/memory/workers` |

## Read next

| Topic | Read |
|---|---|
| Which provider for which task | [picking-a-worker](./picking-a-worker) |
| Worker is failing — what to check | [verification](./verification) |
| Summarizer provider details | [ambient-memory/providers](../ambient-memory/providers) |
