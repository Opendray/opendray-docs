# 会话默认值

两个旋钮在全局层面控制会话生命周期行为。两者都活在
`config.toml` 的 `[session]` 下,在 **Settings → Server →
Sessions** 里可编辑。UI 改动写回 `config.toml`,但要 **Restart**
才生效(空闲检测器在启动时只读一次配置)。

## 空闲阈值

stdout 静默多久,opendray 才会把会话翻成 `IDLE` 并发布
`session.idle`。

| 字段 | 默认 | 范围 |
|---|---|---|
| `idle_threshold` | `30s` | `5s` – `5m` |

更低 = 更多通知(任何短暂停都算)。
更高 = 错过短暂的 "我只是停下来想一想" 暂停,只在真正被
遗弃的会话上收到通知。

对 Claude Code 来说:`30s` 是一个甜区 — 长到流式输出
(字符间会有小间隙)不会造成虚假的空闲抖动,短到能在一分钟
内提醒你助手实际上在等。

对纯 shell 来说:`60s`+ 更合理,因为 shell 提示符比聊天
安静得多。

## 空闲监视器间隔

每个会话的 goroutine 轮询空闲状态的频率。更低 = 检测状态
转换更快(更好的 UX);更高 = 每个会话占用的 CPU 更少。

| 字段 | 默认 | 范围 |
|---|---|---|
| `idle_interval` | `5s` | `1s` – `30s` |

默认值对多数设置够用。如果你跑了 100+ 会话,监视器在
profiling 里露面,调到 10s。否则不动。

## per-channel 冷却是另一回事

会话级别的空闲阈值是底线 — 一旦会话静默 N 秒,空闲触发。
它会不会被 *转发* 到每个通道,取决于通道的通知策略:

- **Once per session**(通道默认)— 发一次通知,然后
  抑制到下次回复或会话结束。即使会话在一小时内 active→idle
  来回 50 次,通道也只 ping 你一次。
- **Time-window cooldown** — 空闲期间每 N 分钟重新通知。
  用在你想要循环提醒时。
- **Every event** — 不抑制;每次空闲都发新的通知。

完整的 per-channel 调优见 [通道 → 通知面板](#channels-notifications)。

## 调优工作流

如果你收到太多通知:

1. 别降 idle_threshold — 底层的空闲事件不是噪声来源。
2. 把通道策略切到 *Once per session*。这能处理 90% 的
   "太吵了" 抱怨。

如果你错过通知:

1. 检查通道在它的 *Notify on* 主题里勾上了 `session.idle`。
2. 检查通道没被静音(config 里 `muted: true`,或者发过
   `/notify off`)。
3. 检查冷却没在抑制(Once 模式 + 没有回复 = 一直抑制到
   会话结束)。

**Activity** 页是确认实际发生了什么最快的方式 — `session.idle`
事件实时出现,然后跟着 `channel.message_sent` 事件,或者没有。

## 其他旋钮(UI 上只读;在 config.toml 里编辑)

| 旋钮 | 默认 | 用途 |
|---|---|---|
| `[session].ring_size` | `1 MiB` | 每个会话的 stdout 环形缓冲容量 |
| `[session].terminate_grace` | `3s` | 停止时 SIGTERM 到 SIGKILL 的间隔 |
| `[session].vt_cols` / `vt_rows` | `120 × 40` | 屏幕快照用的虚拟终端初始尺寸 |

这些只能在 config 里改,因为在运行时改它们会以出乎意料的
方式影响已经拉起的会话。编辑后重启 opendray。
