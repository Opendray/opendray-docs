---
kind: capability
title: 钉钉 DingTalk
tldr: 钉钉群加自定义群机器人 → 保存 webhook URL + SEC 签名密钥 → Channels → New → kind=dingtalk 粘进去。仅出站 — 没入站回复,没回调按钮。
status: stable
since: v0.1.0
topic: channels
related:
  - channels/overview
  - channels/feishu
  - channels/notifications
capability:
  - text
  - markdown-card
  - action-card
  - url-buttons
inbound: none
outbound: group-robot
public-url-required: false
setup-time-minutes: 3
x-implementation:
  - internal/channel/dingtalk/
---

# 钉钉 DingTalk

> **tldr:** 钉钉群加自定义群机器人 → 保存 webhook URL + `SEC...` 签名密钥 → **Channels → New → kind=dingtalk** 粘进去。仅出站 —— 没入站回复,没回调按钮。

## 什么场景用

| 你需要 | 用 |
|---|---|
| 只要通知,不要回复 | 钉钉群机器人 ✓ |
| 要回复 / 交互式回调 | 飞书(v1)或 bridge 适配器 |

## Setup

| # | 操作 | 在哪做 |
|---|---|---|
| 1 | 钉钉群 → ⋯ → **群设置** → **群机器人** → **添加机器人** | 钉钉客户端 |
| 2 | 选 **自定义** → 命名(`OpenDray`) | 钉钉客户端 |
| 3 | **安全设置** → 选 **加签**(推荐) → 保存 `SEC...` 密钥 | 钉钉客户端 |
| 4 | 点 **完成** → 复制 webhook URL(`https://oapi.dingtalk.com/robot/send?access_token=...`) | 钉钉客户端 |
| 5 | opendray **Channels → New → kind=dingtalk** → 粘 webhook + 签名密钥 → Save | opendray 后台 |

## Config schema

```yaml
kind: dingtalk                              # 字面量,必填
webhook_url: "https://oapi.dingtalk.com/robot/send?access_token=..."  # 必填
sign_secret: "SEC..."                       # 选 '加签' 模式时必填
                                            # opendray 自动追加 &timestamp=...&sign=...
notify:
  started:          false
  idle:             true
  ended:            true
  permission_ask:   true
repeat_policy: once-per-session             # 重要 — 钉钉 20/min 限流
snippet:
  enabled:    false
  max_lines:  10
enabled: true
```

## Capabilities

| 能力 | 支持 | 实现备注 |
|---|---|---|
| 出站 markdown | ✓ | `msgtype: markdown` |
| 出站 actionCard | ✓ | 卡片有 URL 按钮时启用 |
| URL 按钮 | ✓ | `actionCard.btns[].actionURL` |
| 回调按钮 | ✗ | 群机器人不能触发回调,`cmd:` 值被丢弃 |
| 加签模式(HMAC) | ✓ | 自动追加 `timestamp` + `sign` |
| 关键词模式 | ◐ | 每条消息含关键词才生效 |
| IP 白名单模式 | ◐ | opendray 出口 IP 固定时可用 |
| 入站回复 | ✗ | 未实现,需要 App Platform 配置 |

## Errors

| code | http | 原因 | 修复 |
|---|---|---|---|
| `dingtalk_invalid_webhook` | 400 | URL 错或缺 `access_token` | 群设置 → 机器人 重新拷贝 |
| `dingtalk_signature_required` | 401 | 服务端拒绝无签调用 | 设 `sign_secret`(钉钉里选加签模式) |
| `dingtalk_signature_mismatch` | 401 | 时钟漂移 > 1h 或密钥错 | NTP 同步主机;重拷贝 `SEC...` |
| `dingtalk_keyword_missing` | 400 | 关键词模式但消息不含关键词 | 消息加关键词或切加签 |
| `dingtalk_rate_limited` | 429 | 单机器人 > 20 msg/min | 开 `repeat_policy: once-per-session` |
| `dingtalk_payload_too_large` | 413 | > 20 KB | 调小 `snippet.max_lines` |

## Limitations

| 限制 | 数值 | 备注 |
|---|---|---|
| 方向 | 仅出站 | 双向需要 App Platform 配置,未实现 |
| 限流 | 20 msg/min / 机器人 | `repeat_policy: once-per-session` 足以应对 |
| Payload | ~20 KB | 比 Telegram 4096 字符紧;自动分块 |
| 签名时间戳容差 | ±1 小时 | 主机时钟需要大致 NTP 同步 |
| 回调按钮 | 不支持 | 只渲染 URL 按钮 |

<details>
<summary>📖 叙事说明</summary>

钉钉群机器人是推通知到聊天最简单的方式。仅出站 —— 没入站、没回调
按钮 —— 但跟 *session.idle* + *Once per session* 模式配合,做"活儿
完了告诉我"的提醒挺合适。

其他安全选项(除了加签):

- **关键词**:每条消息必须包含固定子串,否则钉钉丢弃。不方便(每条
  通知都要带关键词)。
- **IP 白名单**:按源 IP 限制。opendray 跑在固定出口 IP 时有用。

要做双向钉钉需要 App Platform 配置(corp_id + agent_id + secret +
AES 加密回调 URL),目前未实现。如果一定要双向,用 `bridge` channel
+ 自己用 Python 写个适配器接 App Platform SDK。

</details>
