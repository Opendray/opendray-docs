# 存储路径

侧边栏里三个 Server 子章节配置 opendray 在哪儿找每个上游
CLI 的磁盘数据:

- **Storage · Claude** — `~/.claude/projects` + 多账号根目录
- **Storage · Codex** — `~/.codex/sessions`
- **Storage · Gemini** — `~/.gemini/tmp` + `projects.json`

这些路径喂给两个功能:

1. Sessions Inspector 里的 **History 面板**(显示操作员在
   当前项目里发过的每一条 prompt,跨所有曾经拉起过的会话
   汇集)。
2. **新账号默认值**(只有 Claude)— 当你通过 API 创建一个
   Claude 账号又没指定 `ConfigDir` 时,从 `accounts_dir`
   派生。

每个字段都是可选的 — 留空会回退到上游 CLI 在 `$HOME` 下的
标准布局。仅在以下情况覆盖:

- CLI 装在非默认位置。
- 你在启动 opendray 的 shell 上设置了
  `CLAUDE_CONFIG_DIR` / `CODEX_HOME` / `GEMINI_HOME`。
- 你把 CLI 第三方化(vendor)到 `/opt/<tool>` 之类的地方。

## Claude

| 字段 | toml key | 默认行为 |
|---|---|---|
| History 根目录 | `providers.claude.history_roots` | 空列表 = 扫描 `~/.claude/projects` **加上** 每个 `~/.claude-accounts/*/projects`(自动 glob,通过 EvalSymlinks 去重)。|
| Accounts 目录 | `providers.claude.accounts_dir` | `~/.claude-accounts` |

History 根目录字段是一个列表 — 每个目录加一行。顺序无所谓
(结果会被合并,按时间戳排序,按文件 inode 去重)。

之所以选这个默认行为,是因为 opendray 的多账号支持用的是
`~/.claude-accounts/<name>/projects`,这通常是一个指向
`~/.claude-accounts/shared/projects` 的符号链接 — 所以这一
圈目录都指向同一组实际文件。EvalSymlinks 去重确保每条
transcript 只出现一次。

## Codex

| 字段 | toml key | 默认 |
|---|---|---|
| Sessions 根目录 | `providers.codex.sessions_root` | `~/.codex/sessions` |

opendray 会遍历这个根下整棵树,读取每个 `*.jsonl` 的第一行
(`session_meta` 信封),只保留它的 `payload.cwd` 匹配当前
会话工作目录的文件。

Codex 在每个会话开始时注入的合成 AGENTS.md /
`<environment_context>` bootstrap 会被过滤掉 — 你只看到
操作员实际输入的 prompt。

## Gemini

| 字段 | toml key | 默认 |
|---|---|---|
| Tmp 目录 | `providers.gemini.tmp_root` | `~/.gemini/tmp` |
| projects.json | `providers.gemini.projects_file` | `~/.gemini/projects.json` |

Gemini 的 per-project 存储活在 `<tmp_root>/<dir>/logs.json`,
其中 `<dir>` 可以是:

1. 在 `projects.json` 里从 `cwd` 映射出的 "short name"
   (首选;Gemini CLI 在首次运行时写)。
2. cwd 的小写十六进制 SHA-256(更老版本 Gemini)。
3. 任意值 — opendray 把 `<dir>/.project_root` 文件作为
   最后一招扫描。

如果你的 Gemini 布局不寻常(自定义 `GEMINI_HOME`、挂载卷
等),只要 Gemini 自己写了 `.project_root` 标记,扫描回退
就能处理。

## 测试路径

每个路径字段都有一个 **Test** 按钮。点它会:

- 用运行中网关进程的 `$HOME` 解析 `~/`。
- Stat 这个路径 — 内联显示 "not found" 或 "✓ N children"。
- 当预期是目录时验证它是目录。

路径 **不** 需要重启 — 它们在每次 History API 调用时读取。
保存改动之后,下一次 History tab 刷新立刻拿到新值。

## 跨平台说明

当前实现假设 opendray 和 CLI 工具 **跑在同一台机器上,作为
同一个 OS 用户**。跨机器或跨用户设置(opendray 在容器、CLI
在主机)需要 volume 挂载 + 配置的路径必须从网关进程内部
有效。

不支持 Windows(`os.Getenv("HOME")` 返回空;修复需要
回退到 `USERPROFILE`)。
