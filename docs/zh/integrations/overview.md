# 集成 — 概览

Integrations 页面把 opendray 变成一个面向第三方工具的、带签名 token 的、受管反向代理网关。这一页就是项目描述中"第三方 API 网关"这句话的来源。

## 你能拿到什么

| 能力 | 章节 |
|---|---|
| 每个集成自己的 API key(可轮转) | 集成列表 |
| 通过 opendray 反向代理其他 HTTP 服务并加上认证 | 反向代理挂载 |
| 审计日志 + 每次调用的归属信息 | 调用日志 |
| 让外部工具订阅 opendray 的事件总线 | Events WebSocket |

下面每一节都有深入说明。

## 为什么要把流量过 opendray?

三个具体用例:

### 1. 单一认证入口

你在内部跑了 4 个工具(Grafana、一个自定义仪表板、AI 用量追踪器、一个 webhook 接收器)。每一个都有自己一套认证方式。opendray 可以把它们都代理过来,对外只暴露一个管理员 token + 一组集成 key。

### 2. 可审计的 AI 用量

跑在你笔记本上的某个工具想调用 Anthropic 的 API。把它的流量经过 opendray,每次调用都会被记录,带上调用方(集成 key)+ 端点 + 耗时 + 状态 — 这是账单级别的审计轨迹。

### 3. Webhook 扇出

外部服务(GitHub、Stripe、CI pipeline)发 webhook。opendray 在一个公开端点接收它们,用集成的 key 签名,然后在事件总线上重新发布,让任何会话、频道或管理脚本都能响应。

## 一段话讲清认证模型

两种 token,都用 Bearer:

- **管理员 token** — 完全访问。Web UI 和管理 CLI 使用。存在 `config.toml` 或环境变量里。
- **集成 key** — 有作用域、每个集成一份、可轮转。在 DB 里以 hash 形式存储;明文只在创建时展示一次。供外部调用方使用。

`/api/v1/` 下的端点两种都接受;当用集成 key 调用时,中间件把这次调用归属到该集成,这样调用日志能展示"谁做了什么"。

双重认证中间件的顺序很重要:`auth` 先跑,然后 `integration call logger` 包住响应,这样调用归属才能看到 principal。

![Integrations page](/tutorial/integrations-layout.png)

## 接着读

| 主题 | 章节 |
|---|---|
| Token 类型以及它们如何相互作用 | Auth model |
| 通过 opendray 挂载第三方 API | Reverse proxy |
| 审计 / 归属表 | Call log |
| 从 opendray 外部订阅事件 | Events WebSocket |
