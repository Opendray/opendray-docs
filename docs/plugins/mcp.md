---
kind: capability
title: MCP servers
tldr: Register MCP servers (stdio command or HTTP URL). opendray renders per-session mcp.json with auto-attached entries (e.g. opendray-memory) + your registered servers. Claude/Codex/Gemini consume per their supportsMcp flag.
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

> **tldr:** Register MCP servers (stdio command or HTTP URL). opendray renders per-session `mcp.json` with auto-attached entries (e.g. `opendray-memory`) + your registered servers. Claude/Codex/Gemini consume per their `supportsMcp` flag.

## Register an MCP server

### Stdio kind

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

### HTTP kind

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

## Auto-attached servers

| Server | Auto-attached? | Why |
|---|---|---|
| `opendray-memory` | ✓ always | provides `memory_search` / `memory_store` / `memory_list` tools (see [memory/overview](../memory/overview)) |
| your registered servers | ✓ when `enabled: true` + applies_to matches | |

## Per-session `mcp.json`

| Aspect | Value |
|---|---|
| Location | `<runtime>/opendray-sess-<sid>/<provider>-mcp.json` |
| Lifetime | session lifetime; deleted on cleanup |
| Rendered when | session spawn |
| Format | per provider's expected schema |

Example rendered for a Claude session:

```json
{
  "mcpServers": {
    "opendray-memory": {
      "command": "/opt/opendray/bin/mcp-memory",
      "args": ["--api-key", "od_live_xxx"]
    },
    "fs": {
      "command": "/usr/local/bin/mcp-fs",
      "args": ["--root", "/Users/me/projects"]
    },
    "weather": {
      "type": "http",
      "url": "https://mcp-weather.local",
      "headers": { "Authorization": "Bearer wkey_xxx" }
    }
  }
}
```

## Provider support

| Provider | `supportsMcp` | Notes |
|---|---|---|
| `claude` | ✓ | full MCP support |
| `codex` | ✓ | OpenAI MCP impl |
| `gemini` | ✗ | currently no MCP wiring |
| `shell` | ✗ | n/a |

## Errors

| code | when | fix |
|---|---|---|
| `mcp_server_id_conflict` | two servers with same id | rename or disable one |
| `mcp_stdio_command_missing` | binary not on PATH | install or absolute path |
| `mcp_http_unreachable` | DNS / TLS error | check URL + network |
| `mcp_api_key_env_missing` | named env var not set | export it before spawning opendray |
| `mcp_provider_unsupported` | provider `supportsMcp=false` | skip server for that provider |
