---
kind: capability
title: Memory scopes
tldr: Three scopes — session (scope_key=session_id), project (scope_key=cwd, default), global (no key). Pick based on sharing vs isolation needs.
status: stable
since: v0.1.0
topic: memory
related:
  - memory/overview
  - memory/configuration
capability:
  - scope-session
  - scope-project
  - scope-global
inbound: api
outbound: pgvector
x-implementation:
  - internal/memory/scope.go
---

# Memory scopes

> **tldr:** Three scopes — `session` (scope_key=session_id), `project` (scope_key=cwd, **default**), `global` (no key). Pick based on sharing vs isolation needs.

## The three scopes

| Scope | scope_key | Visibility |
|---|---|---|
| `session` | session id | only the session that wrote it |
| `project` (default) | session's `cwd` | every session in the same `cwd` across CLIs |
| `global` | (none) | every session anywhere |

## When to pick which

| Use `session` for | Use `project` for (default) | Use `global` for |
|---|---|---|
| Throwaway scratchpad | Anything tied to a cwd — pkg manager, build cmds, conventions | Operator identity (Sydney-based, prefers TypeScript) |
| Sensitive context to self-clean | Cross-CLI handoff (Claude → Codex same cwd) | Settings that should follow you everywhere |
| Test isolation | Default for auto-attach | Be careful — visible across unrelated client projects |

## Config schema

```yaml
# All three tools accept an optional scope arg
memory_store(text, scope="project", tags=[])     # default
memory_search(query, scope="project", limit=5)   # default
memory_list(scope="project", limit=20)           # default
```

## Capabilities

| feature | supported | note |
|---|---|---|
| Auto-attach default | `project` | reasonable for cross-CLI handoff |
| Per-call override | ✓ | pass `scope` arg to any tool |
| Cross-scope search | ✗ | one scope per call (rank within-scope) |
| Scope migration | ✓ | UI lets you change a row's scope post-hoc |
| Conflict detection | per-scope | conflicts checked within scope, not across |

## Errors

| code | http | cause | fix |
|---|---|---|---|
| `scope_invalid` | 400 | scope not in {session, project, global} | use one of the three |
| `scope_key_mismatch` | 403 | session tried to read another session's `session`-scoped row | by design — sessions are isolated |
