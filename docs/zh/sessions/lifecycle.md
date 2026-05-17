---
kind: concept
title: 会话生命周期
tldr: STARTING → RUNNING ↔ IDLE → STOPPED / ENDED / FAILED。Idle = N 秒无输出(默认 30s),进程仍活。Restart 用同 provider/cwd/args 在新 session id 下重 spawn。
status: stable
since: v0.1.0
topic: sessions
related:
  - sessions/overview
  - sessions/spawning
  - channels/notifications
references:
  capabilities: [sessions]
x-implementation:
  - internal/session/state.go
  - internal/session/reconcile.go
---

# 会话生命周期

> **tldr:** `STARTING → RUNNING ↔ IDLE → STOPPED / ENDED / FAILED`。**Idle** = N 秒无 stdout(默认 30s),进程仍活。**Restart** 用同 provider / cwd / args 在新 session id 下重 spawn。

## 状态机

| 状态 | 含义 | 你能做什么 |
|---|---|---|
| `STARTING` | DB row 已插入,PTY 正在 spawn | 等 —— 通常 <500ms |
| `RUNNING` | 进程活,最近有 stdout 活动 | 在终端里输入 |
| `IDLE` | 进程活,沉默 ≥30s(可配) | 正常回复;idle 只是信号 |
| `STOPPED` | 操作员点 ✕ → SIGTERM → 进程退 | 看 scrollback;Restart 在同 id 下重启 |
| `ENDED` | 进程自己退 | 看 scrollback;Restart 重启 |
| `FAILED` | 启动或运行时错误,未正常退 | 看日志;通常要改配置 |

## 转换

```
STARTING ─→ RUNNING ─→ IDLE
              ↑          │
              └──────────┘  (CLI 下一个字节)
              │          │
              ├──→ ENDED ←┤  (CLI 自己退)
              │
              └──→ STOPPED   (操作员 ✕ → SIGTERM → 3s 后 SIGKILL)

STARTING ─→ FAILED          (cmd.Start 错)
```

## Idle 语义

| 方面 | 值 |
|---|---|
| 默认阈值 | 30s 无 stdout |
| Watcher poll 间隔 | 5s |
| 配置 key | `[session].idle_threshold` / `[session].idle_poll_interval` in `config.toml` |
| Idle 时行为 | 发 `session.idle` 到 event bus;状态徽章变黄 |
| 下个字节时行为 | 发 `session.running`;状态徽章变绿 |
| Channels 转发 | 按 [Notifications 面板](../channels/notifications) 的 `repeat_policy` |

## 停止模式

### 操作员停止(✕ 按钮)

| # | 步骤 |
|---|---|
| 1 | 发 `SIGTERM` |
| 2 | 等 3 秒 |
| 3 | 还活就 `SIGKILL` |
| 4 | 状态 → `STOPPED`;ring buffer 保留 |

### 自己退

| 原因 | 状态 | exit_code |
|---|---|---|
| `q` / `Ctrl-D` / `exit 0` | `ENDED` | `0` |
| 脚本 `exit 1` | `ENDED` | `1` |
| panic | `ENDED` | `1`(或被信号杀的 code) |
| segfault | `ENDED` | `139` |

`exit_code != 0` 时,channel `session.ended` 卡片渲染 **红色**。

### opendray 重启时 reconcile

| 触发 | 结果 |
|---|---|
| opendray 二进制重启 | 非终态行 → `ENDED`,原因 `"previous gateway process exited; PTYs gone"` |
| 主机重启 | 同上 |
| 启动日志 | `INFO reconciled stale sessions on startup count=N` |

PTY 不能在父进程死亡后存活,行如实标记。

## 从 stopped/ended 重启

Restart 按钮(在 stopped/ended tabs 上)用以下相同字段重跑 spawn:

| 保留 | 新 |
|---|---|
| `provider_id` | `session_id` |
| `cwd` | |
| `args` | |
| `claude_account_id` | |
| `parent_session_id` | |

旧行留在 DB 做审计。Inspector linked note 跟到新 session,因为它按
文件路径 key,不按 session id。

## 关闭 vs 删除

| 动作 | 效果 |
|---|---|
| ✕ 在 ended tab 上 | 视觉上关 tab;DB row 保留(在 Sessions History 过滤器里能找到) |
| `DELETE /api/v1/sessions/<sid>` | 真删除 DB 行 |

Web admin 故意不暴露破坏性删除按钮 —— 误点会丢失审计上下文。

```bash
curl -X DELETE -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:8770/api/v1/sessions/<sid>
```

## Errors

| code | http | 原因 | 修复 |
|---|---|---|---|
| `session_terminated` | 410 | 向已 ended/stopped 会话发输入 | 先 restart 或新会话 |
| `session_failed_to_start` | 500 | `cmd.Start` 错 | 检查 provider 配置 + 日志 |
