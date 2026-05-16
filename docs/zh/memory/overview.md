# 记忆 — 概览

opendray 内置了**持久化记忆层**，让你启动的 agent(Claude / Codex / Gemini)可以跨会话、跨 CLI 记住信息，无需外部服务或额外的 API key。

## 它解决什么问题

每个 agent CLI 都有自己的私有记忆:

- Claude Code v2.1+ 把 markdown 写到 `<project>/.claude/.../memory/`
- Codex 把 rollout 存到 `~/.codex/sessions/`
- Gemini 日志写到 `~/.gemini/tmp/<project>/`

它们之间互不相通。如果你告诉 Claude "我偏好 pnpm",同一项目下的下一个 Codex 或 Gemini 会话并不知道。opendray 的记忆子系统就是它们都读写的**共享**层。

## 工作原理

```
                          opendray gateway
                          ┌────────────────────────┐
   Claude/Codex/Gemini    │                         │
   (agent process)        │  /api/v1/memory/*       │
        │                 │       │                 │
        │ MCP             │       ▼                 │
   ┌────┴───────┐         │  Embedder (BM25 / ONNX) │
   │ opendray   │ HTTP    │       │                 │
   │ mcp-memory │─────────┤       ▼                 │
   │ subprocess │         │  pgvector store         │
   └────────────┘         │       │                 │
                          └───────┼─────────────────┘
                                  ▼
                          PostgreSQL
```

每个启动的会话都会自动把 `opendray-memory` MCP server 挂到它的 `mcp.json` 里。agent 的工具列表会多出三项:

- `memory_search(query)` — 找到与查询相关的事实
- `memory_store(text)` — 持久化一条事实
- `memory_list(limit)` — 列出最近的事实

## 默认行为

- **后端**: BM25(纯 Go 实现的关键字检索,约 384 维稀疏向量)。无模型文件、无 GPU、无 API key。
- **存储**: opendray 现有 PostgreSQL 上的 pgvector。
- **作用域**: 项目级 — 同一 `cwd` 下的每个会话共享记忆,不同项目相互隔离。
- **镜像**: 每次启动会话时,opendray 会读取 Claude 写入的 `~/.claude-accounts/.../<encoded-cwd>/memory/*.md` 文件并摄取,这样跨 CLI 搜索也能拿到。

## 你会在什么时候看到它生效

1. 打开 Claude 会话,说"记住我偏好 pnpm"
2. 要么 Claude 直接调用 `opendray-memory.memory_store(...)`,要么它写入本地 `.claude/.../memory/preference_pnpm.md` — 无论哪种,opendray 最终都会把这条事实写入 pgvector。
3. 在同一 `cwd` 下打开 Codex 会话,问"我偏好哪个包管理器?"
4. Codex 调用 `opendray-memory.memory_search("package manager")`,拿回 pnpm 这条事实。

## 继续阅读

| 主题 | 章节 |
|---|---|
| 快速入门、agent 工具调用 | Quickstart |
| 会话 vs 项目 vs 全局作用域 | Scopes |
| 设置 UI、embedder 选择、HTTP 后端 | Configuration |
| Claude 本地记忆镜像、进阶 | Mirror |
| 常见错误与恢复 | Troubleshooting |

第三方开发者视角(从你自己的应用直接调用 `/memory/*`)请看 [Consuming opendray → REST API](#consuming-rest-api)。
