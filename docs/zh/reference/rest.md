# REST 端点 <Badge type="beta">Beta</Badge>

管理会话、频道、provider、记忆、集成 key 的同步 HTTP API。

<Callout type="info">
本页是 *目录*。端到端用法(认证、SDK 配置、错误处理)见
[接入 opendray → 快速开始](/zh/consuming/quickstart)。
</Callout>

## 会话 Sessions

<Tabs>
<Tab label="列表" id="sess-list">

```http
GET /api/v1/sessions
Authorization: Bearer od_live_xxx
```

返回 key 可见的分页会话。

```json
{
  "data": [
    {
      "id": "s_42",
      "provider": "claude",
      "cwd": "/home/dev/proj",
      "state": "idle",
      "created_at": "2026-05-01T10:24:00Z"
    }
  ],
  "pagination": { "next_cursor": null, "has_more": false }
}
```

</Tab>
<Tab label="创建" id="sess-create">

```http
POST /api/v1/sessions
Authorization: Bearer od_live_xxx
Content-Type: application/json

{
  "provider": "claude",
  "cwd": "/home/dev/proj",
  "channel_id": "ch_telegram_main"
}
```

返回 `201 Created` + 新会话对象。

</Tab>
<Tab label="发送输入" id="sess-input">

```http
POST /api/v1/sessions/:id/input
Authorization: Bearer od_live_xxx
Content-Type: application/json

{
  "text": "review src/auth/login.ts"
}
```

文本被追加到会话的 stdin。用 [输出 WebSocket](/zh/reference/websocket)
接收响应。

</Tab>
<Tab label="终止" id="sess-end">

```http
DELETE /api/v1/sessions/:id
Authorization: Bearer od_live_xxx
```

向底层进程发 `SIGTERM`,所有 viewer 断开。

</Tab>
</Tabs>

## 频道 Channels

<Tabs>
<Tab label="列表" id="ch-list">

```http
GET /api/v1/channels
```

返回所有已配置的频道及其连接状态。

</Tab>
<Tab label="发送" id="ch-send">

```http
POST /api/v1/channels/:id/send
Content-Type: application/json

{
  "text": "构建完成 —— 等待 review",
  "session_ref": "s_42"
}
```

通过该频道推一条消息。给外部系统做即兴通知用。

</Tab>
</Tabs>

## 记忆 Memory

```http
POST /api/v1/memory/recall
Content-Type: application/json

{
  "query": "之前 payments 项目里 JWT refresh 是怎么做的",
  "scope": ["user", "project:payments"],
  "limit": 5
}
```

返回带来源归属和置信分的排序片段。概念模型见
[记忆 → 快速开始](/zh/memory/quickstart)。

## 集成密钥

| 方法 | 路径 | 用途 |
|---|---|---|
| `GET` | `/api/v1/keys` | 列出 key(不含 secret) |
| `POST` | `/api/v1/keys` | 创建指定 scope 的新 key |
| `POST` | `/api/v1/keys/:id/rotate` | 创建后继 key,旧 key 进入 grace period |
| `DELETE` | `/api/v1/keys/:id` | 立即吊销 |

零停机轮换流程见 [密钥轮换](/zh/consuming/key-rotation)。

## 状态 / 健康

```http
GET /api/v1/health
```

返回 `{ "status": "ok", "version": "0.1.0", "uptime_s": 12345 }`,
可用于 liveness probe。

<Callout type="tip">
本页是 **稳定形状**。完整机器可读的 OpenAPI 文档在每个运行实例的
`http://localhost:8651/api/v1/openapi.json` —— 喂给你选用的代码
生成器即可。
</Callout>
