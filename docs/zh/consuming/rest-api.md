---
kind: endpoint
title: REST API 参考
tldr: 所有面向消费方的端点。Sessions / channels / memory / integrations。权威源 — /openapi.yaml。
status: beta
since: v0.1.0
topic: consuming
related: [consuming/overview, consuming/authentication, consuming/scopes, reference/rest, reference/overview]
operations:
  - operationId: spawnSession
    method: POST
    path: /api/v1/sessions
    summary: Spawn new CLI session
    tags: [sessions]
    x-required-scope: session:write
x-implementation: [internal/gateway/, docs/public/openapi.yaml]
---

# REST API 参考

> **tldr:** 所有面向消费方的端点。Sessions / channels / memory / integrations。权威源 —— [/openapi.yaml](/openapi.yaml)。

## 快速表

| 方法 | 路径 | Scope | Tag |
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
| GET | `/api/v1/integrations/_events`(WS) | `event:subscribe:*` | integrations |
| GET | `/api/v1/proxy/{prefix}/*` | per-route | proxy |
| GET | `/api/v1/health` | (无) | activity |
| GET | `/api/v1/openapi.json` | (无) | meta |

## 分页

```http
GET /api/v1/sessions?cursor=eyJp...
```

```json
{
  "data": [ { "id": "..." } ],
  "pagination": { "next_cursor": "eyJp...", "has_more": true }
}
```

游标不透明 —— 不要自己拼。

## Spawn 示例

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
  "claude_account_id": "work"
}
```

## 限流

默认 per 集成 key —— 见 [reference/rate-limits](../reference/rate-limits)。
Per-端点 覆盖:

| 端点 | 覆盖 |
|---|---|
| `POST /api/v1/sessions` | 2 req/s(每个 fork 进程) |
| `POST /api/v1/integrations` | 0.1 req/s |
| `POST /api/v1/channels/{id}/send` | 5 req/s |

完整 spec(含 req/res schema)拉:

```bash
curl http://localhost:8770/api/v1/openapi.json
```
