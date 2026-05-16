# 备份 — 目标

*目标* 就是 "加密 bundle 最终落到哪里"。opendray 自带
**6 种目标类型**,覆盖用户想把备份放到的位置的 ≈99%。它们都
在持久化到 `backup_targets.config` 之前,用主备份口令把敏感
字段(密码、密钥、私钥)做 AES-256-GCM 加密;敏感东西永远
不会出现在 API 响应或 PG dump 里。

| 类型 | 覆盖什么 | 快速示例 |
|---|---|---|
| `local` | 单机、Docker 卷、挂载的外部硬盘 | `~/.opendray/backups/` |
| `smb` | Windows 共享、家用 NAS(Synology / QNAP / UNAS)| `//192.168.9.8/Claude_Workspace` |
| `s3` | AWS S3、Cloudflare R2、B2、MinIO、阿里云 OSS、腾讯云 COS、... | `s3://opendray@s3.amazonaws.com` |
| `webdav` | Nextcloud、ownCloud、群晖 DSM、Box、坚果云 | `https://cloud.example.com/dav/` |
| `sftp` | Hetzner Storage Box、自托管 VPS、家用 Linux | `backup@vps.example.com:22` |
| `rclone` | 70+ 额外(Google Drive、OneDrive、Dropbox、百度网盘、阿里云盘、...)| `gdrive:opendray-backups` |

在 **`/backups → Targets`** 或 **`/settings → Backup →
Where backups go`** 添加或编辑 target。两个表面用同一个
TargetEditor 对话框,带有 kind 特定字段。

---

## `local`

把 blob 写到运行 opendray 的同一主机上的目录。

- 默认根:`~/.opendray/backups/`(或 `cfg.backup.local_dir`)。
- 原子操作:先写到 `.<id>.tar.gz.enc.part` 再重命名。写到
  一半崩溃只会留下临时文件;下一次调度器 tick 把它 GC 掉。
- `local` target 在首次启动时自动创建。

**什么时候用**:开发 / 单服务器,或者作为一个暂存目录,让
操作系统级的 rsync / Tailscale 挂载卷把它复制到别处。

**取舍**:绑死在一台机器上 — 盒子挂了备份就跟着挂。要做
真正的灾难恢复,把 `local` 配上至少一个 off-host target。

---

## `smb` (CIFS / Windows 共享)

通过一个纯 Go SMB2 客户端写到任何 SMB / CIFS 共享(不依赖
主机 `cifs-utils`,所以在非特权 LXC 或 Docker 容器里也能用)。

| 字段 | 示例 |
|---|---|
| Host | `192.168.9.8` |
| Port | `445`(默认)|
| Share | `Claude_Workspace` |
| User | `linivek` |
| Password | 加密存储(AES-GCM) |
| Path prefix | `opendray/backups` |

**什么时候用**:家用 NAS 设备(Synology / QNAP / UNAS)、
Windows 文件服务器、AD 加入的共享。

**Test connection** 在 `<share>/<path_prefix>/.healthcheck-<random>`
下做一次真实的 write+remove 探测。

---

## `s3` — 兼容 S3

单一 target 类型,跟 **每一个兼容 S3 的服务** 说话。给你的
provider 配置正确的 `endpoint`:

| Provider | Endpoint | Region |
|---|---|---|
| AWS S3 | `s3.amazonaws.com`(或 `s3.<region>.amazonaws.com`)| 比如 `us-east-1` |
| Cloudflare R2 | `<account-id>.r2.cloudflarestorage.com` | `auto` |
| Backblaze B2 | `s3.<region>.backblazeb2.com` | 比如 `us-west-001` |
| 阿里云 OSS | `oss-<region>.aliyuncs.com` | `oss-cn-shanghai` 等 |
| 腾讯云 COS | `cos.<region>.myqcloud.com` | `ap-shanghai` 等 |
| MinIO 自托管 | `minio.local:9000` | `us-east-1`(或任意)|
| DigitalOcean Spaces | `<region>.digitaloceanspaces.com` | 比如 `sgp1` |
| Wasabi | `s3.<region>.wasabisys.com` | 比如 `us-east-1` |

必填字段:`endpoint`、`region`、`bucket`、`access_key`、
`secret_key`。可选:`path_prefix`、`use_ssl`(默认 true)、
`path_style`(legacy / MinIO)。

**什么时候用**:云优先部署,或操作员想要分层耐久性
(R2 10 GB 以下免费、B2 便宜、AWS Glacier 用于归档)。

**Test connection** 跑 `BucketExists`(HEAD `/<bucket>`)然后
一个 write+remove 探测 — 确认凭据 AND 写权限。

**成本旋钮**:如果你保留很多备份,在 provider 上启用 bucket
生命周期规则,做 "N 天后转 IA / Glacier"。

---

## `webdav`

向任何会说 class-2 WebDAV 的 HTTP(S) 服务器发标准 WebDAV
PUT / GET / DELETE / PROPFIND 请求。

| 字段 | 示例 |
|---|---|
| Base URL | 完整 URL,含末尾斜杠,比如 `https://cloud.example.com/remote.php/dav/files/me/` |
| User | 通常是用户名;某些服务这里是 app password |
| Password | 加密存储(AES-GCM) |
| Path prefix | `opendray/backups` |

**provider 特定的 URL 形状**:

```
Nextcloud:   https://cloud.example.com/remote.php/dav/files/<user>/
ownCloud:    https://cloud.example.com/remote.php/webdav/
Synology:    https://nas.local:5006/    (DSM Web Station + WebDAV)
Box.com:     https://dav.box.com/dav
Jianguoyun:  https://dav.jianguoyun.com/dav/   (use a "third-party app" password)
```

