# 多会话路由

当你同时运行 3+ 个会话时,回复到 "正确那个" 至关重要。opendray 用以下优先级为入站非命令消息选定目标会话:

| 优先级 | 来源 | 触发 |
|---|---|---|
| 1 | reply-to-message | 长按通知 → Reply(Telegram、Slack 线程、Discord ref、飞书 reply) |
| 2 | `/select <sid>` 锁定 | 显式斜杠命令 |
| 3 | 最后通知的会话 | 回退 — 此频道上最近的通知 |

## reply-to-message 路由(最佳 UX)

每个 chat 平台都支持 "回复某条特定消息" — 长按 / 右键 → Reply。opendray 从入站载荷捕获被引用的消息 id,并在 `(channel, outbound_msg_id) → session_id` 的内存索引中查找。

只要原始通知消息还在 chat 历史中(通常都在 — 平台不会自动删除),回复它就会把你的文本路由到该特定会话。

索引保留每个频道最近约 256 个出站通知,超出按 LRU 淘汰。老的空闲通知(几周前)最终会丢出 — 这时回复会回退到优先级 2 或 3。

![Telegram long-press reply](/tutorial/routing-reply-to-message.png)

## `/select` 显式锁定

当你打算给同一个会话连发多条消息时,先锁定一次:

```
/select ses_abc123
→ Now routing replies to session ses_abc123. Use /select clear to unpin.
```

后续的非命令文本就路由到那个会话,覆盖*最后通知*的回退。

解除锁定:

```
/select clear
→ Pinned session cleared. Routing falls back to last-notified.
```

## `/sessions` 查找 ID

会话 id 没记住?运行:

```
/sessions
→ Recently-notified sessions (most recent first):
    /select ses_xyz789 ← /select
    /select ses_abc123 (last)
    /select ses_old456

   Tip: replying to a notification routes to *that* session directly.
```

标记 `← /select` 显示当前锁定的是哪个;`(last)` 显示最近通知目标。每行就是字面的斜杠命令,点击可以复制粘贴到输入栏。

## 字节去了哪里

确定路由目标后,opendray:

1. 通过 `Manager.Input(sid, payload)` 把你的文本 + 一个尾随 `\r`(carriage return — Enter)转发到会话的 stdin。
2. 清除该会话的 *Once* 模式抑制条目,这样下次 idle 事件会再次通知。
3. 发布 `channel.message_forwarded` 事件用于审计。

`\r` 关键:在 raw 模式运行的 TUI(Claude Code、Codex、Gemini)把 `\r` 视为 Enter(提交),`\n` 视为 shift-Enter(插入换行)。发 `\n` 会把文本放进输入框但不提交。

## 斜杠命令总是覆盖路由

任何被解析为斜杠命令的文本(`/help`、`/cancel`、`/notify`、`/select`、`/sessions`、`/status`,以及 app 注册的任何自定义命令)完全跳过路由,直接走命令派发器。回复落在同一个 chat 里,但永远不会触碰会话的 stdin。

这就是为什么 `/cancel ses_abc` 不会意外地把 "/cancel ses_abc" 打到 Claude 的输入框里。

## 失败模式

- **"Could not deliver to ses_xxx: session not found"** — 锁定的会话已结束。用 `/sessions` 找一个活跃的并再次 `/select`,或者直接发一条新的非命令消息回退到最后通知。
- **路由到错误的会话** — 通常是因为*最近*的通知来自和你想发的不同的会话。用 reply-to-message 或 `/select`。
- **Reply-to-message 返回 "Could not deliver: session ended"** — 消息路由到了正确的会话但它不再运行。通过 web UI 或 `/spawn-like ses_xxx` 重启它。
