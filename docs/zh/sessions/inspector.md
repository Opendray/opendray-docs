---
kind: concept
title: Inspector 面板
tldr: 右侧可折叠面板,7 个子 tab(Files / Git / Search / Tasks / History / Notes / Memory)。全部 scope 到会话的 cwd。可调宽 320–900px,每用户持久化。
status: stable
since: v0.1.0
topic: sessions
related:
  - sessions/overview
  - sessions/git-workflow
  - notes/overview
references:
  capabilities: [sessions]
x-implementation:
  - app/web/src/features/inspector/
---

# Inspector 面板

> **tldr:** 右侧可折叠面板,7 个子 tab(Files / Git / Search / Tasks / History / Notes / Memory)。全部 scope 到会话的 `cwd`。可调宽 320–900px,每用户持久化。

## 子 tab(3 行 grid 4 + 2 + 1)

| Row | Tabs |
|---|---|
| 1 | Files · Git · Search · Tasks |
| 2 | History · Notes |
| 3 | Memory |

## Tab 参考

### Files

| 属性 | 值 |
|---|---|
| 来源 | 会话 cwd 的滚动 tree |
| 点文件 | 在 Inspector 里打开只读 viewer |
| 默认折叠深度 | 3 层(避免 `node_modules` / `.venv` 撑爆) |
| 过滤 | 无 —— 内容用 Search tab |

### Git

| 属性 | 值 |
|---|---|
| 来源 | cwd 在 git repo 内时 |
| 可见时 | cwd 是 git repo |
| 能力 | 切分支 / 暂存 / commit / push / PR 控制面板 |
| 见 | [Git workflow](./git-workflow) |

### Search

| 属性 | 值 |
|---|---|
| 后端 | ripgrep wrapper(跟 FS handler 同一个) |
| 遵守 | `.gitignore`,跳过 `node_modules` |
| 模式 | 子串 + 正则 |
| 点击命中 | 打开 file viewer 到行 |

### Tasks

| 属性 | 值 |
|---|---|
| 来源 | Plugins → Custom Tasks 保存的任务 |
| 触发 | 一键 → 在父 session 下 spawn 新会话 |
| 分组 | `g s`(group sessions view)里显示在父下 |

### History(项目级)

该 cwd 里所有 session 发过的 prompt 汇总。

| Provider | 读取自 |
|---|---|
| `claude` | `~/.claude/projects/<encoded-cwd>/*.jsonl` + `~/.claude-accounts/*/projects/...` |
| `codex` | `~/.codex/sessions/**/*.jsonl` 按 `session_meta.cwd` 过滤 |
| `gemini` | `~/.gemini/tmp/<dir>/logs.json`(通过 `projects.json` 解析) |
| `shell` / 其他 | 空状态 |

路径在 **Settings → Server → Storage paths** 可配。

| 每行数据 | 每行动作 |
|---|---|
| 时间戳(相对) | 📋 复制 prompt |
| Prompt 文本(换行,从不截断) | ➤ Resend → 通过 `/input` 注入当前活动会话(用 `\r`) |
| CLI session id(前 8 字符前缀;hover 看完整) | |

每 10s polling;过滤框是大小写不敏感子串。

### Notes

每会话有一个 linked Obsidian 笔记 `<vault-root>/sessions/<session-id>.md`。

| 特性 | 行为 |
|---|---|
| 编辑器 | 跟 Notes 页一样(Source / Preview tabs) |
| `[[` 触发 | wiki-link 建议 |
| Backlinks | 右侧 pane 显示链入此页的笔记 |
| 自动保存 | 最后一次键击 1s 后 debounce |
| 生命周期 | 文件级;会话重启仍在 |

### Memory

per-session 看 pgvector 命中、当前 capture 规则、worker 状态。
见 [Memory](../memory/overview)。

## 不在这里的内容

| 移除项 | 原因 |
|---|---|
| 生命周期事件 timeline(老的 "Activity" tab) | vibe-coding 时信号弱;用顶部导航 **Activity** 页看全站 event bus |
| 最新 assistant 消息 outline | 已移除;用 Search 或 agent scrollback |

## 调宽 & 隐藏

| 动作 | 效果 |
|---|---|
| 拖左边缘列 | 调宽 320–900px |
| 双击左边缘 | 回到默认 320px |
| WorkbenchHeader 里的 toggle 图标 | 隐藏 / 显示面板 |
| 持久化 | `localStorage` zustand `opendray.layout` per-user |

![Inspector 面板 tabs](/tutorial/sessions-inspector.png)
