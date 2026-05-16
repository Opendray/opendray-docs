# 备份 — 导出(Plan C)

`/export` 是面向操作员的 **数据导出** 视图。和 `/backups`
(面向操作员的灾难恢复)是不同的,导出是选定逻辑实体的
一次性 zip 包。

## 什么时候用什么

| 需求 | 用 |
|---|---|
| "盒子挂了,全部恢复" | `/backups`(完整 PG dump)|
| "我想把记忆带到别的工具里" | `/export`(memories.jsonl)|
| "给我一份集成的审计轨迹" | `/export`(integrations.jsonl,元数据)|
| "WAL 回放 / 时间点恢复" | v1 范围外 |

## 范围标志

- **Memories** — `memories` 表里的每一行(text + scope +
  metadata + 命中次数)。Embedding 向量被略掉;导入方需要
  重新 embed。
- **Integrations** — 三种模式:
  - `none`(完全跳过 integrations 表)
  - `metadata`(推荐)— id、name、route prefix、scope;
    没有 API key 材料。
  - `plaintext` — opt-in。v1 没有可恢复的明文 key(一切都
    是 bcrypt 哈希),所以 bundle 会变成仅元数据,manifest
    里有一个 `notes[]` 条目记录这个事实。这个选项存在是为
    了让确认流程 + manifest 格式稳定下来,等 v1.1 加上明文
    key 缓存。
- **Custom tasks** — 操作员定义的任务,显示在 Inspector 的
  Tasks tab 里。

## Bundle 格式

```
<exp_…>.zip
  manifest.json       ← what's inside, key fingerprint, counts, notes[]
  memories.jsonl      ← one JSON object per line
  integrations.jsonl  ← one JSON object per line, sans api_key_hash
  custom_tasks.jsonl  ← one JSON object per line
```

跟灾难恢复备份不同,**zip 本身不加密**。里面的敏感 *字段*
(比如未来 v1.1 支持的明文 API key)按行 AEAD 包裹。原因:
操作员想能读 manifest + 计数,不用主口令,而真正敏感的材料
未来是 per-field 的。

## 生命周期

- bundle 活在 `cfg.backup.export_dir` 下(默认
  `~/.opendray/exports/`)。
- 每个 bundle 24 小时过期。调度器每 30s 收割过期文件,把
  行翻成 `status='expired'`。
- 下载既需要 admin bearer(页面已经强制)AND per-export 的
  `download_token`。token 通过 GET `/exports/{id}` 显示
  (列表视图把它脱敏)。
- 删除是手动的:点垃圾桶图标立刻移除文件并丢弃行。
