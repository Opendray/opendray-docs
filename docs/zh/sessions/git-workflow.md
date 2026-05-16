# Git 工作流

Inspector 的 **Git** 标签把会话的工作目录变成一个自包含的 PR 命令中心:切换分支、暂存文件、提交、推送、开 PR、看 CI 检查、合并 — 全程不用离开 opendray。

只有当 cwd 位于一个 git 仓库内时这个标签才渲染。如果对目录运行 `git rev-parse` 失败,面板会折叠为简短的 "not a git repo" 提示。

## 状态头

标签顶部总结你当前的位置:

- **当前分支**及其上游(例如 `feat/foo → origin/feat/foo`)。当没有跟踪上游时这一行显示 "no upstream" — 下面的 **Push** 按钮在首次推送时会用 `--set-upstream`。
- **Ahead / behind 计数**相对上游。`+3 / -1` 表示本地有 3 个提交不在远程,远程有 1 个提交不在本地。
- 工作树摘要 — 已暂存、未暂存、未跟踪文件的数量。数字是可点击的;点击会跳到下方的暂存区。

## 分支控件

状态头下方的条带包含每一个分支操作:

| 元素 | 用途 |
|---|---|
| 分支下拉 | 切换到任意其它本地分支。列表在标签打开时取一次,任何其它分支操作成功后刷新。 |
| **+ New** | 从当前 HEAD 创建分支并切过去。单输入框模态。 |
| **Push** | 推送到上游。首次推送(无上游)使用 `--set-upstream`。当 ahead == 0 且已设置上游时禁用。 |

### Stash & switch

带有未提交改动的树切换分支并不被阻止。如果服务器在 `checkout` 时检测到未提交的改动,响应是 **409 Conflict**,其 body 携带一个 `dirty_files: [...]` 数组。Web UI 捕获后显示一个 Sonner 提示(toast),类似:

> Uncommitted changes block switch to `main`
> &nbsp;&nbsp;`app/foo.ts, internal/bar.go, app/baz.tsx`
> &nbsp;&nbsp;[ Stash & switch ]

点击 **Stash & switch** 用 `stash: true` 重试 checkout。服务器先运行 `git stash push --include-untracked -m "opendray-auto: switch to <name>"`,然后执行 checkout,并返回 stash 短引用。成功提示显式显示它,这样恢复就只差一条终端命令:

> Switched to `main` (stashed as `abc1234`)

之后用 `git stash pop` 恢复 stash 的工作(如果想保留 stash 用 `git stash apply`)。

## 暂存与提交

中间面板列出每一项工作树改动,带 porcelain 状态码(`M`、`A`、`??` 等)。每行操作:

- **Stage** 把未暂存改动移到 index。
- **Unstage** 是已暂存行的反向操作。
- **Diff** 在侧边抽屉里打开一个统一 diff(只读)。

批量操作:

- **Stage all** = `git add .`
- **Unstage all** = `git reset`

提交表单位于文件列表下方:

- 多行**消息**字段。**Cmd / Ctrl + Enter** 提交,无需鼠标移到按钮上。
- 实时的暂存计数徽章 — 至少有一个文件已暂存之前,**Commit** 按钮禁用。
- 成功后表单清空,工作树状态刷新,新 HEAD 显示在右侧日志条带。

## Pull request

提交表单下方是 **PR 命令中心**。GitHub、Gitea、GitLab 用同一个界面 — 网关把 API 差异规范化为同一种形态。

### 列表

默认视图列出当前 remote 的**开放** PR。通过列表上方的胶囊切换到 **Closed** 或 **All**。每行显示:

| 列 | 说明 |
|---|---|
| `#NN` | 点击 → 在 host 上新标签打开 PR。 |
| 标题 | 截断;悬停看完整标题。 |
| 作者 | 头像 + 用户名。 |
| 分支 | `head → base`(例如 `feat/foo → main`)。 |
| 聚合检查 | 彩色胶囊 — `success`、`failure`、`pending`、`mixed`。见下面的 Checks 小节。 |

点击一行**就地展开**显示 Checks 列表和合并表单。

### 创建

**+ Create PR** 按钮打开一个内嵌表单:

- **Title** — 默认为最后一次提交的主题。
- **Body** — 多行。
- **Head** — 当前分支(只读)。
- **Base** — 默认为 host 的默认分支(`main` / `master` / 仓库配置的任何值)。通过 host API 解析,不是硬编码字符串。可自由覆盖。

提交 → 开 PR,新行展开出现在列表顶部。

### 合并

每个展开的 PR 行都有一个合并表单,带标准的 GitHub 合并方法:

- **Merge commit** — 默认的 `--merge`。
- **Squash and merge** — `--squash`。推荐用于本项目使用的 "one-commit-per-PR" 工作流。
- **Rebase and merge** — `--rebase`。慎用;rebase 丢失合并锚点。

**Delete branch on merge** 是方法切换下方的复选框。默认为**开** — 否则分支累积太快。

### 检查

行展开后,opendray 每 30 秒轮询一次该 PR 的 checks 并以列表展示。词汇规范化到 GitHub 的:

| 状态 | 含义 |
|---|---|
| `success` | 任务完成且无错误。 |
| `failure` | 任务运行并失败。 |
| `pending` | 排队中或进行中。 |
| `neutral` | 任务完成但没有通过/失败的判断。 |
| `cancelled` | 完成前被杀。 |
| `skipped` | 被工作流有条件跳过。 |

Gitea 和 GitLab 的 commit-status 端点映射到这套词汇,所以你可以用同一个 UI,不必关心是哪个 host 发出了什么。

列表行上的聚合判定是最坏情况的累计:任何 `failure` → `failure`;否则任何 `pending` → `pending`;否则 `success`。悬停徽章看 tooltip 中的分解。

## 出错时

Git 标签把服务器错误以红色 Sonner 提示(toast)显示。常见错误:

- **`fatal: not a git repository`** — cwd 未被跟踪;面板会回到 "not a git repo" 空状态。
- 推送时 **`Permission denied (publickey)`** — 网关的 Git 凭证对那个 remote 没有写权限。检查 **Settings → Git hosts** 里的 PAT。
- 删除时 **`branch '<name>' not fully merged`** — git 的安全删除拒绝。提示(toast)会给出一个强制删除确认,升级为 `git branch -D`。

## 后端路由

要做线级调试,驱动这个标签的端点位于 `/api/v1/git/...`:

| Method | Path | 用途 |
|---|---|---|
| GET | `/git/status` | 工作树 + 分支摘要。 |
| GET | `/git/log` | HEAD 上的最近提交。 |
| GET | `/git/write/branches` | 所有分支(本地 + 远程引用)。 |
| POST | `/git/write/branches` | 创建 + 可选 checkout。 |
| DELETE | `/git/write/branches` | 删除(query:`name`、`force`)。 |
| POST | `/git/write/checkout` | 切换分支。`stash: true` body 字段自动 stash 有未提交改动的树。 |
| POST | `/git/write/stage` `/unstage` | Index 操作。 |
| POST | `/git/write/commit` | 创建一个提交。 |
| POST | `/git/write/push` | 首次推送时 `--set-upstream`。 |
| GET | `/git/prs` | 列出 cwd remote 的 PR。 |
| POST | `/git/prs` | 创建。 |
| POST | `/git/prs/{n}/merge` | 用方法选项合并。 |
| GET | `/git/prs/{n}/checks` | 规范化的 check 运行。 |

每个路由都需要鉴权;内嵌的 web 客户端自动把会话 token 接进去。
