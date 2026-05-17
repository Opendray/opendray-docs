---
kind: capability
title: Telegram
tldr: Get a bot token from @BotFather, paste it under Channels → New → kind=telegram. Long-poll, no public URL needed.
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

> **tldr:** Get a bot token from @BotFather, paste it under **Channels → New → kind=telegram**. Long-poll, no public URL needed.

## Setup

| # | Action | Where |
|---|---|---|
| 1 | `/newbot` to [@BotFather](https://t.me/BotFather), save the token `<digits>:<base64>` | Telegram |
| 2 | (optional) Add the bot to your target chat, then `/myid` to [@userinfobot](https://t.me/userinfobot) to get the `chat_id` | Telegram |
| 3 | Open opendray **Channels** → **+ New** → kind = `telegram` → paste the token | opendray admin |
| 4 | (optional) Paste the `default_chat_id` so unaddressed sends pick a default destination | opendray admin |
| 5 | Click **Save** — status pill goes from `connecting` → `running` within ~2 s | opendray admin |

## Config schema

```yaml
# Channels → New → kind=telegram
kind: telegram                          # literal, required
token: "<digits>:<base64-url>"          # secret, required; regex /^\d+:[A-Za-z0-9_-]+$/
default_chat_id: integer                # optional; routes unaddressed sends here
notify:
  started:            false             # default false
  idle:               true              # default true
  ended:              true              # default true
  permission_ask:     true              # default true
repeat_policy: once-per-session         # enum: never | once-per-session | always
snippet:
  enabled:            false             # default false
  max_lines:          10                # default 10, range [1, 200]
enabled: true                           # toggle without deleting
```

## Capabilities

| feature | supported | implementation note |
|---|---|---|
| inbound (long-poll) | ✓ | `getUpdates` loop in `internal/channel/telegram/poller.go` |
| outbound HTML | ✓ | `parse_mode=HTML` — supports `<b>`, `<i>`, `<code>`, `<pre>`, `<a href>` |
| inline buttons | ✓ | `reply_markup.inline_keyboard`; callbacks routed via hub |
| reply-to-message routing | ✓ | reply targets original session's stdin |
| edit-in-place | ✓ | used for `idle → running` and `running → done` updates |
| typing indicator | ✓ | `sendChatAction` while session is producing output |
| file upload | ✗ | not implemented (issue #channels-file-upload) |
| voice / video | ✗ | out of scope |

## Errors

| code | http | cause | fix |
|---|---|---|---|
| `channel_kind_unsupported` | 400 | `kind` field is not literal `telegram` | use exact string `telegram` |
| `tg_invalid_token` | 400 | malformed token (wrong shape) | re-check regex `^\d+:[A-Za-z0-9_-]+$` |
| `tg_unauthorized` | 401 | token revoked or wrong | regenerate via `/revoke` then `/token` in @BotFather |
| `tg_chat_not_found` | 404 | wrong `chat_id` or bot kicked from chat | re-invite bot to chat, re-fetch chat_id |
| `tg_rate_limited` | 429 | > 30 msg/s to one chat | set `repeat_policy: once-per-session`; back off per `Retry-After` |
| `tg_message_too_long` | 400 | > 4096 chars after HTML escaping | reduce `snippet.max_lines` or split message |

## Examples

### Send via REST

```http
POST /api/v1/channels/ch_tg_main/send
Authorization: Bearer od_live_xxxxxxxxxx
Content-Type: application/json

{
  "text": "Build #42 passed",
  "session_ref": "s_42"
}
```

Response:

```json
HTTP/1.1 202 Accepted
{ "message_id": "tg_847", "queued_at": "2026-05-17T10:24:00Z" }
```

### Inbound reply → stdin

User replies to a notification card in Telegram. The hub:

1. Receives `update.message.reply_to_message.message_id` via `getUpdates`.
2. Looks up which session sent the original card.
3. Writes the reply text into that session's stdin.

No extra config — works out of the box.

## Limitations

| limit | value | note |
|---|---|---|
| message body | 4096 chars | Telegram-enforced; HTML escaping counts |
| inline button count | 100 / message | Telegram limit |
| callback data | 64 bytes | Telegram limit; opendray uses opaque IDs |
| send rate / chat | 30 / sec | Telegram limit; `repeat_policy` enforces |
| send rate / bot | 30 / sec | aggregate across all chats |

<details>
<summary>📖 Narrative explanation</summary>

Telegram is the easiest channel to wire up because it doesn't need a
public URL — opendray long-polls Telegram for updates, so it works
fine on a home server behind NAT. Getting started is just:

1. Talk to [@BotFather](https://t.me/BotFather) in Telegram, type
   `/newbot`, give the bot a display name and a `_bot`-suffixed
   username.
2. BotFather replies with a token like `1234567890:ABCdef...`. Save
   it; you'll only see it once unless you ask BotFather for it again
   later.
3. In opendray, **Channels** → **+ New** → choose `telegram` from
   the kind dropdown → paste the token.

Most setups also want a *default chat ID*: that's the chat opendray
will fire notifications into when a session's notification doesn't
specify a target chat. To get it, add your bot to the chat you want
to use, then `/myid` to [@userinfobot](https://t.me/userinfobot) — it
replies with your chat's numeric ID.

Once you click **Save**, the channel transitions through
`connecting` → `running` in a couple of seconds. If it sticks on
`connecting`, hit **Edit** → check the token format. If it errors
to `failed`, see the **Errors** table above for the code-to-fix
mapping.

</details>
