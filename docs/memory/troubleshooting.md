---
kind: concept
title: Memory troubleshooting
tldr: Symptom → likely cause → fix. Cheatsheet for the 6 most common memory failure modes.
status: stable
since: v0.1.0
topic: memory
related:
  - memory/overview
  - memory/quickstart
  - memory/configuration
references:
  capabilities: [memory]
x-implementation:
  - internal/memory/
---

# Memory troubleshooting

> **tldr:** Symptom → likely cause → fix. Cheatsheet for the 6 most common memory failure modes.

## Symptom table

| Symptom | Likely cause | Fix |
|---|---|---|
| Agent never calls memory tools | system prompt not injected OR MCP not auto-attached | check `mcp.json` has `opendray-memory`; restart session; verify `app.New` logged `memory MCP auto-attach enabled` |
| `tool error: 401 unauthorized` | stale API key in session's `mcp.json` (opendray bounced + cache wiped) | restart session — opendray re-renders `mcp.json` with current key |
| Search returns 0 hits | BM25 exact-token only | use a literal word from stored text; or switch to `http` backend with semantic embedder |
| `connection refused` on mcp-memory | gateway crashed | `tail -f /tmp/opendray.log`; check for panic; restart |
| `embedder_dim_mismatch` after backend change | rows have old dim, embedder expects new | use **Migrate** banner on Memory page → reembed |
| Mirror not seeing Claude memories | wrong cwd encoding OR perm denied | `ls ~/.claude/projects/<encoded-cwd>/memory/` should list files; check perms |

## Verification commands

```bash
# Is memory ready?
grep "memory ready" /tmp/opendray.log

# Is MCP attached?
ls /var/folders/.../opendray-sess-<sid>/
cat /var/folders/.../opendray-sess-<sid>/claude-mcp.json

# Provider supports MCP?
jq '.capabilities.supportsMcp' internal/catalog/builtin/<provider>.json

# Mirror sees files?
ls ~/.claude/projects/<encoded-cwd>/memory/
ls ~/.claude-accounts/<account>/projects/<encoded-cwd>/memory/
```

## When to dig deeper

| Issue | Read |
|---|---|
| Backend choice / migration | [configuration](./configuration), [maintenance](./maintenance) |
| Cross-CLI bridging not working | [mirror](./mirror) |
| Conflict resolution | [maintenance](./maintenance) |
| Worker stuck | [memory-workers/verification](../memory-workers/verification) |
