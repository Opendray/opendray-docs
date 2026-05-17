---
kind: endpoint
title: Event subscriptions
tldr: WS at /api/v1/integrations/_events. Subscribe to session.* / channel.* / memory.* topic patterns. No replay — use REST events?since=<seq> to backfill.
status: stable
since: v0.1.0
topic: consuming
related:
  - consuming/overview
  - consuming/scopes
  - integrations/events-ws
  - reference/websocket
  - activity/topics-catalogue
operations:
  - operationId: integrationsEventsStream
    method: GET
    path: /api/v1/integrations/_events
    summary: WS event stream
    tags: [integrations]
    x-protocol: websocket
    x-required-scope: 'event:subscribe:*'
x-implementation:
  - internal/integration/events.go
---

# Event subscriptions

> **tldr:** WS at `/api/v1/integrations/_events`. Subscribe to `session.*` / `channel.*` / `memory.*` topic patterns. No replay — use REST `events?since=<seq>` to backfill.

## TypeScript snippet

```ts
const ws = new WebSocket('ws://localhost:8770/api/v1/integrations/_events', [], {
  headers: { Authorization: `Bearer ${process.env.OD_API_KEY}` }
})

ws.addEventListener('open', () => {
  ws.send(JSON.stringify({
    type: 'subscribe',
    topics: ['session.s_42.output', 'channel.*.delivery'],
  }))
})

ws.addEventListener('message', e => {
  const evt = JSON.parse(e.data)
  if (evt.type === 'ping') ws.send('{"type":"pong"}')
  else handleEvent(evt)
})
```

## Topics

| Pattern | Subscribes to |
|---|---|
| `session.s_42.output` | exact session |
| `session.*.output` | all sessions |
| `session.*` | every session event |
| `channel.*.delivery` | every delivery receipt |
| `memory.*` | all memory events |
| `notification.*` | all UI notifications |

Full catalogue: [activity/topics-catalogue](../activity/topics-catalogue).

## Event envelope

```json
{
  "topic": "session.s_42.output",
  "seq": 12345,
  "ts": "2026-05-17T10:32:18.421Z",
  "payload": { ... topic-specific ... }
}
```

## Backfill (no-replay)

Disconnected for 10 seconds? Events delivered in those 10s are **not** replayed.

Get them via REST:

```http
GET /api/v1/sessions/s_42/events?since=12340
```

Returns events with `seq > 12340`.

## Connection limits

| Limit | Value |
|---|---|
| Topics / connection | 64 |
| Connections / integration | 8 |
| Message size | 1 MB |
| Keepalive (server ping) | 25s |
| Idle disconnect | 60s w/o pong |
| Backfill window | 24h of events kept; older lost |

## Errors

| code | when | fix |
|---|---|---|
| `subscription_scope_denied` | topic doesn't match key's scopes | add `event:subscribe:<prefix>` |
| `subscription_too_many` | > 64 topics | use wildcard |
| `ws_idle_disconnect` | no pong for 60s | respect ping |
| `backfill_too_old` | `since` cursor > 24h | reconnect fresh; missed events lost |
