---
kind: concept
title: 记忆 worker — 概览
tldr: 后台 LLM worker,驱动 ambient capture / 摘要 / 项目记忆 scanner。可插拔分 task — Haiku 便宜、Sonnet 难活、本地 llama 免费。
status: stable
since: v0.1.0
topic: memory-workers
related: [memory-workers/picking-a-worker, memory-workers/verification, ambient-memory/providers, project-memory/scanner-and-cleaner]
references:
  capabilities: [memory]
x-implementation: [internal/memory/worker/, internal/memory/summarizer/]
---

# 记忆 worker — 概览

> **tldr:** 后台 LLM worker,驱动 ambient capture / 摘要 / 项目记忆 scanner。可插拔分 task —— Haiku 便宜、Sonnet 难活、本地 llama 免费。

## 后台跑什么

| Worker task | 触发 | 配置在 |
|---|---|---|
| ambient-summarize | session.ended | `[memory.workers.ambient]` |
| project-scanner | 被追踪 cwd 的 session.ended | `[memory.workers.scanner]` |
| project-cleaner | cron(默认每天凌晨 2 点) | `[memory.workers.cleaner]` |
| conflict-resolver | 新写命中冲突阈值 | `[memory.workers.conflict]` |
| migration-reembed | embedder 后端切换 | `[memory.workers.migration]` |

## 为什么按 task 选 provider

| Task | 用量 | 需要质量 | 推荐 |
|---|---|---|---|
| ambient-summarize | 高 | 中 | Haiku 或 Ollama |
| project-scanner | 中 | 中-高 | Haiku 或 Sonnet |
| conflict-resolver | 低 | 高 | Sonnet |
| migration-reembed | 高 | n/a(只是 embedder) | 非 LLM worker |

## 按 task 配

```toml
[memory.workers.ambient]
provider = "openai-compat"
model    = "llama3.1:8b"
max_concurrent = 2

[memory.workers.scanner]
provider = "anthropic"
model    = "claude-haiku-4-5-20251001"
max_concurrent = 1

[memory.workers.conflict]
provider = "anthropic"
model    = "claude-sonnet-4-6"
max_concurrent = 1
```
