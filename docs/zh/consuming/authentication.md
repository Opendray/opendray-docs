# Authentication

opendray 在每一个受保护的端点上接受两种 **Bearer token**。中间件按以下顺序检查它们:

1. **管理员 token** — 由 `POST /api/v1/auth/login` 签发。对每个端点都有完全访问权限。寿命由 `config.toml` 中的 `[admin].token_ttl` 配置(默认 24h,留空 = 不过期)。供 Web UI 以及你的一次性配置脚本使用。
2. **集成 API key** — 由 `POST /api/v1/integrations` 生成,明文 **只展示一次**。被限制在该集成允许的 API 接口范围内。无寿命 — 直到被轮转或删除前都有效。

两种 token 都放在 `Authorization` 请求头中:

```
Authorization: Bearer <token>
```

对于无法添加请求头的浏览器 WebSocket,opendray 也接受在 WS upgrade 请求上传 `?token=<token>` 查询参数。

## 身份是如何被解析的

```
HTTP request lands  →  CombinedMiddleware (admin first, integration
                       fallback) → resolves Principal:
                       { kind: admin | integration, id, scopes }
                                  ↓
                       per-endpoint scope check (if integration)
                                  ↓
                       handler runs; integration_id flows into the
                       call log (see Activity → Call log)
```

具体到集成:网关会遍历每一个已启用集成的 `api_key_hash`,用 bcrypt 与 bearer 比对。第一个匹配的胜出。第一次匹配之后,有一个微型的内存缓存把明文 → integration_id 记下来,后续请求就跳过 bcrypt;这个缓存在 rotate 时会被清空。

## API key 应该存在哪里

| 环境 | 推荐存储方式 |
|---|---|
| 本地 CLI 工具 | `~/.config/<your-app>/credentials`(权限 0600) |
| macOS 桌面应用 | Keychain(`security` CLI、`node-keytar`) |
| Linux 桌面应用 | libsecret / GNOME Keyring |
| Linux 守护进程 | systemd `LoadCredential=` 或文件权限 0600 |
| Server / 容器 | AWS Secrets Manager、GCP Secret Manager、Vault |
| CI / CD | 加密的环境变量(如 GitHub Actions secrets) |

参考实现 [demo-client](#consuming-typescript-sdk) 用了一个扁平的 JSON 文件(`.demo-state.json`,权限 0600,被 gitignore),因为它只是单机学习用的示例。生产环境别这么干。

## 授权失败

| 状态码 | 含义 |
|---|---|
| `401 unauthorized` | Bearer 缺失、格式错误,或没有任何集成的 hash 匹配。 |
| `401`(在调用本来可工作之后) | Key 在服务端被轮转。需要拿到新 key 才能恢复(见 [Key rotation](#consuming-key-rotation))。 |
| `403 forbidden` | 已认证,但该集成的作用域不包含本端点。 |
| `503 service unavailable` | 集成记录被禁用,或 `health_status=unhealthy`(仅代理模式)。 |

失败响应的 JSON 体始终包含 `{"error": "<reason>"}`,这样你不需要解析自然语言就能记录根因。

## CORS + 浏览器调用方

opendray 的 `CheckOrigin` 很宽松 — 在 WebSocket upgrade 上每一个 origin 都被允许。HTTP server 也不附加 CORS 响应头(没有 `Access-Control-Allow-Origin`),所以从一个不同 origin 的浏览器直接调用会因 preflight 失败而出问题,除非你在前面放一个反向代理。目前的建议是:仅从管理端 UI 所在的 **同源** 调用 opendray,或者从服务端运行环境调用。
