# Call log

每一次认证过的 `/api/v1/*` 调用(管理员或集成)都会落进 `integration_call_log` 这张 Postgres 表。Integrations 页面在它之上提供搜索 + 过滤的 UI。

## 记录了什么

| 列 | 示例 |
|---|---|
| `id` | bigint serial |
| `ts` | `2026-05-04 10:32:14+00` |
| `principal_kind` | `admin` 或 `integration` |
| `principal_id` | 管理员 uid(始终是 `1`)或 `int_abc...` |
| `method` | `GET` / `POST` 等 |
| `path` | `/api/v1/sessions/ses_xyz/stream` |
| `status` | HTTP 状态码 |
| `duration_ms` | 往返耗时 |
| `request_id` | 与结构化日志行对应 |

opendray 默认把管理员调用从日志中排除 — 这张表是给 *外部* 工具用的,不是用来记录运维方在管理端的点击。打开 **Include admin calls** 过滤器,你也可以看到自己的管理动作。

## 它的用处

### 计费 / 内部分摊

```sql
select principal_id, count(*), avg(duration_ms)
from integration_call_log
where ts >= now() - interval '30 days'
  and path like '/api/v1/proxy/anthropic/%'
group by 1
order by 2 desc;
```

告诉你上个月哪个集成消耗了最多的 Anthropic API 调用 — 在向内部团队分摊计费时很有用。

### 异常检测

Activity 页面可以实时订阅 `integration.call_logged` 事件并在 UI 上呈现。不需要一整套 APM,就能搞出"任何对 /v1/messages 的调用超过 30s 就提醒我"这类临时告警。

### 取证

当集成的行为突然变化时,调用日志能给你:

- 时间 — 流量飙升从什么时候开始
- 关联 — `request_id` 让你能找到任意一次调用对应的结构化日志行
- 归属 — 用的是哪个 key(有助于锁定出问题的调用方)

## 过滤器

表格支持的过滤条件:

- 时间范围(默认最近 24h;预设 1h / 24h / 7d / 30d)
- Principal(任何具体集成 id,或 `admin`)
- 路径前缀(基于已有的 path pattern 自动补全)
- 状态码区间
- 耗时 ≥ N ms

过滤是服务端 SQL 查询,而不是在内存里 — 因此过滤 30 天高流量也很快。

## 留存

默认留存 **30 天**。在 `config.toml` 中可配:

```toml
[integration]
call_log_retention_days = 30
```

每天有一个后台任务跑 `DELETE FROM integration_call_log WHERE ts < now() - retention`。要永久保留,设 `call_log_retention_days = 0`。

## 导出

为了对接外部 SIEM,API 暴露:

```
GET /api/v1/integrations/_call-log/export?since=<ts>
```

把 JSONL 流式写到响应体 — 一行一次调用。用管理员 token;通过这个端点调用日志只读(写入是服务端内部的)。

## 隐私说明

opendray **不** 记录请求或响应的 body。path 会被记录,但看起来像 token 的查询参数(`?token=...`、`?api_key=...`、`?password=...`)在存储前会被脱敏成 `?token=REDACTED`。如果你把敏感内容嵌在了 path 段里(不要这么做),调整 `internal/integration/calllog.go` 里 `redactPath` 来匹配。
