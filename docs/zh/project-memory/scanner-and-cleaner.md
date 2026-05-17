---
kind: capability
title: 扫描器 & 清理器 — 自动管理
tldr: 两个 worker — scanner 把 raw 行提升到项目记忆段落,cleaner 删 stale / resolved。在 [project_memory.scanner] 和 [.cleaner] 配置。
status: stable
since: v0.1.0
topic: project-memory
related: [project-memory/overview, project-memory/workflow, memory/maintenance]
capability: [scanner, cleaner, section-promotion, stale-detection]
inbound: memory-rows
outbound: project-memory
x-implementation: [internal/memory/project/scanner.go, internal/memory/project/cleaner.go]
---

# 扫描器 & 清理器 — 自动管理

> **tldr:** 两个 worker —— scanner 把 raw 行提升到项目记忆段落,cleaner 删 stale / resolved。在 `[project_memory.scanner]` 和 `[.cleaner]` 配置。

## Scanner

| 触发 | 动作 |
|---|---|
| 此 cwd 的 `session.ended` | 扫该 cwd 最近 N 条记忆 |
| 匹配 `goal_pattern` | 提升 → Goals 段 |
| 匹配 `decision_pattern` | 提升 → Decisions 段 |
| 匹配 `question_pattern` + 含 `?` | 提升 → Open questions |
| 最新行标 `state` | 覆盖 Current state |

```toml
[project_memory.scanner]
enabled       = true
scan_last_n   = 20
goal_pattern     = "(want|need|goal|想要|需要|目标)[:\\s]"
decision_pattern = "(decided|chose|will use|决定|采用|选择)\\s"
question_pattern = "(\\?|wonder|TODO|疑问|待办)"
promote_threshold = 0.6
```

## Cleaner

| 触发 | 动作 |
|---|---|
| 每 24h | 走所有项目记忆段落 |
| 行年龄 > `stale_days` | 标 `stale: true`;若同时未读则删 |
| 行标 `resolved: true` | 删 |
| 行处于 newer-wins 冲突对的输方 | 删 |

```toml
[project_memory.cleaner]
enabled              = true
schedule             = "0 2 * * *"   # cron,默认凌晨 2 点
stale_days           = 90
remove_stale_unread  = true
keep_decisions_forever = true        # Decisions 永不过期
```
