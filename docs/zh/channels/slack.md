# Slack

**模式:** Socket Mode(无需公网 URL)
**能力:** text · card (Block Kit) · buttons · update_message · reply_to_message (thread_ts)
**配置时间:** 约 10 分钟(Slack 管理控制台有许多标签)

Slack 的 Socket Mode 让 bot 反向打开一个到 Slack 的出站 WebSocket,而不是接收 webhook — opendray 可以在 NAT 后面运行,不需要公网暴露任何东西。

## 1. 创建一个 Slack app

1. 访问 [api.slack.com/apps](https://api.slack.com/apps) → **Create New App** → *From scratch*。
2. 给它命名(例如 `OpenDray`)并选择目标 workspace。
3. 创建后你会落在 app 的 *Basic Information* 页 — 保持打开,稍后回来。

![Slack app create flow](/tutorial/slack-app-create.png)

## 2. 启用 Socket Mode + 创建 App-Level token

1. 侧栏 → **Socket Mode** → 打开。
2. Slack 提示你创建一个 *App-Level Token*:
   - **Name:** `opendray-socket`
   - **Scope:** `connections:write`
   - **Generate**。
3. 复制 **xapp-…** token。这是 **App-Level Token**。

## 3. 添加 bot OAuth scope

侧栏 → **OAuth & Permissions** → 滚动到 *Bot Token Scopes* → **Add an OAuth Scope** → 至少添加:

- `chat:write` — 发送消息
- `channels:history` — 读取 bot 所在公共 channel 的消息
- `groups:history` — 同上,私有 channel
- `im:history` — 同上,DM

可选但推荐:

- `chat:write.public` — 发送到 bot 不是成员的 channel(对 `#general` 风格的通知很方便)

然后滚回顶部点 **Install to Workspace**。批准。

安装后,复制 **Bot User OAuth Token**(以 `xoxb-` 开头)。

## 4. 订阅事件

侧栏 → **Event Subscriptions** → 打开。(Socket Mode 通过 WS 传递事件 — 不需要输入 Request URL。)

在 *Subscribe to bot events* 添加:

- `message.channels` — 公共 channel 中的消息
- `message.groups` — 私有 channel 中的消息
- `message.im` — DM

保存更改。

## 5. 启用 interactivity

侧栏 → **Interactivity & Shortcuts** → 打开。(Socket Mode 下不需要 URL。)按钮点击回传必需。

## 6. 把 bot 邀请到一个 channel

在 Slack 里:打开目标 channel 运行 `/invite @OpenDray`。

右键 channel → **View channel details** → 滚到底部的 **Channel ID**。复制(形如 `C0123ABC456`)。

![Slack channel ID](/tutorial/slack-channel-id.png)

## 7. 在 opendray 中配置

Channels → **New channel** → kind **Slack**。

| 字段 | 值 |
|---|---|
| **Bot token (xoxb-…)** | 来自步骤 3 |
| **App-level token (xapp-…)** | 来自步骤 2 |
| **Default channel ID** | 来自步骤 6 |

保存,**Enabled = on**。

## 8. 验证

- 服务器日志应该显示 `slack socket-mode connected`。
- 卡片翻转到 `RUNNING`。
- 点击 **Test** → 消息出现在 channel 里。
- 给 bot 私发 `/help` — opendray 在线程内回复。

## Block Kit 渲染

opendray 把内部 Card 模型转换为 Slack Block Kit blocks:

- `CardHeader` → `header` block(大号粗体)
- `CardMarkdown` → `section`,text 类型为 `mrkdwn`
- `CardDivider` → `divider`
- `CardActions` → `actions` block,内含 `button` 元素;`primary`/`danger` 样式映射到 Slack 的 primary/danger 按钮样式
- `CardListItem` → 带 accessory button 的 section
- `CardSelect` → `static_select` 元素
- `CardNote` → `context` block(小号灰色页脚)

线程处理:当会话回复作为通知消息下的线程到达时,opendray 发送 `thread_ts`,这样整段来回都留在同一个线程。

## 限制

- Slack 的 `mrkdwn` ≠ 标准 Markdown:
  - 粗体 = `*text*`(单星号,**不是** `**`)
  - 斜体 = `_text_`
  - 链接 = `<https://url|label>`
  - **标题(`#`)和表格不渲染** — 会按字面出现
- Free plan 限制消息历史;老通知可能从搜索里消失。
- `public_distribution` 模式下的 app(通过 App Directory 共享)需要额外审核流程 — 在你确定之前保持 app 私有。
