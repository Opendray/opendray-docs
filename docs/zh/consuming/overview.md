# 接入 opendray — 概览

本组文档面向 **第三方开发者**,他们构建的应用会调用 opendray 的 API。如果你是 opendray 运维方,想了解如何在管理端 UI 中管理集成,请阅读 [集成](#integrations-overview) 这一组。

## 心智模型

opendray 在 `/api/v1/...` 下暴露一个统一的、双重认证的 REST + WebSocket 接口:

```
                                ┌──────────────────────────┐
                                │     opendray gateway     │
                                │                          │
   Your app ──── HTTPS/WS ────► │  /api/v1/sessions       │
   (Bearer key)                 │  /api/v1/channels       │
                                │  /api/v1/integrations   │
                                │  /api/v1/integrations/  │
                                │      _events    (WS)     │
                                └──────────────────────────┘
                                          │
                                          ▼
                                ┌──────────────────────────┐
                                │   Backed by:             │
                                │   · PTYs (claude/codex/  │
                                │     gemini/shell)        │
                                │   · channels (Telegram,  │
                                │     Slack, Discord, …)   │
                                │   · postgres (audit log) │
                                └──────────────────────────┘
```

你的应用只认证一次,之后可以读取或驱动其 **作用域** 允许的任何接口。

## 你能做什么

两种互补的模式 — 选其一(或同时使用):

### 1. 消费方模式 (Consumer mode)

你的应用 **调用** opendray 的 API。示例:

- 一个 Web 仪表板,列出正在运行的 Claude/Codex/Gemini 会话
- 一个 Slack 机器人,接收会话空闲事件并提示运维方
- 一个监控服务,订阅事件总线并把指标推送到 Grafana
- 一个 CLI 工具,为批处理任务孵化无界面的 agent 会话

**认证**:集成 API key 作为 Bearer token。
**网络**:你的应用向 opendray 发起出站 HTTPS。

### 2. 反向代理模式 (Reverse-proxy mode)

你的应用 **暴露** 一个 HTTP 服务,由 opendray 在其前面挂载。其他 opendray 消费方通过 `/api/v1/proxy/<your-prefix>/*` 访问它。示例:

- 一个自定义的 Anthropic-API 调用追踪器
- 一个接收上传文件的小票扫描服务
- 一个 webhook 接收器,把事件转发到 opendray 的总线上

**认证**:opendray 校验调用方的 bearer;你的服务信任网关,只负责提供 HTTP。
**网络**:opendray 向你的服务发起入站 HTTP。

同一条集成记录可以同时是两种模式(设置 `base_url` + `route_prefix` 启用代理;同一个 `api_key` 也让同一个应用作为消费方使用)。

## 本组包含哪些内容

| 主题 | 章节 |
|---|---|
| 5 分钟 curl 上手 | [Quickstart](#consuming-quickstart) |
| Bearer-token 管道 | [Authentication](#consuming-authentication) |
| REST 端点参考 | [REST API](#consuming-rest-api) |
| WebSocket 事件 | [Event subscriptions](#consuming-websocket-events) |
| 作用域目录 | [Scopes reference](#consuming-scopes) |
| 持久化 + 恢复密钥 | [Key rotation](#consuming-key-rotation) |
| TypeScript 起步模板 | [TypeScript SDK](#consuming-typescript-sdk) |
| 错误响应 + 重试 | [Error handling](#consuming-error-handling) |

整组文档对应了 [`examples/integrations/demo-client/`](https://github.com/Opendray/opendray_v2/tree/main/examples/integrations/demo-client) 这份参考实现 — 复制它然后修改,或者对照阅读。
