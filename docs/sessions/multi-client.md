---
kind: concept
title: Multi-client session access
tldr: Multiple clients can attach to one session (web + mobile + Telegram), but only one should DRIVE at a time. PTY has a single size — last resize wins. For independent state, spawn separate sessions in the same cwd.
status: stable
since: v0.1.0
topic: sessions
related:
  - sessions/overview
  - channels/overview
references:
  capabilities: [sessions]
x-implementation:
  - internal/session/multiclient.go
---

# Multi-client session access

> **tldr:** Multiple clients can attach to one session (web + mobile + Telegram), but only one should DRIVE at a time. PTY has a single size — last resize wins. For independent state, spawn separate sessions in the same cwd.

## Why one-PTY constraint exists

| Layer | Property |
|---|---|
| CLI (Claude / Codex / Gemini) | single process |
| PTY | one size at a time (`TIOCGWINSZ`) |
| Layout style | absolute positioning ("move cursor to (45, 10)") |
| All clients receive | the same already-laid-out byte stream |

The mobile xterm and the web xterm are two windows on the same
image. No middleware can render the CLI at two different sizes
simultaneously.

## Symptoms when multiple clients drive

| Trigger | What happens |
|---|---|
| Web drag-to-resize | FitAddon fires → PTY resized → mobile TUI reflows mid-conversation |
| Mobile connects | sets PTY to mobile width → web shows wide trailing empty cells |
| Desktop + mobile alternating | last resizer wins; TUI reflows back and forth |

## Three workable approaches

### A. Recommended — one client at a time

| Where you are | Use |
|---|---|
| Desktop | web admin |
| Couch / on the go | mobile app |
| Away from machine | Telegram idle notifications (full prose, not screenshots) |

### B. Two sessions, same cwd, independent state

| Trade-off | |
|---|---|
| ✓ Independent | each session has its own PTY + CLI process |
| ✗ Split state | mobile Gemini doesn't see what desktop Gemini knows |
| Fits | "desktop runs long task, mobile fires quick side question" |
| Doesn't fit | "continue my desktop conversation from my phone" |

### C. Desktop only on web, mobile only on app — separate sessions

Most natural workflow: each device owns its own session set. No
cross-device CLI state sharing at all. Idle notifications + Telegram
commands (`/list` / `/end` / `/resume`) still work cross-device.

## Capability matrix

| Concern | Single client | Multi-viewer | Multi-driver |
|---|---|---|---|
| Stable layout | ✓ | ✓ | ✗ |
| Same conversation visible everywhere | ✓ (only here) | ✓ | ✓ |
| Each client independent reflow | ✗ | ✗ | ✗ (impossible with TUI) |
| Independent conversation state | ✗ | ✗ | ✗ (option B fixes this) |
| Telegram idle ping anywhere | ✓ | ✓ | ✓ |

## Why tmux doesn't solve this

tmux takes the **minimum** of all attached client sizes and uses
that for every client. Still one size, still a compromise — the
decision is moved into tmux instead of opendray. No fundamental
difference.

## What true independent multi-client would require

Client-side conversation state (lives on client, not in CLI process)
plus a state-sync layer. That's how Claude / Gemini / Codex's HTTP
APIs work — but NOT how the CLI TUIs work. opendray wraps a TUI CLI
and inherits the TUI's architectural constraints.

If Anthropic / Google ever ship a stateful HTTP API CLI, opendray
can revisit. Until then: use option A or B.

<details>
<summary>📖 Narrative explanation</summary>

```
   Claude / Gemini / Codex CLI process
                │
                ▼
        PTY (pseudo-terminal)
        only ONE size at a time
                │
       ┌────────┼────────┐
       ▼        ▼        ▼
   mobile      web      Telegram
   xterm       xterm
```

The CLI is a single process. At startup it asks the OS via
`TIOCGWINSZ` "how wide is this terminal?" and lays out its UI on
that fixed character grid with absolute positioning sequences.

In practice, whenever multiple clients are connected at once, at
least one ends up with a worse visual experience than solo use.

opendray's idle notifications push the **full prose reply** from
Claude / Gemini into Telegram (not screenshots), so "don't open the
web admin, just watch Telegram" remains a viable workflow.

</details>
