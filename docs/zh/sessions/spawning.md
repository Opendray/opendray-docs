---
kind: endpoint
title: 启动会话
tldr: Sessions → + New → 选 provider + cwd +(可选)name / args / claude_account / bypass / parent_session → Spawn。opendray 验证 cwd,fork PTY,首字节(或 500ms 超时)后标记 RUNNING。
status: stable
since: v0.1.0
topic: sessions
related:
  - sessions/overview
  - sessions/lifecycle
  - providers/claude-accounts
operations:
  - operationId: spawnSession
    method: POST
    path: /api/v1/sessions
    summary: Spawn a new CLI session
    tags: [sessions]
    requestBody:
      $ref: '/openapi.yaml#/components/schemas/SpawnRequest'
    responses:
      '201': { $ref: '/openapi.yaml#/components/schemas/Session' }
      '400': { $ref: '/openapi.yaml#/components/responses/Error' }
      '503': { description: provider_unavailable }
    x-required-scope: session:write
    x-rate-limit: { sustained: '2 req/s', burst: 6 }
x-implementation:
  - internal/session/spawn.go
  - internal/gateway/handlers/sessions.go
---

# 启动会话

> **tldr:** **Sessions → + New** → 选 provider + cwd +(可选)name / args / claude_account / bypass / parent_session → **Spawn**。opendray 验证 cwd,fork PTY,首字节(或 500ms 超时)后标记 `RUNNING`。

## 必填字段

| 字段 | 类型 | 校验 |
|---|---|---|
| `provider` | string | 必须是 `enabled` 的 provider id |
| `cwd` | string | `stat()` 预检;不存在 / 不可读时拒绝 |

## 可选字段

| 字段 | 类型 | 默认 | 备注 |
|---|---|---|---|
| `name` | string | cwd basename | tab 标签 |
| `args` | string[] | [] | 在 provider defaults **之后**、bypass flags **之前** 追加 |
| `env` | map\<string, string\> | {} | 合并到进程 env |
| `claude_account_id` | string | (env-based) | 仅 `provider=claude` 时显示 |
| `bypass_autonomy` | bool | false | per-session bypass;provider 特定 flag |
| `parent_session_id` | string | null | 克隆配置;持久化 `parent_session_id` |

## Claude 账号 picker 行为

| 已注册账号数 | picker 显示 | 默认选中 |
|---|---|---|
| 0 | 隐藏 | env `ANTHROPIC_API_KEY` |
| 1 | `Default (env / system)` + 那个账号 | 任一 |
| 2+ | `Default` 移除 | 第一个 `enabled` 账号 |

2+ 账号时强制显式选,因为"回退到 env"通常不是意图。

## Bypass / autonomy 开关

每 provider 的 flag 映射(`bypass_autonomy: true` 时):

| Provider | 开关标签 | 追加 flag |
|---|---|---|
| `claude` | Bypass permission prompts | `--dangerously-skip-permissions` |
| `codex` | Bypass approvals & sandbox | `--dangerously-bypass-approvals-and-sandbox` |
| `gemini` | YOLO mode | `--yolo` |

| 特性 | 行为 |
|---|---|
| spawn 后重置 | 是 —— 下次 spawn 永远是显式 opt-in |
| 跟 provider 默认叠加 | 是 —— provider `bypass: true` 永远 bypass;开关只追加 |
| per-session > provider-saved | 是 —— session 值赢;opendray 丢重复以避免 parser 冲突 |
| Codex `--ask-for-approval never` | 只自动批准 shell exec,**不** 包括 MCP tools —— opendray 用更强的 flag |

## Spawn 生命周期

| # | 步骤 | 状态 |
|---|---|---|
| 1 | 验证 cwd / provider | n/a |
| 2 | 生成 session id,插 DB row | `STARTING` |
| 3 | fork PTY + 跑 provider executable | `STARTING` |
| 4 | 接 stdout pump(ring buffer + WS fanout) | `STARTING` |
| 5 | 进程首字节 | `RUNNING` |
| 6 | 500ms 内无输出 | `RUNNING`(静默启动 OK) |
| 7 | 当前 tab 切到新 session | n/a |

## Errors

| code | http | 原因 | 修复 |
|---|---|---|---|
| `provider_disabled` | 400 | provider `enabled: false` | Providers 页打开 |
| `provider_unavailable` | 503 | 二进制不在 PATH | 装上或写绝对路径 |
| `cwd_invalid` | 400 | 路径不存在或不可读 | 检查路径 / 权限 |
| `claude_account_not_found` | 400 | `~/.claude-accounts/` 里没这个 slug | Import local 或对该 slug 跑 `claude login` |
| `args_invalid` | 400 | args 含不在 allowlist 里的 shell 元字符 | 检查 args —— opendray 不做 shell expand |
