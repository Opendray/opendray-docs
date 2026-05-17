---
kind: concept
title: API Reference — overview
tldr: REST + WebSocket API surface. Auth = Bearer admin or integration key. Versioned via /api/v1 path. Per-key rate limits. Authoritative spec — /openapi.yaml.
status: stable
since: v0.1.0
topic: reference
related:
  - reference/rest
  - reference/websocket
  - reference/errors
  - reference/rate-limits
  - consuming/overview
references:
  capabilities: [integrations]
x-implementation:
  - internal/gateway/
  - docs/public/openapi.yaml
---

# API Reference — overview

> **tldr:** REST + WebSocket API surface. Auth = Bearer admin or integration key. Versioned via `/api/v1` path. Per-key rate limits. Authoritative spec — [/openapi.yaml](/openapi.yaml).

## Machine-readable artifacts

| Artifact | URL | Use |
|---|---|---|
| OpenAPI 3.1 spec | [/openapi.yaml](/openapi.yaml) | feed into codegen |
| OpenAPI JSON (auto-generated) | `GET /api/v1/openapi.json` | server returns its own spec |
| Manifest | [/manifest.json](/manifest.json) | top-level capabilities |
| Channel schemas | [/capabilities/channels.json](/capabilities/channels.json) | per-platform details |
| Provider schemas | [/capabilities/providers.json](/capabilities/providers.json) | per-CLI details |

## Base URL

| Environment | URL |
|---|---|
| Local dev | `http://localhost:8770` |
| Self-hosted | `https://<your-host>/api/v1` |

## Authentication

```http
GET /api/v1/sessions
Authorization: Bearer od_live_xxxxxxxxxxxxxxxxxxxxxxx
```

Two token kinds:

| Kind | Prefix | Scope |
|---|---|---|
| Admin bearer | `od_admin_` | everything |
| Integration key | `od_live_` | declared scopes only |

Mint via Integrations page (UI) or `POST /api/v1/keys`. See
[consuming/authentication](../consuming/authentication).

## Versioning

| Version | Status | Notes |
|---|---|---|
| `v1` | stable | current |
| `v2` | not yet | breaking changes go here; v1 supported ≥ 6 months in parallel |

## Pagination

Opaque cursors:

```json
{
  "data": [ ... ],
  "pagination": { "next_cursor": "eyJp...", "has_more": true }
}
```

Pass `?cursor=<next_cursor>` for next page. Don't construct cursors.

## Rate limits

Per integration key. Headers on every response:

```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1715864120
```

Defaults + tier table: [rate-limits](./rate-limits).

## Read next

| Topic | Read |
|---|---|
| REST endpoints | [rest](./rest) |
| WebSocket | [websocket](./websocket) |
| Error envelope + codes | [errors](./errors) |
| Limit details | [rate-limits](./rate-limits) |
