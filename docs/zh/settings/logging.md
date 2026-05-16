# 日志

Settings → **Server → Logging** 管三个旋钮和一个实时 tail。

## 旋钮

| 字段 | toml key | 默认 | 注意事项 |
|---|---|---|---|
| 日志级别 | `log.level` | `info` | `debug` / `info` / `warn` / `error`。低于这个级别的行会在任何 handler 跑之前就被丢掉。|
| 格式 | `log.format` | `text` | `text` 是默认的人类可读行格式;`json` 是每行一条 JSON 对象。|
| 日志文件 | `log.file` | *(空)* | 可选路径。一旦设置,每行除了写到 stderr 还会写到这里。10 MB 自动轮转,保留 5 个备份,最长 30 天。|

`log.file` 接受 `~/`,首次写入时创建。如果目录不存在,
opendray 会创建(mode `0o755`)。文件以 append-only 打开;
opendray 的并发运行会交错条目 — 别在两个运行中的实例之间
共用同一个路径。

改这三者中任何一个都需要 **Restart** — slog handler 在启动时
只构建一次。

## 实时 tail

表单下面,**Live tail** 面板显示直接从运行中进程流过来的最近
日志行:

- 网关在内存环形缓冲里保留最近的 **2,000 条记录**(约 1-2 MB
  RSS)。WebSocket 连上时,面板重放整个 ring,然后转发每条
  新到的记录。
- **按级别上色**:debug(灰)/ info(默认)/ warn
  (琥珀)/ error(红)。
- **计数**:顶部小小的 `D · I · W · E` 统计显示当前面板里
  每个级别有多少记录。
- **`live` / `offline` 指示器** 确认 WebSocket 已连接。

### 工具栏

| 按钮 | 动作 |
|---|---|
| 🔍 搜索框 | 子串过滤,大小写不敏感,匹配渲染后的文本行 |
| **Pause** | 停止自动滚动。记录仍在到达,但视图停止跳。|
| **Clear** | 清掉本地视图。**服务器端的 ring 不受影响** — 下次重新加载页面会重放完整缓冲。|
| **Download** | 把整个 ring 保存成 `opendray-YYYYMMDD-HHMMSS.log`。纯文本,每行一条记录。|

浏览器本地最多持有 5,000 条记录以保持 DOM 响应 — 超过后,
老的行从头部掉落。服务器的 ring 是真实数据源;如果你滚到
顶想看更老的上下文,就 download。

## 每个级别什么时候用

- **debug** 开发时或调一个具体 bug 时。verbose;不适合生产。
- **info** 生产默认。每个 HTTP 请求都用 info 记;空闲 /
  start / stop 事件也是。
- **warn** 给 "东西还能用但看起来不对劲" — 比如 Telegram
  退避、通道认证抖动。
- **error** 给 "出问题了用户注意到或将要注意到"。可执行;
  罕见。

如果你把级别提到 `error` 来让吵闹的生产日志安静,用页面
底部的 **Restart server**;重新加载浏览器;实时 tail 重新开始。

## 日志还在哪里?

- 网关进程的 **stderr** — 你重定向到的任何地方(终端、
  `nohup ... > /tmp/opendray.log`、systemd journal、Docker
  stdout)。不受 `log.file` 设置影响;multi-writer 同时打到
  两边。
- **审计日志**(DB 支持,这不是同一回事)— 跟踪每个 admin
  动作(配置更新、重启、集成 CRUD)。活在 Activity 页过滤
  下,不在这里。
