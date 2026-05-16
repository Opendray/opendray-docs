# Vault git 同步

opendray 可以按定时器把整个笔记 vault 自动 commit + 推送
到远程 git 主机。这是 vault 怎么在多个 opendray 主机之间
(笔记本 ↔ 家用服务器)保持一致、以及在单一主机挂掉时怎么
不丢笔记的方法。

## 前置条件

- opendray 主机上有 `git`(`which git` 返回一个路径)。
- vault 根目录有一个 `.git` 目录 **或者** opendray 会在
  首次运行时 `git init`。
- 配置好的 remote:
  - SSH:标准的 `git@github.com:...` URL,主机的 SSH key
    被信任。
  - HTTPS:在 Plugins → Git hosts 配置好 [Git 主机
    token](#plugins-git-hosts),这样 opendray 可以非交互
    认证。

## 配置自动同步

`config.toml`:

```toml
[notes]
root = "~/.opendray/vault"
git_root = "~/.opendray/vault"

[notes.sync]
enabled = true
interval = "5m"           # commit every 5 minutes when there are changes
push_on_commit = true     # also push to origin after a commit
remote = "origin"
branch = "main"
author_name  = "opendray"
author_email = "opendray@example.com"
```

保存 + opendray 重启之后,同步器会日志输出:

```
INFO vault auto-sync started component=vaultgit.sync interval=5m
```

## 同步器做什么

每个 `interval`:

1. `git status --porcelain` — 有任何待处理变更吗?
2. 如果有:
   - `git add .`
   - `git commit -m "vault sync: <N> file(s) changed"`
3. 如果 `push_on_commit` 而且我们刚 commit 了:
   - `git push <remote> <branch>`
4. 如果落后于上游(remote 上有我们没有的 commit):
   - `git pull --rebase <remote> <branch>`(尽力而为;遇到
     冲突时,回退到一次完整的 clone-replace 作为恢复机制 —
     冲突的文件被保留为 `<name>.conflict.md`)

每一轮的结果会在事件总线上发布 `vaultgit.sync_completed`,
方便外部监控做反应。

## 状态指示器

Notes 页顶部显示一个同步状态标识:

| 标识 | 含义 |
|---|---|
| 🟢 *In sync* | 本地与 remote 一致,无待处理变更 |
| 🟡 *Pending commit* | 上一次 commit 之后有变更;下一次 tick 时会 commit |
| 🔵 *Pushing…* | 同步中(push 进行中)|
| 🔴 *Conflict* | rebase 失败;创建了一个 `.conflict.md` 文件 |

点标识 → 展开看上次同步时间、改动的文件、以及手动 *Sync
now* 按钮。

## 分支

opendray 用单一分支(默认 `main`)。要做 per-host 隔离,把
不同主机指向不同分支:

- 主机 A:`[notes.sync] branch = "main"`
- 主机 B:`[notes.sync] branch = "host-b"`

然后你想要跨分支交叉花粉时,手动在分支之间合并。

## 手动逃生口

vault 就是个 git 仓库 — 在主机上随时打开 shell 直接用 git。
opendray 的同步器是尽力而为的,不锁仓库;在做任何破坏性
事情(比如 force push)之前,先暂停自动同步(设置
`enabled = false` 并重新加载)。

## Remote 认证

对 HTTPS remote,opendray 从 **Git 主机** 插件(Plugins
页)注入凭据。`Authorization` 头附加到 push/pull 请求上。
token 永远不会到达 worktree 或 commit 日志。

对 SSH,用 opendray 主机已经信任的任何 SSH key — `git push`
shell out 到系统 `git`,它会用标准 agent。

## 需要知道的事情

- **别把 `node_modules/` 或编译产物放到 vault 里。** 同步器
  不会自动给你加 `.gitignore`。在 vault 根放一个 `.gitignore`。
- **大的二进制文件**(PDF、图片)让仓库快速膨胀。用 git-lfs
  (opendray 不会挡)或者把二进制文件移出 vault。
- **`git init` 后第一次运行** 没有 remote — 手动设一个:
  ```bash
  cd ~/.opendray/vault
  git remote add origin git@github.com:me/vault.git
  git push -u origin main
  ```
  之后,opendray 的同步接管。
