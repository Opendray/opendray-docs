# 备份 — 概览

opendray 为网关积累的数据提供了两张互补的安全网:

- **A — 灾难恢复备份**(`/backups`)。加密的完整 PostgreSQL
  dump,写到可插拔的存储目标。手动触发或循环计划。瞄准的是
  "盒子挂了,在新机器上恢复"。
- **C — 数据导出**(`/export`)。一次性的 zip 包,包含选定
  的逻辑实体(记忆、集成元数据、自定义任务)。瞄准的是
  "我想把我的数据带走"。

两者共用一个 cipher(AES-256-GCM,key 通过 PBKDF2 从
`OPENDRAY_BACKUP_KEY` 环境变量派生)。没设置那个环境变量,
整个特性都关闭 — 见下面的 Quickstart。

## 为什么有两个表面

| 问题 | A | C |
|---|---|---|
| 里面是什么? | 完整 PG dump + config.toml + manifest | 几张 JSONL 表 + manifest,没有 dump |
| 加密的吗? | 整个 bundle(tar.gz 在 AES-GCM 流里)| zip 是明文;敏感字段 per-row 包裹 |
| 由什么触发? | 手动 / 调度器 | 手动 |
| 最适合什么? | 恢复整个 opendray 实例 | 迁移、审计、"把我的数据给我" |
| 恢复工具? | 解密后用 `pg_restore` | 未来的导入流程(v1.1)|

## 备份能去哪儿

六种目标类型,覆盖用户存储习惯的 ≈99%:

- **`local`** — opendray 主机上的目录(默认回退)
- **`smb`** — Windows 共享、家用 NAS(Synology / QNAP / UNAS)
- **`s3`** — AWS S3、Cloudflare R2、B2、MinIO、阿里云 OSS、腾讯云 COS、…
- **`webdav`** — Nextcloud、ownCloud、群晖 DSM、Box、坚果云、…
- **`sftp`** — 任何 SSH 可达的服务器(VPS、Hetzner Storage Box)
- **`rclone`** — 直通到 70+ 个额外后端(Google Drive、
  OneDrive、Dropbox、百度网盘、阿里云盘、…)

per-kind 字段列表见 **Targets**。所有敏感字段(密码、密钥、
私钥)都用主备份口令(passphrase)做 AES-256-GCM 静态加密。

## v1 不包含什么(范围裁剪)

- **没有反向恢复 import** — 恢复通过 `pg_restore` 重放一个
  `pg_dump`。`/export` zip 有自己的导入流程
  (`/export → Import section`)。
- **没有 PITR / WAL 归档** — pg_dump 是某一时刻的快照,不是
  持续的日志。对于 sub-hour 级别 RPO,在 opendray 之上用
  PostgreSQL 自己的 WAL 归档。
- **没有自动 key 轮换** — 丢了口令(passphrase),就丢了
  解密之前备份的能力。把 Backups 页显示的 key 指纹记到你的
  密钥管理器(Vaultwarden、1Password 等)里。
- **没有编辑 target 的 UI** — 要改一个 target 的配置(比如
  轮换 S3 凭据),删除 + 重建。v1.1 再做。
