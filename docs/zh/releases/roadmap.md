# 路线图

opendray 接下来几个季度的方向。这是个活的文档 —— 优先级变了,卡片
就在列之间移动。

<Callout type="info">
具体到每个 issue / PR 的追踪,看
[GitHub project board](https://github.com/orgs/opendray/projects)。
本页面只讲背后的"为什么"。
</Callout>

## 进行中 <Badge type="beta">Now</Badge>

<CardGroup :cols="2">
<Card icon="🧠" title="本地优先记忆 v2">
多租户 scope、冲突解决 UI、嵌入后端评测框架。目标:跨项目引用召回
率 90%+。
</Card>
<Card icon="📱" title="移动端伴生应用">
基于集成 API 的原生 iOS / Android 客户端 —— 不走聊天平台也能操控
会话。
</Card>
<Card icon="🛡️" title="审计 + ACL">
按频道粒度的 ACL、签名审计日志、关键操作可选 WebAuthn(部署、DB
迁移、装新依赖)。
</Card>
<Card icon="🪄" title="工作流配方">
可重跑、可参数化的"会话模板"—— Telegram 一条命令就启动一次
code review / 部署 gate / PR 落地。
</Card>
</CardGroup>

## 下一批 <Badge type="info">Soon</Badge>

<CardGroup :cols="2">
<Card icon="🌐" title="托管版">
不想自托管的团队可以用我们托管的控制面。同一套 OSS 代码,多租户。
</Card>
<Card icon="🔁" title="供应商热切换">
会话进行中切换 provider(Claude → Codex → Gemini)且保留上下文。
中途换 provider 优化成本时有用。
</Card>
<Card icon="📊" title="用量分析">
每会话 / 每用户的 token 消耗、延迟、成败率指标面板。
</Card>
<Card icon="🤝" title="结对编程模式">
共享游标 + 操作归属 —— 多人在同一会话里跟 AI 一起改代码。
</Card>
</CardGroup>

## 考虑中 <Badge type="tip">Later</Badge>

- **VS Code / JetBrains 插件** —— 在 IDE 里看会话流。
- **浏览器插件** —— `Cmd+Shift+O` 针对当前打开的 GitHub PR / 仓库
  开会话。
- **声明式 Terraform 风配置** —— 项目根放 `opendray.toml`,
  `opendray apply` 自动建好频道 / provider / 记忆 scope。

## 最近发布

完整变更见 [更新日志](./changelog)。

## 有想法?

去 [GitHub discussions](https://github.com/opendray/opendray/discussions)
提一下,或者直接开 feature request。Issue tracker 是 backlog 唯一
来源,没在那的东西不会被排上日程。
