# 笔记编辑器

笔记编辑器是 Notes 页(以及 Sessions Inspector 里的 Notes
tab)的核心。它是一个配对的 textarea + 预览,带自动保存
和 wiki 链接建议弹窗。

## 源码 vs 预览

每个笔记视图顶部的 tab:

- **源码** — 原始 markdown,纯 textarea。输入、粘贴、编辑。
- **预览** — 通过 react-markdown + remark-gfm 渲染的输出:
  表格、带 hljs 语法高亮的代码围栏、任务列表复选框(可点
  击!)、渲染成药丸按钮的 wiki 链接。

两个状态根据上下文切换:

- **Per-session 关联笔记** 默认用 **源码** 模式打开 —
  你在做便签。
- 从 Notes 页打开的 **独立 vault 笔记** 默认用 **预览**
  模式打开 — 你在读项目文档。

用 `?mode=source` / `?mode=preview` URL 参数覆盖,或者
直接点 tab。

![源码 / 预览 tab](/tutorial/notes-source-preview.png)

## 自动保存

编辑在最后一次按键之后 debounce 1 秒,然后存到磁盘。标题
旁边的状态指示器显示:

| 指示器 | 含义 |
|---|---|
| `Saved` | 最新内容在磁盘上 |
| `Saving…` | 写入进行中 |
| `Unsaved` | 编辑待处理;debounce 定时器活跃 |
| `Save error` | 上次写入失败(权限、磁盘满);内容仍在 textarea 里 |

如果主机在保存中途崩溃,你最多丢失最后一秒的输入。vault
git 同步(如果启用)在它之上再给你 5 分钟的崩溃预算。

## 快捷键

| 快捷键 | 动作 |
|---|---|
| `Cmd / Ctrl + S` | 强制立即保存(跳过 debounce)|
| `Cmd / Ctrl + B` | 用 `**bold**` 包住选区 |
| `Cmd / Ctrl + I` | 用 `*italic*` 包住选区 |
| `Cmd / Ctrl + K` | 用 `[selection](url)` 包住选区 |
| `Tab`(在源码模式下) | 插入字面 tab(**不** 切换焦点)|
| `Esc` | 关闭任何打开的建议弹窗 |

快捷键是完整编辑器会提供的功能的一个小子集 — opendray 的
笔记编辑器有意做得极简。如果你想要高级功能(多光标、
snippet、vim 模式),vault 就是一个 `.md` 文件的目录;
在 Obsidian 或 VS Code 里打开。

## 关联笔记上下文

从 Sessions Inspector 打开时,编辑器知道自己是关联笔记,
会显示:

- 标题下面的 **会话 id**
- **"Open standalone"** 链接,导航到完整 Notes 页里的笔记
- **反向链接** 显示笔记被引用的所有地方

关闭会话 tab **不** 会关闭笔记 — 它留在 vault 的
`sessions/<sid>.md` 下。你可以随时重新打开,哪怕会话本身
已经结束。

## 文件操作

Notes 页的侧边栏有一个树,列出 vault 里的每个目录 + .md
文件。右键:

- 在这个目录下 **New note**
- **Rename** 文件(自动更新指向它的 wiki 链接)
- 带确认的 **Delete**
- 在目录之间 **Move**(拖动,或右键 → Move to)

opendray 在一个 worktree commit 里原子重命名 + 更新引用 —
如果你启用了 vault git 同步,下一轮同步会把重命名当作一个
commit 而不是两个。
