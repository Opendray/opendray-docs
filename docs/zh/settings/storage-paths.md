---
kind: capability
title: 设置 — 存储路径
tldr: opendray 把文件放哪 — notes vault、runtime / session 临时、claude 账号目录、backup staging。默认 $HOME/.opendray。改动需重启。
status: stable
since: v0.1.0
topic: settings
related: [settings/overview, notes/overview, providers/claude-accounts, backup/quickstart]
capability: [storage-path-overrides]
x-implementation: [internal/settings/storage.go, config.toml]
---

# 设置 — 存储路径

> **tldr:** opendray 把文件放哪 —— notes vault、runtime / session 临时、claude 账号目录、backup staging。默认 `$HOME/.opendray`。改动需重启。

## 默认布局

```
$HOME/.opendray/
├── vault/                 # 笔记(markdown 文件)
├── runtime/               # per-session 临时(mcp.json 等)— 自动清理
├── backup-staging/        # 加密备份过程文件
└── logs/                  # 滚动文件(若 file 目标)

$HOME/.claude-accounts/    # 多账号 claude(按惯例独立根)
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
accounts_root = "/home/me/.claude-accounts"
```

## per-provider session 日志路径

Inspector → History tab 用。

```toml
[providers.claude]
session_log_root_default = "/home/me/.claude/projects"

[providers.codex]
session_log_root = "/home/me/.codex/sessions"

[providers.gemini]
session_log_root = "/home/me/.gemini/tmp"
projects_index   = "/home/me/.gemini/projects.json"
```
