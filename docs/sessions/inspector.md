---
kind: concept
title: Inspector panel
tldr: Right-side collapsible panel with 7 sub-tabs (Files / Git / Search / Tasks / History / Notes / Memory). All scoped to the session's cwd. Resizable 320–900px, persisted per-user.
status: stable
since: v0.1.0
topic: sessions
related:
  - sessions/overview
  - sessions/git-workflow
  - notes/overview
references:
  capabilities: [sessions]
x-implementation:
  - app/web/src/features/inspector/
---

# Inspector panel

> **tldr:** Right-side collapsible panel with 7 sub-tabs (Files / Git / Search / Tasks / History / Notes / Memory). All scoped to the session's `cwd`. Resizable 320–900px, persisted per-user.

## Sub-tabs (3-row grid 4 + 2 + 1)

| Row | Tabs |
|---|---|
| 1 | Files · Git · Search · Tasks |
| 2 | History · Notes |
| 3 | Memory |

## Tab reference

### Files

| Property | Value |
|---|---|
| Source | scrollable tree of session's `cwd` |
| Click file | opens read-only viewer in Inspector |
| Default collapse depth | 3 levels (so `node_modules` / `.venv` don't blow up) |
| Filter | none — use Search tab for content |

### Git

| Property | Value |
|---|---|
| Source | cwd, when inside a git repo |
| Visible when | cwd is a git repo |
| Capabilities | branch switch / stage / commit / push / PR control panel |
| See | [Git workflow](./git-workflow) |

### Search

| Property | Value |
|---|---|
| Backend | ripgrep wrapper (same as FS handler) |
| Honours | `.gitignore`, skips `node_modules` |
| Modes | substring + regex |
| Click match | opens file viewer at line |

### Tasks

| Property | Value |
|---|---|
| Source | tasks saved under Plugins → Custom Tasks |
| Trigger | one-click → spawns new session under parent |
| Grouping | shows under parent in `g s` (group sessions view) |

### History (project-level)

Input log of every prompt sent in this `cwd`, pooled across every
session ever spawned there.

| Provider | Reads from |
|---|---|
| `claude` | `~/.claude/projects/<encoded-cwd>/*.jsonl` + `~/.claude-accounts/*/projects/...` |
| `codex` | `~/.codex/sessions/**/*.jsonl` filtered by `session_meta.cwd` |
| `gemini` | `~/.gemini/tmp/<dir>/logs.json` (resolved via `projects.json`) |
| `shell` / other | empty state |

Paths configurable in **Settings → Server → Storage paths**.

| Per-row data | Per-row action |
|---|---|
| Timestamp (relative) | 📋 Copy prompt text |
| Prompt text (wrapped, never truncated) | ➤ Resend → re-injects into currently-active session via `/input` (uses `\r`) |
| CLI session id (8-char prefix; full on hover) | |

Polls every 10s; filter box is case-insensitive substring.

### Notes

Each session has a linked Obsidian note at
`<vault-root>/sessions/<session-id>.md`.

| Feature | Behaviour |
|---|---|
| Editor | same as Notes page (Source / Preview tabs) |
| `[[` trigger | wiki-link suggestions |
| Backlinks | right pane shows notes linking here |
| Auto-save | debounced 1s after last keystroke |
| Lifetime | file-based; survives session restart |

### Memory

Per-session view of pgvector memory hits, capture rules in effect,
worker status. See [Memory](../memory/overview).

## What's NOT here

| Removed | Why |
|---|---|
| Lifecycle event timeline ("Activity" tab) | low-signal for vibe-coding; use top-nav **Activity** page for the system-wide event bus |
| Outline of latest assistant message | dropped; use Search or agent scrollback |

## Sizing & hiding

| Action | Effect |
|---|---|
| Drag left-edge column | resize 320–900px |
| Double-click left edge | snap back to default 320px |
| Toggle icon in WorkbenchHeader | hide / show panel |
| Persisted | zustand `opendray.layout` in `localStorage` per-user |

![Inspector panel tabs](/tutorial/sessions-inspector.png)

<details>
<summary>📖 Narrative explanation</summary>

The Inspector exists for metadata, file browsing, history, and
tooling that doesn't fit inline in the terminal. All seven tabs
scope strictly to the session's `cwd` — there's no view of data
outside the working directory.

The Notes tab is the right place for an operator's running
scratchpad: "things to ask Claude about", "pending decisions",
"TODO before ending the session". It survives session restart
because it's file-based, not in-memory — and because it's just
another Obsidian note, it appears in your full vault graph too.

</details>
