---
kind: concept
title: Consuming opendray — overview
tldr: Third-party-dev guide for building apps that call opendray. Register integration → scoped key → REST/WS API. Replaces per-token API billing with one Claude Pro subscription.
status: stable
since: v0.1.0
topic: consuming
related:
  - consuming/quickstart
  - consuming/authentication
  - consuming/rest-api
  - consuming/websocket-events
  - consuming/scopes
  - consuming/key-rotation
  - consuming/typescript-sdk
  - consuming/error-handling
  - integrations/overview
references:
  capabilities: [integrations]
---

# Consuming opendray — overview

> **tldr:** Third-party-dev guide for building apps that call opendray. Register integration → scoped key → REST/WS API. Replaces per-token API billing with one Claude Pro subscription.

## Audience

| Group | What |
|---|---|
| You | building an app (pettracker, materialscout, your-next-app) |
| opendray | already running on your server |
| Goal | your app spawns Claude sessions / sends channel messages / queries memory through opendray's API |
| Cost benefit | one $20/mo Claude Pro serves all your apps |

## What you'll read in order

| # | Topic | Why first |
|---|---|---|
| 1 | [Quickstart](./quickstart) | 5-min smoke test — register integration + curl test |
| 2 | [Authentication](./authentication) | bearer / scope vocab |
| 3 | [REST API](./rest-api) | per-endpoint reference |
| 4 | [WebSocket events](./websocket-events) | when you need push, not poll |
| 5 | [Scopes](./scopes) | enumerate every scope id |
| 6 | [Key rotation](./key-rotation) | zero-downtime key swap |
| 7 | [TypeScript SDK](./typescript-sdk) | typed client |
| 8 | [Error handling](./error-handling) | the `{code, message, hint}` envelope |

## Differences from integrations-page docs

| `/integrations/*` | `/consuming/*` |
|---|---|
| operator (you self-hosting) registering an integration | developer (third-party) writing the integration |
| reverse proxy, call log, events WS internals | how to call the API |
| `/capabilities/integrations.json` is canonical | `/openapi.yaml` is canonical |

## Machine-readable artifacts for AI agents

| Artifact | Use |
|---|---|
| [/openapi.yaml](/openapi.yaml) | feed into your codegen of choice |
| [/capabilities/integrations.json](/capabilities/integrations.json) | scope vocabulary |
| [/llms.txt](/llms.txt) | index of every doc page |
| [/manifest.json](/manifest.json) | one-shot site summary |
