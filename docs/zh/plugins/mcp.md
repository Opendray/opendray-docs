---
kind: capability
title: MCP servers
tldr: 注册 MCP server(stdio 命令或 HTTP URL)。opendray 渲染 per-session mcp.json,自动 attach(如 opendray-memory)+ 你注册的。Claude/Codex/Gemini 按各自 supportsMcp flag 消费。
status: stable
since: v0.1.0
topic: plugins
related: [plugins/overview, memory/overview]
capability: [stdio-mcp, http-mcp, auto-attach-opendray-memory, per-session-mcp-json]
inbound: registry
outbound: subprocess-stdio / http
x-implementation: [internal/mcp/]
---

# MCP servers

> **tldr:** 注册 MCP server(stdio 命令或 HTTP URL)。opendray 渲染 per-session `mcp.json`,自动 attach(如 `opendray-memory`)+ 你注册的。Claude/Codex/Gemini 按各自 `supportsMcp` flag 消费。

## 注册 MCP server

### Stdio 类型

```yaml
id:          fs
name:        Filesystem tools
type:        stdio
command:     /usr/local/bin/mcp-fs
args:        ["--root", "/Users/me/projects"]
env:
  LOG_LEVEL: info
applies_to:
  providers:  [claude]
  cwd_glob:   "/Users/me/projects/**"
enabled:     true
```

### HTTP 类型

```yaml
id:          weather
name:        Weather lookup
type:        http
url:         https://mcp-weather.local
api_key_env: WEATHER_MCP_API_KEY
applies_to:
  providers:  [claude, codex]
enabled:     true
```

## 自动 attach 的 server

| Server | 自动 attach? | 为什么 |
|---|---|---|
| `opendray-memory` | ✓ 始终 | 提供 `memory_search` / `memory_store` / `memory_list`(见 [memory/overview](../memory/overview)) |
| 你注册的 | ✓ `enabled: true` + applies_to 匹配时 | |

## Per-session `mcp.json`

| 方面 | 值 |
|---|---|
| 位置 | `<runtime>/opendray-sess-<sid>/<provider>-mcp.json` |
| 生命周期 | session 生命周期;清理时删 |
| 何时渲染 | session spawn |
| 格式 | per provider 期望的 schema |

## Provider 支持

| Provider | `supportsMcp` | 备注 |
|---|---|---|
| `claude` | ✓ | 完整 MCP |
| `codex` | ✓ | OpenAI MCP |
| `gemini` | ✗ | 当前无 MCP 接线 |
| `shell` | ✗ | n/a |
