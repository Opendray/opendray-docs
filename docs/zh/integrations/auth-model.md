# Auth model

opendray 的 API 有两种 token 类型,通过双重认证中间件应用。理解优先级 + 作用范围,可以避免大多数"为什么这个调用返回 401?"的排错环节。

## 管理员 token(完全访问)

管理员 token 在启动时通过以下方式设置:

- `[auth].password`(遗留方式 — 实际上就是 `/login` 用的 bearer)
- 环境变量 `OPENDRAY_ADMIN_TOKEN`,供非 Web 调用方使用
- 或者首次启动时生成并展示一次

使用者:

- Web 管理 UI(登录之后)
- 任何 admin-CLI 脚本

管理员 token 绕过 **每一项** 认证检查。有了它,你可以打 `/api/v1/*` 中的任意端点,包括破坏性的端点比如对会话记录的 DELETE。

从 **Settings → Auth → Rotate admin password** 进行轮转。新值会立即让每一个 Web 会话失效 — 所有运维方都会被踢下线,需要重新登录。

## 集成 key(有作用域)

每个集成对应一个 bearer token。在 Integrations 页面创建:

1. **新建集成** → name(例如 `grafana-webhook-receiver`)。
2. opendray 生成一个随机 32 字节 hex key,对它做 hash,只保存 hash。明文在一个 modal 中 **只展示一次** — 现在就复制下来,或者立即 rotate。
3. 选择作用域(该 key 允许打的 `/api/v1/*` 路径)。默认是"所有只读路由" — 生产用的 key 要收窄。
4. 保存。

![Integration key reveal modal](/tutorial/integration-key-reveal.png)

卡片展示 key id(可见)+ 明文的掩码预览。**Rotate** 生成新的明文,旧的立即失效。

## 中间件如何决策

请求带着 `Authorization: Bearer <token>` 打到 opendray。

1. `auth.Middleware` 检查 token 是否等于管理员 token → 设 `principal=admin`,继续。
2. 否则调用 `integration.Service.AuthenticateKey(token)`。在 integration 表中查 hash。如果找到且该集成是 `enabled` → 设 `principal=integration:<id>`。
3. 否则 → 401。

principal 设好后,**调用日志中间件** 包住响应处理。响应写完后,它会向 `integration_call_log` 追加一行:

- principal(admin 或 integration id)
- 请求 method + path
- 响应状态码
- 耗时
- request id(用来和结构化日志关联)

管理员请求默认 **被排除** 在调用日志之外 — 这张表是用来追踪外部工具的,不是用来记录运维方在管理端的点击。

## 集成 key 的作用域

支持三种作用域模型:

| Scope | 含义 |
|---|---|
| `read` | 所有 `/api/v1/*` 的 GET 请求 |
| `write` | 在 `read` 之上,加上非破坏性路由的 POST/PATCH/DELETE |
| `admin` | 等价于管理员 token(慎用) |

未来方向是按路由的 ACL,但目前这三级足够覆盖大多数场景。当你需要把一个端点严格暴露给一个集成时,用反向代理挂载来做硬性限制。

## 常见坑

- **Rotate 之后立即 401** — 轮转过的 key 让旧 key 立即失效。更新消费工具的配置。
- **两个集成同名** — *显示名* 允许重复,但 *id* 唯一。列表中两个都会出现;rotate / archive 重复的那个。
- **Token 放在 URL 里** — opendray 只对事件 WebSocket 接受 `?token=` 查询参数(浏览器无法在 WS upgrade 上设置请求头)。其他端点全部使用 Authorization 请求头。
- **尾部空白** — 从终端复制时经常会带上一个换行。中间件会 trim,但排查"错误"token 时要确认。
