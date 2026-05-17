---
kind: capability
title: 错误处理
tldr: '所有错误用同一个信封,含 code / message / hint / request_id。code 程序化匹配;message 可能变。hint 可直接给用户看。'
status: stable
since: v0.1.0
topic: consuming
related: [consuming/overview, reference/errors]
capability: [error-envelope, stable-codes, request-id-correlation]
inbound: api
outbound: json
x-implementation: [internal/gateway/error.go]
---

# 错误处理

> **tldr:** 所有错误用 `{ "error": { "code", "message", "hint", "request_id" } }` 信封。`code` 程序化匹配;`message` 可能变。`hint` 可直接给用户看。

## 信封

```json
{
  "error": {
    "code":       "session_not_found",
    "message":    "No session with id s_999",
    "hint":       "用 GET /api/v1/sessions 列出可见会话。",
    "request_id": "req_01HGW4..."
  }
}
```

| 字段 | 稳定性 | 用 |
|---|---|---|
| `code` | **稳定** —— 程序化匹配 | switch on 这个 |
| `message` | 可能变 | 记日志;别展示 |
| `hint` | 可能变 | 安全给用户看 |
| `request_id` | 始终在 | 报 ticket / GitHub issue 时带 |

## 状态码段

| 段 | 含义 | 例 |
|---|---|---|
| 200–299 | 成功 | 200 OK、201 Created、204 No Content |
| 400 | 客户端错 | `cwd_invalid`、`manifest_unknown_field` |
| 401 | 认证错 | `unauthenticated`、`key_revoked`、`key_expired` |
| 403 | 认证可但 scope 错 | `insufficient_scope` |
| 404 | 资源找不到 / 不可见 | `session_not_found`、`integration_not_found` |
| 409 | 冲突 | `provider_id_conflict`、`rotation_in_progress` |
| 410 | 已 gone | `session_terminated`、`slack_thread_archived` |
| 413 | payload 太大 | `proxy_body_too_large`、`injection_too_large` |
| 429 | 限流 | `rate_limited`(看 `Retry-After`) |
| 500 | 服务器 bug | `internal_error`(报 bug 时带 `request_id`) |
| 502/503 | 上游 / 依赖 | `proxy_backend_unreachable`、`embedder_unavailable` |

完整 code 目录:[reference/errors](../reference/errors)。

## 重试策略

| 状态 | 重试? | 怎么 |
|---|---|---|
| 4xx(除 408, 429) | ✗ | 客户端 bug;修代码 |
| 408 timeout | ✓ | 一次延迟 |
| 429 rate limited | ✓ | 遵守 `Retry-After` header |
| 5xx | ✓ | 指数退避,最多 3 次 |
| 503 `embedder_unavailable` | ✓ | 更长延迟,~30s |

## SDK 模式

```ts
import { OpenDrayError } from '@opendray/sdk'

try {
  return await od.sessions.spawn({ ... })
} catch (err) {
  if (!(err instanceof OpenDrayError)) throw err

  switch (err.code) {
    case 'rate_limited':
      await sleep(err.retryAfterMs ?? 1000)
      return retry()
    case 'provider_unavailable':
      throw new UserFacingError(`配置 ${err.hint}`)
    case 'cwd_invalid':
      throw new UserFacingError('路径不存在或不可读')
    default:
      reportToSentry(err)
      throw err
  }
}
```

## 报 bug 带 request_id

500 错都含 `request_id`。opendray 日志按它索引:

```bash
grep req_01HGW4 /tmp/opendray.log
```

GitHub issue / 支持请求里务必带 —— 有它日志关联 trivial,没它很痛。
