# Reverse proxy

把任意 HTTP 后端挂载在 opendray 的 auth + 审计管道之后。Integrations 页面的反向代理部分,是把 opendray 真正变成"API 网关"的关键,而不仅仅是一个会话管理器。

## 何时使用

两个主要场景:

1. **聚合内部工具。** 你想为 Grafana、自定义仪表板、webhook 收集器等提供一个统一的 Bearer-token 入口。把每一个都挂在 opendray 的某个路径前缀之后。
2. **审计 AI provider 调用。** 把 Anthropic 的 API 挂在 `/api/v1/proxy/anthropic` 后面,给内部工具发放有作用域的集成 key,每次调用都会在调用日志中带着调用方归属出现。

## 添加一个代理挂载

Integrations → **Reverse proxy** 子标签 → **Add mount**。

| 字段 | 用途 |
|---|---|
| **Path prefix** | 挂载在 opendray 上的位置(例如 `/api/v1/proxy/anthropic`) |
| **Upstream base URL** | 转发的目标(例如 `https://api.anthropic.com`) |
| **Integration ids** | 允许打这个挂载的集成 key 白名单;为空 = 仅管理员 |
| **Strip prefix** | 为 `true` 时,转发前剥离路径前缀 |
| **Header passthrough** | 要转发的进来的请求头,逗号分隔列表 |
| **Header injection** | 要设置在出站请求上的请求头映射(例如从 secret 注入 `Authorization: ...`) |

![Reverse proxy mount form](/tutorial/integrations-proxy-mount.png)

## Header injection 示例

挂载 Anthropic API,从 opendray 管理的 secret 注入上游 API key:

```
Path prefix:        /api/v1/proxy/anthropic
Upstream base URL:  https://api.anthropic.com
Strip prefix:       true
Header injection:   x-api-key=$ANTHROPIC_API_KEY
```

现在任何集成 key 打 `https://opendray/api/v1/proxy/anthropic/v1/messages` 的请求都会被转发到 `https://api.anthropic.com/v1/messages`,并带上正确的 `x-api-key`。内部工具永远看不到上游 API key。

`$ANTHROPIC_API_KEY` 是从 opendray 的环境变量中插值的;运维方轮转一次,每一个挂载都会拿到新值。

## 代理做了什么

1. **Auth** — 请求走标准的双重认证中间件。管理员 token 或在白名单中的集成 key。
2. **Strip prefix** — 如果开启,从转发 URL 中去掉挂载前缀。
3. **Header rewrite** — 透传 + 注入。
4. **Forward** — `httputil.ReverseProxy` 做实际的转发,双向流式传输 body(所以来自 Anthropic 的 SSE 能不缓冲地穿过)。
5. **Call log** — 中间件记录这次调用,带上调用方集成 id + 状态码 + 耗时。

流式:opendray 在每个响应分片后都 `Flush()`,所以来自上游 API provider 的 Server-Sent Events(Anthropic 的 `/v1/messages?stream=true`、OpenAI 的 `/v1/chat/completions`)能在不增加缓冲延迟的情况下工作。

## 限制

- **除 strip-prefix 外不支持路径改写。** 如果你需要 `/foo/bar` → `/baz/bar`,在前面再放一个真正的反向代理(Caddy、nginx)。opendray 的代理是有意做得简单。
- **上游 5xx 不重试。** 失败会立刻冒到调用方。把幂等任务交给外部重试。
- **不解析 body。** opendray 不解析 JSON body;默认请求大小限制是 10 MiB。
- **不支持代理 WebSocket**(代理是按 HTTP 请求 scope 的)。用 Events WS 做 opendray 原生事件订阅。
