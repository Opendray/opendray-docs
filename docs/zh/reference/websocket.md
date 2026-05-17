---
kind: endpoint
title: WebSocket 事件
tldr: 长连接事件流。Bearer 认证。订阅 topic 模式。25s keepalive。无 replay — 用 REST events?since=<seq> 回填。
status: beta
since: v0.1.0
topic: reference
related: [reference/overview, reference/rest, integrations/events-ws, consuming/websocket-events, activity/topics-catalogue]
x-implementation: [internal/integration/events.go]
---

# WebSocket 事件 <Badge type="beta">Beta</Badge>

> **tldr:** 长连接事件流。Bearer 认证。订阅 topic 模式。25s keepalive。无 replay —— 用 REST `events?since=<seq>` 回填。

长连接事件流,推送实时的会话输出、频道投递、记忆写入、通知。

## 建立连接

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

握手完成后,每条事件以 JSON 形式投递:

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

## 主题目录

<CardGroup :cols="2">
<Card icon="🛰" title="session.*">
输出、状态变更、退出、attach/detach。用 `session.*.output` 通配
订阅所有可见会话。
</Card>
<Card icon="💬" title="channel.*">
入站用户消息、出站投递回执、频道状态(connecting / running / failed)。
</Card>
<Card icon="🧠" title="memory.*">
嵌入写入、recall 调用、冲突检测。给 dashboard 用。
</Card>
<Card icon="🔔" title="notification.*">
后台 UI 看到的通知,实时流式。
</Card>
</CardGroup>

完整 topic 列表 + payload schema 从
[活动 → Topics 目录](/zh/activity/topics-catalogue) 镜像 —— 那是
权威版本(同一份 topic 也出现在后台的 activity tail)。

## 订阅 / 取消订阅

```json
{ "type": "subscribe",   "topics": ["session.s_42.output"] }
{ "type": "unsubscribe", "topics": ["session.s_42.output"] }
```

发新的 `subscribe` 增加 topic;服务端按每连接保留你完整的订阅列表。
断连即重置。

## 心跳

服务端每 25 秒发 `{ "type": "ping" }`。回 `{ "type": "pong" }`
保持连接。TS SDK 自动处理。

## 断线重连策略

连接断了,带同一套 topic 列表重连即可。断线期间的事件 **不会** 重放
—— 需要可靠投递,用 REST `GET /api/v1/sessions/:id/events?since=...`
回填历史,再重新订阅。

<Callout type="warning">
不要把 WebSocket 当合规 / 审计来源。**运维 → 活动** 里的签名审计
日志才是权威存储。
</Callout>
