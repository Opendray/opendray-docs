---
kind: capability
title: Vault git 同步
tldr: 可选。Vault 是 git repo。opendray 按计划自动 commit + push。Session spawn 时 pull。合并冲突在 UI 浮出,手动解决。
status: stable
since: v0.1.0
topic: notes
related: [notes/overview, backup/overview]
capability: [git-auto-commit, git-auto-push, conflict-surface, branch-per-host]
inbound: file-watcher
outbound: git
x-implementation: [internal/notes/gitsync.go]
---

# Vault git 同步

> **tldr:** 可选。Vault 是 git repo。opendray 按计划自动 commit + push。Session spawn 时 pull。合并冲突在 UI 浮出,手动解决。

## Setup

| # | 动作 |
|---|---|
| 1 | 把 `<vault>` 变 git repo:`cd <vault> && git init && git remote add origin <url>` |
| 2 | 配认证:SSH key 或 `Settings → Notes → Git auth` 里的 PAT |
| 3 | 启用同步:`Settings → Notes → Auto-sync = on` |
| 4 | 选 schedule + 分支 + commit author |

## Config

```toml
[notes.gitsync]
enabled       = true
remote        = "origin"
branch        = "main"
commit_author = "opendray <bot@opendray.dev>"
auto_commit_schedule = "*/15 * * * *"
auto_push_schedule   = "*/30 * * * *"
pull_on_session_spawn = true
```

## Per-host 分支模式(多设备推荐)

| 设备 | 分支 |
|---|---|
| 桌面 opendray | `host-mac-studio` |
| 家里 Pi | `host-pi-home` |
| 办公室 LXC | `host-lxc-office` |

然后每端 `git merge` 跨分支整合。

## 自动 commit 消息

```
opendray-auto: 5 files modified, 2 added

modified: sessions/s_42.md
modified: projects/pettracker/architecture.md
added:    archive/2026-05-17-debugging.md
```

## 冲突处理

| 冲突 | UI 行为 |
|---|---|
| 两侧改同一文件 | 红 banner:"Vault has conflicts" + 列表 |
| 点冲突文件 | 三栏 diff 编辑器(ours / theirs / merged) |
| 解决 + commit | 完成 merge commit |
