# 环境记忆 — 注入档案

**注入档案**控制启动时前置到 agent system prompt 的内容 — 如果有的话。没有档案,模型仍可通过 `memory_search` MCP 工具访问记忆;注入只是让近期上下文可见,不用模型动念去查。

## 策略

### `none`(无档案时默认)

什么也不注入。模型按需用 `memory_search` / `memory_load_context` 取上下文。

适用于:
- 你不想把任何记忆放进上下文窗口
- 你信任模型自己去查
- 你在测试 — 确认捕获工作,不让注入影响输出

### `top_k_recent`

启动时注入项目作用域最近创建的 K 条记忆。格式:

```
## Recent project memory
opendray injected the following durable facts from prior
sessions in this project:
- User prefers pnpm over npm for package management
- DB at db.example.com:5432, dev_user role
- ...
End of memory preface.
```

默认 K = 5,最大 50。

这是"给 agent 最新鲜上下文"模式 — 适合快速演进项目,上周的上下文已经过期。

### `top_k_relevant`

类似 `top_k_recent`,但按语义相似度排序而非时近。用 cwd 的 basename 作为搜索查询,所以大致翻译成"对*本*项目最相关的记忆"。

默认 K = 5。

这是"给 agent 最有用上下文"模式 — 适合记忆历史深厚的项目,你希望 agent 浮现知识,无论捕获时间。

### `manual_only`

启动时不自动注入。运维通过 UI 按钮或 API 触发注入(Phase v1.1)。

适用于:
- 偏好会话工具栏的 "Load context" 按钮(Phase v1.1)而非自动
- 你想要 human-in-the-loop 策展

### `hybrid`

注入一行超短摘要(项目记忆中最近的 top-1,≤80 字符)。输出形如:

```
Project memory hint: User prefers pnpm over npm for package management
```

对于上下文预算紧张的场景,多行横幅太贵但你仍想有点上下文桥。

### `on_keyword`(Phase v1.1)

预留。UI 允许你保存档案,但真正接入消息流的 hook 推迟到 v1.1。选这个策略时启动注入被禁用(v1.1 上线前功能上等价于 `none`)。

## 按会话 vs 全局

和捕获规则一样,档案可以按会话或全局。v1 UI 管理全局默认;按会话覆盖目前只能直接改 DB。

## 注入怎么真正接入

启动时 catalog adapter 调用 `Injector.Render()`,把结果前置到 agent 的 system prompt:

- **Claude:** 通过 `--append-system-prompt` 参数追加
- **Codex:** 写到 `<CODEX_HOME>/AGENTS.md`
- **Gemini:** 写到 `<baseDir>/GEMINI.md`

空 render → 静默跳过(无横幅)。非空 render → 横幅出现在 agent system prompt 顶部,在其他任何指导前面。

## 和捕获如何交互

独立 — 捕获写记忆,注入读记忆。常见部署是:
- 捕获规则: `after_messages` n=6,target=project
- 注入档案: `top_k_recent` k=5,global

结果: 每 6 条消息,本对话的持久事实流入项目记忆池。在同项目启动新会话时,5 条最近事实出现在 agent system prompt 顶部 — 即时连续性。
