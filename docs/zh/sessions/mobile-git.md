---
kind: capability
title: 移动端 Git 工作流
tldr: Flutter app 以触摸优先布局镜像 web Git tab。底部 sheet 分支选择器、stage-all 提交、polling 频率为移动 radio 调优。同一组 gateway 路由。
status: stable
since: v0.1.0
topic: sessions
related:
  - sessions/git-workflow
  - sessions/inspector
capability:
  - branch-checkout
  - stash-and-switch
  - commit
  - push
  - pr-list-create-merge
  - check-polling
x-implementation:
  - app/mobile/lib/features/git/
---

# 移动端 Git 工作流

> **tldr:** Flutter app 以触摸优先布局镜像 [web Git tab](./git-workflow)。底部 sheet 分支选择器、stage-all 提交、polling 频率为移动 radio 调优。同一组 gateway 路由。

## 入口

**Session 详情 → Git tab**(inspector 页顶部第二个 pill)。

## 状态 pane

| 元素 | 来源 |
|---|---|
| 当前分支 + upstream | `GET /git/status` |
| Ahead / behind 计数 | 同上 |
| 工作树文件数 | 同上 |
| 点工作树行 | 展开到文件列表 |

## 分支选择器(底部 sheet,75% 视口)

| Section | 列出 |
|---|---|
| **Local** | 所有 `refs/heads/*`;当前置顶带 ✓;其余按字母 |
| **Remote** | 所有 `refs/remotes/<remote>/*` 除 HEAD symref;点 → checkout 同名 local |

| 点击 | 动作 |
|---|---|
| 行 | checkout 该分支 |
| 垃圾桶图标 | 删分支(在当前分支上禁用) |
| chip 行 "+ New" / "Push" | 一键常用操作 |

### Stash & switch

| # | 步骤 |
|---|---|
| 1 | 脏树点分支 → 服务端 409 + `dirty_files` |
| 2 | AlertDialog 显示文件列表(滚动,等宽) |
| 3 | **Cancel** = 不动树 / **Stash & switch** = `git stash push --include-untracked` + checkout |
| 4 | Snackbar:`Switched to <name> (stashed as abc1234)` |
| 5 | 终端恢复:`git stash pop` |

### 删除带 force 回退

| 默认 | `-d`(安全) |
|---|---|
| "not fully merged" 时 | 第二个 AlertDialog:`Force delete? Branch is not fully merged. Forcing deletion will lose any commits unique to this branch.` |
| 确认 | 升级为 `-D` |

两步 gating 防误操作。

## Commit 表单

| 字段 | 移动行为 |
|---|---|
| 单文件 stage UI | ✗(无 hover 目标)—— 用 web 或终端做精细索引控制 |
| **Stage all** 按钮 | 可用 |
| 多行 message | 软键盘暴露 Enter 按钮 |
| **Commit** 按钮 | staged 前禁用 |
| 成功后 | 刷新文件列表 + 状态头 |

## Pull request

| 元素 | 行为 |
|---|---|
| PR 列表 | 开 PR,60s polling |
| **+ Create** | 底部 sheet 表单(title / body / base 默认分支解析) |
| 点 PR 行 | 内联展开 → checks(展开时 30s polling)+ merge 表单 |
| Merge 方法 | merge / squash / rebase |
| Delete branch on merge | 复选框,默认 ON |

## Polling 频率

| 来源 | 频率 | 停止时机 |
|---|---|---|
| 分支列表 | 打开时 + 任意分支操作后 | tab unmount |
| 状态 / 文件列表 | 8s | tab unmount |
| PR 列表 | 60s | tab unmount |
| PR checks(展开行) | 30s | 行折叠 |
| 手动刷新 | 列表上下拉 | —— |

移动 polling 比 web 更激进,因为 iOS 还没 event bus 订阅。频率调到
"live" 感而不烧 radio。

## 跟 web 的能力差距

| Web 有 | 移动有 | 这些用 web/终端 |
|---|---|---|
| 单文件 stage / unstage 按钮 | 仅 stage-all | 精细索引控制 |
| Diff 抽屉(点击展开 unified diff) | 仅 porcelain 状态码 | 看 diff |
| Force-with-lease push(opt-in 复选框) | 仅安全 push | `--force-with-lease` |

其他功能(分支、PR、stash & switch 等)都对等。
