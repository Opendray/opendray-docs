---
kind: capability
title: Discord
tldr: Create Discord app + bot → enable Message Content Intent → invite to server → paste token under Channels → New → kind=discord. Gateway WS, no public URL.
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

> **tldr:** Create a Discord application + bot → enable Message Content Intent → invite to server → paste bot token under **Channels → New → kind=discord**. Gateway WebSocket; no public URL needed.

## Setup

| # | Action | Where |
|---|---|---|
| 1 | [discord.com/developers/applications](https://discord.com/developers/applications) → New Application → Bot → **Reset Token** → save token (one-time reveal) | Discord dev portal |
| 2 | Same Bot page → **Privileged Gateway Intents** → enable **Message Content Intent** (required) | Discord dev portal |
| 3 | OAuth2 → URL Generator → scopes `bot` + `applications.commands` → permissions `Send Messages`, `Embed Links`, `Read Message History` → open URL → authorize | Discord dev portal |
| 4 | Discord client → User Settings → Advanced → **Developer Mode** ON → right-click channel → **Copy Channel ID** | Discord client |
| 5 | opendray **Channels → New → kind=discord** → paste bot token + default channel ID → Save | opendray admin |

## Config schema

```yaml
kind: discord                            # literal, required
bot_token: string                        # secret, required, regex /^[A-Za-z0-9._-]{50,}$/
default_channel_id: "1234567890123456789" # optional, Discord snowflake
guild_id: string                          # optional, scopes the bot to one server
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

| feature | supported | implementation note |
|---|---|---|
| inbound (Gateway WS) | ✓ | persistent WS, auto reconnect on disconnect |
| embeds | ✓ | `CardHeader` → embed `title` + colour; `CardMarkdown` → `description` |
| interactive buttons | ✓ | `action_row` with `button` (style 1=primary, 4=danger, 2=secondary) |
| select menus | ✓ | `CardSelect` → string select component |
| reply routing | ✓ | `message_reference` reply lands in session stdin |
| edit-in-place | ✓ | for state-change updates |
| threading | ◐ | message replies use threads when available |
| Message Content Intent | required | without it inbound `content` is empty |
| file upload | ✗ | not implemented |
| slash commands | ◐ | scope present but no commands registered by default |

## Errors

| code | http | cause | fix |
|---|---|---|---|
| `discord_invalid_token` | 401 | bot token wrong / reset | Reset Token in dev portal, re-paste |
| `discord_missing_intent` | 403 | Message Content Intent off | toggle in dev portal → Bot |
| `discord_channel_not_found` | 404 | wrong channel ID or bot not in server | re-invite, re-copy ID |
| `discord_perm_denied` | 403 | bot lacks Send Messages / Embed Links | re-invite with proper perms |
| `discord_rate_limited` | 429 | per-route bucket | respect `Retry-After` |
| `discord_embed_too_long` | 400 | embed total > 6000 chars | opendray auto-splits but check `snippet.max_lines` |

## Examples

### Embed card via REST

```http
POST /api/v1/channels/ch_discord_main/send
Authorization: Bearer od_live_xxx
Content-Type: application/json

{
  "text": "Build #42 passed",
  "session_ref": "s_42",
  "card": {
    "header": "Deploy ready",
    "color": "green",
    "actions": [
      { "label": "Approve", "style": "primary", "value": "approve:42" }
    ]
  }
}
```

Named colours (`green` / `red` / `yellow` / `purple` / `cyan`) map to
RGB hex per `colorMap` in `internal/channel/discord/discord.go`.

## Limitations

| limit | value | note |
|---|---|---|
| embed total | 6000 chars | title + description + fields combined; auto-split |
| button label | 80 chars | Discord limit |
| `custom_id` | 100 chars | Discord limit; opendray uses opaque IDs |
| privileged intents | required for bots in 100+ servers | unrestricted for single-server |
| moderation filters | best-effort | links-heavy notifications may be flagged |

<details>
<summary>📖 Narrative explanation</summary>

Discord uses a persistent Gateway WebSocket for inbound and a REST
API for outbound. The bot identifies once on connect; reconnects are
handled automatically by opendray.

Bot tokens are highly sensitive: a leaked token lets anyone control
the bot in every server it's joined. Reset from the dev portal if
exposure is suspected.

The Message Content Intent is the gotcha. Discord requires you to
explicitly opt into receiving message text — without it, every
inbound `message.content` field is empty and the bot is effectively
useless. Toggle it on under Bot → Privileged Gateway Intents.

The embed model maps cleanly onto opendray's internal Card model.
Long responses split into multiple embed messages automatically when
they would exceed the 6000-char embed cap.

</details>
