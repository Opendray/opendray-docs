---
kind: capability
title: 本地 ONNX 嵌入
tldr: 用 -tags local_onnx 编译 → 本地嵌入 bge-m3(1024 维),不需要 HTTP 服务。二进制更大(~50MB)但运行时无外部依赖。
status: experimental
since: v0.1.0
topic: memory
related: [memory/configuration, memory/ollama-walkthrough, memory/lmstudio-walkthrough]
capability: [bge-m3, onnx-runtime, local-cpu-inference]
inbound: api
outbound: pgvector
x-implementation: [internal/memory/embedder/onnx/, go.mod]
---

# 本地 ONNX 嵌入

> **tldr:** 用 `-tags local_onnx` 编译 → 本地嵌入 bge-m3(1024 维),不需要 HTTP 服务。二进制更大(~50MB)但运行时无外部依赖。

## 何时选

| 场景 | 本地 ONNX | HTTP 后端 |
|---|---|---|
| 完全离网(没 Ollama) | ✓ | ✗ |
| 不想管第二个服务 | ✓ | ✗ |
| 想换不同模型 | ✗ | ✓ |
| 仅 CPU | ✓(慢) | ✓(看后端) |
| 二进制最小 | ✗ | ✓ |

## Build

```bash
# 默认 — 不含 ONNX
go build ./cmd/opendray                       # ~12MB

# 含 ONNX runtime + bge-m3 权重
go build -tags local_onnx ./cmd/opendray      # ~50MB
```

## Config

```toml
[memory]
backend = "auto"

[memory.local]
model = "bge-m3"   # 1024 维,多语言
```

`local_onnx` build tag 存在 + `backend = "auto"` 时,opendray 优先
ONNX 而非 BM25。

## Capabilities

| 特性 | 支持 |
|---|---|
| bge-m3 多语言 | ✓ |
| GPU 加速 | ✗(当前仅 CPU) |
| 自定义模型 | ✗ — bge-m3 硬编码 |
| Build-tag opt-in | ✓ — 默认 build 不含 |

## Errors

| code | http | 原因 | 修复 |
|---|---|---|---|
| `onnx_not_compiled` | (boot fail) | 没用 `local_onnx` tag 编译 | 用 tag 重 build 或换后端 |
| `onnx_model_missing` | (boot fail) | 权重未嵌入 | 确保 build 通过 `go:embed` 嵌入 |
| `onnx_inference_slow` | (warn) | 仅 CPU,p95 > 200ms | 切 HTTP 后端 + GPU 主机 |
