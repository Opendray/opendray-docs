---
kind: capability
title: Key rotation
tldr: POST /api/v1/integrations/{id}/rotate → returns new key + 24h grace period during which old key still works. Operators rotate on schedule or after suspected leak.
status: stable
since: v0.1.0
topic: consuming
related: [consuming/authentication, integrations/auth-model]
capability: [grace-period-rotation, immediate-revoke]
inbound: api
outbound: postgres
x-implementation: [internal/integration/rotate.go]
---

# Key rotation

> **tldr:** `POST /api/v1/integrations/{id}/rotate` → returns new key + 24h grace period during which old key still works. Operators rotate on schedule or after suspected leak.

## Rotate API

```http
POST /api/v1/integrations/int_wN79.../rotate
Authorization: Bearer od_admin_xxx
```

Response:

```json
{
  "id": "int_wN79...",
  "api_key": "od_live_new_xxx",     // one-time reveal
  "previous_key_expires_at": "2026-05-18T10:24:00Z"
}
```

## Grace period

| Time | Old key | New key |
|---|---|---|
| T+0 (rotation moment) | ✓ works (tagged `rotated_pending`) | ✓ works |
| T+24h | 401 `key_revoked` | ✓ works |

24h is intentional — gives you time to deploy the new key without
downtime.

## Recipe — zero-downtime swap

| # | Action | Where |
|---|---|---|
| 1 | Call rotate API | opendray |
| 2 | Save new key to secret manager | Vault / AWS Secrets / 1Password |
| 3 | Deploy app with new key | your infra |
| 4 | Verify (curl with new key) | your infra |
| 5 | Done — old key expires at T+24h | automatic |

## Audit

Every rotation logs to `audit_log` with `action=integration.rotate`,
`integration_id`, and `actor=<admin-token-id>`.

```sql
SELECT ts, actor, payload
FROM audit_log
WHERE action = 'integration.rotate'
  AND payload->>'integration_id' = 'int_wN79...'
ORDER BY ts DESC LIMIT 10;
```

## Immediate revoke (no grace)

For suspected leak:

```http
DELETE /api/v1/integrations/{id}
```

→ key revoked immediately; subsequent calls → 401 `key_revoked`.

## Errors

| code | http | cause | fix |
|---|---|---|---|
| `integration_not_found` | 404 | wrong id | check `/api/v1/integrations` list |
| `rotation_in_progress` | 409 | previous rotate < 5 minutes ago | wait |
| `rotation_blocked_owner_only` | 403 | non-admin caller | use admin bearer |
