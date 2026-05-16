# 频道 — 概览

一个*频道*就是一份已配置的消息平台集成。每个频道都遵循同样的生命周期:

1. 在平台的管理控制台**准备凭证**(bot token / OAuth scope / webhook URL 等)。
2. 在 opendray 里 **Channels → New channel**,粘贴凭证。
3. 等待卡片状态标签变为 `running`。
4.(可选)**Edit** Notifications 面板调整模式、主题和片段上限。
5.(可选)多平台场景下,用不同的 kind 重复上述步骤。

每个平台下面都有自己的配置章节 — 阅读与你目标 chat 对应的那一节即可。Notifications 面板和路由规则是共享的,所以接好一个频道之后,其余的就完全相同。

## 内置平台

| Kind | 入站 | 出站 | 需要公网 URL? | 最适合 |
|---|---|---|---|---|
| `telegram` | long-poll | REST | 否 | 个人开发 — 配置最快 |
| `slack` | Socket Mode | Web API + blocks | 否 | 团队 chat,原生交互 |
| `discord` | Gateway WS | REST + embeds | 否 | 开发者 / maker 社区 |
| `feishu` | webhook | tenant API | **是** | 中国 / 跨组织正式频道 |
| `dingtalk` |(无) | 群机器人 | 否 | 中国企业群组 |
| `wecom` |(无) | 群机器人 | 否 | WeCom(企业微信)群组 |
| `bridge` | WebSocket | WebSocket | 否(token 鉴权) | 自定义平台(Line / KakaoTalk / 你自己的) |

## 能力对比

| 能力 | telegram | slack | discord | feishu | dingtalk | wecom | bridge |
|---|---|---|---|---|---|---|---|
| 接收用户回复 | ✓ | ✓ | ✓ | ✓ | — | — | ✓ |
| Markdown body | ✓ HTML | ✓ blocks | ✓ embed | ✓ card | ✓ md | ✓ md | adapter |
| 内联按钮 | ✓ | ✓ | ✓ | ✓ | 仅导航 | 仅导航 | adapter |
| reply-to-message 路由 | ✓ | ✓ thread | ✓ ref | ✓ reply | — | — | adapter |
| 原地编辑更新 | ✓ | ✓ | ✓ | 部分 | — | — | adapter |

"仅导航" = 群机器人不能触发回调按钮,但 URL 链接仍然渲染为可点击行。

## 接下来去哪里

- 从目录中挑选你的平台:Telegram / Slack / Discord / 飞书 / DingTalk / WeCom / Bridge — 每个有自己的配置章节。
- 至少一个频道运行后,阅读 **Notifications 面板**(模式、主题、片段上限)和 **Multi-session routing**(reply-to-message、`/select`、`/sessions`) — 它们适用于每个频道。

![Channels page with one running telegram bot](/tutorial/channels-running.png)
