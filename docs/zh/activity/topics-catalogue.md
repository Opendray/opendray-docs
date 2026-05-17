---
kind: capability
title: Topic 目录
tldr: 每个事件 topic + payload schema。session.* / channel.* / memory.* / notification.* / system.*。是 WS subscribe 过滤的权威。
status: stable
since: v0.1.0
topic: activity
related: [activity/overview, integrations/events-ws, consuming/websocket-events]
capability: [event-bus, topic-hierarchy]
inbound: internal-publishers
outbound: ws-subscribers
x-implementation: [internal/eventbus/topics.go]
---

# Topic 目录

> **tldr:** 每个事件 topic + payload schema。`session.*` / `channel.*` / `memory.*` / `notification.*` / `system.*`。是 WS subscribe 过滤的权威。

## Topic 前缀

| 前缀 | 发布者 | 订阅者 |
|---|---|---|
| `session.*` | session manager | 集成事件 WS、channel hub |
| `channel.*` | channel hub | 集成事件 WS、审计 |
| `memory.*` | memory 子系统 | 集成事件 WS、项目记忆 scanner |
| `notification.*` | UI 通知引擎 | 集成事件 WS、web 后台 |
| `system.*` | gateway 生命周期 | 审计日志 |

## Session topic

| Topic | Payload |
|---|---|
| `session.s_42.started` | `{ session_id, provider, cwd, args }` |
| `session.s_42.output` | `{ stream: 'stdout'\|'stderr', data: string }` |
| `session.s_42.idle` | `{ session_id, idle_for_seconds }` |
| `session.s_42.permission_ask` | `{ command, context_hint }` |
| `session.s_42.ended` | `{ exit_code, reason }` |
| `session.s_42.stopped` | `{ signaled_by, exit_code }` |

## Channel topic

| Topic | Payload |
|---|---|
| `channel.ch_tg_main.connecting` | `{ channel_id, kind }` |
| `channel.ch_tg_main.running` | `{ channel_id, kind }` |
| `channel.ch_tg_main.failed` | `{ channel_id, error_code, error_message }` |
| `channel.ch_tg_main.message_in` | `{ user_id, text, reply_to }` |
| `channel.ch_tg_main.message_forwarded` | `{ session_id, text }` |
| `channel.ch_tg_main.delivery` | `{ message_id, ok }` |

## Memory topic

| Topic | Payload |
|---|---|
| `memory.write` | `{ id, scope, scope_key, source: 'tool'\|'mirror'\|'capture' }` |
| `memory.recall` | `{ query, scope, top_k, hit_count, latency_ms }` |
| `memory.conflict_detected` | `{ row_id, conflict_with_id, similarity }` |
| `memory.cleanup.run_started` | `{ scheduler }` |
| `memory.cleanup.row_removed` | `{ id, reason }` |

## Notification topic

| Topic | Payload |
|---|---|
| `notification.session_idle_pushed` | `{ session_id, channel_id, recipient }` |
| `notification.permission_ask_pushed` | 同 |
| `notification.session_done_pushed` | 同 |

## System topic

| Topic | Payload |
|---|---|
| `system.startup` | `{ version, uptime_s: 0 }` |
| `system.shutdown` | `{ reason, uptime_s }` |
| `system.config_reloaded` | `{ section }` |
| `system.embedder_changed` | `{ from, to }` |

## 订阅

Topic 模式支持通配:

| 模式 | 订阅 |
|---|---|
| `session.s_42.output` | 一个精确 |
| `session.*.output` | 所有 session 的 output |
| `session.s_42.*` | 一个 session 的所有事件 |
| `*` | 全部(仅 admin) |

按 [integrations/events-ws](../integrations/events-ws),模式必须
匹配 API key 上的 scope(`event:subscribe:<prefix>`)。
