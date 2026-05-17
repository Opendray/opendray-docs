---
kind: capability
title: Settings — Logging
tldr: Level (trace/debug/info/warn/error/off) + format (json/text) + destination (stdout/file/syslog). SIGHUP hot-reloads level. Live tail in UI.
status: stable
since: v0.1.0
topic: settings
related: [settings/overview]
capability: [structured-logging, hot-level-change, live-tail]
x-implementation: [internal/log/, internal/settings/logging.go]
---

# Settings — Logging

> **tldr:** Level (`trace`/`debug`/`info`/`warn`/`error`/`off`) + format (`json`/`text`) + destination (stdout/file/syslog). SIGHUP hot-reloads level. Live tail in UI.

## Config

```toml
[log]
level       = "info"          # trace | debug | info | warn | error | off
format      = "text"          # text | json
destination = "stdout"        # stdout | stderr | file | syslog
file_path   = "/var/log/opendray/server.log"
file_rotate_size_mb = 100
file_keep_count     = 7
```

## Levels

| Level | When to use |
|---|---|
| `trace` | dev debugging; very noisy |
| `debug` | reproducing a bug locally |
| `info` (default) | production normal |
| `warn` | something off but recoverable |
| `error` | failure that needs attention |
| `off` | silence — not recommended |

## Hot-reload via signal

```bash
kill -HUP $(pgrep opendray)
# server logs: "log level reloaded from info → debug"
```

`config.toml` is re-parsed for the `[log]` section only. Other
sections require a full restart.

## Live tail in UI

| Where | What |
|---|---|
| Settings → Logging → Live tail | rolling 1000 most-recent lines |
| Filter by level | dropdown |
| Filter by component | text search |
| Pause / Resume | button |

## Capabilities

| feature | supported |
|---|---|
| Hot level change | ✓ via SIGHUP or UI |
| JSON format for log aggregators | ✓ |
| syslog destination | ✓ (RFC 5424) |
| File rotation | ✓ size-based |
| Per-component level (e.g. quiet HTTP) | ✗ (planned) |
| Sampling | ✗ |

## Errors

| code | when | fix |
|---|---|---|
| `log_file_unwritable` | boot fail / runtime | check perms on `file_path` parent dir |
| `log_format_unknown` | boot fail | use `text` or `json` |
| `log_rotation_failed` | runtime | check disk space |
