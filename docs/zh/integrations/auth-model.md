---
kind: capability
title: Auth 模型
tldr: 两种 token — admin bearer(全 UI 访问)+ 集成 API key(限 scope)。Bearer 在 Authorization header。opendray 在反代请求里加 X-Integration-ID。
status: stable
since: v0.1.0
topic: integrations
related: [integrations/overview, integrations/reverse-proxy, consuming/authentication]
capability: [admin-bearer, integration-key, scope-enforcement]
inbound: http-bearer
outbound: header-injection
x-implementation: [internal/auth/, internal/integration/middleware.go]
---

# Auth 模型

> **tldr:** 两种 token —— admin bearer(全 UI 访问)+ 集成 API key(限 scope)。Bearer 在 `Authorization` header。opendray 在反代请求里加 `X-Integration-ID`。

## Token 类型

| 类型 | 用于 | Scope | Header |
|---|---|---|---|
| Admin bearer | 操作员(web UI、CLI 工具) | 全部 | `Authorization: Bearer od_admin_xxx` |
| Integration key | 你写的外部 app | 声明的 scope | `Authorization: Bearer od_live_xxx` |

## Scope 词汇

| Scope | 让该 key 能 |
|---|---|
| `session:read` | list/get sessions、tail PTY |
| `session:write` | spawn / 写 input / 终止 |
| `channel:read` | list channels |
| `channel:send` | 通过 channel 即兴发送 |
| `memory:read` | 查记忆库 |
| `memory:write` | 写 project/global scope |
| `event:subscribe:session.*` | WS 订阅 session 事件 |
| `event:subscribe:channel.*` | WS 订阅 channel 事件 |
| `event:subscribe:memory.*` | WS 订阅 memory 事件 |

权威列表见 [/capabilities/integrations.json](/capabilities/integrations.json)。

## Errors

| code | http | 原因 | 修复 |
|---|---|---|---|
| `unauthenticated` | 401 | 缺/畸形 `Authorization` header | 加 `Bearer od_*` |
| `key_revoked` | 401 | key 被 rotate 或删 | Integrations 页重发 |
| `key_expired` | 401 | 超 `expires_at` | 重发或延期 |
| `insufficient_scope` | 403 | key 缺该路由所需 scope | 重发时加 scope |
