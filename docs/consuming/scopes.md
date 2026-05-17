---
kind: capability
title: Scopes reference
tldr: Enumerate every scope id, route mapping, and pattern (read / write / send / subscribe). Source of truth — /capabilities/integrations.json.
status: stable
since: v0.1.0
topic: consuming
related: [consuming/authentication, integrations/auth-model]
capability:
  - session:read
  - session:write
  - channel:read
  - channel:send
  - channel:write
  - memory:read
  - memory:write
  - integration:read
  - integration:write
  - event:subscribe:session.*
  - event:subscribe:channel.*
  - event:subscribe:memory.*
x-implementation:
  - internal/auth/scope.go
  - docs/public/capabilities/integrations.json
---

# Scopes reference

> **tldr:** Enumerate every scope id, route mapping, and pattern (read / write / send / subscribe). Source of truth — [/capabilities/integrations.json](/capabilities/integrations.json).

## Scope catalogue

| Scope | Lets the key | Routes |
|---|---|---|
| `session:read` | list / get / tail | `GET /sessions`, `GET /sessions/{id}`, `GET /sessions/{id}/events` |
| `session:write` | spawn / input / terminate | `POST /sessions`, `POST /sessions/{id}/input`, `DELETE /sessions/{id}` |
| `channel:read` | list channels | `GET /channels` |
| `channel:write` | register / edit channels | `POST /channels`, `PUT /channels/{id}` |
| `channel:send` | push message via channel | `POST /channels/{id}/send` |
| `memory:read` | query | `POST /memory/recall`, `POST /memory/list` |
| `memory:write` | write project / global | `POST /memory/store` |
| `integration:read` | list / get integrations | `GET /integrations`, `GET /integrations/{id}` |
| `integration:write` | register / rotate / disable | `POST /integrations`, `POST /integrations/{id}/rotate` |
| `event:subscribe:session.*` | WS subscribe | session topics |
| `event:subscribe:channel.*` | WS subscribe | channel topics |
| `event:subscribe:memory.*` | WS subscribe | memory topics |
| `event:subscribe:notification.*` | WS subscribe | notification topics |
| `event:subscribe:*` | WS subscribe | all event topics |

## Naming patterns

| Pattern | Meaning |
|---|---|
| `<resource>:read` | list + get-by-id |
| `<resource>:write` | create / update / delete |
| `<resource>:send` | side-effect operations (channel send, etc.) |
| `event:subscribe:<topic-prefix>` | WS subscription topic filter |

Wildcards inside `event:subscribe:` follow the topic pattern.
Wildcards inside `<resource>:*` aren't supported — list each scope.

## Minimal sets per use case

| Use case | Minimal scopes |
|---|---|
| dashboard (read-only) | `session:read`, `channel:read`, `memory:read`, `event:subscribe:*` |
| bot that spawns + replies | `session:read`, `session:write`, `event:subscribe:session.*` |
| notification fan-out | `channel:read`, `channel:send` |
| memory enrichment service | `memory:read`, `memory:write` |
| meta-tooling (rotate keys, etc.) | `integration:read`, `integration:write` |

## Errors

| code | http | meaning |
|---|---|---|
| `insufficient_scope` | 403 | route requires a scope your key doesn't have |
| `scope_invalid` | 400 | registered an unknown scope at mint time |
| `scope_pattern_invalid` | 400 | `event:subscribe:` pattern malformed |
