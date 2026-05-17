---
kind: concept
title: 笔记 Notes — 概览
tldr: opendray 主机上的 Obsidian 兼容 markdown vault。每会话 linked 笔记自动创建。Wiki link + backlink。可选 git 同步。Claude 可读回作上下文。
status: stable
since: v0.1.0
topic: notes
related: [notes/editor, notes/wiki-links, notes/vault-git-sync, sessions/inspector]
references:
  capabilities: [sessions]
x-implementation: [internal/notes/]
---

# 笔记 Notes — 概览

> **tldr:** opendray 主机上的 Obsidian 兼容 markdown vault。每会话 linked 笔记自动创建。Wiki link + backlink。可选 git 同步。Claude 可读回作上下文。

## 是什么

| 概念 | 行为 |
|---|---|
| Vault | opendray 主机磁盘上的一个 `.md` 文件目录树 |
| Per-session 笔记 | `<vault>/sessions/<sid>.md` 自动创建 |
| Wiki link | `[[other-note]]` 按名解析到文件 |
| Backlinks | 计算得出;右栏显示 |
| 文件 watcher | 外部编辑实时拾起 |
| Git 同步 | 可选 —— `<vault>` 是 git repo |

## 何时读什么

| 主题 | 读 |
|---|---|
| 编辑器细节 + Source/Preview | [editor](./editor) |
| `[[wiki-links]]` + 自动补全 + backlink | [wiki-links](./wiki-links) |
| Git 同步设置 + 冲突处理 | [vault-git-sync](./vault-git-sync) |
| Inspector 的 Notes tab(per-session) | [sessions/inspector](../sessions/inspector) |

![Notes 布局](/tutorial/notes-layout.png)
