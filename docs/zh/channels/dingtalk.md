# DingTalk(钉钉)

**模式:** 自定义群机器人(仅出站)
**能力:** text · card (markdown / actionCard) — 无回调按钮
**配置时间:** 约 3 分钟

DingTalk 的群机器人是把通知推送到 chat 的最简单方式。它是仅出站的 — 无入站、无能触发回调的按钮 — 但搭配 *Notify on session.idle* + *Once per session* 模式做 "活儿干完时告诉我" 提醒效果很好。

## 什么时候用 DingTalk 而非其它中国平台

| 需求 | 用 |
|---|---|
| 只通知,不回复 | DingTalk 群机器人 |
| 回复 / 交互按钮 | 飞书或 bridge |

## 1. 给群组添加自定义机器人

1. 打开目标 DingTalk 群组 → ⋯ → **群设置** → **群机器人** → **添加机器人**。
2. 选 **自定义(自定义)**。
3. 命名(例如 `OpenDray`)。
4. **安全设置** — 至少选一项。强烈推荐 **加签(加签)**:
   - DingTalk 生成一个 `SEC...` secret。
   - opendray 自动在每次 webhook 调用上附加 `&timestamp=...&sign=...`,这样 DingTalk 才接受。
5. 点 **完成**。DingTalk 显示 **Webhook URL**:
   ```
   https://oapi.dingtalk.com/robot/send?access_token=abc123...
   ```

![DingTalk robot create](/tutorial/dingtalk-robot-create.png)

其它安全选项:

- **自定义关键词(关键词)** — 每条消息必须包含一个固定子串,否则 DingTalk 丢弃。不太方便(每条通知都要带关键词)。
- **IP 白名单** — 按源 IP 限制。当 opendray 跑在固定 egress IP 上时有用。

## 2. 在 opendray 中配置

Channels → **New channel** → kind **DingTalk(钉钉)**。

| 字段 | 值 |
|---|---|
| **Webhook URL** | 来自步骤 1 |
| **Sign secret** | `SEC...` 值(仅当 DingTalk 选了 *加签* 模式时) |

保存,**Enabled = on**。

## 3. 验证

- 点卡片上的 **Test** → 群组里出现纯文本消息。
- 触发 session.idle 事件(让会话空闲 30 秒) → 一个带标题 + markdown body 的 *actionCard* 出现。值是可点击 URL 的按钮渲染为按钮;`cmd:` 回调被静默丢弃,因为群机器人不能触发回调。

## 卡片渲染

opendray 的 Card → DingTalk 消息:

| 卡片元素 | DingTalk |
|---|---|
| `CardHeader.Title` | actionCard `title` |
| `CardMarkdown` | actionCard `text`(markdown) |
| 带 URL 值的 `CardActions` | actionCard `btns`(每个带 `actionURL`) |
| 带 `cmd:` 值的 `CardActions` | 丢弃 |
| `CardDivider` / `CardNote` | 内联 markdown `---` / `> blockquote` |

当卡片没有 URL 按钮时,opendray 降级到普通 `markdown` 消息而非 `actionCard`。

## 限制

- **仅出站。** 要接收回复需要 app-platform 配置(corp_id + agent_id + secret + AES 加密的回调 URL),目前尚未实现。要双向 DingTalk 用 bridge 频道 + 你自己写一个针对 App Platform SDK 的 Python adapter。
- **速率限制:** 每个机器人 20 条消息/分钟。在繁忙会话上突发通知会触发 — *Once per session* 模式的默认值会让你远在限制之下。
- **载荷大小:** 约 20 KB。长的 Claude 回复仍会客户端分块,但比 Telegram 的 4 KB 更贴近上限。
- **加签时间戳容差:** ±1 小时。主机时钟必须大致 NTP 同步。
