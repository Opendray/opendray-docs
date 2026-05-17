---
kind: capability
title: 笔记编辑器
tldr: Markdown 编辑器,Source/Preview tab,1s 防抖自动保存,wiki-link 自动补全,代码块语法高亮,图片粘贴。Notes 页 + Inspector linked-note pane 共用。
status: stable
since: v0.1.0
topic: notes
related: [notes/overview, notes/wiki-links, sessions/inspector]
capability: [source-preview, autosave, wiki-autocomplete, image-paste, codeblock-highlight, frontmatter-rendering]
inbound: keyboard
outbound: file-write
x-implementation: [app/web/src/features/notes/editor/]
---

# 笔记编辑器

> **tldr:** Markdown 编辑器,Source/Preview tab,1s 防抖自动保存,wiki-link 自动补全,代码块语法高亮,图片粘贴。Notes 页 + Inspector linked-note pane 共用。

## 布局

| 区域 | 内容 |
|---|---|
| 顶部 tab | Source · Preview · Split |
| 主体 | textarea(Source) / 渲染 HTML(Preview) / 两者(Split) |
| 右栏 | wiki-link 自动补全(`[[` 时);否则 backlinks |
| 底部状态 | 字数 · 保存状态 · 文件路径 · 最后修改 |

## 自动保存

| 触发 | 延迟 |
|---|---|
| 键击 | 1s 防抖 |
| Tab 切换(Source ↔ Preview) | 立即 |
| 窗口失焦 | 立即 |
| Esc | 立即 |

## 代码块

| 方面 | 默认 |
|---|---|
| 语言识别 | 首行 `\`\`\`lang` |
| 高亮 | Shiki(同 VitePress) |
| 内置语言 | ts/js/go/python/bash/sql/yaml/toml/json/markdown/html/css |
| 自定义语言 | Shiki 支持的都行 |
| 复制按钮 | hover 右上 |
| 行号 | 可选 `\`\`\`lang {1,3-5}` |

## 图片粘贴

| 动作 | 行为 |
|---|---|
| `Cmd/Ctrl + V` 剪贴板图 | 存 `<vault>/_attachments/<sha>.png`,插入 `![[hash.png]]` |
| 拖拽图片文件 | 同 |
| 拖拽其他文件 | 插 `![[name.ext]]` 链接,文件复制到 `_attachments/` |
| 最大图片大小 | 10 MB |

## 键盘快捷键(Source 模式)

| 快捷键 | 动作 |
|---|---|
| `Cmd/Ctrl + S` | 立即保存 |
| `Cmd/Ctrl + B` | 选中加粗 |
| `Cmd/Ctrl + I` | 斜体 |
| `Cmd/Ctrl + K` | 选中包 `[](url)` |
| `Cmd/Ctrl + Shift + K` | 选中包 `[[]]` |
| `Tab`(列表项) | 缩进 |
| `Shift + Tab` | 反缩进 |
| `Cmd/Ctrl + Enter` | 切换 Source ↔ Preview |
