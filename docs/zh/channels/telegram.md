# Telegram

**模式:** long-poll(无需公网 URL)
**能力:** text · card · buttons · update_message · typing · reply_to_message
**配置时间:** 约 3 分钟

这是配置最快的频道,因为 Telegram 允许 bot 自己 long-poll API — 不需要 webhook,不需要公网主机。

## 1. 通过 BotFather 创建 bot

1. 在 Telegram 里搜索 [@BotFather](https://t.me/BotFather) 并开始 chat。
2. 发送 `/newbot`。BotFather 会引导你填写:
   - **Name** — chat 中显示的名字(例如 `OpenDray`)。
   - **Username** — 必须以 `bot` 结尾(例如 `mycompany_opendray_bot`)。
3. BotFather 回复一个像 `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11` 的 token。**复制它** — 你会粘贴到 opendray 里。

![BotFather token reveal](/tutorial/telegram-botfather-token.png)

## 2. 找到你的 chat ID

你需要知道 opendray 默认发到哪个 chat(私聊 DM 或群组)。

**简便路径:**

1. 把 bot 加入一个群组,或者跟它开一个私聊。
2. 在那个 chat 发任意一条消息(例如 `hi`)。
3. 在浏览器里打开 `https://api.telegram.org/bot<TOKEN>/getUpdates`,把 `<TOKEN>` 换成你的 bot token。
4. 在 JSON 里找 `"chat":{"id":...}`。正数 = DM,负数 = 群组,以 `-100` 开头的大负数 = 超级群组。

```
https://api.telegram.org/bot123456:ABC-DEF.../getUpdates

{"ok":true,"result":[{
  "update_id":...,
  "message":{
    "chat":{"id":7831238986,"type":"private"},
    ...
  }
}]}
```

那个 `7831238986` 就是你的 chat id。

## 3.(可选)只允许 bot 在群组中使用

默认 bot 可以被加入任意群组。要把它锁定到只在你的群组:

- BotFather → `/setjoingroups` → 选你的 bot → **Disable**。

## 4. 在 opendray 中配置

Channels → **New channel** → kind **Telegram**。

| 字段 | 值 |
|---|---|
| **Bot token** | 步骤 1 的 BotFather token |
| **Default chat ID** | 步骤 2 的 chat id(可选 — 当没有 `ReplyCtx` 时用于出站) |
| Repeat policy | 保留默认 "Once per session" |
| Terminal snippet | 保持开启,"No cap" |

保存,**Enabled = on**。

![New Telegram channel form](/tutorial/telegram-new-channel.png)

## 5. 验证

几秒后卡片翻转到 `RUNNING`。点卡片上的 **Test** — 你应该在 chat 看到 *"OpenDray channel test ✓"*。

在 chat 里给 bot 发送 `/help` — opendray 回复已注册命令的列表。这证明入站 polling 工作正常。

## 6.(可选)添加斜杠命令自动补全

Telegram 客户端会为已知命令显示提示下拉框。把命令告诉 BotFather:

- `/setcommands` → 选 bot → 粘贴:

```
help - List available commands
status - Show channel status and capabilities
notify - Toggle notifications: /notify on|off
sessions - List recently-notified sessions
select - Pin a session for replies
cancel - End a session
resume - Reply to resume a session
```

这纯粹是装饰 — opendray 不论你设没设置都接受命令。

## 限制

- Bot token 是 bearer 凭证。任何人拿到 token 都能以你的 bot 名义发言。如果泄露:BotFather → `/revoke` → 选 bot → 确认。
- 内联按钮的 `callback_data` 被 Telegram 限制为 64 字节。opendray 的命令载荷(`cmd:/cancel <session-id>`)在范围内。
- 语音消息、贴纸、位置 — opendray 不解码这些。只有文本 + 按钮点击会成为会话的入站。

## 故障排查

服务器日志里出现 **"telegram: getUpdates failed; backing off"**:
- token 错(再粘一次,确保前后无空格)
- 或者两个 opendray 实例用同一个 token — Telegram 的 getUpdates 是单消费者的,会 409 拒绝。停掉重复的那个。

**Bot 在群组里看不到消息**:
- BotFather → `/setprivacy` → 选 bot → **Disable**(默认是 "Enable",意思是 bot 只看到命令和 @提及)。
