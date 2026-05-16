# 项目记忆 — 日常工作流

## 打开项目记忆

三个入口,都落在同一个限定到某个 cwd 的屏幕:

- **Web**: 侧栏 → **Memory** → **Project** 按钮(或 `Cmd-K → Project memory`)
- **Web 从运行中会话**: 右侧 Inspector → **Memory** 标签 → "Open project memory" 按钮
- **Mobile**: 底部 nav → **Memory** → 顶部 **Project** 按钮(或会话详情 → 🏁 图标 → 直跳到正确 cwd)

如果你到达时 URL 里没有 cwd,你会看到一个 picker,列出每个有存储记忆的项目。截断的旧数据会显示为 `orphan` 并视觉上灰化 — 见第 04 节如何清理。

## Goal — 长期意图

**Goal** 标签是一个 markdown 编辑器。一段话最理想:

> Ship the v2 backup format with WAL-aware incremental snapshots.

agent 每次启动到这个 cwd 都原文读它,所以保持精炼。避免:

- ❌ "TODO: figure out backup" → 太模糊,无法行动
- ❌ 5 段长文 → 撑大启动横幅
- ✅ "Ship the v2 backup format with WAL-aware incremental snapshots." → 具体,一句话

谁更新: 通常是你。最后编辑时间戳 + `updated_by` 显示在编辑器正上方。如果 agent 调 `project_goal_set` MCP 工具,你会在 Inbox 标签看到一个**提议**(见下) — 没有静默覆盖。

## Plan — 当前状态和接下来

**Plan** 标签形状相同,但本就该更频繁地改。建议格式(不强制):

```
Phase 1: <currently working on this>
Phase 2: <next>
Phase 3: <after that>

Blocker: <if any>
```

完成 Phase 1 时直接编辑该文档把阶段往前推。下次启动 agent 看到更新后的 plan,你不用在聊天里重复任何东西。

## Inbox — agent 提议的编辑

MCP 工具 `project_goal_set` 和 `project_plan_set` 刻意不直接更新现行文档 — 它们提交一个**提议**,出现在 **Inbox** 标签。每个提议显示:

- 强烈红色警告: "Approve will REPLACE the current X entirely. This isn't a merge."
- 并排 diff: 当前内容 vs 提议内容
- agent 声明的编辑理由
- "Approve"(带确认对话框)和 "Reject" 按钮

diff 很重要: agent 急切,可能想用自己的解读重写你手工调过的 goal。不同意就拒,他们的版本确实更好就批。

## Journal — 自动记录发生了什么

**Journal** 标签列出本 cwd 的每个 session_end 事件。每条:

- 会话元数据: id(后 8 字符)、provider、时长、退出码
- 近期运维输入(该会话最后 5 条用户键入的消息)
- _Agent 活动摘要_ — 1-3 段 LLM 总结的"agent 实际做了什么"(改了哪些文件、做了什么决策、调试了什么问题、撞了什么阻塞)。**仅在会话有实质工作时存在** — 30 秒的"hi"交流按 prompt 里的"too sparse"防护正确跳过。

你不写这个标签;opendray 在每次 `session.stopped` / `session.ended` 事件时写。

如果想手动记录(比如带外做出的架构决定),从任意 agent 会话用 MCP `decision_record` 工具 — 它写一行 `kind=decision`,会出现在这里。

## 实操节奏

大多数运维落在这个循环:

1. 启动项目: 写一句话 **Goal** 和三阶段 **Plan**。
2. 启动 agent(Claude / Codex / Gemini) → 它启动时已经知道项目是关于什么的。
3. 工作。agent 会话结束自动追加一条 journal 条目。
4. plan 工作中改了 → 编辑 **Plan**。下次启动看到更新。
5. agent 提议新 plan → 在 **Inbox** 评审,批或拒。
6. 几天后,新 agent(或你在新机器上)启动 → 读取全部 5 层,从上一个停下的地方继续。

第 03 节涵盖维护自动管理层的扫描器和清理器,不需要你直接介入。
