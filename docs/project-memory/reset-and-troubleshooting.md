---
kind: concept
title: Project memory — reset & troubleshooting
tldr: Reset = wipe project memory rows for one cwd (raw memory keeps). 4 common failure modes + fixes.
status: stable
since: v0.1.0
topic: project-memory
related:
  - project-memory/overview
  - project-memory/scanner-and-cleaner
  - memory/troubleshooting
references:
  capabilities: [memory]
x-implementation:
  - internal/memory/project/reset.go
---

# Project memory — reset & troubleshooting

> **tldr:** Reset = wipe project memory rows for one cwd (raw memory keeps). 4 common failure modes + fixes.

## Reset

| Where | What it does |
|---|---|
| `/memory/project` → ⋯ → **Reset all sections** | clears Goals / Decisions / State / Questions for this cwd |
| `/memory/project` → ⋯ → **Reset section X** | clears one section only |
| `DELETE /api/v1/memory/project?cwd=...` | API equivalent |

| What gets wiped | What survives |
|---|---|
| project-memory section entries | raw memory rows (still in pgvector) |
| section ordering | session list / audit log |
| section export history | scanner's next promote can re-build sections |

## Symptoms

| Symptom | Likely cause | Fix |
|---|---|---|
| Section empty after long session | scanner pattern didn't match | tune `goal_pattern` / `decision_pattern` in [scanner-and-cleaner](./scanner-and-cleaner) |
| Same fact promoted twice | conflict detection off OR threshold too low | enable `memory.conflict.policy` |
| Resolved question not removed | cleaner hasn't run since marking | force run: Settings → Cleaner → Run now |
| Sections out of date | scanner disabled or scan_last_n too small | set `enabled = true`; raise `scan_last_n` |

## Common confusions

| "Why is X happening?" | Answer |
|---|---|
| "I deleted a row but it came back next session" | Mirror re-ingested from Claude markdown file. Delete the `.md` file too |
| "Cleaner wiped my carefully written decision" | Decisions never auto-expire by default (`keep_decisions_forever = true`). Check if you set it false |
| "Reset section X" cleared my notes too | `notes` is the Inspector linked note (vault file), not project memory. Different system |
| Two projects same name show same memory | scope_key is `cwd`, not project name. Different cwds = different memory |

## Recovery if you blew away too much

| Have backup? | Steps |
|---|---|
| Yes (backups enabled) | restore most-recent dump; raw rows reappear; let scanner re-promote |
| No, but raw rows survived | Settings → Scanner → Run now → re-promotes from raw |
| No backup, no raw rows | gone — start fresh |
