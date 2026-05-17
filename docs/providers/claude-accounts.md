---
kind: capability
title: Claude accounts
tldr: Multi-account Claude — each account is one ~/.claude-accounts/<name>/ dir. opendray sets CLAUDE_CONFIG_DIR per spawn. Sessions / memory / notes / channels are shared across accounts; only OAuth identity is per-account.
status: stable
since: v0.1.0
topic: providers
related:
  - providers/overview
  - providers/bundled
capability:
  - multi-account
  - filesystem-watched
  - mid-session-swap
inbound: filesystem-watch
x-implementation:
  - internal/catalog/claude_account.go
  - internal/catalog/claude_account_import.go
---

# Claude accounts

> **tldr:** Multi-account Claude — each account is one `~/.claude-accounts/<name>/` dir. opendray sets `CLAUDE_CONFIG_DIR` per spawn. Sessions / memory / notes / channels are shared across accounts; only OAuth identity is per-account.

## Sharing matrix

| Surface | Per account? | Shared across all? |
|---|---|---|
| OAuth credentials | ✓ — `<dir>/.claude/.credentials.json` | ✗ |
| Model defaults | ✓ — per `CLAUDE_CONFIG_DIR` | ✗ |
| Anthropic billing identity | ✓ | ✗ |
| Session list & state | ✗ | ✓ — `sessions` table |
| Memory (pgvector) | ✗ | ✓ — global / project / session scopes |
| Notes vault | ✗ | ✓ — single vault on gateway disk |
| Channels (Slack / Feishu / …) | ✗ | ✓ — gateway-level |
| Integrations | ✗ | ✓ — gateway-level |
| Backups / schedules | ✗ | ✓ — gateway-level |

**Design point:** account = authentication identity, not a sandbox.
Switching account swaps only the next API call's identity.

## Setup

| # | Action | Where |
|---|---|---|
| 1 | Pick a slug (`work`, `personal`, `labs`) | gateway host shell |
| 2 | `mkdir -p ~/.claude-accounts/<slug>` | gateway host shell |
| 3 | `CLAUDE_CONFIG_DIR=~/.claude-accounts/<slug> claude login` → browser OAuth | gateway host shell |
| 4 | opendray **Providers → Claude accounts → Import local** (or wait for filesystem watch) | opendray admin |

Repeat for each account:

```bash
for n in personal work labs ; do
  mkdir -p "$HOME/.claude-accounts/$n"
  CLAUDE_CONFIG_DIR="$HOME/.claude-accounts/$n" claude login
done
```

## Config schema

```yaml
# Account is implicit from filesystem layout; no opendray-side config needed.
# Per-session binding lives on the session row:
session:
  provider: claude
  claude_account_id: "work"                 # filename slug under ~/.claude-accounts/
```

## Capabilities

| feature | supported | implementation |
|---|---|---|
| Multi-account Claude | ✓ | filesystem-based; `CLAUDE_CONFIG_DIR` env injection |
| Mid-session account swap | ✓ | SIGTERM + clean re-spawn with new env, same session_id |
| Filesystem watch | ✓ | new dir under `~/.claude-accounts/` auto-imports |
| Manual force-sync | ✓ | `POST /api/v1/claude-accounts/import-local` |
| Codex / Gemini multi-account | ✗ | use env-based config or wrap in custom provider |
| Token paste-into-form | ✗ | intentionally absent (see below) |

## Binding & switching

| Action | Effect |
|---|---|
| Spawn dialog → **Claude account** dropdown (only shown for `claude`) | sets `CLAUDE_CONFIG_DIR` for this spawn; persists on session row |
| Sessions page → terminal pane → **Account switcher** (top-right) | SIGTERM running process → clean exit → re-spawn same provider/args/cwd with new env |
| Mid-swap | session id stays the same; terminal contents reset; memory / notes / history retained |
| Restart of an ended session | reuses the persisted `claude_account_id` |

## Errors

| code | http | cause | fix |
|---|---|---|---|
| `claude_account_not_bound` | 400 | session's `claude_account_id` no longer exists | re-select account in spawn dialog |
| `claude_account_dir_missing` | 503 | dir was deleted under running session | restore dir or rebind session |
| `claude_account_credentials_invalid` | 401 | OAuth token revoked / file corrupt | re-run `claude login` for that slug |
| `claude_account_name_invalid` | 400 | slug contains `/`, `..`, or non-printable | use `[a-z0-9-]+` only |

## Limitations

| limit | value | note |
|---|---|---|
| supported providers | claude only | codex / gemini use env vars per spawn |
| account name regex | `[a-z0-9-]+` | sandboxed to `~/.claude-accounts/<name>/` |
| isolation | logical only | sessions / memory / notes shared — for hard isolation, run two gateways |
| token paste-into-form | not supported | Anthropic API doesn't expose a refresh endpoint; pasted tokens die within an hour |

<details>
<summary>📖 Narrative explanation</summary>

### Worked example

Three sessions, single notes vault, shared memory store:

```
session-A   provider=claude   account=personal
session-B   provider=claude   account=work
session-C   provider=codex                       (no account binding)
```

Memory written by session-A under `project:my-app` is visible to
session-B's next `memory.search` call, even though they are
different Anthropic identities. Notes written by session-C appear
in the inspector of all three. The "account" boundary intentionally
doesn't exist in opendray's data model; it lives purely at the
OAuth layer.

If you ever do want hard isolation between two accounts (separate
notes, separate memory), run two opendray gateways on different
ports, each with its own database.

### Why there's no "Add account" form

Earlier versions had **+ Add account** alongside **Import local**.
Removed because pasting an OAuth token into a web form produces an
account that opendray cannot refresh (the public Anthropic API
doesn't include a refresh endpoint), so the account dies within the
hour. Forcing the host-shell `claude login` flow keeps the
affordance honest: every account in the panel is one Claude Code
itself is managing.

For programmatic seeding (CI pipeline with a short-lived token),
the underlying API endpoints are still there:

- `POST /api/v1/claude-accounts` — create the row
- `PUT /api/v1/claude-accounts/{id}/token` — write the token file

Intentionally not surfaced as UI affordances.

### Import-local works for / doesn't work for

| Works | Doesn't work |
|---|---|
| Bare metal gateway | Docker container without `$HOME` bind-mounted |
| LXC where operator's home is reachable | Remote-managed gateway you don't have shell on |
| Dev environments | Mobile (intentionally web-only) |

If `Import local` says "Nothing to import" but the row doesn't
appear, the gateway's `$HOME` from inside its runtime probably
looks empty. Check with `docker exec` / `pct exec` and adjust the
volume mount.

</details>
