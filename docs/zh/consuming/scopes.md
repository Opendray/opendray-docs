---
kind: capability
title: Scope 参考
tldr: 枚举每个 scope id、路由映射、模式(read / write / send / subscribe)。权威源 — /capabilities/integrations.json。
status: stable
since: v0.1.0
topic: consuming
related: [consuming/authentication, integrations/auth-model]
capability: [session:read, session:write, channel:read, channel:send, channel:write, memory:read, memory:write, integration:read, integration:write, 'event:subscribe:session.*', 'event:subscribe:channel.*', 'event:subscribe:memory.*']
x-implementation: [internal/auth/scope.go, docs/public/capabilities/integrations.json]
---

# Scope 参考

> **tldr:** 枚举每个 scope id、路由映射、模式(read / write / send / subscribe)。权威源 —— [/capabilities/integrations.json](/capabilities/integrations.json)。

## Scope 目录

| Scope | 让该 key 能 | 路由 |
|---|---|---|
| `session:read` | 列表 / get / tail | `GET /sessions`、`GET /sessions/{id}`、`GET /sessions/{id}/events` |
| `session:write` | spawn / 输入 / 终止 | `POST /sessions`、`POST /sessions/{id}/input`、`DELETE /sessions/{id}` |
| `channel:read` | 列出 channels | `GET /channels` |
| `channel:write` | 注册 / 编辑 | `POST /channels`、`PUT /channels/{id}` |
| `channel:send` | 通过 channel 发送 | `POST /channels/{id}/send` |
| `memory:read` | 查 | `POST /memory/recall`、`POST /memory/list` |
| `memory:write` | 写 project / global | `POST /memory/store` |
| `integration:read` | 列 / get | `GET /integrations`、`GET /integrations/{id}` |
| `integration:write` | 注册 / rotate / 禁用 | `POST /integrations`、`POST /integrations/{id}/rotate` |
| `event:subscribe:session.*` | WS 订阅 | session topic |
| `event:subscribe:channel.*` | WS 订阅 | channel topic |
| `event:subscribe:memory.*` | WS 订阅 | memory topic |
| `event:subscribe:notification.*` | WS 订阅 | notification topic |
| `event:subscribe:*` | WS 订阅 | 所有事件 topic |

## 按场景最小集

| 场景 | 最小 scope |
|---|---|
| dashboard(只读) | `session:read`、`channel:read`、`memory:read`、`event:subscribe:*` |
| 起 + 回复的 bot | `session:read`、`session:write`、`event:subscribe:session.*` |
| 通知扇出 | `channel:read`、`channel:send` |
| 记忆增强服务 | `memory:read`、`memory:write` |
| 元工具(rotate key 等) | `integration:read`、`integration:write` |
