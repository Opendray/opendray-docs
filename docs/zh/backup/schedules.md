# 备份 — 计划

*计划* 是 "每 N 秒自动拿一次备份,把超过保留 N 行之外的剪掉"。

## 节奏

v1 用简单的 **interval** 调度,不是 cron 表达式。在 New
schedule 对话框(`/backups` 上的 Schedules tab)里选 "每
24 小时 / 6 小时 / 30 分钟"。cron 语法推迟到 v1.1。

一个调度器 goroutine 每 30 秒醒来一次,然后:

1. 通过 `SELECT … FOR UPDATE SKIP LOCKED LIMIT 1` 原子地认领
   一个到期的计划。多个 opendray 实例在同一张表上能安全协作。
2. 同步跑备份(同一个 opendray 实例内对同一计划串行 — 没有
   并行运行)。
3. 成功后应用保留:per-target 保留 N 个最近的 `succeeded`
   备份,其余软删除(它们的 blob 从 target 移除;行保留在
   `status='deleted'` 以便审计)。

## 保留语义

`retention = 7` 意味着 "per-target 永远保留 7 个最新的成功
备份"。失败和被删的行不计 — 只算 `succeeded` 的。UI 默认 7;
底线是 0(意味着 "拿完就立刻删每个成功的备份",只在烟雾
测试场景下有意义)。

## 崩溃时发生什么

- 卡在 `status='running'` 的备份行(因为 opendray 在流水线
  中途崩了),1 小时后用一个清晰的标记错误重置为 `failed`。
  重置在下次启动时自动跑。
- 一个在运行中途崩的计划,它的 `next_run_at` 已经被 bump 过
  了;失败的运行在 `backups` 表里,所以你能看到为什么失败,
  而它不会阻塞节奏。

## 禁用 vs 删除

计划的 `enabled` 切换和删除是分开的。想暂停又不丢配置时切到
off。删除会移除计划但保留之前的备份(它们通过 `schedule_id`
关联,会变成 NULL — schema 用的是 `ON DELETE SET NULL`)。

被启用计划引用的 target **不能被删除**(`ON DELETE RESTRICT`)。
先禁用 / 删除计划。
