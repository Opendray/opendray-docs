---
kind: capability
title: Discord
tldr: 创建 Discord app + bot → 开 Message Content Intent → 邀请到服务器 → Channels → New → kind=discord 粘 token。Gateway WS,不需要公网 URL。
status: stable
since: v0.1.0
topic: channels
related:
  - channels/overview
  - channels/notifications
  - channels/routing
capability:
  - text
  - embeds
  - interactive-buttons
  - select-menus
  - threading
  - reply-routing
  - edit-in-place
inbound: gateway-ws
outbound: rest
public-url-required: false
setup-time-minutes: 5
x-implementation:
  - internal/channel/discord/
x-api-version: discord-api-10
---

# Discord

> **tldr:** 创建 Discord application + bot → 开 Message Content Intent → 邀请到服务器 → **Channels → New → kind=discord** 粘 bot token。Gateway WebSocket,不需要公网 URL。

## Setup

| # | 操作 | 在哪做 |
|---|---|---|
| 1 | [discord.com/developers/applications](https://discord.com/developers/applications) → New Application → Bot → **Reset Token** → 保存 token(仅一次显示) | Discord 开发者后台 |
| 2 | 同 Bot 页 → **Privileged Gateway Intents** → 打开 **Message Content Intent**(必需) | Discord 开发者后台 |
| 3 | OAuth2 → URL Generator → scope `bot` + `applications.commands` → 权限 `Send Messages`、`Embed Links`、`Read Message History` → 打开链接 → 授权 | Discord 开发者后台 |
| 4 | Discord 客户端 → 用户设置 → Advanced → **Developer Mode** ON → 右键频道 → **Copy Channel ID** | Discord 客户端 |
| 5 | opendray **Channels → New → kind=discord** → 粘 bot token + 默认 channel ID → Save | opendray 后台 |

## Config schema

```yaml
kind: discord                            # 字面量,必填
bot_token: string                        # 必填密文,正则 /^[A-Za-z0-9._-]{50,}$/
default_channel_id: "1234567890123456789" # 选填,Discord snowflake
guild_id: string                          # 选填,限定到一个服务器
notify:
  started:          false
  idle:             true
  ended:            true
  permission_ask:   true
repeat_policy: once-per-session
snippet:
  enabled:    false
  max_lines:  10
enabled: true
```

## Capabilities

| 能力 | 支持 | 实现备注 |
|---|---|---|
| 入站(Gateway WS) | ✓ | 持续 WS 连接,自动重连 |
| Embeds | ✓ | `CardHeader` → embed `title` + color;`CardMarkdown` → `description` |
| 交互式按钮 | ✓ | `action_row` 的 `button`(style 1=primary, 4=danger, 2=secondary) |
| Select 菜单 | ✓ | `CardSelect` → string select |
| 回复路由 | ✓ | `message_reference` 回复进会话 stdin |
| 原地编辑 | ✓ | 状态变更复用 |
| Message Content Intent | 必需 | 不开 inbound `content` 为空 |
| 文件上传 | ✗ | 未实现 |

## Errors

| code | http | 原因 | 修复 |
|---|---|---|---|
| `discord_invalid_token` | 401 | bot token 错或被 reset | 开发者后台 Reset Token 后重粘 |
| `discord_missing_intent` | 403 | Message Content Intent 没开 | 开发者后台 → Bot 打开 |
| `discord_channel_not_found` | 404 | channel ID 错或 bot 不在服务器 | 重新邀请,重取 ID |
| `discord_perm_denied` | 403 | bot 缺 Send Messages / Embed Links | 用对的权限重新邀请 |
| `discord_rate_limited` | 429 | 路由级 bucket | 遵守 `Retry-After` |
| `discord_embed_too_long` | 400 | embed 总长 > 6000 字符 | opendray 自动拆,可调小 `snippet.max_lines` |

## Limitations

| 限制 | 数值 | 备注 |
|---|---|---|
| embed 总长 | 6000 字符 | title + description + fields 合计;自动拆分 |
| 按钮 label | 80 字符 | Discord 限制 |
| `custom_id` | 100 字符 | Discord 限制;opendray 用不透明 ID |
| Privileged intents | 100+ 服务器的 bot 需要审核 | 单服务器无限制 |

<details>
<summary>📖 叙事说明</summary>

Discord 用持续的 Gateway WebSocket 做入站,REST API 做出站。Bot 在
连接时身份认证一次,断线由 opendray 自动重连。

Bot token 高度敏感:泄露 = 任何人都能控制 bot 在它加入的每个服务器
里发消息。怀疑泄露立刻去开发者后台 Reset。

Message Content Intent 是个坑。Discord 要求你显式 opt-in 才能收到
消息文本 —— 不开的话,每条入站 `message.content` 都是空,bot 基本
没用。在 Bot → Privileged Gateway Intents 里打开。

</details>
