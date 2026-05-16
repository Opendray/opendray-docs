# 备份 — 恢复(A)和导入(C)

两个表面的反方向在 v1 里都有。`/backups` 有一个 "Restore
from file" 按钮(把一个加密 bundle 重放到 PostgreSQL);
`/export` 长出了一个 Import 章节(把一个导出 zip 重放到活
表里)。

## A — 从一个 `.tar.gz.enc` bundle 恢复

当盒子挂了你在全新 opendray 实例上重建时,OR 当你想把单个
实例回滚到更早的快照时,用它。

### 前置条件

产生 bundle 的 **同一个** `OPENDRAY_BACKUP_KEY` 必须在运行的
opendray 上设置。manifest 盖了 key 指纹;恢复会拒绝那些指纹
与运行中 cipher 不匹配的 bundle。

`pg_restore` 必须在 PATH 上(或 `cfg.backup.pg_restore_path`),
主版本 ≥ bundle 的 `pg_version`。

### 两种模式

| Target DSN | 发生什么 | 确认 |
|---|---|---|
| **空**(默认)| 恢复到 opendray 自己的数据库(危险 — drop + 重放每张表)。| 要求输入 `I understand`。|
| **显式 DSN** | `pg_restore --dbname=<your DSN>` 跑到外部 / 并行 DB 上。opendray 运行时 DB 不受影响。| 除 admin 认证外无其他。|

`--clean --if-exists` 默认开(重放前 drop 表)。只在你恢复
到一个全新创建的空 DB 时关掉。

### 什么被恢复

bundle 的 `dump.bin` 是 opendray 每张表的
`pg_dump --format=custom` — sessions、memories、integrations
(api_key_hash bcrypt blob 原样)、audit 等。tar 里的
`config.toml` 条目 **不会** 被自动应用;如果你想合并进去,
手动做。

### 审计

恢复是一次性的操作员动作;结果活在 slog 里(见
`/settings/server` 日志查看器)外加 API 响应里的
`pg_restore_output` 字段。不创建 DB 行 — 恢复数据库会把它
擦掉。

## C — 导入一个 `.zip` 导出 bundle

用它把记忆 / 集成 / custom_tasks 从一个 opendray 迁到另一个,
或者在不动数据库其他部分的情况下回滚单个逻辑章节。

### v1 冲突策略

| 实体 | 冲突 key | 冲突时行为 |
|---|---|---|
| Memories | `id` | 跳过(已有行胜出)。|
| Integrations | `id` 和 `route_prefix`(UNIQUE)| 跳过。|
| Custom tasks | `id` | 跳过。|

Import 行的 `counts` 字段报告每个实体的明细
(created / skipped / failed)。

### 记忆:embedder 注意事项

被导入的记忆写入时带 `embedder = 'imported_v1'` 和 NULL
的 embedding 列。Search() 在你触发一次重新 embed 通行之前
忽略它们。

导入之后:

1. 去 `/memory`。
2. 打开 Maintenance tab(右上角)。
3. 点 **Re-embed all under current embedder**。

重新 embed 用的是接收方 opendray 跑的任意 embedder(BM25 /
HTTP / LocalONNX)— 不要求发送方实例用了同一个。

### 集成:认证注意事项

bundle 永远不携带明文 API key(opendray 只存 bcrypt 哈希)。
导入时,集成行到达时带:

- `enabled = false`(所以即使误操作也够不到)
- `api_key_hash = "imported:no-plaintext-key-rotate-before-use"`
  (一个非 bcrypt 哨兵 — 没有明文能通过它的校验)

在集成能再次认证之前,**从 integrations 页轮换 key**。
opendray 一次性返回新的明文;把它记到你的密钥管理器,配置
给调用方。

### 审计轨迹

每一次导入尝试 — 成功或失败 — 都会写一行到 `imports` 表。
`/export` 上的 History 面板显示最近 20 次尝试以及 per-entity
计数。失败的章节不会让整个导入中止;行的 `error` 字段捕获
第一个失败的章节,你可以滚 slog 看细节。
