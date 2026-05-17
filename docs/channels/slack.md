---
kind: capability
title: Slack
tldr: Create Slack app → enable Socket Mode → grab xoxb + xapp tokens → paste under Channels → New → kind=slack. No public URL needed (Socket Mode).
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

> **tldr:** Create a Slack app → enable Socket Mode → grab `xoxb-` + `xapp-` tokens → paste under **Channels → New → kind=slack**. No public URL — Socket Mode runs an outbound WS.

## Setup

| # | Action | Where |
|---|---|---|
| 1 | Create a Slack app at [api.slack.com/apps](https://api.slack.com/apps) → *From scratch* | Slack admin |
| 2 | Enable **Socket Mode**; generate App-Level token with scope `connections:write` → save the `xapp-` token | Slack admin → Socket Mode |
| 3 | **OAuth & Permissions** → add bot scopes: `chat:write`, `channels:history`, `groups:history`, `im:history`, optionally `chat:write.public` → Install to workspace → save `xoxb-` token | Slack admin |
| 4 | **Event Subscriptions** → On → subscribe to bot events: `message.channels`, `message.groups`, `message.im` | Slack admin |
| 5 | **Interactivity & Shortcuts** → On (no URL needed) | Slack admin |
| 6 | In Slack: `/invite @YourBotName` to the target channel; right-click channel → channel ID (`C0123ABC456`) | Slack client |
| 7 | opendray **Channels → New → kind=slack** → paste bot token + app token + default channel id → Save | opendray admin |

## Config schema

```yaml
kind: slack                              # literal, required
bot_token: "xoxb-..."                    # secret, required, regex /^xoxb-/
app_token: "xapp-..."                    # secret, required, regex /^xapp-/
default_channel_id: "C0123ABC456"        # optional
signing_secret: string                   # optional, only if using HTTP Events (vs Socket Mode)
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
| inbound (Socket Mode) | ✓ | outbound WS, no public URL |
| Block Kit blocks | ✓ | `header` / `section` / `divider` / `actions` / `context` mapped from card model |
| interactive buttons | ✓ | `actions` block with `button` element; `primary` / `danger` styles |
| threading | ✓ | reply goes back as `thread_ts` |
| reply routing | ✓ | thread reply lands in original session's stdin |
| edit-in-place | ✓ | for `idle` → `running` updates |
| HTTP Events API | ◐ | supported but not default — set `signing_secret` to use |
| file upload | ✗ | not implemented |

## Errors

| code | http | cause | fix |
|---|---|---|---|
| `slack_invalid_token` | 401 | wrong token / regex mismatch | re-check `xoxb-` and `xapp-` prefixes |
| `slack_missing_scope` | 403 | bot scope missing for the action | re-install app with required scope |
| `slack_channel_not_found` | 404 | bad `channel_id` or bot not invited | `/invite @bot` to target channel |
| `slack_thread_archived` | 410 | thread closed | start a new conversation |
| `slack_rate_limited` | 429 | per-method tier | respect `Retry-After` |

## Examples

### Block Kit card via REST

```http
POST /api/v1/channels/ch_slack_main/send
Authorization: Bearer od_live_xxx
Content-Type: application/json

{
  "text": "Build #42 passed",
  "session_ref": "s_42",
  "card": {
    "header": "Deploy ready",
    "actions": [
      { "label": "Approve", "style": "primary", "value": "approve:42" },
      { "label": "Hold",    "style": "danger",  "value": "hold:42" }
    ]
  }
}
```

## Limitations

| limit | value | note |
|---|---|---|
| `mrkdwn` syntax | non-standard | bold = `*text*` (NOT `**`); italic = `_text_`; link = `<url\|label>` |
| heading / table rendering | ✗ | `#` / `|---|` render literally |
| Free plan history | capped | older notifications may disappear from search |
| public_distribution | manual review | keep app private until sure |
| send rate | per-method tier | see Slack rate limit docs |

<details>
<summary>📖 Narrative explanation</summary>

Slack's Socket Mode lets bots open an outbound WebSocket back to
Slack instead of receiving webhooks — opendray can run behind a NAT
without exposing anything publicly. That makes the setup a 7-step
admin-console crawl, but no firewall changes.

The longest step is usually adding all the bot scopes. The
must-haves are `chat:write` (post messages) and `*.history` for the
channel kinds you care about (`channels.history` for public,
`groups.history` for private, `im.history` for DMs). Add
`chat:write.public` if you want the bot to be able to fire
notifications into channels it isn't a member of.

Block Kit is Slack's structured-card model. opendray maps its
internal Card model (`CardHeader`, `CardMarkdown`, `CardActions`,
`CardListItem`, `CardSelect`, `CardNote`) onto matching Block Kit
blocks. Buttons styled `primary` / `danger` map to Slack's primary
/ danger button styles. The mapping lives in
`internal/channel/slack/blockkit.go`.

When a user replies to a notification card in-thread, opendray
captures the `thread_ts` and threads all subsequent updates from
that session under the same parent message — keeping the back-and-
forth in one place.

</details>
