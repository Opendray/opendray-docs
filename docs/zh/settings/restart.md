# 重启

多数 Server 设置在网关进程重启之前不会生效 — `listen` 重新
绑定 socket、`log.level` 重新配置 slog handler、空闲阈值在
启动时读一次,等等。每个 Server 章节的底部都有一个
**Restart server** 按钮,会原地处理这件事。

## 点 Restart 后发生什么

1. 浏览器 POST `/api/v1/admin/restart`。
2. 网关返回 `202 Accepted` 然后等 500 ms(让响应能 flush
   出去)。
3. 网关调用 `syscall.Exec(os.Executable(), os.Args, …)` —
   运行中的进程被 **替换** 成同一个二进制的全新执行。PID
   不变;监听 socket 短暂掉下后重新绑定。
4. 浏览器显示一个全屏覆盖层,带一个 tick 计数器。
5. 浏览器每 1s 轮询 `/api/v1/health`。第一次成功 →
   "Server restarted" toast,页面自动重载。
6. 30s 后超时 → toast 报错,覆盖层清掉以便你手动调查。

总停机时间:正常情况下 **~1-3 秒**。

## 确认对话框

在重启真正触发之前,会有两道护栏:

- **Unsaved changes**:"Restart will use the LAST SAVED
  config. Continue?" — 如果你输入了什么但没点 Save,会被
  丢弃。点 cancel、点 Save,然后再 Restart。
- **通用确认**:"Restart the opendray gateway? All open
  terminal sessions will reconnect automatically." — exec
  之前最后一个 OK。

无论是哪个 Server 章节触发的重启,这两个确认都会弹。

## 什么能挺过重启

- **数据库状态** — Postgres 是外部的;sessions、审计日志、
  channels、integrations、cliacct 行都保留。
- **活跃终端会话的 DB 行** — 因为 PTY 没了,它们在启动时
  会被对账为 `ended`,但会话 ID + tab 保留。点 **Start**
  重新拉起。
- **通道 webhook 和集成** — 它们的 DB 支持状态保留,通道
  在启动时重连。
- **浏览器状态** — 自动重载保留你的路由、bearer token、主题。

## 什么会丢

- **实时日志 tail 缓冲** — 内存里的 ring 被清空。重启后
  最初几条记录显示为空一会儿。
- **订阅 WebSocket** — 事件查看器、日志流、会话终端流全
  断开然后自动重连。
- **`config.toml` 注释** — 每次 UI 上的 Save 用的是
  BurntSushi/toml 编码器,它不保留注释。如果你有仔细的
  注释,手动编辑文件,跳过那一章节的 UI Save。

## Restart vs `pkill` + 重启

功能上完全一样 — 自重 exec 路径只是个方便。如果你的启动
包装器有它自己的 re-exec 逻辑(systemd、docker 风格的
PID 1),你可以从 UI 停掉网关,让 supervisor 重启它。UI
不在乎实际是哪条路径把进程拉回来;它只是轮询 `/health`
直到绿。

如果你 **没有 supervisor** — 比如你从一个已经关掉的终端
里通过 `nohup go run ./cmd/opendray serve &` 启动 —
`syscall.Exec` 是唯一无需手动干预就能拉回的方式。在点
按钮前确认:一次失败的自 exec 会让你没有守护进程。

## 手动恢复

如果 UI 重启卡住、30s 超时触发,网关大概率处于退化状态
(DB 不可达、监听端口冲突、`config.toml` 坏了)。从 shell
恢复:

```bash
# 找到并杀掉卡住的进程。
pkill -f "opendray serve"

# Tail 日志看启动为什么失败。
tail -f /tmp/opendray.log    # 或者 journalctl -fu opendray,等等。

# 修底层问题,然后重启。
go run ./cmd/opendray serve -config config.toml
```

如果 `config.toml` 是问题,文件在 Settings 页头部显示的路径
上(每个章节标题下小号等宽字体)。
