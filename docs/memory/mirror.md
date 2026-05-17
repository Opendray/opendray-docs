---
kind: capability
title: Claude local-memory mirror
tldr: opendray reads Claude's local memory markdown files on every spawn and ingests them into pgvector as project-scoped rows so Codex / Gemini can search them.
status: stable
since: v0.1.0
topic: memory
related:
  - memory/overview
  - memory/scopes
  - memory/maintenance
capability:
  - markdown-ingestion
  - cross-cli-bridge
  - mtime-dedup
inbound: filesystem-scan
outbound: pgvector
x-implementation:
  - internal/memory/mirror/claude.go
---

# Claude local-memory mirror

> **tldr:** opendray reads Claude's local memory markdown files on every spawn and ingests them into pgvector as project-scoped rows so Codex / Gemini can search them.

## Why it exists

| CLI | Local memory location |
|---|---|
| Claude Code v2.1+ | `~/.claude(-accounts/<acct>)/projects/<encoded-cwd>/memory/*.md` |
| Codex | none |
| Gemini | none |

Without the mirror, Claude's memories are invisible to Codex /
Gemini sessions in the same `cwd`.

## What the mirror scans

For session in `cwd=/Users/x/myproj`:

| Path | Reason |
|---|---|
| `~/.claude/projects/-Users-x-myproj/memory/*.md` | default Claude home |
| `~/.claude-accounts/<account>/projects/-Users-x-myproj/memory/*.md` | every account; deduped via `EvalSymlinks` |

| Skip | Reason |
|---|---|
| `MEMORY.md` | Claude's index file (list of links, not content) |

## Row shape

```json
{
  "id": "mem_…",
  "scope": "project",
  "scope_key": "/Users/x/myproj",
  "text": "<full file contents, frontmatter included>",
  "embedder": "bm25",
  "metadata": {
    "source":       "claude_local_memory",
    "source_path":  "/Users/x/.claude-accounts/.../preference_pnpm.md",
    "source_mtime": "2026-05-04T10:00:36Z",
    "source_hash":  "cb42172e3648cf56"
  },
  "created_at": "…"
}
```

Frontmatter + body both included — BM25 indexes structured fields
(`name`, `description`, `type`) alongside body. Future structured
ingestor can parse them out.

## Trigger

| Event | Behaviour |
|---|---|
| Session spawn (any provider) | walk `cwd` mirror paths → upsert by `(source_path, source_hash)` |
| Subsequent spawns same cwd | mtime + hash dedup → only re-ingest changed files |
| File deleted on disk | row stays (audit trail); manually purge via Memory page |

## Capabilities

| feature | supported |
|---|---|
| Multi-account scan | ✓ via `~/.claude-accounts/` |
| Symlink deduplication | ✓ `EvalSymlinks` |
| mtime + hash dedup | ✓ |
| Frontmatter parse | ✗ (stored as raw text); future enhancement |
| Watch in-flight changes | ✗ (only on spawn) |
| Bidirectional sync (pgvector → markdown) | ✗ |

## Errors

| code | http | cause | fix |
|---|---|---|---|
| `mirror_path_unreadable` | (log warn) | cwd memory dir permission denied | check filesystem perms |
| `mirror_file_invalid_utf8` | (skip + log) | binary content in `.md` | manually clean |
