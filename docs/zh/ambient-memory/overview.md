---
kind: concept
title: 环境记忆 — 概览
tldr: 自动 capture 引擎 — 从 session 输出提取事实,不需要 agent 自己调 memory_store。基于规则 + LLM 摘要。写到 project/global scope。
status: stable
since: v0.1.0
topic: ambient-memory
related: [ambient-memory/providers, ambient-memory/capture-rules, ambient-memory/injection, memory/overview, memory-workers/overview]
references:
  capabilities: [memory]
x-implementation: [internal/memory/capture/, internal/memory/summarizer/]
---

# 环境记忆 — 概览

> **tldr:** 自动 capture 引擎 —— 从 session 输出提取事实,不需要 agent 自己调 `memory_store`。基于规则 + LLM 摘要。写到 project/global scope。

## 比显式 `memory_store` 多了什么

| 机制 | 触发 | 延迟 |
|---|---|---|
| `memory_store` 工具调用 | agent 决定 | 即时 |
| 环境 capture(规则) | session.idle / session.ended 事件 | 事件后 |
| 环境 capture(LLM 摘要器) | worker 队列拾起 | 分钟级 |

## 流水线

```
session 输出 → capture 引擎
                  │
       ┌──────────┼──────────┐
       ▼          ▼          ▼
  规则匹配器  LLM 摘要器   冲突检查
       │          │          │
       └────┬─────┘          │
            ▼                │
       memory_store ←────────┘
            │
            ▼
        pgvector
```

## 何时读什么

| 主题 | 读 |
|---|---|
| 哪个 LLM 摘要 | [providers](./providers) |
| 哪些规则触发,怎么加 | [capture-rules](./capture-rules) |
| 捕获的事实怎么在下次 spawn 注入 | [injection](./injection) |
| Worker 状态 / 成本 / metric | [memory-workers/overview](../memory-workers/overview) |
| 坏 capture 的手动覆盖 | [project-memory/scanner-and-cleaner](../project-memory/scanner-and-cleaner) |

## Capabilities

| 特性 | 支持 |
|---|---|
| 基于规则的提取(regex / contains) | ✓ |
| LLM 摘要(Anthropic / OpenAI / Ollama) | ✓ |
| capture 时冲突检测 | ✓ |
| Dry-run 模式 | ✓(写入前预览) |
| 按 project 覆盖规则 | ✓ |
| Per-session 禁用 | ✓(`X-OpenDray-Capture: off` header) |

## Errors

| code | http | 原因 | 修复 |
|---|---|---|---|
| `capture_rule_invalid` | 400 | regex 不编译 | 在 Settings 里检查规则语法 |
| `summarizer_unavailable` | 503 | 配置的 LLM 后端挂 | 检查 [providers](./providers) |
| `capture_skipped_conflict` | (log info) | 新事实与现有冲突;policy=manual | 在冲突队列 review |
