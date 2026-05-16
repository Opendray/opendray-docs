# Events WebSocket

`/api/v1/integrations/_events` 把 opendray 的内部事件总线以 WebSocket 流的形式暴露出来。任何持有有效 token(管理员或拥有合适作用域的集成)的进程都可以订阅并对事件实时响应。

## 何时使用

- **本地仪表板**:想要实时跟踪而不去轮询。
- **自定义告警** 脚本:对 `session.idle` 或 `channel.message_forwarded` 做动作。
- **跨主机编排** — 一个 opendray 的事件通过集成 key 驱动另一个 opendray 实例。

Activity 页面内部就是用的这个端点,所以那里你能看到的任何事件,都能在外部代码里订阅到。

## 连接

```python
import websocket
import json

ws = websocket.WebSocketApp(
    "ws://opendray-host/api/v1/integrations/_events",
    header={"Authorization": "Bearer YOUR_INTEGRATION_KEY"},
    on_message=lambda _, msg: print(json.loads(msg)),
)
ws.run_forever()
```

或者用 `wscat`:

```bash
wscat -c "ws://opendray-host/api/v1/integrations/_events" \
      -H "Authorization: Bearer YOUR_INTEGRATION_KEY"
```

对浏览器(它无法在 WS upgrade 上设 Authorization),这个端点也接受查询字符串里的 `?token=`。慎用 — URL 里的 token 会泄漏进代理访问日志。

## 帧结构

每一帧都是一个 JSON 对象:

```json
{
  "topic": "session.idle",
  "ts": "2026-05-04T10:32:14.123Z",
  "data": {
    "session_id": "ses_abc123",
    "idle_for_ms": 30000,
    "recent_output": "● Got it — let's design the API.\n\n● Write(...)..."
  }
}
```

| 字段 | 说明 |
|---|---|
| `topic` | 点分名称;订阅过滤器按前缀匹配 |
| `ts` | 服务端发布时的时间戳 |
| `data` | topic 特定的负载 |

## 过滤

在 WS upgrade URL 上传 `?topics=session.,channel.message_`(逗号分隔的前缀)。服务端过滤 — 只有匹配的事件才会流向这个连接。

如果省略 `topics`,你会拿到 **全部** — 对 Activity 页面这种由运维方在客户端过滤的场景很有用,但对生产脚本不合适(浪费带宽)。

## Topics 目录

完整列表见 [Activity → Topics catalogue](#activity-topics-catalogue)。最常用的:

| Topic | Payload 亮点 |
|---|---|
| `session.started` | `session_id`、`provider_id`、`cwd` |
| `session.idle` | `session_id`、`idle_for_ms`、`recent_output` |
| `session.ended` | `session_id`、`exit_code`、`state` |
| `channel.message_received` | `channel_id`、`text`、`author` |
| `channel.message_forwarded` | `channel_id`、`session_id`、`text` |
| `channel.command_received` | `channel_id`、`command`、`args` |
| `integration.call_logged` | 调用日志一行,写入后发出 |

## 背压

慢订阅方会被 **直接丢弃**,而不是阻塞总线 — opendray 在每个事件 channel 上都优先保证生产侧。如果你的脚本在事件涌入时卡在一个很慢的 DB 写入上,你会无声地丢事件。两个选项:

1. 每收到一帧就开一个 goroutine / async 任务,然后立即从 `on_message` 返回。
2. 用尽量窄的 `topics` 过滤订阅,把每秒速率压低。

丢失事件 **不会** 触发重连 — 也没有"你漏了 N 条事件"这种信号。对审计级的处理,使用调用日志(这是落盘的 Postgres),把事件流当作 UI/仪表板的工具来对待。

## 连接生命周期

- WS 级 ping 大约每 54s 一次;客户端应当响应 WebSocket Pong(大多数库会自动做)。
- 空闲关闭:5 分钟内既无入也无出活动则关闭。
- 服务端重启:连接以 1001 ("going away") 码干净关闭。退避后重连。
