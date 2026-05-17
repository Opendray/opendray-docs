---
kind: capability
title: Settings — Keyboard & theme
tldr: Per-user (browser local). Theme — light/dark/system. Keyboard — vim/emacs/none. Persists to localStorage, syncs across tabs.
status: stable
since: v0.1.0
topic: settings
related: [settings/overview, sessions/tabs]
capability: [theme-toggle, keyboard-mode, browser-local]
x-implementation: [app/web/src/features/settings/user/]
---

# Settings — Keyboard & theme

> **tldr:** Per-user (browser local). Theme — `light` / `dark` / `system`. Keyboard — `vim` / `emacs` / `none`. Persists to `localStorage`, syncs across tabs.

## Theme

| Value | Behaviour |
|---|---|
| `system` (default) | follows OS preference; changes live |
| `light` | always light |
| `dark` | always dark |

| Key | localStorage |
|---|---|
| `opendray.theme` | `light` / `dark` / `system` |

## Keyboard mode

| Mode | What |
|---|---|
| `none` (default) | only the documented shortcuts (g s, n s, Ctrl+Tab, etc.) |
| `vim` | xterm.js inherits Vim binding when terminal is shell with `set -o vi` |
| `emacs` | terminal binding for emacs movements; Cmd-K opens command palette |

Editor (Notes) bindings are independent of this setting.

## Capabilities

| feature | supported |
|---|---|
| Per-user (browser) persistence | ✓ |
| Per-tab override | ✗ (syncs across tabs in same browser) |
| Cross-browser sync | ✗ (browser local) |
| Reset to defaults | ✓ button on Settings page |

## Errors

| Symptom | Cause | Fix |
|---|---|---|
| Theme reverts on reload | localStorage disabled | enable third-party storage |
| Keyboard mode doesn't take | shell config didn't apply | edit `.bashrc` / `.zshrc` |
