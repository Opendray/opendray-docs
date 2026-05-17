---
kind: capability
title: 反向代理
tldr: 任意 HTTP 后端挂在 opendray 之后。/api/v1/proxy/<prefix>/* → <integration.base_url>/*。opendray 注入 X-Integration-ID,剥离入站 Authorization,应用 scope 检查。
status: stable
since: v0.1.0
topic: integrations
related: [integrations/overview, integrations/auth-model, integrations/call-log]
capability: [reverse-proxy, header-injection, scope-enforcement]
inbound: http
outbound: http
x-implementation: [internal/integration/proxy.go]
---

# 反向代理

> **tldr:** 任意 HTTP 后端挂在 opendray 之后。`/api/v1/proxy/<prefix>/*` → `<integration.base_url>/*`。opendray 注入 `X-Integration-ID`,剥离入站 `Authorization`,应用 scope 检查。

## 路由

| 请求 | 转发到 |
|---|---|
| `GET /api/v1/proxy/pettracker/v1/pets` | `https://pettracker.local/v1/pets` |
| `POST /api/v1/proxy/pettracker/v1/pets/42/vaccinate` | `https://pettracker.local/v1/pets/42/vaccinate` |

`prefix` = 集成注册名(`pettracker`)。`base_url` 从集成记录取。

## Header

| Header | 方向 | 什么 |
|---|---|---|
| `X-Integration-ID` | 注入 | 集成 id(`int_wN79...`) |
| `X-OpenDray-Forwarded-For` | 注入 | 原始客户端 IP |
| `X-OpenDray-API-Version` | 注入 | `v1` |
| `Authorization`(入站) | **剥离** | 客户端 bearer 不转发 |

| body 大小限制 | 方向 |
|---|---|
| 10 MB | 请求 |
| 10 MB | 响应 |

## 健康 gating

| 探活结果 | 代理行为 |
|---|---|
| 健康 | 正常转发 |
| 第 1 次失败 | 仍转发 |
| 2 次连续失败 | 标 unhealthy;后续 → 503 `channel_not_connected` |
| unhealthy 后 1 次成功 | 回 healthy |

## Errors

| code | http | 原因 | 修复 |
|---|---|---|---|
| `integration_not_found` | 404 | 未知 prefix | 查 `/api/v1/integrations` 列表 |
| `integration_disabled` | 503 | `enabled: false` | Integrations 页打开 |
| `channel_not_connected` | 503 | 健康探活说 unhealthy | 检查后端 `GET /` |
| `proxy_body_too_large` | 413 | > 10 MB | 拆成小调用 |
| `proxy_backend_unreachable` | 502 | DNS / TCP 失败到 `base_url` | 验 URL + 网络 |
