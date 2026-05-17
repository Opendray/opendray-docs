---
kind: capability
title: Integration call log
tldr: Per-integration audit trail. Separate table from audit_log for volume. Fields — timestamp, integration_id, direction, method, path, status, latency_ms, resource_kind/id.
status: stable
since: v0.1.0
topic: integrations
related: [integrations/overview, activity/overview]
capability: [per-integration-audit, latency-tracking, filterable]
inbound: middleware
outbound: postgres
x-implementation: [internal/integration/calllog.go]
---

# Integration call log

> **tldr:** Per-integration audit trail. Separate table from `audit_log` for volume. Fields — timestamp, integration_id, direction, method, path, status, latency_ms, resource_kind/id.

## Where

| Where to view | Path |
|---|---|
| Web admin | **Activity** page → filter by integration |
| API | `GET /api/v1/integrations/{id}/calls?since=...&direction=...` |
| Postgres | `integration_call_log` table |

## Row schema

```sql
CREATE TABLE integration_call_log (
  id              UUID PRIMARY KEY,
  ts              TIMESTAMPTZ NOT NULL,
  integration_id  TEXT NOT NULL,
  direction       TEXT NOT NULL,        -- 'inbound' | 'outbound' | 'proxied'
  method          TEXT NOT NULL,        -- HTTP method
  path            TEXT NOT NULL,        -- request path
  status          INT  NOT NULL,        -- HTTP status code
  latency_ms      INT  NOT NULL,
  resource_kind   TEXT,                 -- 'session' | 'channel' | 'memory' | ...
  resource_id     TEXT,                 -- e.g. 's_42'
  request_id      TEXT NOT NULL,        -- correlation id
  error_code      TEXT                  -- if status >= 400
);

CREATE INDEX idx_call_log_integration_ts ON integration_call_log (integration_id, ts DESC);
CREATE INDEX idx_call_log_ts_status ON integration_call_log (ts DESC, status);
```

## Direction values

| Value | What |
|---|---|
| `inbound` | integration called opendray (e.g. spawn session) |
| `outbound` | opendray pushed to integration (events WS) |
| `proxied` | integration's client called `/api/v1/proxy/<prefix>/*` and we forwarded |

## Filter (Activity page)

| Filter | Source |
|---|---|
| Integration | dropdown of registered integrations |
| Direction | inbound / outbound / proxied / any |
| Status | 2xx / 3xx / 4xx / 5xx |
| Time range | last 1h / 24h / 7d / 30d / custom |
| Resource | path-contains filter (`session/s_42`) |

## Why separate from `audit_log`

| audit_log | integration_call_log |
|---|---|
| admin actions (create channel, rotate key) | every per-call event |
| ~10s/day | up to 1000s/day per integration |
| append-only | append-only |
| no auto-prune | configurable retention (default 30d) |

## Retention

```toml
[integration.call_log]
retention_days = 30           # 0 = forever
prune_schedule = "0 3 * * *"  # cron, daily 3am
```

## Errors

| code | http | cause | fix |
|---|---|---|---|
| `call_log_query_too_broad` | 400 | query window > 30d without filter | narrow time range or add integration_id |
| `call_log_export_too_large` | 413 | CSV export > 100 MB | narrow filter or use API pagination |
