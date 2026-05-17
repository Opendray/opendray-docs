---
kind: concept
title: Tab 与键盘导航
tldr: 点击 / 拖 / 右键 tab。vim 风格 g 前缀快捷键。Ctrl+Tab 切换、Ctrl+1-9 跳转、Ctrl+W 关闭、n s 打开 Spawn、g i 切换 Inspector。
status: stable
since: v0.1.0
topic: sessions
related:
  - sessions/overview
  - sessions/spawning
  - sessions/inspector
references:
  capabilities: [sessions]
x-implementation:
  - app/web/src/features/sessions/tabs/
---

# Tab 与键盘导航

> **tldr:** 点击 / 拖 / 右键 tab。vim 风格 g 前缀快捷键。`Ctrl+Tab` 切换、`Ctrl+1-9` 跳转、`Ctrl+W` 关闭、`n s` 打开 Spawn、`g i` 切换 Inspector。

## Tab 行为

| 动作 | 结果 |
|---|---|
| 点 tab | 切换活动会话 |
| ✕ 在 running tab | 确认对话框 → SIGTERM |
| ✕ 在 stopped/ended tab | 视觉关(DB row 保留) |
| 拖 tab | 重新排序;每用户持久化 |
| 右键 | 上下文菜单:Restart / Rename / Close |
| 长名字 | 中间省略(`my-project-foo-…-feat-x`)—— 末尾上下文保留 |

![多 tab strip](/tutorial/sessions-tab-strip.png)

## 键盘快捷键

### Session 间导航

| 快捷键 | 动作 |
|---|---|
| `g s` | 跳到 Sessions 页 |
| `Ctrl + Tab` | 下一 tab |
| `Ctrl + Shift + Tab` | 上一 tab |
| `Ctrl + 1` – `Ctrl + 9` | 跳到第 N 个 tab |
| `Ctrl + W` | 关当前 tab(running 时确认) |

`g` 前缀是 vim 风格 —— 按 `g`,~1.5s 内再按第二个键。状态栏在 `g`
pending 时显示 breadcrumb。

### 终端内

| 被 opendray 截获 | 由 xterm.js / provider 处理 |
|---|---|
| `Ctrl + Shift + ↑/↓`(scrollback bypass) | 其他全部 |

Claude 有自己 `Ctrl-G` 前缀循环切权限模式等。看 provider 文档。

### Inspector

| 快捷键 | 动作 |
|---|---|
| `g i` | 切换 Inspector 面板 |
| `1` – `7`(Inspector 聚焦时) | 切换子 tab(Files / Git / Search / Tasks / History / Notes / Memory) |
| `Esc` | 焦点回终端 |

点 Inspector 内部一次让其聚焦,然后数字键生效。

### Spawn

| 快捷键 | 动作 |
|---|---|
| `n s` | 打开 Spawn 对话框(在 Sessions 页) |
| `Esc` | 关任意打开的对话框 |
| `Cmd/Ctrl + Enter` | 提交对话框(Spawn 表单任意字段) |

### 帮助

| 位置 | 内容 |
|---|---|
| 每页右上 | hint bar 显示该页最相关快捷键 |
| hover `?` 图标 | 完整 keymap |

## 触屏 / 移动

| 视口 | Sessions 页 UX |
|---|---|
| 桌面(≥1024px) | 完整布局 |
| 平板(600–1023px) | 侧栏 icon-only,Inspector 浮层,tab strip 横滚 |
| 手机(<600px) | 不可用 —— 用 [channel](../channels/overview) 替代 |

手机专用:收 idle 通知,从手机回复,opendray 通过 Telegram / Slack
等转发文本到正确会话。
