# 项目记忆 — 概览

项目记忆是**按 cwd、结构化的层**,位于第 11 节涵盖的离散事实记忆存储之上。你通过 opendray 启动的每个 Claude / Codex / Gemini 会话,启动时都读取同一份基于当前项目状态衍生的五层横幅 — 这样新 agent 一进来就拥有上一个 agent 当时的上下文。

如果第 11 节是"agent 把什么作为离散事实记住?",本节就是"agent 关于*这个项目*具体知道什么?"。

## 五层

每次启动注入约 4-5 KB 的 markdown 横幅,组成包括:

| 层 | 来源 | 谁编辑 | UI 入口 |
|---|---|---|---|
| **技术栈与结构** | 自动扫描标记文件(`go.mod`、`package.json`、`pubspec.yaml`、…)+ git HEAD + 顶层目录 | 仅扫描器 — 下次启动时陈旧 ≥ 6h 就刷新 | Project → **Tech** 标签(只读) |
| **项目目标** | 运维写的一段话: "我们在建什么" | 你(agent 可通过 MCP _提议_,你批准) | Project → **Goal** 标签 |
| **项目计划** | 运维写的一段话: "现在/接下来做什么" | 同 goal | Project → **Plan** 标签 |
| **近期活动** | LLM 总结的 `git log --since 7d --stat` + 热路径文件列表 | 仅扫描器 — 每 24h 刷新 | Project → **Activity** 标签(只读) |
| **近期 journal** | 最后 5 条会话结束摘要(会话停止时自动写) | 自动 — 每个 session_end 事件一条 | Project → **Journal** 标签 |

## 为什么和 L5 事实分开

第 11 节的记忆存储把每条记录视为**离散事实**,按 top-K 相似度排序。这种形状适合"用户偏好 pnpm",但不适合"这是我们周一同意的多段计划"。项目记忆用:

- **就地替换**用于 goal / plan(你编辑整篇文档)
- **仅追加**用于 journal(每个 session_end 一行)
- **扫描时覆盖**用于 tech_stack + recent_activity

…全都存在不同表(`project_docs`、`project_doc_proposals`、`session_logs`),这样每个都能独立查询和管理。Project 页面把它们作为标签呈现;启动注入器把它们组合成一个横幅。

## 什么时候用哪层

你想记录的是… | 放进… | 为什么
---|---|---
**长期项目意图**("交付跨 CLI 记忆") | Goal | 一段话,替换,在启动横幅中原文显示
**当前 sprint / 接下来做什么**("Phase 2: M6 启动注入") | Plan | 同 goal;工作推进时更新
**离散偏好 / 事实**("我们用 pnpm;bcrypt cost=12") | 记忆存储(第 11 节) | top-K 检索;仅相关时嵌入环境横幅
**本会话作出的决定**("选 bcrypt 而非 argon2 因为…") | `decision_record` MCP 工具 → journal 为 `kind=decision` | 每会话永久审计轨迹
**本会话发生了什么** | 自动 journal(不需操作) | session-end 事件触发

## 跨 CLI: 同一项目,任意 agent

Claude / Codex / Gemini 都通过各自原生注入通道(`--append-system-prompt`、`$CODEX_HOME/AGENTS.md`、`GEMINI.md`)读取相同的项目记忆。通过 Project → Goal 标签告诉 **Claude** 一次项目目标;同 cwd 下次 **Codex** 启动时按需引用回来给你。这就是统一记忆的全部意义 — 每次切 CLI 不用手动重新解释。

## Project 页面你会看到的标签

除上面 5 层外,Project 页面(`/memory/project`)还展示 Phase A-D 落地的三个运维面向收件箱:

- **Health** *(Phase A)* — 第一个标签。两个记忆子系统的聚合信号(本周新事实 / journal 条目、捕获引擎触发、plan/goal 年龄、待处理提议、最高命中事实、零命中陈旧事实数)。
- **Inbox** — agent 提议的 goal/plan 编辑,等待你批准(通过 `project_goal_set` / `project_plan_set` MCP 工具提交)。
- **Conflicts** *(Phase C/D)* — 跨层矛盾探测器收件箱。每行展示两个相互冲突的主张 + LLM 证据 + Accept / Dismiss 按钮。Phase D 加了每侧的 "Delete A / B" 快速操作,带预览 + 确认对话框,让你在扣动扳机前看到完整事实文本。
- **Cleanup** — LLM librarian 对 layer-5 事实的保留 / 陈旧 / 重复队列(第 11 节涵盖)。

## 接下来

- **02 — 日常工作流** 走一遍设定 goal/plan、审 agent 提议编辑、读 journal 条目。
- **03 — 扫描器 & 清理器** 涵盖自动管理的 L1 / L4 / L5 维护(技术栈扫描器、git 活动总结器、LLM 清理 librarian)。
- **04 — 重置 & 故障排查** 涵盖 Reset 操作、孤儿 scope_keys、M22 隔离保证。
