---
kind: capability
title: Git host adapters
tldr: GitHub / Gitea / GitLab integrations — PAT or OAuth. Used by Notes vault sync, Sessions Git tab, PR commands. Per-host scope. Stored encrypted at rest.
status: stable
since: v0.1.0
topic: plugins
related: [plugins/overview, sessions/git-workflow, notes/vault-git-sync]
capability: [github, gitea, gitlab, pat-auth, oauth-auth, encrypted-storage]
inbound: settings
outbound: git
x-implementation: [internal/git/adapter/]
---

# Git host adapters

> **tldr:** GitHub / Gitea / GitLab integrations — PAT or OAuth. Used by Notes vault sync, Sessions Git tab, PR commands. Per-host scope. Stored encrypted at rest.

## Supported hosts

| Host | Auth methods | API base |
|---|---|---|
| GitHub | PAT (recommended), OAuth app | `https://api.github.com` |
| Gitea | PAT, OAuth | self-hosted URL |
| GitLab | PAT, OAuth | `https://gitlab.com` or self-hosted |
| Bitbucket | ✗ not supported | — |

## Register

| # | Action |
|---|---|
| 1 | Settings → Git hosts → **+ Add host** |
| 2 | Pick host kind + name (`my-github`, `work-gitea`) |
| 3 | Method: PAT or OAuth |
| 4 | For PAT: paste token; for OAuth: complete the dance |
| 5 | Pick scopes (see below) |

## Required PAT scopes

| Host | Scopes |
|---|---|
| GitHub | `repo` (private) or `public_repo` (public only) |
| Gitea | `read:repo`, `write:repo` |
| GitLab | `api` (full) or `read_repository` + `write_repository` |

## Stored encrypted

| Where | What |
|---|---|
| DB column | `git_hosts.token_encrypted` (AES-GCM, key from `OPENDRAY_SECRETS_KEY`) |
| At runtime | decrypted to memory only when used; never logged |
| Backup | included in encrypted backup (see [backup/overview](../backup/overview)) |

## Used by

| Feature | How |
|---|---|
| Notes vault sync | pushes to host using configured PAT |
| Sessions Git tab — Push | same |
| Sessions Git tab — PR list/create/merge | host API via configured token |
| Sessions Git tab — Checks polling | host commit-status API |

## Capabilities

| feature | supported |
|---|---|
| Multiple hosts | ✓ (e.g. one work, one personal) |
| OAuth refresh | ✓ (auto on expiry) |
| Per-vault host override | ✓ |
| Token expiry warning | ✓ (UI banner ≤ 7d) |
| Org-level GitHub apps | ✗ (PAT or user OAuth only) |

## Errors

| code | when | fix |
|---|---|---|
| `git_host_auth_failed` | bad / expired token | re-add PAT or re-run OAuth |
| `git_host_insufficient_scope` | PAT missing required scope | re-mint with proper scopes |
| `git_host_rate_limited` | API quota | wait; respect `X-RateLimit-Reset` |
