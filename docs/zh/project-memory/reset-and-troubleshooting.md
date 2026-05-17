---
kind: concept
title: 项目记忆 — 重置 & 排查
tldr: 重置 = 清一个 cwd 的项目记忆行(raw 记忆保留)。4 种常见故障模式 + 修复。
status: stable
since: v0.1.0
topic: project-memory
related: [project-memory/overview, project-memory/scanner-and-cleaner, memory/troubleshooting]
references:
  capabilities: [memory]
x-implementation: [internal/memory/project/reset.go]
---

# 项目记忆 — 重置 & 排查

> **tldr:** 重置 = 清一个 cwd 的项目记忆行(raw 记忆保留)。4 种常见故障模式 + 修复。

## 重置

| 位置 | 做什么 |
|---|---|
| `/memory/project` → ⋯ → **Reset all sections** | 清此 cwd 的 Goals / Decisions / State / Questions |
| `/memory/project` → ⋯ → **Reset section X** | 只清一节 |
| `DELETE /api/v1/memory/project?cwd=...` | API 等价 |

| 清掉 | 保留 |
|---|---|
| 项目记忆段落条目 | raw memory 行(仍在 pgvector) |
| 段落顺序 | session 列表 / 审计日志 |
| 段落导出历史 | scanner 下次 promote 可重建段落 |

## 症状

| 症状 | 可能原因 | 修复 |
|---|---|---|
| 长会话后段落空 | scanner 模式没匹配 | 调 `goal_pattern` / `decision_pattern` |
| 同一事实被提升两次 | 冲突检测关 或 阈值太低 | 启 `memory.conflict.policy` |
| 已解决问题没移除 | cleaner 标记后没跑 | 强制运行:Settings → Cleaner → Run now |
| 段落过时 | scanner 禁用或 scan_last_n 太小 | 设 `enabled = true`;调大 `scan_last_n` |

## 常见困惑

| "为什么 X?" | 答 |
|---|---|
| "删了一行下次又回来" | Mirror 从 Claude markdown 文件重摄入。把 `.md` 也删 |
| "Cleaner 把我精心写的决策抹了" | Decisions 默认永不过期(`keep_decisions_forever = true`)。检查是否被改 false |
| "重置 section X 把笔记也清了" | `notes` 是 Inspector linked note(vault 文件),不是项目记忆。不同系统 |
| 同名两项目共享相同记忆 | scope_key 是 `cwd`,不是项目名。不同 cwd = 不同记忆 |
