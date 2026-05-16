# 设置 — 概览

Settings 页被切成三个顶层组,在左侧侧边栏列出:

- **Workspace** — per-browser 偏好(Appearance / Font /
  Account info)
- **Server** — 网关侧每一个旋钮的 `config.toml` 编辑器,
  外加一个实时日志 tail
- **System** — 只读的健康视图 + About

Workspace 设置在浏览器里持久化。Server 设置写回网关的
`config.toml`,大多需要 **Restart** 才生效。大号的
"Restart server" 按钮在每个 Server 章节的底部。

## Workspace

| 项 | 用途 |
|---|---|
| **Appearance** | Light / Dark / System 主题 |
| **Font size** | Compact / Default / Comfy / Large — 缩放整个 UI |
| **Account** | 登录的操作员 + bearer token 过期时间(只读)|

## Server(仅管理员)

每个 Server 子章节 1:1 映射到 `config.toml` 里一个
`[section]` 块。每个字段的 toml-key 用小号等宽字体显示在
字段标签下面,方便高级用户对照。

| 子章节 | 里面是什么 |
|---|---|
| **General** | `listen` 地址 + 操作员账号(用户名 / 密码 / token TTL)|
| **Logging** | 级别 / 格式 / 可选文件输出 + 实时 tail 控制台 |
| **Sessions** | 空闲阈值 + 空闲轮询间隔 |
| **Vault** | 笔记 / skill / git 根目录 |
| **MCP registry** | MCP 服务器注册表路径 + 密钥文件 |
| **Storage · Claude** | history 根目录 + accounts 目录 |
| **Storage · Codex** | sessions 根目录 |
| **Storage · Gemini** | tmp 根目录 + projects.json |

每个 Server 表单都有同样的操作模型:

1. 编辑字段 — 页面 per-section 跟踪 dirty 状态。
2. **Save changes** 写回 `config.toml`。横幅在你点之前显示
   "unsaved";一旦落地的值需要进程重启,就显示
   "restart required"。
3. **Reset** 丢弃当前章节里未保存的更改。
4. **Restart server** 触发 `syscall.Exec` 自替换;UI 等
   `/health` 回来,然后重新加载。

敏感字段(`database.url`、`admin.password`)在 GET 时被
返回为空字符串 — 运行中的守护进程永远不会把它们回显给
浏览器。Save 时留空会保留现有值;输入一个值会覆盖。

## System

| 项 | 用途 |
|---|---|
| **Status** | 实时 `/health` 视图(状态 / 版本 / 运行时长 / 数据库可达性)|
| **About** | 项目简介 + license |

侧边栏底部的小健康点和 **Status** 同步,这样你不用导航过去
就能知道数据库是不是没了。

## 继续阅读

| 主题 | 章节 |
|---|---|
| 监听地址、操作员账号、密码轮换 | 通用(general) |
| 空闲阈值和何时调它 | 会话默认值 |
| 自定义快捷键 + 主题(theme) | 快捷键和主题 |
| 实时日志 tail + 文件输出 + 日志级别 | 日志 |
| Claude / Codex / Gemini 的 transcript 在磁盘上的位置 | 存储路径 |
| 自重启工作流 + 安全护栏 | 重启 |
