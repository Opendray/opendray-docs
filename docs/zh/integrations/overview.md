---
kind: concept
title: 集成 Integrations — 概览
tldr: opendray = 受管反向代理 + scope 限权 API key + 事件 WS。你的 pettracker / materialscout 应用注册成集成,共享一份 Claude Pro 订阅,有独立审计。
status: stable
since: v0.1.0
topic: integrations
related: [integrations/auth-model, integrations/reverse-proxy, integrations/call-log, integrations/events-ws, consuming/overview]
references:
  capabilities: [integrations]
x-implementation: [internal/integration/]
---

# 集成 Integrations — 概览

> **tldr:** opendray = 受管反向代理 + scope 限权 API key + 事件 WS。你的 pettracker / materialscout 应用注册成集成,共享一份 Claude Pro 订阅,有独立审计。

## 是什么

| 关心点 | opendray 提供 |
|---|---|
| 每 app 一个 API key | scope 限权(如 `session:read`、`event:subscribe:session.*`) |
| 反向代理 | `/api/v1/proxy/<prefix>/*` → 你的 app 的 `base_url/*` |
| 事件推送 | `/api/v1/integrations/_events` WS 带 topic 过滤 |
| 健康探活 | 30s 探活你的 app 的 `GET /`;2 次失败 → unhealthy |
| 调用审计 | 每条调用记到 `integration_call_log`(跟 `audit_log` 分开为减压) |
| 密钥轮换 | 24h grace 期,一键 rotate |

| Capability JSON | 权威源 |
|---|---|
| [/capabilities/integrations.json](/capabilities/integrations.json) | scope、proxy 细节、事件 |

## 跟 Remote Claude Code(RCC)插件的区别

| RCC | opendray 集成 |
|---|---|
| 无 API key | per-app scope key |
| 不透明代理 | scope 强制网关 |
| 轮询 | WS 事件推送 |
| 无健康检查 | 30s 健康探活 |
| 无 per-integration 审计 | per-integration 审计 + 成本追踪 |

## 何时读什么

| 主题 | 读 |
|---|---|
| Scope 词汇 + auth 怎么工作 | [auth-model](./auth-model) |
| 反向代理细节(header、body 限制) | [reverse-proxy](./reverse-proxy) |
| 事件推送 WS | [events-ws](./events-ws) |
| Per-integration 调用日志 | [call-log](./call-log) |
| 写一个 **消费** opendray 的 app | [consuming/overview](../consuming/overview) |

![Integrations 页](/tutorial/integrations-layout.png)
