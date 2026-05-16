# Multi-client session access

opendray lets the same session be opened from multiple clients at
once (web admin, mobile app, Telegram), but **strongly recommends
only one client driving it at any given moment**. The reason sits in
the underlying architecture, not in opendray itself.

## Why web and mobile can't each have their own view

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

The CLI is a **single process**. At startup it asks the OS via
`TIOCGWINSZ` "how wide is this terminal?" and lays out its UI on
that fixed character grid with **absolute positioning** ("move cursor
to (45, 10)" sequences).

Every client receives **the same already-laid-out byte stream**. The
mobile xterm and the web xterm are essentially two windows showing
the same image — **no middleware can render the CLI at two different
sizes simultaneously**.

In practice, whenever multiple clients are connected at once, at
least one of them ends up with a worse visual experience than it
would in solo use. Common symptoms:

- **Web drag-to-resize** → FitAddon fires → PTY resized → the
  mobile TUI reflows mid-conversation.
- **Mobile connects** → sets PTY to the mobile width → the web
  window shows wide trailing empty cells.
- **Desktop + mobile alternating** → whoever resized last wins, and
  the TUI reflows back and forth.

## Three workable paths

### A. Recommended — one client at a time

The simplest, most reliable approach. A typical workflow:

- Desktop → use the web admin.
- On the go / on the couch / quick check-in → use the mobile app.
- Away from the machine → let Telegram idle notifications keep you
  informed.

opendray's idle notifications push the **full prose reply** from
Claude / Gemini into Telegram (no more screenshots-only fallback),
so "don't open the web admin, just watch Telegram for updates"
remains a fully viable workflow.

### B. Two sessions (same cwd, independent state)

If you genuinely want web + mobile to operate independently, spawn
**two** sessions in the same cwd. Each has its own PTY, its own CLI
process, and they don't interfere with each other.

Trade-off: **conversation state is split**. What you tell the
mobile Gemini, the web Gemini doesn't see. This fits "desktop runs
a long task, mobile fires off a quick side question" — it doesn't
fit "continue my desktop conversation from my phone".

### C. Desktop only on web, mobile only on the app — separate sessions

The most natural workflow: each device owns its own session set. No
cross-device sharing of CLI state at all. Idle notifications and
Telegram commands (`/list`, `/end`, `/resume`, …) still work
cross-device.

## Why tmux doesn't solve this

tmux handles multiple clients by **taking the minimum of all
attached client sizes** and using that for every client. It's still
one size, still a compromise — the decision is just moved into tmux
instead of being opendray's. No fundamental difference.

## What true independent multi-client would require

It would need **client-side conversation state** (state lives on the
client, not in the CLI process) plus a state-sync layer. That's how
Claude/Gemini/Codex's HTTP APIs and web UIs work, but **not** how
the CLI TUIs work. opendray wraps a TUI CLI, so it inherits the
TUI's architectural constraints.

If Anthropic / Google ever ship a CLI with a stateful HTTP API,
opendray can revisit this. Until then — use option A or B.
