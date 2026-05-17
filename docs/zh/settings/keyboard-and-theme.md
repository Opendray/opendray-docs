---
kind: capability
title: 设置 — 键盘 & 主题
tldr: 每用户(浏览器 local)。主题 — light/dark/system。键盘 — vim/emacs/none。持久化到 localStorage,跨 tab 同步。
status: stable
since: v0.1.0
topic: settings
related: [settings/overview, sessions/tabs]
capability: [theme-toggle, keyboard-mode, browser-local]
x-implementation: [app/web/src/features/settings/user/]
---

# 设置 — 键盘 & 主题

> **tldr:** 每用户(浏览器 local)。主题 —— `light` / `dark` / `system`。键盘 —— `vim` / `emacs` / `none`。持久化到 `localStorage`,跨 tab 同步。

## 主题

| 值 | 行为 |
|---|---|
| `system`(默认) | 跟随 OS 偏好;live 变 |
| `light` | 始终亮 |
| `dark` | 始终暗 |

## 键盘模式

| 模式 | 什么 |
|---|---|
| `none`(默认) | 仅文档化的快捷键(g s、n s、Ctrl+Tab 等) |
| `vim` | xterm.js 在 shell `set -o vi` 时继承 Vim 键位 |
| `emacs` | 终端 emacs 移动键位;Cmd-K 开命令面板 |

编辑器(Notes)键位独立于此设置。
