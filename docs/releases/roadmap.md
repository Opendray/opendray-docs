---
kind: concept
title: Roadmap
tldr: High-level "why" behind upcoming work. Now / Soon / Later columns. GitHub project board is the granular tracker.
status: stable
since: v0.1.0
topic: releases
related: [releases/changelog, releases/showcase]
x-implementation:
  - github.com/orgs/opendray/projects
---

# Roadmap

> **tldr:** High-level "why" behind upcoming work. Now / Soon / Later columns. [GitHub project board](https://github.com/orgs/opendray/projects) is the granular tracker.

Where opendray is headed in the next few quarters. This page is a
living document — items move between columns as priorities shift.

<Callout type="info">
For granular tracking of individual issues and PRs see the
[GitHub project board](https://github.com/orgs/opendray/projects).
This roadmap is the high-level "why" behind the work.
</Callout>

## In progress <Badge type="beta">Now</Badge>

<CardGroup :cols="2">
<Card icon="🧠" title="Local-first memory v2">
Multi-tenant scopes, conflict resolution UI, and an evaluation
harness for embedding backends. Goal: 90%+ recall on cross-project
references.
</Card>
<Card icon="📱" title="Mobile companion app">
Native iOS / Android client built on top of the integration API —
drive sessions without going through a chat platform.
</Card>
<Card icon="🛡️" title="Audit + ACL">
Per-channel ACLs, signed audit trail, optional WebAuthn for risky
actions (deploy, db migrations, package install).
</Card>
<Card icon="🪄" title="Workflow recipes">
Re-runnable, parameterized "session templates" — kick off a code
review, deploy gate, or PR landing flow with one Telegram command.
</Card>
</CardGroup>

## Next up <Badge type="info">Soon</Badge>

<CardGroup :cols="2">
<Card icon="🌐" title="Hosted edition">
Optional cloud-hosted control plane for teams that don't want to
self-host. Same OSS code, multi-tenant.
</Card>
<Card icon="🔁" title="Provider hot-swap">
Mid-session provider switch (Claude → Codex → Gemini) preserving
context. Useful for cost optimization mid-task.
</Card>
<Card icon="📊" title="Usage analytics">
Per-session / per-user token spend, latency, and outcome metrics
panel.
</Card>
<Card icon="🤝" title="Pair-programming mode">
Shared cursor with attribution — multiple humans editing alongside
the AI in the same session.
</Card>
</CardGroup>

## Considering <Badge type="tip">Later</Badge>

- **VS Code / JetBrains plugins** — surface session feed inside the IDE.
- **Browser extension** — `Cmd+Shift+O` to spawn a session against
  any GitHub PR / repo currently in your tab.
- **Terraform-style declarative provisioning** — `opendray.toml` you
  commit alongside a project to bootstrap channels, providers, and
  memory scope on `opendray apply`.

## Recently shipped

See the [Changelog](./changelog) for everything that already landed.

## Have an idea?

Open a [GitHub discussion](https://github.com/opendray/opendray/discussions)
or file a feature request. We treat the issue tracker as the canonical
backlog — anything not there is unlikely to ship.
