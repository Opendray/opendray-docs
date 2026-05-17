---
kind: concept
title: Notifications 面板
tldr: 按 channel 控制 — 哪些会话事件触发(started / idle / ended / permission_ask)、多久一次(repeat 策略)、带什么内容(终端 snippet)。
status: stable
since: v0.1.0
topic: channels
related:
  - channels/overview
  - channels/routing
references:
  capabilities: [channels]
x-implementation:
  - internal/channel/notify.go
  - internal/channel/snippet.go
---

# Notifications 面板

> **tldr:** 按 channel 控制 —— 哪些会话事件触发(`session.started` / `idle` / `ended` / `permission_ask`)、多久一次(repeat 策略)、带什么内容(终端 snippet)。

## 是什么

每个非 bridge channel 在 **Edit channel** 对话框里都有 Notifications
面板。每 channel 独立配置 3 件事:

| 控制项 | 决定 |
|---|---|
| Notify-on(事件开关) | 哪些事件触发通知 |
| Repeat policy | 在窗口内压制重复 |
| Terminal snippet | 通知里嵌入最近 CLI 输出 |

## 事件开关

| 事件 | 默认 | 触发时机 |
|---|---|---|
| `session.started` | OFF | session 创建 |
| `session.idle` | ON | 配置时长无输出(默认 30s) |
| `session.ended` | ON | session 进程退出 |
| `session.permission_ask` | ON | CLI 请求权限(Claude `--bypass-permissions=off`) |

面板里勾选。全部 uncheck → 该 channel 不发出站(但仍收入站回复)。

## Repeat 策略

| 模式 | 行为 | 适用场景 |
|---|---|---|
| `once-per-session`(默认) | 每个 `(channel, topic, session)` 三元组触发一次;session 结束 / 回复 / 24h TTL 重置 | 单人用 —— Claude spinner 引起的多次 active→idle 合并成每轮一条 |
| `time-window` | 窗口内压制重复:`1m / 5m / 15m / 30m / 60m` | 长跑部署 —— 周期 check-in |
| `always` | 无压制 | 低流量 channel 或调试 |

```yaml
repeat_policy: once-per-session       # 默认
# 或
repeat_policy: time-window
repeat_window: 5m                     # 1m | 5m | 15m | 30m | 60m
# 或
repeat_policy: always
```

## 终端 snippet

启用后,idle / permission-ask 通知会嵌入最近 CLI 输出。

```yaml
snippet:
  enabled:   true           # 默认 false
  max_lines: 10             # 默认 10,范围 [1, 200]
  max_chars: 0              # 0 = 不限(默认);1000 | 3000 | 6000 | 12000
```

### Snippet 来源(按 CLI)

| CLI | Snippet 来源 | 实现 |
|---|---|---|
| Claude(claude code) | `~/.claude/projects/<encoded-cwd>/<latest>.jsonl` 最后一轮 | `internal/channel/snippet/claude.go` |
| Codex / Gemini / Shell | vt10x 虚拟终端(等价于 live 网页终端) | `internal/channel/snippet/vt.go` |

Claude TUI 装饰(model bar、"bypass permissions" 提示、状态 spinner、
分隔线)在渲染前通过正则剥离。

### 各平台渲染方式

| 平台 | 渲染为 | 备注 |
|---|---|---|
| Telegram | HTML 模式 | 粗 / 斜 / 代码 / 引用 / 标题正常,表格变 vertical key:value |
| Slack | `mrkdwn` Block | `*粗体*` 单星号,无标题 |
| Discord | embed `description` | 4096 字符上限 |
| Feishu | Card v2 markdown(`lark_md`) | |
| DingTalk | actionCard markdown | 子集受限 |
| WeCom | markdown 子集 | 无表格、无围栏代码、无标题 |
| Bridge | adapter 自定义 | |

## 聊天端静音

| 命令 | 效果 |
|---|---|
| `/notify off` | 设 `muted: true`,dispatch loop 跳过 |
| `/notify on` | 清除 flag |

比开后台快,临时静音用得上。重启后仍生效。

## Capabilities

| 能力 | 支持 | 备注 |
|---|---|---|
| 按事件开关 | ✓ | 当前 4 个事件类型 |
| once-per-session 去重 | ✓ | session 结束 / 回复 / 24h TTL 重置 |
| time-window 去重 | ✓ | 预设窗口 1m–60m |
| 从 Claude 会话日志取 snippet | ✓ | 最丰富的输出 |
| 从 vt10x 取 snippet | ✓ | 非 Claude CLI 用 |
| 聊天内静音 | ✓ | `/notify off` |

<details>
<summary>📖 叙事说明</summary>

最常被问的控制项是 **repeat policy**。默认 *once-per-session* 存在
的原因是 CLI 工具(Claude 的 "thinking" spinner、代码 streaming)
在一轮实际对话里会引起多次 active→idle 转换。*Once* 模式把它们合
并成每轮一条 —— 几乎总是你想要的。

24 小时安全 TTL 存在的原因是:长期 idle 的 session(过夜跑)不能永
久压制通知。如果 25 小时后发生了真正值得关注的事,你能收到。

snippet 默认 *不限*,因为 Telegram 自动把长内容拆成多条消息,action
按钮挂在最后一条。其他平台按平台限制裁切(DingTalk 20 KB、Discord
4096 字符 embed)。如果你想短通知(用噪音 channel 时只想扫一眼),
选字符上限 —— 截断的内容显示 `[…]` 前缀标记。

</details>
