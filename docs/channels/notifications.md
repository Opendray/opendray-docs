---
kind: concept
title: Notifications panel
tldr: Per-channel control over which session events fire (started / idle / ended / permission_ask), how often (repeat policy), and what content (terminal snippet) gets included.
status: stable
since: v0.1.0
topic: channels
related:
  - channels/overview
  - channels/routing
references:
  capabilities: [channels]
x-implementation:
  - internal/channel/notify.go
  - internal/channel/snippet.go
---

# Notifications panel

> **tldr:** Per-channel control over which session events fire (`session.started` / `idle` / `ended` / `permission_ask`), how often (repeat policy), and what content (terminal snippet) gets included.

## What it is

Every non-bridge channel exposes a Notifications panel inside the
**Edit channel** dialog. It controls three things, independent per
channel:

| Control | Decides |
|---|---|
| Notify-on (event toggles) | which events trigger a notification |
| Repeat policy | suppress duplicates within a window |
| Terminal snippet | embed recent CLI output in the notification |

## Event toggles

| Event | Default | Fires when |
|---|---|---|
| `session.started` | OFF | session spawned |
| `session.idle` | ON | no output for the configured threshold (default 30s) |
| `session.ended` | ON | session process exited |
| `session.permission_ask` | ON | CLI asked for permission (Claude `--bypass-permissions=off`) |

Toggle in the panel. Uncheck all → channel is silent on outbound but
still receives inbound replies.

## Repeat policy

| Mode | Behaviour | When to use |
|---|---|---|
| `once-per-session` (default) | Fire once per `(channel, topic, session)` triple; reset on session end, reply, or 24h TTL | Solo use — collapses Claude's spinner-induced active→idle into one ping per turn |
| `time-window` | Suppress repeats for `1m / 5m / 15m / 30m / 60m` | Long-running deploys — periodic check-ins |
| `always` | No suppression | Low-volume channels or debugging |

```yaml
repeat_policy: once-per-session       # default
# or
repeat_policy: time-window
repeat_window: 5m                     # 1m | 5m | 15m | 30m | 60m
# or
repeat_policy: always
```

## Terminal snippet

When enabled, the idle / permission-ask notification embeds recent
CLI output.

```yaml
snippet:
  enabled:   true           # default false
  max_lines: 10             # default 10, range [1, 200]
  max_chars: 0              # 0 = no cap (default); 1000 | 3000 | 6000 | 12000
```

### Snippet source by CLI

| CLI | Snippet source | Implementation |
|---|---|---|
| Claude (claude code) | `~/.claude/projects/<encoded-cwd>/<latest>.jsonl` last turn | `internal/channel/snippet/claude.go` |
| Codex / Gemini / Shell | vt10x virtual terminal (live web-terminal equivalent) | `internal/channel/snippet/vt.go` |

Claude TUI chrome (model bar, "bypass permissions" hint, status
spinners, separator runs) is stripped via regex before rendering.

### Per-platform rendering

| Platform | Renders as | Notes |
|---|---|---|
| Telegram | HTML mode | bold / italic / code / blockquote / headings work; tables → vertical key:value |
| Slack | `mrkdwn` Block | `*bold*` single asterisk; no headings |
| Discord | embed `description` | capped at 4096 chars |
| Feishu | Card v2 markdown (`lark_md`) | |
| DingTalk | actionCard markdown | constrained subset |
| WeCom | markdown subset | no tables, no code fences, no headings |
| Bridge | adapter-defined | |

## Mute toggle (chat-side)

| Command | Effect |
|---|---|
| `/notify off` | Sets `muted: true` on the channel; dispatch loop skips it |
| `/notify on` | Clears the flag |

Faster than the admin UI when you just want to silence one channel
for the day. Persists in channel config across restarts.

## Capabilities

| feature | supported | note |
|---|---|---|
| per-event toggle | ✓ | 4 event types currently |
| once-per-session dedup | ✓ | resets on end / reply / 24h TTL |
| time-window dedup | ✓ | preset windows 1m–60m |
| snippet from Claude session log | ✓ | richest output |
| snippet from vt10x | ✓ | for non-Claude CLIs |
| inline chat mute | ✓ | `/notify off` |

<details>
<summary>📖 Narrative explanation</summary>

The most-asked-about control is **repeat policy**. The default
*once-per-session* exists because CLI tools that emit periodic
output (Claude's "thinking" spinner, code-streaming) cause many
active→idle transitions per actual conversational turn. *Once* mode
collapses them into one ping per turn — what you almost always want.

The 24-hour safety TTL exists so that a long-idle session (run
overnight) doesn't permanently suppress notifications. If something
genuinely interesting happens 25 hours later, you'll get a ping.

For the snippet, the default is *No cap* on Telegram because
Telegram automatically chunks long content into multiple messages
with the action buttons attached to the last chunk. Other channels
apply their own platform-specific sizing (DingTalk's 20 KB limit,
Discord's 4096-char embed). If you specifically want shorter
notifications (e.g. on a noisy channel where you skim), pick a
char cap — trimmed content shows a `[…]` prefix marker.

</details>
