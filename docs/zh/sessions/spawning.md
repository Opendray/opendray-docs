# 启动一个会话

点击 Sessions 页面右上角的 **New session**。spawn 对话框包含你启动一个由 opendray 生命周期管理的 CLI 所需的全部字段。

![Spawn dialog](/tutorial/spawn-dialog.png)

## 必填字段

### Provider

选择要启动的 CLI。下拉列表列出所有在 [Providers](#providers-overview) 下配置的供应商。内置默认值:Claude、Codex、Gemini。供应商的图标和显示名都会在这里出现,所以在一个多 CLI 主机上你不会意外启动错的那个。

### 工作目录

会话的 `pwd`。两种填法:

- **直接输入绝对路径**到输入框里。
- **点击 📁 按钮**打开一个以你 home 目录为根的文件浏览器。导航、选择文件夹、点击 *Use this directory*。

opendray 会拒绝不存在或不可读的路径 — 启动前会调用 `stat()`,所以你不会在事后看到 "fork/exec: no such file or directory" 这种含糊报错。

## 可选字段

### Name

友好的标签名。默认 = 目录的 basename(例如 `/Users/me/projects/foo` → `foo`)。需要自定义标签时覆盖(例如 `foo (refactor)`)。

### Args

附加到供应商默认值后面的额外 CLI flag。示例:

- Claude:`--continue` 用于恢复此 cwd 下最近一次对话
- Codex:`--model gpt-5` 覆盖默认模型
- 纯 shell:留空

供应商自带的参数不能在这里编辑 — 它们存在 provider manifest 里(Providers 页面)。

### Claude 账号

**只有当 provider = `claude` 时才显示。** 下拉列出在 **Providers → Claude accounts** 里注册的所有账号。选中一个就把会话绑定到那份凭证 — Claude Code 会读取 `~/.claude-accounts/<name>/`,而不是默认的 `~/.claude/`,这样你可以并行运行 `personal` 和 `work` 账号,无需反复重新登录。

账号绑定会存在 session 行上,所以重启一个已结束的会话仍会复用同一个账号。

**选择器行为按账号数量:**

- **0 个账号** — 选择器完全隐藏;会话使用系统的 `ANTHROPIC_API_KEY`。
- **1 个账号** — 选择器显示 `Default (env / system)` 和那一个账号。两个选项都合理。
- **2+ 个账号** — `Default` 选项消失。一旦你注册了多个账号,"回退到环境变量" 的选项几乎肯定不是你下次 spawn 想要的,所以 opendray 强制你做一个显式选择。第一个启用的账号会自动预选。

### Bypass / autonomy 开关

**仅对 `claude`、`codex`、`gemini` 显示。** 是会话级的"跳过安全提示"模式开关。默认关闭;当你信任这个会话可以无人值守运行时打开。

flag 因供应商而异:

| Provider | Toggle 标签 | 附加的 flag |
|---|---|---|
| Claude | `Bypass permission prompts` | `--dangerously-skip-permissions` |
| Codex | `Bypass approvals & sandbox` | `--dangerously-bypass-approvals-and-sandbox` |
| Gemini | `YOLO mode (--yolo)` | `--yolo` |

这个开关是**累加性的** — 它不会禁用供应商全局的 bypass 设置(**Providers → Claude / Codex / Gemini → Bypass / Approval / YOLO**)。如果供应商配置已经开了 bypass,无论这个开关如何,每个会话都会 bypass。如果你想要按会话粒度控制,就把供应商默认值关掉。

会话级 bypass flag 附加在你输入到 **Args** 之前。当同一个 flag 已经在供应商保存的配置里(例如 codex 保存的 `--ask-for-approval on-request`),会话级值胜出 — opendray 会丢掉供应商那份副本,以免 codex 的解析器因重复而报错。

针对 codex:`--ask-for-approval never` 只会自动通过 shell exec 命令,**不会**自动通过 MCP 工具调用。会话开关使用的是 `--dangerously-bypass-approvals-and-sandbox`,这是 codex 的"跳过一切"开关(也禁用了 workspace sandbox)。

开关在切换供应商和每次 spawn 之后都重置为 OFF,所以下次启动总是一次刻意的选择。

### 父会话

最近停止的会话下拉框。选中一个会用那个会话的 provider + cwd + 参数 + claude 账号填充 spawn 对话框,准备好用新 id 重新启动。

常用场景:

- Claude 会话任务中途崩溃 → 从它 fork,同样的上下文回来。
- 在同一个任务上对比两个模型变体 → 从同一个父会话 spawn 两次,使用不同的 `--model` 参数。

opendray 会持久化 `parent_session_id`,所以家族树之后可以查询。

## 点击 Spawn 之后发生什么

1. opendray 校验 cwd、生成会话 id、以 `STARTING` 状态插入 DB 行。
2. fork 一个 PTY,用合并后的参数 + 环境变量运行供应商的可执行文件。
3. 接好 stdout 泵(写入环形缓冲区 + 扇出到所有订阅的 WebSocket 客户端)。
4. 第一个字节到达后立刻把状态标为 `RUNNING`;如果进程启动时静默,则 500ms 后标记。
5. 把活跃标签切到新会话。

如果启动失败(找不到二进制、cwd 不可读、启动即退出),对话框会保持打开,顶部红色横幅显示来自 `cmd.Start` 的具体错误。
