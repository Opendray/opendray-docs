# 会话 — 概览

Sessions 页面是 opendray 的日常工作台。opendray 管理的每个 CLI 进程 — Claude Code、Codex、Gemini、纯 shell — 都会在这里以一个标签页的形式呈现。你在这一个页面里完成启动、查看、驱动和清理。

针对具体工作流,阅读下面的深入章节:

| 主题 | 章节 |
|---|---|
| 启动一个新的 CLI 会话 | Spawning a session |
| 右侧的 Inspector 面板 | Inspector panel |
| 状态标签含义(running/idle/ended/...) | Session lifecycle |
| 多标签管理 + 键盘快捷键 | Tabs & keyboard nav |

## 全貌

![Sessions page layout](/tutorial/sessions-layout.png)

1. **标签条(顶部)** — 所有运行中和最近结束的会话。
2. **终端** — 完整的 xterm.js,支持复制粘贴,鼠标滚轮遵守供应商的 `mouseEvents` 设置。
3. **状态标签** — `RUNNING` / `IDLE` / `ENDED` / `STOPPED`,终止状态时附带 exit code。
4. **Inspector(右侧)** — 可折叠的侧面板,带每个会话独立的子标签。

## 为什么叫 "session" 而不是 "process"

opendray 把每次 CLI 调用建模成**数据库中的一行 session 记录**。PTY 和子进程会来来去去(你可以停止再重启会话 — 行 id 保留),但 session 记录保留工作目录、供应商、参数、父会话 id 以及绑定的 Claude 账号。

这正是 "原地重启" 的基础:当一个 Claude 会话崩溃时,你可以用同一个 id、同一个 cwd、同一个账号绑定启动一个新的,Inspector 标签里的内容(链接的笔记、大纲缓存)都会回来。

## 数据存在哪里

| 数据 | 位置 |
|---|---|
| 会话元数据(id、cwd、参数、状态) | Postgres `sessions` 表 |
| 运行时的 stdout 历史 | 内存环形缓冲区(每会话 1 MiB) |
| 每会话 Inspector 链接的笔记 | 笔记库文件 `<vault>/sessions/<sid>.md` |
| Claude 对话记录(助手回合) | `~/.claude/projects/<encoded-cwd>/<sid>.jsonl`(Claude 自己的) |

Web UI 通过 WebSocket 流式传输 stdout;关闭浏览器标签**不会**杀掉会话 — opendray 保留环形缓冲区和进程,当你重新连接时可以回放历史。
