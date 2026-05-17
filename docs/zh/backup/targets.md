---
kind: capability
title: 备份 — Targets
tldr: 加密 bundle 落到哪。8 种 target — local-fs / S3 / R2 / B2 / GCS / Azure Blob / SMB / SFTP。每个独立 retention + cron。
status: stable
since: v0.1.0
topic: backup
related: [backup/overview, backup/quickstart, backup/schedules]
capability: [local-fs, s3, r2-cloudflare, b2-backblaze, gcs, azure-blob, smb, sftp]
inbound: backup-runner
outbound: object-store / filesystem
x-implementation: [internal/backup/target/]
---

# 备份 — Targets

> **tldr:** 加密 bundle 落到哪。8 种 target —— local-fs / S3 / R2 / B2 / GCS / Azure Blob / SMB / SFTP。每个独立 retention + cron。

## Target 种类

| 种类 | 认证 | 最适合 |
|---|---|---|
| `local-fs` | 文件系统权限 | dev、副本本地 |
| `s3` | access-key + secret | AWS 生产 |
| `r2-cloudflare` | access-key + secret(S3 兼容) | 便宜 egress |
| `b2-backblaze` | app-key | 最便宜对象存储 |
| `gcs` | 服务账号 JSON | GCP 生态 |
| `azure-blob` | account + key 或 SAS | Azure 生态 |
| `smb` | 用户名 + 密码 | NAS / UNAS / Synology |
| `sftp` | SSH key 或密码 | 自托管 / VPS |

## 配置示例

```yaml
- id: my-r2
  name: "Cloudflare R2(生产)"
  kind: r2-cloudflare
  enabled: true
  retention_days: 30
  prefix: "opendray/backups/"
  endpoint: "https://<account>.r2.cloudflarestorage.com"
  bucket: "opendray-prod"
  access_key: "REPLACE_ME"
  secret_key: "REPLACE_ME"
```

## 多 target 扇出

| 设置 | 行为 |
|---|---|
| 一个 target | dump 成功 → 上传一次 |
| 多个 enabled | dump 成功 → 并行上传到每个;任一失败独立标记 |
| 本地 + 远程 | 推荐 —— 本地快恢复,远程容灾 |
