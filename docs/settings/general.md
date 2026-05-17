---
kind: capability
title: Settings — General
tldr: Network binding (host/port/TLS), admin password, locale defaults. Network changes require restart; admin password takes effect immediately.
status: stable
since: v0.1.0
topic: settings
related: [settings/overview, settings/restart]
capability: [network-bind, admin-password, locale-default]
x-implementation: [internal/settings/general.go, config.toml]
---

# Settings — General

> **tldr:** Network binding (host/port/TLS), admin password, locale defaults. Network changes require restart; admin password takes effect immediately.

## Network

| Field | Default | Hot-reload? |
|---|---|---|
| `host` | `127.0.0.1` | ✗ restart |
| `port` | `8770` | ✗ restart |
| `tls.cert_path` | (none) | ✗ restart |
| `tls.key_path` | (none) | ✗ restart |
| `tls.behind_reverse_proxy` | `true` | ✗ restart |

```toml
[server]
host = "127.0.0.1"
port = 8770

[server.tls]
cert_path = ""
key_path  = ""
behind_reverse_proxy = true   # Cloudflare Tunnel / nginx — opendray skips TLS
```

## Admin password

| Field | Default | Hot-reload? |
|---|---|---|
| `admin.password` | (must be set) | ✓ — takes effect on next login |

Recommended: set via env to keep out of config.toml.

```bash
export OPENDRAY_ADMIN_PASSWORD="$(openssl rand -base64 24)"
```

## Locale defaults

| Field | Default | Hot-reload? |
|---|---|---|
| `locale.default` | `en` | ✓ |
| `locale.allowed` | `[en, zh]` | ✓ |

## Errors

| code | when | fix |
|---|---|---|
| `port_in_use` | boot fail | change port or stop other service |
| `tls_cert_missing` | boot fail | check path + file exists |
| `admin_password_unset` | boot fail | set `OPENDRAY_ADMIN_PASSWORD` |
