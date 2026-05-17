---
kind: capability
title: Note editor
tldr: Markdown editor with Source/Preview tabs, debounced auto-save (1s), wiki-link autocomplete, code-block syntax highlighting, image paste. Same editor in Notes page + Inspector linked-note pane.
status: stable
since: v0.1.0
topic: notes
related: [notes/overview, notes/wiki-links, sessions/inspector]
capability: [source-preview, autosave, wiki-autocomplete, image-paste, codeblock-highlight, frontmatter-rendering]
inbound: keyboard
outbound: file-write
x-implementation: [app/web/src/features/notes/editor/]
---

# Note editor

> **tldr:** Markdown editor with Source/Preview tabs, debounced auto-save (1s), wiki-link autocomplete, code-block syntax highlighting, image paste. Same editor in Notes page + Inspector linked-note pane.

## Layout

| Region | What |
|---|---|
| Top tabs | Source · Preview · Split |
| Main body | textarea (Source) / rendered HTML (Preview) / both (Split) |
| Right pane | wiki-link autocomplete (when typing `[[`); backlinks otherwise |
| Bottom status | wordcount · save status · file path · last modified |

## Auto-save

| Trigger | Delay |
|---|---|
| Keystroke | 1s debounce |
| Tab switch (Source ↔ Preview) | immediate |
| Window blur | immediate |
| Esc key | immediate |

| Status indicator | Meaning |
|---|---|
| `Saved 2s ago` | green dot |
| `Saving...` | spinner |
| `Save failed — disk full?` | red banner |

## Code blocks

| Aspect | Default |
|---|---|
| Syntax detection | first line `\`\`\`lang` |
| Highlighter | Shiki (same as VitePress) |
| Languages | bundled: ts/js/go/python/bash/sql/yaml/toml/json/markdown/html/css |
| Custom language | works if Shiki supports it |
| Copy button | hovered top-right |
| Line numbers | optional via `\`\`\`lang {1,3-5}` |

## Image paste

| Action | Behaviour |
|---|---|
| `Cmd/Ctrl + V` of clipboard image | saved to `<vault>/_attachments/<sha>.png`, inserted as `![[hash.png]]` |
| Drag-drop image file | same |
| Drag-drop other file | inserted as `![[name.ext]]` link, file copied to `_attachments/` |
| Max image size | 10 MB |

## Frontmatter rendering

```markdown
---
title: My note
tags: [project, archive]
created: 2026-05-17
---
```

Frontmatter is collapsed in Preview by default; click to expand.
Source shows it raw.

## Keyboard shortcuts (in Source)

| Shortcut | Action |
|---|---|
| `Cmd/Ctrl + S` | force save now |
| `Cmd/Ctrl + B` | bold selection |
| `Cmd/Ctrl + I` | italic |
| `Cmd/Ctrl + K` | wrap selection in `[](url)` |
| `Cmd/Ctrl + Shift + K` | wrap selection in `[[]]` |
| `Tab` (in list item) | indent |
| `Shift + Tab` | outdent |
| `Cmd/Ctrl + Enter` | toggle Source ↔ Preview |

## Errors

| code | when | fix |
|---|---|---|
| `vault_disk_full` | < 100 MB free | clean disk |
| `vault_path_outside` | path traversal attempt | path must be inside vault |
| `vault_file_too_large` | > 10 MB single file | split file |
