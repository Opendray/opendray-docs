# Git 主机

远程 git 推送的凭据。笔记 vault 同步用这些 token,通过 HTTPS
推送 vault 仓库时不需要交互式输入凭据。opendray 里其他需要
克隆或推送的部分(自定义集成)复用同一份注册表。

## 各家提供商的认证风味

| 提供商 | 认证风味 |
|---|---|
| GitHub | Personal Access Token(classic 或 fine-grained)|
| GitLab | 带 `write_repository` scope 的 Personal Access Token |
| Gitea / Forgejo | 带 repo-write 的 application token |
| Bitbucket | 带 repo-write 的 App password |
| 自定义(纯 SSH)| 主机 `~/.ssh/known_hosts` 信任的 SSH key — 不需要 token;这一页只管 HTTPS 认证 |

## 添加一个主机

Plugins → **Git hosts** → **Add host**。

| 字段 | 用途 |
|---|---|
| **Provider** | 下拉选已知模式(设置默认的 URL 前缀)|
| **Display name** | 显示在列表里 |
| **HTTPS host** | 比如 `github.com`、`gitlab.com`、`gitea.example.com` |
| **Username** | 你在这个平台上的用户名 |
| **Token** | PAT / app token / app password |

token 会写到和 [MCP 密钥](#plugins-mcp) 同一个加密保险库。你
没法从 UI 里读出明文;轮换的方式是存一个新值。

## token 是怎么被使用的

vault 同步器(`internal/vaultgit/syncer.go`)在调用 git
push/pull 时:

1. 查找 remote URL。
2. 把 host 部分匹配到已注册的 git 主机。
3. 如果命中,在本次操作期间把 URL 前缀替换成
   `https://<user>:<token>@<host>/...`。
4. token 永远不会落到 `~/.opendray/vault/.git/config` 里 —
   只有裸的 URL 会,所以仓库可以被另一台主机克隆而不泄露
   凭据。

## 列出仓库(只读功能)

Plugins → **Git hosts** → 点一个主机 → **List repos**。

opendray 用配置好的 token 打到主机的 API(GitHub 是
`/user/repos` 等)上,显示你能访问到的仓库。是个有用的
神志检查("我认证 OK 吗?"),也是未来版本 *把这个仓库
克隆成新会话 cwd* 的种子。

## token 轮换

每张主机卡上都显示 **last used** 时间戳。当那个时间戳很旧
(90 天以上),GitHub 风格的 token 可能已经被平台侧自动撤销
了。vault 同步器会通过把主机卡状态翻成红色、并在事件总线上
发 `vaultgit.host_auth_failed` 通知来让 401 浮上来。

要轮换:

1. 在平台上生成一个新 token。
2. Plugins → **Git hosts** → 点主机 → **Rotate token**。
3. 保存。

旧 token 会留在加密保险库里,直到下一次同步;第一次用新值
成功同步,旧的就会被清除。

## 纯 SSH 设置

如果你更喜欢 SSH(完全不用 token):

- 正常配置主机的 SSH key(`~/.ssh/config` + agent)。
- 用 SSH 格式的 remote(`git@github.com:me/vault.git`)。
- 完全跳过 Git 主机页面 — opendray 的同步器 shell out 到
  系统 `git`,它会用你的 SSH agent。

Git 主机页面是 **专门为 HTTPS-with-token** 设置准备的,在
SSH agent 不好用的主机(Docker 容器、Windows、临时云 VM)
上对你更友好。
