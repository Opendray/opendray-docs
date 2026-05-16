# 笔记 — 概览

Notes 页是一个 Obsidian 风格 vault 之上的 markdown 编辑器 +
查看器。它承担两个角色:

1. **Per-session 关联笔记。** Sessions 页里的每个会话都在
   `<vault>/sessions/<session-id>.md` 下有一个笔记,嵌入在
   Inspector 里。把它当作那个会话工作过程的滚动便签本。
2. **独立 vault。** 项目文档、决策、参考资料 — 任何你会放
   在 Obsidian 里的东西。opendray 对着同一个 Obsidian 用的
   vault 工作,所以你两边都能编辑。

![笔记页面](/tutorial/notes-layout.png)

## Vault 根目录

通过 `config.toml` 里的 `notes.root` 配置:

```toml
[notes]
root = "~/.opendray/vault"
```

opendray 把那个根目录下每个 `.md` 文件当成一个笔记。默认
vault 目录包含:

- `sessions/` — 自动管理的 per-session 笔记(别在这里重命名
  文件;关联是按文件路径)
- `<your folders>/` — 独立笔记,你创建的任何东西

## 继续阅读

| 主题 | 章节 |
|---|---|
| `[[Wiki 链接]]` 和反向链接(backlink)面板怎么工作 | Wiki 链接 + 反向链接 |
| 自动 commit + 推送到远程 git 主机 | Vault git 同步 |
| 源码 vs 预览模式 + 自动保存行为 | 编辑器 |
