---
kind: capability
title: 设置 — 会话默认
tldr: per-provider runtime 默认。claude 的 bypass_permissions / max_turns / skills。下次 spawn 生效。per-session 可覆盖。
status: stable
since: v0.1.0
topic: settings
related: [settings/overview, providers/overview, sessions/spawning]
capability: [per-provider-runtime, override-per-spawn]
x-implementation: [internal/settings/session_defaults.go]
---

# 设置 — 会话默认

> **tldr:** per-provider runtime 默认。claude 的 `bypass_permissions` / `max_turns` / `skills`。下次 spawn 生效。per-session 可覆盖。

## 每 provider 默认

```toml
[provider.claude.runtime]
bypass_permissions = false
max_turns          = 0
skills             = true

[provider.codex.runtime]
ask_for_approval   = "on-request"

[provider.gemini.runtime]
yolo               = false
```

## spawn 时应用顺序

| # | 源 | 赢 |
|---|---|---|
| 1 | provider 内置 | 基础 |
| 2 | DB override(Providers 页) | 叠加 |
| 3 | Settings → Session defaults | 叠加 |
| 4 | per-spawn 对话框 `args` / `bypass_autonomy` toggle | 最终 |
