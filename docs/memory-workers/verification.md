---
kind: concept
title: Worker verification & metrics
tldr: /memory/workers shows per-worker queue depth, success rate, p95 latency, cost. Manual "run now" button per worker. Dead letters queue for failures.
status: stable
since: v0.1.0
topic: memory-workers
related:
  - memory-workers/overview
  - memory-workers/picking-a-worker
  - activity/overview
references:
  capabilities: [memory]
x-implementation:
  - internal/memory/worker/metrics.go
  - app/web/src/features/memory/workers/
---

# Worker verification & metrics

> **tldr:** `/memory/workers` shows per-worker queue depth, success rate, p95 latency, cost. Manual "run now" button per worker. Dead letters queue for failures.

## Page layout

| Pane | Content |
|---|---|
| Worker list (left) | one row per worker (ambient / scanner / cleaner / conflict / migration) |
| Detail (right) | metrics + recent runs + dead letters + Run now button |

## Metrics per worker

| Metric | Source | Update |
|---|---|---|
| Queue depth | internal queue size | real-time |
| Success rate (24h) | runs / (runs + failures) | rolling 24h |
| p95 latency | run duration | rolling 24h |
| Cost (24h) | sum of token cost | rolling 24h |
| Last run | timestamp + duration | latest |
| Dead letter count | failed runs in DLQ | persists |

## Manual actions

| Button | What it does |
|---|---|
| Run now | enqueues one synthetic run; useful after config change |
| Pause | sets `enabled: false`; queue keeps filling, no execution |
| Resume | sets `enabled: true` |
| Clear DLQ | removes all dead-letter entries (after manual review) |
| Replay DLQ | re-enqueues all DLQ entries |

## Verification recipe — "did my new config take?"

| # | Action | Expected |
|---|---|---|
| 1 | Settings → Save new `[memory.workers.X]` config | toast: saved |
| 2 | `/memory/workers` → click X | detail pane shows new provider/model |
| 3 | Click **Run now** | new row in recent runs with `provider=<new>` |
| 4 | Wait 30s | success rate stays at 100% if config valid |
| 5 | If failure | check DLQ for error message |

## Common DLQ errors

| Error | Meaning | Fix |
|---|---|---|
| `summarizer_unavailable: connection refused` | Ollama not running | start Ollama |
| `summarizer_quota_exceeded` | API quota hit | switch provider or wait |
| `summarizer_model_not_found` | typo in model name | check `model` field |
| `summarizer_timeout` | response > `timeout_seconds` | raise timeout or smaller model |
| `scanner_pattern_invalid` | regex doesn't compile | check `goal_pattern` etc. |

## Capabilities

| feature | supported |
|---|---|
| Real-time queue depth | ✓ |
| Rolling 24h metrics | ✓ |
| Dead letter queue | ✓ persists |
| Manual replay | ✓ per-entry or bulk |
| Cost tracking per worker | ✓ |
| Alerting on DLQ growth | ✗ (planned) |
