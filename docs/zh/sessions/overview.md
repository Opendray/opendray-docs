---
kind: concept
title: 会话 Sessions — 概览
tldr: Sessions 页是 opendray 日常工作台。每个 CLI 进程一个 tab — PTY-backed,1 MiB ring buffer,多端镜像,断线安全。DB 会话行的生命周期长于进程。
status: stable
since: v0.1.0
topic: sessions
related:
  - sessions/spawning
  - sessions/inspector
  - sessions/lifecycle
  - sessions/tabs
  - sessions/multi-client
  - sessions/git-workflow
references:
  capabilities: [sessions]
x-implementation:
  - internal/session/
  - internal/session/session.go
---

# 会话 Sessions — 概览

> **tldr:** Sessions 页是 opendray 日常工作台。每个 CLI 进程一个 tab —— PTY-backed,1 MiB ring buffer,多端镜像,断线安全。DB 会话行的生命周期长于进程。

## 是什么

opendray 管理的每个 CLI 进程(Claude Code、Codex、Gemini、纯 shell)
都在这里以一个 tab 呈现。spawn、观察、驱动、清理都在这一页。

| Capability JSON | 权威源 |
|---|---|
| [/capabilities/sessions.json](/capabilities/sessions.json) | 状态机、PTY 参数、多端规则 |

## 页面结构

| # | 区域 | 用途 |
|---|---|---|
| 1 | 顶部 tab strip | 所有 running + 最近结束的会话 |
| 2 | 终端 | 完整 xterm.js,可复制粘贴,鼠标滚动遵循 provider 的 `mouseEvents` |
| 3 | 状态徽章 | `RUNNING` / `IDLE` / `ENDED` / `STOPPED`,终态时带 exit code |
| 4 | Inspector(右侧) | 可折叠侧面板,带 per-session 子 tab |

![Sessions 页布局](/tutorial/sessions-layout.png)

## Session ≠ 进程

opendray 把每次 CLI 调用建模成 **DB 中的一行 session row**。PTY +
子进程会来去,session row id 一直在。

| 持久在 session row | 仅内存 |
|---|---|
| id | stdout 历史(ring buffer) |
| cwd | live PTY handle |
| provider id | xterm.js viewer 连接 |
| args + env override | |
| parent_session_id | |
| claude_account_id | |
| state(pending / running / idle / ended / stopped) | |
| started_at / ended_at | |

这就是 "原地重启" 能工作的原因:Claude 会话崩了,在同 id 下 spawn
新的 → 同 cwd、同账号绑定、Inspector tabs(linked note、outline cache)
全部回来。

## 数据存放位置

| 数据 | 位置 |
|---|---|
| Session 元数据 | Postgres `sessions` 表 |
| stdout 历史(live) | 内存 ring buffer(1 MiB / session) |
| Inspector linked note | 笔记 vault `<vault>/sessions/<sid>.md` |
| Claude transcript | `~/.claude/projects/<encoded-cwd>/<sid>.jsonl`(Claude 自己的) |
| 审计日志 | Postgres `audit_log` 表 |

## 重连语义

| 动作 | 效果 |
|---|---|
| 关浏览器 tab | 会话继续跑;ring buffer + PTY 不动 |
| 重开 tab → 点会话 | 重放 ring buffer(1 MiB scrollback)→ 接上 live 流 |
| WS 中途断开 | 客户端用 `?since=<seq>` 游标自动重连 |
| 服务器重启 | sessions 在 DB;进程不会存活(PTY 随父进程死亡);用 Restart 在同 id 下重启 |

## 后续

| 主题 | 阅读 |
|---|---|
| spawn 新 CLI 会话 | [Spawning](./spawning) |
| 右侧面板详解 | [Inspector](./inspector) |
| 状态徽章 + 转换 | [Lifecycle](./lifecycle) |
| 多 tab 管理 + 快捷键 | [Tabs & 键盘导航](./tabs) |
| 多端查看规则 | [Multi-client](./multi-client) |
| 面板内 Git 操作 | [Git workflow](./git-workflow) |
| 移动端同一 Git 工作流 | [Mobile Git](./mobile-git) |
