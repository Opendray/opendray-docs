# 标签与键盘导航

Sessions 页面是后台中键盘快捷键最重的页面。一旦熟悉,你可以不碰鼠标管理十几个 CLI。

## 标签条

![Multi-tab strip](/tutorial/sessions-tab-strip.png)

- **点击标签**切换。
- **点击运行中标签上的 ×** → 停止前确认。
- **点击 stopped/ended 标签上的 ×** → 视觉关闭(行保留在 DB)。
- **拖动标签**重新排序(状态按用户持久化)。
- **右键标签**打开上下文菜单:Restart、Rename、Close。

长名称会在中间省略(`my-project-foo-…-feat-x`),让结尾上下文(`-feat-x`)仍可读。

## 键盘快捷键

### 会话间导航

| 快捷键 | 动作 |
|---|---|
| `g s` | 跳到 Sessions 页面 |
| `Ctrl + Tab` | 下一个标签 |
| `Ctrl + Shift + Tab` | 上一个标签 |
| `Ctrl + 1` … `Ctrl + 9` | 跳到第 N 个标签 |
| `Ctrl + W` | 关闭当前标签(运行中会确认) |

`g`-前缀的快捷键是 vim 风格 — 按 `g`,然后在约 1.5 秒内按第二个键。状态栏会在 `g` 待定时显示一个小面包屑,所以你知道按键已注册。

### 终端内

xterm.js 直接处理按键。opendray 唯一的特殊拦截是 **`Ctrl + Shift + ↑/↓`** 用于回滚旁路 — 其它的看供应商自己的文档(Claude 有自己的 `Ctrl-G` 前缀循环用于权限模式等)。

### Inspector

| 快捷键 | 动作 |
|---|---|
| `g i` | 切换 Inspector 面板 |
| `1` – `7`(聚焦 Inspector 时) | 在子标签之间切换(Files、Git、Search、Tasks、History、Notes、Memory) |

通过点击一次 Inspector 来聚焦它,然后数字键就会生效。ESC 把焦点还给终端。每个子标签的功能见 [Inspector 面板](#02-sessions-03-inspector) 页。

### Spawn

| 快捷键 | 动作 |
|---|---|
| `n s` | 打开 Spawn 对话框(在 Sessions 页面时) |
| `Esc` | 关闭任何打开的对话框 |
| `Cmd/Ctrl + Enter` | 提交对话框(在 Spawn 表单的任何字段时) |

### 帮助

每个页面右上角的提示栏显示与该页面最相关的快捷键。把鼠标移到 `?` 上查看完整键位图。

## 触摸 / 移动端

Sessions 页面在平板上能用,但手机上不行 — 终端至少需要 600px 宽才可用。窄视口下侧栏折叠为图标模式、Inspector 改为覆盖而非并排,标签条变成水平滚动。

只用手机的话,改用[频道](#channels-overview):接收空闲通知,从手机回复,让 opendray 通过 Telegram / Slack 等把你的文本转发到合适的会话。
