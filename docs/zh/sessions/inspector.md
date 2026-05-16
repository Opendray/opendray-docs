# Inspector 面板

Inspector 面板是 Sessions 页面右侧的可折叠侧栏。它承载终端里放不下的元数据、文件浏览、历史和工具。

![Inspector panel tabs](/tutorial/sessions-inspector.png)

通过 WorkbenchHeader 右上角的 inspector-toggle 图标切换面板(在会话控制按钮旁边)。打开状态会按用户跨刷新保持。

## 子标签

Inspector 在一个 3 行的网格里暴露 7 个标签(4 + 2 + 1):

| 行 | 标签 |
|---|---|
| 1 | Files · Git · Search · Tasks |
| 2 | History · Notes |
| 3 | Memory |

所有标签都作用域到**会话的 `cwd`** — 不会显示这个工作目录之外的数据。

### Files

可滚动的会话工作目录树。当你忘了项目里有哪些文件,或者 agent 引用了一个你想瞥一眼的文件却不想离开终端时很有用。

点击一个文件 → 在 Inspector 里打开一个只读查看器。

树默认折叠到 3 层深度,所以 `node_modules` 或 `.venv` 不会撑爆它;按需展开特定子树。

### Git

针对 cwd 的完整 Git 工作台:分支切换、暂存、提交、推送,以及面板内的 PR 命令中心。仅当 cwd 位于一个 git 仓库内时显示。完整介绍见 [Git workflow](#02-sessions-07-git-workflow)。

### Search

跨 cwd 的子串 + 正则搜索。由后端 FS handler 使用的同一个 ripgrep 封装驱动,所以会遵守 `.gitignore` 并跳过 `node_modules`。匹配结果链接到文件查看器。

### Tasks

会话作用域的自定义任务运行器。每个你在 Plugins → Custom Tasks 下保存的任务都会在这里以一个一键启动器的形式出现;运行会在同一个 cwd 下作为父会话的子会话**新启动**一个 session,所以 `g s` 会把它们分组显示。

### History

**项目级**输入日志:操作员在此 cwd 发送过的每个 prompt,汇集自所有曾在这里启动的会话。

数据源因供应商而异:

| Provider | 读取自 |
|---|---|
| Claude | `~/.claude/projects/<encoded-cwd>/*.jsonl` 和 `~/.claude-accounts/*/projects/...` |
| Codex | `~/.codex/sessions/**/*.jsonl`,按 `session_meta.cwd` 过滤 |
| Gemini | `~/.gemini/tmp/<dir>/logs.json`(通过 `projects.json` 的 short-name 解析) |

这些路径可在 **Settings → Server → Storage paths** 里配置(每个供应商一节)。对于不支持的供应商(shell 等)面板显示友好的空状态。

每行包含:

- 时间戳(相对 — "2 hours ago")
- prompt 文本(自动换行,从不截断)
- CLI 会话 id(8 字符前缀;悬停看完整 id)

每行 hover 时显示操作:

- **📋 Copy** — 把 prompt 文本复制到剪贴板。
- **➤ Resend** — 通过终端使用的同一个 `/input` 端点,把 prompt 重新注入到**当前活跃**会话。使用 `\r`(raw 模式 Enter),而不是 `\n`,以免 Claude 在 prompt 里看到字面换行。

最新条目在前。顶部的过滤框对 prompt 文本做大小写不敏感的子串匹配。每 10 秒轮询一次,新输入的 prompt 会自动出现。

### Notes

会话链接的 Obsidian 笔记。每个会话自动获得一份位于 `<vault-root>/sessions/<session-id>.md` 的笔记。Inspector 内嵌的 Markdown 编辑器与 Notes 页面上看到的相同:

- 笔记区域顶部的 **Source / Preview** 标签 — 按需切换。
- 输入 `[[` 时触发 **Wiki-link 建议**。
- 右侧显示**反向链接**(链接到此笔记的其它笔记)。
- 末次按键后 1 秒**自动保存**(防抖)。

这是操作员日常便签的合适位置:"要问 Claude 的事项"、"待决策"、"结束会话前的 TODO"。基于文件存储,会话重启后依然保留。

## Inspector 里**没有**什么

- **生命周期事件时间线** — 每会话的"何时发生了什么"视图曾经在这里以 "Activity" 标签存在。后来移除了,改用 History,因为原始事件流对 vibe-coding 来说信号太弱。系统级事件总线仍在顶部导航的 **Activity** 页面可用。
- **最新助手消息的大纲** — 也曾经在这里,已移除。改用 Search,或者 agent 自己的回滚。

## 调整大小和隐藏

面板锚定在工作台的右边缘,可以**用户手动调整大小**:

- **拖左边缘**调整大小。inspector 左边缘的 6 像素列在 hover 时高亮;按住拖动到 **320 px**(默认)和 **900 px** 之间的任意宽度。
- **双击**同一边缘以回到默认宽度。
- 宽度按用户持久化(zustand `opendray.layout`,存在 `localStorage` 里),所以刷新和重新 spawn 的会话之后仍保留。

要完全隐藏面板,点击 WorkbenchHeader 里的 inspector-toggle 图标。打开/关闭状态以同样方式持久化。
