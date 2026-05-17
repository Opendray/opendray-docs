---
kind: capability
title: Wiki 链接 + backlink
tldr: '[[note-name]] 语法。按文件名解析(大小写不敏感,忽略路径)。[[ 触发自动补全。右栏显示 incoming backlink。保存时重算。'
status: stable
since: v0.1.0
topic: notes
related: [notes/overview, notes/editor]
capability: [wiki-link, autocomplete, backlinks, broken-link-detection]
inbound: editor-input
outbound: file-write
x-implementation: [internal/notes/wikilink.go]
---

# Wiki 链接 + backlink

> **tldr:** `[[note-name]]` 语法。按文件名解析(大小写不敏感,忽略路径)。`[[` 触发自动补全。右栏显示 incoming backlink。保存时重算。

## 语法

| 模式 | 例 | 解析到 |
|---|---|---|
| `[[name]]` | `[[opendray-positioning]]` | 第一个 basename 为 `opendray-positioning` 的 `*.md` |
| `[[name\|display]]` | `[[opendray-positioning\|看定位笔记]]` | 同目标,自定义显示 |
| `[[name#heading]]` | `[[design-doc#mission]]` | 打开后滚到 heading |
| `![[name]]` | `![[diagram.png]]` | 嵌入图 / pdf transclude |

## 解析规则

| 规则 | 行为 |
|---|---|
| 大小写不敏感 | `[[notes]]` 匹配 `Notes.md` |
| 路径无关 | `[[design]]` 匹配 `archive/design.md`(如无更近匹配) |
| 越近越赢 | 同级 > 父级 > 根 > 任意 |
| 多匹配 | 路径深度优先,再字母序 |
| 无匹配 | 渲染为红色 broken 链接,hover 提示 |

## Backlink(右栏)

| 位置 | 内容 |
|---|---|
| 编辑器右栏 | "Linked from" — 所有 `[[`-链接到此页的其他笔记 |
| Hover backlink | 链接行预览 |
| 点 backlink | 跳到那篇笔记,滚到链接处 |
| 空状态 | "No backlinks yet" |

## Broken link 检测

| 位置 | 行为 |
|---|---|
| 编辑器渲染 | 红色 `[[xxx]]` |
| Hover | "无匹配笔记 — 点击创建" |
| 点击 | 在同目录创建 `xxx.md`,打开编辑 |
| 批量审计 | `opendray notes audit` CLI 列出 vault 所有 broken |
