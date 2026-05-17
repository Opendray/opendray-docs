---
kind: concept
title: Backup — quickstart
tldr: Off by default. Set OPENDRAY_BACKUP_ENABLED=1 + OPENDRAY_BACKUP_KEY (32-byte base64). Restart → Backups page appears. Add a target → run a dump.
status: stable
since: v0.1.0
topic: backup
related: [backup/overview, backup/targets, backup/schedules]
references:
  capabilities: []
---

# Backup — quickstart

> **tldr:** Off by default. Set `OPENDRAY_BACKUP_ENABLED=1` + `OPENDRAY_BACKUP_KEY` (32-byte base64). Restart → Backups page appears. Add a target → run a dump.

## Steps

| # | Action | Verify |
|---|---|---|
| 1 | `export OPENDRAY_BACKUP_KEY="$(openssl rand -base64 32)"` | env set |
| 2 | `export OPENDRAY_BACKUP_ENABLED=1` | env set |
| 3 | Point pg_dump path: `export OPENDRAY_BACKUP_PG_DUMP_PATH=/opt/homebrew/opt/postgresql@17/bin/pg_dump` | binary exists |
| 4 | Same for pg_restore | binary exists |
| 5 | Restart opendray | log: `INFO backup ready` |
| 6 | Open `/backups` in admin | page appears (404 means env didn't take) |
| 7 | Add target → Run now | dump appears as encrypted `.bin` |

## What to store the key in

| Where | Recommendation |
|---|---|
| Environment | Vault / AWS Secrets / 1Password CLI → injected at startup |
| systemd unit | `EnvironmentFile=/etc/opendray/secrets.env`(mode 0600) |
| Docker compose | `env_file: ./.env`(`.env` is gitignored) |
| Never | source code, command history, screen recording |

## Restart caveat

| Reload behaviour | Backup config |
|---|---|
| Per `opendray reload` | not picked up — restart needed |
| Per `opendray serve` restart | re-reads env |

Why: backup module initializes on boot with the key in memory; doesn't
re-read env on reload (security: avoid leak via signal handler).

## Verification

| Check | Command |
|---|---|
| pg_dump version matches server | `pg_dump --version` then connect to server, check `SELECT version()` |
| Key length | `echo -n $OPENDRAY_BACKUP_KEY \| base64 -d \| wc -c` → 32 |
| File written | look in target storage for `<ts>.bin` files |
| Can decrypt | Backups page → click dump → "Restore preview" (decrypts without applying) |

## Next

| Topic | Read |
|---|---|
| Cloud target setup | [targets](./targets) |
| Cron schedule + retention | [schedules](./schedules) |
| Restore an old dump | [restore-and-import](./restore-and-import) |
