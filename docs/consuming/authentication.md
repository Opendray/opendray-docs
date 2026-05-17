---
kind: capability
title: Authentication
tldr: Bearer token in Authorization header. Two kinds — admin (od_admin_xxx) and integration (od_live_xxx). 401 codes — unauthenticated / key_revoked / key_expired. 403 — insufficient_scope.
status: stable
since: v0.1.0
topic: consuming
related: [consuming/overview, consuming/scopes, integrations/auth-model]
capability: [bearer-token, scope-enforcement]
inbound: http
outbound: api
x-implementation: [internal/auth/]
---

# Authentication

> **tldr:** Bearer token in `Authorization` header. Two kinds — admin (`od_admin_xxx`) and integration (`od_live_xxx`). 401 codes — `unauthenticated` / `key_revoked` / `key_expired`. 403 — `insufficient_scope`.

## Token format

| Token | Format | Where |
|---|---|---|
| Admin bearer | `od_admin_<base64>` | Settings → Admin tokens |
| Integration key | `od_live_<base64>` | Integrations → register; one-time-reveal |

Both go in `Authorization: Bearer <token>`.

## How auth works per request

| # | Step |
|---|---|
| 1 | Extract `Authorization` header → split on space |
| 2 | Reject if scheme != `Bearer` or token missing → 401 `unauthenticated` |
| 3 | Look up token: revoked? expired? → 401 `key_revoked` / `key_expired` |
| 4 | Route's required scope from OpenAPI `x-required-scope` |
| 5 | Match against token's declared scopes → 403 `insufficient_scope` if mismatch |
| 6 | Inject `X-Integration-ID` (proxy routes) |
| 7 | Forward to handler |

## Token lifecycle

| Event | Behaviour |
|---|---|
| Mint | one-time-reveal on the API response and Integrations card; never shown again |
| Use | every request |
| Rotate | issues successor token; old has 24h grace period |
| Revoke | immediate; `key_revoked` returned thereafter |
| Expire | optional `expires_at`; `key_expired` returned after |

## Storage on your side

| Right | Wrong |
|---|---|
| process env or secret manager (Vault / AWS Secrets / 1Password CLI) | committing to source |
| per-environment (dev / staging / prod) | one global key for everything |
| rotated 90 days | never rotated |

## Errors

| code | http | meaning |
|---|---|---|
| `unauthenticated` | 401 | missing `Authorization` or bad shape |
| `key_revoked` | 401 | key was rotated / deleted server-side |
| `key_expired` | 401 | past `expires_at` |
| `insufficient_scope` | 403 | route needs scope not in key |
