# 快捷键和主题(theme)

**Settings → Workspace** 下两个纯外观偏好面板。两者都持久化
在浏览器 localStorage 里 — 不需要重启 server,不影响另一台
机器上的其他 tab。

## 主题(theme)

Settings → **Workspace → Appearance** 选择器:

- **Dark** — 默认,和 admin 设计的其他部分匹配。
- **Light** — 白天显示器用。
- **System** — 跟随 OS 偏好;OS 切换深色模式时自动翻转。

主题(theme)按浏览器持久化到 localStorage。没有 "per device
主题" 切换 — 你账号下的每个浏览器 tab 共享一个。

自定义主题 token(当你想要企业品牌)在
`app/web/src/index.css` 下 — 改 CSS 变量并重新编译。
opendray 不带主题编辑器。

## 字号

Settings → **Workspace → Font size** 缩放整个 UI(标题、
正文、图标、终端字符):

| 预设 | 缩放 |
|---|---|
| Compact | 85% |
| Default | 100% |
| Comfy | 115% |
| Large | 130% |

在 4K 显示器上 Default 看起来太小时用 Comfy / Large;
Sessions 工作区塞满 tab 时用 Compact。和主题一样,按浏览器
持久化。

## 快捷键

快捷键是写死的(尚不支持操作员自定义)。下面是当前的绑定表。

![快捷键编辑器](/tutorial/settings-shortcuts.png)

| 默认 | 动作 |
|---|---|
| `g s` | Sessions |
| `g n` | Notes |
| `g a` | Activity |
| `g p` | Providers |
| `g c` | Channels |
| `g i` | Integrations |
| `g l` | Plugins |
| `g ,` | Settings |
| `g h` | 教程(这一页)|
| `n s` | 新会话(在 Sessions 页时)|
| `Cmd / Ctrl + K` | 命令面板 |
| `?` | 快捷键帮助对话框 |
| `Esc` | 关闭任何打开的对话框 / popup |

## 命令面板

Cmd/Ctrl + K 打开一个模糊搜索的命令面板。每个有快捷键的
admin 动作都在那里,加上没有快捷键的(比如 *Create new
note*、*Restart this session*)。

对于多步工作流,面板比硬记快捷键好用 — 它会内联告诉你有
哪些可能。
