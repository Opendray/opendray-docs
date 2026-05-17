---
kind: capability
title: Topics catalogue
tldr: Every event topic + payload schema. session.* / channel.* / memory.* / notification.* / system.*. Canonical for WS subscribe filters.
status: stable
since: v0.1.0
topic: activity
related: [activity/overview, integrations/events-ws, consuming/websocket-events]
capability: [event-bus, topic-hierarchy]
inbound: internal-publishers
outbound: ws-subscribers
x-implementation: [internal/eventbus/topics.go]
---

# Topics catalogue

> **tldr:** Every event topic + payload schema. `session.*` / `channel.*` / `memory.*` / `notification.*` / `system.*`. Canonical for WS subscribe filters.

## Topic prefixes

| Prefix | Publisher | Subscribers |
|---|---|---|
| `session.*` | session manager | integration events WS, channel hub |
| `channel.*` | channel hub | integration events WS, audit |
| `memory.*` | memory subsystem | integration events WS, project memory scanner |
| `notification.*` | UI notification engine | integration events WS, web admin |
| `system.*` | gateway lifecycle | audit log |

## Session topics

| Topic | Payload |
|---|---|
| `session.s_42.started` | `{ session_id, provider, cwd, args }` |
| `session.s_42.output` | `{ stream: 'stdout'\|'stderr', data: string }` |
| `session.s_42.idle` | `{ session_id, idle_for_seconds }` |
| `session.s_42.permission_ask` | `{ command, context_hint }` |
| `session.s_42.ended` | `{ exit_code, reason }` |
| `session.s_42.stopped` | `{ signaled_by, exit_code }` |

## Channel topics

| Topic | Payload |
|---|---|
| `channel.ch_tg_main.connecting` | `{ channel_id, kind }` |
| `channel.ch_tg_main.running` | `{ channel_id, kind }` |
| `channel.ch_tg_main.failed` | `{ channel_id, error_code, error_message }` |
| `channel.ch_tg_main.message_in` | `{ user_id, text, reply_to }` |
| `channel.ch_tg_main.message_forwarded` | `{ session_id, text }` |
| `channel.ch_tg_main.delivery` | `{ message_id, ok }` |

## Memory topics

| Topic | Payload |
|---|---|
| `memory.write` | `{ id, scope, scope_key, source: 'tool'\|'mirror'\|'capture' }` |
| `memory.recall` | `{ query, scope, top_k, hit_count, latency_ms }` |
| `memory.conflict_detected` | `{ row_id, conflict_with_id, similarity }` |
| `memory.cleanup.run_started` | `{ scheduler: 'cron'\|'manual' }` |
| `memory.cleanup.row_removed` | `{ id, reason: 'stale'\|'superseded'\|... }` |

## Notification topics

| Topic | Payload |
|---|---|
| `notification.session_idle_pushed` | `{ session_id, channel_id, recipient }` |
| `notification.permission_ask_pushed` | same |
| `notification.session_done_pushed` | same |

## System topics

| Topic | Payload |
|---|---|
| `system.startup` | `{ version, uptime_s: 0 }` |
| `system.shutdown` | `{ reason, uptime_s }` |
| `system.config_reloaded` | `{ section }` |
| `system.embedder_changed` | `{ from, to }` |

## Subscribing

Topic patterns support wildcards:

| Pattern | Subscribes to |
|---|---|
| `session.s_42.output` | one exact |
| `session.*.output` | all sessions' output |
| `session.s_42.*` | all events for one session |
| `*` | everything (admin-only) |

Per [integrations/events-ws](../integrations/events-ws), patterns
must match the scope on your API key (`event:subscribe:<prefix>`).
