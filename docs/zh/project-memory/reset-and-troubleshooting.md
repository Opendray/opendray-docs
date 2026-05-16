# 重置 & 故障排查

## 重置项目记忆

一个一等公民操作,在一个事务里抹掉所有按 cwd 的状态。适用于:

- 项目结束了,想清掉它的记忆。
- 项目的 goal / plan 根本错了,最快的修法是"从头再来"。
- 想要 benchmark / demo 的干净起点。

**在哪**:

- Web: Project 屏幕头部 → 描边 **Reset** 按钮(红字)
- Mobile: Project 屏幕 AppBar → 🔄 IconButton

**对话框**:

重置确认对话框在红横幅里显示 cwd,警告 **"Always deleted: goal, plan, proposals, journal, cleanup decisions"**。两个选择性勾选框:

| 勾选框 | 它做什么 | 默认 |
|---|---|---|
| Also delete scanner docs | 把 `tech_stack` + `recent_activity` 也清掉 | **关** — 它们下次启动反正会自动重建 |
| Also delete pgvector memories | 把第 11 节本 scope_key 的事实清掉 | **关** — 这是长期 agent 存的事实,可能很有价值;明确选择 |

按钮标 **"Delete forever"**,样式破坏性。确认就一次点击 — 没有"输入 cwd 确认",因为明确勾选流程加上横幅里的 cwd 对这种风险等级足够。成功 toast 显示每个表的具体删除条数。

底层: `POST /api/v1/project-docs/reset` 在单个事务里跑 doc / proposal / journal / cleanup-decision 删除;可选的记忆清空是 UI 在勾选框打开时的单独 `POST /api/v1/memory/delete-by-scope` 调用。

## 孤儿 scope_keys

检查 **Cleanup inbox** 或 Project picker 时你可能看到标 `orphan` 的条目:

```
PROJECT  /Users/    [orphan]    15 pending
```

这些是旧镜像导入的 bug 数据,把源路径截断到了像 `/Users/` 这样的片段。它们不是真实项目 cwd — 把它们作为项目打开会落到一个空 ProjectScreen,毫无意义。

孤儿启发: scope_key 含少于 2 个非空路径段。`/Users/` 有 1 个(只有 "Users")。真实项目如 `/tmp/foo` 或 `/Users/me/work/repo` 有 ≥ 2 个。

**处理**:

- **Cleanup inbox**: 孤儿组显示 `orphan` 徽章,丢掉 "Open project" 深链。你仍可逐行批 / 拒底层决策 — 对孤儿条目的 `stale` 裁决是清掉腐烂最快的方法。
- **Project picker**: 孤儿排到列表底部,视觉灰化(opacity-60),标警告图标。如果真需要你仍可导航进去。

要批量删除: 目前没有内置。SQL 可以:

```sql
DELETE FROM memories
  WHERE scope='project'
    AND array_length(string_to_array(trim(both '/' from scope_key), '/'), 1) < 2;
DELETE FROM memory_cleanup_decisions
  WHERE memory_scope='project'
    AND array_length(string_to_array(trim(both '/' from memory_scope_key), '/'), 1) < 2;
```

## 项目隔离保证(M22)

自动写会话结束摘要的 journaler(L5 的 L4)对对话跑 LLM。配错的 reader 可能取到不相关会话的 jsonl,LLM 会自信地总结错的工作 — 静默错误信息比没摘要更糟。

`internal/session/transcript.go` 里三道防御:

1. **缺 UUID 文件就 fail-closed**: 如果会话行的 `claude_session_id` 已设但具名 `*.jsonl` 不存在,reader 返回 nil — 绝不替换为"目录里最新 mtime"。
2. **时间窗过滤**: 即便打开了正确文件,每条解析的 turn 必须落在 `[startedAt - 30s, endedAt + 30s]`。更早启动累积的内容被过滤掉。
3. **Cwd 金丝雀**: 首条带 `cwd` 字段的 jsonl 条目必须精确匹配调用会话的 cwd。一处不匹配整个文件就被拒。

任一防御触发时,journaler 降级到仅元数据(不追加 `Agent activity summary` 节)。"我们不知道发生了什么"是正确的失败模式 — 绝不是自信地错的摘要。

如果你怀疑某 journal 条目被污染,SQL 检查:

```sql
SELECT id, cwd, content FROM session_logs
 WHERE content LIKE '%Agent activity summary%'
   AND content LIKE '%<some file path you didn''t expect to see>%';
```

…并把提到的文件路径对照实际会话 jsonl 的 tool_use 块。M22 build 之后的新条目应该干净;M22 之前的旧数据可能需要手动删除。

## SQL 食谱

### 看某 cwd 的所有东西

```sql
SELECT 'project_docs' AS source, COUNT(*) AS n FROM project_docs
 WHERE cwd = '/your/path'
UNION ALL
SELECT 'session_logs', COUNT(*) FROM session_logs
 WHERE cwd = '/your/path'
UNION ALL
SELECT 'cleanup_decisions', COUNT(*) FROM memory_cleanup_decisions
 WHERE memory_scope = 'project' AND memory_scope_key = '/your/path'
UNION ALL
SELECT 'memories', COUNT(*) FROM memories
 WHERE scope = 'project' AND scope_key = '/your/path';
```

### 检查 tech_stack 陈旧度

```sql
SELECT cwd,
       NOW() - updated_at AS age,
       length(content) AS bytes
  FROM project_docs
 WHERE kind = 'tech_stack'
 ORDER BY updated_at;
```

任何 `age > 6 hours` 的会在下次启动到该 cwd 时触发同步重扫。

### 清理器决策质量略读

```sql
SELECT verdict, status,
       substring(memory_text_snapshot, 1, 50) AS preview,
       substring(reason, 1, 80) AS llm_reason
  FROM memory_cleanup_decisions
 ORDER BY created_at DESC LIMIT 20;
```

略读 `llm_reason` 列。如果 ≥ 80% 你读着合理,librarian 已校准。否则,清理 prompt 或模型需调整。

## 什么时候求助

- 启动注入文本看起来损坏或项目错了 → 检查 cwd 匹配启动的 cwd(大小写敏感!),扫描器已刷新。
- Journal 条目缺 `Agent activity summary` 节 → 可能是 M22 隔离启动了(好事!),或者 summarizer 供应商没配,或者会话太短触发 LLM "too sparse" 防护。在服务器日志查 `journaler: transcript fetch failed` 或 `journaler: llm summarise failed`。
- 清理决策堆积 → 要么你 triage 落后,要么 librarian 误分类。略读 20 条决断。
