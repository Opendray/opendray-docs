# Notifications 面板深入

每个非 bridge 频道在 Edit 对话框里都有同一个 Notifications 面板。它控制*哪些*事件触发通知、*多久*一次、以及包含*什么*内容。

![Notifications panel](/tutorial/notifications-panel-detail.png)

## Notify on(主题复选框)

频道可订阅的三个会话级事件:

- **`session.started`** — 一个会话被启动时触发
- **`session.idle`** — 一个会话静默达到配置的阈值(默认 30 秒)时触发
- **`session.ended`** — 一个会话的进程退出时触发

点击任意标签切换。默认状态是*三个都选*(等价于 "任意主题" — opendray 在 config 中省略此字段,这样未来新增的主题也会流通)。

当你取消某些主题时,只有所选的会通知。全部取消则频道出站静默(它仍然接收入站回复)。

## Repeat policy

被问得最多的控制。三种模式:

### Once per session(默认,推荐)

针对 `(channel, topic, session)` 三元组发一次通知。频道 X 上会话 A 的第一次 idle 通知之后,opendray 抑制那个三元组的进一步 `session.idle` 事件,**直到下列之一发生:**

- 会话结束(不同主题 — 那触发 `session.ended`)
- 你用非命令文本回复频道(转发到会话的 stdin 并重置抑制)
- 24 小时安全 TTL 到期

这是个人使用想要的。会发出周期性输出的 CLI 工具(Claude 的 "thinking" 旋转指示、代码流式输出)在一次实际对话回合里会引起许多 active→idle 切换 — *Once* 模式把它们折叠为每回合一次 ping。

### Time-window cooldown

在所选窗口内抑制重复:

| 窗口 | 行为 |
|---|---|
| 1 分钟 | 激进 — 大多数边界情况的再通知能通过 |
| 5 分钟 | 适合 "长跑部署" |
| 15 分钟 | "如果仍然空闲再告诉我" |
| 30 / 60 分钟 | 心跳风格 |

当你想要长跑会话上的周期性签到而不是单次 ping 时使用。

### Every event(嘈杂)

完全无抑制。仅在低自然量的频道(每天一次的通知频道)或调试时使用。

## Terminal snippet

启用时(默认),idle 通知嵌入最近的输出。两个源路径:

- **Claude 会话:** opendray 读取 `~/.claude/projects/<encoded-cwd>/<latest>.jsonl` 并渲染最后一次对话回合(助手文本 + 工具调用 + 工具结果) — 干净、完整、无 TUI 残留。
- **其它 CLI:** opendray 在原始 PTY 流旁维护一个虚拟终端(vt10x)。snippet 就是用户**此刻**在 live web 终端里会看到的样子,通过正则剥除 Claude TUI 装饰(模型条、"bypass permissions" 提示、状态旋转指示、分隔线)。

### Snippet 上限

默认是 *No cap* — Telegram 自动把长内容分块为多条消息,操作按钮附在最后一块。其它频道应用自己平台特定的尺寸(DingTalk 的 20 KB 限制等)。

如果你专门想要更短的通知(例如在你略读的嘈杂频道上),选 1000 / 3000 / 6000 / 12000 字符。截断的内容显示 `[…]` 前缀标记。

## 每平台 snippet 渲染

| 平台 | snippet 如何渲染 |
|---|---|
| Telegram | HTML 模式 — 粗体/斜体/代码/引用/标题都能用;表格变成 "Header: value" 垂直块 |
| Slack | Block Kit `mrkdwn` — `*bold*`(单星号),无标题 |
| Discord | Embed `description` 字段,封顶 4096 字符 |
| Feishu | Card v2 markdown,content 类型 `lark_md` |
| DingTalk | actionCard markdown |
| WeCom | Markdown,使用 WeCom 受限子集 |
| Bridge | adapter 决定如何渲染 |

## 静音开关

在任意频道 chat 里运行 `/notify off` — opendray 在频道配置里设置 `muted: true` 标志。派发循环完全跳过被静音的频道。`/notify on` 清除它。

当你只想让一个频道静音一天时,这比打开管理 UI 更快。
