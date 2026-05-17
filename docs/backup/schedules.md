---
kind: capability
title: Backup — schedules
tldr: Cron expression triggers backup runs. Fan-out to all enabled targets. Retention pruning runs after each successful upload. Default `0 2 * * *` (2am daily).
status: stable
since: v0.1.0
topic: backup
related: [backup/overview, backup/targets, backup/quickstart]
capability: [cron-trigger, multi-target-fanout, retention-prune]
inbound: cron
outbound: target
x-implementation: [internal/backup/scheduler.go]
---

# Backup — schedules

> **tldr:** Cron expression triggers backup runs. Fan-out to all enabled targets. Retention pruning runs after each successful upload. Default `0 2 * * *` (2am daily).

## Config

```toml
[backup.schedule]
enabled    = true
expression = "0 2 * * *"      # cron — daily 2am
timezone   = "Asia/Shanghai"  # IANA tz; falls back to system tz
retention_days_default = 30

[backup.schedule.advanced]
max_dump_duration_minutes = 30
post_run_command = ""         # optional: shell hook after dump
```

## Cron examples

| Expression | When |
|---|---|
| `0 2 * * *` | daily 2am |
| `0 */6 * * *` | every 6h |
| `0 3 * * 0` | Sundays 3am |
| `*/15 * * * *` | every 15 min (heavy — use only for testing) |

## Per-run flow

| # | Step |
|---|---|
| 1 | scheduler fires cron entry |
| 2 | pg_dump → encrypt with `OPENDRAY_BACKUP_KEY` → write to staging temp file |
| 3 | for each enabled target in parallel: upload |
| 4 | each target succeeds → retention prune for that target (delete files older than `retention_days`) |
| 5 | any target fails → flagged in `/backups` UI; staging file kept for retry |
| 6 | emit `backup.run.completed` / `backup.run.failed` event |

## Per-target retention

```yaml
# inside target config
retention_days: 30          # default; per-target override
retention_min_files: 3      # keep at least 3 even if all > retention_days
```

## Manual run

| Where | Action |
|---|---|
| `/backups` UI | Run now button (uses staging path; same fan-out) |
| CLI | `opendray backup run-now` |
| API | `POST /api/v1/backup/runs` |

## Capabilities

| feature | supported |
|---|---|
| cron expression | ✓ standard 5-field |
| per-target retention | ✓ |
| max run duration | ✓ (kill if exceeded) |
| post-run shell hook | ✓ |
| Skip-if-no-changes | ✗ (always dumps) |
| Incremental | ✗ (always full pg_dump) |

## Errors

| code | when | fix |
|---|---|---|
| `backup_pg_dump_failed` | binary missing / wrong major version | check `OPENDRAY_BACKUP_PG_DUMP_PATH` |
| `backup_encryption_failed` | key missing or wrong length | re-export `OPENDRAY_BACKUP_KEY` and restart |
| `backup_dump_timeout` | exceeded `max_dump_duration_minutes` | raise or investigate slow DB |
| `backup_target_upload_failed` | per-target failure | see target Errors |
