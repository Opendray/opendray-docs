# Key rotation

opendray 支持 **即时密钥轮转**:运维方在 UI 上点 Rotate(或调用 `POST /integrations/{id}/rotate-key`),opendray 替换存储的 hash,旧的明文从下一次请求开始就立刻返回 `401 unauthorized`。

一个 7×24 运行的消费方必须优雅地处理这种变化。本页讲述各种处理模式。

## Rotate 在服务端做了什么

```
1. Generate new plaintext token + bcrypt hash.
2. UPDATE integration SET api_key_hash = <new hash> WHERE id = ?
3. Clear the in-memory token cache.
4. Publish integration.key_rotated event.
5. Return new plaintext to caller (admin in the UI).
```

旧明文从此永久消失 — opendray 和运维方都无法恢复。保存之后,你的消费方就是唯一存在可用凭证的地方。

## 处理 rotate 的三种模式

### 模式 1 · 从 secret store 重新加载

最简单的方式。你的应用在每次启动时从一个 secret manager 加载 key。运行期间发生 401 时,你发出"我需要重启"的信号,让运维方(或进程监督者)用新 key 重新部署。

```ts
async function callOpendray(path: string) {
  const res = await fetch(path, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (res.status === 401) {
    process.exit(75) // EX_TEMPFAIL — let supervisor restart
  }
  return res
}
```

适用场景:小型 CLI 工具、cronjob,以及任何每次运行都全新启动的程序。

### 模式 2 · 401 时从 secret store 重新拉取

类似模式 1 但不重启 — 消费方假设 secret store 已经有最新的 key,然后刷新进程内缓存。

```ts
async function callOpendray(path: string) {
  let res = await tryWith(apiKey, path)
  if (res.status === 401) {
    apiKey = await secretStore.getLatest('opendray-key')
    res = await tryWith(apiKey, path)
  }
  return res
}
```

运维方的轮转流程现在变成:在 opendray UI 中 rotate → 在 vault 中更新 secret → 消费方在下一次 401 时自动恢复。两步手动操作,但不需要重启服务。

适用场景:长期运行、且能编程访问 secret store 的服务。

### 模式 3 · 自我轮转(需要管理员凭证)

你的应用持有管理员凭证,看到 401 时 **为自己** 执行 rotate,然后把新 key 写到本地。这就是 [demo-client](#consuming-typescript-sdk) 的做法:

```ts
// 401 detected → log in as admin → rotate-key → write state
const admin = new OpendrayClient({ base })
await admin.login(adminUser, adminPassword)
const { api_key } = await admin.rotateKey(integrationId)
saveState({ ...state, api_key, registered_at: new Date().toISOString() })
```

适用场景:开发 / 单机环境,且把管理员凭证存在应用里是可以接受的。**不要** 把这种方式放进多用户生产环境 — 把管理员凭证暴露在集成的威胁面里,就背离了"集成"这个概念的初衷。

## 不要主动轮转

"为了卫生每 30 天轮转一次"的 cron 循环是 opendray 上常见的反模式。原因:

1. opendray 没有办法把新 key 推送给你的消费方。每一次轮转都是一个手工同步步骤。
2. 忘了那一步 = 宕机。
3. opendray 的威胁模型是"API key 在运维方控制之下",而不是"API key 作为有时限的会话 token"。在这里 TTL 不会增加安全性。

**事件驱动地** 轮转 — 怀疑泄露、运维人员离职、审计日志出现可疑流量。其他情况就让 key 保持原样。

## 不要在多个应用间共用 key

每个消费方都拿自己的集成记录 + key。原因:

1. 作用域集合可以不一样 — 仪表板不需要 `session:input`,机器人需要。
2. 调用日志归因依赖每个集成各自的 key — 共用就意味着你分不清是哪个应用发起了某次调用。
3. 轮转会让所有共用此 key 的消费方全军覆没。

如果你有 N 个应用,就注册 N 个集成。

## Rotate 过程中的竞争

从运维方点击 Rotate 到你的消费方拿到新 key 之间,所有在飞的请求都会失败 401。中间没有重叠窗口。Rotate 事件期间预计会有 ≤ 几秒的错误,让你的重试层吸收掉,而不要触发告警。
