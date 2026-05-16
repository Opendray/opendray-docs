# Bridge — 通过 WebSocket 接入自定义平台

当你需要一个 opendray 不自带的平台(LINE、KakaoTalk、你公司内部 chat 等)时,**bridge** kind 暴露一个外部 adapter 可以说的 WebSocket 协议。用任意语言(Python、Node、Rust)运行 adapter,它就以一个常规频道的形式出现在 opendray 里。

**配置时间:** 取决于目标平台的复杂度。opendray 这边只要 30 秒(一个 token)。adapter 那边看平台要求。

## 什么时候用 bridge

- 目标平台不在内置列表里
- 你需要用户和会话之间的自定义路由逻辑
- 你想集成消息以外的 webhook 源(cron 触发器、构建状态等)

## 1. 在 opendray 中创建一个 bridge 频道位

Channels → **New channel** → kind **bridge**。

| 字段 | 值 |
|---|---|
| **Bridge name** | 人类可读标签,例如 `wechat`、`discord-custom`、`whatsapp` |
| **Adapter token** | 自动生成的 24 字节随机十六进制;点 ↻ 重新生成或 📋 复制 |
| **Accept capabilities** | 可选白名单 — 空时 bridge 接受 adapter 声明的任何东西;非空时只接受所选能力 |

保存,**Enabled = on**。

![Bridge channel form](/tutorial/bridge-create-form.png)

保存后,**Adapter setup** 对话框自动打开,带 WebSocket URL + 可粘可跑的 Python / Node / wscat 起步代码片段。

![Bridge adapter setup with code snippets](/tutorial/bridge-adapter-setup.png)

之后随时可以通过频道卡上的 **Setup** 按钮重新打开这个对话框。

## 2. 运行 adapter

连接到 WebSocket URL。鉴权用 bridge token,通过下列之一:

| Method | 示例 |
|---|---|
| Header | `X-Bridge-Token: <token>` |
| Header | `Authorization: Bearer <token>` |
| Query | `?token=<token>` |
| 第一个 WS 帧 | `{"type":"register", "token":"…", …}` |

第一帧**必须**是一个声明 adapter 身份和能力的 `register`:

```json
{
  "type": "register",
  "platform": "wechat-custom",
  "capabilities": ["text", "card", "buttons", "image"],
  "metadata": { "version": "1.0.0" }
}
```

opendray 回复 `{"type":"register_ack","ok":true}`(或 `ok:false` 加 `error` 字段)。

## 3. 入站:adapter → opendray

当用户在上游平台发消息时,adapter 把它翻译为:

```json
{
  "type": "message",
  "session_key": "wechat-custom:gid42:user123",
  "conversation_id": "gid42",
  "user_id": "user123",
  "user_name": "Alice",
  "text": "Hello opendray",
  "reply_ctx": "<adapter-opaque-handle>"
}
```

`reply_ctx` 是 adapter 之后回复时需要的任何东西 — opendray 在每个出站帧上回声它。通常是平台的消息 id,但格式由 adapter 选定。

按钮点击时(如果 adapter 支持卡片):

```json
{
  "type": "card_action",
  "session_key": "...",
  "conversation_id": "...",
  "action": "cmd:/cancel sess1",
  "reply_ctx": "..."
}
```

opendray 的 Hub 识别 `cmd:/...` 动作并通过斜杠命令注册表派发。

## 4. 出站:opendray → adapter

当会话变空闲(或频道关注的任何其它事件)时,opendray 发送 adapter 必须在上游平台渲染的帧:

```json
{ "type": "send", "session_key": "...", "reply_ctx": "...", "text": "Acknowledged." }

{ "type": "send_card",
  "session_key": "...",
  "card": {
    "header": { "title": "Session idle", "color": "yellow" },
    "elements": [
      { "Content": "Session abc went idle." },
      { "Buttons": [[
        { "text": "Resume", "value": "cmd:/resume abc", "style": "primary" },
        { "text": "End", "value": "cmd:/cancel abc", "style": "danger" }
      ]]}
    ]
  } }

{ "type": "send_buttons", "session_key": "...", "text": "...", "buttons": [...] }
{ "type": "update_message", "session_key": "...", "preview_handle": "<id>", "text": "..." }
{ "type": "send_image", "session_key": "...", "image": { "path": "...", "url": "..." } }
{ "type": "send_file", "session_key": "...", "file": { "path": "...", "filename": "..." } }
{ "type": "start_typing", "session_key": "..." }
{ "type": "stop_typing", "session_key": "..." }
{ "type": "pong" }
```

adapter 只接收与它在 register 时声明的能力对应的帧类型 — opendray 用 `accept_capabilities` 白名单 + adapter 声明的列表把关。

## 5. 心跳

opendray 每约 54 秒发送一个 WebSocket 级 Ping 帧。大部分 WS 库自动回 Pong。adapter 也可以发应用级 `{"type":"ping"}`,opendray 回 `{"type":"pong"}`。

## 6. 重连

opendray 里的 bridge broker 注册跨 WS 断开持久化 — adapter 可以随时用同样的 token 重连。新的 `register` 帧替换之前的连接。断开期间,opendray 对出站调用返回 `ErrNotSupported`(Hub 把它当作 "回退到文本")。

## 参考:最小 Python adapter

每个 bridge 频道的 **Adapter setup** 对话框里已经有。对话框替换为你具体的 URL + token + name + 能力列表,所以可以粘贴直接运行。

## 完整协议规范

仓库里的 `docs/bridge-protocol.md` 有完整帧目录 + 边界情况。adapter setup 对话框用于起步;规范用于生产质量的 adapter。
