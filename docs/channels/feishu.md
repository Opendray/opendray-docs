---
kind: capability
title: Feishu (飞书 / Lark)
tldr: Create Feishu app → grab App ID + Secret → wire opendray's webhook URL into Feishu's Event Subscriptions → invite bot to chat. Requires public HTTPS URL.
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

# Feishu (飞书 / Lark)

> **tldr:** Create Feishu app → grab App ID + Secret → register opendray's webhook URL under Event Subscriptions → invite bot to chat. **Requires public HTTPS URL** reachable from feishu.cn / larksuite.com.

## Setup

| # | Action | Where |
|---|---|---|
| 1 | [open.feishu.cn/app](https://open.feishu.cn/app) (or larksuite.com) → Create custom app → save **App ID** (`cli_...`) + **App Secret** | Feishu dev console |
| 2 | Add features → **Bot** → Add (required) | Feishu dev console |
| 3 | Permissions & Scopes → enable `im:message`, `im:message:send_as_bot`, `im:chat`, `im:chat:readonly` → Apply | Feishu dev console |
| 4 | opendray **Channels → New → kind=feishu** → paste App ID + Secret → leave verification token blank → Save → **copy the webhook URL** shown on the card | opendray admin |
| 5 | Feishu dev console → Event Subscriptions → On → paste webhook URL (Feishu posts a challenge; opendray auto-echos) → save **Verification Token** | Feishu dev console |
| 6 | Subscribe to event `im.message.receive_v1` → Save | Feishu dev console |
| 7 | opendray **edit channel** → paste verification token + default chat ID (`oc_...`) | opendray admin |
| 8 | Feishu chat → ⋯ → Settings → Bots → **Add bot** → pick yours | Feishu client |

## Config schema

```yaml
kind: feishu                                # literal, required
app_id: "cli_a1b2c3d4..."                   # required
app_secret: string                          # secret, required
verification_token: string                  # required after step 5
encrypt_key: string                         # NOT supported in v1 — leave blank
default_chat_id: "oc_..."                   # optional
base_url: "https://open.feishu.cn"          # default for China; use open.larksuite.com for Lark
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

| feature | supported | implementation note |
|---|---|---|
| inbound (webhook) | ✓ | requires public HTTPS URL; Feishu posts events |
| URL verification (challenge) | ✓ | auto-echoed; status flips to ✅ within seconds |
| Card v2 (`schema: "2.0"`) | ✓ | `header.template` maps to Feishu palette |
| interactive buttons | ✓ | Card v2 action elements |
| reply routing | ✓ | message reply lands in session stdin |
| Card v1 (legacy) | ✗ | not used — everything is v2 |
| AES payload encryption | ✗ | leave Encrypt Key blank in Feishu |
| file upload | ✗ | not implemented |

## Errors

| code | http | cause | fix |
|---|---|---|---|
| `feishu_invalid_app` | 400 | App ID / Secret wrong | re-copy from Credentials page |
| `feishu_no_bot_capability` | 403 | Bot feature not added in step 2 | Add features → Bot |
| `feishu_missing_permission` | 403 | scope not approved | apply for permission in step 3 |
| `feishu_chat_not_found` | 404 | bot not added to the chat | step 8: Settings → Bots → Add |
| `feishu_signature_mismatch` | 401 | verification token mismatch | re-paste from Event Subscriptions page |
| `feishu_url_verification_failed` | 400 | webhook URL not reachable | verify public DNS + curl test |

## Examples

### Card v2 outbound

```http
POST /api/v1/channels/ch_feishu_main/send
Authorization: Bearer od_live_xxx
Content-Type: application/json

{
  "text": "Build #42 passed",
  "session_ref": "s_42",
  "card": {
    "header": "Deploy ready",
    "color": "green"
  }
}
```

### Verify webhook reachability

```bash
curl -X POST <webhook_url> \
  -H 'content-type: application/json' \
  -d '{"type":"url_verification","challenge":"x","token":""}'
# expected response: {"challenge":"x"}
```

## Limitations

| limit | value | note |
|---|---|---|
| public URL | required | webhook must be reachable from feishu.cn |
| TLS | HTTPS required for production | Cloudflare Tunnel terminates TLS on the edge |
| AES encryption | NOT supported | leave Encrypt Key blank |
| Card schema | v2 only | v1 (legacy) not implemented |

<details>
<summary>📖 Narrative explanation</summary>

Feishu / Lark pushes events to a webhook URL on opendray, and
opendray replies via the standard `/open-apis/im/v1/messages` API
authenticated by a refreshable `tenant_access_token`.

**Public URL prerequisite:** opendray's webhook endpoint must be
reachable from feishu.cn (or larksuite.com for international Lark).
Use Cloudflare Tunnel, ngrok, or a real public hostname. Local-only
NAT-ed setups won't work.

The setup order is a little tricky: you need opendray's webhook URL
**before** Feishu can verify it, but opendray won't show you a
webhook URL until the channel exists. The workaround is step 4 in
the table above — create the channel with the secrets you have so
far, then come back in step 7 to fill in the verification token
once Feishu has confirmed the URL.

For finding the chat ID:
- **Path A** — bot already in a chat: chat → ⋯ → settings → bot
  details may expose the `oc_...` ID.
- **Path B** — list via API:
  ```bash
  curl -X POST 'https://open.feishu.cn/open-apis/im/v1/chats' \
    -H "Authorization: Bearer <tenant_access_token>"
  ```
  Get the tenant_access_token via `POST /open-apis/auth/v3/tenant_access_token/internal`
  with your app id + secret.

</details>
