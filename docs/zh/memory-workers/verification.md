---
kind: concept
title: Worker 验证 & 指标
tldr: /memory/workers 显示 per-worker 队列深度、成功率、p95 延迟、成本。每 worker 一个手动"Run now"。失败进 DLQ。
status: stable
since: v0.1.0
topic: memory-workers
related: [memory-workers/overview, memory-workers/picking-a-worker, activity/overview]
references:
  capabilities: [memory]
x-implementation: [internal/memory/worker/metrics.go, app/web/src/features/memory/workers/]
---

# Worker 验证 & 指标

> **tldr:** `/memory/workers` 显示 per-worker 队列深度、成功率、p95 延迟、成本。每 worker 一个手动 "Run now"。失败进 DLQ。

## 页面布局

| Pane | 内容 |
|---|---|
| Worker 列表(左) | 每 worker 一行(ambient / scanner / cleaner / conflict / migration) |
| 详情(右) | metric + 最近运行 + DLQ + Run now 按钮 |

## Per-worker 指标

| 指标 | 来源 | 更新 |
|---|---|---|
| 队列深度 | 内部队列大小 | 实时 |
| 成功率(24h) | runs / (runs + failures) | rolling 24h |
| p95 延迟 | run duration | rolling 24h |
| 成本(24h) | sum of token cost | rolling 24h |
| 最近运行 | 时间戳 + 时长 | 最新 |
| DLQ 数 | DLQ 失败 run 数 | 持久 |

## 手动操作

| 按钮 | 做什么 |
|---|---|
| Run now | 入队一个合成 run;配置改后有用 |
| Pause | 设 `enabled: false`;队列继续,不执行 |
| Resume | 设 `enabled: true` |
| Clear DLQ | 清所有 DLQ 项(手动 review 后) |
| Replay DLQ | 把所有 DLQ 项重新入队 |

## 常见 DLQ 错误

| 错误 | 含义 | 修复 |
|---|---|---|
| `summarizer_unavailable: connection refused` | Ollama 没跑 | `ollama serve` |
| `summarizer_quota_exceeded` | API quota | 换 provider 或等 |
| `summarizer_model_not_found` | 模型名打错 | 检查 `model` |
| `summarizer_timeout` | 响应 > `timeout_seconds` | 调高 timeout 或换小模型 |
| `scanner_pattern_invalid` | regex 不编译 | 检查 `goal_pattern` 等 |
