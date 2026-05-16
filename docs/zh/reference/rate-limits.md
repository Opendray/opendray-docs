# 限流

每个集成 key 的默认阈值。基于 token bucket(每秒补充),按 *key*
计数,不按 IP。

## 默认等级

| 等级 | 持续 req/s | 突发 | 备注 |
|---|---|---|---|
| `default` | 10 | 30 | 新建的 key 默认 |
| `service` | 100 | 300 | 建 key 时显式传 `tier: "service"` |
| `internal` | 不限 | — | 给后台 UI 自己用,不对外暴露 |

## 响应头

每个响应都带:

```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1715864120
```

`X-RateLimit-Reset` 是 unix 时间戳(秒)—— 到那时再发下一个请求。

## 撞到限流

返回 `429 Too Many Requests`:

```json
{
  "error": {
    "code": "rate_limited",
    "message": "Rate limit exceeded for key od_live_xxx",
    "hint": "Wait 2s before retrying (see Retry-After header)."
  }
}
```

响应带 `Retry-After: <秒>` 头。TypeScript SDK 默认遵循它做指数
退避,最多 3 次重试 —— 见 [TypeScript SDK](/zh/consuming/typescript-sdk)。

## 端点级覆盖

部分端点有更严的限制:

| 端点 | 覆盖 | 原因 |
|---|---|---|
| `POST /api/v1/sessions` | 2 req/s | 每个 spawn fork 进程 |
| `POST /api/v1/keys` | 0.1 req/s | 创建 key 是低频操作 |
| `POST /api/v1/channels/:id/send` | 5 req/s | 上游平台也限流 |

## 配置

要调整全局默认,改 `config.toml`:

```toml
[rate_limit]
default_per_second = 20
default_burst = 60

service_per_second = 200
service_burst = 600
```

`opendray reload` 热加载 —— 不需要重启。

<Callout type="warning">
调高这里的阈值绕不过上游平台限制(Telegram、Slack 等)。那些是
频道侧强制的,超了可能临时封号。
</Callout>
