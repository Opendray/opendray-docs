---
kind: concept
title: 多端会话访问
tldr: 同一会话可被多端 attach(web + 手机 + Telegram),但同一时刻只应一端 DRIVE。PTY 只有一种 size — 最后 resize 赢。要独立状态,在同 cwd spawn 多个 session。
status: stable
since: v0.1.0
topic: sessions
related:
  - sessions/overview
  - channels/overview
references:
  capabilities: [sessions]
x-implementation:
  - internal/session/multiclient.go
---

# 多端会话访问

> **tldr:** 同一会话可被多端 attach(web + 手机 + Telegram),但同一时刻只应一端 DRIVE。PTY 只有一种 size —— 最后 resize 赢。要独立状态,在同 cwd spawn 多个 session。

## 为什么是单 PTY 约束

| 层 | 属性 |
|---|---|
| CLI(Claude / Codex / Gemini) | 单进程 |
| PTY | 同时只有一种 size(`TIOCGWINSZ`) |
| 布局方式 | 绝对定位("移动光标到 (45, 10)") |
| 所有端收到 | 同一份已布局好的字节流 |

手机 xterm 和 web xterm 是同一图像的两个窗口。没有中间件能同时按
两种 size 渲染 CLI。

## 多端同时 drive 的症状

| 触发 | 后果 |
|---|---|
| Web 拖拽 resize | FitAddon 触发 → PTY resize → 手机 TUI 对话中途 reflow |
| 手机连入 | PTY 设为手机宽 → web 显示宽尾部空白格 |
| 桌面 + 手机交替 | 最后 resize 的赢;TUI 来回 reflow |

## 三种可行方案

### A. 推荐 —— 一端一时

| 你在哪 | 用 |
|---|---|
| 桌面 | web admin |
| 沙发 / 在路上 | 手机 app |
| 离开机器 | Telegram idle 通知(完整 prose,不是截图) |

### B. 同 cwd 两个 session,独立状态

| 权衡 | |
|---|---|
| ✓ 独立 | 每会话各自 PTY + CLI 进程 |
| ✗ 状态分离 | 手机 Gemini 看不到桌面 Gemini 知道的 |
| 适合 | "桌面跑长任务,手机问个小问题" |
| 不适合 | "从手机接上桌面对话" |

### C. 桌面只用 web,手机只用 app —— 各自独立 session

最自然的工作流:每个设备拥有自己的 session 集。完全不跨设备共享 CLI
状态。Idle 通知 + Telegram 命令(`/list` / `/end` / `/resume`)仍跨
设备工作。

## 为什么 tmux 不解决这个问题

tmux 取所有 attached client 的 **最小 size**,所有端都用。仍然是一
种 size,仍然是妥协 —— 决策只是搬到 tmux 而已。本质上没区别。

## 真正独立多端需要什么

客户端侧的对话状态(state 在客户端,不在 CLI 进程)+ 一层 state-sync。
这是 Claude / Gemini / Codex 的 **HTTP API** 和 web UI 的工作方式 ——
**不是** CLI TUI 的工作方式。opendray 包装 TUI CLI,继承了它的架构
约束。

如果 Anthropic / Google 出 stateful HTTP API CLI,opendray 可以重新
考虑。在那之前 —— 用方案 A 或 B。
