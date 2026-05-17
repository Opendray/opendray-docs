---
kind: capability
title: 内置 providers
tldr: 每个 CLI 的参考。claude(anthropic,JSONL + 多账号 + MCP)、codex(openai,opaque PTY)、gemini(google,env 认证)、shell($SHELL 兜底)。
status: stable
since: v0.1.0
topic: providers
related:
  - providers/overview
  - providers/custom
  - providers/claude-accounts
capability:
  - claude
  - codex
  - gemini
  - shell
x-implementation:
  - internal/catalog/builtins/claude.json
  - internal/catalog/builtins/codex.json
  - internal/catalog/builtins/gemini.json
  - internal/catalog/builtins/shell.json
---

# 内置 providers

> **tldr:** 每个 CLI 的参考。`claude`(anthropic,JSONL + 多账号 + MCP)、`codex`(openai,opaque PTY)、`gemini`(google,env 认证)、`shell`(`$SHELL` 兜底)。

## 一览

| Provider id | 厂商 | 二进制 | 多账号 | JSONL transcript | MCP | 备注 |
|---|---|---|---|---|---|---|
| `claude` | Anthropic | `claude` | ✓ | ✓(`~/.claude/projects/`) | ✓ | 主 provider;配置最深 |
| `codex` | OpenAI | `codex` | 仅 env | ✗ | ✗ | screen snapshot 做通知 |
| `gemini` | Google | `gemini` | 仅 env | ✗ | ✗ | 注意免费 quota |
| `shell` | system | `$SHELL` | n/a | ✗ | ✗ | 不是 AI —— 普通交互 shell |

## `claude` — Claude Code

| 字段 | 值 |
|---|---|
| `command` | `claude`(`$PATH` 解析) |
| `default_args` | 无 |
| 多账号 | ✓ 见 [Claude accounts](./claude-accounts) |
| Transcript | `~/.claude/projects/<encoded-cwd>/<session-id>.jsonl` |
| `runtime_options.bypass_permissions` | bool,默认 `false`(传 `--bypass-permissions`) |
| `runtime_options.max_turns` | int,默认 `0`(不限) |
| `runtime_options.skills` | bool,默认 `true`(opendray skill 自动注入) |
| 通知来源 | 读 JSONL 最后一轮(assistant text + tool calls + results) |
| TUI chrome 过滤 | 剥除 model bar、"bypass permissions" 提示、状态 spinner、分隔线 |
| 恢复 | `--continue` 恢复 cwd 内最近对话 |

## `codex` — Codex CLI

| 字段 | 值 |
|---|---|
| `command` | `codex` |
| `default_args` | 无 |
| 认证 | env-based(`OPENAI_API_KEY`);每 env 一份凭据 |
| Transcript | 无 — opendray 用 vt10x screen snapshot |
| Tool use | OpenAI JSON-RPC;opendray 当 opaque PTY |
| 通知来源 | vt10x 最后 N 行 |
| TUI chrome 过滤 | 空操作(codex shell 风格,无可剥) |
| 限流 | free-tier — 超限在终端显示 |

## `gemini` — Gemini CLI

| 字段 | 值 |
|---|---|
| `command` | `gemini` |
| `default_args` | 无 |
| 认证 | env-based(`GOOGLE_API_KEY`) |
| Transcript | 无 |
| 通知来源 | vt10x snapshot |
| TUI chrome 过滤 | 空操作 |
| 日 quota | UTC 午夜重置;429 时检查 Gemini dashboard |

## `shell` — 普通 shell

| 字段 | 值 |
|---|---|
| `command` | `$SHELL` |
| `default_args` | `-l`(login shell) |
| AI | ✗ — 非 AI provider |
| 用途 | 在 opendray 主机上快速起交互 shell,不用 SSH |
| 行为 | 跟 AI provider 一样的 PTY / idle 检测 / ring buffer |

## Errors

| code | http | 原因 | 修复 |
|---|---|---|---|
| `provider_unavailable` | 503 | 二进制不在 PATH 或不可执行 | 装上,或在 provider 配置里写绝对路径 |
| `provider_disabled` | 400 | DB override 里 `enabled: false` | 在 Providers 页打开 |
| `claude_account_not_bound` | 400 | spawn 选的 Claude 账号已不存在 | 在 spawn 对话框重选账号 |

<details>
<summary>📖 叙事说明</summary>

Claude 是配置最深的 provider 因为它是主要那个。其他 provider 用
单一凭据集合,来自环境变量,没有 per-session 绑定 —— 大多数场景够
用但没那么灵活。

Codex 用自己的 JSON-RPC 协议做 tool use;opendray 当 opaque CLI,
只透传 PTY 字节。free-tier 限流会直接出现在终端 —— opendray 不拦截。

Gemini 日 quota 重置 —— 429 时去 Google AI Studio 看。交互 prompt
比 Claude 的 TUI 更 shell 化,chrome 过滤是 no-op。

要普通 shell 会话(无 AI),注册 `shell` 或自定义 provider 指向
`bash` / `zsh` / `fish` —— 同样的 PTY、idle 检测、ring buffer。
需要快速远程 shell 时有用,不用 SSH。

</details>
