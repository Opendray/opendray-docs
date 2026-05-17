---
kind: concept
title: 项目记忆 — 工作流
tldr: 打开 /memory/project → 选 cwd → 看段落(Goals / Decisions / State)。内联编辑、标问题为已解决、导出段落到 Markdown。
status: stable
since: v0.1.0
topic: project-memory
related: [project-memory/overview, project-memory/scanner-and-cleaner]
references:
  capabilities: [memory]
x-implementation: [app/web/src/features/memory/project/]
---

# 项目记忆 — 工作流

> **tldr:** 打开 `/memory/project` → 选 cwd → 看段落(Goals / Decisions / State)。内联编辑、标问题为已解决、导出段落到 Markdown。

## 打开

| 位置 | 路径 |
|---|---|
| Web 后台 | 左侧栏 🧠 → **Project** tab |
| 直链 | `/memory/project` |
| API | `GET /api/v1/memory/project?cwd=/path/to/proj` |

cwd 多时,顶部 picker 边输入边过滤。

## 每段操作

| 段 | hover 一行 | 批量 |
|---|---|---|
| Goals | ✓ 编辑 · ✓ 删 · ✓ 提升为 decision | 全清 |
| Decisions | ✓ 编辑 · ✓ 删 | 导出 Markdown |
| Open questions | ✓ 标已解决 · ✓ 编辑 · ✓ 删 | 清已解决 |
| Current state | ✓ 用最新 session 覆盖 | reset |
| Files of interest | ✓ 移除 | 清 |
| Recent activity | (只读) | — |

## 工作流模式

| 模式 | 怎么做 |
|---|---|
| Session 前预热 | spawn Claude 前打开项目记忆 — agent 通过 [injection](../ambient-memory/injection) 拿最新决策 |
| Session 后 triage | scanner 在 session.ended 时自动提升 N 行;review 落地的 |
| 决策日志 | 手动标 `decision`;不被自动清理 |
| 清理过期问题 | 按 `unresolved + age > 30d` 过滤 → 标或删 |
| 交接给别的运维 | 导出段落 → commit `.md` 进 repo 作 `PROJECT_MEMORY.md` |
