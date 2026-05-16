# 记忆 — 维护

一旦记忆接通,agent 开始存事实,有三个运维工具处理日常维护。它们都在专门的 **Memory** 页面(左侧栏 → 🧠 Memory,快捷键 `g m`)。

## Memory 页面一览

独立的顶级路由,刻意从 `Settings → Memory` 分出来,这样运行时浏览不和配置草稿共享屏幕空间。

页面包含:

- **Active embedder 状态条** — gateway *当前*每次 `memory_search` / `memory_store` 使用的 embedder。如果它和 Settings 里输入的不一致,说明你有未保存的配置 — Save + Restart server 应用。
- **Migration 横幅** — 仅在存在与当前 embedder 不同的记忆时显示。详见 [Reembed](#reembed)。
- **Scope + scope_key** 配 "Pick" 下拉,既显示*之前保存过*的 scope_keys,也显示*活跃会话*的 cwds,这样你不用敲长路径。**Sync .md** 按钮(仅 project 作用域)重新摄取该 cwd 的 Claude 本地记忆文件。
- **搜索栏** — 语义搜索;按 Enter 运行。
- **行** — 每条记忆的 id、相似度(搜索结果时)、hit 计数、时长、edit (✏) / delete (🗑) 按钮。

## Hit 计数

每次成功搜索都会为返回的记忆(阈值过滤后)bump `hit_count` 和 `last_hit_at`。这个 bump 是后台 goroutine 的 fire-and-forget,从不拖慢搜索响应。

它告诉你什么:

- **零命中 + 久远的 `created_at`** — agent 存了这条事实但没人查过。Claude 探索时写的噪声记忆很常见。可以放心删。
- **高命中 + 近期 `last_hit_at`** — 承重事实。即便要按长度修剪也保留。
- **高命中但陈旧的 `last_hit_at`** — 主题不再相关。记忆可能还正确,但已不再驱动任何 agent 行为。

Inspector 在每行旁显示 hit 计数。悬停徽章看到绝对的"上次命中 N 小时前"时间戳。

## Reembed

opendray 的 pgvector 索引按 `(embedder, dim)` 分区。运行中切换 embedder 后端(最常见的是接通 ollama 后 **bm25 → http**,或切到离线 **http → local**)时,较老的记忆会悄无声息地不再匹配: 它们在数据库里,但向量是新 embedder 无法对比的。

Memory 页面会探测到并显示黄横幅:

> *"NN memories won't appear in searches: NN on bm25 — current embedder is http:nomic-embed-text. pgvector partitions its similarity index by embedder, so older entries are silent until reembedded."*

点 **Migrate** → 在对话框确认 → opendray 遍历每个不匹配的行,用当前 embedder 重算向量,**就地**写回(id、scope、scope_key、metadata、时间戳保留)。搜索立刻拿到迁移过的记忆 — 不需重启。

注意:

- 重新嵌入通过 HTTP 是同步的。HTTP 后端大约耗时 *N 行 × 你 embedder 每次调用延迟* — 笔记本上的本地 ollama 约 30 行/秒;OpenAI 受带宽限制但轻松 100+/秒。
- 本地 ONNX 后端(`-tags local_onnx`)受 CPU 限制,并行良好;每行预算约 10–15 ms。
- 失败(模型挂了、网络断)不会回滚已成功的行;报告显示 `examined / reembed / failed`,并列前 20 个错误。重新运行从停下的地方继续。

## 手动 `.md` 同步

opendray 的镜像通常在会话**启动**时运行: 每次你在某个 cwd 启动新的 Claude / Codex / Gemini 会话,opendray 都会遍历 `<cwd>/.claude/projects/.../memory/*.md` 并摄取任何新东西(对 `source_path` + `source_mtime` 幂等)。

但如果 Claude 在活跃会话*期间*编辑了记忆文件,该编辑要到下次启动才会进入 pgvector。强制立即摄取:

1. Memory 页面 → 设 **Scope** = `project`,**Scope key** = 项目的 cwd。
2. 点 **Sync .md**。
3. Toast 报告新摄取的记忆数。没变化时显示零是正常的。

同步只读文件,从不写。不会有覆盖 Claude 本地状态的风险。

## 什么时候做什么

| 现象 | 工具 |
|---|---|
| `memory_store` 后新事实在搜索里看不到 | 重启?然后查 active embedder 状态条 |
| agent 忘了它昨天还知道的事 | 黄色 Migrate 横幅 — 更老的 embedder 还存着 |
| Inspector 全是没人用的事实 | 按 `hit_count = 0` 排序,删 |
| 编辑了 Claude `.md`,想*现在*就索引 | **Sync .md** 按钮 |
| 想要全新起点 | 浏览 → 选当前作用域全部 → 删(还没批量按钮;手动) |

## 哪些*没有*自动化

- **定期 re-mirror** — opendray 不轮询文件系统。按需用 **Sync .md**,或者干脆启动新会话。
- **Hit-count GC** — 没有自动删除策略。Inspector 把陈旧记忆呈现出来;修剪刻意手动,以免坏启发式让你失去承重事实。
- **备份** — pgvector 数据在你已有的 PostgreSQL 里。`pg_dump` `memories` + `memory_index_state` 表是恢复路径;opendray 不在上面加什么。
