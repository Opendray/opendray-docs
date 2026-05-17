# 截图清单 — opendray-docs

本清单列出 opendray-docs 站点首页 + 后续文档页所需的全部真实截图。
逐项告诉你:**截哪个页面 / 多大尺寸 / 截图前先准备什么状态 / 必须包含什么 / 文件名命名规范**。

## 通用拍摄规范

- **浏览器**: Safari / Chrome 用 1440 × 900 的窗口尺寸,DevTools "Toggle Device Toolbar" 设为 `Responsive 1440 × 900`(@2x DPR 截屏自动放大)
- **主题**: opendray 后台 **暗色模式**(深色背景跟我们文档的暗色主题搭得好,品牌一致)
- **字号**: 浏览器默认(don't zoom)
- **保存格式**: PNG,文件名小写、连字符、不带空格
- **保存目录**: `docs/public/tutorial/`(覆盖现有同名文件,VitePress 自动重新打包)
- **截图工具**: macOS `Cmd+Shift+5` → "Selected Window" → 选 Chrome 标签,得到带阴影的窗口截图(我们的浏览器 frame 会去掉系统阴影自加,无需再加边框)
- **隐私**: 截图前把 **真实 token / API key / 个人邮箱** 全部替换成示例值(如 `int_xxxxxxxx`、`@yourname`),数据库里 ChatID 等 ID 全部抹掉

## 准备工作:把后台填满"真实"数据

很多截图当前看起来空、像测试环境(比如 fake-app、empty activity)。截图前先把环境配置成一个"真实在用"的样子:

| 数据类型 | 至少要有 | 用途 |
|---|---|---|
| Session | 2-3 个会话(claude / codex 各一个,project name 用 `pettracker` 之类真实项目名) | 多 CLI 并行,有"在干活"的感觉 |
| Provider | 4 个都启用(Claude Code / Codex CLI / Gemini CLI / Shell) | 显示多 provider 支持 |
| Channel | 2-3 个真实 channels(Telegram + Slack + 飞书 或 钉钉) | 显示多平台已配置 |
| Integration | 3 个真实集成(`pettracker` / `materialscout` / `shoponline`),都是 healthy + enabled | 体现"个人项目生态共用 opendray" 卖点 |
| Activity | 至少有 30+ 条调用记录(让 Activity 不再 empty state) | 真实"在用"的感觉 |
| Memory | 至少有 20+ 条记忆条目(可以 dry-run 几次 capture 触发) | 让 Memory 页面有内容可看 |
| Notes | 1-2 篇示例笔记,带 wiki link 双向引用 | 笔记 vault 展示 |

---

## 一、首页 Hero 截图(优先级最高)

### 1.1 `sessions-hero.png` ⭐ 头号截图

| 项 | 详情 |
|---|---|
| **页面** | `/sessions` 主页 |
| **状态** | **2-3 个 active sessions**(Claude Code 在主面板,正在产出有意义的 prose,如"扫描架构 / 加测试"。会话列表里另外 1-2 个 idle session 看起来在排队) |
| **必须可见** | Sessions 侧边栏、session 列表、活动 session 的终端内容(中文 prose 体现真实使用)、右侧 Files / Git / Notes 面板、底部 status bar(`bypass permissions`、`/remote-control`) |
| **尺寸** | 1440 × 900 |
| **特别注意** | 避免 token / 邮箱泄露;若 prose 涉及私密项目改成中性内容 |

### 1.2 `mobile-app-home.png` (新增 — 优先级高)

| 项 | 详情 |
|---|---|
| **页面** | Flutter mobile app 主页 / session 详情页 |
| **状态** | 同一个项目(`pettracker`)的会话,正在跑,有终端内容滚动 |
| **必须可见** | iOS 状态栏(电池/wifi)、app 顶部 nav、session terminal、右下角发送按钮 |
| **尺寸** | 750 × 1334(iPhone SE)或 1290 × 2796(iPhone 16 Pro) |
| **用途** | Hero 浮层 + 后续 "从手机驱动" 段落 |
| **若没有真机** | iOS Simulator → `xcrun simctl io booted screenshot mobile-app-home.png` |

### 1.3 `telegram-notification.png`(可选 — 强化"消息平台真的可用"的卖点)

| 项 | 详情 |
|---|---|
| **页面** | Telegram 桌面 / 移动端 与 @opendray_bot 的对话 |
| **状态** | 一条 bot 推送的"会话状态变更"通知(idle / 需要确认 / 完成)+ 一条你的回复 |
| **必须可见** | bot 名 / 头像、通知卡片(含按钮)、回复消息、时间戳 |
| **尺寸** | 任意,纵长 < 1000px 即可 |
| **用途** | 备用 hero 浮层 或 Showcase 段落 |

---

## 二、产品 Tour 段(5 张 tabbed gallery)

### 2.1 `tour-spawn.png`

| 项 | 详情 |
|---|---|
| **页面** | `/sessions` → 点击 "+ New session" 后弹出的对话框 |
| **状态** | 对话框 + 后面的 sessions 列表都可见 |
| **必须可见** | 4 个 provider(Claude Code / Codex CLI / Gemini CLI / Shell)、Claude account 切换、Working directory 输入框、Name 选填、CLI args 文本框 |
| **尺寸** | 1440 × 900 |
| **替换** | `tutorial/spawn-dialog.png` |

### 2.2 `tour-providers.png`

| 项 | 详情 |
|---|---|
| **页面** | `/providers` → 点击左侧 Claude Code,看右侧详细配置 |
| **状态** | Provider 列表(全部 4 个)+ Claude Code 配置全展开 |
| **必须可见** | Provider 切换、enabled toggle、authentication 区、runtime(bypass permissions / max turns)、advanced(command path / extra args)、skills 开关 |
| **尺寸** | 1440 × 900 |
| **替换** | `tutorial/providers-layout.png` |

### 2.3 `tour-channels.png`

| 项 | 详情 |
|---|---|
| **页面** | `/channels` 主列表 + 已经配置好 2-3 个真实 channels |
| **状态** | 至少 2 个 running channel,显示真实 channel 名 / kind 标识 / 上次消息时间 |
| **必须可见** | 多个 channel 卡片,每个带状态徽章(running / paused) |
| **尺寸** | 1440 × 900 |
| **新文件** | `tutorial/channels-list.png` |

### 2.4 `tour-channel-edit.png`(替换 notifications-panel)

| 项 | 详情 |
|---|---|
| **页面** | `/channels` → 点击某个 channel(如 Telegram) → 编辑面板 |
| **状态** | 完整 edit 表单展开 |
| **必须可见** | Kind 标签、Bot token(脱敏)、chat ID(脱敏)、Session notifications(started / idle / ended 多个 chip)、Repeat policy、Terminal snippet、Enabled toggle |
| **尺寸** | 1440 × 900 |
| **替换** | `tutorial/channels-notifications-panel.png` |

### 2.5 `tour-integrations.png`

| 项 | 详情 |
|---|---|
| **页面** | `/integrations` 主列表 |
| **状态** | **3 个真实集成** 全部 healthy + enabled:`pettracker` / `materialscout` / `shoponline`,每个带 scope tags、proxy URL、last probed time |
| **必须可见** | Integration 卡片(名字 + integration ID + 状态 + URL + 反代路径 + scopes + Rotate key 按钮) |
| **尺寸** | 1440 × 900 |
| **替换** | `tutorial/integrations-layout.png` |

### 2.6 `tour-activity.png`

| 项 | 详情 |
|---|---|
| **页面** | `/activity` 主列表 |
| **状态** | **30+ 条真实 calls**(不要 empty state),来自不同 integration、不同 direction、不同 endpoint |
| **必须可见** | 顶部过滤器(integration / direction / status)、列表中每行 timestamp / direction / method / path / latency / status |
| **尺寸** | 1440 × 900 |
| **替换** | `tutorial/activity-layout.png` |

---

## 三、Channels 段 — 真实"用上了"的截图

### 3.1 `channels-kind-picker.png`(保留现有,但重拍版本号确保最新)

| 项 | 详情 |
|---|---|
| **页面** | `/channels` → "+ New channel" 对话框 → 点 Kind 下拉框 |
| **状态** | 下拉打开,**8 个 kind 全部显示**(Telegram / Slack / Discord / Feishu / DingTalk / WeCom / WeChat / bridge) |
| **必须可见** | 完整下拉列表 + 后面的对话框其他字段隐约可见 |
| **尺寸** | 720 × 900(竖向裁切就行) |
| **替换** | `tutorial/channels-kind-picker.png` |

### 3.2 `telegram-running.png`(新增)

| 项 | 详情 |
|---|---|
| **页面** | 真实 Telegram 客户端,与 @opendray_bot 对话 |
| **状态** | 一段 5-8 条消息的对话: bot 推送 idle 通知 → 你回复 → bot 推送 done → 你 ack |
| **必须可见** | 显示完整对话流(双向通信),最后一条是 bot 的回复 |
| **尺寸** | 任意纵长 |
| **可选** | 也拍一张 Slack / 飞书 / 钉钉 的同类对话当多平台证据 |

---

## 四、Why 段 — 数据可视化截图(可选)

### 4.1 `cost-arbitrage-chart.png`(可选)

| 项 | 详情 |
|---|---|
| **页面** | 自己用 Excel / Figma 画一张 30 天累计调用次数 → 等价 token 费用 vs $20/mo 订阅 的对比柱状图 |
| **用途** | Why 段 "一份订阅服务整个项目栈" 卡片 |
| **可不做** | 当前卡片用纯文字也 OK,这是 nice-to-have |

---

## 五、Memory 段(后续文档页用)

### 5.1 `memory-search.png`

| 项 | 详情 |
|---|---|
| **页面** | `/memory` 主页面 |
| **状态** | 搜索框输了一个查询,展示 5-8 条命中(每条带 scope tag、score、source CLI) |
| **必须可见** | 搜索框、scope filter(session/project/global)、结果列表、单条记忆详情 |
| **尺寸** | 1440 × 900 |

### 5.2 `memory-project.png`

| 项 | 详情 |
|---|---|
| **页面** | `/memory/project` |
| **状态** | 一个项目下的全部 project-scope 记忆 |
| **必须可见** | 项目名标题、记忆列表、每条带来源 session 信息 |
| **尺寸** | 1440 × 900 |

### 5.3 `memory-cleanup.png`

| 项 | 详情 |
|---|---|
| **页面** | `/memory/cleanup` |
| **状态** | 几条待清理的记忆(显示原因:stale / superseded / conflict) |
| **必须可见** | 清理队列列表 + 每条的"原因"标识 |
| **尺寸** | 1440 × 900 |

### 5.4 `memory-workers.png`

| 项 | 详情 |
|---|---|
| **页面** | `/memory/workers` |
| **状态** | summarization worker 状态(运行中 / 暂停),近期 token 消耗统计 |
| **必须可见** | Worker 列表、状态徽章、消耗数字 |
| **尺寸** | 1440 × 900 |

---

## 六、Notes 段

### 6.1 `notes-editor.png`

| 项 | 详情 |
|---|---|
| **页面** | `/notes` → 打开一篇笔记 |
| **状态** | Source / Preview 两栏对照,内容里有 wiki link `[[...]]` 高亮 |
| **必须可见** | 编辑器、wiki link 自动建议下拉、右侧 backlinks 面板 |
| **尺寸** | 1440 × 900 |

### 6.2 `notes-graph.png`(可选)

| 项 | 详情 |
|---|---|
| **页面** | `/notes/graph`(如果有) |
| **状态** | 笔记之间的双向链接图 |

---

## 七、Plugins / Skills / MCP 段

### 7.1 `plugins-skills.png`

| 项 | 详情 |
|---|---|
| **页面** | `/plugins` → Skills tab |
| **状态** | 几个 skill 注册项,显示 vault skill + builtin skill |
| **必须可见** | Skill 列表、来源(vault / builtin)、enabled toggle |
| **尺寸** | 1440 × 900 |

### 7.2 `plugins-mcp.png`

| 项 | 详情 |
|---|---|
| **页面** | `/plugins` → MCP tab |
| **状态** | 几个 MCP server 注册项,显示 stdio / http 类型 |
| **必须可见** | MCP server 列表、command / url、健康状态 |
| **尺寸** | 1440 × 900 |

---

## 八、Backup 段

### 8.1 `backup-targets.png`

| 项 | 详情 |
|---|---|
| **页面** | `/backups` |
| **状态** | 至少 2 个 backup target(本地 + 一个云,如 S3),最近 dump 历史 5+ 条 |
| **必须可见** | Target 卡片、加密状态徽章、上次成功时间 |
| **尺寸** | 1440 × 900 |

---

## 九、Settings 段

### 9.1 `settings-general.png`

| 项 | 详情 |
|---|---|
| **页面** | `/settings` General |
| **状态** | 已配置好的常规设置(theme / locale / shortcut) |
| **尺寸** | 1440 × 900 |

---

## 十、Mobile 系列(强化"随时随地"卖点)

### 10.1 `mobile-home.png`

| 项 | 详情 |
|---|---|
| **页面** | Flutter app 主页 |
| **状态** | session 列表 |
| **尺寸** | iOS 9:19.5(750 × 1334 或 iPhone 16) |

### 10.2 `mobile-session.png`

| 项 | 详情 |
|---|---|
| **页面** | session 详情 / terminal view |
| **状态** | 终端在产出,虚拟键盘 quick-keys strip 可见 |
| **尺寸** | iOS 9:19.5 |

### 10.3 `mobile-quickkeys.png`(可选)

| 项 | 详情 |
|---|---|
| **页面** | session 内,快捷键栏特写 |

---

## 优先级总览

按截图后我能立即用上的紧迫度排序:

| 优先级 | 文件 | 用途 |
|---|---|---|
| **P0** | `sessions-hero.png` | Hero 主图 |
| **P0** | `tour-integrations.png` | Tour gallery #4 — 体现 cost arbitrage 的关键截图 |
| **P0** | `tour-activity.png` | Tour gallery #5 — 别再是 empty state |
| **P0** | `channels-list.png` | Channels 段 |
| **P1** | `tour-spawn.png` | Tour gallery #1 |
| **P1** | `tour-providers.png` | Tour gallery #2 |
| **P1** | `tour-channel-edit.png` | Tour gallery #3 |
| **P1** | `channels-kind-picker.png` (重拍) | Channels 段 |
| **P1** | `mobile-app-home.png` | Hero 浮层 |
| **P2** | `telegram-running.png` | Showcase 段 |
| **P2** | Memory / Notes / Plugins / Backup / Settings 系列 | 后续文档页 |

## 命名约定

文件名采用 `小写-连字符.png`。如果同一截图有亮色和暗色两版,后缀 `-light` / `-dark`:

```
sessions-hero.png            ← 默认(暗色)
sessions-hero-light.png      ← 亮色变体(若拍)
```

## 把图扔给我之后

你只需要把截图放进 `docs/public/tutorial/` 覆盖同名文件,**不需要改任何代码**。
跑 `pnpm dev` 立即看到效果。如果你新增了清单外的截图想用到文档里,告诉我文件名 + 想放哪一段,我接到指令就给加上。
