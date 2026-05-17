---
kind: capability
title: TypeScript SDK
tldr: '@opendray/sdk — npm install + new OpenDray(baseURL, apiKey) → sessions / channels / memory / events methods. Auto-generated from OpenAPI; ESM only.'
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

> **tldr:** `@opendray/sdk` — `npm install` + `new OpenDray(baseURL, apiKey)` → sessions / channels / memory / events methods. Auto-generated from OpenAPI; ESM only.

## Install

```bash
npm install @opendray/sdk
# or
pnpm add @opendray/sdk
```

## Initialize

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

await od.sessions.input(session.id, { text: 'add tests for login.ts\n' })

for await (const evt of od.sessions.stream(session.id)) {
  if (evt.stream === 'stdout') console.log(evt.data)
}

await od.sessions.terminate(session.id)
```

## Channels

```ts
const channels = await od.channels.list()

await od.channels.send('ch_telegram_main', {
  text: 'Build #42 passed',
  sessionRef: session.id,
})
```

## Memory

```ts
const { hits } = await od.memory.recall({
  query: 'jwt refresh strategy',
  scope: ['project', 'global'],
  limit: 5,
})

await od.memory.store({
  text:  'auth uses httpOnly cookie, server-side rotation',
  scope: 'project',
  tags:  ['auth'],
})
```

## Events (WebSocket)

```ts
const stream = od.events.subscribe([
  'session.*.output',
  'channel.*.delivery',
])

for await (const evt of stream) {
  console.log(evt.topic, evt.payload)
}
```

## Built-in behaviours

| Concern | Default |
|---|---|
| Retry on 429 | 3 attempts, exponential backoff respecting `Retry-After` |
| Retry on 502/503 | 2 attempts, 250ms / 1s |
| Per-call timeout | 30s (overridable per method) |
| Keepalive on WS | auto pong on server ping |
| Reconnect on WS drop | 5s backoff, capped at 60s |
| Backfill on WS reconnect | via REST `events?since=<seq>` (opt-in) |

## Errors

All errors thrown as `OpenDrayError` instances with `code` / `message` /
`hint` fields:

```ts
import { OpenDrayError } from '@opendray/sdk'

try {
  await od.sessions.spawn({ ... })
} catch (err) {
  if (err instanceof OpenDrayError) {
    console.error(err.code, err.message, err.hint)
    if (err.code === 'rate_limited') await sleep(err.retryAfterMs ?? 1000)
  }
}
```

See [error-handling](./error-handling) for the code catalogue.

## Generated vs hand-written

| Layer | Source |
|---|---|
| HTTP client | codegen from `/openapi.yaml` |
| WS client | hand-written (events.ts) |
| Retry / backoff | hand-written (middleware.ts) |
| Type definitions | codegen from OpenAPI components |
