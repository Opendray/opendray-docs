# 欢迎使用 OpenDray

OpenDray 是一个自托管的 AI 编程 CLI(Claude Code、Codex、Gemini CLI 等)控制平面。它让你在服务器上启动长时间运行的 CLI 会话,从任何设备驱动它们,并桥接到 Telegram、Discord 等消息平台 — 当一个空闲会话需要关注时,它可以主动 ping 你。

## 这个管理后台能做什么

| 页面 | 用途 |
| --- | --- |
| **Sessions** | 在多标签终端里启动 / 接入 / 驱动 CLI 会话。日常工作台。 |
| **Channels** | 接入 Telegram / Slack / Discord / 飞书 / DingTalk(钉钉)/ WeCom(企业微信),会话变空闲时通知你,从手机回复。 |
| **Providers** | 配置 CLI 供应商(Claude、Codex 等) — 路径、环境变量、默认参数。 |
| **Integrations** | 把 opendray 本身作为 HTTP 网关暴露给第三方工具(托管反向代理、签名集成 token)。 |
| **Activity** | 事件总线上每个事件的实时跟踪 — 用于调试通知流、频道入站等。 |
| **Notes** | 兼容 Obsidian 的 markdown 笔记库,带 wiki-link 反向链接。 |
| **Plugins** | Skill 和 MCP 服务器注册表 — 会话可调用的工具目录。 |
| **Settings** | 鉴权、主题、键盘快捷键。 |

![Sidebar overview](/tutorial/sidebar-overview.png)

## 首次运行清单

如果你刚装好 opendray,按顺序做这几件事:

1. **登录** — 管理员凭证写在 `config.toml` 或环境变量里。
2. **配置 Provider** — 至少把 `claude` 指向二进制路径。否则 spawn 对话框没东西可启动。
3. **启动第一个会话** — 打开 Sessions → **New session** → 选择一个供应商和工作目录。
4. **接入一个频道**(可选) — 大部分用户先注册一个 Telegram bot,因为它不需要公网 URL。

接下来的指南会逐页详细讲解。你可以线性阅读,也可以从左侧目录跳转。
