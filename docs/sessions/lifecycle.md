---
kind: concept
title: Session lifecycle
tldr: STARTING → RUNNING ↔ IDLE → STOPPED / ENDED / FAILED. Idle = no stdout for N seconds (default 30s) — process still alive. Restart re-spawns with same provider/cwd/args under a new session id.
status: stable
since: v0.1.0
topic: sessions
related:
  - sessions/overview
  - sessions/spawning
  - channels/notifications
references:
  capabilities: [sessions]
x-implementation:
  - internal/session/state.go
  - internal/session/reconcile.go
---

# Session lifecycle

> **tldr:** `STARTING → RUNNING ↔ IDLE → STOPPED / ENDED / FAILED`. **Idle** = no stdout for N seconds (default 30s) — process still alive. **Restart** re-spawns with same provider / cwd / args under a new session id.

## State machine

| State | Meaning | What you can do |
|---|---|---|
| `STARTING` | DB row inserted, PTY spawning | wait — usually <500ms |
| `RUNNING` | Process alive, recent stdout activity | type into terminal |
| `IDLE` | Process alive, silent ≥30s (configurable) | reply normally; idle is just a signal |
| `STOPPED` | Operator hit ✕ → SIGTERM → process exited | view scrollback; Restart spawns under same id |
| `ENDED` | Process exited on its own | view scrollback; Restart to relaunch |
| `FAILED` | Spawn or runtime error before clean exit | check log; usually needs config fix |

## Transitions

```
STARTING ─→ RUNNING ─→ IDLE
              ↑          │
              └──────────┘  (next byte from CLI)
              │          │
              ├──→ ENDED ←┤  (CLI exits on its own)
              │
              └──→ STOPPED   (operator × → SIGTERM → SIGKILL after 3s)

STARTING ─→ FAILED          (cmd.Start error)
```

## Idle semantics

| Aspect | Value |
|---|---|
| Default threshold | 30s no stdout |
| Watcher poll interval | 5s |
| Config keys | `[session].idle_threshold` / `[session].idle_poll_interval` in `config.toml` |
| Behaviour on idle | publish `session.idle` on event bus; state pill yellow |
| Behaviour on next byte | publish `session.running`; state pill green |
| Channels relay | per [Notifications panel](../channels/notifications) `repeat_policy` |

## Stop modes

### Operator stop (✕ button)

| # | Step |
|---|---|
| 1 | `SIGTERM` sent |
| 2 | wait 3 seconds |
| 3 | `SIGKILL` if still alive |
| 4 | state → `STOPPED`; ring buffer preserved |

### Self exit

| Cause | State | exit_code populated |
|---|---|---|
| `q` / `Ctrl-D` / `exit 0` | `ENDED` | `0` |
| script `exit 1` | `ENDED` | `1` |
| panic | `ENDED` | `1` (or signal-killed code) |
| segfault | `ENDED` | `139` |

Channel `session.ended` cards render **red** when `exit_code != 0`.

### Reconcile on opendray restart

| Trigger | Result |
|---|---|
| opendray binary restart | non-terminal rows → `ENDED` with reason `"previous gateway process exited; PTYs gone"` |
| Host reboot | same |
| Log line on startup | `INFO reconciled stale sessions on startup count=N` |

PTYs cannot survive parent process death. Row stays honest about it.

## Restart from a stopped/ended session

Restart button (visible on stopped/ended tabs) re-runs spawn flow
with the same:

| Preserved | New |
|---|---|
| `provider_id` | `session_id` |
| `cwd` | |
| `args` | |
| `claude_account_id` | |
| `parent_session_id` | |

The old row stays in DB for audit. The Inspector linked note
travels to the new session because it's keyed by file path, not
session id.

## Closing vs deleting

| Action | Effect |
|---|---|
| ✕ on ended tab | closes tab visually; DB row stays (findable via Sessions History filter) |
| `DELETE /api/v1/sessions/<sid>` | truly deletes the row from DB |

Web admin doesn't expose a destructive delete button on purpose —
accidental clicks would lose audit context.

```bash
curl -X DELETE -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:8770/api/v1/sessions/<sid>
```

## Errors

| code | http | cause | fix |
|---|---|---|---|
| `session_terminated` | 410 | sending input to ended/stopped session | restart first or send via new session |
| `session_failed_to_start` | 500 | `cmd.Start` errored | check provider config + log |

<details>
<summary>📖 Narrative explanation</summary>

Lower the idle threshold = more notifications, higher = miss short
pauses. Channels have their own per-channel notification policy
layered on top — see Notifications panel for `once-per-session` /
`time-window` / `always` modes.

</details>
