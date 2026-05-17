---
kind: concept
title: Memory — maintenance
tldr: Three operator concerns — embedder migration (after backend change), conflict resolution (newer-wins by default), cleanup queue (stale / superseded / conflict-flagged rows).
status: stable
since: v0.1.0
topic: memory
related:
  - memory/overview
  - memory/configuration
  - memory-workers/overview
  - project-memory/scanner-and-cleaner
references:
  capabilities: [memory]
x-implementation:
  - internal/memory/cleaner/
  - internal/memconflict/
---

# Memory — maintenance

> **tldr:** Three operator concerns — embedder migration (after backend change), conflict resolution (newer-wins by default), cleanup queue (stale / superseded / conflict-flagged rows).

## Three operator concerns

| Concern | Where | Trigger |
|---|---|---|
| Embedder migration | Memory page → yellow **Migrate** banner | swapped `[memory.backend]` |
| Conflict detection | Memory page → conflicts tab | semantic dup with different value (e.g. "prefer pnpm" vs "prefer npm") |
| Cleanup queue | `/memory/cleanup` | row marked stale / superseded / conflict |

## Migration after backend change

```
[memory]
backend = "bm25"            ← old (384-dim sparse)
↓ change to
backend = "http"            ← new (768-dim dense)
```

Old rows have `embedder = "bm25"`. New search calls use the new
embedder. Hits would mismatch. Memory page shows yellow:

> ⚠ 47 rows on `bm25`. New embedder is `nomic-embed-text` (768-dim).
> [ Migrate ]

Click → background worker re-embeds in batches of 100. Resumable.

## Conflict policy

| Mode | Behaviour |
|---|---|
| `newer-wins` (default) | new write supersedes older row with same scope + similar text |
| `keep-both` | both rows stay; conflict pair flagged for operator review |
| `manual` | new write rejected with `409 conflict_detected`; agent told to ask user |

Config:

```toml
[memory.conflict]
policy = "newer-wins"
similarity_threshold = 0.85   # rows above this are considered duplicates
```

## Cleanup triggers

| Reason | Source | Default action |
|---|---|---|
| `stale` | row unread for N days (default 90) | flag for review |
| `superseded` | newer row replaces it (newer-wins) | auto-delete |
| `conflict` | conflict detected, policy=keep-both | flag, no auto-action |
| `manual` | operator clicks delete | immediate |

## Capabilities

| feature | supported |
|---|---|
| Resumable migration | ✓ batched, can pause |
| Per-scope migration | ✓ |
| Conflict detection at write time | ✓ |
| Auto-delete on supersede | ✓ |
| Bulk export before delete | ✓ (Memory page → export) |
