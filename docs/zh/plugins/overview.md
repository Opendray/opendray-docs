---
kind: concept
title: 插件 Plugins — 概览
tldr: 工具扩展,自动注入每个 spawn 的会话。3 种 — Skills(markdown)、MCP servers(stdio/http)、Git host 适配器(GitHub/Gitea/GitLab)。
status: stable
since: v0.1.0
topic: plugins
related: [plugins/skills, plugins/mcp, plugins/git-hosts]
references:
  capabilities: [providers]
x-implementation: [internal/plugins/]
---

# 插件 Plugins — 概览

> **tldr:** 工具扩展,自动注入每个 spawn 的会话。3 种 —— Skills(markdown)、MCP servers(stdio/http)、Git host 适配器(GitHub/Gitea/GitLab)。

## 三种插件

| 种类 | 什么 | 注入为 |
|---|---|---|
| [Skills](./skills) | 可复用的 markdown 程序,Claude 可调用 | 系统 prompt 前缀 |
| [MCP servers](./mcp) | 说 Model Context Protocol 的外部工具 | session 的 `mcp.json` 里的 MCP server 条目 |
| [Git host adapters](./git-hosts) | GitHub / Gitea / GitLab API 包装 | Inspector 的 Git tab + Sessions Git workflow |

## 注册位置

| 种类 | UI |
|---|---|
| Skills | `/plugins` → Skills tab → builtin + vault-based |
| MCP servers | `/plugins` → MCP tab → stdio 命令 或 HTTP URL |
| Git hosts | `/settings/git-hosts` → per-host PAT / OAuth |

## 自动注入

| 种类 | 何时 | 在哪 |
|---|---|---|
| Skills | session spawn | 系统 prompt 前缀 |
| MCP servers | session spawn | 渲染到临时 session 目录的 `mcp.json` |
| Git host | Git tab 打开时 | 从 settings store 读 |

## Per-provider 支持

| Provider | Skills | MCP | Git tab |
|---|---|---|---|
| `claude` | ✓(经系统 prompt) | ✓ | ✓ |
| `codex` | ✓ | ✓ 如 `supportsMcp` | ✓ |
| `gemini` | ✓ | ✗ | ✓ |
| `shell` | ✗ | ✗ | ✓ |

![Plugins 页](/tutorial/plugins-layout.png)
