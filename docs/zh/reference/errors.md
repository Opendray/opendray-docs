# 错误码

REST API 所有错误响应使用统一信封:

```json
{
  "error": {
    "code": "session_not_found",
    "message": "No session with id s_999",
    "hint": "Use GET /api/v1/sessions to list visible sessions."
  }
}
```

`code` 是 **稳定** 的 —— 程序里按它匹配。`message` 可能为了清晰度
会调整。`hint` 是可以直接展示给用户的修复建议。

## 认证 / 授权

| Code | HTTP | 含义 |
|---|---|---|
| `unauthenticated` | 401 | 没有 `Authorization` 头,或 token 无效 |
| `key_revoked` | 401 | Key 被轮换或删除 |
| `key_expired` | 401 | Key 超过 `expires_at` |
| `insufficient_scope` | 403 | Key 缺少该操作所需的 scope |

## 会话

| Code | HTTP | 含义 |
|---|---|---|
| `session_not_found` | 404 | 找不到指定 id 的会话(或无权限) |
| `session_terminated` | 410 | 会话已退出,不能再发输入 |
| `provider_unavailable` | 503 | 配置的 CLI 二进制启动失败 |
| `cwd_invalid` | 400 | `cwd` 不存在或不可访问 |

## 频道

| Code | HTTP | 含义 |
|---|---|---|
| `channel_not_found` | 404 | 找不到指定 id 的频道 |
| `channel_not_connected` | 503 | 频道处于 `failed` / `connecting` 状态 |
| `channel_kind_unsupported` | 400 | 未知 `kind`(使用内置类型) |

## 记忆

| Code | HTTP | 含义 |
|---|---|---|
| `embedder_unavailable` | 503 | 配置的 embedder 后端(ONNX/Ollama)不可达 |
| `scope_invalid` | 400 | 未知或畸形的 scope 规格 |

## 限流

| Code | HTTP | 含义 |
|---|---|---|
| `rate_limited` | 429 | 看 `Retry-After` 头退避 |

默认阈值见 [限流](/zh/reference/rate-limits)。

## 内部错误

| Code | HTTP | 含义 |
|---|---|---|
| `internal_error` | 500 | 通用兜底,看服务器日志 |
| `dependency_unavailable` | 503 | 上游(DB / 队列 / embedder)不可达 |

<Callout type="tip">
碰到 `500 internal_error` 时,响应里还有 `request_id` 字段。报 issue
时附上它 —— 日志关联会快很多。
</Callout>
