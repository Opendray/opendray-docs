# Claude 账号

opendray 支持在同一个网关上并行运行多个 Claude 账号 — 比如
一个私人账号、一个工作账号,或者两个不同订阅档位。每个会话
都可以绑定到一个具体的账号;在它们之间切换是一键的操作,
不会扰动网关上的其他东西。

这一页讲架构(账号之间什么是共享的,什么是 per-account 的)、
建立新账号的规范流程,以及 opendray 为什么不提供 "粘贴 token"
表单。

## 架构:什么是共享的,什么不是

每个账号归结到一个文件系统目录,位于
`~/.claude-accounts/<name>/`。Claude Code 在网关给被拉起的
进程设置 `CLAUDE_CONFIG_DIR=<that-path>` 时,会从那个目录
读它的 OAuth 凭据、模型默认值、最近文件缓存。

实际意义:

| 表面           | per-account?                       | 跨所有账号共享? |
|-------------------|------------------------------------|-----------------------------|
| OAuth 凭据 | 是 — `<dir>/.claude/.credentials.json` | 否                      |
| 模型默认值    | 是 — Claude Code 按 `CLAUDE_CONFIG_DIR` 存储 | 否                |
| Anthropic 账单 | 是(每个 token 是一个账号)     | 否                          |
| 会话列表和状态 | 否                              | **是** — sessions 表   |
| 记忆(pgvector)| 否                                 | **是** — 全局 / 项目 / 会话 作用域 |
| 笔记 vault       | 否                                 | **是** — 网关磁盘上的单一 vault |
| 通道(Slack / 飞书 / …) | 否                     | **是** — 通道是网关级别的 |
| 集成(第三方 API 调用方) | 否            | **是** — 集成是网关级别的 |
| 备份 / 计划 / 目标 | 否                      | **是** — 网关级别 |

所以把一个会话从 `personal` 切到 `work`,只是切换了下一次
API 调用用哪个 Anthropic 身份去执行。其他一切 — 对话历史、
会话累计建立起来的记忆、它写过的笔记、它空闲时会被通知到
的通道 — 都原地不动。

这就是 opendray 多账号模型的设计点:账号 **只是一个认证身份**,
不是沙盒。

### 具体示例

想象有三个会话跑在同一个共享的笔记 vault 和同一个记忆存储上:

```
session-A   provider=claude   account=personal
session-B   provider=claude   account=work
session-C   provider=codex                       (no account binding)
```

session-A 在 `project:my-app` 作用域下写入的记忆,对 session-B
的下一次 memory.search 调用是可见的,即使它们是不同的
Anthropic 身份。session-C 写的笔记会出现在三个会话的
inspector 里。"账号" 边界在 opendray 的数据模型里有意不存在;
它只活在 OAuth 那一层。

如果你确实想要两个账号之间做硬隔离(独立笔记、独立记忆),
那就在不同端口跑两个 opendray 网关,各用各的数据库。

## 建立一个新的 Claude 账号

账号建立是一行主机 shell 命令的事情。网关会监视
`~/.claude-accounts/` 看新目录,一旦出现就注册一行
`claude_accounts` 记录,所以 UI 里没有单独的 "create row" 步骤 —
那一行是从文件系统物化出来的。

### 第 1 步 — 在 per-account 的 config dir 下跑 `claude login`

在网关主机上(通过 SSH、`docker exec`,或者你日常用的任何
方式):

```bash
# 给账号挑一个短的 slug。
NAME=work

# 创建目录并在它下面跑官方 Claude OAuth 流程。
# Claude Code 把它的 credentials.json 相对于
# $CLAUDE_CONFIG_DIR 写入,所以文件会落到正确的位置。
mkdir -p "$HOME/.claude-accounts/$NAME"
CLAUDE_CONFIG_DIR="$HOME/.claude-accounts/$NAME" claude login
# … 走完浏览器 OAuth …
```

Claude Code 写出来的 token 文件是一个自管理的凭据 blob —
Claude Code 自己的 refresh 逻辑处理过期,所以账号能一直
可用,不需要后续关注。

为每个账号重复:

