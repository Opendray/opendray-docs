---
kind: capability
title: 备份 — 调度
tldr: cron 表达式触发备份 run。扇出到所有 enabled target。每次成功上传后跑 retention 修剪。默认 `0 2 * * *`(每天凌晨 2 点)。
status: stable
since: v0.1.0
topic: backup
related: [backup/overview, backup/targets, backup/quickstart]
capability: [cron-trigger, multi-target-fanout, retention-prune]
inbound: cron
outbound: target
x-implementation: [internal/backup/scheduler.go]
---

# 备份 — 调度

> **tldr:** cron 表达式触发备份 run。扇出到所有 enabled target。每次成功上传后跑 retention 修剪。默认 `0 2 * * *`(每天凌晨 2 点)。

## Config

```toml
[backup.schedule]
enabled    = true
expression = "0 2 * * *"
timezone   = "Asia/Shanghai"
retention_days_default = 30

[backup.schedule.advanced]
max_dump_duration_minutes = 30
post_run_command = ""
```

## Cron 示例

| 表达式 | 何时 |
|---|---|
| `0 2 * * *` | 每天凌晨 2 点 |
| `0 */6 * * *` | 每 6 小时 |
| `0 3 * * 0` | 周日 凌晨 3 点 |
| `*/15 * * * *` | 每 15 分钟(重,只用于测试) |

## 每次 run 流程

| # | 步骤 |
|---|---|
| 1 | scheduler 触发 cron |
| 2 | pg_dump → 用 `OPENDRAY_BACKUP_KEY` 加密 → 写到 staging 临时文件 |
| 3 | 每个 enabled target 并行:上传 |
| 4 | 每个 target 成功 → retention 修剪该 target(删超 `retention_days` 的文件) |
| 5 | 任一 target 失败 → `/backups` UI 标记;staging 文件保留供重试 |
| 6 | 发 `backup.run.completed` / `backup.run.failed` 事件 |

## 手动 run

| 在哪 | 动作 |
|---|---|
| `/backups` UI | Run now 按钮 |
| CLI | `opendray backup run-now` |
| API | `POST /api/v1/backup/runs` |
