---
kind: concept
title: 项目记忆 — 概览
tldr: 在 raw memory rows 之上的 per-cwd 结构化层。由 scanner + cleaner worker 自动管理。每个项目一页,呈现 goals / decisions / state。
status: stable
since: v0.1.0
topic: project-memory
related: [project-memory/workflow, project-memory/scanner-and-cleaner, project-memory/reset-and-troubleshooting, memory/overview]
references:
  capabilities: [memory]
x-implementation: [internal/memory/project/]
---

# 项目记忆 — 概览

> **tldr:** 在 raw memory rows 之上的 per-cwd 结构化层。由 scanner + cleaner worker 自动管理。每个项目一页,呈现 goals / decisions / state。

## 为什么要结构化层

| Raw memory 行 | 项目记忆 |
|---|---|
| 扁平列表,按 score 排 | 分组:goals / decisions / state / open questions |
| BM25 / 语义搜索 | 一节一节的页面 |
| 每条事实在 pgvector | 精选子集(worker 提升) |
| 运维按 query 浏览 | 运维自上而下读 |

## 页面布局(每 cwd 一页)

| 段落 | 来源 | 更新者 |
|---|---|---|
| Goals | 标 `goal` 的行 | scanner 检测 "we want to ..." |
| Decisions | 标 `decision` 的行 | scanner 检测 "we decided ..." |
| Open questions | 标 `question` + `unresolved: true` 的行 | scanner 检测 "?" + cleaner 在解决时清 |
| Current state | 最新 `state` 行 | session.ended capture |
| Files of interest | 标 `file:<path>` 的行 | 从 agent 引用文件推断 |
| Recent activity | 最近 N 个触及此 cwd 的 session id | session manager |

## Worker 自动管理

| Worker | 角色 | 调度 |
|---|---|---|
| Scanner | 把 raw 行 → 项目记忆 段落 | 此 cwd 每次 session.ended |
| Cleaner | 删 stale / resolved | 每 24h |
| Summarizer | 段落 > 50 行时压缩 | 段落大小 > 50 时 |

详见 [scanner-and-cleaner](./scanner-and-cleaner)。

## 何时读什么

| 主题 | 读 |
|---|---|
| 日常使用模式 | [workflow](./workflow) |
| Worker 调参 + 覆盖 | [scanner-and-cleaner](./scanner-and-cleaner) |
| 坏 capture / 重置 | [reset-and-troubleshooting](./reset-and-troubleshooting) |