**什么时候用**:自托管云,以及 "我有一个 app password 但没
S3" 的场景。

**Test connection** 对 `/` 做 PROPFIND,然后在
`<base>/<path_prefix>/.healthcheck-<random>` 下做一次
write+remove 探测。

**限制**:gowebdav 没有流式上传,所以 opendray 先把 bundle
spool 到一个临时文件。对于 ≤ 1 GiB 的备份是可接受的;更大
应该用 SFTP 或 S3。

---

## `sftp`

通过 OpenSSH 的 SFTP 子系统写。对任何启用了 `internal-sftp`
或 `sftp-server` 的 SSH 服务器都能用(每个 Linux 发行版默认
都有)。

| 字段 | 示例 |
|---|---|
| Host | `vps.example.com` 或 `192.168.1.50` |
| Port | `22`(默认)|
| User | `backup` |
| Password | 密码 OR key passphrase(配合 `private_key` 时)|
| Private key | OpenSSH/PEM 私钥的完整 PEM 内容 — 密码认证时留空 |
| Host key | 来自 `ssh-keyscan host` 的 `ssh-ed25519 AAAA…`(非 LAN 目标推荐固定)|
| Path prefix | 绝对(`/var/backups/opendray`)或相对 home(`opendray-backups`)|

**认证模式**:
- 设了 `password`、`private_key` 空 → 密码认证
- 设了 `private_key` → 公钥认证;如果同时设了 `password`,
  它被当作 key passphrase
- 都为空 → 创建时拒绝

**Host key 固定**:`host_key` 留空会禁用固定(ssh-然后-信任)。
强烈建议给任何非 LAN target 固定 — 否则 L3 上的 MITM 能捕获
加密 bundle 上传(它仍然被 opendray 的 cipher 静态加密,但
host key 固定是纵深防御)。

**什么时候用**:任何你能 SSH 进去的主机。Hetzner Storage Box
(`<user>@<user>.your-storagebox.de`)、自托管 VPS,甚至你
家用 Linux 桌面机带端口转发。

**Test connection** 打开 SSH+SFTP、mkdir prefix、write+remove
探测。

---

## `rclone`(直通 — 70+ 额外后端)

给上面没有原生支持的后端用。要求在 opendray 主机上装好
**rclone CLI**:

```bash
brew install rclone        # macOS
apk add rclone             # Alpine (in your LXC / Docker)
curl https://rclone.org/install.sh | sudo bash    # generic
```

然后在操作员主机上,交互式配置你的 remote:

```bash
rclone config
# > n (new remote)
# > name: gdrive
# > storage: 13 (Google Drive)
# > follow OAuth prompts
```

在 opendray 里,加一个 kind 为 `rclone`、`remote = "gdrive"`
(无冒号)的 target。可选:`path_prefix`、`binary_path`
(覆盖 PATH 查找)、`config_path`(覆盖
`~/.config/rclone/rclone.conf`)。

**rclone 解锁的后端**(示例 — 完整列表见
[rclone.org/docs](https://rclone.org/docs/)):

```
Google Drive · OneDrive · Dropbox · iCloud-via-WebDAV
Baidu Pan (百度网盘) · Aliyun Drive (阿里云盘, via aliyundrive-fuse) · pCloud · Mega
Microsoft Graph (SharePoint) · Yandex Disk · Mail.ru Cloud
HiDrive · Internet Archive · Jottacloud · Koofr · Mailbox.org
Mega · Memory (testing) · Microsoft OneDrive · OpenStack Swift
Oracle Cloud Storage · pCloud · premiumize.me · QingStor
SeaTable · Seafile · Sharepoint · SugarSync · Tardigrade · Yandex
…and ≈40 more
```

**什么时候用**:
- 消费者云存储(Google Drive / OneDrive / Dropbox)
- 中国大陆服务(百度网盘 / 阿里云盘),那里直接 API 访问
  对重写备份工具是敌对的
- rclone 原生支持的任何其他东西

**取舍**:多一个依赖(rclone 二进制),per-op 子进程
spawn。吞吐对备份频率(每天跑、几分钟之间)是 OK 的,但
对流式重型负载不太行。原生 target 在可用时优先。

**Test connection** 跑 `rclone lsd <remote>:<path_prefix>` —
确认认证 + 可达性 +(可选)在 prefix 文件夹不存在时创建它。

---

## 什么被持久化

PG 里的 `backup_targets` 持有:

- `id` — 操作员选的或自动生成的(`tgt_…`)。
- `kind` — 上面 6 种之一。
- `config` — JSONB。敏感字段(`password`、`secret_key`、
  `private_key`)在写入之前用主备份口令做 AES-256-GCM
  包裹 — 单独泄露 DB 行不会暴露凭据。
- `enabled` — false 时,target 保留配置但被排除在运行时
  注册表外(在切到 on 之前不能被备份选用)。

`GET /api/v1/backup-targets` 总是返回 redacted 配置 —
敏感 key 返回为 `"********"` 字符串。明文形式只在两个地方
存在过:运行中的 opendray 进程内存里、和操作员的密钥管理器
(外部 — opendray 不试图暴露密文)。

## v1 仍缺什么

- **编辑现有 target** — TargetEditor 只处理创建。要改一个
  target 的配置,删除 + 重建。v1.1 再做。
- **空闲空间报告** — UI 不查 target 的容量。目前操作员在
  存储层监控卷 / 配额。
- **多 target 计划** — 一个计划写到一个 target。"镜像到两个
  target" 需要两个计划。
