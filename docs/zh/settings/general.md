---
kind: capability
title: 设置 — 通用
tldr: 网络绑定(host/port/TLS)、admin 密码、locale 默认。网络变更需重启;admin 密码立即生效。
status: stable
since: v0.1.0
topic: settings
related: [settings/overview, settings/restart]
capability: [network-bind, admin-password, locale-default]
x-implementation: [internal/settings/general.go, config.toml]
---

# 设置 — 通用

> **tldr:** 网络绑定(host/port/TLS)、admin 密码、locale 默认。网络变更需重启;admin 密码立即生效。

## 网络

| 字段 | 默认 | 热加载? |
|---|---|---|
| `host` | `127.0.0.1` | ✗ 重启 |
| `port` | `8770` | ✗ 重启 |
| `tls.cert_path` | (无) | ✗ 重启 |
| `tls.key_path` | (无) | ✗ 重启 |
| `tls.behind_reverse_proxy` | `true` | ✗ 重启 |

```toml
[server]
host = "127.0.0.1"
port = 8770

[server.tls]
cert_path = ""
key_path  = ""
behind_reverse_proxy = true   # Cloudflare Tunnel / nginx — opendray 跳过 TLS
```

## Admin 密码

```bash
export OPENDRAY_ADMIN_PASSWORD="$(openssl rand -base64 24)"
```

## Locale 默认

| 字段 | 默认 | 热加载? |
|---|---|---|
| `locale.default` | `en` | ✓ |
| `locale.allowed` | `[en, zh]` | ✓ |
