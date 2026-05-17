---
kind: concept
title: Multi-session routing
tldr: When you reply in a channel, opendray picks the target session by priority — reply-to-message > /select pin > last-notified. Slash commands always trump routing.
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

# Multi-session routing

> **tldr:** When you reply in a channel, opendray picks the target session by priority — reply-to-message > `/select` pin > last-notified. Slash commands always trump routing.

## Routing priority

| # | Source | Trigger |
|---|---|---|
| 1 | Reply-to-message | Long-press notification → Reply (Telegram / Slack thread / Discord ref / Feishu reply) |
| 2 | `/select <sid>` pin | Explicit slash command pinning |
| 3 | Last-notified session | Fallback — most-recent notification on this channel |

## Reply-to-message (best UX)

Every supported platform exposes "reply to a specific message"
(long-press / right-click → Reply). opendray captures the referenced
message id from the inbound payload and looks it up against an
in-memory index of `(channel, outbound_msg_id) → session_id`.

```
index size: last ~256 outbound notifications per channel
eviction:   LRU
fallback:   if entry evicted → /select pin → last-notified
```

## Slash commands

| Command | Purpose | Example output |
|---|---|---|
| `/sessions` | List recently-notified sessions on this channel | `← /select` marks pinned, `(last)` marks most-recent |
| `/select <sid>` | Pin a session for subsequent replies | `Now routing replies to session ses_abc123` |
| `/select clear` | Unpin → falls back to last-notified | `Pinned session cleared` |
| `/cancel <sid>` | Terminate a session via SIGTERM | `Session ses_abc123 terminated` |
| `/help` | List available commands | (command catalogue) |
| `/notify off` / `/notify on` | Mute / unmute the channel | (see [notifications](./notifications)) |
| `/status` | Show channel + session counts | `2 channels running, 3 sessions live` |

```
/select ses_abc123
→ Now routing replies to session ses_abc123. Use /select clear to unpin.
```

## What happens to the bytes

When the routing target is determined, opendray:

| # | Step | Source |
|---|---|---|
| 1 | Forward text + trailing `\r` (Enter) into session stdin | `Manager.Input(sid, payload)` |
| 2 | Clear once-mode suppression for that session | `internal/channel/notify.go` |
| 3 | Publish `channel.message_forwarded` event for audit | `internal/eventbus/` |

The `\r` is critical: TUIs running in raw mode (Claude Code,
Codex, Gemini) treat `\r` as Enter (submit) and `\n` as
shift-Enter (insert newline). Sending `\n` puts text in the input
box but doesn't submit it.

## Slash commands always trump routing

Any text that parses as a slash command (`/help`, `/cancel`,
`/notify`, `/select`, `/sessions`, `/status`, plus custom commands
the app registered) skips routing entirely and runs through the
command dispatcher. The reply lands in the same chat but never
touches a session's stdin.

This is why `/cancel ses_abc` doesn't accidentally type "/cancel
ses_abc" into Claude's input box.

## Errors

| code / message | cause | fix |
|---|---|---|
| `Could not deliver to ses_xxx: session not found` | pinned session ended | `/sessions` → `/select <new-sid>` or send non-command (last-notified fallback) |
| `Could not deliver: session ended` (after reply-to-message) | message routed correctly but session ended | restart via web UI or `/spawn-like ses_xxx` |
| Reply targets wrong session | last-notified was from a different session | use reply-to-message or `/select` to pin |

![Telegram long-press reply](/tutorial/routing-reply-to-message.png)

<details>
<summary>📖 Narrative explanation</summary>

As long as the original notification message is still in chat
history (it usually is — platforms don't auto-delete), replying to
it routes your text to that specific session.

The index holds the most recent ~256 outbound notifications per
channel, with LRU eviction beyond that. Old idle notifications
(weeks back) eventually drop out — at that point the reply falls
back to priority 2 or 3.

When you're going to send several messages to the same session, pin
it once with `/select` so you don't have to remember to long-press
each time. `/sessions` lists candidates with a tap-to-copy `/select
ses_xyz` line for each.

</details>
