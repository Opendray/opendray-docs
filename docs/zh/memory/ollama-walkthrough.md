---
kind: capability
title: Ollama 实操
tldr: 本地跑 Ollama → 拉 nomic-embed-text → opendray [memory.http] 指过去 → 重启。免费、语义搜索、无 API key。
status: stable
since: v0.1.0
topic: memory
related: [memory/overview, memory/configuration, memory/lmstudio-walkthrough]
capability: [openai-compat, nomic-embed-text, local-gpu]
inbound: api
outbound: http
x-implementation: [internal/memory/embedder/openai_compat/]
---

# Ollama 实操

> **tldr:** 本地跑 Ollama → 拉 `nomic-embed-text` → opendray `[memory.http]` 指过去 → 重启。免费、语义搜索、无 API key。

## Setup

| # | 动作 | 验证 |
|---|---|---|
| 1 | 装 Ollama:`brew install ollama`(mac) / `curl -fsSL https://ollama.com/install.sh \| sh`(linux) | `ollama --version` |
| 2 | 启动:`ollama serve`(macOS 自动启) | `curl http://localhost:11434/api/tags` |
| 3 | 拉 embedding 模型:`ollama pull nomic-embed-text` | `ollama list` 看到 |
| 4 | 编辑 `config.toml`(见下) | `grep memory.http config.toml` |
| 5 | 重启 opendray | 日志:`INFO memory ready embedder=http model=nomic-embed-text` |
| 6 | Settings → Server → Memory → **Test embedder** | toast:✓ |

## Config

```toml
[memory]
backend = "http"

[memory.http]
base_url   = "http://localhost:11434/v1"
model      = "nomic-embed-text"
api_key    = ""                   # Ollama 留空
dimensions = 0                    # 0 = 自动检测(nomic-embed-text 为 768)
```

## 模型选择

| 模型 | dim | 适用 |
|---|---|---|
| `nomic-embed-text` | 768 | 推荐默认 |
| `mxbai-embed-large` | 1024 | 召回更高,更慢 |
| `bge-m3` | 1024 | 多语言(中文 + EN) |
| `snowflake-arctic-embed` | 1024 | 技术文本最佳 |

## Errors

| code | http | 原因 | 修复 |
|---|---|---|---|
| `embedder_unavailable` | 503 | Ollama 没跑 | `ollama serve` |
| `embedder_model_not_found` | 404 | 模型没拉 | `ollama pull <model>` |
| `embedder_dim_mismatch` | 500 | 换模型没重 embed | Memory 页 → **Migrate** banner |