```bash
for n in personal work labs ; do
  mkdir -p "$HOME/.claude-accounts/$n"
  CLAUDE_CONFIG_DIR="$HOME/.claude-accounts/$n" claude login
done
```

### 第 2 步 — 让 opendray 看到新目录

网关的文件系统监视器会在下一轮扫描时捡起新目录,但你可以
用 web 面板上的 **Import local** 按钮强制做一次同步扫描。
它会触发 `POST /api/v1/claude-accounts/import-local`,扫描
网关自己主机文件系统上的 `~/.claude-accounts/`,把每一个
还没有对应行的目录都注册一遍。

| 适用于          | 不适用于                                                     |
|--------------------|----------------------------------------------------------------------|
| 裸金属网关 | 没把 `$HOME` bind-mount 进来的 Docker 容器                     |
| 操作员主目录可达的 LXC | 你没 shell 权限的远程托管网关 |
| 开发环境  | 移动端(import 按钮有意只在 web 上 — 手机上根本没有东西让网关去导入) |

如果 `Import local` 报告 "Nothing to import — accounts already in
sync" 但你又没看到那一行,网关运行时里看到的 `$HOME` 大概是
空的。用 `docker exec` 或 `pct exec` 确认一下并调整 volume 挂载。

### 为什么没有 "Add account" 表单?

更早版本的面板在 **Import local** 旁边有过 **+ Add account**。
它被移除了,因为把 OAuth token 粘贴到 web 表单里产生出的
账号是 opendray 无法 refresh 的(公开的 Anthropic API 表面
不包含 refresh 端点),所以账号一小时内就死了。强制走主机
shell 的 `claude login` 流程让这个交互保持诚实:面板里每一
个账号都是 Claude Code 自己在管理的。

如果你真的有理由要程序化地塞一行(比如 CI 流水线里一次性
短期访问 token),底层 API 端点还在:

- `POST /api/v1/claude-accounts` — 创建行
- `PUT /api/v1/claude-accounts/{id}/token` — 写 token 文件

它们有意没暴露成 UI 交互。

## 把会话绑定到账号

拉起对话框里,**Claude account** 下拉框只在 provider =
`claude` 时出现。选一个账号;opendray 给被拉起的进程设置
`CLAUDE_CONFIG_DIR`,这样 Claude Code 就从正确的目录读取。

绑定持久化在会话行(`claude_account_id`)上,所以重启一个
已结束的会话会复用同一个账号。没有 "把一个会话绑到两个账号"
的 UI 交互 — 在任意时刻,会话和账号都是 1:1 的。

## 在会话中途切换

Sessions 页 → 终端面板 → **Account switcher** 下拉框
(终端的右上角)。挑一个不同的账号:

1. 给运行中的进程发 SIGTERM。
2. 等待干净退出。
3. 重新拉起同样的 provider + 参数 + cwd,但用新的
   `CLAUDE_CONFIG_DIR`。
4. 会话 id 保持不变 — 同一个 tab、同一个 Inspector 关联的
   笔记、同一个记忆作用域 key。

终端内容会重置(新进程、新 TUI)。会话保留所有共享的部分
(记忆、笔记、历史、通道);只有 OAuth 身份变了。

## 限制

- 只有 Claude 有这种绑定。Codex / Gemini / Shell 用的是
  拉起时按进程设置的环境变量。如果你需要多账号 Codex,
  在拉起对话框的 *Args* 里设置不同的 `OPENAI_API_KEY`,
  或者把二进制包装成一个有自己 per-account 环境变量逻辑
  的自定义供应商 manifest。
- 账号名不能包含 `/`、`..` 或不可打印字符。目录查找被
  严格沙盒化到 `~/.claude-accounts/<name>`。
- 在一个绑定的会话还在运行时删除账号目录,会让那个会话的
  下一次 API 调用挂掉。opendray 不防这个 — 清理主机文件
  系统状态时小心点。
- 账号行的 `enabled` 标志和 token 有效性是独立的。一个
  `enabled=true` 但凭据文件缺失/过期的行,会在拉起时失败,
  而不是在切换时失败。
