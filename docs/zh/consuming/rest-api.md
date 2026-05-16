# REST API 参考

这是面向消费方的端点接口 — 集成 API key 能够驱动的全部端点。未列出的端点都是仅管理员可用。

所有路径都是相对于 `/api/v1` 这个根。除非另有说明,所有响应都是 JSON。

## Auth

| Method | Path | 用途 | Body 形状 |
|---|---|---|---|
| POST | `/auth/login` | 签发管理员 token | `{username, password}` → `{token, expires_at, username}` |

## Sessions

| Method | Path | Scope | 说明 |
|---|---|---|---|
| GET    | `/sessions` | `session:read` | 列出所有状态的会话。返回 `{sessions: [...]}` |
| GET    | `/sessions/{id}` | `session:read` | 查看单个会话 |
| POST   | `/sessions` | `session:create` | 孵化。Body: `{name, provider_id, cwd, args?, claude_account_id?}` |
| POST   | `/sessions/{id}/start` | `session:create` | 重新孵化一条已结束/已停止的记录 |
| POST   | `/sessions/{id}/stop` | `session:create` | 给 PTY 发 SIGTERM,但保留记录 |
| DELETE | `/sessions/{id}` | `session:create` | 停止 + 删除记录 |
| POST   | `/sessions/{id}/input` | `session:input` | Body: `{data: string}`。字节直接写入 PTY 的 stdin |
| POST   | `/sessions/{id}/resize` | `session:input` | Body: `{cols, rows}` |
| GET    | `/sessions/{id}/buffer?since=N` | `session:read` | PTY 环形缓冲区中的原始字节 |
| GET    | `/sessions/{id}/stream` | `session:read` | WS upgrade — 实时 stdout |
| GET    | `/sessions/{id}/history?limit=N` | `session:read` | 项目级 prompt 历史(仅 Claude/Codex/Gemini) |
| PATCH  | `/sessions/{id}/claude-account` | `session:create` | 切换 Claude account 绑定 |

### `provider_id` 取值

| 值 | 孵化目标 |
|---|---|
| `shell` | 用户的 `$SHELL`(zsh、bash 等) |
| `claude` | Claude Code CLI |
| `codex` | OpenAI Codex CLI |
| `gemini` | Google Gemini CLI |

对于 Claude/Codex/Gemini,opendray 需要知道相应的 CLI 已经安装在网关主机上。详见 [Providers](#providers-overview) 中的探测 + 各 provider 目录。

## Channels

| Method | Path | Scope | 说明 |
|---|---|---|---|
| GET    | `/channels` | (无 — 仅管理员可列出) | 列在这里只是为了完整性 — channel 的 CRUD 全是仅管理员 |
| POST   | `/channels/{id}/notify` | `channel:send` | Body: `{title, body, level?}` |
| POST   | `/channels/{id}/send` | `channel:send` | 发送自由格式的消息 |
| POST   | `/channels/{id}/inbound` | `channel:receive` | Webhook 接收器(按 provider 不同做签名校验) |

## Catalog + providers

| Method | Path | Scope |
|---|---|---|
| GET | `/catalog` | `provider:read` |
| GET | `/catalog/providers` | `provider:read` |
| GET | `/catalog/providers/{id}` | `provider:read` |

## Integrations(仅管理员 — 列出仅供参考)

| Method | Path | 说明 |
|---|---|---|
| GET    | `/integrations` | 列出自己的 + 管理员时列出全部 |
| POST   | `/integrations` | 注册,返回明文 key |
| GET    | `/integrations/{id}` | 单条记录 |
| PATCH  | `/integrations/{id}` | 编辑 `base_url`/`scopes`/`version`/`enabled` |
| DELETE | `/integrations/{id}` | 删除记录 |
| POST   | `/integrations/{id}/rotate-key` | 生成新 key,旧 key 失效 |

注意:你不能用集成自己的 key 通过这些端点管理 **自己** 的集成 — 这只能由管理员执行。让运维方在 Web UI 中操作。

## WebSockets

| Path | Scope | 用途 |
|---|---|---|
| `/sessions/{id}/stream` | `session:read` | 实时 PTY stdout(二进制帧) |
| `/integrations/_events?topics=…` | 按 topic 检查 `event:subscribe:<topic>` | 实时事件总线 |

WS 事件契约见 [Event subscriptions](#consuming-websocket-events)。

## 反向代理模式

如果你的集成注册时带了 `base_url` + `route_prefix`,那么在认证 + 作用域检查通过后,`/api/v1/proxy/<route_prefix>/*` 下 **任意** 路径都会被转发到你的服务。路径剥离后,你的服务收到的请求路径不带前缀。

举例:集成 `route_prefix=pet-tracker`,`base_url=http://192.168.3.42:8080`。调用方请求 `/api/v1/proxy/pet-tracker/api/dogs?breed=corgi` → 你的服务看到 `GET /api/dogs?breed=corgi`。

## 响应封装

opendray 的成功响应没有泛用的封装层 — 响应体本身 **就是** 资源(列表时则是 `{<key>: [array]}`)。错误响应统一为:

```json
{ "error": "human-readable reason" }
```

并附带一个 HTTP 状态码。`4xx` = 调用方的错,`5xx` = 网关本身的错(或代理模式下的下游服务问题)。
