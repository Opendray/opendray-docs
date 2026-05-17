---
kind: concept
title: Welcome to opendray
tldr: Self-hosted control gateway for AI coding CLIs (Claude Code / Codex / Gemini / shell). Web admin + mobile + REST/WS API + 8 messengers + memory + integrations. Single Go binary on your hardware.
status: stable
since: v0.1.0
topic: getting-started
related: [sessions/overview, channels/overview, providers/overview, memory/overview, integrations/overview, consuming/overview, for-ai]
references:
  capabilities: [sessions, channels, providers, memory, integrations]
x-implementation:
  - cmd/opendray/
  - internal/
---

# Welcome to opendray

> **tldr:** Self-hosted control gateway for AI coding CLIs (Claude Code / Codex / Gemini / shell). Web admin + mobile + REST/WS API + 8 messengers + memory + integrations. Single Go binary on your hardware.

## What it does for you

| Capability | Page | Capability JSON |
|---|---|---|
| Spawn / observe / drive CLI sessions | [Sessions](../sessions/overview) | [/capabilities/sessions.json](/capabilities/sessions.json) |
| Get notified + reply via Telegram / Slack / etc. | [Channels](../channels/overview) | [/capabilities/channels.json](/capabilities/channels.json) |
| Wrap any CLI (Claude / Codex / Gemini / your own) | [Providers](../providers/overview) | [/capabilities/providers.json](/capabilities/providers.json) |
| Cross-CLI memory + auto-capture | [Memory](../memory/overview) | [/capabilities/memory.json](/capabilities/memory.json) |
| Mount opendray as the AI backbone for your other apps | [Integrations](../integrations/overview) | [/capabilities/integrations.json](/capabilities/integrations.json) |

## First-run checklist

| # | Action | Where |
|---|---|---|
| 1 | Login with admin password | top-right corner |
| 2 | Configure a Provider (`claude` is most common) | Providers |
| 3 | Spawn your first session | Sessions → + New |
| 4 | Wire up a channel (Telegram = fastest) | Channels → + New |
| 5 | Watch the session.idle ping arrive | check your chat |

## When to read what

| Goal | Read |
|---|---|
| Daily workbench layout | [Sessions](../sessions/overview) |
| Spawn dialog reference | [Spawning](../sessions/spawning) |
| Wire your first messenger | [Channels](../channels/overview) → [Telegram](../channels/telegram) |
| Multi-account Claude | [Claude accounts](../providers/claude-accounts) |
| Build an app on top of opendray | [Consuming](../consuming/overview) |
| Make AI agents consume these docs | [For AI agents](../for-ai) |

## What this admin doesn't do

| ✗ Out of scope |
|---|
| Direct LLM API calls (the CLI does that) |
| Generic agent framework (CLI = agent) |
| Plugin marketplace / signing infrastructure |
| Multi-tenant SaaS, billing, payments |
| Per-user permission systems beyond admin / integration scopes |

See [manifest.json](/manifest.json) for the authoritative non-goals list.

![Sidebar overview](/tutorial/sidebar-overview.png)
