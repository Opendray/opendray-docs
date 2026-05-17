---
kind: capability
title: 集成调用日志
tldr: Per-集成 审计轨迹。跟 audit_log 分表为减压。字段 — timestamp、integration_id、direction、method、path、status、latency_ms、resource_kind/id。
status: stable
since: v0.1.0
topic: integrations
related: [integrations/overview, activity/overview]
capability: [per-integration-audit, latency-tracking, filterable]
inbound: middleware
outbound: postgres
x-implementation: [internal/integration/calllog.go]
---

# 集成调用日志

> **tldr:** Per-集成 审计轨迹。跟 `audit_log` 分表为减压。字段 —— timestamp、integration_id、direction、method、path、status、latency_ms、resource_kind/id。

## 查看位置

| 在哪 | 路径 |
|---|---|
| Web 后台 | **Activity** 页 → 按集成过滤 |
| API | `GET /api/v1/integrations/{id}/calls?since=...&direction=...` |
| Postgres | `integration_call_log` 表 |

## 行 schema

```sql
CREATE TABLE integration_call_log (
  id              UUID PRIMARY KEY,
  ts              TIMESTAMPTZ NOT NULL,
  integration_id  TEXT NOT NULL,
  direction       TEXT NOT NULL,        -- 'inbound' | 'outbound' | 'proxied'
  method          TEXT NOT NULL,
  path            TEXT NOT NULL,
  status          INT  NOT NULL,
  latency_ms      INT  NOT NULL,
  resource_kind   TEXT,
  resource_id     TEXT,
  request_id      TEXT NOT NULL,
  error_code      TEXT
);
```

## Direction 值

| 值 | 什么 |
|---|---|
| `inbound` | 集成调用 opendray(如 spawn session) |
| `outbound` | opendray 推到集成(事件 WS) |
| `proxied` | 集成客户端调 `/api/v1/proxy/<prefix>/*`,我们转发 |

## 保留

```toml
[integration.call_log]
retention_days = 30           # 0 = 永久
prune_schedule = "0 3 * * *"  # cron,每天凌晨 3 点
```
