# API Reference — overview

opendray exposes a stable HTTP + WebSocket API that any third-party
client can drive. This section is the *machine-readable contract* —
endpoints, payload schemas, error codes, rate limits.

If you want a guided introduction to *consuming* the API (auth, key
rotation, SDK usage), start at
[Consuming opendray → Quickstart](/consuming/quickstart) instead.
This reference assumes you've already authenticated.

<Callout type="info">
**API base URL** — every example below uses `http://localhost:8651` as
the host. Replace it with your deployed host (e.g. `https://opendray.your.domain`).
</Callout>

## Surfaces

<CardGroup :cols="3">
<Card icon="📡" title="REST" href="/reference/rest">
Synchronous request / response. Use for spawning sessions, sending
input, listing channels, managing keys, etc.
</Card>
<Card icon="🔌" title="WebSocket" href="/reference/websocket">
Long-lived event stream. Use to subscribe to session output, channel
deliveries, memory writes, and notifications.
</Card>
<Card icon="⚠" title="Errors" href="/reference/errors">
Every error response uses a stable `code` + `message` shape. The
catalogue lists every code and its remediation hint.
</Card>
</CardGroup>

## Authentication

All authenticated endpoints require an API key in the `Authorization`
header:

```http
GET /api/v1/sessions HTTP/1.1
Host: localhost:8651
Authorization: Bearer od_live_xxxxxxxxxxxxxxxxxxxxxxx
```

Keys are minted in **Settings → Integration keys** (or via
`POST /api/v1/keys`) and are *scoped* — see the
[scopes reference](/consuming/scopes) for what each key can touch.

## Versioning

The API is versioned via the URL path (`/api/v1/...`). Breaking
changes ship as `/v2/`, with the older version supported for at least
6 months in parallel.

| Version | Status | Status changed |
|---|---|---|
| `v1` | <Badge type="beta">Beta</Badge> | initial preview |
| `v2` | not yet | — |

<Callout type="warning">
The `v1` schema is still being finalized. Pin the SDK version (or the
specific endpoint shape you depend on) until we tag `v1.0.0`. Breaking
changes during the beta will be called out in the
[changelog](/releases/changelog).
</Callout>

## Pagination

Endpoints that return collections paginate with **opaque cursors**:

```json
{
  "data": [ { "id": "..." }, ... ],
  "pagination": {
    "next_cursor": "eyJpZCI6Im...",
    "has_more": true
  }
}
```

Pass `?cursor=<next_cursor>` to fetch the next page. Don't try to
construct cursors yourself — they're opaque and can change shape.

## Rate limits

Default limits per integration key are documented in
[rate limits](/reference/rate-limits). All responses include the
standard `X-RateLimit-*` headers.

## SDKs

<CardGroup :cols="2">
<Card icon="📘" title="TypeScript / JS" href="/consuming/typescript-sdk">
Official `@opendray/sdk` package. Auto-generated from the same
OpenAPI spec that powers this reference.
</Card>
<Card icon="📕" title="Python (planned)">
Generated from the OpenAPI spec. Not yet shipped — track the
[roadmap](/releases/roadmap) for status.
</Card>
</CardGroup>
