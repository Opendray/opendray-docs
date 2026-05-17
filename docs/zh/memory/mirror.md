---
kind: capability
title: Claude 本地记忆镜像
tldr: 每个 spawn 时 opendray 读 Claude 本地 memory markdown,以 project-scope 行写入 pgvector,让 Codex / Gemini 也能搜到。
status: stable
since: v0.1.0
topic: memory
related: [memory/overview, memory/scopes, memory/maintenance]
capability: [markdown-ingestion, cross-cli-bridge, mtime-dedup]
inbound: filesystem-scan
outbound: pgvector
x-implementation: [internal/memory/mirror/claude.go]
---

# Claude 本地记忆镜像

> **tldr:** 每个 spawn 时 opendray 读 Claude 本地 memory markdown,以 project-scope 行写入 pgvector,让 Codex / Gemini 也能搜到。

## 为什么存在

| CLI | 本地 memory 位置 |
|---|---|
| Claude Code v2.1+ | `~/.claude(-accounts/<acct>)/projects/<encoded-cwd>/memory/*.md` |
| Codex | 无 |
| Gemini | 无 |

没 mirror 的话,Claude 的记忆对同 cwd 的 Codex / Gemini 不可见。

## 镜像扫描路径

cwd=`/Users/x/myproj` 时:

| 路径 | 原因 |
|---|---|
| `~/.claude/projects/-Users-x-myproj/memory/*.md` | 默认 Claude home |
| `~/.claude-accounts/<account>/projects/-Users-x-myproj/memory/*.md` | 每账号;`EvalSymlinks` 去重 |

| 跳过 | 原因 |
|---|---|
| `MEMORY.md` | Claude 的索引文件(链接列表,不是内容) |

## 行结构

```json
{
  "id": "mem_…",
  "scope": "project",
  "scope_key": "/Users/x/myproj",
  "text": "<完整文件内容,含 frontmatter>",
  "embedder": "bm25",
  "metadata": {
    "source": "claude_local_memory",
    "source_path": "/Users/x/.claude-accounts/.../preference_pnpm.md",
    "source_mtime": "2026-05-04T10:00:36Z",
    "source_hash": "cb42172e3648cf56"
  }
}
```

## 触发

| 事件 | 行为 |
|---|---|
| 任意 provider spawn | 走 cwd mirror 路径 → 按 `(source_path, source_hash)` upsert |
| 同 cwd 后续 spawn | mtime + hash 去重 → 只重摄入变更文件 |
| 磁盘文件删除 | 行保留(审计);用 Memory 页手动清理 |

## Errors

| code | http | 原因 | 修复 |
|---|---|---|---|
| `mirror_path_unreadable` | (log warn) | cwd memory 目录权限拒绝 | 检查文件系统权限 |
| `mirror_file_invalid_utf8` | (skip + log) | `.md` 里有二进制 | 手动清理 |
