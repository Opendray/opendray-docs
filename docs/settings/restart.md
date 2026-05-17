---
kind: capability
title: Settings — Restart
tldr: Some config changes (network, storage paths, backup, memory backend) need a restart. Settings → Restart provides a guarded button that drains in-flight requests and triggers SIGTERM with grace.
status: stable
since: v0.1.0
topic: settings
related: [settings/overview, settings/general]
capability: [graceful-restart, drain-then-terminate, supervisor-recovery]
inbound: api
outbound: signal
x-implementation: [internal/settings/restart.go, deploy/systemd/opendray.service]
---

# Settings — Restart

> **tldr:** Some config changes (network, storage paths, backup, memory backend) need a restart. Settings → Restart provides a guarded button that drains in-flight requests and triggers SIGTERM with grace.

## When you need restart

| Change | Restart? |
|---|---|
| `[server]` host/port/TLS | ✓ |
| `[memory]` backend | ✓ |
| `[backup]` enable / key | ✓ |
| `[storage]` paths | ✓ |
| `[admin].password` | ✗ (next login) |
| `[log]` level | ✗ (SIGHUP) |
| Channel / Provider / Integration config | ✗ |
| Skill / MCP server registration | ✗ |

## Restart button flow

| # | Step | Duration |
|---|---|---|
| 1 | UI confirms intent | — |
| 2 | opendray enters maintenance mode (rejects new requests) | immediate |
| 3 | active WS connections sent close frame | up to 5s |
| 4 | in-flight HTTP responses complete | up to 30s |
| 5 | running CLI sessions warned: "gateway restart in 10s — your PTY will die" | 10s |
| 6 | process exits | — |
| 7 | supervisor (systemd / Docker / launchctl) restarts | per supervisor config |
| 8 | sessions reconciled (`ENDED` with reason; PTYs are gone) | on boot |
| 9 | clients see reconnect prompt; web UI refreshes | per browser |

## Without a supervisor

If you launched opendray directly without systemd / Docker, **don't use the Restart button** — it'll exit and not come back up. Instead:

- restart manually: `Ctrl-C` then `opendray serve -config config.toml`
- or wrap in a supervisor (see [deploy/systemd/opendray.service](https://github.com/opendray/opendray/blob/main/deploy/systemd/opendray.service))

## Capabilities

| feature | supported |
|---|---|
| Drain in-flight | ✓ 30s grace |
| Warn sessions before exit | ✓ |
| Reconcile sessions on boot | ✓ |
| Reload via SIGHUP (subset of config) | ✓ (log level only currently) |
| Online config reload (no restart) | ✗ for most config |

## Errors

| code | when | fix |
|---|---|---|
| `restart_no_supervisor_detected` | not under systemd / Docker / launchctl | use manual restart instead |
| `restart_drain_timeout` | in-flight request stuck | force-kill if > 5min |
