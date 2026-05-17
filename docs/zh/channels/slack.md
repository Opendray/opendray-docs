---
kind: capability
title: Slack
tldr: 创建 Slack app → 开 Socket Mode → 拿 xoxb + xapp token → Channels → New → kind=slack 粘进去。不需要公网 URL。
status: stable
since: v0.1.0
topic: channels
related:
  - channels/overview
  - channels/notifications
  - channels/routing
capability:
  - text
  - block-kit
  - interactive-buttons
  - threading
  - reply-routing
  - edit-in-place
inbound: socket-mode
outbound: web-api
public-url-required: false
setup-time-minutes: 10
x-implementation:
  - internal/channel/slack/
x-api-version: slack-bolt-2024
---

# Slack

> **tldr:** 创建 Slack app → 开 Socket Mode → 拿 `xoxb-` + `xapp-` token → **Channels → New → kind=slack** 粘进去。Socket Mode 跑外联 WS,不需要公网 URL。

## Setup

| # | 操作 | 在哪做 |
|---|---|---|
| 1 | [api.slack.com/apps](https://api.slack.com/apps) → Create New App → *From scratch* | Slack 后台 |
| 2 | 启用 **Socket Mode** → 创建 App-Level token,scope `connections:write` → 保存 `xapp-` token | Slack 后台 |
| 3 | **OAuth & Permissions** → bot scope 加 `chat:write`、`channels:history`、`groups:history`、`im:history`,可选 `chat:write.public` → 安装到 workspace → 保存 `xoxb-` token | Slack 后台 |
| 4 | **Event Subscriptions** → On → 订阅 `message.channels`、`message.groups`、`message.im` | Slack 后台 |
| 5 | **Interactivity & Shortcuts** → On(Socket Mode 不需要 URL) | Slack 后台 |
| 6 | Slack 客户端 `/invite @你的Bot` 到目标频道,右键频道 → channel ID(`C0123ABC456`) | Slack 客户端 |
| 7 | opendray **Channels → New → kind=slack** → 粘 bot token + app token + 默认 channel id → Save | opendray 后台 |

## Config schema

```yaml
kind: slack                              # 字面量,必填
bot_token: "xoxb-..."                    # 必填密文,正则 /^xoxb-/
app_token: "xapp-..."                    # 必填密文,正则 /^xapp-/
default_channel_id: "C0123ABC456"        # 选填
signing_secret: string                   # 选填,只在用 HTTP Events(非 Socket Mode)时需要
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
| 入站(Socket Mode) | ✓ | 外联 WS,不需要公网 URL |
| Block Kit | ✓ | `header` / `section` / `divider` / `actions` / `context` 从 card model 映射 |
| 交互式按钮 | ✓ | `actions` block 的 `button`,`primary` / `danger` 样式 |
| 线程化 | ✓ | 回复带 `thread_ts` |
| 回复路由 | ✓ | 线程回复进原会话 stdin |
| 原地编辑 | ✓ | `idle → running` 状态变更复用 |
| HTTP Events API | ◐ | 支持但非默认,设 `signing_secret` 启用 |
| 文件上传 | ✗ | 未实现 |

## Errors

| code | http | 原因 | 修复 |
|---|---|---|---|
| `slack_invalid_token` | 401 | token 错或正则不匹配 | 重检 `xoxb-` / `xapp-` 前缀 |
| `slack_missing_scope` | 403 | bot scope 缺该操作 | 加 scope 后重新安装 app |
| `slack_channel_not_found` | 404 | channel_id 错或 bot 没被邀请 | `/invite @bot` 到目标频道 |
| `slack_thread_archived` | 410 | 线程已关闭 | 新开对话 |
| `slack_rate_limited` | 429 | 方法级 tier 限流 | 遵守 `Retry-After` |

<details>
<summary>📖 叙事说明</summary>

Slack Socket Mode 让 bot 通过外联 WebSocket 反向连回 Slack,而不是
接收 webhook —— opendray 在 NAT 后面也能跑,不需要打开任何端口。
代价是后台配置要点 7 步,但不用碰防火墙。

Block Kit 是 Slack 的结构化卡片模型。opendray 把内部 Card 模型
(`CardHeader`、`CardMarkdown`、`CardActions`、`CardListItem`、
`CardSelect`、`CardNote`)映射成对应的 Block Kit blocks。`primary` /
`danger` 样式的按钮映射到 Slack 的对应按钮样式。映射代码在
`internal/channel/slack/blockkit.go`。

</details>
