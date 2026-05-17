---
kind: endpoint
title: REST API reference
tldr: All consumer-facing endpoints. Sessions / channels / memory / integrations. Authoritative source — /openapi.yaml.
status: beta
since: v0.1.0
topic: consuming
related:
  - consuming/overview
  - consuming/authentication
  - consuming/scopes
  - reference/rest
  - reference/overview
operations:
  - operationId: listSessions
    method: GET
    path: /api/v1/sessions
    summary: List sessions visible to caller
    tags: [sessions]
    x-required-scope: session:read
  - operationId: spawnSession
    method: POST
    path: /api/v1/sessions
    summary: Spawn new CLI session
    tags: [sessions]
    x-required-scope: session:write
  - operationId: terminateSession
    method: DELETE
    path: /api/v1/sessions/{id}
    summary: SIGTERM the session
    tags: [sessions]
    x-required-scope: session:write
  - operationId: sendSessionInput
    method: POST
    path: /api/v1/sessions/{id}/input
    summary: Send text to session stdin
    tags: [sessions]
    x-required-scope: session:write
  - operationId: listChannels
    method: GET
    path: /api/v1/channels
    summary: List configured channels
    tags: [channels]
    x-required-scope: channel:read
  - operationId: sendChannelMessage
    method: POST
    path: /api/v1/channels/{id}/send
    summary: Push a message through a channel
    tags: [channels]
    x-required-scope: channel:send
  - operationId: recallMemory
    method: POST
    path: /api/v1/memory/recall
    summary: Ranked memory search
    tags: [memory]
    x-required-scope: memory:read
  - operationId: registerIntegration
    method: POST
    path: /api/v1/integrations
    summary: Register a new external integration
    tags: [integrations]
    x-required-scope: integration:write
  - operationId: rotateIntegrationKey
    method: POST
    path: /api/v1/integrations/{id}/rotate
    summary: Rotate the integration's API key
    tags: [integrations]
    x-required-scope: integration:write
x-implementation:
  - internal/gateway/
  - docs/public/openapi.yaml
---

# REST API reference

> **tldr:** All consumer-facing endpoints. Sessions / channels / memory / integrations. Authoritative source — [/openapi.yaml](/openapi.yaml).

## Quick table

| Method | Path | Scope | Tag |
|---|---|---|---|
| GET | `/api/v1/sessions` | `session:read` | sessions |
| POST | `/api/v1/sessions` | `session:write` | sessions |
| GET | `/api/v1/sessions/{id}` | `session:read` | sessions |
| DELETE | `/api/v1/sessions/{id}` | `session:write` | sessions |
| POST | `/api/v1/sessions/{id}/input` | `session:write` | sessions |
| GET | `/api/v1/sessions/{id}/events?since=<seq>` | `session:read` | sessions |
| GET | `/api/v1/channels` | `channel:read` | channels |
| POST | `/api/v1/channels` | `channel:write` | channels |
| POST | `/api/v1/channels/{id}/send` | `channel:send` | channels |
| POST | `/api/v1/memory/recall` | `memory:read` | memory |
| POST | `/api/v1/memory/store` | `memory:write` | memory |
| GET | `/api/v1/integrations` | `integration:read` | integrations |
| POST | `/api/v1/integrations` | `integration:write` | integrations |
| POST | `/api/v1/integrations/{id}/rotate` | `integration:write` | integrations |
| GET | `/api/v1/integrations/_events` (WS) | `event:subscribe:*` | integrations |
| GET | `/api/v1/proxy/{prefix}/*` | per-route | proxy |
| GET | `/api/v1/health` | (none) | activity |
| GET | `/api/v1/openapi.json` | (none) | meta |

## Pagination

```http
GET /api/v1/sessions?cursor=eyJp...
```

Response:

```json
{
  "data": [ { "id": "..." } ],
  "pagination": { "next_cursor": "eyJp...", "has_more": true }
}
```

Cursors are opaque — don't construct, just pass back.

## Spawn example

```http
POST /api/v1/sessions
Authorization: Bearer od_live_xxx
Content-Type: application/json

{
  "provider": "claude",
  "cwd": "/home/dev/proj",
  "name": "refactor",
  "claude_account_id": "work"
}
```

```json
HTTP/1.1 201 Created
{
  "id": "s_42",
  "provider": "claude",
  "cwd": "/home/dev/proj",
  "state": "running",
  "claude_account_id": "work",
  "created_at": "2026-05-17T10:24:00Z"
}
```

## Rate limits

Default per integration key — see [reference/rate-limits](../reference/rate-limits).
Per-endpoint overrides:

| Endpoint | Override |
|---|---|
| `POST /api/v1/sessions` | 2 req/s (each forks process) |
| `POST /api/v1/integrations` | 0.1 req/s |
| `POST /api/v1/channels/{id}/send` | 5 req/s (upstream platforms rate-limit too) |

## Errors

Common — see [error-handling](./error-handling) for the envelope shape.

For the full spec including request / response schemas, fetch:

```bash
curl http://localhost:8770/api/v1/openapi.json
```
