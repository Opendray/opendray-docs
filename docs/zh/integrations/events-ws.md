---
kind: endpoint
title: 事件 WebSocket
tldr: /api/v1/integrations/_events 流式推 session/channel/memory 事件。Bearer 集成 key 认证。连接时 topic 过滤。25s keepalive。
status: stable
since: v0.1.0
topic: integrations
related: [integrations/overview, integrations/auth-model, activity/topics-catalogue]
operations:
  - operationId: integrationsEventsStream
    method: GET
    path: /api/v1/integrations/_events
    summary: WebSocket 事件流
    tags: [integrations]
    x-protocol: websocket
    x-required-scope: 'event:subscribe:*'
x-implementation: [internal/integration/events.go]
---

# 事件 WebSocket

> **tldr:** `/api/v1/integrations/_events` 流式推 session/channel/memory 事件。Bearer 集成 key 认证。连接时 topic 过滤。25s keepalive。

## 连接

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

## 消息信封

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

## Topic 模式

| 模式 | 订阅 |
|---|---|
| `session.s_42.output` | 精确 |
| `session.*.output` | 所有会话的 output |
| `session.*` | 所有 session 事件 |
| `channel.*.delivery` | 所有 channel 投递回执 |
| `memory.*` | 所有记忆事件 |

按 scope 强制:`event:subscribe:session.*` 允许订阅 `session.*` 但
拒绝 `channel.*`。

## 限制

| 限制 | 值 |
|---|---|
| 每连接 topic 数 | 64 |
| 每集成连接数 | 8 |
| 消息大小 | 1 MB |
| Keepalive(server ping) | 25s |
| Idle 断开 | 60s 无 pong |

## Errors

| code | 何时 | 修复 |
|---|---|---|
| `subscription_scope_denied` | topic 不匹配 key 的 scope | 加 `event:subscribe:<topic-prefix>` |
| `subscription_too_many` | > 64 topic | 用通配 |
| `ws_idle_disconnect` | 60s 无 pong | 遵守 ping |
