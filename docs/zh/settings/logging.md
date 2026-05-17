---
kind: capability
title: 设置 — 日志
tldr: 级别(trace/debug/info/warn/error/off) + 格式(json/text) + 目标(stdout/file/syslog)。SIGHUP 热加载级别。UI 里有 live tail。
status: stable
since: v0.1.0
topic: settings
related: [settings/overview]
capability: [structured-logging, hot-level-change, live-tail]
x-implementation: [internal/log/, internal/settings/logging.go]
---

# 设置 — 日志

> **tldr:** 级别(`trace`/`debug`/`info`/`warn`/`error`/`off`) + 格式(`json`/`text`) + 目标(stdout/file/syslog)。SIGHUP 热加载级别。UI 里有 live tail。

## Config

```toml
[log]
level       = "info"
format      = "text"
destination = "stdout"
file_path   = "/var/log/opendray/server.log"
file_rotate_size_mb = 100
file_keep_count     = 7
```

## 级别

| 级别 | 何时用 |
|---|---|
| `trace` | dev 调试;很吵 |
| `debug` | 本地复现 bug |
| `info`(默认) | 生产正常 |
| `warn` | 不对劲但可恢复 |
| `error` | 需要关注的失败 |
| `off` | 静默 —— 不建议 |

## SIGHUP 热加载

```bash
kill -HUP $(pgrep opendray)
# 日志:"log level reloaded from info → debug"
```

仅 `[log]` 段 re-parse。其他段需完整重启。
