---
kind: concept
title: Tabs & keyboard nav
tldr: Click / drag / right-click tabs. Vim-style g-prefix shortcuts. Ctrl+Tab cycles, Ctrl+1-9 jumps, Ctrl+W closes, n s opens Spawn, g i toggles Inspector.
status: stable
since: v0.1.0
topic: sessions
related:
  - sessions/overview
  - sessions/spawning
  - sessions/inspector
references:
  capabilities: [sessions]
x-implementation:
  - app/web/src/features/sessions/tabs/
---

# Tabs & keyboard nav

> **tldr:** Click / drag / right-click tabs. Vim-style g-prefix shortcuts. `Ctrl+Tab` cycles, `Ctrl+1-9` jumps, `Ctrl+W` closes, `n s` opens Spawn, `g i` toggles Inspector.

## Tab strip behaviour

| Action | Result |
|---|---|
| click tab | switch active session |
| ✕ on running tab | confirm dialog → SIGTERM |
| ✕ on stopped/ended tab | close visually (DB row stays) |
| drag tab | reorder; persists per-user |
| right-click | context menu: Restart / Rename / Close |
| long names | ellipsised in middle (`my-project-foo-…-feat-x`) — trailing context stays readable |

![Multi-tab strip](/tutorial/sessions-tab-strip.png)

## Keyboard shortcuts

### Navigation between sessions

| Shortcut | Action |
|---|---|
| `g s` | jump to Sessions page |
| `Ctrl + Tab` | next tab |
| `Ctrl + Shift + Tab` | previous tab |
| `Ctrl + 1` – `Ctrl + 9` | jump to tab N |
| `Ctrl + W` | close current tab (confirms if running) |

`g`-prefix shortcuts are vim-style — press `g`, then second key
within ~1.5s. Status bar shows breadcrumb when `g` pending.

### Inside the terminal

| Intercepted by opendray | xterm.js / provider |
|---|---|
| `Ctrl + Shift + ↑/↓` (scrollback bypass) | everything else |

Claude has its own `Ctrl-G`-prefixed cycle for permission modes etc.
See provider docs.

### Inspector

| Shortcut | Action |
|---|---|
| `g i` | toggle Inspector panel |
| `1` – `7` (Inspector focused) | switch sub-tab (Files / Git / Search / Tasks / History / Notes / Memory) |
| `Esc` | return focus to terminal |

Focus Inspector by clicking inside it once; digit keys take effect
after.

### Spawn

| Shortcut | Action |
|---|---|
| `n s` | open Spawn dialog (when on Sessions page) |
| `Esc` | close any open dialog |
| `Cmd/Ctrl + Enter` | submit dialog (in any field of Spawn form) |

### Help

| Where | What |
|---|---|
| top-right of each page | hint bar with most-relevant shortcuts |
| hover `?` icon | full keymap |

## Touch / mobile

| Viewport | Sessions page UX |
|---|---|
| desktop (≥1024px) | full layout |
| tablet (600–1023px) | sidebar icon-only, Inspector overlays, tab strip horizontal-scrolls |
| phone (<600px) | not usable — use a [channel](../channels/overview) instead |

For phone-only usage: get the idle notification, reply from your
phone, opendray forwards your text into the right session via
Telegram / Slack / etc.
