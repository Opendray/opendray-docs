---
kind: endpoint
title: Events WebSocket
tldr: /api/v1/integrations/_events streams session/channel/memory events. Auth via Bearer integration key. Topic filter on connect. 25s keepalive.
status: stable
since: v0.1.0
topic: integrations
related: [integrations/overview, integrations/auth-model, activity/topics-catalogue]
operations:
  - operationId: integrationsEventsStream
    method: GET
    path: /api/v1/integrations/_events
    summary: WebSocket event stream
    tags: [integrations]
    x-protocol: websocket
    x-required-scope: 'event:subscribe:*'
x-implementation:
  - internal/integration/events.go
---

# Events WebSocket

> **tldr:** `/api/v1/integrations/_events` streams session/channel/memory events. Auth via Bearer integration key. Topic filter on connect. 25s keepalive.

## Connect

```ts
const ws = new WebSocket('ws://localhost:8770/api/v1/integrations/_events', [], {
  headers: { Authorization: 'Bearer od_live_xxx' },
})

ws.addEventListener('open', () => {
  ws.send(JSON.stringify({
    type: 'subscribe',
    topics: ['session.s_42.output', 'channel.*.delivery']
  }))
})
```

## Message envelope

```json
{
  "topic": "session.s_42.output",
  "ts": "2026-05-17T10:32:18.421Z",
  "payload": {
    "stream": "stdout",
    "data": "Reading src/auth/login.ts...\n"
  }
}
```

## Topic patterns

| Pattern | Subscribes to |
|---|---|
| `session.s_42.output` | exact |
| `session.*.output` | all sessions' output |
| `session.*` | every session event |
| `channel.*.delivery` | every channel delivery receipt |
| `memory.*` | all memory events |

Topics enforced against scope: `event:subscribe:session.*` allows
subscribing to `session.*` but rejects `channel.*`.

## Lifecycle

| Message | Direction | Use |
|---|---|---|
| `{"type":"subscribe","topics":[...]}` | client → server | add topics (additive — keeps existing) |
| `{"type":"unsubscribe","topics":[...]}` | client → server | remove topics |
| `{"topic":..., "payload":...}` | server → client | event |
| `{"type":"ping"}` | server → client | every 25s |
| `{"type":"pong"}` | client → server | echo back |
| `{"type":"error", "code":...}` | server → client | scope violation / bad topic syntax |

## No-replay

| Connection state | Behaviour |
|---|---|
| Dropped | events delivered while disconnected NOT replayed |
| Reconnect | re-subscribe with same topics; fresh events from `now` |
| Backfill | use REST `GET /api/v1/sessions/:id/events?since=<seq>` for missed events |

## Limits

| Limit | Value |
|---|---|
| Topics per connection | 64 |
| Connections per integration | 8 |
| Message size | 1 MB |
| Keepalive (server ping) | 25s |
| Idle disconnect | 60s w/o pong |

## Errors

| code | when | fix |
|---|---|---|
| `subscription_scope_denied` | topic doesn't match key's scopes | add `event:subscribe:<topic-prefix>` |
| `subscription_too_many` | > 64 topics | use wildcard |
| `ws_idle_disconnect` | no pong for 60s | respect ping |
