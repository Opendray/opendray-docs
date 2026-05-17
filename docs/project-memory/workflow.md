---
kind: concept
title: Project memory — workflow
tldr: Open /memory/project → pick cwd → review sections (Goals / Decisions / State). Inline edit, mark questions resolved, export sections to Markdown.
status: stable
since: v0.1.0
topic: project-memory
related:
  - project-memory/overview
  - project-memory/scanner-and-cleaner
references:
  capabilities: [memory]
x-implementation:
  - app/web/src/features/memory/project/
---

# Project memory — workflow

> **tldr:** Open `/memory/project` → pick cwd → review sections (Goals / Decisions / State). Inline edit, mark questions resolved, export sections to Markdown.

## Opening

| Where | Path |
|---|---|
| Web admin | left sidebar 🧠 → **Project** tab |
| Direct URL | `/memory/project` |
| API | `GET /api/v1/memory/project?cwd=/path/to/proj` |

If you have many cwds, the picker at the top filters as you type.

## Per-section actions

| Section | Hover row | Bulk |
|---|---|---|
| Goals | ✓ edit · ✓ delete · ✓ promote-to-decision | clear all |
| Decisions | ✓ edit · ✓ delete | export Markdown |
| Open questions | ✓ mark resolved · ✓ edit · ✓ delete | clear resolved |
| Current state | ✓ overwrite from latest session | reset |
| Files of interest | ✓ remove | clear |
| Recent activity | (read-only) | — |

## Editing

| Action | Behaviour |
|---|---|
| Inline edit | click row text → editable field; Esc cancels, Enter saves |
| Delete | confirms; permanent (no undo) |
| Mark resolved (on Q) | adds `resolved: true` tag; cleaner removes on next run |
| Export Markdown | one section → `.md` file with frontmatter |

## Workflow patterns

| Pattern | How |
|---|---|
| Pre-session priming | open project memory before spawning a Claude session — agent gets latest decisions via [injection](../ambient-memory/injection) |
| Post-session triage | scanner auto-promoted N rows during session.ended; review what landed |
| Decision log | tag manually with `decision`; survives auto-cleanup |
| Stale questions cleanup | filter by `unresolved + age > 30d` → mark or delete |
| Hand off project to a different operator | export sections → commit `.md` to repo as `PROJECT_MEMORY.md` |

## Capabilities

| feature | supported |
|---|---|
| Inline edit | ✓ |
| Bulk operations per section | ✓ |
| Markdown export | ✓ per section + whole project |
| Markdown import | ✓ (paste / file upload) |
| Audit log of edits | ✓ |
