---
kind: concept
title: Providers — 概览
tldr: provider = opendray 能拉起的 CLI 二进制目录定义。内置 4 个(claude / codex / gemini / shell)。运行时可改 exec path / args / env,override 写 DB,叠加在内置 JSON manifest 之上。
status: stable
since: v0.1.0
topic: providers
related:
  - providers/bundled
  - providers/custom
  - providers/claude-accounts
references:
  capabilities: [providers]
x-implementation:
  - internal/catalog/
  - internal/catalog/builtins/
---

# Providers — 概览

> **tldr:** provider = opendray 能拉起的 CLI 二进制目录定义。内置 4 个(`claude` / `codex` / `gemini` / `shell`)。运行时可改 exec path / args / env,override 写 DB,叠加在内置 JSON manifest 之上。

## 是什么

provider 是 opendray 可以拉起的一个 CLI 二进制的目录定义。会话指向
provider id,"原地重启"会用同一份 provider 配置创建新进程。

| Capability JSON | 权威来源 |
|---|---|
| [/capabilities/providers.json](/capabilities/providers.json) | 内置 providers + 自定义 manifest schema |

## 内置

| id | 厂商 | 二进制 | session 恢复 | tool use | MCP |
|---|---|---|---|---|---|
| `claude` | Anthropic | `claude` | ✓ | ✓ | ✓ |
| `codex` | OpenAI | `codex` | ✗ | ✓ | ✗ |
| `gemini` | Google | `gemini` | ✗ | ✓ | ✗ |
| `shell` | system | `$SHELL` | ✓ | ✗ | ✗ |

源:`internal/catalog/builtins/*.json`。

## 每 provider 可编辑字段

| 字段 | 用途 | Override 存储 |
|---|---|---|
| `command` | 绝对路径或 PATH 解析的二进制名 | DB → spawn 时应用 |
| `default_args` | 每次 spawn 在用户 args 前追加 | DB |
| `env` | 合并到进程 env 的额外环境变量 | DB(密文加密) |
| `display_name` + `icon` | spawn 下拉 / tab strip 显示 | DB |
| `cwd_hint` | spawn 对话框 cwd 预填 | DB |
| `enabled` | false 时从 spawn 下拉隐藏 | DB |
| `runtime_options` | per-provider 选项,如 claude 的 `bypass_permissions` / `max_turns` / `skills` | DB |

## 重置为默认

每个 provider 卡片有 **Reset** 按钮 → 丢弃 DB override → 恢复内置
manifest。实验把 provider 搞坏时不用重启 opendray。

## 何时用哪个

| 目标 | 在哪 |
|---|---|
| 配置内置 4 个 CLI 之一 | [bundled](./bundled) |
| 加自定义 CLI(自家 wrapper、小众 LLM CLI) | [custom](./custom) |
| 多账号 Claude(工作 + 个人) | [claude-accounts](./claude-accounts) |

![Providers 页](/tutorial/providers-layout.png)

<details>
<summary>📖 叙事说明</summary>

内置的 JSON manifest 存在 Go 二进制里的 `internal/catalog/builtin/`,
通过 `embed.FS`。Web UI 让你在运行时覆盖字段,不用改源 manifest ——
override 存 DB,叠加在内置默认值之上。

Claude 有额外配置(多账号绑定、`bypass_permissions`、`max_turns`、
`skills`)因为它是主要 provider,也是用户配置最深的。其他 provider
用单一凭据集合,来自环境变量(`OPENAI_API_KEY` / `GOOGLE_API_KEY`)。

</details>
