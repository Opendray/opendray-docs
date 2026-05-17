---
kind: capability
title: Error codes
tldr: 'Catalogue of every error code returned by the REST + WS API. Envelope: { error: { code, message, hint, request_id } }. Match on code programmatically.'
status: stable
since: v0.1.0
topic: reference
related:
  - reference/overview
  - reference/rest
  - consuming/error-handling
capability:
  - stable-error-codes
  - error-envelope
x-implementation:
  - internal/gateway/error.go
---

# Error codes

> **tldr:** Catalogue of every error code returned by the REST + WS API. Envelope `{ error: { code, message, hint, request_id } }`. Match on `code` programmatically.

Every error response from the REST API uses the same envelope:

```json
{
  "error": {
    "code": "session_not_found",
    "message": "No session with id s_999",
    "hint": "Use GET /api/v1/sessions to list visible sessions."
  }
}
```

The `code` is **stable** — match on it programmatically. The
`message` may be tweaked for clarity over time. The `hint` is a
remediation suggestion you can surface to the user.

## Authentication / authorization

| Code | HTTP | Meaning |
|---|---|---|
| `unauthenticated` | 401 | No `Authorization` header, or token invalid |
| `key_revoked` | 401 | The key was rotated or deleted |
| `key_expired` | 401 | The key passed its `expires_at` |
| `insufficient_scope` | 403 | Key lacks the required scope for the action |

## Sessions

| Code | HTTP | Meaning |
|---|---|---|
| `session_not_found` | 404 | No session with the given id (or no permission) |
| `session_terminated` | 410 | Session already exited; can't send input |
| `provider_unavailable` | 503 | The configured CLI binary couldn't start |
| `cwd_invalid` | 400 | The `cwd` doesn't exist or isn't accessible |

## Channels

| Code | HTTP | Meaning |
|---|---|---|
| `channel_not_found` | 404 | No channel with the given id |
| `channel_not_connected` | 503 | Channel state is `failed` / `connecting` |
| `channel_kind_unsupported` | 400 | Unknown `kind` (use one of the bundled types) |

## Memory

| Code | HTTP | Meaning |
|---|---|---|
| `embedder_unavailable` | 503 | Configured embedder backend (ONNX/Ollama) down |
| `scope_invalid` | 400 | Unknown or malformed scope spec |

## Rate limiting

| Code | HTTP | Meaning |
|---|---|---|
| `rate_limited` | 429 | See `Retry-After` header for backoff |

See [rate limits](/reference/rate-limits) for default thresholds.

## Internal

| Code | HTTP | Meaning |
|---|---|---|
| `internal_error` | 500 | Generic catch-all; check server logs |
| `dependency_unavailable` | 503 | Upstream (DB / queue / embedder) unreachable |

<Callout type="tip">
If you hit a `500 internal_error`, the response also includes a
`request_id` field. Reference it when filing an issue — it makes
log correlation trivial.
</Callout>
