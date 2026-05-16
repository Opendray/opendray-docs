# 通用(general)

通用(general)章节把网关的网络绑定和操作员账号放到一起。
这里有两个子组:

- **Network** — `listen` 地址(HTTP server 绑定到的
  host:port)
- **Operator account** — 登录用户 + 密码 + bearer token TTL

四个字段都需要 **Restart** 才能让新值生效。任何一个变 dirty
的瞬间,页面会浮出一个黄色的 "restart required" 标识。

## Network

| 字段 | toml key | 注意事项 |
|---|---|---|
| Listen 地址 | `listen` | `0.0.0.0:8770` 在所有接口暴露;`127.0.0.1:8770` 是 loopback-only。|

如果你改了端口而你的反向代理 / 浏览器还指着旧端口,重启后
重新加载页面就会失败。要么先修代理,要么在保存之前记下新
URL。

## 操作员账号

| 字段 | toml key | 注意事项 |
|---|---|---|
| Username | `admin.user` | `/login` 接受的登录名。改它会强制重新登录。|
| Password | `admin.password` | 已脱敏。留空保留当前值;输入一个值会覆盖。|
| Token TTL | `admin.token_ttl` | Bearer token 生命周期,Go duration 格式(`24h`、`30m`)。空 = 永不过期。|

### 密码存储

密码以明文存在 `config.toml`,这样网关不用单独的哈希数据库
就能校验 `/login` 请求。两个后果:

1. **`config.toml` 权限重要。** 确保它是 `600` 模式
   (网关每次 Save 都会写成 `0o600`,但如果你从别处拷贝过来
   要检查一下权限)。
2. **`Reveal` 开关** 让你在保存前看到自己输入了什么。浏览器
   永远不会从 server 接收现有密码 — 只有你输入到字段里的
   内容。

### 忘记密码?

直接编辑 `config.toml`:

```toml
[admin]
user     = "admin"
password = "new-temporary-password"
```

保存文件,重启 opendray(`pkill -f "opendray serve"` + 同一个
启动命令),登录,然后从 UI 轮换。

### 危险变更上的确认对话框

在动了 `listen`、`admin.user`、或 `admin.password` 之后保存
General 章节,会触发一个确认对话框,警告可能需要重新认证或
不同的 URL。这具体是因为重启后的浏览器可能没法用它已缓存的
凭据去够到运行中的网关。

## Bearer token vs 集成 API key

Token TTL 适用于 **操作员的** 浏览器会话 bearer token(由
`/login` 签发)。它 **不** 影响:

- **集成 API key** — 在 Integrations 下管理,默认永不过期
- **通道 webhook** — 按平台校验(Telegram bot token、Slack
  signing secret 等)
- **Claude 账号 OAuth token** — 在 Providers → Claude
  accounts 下管理

所以设置 `token_ttl = "1h"` 只是每小时让 *你* 登出一次;
它不影响 bot 或 webhook。
