---
kind: capability
title: Settings — Session defaults
tldr: Per-provider runtime defaults. bypass_permissions / max_turns / skills for claude. Applies to next spawn. Per-session can override.
status: stable
since: v0.1.0
topic: settings
related: [settings/overview, providers/overview, sessions/spawning]
capability: [per-provider-runtime, override-per-spawn]
x-implementation: [internal/settings/session_defaults.go]
---

# Settings — Session defaults

> **tldr:** Per-provider runtime defaults. `bypass_permissions` / `max_turns` / `skills` for claude. Applies to next spawn. Per-session can override.

## Per-provider defaults

```toml
[provider.claude.runtime]
bypass_permissions = false
max_turns          = 0          # 0 = unlimited
skills             = true       # auto-inject opendray skills

[provider.codex.runtime]
ask_for_approval   = "on-request"   # never | on-request | always

[provider.gemini.runtime]
yolo               = false
```

## Apply order on spawn

| # | Source | Wins |
|---|---|---|
| 1 | provider builtin | base |
| 2 | DB override (from Providers page) | layered |
| 3 | Settings → Session defaults | layered |
| 4 | per-spawn dialog `args` / `bypass_autonomy` toggle | final |

## Hot-reload

| Change | Effect |
|---|---|
| Toggle in UI → Save | next spawn picks it up |
| Already-running sessions | unaffected (PTY started with old args) |

## Capabilities

| feature | supported |
|---|---|
| Per-provider runtime | ✓ |
| Per-spawn override | ✓ (overrides win) |
| Per-cwd override | ✗ — use custom provider manifest with `cwd_glob` |
| Per-user override | ✗ — single-user model |
