---
kind: capability
title: Reverse proxy
tldr: Mount any HTTP backend behind opendray. /api/v1/proxy/<prefix>/* → <integration.base_url>/*. opendray injects X-Integration-ID, strips incoming Authorization, applies scope check.
status: stable
since: v0.1.0
topic: integrations
related: [integrations/overview, integrations/auth-model, integrations/call-log]
capability: [reverse-proxy, header-injection, scope-enforcement]
inbound: http
outbound: http
x-implementation: [internal/integration/proxy.go]
---

# Reverse proxy

> **tldr:** Mount any HTTP backend behind opendray. `/api/v1/proxy/<prefix>/*` → `<integration.base_url>/*`. opendray injects `X-Integration-ID`, strips incoming `Authorization`, applies scope check.

## Routing

| Request | Forwards to |
|---|---|
| `GET /api/v1/proxy/pettracker/v1/pets` | `https://pettracker.local/v1/pets` |
| `POST /api/v1/proxy/pettracker/v1/pets/42/vaccinate` | `https://pettracker.local/v1/pets/42/vaccinate` |

`prefix` = integration's registered name (`pettracker`). `base_url`
comes from the integration record.

## Headers

| Header | Direction | What |
|---|---|---|
| `X-Integration-ID` | injected | the integration's id (`int_wN79...`) |
| `X-OpenDray-Forwarded-For` | injected | original client IP |
| `X-OpenDray-API-Version` | injected | `v1` |
| `Authorization` (incoming) | **stripped** | client's bearer token isn't forwarded |

| Body size limit | direction |
|---|---|
| 10 MB | request |
| 10 MB | response |

## Health gating

| Probe result | Proxy behaviour |
|---|---|
| healthy | forwards normally |
| 1st failure | still forwards |
| 2 consecutive failures | marks unhealthy; subsequent calls → 503 `channel_not_connected` |
| 1 success after unhealthy | back to healthy |

## Capabilities

| feature | supported |
|---|---|
| HTTP/1.1 + HTTP/2 | ✓ |
| WebSocket pass-through | ✗ (planned) |
| Streaming response | ✓ |
| Path / query forwarding | ✓ |
| Multipart forms | ✓ (≤ 10 MB) |
| Auto-retry on 5xx | ✗ |
| TLS to backend | ✓ (if `base_url` is https://) |

## Errors

| code | http | cause | fix |
|---|---|---|---|
| `integration_not_found` | 404 | unknown prefix | check `/api/v1/integrations` list |
| `integration_disabled` | 503 | `enabled: false` | toggle in Integrations page |
| `channel_not_connected` | 503 | health probe says unhealthy | check your backend's `GET /` |
| `proxy_body_too_large` | 413 | > 10 MB | chunk into smaller calls |
| `proxy_backend_unreachable` | 502 | DNS / TCP fail to `base_url` | verify URL + network |
