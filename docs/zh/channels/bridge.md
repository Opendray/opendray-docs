---
kind: capability
title: Bridge — 通过 WebSocket 接入自定义平台
tldr: Channels → New → kind=bridge → 保存 WS URL + token → 用任何语言跑一个 adapter。Adapter 说 opendray 的 WS 协议,opendray 把它当普通 channel。
status: stable
since: v0.1.0
topic: channels
related:
  - channels/overview
  - channels/routing
capability:
  - text
  - card
  - buttons
  - image
  - file
  - typing
  - update-message
  - reply-routing
  - adapter-defined
inbound: websocket
outbound: websocket
public-url-required: false
setup-time-minutes: 30
x-implementation:
  - internal/channel/bridge/
x-protocol-spec: docs/bridge-protocol.md
---

# Bridge — 通过 WebSocket 接入自定义平台

> **tldr:** **Channels → New → kind=bridge** → 保存 WS URL + token → 用任何语言跑一个 adapter。Adapter 说 opendray 的 WS 协议,opendray 把它当普通 channel。

## 何时用

| 你需要 | 用 |
|---|---|
| 平台不在内置列表(LINE、KakaoTalk、企业内部 IM…) | bridge ✓ |
| 自定义 user ↔ session 路由逻辑 | bridge ✓ |
| 非 IM 触发源(cron、构建状态、webhook) | bridge ✓ |
| 钉钉 / 企业微信双向(当前仅出站) | bridge + App Platform adapter |

## Setup

| # | 操作 | 在哪做 |
|---|---|---|
| 1 | opendray **Channels → New → kind=bridge** → 命名(`wechat-custom`)→ 自动生成 adapter token(24-byte hex) | opendray 后台 |
| 2 | 可选设 **Accept capabilities** 白名单(否则接受 adapter 自己声明的) | opendray 后台 |
| 3 | Save → **Setup** 对话框打开,显示 WS URL + Python / Node / wscat 即用片段 | opendray 后台 |
| 4 | 在外部进程里跑 adapter,对接上游平台 | 外部进程 |

## Config schema

```yaml
kind: bridge                                # 字面量,必填
name: string                                # 人类标签,e.g. "wechat-custom"
adapter_token: hex                          # 密文,自动生成 24-byte;↻ 可轮换
accept_capabilities:                        # 可选白名单
  - text
  - card
  - buttons
  - image
notify:
  started:          false
  idle:             true
  ended:            true
  permission_ask:   true
repeat_policy: once-per-session
enabled: true
```

## Adapter 认证

| 方式 | 例子 |
|---|---|
| HTTP header | `X-Bridge-Token: <token>` |
| HTTP header | `Authorization: Bearer <token>` |
| Query param | `?token=<token>` |
| 首条 WS 帧 | `{"type":"register", "token":"...", ...}` |

首帧 **必须** 是 `register`:

```json
{
  "type": "register",
  "platform": "wechat-custom",
  "capabilities": ["text", "card", "buttons", "image"],
  "metadata": { "version": "1.0.0" }
}
```

opendray 回 `{"type":"register_ack","ok":true}`(或 `ok:false` 带
`error` 字段)。

## 入站: adapter → opendray

```json
// 用户消息
{
  "type": "message",
  "session_key": "wechat-custom:gid42:user123",
  "conversation_id": "gid42",
  "user_id": "user123",
  "user_name": "Alice",
  "text": "你好 opendray",
  "reply_ctx": "<adapter-不透明 handle>"
}

// 按钮点击
{
  "type": "card_action",
  "session_key": "...",
  "conversation_id": "...",
  "action": "cmd:/cancel sess1",
  "reply_ctx": "..."
}
```

`reply_ctx` 对 opendray 不透明 —— 在每条出站帧里 echo 回去,adapter
自己用来关联。

opendray 的 Hub 识别 `cmd:/...` action,通过 slash-command 注册表
分发。

