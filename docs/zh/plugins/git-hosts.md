---
kind: capability
title: Git host 适配器
tldr: GitHub / Gitea / GitLab 集成 — PAT 或 OAuth。笔记 vault 同步、Sessions Git tab、PR 命令用。Per-host scope。加密落盘。
status: stable
since: v0.1.0
topic: plugins
related: [plugins/overview, sessions/git-workflow, notes/vault-git-sync]
capability: [github, gitea, gitlab, pat-auth, oauth-auth, encrypted-storage]
inbound: settings
outbound: git
x-implementation: [internal/git/adapter/]
---

# Git host 适配器

> **tldr:** GitHub / Gitea / GitLab 集成 —— PAT 或 OAuth。笔记 vault 同步、Sessions Git tab、PR 命令用。Per-host scope。加密落盘。

## 支持的 host

| Host | 认证方式 | API base |
|---|---|---|
| GitHub | PAT(推荐)、OAuth app | `https://api.github.com` |
| Gitea | PAT、OAuth | 自托管 URL |
| GitLab | PAT、OAuth | `https://gitlab.com` 或自托管 |
| Bitbucket | ✗ 不支持 | — |

## 注册

| # | 动作 |
|---|---|
| 1 | Settings → Git hosts → **+ Add host** |
| 2 | 选 host 种类 + 名(`my-github`、`work-gitea`) |
| 3 | 方法:PAT 或 OAuth |
| 4 | PAT:粘 token;OAuth:走完授权 |
| 5 | 选 scope(下) |

## 所需 PAT scope

| Host | Scope |
|---|---|
| GitHub | `repo`(私库)或 `public_repo`(仅公库) |
| Gitea | `read:repo`、`write:repo` |
| GitLab | `api`(全)或 `read_repository` + `write_repository` |

## 加密存储

| 位置 | 什么 |
|---|---|
| DB 列 | `git_hosts.token_encrypted`(AES-GCM,密钥来自 `OPENDRAY_SECRETS_KEY`) |
| 运行时 | 仅在用时解到内存;永不记日志 |
| 备份 | 加密备份里包括(见 [backup/overview](../backup/overview)) |

## 使用方

| 功能 | 怎么用 |
|---|---|
| 笔记 vault 同步 | 用配的 PAT 推到 host |
| Sessions Git tab — Push | 同 |
| Sessions Git tab — PR 列表/创建/合并 | host API 用配的 token |
| Sessions Git tab — Checks 轮询 | host commit-status API |
