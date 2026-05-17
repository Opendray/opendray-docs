---
kind: capability
title: Backup — restore (A) and import (C)
tldr: /backups → pick a dump → Restore (pg_restore in place). /export → upload .zip.enc → Import (decrypted + merged). Both require OPENDRAY_BACKUP_KEY.
status: stable
since: v0.1.0
topic: backup
related: [backup/overview, backup/quickstart, backup/export]
capability: [pg-restore-in-place, zip-import-merge, dry-run-preview]
inbound: gateway
outbound: postgres / files
x-implementation: [internal/backup/restore.go, internal/backup/import.go]
---

# Backup — restore (A) and import (C)

> **tldr:** `/backups` → pick a dump → **Restore** (pg_restore in place). `/export` → upload `.zip.enc` → **Import** (decrypted + merged). Both require `OPENDRAY_BACKUP_KEY`.

## Plan A — restore from pg_dump

| # | Action |
|---|---|
| 1 | `/backups` → list of dumps from each target |
| 2 | Pick one → **Restore preview** (decrypts, lists what's inside, doesn't apply) |
| 3 | Review → **Restore now** |
| 4 | opendray puts itself in maintenance mode (rejects new sessions) |
| 5 | pg_restore runs (in `--clean` mode by default) |
| 6 | Reconcile sessions / channels |
| 7 | Leave maintenance mode |

| Concern | Behaviour |
|---|---|
| In-flight sessions | terminated (PTYs die with old DB state) |
| Channel connections | re-established after restore |
| Operator notification | banner during restore + completion |
| Roll-forward | not possible — pick a later dump |

## Plan C — import from zip-bundle

| # | Action |
|---|---|
| 1 | `/export` → **Import** tab → upload `.zip.enc` |
| 2 | opendray decrypts, validates manifest, lists scope content |
| 3 | Pick what to import (Sessions / Memory / Channels / ...) |
| 4 | **Merge strategy** per scope:  `replace` / `merge` / `skip-existing` |
| 5 | **Dry run** — see exactly what will happen, no writes |
| 6 | **Apply** — runs in transaction |

### Merge strategy

| Strategy | Behaviour |
|---|---|
| `replace` | drop existing rows in scope → insert from export |
| `merge` | upsert by (kind, source-id) → keep newest |
| `skip-existing` | only insert rows that don't already exist |

## Common failure modes

| Symptom | Cause | Fix |
|---|---|---|
| `decryption failed` | wrong `OPENDRAY_BACKUP_KEY` | use the same key that was set when dump/export was created |
| `pg_restore_version_mismatch` | dump from PG 17, server is PG 15 | match versions |
| `manifest_unsupported_version` | export from much-newer opendray | upgrade target opendray first |
| `integration_keys_missing_on_target` | by design (keys not exported) | re-mint integrations on new host + paste tokens |

## Capabilities

| feature | supported |
|---|---|
| Restore in place (Plan A) | ✓ |
| Cross-host import (Plan C) | ✓ |
| Dry-run preview (both) | ✓ |
| Partial import per scope | ✓ Plan C only |
| Roll-back after restore | ✗ — pick earlier dump |
| Online restore (no maintenance) | ✗ |
