# MCP 服务器

Model Context Protocol(MCP)是把工具目录暴露给 AI CLI 的
标准。opendray 管理 MCP 服务器的注册、它们的配置,以及一个
per-host 的加密密钥保险库,里面存的是 MCP 服务器运行时要用
的 API key。

## 你能注册什么

任何 MCP 服务器 — 公开目录里有几十个:

- **Filesystem** — 在特定根目录下读写
- **Git** — 查询仓库
- **Linear / Asana / Trello** — 读取 ticket
- **Brave Search / Tavily** — Web 搜索
- **Slack / Discord** — 读 channel
- 以及任何你自己写的

每个服务器在 opendray 的 MCP 注册表里都是一条目。

## 添加一个服务器

Plugins → **MCP servers** → **Add server**。

| 字段 | 用途 |
|---|---|
| **Id** | URL 安全的,比如 `linear`、`fs-projects` |
| **Display name** | 显示在注册表里 |
| **Command** | 怎么启动这个服务器(比如 `npx -y @modelcontextprotocol/server-linear`)|
| **Args** | 额外参数 |
| **Env** | 要注入的环境变量(用 `$SECRET_NAME` 从密钥保险库插值)|
| **Enabled** | 在会话拉起时显示 / 隐藏 |

![MCP 服务器注册](/tutorial/plugins-mcp-add.png)

## 密钥保险库

MCP 服务器的 API key 存在 `~/.opendray/secrets.env` —
用 AES-GCM 加密,密钥存在 OS keychain(macOS Keychain、Linux
secret-service、Windows Credential Manager)里。

要加一个密钥:

1. Plugins → **MCP secrets** → **Add secret**。
2. 输入名字(比如 `LINEAR_API_KEY`)+ 值。
3. 保存。明文写入加密 blob;表单字段清空。

在 MCP 服务器 env 里引用:

```
LINEAR_API_KEY=$LINEAR_API_KEY
```

opendray 在 MCP 启动时从保险库做替换。明文永远不会落到注册表
的明文配置里 — 只有变量名会,所以注册表可以和 opendray 其他
状态一起安全地提交或备份。

## 会话怎么看到 MCP 服务器

当一个 Claude 会话拉起,opendray 会:

1. 给那个会话的 `CLAUDE_CONFIG_DIR` 生成
   `~/.claude/mcp.json`,里面包含所有启用的 MCP 服务器
   (带着解析好的 env,包括密钥)。
2. 当 Claude 调用它们时,服务器进程懒启动。
3. 每次拉起都会重新生成 `mcp.json` — admin UI 里的编辑
   会自动传播到新会话。运行中的会话需要 `/mcp restart`
   (Claude 命令)才能拿到 server 级别的变更。

## Per-session MCP 覆盖

未来特性 — 目前 MCP 是 host-wide 的。如果你需要给一个会话
禁用某个特定服务器,在注册表里把它标记为 `disabled`、拉起
会话,然后再启用回来。

## 健康探测

每 60s opendray 跑一次 `mcp <server> ping`(一个 no-op 工具
调用)并跟踪结果。MCP 页面会显示:

- 🟢 *Healthy* — 最近 60s 内有探测、成功
- 🟡 *Slow* — 最近一次探测超过 5s
- 🔴 *Unreachable* — 最近 3 次探测都失败

点击一行可以看到最近一次探测的 stderr。

## 限制

- **仅 stdio 传输。** MCP 支持 stdio + WebSocket;目前只接通
  了 stdio。WS 会让你指向一个远程 MCP 服务器,v1 不支持。
- **没有 per-session 配置**。每个 Claude 会话继承的是同一份
  MCP 目录。
- 多个会话同时打到同一个 MCP 时,共享 API 配额上的**并发
  速率限制**可能互相干扰。opendray 不做扇入或排队。
