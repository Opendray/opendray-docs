---
kind: concept
title: Memory — 快速上手
tldr: 记忆默认开启 — 无 flag、无服务、无 API key。spawn 任意会话 → opendray 自动 attach memory MCP server → agent 可 search/store。在 Memory 页(🧠 侧栏,快捷键 g m)验证。
status: stable
since: v0.1.0
topic: memory
related:
  - memory/overview
  - memory/scopes
  - memory/configuration
  - memory/troubleshooting
references:
  capabilities: [memory]
x-implementation:
  - internal/memory/
---

# Memory — 快速上手

> **tldr:** 记忆默认开启 —— 无 flag、无服务、无 API key。spawn 任意会话 → opendray 自动 attach memory MCP server → agent 可 search/store。在 **Memory** 页(🧠 侧栏,快捷键 `g m`)验证。

## 不需要做什么

| ✗ 不需要 |
|---|
| 装 qdrant / chromadb |
| 跑 mem0 子进程 |
| OpenAI / Voyage / Cohere 账号 |
| 任何环境变量 |

## 步骤

| # | 动作 | 验证 |
|---|---|---|
| 1 | `go run ./cmd/opendray serve -config config.toml` | 日志:`INFO memory ready embedder=bm25 dimensions=384` |
| 2 | Sessions → Spawn → 选 provider + cwd | per-session `mcp.json` 含 `opendray-memory` |
| 3 | Claude 会话:`me: 我前端常用 vue 和 react` | Claude 调 `memory_store(...)` 或写 `.claude/.../memory/...md`(mirror 拾起) |
| 4 | 打开 **Memory** 页(🧠 侧栏) | 状态徽章 `bm25 · 384-dim · enabled`;搜 "vue" 返回该行 |
| 5 | 同 cwd 起 Codex → `me: 我用什么前端框架?` | Codex 调 `memory_search` → 返回 vue 事实 |

## 两个 UI 页面,故意分开

| 页面 | 用途 |
|---|---|
| **Settings → Server → Memory** | 配置草稿 — embedder 选择、port、dim、需要重启的字段。**Test embedder** 在这。 |
| **Memory**(侧栏 🧠) | 运行时检视 — 浏览、搜索、编辑、删除实际行 |

## 没在做什么

| ✗ 不在范围 |
|---|
| Agent 响应过 opendray(只有它的 tool 调用) |
| 读 stdout 取记忆(没东西从对话里扒) |
| 其他操作员看到你的记忆(`scope_key` 是你的 cwd,他们的不同) |

## 排错速查

| 症状 | 首检 |
|---|---|
| Agent 从不调记忆工具 | 系统提示加入后才 spawn?重启 opendray + session |
| `tool error: 401 unauthorized` | mcp.json 里 API key 过期 — 重启 session(会重渲染) |
| 搜索 0 命中 | BM25 = 精确 token;用 stored text 里的字面词 |
| `connection refused` 来自 mcp-memory | gateway 崩了 — `tail -f /tmp/opendray.log` |

深入:[Troubleshooting](./troubleshooting)。
