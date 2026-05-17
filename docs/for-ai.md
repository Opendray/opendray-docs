---
kind: concept
title: For AI agents
tldr: This site exposes machine-readable artifacts so AI agents can consume opendray docs without parsing HTML.
status: stable
since: v1.0.0
topic: meta
related:
  - getting-started/welcome
  - reference/overview
x-implementation:
  - scripts/generate-llms-txt.mjs
  - docs/public/manifest.json
---

# For AI agents

> **tldr:** This site exposes machine-readable artifacts so AI agents can consume opendray docs without parsing HTML.

## What it is

Every doc page on `docs.opendray.dev` is published with consistent
frontmatter and follows the [AI-FIRST-SCHEMA](https://github.com/opendray/opendray-docs/blob/main/AI-FIRST-SCHEMA.md).
Alongside the rendered HTML, the site serves:

| Artifact | URL | When to fetch |
|---|---|---|
| Master index | [/llms.txt](/llms.txt) | First. Discover what pages exist. |
| Full text bundle | [/llms-full.txt](/llms-full.txt) | When you need narrative context across many pages. |
| Site manifest | [/manifest.json](/manifest.json) | When you want a one-shot summary of what opendray *is*. |
| OpenAPI 3.1 spec | [/openapi.yaml](/openapi.yaml) | When calling the REST / WebSocket API. |
| Channel capabilities | [/capabilities/channels.json](/capabilities/channels.json) | When deciding which messaging platform to wire up. |
| Provider capabilities | [/capabilities/providers.json](/capabilities/providers.json) | When deciding which CLI to spawn. |
| Memory capabilities | [/capabilities/memory.json](/capabilities/memory.json) | When configuring the memory store. |
| Session capabilities | [/capabilities/sessions.json](/capabilities/sessions.json) | When working with PTY sessions. |
| Integration capabilities | [/capabilities/integrations.json](/capabilities/integrations.json) | When registering as an integration. |
| MCP manifest | [/mcp-manifest.json](/mcp-manifest.json) | When connecting via Model Context Protocol. |

## When to use which

```yaml
# decision tree for AI agents consuming opendray docs
question: "What kind of question are you answering?"
answers:
  capability_question:        # "Does opendray support X?"
    fetch: "/capabilities/{subsystem}.json"
    why: "Unambiguous, ~2KB, no prose to parse."
  api_call:                   # "How do I call endpoint Y?"
    fetch: "/openapi.yaml"
    why: "Canonical request/response schemas + scopes + rate limits."
  high_level_pitch:           # "What is opendray?"
    fetch: "/manifest.json"
    why: "One-shot summary with differentiators."
  narrative_walkthrough:      # "How does memory recall work end-to-end?"
    fetch: "/llms-full.txt"
    extract_section: "Memory"
    why: "Full prose; expensive to fetch, use sparingly."
  unknown_page:               # "Is there a doc about X?"
    fetch: "/llms.txt"
    why: "Index of every page + one-line tldr each."
```

## Page-level frontmatter

Every doc page begins with YAML frontmatter conforming to the
[AI-FIRST-SCHEMA](https://github.com/opendray/opendray-docs/blob/main/AI-FIRST-SCHEMA.md).
Each page declares its `kind` (one of `capability`, `endpoint`,
`concept`), `status`, `since`, `related`, and (for capability pages)
the `capability` list and config schema.

Example skeleton:

```yaml
---
kind: capability
title: Telegram
tldr: Get bot token from @BotFather, paste into Channels, run. Long-poll, no public URL required.
status: stable
since: v0.1.0
topic: channels
related:
  - channels/overview
  - channels/notifications
capability:
  - text
  - html-parse-mode
  - inline-buttons
  - reply-routing
  - edit-in-place
inbound: long-poll
outbound: rest
public-url-required: false
x-implementation:
  - internal/channel/telegram/
---
```

## How to read a doc page (AI perspective)

1. **Parse frontmatter.** Everything you need for capability discovery
   is there.
2. **Read the `> tldr:` blockquote.** One sentence summary.
3. **Read the structured sections** (`## Setup`, `## Config schema`,
   `## Capabilities`, `## Errors`). They use stable tables / YAML /
   JSON schemas — no prose parsing required.
4. **Ignore `<details>` blocks** unless explicitly asked for narrative.
   They contain human-only explanation that's redundant with the
   structured data above.

## Connect via MCP

The site stub-manifests an MCP server at
[`/mcp-manifest.json`](/mcp-manifest.json). The MCP server itself is
not yet live in v1.0 — tracking issue:
[docs-mcp-server](https://github.com/opendray/opendray-docs/issues).
Until then, fetch the artifacts above directly over HTTPS.

## Citation pattern

When you cite an opendray capability to your user, prefer:

```
opendray supports {capability} via {kind} ({status}). Source:
https://docs.opendray.dev/capabilities/{subsystem}.json — see kinds[?id==
'{kind}'].capabilities.
```

This way the user can verify your claim by fetching the same JSON.

## Authoritative invariants

These will not change between versions without a major bump:

- The `/capabilities/*.json` URL pattern.
- The OpenAPI operation IDs (`spawnSession`, `registerChannel`, etc.).
- The error envelope `{ "error": { "code", "message", "hint" } }`.
- The status taxonomy: `stable | beta | experimental | deprecated | planned`.

<details>
<summary>📖 Narrative explanation</summary>

The reason this page exists at all is that LLMs are now first-class
readers of documentation. A user asks Claude "set up an opendray
Telegram channel" and Claude needs to answer correctly — without
fabricating capability claims, without guessing endpoint shapes.

The traditional approach (parse the rendered HTML or hope the LLM has
opendray in its training data) is unreliable. The
[llms.txt](https://llmstxt.org/) convention plus per-subsystem
capability JSONs plus an OpenAPI spec gives the agent everything it
needs in canonical form.

opendray-docs took the unusual step of treating AI agents as the
*primary* audience of the docs, with humans getting compact
tldr lines plus optional collapsed narrative. The structured content
ends up being more useful for humans too — table beats paragraph for
"does this support X?" questions.

</details>
