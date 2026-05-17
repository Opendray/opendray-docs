# AI-first Documentation Schema

> Internal reference for opendray-docs contributors. Defines the frontmatter
> vocabulary, page structure, and conventions every doc page must follow.

This document is the **single source of truth** for how opendray-docs is
written. Every page MUST conform to this schema. Pages that don't are
considered tech debt and are scheduled for migration.

## Why

Per [`docs-as-ai-context`](../memory/docs-as-ai-context.md), opendray-docs
serves two audiences:

| Audience | Wants | Reads |
|---|---|---|
| **AI agent** | unambiguous capability + schema, no marketing | frontmatter, tables, YAML, JSON |
| **Human skimmer** | tl;dr + concrete steps + code | `> tldr:` line + tables + `<details>` |

Both are served by the **same source file** — written once, indexed twice.

## The three page kinds

Every page is exactly one of:

| Kind | Purpose | Example |
|---|---|---|
| `capability` | Describes one feature / sub-feature(channel, provider, memory mode) | `channels/telegram.md` |
| `endpoint` | Describes one or more REST / WS endpoints | `reference/rest.md` |
| `concept` | Overview / how-it-works / conceptual orientation | `memory/overview.md` |

The frontmatter shape depends on the kind. Below is the canonical schema.

---

## Frontmatter — universal fields

These are REQUIRED on every page regardless of kind:

```yaml
---
# Required
kind: capability | endpoint | concept     # discriminator — controls schema below
title: Telegram                            # human-readable; rendered as <h1>
tldr: One sentence machine + human description, ends with period.

# Status taxonomy — what users / AI can rely on
status: stable | beta | experimental | deprecated | planned
since: v0.1.0                              # version this first shipped

# Discovery / linking
topic: channels                            # which super-group (matches data.ts)
related:                                   # link slugs in same site (no leading /)
  - channels/overview
  - channels/notifications

# Implementation provenance (helps AI verify against code)
x-implementation:
  - internal/channel/telegram/
  - internal/channel/hub.go
---
```

## Frontmatter — `kind: capability`

For a capability page (channel, provider, embedder, memory scope), add:

```yaml
---
kind: capability
# ... universal fields ...

capability:
  # Free-form list of supported features. Use kebab-case stable identifiers.
  - text
  - html-parse-mode
  - inline-buttons
  - reply-routing
  - edit-in-place

# For channels specifically: inbound/outbound + public-URL requirement
inbound: long-poll | webhook | websocket | gateway | none
outbound: rest | websocket | webhook
public-url-required: false

# Config schema lives inline (see "Required sections" below)
---
```

## Frontmatter — `kind: endpoint`

For REST or WS endpoint pages, use OpenAPI 3.1 operation objects directly
in frontmatter. The page body is the prose explanation.

```yaml
---
kind: endpoint
# ... universal fields ...

operations:
  - operationId: registerChannel
    method: POST
    path: /api/v1/channels
    summary: Register a new channel
    tags: [channels]
    requestBody:
      $ref: '/capabilities/channels.schema.json#/RegisterChannel'
    responses:
      '201':
        $ref: '/capabilities/channels.schema.json#/Channel'
      '400':
        $ref: '/openapi.yaml#/components/responses/Error'
      '409':
        $ref: '/openapi.yaml#/components/responses/Error'
    x-required-scope: channel:write
    x-rate-limit: '2 req/s sustained, 6 burst'
    x-since: v0.1.0
---
```

Multiple operations per page are fine when they're tightly related
(e.g. CRUD on the same resource).

## Frontmatter — `kind: concept`

For overview / how-it-works pages, the schema is the most minimal:

```yaml
---
kind: concept
# ... universal fields ...

# Concepts can declare which capabilities / endpoints they reference
references:
  capabilities: [memory, integrations]
  endpoints: [recallMemory, listIntegrations]
---
```

---

## Required body sections (in this order)

Each kind has a strict section list. Use these literal headings (`##`).
Sections marked OPTIONAL can be omitted; sections marked REQUIRED must exist
even if empty (AI relies on the structure).

### `kind: capability`

```markdown
# {title}

> **tldr:** {tldr}

## Setup                  ← REQUIRED, numbered list or table
## Config schema          ← REQUIRED, YAML codefence with comments
## Capabilities           ← REQUIRED, table feature × supported × notes
## Errors                 ← REQUIRED, table code × cause × fix
## Examples               ← OPTIONAL, IO pairs
## Limitations            ← OPTIONAL, table
<details>
<summary>📖 Narrative explanation</summary>
{collapsed prose for humans only}
</details>
```

### `kind: endpoint`

```markdown
# {title}

> **tldr:** {tldr}

## Operations             ← REQUIRED, listed in frontmatter; one ### per op
## Request / response examples  ← REQUIRED, IO pairs
## Errors                 ← REQUIRED, table
## Auth                   ← REQUIRED, what scope, key tier
## Rate limits            ← REQUIRED, exact numbers
<details>
<summary>📖 Narrative explanation</summary>
{collapsed prose}
</details>
```

### `kind: concept`

```markdown
# {title}

> **tldr:** {tldr}

## What it is             ← REQUIRED, ≤ 4 sentences
## When to use            ← REQUIRED, decision table
## How it works           ← OPTIONAL, ascii diagram + bullets
## Related                ← REQUIRED, link list
<details>
<summary>📖 Narrative explanation</summary>
{collapsed prose}
</details>
```

---

## Writing rules

1. **No marketing prose.** Don't write "you might wonder why" — just state the
   fact. AI doesn't need persuasion; humans skim and skip.
2. **Tables over paragraphs** for facts. Reserve paragraphs for the
   `<details>` narrative.
3. **YAML for config**, JSON Schema for APIs, tables for matrices.
4. **One canonical term** per concept. Don't switch between "session" and
   "task". The glossary in `docs/glossary.md` is authoritative.
5. **Enumerate completely.** No "etc." in technical content. If the list is
   too long for prose, make it a table.
6. **Examples must round-trip.** Every config snippet must be valid and
   tested. Every API example must be the actual request the server accepts.
7. **Stable kebab-case for identifiers.** `reply-routing`, not `Reply Routing`
   or `replyRouting`.
8. **Status values are normative.** `stable` means SemVer-bound; `beta` means
   may change without major bump; `deprecated` is scheduled removal.

## Anti-patterns (will be flagged in review)

- ❌ "In this section we'll explore..." — just put the heading
- ❌ "It's worth noting that..." — if it's worth noting, state it
- ❌ "Most users will want..." — say what triggers the choice
- ❌ Inline `[markdown](links)` to external blog posts as primary reference
- ❌ Screenshots that aren't strictly necessary for understanding
- ❌ Versioning a feature without bumping `since:`

## Pre-flight checklist

Before merging a page, verify:

- [ ] `kind:` declared and matches body structure
- [ ] `tldr:` is one sentence, ends with period, < 30 words
- [ ] Every required section present (even if just "n/a — see <link>")
- [ ] Tables: no merged cells, header row present
- [ ] YAML / JSON in code fences parses (`pnpm validate-frontmatter`)
- [ ] Bilingual mirror updated (EN / ZH file paths match)
- [ ] `related:` link slugs resolve to existing pages
- [ ] Narrative collapsed in `<details>`, not at top of page
