---
kind: concept
title: Memory — 概览
tldr: 跨 CLI 持久化记忆层。opendray 在每个会话自动 attach 一个 memory MCP server。同 cwd 的 Claude / Codex / Gemini 互相看到对方的事实。默认后端 BM25(纯 Go,无模型,无 API key)。
status: stable
since: v0.1.0
topic: memory
related:
  - memory/quickstart
  - memory/scopes
  - memory/configuration
  - memory/mirror
  - memory/troubleshooting
  - ambient-memory/overview
  - project-memory/overview
  - memory-workers/overview
references:
  capabilities: [memory]
x-implementation:
  - internal/memory/
  - internal/memory/store_pgvector.go
  - internal/memory/embedder/
---

# Memory — 概览

> **tldr:** 跨 CLI 持久化记忆层。opendray 在每个会话自动 attach 一个 memory MCP server。同 cwd 的 Claude / Codex / Gemini 互相看到对方的事实。默认后端 BM25(纯 Go,无模型,无 API key)。

## 解决什么问题

每个 CLI 各有私有 store,不通气:

| CLI | 私有 store |
|---|---|
| Claude Code v2.1+ | `<project>/.claude/.../memory/`(markdown) |
| Codex | `~/.codex/sessions/`(rollouts) |
| Gemini | `~/.gemini/tmp/<project>/`(logs) |

跟 Claude 说"我用 pnpm" → 下次 Codex 在同项目里完全不知道。opendray
的 memory 子系统是三家共读共写的 **共享层**。

## 架构

```
                          opendray gateway
                          ┌────────────────────────┐
   Claude/Codex/Gemini    │                         │
   (agent 进程)            │  /api/v1/memory/*       │
        │                 │       │                 │
        │ MCP             │       ▼                 │
   ┌────┴───────┐         │  Embedder(BM25 / ONNX / openai-compat) │
   │ opendray   │ HTTP    │       │                 │
   │ mcp-memory │─────────┤       ▼                 │
   │ 子进程     │         │  pgvector 存储          │
   └────────────┘         │       │                 │
                          └───────┼─────────────────┘
                                  ▼
                          PostgreSQL(vector 扩展可选)
```

## 每个 spawn 自动 attach 的 MCP 工具

| 工具 | 用途 | 返回 |
|---|---|---|
| `memory_search(query, scope?, limit?)` | 找跟 query 相关的事实 | 带 score 的排序片段 |
| `memory_store(text, scope?, tags?)` | 持久化一条事实 | id |
| `memory_list(scope?, limit?)` | 倒出最近事实 | 数组 |

## 默认值

| 关心点 | 默认 | 覆盖位置 |
|---|---|---|
| Backend | BM25(纯 Go,~384 维稀疏) | [configuration](./configuration) |
| Store | opendray 自带 Postgres 上的 pgvector | `config.toml` |
| Scope | project(同 cwd 共享) | [scopes](./scopes) |
| 镜像 Claude markdown | 启用 | [mirror](./mirror) |
| session.end 时自动 capture | 启用 | [ambient-memory](../ambient-memory/overview) |

## 跨 CLI 演练

| # | 动作 | 发生什么 |
|---|---|---|
| 1 | Claude 会话说"记住我用 pnpm" | Claude 直接调 `memory_store` 或写 `.claude/.../memory/preference_pnpm.md` |
| 2 | opendray 摄入 | mirror 读 markdown → 写 pgvector,scope=`project:<cwd>` |
| 3 | 同 cwd 起 Codex 会话,问"我用什么包管理器?" | Codex 调 `memory_search("package manager")` |
| 4 | 返回 pnpm 事实 | 排名第一 |

## 何时读什么

| 主题 | 读 |
|---|---|
| 快速上手 + agent 工具调用 | [Quickstart](./quickstart) |
| session vs project vs global scope | [Scopes](./scopes) |
| Settings UI + embedder 选择 + HTTP 后端 | [Configuration](./configuration) |
| Claude 本地 memory 镜像(进阶) | [Mirror](./mirror) |
| 常见错误 + 恢复 | [Troubleshooting](./troubleshooting) |
| ONNX 本地嵌入 | [local-onnx](./local-onnx) |
| Ollama 演练 | [ollama-walkthrough](./ollama-walkthrough) |
| LM Studio 演练 | [lmstudio-walkthrough](./lmstudio-walkthrough) |
| 清理、冲突检测、摘要 | [maintenance](./maintenance) |

第三方 app 直接调 `/api/v1/memory/*`,见
[接入 opendray → REST API](../consuming/rest-api)。
