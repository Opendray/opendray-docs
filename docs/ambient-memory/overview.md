---
kind: concept
title: Ambient Memory — overview
tldr: Auto-capture engine — extracts facts from session output without the agent calling memory_store. Rules-based + LLM-summarized. Writes to project/global scope.
status: stable
since: v0.1.0
topic: ambient-memory
related:
  - ambient-memory/providers
  - ambient-memory/capture-rules
  - ambient-memory/injection
  - memory/overview
  - memory-workers/overview
references:
  capabilities: [memory]
x-implementation:
  - internal/memory/capture/
  - internal/memory/summarizer/
---

# Ambient Memory — overview

> **tldr:** Auto-capture engine — extracts facts from session output without the agent calling `memory_store`. Rules-based + LLM-summarized. Writes to project/global scope.

## What it adds beyond explicit `memory_store`

| Mechanism | Trigger | Latency |
|---|---|---|
| `memory_store` tool call | agent decides | immediate |
| Ambient capture (rules) | session.idle / session.ended event | post-event |
| Ambient capture (LLM summarizer) | worker queue picks up | minutes |

## Pipeline

```
session output → capture engine
                      │
       ┌──────────────┼──────────────┐
       ▼              ▼              ▼
  rule matcher  LLM summarizer  conflict check
       │              │              │
       └──────┬───────┘              │
              ▼                      │
         memory_store ←──────────────┘
              │
              ▼
          pgvector
```

## When to read what

| Topic | Read |
|---|---|
| Which LLM does the summarization | [providers](./providers) |
| What rules fire and how to add | [capture-rules](./capture-rules) |
| How captured facts get injected back on next spawn | [injection](./injection) |
| Worker status / cost / metrics | [memory-workers/overview](../memory-workers/overview) |
| Manual override on bad capture | [project-memory/scanner-and-cleaner](../project-memory/scanner-and-cleaner) |

## Capabilities

| feature | supported |
|---|---|
| Rule-based extraction (regex / contains) | ✓ |
| LLM summarization (Anthropic / OpenAI / Ollama) | ✓ |
| Conflict detection at capture | ✓ |
| Dry-run mode | ✓ (preview before write) |
| Per-project rule override | ✓ |
| Disable per-session | ✓ (`X-OpenDray-Capture: off` header) |

## Errors

| code | http | cause | fix |
|---|---|---|---|
| `capture_rule_invalid` | 400 | regex doesn't compile | check rule syntax in Settings |
| `summarizer_unavailable` | 503 | configured LLM backend down | check [providers](./providers) |
| `capture_skipped_conflict` | (log info) | new fact conflicts with existing; policy=manual | review in conflict queue |
