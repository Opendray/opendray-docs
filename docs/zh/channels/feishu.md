---
kind: capability
title: 飞书 Feishu / Lark
tldr: 创建飞书 app → 拿 App ID + Secret → 把 opendray 的 webhook URL 注册到 Event Subscriptions → 把 bot 加进群。需要公网 HTTPS URL。
status: stable
since: v0.1.0
topic: channels
related:
  - channels/overview
  - channels/notifications
  - channels/routing
capability:
  - text
  - card-v2
  - interactive-buttons
  - reply-routing
inbound: webhook-callback
outbound: tenant-api
public-url-required: true
setup-time-minutes: 15
x-implementation:
  - internal/channel/feishu/
x-api-version: feishu-open-api-v3
---

# 飞书 Feishu / Lark

> **tldr:** 创建飞书 app → 拿 App ID + Secret → 把 opendray 的 webhook URL 注册到 Event Subscriptions → 把 bot 加进群。**需要公网 HTTPS URL** 可从 feishu.cn / larksuite.com 访问。

## Setup

| # | 操作 | 在哪做 |
|---|---|---|
| 1 | [open.feishu.cn/app](https://open.feishu.cn/app)(或 larksuite.com)→ 创建自建应用 → 保存 **App ID**(`cli_...`)+ **App Secret** | 飞书开发者后台 |
| 2 | 添加能力 → **Bot** → 添加(必需) | 飞书开发者后台 |
| 3 | 权限管理 → 开 `im:message`、`im:message:send_as_bot`、`im:chat`、`im:chat:readonly` → 申请 | 飞书开发者后台 |
| 4 | opendray **Channels → New → kind=feishu** → 粘 App ID + Secret → verification token 留空 → Save → **复制卡片上显示的 webhook URL** | opendray 后台 |
| 5 | 飞书后台 → Event Subscriptions → On → 粘 webhook URL(飞书发 challenge,opendray 自动 echo)→ 保存 **Verification Token** | 飞书开发者后台 |
| 6 | 订阅事件 `im.message.receive_v1` → 保存 | 飞书开发者后台 |
| 7 | opendray **编辑 channel** → 粘 verification token + 默认 chat ID(`oc_...`) | opendray 后台 |
| 8 | 飞书群 → ⋯ → 设置 → 群机器人 → **添加机器人** → 选你的 | 飞书客户端 |

## Config schema

```yaml
kind: feishu                                # 字面量,必填
app_id: "cli_a1b2c3d4..."                   # 必填
app_secret: string                          # 必填密文
verification_token: string                  # 第 5 步后必填
encrypt_key: string                         # v1 不支持 — 留空
default_chat_id: "oc_..."                   # 选填
base_url: "https://open.feishu.cn"          # 中国默认;Lark 用 open.larksuite.com
notify:
  started:          false
  idle:             true
  ended:            true
  permission_ask:   true
repeat_policy: once-per-session
snippet:
  enabled:    false
  max_lines:  10
enabled: true
```

## Capabilities

| 能力 | 支持 | 实现备注 |
|---|---|---|
| 入站(webhook) | ✓ | 需要公网 HTTPS URL,飞书 POST 事件 |
| URL 验证(challenge) | ✓ | 自动 echo,几秒内变 ✅ |
| Card v2(`schema: "2.0"`) | ✓ | `header.template` 映射飞书调色板 |
| 交互式按钮 | ✓ | Card v2 action element |
| 回复路由 | ✓ | 消息回复进会话 stdin |
| Card v1(旧) | ✗ | 全部走 v2 |
| AES payload 加密 | ✗ | 飞书后台 Encrypt Key 留空 |
| 文件上传 | ✗ | 未实现 |

## Errors

| code | http | 原因 | 修复 |
|---|---|---|---|
| `feishu_invalid_app` | 400 | App ID / Secret 错 | 凭据页重新拷贝 |
| `feishu_no_bot_capability` | 403 | 第 2 步 Bot 能力没添加 | 添加能力 → Bot |
| `feishu_missing_permission` | 403 | 第 3 步 scope 未批准 | 重新申请权限 |
| `feishu_chat_not_found` | 404 | bot 没在群里 | 第 8 步:设置 → 群机器人 → 添加 |
| `feishu_signature_mismatch` | 401 | verification token 不匹配 | 从 Event Subscriptions 页重粘 |
| `feishu_url_verification_failed` | 400 | webhook URL 不可达 | 验公网 DNS + curl 测 |

## Examples

```bash
# 验证 webhook 可达
curl -X POST <webhook_url> \
  -H 'content-type: application/json' \
  -d '{"type":"url_verification","challenge":"x","token":""}'
# 预期返回: {"challenge":"x"}
```

## Limitations

| 限制 | 数值 | 备注 |
|---|---|---|
| 公网 URL | 必需 | webhook 必须 feishu.cn 可达 |
| TLS | 生产必须 HTTPS | Cloudflare Tunnel 在边缘终止 TLS |
| AES 加密 | 不支持 | Encrypt Key 留空 |
| Card schema | 仅 v2 | v1(旧)未实现 |

<details>
<summary>📖 叙事说明</summary>

飞书 / Lark 把事件推到 opendray 的 webhook URL,opendray 用
`tenant_access_token` 调标准的 `/open-apis/im/v1/messages` API 回发
消息。

**公网 URL 是前提**:opendray 的 webhook 端点必须从 feishu.cn(或
Lark 的 larksuite.com)能访问。用 Cloudflare Tunnel、ngrok 或真公网
主机名。家用 NAT 后面跑不起来。

配置顺序有点绕:你需要 opendray 的 webhook URL **才能** 让飞书验证,
但 opendray 不创建 channel 就不显示 webhook URL。绕法在表格第 4 步:
用手头的 secret 先建 channel,第 7 步再回来填飞书发的 verification
token。

</details>
