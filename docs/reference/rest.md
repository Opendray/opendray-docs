---
kind: endpoint
title: REST endpoints
tldr: Synchronous HTTP API for sessions, channels, providers, memory, integrations. Auth via Bearer key in Authorization header. Authoritative source — /openapi.yaml.
status: beta
since: v0.1.0
topic: reference
related:
  - reference/overview
  - reference/websocket
  - reference/errors
  - reference/rate-limits
  - consuming/rest-api
x-implementation:
  - internal/gateway/
  - docs/public/openapi.yaml
---

# REST endpoints <Badge type="beta">Beta</Badge>

> **tldr:** Synchronous HTTP API for managing sessions, channels, providers, memory, and integration keys. Auth via Bearer key. Authoritative source — [/openapi.yaml](/openapi.yaml).

Synchronous HTTP API for managing sessions, channels, providers,
memory, and integration keys.

<Callout type="info">
This page is the *catalogue*. For end-to-end usage examples (auth,
SDK setup, error handling) see
[Consuming opendray → Quickstart](/consuming/quickstart).
</Callout>

## Sessions

<Tabs>
<Tab label="List" id="sess-list">

```http
GET /api/v1/sessions
Authorization: Bearer od_live_xxx
```

Returns paginated sessions visible to the key's scope.

```json
{
  "data": [
    {
      "id": "s_42",
      "provider": "claude",
      "cwd": "/home/dev/proj",
      "state": "idle",
      "created_at": "2026-05-01T10:24:00Z"
    }
  ],
  "pagination": { "next_cursor": null, "has_more": false }
}
```

</Tab>
<Tab label="Create" id="sess-create">

```http
POST /api/v1/sessions
Authorization: Bearer od_live_xxx
Content-Type: application/json

{
  "provider": "claude",
  "cwd": "/home/dev/proj",
  "channel_id": "ch_telegram_main"
}
```

Returns `201 Created` with the new session object.

</Tab>
<Tab label="Send input" id="sess-input">

```http
POST /api/v1/sessions/:id/input
Authorization: Bearer od_live_xxx
Content-Type: application/json

{
  "text": "review src/auth/login.ts"
}
```

The text is appended to the session's stdin. Use the
[output WebSocket](/reference/websocket) to receive the response.

</Tab>
<Tab label="Terminate" id="sess-end">

```http
DELETE /api/v1/sessions/:id
Authorization: Bearer od_live_xxx
```

Sends `SIGTERM` to the underlying process and detaches all viewers.

</Tab>
</Tabs>

## Channels

<Tabs>
<Tab label="List" id="ch-list">

```http
GET /api/v1/channels
```

Returns every configured channel and its current connection state.

</Tab>
<Tab label="Send" id="ch-send">

```http
POST /api/v1/channels/:id/send
Content-Type: application/json

{
  "text": "Build finished — ready for review",
  "session_ref": "s_42"
}
```

Pushes a message through the channel. Useful for ad-hoc notifications
from external systems.

</Tab>
</Tabs>

## Memory

```http
POST /api/v1/memory/recall
Content-Type: application/json

{
  "query": "how did we handle JWT refresh in payments",
  "scope": ["user", "project:payments"],
  "limit": 5
}
```

Returns ranked snippets with source attribution and a confidence score.
See [Memory → Quickstart](/memory/quickstart) for the conceptual model.

## Integration keys

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/keys` | list keys (without secret) |
| `POST` | `/api/v1/keys` | mint a new key with explicit scopes |
| `POST` | `/api/v1/keys/:id/rotate` | issue a successor key, grace-period the old |
| `DELETE` | `/api/v1/keys/:id` | revoke immediately |

See [Key rotation](/consuming/key-rotation) for the recommended
zero-downtime workflow.

## Status / health

```http
GET /api/v1/health
```

Returns `{ "status": "ok", "version": "0.1.0", "uptime_s": 12345 }`.
Suitable for liveness probes.

<Callout type="tip">
This page lists the **stable shape**. The full machine-readable
OpenAPI document lives at
`http://localhost:8651/api/v1/openapi.json` on every running
instance — feed it into your codegen of choice.
</Callout>
