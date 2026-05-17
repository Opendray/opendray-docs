---
kind: capability
title: WeCom / Enterprise WeChat (企业微信)
tldr: Add a group robot to a WeCom group → save webhook URL → paste under Channels → New → kind=wecom. Outbound only — no inbound, no callback buttons.
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

# WeCom / Enterprise WeChat (企业微信)

> **tldr:** Add a group robot to a WeCom group → save the webhook URL → paste under **Channels → New → kind=wecom**. Outbound only — no inbound replies, no callback buttons.

## Setup

| # | Action | Where |
|---|---|---|
| 1 | WeCom **desktop** client → open target group → Group settings | WeCom client (desktop) |
| 2 | Group bots (群机器人) → **Add Robot** → **Group robot (Webhook)** | WeCom client |
| 3 | Name it (`OpenDray`) → Confirm → save webhook URL (`https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=...`) | WeCom client |
| 4 | opendray **Channels → New → kind=wecom** → paste webhook URL (or just the `key=` value) → Save | opendray admin |

## Config schema

```yaml
kind: wecom                                 # literal, required
webhook_url: "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=..."  # required
# or: webhook_key: "abc-123-..." (just the key value); if both set, webhook_url wins.
notify:
  started:          false
  idle:             true
  ended:            true
  permission_ask:   true
repeat_policy: once-per-session             # important — 20/min rate limit
snippet:
  enabled:    false
  max_lines:  10
enabled: true
```

## Capabilities

| feature | supported | implementation note |
|---|---|---|
| outbound text | ✓ | `msgtype: text` |
| outbound markdown | ✓ | `msgtype: markdown` — WeCom subset |
| URL buttons (as link rows) | ✓ | rendered as `[label](url)` markdown at bottom |
| callback buttons | ✗ | `cmd:` values dropped |
| inbound replies | ✗ | requires App Platform setup, not yet implemented |

## Card rendering

| Card element | Output |
|---|---|
| `CardHeader.Title` | `**Title**` (bold) |
| `CardMarkdown` | passthrough markdown |
| `CardDivider` | `---` |
| `CardActions` URL buttons | `[label](url)` link row at bottom |
| `CardActions` `cmd:` buttons | dropped |
| `CardNote` | `> note` blockquote |

WeCom markdown subset:
- `**bold**`, `_italic_`
- `[label](url)`
- `<font color="info|warning|comment">…</font>`
- Inline code `` `code` ``
- ✗ tables, ✗ fenced code blocks, ✗ headers (`#`)

## Errors

| code | http | cause | fix |
|---|---|---|---|
| `wecom_invalid_webhook` | 400 | URL has no `key=` query | re-copy from Group settings |
| `wecom_rate_limited` | 429 | > 20 msg/min | enable `repeat_policy: once-per-session` |
| `wecom_invalid_msgtype` | 400 | unsupported msgtype | opendray defaults to markdown — should not occur |
| `wecom_unsupported_markdown` | 400 | feature not in WeCom subset | strip tables / headers / code blocks |

## Limitations

| limit | value | note |
|---|---|---|
| direction | outbound only | bidirectional needs App Platform path, not yet implemented |
| rate limit | 20 msg/min per robot | same as DingTalk |
| markdown subset | constrained | no tables, no code fences, no headings |
| webhook URL | bearer credential | anyone with URL can post; don't commit |
| group bot UI | desktop client only | mobile WeCom hides the group-bot UI in some versions |

<details>
<summary>📖 Narrative explanation</summary>

The simplest WeCom integration. Like DingTalk's group robot it's
outbound-only — bidirectional WeCom needs the app-platform path
(corp_id + agent_id + secret + AES-encrypted callback URL) which
isn't shipped yet.

The webhook URL is a bearer credential: anyone with the URL can post
to the group. Don't commit it to source control. opendray stores it
encrypted at rest.

Markdown rendering is limited compared to Telegram or Slack. Tables
and code blocks look bad — the `formatForTelegram` HTML conversion
doesn't apply here, so longer Claude responses with tables won't
render as cleanly. The `repeat_policy: once-per-session` default
keeps you well under the 20/min rate limit.

</details>
