---
kind: capability
title: Bridge — custom platforms via WebSocket
tldr: Channels → New → kind=bridge → save the WS URL + token → run an adapter in any language. The adapter speaks opendray's WS protocol; opendray treats it as a normal channel.
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

# Bridge — custom platforms via WebSocket

> **tldr:** **Channels → New → kind=bridge** → save the WS URL + token → run an adapter in any language. The adapter speaks opendray's WS protocol; opendray treats it as a regular channel.

## When to use

| You need | Use |
|---|---|
| Platform not in bundled list (LINE, KakaoTalk, internal IM, ...) | bridge ✓ |
| Custom user ↔ session routing logic | bridge ✓ |
| Non-IM trigger source (cron, build status, webhooks) | bridge ✓ |
| Bidirectional support for DingTalk / WeCom (currently outbound only) | bridge + App Platform adapter |

## Setup

| # | Action | Where |
|---|---|---|
| 1 | opendray **Channels → New → kind=bridge** → name it (`wechat-custom`) → auto-generate adapter token (24-byte hex) | opendray admin |
| 2 | Optionally set **Accept capabilities** to a whitelist (otherwise accepts whatever the adapter declares) | opendray admin |
| 3 | Save → **Setup** dialog opens with WS URL + ready-to-paste Python/Node/wscat snippets | opendray admin |
| 4 | Run the adapter against the upstream platform | external process |

## Config schema

```yaml
kind: bridge                                # literal, required
name: string                                # human label, e.g. "wechat-custom"
adapter_token: hex                          # secret, auto-generated 24-byte; rotate via ↻
accept_capabilities:                        # optional whitelist
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

## Adapter authentication

| Method | Example |
|---|---|
| HTTP header | `X-Bridge-Token: <token>` |
| HTTP header | `Authorization: Bearer <token>` |
| Query param | `?token=<token>` |
| First WS frame | `{"type":"register", "token":"...", ...}` |

The first frame **must** be a `register`:

```json
{
  "type": "register",
  "platform": "wechat-custom",
  "capabilities": ["text", "card", "buttons", "image"],
  "metadata": { "version": "1.0.0" }
}
```

opendray replies `{"type":"register_ack","ok":true}` (or
`ok:false` with an `error` field).

## Inbound: adapter → opendray

```json
// user message
{
  "type": "message",
  "session_key": "wechat-custom:gid42:user123",
  "conversation_id": "gid42",
  "user_id": "user123",
  "user_name": "Alice",
  "text": "Hello opendray",
  "reply_ctx": "<adapter-opaque-handle>"
}

// button click
{
  "type": "card_action",
  "session_key": "...",
  "conversation_id": "...",
  "action": "cmd:/cancel sess1",
  "reply_ctx": "..."
}
```

`reply_ctx` is opaque to opendray — echoed back on every outbound
frame so the adapter can correlate.

opendray's Hub recognises `cmd:/...` actions and dispatches them
through the slash-command registry.

## Outbound: opendray → adapter

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
        { "text": "End",    "value": "cmd:/cancel abc", "style": "danger" }
      ]]}
    ]
  }
}

{ "type": "send_buttons", "session_key": "...", "text": "...", "buttons": [...] }
{ "type": "update_message", "session_key": "...", "preview_handle": "<id>", "text": "..." }
{ "type": "send_image",  "session_key": "...", "image": { "path": "...", "url": "..." } }
{ "type": "send_file",   "session_key": "...", "file": { "path": "...", "filename": "..." } }
{ "type": "start_typing", "session_key": "..." }
{ "type": "stop_typing",  "session_key": "..." }
{ "type": "pong" }
```

The adapter only receives frame types corresponding to capabilities
it claimed on register, gated by `accept_capabilities`.

## Heartbeat + reconnect

| concern | behaviour |
|---|---|
| keepalive | opendray sends WS-level Ping every ~54s; most libs auto-Pong |
| app-level ping | adapter may send `{"type":"ping"}` → opendray replies `{"type":"pong"}` |
| reconnect | adapter reconnects any time with same token; fresh `register` replaces prior connection |
| disconnect behaviour | opendray returns `ErrNotSupported` for outbound → Hub falls back to text |

## Capabilities

| feature | supported | implementation note |
|---|---|---|
| inbound message | ✓ | `type: message` frame |
| inbound card action | ✓ | `type: card_action` with `cmd:/...` value |
| outbound text | ✓ | `type: send` |
| outbound card | ✓ | `type: send_card` |
| outbound update | ✓ | `type: update_message` with `preview_handle` |
| typing indicator | ✓ | `start_typing` / `stop_typing` |
| image / file | ✓ | adapter-defined transport |
| capability gating | ✓ | only declared + whitelisted frames flow |

## Errors

| code | cause | fix |
|---|---|---|
| `bridge_auth_failed` | bad token | re-copy or rotate token in opendray |
| `bridge_register_required` | first frame wasn't `register` | send register before any other frame |
| `bridge_capability_not_declared` | adapter sent frame outside its declared capabilities | add to `capabilities` on register or stop sending |
| `bridge_session_unknown` | `session_key` doesn't map to a known session | check Hub routing rules |

## Limitations

| limit | value | note |
|---|---|---|
| reply_ctx size | up to 1 KB | opaque to opendray |
| frame size | up to 256 KB | WS message limit |
| concurrent adapters per bridge | 1 | new register replaces old connection |

<details>
<summary>📖 Narrative explanation</summary>

The bridge's broker registration in opendray persists across WS
disconnects — the adapter can reconnect at any time with the same
token. A fresh `register` frame replaces any prior connection.
While disconnected, opendray returns `ErrNotSupported` for outbound
calls (which the Hub treats as "fall back to text").

A minimal Python adapter starter is auto-rendered in the **Adapter
setup** dialog of every bridge channel, with your specific URL +
token + name + capability list substituted, so you can paste-and-
run.

The full protocol spec — every frame type, every edge case, every
error envelope — lives at
[`docs/bridge-protocol.md`](https://github.com/Opendray/opendray_v2/blob/main/docs/bridge-protocol.md)
in the v2 repository.

</details>
