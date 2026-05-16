# Quickstart

用 `curl` 在 5 分钟内端到端跑一遍。完成后你会拥有一个通过 API 孵化出来的、正在运行的 Claude 会话。

## 前置条件

- opendray 已在运行且可达(默认 `http://127.0.0.1:8770`)。
- 管理员凭证(默认值:`admin` / `12345678`,来自 `config.toml [admin]`)。
- 至少安装了一个 agent provider — `shell` 随 opendray 自带,无需任何配置。

## Step 1 · 签发管理员 token

```bash
ADMIN=$(curl -s -X POST http://127.0.0.1:8770/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"12345678"}' \
  | jq -r .token)
```

这个 token 寿命短(默认 24h)而权限完全。**只用一次** 它去注册集成,然后就可以忘掉它了。

## Step 2 · 注册一个仅消费方的集成

```bash
RESP=$(curl -s -X POST http://127.0.0.1:8770/api/v1/integrations \
  -H "Authorization: Bearer $ADMIN" \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "my-app",
    "base_url": "",
    "route_prefix": "",
    "scopes": [
      "session:read",
      "session:create",
      "session:input",
      "event:subscribe:session.*"
    ],
    "version": "0.1.0"
  }')

echo "$RESP" | jq -r .api_key
```

复制打印出的 `api_key` — opendray 不会再次展示它。

```bash
KEY="odk_live_…the_key_you_just_copied"
```

## Step 3 · 列出会话

```bash
curl -s http://127.0.0.1:8770/api/v1/sessions \
  -H "Authorization: Bearer $KEY" \
  | jq .sessions
```

200 → 一个数组(可能为空)。401 → key 错误 / 作用域不对 / 集成被禁用。

## Step 4 · 孵化一个 shell 会话

```bash
SESSION=$(curl -s -X POST http://127.0.0.1:8770/api/v1/sessions \
  -H "Authorization: Bearer $KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "demo",
    "provider_id": "shell",
    "cwd": "/tmp"
  }')

SESSION_ID=$(echo "$SESSION" | jq -r .id)
echo "spawned $SESSION_ID"
```

## Step 5 · 发送输入

```bash
curl -s -X POST \
  "http://127.0.0.1:8770/api/v1/sessions/$SESSION_ID/input" \
  -H "Authorization: Bearer $KEY" \
  -H 'Content-Type: application/json' \
  -d '{"data": "echo hello\n"}'
```

> **重要**:shell 期望 `\n`。**Claude 期望 `\r`**(raw 模式)。终止符不对 = 你的输入就停在输入框里没有被提交。

## Step 6 · 读取输出

```bash
curl -s "http://127.0.0.1:8770/api/v1/sessions/$SESSION_ID/buffer" \
  -H "Authorization: Bearer $KEY"
```

返回 PTY 环形缓冲区中的原始字节(带 ANSI 着色的 shell 输出)。最后几行应该包含 `hello`。

## Step 7 · 清理

```bash
curl -s -X DELETE \
  "http://127.0.0.1:8770/api/v1/sessions/$SESSION_ID" \
  -H "Authorization: Bearer $KEY" \
  -o /dev/null -w '%{http_code}\n'
# → 204
```

## 你刚刚验证了什么

- Step 3-7 的 **每一次** 调用都用同一个 `api_key` 认证。
- Step 2 之后你再没有用过管理员 token。
- 你的作用域集合限制了你能做什么 — 试着调用一个 `provider:read` 端点,你会拿到 403,因为我们没有把那个作用域加进去。

要了解 API 的 WebSocket 事件订阅部分,跳到 [Event subscriptions](#consuming-websocket-events)。
