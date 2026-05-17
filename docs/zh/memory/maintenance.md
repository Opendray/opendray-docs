---
kind: concept
title: 记忆 — 维护
tldr: 三件运维事 — embedder 迁移(切换后端后)、冲突解析(默认 newer-wins)、清理队列(stale / superseded / conflict 行)。
status: stable
since: v0.1.0
topic: memory
related: [memory/overview, memory/configuration, memory-workers/overview, project-memory/scanner-and-cleaner]
references:
  capabilities: [memory]
x-implementation: [internal/memory/cleaner/, internal/memconflict/]
---

# 记忆 — 维护

> **tldr:** 三件运维事 —— embedder 迁移(切换后端后)、冲突解析(默认 `newer-wins`)、清理队列(stale / superseded / conflict 行)。

## 三件运维事

| 关心点 | 位置 | 触发 |
|---|---|---|
| Embedder 迁移 | Memory 页 → 黄色 **Migrate** banner | 改了 `[memory.backend]` |
| 冲突检测 | Memory 页 → conflicts tab | 同 scope 语义重复但值不同(如 "用 pnpm" vs "用 npm") |
| 清理队列 | `/memory/cleanup` | 行标 stale / superseded / conflict |

## 后端切换后迁移

旧行 `embedder = "bm25"`。新搜索调用新 embedder。命中 mismatch。
Memory 页显示黄色:

> ⚠ 47 行在 `bm25`。新 embedder 是 `nomic-embed-text`(768 维)。
> [ Migrate ]

点击 → 后台 worker 100 一批重 embed。可恢复。

## 冲突策略

| 模式 | 行为 |
|---|---|
| `newer-wins`(默认) | 新写覆盖同 scope + 相似 text 的老行 |
| `keep-both` | 两行都留;冲突对待运维 review |
| `manual` | 新写返 `409 conflict_detected`;agent 被告知问用户 |

```toml
[memory.conflict]
policy = "newer-wins"
similarity_threshold = 0.85
```

## 清理触发

| 原因 | 源 | 默认行为 |
|---|---|---|
| `stale` | 行 N 天未读(默认 90) | 标记 review |
| `superseded` | 新行替代(newer-wins) | 自动删 |
| `conflict` | 检测到,policy=keep-both | 标记,不自动操作 |
| `manual` | 运维点删 | 立即 |
