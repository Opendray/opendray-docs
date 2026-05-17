---
kind: concept
title: 备份 — 快速开始
tldr: 默认关闭。设 OPENDRAY_BACKUP_ENABLED=1 + OPENDRAY_BACKUP_KEY(32 字节 base64)。重启 → Backups 页出现。加 target → run 一次 dump。
status: stable
since: v0.1.0
topic: backup
related: [backup/overview, backup/targets, backup/schedules]
references:
  capabilities: []
---

# 备份 — 快速开始

> **tldr:** 默认关闭。设 `OPENDRAY_BACKUP_ENABLED=1` + `OPENDRAY_BACKUP_KEY`(32 字节 base64)。重启 → Backups 页出现。加 target → run 一次 dump。

## 步骤

| # | 动作 | 验证 |
|---|---|---|
| 1 | `export OPENDRAY_BACKUP_KEY="$(openssl rand -base64 32)"` | env 设了 |
| 2 | `export OPENDRAY_BACKUP_ENABLED=1` | env 设了 |
| 3 | `export OPENDRAY_BACKUP_PG_DUMP_PATH=/opt/homebrew/opt/postgresql@17/bin/pg_dump` | 二进制存在 |
| 4 | 同样设 pg_restore | 二进制存在 |
| 5 | 重启 opendray | 日志:`INFO backup ready` |
| 6 | 后台打开 `/backups` | 页出现(404 说明 env 没生效) |
| 7 | 加 target → Run now | dump 以加密 `.bin` 出现 |

## 密钥存哪

| 在哪 | 推荐 |
|---|---|
| 环境变量 | Vault / AWS Secrets / 1Password CLI → 启动时注入 |
| systemd unit | `EnvironmentFile=/etc/opendray/secrets.env`(0600) |
| Docker compose | `env_file: ./.env`(`.env` gitignored) |
| 永远不 | 源码、命令历史、屏幕录制 |

## 验证

| 检查 | 命令 |
|---|---|
| pg_dump 版本匹配服务端 | `pg_dump --version` |
| 密钥长度 | `echo -n $OPENDRAY_BACKUP_KEY \| base64 -d \| wc -c` → 32 |
| 文件写了 | 在 target 存储里看 `<ts>.bin` 文件 |
| 能解密 | Backups 页 → 点 dump → "Restore preview"(解密但不应用) |
