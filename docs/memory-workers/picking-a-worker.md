---
kind: concept
title: Picking a worker per task
tldr: Opinionated table — what to assign to each background task. Defaults bias toward Haiku for quality / cost balance; Ollama for free; Sonnet only for conflict resolution.
status: stable
since: v0.1.0
topic: memory-workers
related:
  - memory-workers/overview
  - memory-workers/verification
  - ambient-memory/providers
references:
  capabilities: [memory]
x-implementation:
  - internal/memory/worker/
---

# Picking a worker per task

> **tldr:** Opinionated table — what to assign to each background task. Defaults bias toward Haiku for quality / cost balance; Ollama for free; Sonnet only for conflict resolution.

## Recommended defaults

| Task | Budget-conscious | Quality-conscious | Notes |
|---|---|---|---|
| ambient-summarize | Ollama `llama3.1:8b` | Anthropic Haiku | runs after every session.ended; volume-sensitive |
| project-scanner | Anthropic Haiku | Anthropic Haiku | needs structured output, Ollama works but noisier |
| conflict-resolver | Anthropic Haiku | Anthropic Sonnet | low volume, high stakes — quality matters |
| daily-cleaner | n/a (rules-only) | n/a | no LLM needed |

## Per-task config

```toml
[memory.workers.ambient]
provider = "openai-compat"        # local Ollama
model    = "llama3.1:8b"
max_concurrent = 2
timeout_seconds = 30

[memory.workers.scanner]
provider = "anthropic"
model    = "claude-haiku-4-5-20251001"
max_concurrent = 1
timeout_seconds = 20

[memory.workers.conflict]
provider = "anthropic"
model    = "claude-sonnet-4-6"
max_concurrent = 1
timeout_seconds = 45
```

## Cost ballparks (per 1000 events)

| Worker @ provider | ~tokens/event | ~cost/1000 events |
|---|---|---|
| ambient @ Haiku | 800 in + 100 out | $0.30 |
| ambient @ Ollama (local) | n/a | $0 + electricity |
| scanner @ Haiku | 1500 in + 200 out | $0.60 |
| conflict @ Sonnet | 2000 in + 300 out | $9 |

## Trade-offs

| Choice | Pro | Con |
|---|---|---|
| Anthropic only | best quality, structured-output reliable | costs add up at high volume |
| Ollama only | free | requires GPU host for reasonable latency; noisier outputs |
| Mixed (ambient=Ollama, scanner+conflict=Anthropic) | cost + quality balance | two configs to maintain |
| Mixed with fallback | survives Anthropic outage | more complex |

## Capabilities

| feature | supported |
|---|---|
| Per-task provider | ✓ |
| Per-task model override | ✓ |
| Fallback provider on failure | ✗ (planned) |
| Cost tracking per worker | ✓ |
| Manual override per run | ✓ via Settings UI |
