---
kind: capability
title: Error handling
tldr: 'All errors use a single envelope with code / message / hint / request_id. Match on code programmatically; message may change. Hint is user-facing.'
status: stable
since: v0.1.0
topic: consuming
related: [consuming/overview, reference/errors]
capability: [error-envelope, stable-codes, request-id-correlation]
inbound: api
outbound: json
x-implementation: [internal/gateway/error.go]
---

# Error handling

> **tldr:** All errors use `{ "error": { "code", "message", "hint", "request_id" } }` envelope. Match on `code` programmatically; `message` may change. `hint` is user-facing.

## Envelope

```json
{
  "error": {
    "code":       "session_not_found",
    "message":    "No session with id s_999",
    "hint":       "Use GET /api/v1/sessions to list visible sessions.",
    "request_id": "req_01HGW4..."
  }
}
```

| Field | Stability | Use |
|---|---|---|
| `code` | **stable** — match programmatically | switch on this |
| `message` | may change | log it; don't display |
| `hint` | may change | safe to surface to user |
| `request_id` | always present | include in support tickets / GitHub issues |

## Status code groups

| Range | Meaning | Examples |
|---|---|---|
| 200–299 | success | 200 OK, 201 Created, 204 No Content |
| 400 | client did wrong | `cwd_invalid`, `manifest_unknown_field` |
| 401 | bad auth | `unauthenticated`, `key_revoked`, `key_expired` |
| 403 | auth ok, scope wrong | `insufficient_scope` |
| 404 | resource not found / not visible | `session_not_found`, `integration_not_found` |
| 409 | conflict | `provider_id_conflict`, `rotation_in_progress` |
| 410 | gone | `session_terminated`, `slack_thread_archived` |
| 413 | payload too large | `proxy_body_too_large`, `injection_too_large` |
| 429 | rate limited | `rate_limited` (see `Retry-After`) |
| 500 | server bug | `internal_error` (include `request_id` in bug report) |
| 502/503 | upstream / dependency | `proxy_backend_unreachable`, `embedder_unavailable` |

Full code catalogue: [reference/errors](../reference/errors).

## Retry strategy

| Status | Retry? | How |
|---|---|---|
| 4xx (except 408, 429) | ✗ | client bug; fix code |
| 408 timeout | ✓ | once with delay |
| 429 rate limited | ✓ | respect `Retry-After` header |
| 5xx | ✓ | exponential backoff, capped at 3 attempts |
| 503 `embedder_unavailable` | ✓ | longer delay, ~30s |

## SDK pattern

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
      throw new UserFacingError(`Configure ${err.hint}`)
    case 'cwd_invalid':
      throw new UserFacingError('Path does not exist or unreadable')
    default:
      reportToSentry(err)
      throw err
  }
}
```

## Including request_id in bug reports

Every 500 error includes `request_id`. opendray's logs index by it:

```bash
grep req_01HGW4 /tmp/opendray.log
```

Always include it in GitHub issues / support requests — log correlation
is trivial with it, painful without.
