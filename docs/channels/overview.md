---
kind: concept
title: Channels — overview
tldr: A channel is one messaging-platform binding. opendray bundles 7 kinds (telegram / slack / discord / feishu / dingtalk / wecom / bridge); all share the same notify + repeat-policy semantics.
status: stable
since: v0.1.0
topic: channels
related:
  - channels/telegram
  - channels/slack
  - channels/discord
  - channels/feishu
  - channels/dingtalk
  - channels/wecom
  - channels/bridge
  - channels/notifications
  - channels/routing
references:
  capabilities: [channels]
x-implementation:
  - internal/channel/hub.go
  - internal/channel/manager.go
---

# Channels — overview

> **tldr:** A *channel* is one messaging-platform binding. opendray bundles 7 kinds (telegram / slack / discord / feishu / dingtalk / wecom / bridge); all share the same notify + repeat-policy semantics.

## What it is

A *channel* is one configured messaging integration. Each channel
wraps the platform-specific protocol (long-poll / Socket Mode /
Gateway WS / webhook / group robot) behind opendray's uniform notify
+ routing model.

| Capability JSON | Authoritative source |
|---|---|
| [/capabilities/channels.json](/capabilities/channels.json) | Per-kind config schema, supported features, errors |

## Bundled kinds

| Kind | Inbound | Outbound | Public URL? | Best for |
|---|---|---|---|---|
| [`telegram`](./telegram) | long-poll | REST | no | solo dev — fastest setup |
| [`slack`](./slack) | Socket Mode | Web API + Block Kit | no | team chat, native interactivity |
| [`discord`](./discord) | Gateway WS | REST + embeds | no | dev / maker community |
| [`feishu`](./feishu) | webhook | tenant API | **yes** | China / cross-org formal channels |
| [`dingtalk`](./dingtalk) | (none) | group robot | no | China enterprise group rooms |
| [`wecom`](./wecom) | (none) | group robot | no | WeCom (企业微信) group rooms |
| [`bridge`](./bridge) | WebSocket | WebSocket | no (token-auth) | custom platforms (LINE / KakaoTalk / your own) |

## Lifecycle (same for every kind)

| # | Stage | What happens |
|---|---|---|
| 1 | provision | get credentials in the platform's admin console |
| 2 | register | opendray **Channels → New** → paste credentials |
| 3 | connect | hub establishes inbound + outbound transports |
| 4 | running | status pill green; ready to send / receive |
| 5 | (optional) tune | edit notifications panel: events, repeat policy, snippet |
| 6 | (optional) repeat | wire another kind for multi-platform fan-out |

## Capability matrix

| Capability | telegram | slack | discord | feishu | dingtalk | wecom | bridge |
|---|---|---|---|---|---|---|---|
| Receive user replies | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Markdown body | ✓ HTML | ✓ Block Kit | ✓ embed | ✓ Card v2 | ✓ md | ✓ md | adapter |
| Interactive buttons | ✓ | ✓ | ✓ | ✓ | URL-only | URL-only | adapter |
| Reply-to-message routing | ✓ | ✓ thread | ✓ ref | ✓ reply | ✗ | ✗ | adapter |
| Edit-in-place | ✓ | ✓ | ✓ | partial | ✗ | ✗ | adapter |
| Public URL required | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ |

"URL-only" = group robots can't fire callbacks but URL buttons still render.

## When to use

| You want | Pick |
|---|---|
| Fastest path from zero → first push notification | `telegram` |
| Team workspace with thread-based collaboration | `slack` |
| Dev / community server with rich embeds | `discord` |
| Formal cross-org channels in China | `feishu` |
| Simple "ping me when done" in 企业微信 group | `wecom` or `dingtalk` |
| Platform not in this list | `bridge` + custom adapter |

## Shared behaviour

Once any channel is `running`, the same admin features apply across all:

- **Notifications panel** — pick which events fire (`session.started`,
  `session.idle`, `session.ended`, `session.permission_ask`); set
  repeat policy and terminal snippet. See [notifications](./notifications).
- **Multi-session routing** — `reply-to-message` / `/select` /
  `/sessions` commands. See [routing](./routing).

## Related

- [/capabilities/channels.json](/capabilities/channels.json) — machine-readable spec
- [Notifications panel](./notifications)
- [Multi-session routing](./routing)

![Channels page with one running telegram bot](/tutorial/channels-running.png)

<details>
<summary>📖 Narrative explanation</summary>

The reason all channel kinds share the same notify + routing model
is that they're all consumers of the same internal event bus
(`internal/eventbus/`). When a session goes idle, the session
subsystem publishes a `session.idle` event with the snippet; every
channel hub subscribes; only the channels whose `notify.idle` is on
deliver to their upstream platform.

This means you can wire `telegram` for personal notifications, plus
`feishu` for team visibility, plus a `bridge` adapter for your own
internal IM — all firing off the same session event without any
extra wiring.

</details>
