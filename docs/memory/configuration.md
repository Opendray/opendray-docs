---
kind: capability
title: Memory configuration
tldr: '[memory] in config.toml + Settings → Server → Memory. Choose backend (auto / bm25 / http), default scope, top-k, similarity threshold. Zero-config = BM25 + pgvector + project scope.'
status: stable
since: v0.1.0
topic: memory
related:
  - memory/overview
  - memory/local-onnx
  - memory/ollama-walkthrough
  - memory/lmstudio-walkthrough
capability:
  - backend-auto
  - backend-bm25
  - backend-http
inbound: api
outbound: pgvector
x-implementation:
  - internal/memory/config.go
  - internal/config/
---

# Memory configuration

> **tldr:** `[memory]` in `config.toml` + **Settings → Server → Memory**. Choose backend (`auto` / `bm25` / `http`), default scope, top-k, similarity threshold. Zero-config = BM25 + pgvector + project scope.

## Config schema

```toml
[memory]
backend              = "auto"      # auto | bm25 | http
store                = "pgvector"  # only option in v1
default_top_k        = 5
similarity_threshold = 0.1
chromem_path         = ""          # phase 2 placeholder

[memory.local]
model = "bge-m3"                   # phase 2 placeholder (ONNX)

[memory.http]
base_url   = "http://localhost:11434/v1"
model      = "nomic-embed-text"
api_key    = ""                    # blank for ollama; required for OpenAI
dimensions = 0                     # 0 = autodetect

[memory.scope]
default = "project"                # session | project | global
```

## Backend choices

| Value | What | When to pick |
|---|---|---|
| `auto` (default) | BM25 today; future ONNX when phase 2 ships | lets opendray upgrade transparently |
| `bm25` | Pure-Go keyword retrieval, 384-dim hash-bucket | zero external deps; accept keyword-only matching |
| `http` | OpenAI-compatible `/v1/embeddings` | semantic search via Ollama / OpenAI / LocalAI / vLLM |

## BM25 limits

| Issue | Behaviour |
|---|---|
| Exact token only | "我喜欢 pnpm" + search "package manager" → 0 hits |
| Cross-lingual | none |
| Synonym handling | none |
| Use case | demos, reproducibility, zero-config; for production swap to `http` |

## HTTP backend examples

```toml
# Ollama (local, free, no key)
[memory.http]
base_url = "http://localhost:11434/v1"
model    = "nomic-embed-text"

# OpenAI
[memory.http]
base_url = "https://api.openai.com/v1"
model    = "text-embedding-3-small"
api_key  = "sk-..."

# LM Studio
[memory.http]
base_url = "http://localhost:1234/v1"
model    = "nomic-embed-text-v1.5"
```

## Tunables

| Field | Default | Effect |
|---|---|---|
| `default_top_k` | 5 | how many hits `memory_search` returns when caller doesn't specify |
| `similarity_threshold` | 0.1 | rows below this score filtered out (0 = keep all) |
| `scope.default` | `project` | auto-attach uses this when caller omits scope |

## Capabilities

| feature | supported |
|---|---|
| Hot-reload `[memory]` | ✗ — restart needed |
| Multiple embedders | ✗ — one backend per gateway |
| Per-cwd backend override | ✗ |
| Test embedder button | ✓ — Settings page → Test |
| Auto-detect dimensions | ✓ — set `dimensions = 0` |

## Errors

| code | http | cause | fix |
|---|---|---|---|
| `embedder_unavailable` | 503 | backend down (Ollama not running, OpenAI key invalid) | check Settings → Test embedder |
| `embedder_dim_mismatch` | 500 | switched embedder w/o re-embedding | use Migrate banner in Memory page |
| `config_invalid_backend` | (boot fail) | `backend` not in {auto, bm25, http} | fix `config.toml` |
