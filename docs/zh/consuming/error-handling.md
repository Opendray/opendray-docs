# Error handling

opendray 使用标准 HTTP 状态码。响应体始终带 `{"error": "<message>"}`,这样你不必解析自然语言就能记录根因。

## 状态码目录

| 状态码 | 含义 | 是否可重试? |
|---|---|---|
| `200` / `201` / `202` | 成功 | n/a |
| `204` | 成功,无 body(DELETE、不产生变化的 PATCH 等) | n/a |
| `400` | Bad request — 无效 JSON / 缺必填字段 / 类型不匹配 | 否(修正请求) |
| `401` | Bearer 缺失,或不匹配任何集成 | 也许可以(被轮转了?见 [Key rotation](#consuming-key-rotation)) |
| `403` | 已认证但缺少作用域 | 否(重新注册 / 编辑作用域) |
| `404` | 资源不存在 | 也许可以(与删除发生竞争?) |
| `409` | 冲突(name/prefix 撞了、会话已结束、route_prefix 已被占) | 否 |
| `429` | 被限流(当前未触发,预留未来兼容) | 是,按 `Retry-After` 退避 |
| `500` | 网关内部错误 — bug 或 DB 连接异常 | 是,带退避 |
| `502` | 反向代理目标不可达 | 是 |
| `503` | 集成被禁用、不健康,或 DB 不可用 | 是 |
| `504` | 反向代理目标超时 | 是 |

## 值得记住的具体错误消息

| Body | 状态码 | 含义 |
|---|---|---|
| `unauthorized` | 401 | 没有凭证或 bearer 无效 |
| `missing scope: <name>` | 403 | Auth 通过,但请求需要你没有的作用域 |
| `integration not found` | 404 | 路径里的 id 不存在 |
| `session not found` | 404 | 会话 id 缺失 — 已被删除? |
| `session has ended` | 409 | 试图向一个死掉的 PTY 发送输入(先用 `/start`,或用 `/sessions` 重新孵化) |
| `route_prefix is reserved` | 400 | 选了一个 opendray 内部使用的前缀(`auth`、`proxy`、`health` 等) |
| `name already in use` | 409 | 注册时换一个 `name` |
| `health check failed` | 503 | 反向代理目标的 `/health` 没返回 2xx |

## 重试策略

对可重试的状态码使用带 jitter 的指数退避:

```ts
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  const delays = [200, 800, 2000, 5000] // ms
  for (const d of delays) {
    try {
      return await fn()
    } catch (err) {
      const status = (err as ApiError).status
      if (![500, 502, 503, 504].includes(status)) throw err
      await sleep(d + Math.random() * d * 0.3)
    }
  }
  return fn() // last attempt; let the throw bubble up
}
```

不要重试 `400 / 403 / 404 / 409` — 它们不会自己修好。

`401` 特殊:单次重试要走你的 key 恢复流程(从 secret store 重新拉,或自我 rotate) — 见 [Key rotation](#consuming-key-rotation)。

## 长连 WebSocket 的重连

事件 WebSocket 可能因任何原因断开 — 网关重启、网络抖动、空闲超时。一个健壮的消费方会重连并对账状态:

```ts
function startEventLoop(client: OpendrayClient, topics: string[]) {
  let backoff = 1000
  function connect() {
    const ws = client.wsEvents(topics, handleEvent, (code) => {
      // 1006 = abnormal close, often network. Reconnect.
      if (code === 1000 || code === 1001) return // clean shutdown
      setTimeout(connect, backoff)
      backoff = Math.min(backoff * 2, 30_000)
    })
    ws.raw.on('open', () => { backoff = 1000 })
  }
  connect()
}
```

opendray **不会** 在重连时重放漏掉的事件。如果这个空档对你重要,重连之后先去查相应的 REST 端点(`GET /sessions` 拿当前状态)再开始信任实时流。

## 日志记录建议

每条非 2xx 都用这些维度记录:

| 字段 | 用途 |
|---|---|
| HTTP 状态码 | 用来对非 2xx 比率做告警 |
| Request method + path(不带 ID) | 按端点聚合失败 |
| `error` body 字段 | 人类可读的原因 |
| Latency | 慢 5xx = 下游问题;快 5xx = 直接报警 |
| Bearer principal hash | 如果你经常 rotate,有助于把失败和轮转事件关联起来 |

成功调用方面,opendray 自带的集成调用日志(`/integrations/_calls`,仅管理员可访问)会记录网关看到的每一个请求和调用方归属。如果你的客户端日志和服务端不一致,去那里对一下。

## 上报 bug

如果你看到一个带泛用消息的 500:

1. 抓住请求 — method、path、body、时间。
2. 查网关日志(Settings → Logging → Live tail),找同一时间点附近的错误。
3. 在 <https://github.com/Opendray/opendray_v2/issues> 提交 issue,把请求形状和相关日志行都贴上。

opendray 还很小,大多数 500 都是可复现的 bug;响应一般很快。
