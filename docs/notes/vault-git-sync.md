---
kind: capability
title: Vault git sync
tldr: Optional. Vault is a git repo. opendray auto-commits + pushes on a schedule. Pull on session spawn. Merge conflicts surface in UI with manual-resolve.
status: stable
since: v0.1.0
topic: notes
related: [notes/overview, backup/overview]
capability: [git-auto-commit, git-auto-push, conflict-surface, branch-per-host]
inbound: file-watcher
outbound: git
x-implementation: [internal/notes/gitsync.go]
---

# Vault git sync

> **tldr:** Optional. Vault is a git repo. opendray auto-commits + pushes on a schedule. Pull on session spawn. Merge conflicts surface in UI with manual-resolve.

## Setup

| # | Action |
|---|---|
| 1 | Make `<vault>` a git repo: `cd <vault> && git init && git remote add origin <url>` |
| 2 | Configure auth: SSH key or PAT in `Settings → Notes → Git auth` |
| 3 | Enable sync: `Settings → Notes → Auto-sync = on` |
| 4 | Choose schedule + branch + commit author |

## Config

```toml
[notes.gitsync]
enabled       = true
remote        = "origin"
branch        = "main"               # or "host-<hostname>" for per-host branches
commit_author = "opendray <bot@opendray.dev>"
auto_commit_schedule = "*/15 * * * *"  # cron — every 15 min
auto_push_schedule   = "*/30 * * * *"  # cron — every 30 min
pull_on_session_spawn = true
```

## Per-host branch pattern (recommended for multi-device)

| Device | Branch |
|---|---|
| Desktop opendray | `host-mac-studio` |
| Pi at home | `host-pi-home` |
| LXC at office | `host-lxc-office` |

Then on each, `git merge` cross-branches when you want to consolidate.

## Auto-commit message

```
opendray-auto: 5 files modified, 2 added

modified: sessions/s_42.md
modified: projects/pettracker/architecture.md
added:    archive/2026-05-17-debugging.md
```

## Conflict handling

| Conflict | UI behaviour |
|---|---|
| Both sides modified same file | red banner: "Vault has conflicts" + list |
| Click conflict file | side-by-side diff editor (ours / theirs / merged) |
| Resolve + click commit | finalises the merge commit |

## Capabilities

| feature | supported |
|---|---|
| Auto-commit on schedule | ✓ |
| Auto-push on schedule | ✓ |
| Pull on session spawn | ✓ |
| Branch per host | ✓ (operator names) |
| Conflict UI | ✓ |
| Selective sync (exclude folders) | ✓ via `.opendraygitignore` |
| Encrypted at rest | ✗ (use [backup](../backup/overview) for that) |

## Errors

| code | when | fix |
|---|---|---|
| `git_auth_failed` | bad SSH key / expired PAT | re-configure in Settings → Git auth |
| `git_conflict_blocks_sync` | unresolved merge conflict | resolve in UI |
| `git_remote_unreachable` | network | retry; sync resumes on next schedule |
| `git_uncommitted_local_change` | mid-edit when auto-commit fires | next cycle picks it up |
