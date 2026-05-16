# Event subscriptions

opendray 在一个内部 pub/sub 总线上发布生命周期事件。你的集成可以通过一个 WebSocket 订阅并实时响应 — 无需轮询。

## 端点

```
GET /api/v1/integrations/_events?topics=<csv>&token=<api_key>
```

升级到 WebSocket。服务端帧是 JSON(每条消息一个事件)。客户端帧只用来检测断连 — opendray 忽略它们的内容。

`topics` 是一个 CSV,内容是 glob 风格的模式。每一个都会在连接建立时与你集成的 `event:subscribe:<topic>` 作用域比对;缺少作用域 → `403 missing scope: event:subscribe:<topic>`。

## 主题目录

| Topic | 何时发出 | Payload |
|---|---|---|
| `session.started` | 会话被孵化 | `{session_id, provider_id, name}` |
| `session.idle` | stdout 静默达到 `idle_threshold` | `{session_id, last_activity}` |
| `session.activity` | 空闲后 stdout 又有动作 | `{session_id}` |
| `session.stopped` | 运维方主动停止 | `{session_id, ended_at, exit_code}` |
| `session.ended` | 进程自己退出 | `{session_id, ended_at, exit_code}` |
| `session.restarted` | 停止/结束后重新孵化 | `{session_id}` |
| `channel.message_sent` | 向频道发送的出站消息成功 | `{channel_id, session_id?, level}` |
| `channel.message_forwarded` | 入站聊天回复被转发到会话 | `{channel_id, session_id, bytes}` |
| `channel.command_received` | 从聊天平台收到斜杠命令 | `{channel_id, command, args}` |
| `integration.registered` | 新建了一条集成记录 | `{integration_id, name}` |
| `integration.health_changed` | 反向代理健康状态变化 | `{integration_id, prev, next}` |
| `integration.key_rotated` | 运维方轮转了本集成的 key | `{integration_id, name}` |

通过 `.*` 订阅通配:
- `session.*` — 所有 `session.…` 主题
- `channel.*` — 所有 `channel.…` 主题
- `integration.*` — 所有 `integration.…` 主题

通配符在 scope **和** topic 中都要出现 — `event:subscribe:session.*` 作用域才能授权订阅 `topics=session.*`。

## 事件帧结构

```json
{
  "topic": "session.started",
  "data": {
    "session_id": "ses_xLG2uLq4mX_X",
    "provider_id": "shell",
    "name": "demo-1777871927588"
  },
  "ts": "2026-05-04T05:18:00.162308+10:00"
}
```

`ts` 是网关上的发布时间戳,RFC3339 格式。即使在高负载下你的客户端乱序收到了帧,也用它来排序。

## 连接生命周期

```
1. Client opens GET /integrations/_events?topics=session.*&token=…
2. Server validates scope per topic.
3. Server upgrades to WS.
4. Server pushes events for the listed topics until:
     · client closes (any code), or
     · server shuts down (close 1001).
```

历史事件 **没有重放** — 订阅只能看到连接建立之后发布的事件。如果你在重连期间漏掉了什么,去查相应的 REST 端点(`/sessions`、`/integrations` 等)来恢复状态。

## 浏览器注意事项

浏览器端的 WebSocket 不能添加请求头,所以 bearer 走查询字符串。任何能看到 URL 的人都能读到 token;走 HTTPS,并把这个 URL 当成凭证来对待。Node.js 参考客户端为了一致性也用同样的方式。

## 示例(Node.js / `ws`)

```ts
import WebSocket from 'ws'

const url =
  'wss://opendray.example.com/api/v1/integrations/_events' +
  '?topics=session.*,integration.*' +
  `&token=${encodeURIComponent(apiKey)}`

const ws = new WebSocket(url)
ws.on('message', (raw) => {
  const ev = JSON.parse(raw.toString())
  if (ev.topic === 'session.idle') notifyOperator(ev.data.session_id)
})
ws.on('close', (code) => console.log('closed', code))
```

更完整的参考(subscribe-replay-recover 循环、重连退避、作用域检查)见 [TypeScript SDK](#consuming-typescript-sdk) 和其引用的 `client.ts` 源码。
