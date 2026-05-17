---
kind: capability
title: Telegram
tldr: 从 @BotFather 拿 bot token,粘到 Channels → New → kind=telegram 即可。long-poll,不需要公网 URL。
status: stable
since: v0.1.0
topic: channels
related:
  - channels/overview
  - channels/notifications
  - channels/routing
capability:
  - text
  - html-parse-mode
  - inline-buttons
  - reply-routing
  - edit-in-place
  - typing-indicator
inbound: long-poll
outbound: rest
public-url-required: false
setup-time-minutes: 3
x-implementation:
  - internal/channel/telegram/
  - internal/channel/hub.go
x-api-version: telegram-bot-api-7
---

# Telegram

> **tldr:** 从 @BotFather 拿 bot token,粘到 **Channels → New → kind=telegram** 即可。long-poll,不需要公网 URL。

## Setup

| # | 操作 | 在哪做 |
|---|---|---|
| 1 | 给 [@BotFather](https://t.me/BotFather) 发 `/newbot`,保存 token `<digits>:<base64>` | Telegram |
| 2 | (可选)把 bot 拉进目标群,然后给 [@userinfobot](https://t.me/userinfobot) 发 `/myid` 拿 `chat_id` | Telegram |
| 3 | 打开 opendray **Channels** → **+ New** → kind 选 `telegram` → 粘 token | opendray 后台 |
| 4 | (可选)粘 `default_chat_id`,未指定目标的发送会进这个聊天 | opendray 后台 |
| 5 | 点 **Save**,状态徽章 2 秒内从 `connecting` 变 `running` | opendray 后台 |

## Config schema

```yaml
# Channels → New → kind=telegram
kind: telegram                          # 字面量,必填
token: "<digits>:<base64-url>"          # 必填密文;正则 /^\d+:[A-Za-z0-9_-]+$/
default_chat_id: integer                # 选填;未指定目标的发送进这里
notify:
  started:            false             # 默认 false
  idle:               true              # 默认 true
  ended:              true              # 默认 true
  permission_ask:     true              # 默认 true
repeat_policy: once-per-session         # 枚举: never | once-per-session | always
snippet:
  enabled:            false             # 默认 false
  max_lines:          10                # 默认 10,范围 [1, 200]
enabled: true                           # 不删频道也能临时关停
```

## Capabilities

| 能力 | 支持 | 实现备注 |
|---|---|---|
| 入站(long-poll) | ✓ | `internal/channel/telegram/poller.go` 里 `getUpdates` 循环 |
| HTML 出站 | ✓ | `parse_mode=HTML`,支持 `<b>`、`<i>`、`<code>`、`<pre>`、`<a href>` |
| inline 按钮 | ✓ | `reply_markup.inline_keyboard`;callback 走 hub 路由 |
| 回复消息路由 | ✓ | 回复对应到原会话 stdin |
| 原地编辑 | ✓ | `idle → running`、`running → done` 状态变更时复用 |
| typing 指示 | ✓ | 会话产出过程中持续 `sendChatAction` |
| 文件上传 | ✗ | 未实现(issue #channels-file-upload) |
| 语音 / 视频 | ✗ | 范围外 |

## Errors

| code | http | 原因 | 修复 |
|---|---|---|---|
| `channel_kind_unsupported` | 400 | `kind` 字段不是字面量 `telegram` | 用字符串 `telegram` |
| `tg_invalid_token` | 400 | token 形状不对 | 重新检查正则 `^\d+:[A-Za-z0-9_-]+$` |
| `tg_unauthorized` | 401 | token 被吊销或错的 | 找 @BotFather 用 `/revoke` 然后 `/token` 重发 |
| `tg_chat_not_found` | 404 | `chat_id` 错或 bot 被踢出群 | 重新邀请 bot 进群,重取 chat_id |
| `tg_rate_limited` | 429 | 单聊 > 30 msg/s | 设 `repeat_policy: once-per-session`,按 `Retry-After` 退避 |
| `tg_message_too_long` | 400 | HTML 转义后 > 4096 字符 | 减少 `snippet.max_lines` 或拆消息 |

## Examples

### 通过 REST 发送

```http
POST /api/v1/channels/ch_tg_main/send
Authorization: Bearer od_live_xxxxxxxxxx
Content-Type: application/json

{
  "text": "构建 #42 通过",
  "session_ref": "s_42"
}
```

响应:

```json
HTTP/1.1 202 Accepted
{ "message_id": "tg_847", "queued_at": "2026-05-17T10:24:00Z" }
```

### 入站回复 → stdin

用户在 Telegram 回复一张通知卡。hub:

1. 通过 `getUpdates` 收到 `update.message.reply_to_message.message_id`
2. 查出原卡是哪个会话发的
3. 把回复文本写进那个会话的 stdin

零额外配置 —— 开箱即用。

## Limitations

| 限制 | 数值 | 备注 |
|---|---|---|
| 消息正文 | 4096 字符 | Telegram 限制;HTML 转义算在内 |
| inline 按钮数 | 100 / 条 | Telegram 限制 |
| callback data | 64 字节 | Telegram 限制;opendray 用不透明 ID |
| 单聊发送速率 | 30 / 秒 | Telegram 限制;`repeat_policy` 配合 |
| 全 bot 发送速率 | 30 / 秒 | 跨所有聊天的总和 |

<details>
<summary>📖 叙事说明</summary>

Telegram 是最容易配的频道,因为它不需要公网 URL —— opendray 通过
long-poll 主动拉 Telegram 的 update,所以家用 NAT 后面也能跑。流程
就三步:

1. 在 Telegram 里找 [@BotFather](https://t.me/BotFather),发 `/newbot`,
   给 bot 起个显示名 + `_bot` 后缀的用户名。
2. BotFather 回你一个 token,长得像 `1234567890:ABCdef...`。存下来
   (这是唯一一次显示,后续要找 BotFather 重发)。
3. opendray **Channels** → **+ New** → kind 下拉选 `telegram` → 粘 token。

大多数场景还想配 *default chat ID*:这是当 session 通知没指定目标时
opendray 默认推到的聊天。先把 bot 加进想用的群,然后给
[@userinfobot](https://t.me/userinfobot) 发 `/myid`,它会返回数字 ID。

点 **Save** 后,频道状态会从 `connecting` 转到 `running`,通常 2 秒
以内。如果一直卡在 `connecting`,点 **Edit** 看 token 格式。如果直接
报错变成 `failed`,看上面的 **Errors** 表查代码对应的修复方法。

</details>