## 出站: opendray → adapter

```json
{ "type": "send", "session_key": "...", "reply_ctx": "...", "text": "已收到。" }

{ "type": "send_card",
  "session_key": "...",
  "card": {
    "header": { "title": "会话空闲", "color": "yellow" },
    "elements": [
      { "Content": "会话 abc 已空闲。" },
      { "Buttons": [[
        { "text": "继续", "value": "cmd:/resume abc", "style": "primary" },
        { "text": "结束", "value": "cmd:/cancel abc", "style": "danger" }
      ]]}
    ]
  }
}

{ "type": "send_buttons", "session_key": "...", "text": "...", "buttons": [...] }
{ "type": "update_message", "session_key": "...", "preview_handle": "<id>", "text": "..." }
{ "type": "send_image", "session_key": "...", "image": { "path": "...", "url": "..." } }
{ "type": "send_file", "session_key": "...", "file": { "path": "...", "filename": "..." } }
{ "type": "start_typing", "session_key": "..." }
{ "type": "stop_typing", "session_key": "..." }
{ "type": "pong" }
```

Adapter 只收到它在 register 时声明的能力对应的帧,被
`accept_capabilities` 进一步过滤。

## 心跳 + 重连

| 关注点 | 行为 |
|---|---|
| keepalive | opendray 每 ~54s 发 WS 级 Ping,大多数库自动 Pong |
| app 级 ping | adapter 可发 `{"type":"ping"}` → opendray 回 `{"type":"pong"}` |
| 重连 | adapter 用同 token 任意重连;新 `register` 替换旧连接 |
| 断线时行为 | opendray 出站返回 `ErrNotSupported` → Hub 回退到 text |

## Capabilities

| 能力 | 支持 | 实现备注 |
|---|---|---|
| 入站 message | ✓ | `type: message` 帧 |
| 入站 card_action | ✓ | `type: card_action` 带 `cmd:/...` 值 |
| 出站 text | ✓ | `type: send` |
| 出站 card | ✓ | `type: send_card` |
| 出站 update | ✓ | `type: update_message` 带 `preview_handle` |
| typing 指示 | ✓ | `start_typing` / `stop_typing` |
| 图片 / 文件 | ✓ | adapter 自定义传输 |
| 能力门控 | ✓ | 只有声明 + 白名单的帧流通 |

## Errors

| code | 原因 | 修复 |
|---|---|---|
| `bridge_auth_failed` | token 错 | 重拷或在 opendray 里轮换 token |
| `bridge_register_required` | 首帧不是 `register` | 任何帧之前先发 register |
| `bridge_capability_not_declared` | adapter 发了声明能力之外的帧 | register 里加进 `capabilities` 或停发 |
| `bridge_session_unknown` | `session_key` 找不到对应会话 | 检查 Hub 路由规则 |

## Limitations

| 限制 | 数值 | 备注 |
|---|---|---|
| reply_ctx 大小 | ≤ 1 KB | opendray 不解析 |
| 帧大小 | ≤ 256 KB | WS 消息限制 |
| 同时 adapter 数 / bridge | 1 | 新 register 替换旧连接 |

<details>
<summary>📖 叙事说明</summary>

bridge 在 opendray 里的注册跨 WS 断线持久 —— adapter 用同一个 token
随时重连。新的 `register` 帧替换之前的连接。断线期间,opendray 对
出站调用返回 `ErrNotSupported`(Hub 视作"回退到 text")。

每个 bridge channel 的 **Adapter setup** 对话框里自动渲染一个最小
Python adapter starter,把你的具体 URL + token + name + capability
列表都替换好,粘贴即跑。

完整协议规范 —— 每个帧类型、每个边缘 case、每个错误信封 —— 在 v2
仓库的 [`docs/bridge-protocol.md`](https://github.com/Opendray/opendray_v2/blob/main/docs/bridge-protocol.md)。

</details>
