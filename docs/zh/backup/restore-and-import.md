---
kind: capability
title: 备份 — 恢复(A) 和 导入(C)
tldr: /backups → 选 dump → Restore(原地 pg_restore)。/export → 上传 .zip.enc → Import(解密 + 合并)。都需要 OPENDRAY_BACKUP_KEY。
status: stable
since: v0.1.0
topic: backup
related: [backup/overview, backup/quickstart, backup/export]
capability: [pg-restore-in-place, zip-import-merge, dry-run-preview]
inbound: gateway
outbound: postgres / files
x-implementation: [internal/backup/restore.go, internal/backup/import.go]
---

# 备份 — 恢复(A) 和 导入(C)

> **tldr:** `/backups` → 选 dump → **Restore**(原地 pg_restore)。`/export` → 上传 `.zip.enc` → **Import**(解密 + 合并)。都需要 `OPENDRAY_BACKUP_KEY`。

## Plan A — 从 pg_dump 恢复

| # | 动作 |
|---|---|
| 1 | `/backups` → 每个 target 的 dump 列表 |
| 2 | 选一个 → **Restore preview**(解密,列内容,不应用) |
| 3 | review → **Restore now** |
| 4 | opendray 进维护模式(拒新请求) |
| 5 | pg_restore 跑(默认 `--clean` 模式) |
| 6 | reconcile sessions / channels |
| 7 | 退出维护模式 |

## Plan C — 从 zip-bundle 导入

| # | 动作 |
|---|---|
| 1 | `/export` → **Import** tab → 上传 `.zip.enc` |
| 2 | opendray 解密、验 manifest、列 scope 内容 |
| 3 | 选要导入什么(Sessions / Memory / Channels / ...) |
| 4 | 每 scope 的 **合并策略**:`replace` / `merge` / `skip-existing` |
| 5 | **Dry run** —— 看会发生什么,不写 |
| 6 | **Apply** —— 事务里跑 |

### 合并策略

| 策略 | 行为 |
|---|---|
| `replace` | 删 scope 现有行 → 插入导出的 |
| `merge` | 按 (kind, source-id) upsert → 保留新的 |
| `skip-existing` | 只插入不存在的行 |

## 常见失败

| 症状 | 原因 | 修复 |
|---|---|---|
| `decryption failed` | `OPENDRAY_BACKUP_KEY` 错 | 用建 dump/export 时的同一 key |
| `pg_restore_version_mismatch` | dump 来自 PG 17,服务端是 PG 15 | 版本要匹配 |
| `manifest_unsupported_version` | export 来自更新版 opendray | 先升级目标 opendray |
| `integration_keys_missing_on_target` | 故意为之(key 不导出) | 在新主机重新发 integration + 粘 token |
