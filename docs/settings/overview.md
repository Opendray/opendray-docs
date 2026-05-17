---
kind: concept
title: Settings — overview
tldr: 3 groups — User (theme, keyboard, locale), Server (logging, storage paths, restart), Session defaults (per-provider runtime). Hot-reload where possible; restart for the rest.
status: stable
since: v0.1.0
topic: settings
related: [settings/general, settings/session-defaults, settings/keyboard-and-theme, settings/logging, settings/storage-paths, settings/restart]
references:
  capabilities: []
x-implementation: [internal/settings/, app/web/src/features/settings/]
---

# Settings — overview

> **tldr:** 3 groups — **User** (theme, keyboard, locale), **Server** (logging, storage paths, restart), **Session defaults** (per-provider runtime). Hot-reload where possible; restart for the rest.

## Page groups

| Group | Reads | What |
|---|---|---|
| User | per-user (browser local) | theme, keyboard shortcuts, locale |
| Server | shared (config.toml + DB) | logging level, storage paths, restart |
| Session defaults | shared (config.toml) | per-provider runtime defaults (`bypass`, `max_turns`, ...) |

## Hot-reload vs restart

| Setting | Hot-reload | Restart |
|---|---|---|
| Theme / keyboard | ✓ (per-user) | — |
| Logging level | ✓ via SIGHUP | — |
| Storage paths (notes, vault, etc.) | ✗ | required |
| `[memory]` backend | ✗ | required |
| `[backup]` config | ✗ | required |
| Provider defaults | ✓ — applies on next spawn | — |
| Admin password | ✗ | required |

## Read next

| Topic | Read |
|---|---|
| Theme + keyboard | [keyboard-and-theme](./keyboard-and-theme) |
| Per-provider defaults | [session-defaults](./session-defaults) |
| Logging level + format | [logging](./logging) |
| Where files live | [storage-paths](./storage-paths) |
| Trigger a restart from UI | [restart](./restart) |
| General page | [general](./general) |
