# 备份 — 快速开始

特性 **默认关闭**。两个环境变量打开它:

```bash
export OPENDRAY_BACKUP_ENABLED=1
export OPENDRAY_BACKUP_KEY="$(openssl rand -base64 32)"
```

重启 opendray。Backups 页现在应该出现在侧边栏的 Platform 下。

## 记下 key 指纹

`/backups` 顶部横幅显示一个 16 字符十六进制
**Key fingerprint** — 那是 SHA-256(派生密钥) 的前 8 字节。
每一行备份都盖上这个指纹;之后恢复时,会拒绝那些存储的指纹
与当前运行口令不匹配的 blob。

**把这个指纹和你的口令一起存到 Vaultwarden 或者你的密钥
管理器里。** 如果指纹变了(口令轮换过),之前的备份在全新
安装上就不可读了。

## pg_dump 前置条件

opendray shell out 到 `pg_dump`。二进制的主版本必须 ≥ 你的
PostgreSQL 服务器主版本。在 LXC / Docker 部署里你通常需要:

```bash
apk add postgresql<MAJOR>-client     # alpine
apt-get install postgresql-client-<MAJOR>  # debian / ubuntu
```

Backups → Status 横幅显示 `pg_dump --version` 报告的版本;
如果它是空的,触发按钮就禁用。

## 拿第一份备份

1. 去 `/backups`。
2. 确认绿色 "ok" 横幅显示了 key 指纹和 pg_dump 版本。
3. 点 **Backup now**("include config.toml" 保持开)。
4. 那一行出现时状态是 `running`,然后变成 `succeeded` —
   一个小实例典型耗时:1-3 秒。
5. 点 **下载箭头** 拿到 `<id>.tar.gz.enc`。

## 验证 bundle(不实际恢复)

`examples/verify-backup` 自带一个一次性的 Go 程序,证明
bundle 能闭环回放,不需要 target 服务器:

```bash
go run ./examples/verify-backup \
  ~/.opendray/backups/2026/05/<id>.tar.gz.enc \
  "<your OPENDRAY_BACKUP_KEY>" \
  $(which pg_restore)
```

输出:

```
cipher fingerprint: e344173f214c7641
entry: manifest.json         431 bytes
entry: config.toml           1081 bytes
entry: dump.bin              91693 bytes

manifest fingerprint: e344173f214c7641
backup_id: bk_t53gcylshov5fylcd2szul
pg_version: 17.9
version: 1

--- pg_restore --list output (header only) ---
;     dbname: opendray_v2
;     TOC Entries: 108
…
```

程序通过 Cipher.Open 解密、untar 到 /tmp、运行
`pg_restore --list`(不需要数据库)来确认 dump.bin 是结构上
有效的 PostgreSQL 自定义格式 dump。

## 从 UI 恢复

`/backups → Restore from file` 接受一个 bundle,把它通过
`pg_restore` 跑到你挑的 DSN 上。安全流程(在恢复到 opendray
自己的数据库上时要输入 "I understand")见 "restore-and-import"
教程章节。
