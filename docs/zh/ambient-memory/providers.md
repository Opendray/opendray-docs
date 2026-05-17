---
kind: capability
title: 环境记忆 — 供应商
tldr: 3 个摘要后端 — Anthropic API、OpenAI 兼容 HTTP(Ollama / OpenAI / LocalAI)、noop dry-run 模式。在 [ambient.summarizer] 配置。
status: stable
since: v0.1.0
topic: ambient-memory
related: [ambient-memory/overview, ambient-memory/capture-rules, memory-workers/overview]
capability: [anthropic, openai-compat, noop]
inbound: capture-queue
outbound: api
x-implementation: [internal/memory/summarizer/]
---

# 环境记忆 — 供应商

> **tldr:** 3 个摘要后端 —— Anthropic API、OpenAI 兼容 HTTP(Ollama / OpenAI / LocalAI)、`noop` dry-run 模式。在 `[ambient.summarizer]` 配置。

## 供应商

| id | 后端 | 认证 | 成本 | 备注 |
|---|---|---|---|---|
| `anthropic` | Claude API(haiku / sonnet) | `ANTHROPIC_API_KEY` | 按 token 付费 | 摘要质量最高 |
| `openai-compat` | 任何 OAI 兼容(Ollama / OpenAI / LocalAI / vLLM) | api_key(本地留空) | 看情况 | 本地推荐 |
| `noop` | 无 — dry-run | n/a | 免费 | 看会捕获什么;不写 |

## Config

```toml
[ambient.summarizer]
provider = "openai-compat"     # anthropic | openai-compat | noop
model    = "llama3.1:8b"       # noop 忽略

[ambient.summarizer.anthropic]
api_key = "sk-ant-..."
model   = "claude-haiku-4-5-20251001"

[ambient.summarizer.openai_compat]
base_url = "http://localhost:11434/v1"
api_key  = ""                  # Ollama 留空
```

## 推荐配置

| 阶段 | 推荐 |
|---|---|
| 试用 | `noop` → 看会捕获什么 |
| 生产自托管 | `openai-compat` + Ollama `llama3.1:8b` |
| 高用量,无 GPU | `anthropic` `claude-haiku-4-5-20251001`(便宜快) |

## Errors

| code | http | 原因 | 修复 |
|---|---|---|---|
| `summarizer_unavailable` | 503 | 服务挂 | Settings → Test summarizer |
| `summarizer_quota_exceeded` | 429 | API quota | 换 provider 或等 |
| `summarizer_model_not_found` | 404 | 模型名打错 | 检查 `model` |
