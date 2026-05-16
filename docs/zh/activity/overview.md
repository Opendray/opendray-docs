# 活动 — 概览

Activity 页是 opendray **系统级** 内部事件总线的 `tail -f`。
每个会话生命周期事件、每个通道入站、每个通知扇出、每个集成
调用,都实时落在这里。

> **不要混淆:** Sessions Inspector 上的 **History** tab,是
> 一个 *per-project prompt 日志*,数据源自每个 CLI 在磁盘上的
> transcript。Activity = 事件;History = 用户 prompt。

## 什么时候用

- 调 "为什么我的 Telegram 通道没通知?" — 看 `session.idle`
  触发,确认 `channel.message_sent` 紧跟着。
- 确认一个 slash 命令收到了 — 找带你命令名的
  `channel.command_received`。
- 追踪工具转发 — `channel.message_forwarded` 显示
  channel→session 的输入投递。
- 实时看集成调用日志滚过。
- 单纯地观察 — opendray 的行为从这一页高度可见。

![活动页面](/tutorial/activity-layout.png)

## 你看到什么

每一行是一个事件:

| 列 | 注意事项 |
|---|---|
| Time | 服务器侧时间戳(UTC)|
| Topic | 点号命名的事件 id(`session.idle`、`channel.message_sent`、…)|
| Summary | 从 payload 合成的一行 |
| Expand | 点行看完整 JSON payload |

最新事件在顶部;自动滚动跟随可以切换(默认开)。想读一个
具体行又不想它滑走时,暂停自动滚动。

## 过滤器

过滤器栏是客户端的 — 事件无论怎样都通过 WebSocket 持续流入。
按主题前缀过滤:

- `session.` — 只有会话生命周期事件
- `channel.` — 通道入站、出站、命令、转发
- `integration.` — 调用日志 + 认证尝试
- 任何你通过插件加进来的自定义前缀

过滤器 per-user 粘性;重新加载页面,你的上一个过滤器保留。

## 实时计数

底部栏显示 events/second(在 5s 内平滑)。用来判断是不是
有事发生 — 静默意味着总线确实安静,不是页面坏了。

## 继续阅读

| 主题 | 章节 |
|---|---|
| 每个事件主题 + payload 形状 | 主题清单 |
