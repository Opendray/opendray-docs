# WeCom(企业微信)

**模式:** 群机器人 webhook(仅出站)
**能力:** text · card (markdown) — 无回调按钮
**配置时间:** 约 2 分钟

最简单的 WeCom(企业微信)集成。和 DingTalk(钉钉)的群机器人一样仅出站 — 双向 WeCom 需要 app-platform 路径,目前尚未发布。

## 1. 添加群机器人

1. 在**桌面端**打开目标 WeCom 群组(某些版本的移动客户端会隐藏群机器人 UI)。
2. 点击群组名进入**群设置**。
3. 滚到**群机器人(群机器人)** → **添加机器人**。
4. 选 **群机器人(Webhook)**。
5. 命名(例如 `OpenDray`)。
6. 确认。WeCom 显示 **Webhook URL**:
   ```
   https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=abc-123-...
   ```

![WeCom group robot URL](/tutorial/wecom-robot-url.png)

`key=` 查询参数就是 opendray 需要的 — 但你也可以粘贴整个 URL。

## 2. 在 opendray 中配置

Channels → **New channel** → kind **WeCom(企业微信)**。

| 字段 | 值 |
|---|---|
| **Webhook key** | 单独的 `key=` 值(`abc-123-…`) — 推荐 |
| **Or full webhook URL** | 想粘整段 URL 也可以 |

如果两个都填,完整 URL 胜出。保存,**Enabled = on**。

## 3. 验证

- 点 **Test** → 文本消息到达。
- 触发 session.idle → 带粗体标题 + body 的 markdown 消息。URL 按钮渲染为内联链接行;`cmd:` 按钮被丢弃。

## 卡片渲染

WeCom 群机器人支持一小组消息类型。opendray 使用 **markdown**:

| 卡片元素 | 输出 |
|---|---|
| `CardHeader.Title` | `**Title**`(粗体) |
| `CardMarkdown` | passthrough markdown |
| `CardDivider` | `---` |
| `CardActions` 的 URL 按钮 | 底部的 `[label](url)` 链接行 |
| `CardActions` 的 `cmd:` 按钮 | 丢弃 |
| `CardNote` | `> note` 引用 |

WeCom markdown 子集:
- `**bold**`、`_italic_`
- `[label](url)`
- `<font color="info|warning|comment">…</font>`
- 内联代码 `` `code` ``
- **无表格**、**无 fenced code block**、**无标题(`#`)**

## 限制

- **仅出站。** 双向 WeCom 需要 app-platform 路径(corp_id + agent_id + secret + AES 加密回调) — 尚未发布。
- **速率限制:** 每个机器人 20 条消息/分钟。和 DingTalk 一样。
- **Webhook URL 是 bearer 凭证。** 任何拿到 URL 的人都能往群组里发。**不要提交到源代码控制里。**
- **Markdown 渲染受限。** 表格和代码块看起来很糟 — 这里不适用 `formatForTelegram` HTML 转换,所以含表格的长 Claude 回复不会渲染得那么干净。
