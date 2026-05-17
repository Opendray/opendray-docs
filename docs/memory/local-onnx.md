---
kind: capability
title: Local ONNX embeddings
tldr: Build with `-tags local_onnx` → embed bge-m3 (1024-dim) locally without HTTP services. Heavier binary (~50MB) but no external dependency at runtime.
status: experimental
since: v0.1.0
topic: memory
related:
  - memory/configuration
  - memory/ollama-walkthrough
  - memory/lmstudio-walkthrough
capability:
  - bge-m3
  - onnx-runtime
  - local-cpu-inference
inbound: api
outbound: pgvector
x-implementation:
  - internal/memory/embedder/onnx/
  - go.mod (build tag)
---

# Local ONNX embeddings

> **tldr:** Build with `-tags local_onnx` → embed bge-m3 (1024-dim) locally without HTTP services. Heavier binary (~50MB) but no external dependency at runtime.

## When to pick

| Scenario | Local ONNX | HTTP backend |
|---|---|---|
| Air-gapped host (no Ollama) | ✓ | ✗ |
| Don't want to manage a second service | ✓ | ✗ |
| Want different models | ✗ | ✓ (Ollama / OpenAI) |
| CPU only | ✓ (slower) | ✓ (depends on backend) |
| Smallest binary | ✗ | ✓ |

## Build

```bash
# Default — no ONNX
go build ./cmd/opendray                       # ~12MB

# With ONNX runtime + bge-m3 weights
go build -tags local_onnx ./cmd/opendray      # ~50MB
```

## Config

```toml
[memory]
backend = "auto"

[memory.local]
model = "bge-m3"   # 1024-dim, multilingual
```

When `local_onnx` build tag is present + `backend = "auto"`, opendray
prefers ONNX over BM25.

## Capabilities

| feature | supported |
|---|---|
| bge-m3 multilingual | ✓ |
| GPU acceleration | ✗ (CPU only currently) |
| Custom model | ✗ — bge-m3 hardcoded |
| Build-tag opt-in | ✓ — default build excludes |
| Cross-CLI memory share | ✓ (same store as other backends) |

## Errors

| code | http | cause | fix |
|---|---|---|---|
| `onnx_not_compiled` | (boot fail) | binary built without `local_onnx` tag | rebuild with tag, or pick different backend |
| `onnx_model_missing` | (boot fail) | weights not embedded | ensure build embeds via `go:embed` |
| `onnx_inference_slow` | (warn) | CPU-only, > 200ms p95 | switch to HTTP backend with GPU host |
