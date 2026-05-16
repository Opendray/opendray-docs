# 主题清单

opendray 发布的每个事件,以及它的完整 payload 形状。作为
参考很有用,在以下情况:

- 写一个外部脚本,通过 [Events
  WebSocket](#integrations-events-ws) 订阅。
- 构建一个需要对 opendray 事件做反应的自定义插件。
- 调试 "这个主题到底带了什么?"

## session.*

### `session.started`

```json
{
  "session_id": "ses_abc123",
  "provider_id": "claude",
  "cwd": "/Users/me/projects/foo",
  "started_at": "2026-05-04T10:00:00Z"
}
```

### `session.idle`

```json
{
  "session_id": "ses_abc123",
  "idle_for_ms": 30000,
  "recent_output": "● Got it — let's design the API…"
}
```

`recent_output` **仅在** 会话已经产生输出 AND snippet 流水线
成功时存在。对全新 / 静默的会话为空。

### `session.ended`

```json
{
  "session_id": "ses_abc123",
  "exit_code": 0,
  "ended_at": "2026-05-04T10:30:00Z",
  "state": "ended"
}
```

`state` 在自然退出时为 `ended`,在 SIGTERM 驱动的关停时为
`stopped`。

### `session.stopped`

payload 跟 `session.ended` 一样,但只在操作员通过 × 按钮
显式停止会话时发布。

## channel.*

### `channel.message_received`

```json
{
  "channel_id": "ch_xyz",
  "channel_message_id": 12345,
  "conversation_id": "42",
  "author": "@alice",
  "text": "any plain text the user typed"
}
```

在到达的非命令消息 **没有** 被路由到会话时触发。(如今多数
非命令文本路由到会话并改为发 `channel.message_forwarded`。)

### `channel.message_forwarded`

```json
{
  "channel_id": "ch_xyz",
  "channel_message_id": 12345,
  "session_id": "ses_abc",
  "text": "the text that was written to the session's stdin"
}
```

在 opendray 通过路由流水线成功把入站通道文本转发到会话时
触发。

### `channel.message_sent`

```json
{
  "channel_id": "ch_xyz",
  "topic": "session.idle"
}
```

在 opendray 成功在通道上发出出站通知后触发。`topic` 字段
携带 *源头* 事件主题(所以你可以把 idle → sent 关联起来)。

### `channel.command_received`

```json
{
  "channel_id": "ch_xyz",
  "channel_message_id": 12346,
  "command": "cancel",
  "args": ["ses_abc"],
  "source": "builtin"
}
```

`source` 是 `builtin`(opendray 注册的)或 `custom`(应用
注册的)。

### `channel.command_unknown`

形状跟 `command_received` 一样,只是少了 `source`。在用户
输入了一个未识别的 slash 命令时触发 — opendray 回复
"try /help"。

## integration.*

### `integration.call_logged`

```json
{
  "principal_kind": "integration",
  "principal_id": "int_abc",
  "method": "POST",
  "path": "/api/v1/proxy/anthropic/v1/messages",
  "status": 200,
  "duration_ms": 1234,
  "request_id": "yinglincuisMini/abc123-000042"
}
```

每一次已记录调用触发一次,**在** 响应完全写出 **之后**。

### `integration.health_changed`

```json
{
  "integration_id": "int_abc",
  "previous": "healthy",
  "current": "degraded",
  "reason": "5 consecutive 5xx responses"
}
```

在周期性健康检查翻转一个集成的状态时触发。(状态即使不翻转
也会更新;事件只在状态转变时触发。)

## audit.*

### `audit.event`

```json
{
  "actor_kind": "admin",
  "actor_id": null,
  "action": "channel.update",
  "subject_kind": "channel",
  "subject_id": "ch_xyz",
  "metadata": { ... }
}
```

镜像每一行写入 `audit_log` 表的记录。当你不想去轮询那张表
时,用这个做 SIEM 摄入。

## vaultgit.*

### `vaultgit.sync_completed`

```json
{
  "files_changed": 3,
  "ahead": 5,
  "behind": 0,
  "duration_ms": 412
}
```

每次自动 vault git 同步周期结束后触发。

## 自定义主题

任何插件 / 扩展都可以以自己的前缀发布。按约定,使用
`<plugin-name>.<event>`,这样消费者可以无冲突地过滤。
opendray 自己保留 `session.*`、`channel.*`、`integration.*`、
`audit.*`、`vaultgit.*`。
