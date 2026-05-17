---
kind: concept
title: 备份 Backup — 概览
tldr: 两个安全网 — 加密 pg_dump(全 DB,原地恢复) + zip-bundle 导出(纯数据,跨主机迁移)。两者都 AES-GCM 加密。Opt-in 需要 OPENDRAY_BACKUP_ENABLED。
status: stable
since: v0.1.0
topic: backup
related: [backup/quickstart, backup/targets, backup/schedules, backup/export, backup/restore-and-import]
references:
  capabilities: []
x-implementation: [internal/backup/, ADR 0012]
---

# 备份 Backup — 概览

> **tldr:** 两个安全网 —— 加密 `pg_dump`(全 DB,原地恢复) + zip-bundle 导出(纯数据,跨主机迁移)。两者都 AES-GCM 加密。Opt-in 需要 `OPENDRAY_BACKUP_ENABLED`。

## 两条路径

| 路径 | 什么 | 恢复模式 | 可移植性 |
|---|---|---|---|
| Plan A — backup | 全 DB 加密 `pg_dump` | 原地恢复(同 opendray) | 绑该主机 schema 版本 |
| Plan C — export | 解码数据的 zip bundle | 导入到另一台 opendray | 跨主机迁移 |

## 启用

```bash
export OPENDRAY_BACKUP_KEY="$(openssl rand -base64 32)"
export OPENDRAY_BACKUP_ENABLED=1
export OPENDRAY_BACKUP_PG_DUMP_PATH=/opt/homebrew/opt/postgresql@17/bin/pg_dump
export OPENDRAY_BACKUP_PG_RESTORE_PATH=/opt/homebrew/opt/postgresql@17/bin/pg_restore
```

重启 opendray —— Backups 页(`/backups`)+ Export 页(`/export`)出现。

## 覆盖范围

| 面 | Plan A | Plan C |
|---|---|---|
| Sessions DB 行 | ✓ | ✓ |
| Memory(pgvector) | ✓ | ✓ |
| Channels 配置 | ✓(加密 secret) | ✓ |
| Integrations | ✓ | ✓(key 重新生成) |
| Audit + 调用日志 | ✓ | 可选 |
| Notes vault | ✗(用 git) | ✗ |
