---
kind: capability
title: Backup — exports (Plan C)
tldr: /export = portable zip-bundle. Decoded data (JSON/markdown), not pg_dump. Importable into a different opendray host. AES-GCM encrypted.
status: stable
since: v0.1.0
topic: backup
related: [backup/overview, backup/restore-and-import]
capability: [portable-zip, json-bundle, cross-host-import, scope-selective]
inbound: gateway
outbound: zip-file
x-implementation: [internal/backup/export.go]
---

# Backup — exports (Plan C)

> **tldr:** `/export` = portable zip-bundle. Decoded data (JSON/markdown), not `pg_dump`. Importable into a **different** opendray host. AES-GCM encrypted.

## Plan A vs Plan C

| | Plan A (backup) | Plan C (export) |
|---|---|---|
| Format | pg_dump (binary) | zip of JSON + markdown |
| Restore target | same opendray, same DB | any opendray instance |
| Schema-version-locked | yes | no — keys regenerated on import |
| Use case | "oops, restore yesterday's DB" | "migrate from one server to another" |

## What's in the zip

```
opendray-export-<ts>.zip.enc                    # AES-GCM encrypted whole thing
├── manifest.json                               # what's inside, versions, etc.
├── sessions/                                   # one JSON per session
│   └── s_42.json
├── memory/
│   ├── project.jsonl                           # one row per line
│   ├── global.jsonl
│   └── session.jsonl
├── channels/                                   # one JSON per channel
│   └── ch_tg_main.json
├── integrations/                               # API keys NOT included
│   └── pettracker.json
├── notes/                                      # full vault (markdown)
│   └── ...
└── audit/
    └── audit_log.jsonl
```

## Selective export

| Toggle in UI | Includes |
|---|---|
| Sessions | session metadata + transcripts |
| Memory | project / global / session scope |
| Channels | configs + secrets (encrypted within the encrypted bundle) |
| Integrations | metadata (NOT API keys — those are regenerated on import) |
| Notes | full vault |
| Audit + call log | optional (large) |

## Encryption

| Layer | What |
|---|---|
| Outer | AES-GCM with `OPENDRAY_BACKUP_KEY` |
| Inner secrets (channel tokens, etc.) | second AES-GCM layer per-value |
| Decryption | requires same `OPENDRAY_BACKUP_KEY` on import side |

## Capabilities

| feature | supported |
|---|---|
| Selective scopes | ✓ |
| Cross-host import | ✓ |
| Same-host re-import | ✓ (merges rather than overwrites) |
| API keys preserved | ✗ — regenerated; integrations need re-paste of keys |
| Streaming generation | ✓ (no full in-memory hold) |
| Encrypted CLI generation | ✓ `opendray export` |

## Errors

| code | when | fix |
|---|---|---|
| `export_disk_full` | staging dir out of space | clear `OPENDRAY_BACKUP_STAGING` or set larger |
| `export_too_large` | > 4 GB single zip | use selective scopes |
| `export_encryption_failed` | key missing | check `OPENDRAY_BACKUP_KEY` |
