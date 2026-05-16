# 内置供应商

opendray 自带最常见的 AI 编程 CLI 的 manifest。下面每个章节
讲第一次拉起对应供应商时该有什么预期。

## Claude Code

| 字段 | 值 |
|---|---|
| 供应商 id | `claude` |
| 默认 executable | `claude`(通过 `$PATH` 解析)|
| 默认参数 | 无 |
| 多账号支持 | 是 — 见 [Claude 账号](#providers-claude-accounts) |
| JSONL transcript | 是 — opendray 读它来填充通道通知 |
| Privileged intents | 不适用 |

注意事项:

- Claude Code 在
  `~/.claude/projects/<encoded-cwd>/<session-id>.jsonl` 存
  per-cwd 的 transcript。opendray 直接读这个文件来填充通知
  片段 — 不需要屏幕抓取。
- `--continue` 标志会在 cwd 里恢复最近一次对话。在拉起对话框
  的 *Args* 字段里加上它,可以从你上次停下的地方继续。
- 权限模式(`bypass permissions` 等)是 Claude TUI 的特性 —
  opendray 的 chrome 过滤会从通知片段里剥掉提示横幅,但
  不会改变底层行为。

## Codex

| 字段 | 值 |
|---|---|
| 供应商 id | `codex` |
| 默认 executable | `codex` |
| 默认参数 | 无 |
| 多账号支持 | 每个环境一组凭据(没有 per-session 绑定)|
| JSONL transcript | 否 — opendray 用屏幕快照做通知 |

注意事项:

- Codex 用自己的 JSON-RPC 协议处理工具调用;opendray 把它
  当作一个不透明的 CLI,只通过 PTY 中继字节。
- 免费层有速率限制;如果 Codex 返回 "rate limit exceeded",
  它会在终端里显现出来,opendray 不会拦截它。

## Gemini CLI

| 字段 | 值 |
|---|---|
| 供应商 id | `gemini` |
| 默认 executable | `gemini` |
| 默认参数 | 无 |
| 多账号支持 | 基于环境变量 |
| JSONL transcript | 否 |

注意事项:

- Gemini 的免费配额每天重置;如果一个会话开始报 429,去
  配额仪表盘看一下。
- 它的交互提示符更像 shell,不像 Claude 的 TUI;chrome 过滤
  在这里是空操作(没东西可剥)。

## 纯 shell

如果你想要一个普通的 shell 会话(没有 AI),你可以注册一个
指向 `bash` / `zsh` / `fish` 的自定义供应商(见
[自定义供应商 manifest](#providers-custom))。opendray 一视同仁 —
同样的 PTY、同样的空闲检测、同样的环形缓冲。

当你需要在 opendray 主机上快速来一个交互式会话又不想 SSH
进去的时候,挺有用。
