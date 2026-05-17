---
kind: concept
title: 频道 Channels — 概览
tldr: 一个 channel = 一份消息平台绑定。opendray 内置 7 个 kind(telegram / slack / discord / feishu / dingtalk / wecom / bridge),共享同一套 notify + repeat-policy 语义。
status: stable
since: v0.1.0
topic: channels
related:
  - channels/telegram
  - channels/slack
  - channels/discord
  - channels/feishu
  - channels/dingtalk
  - channels/wecom
  - channels/bridge
  - channels/notifications
  - channels/routing
references:
  capabilities: [channels]
x-implementation:
  - internal/channel/hub.go
  - internal/channel/manager.go
---

# 频道 Channels — 概览

> **tldr:** 一个 *channel* = 一份消息平台绑定。opendray 内置 7 个 kind(telegram / slack / discord / feishu / dingtalk / wecom / bridge),共享同一套 notify + repeat-policy 语义。

## 是什么

一个 *channel* 是一份配置好的消息平台集成。每个 channel 把平台
专属协议(long-poll / Socket Mode / Gateway WS / webhook / 群机器人)
包在 opendray 统一的 notify + routing 模型后面。

| Capability JSON | 权威来源 |
|---|---|
| [/capabilities/channels.json](/capabilities/channels.json) | 每 kind 配置 schema、能力、错误码 |

## 内置 kind

| Kind | 入站 | 出站 | 公网 URL? | 最适合 |
|---|---|---|---|---|
| [`telegram`](./telegram) | long-poll | REST | ✗ | 独立开发者 —— 上手最快 |
| [`slack`](./slack) | Socket Mode | Web API + Block Kit | ✗ | 团队对话,原生交互 |
| [`discord`](./discord) | Gateway WS | REST + embeds | ✗ | 开发者 / maker 社区 |
| [`feishu`](./feishu) | webhook | tenant API | **✓** | 中国 / 跨组织正式频道 |
| [`dingtalk`](./dingtalk) | (无) | 群机器人 | ✗ | 中国企业群 |
| [`wecom`](./wecom) | (无) | 群机器人 | ✗ | 企业微信群 |
| [`bridge`](./bridge) | WebSocket | WebSocket | ✗(token 认证) | 自定义平台(LINE / KakaoTalk / 自有协议) |

## 生命周期(所有 kind 一致)

| # | 阶段 | 发生什么 |
|---|---|---|
| 1 | 准备凭据 | 在平台后台拿凭据 |
| 2 | 注册 | opendray **Channels → New** → 粘凭据 |
| 3 | 连接 | hub 建立入站 + 出站 transport |
| 4 | running | 状态徽章绿,可发可收 |
| 5 | (可选)调优 | 编辑 notifications 面板:事件、repeat 策略、snippet |
| 6 | (可选)多平台 | 配另一个 kind,多平台扇出 |

## 能力对比矩阵

| 能力 | telegram | slack | discord | feishu | dingtalk | wecom | bridge |
|---|---|---|---|---|---|---|---|
| 接收用户回复 | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Markdown body | ✓ HTML | ✓ Block Kit | ✓ embed | ✓ Card v2 | ✓ md | ✓ md | adapter |
| 交互按钮 | ✓ | ✓ | ✓ | ✓ | 仅 URL | 仅 URL | adapter |
| 回复消息路由 | ✓ | ✓ thread | ✓ ref | ✓ reply | ✗ | ✗ | adapter |
| 原地编辑 | ✓ | ✓ | ✓ | partial | ✗ | ✗ | adapter |
| 需要公网 URL | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ |

"仅 URL" = 群机器人不能触发回调,但 URL 按钮能渲染。

## 何时用哪个

| 你想要 | 选 |
|---|---|
| 从零到第一条推送的最快路径 | `telegram` |
| 团队 workspace + 线程协作 | `slack` |
| 开发 / 社区服务器 + 富 embed | `discord` |
| 中国跨组织正式频道 | `feishu` |
| 简单的"完成了告诉我"到企业微信 | `wecom` 或 `dingtalk` |
| 平台不在此列表 | `bridge` + 自定义 adapter |

## 共享行为

只要任何 channel 处于 `running`,所有 channel 共用同一套后台特性:

- **Notifications 面板** —— 选哪些事件触发(`session.started`、
  `session.idle`、`session.ended`、`session.permission_ask`),设
  repeat 策略和终端 snippet。见 [notifications](./notifications)。
- **Multi-session routing** —— `reply-to-message` / `/select` /
  `/sessions` 命令。见 [routing](./routing)。

## 关联

- [/capabilities/channels.json](/capabilities/channels.json) — 机器可读
- [Notifications 面板](./notifications)
- [Multi-session 路由](./routing)

![Channels 页面有一个 running 的 telegram bot](/tutorial/channels-running.png)

<details>
<summary>📖 叙事说明</summary>

所有 channel kind 共用同一套 notify + routing 模型的原因是它们都
消费同一个内部 event bus(`internal/eventbus/`)。会话进入 idle 时,
session 子系统发布 `session.idle` 事件带 snippet;每个 channel hub
订阅;只有 `notify.idle` 开了的 channel 才推到上游平台。

这意味着你可以同时配 `telegram` 做个人通知 + `feishu` 做团队可见性
+ `bridge` adapter 接入自有 IM —— 都触发自同一个 session 事件,
不需要额外接线。

</details>
