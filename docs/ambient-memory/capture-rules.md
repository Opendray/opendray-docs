---
kind: capability
title: Ambient Memory — capture rules
tldr: Rule = match (provider / cwd glob / event type) + action (summarize / regex extract). Multiple rules can fire per event. Configured in Settings → Ambient Memory.
status: stable
since: v0.1.0
topic: ambient-memory
related:
  - ambient-memory/overview
  - ambient-memory/providers
  - ambient-memory/injection
capability:
  - rule-matcher
  - regex-extractor
  - summarizer-trigger
inbound: session-events
outbound: memory_store
x-implementation:
  - internal/memory/capture/rule.go
---

# Ambient Memory — capture rules

> **tldr:** Rule = match (provider / cwd glob / event type) + action (summarize / regex extract). Multiple rules can fire per event. Configured in **Settings → Ambient Memory**.

## Rule schema

```yaml
- id: "capture-jwt-decisions"
  match:
    provider: [claude, codex]              # OR; empty = all
    cwd_glob: "/Users/me/projects/**"      # optional
    event:    [session.ended, session.idle] # OR; empty = both
    text_contains: ["jwt", "auth"]         # AND; optional pre-filter
  action:
    type: summarize                        # summarize | regex_extract
    summary_prompt: |
      Extract authentication-related decisions from this session.
      Focus on: secret storage, refresh strategy, scope changes.
    scope: project                         # session | project | global
    tags: ["auth", "ambient"]
    confidence_threshold: 0.7              # skip if summarizer < 0.7
```

## Action types

| `type` | What it does | Output |
|---|---|---|
| `summarize` | LLM-summarized facts via [providers](./providers) | one or more rows per session |
| `regex_extract` | regex captures groups → store each as fact | row per match |

### regex_extract example

```yaml
action:
  type: regex_extract
  pattern: 'package manager preference[:\s]+(?P<pm>\w+)'
  template: "preferred package manager: ${pm}"
  scope: project
```

## Defaults

| Rule | Behaviour |
|---|---|
| Built-in `session-summary` | summarize Claude/Codex/Gemini sessions on `session.ended`, 50-token max |
| Built-in `permission-asks` | regex-extract `--bypass-permissions` discussions, store as project-scoped |
| User rules | applied AFTER built-ins; can override via `id` |

## Capabilities

| feature | supported |
|---|---|
| Pre-filter (cwd_glob, text_contains) | ✓ |
| Multiple rules per event | ✓ |
| Dry-run preview | ✓ (`noop` summarizer + log) |
| Per-rule confidence threshold | ✓ |
| Disable built-in rules | ✓ (set `enabled: false` for the id) |
| Hot reload | ✓ (Settings page Save) |
| Per-rule tag injection | ✓ |

## Errors

| code | http | cause | fix |
|---|---|---|---|
| `capture_rule_invalid` | 400 | bad YAML / unknown field | check schema |
| `regex_pattern_invalid` | 400 | regex doesn't compile | test in `regex101.com` first |
| `capture_skipped_threshold` | (log info) | summary confidence < threshold | tune threshold or improve prompt |
