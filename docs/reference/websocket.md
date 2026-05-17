---
kind: endpoint
title: WebSocket events
tldr: Long-lived event stream. Bearer auth. Subscribe to topic patterns. 25s keepalive. No replay — use REST events?since=<seq> for backfill.
status: beta
since: v0.1.0
topic: reference
related:
  - reference/overview
  - reference/rest
  - integrations/events-ws
  - consuming/websocket-events
  - activity/topics-catalogue
x-implementation:
  - internal/integration/events.go
---

# WebSocket events <Badge type="beta">Beta</Badge>

> **tldr:** Long-lived event stream. Bearer auth. Subscribe to topic patterns. 25s keepalive. No replay — use REST `events?since=<seq>` for backfill.

Long-lived event stream for real-time session output, channel
deliveries, memory writes, and notifications.

## Connecting

```ts
const ws = new WebSocket('ws://localhost:8651/api/v1/events', [], {
  headers: { Authorization: 'Bearer od_live_xxx' },
})

ws.addEventListener('open', () => {
  ws.send(JSON.stringify({
    type: 'subscribe',
    topics: ['session.s_42.output', 'channel.*.delivery'],
  }))
})
```

After the handshake, every event is delivered as a JSON message:

```json
{
  "topic": "session.s_42.output",
  "ts": "2026-05-16T10:32:18.421Z",
  "payload": {
    "stream": "stdout",
    "data": "Reading src/auth/login.ts...\n"
  }
}
```

## Topic catalogue

<CardGroup :cols="2">
<Card icon="🛰" title="session.*">
Output, state changes, exit, attach/detach. Wildcard with
`session.*.output` to subscribe to all sessions you can see.
</Card>
<Card icon="💬" title="channel.*">
Inbound user messages, outbound delivery receipts, channel state
(connecting / running / failed).
</Card>
<Card icon="🧠" title="memory.*">
Embedding writes, recall calls, conflict detections. Useful for
dashboards.
</Card>
<Card icon="🔔" title="notification.*">
The same notifications shown in the admin UI, in real time.
</Card>
</CardGroup>

The complete topic list with payload schemas is mirrored from the
[Activity → Topics catalogue](/activity/topics-catalogue) page —
that's the canonical version since the same topic surfaces in the
admin UI's activity tail.

## Subscribe / unsubscribe

```json
{ "type": "subscribe",   "topics": ["session.s_42.output"] }
{ "type": "unsubscribe", "topics": ["session.s_42.output"] }
```

Send a fresh `subscribe` to add topics; the server holds your full
subscription list per connection. Drop the connection to reset.

## Keepalive

The server sends a `{ "type": "ping" }` envelope every 25 s. Echo
back `{ "type": "pong" }` to keep the connection alive. The TS SDK
handles this automatically.

## Reconnect strategy

If the connection drops, reconnect with the same topic list. Events
delivered while you were disconnected are **not** replayed — for
durable delivery use the REST `GET /api/v1/sessions/:id/events?since=...`
endpoint to backfill, then re-subscribe.

<Callout type="warning">
Don't rely on the WebSocket for compliance / audit. The signed
audit log in **Operate → Activity** is the canonical store.
</Callout>
