---
kind: capability
title: 记忆配置
tldr: '[memory] in config.toml + Settings → Server → Memory。选 backend(auto / bm25 / http)、默认 scope、top-k、相似度阈值。零配置 = BM25 + pgvector + project scope。'
status: stable
since: v0.1.0
topic: memory
related: [memory/overview, memory/local-onnx, memory/ollama-walkthrough, memory/lmstudio-walkthrough]
capability: [backend-auto, backend-bm25, backend-http]
inbound: api
outbound: pgvector
x-implementation: [internal/memory/config.go]
---

# 记忆配置

> **tldr:** `[memory]` in `config.toml` + **Settings → Server → Memory**。选 backend(`auto` / `bm25` / `http`)、默认 scope、top-k、相似度阈值。零配置 = BM25 + pgvector + project scope。

## Config schema

```toml
[memory]
backend              = "auto"      # auto | bm25 | http
store                = "pgvector"  # v1 唯一选项
default_top_k        = 5
similarity_threshold = 0.1

[memory.http]
base_url   = "http://localhost:11434/v1"
model      = "nomic-embed-text"
api_key    = ""                    # Ollama 留空;OpenAI 必填
dimensions = 0                     # 0 = 自动检测

[memory.scope]
default = "project"                # session | project | global
```

## Backend 选择

| 值 | 什么 | 何时选 |
|---|---|---|
| `auto`(默认) | 今天 BM25;phase 2 上后用 ONNX | 让 opendray 透明升级 |
| `bm25` | 纯 Go 关键词召回,384 维稀疏 | 零外部依赖,可接受关键词级匹配 |
| `http` | OpenAI 兼容 `/v1/embeddings` | 通过 Ollama / OpenAI / LocalAI 做语义搜索 |

## BM25 限制

| 问题 | 行为 |
|---|---|
| 仅精确 token | "我喜欢 pnpm" + 搜 "package manager" → 0 命中 |
| 跨语言 | 无 |
| 同义处理 | 无 |
| 用途 | 演示、可复现、零配置;生产换 `http` |

## HTTP 后端示例

```toml
# Ollama(本地,免费,无 key)
[memory.http]
base_url = "http://localhost:11434/v1"
model    = "nomic-embed-text"

# OpenAI
[memory.http]
base_url = "https://api.openai.com/v1"
model    = "text-embedding-3-small"
api_key  = "sk-..."
```

## Errors

| code | http | 原因 | 修复 |
|---|---|---|---|
| `embedder_unavailable` | 503 | 后端挂(Ollama 没跑) | Settings → Test embedder |
| `embedder_dim_mismatch` | 500 | 换 embedder 没 re-embed | Memory 页 Migrate banner |
