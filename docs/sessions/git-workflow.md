---
kind: endpoint
title: Git workflow
tldr: Inspector Git tab = self-contained PR command center. Branch / stage / commit / push / PR create / merge / check status — all without leaving opendray. Endpoints under /api/v1/git/.
status: stable
since: v0.1.0
topic: sessions
related:
  - sessions/inspector
  - sessions/mobile-git
  - plugins/git-hosts
operations:
  - operationId: gitStatus
    method: GET
    path: /api/v1/git/status
    summary: Working tree + branch summary
    tags: [git]
    x-required-scope: session:read
  - operationId: gitCheckout
    method: POST
    path: /api/v1/git/write/checkout
    summary: Switch branch (optional auto-stash)
    tags: [git]
    x-required-scope: session:write
  - operationId: gitCommit
    method: POST
    path: /api/v1/git/write/commit
    summary: Create a commit
    tags: [git]
    x-required-scope: session:write
  - operationId: gitListPRs
    method: GET
    path: /api/v1/git/prs
    summary: List PRs for the cwd's remote
    tags: [git]
    x-required-scope: session:read
x-implementation:
  - internal/git/
  - app/web/src/features/inspector/git/
---

# Git workflow

> **tldr:** Inspector Git tab = self-contained PR command center. Branch / stage / commit / push / PR create / merge / check status — all without leaving opendray. Endpoints under `/api/v1/git/`.

## When the tab renders

| Cwd | Result |
|---|---|
| inside git repo | full tab |
| `git rev-parse` fails | "not a git repo" empty state |

## Status header

| Element | Source |
|---|---|
| Current branch + upstream | `git rev-parse --abbrev-ref` + `for-each-ref` |
| Ahead / behind counts | `git rev-list --count` |
| Working-tree summary | staged / unstaged / untracked counts (clickable) |
| "no upstream" state | first Push uses `--set-upstream` |

## Branch ops

| Element | API |
|---|---|
| Branch dropdown | `GET /git/write/branches` → switch via `POST /git/write/checkout` |
| **+ New** | `POST /git/write/branches` create + checkout |
| **Push** | `POST /git/write/push` (`--set-upstream` on first push) |
| Disabled when | ahead == 0 && upstream set |

### Stash & switch (auto-recovery)

| # | Step |
|---|---|
| 1 | Checkout with dirty tree → server returns **409 Conflict** with `dirty_files: [...]` |
| 2 | UI shows Sonner toast: `Uncommitted changes block switch to <branch>` + `[ Stash & switch ]` |
| 3 | Click → retries with `{ "stash": true }` |
| 4 | Server runs `git stash push --include-untracked -m "opendray-auto: switch to <name>"` |
| 5 | Checkout succeeds → toast shows stash short ref: `Switched to main (stashed as abc1234)` |
| 6 | Recover later with `git stash pop` or `git stash apply` |

## Staging + commit

| Per-row | Bulk |
|---|---|
| Stage / Unstage (one file) | Stage all = `git add .` |
| Diff (read-only side drawer) | Unstage all = `git reset` |

Commit form:

| Field | Behaviour |
|---|---|
| Message | multi-line; `Cmd/Ctrl + Enter` submits |
| Commit button | disabled until ≥1 file staged; live count badge |
| On success | clears form; refreshes status; new HEAD in log strip |

## Pull requests

Same surface for GitHub / Gitea / GitLab — gateway normalises.

### Listing

| Default | Open PRs for current remote |
|---|---|
| Toggle | Open / Closed / All |
| Per row | `#NN` (link) · title · author · `head → base` · aggregate check pill |
| Click row | expand in place → reveals Checks + Merge form |

### Creating

| Field | Default |
|---|---|
| Title | last commit subject |
| Body | multi-line |
| Head | current branch (read-only) |
| Base | host's default branch (resolved via API) |

Submit → opens PR, new row appears at top, expanded.

### Merging

| Method | Flag | When to use |
|---|---|---|
| Merge commit | `--merge` | preserve merge history |
| Squash | `--squash` | one commit per PR (recommended) |
| Rebase | `--rebase` | use sparingly; loses merge anchor |
| Delete branch on merge | checkbox | defaults ON |

### Checks (normalised vocabulary)

| Status | Meaning |
|---|---|
| `success` | finished without errors |
| `failure` | ran and failed |
| `pending` | queued or in progress |
| `neutral` | finished without verdict |
| `cancelled` | killed before finishing |
| `skipped` | conditionally skipped |

Aggregate rollup: any `failure` → `failure`; any `pending` →
`pending`; else `success`. Poll every 30s.

## Backend routes

| Method | Path | Purpose |
|---|---|---|
| GET | `/git/status` | Working-tree + branch summary |
| GET | `/git/log` | Recent commits on HEAD |
| GET | `/git/write/branches` | All branches (local + remote refs) |
| POST | `/git/write/branches` | Create + optional checkout |
| DELETE | `/git/write/branches` | Delete (`?name=`, `?force=`) |
| POST | `/git/write/checkout` | Switch branch; `{ "stash": true }` to auto-stash |
| POST | `/git/write/stage` / `/unstage` | Index ops |
| POST | `/git/write/commit` | Create commit |
| POST | `/git/write/push` | `--set-upstream` on first push |
| GET | `/git/prs` | List PRs |
| POST | `/git/prs` | Create |
| POST | `/git/prs/{n}/merge` | Merge with method options |
| GET | `/git/prs/{n}/checks` | Normalised check runs |

## Errors

| message | code/cause | fix |
|---|---|---|
| `fatal: not a git repository` | cwd not tracked | the tab returns to "not a git repo" empty state |
| `Permission denied (publickey)` on push | git credentials don't have write access | check PAT in **Settings → Git hosts** |
| `branch '<name>' not fully merged` on delete | safe-delete refusal | toast offers force-delete → `git branch -D` |
| `409 Conflict` on checkout | dirty tree | use Stash & switch button |

<details>
<summary>📖 Narrative explanation</summary>

Every route is auth-gated; the embedded web client wires the session
token through automatically.

Gitea and GitLab's commit-status endpoints map onto the GitHub-style
vocabulary so the same UI works without worrying about which host
emitted what.

</details>
