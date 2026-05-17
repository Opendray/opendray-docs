---
kind: capability
title: TypeScript SDK
tldr: '@opendray/sdk — npm install + new OpenDray(baseURL, apiKey) → sessions / channels / memory / events 方法。从 OpenAPI 自动生成;仅 ESM。'
status: beta
since: v0.1.0
topic: consuming
related: [consuming/overview, consuming/error-handling, consuming/key-rotation]
capability: [typed-rest, ws-helper, retry-on-rate-limit]
inbound: api
outbound: ts
x-implementation: [packages/sdk-ts/]
---

# TypeScript SDK

> **tldr:** `@opendray/sdk` —— `npm install` + `new OpenDray(baseURL, apiKey)` → sessions / channels / memory / events 方法。从 OpenAPI 自动生成;仅 ESM。

## 安装

```bash
npm install @opendray/sdk
# 或
pnpm add @opendray/sdk
```

## 初始化

```ts
import { OpenDray } from '@opendray/sdk'

const od = new OpenDray({
  baseURL: 'http://localhost:8770',
  apiKey:  process.env.OD_API_KEY!,
})
```

## Sessions

```ts
const session = await od.sessions.spawn({
  provider: 'claude',
  cwd:      '/home/dev/proj',
  name:     'refactor',
  claudeAccountId: 'work',
})

await od.sessions.input(session.id, { text: '帮 login.ts 加测试\n' })

for await (const evt of od.sessions.stream(session.id)) {
  if (evt.stream === 'stdout') console.log(evt.data)
}

await od.sessions.terminate(session.id)
```

## Channels

```ts
const channels = await od.channels.list()

await od.channels.send('ch_telegram_main', {
  text: '构建 #42 通过',
  sessionRef: session.id,
})
```

## Memory

```ts
const { hits } = await od.memory.recall({
  query: 'jwt refresh 策略',
  scope: ['project', 'global'],
  limit: 5,
})

await od.memory.store({
  text:  'auth 用 httpOnly cookie,服务端轮换',
  scope: 'project',
  tags:  ['auth'],
})
```

## 事件(WebSocket)

```ts
const stream = od.events.subscribe([
  'session.*.output',
  'channel.*.delivery',
])

for await (const evt of stream) {
  console.log(evt.topic, evt.payload)
}
```

## 内置行为

| 关心点 | 默认 |
|---|---|
| 429 重试 | 3 次,指数退避遵守 `Retry-After` |
| 502/503 重试 | 2 次,250ms / 1s |
| 每调用超时 | 30s(per-方法可覆盖) |
| WS keepalive | 自动 pong 服务端 ping |
| WS 断开重连 | 5s 退避,封顶 60s |
| WS 重连后回填 | 通过 REST `events?since=<seq>`(opt-in) |
