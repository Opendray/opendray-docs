# Changelog

All notable changes to opendray are documented here. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project adheres to [Semantic Versioning](https://semver.org/).

<Callout type="tip">
The single source of truth is the GitHub Releases page —
[github.com/opendray/opendray/releases](https://github.com/opendray/opendray/releases).
This page mirrors it for offline-readable browsing alongside the docs.
</Callout>

## Unreleased

### Added

- _(placeholder)_ describe new functionality landing on `main`.

### Changed

- _(placeholder)_ behavioral changes that don't break compat.

### Fixed

- _(placeholder)_ bug fixes since the last tagged release.

---

## v0.1.0 — _coming soon_ <Badge type="beta">Pre-release</Badge>

The first public preview. Track the milestone on
[GitHub Projects](https://github.com/opendray/opendray) for the
running list of items still in flight.

<CardGroup :cols="2">
<Card icon="🛰" title="Sessions">
Long-running CLI sessions with full PTY, multi-client mirroring,
reconnect across devices.
</Card>
<Card icon="💬" title="6 channel adapters">
Telegram, Slack, Discord, Feishu, DingTalk, WeCom — plus a Bridge
WebSocket adapter for custom platforms.
</Card>
<Card icon="🧠" title="Local-first memory">
ONNX, Ollama, and LM Studio embedding backends. User / project /
session retrieval layers.
</Card>
<Card icon="🔌" title="Integration API">
REST + WebSocket surface for building third-party clients on top
of opendray.
</Card>
</CardGroup>

---

## Conventions

- **Major** (`x.0.0`) — breaking config / API changes that need migration.
- **Minor** (`0.x.0`) — new capabilities, no breaking changes.
- **Patch** (`0.0.x`) — bug fixes only, safe to upgrade in place.

Backwards-incompatible changes are always called out in the **Breaking**
section of the release notes, with a migration recipe.
