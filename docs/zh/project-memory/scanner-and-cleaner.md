# 扫描器 & 清理器 — 自动管理的记忆

记忆系统的三个部件自主运行,不需要你输入 — 值得理解,因为它们塑造每个 agent 看到的启动横幅和你 triage 的清理队列。

## 项目扫描器(L1 — tech_stack)

位于 `internal/projectscan/`。便宜、确定性、无 LLM 介入。

**触发**:

- 每次启动检查该行的 `updated_at`;早于 **6h** 则在 agent 启动**前**触发同步重扫。
- `POST /api/v1/project-scan/run`,如果你想强制。

**它捕获什么**:

- 通过标记文件识别技术栈: `go.mod` → Go;`package.json` → Node.js;`pubspec.yaml` → Flutter;`pyproject.toml` → Python;`Cargo.toml` → Rust;`Gemfile` → Ruby;`pom.xml` → Java;`Dockerfile` → Docker;`migrations/*.sql` → PostgreSQL。
- 可发现时的版本(轻量解析标记文件)。
- 当前 git 分支 + HEAD 短哈希。
- 顶层目录布局(深度 1,跳过 `.git`、`node_modules`、`target` 等)。
- 入口点启发(Go 的 cmd 二进制、Flutter 的 `lib/main.dart` 等)。

输出落到 `project_docs.kind='tech_stack'`,在每个启动横幅 `### Tech stack & structure` 下原文渲染。

**为什么 6h 缓存**: 重扫便宜(约 50ms)但启动延迟要紧。6h 足够在工作日内吸收依赖添加和 commit 变动。如果之后需要更新数据,启动一下就行(下次会话触发刷新)。

## Git 活动总结器(L4 — recent_activity)

位于 `internal/gitactivity/`。**LLM 驱动**,更贵,跑得更少。

**触发**:

- 后台 24h 调度 ticker。
- 每次启动检查陈旧度;早于 **12h** 触发**异步**刷新(当前启动看到的是上一次的摘要;下次看到新的)。

**它做什么**:

1. shell 跑 `git log --since="7 days ago" --stat --no-merges`,用严格字段分隔符,这样输出能明确解析。
2. 构建确定性引言(commit 数、文件数、净行数、按 commit 数算的热路径文件)。
3. 把结构化数据发给配置好的 summarizer 供应商(LM Studio、ChatGPT-OAuth,或任何 OpenAI 兼容端点)。
4. 要求 1-3 段叙述 + 一节"对接下来的会话: 避免 X / 专注 Y"提示。
5. 持久化为 `project_docs.kind='recent_activity'`。

结果出现在 Project → **Activity** 标签,以及启动横幅的 `### Recent activity` 下。

如果没配 summarizer 供应商,总结器回落到原始统计(窗口 + commit 数 + 热路径) — 仍有用,只是少了叙述。

## 清理 librarian(L5 维护)

位于 `internal/memory/cleaner/`。维护第 11 节的离散事实存储,**不**是上面的 project_docs。

**为什么**: 有 `memory_store` 权限的 agent 倾向于在持久事实旁边写临时噪声。即便有 **M12 gatekeeper** 在写入时拒绝"正在调试 X"类条目,你仍会累积老化的事实 — 旧项目计划、陈旧基础设施细节、去重阈值差一点没拦住的重复。

**触发**:

- 24h 调度 ticker(通过 `[memory.cleaner].interval_seconds` 可配)。
- 手动: Project → **Cleanup** 标签 → "Run cleanup now" 按钮。

**它做什么**:

1. 每次为一个作用域选取至多 `batch_size`(默认 20)条老化合格的记忆。
2. 让 LLM 评判每条: `keep` / `stale` / `duplicate`(配 `merge_into` 目标)。
3. 每个判断写一行到 `memory_cleanup_decisions`,状态 `pending`。
4. **不执行任何东西**。所有删除 / 合并等你批准。

**Triage UI**:

- Project → **Cleanup** 标签 — 仅本 cwd 的决策。
- More → Memory → **Cleanup inbox** — 跨项目,按 scope_key 分组,在你离开一阵子、很多决策排队时有用。

每个决策行显示:

- 裁决徽章(`stale` 红、`duplicate` 灰、`keep` 描边)
- 记忆文本快照(决策时冻结)
- LLM 的理由(读它!)
- 可选 `merge_into` 目标(给 duplicate)
- Approve / Reject 按钮

**Approve**: 执行操作。`stale` → 记忆删除。`duplicate` → 合并入目标(目标 `deduped_count++`)。`keep` → 记忆冻结 `skip_if_decided_within_hours`(默认 168 = 1 周)期间不再被裁判。

**Reject**: 决策标为拒绝;记忆保持原样。LLM 之后会重判。

**校准检查**: 略读 10-20 条决策,问"理由是否和我会怎么判一致?"。如果 ≥ 80% 感觉对,librarian 已校准。否则,清理 prompt 或 summarizer 模型需要调整。

## 哪些**不是**自动管理

这些需要你的手:

- **Goal**、**Plan**: 你写。agent 提议;你在 Inbox 批。
- **清理批准**: 每个删/合/冻都需要运维门禁。
- **重置**: 抹除项目记忆需要明确的破坏性按钮(见第 04 节)。

自动 / 手动的划分是有意为之 — 自动那部分要么确定性(扫描器),要么运维可审(清理器提议,你批)。你绝不会撞上"系统静默扔掉了我昨天写的 plan"。
