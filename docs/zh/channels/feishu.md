# 飞书 (Feishu / Lark)

**模式:** 事件 webhook(需要公网 URL) + REST 出站
**能力:** text · card (interactive v2) · buttons · reply_to_message
**配置时间:** 约 15 分钟(开发控制台内容繁多)

飞书 / Lark 把事件推送到 opendray 上的一个 webhook URL,opendray 通过标准的 `/open-apis/im/v1/messages` API 用可刷新的 `tenant_access_token` 鉴权回复。

> **公网 URL 前提:** opendray 的 webhook 端点必须可从 feishu.cn(国际 Lark 是 larksuite.com)访问。使用 Cloudflare Tunnel、ngrok 或真实公网主机名。

## 1. 创建 app

1. 访问 [open.feishu.cn/app](https://open.feishu.cn/app)(Lark 用 [open.larksuite.com/app](https://open.larksuite.com/app))。
2. **创建自建应用** → 输入名称 + 图标。
3. 侧栏 → **凭证与基础信息**。复制:
   - **App ID** — 形如 `cli_a1b2c3d4...`
   - **App Secret**

![Feishu app credentials](/tutorial/feishu-credentials.png)

## 2. 添加机器人能力

侧栏 → **添加应用能力** → **机器人** → **添加**。

这是必需的 — 没有 Bot 能力开关,发送消息会返回 "app does not have bot ability"。

## 3. 配置权限

侧栏 → **权限管理** → 搜索并启用:

| 权限 | 用途 |
|---|---|
| `im:message` | 读消息 |
| `im:message:send_as_bot` | 以 bot 发送消息 |
| `im:chat` | 读 chat 元数据 |
| `im:chat:readonly` | 列出 bot 所在 chat |
| `im:resource` | 读消息中的图片/文件(可选) |

点击 **申请权限**。对自己 tenant 里的自建 app,审批是即时的。

## 4. 在 opendray 里先创建频道(你需要它的 webhook URL)

虽然事件还没接上,先在 opendray 创建频道以便它有一个 id:

Channels → **New channel** → kind **Feishu (飞书)**。

| 字段 | 值 |
|---|---|
| **App ID** | 来自步骤 1 |
| **App Secret** | 来自步骤 1 |
| **Verification token** | 暂时留空(稍后回填) |
| **Default chat ID** | 暂时留空 |

保存,**Enabled = on**。

卡片现在显示 `webhook:` 加一个像 `https://your-host/api/v1/channels/ch_abc.../webhook` 的 URL。复制这个 URL — 飞书会调用它。

![Feishu channel card with webhook URL](/tutorial/feishu-channel-webhook.png)

## 5. 在飞书里接 webhook

回到飞书开发控制台:

侧栏 → **事件订阅** → 打开。

- **请求 URL:** 粘贴你从 opendray 复制的 URL。
- 飞书**立即**用一个 JSON challenge(`{"type":"url_verification","challenge":"..."}`)调用那个 URL。opendray 自动回声 challenge — 你应该在一两秒内看到 ✅。

如果验证失败:
- 检查 URL 是否从公网可达
  (`curl -X POST <url> -H 'content-type: application/json' -d '{"type":"url_verification","challenge":"x","token":""}'`
  应返回 `{"challenge":"x"}`)
- 检查 opendray 服务器日志看请求
- 本地开发:确认你的隧道(cloudflared/ngrok)确实转发带 body 的 POST 请求

URL 验证后,复制同一页显示的 **Verification Token**。

在 **订阅事件**下,**添加事件**:

- `im.message.receive_v1` — bot 收到消息

保存。

## 6. 回到 opendray 频道编辑

编辑频道填入:

- **Verification token** — 来自步骤 5(帮助拒绝伪造的 webhook 调用)
- **Default chat ID** — 见下面的步骤 7

## 7. 找到 chat ID

两条路径:

**路径 A — bot 已在某个 chat 中:** chat → ⋯ → 设置 → 机器人详情。一些飞书管理面板直接暴露 `oc_…` id。

**路径 B — 通过 API 列出:**

```bash
curl -X POST 'https://open.feishu.cn/open-apis/im/v1/chats' \
  -H "Authorization: Bearer <tenant_access_token>"
```

通过 `POST /open-apis/auth/v3/tenant_access_token/internal` 用你的 app id + secret 获取 token。你要的 chat id 形如 `oc_xxxxxxxxxxxxxxxxxxxx`。

## 8. 把 bot 加进 chat

飞书 chat → ⋯ → **设置** → **机器人** → **添加机器人** → 选你的。

## 9. 验证

在 chat 里发一条消息 — opendray 服务器日志应该显示入站。发 `/help` — opendray 回复命令列表。

## 卡片 schema

opendray 发出 Card v2(`schema: "2.0"`)JSON。`header.template` 字段把颜色名映射到飞书的调色板:

| opendray 颜色 | 飞书模板 |
|---|---|
| blue | blue |
| green | green |
| red | red |
| orange | orange |
| yellow | yellow |
| violet / indigo | purple |
| turquoise | turquoise |

## 限制

- **webhook 载荷的 AES 加密目前不支持**。在飞书把 *Encrypt Key* 设置留空 — 事件以纯 JSON 到达。对大多数设置来说 Verification token 已足够。
- Card v1(旧 schema)不被使用;一切都是 v2。
- 生产环境的 webhook URL 必须是 HTTPS。Cloudflare Tunnel 可以(隧道在 Cloudflare 边缘终止 TLS)。
