---
kind: concept
title: Consuming Quickstart
tldr: Register integration → save API key → curl POST /api/v1/sessions → tail with WS. End-to-end in 5 minutes.
status: stable
since: v0.1.0
topic: consuming
related: [consuming/overview, consuming/authentication, consuming/rest-api]
references:
  capabilities: [integrations]
---

# Consuming Quickstart

> **tldr:** Register integration → save API key → `curl POST /api/v1/sessions` → tail with WS. End-to-end in 5 minutes.

## Setup

| # | Action | Verify |
|---|---|---|
| 1 | opendray **Integrations → Register** → name `quicktest` → base_url `http://localhost:9999` → scopes `session:read`, `session:write`, `event:subscribe:session.*` | row appears |
| 2 | Save the one-time-revealed key `od_live_xxx` | (stored in your secret manager) |
| 3 | `curl -X POST` to spawn a session | 201 with `s_xxx` id |
| 4 | `wscat -c` to subscribe to its output | events stream |
| 5 | `curl POST /input` to send text | session reacts |

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

## Step 4 — tail output via WS

```bash
wscat -c "ws://localhost:8770/api/v1/integrations/_events" \
  -H "Authorization: Bearer od_live_xxx" \
  -x '{"type":"subscribe","topics":["session.s_42.output"]}'

# → {"topic":"session.s_42.output","payload":{"stream":"stdout","data":"..."}}
```

## Step 5 — send input

```bash
curl -X POST http://localhost:8770/api/v1/sessions/s_42/input \
  -H "Authorization: Bearer od_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{"text":"hello\n"}'

# → 204
```

## What you just proved

| Capability | Evidence |
|---|---|
| Scoped auth works | the curl call succeeded only because key has `session:write` |
| Sessions API | spawn returned `s_42` |
| WS event push | output streamed in real time |
| Input round-trip | text appeared in PTY |

## Next

| Topic | Read |
|---|---|
| Scope vocabulary | [scopes](./scopes) |
| All REST endpoints | [rest-api](./rest-api) |
| Typed client | [typescript-sdk](./typescript-sdk) |
| Production error handling | [error-handling](./error-handling) |
| Zero-downtime key swap | [key-rotation](./key-rotation) |
