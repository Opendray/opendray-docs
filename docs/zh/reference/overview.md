---
kind: concept
title: API 参考 — 总览
tldr: REST + WebSocket API 面。Auth = Bearer admin 或 集成 key。/api/v1 路径版本化。Per-key 限流。权威 spec — /openapi.yaml。
status: stable
since: v0.1.0
topic: reference
related: [reference/rest, reference/websocket, reference/errors, reference/rate-limits, consuming/overview]
references:
  capabilities: [integrations]
x-implementation: [internal/gateway/, docs/public/openapi.yaml]
---

# API 参考 — 总览

> **tldr:** REST + WebSocket API 面。Auth = Bearer admin 或 集成 key。`/api/v1` 路径版本化。Per-key 限流。权威 spec —— [/openapi.yaml](/openapi.yaml)。

opendray 提供稳定的 HTTP + WebSocket API,第三方客户端可以驱动它。
本章是 *机器可读的契约* —— 端点、payload schema、错误码、限流。

如果你需要的是 *接入 API 的入门指南*(认证、密钥轮换、SDK 用法),
请去 [接入 opendray → 快速开始](/zh/consuming/quickstart)。本参考
假设你已经通过了认证。

<Callout type="info">
**API 基础 URL** —— 下文示例都用 `http://localhost:8651` 当 host,
请替换成你部署的地址(例如 `https://opendray.your.domain`)。
</Callout>

## 三个接口面

<CardGroup :cols="3">
<Card icon="📡" title="REST" href="/zh/reference/rest">
同步请求/响应。用于启动会话、发送输入、列出频道、管理 key 等。
</Card>
<Card icon="🔌" title="WebSocket" href="/zh/reference/websocket">
长连接事件流。订阅会话输出、频道投递、记忆写入、通知。
</Card>
<Card icon="⚠" title="错误码" href="/zh/reference/errors">
所有错误响应使用统一的 `code` + `message` 结构。本节列出每个 code
和对应的处理建议。
</Card>
</CardGroup>

## 认证

所有需要认证的接口要求 `Authorization` 头:

```http
GET /api/v1/sessions HTTP/1.1
Host: localhost:8651
Authorization: Bearer od_live_xxxxxxxxxxxxxxxxxxxxxxx
```

Key 在 **设置 → 集成密钥** 里生成(或 `POST /api/v1/keys`),并且
是 *按 scope 限权* 的 —— 见 [scopes 参考](/zh/consuming/scopes)。

## 版本管理

API 版本走 URL 路径(`/api/v1/...`)。破坏性变更升 `/v2/`,旧版本
至少并存 6 个月。

| 版本 | 状态 | 状态变更 |
|---|---|---|
| `v1` | <Badge type="beta">Beta</Badge> | 初始预览 |
| `v2` | 暂未发布 | — |

<Callout type="warning">
`v1` schema 还在最终化过程中。在我们 tag `v1.0.0` 之前请固定 SDK
版本(或你依赖的具体接口形状)。Beta 期间的破坏性变更会在
[更新日志](/zh/releases/changelog) 里单独标出。
</Callout>

## 分页

返回集合的接口用 **不透明游标** 分页:

```json
{
  "data": [ { "id": "..." }, ... ],
  "pagination": {
    "next_cursor": "eyJpZCI6Im...",
    "has_more": true
  }
}
```

下一页传 `?cursor=<next_cursor>`。不要自己拼游标 —— 它是不透明的,
形状会变。

## 限流

每个集成 key 的默认限流见 [限流参考](/zh/reference/rate-limits)。
所有响应包含标准 `X-RateLimit-*` 头。

## SDK

<CardGroup :cols="2">
<Card icon="📘" title="TypeScript / JS" href="/zh/consuming/typescript-sdk">
官方 `@opendray/sdk` 包。基于驱动本参考的同一份 OpenAPI 自动生成。
</Card>
<Card icon="📕" title="Python(规划中)">
基于 OpenAPI 生成。暂未发布,跟踪 [路线图](/zh/releases/roadmap)
看进度。
</Card>
</CardGroup>
