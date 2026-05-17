---
kind: capability
title: Integration auth model
tldr: Two token types — admin bearer (full UI access) + integration API key (scoped). Bearer in Authorization header. opendray adds X-Integration-ID header to proxied requests.
status: stable
since: v0.1.0
topic: integrations
related: [integrations/overview, integrations/reverse-proxy, consuming/authentication]
capability: [admin-bearer, integration-key, scope-enforcement]
inbound: http-bearer
outbound: header-injection
x-implementation: [internal/auth/, internal/integration/middleware.go]
---

# Integration auth model

> **tldr:** Two token types — admin bearer (full UI access) + integration API key (scoped). Bearer in `Authorization` header. opendray adds `X-Integration-ID` header to proxied requests.

## Token types

| Type | Used by | Scope | Header |
|---|---|---|---|
| Admin bearer | the operator (web UI, CLI tools) | everything | `Authorization: Bearer od_admin_xxx` |
| Integration key | external apps you wrote | declared scopes | `Authorization: Bearer od_live_xxx` |

## Scope vocabulary

| Scope | Lets the key |
|---|---|
| `session:read` | list/get sessions, tail PTY |
| `session:write` | spawn / send input / terminate |
| `channel:read` | list channels |
| `channel:send` | ad-hoc send via channel |
| `memory:read` | query memory store |
| `memory:write` | write project/global scope |
| `event:subscribe:session.*` | WS subscribe to session events |
| `event:subscribe:channel.*` | WS subscribe to channel events |
| `event:subscribe:memory.*` | WS subscribe to memory events |

See [/capabilities/integrations.json](/capabilities/integrations.json) for the authoritative list.

## Per-request validation

| # | Step |
|---|---|
| 1 | Extract bearer token from `Authorization` header |
| 2 | Reject if missing → 401 `unauthenticated` |
| 3 | Look up token type + scopes |
| 4 | Match route's required scope against key's scopes |
| 5 | Reject if not in set → 403 `insufficient_scope` |
| 6 | Inject `X-Integration-ID` (proxy routes only) |
| 7 | Log to `integration_call_log` |

## Errors

| code | http | cause | fix |
|---|---|---|---|
| `unauthenticated` | 401 | missing/malformed `Authorization` header | add `Bearer od_*` |
| `key_revoked` | 401 | key rotated or deleted | re-mint via Integrations page |
| `key_expired` | 401 | past `expires_at` | re-mint or extend |
| `insufficient_scope` | 403 | key lacks scope required for route | add scope when re-minting |
