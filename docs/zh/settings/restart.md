---
kind: capability
title: 设置 — 重启
tldr: 某些 config 改动(网络、存储路径、备份、记忆 backend)需要重启。Settings → Restart 有个守卫按钮,drain in-flight 后触发 SIGTERM。
status: stable
since: v0.1.0
topic: settings
related: [settings/overview, settings/general]
capability: [graceful-restart, drain-then-terminate, supervisor-recovery]
inbound: api
outbound: signal
x-implementation: [internal/settings/restart.go, deploy/systemd/opendray.service]
---

# 设置 — 重启

> **tldr:** 某些 config 改动(网络、存储路径、备份、记忆 backend)需要重启。Settings → Restart 有个守卫按钮,drain in-flight 后触发 SIGTERM。

## 何时需要重启

| 改动 | 重启? |
|---|---|
| `[server]` host/port/TLS | ✓ |
| `[memory]` backend | ✓ |
| `[backup]` 启用 / 密钥 | ✓ |
| `[storage]` 路径 | ✓ |
| `[admin].password` | ✗(下次登录) |
| `[log]` 级别 | ✗(SIGHUP) |
| Channel / Provider / Integration 配置 | ✗ |
| Skill / MCP server 注册 | ✗ |

## Restart 按钮流程

| # | 步骤 | 时长 |
|---|---|---|
| 1 | UI 确认意图 | — |
| 2 | opendray 进维护模式(拒新请求) | 立即 |
| 3 | 活动 WS 连接收 close 帧 | 至 5s |
| 4 | in-flight HTTP 响应完成 | 至 30s |
| 5 | 运行中的 CLI session 警告:"gateway 10s 后重启,你的 PTY 会死" | 10s |
| 6 | 进程退出 | — |
| 7 | supervisor(systemd / Docker / launchctl)重启 | 看 supervisor |
| 8 | session 重 reconcile(`ENDED` 带原因;PTY 已死) | 启动时 |
| 9 | 客户端收重连提示;web UI 刷新 | 看浏览器 |

## 没有 supervisor

直接 `opendray serve` 跑(没 systemd / Docker)**不要用 Restart 按钮** —— 会退出不会回来。改用手动:

- `Ctrl-C` 然后 `opendray serve -config config.toml`
- 或包到 supervisor 里(见 [deploy/systemd/opendray.service](https://github.com/opendray/opendray/blob/main/deploy/systemd/opendray.service))
