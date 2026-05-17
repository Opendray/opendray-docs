---
kind: capability
title: LM Studio walkthrough
tldr: LM Studio = GUI alternative to Ollama. Enable its local server, load nomic-embed-text-v1.5, point opendray's [memory.http] at port 1234.
status: stable
since: v0.1.0
topic: memory
related:
  - memory/overview
  - memory/configuration
  - memory/ollama-walkthrough
capability:
  - openai-compat
  - gui-managed-models
inbound: api
outbound: http
x-implementation:
  - internal/memory/embedder/openai_compat/
---

# LM Studio walkthrough

> **tldr:** LM Studio = GUI alternative to Ollama. Enable its local server, load `nomic-embed-text-v1.5`, point opendray's `[memory.http]` at port 1234.

## Setup

| # | Action | Verify |
|---|---|---|
| 1 | Install LM Studio from [lmstudio.ai](https://lmstudio.ai/) | app opens |
| 2 | Search "nomic-embed-text" → download `nomic-embed-text-v1.5` | appears in My Models |
| 3 | Local Server tab → Load model → Start Server (default port 1234) | `curl http://localhost:1234/v1/models` |
| 4 | Edit `config.toml` (below) | `grep memory.http config.toml` |
| 5 | Restart opendray | log: `INFO memory ready embedder=http` |

## Config

```toml
[memory]
backend = "http"

[memory.http]
base_url   = "http://localhost:1234/v1"
model      = "nomic-embed-text-v1.5"
api_key    = ""                       # blank for LM Studio local
dimensions = 0                        # autodetect
```

## When to pick over Ollama

| Concern | LM Studio | Ollama |
|---|---|---|
| GUI for model management | ✓ | ✗ (CLI only) |
| Headless server | ✗ (GUI app) | ✓ |
| Hugging Face browser | ✓ | ✗ |
| Auto-update | ✓ | manual |
| Cross-platform parity | mac / win / linux | mac / linux / win |
| Run as service | extra work | `systemctl enable ollama` |

## Capabilities

| feature | supported |
|---|---|
| OpenAI-compatible API | ✓ |
| GPU acceleration | ✓ (Metal / CUDA / ROCm) |
| Model picker GUI | ✓ |
| Cross-CLI memory | ✓ |

## Errors

| code | cause | fix |
|---|---|---|
| `connection_refused` localhost:1234 | LM Studio server not started | Local Server tab → Start Server |
| `model_not_loaded` | model loaded in GUI but server tab didn't pick it up | Load model again in Local Server tab |
