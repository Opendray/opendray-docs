---
kind: capability
title: DingTalk (钉钉)
tldr: Add a custom group robot to a DingTalk group → save webhook URL + SEC sign secret → paste under Channels → New → kind=dingtalk. Outbound only — no inbound, no callback buttons.
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

# DingTalk (钉钉)

> **tldr:** Add a custom group robot to a DingTalk group → save webhook URL + `SEC...` sign secret → paste under **Channels → New → kind=dingtalk**. Outbound only — no inbound replies, no callback buttons.

## When to use

| You need | Use |
|---|---|
| Notifications only (no replies) | DingTalk group robot ✓ |
| Replies / interactive callbacks | Feishu (v1) or a bridge adapter |

## Setup

| # | Action | Where |
|---|---|---|
| 1 | DingTalk group → ⋯ → **Group settings** → **Group bots** → **Add Robot** | DingTalk client |
| 2 | Pick **Custom (自定义)** → name it (`OpenDray`) | DingTalk client |
| 3 | **Security settings** → pick **Sign (加签)** (recommended) → save the `SEC...` secret | DingTalk client |
| 4 | Click **Done** → copy webhook URL (`https://oapi.dingtalk.com/robot/send?access_token=...`) | DingTalk client |
| 5 | opendray **Channels → New → kind=dingtalk** → paste webhook + sign secret → Save | opendray admin |

## Config schema

```yaml
kind: dingtalk                              # literal, required
webhook_url: "https://oapi.dingtalk.com/robot/send?access_token=..."  # required
sign_secret: "SEC..."                       # required when 'Sign' mode is selected
                                            # opendray auto-appends &timestamp=...&sign=...
notify:
  started:          false
  idle:             true
  ended:            true
  permission_ask:   true
repeat_policy: once-per-session             # important — DingTalk rate-limits 20/min
snippet:
  enabled:    false
  max_lines:  10
enabled: true
```

## Capabilities

| feature | supported | implementation note |
|---|---|---|
| outbound markdown | ✓ | `msgtype: markdown` |
| outbound actionCard | ✓ | when card has URL buttons |
| URL buttons | ✓ | `actionCard.btns[].actionURL` |
| callback buttons | ✗ | group robots can't fire callbacks; `cmd:` values dropped |
| sign-mode (HMAC) | ✓ | auto-appended `timestamp` + `sign` |
| keyword-mode | ◐ | works if every message contains the configured keyword |
| IP allow-list mode | ◐ | works when opendray has a fixed egress IP |
| inbound replies | ✗ | not implemented — requires App Platform setup |

## Card rendering

| Card element | DingTalk mapping |
|---|---|
| `CardHeader.Title` | `actionCard.title` |
| `CardMarkdown` | `actionCard.text` (markdown) |
| `CardActions` with URL values | `actionCard.btns` (each with `actionURL`) |
| `CardActions` with `cmd:` values | dropped silently |
| `CardDivider` | inline `---` |
| `CardNote` | inline `> blockquote` |

When the card has no URL buttons, opendray downgrades to
`msgtype: markdown` instead of `actionCard`.

## Errors

| code | http | cause | fix |
|---|---|---|---|
| `dingtalk_invalid_webhook` | 400 | bad URL or no `access_token` | re-copy from Group settings → Robot |
| `dingtalk_signature_required` | 401 | server rejected unsigned call | set `sign_secret` (Sign mode in DingTalk) |
| `dingtalk_signature_mismatch` | 401 | host clock skew > 1h or wrong secret | NTP-sync host; re-copy `SEC...` |
| `dingtalk_keyword_missing` | 400 | Keyword-mode is on but message lacks the keyword | include keyword in `text` or switch to Sign mode |
| `dingtalk_rate_limited` | 429 | > 20 msg/min per robot | enable `repeat_policy: once-per-session` |
| `dingtalk_payload_too_large` | 413 | > 20 KB | reduce `snippet.max_lines` |

## Limitations

| limit | value | note |
|---|---|---|
| direction | outbound only | bidirectional requires App Platform setup, not yet implemented |
| rate limit | 20 msg/min per robot | `repeat_policy: once-per-session` keeps you well under |
| payload | ~20 KB | tighter than Telegram's 4096 chars; auto-chunked |
| sign timestamp tolerance | ±1 hour | requires roughly NTP-synced clock |
| callback buttons | not supported | only URL buttons render |

<details>
<summary>📖 Narrative explanation</summary>

DingTalk's group robot is the simplest way to push notifications
into a chat. It's outbound-only — no inbound, no buttons that fire
callbacks — but pairs well with the *Notify on session.idle* +
*Once per session* mode for "tell me when work is done" alerts.

The other security options (besides Sign):

- **Custom keyword (关键词)** — every message must contain a fixed
  substring or DingTalk drops it. Less convenient (every
  notification needs to include the keyword).
- **IP allow-list** — restricts by source IP. Useful when opendray
  runs on a fixed egress IP.

To receive replies you need the app-platform setup (corp_id +
agent_id + secret + AES-encrypted callback URL) which is not yet
implemented. For bidirectional DingTalk use a `bridge` channel +
a Python adapter you write against the App Platform SDK.

</details>
