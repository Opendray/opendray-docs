---
kind: capability
title: LM Studio 实操
tldr: LM Studio = Ollama 的 GUI 替代品。开本地 server、加载 nomic-embed-text-v1.5、opendray [memory.http] 指向 1234 端口。
status: stable
since: v0.1.0
topic: memory
related: [memory/overview, memory/configuration, memory/ollama-walkthrough]
capability: [openai-compat, gui-managed-models]
inbound: api
outbound: http
x-implementation: [internal/memory/embedder/openai_compat/]
---

# LM Studio 实操

> **tldr:** LM Studio = Ollama 的 GUI 替代品。开本地 server、加载 `nomic-embed-text-v1.5`、opendray `[memory.http]` 指向 1234 端口。

## Setup

| # | 动作 | 验证 |
|---|---|---|
| 1 | 从 [lmstudio.ai](https://lmstudio.ai/) 装 LM Studio | app 打开 |
| 2 | 搜 "nomic-embed-text" → 下 `nomic-embed-text-v1.5` | 出现在 My Models |
| 3 | Local Server tab → Load model → Start Server(默认 1234 端口) | `curl http://localhost:1234/v1/models` |
| 4 | 编辑 `config.toml`(下) | `grep memory.http config.toml` |
| 5 | 重启 opendray | 日志:`INFO memory ready embedder=http` |

## Config

```toml
[memory]
backend = "http"

[memory.http]
base_url   = "http://localhost:1234/v1"
model      = "nomic-embed-text-v1.5"
api_key    = ""                       # LM Studio 本地留空
dimensions = 0                        # 自动检测
```

## 何时选 LM Studio 而非 Ollama

| 关心点 | LM Studio | Ollama |
|---|---|---|
| 管模型的 GUI | ✓ | ✗(仅 CLI) |
| 无头 server | ✗(GUI app) | ✓ |
| Hugging Face 浏览器 | ✓ | ✗ |
| 自动更新 | ✓ | 手动 |
| 跨平台对等 | mac / win / linux | mac / linux / win |
| 跑成 service | 多点活 | `systemctl enable ollama` |

## Errors

| code | 原因 | 修复 |
|---|---|---|
| `connection_refused` localhost:1234 | LM Studio server 没启动 | Local Server tab → Start Server |
| `model_not_loaded` | GUI 加载了但 server tab 没拾起 | 在 Local Server tab 重新 Load model |
