---
kind: endpoint
title: Spawning a session
tldr: Sessions → + New → pick provider + cwd + (optional) name / args / claude_account / bypass / parent_session → Spawn. opendray validates cwd, forks PTY, marks RUNNING on first byte (or 500ms timeout).
status: stable
since: v0.1.0
topic: sessions
related:
  - sessions/overview
  - sessions/lifecycle
  - providers/claude-accounts
operations:
  - operationId: spawnSession
    method: POST
    path: /api/v1/sessions
    summary: Spawn a new CLI session
    tags: [sessions]
    requestBody:
      $ref: '/openapi.yaml#/components/schemas/SpawnRequest'
    responses:
      '201': { $ref: '/openapi.yaml#/components/schemas/Session' }
      '400': { $ref: '/openapi.yaml#/components/responses/Error' }
      '503': { description: provider_unavailable }
    x-required-scope: session:write
    x-rate-limit: { sustained: '2 req/s', burst: 6 }
x-implementation:
  - internal/session/spawn.go
  - internal/gateway/handlers/sessions.go
---

# Spawning a session

> **tldr:** **Sessions → + New** → pick provider + cwd + (optional) name / args / claude_account / bypass / parent_session → **Spawn**. opendray validates cwd, forks PTY, marks `RUNNING` on first byte (or 500ms timeout).

## Required fields

| Field | Type | Validation |
|---|---|---|
| `provider` | string | must be an `enabled` provider id |
| `cwd` | string | `stat()` pre-flight; reject if missing / unreadable |

## Optional fields

| Field | Type | Default | Notes |
|---|---|---|---|
| `name` | string | cwd basename | tab label |
| `args` | string[] | [] | appended **after** provider defaults; **before** bypass flags |
| `env` | map\<string, string\> | {} | merged into process env |
| `claude_account_id` | string | (env-based) | only for `provider=claude`; see below |
| `bypass_autonomy` | bool | false | per-session bypass; provider-specific flag (see table) |
| `parent_session_id` | string | null | clone settings; persists `parent_session_id` on new row |

## Claude account picker behaviour

| Accounts registered | Picker shows | Default selection |
|---|---|---|
| 0 | hidden | env `ANTHROPIC_API_KEY` |
| 1 | `Default (env / system)` + that account | either |
| 2+ | `Default` removed | first `enabled` account |

When 2+ accounts exist, opendray forces an explicit pick because
"fall back to env" is rarely the intent.

## Bypass / autonomy toggle

Per-provider flag mapping when `bypass_autonomy: true`:

| Provider | Toggle label | Appended flag |
|---|---|---|
| `claude` | Bypass permission prompts | `--dangerously-skip-permissions` |
| `codex` | Bypass approvals & sandbox | `--dangerously-bypass-approvals-and-sandbox` |
| `gemini` | YOLO mode | `--yolo` |

| Property | Behaviour |
|---|---|
| Resets after spawn | yes — next spawn is always deliberate opt-in |
| Additive with provider-default | yes — provider `bypass: true` always bypasses; toggle adds only |
| Per-session > provider-saved value | yes — session value wins; opendray drops the duplicate to avoid parser conflicts |
| Codex `--ask-for-approval never` | only auto-approves shell exec, NOT MCP tools — opendray uses the stronger flag instead |

## Spawn lifecycle

| # | Step | State |
|---|---|---|
| 1 | validate cwd / provider | n/a |
| 2 | generate session id, insert DB row | `STARTING` |
| 3 | fork PTY + run provider executable | `STARTING` |
| 4 | hook stdout pump (ring buffer + WS fanout) | `STARTING` |
| 5 | first byte from process | `RUNNING` |
| 6 | timeout 500ms with no output | `RUNNING` (silent start OK) |
| 7 | active tab switches to new session | n/a |

## Examples

```http
POST /api/v1/sessions
Authorization: Bearer od_live_xxx
Content-Type: application/json

{
  "provider": "claude",
  "cwd": "/home/dev/proj",
  "name": "proj (refactor)",
  "args": ["--continue"],
  "claude_account_id": "work",
  "bypass_autonomy": false,
  "channel_id": "ch_telegram_main"
}
```

Response:

```json
HTTP/1.1 201 Created
{
  "id": "s_42",
  "provider": "claude",
  "cwd": "/home/dev/proj",
  "state": "running",
  "channel_id": "ch_telegram_main",
  "claude_account_id": "work",
  "created_at": "2026-05-17T10:24:00Z"
}
```

## Errors

| code | http | cause | fix |
|---|---|---|---|
| `provider_disabled` | 400 | provider's `enabled: false` | toggle on in Providers page |
| `provider_unavailable` | 503 | binary not on PATH | install or set absolute path |
| `cwd_invalid` | 400 | path doesn't exist or unreadable | check path / permissions |
| `claude_account_not_found` | 400 | `claude_account_id` doesn't exist in `~/.claude-accounts/` | Import local or run `claude login` for that slug |
| `args_invalid` | 400 | args contain shell metacharacters not in allowlist | check the args — opendray doesn't shell-expand |

<details>
<summary>📖 Narrative explanation</summary>

Click **New session** in the top-right of the Sessions page.

For `args`, examples:
- Claude: `--continue` resumes the latest conversation in this cwd
- Codex: `--model gpt-5` overrides the default
- Plain shell: leave blank

The provider's bundled args are not editable from the spawn dialog
— they live in the provider manifest. Use [Providers](../providers/overview)
to override at the provider level.

### Parent session use cases

The **Parent session** dropdown lists recently-stopped sessions.
Selecting one pre-fills provider + cwd + args + claude account.
Useful for:

- A Claude session crashed mid-task → fork to get same context back
- Compare two model variants on the same task → fork twice with
  different `--model` args

opendray persists `parent_session_id` so the family tree is
queryable later via `GET /api/v1/sessions?parent_session_id=...`.

### Failure handling

If launch fails (binary not found, cwd unreadable, exit-on-start),
the dialog stays open with a red banner showing the specific error
from `cmd.Start`. No partial session row is committed.

</details>
