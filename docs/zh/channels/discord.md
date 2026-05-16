# Discord

**模式:** Gateway WebSocket(无需公网 URL)
**能力:** text · card (embeds) · buttons (components) · update_message · reply_to_message (message_reference)
**配置时间:** 约 5 分钟

Discord 使用一个持久的 Gateway WebSocket 作为入站,REST API 作为出站。Bot 在连接时识别一次;重连由 opendray 自动处理。

## 1. 创建一个 Discord application + bot

1. 访问 [discord.com/developers/applications](https://discord.com/developers/applications) → **New Application** → 命名(例如 `OpenDray`)。
2. 侧栏 → **Bot** → **Reset Token** → 确认。复制 token(形如 `MTIzNDU2.AbCdEf.…`)。**你只能看到一次。** 离开页面前保存到安全位置。

![Discord bot token reveal](/tutorial/discord-token.png)

## 2. 启用 Message Content Intent

同一个 Bot 页面,滚动到 **Privileged Gateway Intents**:

- ✅ **Message Content Intent** — 必需。没有它,每条入站消息都带 `content=""`,bot 实际上毫无用处。
- ✅ **Server Members Intent** — 只有需要成员元数据时才需要;开着也没事。

点击 **Save Changes**。

> 在 100+ 服务器中的 bot 在使用 privileged intent 前需要 Discord 显式审核。单服务器的设置(大多数 opendray 用户)无此限制。

## 3. 把 bot 邀请到你的服务器

1. 侧栏 → **OAuth2** → **URL Generator**。
2. Scope:✅ `bot`,✅ `applications.commands`(第二个在你将来注册斜杠命令时需要;不需要也无害)。
3. Bot Permissions:至少
   - `Send Messages`
   - `Embed Links`
   - `Read Message History`
   - `Use External Emojis`(渲染 `●` / `└` 标记更好看)
4. 复制生成的 URL → 在浏览器打开 → 选择服务器 → **Authorize**。

bot 现在出现在服务器的成员列表里(opendray 连接前显示离线)。

## 4. 找到 channel ID

1. Discord → User Settings(齿轮图标) → **Advanced** → 启用 **Developer Mode**。
2. 右键任意 channel → **Copy Channel ID**。

id 形如 `1234567890123456789`(snowflake — 长数字)。

## 5. 在 opendray 中配置

Channels → **New channel** → kind **Discord**。

| 字段 | 值 |
|---|---|
| **Bot token** | 来自步骤 1 |
| **Default channel ID** | 来自步骤 4 |

保存,**Enabled = on**。

## 6. 验证

- 服务器日志显示 `discord channel started`,接着是 Gateway 握手(`READY` 事件)。
- bot 状态在 Discord 成员列表中翻转为**在线**。
- 点卡片上的 **Test** → bot 发送一条消息。
- 在 bot 能读消息的任意 channel 输入 `/help` — opendray 在线回复。

![Discord card with action buttons](/tutorial/discord-card-buttons.png)

## Embed + components 渲染

- `CardHeader` → embed `title` + `color`(green / red / yellow / …;opendray 按 `internal/channel/discord/discord.go` 里的 `colorMap` 把命名颜色映射到 RGB 十六进制)
- `CardMarkdown` → embed `description`
- `CardActions` → message `components` 数组,内含 `action_row`,里面是 `button` 元素(style 1=primary,4=danger,2=secondary)
- `CardListItem` → embed `field` + 一个按钮行
- `CardSelect` → 字符串 select 组件
- `CardNote` → embed `footer.text`

每个按钮的 `custom_id` 就是 opendray 发出的 `cmd:/foo` — 远在 Discord 的 100 字符上限之内。

## 限制

- Bot token 高度敏感:泄露的 token 让任何人都能在 bot 加入的每个服务器里控制它。怀疑泄露就从开发者门户重置。
- Discord 的内容审核可能过滤消息 — 特别是看起来像钓鱼的(大量链接)。来自 opendray 的通知很少被绊到但值得知道。
- Embed 总长上限 6000 字符(title + description + fields)。长的 Claude 回复会自动拆成多个 embed 消息。
