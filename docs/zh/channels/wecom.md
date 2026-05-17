---
kind: capability
title: 企业微信 WeCom
tldr: 企业微信群加群机器人 → 保存 webhook URL → Channels → New → kind=wecom 粘进去。仅出站 — 没入站,没回调按钮。
status: stable
since: v0.1.0
topic: channels
related:
  - channels/overview
  - channels/dingtalk
  - channels/notifications
capability:
  - text
  - markdown
  - url-buttons
inbound: none
outbound: group-robot
public-url-required: false
setup-time-minutes: 2
x-implementation:
  - internal/channel/wecom/
---

# 企业微信 WeCom

> **tldr:** 企业微信群加群机器人 → 保存 webhook URL → **Channels → New → kind=wecom** 粘进去。仅出站 —— 没入站回复,没回调按钮。

## Setup

| # | 操作 | 在哪做 |
|---|---|---|
| 1 | 企业微信 **桌面** 客户端 → 打开目标群 → 群设置 | 企业微信(桌面) |
| 2 | 群机器人 → **添加机器人** → **群机器人(Webhook)** | 企业微信客户端 |
| 3 | 命名(`OpenDray`)→ 确认 → 保存 webhook URL(`https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=...`) | 企业微信客户端 |
| 4 | opendray **Channels → New → kind=wecom** → 粘 webhook URL(或仅 `key=` 值)→ Save | opendray 后台 |

## Config schema

```yaml
kind: wecom                                 # 字面量,必填
webhook_url: "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=..."  # 必填
# 或: webhook_key: "abc-123-..."(仅 key 值);两个都设时 webhook_url 优先
notify:
  started:          false
  idle:             true
  ended:            true
  permission_ask:   true
repeat_policy: once-per-session             # 重要 — 20/min 限流
snippet:
  enabled:    false
  max_lines:  10
enabled: true
```

## Capabilities

| 能力 | 支持 | 实现备注 |
|---|---|---|
| 出站文本 | ✓ | `msgtype: text` |
| 出站 markdown | ✓ | `msgtype: markdown` —— 企业微信子集 |
| URL 按钮(链接行) | ✓ | 渲染为底部 `[label](url)` markdown |
| 回调按钮 | ✗ | `cmd:` 值被丢弃 |
| 入站回复 | ✗ | 需要 App Platform 配置,未实现 |

## Card 渲染

| Card 元素 | 输出 |
|---|---|
| `CardHeader.Title` | `**Title**`(粗体) |
| `CardMarkdown` | 透传 markdown |
| `CardDivider` | `---` |
| `CardActions` URL 按钮 | 底部 `[label](url)` 链接行 |
| `CardActions` `cmd:` 按钮 | 丢弃 |
| `CardNote` | `> note` 引用块 |

企业微信 markdown 子集:
- `**粗体**`、`_斜体_`
- `[label](url)`
- `<font color="info|warning|comment">…</font>`
- 内联代码 `` `code` ``
- ✗ 表格、✗ 围栏代码、✗ 标题(`#`)

## Errors

| code | http | 原因 | 修复 |
|---|---|---|---|
| `wecom_invalid_webhook` | 400 | URL 没 `key=` 参数 | 群设置重拷 |
| `wecom_rate_limited` | 429 | > 20 msg/min | 开 `repeat_policy: once-per-session` |
| `wecom_invalid_msgtype` | 400 | 不支持的 msgtype | opendray 默认 markdown,不该发生 |
| `wecom_unsupported_markdown` | 400 | 用了子集外的功能 | 去掉表格 / 标题 / 代码块 |

## Limitations

| 限制 | 数值 | 备注 |
|---|---|---|
| 方向 | 仅出站 | 双向需要 App Platform 配置,未实现 |
| 限流 | 20 msg/min / 机器人 | 跟钉钉一样 |
| markdown 子集 | 受限 | 没表格、没围栏代码、没标题 |
| webhook URL | bearer 凭据 | 任何拿到 URL 的人都能发;别提交到代码库 |
| 群机器人 UI | 桌面客户端 | 移动端某些版本隐藏了群机器人配置入口 |

<details>
<summary>📖 叙事说明</summary>

最简单的 WeCom 集成。跟钉钉群机器人一样仅出站 —— 双向 WeCom 需要
应用平台路径(corp_id + agent_id + secret + AES 加密回调 URL),
还没实现。

webhook URL 是 bearer 凭据:任何拿到 URL 的人都能往群里发消息。别提
交到源码控制。opendray 加密落盘存储。

Markdown 渲染比 Telegram / Slack 受限。表格和代码块渲染效果差 ——
`formatForTelegram` 的 HTML 转换在这里不生效,带表格的长 Claude 回复
渲染不会那么好看。`repeat_policy: once-per-session` 默认值能让你稳
稳低于 20/min 限流。

</details>
