---
kind: capability
title: Custom provider manifest
tldr: Drop a JSON manifest under internal/catalog/builtin/ (compile-time) or POST it to /api/v1/catalog/providers (runtime) → new CLI appears in the spawn dropdown.
status: stable
since: v0.1.0
topic: providers
related:
  - providers/overview
  - providers/bundled
capability:
  - text-cli
  - custom-binary
  - env-override
x-implementation:
  - internal/catalog/manifest.go
  - internal/catalog/validator.go
---

# Custom provider manifest

> **tldr:** Drop a JSON manifest under `internal/catalog/builtin/` (compile-time) or POST it to `/api/v1/catalog/providers` (runtime) → new CLI appears in the spawn dropdown.

## Manifest schema

```json
{
  "$schema": "https://opendray.dev/schemas/manifest-v2.json",
  "id": "myshell",
  "displayName": "Plain Shell",
  "displayName_zh": "纯 Shell",
  "description": "Interactive shell session, no AI assistance.",
  "description_zh": "交互式 shell 会话,无 AI 辅助。",
  "icon": "🐚",
  "version": "1.0.0",
  "kind": "cli",
  "executable": "zsh",
  "args": ["-l"],
  "env": {
    "TERM": "xterm-256color"
  },
  "spawnHint": {
    "cwdPlaceholder": "/Users/me/projects",
    "argsExample": "--login"
  }
}
```

## Field reference

| Field | Type | Required | Constraint |
|---|---|---|---|
| `id` | string | ✓ | `[a-z0-9-]+`, 2–40 chars, unique |
| `displayName` | string | ✓ | shown in dropdowns |
| `displayName_zh` | string | ✗ | CJK variant for `lang=zh` |
| `description` | string | ✗ | one-line picker hint |
| `description_zh` | string | ✗ | CJK variant |
| `icon` | string | ✗ | single emoji |
| `version` | string | ✗ | free-form; shown on provider card |
| `kind` | enum | ✓ | always `cli` for now |
| `executable` | string | ✓ | path or PATH-resolved name |
| `args` | string[] | ✗ | default args appended to every spawn |
| `env` | map\<string, string\> | ✗ | merged into process env |
| `spawnHint.cwdPlaceholder` | string | ✗ | UI hint |
| `spawnHint.argsExample` | string | ✗ | UI hint |

## Install paths

### Compile-time (bundled)

```bash
# 1. Drop manifest under internal/catalog/builtin/
cp my-provider.json internal/catalog/builtin/myshell.json

# 2. Rebuild (embeds via go:embed)
go build ./cmd/opendray

# 3. Restart
./opendray serve -config config.toml
```

### Runtime (no rebuild)

```bash
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  http://localhost:8770/api/v1/catalog/providers \
  -d @my-provider.json
```

The catalog package validates the manifest against the schema and
persists the row. Next sync cycle picks it up — no restart.

## Validation rules

| Rule | Behaviour |
|---|---|
| `id` regex mismatch | manifest rejected, HTTP 400 |
| Unknown top-level key | manifest rejected, HTTP 400 |
| `executable` not on PATH at startup | provider marked **unavailable** (greyed in dropdown) |
| `id` collides with existing | manifest rejected, HTTP 409 |

Server log on startup:

```
INFO catalog synced count=4
WARN provider unavailable id=myshell err="executable not found in $PATH: zsh"
```

## Runtime overrides

The web UI lets you patch `executable` / `args` / `env` /
`displayName` / `disabled` per host without editing the source
manifest. Overrides live in the DB and apply on top of the bundled
defaults — handy when the same opendray binary runs on multiple
hosts with different filesystem layouts.

The **Reset** button on the provider card drops overrides and
reverts to the manifest's bundled values.

## Errors

| code | http | cause | fix |
|---|---|---|---|
| `manifest_invalid_id` | 400 | id regex mismatch | `[a-z0-9-]+`, 2–40 chars |
| `manifest_unknown_field` | 400 | unknown top-level key | check schema |
| `manifest_executable_missing` | (warn at startup) | binary not on PATH | install or fix absolute path |
| `provider_id_conflict` | 409 | id already in catalog | pick a different id or delete existing |
| `manifest_schema_mismatch` | 400 | wrong type for a field | validate against `$schema` URL |

<details>
<summary>📖 Narrative explanation</summary>

Adding a CLI that opendray doesn't ship is a matter of dropping
one JSON file. No code changes, no rebuild — though you do need
to restart opendray to pick up a compile-time addition (runtime
POST takes effect on the next sync cycle).

The bundled manifests live inside the Go binary via `embed.FS`,
under `internal/catalog/builtin/<id>.json`.

</details>
