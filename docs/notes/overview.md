---
kind: concept
title: Notes — overview
tldr: Obsidian-compatible markdown vault on opendray's disk. Per-session linked notes auto-created. Wiki links + backlinks. Optional git sync. Same vault Claude can read back as context.
status: stable
since: v0.1.0
topic: notes
related:
  - notes/editor
  - notes/wiki-links
  - notes/vault-git-sync
  - sessions/inspector
references:
  capabilities: [sessions]
x-implementation:
  - internal/notes/
---

# Notes — overview

> **tldr:** Obsidian-compatible markdown vault on opendray's disk. Per-session linked notes auto-created. Wiki links + backlinks. Optional git sync. Same vault Claude can read back as context.

## What it is

| Concept | Behaviour |
|---|---|
| Vault | one directory tree of `.md` files on opendray host disk |
| Per-session note | auto-created at `<vault>/sessions/<sid>.md` |
| Wiki links | `[[other-note]]` resolves to file by name |
| Backlinks | computed; shown in right pane |
| File watcher | external edits picked up live |
| Git sync | optional — `<vault>` is a git repo |

## Why a vault rather than a DB

| Vault (markdown) | DB-stored notes |
|---|---|
| editable in Obsidian / VS Code / any editor | locked to opendray UI |
| diff-able, version-controllable | requires migration scripts |
| Claude / Codex can read via `opendray notes` CLI | needs API call |
| backups = `git push` | needs structured export |

## When to read what

| Topic | Read |
|---|---|
| Editor specifics + Source/Preview | [editor](./editor) |
| `[[wiki-links]]` + autocomplete + backlinks | [wiki-links](./wiki-links) |
| Git sync setup + conflict handling | [vault-git-sync](./vault-git-sync) |
| Inspector's Notes tab (per-session) | [sessions/inspector](../sessions/inspector) |

![Notes layout](/tutorial/notes-layout.png)
