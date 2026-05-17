---
kind: concept
title: 设置 Settings — 概览
tldr: 3 组 — User(主题、键盘、locale)、Server(日志、存储路径、重启)、Session defaults(per-provider runtime)。能热加载的热加载;其余要重启。
status: stable
since: v0.1.0
topic: settings
related: [settings/general, settings/session-defaults, settings/keyboard-and-theme, settings/logging, settings/storage-paths, settings/restart]
references:
  capabilities: []
x-implementation: [internal/settings/, app/web/src/features/settings/]
---

# 设置 Settings — 概览

> **tldr:** 3 组 —— **User**(主题、键盘、locale)、**Server**(日志、存储路径、重启)、**Session defaults**(per-provider runtime)。能热加载的热加载;其余要重启。

## 页组

| 组 | 读 | 什么 |
|---|---|---|
| User | 每用户(浏览器 local) | 主题、键盘快捷键、locale |
| Server | 共享(config.toml + DB) | 日志级别、存储路径、重启 |
| Session defaults | 共享(config.toml) | per-provider runtime 默认(`bypass`、`max_turns` 等) |

## 热加载 vs 重启

| 设置 | 热加载 | 重启 |
|---|---|---|
| 主题 / 键盘 | ✓(每用户) | — |
| 日志级别 | ✓ SIGHUP | — |
| 存储路径(notes、vault 等) | ✗ | 必须 |
| `[memory]` backend | ✗ | 必须 |
| `[backup]` config | ✗ | 必须 |
| Provider 默认 | ✓ — 下次 spawn 生效 | — |
| Admin 密码 | ✗ | 必须 |
