---
kind: capability
title: Backup — targets
tldr: Where the encrypted bundle lands. 8 target kinds — local-fs / S3 / R2 / B2 / GCS / Azure Blob / SMB / SFTP. Each independent retention + cron.
status: stable
since: v0.1.0
topic: backup
related: [backup/overview, backup/quickstart, backup/schedules]
capability:
  - local-fs
  - s3
  - r2-cloudflare
  - b2-backblaze
  - gcs
  - azure-blob
  - smb
  - sftp
inbound: backup-runner
outbound: object-store / filesystem
x-implementation: [internal/backup/target/]
---

# Backup — targets

> **tldr:** Where the encrypted bundle lands. 8 target kinds — local-fs / S3 / R2 / B2 / GCS / Azure Blob / SMB / SFTP. Each independent retention + cron.

## Target kinds

| Kind | Auth | Best for |
|---|---|---|
| `local-fs` | filesystem perms | dev, secondary local copy |
| `s3` | access-key + secret | AWS prod |
| `r2-cloudflare` | access-key + secret (S3-compatible) | cheap egress |
| `b2-backblaze` | app-key | cheapest object store |
| `gcs` | service account JSON | GCP ecosystem |
| `azure-blob` | account + key OR SAS | Azure ecosystem |
| `smb` | username + password | NAS / UNAS / Synology |
| `sftp` | SSH key OR password | self-hosted / VPS |

## Add target — common fields

```yaml
- id: my-r2
  name: "Cloudflare R2 (production)"
  kind: r2-cloudflare
  enabled: true
  retention_days: 30
  prefix: "opendray/backups/"
  endpoint: "https://<account>.r2.cloudflarestorage.com"
  bucket: "opendray-prod"
  access_key: "REPLACE_ME"
  secret_key: "REPLACE_ME"
```

## Per-kind required fields

| Kind | Fields |
|---|---|
| `local-fs` | `path` (absolute) |
| `s3` / `r2-cloudflare` / `b2-backblaze` | `endpoint` (b2 too), `bucket`, `access_key`, `secret_key` |
| `gcs` | `bucket`, `service_account_json` (file path) |
| `azure-blob` | `account`, `container`, `access_key` OR `sas_token` |
| `smb` | `host`, `share`, `username`, `password`, `path` |
| `sftp` | `host`, `port`, `username`, `private_key` OR `password`, `path` |

## Multi-target fan-out

| Setup | Behaviour |
|---|---|
| One target | dump succeeds → uploaded once |
| Multiple enabled | dump succeeds → uploaded to each in parallel; any failure flagged independently |
| Local + remote | recommended — local for fast restore, remote for disaster |

## Capabilities

| feature | supported |
|---|---|
| Independent retention per target | ✓ |
| Independent cron per target | ✗ — one schedule, fan out to all (see schedules page) |
| Test connectivity | ✓ Settings → target → Test |
| Bandwidth throttle | ✗ (planned) |
| Object versioning | ✓ (if the backend supports it; opendray writes timestamped paths) |

## Errors

| code | when | fix |
|---|---|---|
| `target_auth_failed` | bad credentials | re-enter and Test |
| `target_path_unwritable` | local-fs / smb / sftp | check filesystem perms |
| `target_bucket_not_found` | s3 / r2 / b2 / gcs / azure | create bucket first |
| `target_quota_exceeded` | cloud quota | raise quota or use cheaper kind |
