---
kind: capability
title: Mobile Git workflow
tldr: Flutter app mirrors the web Git tab with a touch-first layout. Bottom-sheet branch picker, stage-all-only commit, polling cadence tuned for mobile radio. Same gateway routes.
status: stable
since: v0.1.0
topic: sessions
related:
  - sessions/git-workflow
  - sessions/inspector
capability:
  - branch-checkout
  - stash-and-switch
  - commit
  - push
  - pr-list-create-merge
  - check-polling
x-implementation:
  - app/mobile/lib/features/git/
---

# Mobile Git workflow

> **tldr:** Flutter app mirrors the [web Git tab](./git-workflow) with a touch-first layout. Bottom-sheet branch picker, stage-all-only commit, polling cadence tuned for mobile radio. Same gateway routes.

## Where

**Session detail → Git tab** (second pill at top of inspector pages).

## Status pane

| Element | Source |
|---|---|
| Current branch + upstream | `GET /git/status` |
| Ahead / behind counts | same |
| Working-tree file count | same |
| Tap working-tree row | expands to file list |

## Branch picker (bottom sheet, 75% viewport)

| Section | Lists |
|---|---|
| **Local** | every `refs/heads/*`; current pinned top with ✓; rest alphabetical |
| **Remote** | every `refs/remotes/<remote>/*` except HEAD symrefs; tap → checks out local of same name |

| Tap | Action |
|---|---|
| row | checkout that branch |
| trash icon | delete branch (disabled on current) |
| chip strip "+ New" / "Push" | one-tap common ops |

### Stash & switch

| # | Step |
|---|---|
| 1 | Tap branch with dirty tree → server 409 + `dirty_files` |
| 2 | AlertDialog shows file list (scrollable, monospace) |
| 3 | **Cancel** = leave tree / **Stash & switch** = `git stash push --include-untracked` + checkout |
| 4 | Snackbar: `Switched to <name> (stashed as abc1234)` |
| 5 | Recover from terminal: `git stash pop` |

### Delete with force fallback

| Default | `-d` (safe) |
|---|---|
| If "not fully merged" | second AlertDialog: `Force delete? Branch is not fully merged. Forcing deletion will lose any commits unique to this branch.` |
| Confirm | upgrades to `-D` |

Two-step gating prevents accidents.

## Commit form

| Field | Mobile behaviour |
|---|---|
| Per-file stage UI | ✗ (no hover targets) — use web or terminal for fine control |
| **Stage all** button | available |
| Multi-line message | soft keyboard reveals Enter button |
| **Commit** button | disabled until staged |
| On success | refresh file list + status header |

## Pull requests

| Element | Behaviour |
|---|---|
| PR list | open PRs, polled 60s |
| **+ Create** | bottom-sheet form (title / body / base with default-branch resolution) |
| Tap PR row | inline expand → checks (30s poll while expanded) + merge form |
| Merge methods | merge / squash / rebase |
| Delete branch on merge | checkbox, defaults ON |

## Polling cadence

| Source | Cadence | Stops when |
|---|---|---|
| Branch list | on open + after any branch op | tab unmounts |
| Status / file list | 8s | tab unmounts |
| PR list | 60s | tab unmounts |
| PR checks (expanded row) | 30s | row collapses |
| Manual refresh | swipe-down on list | — |

Mobile polls more aggressively than web because no event-bus
subscription on iOS yet. Tuned to feel "live" without burning radio.

## Capability gaps vs web

| Web has | Mobile has | Use web/terminal for |
|---|---|---|
| Per-file stage / unstage buttons | stage-all only | granular index control |
| Diff drawer (unified diff on tap) | porcelain status code only | viewing diffs |
| Force-with-lease push (opt-in checkbox) | safe push only | `--force-with-lease` |

All other features (branches, PRs, stash & switch, etc.) are on parity.
