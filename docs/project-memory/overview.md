---
kind: concept
title: Project memory — overview
tldr: Per-cwd structured layer on top of raw memory rows. Auto-curated by scanner + cleaner workers. Surfaces as one page per project with goals / decisions / state.
status: stable
since: v0.1.0
topic: project-memory
related:
  - project-memory/workflow
  - project-memory/scanner-and-cleaner
  - project-memory/reset-and-troubleshooting
  - memory/overview
references:
  capabilities: [memory]
x-implementation:
  - internal/memory/project/
---

# Project memory — overview

> **tldr:** Per-cwd structured layer on top of raw memory rows. Auto-curated by scanner + cleaner workers. Surfaces as one page per project with goals / decisions / state.

## Why a structured layer

| Raw memory rows | Project memory |
|---|---|
| flat list, score-ranked | grouped: goals / decisions / state / open questions |
| BM25 / semantic search | section-by-section page |
| every fact in pgvector | curated subset (worker-promoted) |
| operator browses by query | operator reads top-down |

## Page layout (one per cwd)

| Section | Source | Updated by |
|---|---|---|
| Goals | rows tagged `goal` | scanner detects "we want to ..." |
| Decisions | rows tagged `decision` | scanner detects "we decided ..." |
| Open questions | rows tagged `question` + `unresolved: true` | scanner detects "?" + cleaner clears when resolved |
| Current state | latest `state` row | session.ended capture |
| Files of interest | rows tagged `file:<path>` | inferred from agent file refs |
| Recent activity | last N session ids touching this cwd | session manager |

## Auto-curated by workers

| Worker | Role | Schedule |
|---|---|---|
| Scanner | promotes raw rows → project memory sections | every session.ended in this cwd |
| Cleaner | removes stale / resolved | every 24h |
| Summarizer | compacts > 50 rows in a section | when section size > 50 |

See [scanner-and-cleaner](./scanner-and-cleaner) for tunables.

## When to read what

| Topic | Read |
|---|---|
| Day-to-day usage patterns | [workflow](./workflow) |
| Worker tunables + override | [scanner-and-cleaner](./scanner-and-cleaner) |
| Bad capture / reset | [reset-and-troubleshooting](./reset-and-troubleshooting) |

## Capabilities

| feature | supported |
|---|---|
| Per-cwd structured page | ✓ |
| Auto-promotion (raw → structured) | ✓ |
| Manual override (operator edits sections) | ✓ |
| Reset section | ✓ |
| Section export (Markdown) | ✓ |
| Cross-project view | ✗ (per-cwd by design) |
