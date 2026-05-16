# TypeScript SDK

opendray 在 `examples/integrations/demo-client/` 提供了一份 **参考客户端**,你可以把它当作起点复制走。它不是一个发布的 SDK 包 — 就是一份纯源码,fork 后改用。

## 这份参考演示了什么

demo 端到端跑过编号的九步:

```
 1. Connect to opendray
 2. Load credentials  (state file → reuse or fresh registration)
 3. List active sessions
 4. Spawn a shell session
 5. Send input
 6. Read terminal buffer
 7. Fetch project history
 8. Subscribe to event bus over WebSocket
 9. Cleanup spawned session
```

本地运行:

```bash
cd examples/integrations/demo-client
cp .env.example .env             # edit ADMIN_USER / PASSWORD
pnpm install
pnpm dev                         # first run registers + saves key
pnpm dev                         # second run reuses saved key
pnpm reset                       # delete integration + state file
```

## 文件结构

```
demo-client/
├── package.json       # tsx + ws + dotenv only, zero framework
├── tsconfig.json      # ESNext + strict
├── .env.example       # OPENDRAY_BASE, admin creds, scopes…
├── .gitignore         # blocks .env and .demo-state.json
├── README.md          # full walkthrough
└── src/
    ├── client.ts      # OpendrayClient class (REST + WS)
    ├── state.ts       # load/save/clear .demo-state.json (mode 0600)
    ├── reset.ts       # `pnpm reset` entry point
    └── index.ts       # `pnpm dev` — 9-step demo flow
```

## OpendrayClient 类

`client.ts` 刻意保持精简 — 大约 200 行 TS。三个原语就覆盖了一切:

```ts
const client = new OpendrayClient({ base, token: apiKey })

// 1. Login flow (only used at setup time)
await client.login('admin', 'pass')

// 2. Generic JSON REST helper. Path starts with /api/v1/.
//    Bearer is automatic from constructor.
const list = await client.apiCall<{ sessions: Session[] }>(
  '/api/v1/sessions',
)
const created = await client.apiCall<Session>('/api/v1/sessions', {
  method: 'POST',
  body: { provider_id: 'shell', cwd: '/tmp' },
})

// 3. WebSocket events.
const ws = client.wsEvents(
  ['session.*', 'integration.*'],   // topics
  (ev) => console.log(ev.topic, ev.data),
  (code, reason) => console.log('closed', code, reason),
)
// later
ws.close()
```

这个类不枚举所有端点。无论 opendray 在 `/api/v1/...` 下暴露什么,你的代码都通过 `apiCall<T>(path, ...)` 加上正确的 TypeScript 形状去访问 — 根据你实际要用的部分,在你自己的应用里定义这些形状。

## 凭证生命周期

`index.ts::authenticate()` 是一个四分支的决策树:

```
state file?    saved key works?    branch
─────────────────────────────────────────────────
   no               n/a             Fresh registration
   yes              yes (200)       Reuse saved key
   yes              401             Recover by rotating
   yes              other error     Fall through to fresh
```

把这个完全一致的模式带进你自己的消费方,把 `state.ts` 换成适合你部署环境的 secret-store 集成(见 [Authentication → Where to store your API key](#consuming-authentication))。

## 这份参考 **没有** 包含什么

- **重试 / 退避** — `apiCall` 在第一个非 2xx 时就 throw。生产环境中,你需要对 5xx + 幂等的 4xx 做带 jitter 的指数退避。见 [Error handling](#consuming-error-handling)。
- **连接池** — Node 的 `fetch` 在底层会复用连接,所以这一项很少成为瓶颈;重负载的消费方可能要直接换 `undici`。
- **遥测** — 没有 metric 也没有 trace。如果你想要端点级别的耗时统计,把 OpenTelemetry 包到 `apiCall` 外面。
- **限流处理** — opendray 目前不对集成做限流。如果以后会变化(429 会出现在目录里),消费方的应对模式就是遵守 `Retry-After`。

## 移植到其他语言

契约就是普通的 HTTP + WebSocket;没有任何 TypeScript 专有的东西。这些模式可以直接对应:

- **Python**:REST 用 `requests`,WS 订阅用 `websockets` 库。状态文件用 `os.chmod(path, 0o600)`。
- **Go**:`net/http` + `gorilla/websocket`,结构一致。
- **Rust**:`reqwest` + `tokio-tungstenite`。
- **bash + curl**:除事件订阅外其他都能干(纯 bash 没有可用的 WS 客户端;通过 `websocat` 管道一下)。

demo-client 目录里的 README 有更完整的移植对照表。
