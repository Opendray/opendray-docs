---
kind: endpoint
title: 事件订阅
tldr: WS 在 /api/v1/integrations/_events。订阅 session.* / channel.* / memory.* topic 模式。无 replay — 用 REST events?since=<seq> 回填。
status: stable
since: v0.1.0
topic: consuming
related: [consuming/overview, consuming/scopes, integrations/events-ws, reference/websocket, activity/topics-catalogue]
operations:
  - operationId: integrationsEventsStream
    method: GET
    path: /api/v1/integrations/_events
    summary: WS 事件流
    tags: [integrations]
    x-protocol: websocket
    x-required-scope: 'event:subscribe:*'
x-implementation: [internal/integration/events.go]
---

# 事件订阅

> **tldr:** WS 在 `/api/v1/integrations/_events`。订阅 `session.*` / `channel.*` / `memory.*` topic 模式。无 replay —— 用 REST `events?since=<seq>` 回填。

## TS 示例

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

## Topic

| 模式 | 订阅 |
|---|---|
| `session.s_42.output` | 精确 session |
| `session.*.output` | 所有 session |
| `session.*` | 所有 session 事件 |
| `channel.*.delivery` | 所有投递回执 |
| `memory.*` | 所有记忆事件 |
| `notification.*` | 所有 UI 通知 |

完整目录:[activity/topics-catalogue](../activity/topics-catalogue)。

## 回填

断 10 秒?这 10 秒投递的事件 **不会** replay。

通过 REST 取:

```http
GET /api/v1/sessions/s_42/events?since=12340
```

返回 `seq > 12340` 的事件。

## 限制

| 限制 | 值 |
|---|---|
| 每连接 topic 数 | 64 |
| 每集成连接数 | 8 |
| 消息大小 | 1 MB |
| Keepalive(server ping) | 25s |
| Idle 断开 | 60s 无 pong |
| 回填窗口 | 24h 之内的事件保留 |
