---
kind: capability
title: Scanner & cleaner — auto-managed memory
tldr: Two workers — scanner promotes raw rows to project-memory sections, cleaner removes stale / resolved. Configured under [project_memory.scanner] and [.cleaner].
status: stable
since: v0.1.0
topic: project-memory
related:
  - project-memory/overview
  - project-memory/workflow
  - memory/maintenance
capability:
  - scanner
  - cleaner
  - section-promotion
  - stale-detection
inbound: memory-rows
outbound: project-memory
x-implementation:
  - internal/memory/project/scanner.go
  - internal/memory/project/cleaner.go
---

# Scanner & cleaner — auto-managed memory

> **tldr:** Two workers — scanner promotes raw rows to project-memory sections, cleaner removes stale / resolved. Configured under `[project_memory.scanner]` and `[.cleaner]`.

## Scanner

| Trigger | Action |
|---|---|
| `session.ended` in cwd | scan last N memory rows in this cwd |
| Match `goal_pattern` | promote → Goals section |
| Match `decision_pattern` | promote → Decisions section |
| Match `question_pattern` + has `?` | promote → Open questions |
| Latest row tagged `state` | overwrite Current state |

```toml
[project_memory.scanner]
enabled       = true
scan_last_n   = 20                # rows per session.ended
goal_pattern     = "(want|need|goal)[:\\s]"
decision_pattern = "(decided|chose|will use)\\s"
question_pattern = "(\\?|wonder|TODO)"
promote_threshold = 0.6           # confidence required
```

## Cleaner

| Trigger | Action |
|---|---|
| Every 24h | walk all project-memory sections |
| Row age > `stale_days` | mark `stale: true`; remove if also unread |
| Row tagged `resolved: true` | delete |
| Row in conflict pair w/ newer-wins | delete loser |

```toml
[project_memory.cleaner]
enabled              = true
schedule             = "0 2 * * *"   # cron, default 2am
stale_days           = 90
remove_stale_unread  = true
keep_decisions_forever = true        # Decisions never expire
```

## Capabilities

| feature | supported |
|---|---|
| Pattern-based promotion | ✓ regex configurable |
| Confidence threshold | ✓ |
| Per-section retention policy | ✓ |
| Keep decisions forever | ✓ default ON |
| Manual scanner run | ✓ Settings → Scanner → Run now |
| Manual cleaner run | ✓ Settings → Cleaner → Run now |
| Audit trail of promotions | ✓ |

## Errors

| code | http | cause | fix |
|---|---|---|---|
| `scanner_pattern_invalid` | 400 | regex doesn't compile | check `goal_pattern` etc. |
| `scanner_promote_failed_conflict` | (log) | promote attempt hit conflict policy | review in conflict queue |
| `cleaner_blocked_by_lock` | (log) | another cleaner run in progress | wait or kill stale lock |
