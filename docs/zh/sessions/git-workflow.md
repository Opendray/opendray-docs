---
kind: endpoint
title: Git 工作流
tldr: Inspector Git tab = 自包含 PR 命令中心。切分支 / 暂存 / commit / push / PR 创建 / 合并 / check 状态 — 全程不离开 opendray。端点在 /api/v1/git/。
status: stable
since: v0.1.0
topic: sessions
related:
  - sessions/inspector
  - sessions/mobile-git
  - plugins/git-hosts
operations:
  - operationId: gitStatus
    method: GET
    path: /api/v1/git/status
    summary: Working tree + branch summary
    tags: [git]
    x-required-scope: session:read
  - operationId: gitCheckout
    method: POST
    path: /api/v1/git/write/checkout
    summary: Switch branch (optional auto-stash)
    tags: [git]
    x-required-scope: session:write
  - operationId: gitCommit
    method: POST
    path: /api/v1/git/write/commit
    summary: Create a commit
    tags: [git]
    x-required-scope: session:write
  - operationId: gitListPRs
    method: GET
    path: /api/v1/git/prs
    summary: List PRs for the cwd's remote
    tags: [git]
    x-required-scope: session:read
x-implementation:
  - internal/git/
  - app/web/src/features/inspector/git/
---

# Git 工作流

> **tldr:** Inspector Git tab = 自包含 PR 命令中心。切分支 / 暂存 / commit / push / PR 创建 / 合并 / check 状态 —— 全程不离开 opendray。端点在 `/api/v1/git/`。

## tab 何时渲染

| Cwd | 结果 |
|---|---|
| 在 git repo 内 | 完整 tab |
| `git rev-parse` 失败 | "not a git repo" 空状态 |

## 状态头

| 元素 | 来源 |
|---|---|
| 当前分支 + upstream | `git rev-parse --abbrev-ref` + `for-each-ref` |
| Ahead / behind 计数 | `git rev-list --count` |
| 工作树摘要 | staged / unstaged / untracked 计数(可点) |
| "no upstream" 状态 | 首次 Push 用 `--set-upstream` |

## 分支操作

| 元素 | API |
|---|---|
| 分支下拉 | `GET /git/write/branches` → 通过 `POST /git/write/checkout` 切换 |
| **+ New** | `POST /git/write/branches` 创建 + checkout |
| **Push** | `POST /git/write/push`(首次 `--set-upstream`) |
| 禁用条件 | ahead == 0 && upstream 已设 |

### Stash & switch(自动恢复)

| # | 步骤 |
|---|---|
| 1 | 脏树 checkout → 服务端返回 **409 Conflict** + `dirty_files: [...]` |
| 2 | UI 显示 Sonner toast:`Uncommitted changes block switch to <branch>` + `[ Stash & switch ]` |
| 3 | 点 → 重试 `{ "stash": true }` |
| 4 | 服务端跑 `git stash push --include-untracked -m "opendray-auto: switch to <name>"` |
| 5 | checkout 成功 → toast 显示 stash 短 ref:`Switched to main (stashed as abc1234)` |
| 6 | 之后用 `git stash pop` / `git stash apply` 恢复 |

## 暂存 + commit

| 单行 | 批量 |
|---|---|
| Stage / Unstage(一文件) | Stage all = `git add .` |
| Diff(只读侧抽屉) | Unstage all = `git reset` |

Commit 表单:

| 字段 | 行为 |
|---|---|
| Message | 多行;`Cmd/Ctrl + Enter` 提交 |
| Commit 按钮 | ≥1 文件 staged 才启用;live 计数徽章 |
| 成功后 | 清空表单;刷新状态;新 HEAD 出现在 log strip |

## Pull request

GitHub / Gitea / GitLab 同一接口 —— gateway 归一化。

### 列表

| 默认 | 当前 remote 的开 PR |
|---|---|
| 切换 | Open / Closed / All |
| 每行 | `#NN`(链接)· 标题 · 作者 · `head → base` · 聚合 check 胶囊 |
| 点行 | 原地展开 → 揭示 Checks + Merge 表单 |

### 创建

| 字段 | 默认 |
|---|---|
| Title | 最后 commit subject |
| Body | 多行 |
| Head | 当前分支(只读) |
| Base | host 默认分支(API 解析) |

提交 → 创建 PR,新行出现在顶部,展开。

### 合并

| 方法 | Flag | 何时用 |
|---|---|---|
| Merge commit | `--merge` | 保留 merge 历史 |
| Squash | `--squash` | 一 commit 一 PR(推荐) |
| Rebase | `--rebase` | 慎用;丢 merge 锚 |
| Delete branch on merge | 复选框 | 默认 ON |

### Checks(归一化词汇)

| 状态 | 含义 |
|---|---|
| `success` | 无错完成 |
| `failure` | 跑了但失败 |
| `pending` | 排队或运行中 |
| `neutral` | 完成但无 pass/fail 判定 |
| `cancelled` | 完成前被杀 |
| `skipped` | workflow 条件跳过 |

聚合:任何 `failure` → `failure`;任何 `pending` → `pending`;否则
`success`。30s polling。

## 后端路由

| Method | Path | 用途 |
|---|---|---|
| GET | `/git/status` | 工作树 + 分支摘要 |
| GET | `/git/log` | HEAD 最近 commit |
| GET | `/git/write/branches` | 所有分支(local + remote ref) |
| POST | `/git/write/branches` | 创建 + 可选 checkout |
| DELETE | `/git/write/branches` | 删除(`?name=`、`?force=`) |
| POST | `/git/write/checkout` | 切分支;`{ "stash": true }` 自动 stash |
| POST | `/git/write/stage` / `/unstage` | 索引操作 |
| POST | `/git/write/commit` | 创建 commit |
| POST | `/git/write/push` | 首次 `--set-upstream` |
| GET | `/git/prs` | 列 PR |
| POST | `/git/prs` | 创建 |
| POST | `/git/prs/{n}/merge` | 合并(带方法选项) |
| GET | `/git/prs/{n}/checks` | 归一化 check runs |

## Errors

| 消息 | 原因 | 修复 |
|---|---|---|
| `fatal: not a git repository` | cwd 未追踪 | tab 回到 "not a git repo" 空状态 |
| `Permission denied (publickey)` 在 push | git 凭据无写权限 | 检查 **Settings → Git hosts** 里的 PAT |
| `branch '<name>' not fully merged` 在删除 | safe-delete 拒绝 | toast 提供 force-delete → `git branch -D` |
| `409 Conflict` 在 checkout | 脏树 | 用 Stash & switch 按钮 |
