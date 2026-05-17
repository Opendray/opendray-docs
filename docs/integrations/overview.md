---
kind: concept
title: Integrations — overview
tldr: opendray = managed reverse-proxy + scoped API keys + event WS for external apps. Your pettracker/materialscout app registers as an integration, shares one Claude Pro subscription, gets its own audit trail.
status: stable
since: v0.1.0
topic: integrations
related:
  - integrations/auth-model
  - integrations/reverse-proxy
  - integrations/call-log
  - integrations/events-ws
  - consuming/overview
references:
  capabilities: [integrations]
x-implementation:
  - internal/integration/
---

# Integrations — overview

> **tldr:** opendray = managed reverse-proxy + scoped API keys + event WS for external apps. Your pettracker / materialscout app registers as an integration, shares one Claude Pro subscription, gets its own audit trail.

## What it is

| Concern | opendray provides |
|---|---|
| API key per app | scoped key (e.g. `session:read`, `event:subscribe:session.*`) |
| Reverse proxy | `/api/v1/proxy/<prefix>/*` → your app's `base_url/*` |
| Event push | WS at `/api/v1/integrations/_events` with topic filter |
| Health probes | 30s probe of your app's `GET /`; 2 fails → unhealthy |
| Call audit | every call logged to `integration_call_log` (separate from `audit_log` for volume) |
| Key rotation | 24h grace period, one-click rotate |

| Capability JSON | Authoritative source |
|---|---|
| [/capabilities/integrations.json](/capabilities/integrations.json) | Scopes, proxy details, events |

## Difference from Remote Claude Code (RCC) plugin

| RCC | opendray integration |
|---|---|
| no API key | scoped API key per app |
| opaque proxy | scope-enforced gateway |
| polling | event push via WS |
| no health checking | 30s health probes |
| no per-integration audit | per-integration audit + cost tracking |

## When to read what

| Topic | Read |
|---|---|
| Scope vocabulary + how auth works | [auth-model](./auth-model) |
| Reverse-proxy details (headers, body limits) | [reverse-proxy](./reverse-proxy) |
| Event push WS | [events-ws](./events-ws) |
| Per-integration call log | [call-log](./call-log) |
| Build an app that CONSUMES opendray | [consuming/overview](../consuming/overview) |

![Integrations page](/tutorial/integrations-layout.png)
