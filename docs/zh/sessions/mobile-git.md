# 移动端 Git 工作流

移动 app 以触摸优先的布局镜像 web 的 [Git workflow](#02-sessions-07-git-workflow)。本节中所有内容都是移动端 UI 对应 web Git 标签的等价物 — 网关路由完全相同,所以两个客户端可以同时操作同一个仓库而不会互相踩到。

在 **Session detail → Git 标签**(inspector 页面顶部的第二个胶囊)下打开。

## 状态面板

头部呼应 web 标签:当前分支 + 上游,ahead/behind 计数,工作树文件数。点击工作树这一行展开到文件列表。

## 分支选择器(底部弹层)

点击当前分支的胶囊会打开一个**底部弹层**,占视口的 75% — 手机屏幕上没空间放 web 的下拉框,而弹层给每个分支留出空间显示其上游副标题和删除控件。

| 区域 | 列出的内容 |
|---|---|
| **Local** | 每一个 `refs/heads/*` 引用。当前分支固定在顶部带勾选图标;其余按字母顺序。 |
| **Remote** | 每一个 `refs/remotes/<remote>/*` 引用,除了 `HEAD` symref。点一个 remote 引用会 checkout 同名的本地分支(等价于 `git checkout <name>` 的 remote-tracking 快捷方式)。 |

每一行:

- **点击**该行 → checkout 那个分支。
- **点击右侧的垃圾桶图标** → 删除分支(当前分支上禁用)。

"+ New" 和 "Push" 按钮位于操作条上,与胶囊并排,所以从任意屏幕都只需一次点击执行常用操作。

### Stash & switch

如果点击分支时工作树有未提交改动,服务器返回 409 + 一个 `dirty_files` 数组。移动端 UI 打开一个 AlertDialog 显示文件列表(可滚动,等宽字体)并附两个按钮:

- **Cancel** — 不动树。
- **Stash & switch** — 自动 stash 树(`git stash push --include-untracked`)并切换。

成功后一个 Snackbar 提示确认 `Switched to <name> (stashed as abc1234)`。之后从终端用 `git stash pop` 恢复 stash。

### 带强制回退的删除

默认 `-d`。如果 git 因 "not fully merged" 拒绝,服务器返回 409,UI 会弹出**第二个**对话框 — "Force delete? Branch is not fully merged. Forcing deletion will lose any commits unique to this branch."。确认会把调用升级到 `-D`。两步把关意味着误操作不会一键炸掉工作。

## 提交表单

文件列表下方是一个简化表单:

- **Stage all** 按钮 — 移动端没有按文件 stage 的 UI(没有 hover 目标)。如果需要更细粒度控制,从 web inspector 或终端管理单个文件。
- **多行消息**字段 — 软键盘暴露了一个 Enter 按钮(单独添加),所以换行能用,不必去工具栏找。
- **Commit** 按钮 — 暂存内容为空时禁用。

提交后,文件列表和状态头从服务器刷新。

## Pull request

提交表单下方是 **PR 区域**:

- 可滚动的开放 PR 列表,每 60 秒轮询一次。
- **+ Create** 打开一个底部弹层表单(title / body / base,默认分支由 host 解析)。
- 点击一个 PR 行展开内嵌面板,显示 check 运行(展开时每 30 秒轮询一次)和合并表单。

合并表单的选项与 web 一致:方法(merge / squash / rebase)和默认为**开**的 "delete branch on merge" 复选框。

## 轮询节奏总结

移动 app 比 web 轮询更激进,因为 iOS 上还没有事件总线订阅:

| 来源 | 节奏 | 何时停止 |
|---|---|---|
| 分支列表 | 打开时 + 任意分支操作后 | 标签卸载 |
| 状态 / 文件列表 | 8 秒 | 标签卸载 |
| PR 列表 | 60 秒 | 标签卸载 |
| PR checks(展开行) | 30 秒 | 行折叠 |

这些间隔被调过,既感觉"实时"又不浪费手机的射频。如果你插着电想要更快更新,在列表上用下拉触发手动刷新。

## 与 web 的差异

Web Git 标签有一些移动端还没镜像的能力:

- **按文件 stage** — web 在每个变更路径旁有 stage/unstage 按钮。移动端目前只支持 stage all。
- **Diff 抽屉** — web 在点击时打开统一 diff。移动端只显示 porcelain 状态码;查看 diff 需要 web 或终端。
- **Force-with-lease 推送** — web 有一个 opt-in 复选框。移动端推送总是使用安全路径。

其它所有功能(分支、PR、stash & switch 等)都是对等的。
