---
kind: capability
title: Claude 账号
tldr: 多账号 Claude — 每账号一个 ~/.claude-accounts/<name>/ 目录。opendray 按 spawn 设 CLAUDE_CONFIG_DIR。会话 / 记忆 / 笔记 / 频道跨账号共享,只有 OAuth 身份是 per-账号。
status: stable
since: v0.1.0
topic: providers
related:
  - providers/overview
  - providers/bundled
capability:
  - multi-account
  - filesystem-watched
  - mid-session-swap
inbound: filesystem-watch
x-implementation:
  - internal/catalog/claude_account.go
  - internal/catalog/claude_account_import.go
---

# Claude 账号

> **tldr:** 多账号 Claude —— 每账号一个 `~/.claude-accounts/<name>/` 目录。opendray 按 spawn 设 `CLAUDE_CONFIG_DIR`。会话 / 记忆 / 笔记 / 频道跨账号共享,只有 OAuth 身份是 per-账号。

## 共享矩阵

| 面 | 按账号? | 跨所有账号共享? |
|---|---|---|
| OAuth 凭据 | ✓ — `<dir>/.claude/.credentials.json` | ✗ |
| 模型默认 | ✓ — `CLAUDE_CONFIG_DIR` 级 | ✗ |
| Anthropic 计费身份 | ✓ | ✗ |
| 会话列表 & 状态 | ✗ | ✓ — `sessions` 表 |
| 记忆(pgvector) | ✗ | ✓ — global / project / session scope |
| 笔记 vault | ✗ | ✓ — 网关单一 vault |
| Channels(Slack / 飞书 / ...) | ✗ | ✓ — 网关级 |
| Integrations | ✗ | ✓ — 网关级 |
| Backups / schedules | ✗ | ✓ — 网关级 |

**设计观点:** 账号 = 认证身份,不是 sandbox。切换账号只换下一个
API 调用的身份。

## Setup

| # | 操作 | 在哪 |
|---|---|---|
| 1 | 选 slug(`work`、`personal`、`labs`) | 网关主机 shell |
| 2 | `mkdir -p ~/.claude-accounts/<slug>` | 网关主机 shell |
| 3 | `CLAUDE_CONFIG_DIR=~/.claude-accounts/<slug> claude login` → 浏览器 OAuth | 网关主机 shell |
| 4 | opendray **Providers → Claude accounts → Import local**(或等文件系统 watch) | opendray 后台 |

每个账号重复:

```bash
for n in personal work labs ; do
  mkdir -p "$HOME/.claude-accounts/$n"
  CLAUDE_CONFIG_DIR="$HOME/.claude-accounts/$n" claude login
done
```

## Config schema

```yaml
# 账号从文件系统隐式发现,opendray 侧不需要配置
# 会话级绑定写在 session 行:
session:
  provider: claude
  claude_account_id: "work"                 # ~/.claude-accounts/ 下的文件名 slug
```

## Capabilities

| 特性 | 支持 | 实现 |
|---|---|---|
| 多账号 Claude | ✓ | 基于文件系统;`CLAUDE_CONFIG_DIR` env 注入 |
| 会话中切换账号 | ✓ | SIGTERM + 干净重启,新 env,同 session_id |
| 文件系统 watch | ✓ | `~/.claude-accounts/` 新目录自动 import |
| 手动强制 sync | ✓ | `POST /api/v1/claude-accounts/import-local` |
| Codex / Gemini 多账号 | ✗ | 用 env-based 配置或封进自定义 provider |
| token 粘到表单 | ✗ | 故意没有(见下) |

## 绑定 & 切换

| 操作 | 效果 |
|---|---|
| Spawn 对话框 → **Claude 账号** 下拉(provider=claude 时显示) | 为本次 spawn 设 `CLAUDE_CONFIG_DIR`;持久化到 session 行 |
| Sessions 页 → 终端面板 → **账号切换器**(终端右上) | SIGTERM → 干净退出 → 同 provider/args/cwd 用新 env 重启 |
| 切换中途 | session id 不变;终端内容重置;记忆 / 笔记 / 历史保留 |
| 已结束会话重启 | 复用持久化的 `claude_account_id` |

## Errors

| code | http | 原因 | 修复 |
|---|---|---|---|
| `claude_account_not_bound` | 400 | session 的 `claude_account_id` 已不存在 | 在 spawn 对话框重选 |
| `claude_account_dir_missing` | 503 | 运行中 session 的目录被删 | 恢复目录或重绑 session |
| `claude_account_credentials_invalid` | 401 | OAuth token 撤销 / 文件坏 | 对该 slug 重新 `claude login` |
| `claude_account_name_invalid` | 400 | slug 含 `/`、`..` 或非可打印字符 | 只用 `[a-z0-9-]+` |

## Limitations

| 限制 | 值 | 备注 |
|---|---|---|
| 支持的 provider | 只有 claude | codex / gemini 用 per-spawn env 变量 |
| 账号名正则 | `[a-z0-9-]+` | 沙箱限定到 `~/.claude-accounts/<name>/` |
| 隔离 | 仅逻辑 | sessions / 记忆 / 笔记共享 —— 需要硬隔离要跑两个 gateway |
| token 粘到表单 | 不支持 | Anthropic API 没暴露 refresh endpoint;粘的 token 一小时就失效 |

<details>
<summary>📖 叙事说明</summary>

### 工作示例

三个 session,共享笔记 vault + 记忆库:

```
session-A   provider=claude   account=personal
session-B   provider=claude   account=work
session-C   provider=codex                       (没账号绑定)
```

session-A 在 `project:my-app` scope 写的记忆,session-B 下次
`memory.search` 调用时能看到 —— 即使它们是不同的 Anthropic 身份。
session-C 写的笔记三个 session 的 inspector 都能看到。"账号" 边界
故意在 opendray 数据模型里不存在,只在 OAuth 层。

如果你真的需要两个账号硬隔离(笔记隔离 + 记忆隔离),在不同端口跑
两个 opendray 网关,各自一个数据库。

### 为什么没有"添加账号"表单

早期版本有 **+ 添加账号** 跟 **Import local** 并列。被移除是因为
Web 表单粘 OAuth token 创出来的账号 opendray 无法 refresh(公开
Anthropic API 不含 refresh endpoint),账号一小时就失效。强制走主机
shell 的 `claude login` 流程保持了诚实:面板里每个账号都是 Claude
Code 自己在管的。

如果有真实需求要程序化 seed(比如 CI pipeline 用一次性短 token),
底层 API 端点还在:

- `POST /api/v1/claude-accounts` — 建行
- `PUT /api/v1/claude-accounts/{id}/token` — 写 token 文件

故意不在 UI 暴露。

### Import-local 适用 / 不适用场景

| 适用 | 不适用 |
|---|---|
| 裸机网关 | 没 bind-mount `$HOME` 的 Docker 容器 |
| 操作者 home 可达的 LXC | 远程管的网关你没 shell |
| 开发环境 | 移动端(故意 web-only) |

如果 `Import local` 说"无要 import 的"但行没出现,网关 runtime 里
的 `$HOME` 大概是空的。用 `docker exec` / `pct exec` 确认,调整
volume mount。

</details>
