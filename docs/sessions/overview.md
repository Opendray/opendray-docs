---
kind: concept
title: Sessions — overview
tldr: The Sessions page is opendray's daily-driver workbench. Each CLI process is one tab — PTY-backed with 1 MiB ring buffer, multi-client mirrored, reconnect-safe. Session row in DB outlives the process.
status: stable
since: v0.1.0
topic: sessions
related:
  - sessions/spawning
  - sessions/inspector
  - sessions/lifecycle
  - sessions/tabs
  - sessions/multi-client
  - sessions/git-workflow
references:
  capabilities: [sessions]
x-implementation:
  - internal/session/
  - internal/session/session.go
---

# Sessions — overview

> **tldr:** The Sessions page is opendray's daily-driver workbench. Each CLI process is one tab — PTY-backed with 1 MiB ring buffer, multi-client mirrored, reconnect-safe. Session row in DB outlives the process.

## What it is

Every CLI process opendray manages (Claude Code, Codex, Gemini,
plain shell) shows up here as one tab. You spawn, watch, drive, and
clean up sessions all in this one page.

| Capability JSON | Authoritative source |
|---|---|
| [/capabilities/sessions.json](/capabilities/sessions.json) | State machine, PTY params, multi-client rules |

## Page anatomy

| # | Region | Purpose |
|---|---|---|
| 1 | Tab strip (top) | every running + recently-ended session |
| 2 | Terminal | full xterm.js — copy-paste, mouse scroll honours provider's `mouseEvents` |
| 3 | Status pill | `RUNNING` / `IDLE` / `ENDED` / `STOPPED` + exit code when terminal |
| 4 | Inspector (right) | collapsible side panel with per-session sub-tabs |

![Sessions page layout](/tutorial/sessions-layout.png)

## Session ≠ process

opendray models each CLI invocation as a **session row in DB**. The
PTY + child process come and go; the session row id survives.

| Persisted on session row | In-memory only |
|---|---|
| id | stdout history (ring buffer) |
| cwd | live PTY handle |
| provider id | xterm.js viewer connections |
| args + env override | |
| parent_session_id | |
| claude_account_id | |
| state (pending / running / idle / ended / stopped) | |
| started_at / ended_at | |

This is what makes "restart in place" possible: when a Claude
session crashes, spawn a new one under the same id → same cwd,
same account binding, Inspector tabs (linked note, outline cache)
all come back.

## Data locations

| Data | Location |
|---|---|
| Session metadata | Postgres `sessions` table |
| Stdout history (live) | In-memory ring buffer (1 MiB / session) |
| Inspector linked note | Notes vault `<vault>/sessions/<sid>.md` |
| Claude transcript | `~/.claude/projects/<encoded-cwd>/<sid>.jsonl` (Claude's own) |
| Audit log | Postgres `audit_log` table |

## Reconnect semantics

| Action | Effect |
|---|---|
| Close browser tab | session keeps running; ring buffer + PTY untouched |
| Reopen tab → click session | replay ring buffer (1 MiB scrollback) → resume live stream |
| WS dropped mid-stream | client auto-reconnect with `?since=<seq>` cursor |
| Server restart | sessions in DB; processes do NOT survive (PTY died with parent); use `Restart` to re-spawn under same id |

## Where to next

| Topic | Read |
|---|---|
| Spawn a new CLI session | [Spawning](./spawning) |
| Right-side panel deep-dive | [Inspector](./inspector) |
| State pills + transitions | [Lifecycle](./lifecycle) |
| Multi-tab management + shortcuts | [Tabs & keyboard nav](./tabs) |
| Multi-client viewing rules | [Multi-client](./multi-client) |
| Git operations from the panel | [Git workflow](./git-workflow) |
| Same Git workflow on mobile | [Mobile Git](./mobile-git) |

<details>
<summary>📖 Narrative explanation</summary>

The web UI streams stdout via WebSocket; closing your browser tab
doesn't kill the session — opendray keeps the ring buffer + the
process running, ready to replay history when you reconnect.

Multiple browser tabs (or mobile app + web at the same time) can
watch the same session in parallel via multi-client viewing. Only
one driver at any moment is recommended though — see
[multi-client](./multi-client).

</details>
