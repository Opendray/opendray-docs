---
kind: concept
title: Activity — overview
tldr: tail -f for opendray's system-wide event bus. Every session / channel / memory / notification event scrolls through. Filterable by integration / direction / status / time / topic.
status: stable
since: v0.1.0
topic: activity
related: [activity/topics-catalogue, integrations/call-log, integrations/events-ws]
references:
  capabilities: [integrations]
x-implementation: [internal/eventbus/, internal/integration/calllog.go]
---

# Activity — overview

> **tldr:** `tail -f` for opendray's system-wide event bus. Every session / channel / memory / notification event scrolls through. Filterable by integration / direction / status / time / topic.

## Two data sources

| Source | Page tab | What |
|---|---|---|
| Event bus | Activity → Events | live stream from `internal/eventbus/`; ephemeral |
| Call log | Activity → API calls | persisted to `integration_call_log` table |

## Page layout

| Region | What |
|---|---|
| Top filters | Integration / Direction / Status / Time range / Topic pattern |
| Stream | rolling list, newest top |
| Click row | expand to see full payload |
| Right pane | event detail viewer |

## Top filters

| Filter | Source |
|---|---|
| Integration | dropdown of registered + `admin` |
| Direction | inbound / outbound / proxied / event |
| Status | 2xx / 3xx / 4xx / 5xx (for API calls) / event-type (for bus events) |
| Time range | 5m / 1h / 24h / 7d / custom |
| Topic pattern | `session.*` / `channel.*.delivery` / `memory.*` etc. |

![Activity layout](/tutorial/activity-layout.png)

## When to use it

| Goal | How |
|---|---|
| Debug "why didn't my integration get the event?" | filter by integration + topic pattern |
| Compliance audit | filter by time range + integration → export CSV |
| Detect anomalous integration calls | filter by status 5xx |
| Trace request through the system | search by `request_id` |
