---
kind: concept
title: 多会话路由
tldr: channel 里回复时,opendray 按优先级选目标会话 — reply-to-message > /select 固定 > 最近通知。Slash 命令永远优先于路由。
status: stable
since: v0.1.0
topic: channels
related:
  - channels/overview
  - channels/notifications
references:
  capabilities: [channels, sessions]
x-implementation:
  - internal/channel/router.go
  - internal/channel/commands.go
---

# 多会话路由

> **tldr:** channel 里回复时,opendray 按优先级选目标会话 —— reply-to-message > `/select` 固定 > 最近通知。Slash 命令永远优先于路由。

## 路由优先级

| # | 来源 | 触发 |
|---|---|---|
| 1 | Reply-to-message | 长按通知 → 回复(Telegram / Slack 线程 / Discord ref / 飞书回复) |
| 2 | `/select <sid>` 固定 | 显式 slash 命令固定 |
| 3 | 最近通知会话 | 兜底 —— 该 channel 上最近一条通知的目标 |

## Reply-to-message(最佳 UX)

所有支持平台都提供"回复指定消息"(长按 / 右键 → 回复)。opendray
从入站 payload 抓取引用消息 ID,在 `(channel, outbound_msg_id) →
session_id` 的内存索引里查找。

```
索引大小:  每 channel 保留最近 ~256 条出站通知
淘汰策略:  LRU
fallback: 索引淘汰后 → /select 固定 → 最近通知
```

## Slash 命令

| 命令 | 用途 | 示例输出 |
|---|---|---|
| `/sessions` | 列该 channel 上最近通知的会话 | `← /select` 标记固定项,`(last)` 标记最近 |
| `/select <sid>` | 固定一个会话给后续回复 | `Now routing replies to session ses_abc123` |
| `/select clear` | 取消固定 → 回退到最近通知 | `Pinned session cleared` |
| `/cancel <sid>` | SIGTERM 终止会话 | `Session ses_abc123 terminated` |
| `/help` | 列可用命令 | (命令目录) |
| `/notify off` / `/notify on` | 静音 / 取消静音 channel | (见 [notifications](./notifications)) |
| `/status` | 显示 channel + session 计数 | `2 channels running, 3 sessions live` |

```
/select ses_abc123
→ Now routing replies to session ses_abc123. Use /select clear to unpin.
```

## 字节流向

确定路由目标后,opendray:

| # | 步骤 | 源 |
|---|---|---|
| 1 | 把文本 + 末尾 `\r`(Enter)写进会话 stdin | `Manager.Input(sid, payload)` |
| 2 | 清除该会话的 once-mode 压制 | `internal/channel/notify.go` |
| 3 | 发布 `channel.message_forwarded` 事件做审计 | `internal/eventbus/` |

`\r` 关键:raw mode 下的 TUI(Claude Code、Codex、Gemini)把 `\r`
当 Enter(提交),`\n` 当 shift-Enter(插入换行)。发 `\n` 只把文本
放进输入框,不提交。

## Slash 命令永远优先

任何文本如果解析成 slash 命令(`/help`、`/cancel`、`/notify`、
`/select`、`/sessions`、`/status`,加上 app 注册的自定义命令)
都跳过路由,走命令分发器。回复落在同一聊天但不进会话 stdin。

这就是为什么 `/cancel ses_abc` 不会意外地往 Claude 输入框里打
"/cancel ses_abc"。

## Errors

| code / 消息 | 原因 | 修复 |
|---|---|---|
| `Could not deliver to ses_xxx: session not found` | 固定会话已结束 | `/sessions` → `/select <new-sid>` 或发非命令(走最近通知 fallback) |
| `Could not deliver: session ended`(reply-to-message 后) | 消息路由对了但会话已结束 | 在 web UI 重启,或 `/spawn-like ses_xxx` |
| 路由到错的会话 | 最近通知是不同会话发的 | 用 reply-to-message 或 `/select` 固定 |

![Telegram 长按回复](/tutorial/routing-reply-to-message.png)

<details>
<summary>📖 叙事说明</summary>

只要原通知消息还在聊天历史里(通常是 —— 平台不会自动删),回复它
就路由到那个会话。索引保留每 channel 最近 ~256 条出站通知,LRU 淘汰。
老 idle 通知(几周前)最终会淘汰,那时回复落到优先级 2 或 3。

如果你要给同一个会话连发多条,先 `/select` 固定一次,后续就不用每条
都长按。`/sessions` 列候选,每行带 tap-to-copy 的 `/select ses_xyz`。

</details>
