# 作用域

每条记忆都带有 `scope` 和 `scope_key`,决定谁能读到它。根据你存的内容选对作用域 — 这是**共享**与**隔离**之间的权衡。

## 三种作用域

| 作用域 | scope_key | 可见性 |
|---|---|---|
| `session` | 会话 id | 仅写入它的会话 |
| `project` *(默认)* | 会话的 `cwd` | 同一 `cwd` 下的每个会话(跨 CLI) |
| `global` | (空 / 不使用) | 所有会话,任何地方 |

## 什么时候选哪个

### 使用 `session` 用于

- 不应该跨对话存活的临时笔记
- 操作者希望自动清理的敏感上下文(比如会话中途轮换的 token)
- 需要与真实项目记忆隔离的测试

实际上是私有草稿 — 会话结束后,记忆还在 DB 里,但没人会再用那个 scope_key 查它(会话 id 是唯一的)。

### 使用 `project` 用于(默认)

- 任何与工作目录绑定的东西: 包管理器偏好、构建命令、仓库约定、重要文件名、进行中的任务
- 跨 CLI 交接: Claude 在实现某个功能时告诉你某事 → Codex 在同一 `cwd` 下接着 Claude 的进度继续

这是 opendray 自动挂载默认使用的作用域,也是用户几乎总是想要的。

### 使用 `global` 用于

- 操作者级别身份: "我住在悉尼"、"我在任何地方都偏好 TypeScript 而非 JavaScript"、"我的 GitHub 用户名是…"
- 应该跟着你跨越每个项目的事情

要当心: global 记忆对 opendray 启动的**任何**会话都可见,包括不相关仓库里的会话。如果你在不同项目里做客户工作,project 作用域更安全。

## 修改默认值

Settings → Server → Memory → **Default scope** 选择 agent 调用 `memory_store` 没指定时使用的作用域。需要重启(默认值在应用启动时读取一次)。

也可以按调用覆盖: agent 可以直接给 `memory_store` 传 `scope=global` / `scope=session`,但实际上它们用的是 opendray system-prompt 指导建议的默认值。

## scope_key 在底层怎么工作

`memory_store` 的流程:

1. opendray-memory MCP 子进程收到 agent 的调用
2. 子进程从环境变量(`OPENDRAY_MEMORY_SCOPE`、`OPENDRAY_MEMORY_SCOPE_KEY` — gateway 渲染该会话 mcp.json 时设置)读取 `scope` 和 `scope_key`
3. POST `/api/v1/memory/store`,body 为 `{text, scope, scope_key}`
4. 后端写入行

agent 永远不知道也不会输入 scope_key — 它由 gateway 基于会话 cwd 填入。这是故意的: 防止 agent 写到它不应该写的作用域。

## 跨作用域查询

`memory_search` 是单作用域的。MCP 工具一次只暴露一个作用域(取决于环境变量怎么写)。如果你需要从 agent 同时查 project + global,目前需要两次调用。Phase 2 可能会加 "search-many-scopes" 模式。

Settings UI 的 Inspector 允许操作者自由切换作用域,因为它运行在 admin 上下文。

## 列出某处存了什么

Settings → Server → Memory → Inspector。选作用域,输入 scope_key(默认是第一个会话的 cwd),你就能看到该作用域里每条带 provenance 元数据的记忆。

或者直接通过 API:

```bash
curl -s "http://127.0.0.1:8770/api/v1/memory/list?scope=project&scope_key=/path/to/cwd&n=50" \
  -H "Authorization: Bearer $TOKEN" | jq
```

## 隐私边界

作用域是**唯一**的隔离机制 — 目前没有按用户过滤(opendray 设计上是单操作者)。如果你和协作者共享一个 opendray 实例,他们都能看到所有 project + global 记忆。Phase 2 可能会加按操作者过滤。
