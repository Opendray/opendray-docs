---
kind: concept
title: 欢迎使用 opendray
tldr: AI 编程 CLI(Claude Code / Codex / Gemini / shell)的自托管控制网关。Web 后台 + 移动 + REST/WS API + 8 messenger + 记忆 + 集成。单 Go 二进制跑你自己硬件。
status: stable
since: v0.1.0
topic: getting-started
related: [sessions/overview, channels/overview, providers/overview, memory/overview, integrations/overview, consuming/overview, for-ai]
references:
  capabilities: [sessions, channels, providers, memory, integrations]
x-implementation: [cmd/opendray/, internal/]
---

# 欢迎使用 opendray

> **tldr:** AI 编程 CLI(Claude Code / Codex / Gemini / shell)的自托管控制网关。Web 后台 + 移动 + REST/WS API + 8 messenger + 记忆 + 集成。单 Go 二进制跑你自己硬件。

## 它给你什么

| 能力 | 页 | Capability JSON |
|---|---|---|
| Spawn / 观察 / 驱动 CLI 会话 | [Sessions](../sessions/overview) | [/capabilities/sessions.json](/capabilities/sessions.json) |
| 通过 Telegram / Slack 等收通知 + 回复 | [Channels](../channels/overview) | [/capabilities/channels.json](/capabilities/channels.json) |
| 包任意 CLI(Claude / Codex / Gemini / 你自己的) | [Providers](../providers/overview) | [/capabilities/providers.json](/capabilities/providers.json) |
| 跨 CLI 记忆 + 自动 capture | [Memory](../memory/overview) | [/capabilities/memory.json](/capabilities/memory.json) |
| 把 opendray 挂作其他 app 的 AI 后端 | [Integrations](../integrations/overview) | [/capabilities/integrations.json](/capabilities/integrations.json) |

## 首次运行 checklist

| # | 动作 | 在哪 |
|---|---|---|
| 1 | 用 admin 密码登录 | 右上 |
| 2 | 配 Provider(最常见是 `claude`) | Providers |
| 3 | spawn 你的第一个会话 | Sessions → + New |
| 4 | 接一个 channel(Telegram = 最快) | Channels → + New |
| 5 | 看 session.idle 推送来 | 看你的聊天 |

## 何时读什么

| 目标 | 读 |
|---|---|
| 日常工作台布局 | [Sessions](../sessions/overview) |
| Spawn 对话框参考 | [Spawning](../sessions/spawning) |
| 接第一个 messenger | [Channels](../channels/overview) → [Telegram](../channels/telegram) |
| 多账号 Claude | [Claude accounts](../providers/claude-accounts) |
| 在 opendray 上写 app | [Consuming](../consuming/overview) |
| 让 AI agents 消费这些文档 | [For AI agents](../for-ai) |

## 这后台不做什么

| ✗ 范围外 |
|---|
| 直接 LLM API 调用(CLI 做) |
| 通用 agent 框架(CLI = agent) |
| 插件 marketplace / 签名基础设施 |
| 多租户 SaaS、计费、支付 |
| 超出 admin / 集成 scope 的 per-user 权限 |

权威 non-goals 见 [manifest.json](/manifest.json)。

![侧栏概览](/tutorial/sidebar-overview.png)
