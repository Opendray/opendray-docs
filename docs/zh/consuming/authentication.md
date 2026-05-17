---
kind: capability
title: 认证
tldr: Bearer token 在 Authorization header。两种 — admin(od_admin_xxx)和集成(od_live_xxx)。401 code — unauthenticated / key_revoked / key_expired。403 — insufficient_scope。
status: stable
since: v0.1.0
topic: consuming
related: [consuming/overview, consuming/scopes, integrations/auth-model]
capability: [bearer-token, scope-enforcement]
inbound: http
outbound: api
x-implementation: [internal/auth/]
---

# 认证

> **tldr:** Bearer token 在 `Authorization` header。两种 —— admin(`od_admin_xxx`)和集成(`od_live_xxx`)。401 code —— `unauthenticated` / `key_revoked` / `key_expired`。403 —— `insufficient_scope`。

## Token 格式

| Token | 格式 | 位置 |
|---|---|---|
| Admin bearer | `od_admin_<base64>` | Settings → Admin tokens |
| 集成 key | `od_live_<base64>` | Integrations → 注册;一次性显示 |

两者都放在 `Authorization: Bearer <token>`。

## 每请求验证

| # | 步骤 |
|---|---|
| 1 | 提取 `Authorization` header → 按空格切 |
| 2 | scheme != `Bearer` 或 token 缺 → 401 `unauthenticated` |
| 3 | 查 token:revoked?expired? → 401 `key_revoked` / `key_expired` |
| 4 | 路由必需 scope 从 OpenAPI `x-required-scope` |
| 5 | 匹配 token 的 scope → 不匹配 → 403 `insufficient_scope` |
| 6 | 注入 `X-Integration-ID`(proxy 路由) |
| 7 | 转发到 handler |

## 存储建议

| 对 | 错 |
|---|---|
| 进程 env 或 secret manager(Vault / AWS Secrets / 1Password CLI) | 提交进源码 |
| 按环境(dev / staging / prod) | 一个全局 key 用全部 |
| 90 天轮换一次 | 永不轮换 |

## Errors

| code | http | 含义 |
|---|---|---|
| `unauthenticated` | 401 | 缺 `Authorization` 或形状错 |
| `key_revoked` | 401 | key 被服务端 rotate / 删 |
| `key_expired` | 401 | 超 `expires_at` |
| `insufficient_scope` | 403 | 路由需要 key 没有的 scope |
