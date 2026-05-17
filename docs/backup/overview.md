---
kind: concept
title: Backup — overview
tldr: Two safety nets — encrypted pg_dump (full DB, restore-in-place) + zip-bundle export (data-only, portable across hosts). Both AES-GCM encrypted. Opt-in via OPENDRAY_BACKUP_ENABLED.
status: stable
since: v0.1.0
topic: backup
related: [backup/quickstart, backup/targets, backup/schedules, backup/export, backup/restore-and-import]
references:
  capabilities: []
x-implementation: [internal/backup/, ADR 0012]
---

# Backup — overview

> **tldr:** Two safety nets — encrypted `pg_dump` (full DB, restore-in-place) + zip-bundle export (data-only, portable across hosts). Both AES-GCM encrypted. Opt-in via `OPENDRAY_BACKUP_ENABLED`.

## Two paths

| Path | What | Restore mode | Portability |
|---|---|---|---|
| Plan A — backup | encrypted `pg_dump` of entire DB | restore-in-place (same opendray) | tied to that host's schema version |
| Plan C — export | zip bundle of decoded data | import into another opendray | cross-host migration |

## Enable

```bash
# Master passphrase — env only, never in config.toml
export OPENDRAY_BACKUP_KEY="$(openssl rand -base64 32)"
export OPENDRAY_BACKUP_ENABLED=1

# Match pg_dump major version to your Postgres server
export OPENDRAY_BACKUP_PG_DUMP_PATH=/opt/homebrew/opt/postgresql@17/bin/pg_dump
export OPENDRAY_BACKUP_PG_RESTORE_PATH=/opt/homebrew/opt/postgresql@17/bin/pg_restore
```

Restart opendray — Backups page (`/backups`) + Export page (`/export`) appear.

## What's covered

| Surface | Plan A backup | Plan C export |
|---|---|---|
| Sessions DB rows | ✓ | ✓ |
| Memory (pgvector) | ✓ | ✓ |
| Channels config | ✓ (encrypted secrets) | ✓ |
| Integrations | ✓ | ✓ (keys regenerated) |
| Audit + call log | ✓ | optional |
| Notes vault | ✗ (use git for that) | ✗ |
| Backup files themselves | n/a | n/a |

## Read next

| Topic | Read |
|---|---|
| Set it up in 5 min | [quickstart](./quickstart) |
| Cloud targets (S3 / R2 / B2 / SMB) | [targets](./targets) |
| Cron / retention | [schedules](./schedules) |
| Plan C export format | [export](./export) |
| Restore from A or import C | [restore-and-import](./restore-and-import) |
