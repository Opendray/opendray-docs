# Scopes 参考

每个集成都会在其 API key 上挂一组作用域。作用域是 claim 风格的字符串;网关中间件在每个请求上都会检查它们,如果请求端点不在该集成的作用域集合内,就返回 403。

这个集合在注册时确定,通过管理端 UI 编辑(Integrations → Edit → Scopes)。已生效的 API key 在变更后的 **下一次** 请求就会看到新的作用域集 — 无需重启,也无需轮转 key。

## 怎样为你的应用选择作用域

原则是 **最小权限**。先从能证明你的应用可以工作的只读子集开始,然后按需要扩大。opendray 为新注册的集成默认配的作用域是:

```
session:read
event:subscribe:session.*
```

这够用于仪表板或监控;但不足以驱动会话。

## 目录

### Sessions

| Scope | 可访问的端点 |
|---|---|
| `session:read` | `GET /sessions`、`/sessions/{id}`、`/sessions/{id}/buffer`、`/sessions/{id}/stream`(WS)、`/sessions/{id}/history` |
| `session:create` | `POST /sessions`、`POST /sessions/{id}/start`、`POST /sessions/{id}/stop`、`DELETE /sessions/{id}`、`PATCH /sessions/{id}/claude-account` |
| `session:input` | `POST /sessions/{id}/input`、`POST /sessions/{id}/resize` |

常见组合:

- **仪表板** → 仅 `session:read`。
- **驱动 Claude 的机器人** → `session:read` + `session:create` + `session:input`。
- **只读监控** → `session:read` + `event:subscribe:session.*`。

### Channels

| Scope | 可访问的端点 |
|---|---|
| `channel:send` | `POST /channels/{id}/notify`、`/channels/{id}/send` |
| `channel:receive` | `POST /channels/{id}/inbound`(webhook) |

Channel 的 CRUD(注册、删除)是仅管理员 — 你的应用没法通过这些作用域管理 channel。

### 事件订阅

这些是 `/integrations/_events` WebSocket 上的闸口。每个 topic 家族都有自己的作用域:

| Scope | Topics |
|---|---|
| `event:subscribe:session.*` | session.started、.idle、.activity、.stopped、.ended、.restarted |
| `event:subscribe:channel.*` | channel.message_sent、.message_forwarded、.command_received |
| `event:subscribe:integration.*` | integration.registered、.health_changed、.key_rotated |

你也可以通过申请精确的作用域来订阅某一个具体 topic,比如 `event:subscribe:session.idle` — 但实际上通配符变体用起来更方便,而且范围也足够窄。

### 杂项

| Scope | 可访问的端点 |
|---|---|
| `provider:read` | `GET /catalog`、`/catalog/providers`、`/catalog/providers/{id}` |

适合在你的应用想要先了解网关主机上有哪些 agent CLI 可用,然后再去孵化会话的场景。

## 作用域 **不** 包含的部分

- **管理员端点** — `/admin/settings`、`/admin/restart`、`/integrations`(CRUD)、`/auth/login` 由 **管理员身份** 控制,而不是作用域。没有任何作用域能让一个集成冒充管理员。
- **反向代理目标** — 一旦你的集成可以在 `/api/v1/proxy/<prefix>/*` 上被访问,调用方就会用 **自己的** bearer(管理员或任何集成)来打你的服务。opendray 不在代理路径上做按目标的作用域过滤;下游服务自己负责所需的更细粒度授权。

## 审计

每一次经过作用域检查的请求都会进入集成调用日志(见 [Activity → Call log](#integrations-call-log)),带着归属的 integration_id。如果你怀疑 key 被盗,搜索一下不该出现的端点,然后轮转。
