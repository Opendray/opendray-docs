---
kind: capability
title: Settings — Storage paths
tldr: Where opendray puts files — notes vault, runtime / session scratch, claude account dirs, backup staging. Default $HOME/.opendray. Restart required to change.
status: stable
since: v0.1.0
topic: settings
related: [settings/overview, notes/overview, providers/claude-accounts, backup/quickstart]
capability: [storage-path-overrides]
x-implementation: [internal/settings/storage.go, config.toml]
---

# Settings — Storage paths

> **tldr:** Where opendray puts files — notes vault, runtime / session scratch, claude account dirs, backup staging. Default `$HOME/.opendray`. Restart required to change.

## Default layout

```
$HOME/.opendray/
├── vault/                 # notes (markdown files)
├── runtime/               # per-session scratch (mcp.json etc.) — auto-cleaned
├── backup-staging/        # encrypted backup files in transit
└── logs/                  # rotation files (if file destination)

$HOME/.claude-accounts/    # multi-account claude (separate root by convention)
└── work/.claude/...
└── personal/.claude/...
```

## Config

```toml
[storage]
vault_path          = "/home/me/.opendray/vault"
runtime_path        = "/home/me/.opendray/runtime"
backup_staging_path = "/home/me/.opendray/backup-staging"
log_path            = "/home/me/.opendray/logs"

[providers.claude]
accounts_root = "/home/me/.claude-accounts"   # multi-account claude
```

## Per-provider session-log paths

These tell opendray where each CLI's own log / session files live.
Used by Inspector → History tab.

```toml
[providers.claude]
session_log_root_default = "/home/me/.claude/projects"

[providers.codex]
session_log_root = "/home/me/.codex/sessions"

[providers.gemini]
session_log_root = "/home/me/.gemini/tmp"
projects_index   = "/home/me/.gemini/projects.json"
```

## Capabilities

| feature | supported |
|---|---|
| Custom vault path | ✓ |
| Custom claude accounts root | ✓ |
| Custom backup staging | ✓ (often a fast-disk override) |
| Hot reload | ✗ — restart needed |
| Per-cwd vault | ✗ — single vault per opendray |
| Tilde expansion (`~/...`) | ✓ |

## Errors

| code | when | fix |
|---|---|---|
| `storage_path_unwritable` | boot fail | check perms |
| `storage_path_not_dir` | path is a file | use a directory |
| `vault_too_large_to_mount` | > 1M files | split vault |
