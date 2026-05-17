---
kind: capability
title: 记忆 scope
tldr: 三种 scope — session(scope_key=session_id)、project(scope_key=cwd,默认)、global(无 key)。按共享 vs 隔离需求选。
status: stable
since: v0.1.0
topic: memory
related: [memory/overview, memory/configuration]
capability: [scope-session, scope-project, scope-global]
inbound: api
outbound: pgvector
x-implementation: [internal/memory/scope.go]
---

# 记忆 scope

> **tldr:** 三种 scope —— `session`(scope_key=session_id)、`project`(scope_key=cwd,**默认**)、`global`(无 key)。按共享 vs 隔离需求选。

## 三种 scope

| Scope | scope_key | 可见性 |
|---|---|---|
| `session` | session id | 只有写的那个 session |
| `project`(默认) | session 的 `cwd` | 同 cwd 所有 session,跨 CLI |
| `global` | (无) | 任何地方任何 session |

## 何时选哪个

| `session` 用于 | `project` 用于(默认) | `global` 用于 |
|---|---|---|
| 一次性 scratchpad | 跟 cwd 绑(包管理器、build 命令、约定) | 操作员身份(Sydney、偏好 TypeScript) |
| 自清理敏感上下文 | 跨 CLI 接力(Claude → Codex 同 cwd) | 跟着你走的设置 |
| 测试隔离 | 自动 attach 的默认 | 小心 — 跨无关项目可见 |

## Config

```yaml
# 三个工具都接受可选 scope 参数
memory_store(text, scope="project", tags=[])
memory_search(query, scope="project", limit=5)
memory_list(scope="project", limit=20)
```

## Errors

| code | http | 原因 | 修复 |
|---|---|---|---|
| `scope_invalid` | 400 | 不在 {session, project, global} | 用三个之一 |
| `scope_key_mismatch` | 403 | session 试读其他 session 的 session-scope 行 | 故意为之 |
