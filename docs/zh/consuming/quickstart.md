---
kind: concept
title: 接入 Quickstart
tldr: 注册集成 → 保存 API key → curl POST /api/v1/sessions → 用 WS 跟随。5 分钟端到端。
status: stable
since: v0.1.0
topic: consuming
related: [consuming/overview, consuming/authentication, consuming/rest-api]
references:
  capabilities: [integrations]
---

# 接入 Quickstart

> **tldr:** 注册集成 → 保存 API key → `curl POST /api/v1/sessions` → 用 WS 跟随。5 分钟端到端。

## Setup

| # | 动作 | 验证 |
|---|---|---|
| 1 | opendray **Integrations → Register** → 名 `quicktest` → base_url `http://localhost:9999` → scope `session:read`、`session:write`、`event:subscribe:session.*` | 行出现 |
| 2 | 保存一次性显示的 key `od_live_xxx` | (存进 secret manager) |
| 3 | `curl -X POST` spawn 会话 | 201 带 `s_xxx` id |
| 4 | `wscat -c` 订阅它的输出 | 事件流式来 |
| 5 | `curl POST /input` 发文本 | 会话反应 |

## Step 3 — spawn

```bash
curl -X POST http://localhost:8770/api/v1/sessions \
  -H "Authorization: Bearer od_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "claude",
    "cwd": "/tmp/quicktest",
    "name": "smoke-test"
  }'

# → 201 { "id": "s_42", "state": "running", ... }
```

## Step 4 — WS 跟随输出

```bash
wscat -c "ws://localhost:8770/api/v1/integrations/_events" \
  -H "Authorization: Bearer od_live_xxx" \
  -x '{"type":"subscribe","topics":["session.s_42.output"]}'

# → {"topic":"session.s_42.output","payload":{"stream":"stdout","data":"..."}}
```

## Step 5 — 发输入

```bash
curl -X POST http://localhost:8770/api/v1/sessions/s_42/input \
  -H "Authorization: Bearer od_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{"text":"hello\n"}'

# → 204
```
