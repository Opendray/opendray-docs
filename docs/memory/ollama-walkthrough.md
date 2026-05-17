---
kind: capability
title: Ollama walkthrough
tldr: Run Ollama locally → pull nomic-embed-text → point opendray's [memory.http] at it → restart. Free, semantic search, no API key.
status: stable
since: v0.1.0
topic: memory
related:
  - memory/overview
  - memory/configuration
  - memory/lmstudio-walkthrough
capability:
  - openai-compat
  - nomic-embed-text
  - local-gpu
inbound: api
outbound: http
x-implementation:
  - internal/memory/embedder/openai_compat/
---

# Ollama walkthrough

> **tldr:** Run Ollama locally → pull `nomic-embed-text` → point opendray's `[memory.http]` at it → restart. Free, semantic search, no API key.

## Setup

| # | Action | Verify |
|---|---|---|
| 1 | Install Ollama: `brew install ollama` (mac) / `curl -fsSL https://ollama.com/install.sh \| sh` (linux) | `ollama --version` |
| 2 | Start: `ollama serve` (or it auto-starts on macOS) | `curl http://localhost:11434/api/tags` |
| 3 | Pull embedding model: `ollama pull nomic-embed-text` | `ollama list` shows it |
| 4 | Edit `config.toml` (see below) | `grep memory.http config.toml` |
| 5 | Restart opendray | log: `INFO memory ready embedder=http model=nomic-embed-text` |
| 6 | Settings → Server → Memory → **Test embedder** | toast: ✓ |

## Config

```toml
[memory]
backend = "http"

[memory.http]
base_url   = "http://localhost:11434/v1"
model      = "nomic-embed-text"
api_key    = ""                   # blank for Ollama
dimensions = 0                    # 0 = autodetect (768 for nomic-embed-text)
```

## Model choices

| Model | dim | Best for |
|---|---|---|
| `nomic-embed-text` | 768 | recommended default |
| `mxbai-embed-large` | 1024 | higher recall, slower |
| `bge-m3` | 1024 | multilingual (中文 + EN) |
| `snowflake-arctic-embed` | 1024 | best on technical text |

## Capabilities

| feature | supported |
|---|---|
| Local CPU | ✓ |
| Local GPU | ✓ (Ollama auto-detects) |
| No API key | ✓ |
| Cross-CLI memory | ✓ |
| Hot model swap | ✗ (restart opendray + reembed) |

## Errors

| code | http | cause | fix |
|---|---|---|---|
| `embedder_unavailable` | 503 | Ollama not running | `ollama serve` |
| `embedder_model_not_found` | 404 | model not pulled | `ollama pull <model>` |
| `embedder_dim_mismatch` | 500 | switched model w/o reembed | Memory page → **Migrate** banner |
