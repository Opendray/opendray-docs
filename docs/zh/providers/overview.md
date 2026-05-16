# 供应商 — 概览

*供应商* 是 opendray 可以拉起的某个 CLI 二进制的目录化定义 —
包括 Claude Code、OpenAI Codex、Google Gemini,以及任何你
丢一份 manifest 进来的自定义 CLI。每个会话行都指向一个供应商
id,所以当你"原地重启"时,供应商的可执行文件路径 / 参数 /
环境变量都会应用到新进程上。

## 页面上有什么

![供应商页面](/tutorial/providers-layout.png)

两个面板:

1. **供应商列表** — 每一个目录化的 CLI,带有编辑 / 禁用
   按钮。图标、显示名、描述都来自供应商的 manifest。
2. **Claude 账号** — Claude Code 专属的多账号绑定助手(其他
   供应商用一组来自环境变量的凭据)。

## 每个供应商可配置什么

每个供应商有这些可编辑字段:

| 字段 | 用途 |
|---|---|
| **Executable** | 绝对路径或 `$PATH` 解析的名字(如 `claude`、`/usr/local/bin/codex`)|
| **Default args** | 每次拉起时追加在用户提供的参数前面 |
| **Environment** | 合并到进程环境的额外环境变量 |
| **Display name + icon** | 显示在拉起下拉框和 tab 条上 |
| **Working-dir hint** | 预填到拉起对话框的 cwd 字段 |
| **Disabled** | 把这个供应商从拉起下拉框里隐藏掉 |

内置的 JSON manifest 存活在二进制内部的
`internal/catalog/builtin/`。Web UI 让你在运行时覆盖字段而
不用动源 manifest — 覆盖项存在数据库里,叠加在内置默认值
之上。

## 重置为默认

每张供应商卡片都有一个 **Reset** 按钮,会丢掉你的运行时覆盖
项,恢复内置 manifest 的值。当某次实验出问题、你想要一个
干净的初始状态又不想重启 opendray 的时候,这个按钮很有用。

## 继续阅读

| 主题 | 章节 |
|---|---|
| 内置供应商以及它们的坑 | 内置供应商 |
| 通过 manifest 添加自定义供应商 | 自定义供应商 manifest |
| 多账号 Claude 设置 | Claude 账号 |
