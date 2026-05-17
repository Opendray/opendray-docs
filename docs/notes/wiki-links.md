---
kind: capability
title: Wiki links + backlinks
tldr: '[[note-name]] syntax. Resolves by filename (case-insensitive, ignores path). Autocomplete on [[. Right-pane shows incoming backlinks. Re-computed on save.'
status: stable
since: v0.1.0
topic: notes
related: [notes/overview, notes/editor]
capability: [wiki-link, autocomplete, backlinks, broken-link-detection]
inbound: editor-input
outbound: file-write
x-implementation: [internal/notes/wikilink.go]
---

# Wiki links + backlinks

> **tldr:** `[[note-name]]` syntax. Resolves by filename (case-insensitive, ignores path). Autocomplete on `[[`. Right-pane shows incoming backlinks. Re-computed on save.

## Syntax

| Pattern | Example | Resolves to |
|---|---|---|
| `[[name]]` | `[[opendray-positioning]]` | first `*.md` with basename `opendray-positioning` |
| `[[name\|display]]` | `[[opendray-positioning\|see positioning notes]]` | same target, custom display |
| `[[name#heading]]` | `[[design-doc#mission]]` | scrolls to heading after open |
| `![[name]]` | `![[diagram.png]]` | embed image / pdf transclude |

## Resolution rules

| Rule | Behaviour |
|---|---|
| Case-insensitive | `[[notes]]` matches `Notes.md` |
| Path-agnostic | `[[design]]` matches `archive/design.md` if no closer match |
| Closer = wins | sibling > parent > root > anywhere |
| Multiple matches | first-by-path-depth then alphabetical |
| No match | rendered as red broken-link with hover hint |

## Autocomplete

| Trigger | Behaviour |
|---|---|
| Type `[[` | dropdown shows recent + frequent notes |
| Continue typing | filters by fuzzy match |
| Press Tab/Enter | inserts selected |
| Press Esc | dismisses |
| Press `\|` after match | switches to "type display label" mode |

## Backlinks (right pane)

| Where | What |
|---|---|
| Editor right pane | "Linked from" — every other note that `[[`-links to this one |
| Hover backlink | preview of the linking line |
| Click backlink | jumps to that note + scrolls to the link |
| Empty state | "No backlinks yet" |

## Broken-link detection

| Where | Behaviour |
|---|---|
| Editor render | broken `[[xxx]]` shown in red |
| Hover | tooltip "No matching note — click to create" |
| Click | creates `xxx.md` in same directory, opens for editing |
| Bulk audit | `opendray notes audit` CLI lists every broken link in vault |

## Index lifecycle

| Event | What happens |
|---|---|
| File saved | wiki links re-extracted, backlink index updated |
| File renamed (Obsidian-style) | all `[[old-name]]` rewritten to `[[new-name]]` |
| File deleted | backlinks to it become broken; flagged |

## Errors

| code | when | fix |
|---|---|---|
| `wikilink_target_collision` | two `.md` with same basename in different dirs and link is ambiguous | use the longer `[[archive/name]]` form |
| `wikilink_circular_embed` | `![[a.md]]` inside `a.md` | edit one of them |
