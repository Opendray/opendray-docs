# Claude 本地记忆镜像

Claude Code v2.1+ 有自己的记忆功能 — 当模型认为某事值得记住时,它会写一个 markdown 文件到项目的 Claude 目录下:

```
~/.claude-accounts/<account>/projects/<encoded-cwd>/memory/<topic>.md
~/.claude/projects/<encoded-cwd>/memory/<topic>.md
```

没有任何干预时,这些记忆对同一项目里的 Codex 和 Gemini 会话**不可见** — 跨 CLI 价值主张就破功了。

opendray 的**镜像**关闭了这个缺口。每次启动会话(任意供应商 — claude、codex、gemini、shell),opendray 都会遍历该会话 `cwd` 相关的记忆目录,把每个 `.md` 文件以项目作用域记忆形式摄取进 pgvector。下一次任何该 cwd 下 CLI 调用 `memory_search` 就能看到它们。

## 镜像读取什么

对于 `cwd=/Users/x/myproj` 的会话,镜像扫描:

- `~/.claude/projects/-Users-x-myproj/memory/*.md`
- `~/.claude-accounts/<account>/projects/-Users-x-myproj/memory/*.md`(`~/.claude-accounts` 下每个账户目录;通过 `EvalSymlinks` 去重,因为多账户配置通常会把 shared/projects → 各账户做软链)

名为 `MEMORY.md` 的文件会被跳过 — 那是 Claude 的索引文件(指向真正记忆主题文件的链接列表)。

## 存进去的是什么

每个 `.md` 变成一条记忆行:

```json
{
  "id":         "mem_…",
  "scope":      "project",
  "scope_key":  "/Users/x/myproj",
  "text":       "<full file contents, frontmatter included>",
  "embedder":   "bm25",
  "metadata": {
    "source":        "claude_local_memory",
    "source_path":   "/Users/x/.claude-accounts/.../preference_pnpm.md",
    "source_mtime":  "2026-05-04T10:00:36Z",
    "source_hash":   "cb42172e3648cf56"
  },
  "created_at": "…"
}
```

完整文件内容(frontmatter + 正文)成为记忆的 text。这是故意的 — frontmatter 里有结构化字段(`name`、`description`、`type`),BM25 会和正文一起索引,未来的结构化摄取器可以把它们解出来。

## 幂等性

镜像在**每次**启动会话时运行。为了避免重复摄取,它按 `metadata.source_path + source_mtime` 去重:

- 同路径、同 mtime → 已摄取,跳过
- 同路径、更新的 mtime → 摄取为新行(不去重;让 inspector 手工删除过时的)
- 新路径 → 摄取

所以如果 Claude 今天写了 5 个文件,你今天启动了 10 个会话,每个新会话都会看到这 5 个文件但跳过重复摄取。

## 什么时候运行

在 catalog adapter 的 PrepareFunc 里,agent 进程即将启动之前:

```go
if sp.memoryMirror != nil {
    cwd := session.Cwd(prepareCtx)
    if cwd != "" {
        go func() {
            sp.memoryMirror(context.Background(), cwd)
        }()
    }
}
```

Fire-and-forget goroutine — 启动不会因文件系统遍历或嵌入调用而阻塞。agent 可能抢跑,在镜像完成前调用 `memory_search`;实践中,镜像对 Claude 实际写的那类记忆目录只要 <100ms,agent 第一次工具调用也不会那么快。

## 按需同步

Memory 页面(左侧栏 🧠 → `g m`)有 **Sync .md** 按钮,可按需对当前 scope_key 运行同一摄取器。下列情形使用:

- 你在编辑器里改了 Claude 记忆文件,但不想为了镜像而启动新会话。
- 活跃会话里的 agent 写了新 `.md`(进行中的会话在你同步前看不到)。

按钮限定 `scope = project` — 那是镜像唯一作用的作用域。它是幂等的(同 path+mtime 是 no-op),所以猛点也无害。toast 会报告本次新摄取了多少文件。

## 它**不做**什么

- **没有 fsnotify**: 镜像只在会话启动或你点手动 Sync 按钮时运行 — 从来不是实时。写入文件的活跃 agent 在下次同步前不会在搜索中看到自己写的内容。
- **没有反向同步**: opendray 存的记忆不会写回 Claude 本地文件。Claude 是写源;opendray 是统一读源。
- **Codex / Gemini 本地记忆**还没被镜像。它们的存储格式不太标准化(Codex rollouts 是按会话 JSONL,不是按项目 markdown);我们会在它们约定稳定时加摄取器。

## 禁用

没有开关 — 只要记忆启用,镜像就在每次启动时运行。如果你不要这个,你的选项是:

- 干脆别启用记忆(`[memory] backend = "off"` — TODO,尚未暴露)。
- 每次启动后从 inspector 删掉镜像行(不推荐;繁琐)。
- 把不想被索引的目录移出 Claude 的项目树。

实践中,镜像就是跨 CLI 价值主张 — 关掉它基本就废掉了 opendray 记忆层的意义。

## 存储成本

每个 `.md` 通常变成一个 384-float 的 BM25 向量(约 1.5KB),加上原文(1-3KB),加上元数据(约 200B)。每项目 50 条 Claude 记忆,大约 250KB。Postgres 处理这个轻松无压力;没有实际上限。

## 验证

Memory 页面 → 展开任意行。`source = claude_local_memory` 的记忆是从 Claude `.md` 镜像来的。元数据显示原始文件路径 + mtime,当你想知道"这条事实从哪来的?"时很有用。

或者通过 SQL:

```sql
SELECT id, scope_key, metadata->>'source_path' AS path
FROM memories
WHERE metadata->>'source' = 'claude_local_memory'
ORDER BY created_at DESC LIMIT 20;
```
