# 案例展示

正在生产环境用 opendray 的团队。在用并希望被列出来,
[提个 PR](https://github.com/opendray/opendray-docs/edit/main/docs/zh/releases/showcase.md)
加一张 Card —— 写清楚做什么 + opendray 在里面起什么作用就行。

<Callout type="tip">
想看大家是怎么用的?往下翻 [真实场景](#patterns) 那一节有总结。
</Callout>

## 已上线团队

<CardGroup :cols="2">
<Card icon="🏗" title="你的团队位置">
这是社会化证明页。前十个把 opendray 推到生产的团队可以拿到永久
shoutout —— 提 PR 时附一段话 + 一张 logo(优先 SVG, 64×64)。
</Card>
<Card icon="🌱" title="早期接入预留位">
同上。预留给第一波公开 OSS 接入者。
</Card>
</CardGroup>

## 真实场景 {#patterns}

不说具体名字,常见的使用模式有这些:

<CardGroup :cols="2">
<Card icon="🌅" title="早咖啡前 triage">
独立开发者醒来打开 Telegram,看到一晚上 Claude 做的 PR 按风险 + diff
排好序。`y` 批四个,让 Claude 重做一个,关掉一个。打开笔记本前
全搞定。
</Card>
<Card icon="🛬" title="移动端部署 gate">
On-call 工程师在机场,Slack 收到生产部署需要人审的通知。打开内嵌
会话预览看 diff,点一下批准。
</Card>
<Card icon="📚" title="跨项目记忆召回">
多语言代码库共享一些模式。写新账单服务时,opendray 自动浮出
"支付服务当年是怎么做的"—— 包括你凌晨 2 点写下的坑点。
</Card>
<Card icon="🧑‍🤝‍🧑" title="Discord 上结对 review">
小开源团队拿 Discord thread 做"评审频道"。谁都能 `/select s_42`
看 AI 操作,所有动作归属到驾驶员。
</Card>
<Card icon="🔁" title="长跑型迁移">
后台跑会话啃一个 200 表的 schema 迁移。每跑完一批就在企业微信群
ping 一下,on-call 回 `continue` / `pause` / `rollback`。
</Card>
<Card icon="📓" title="活的架构文档">
笔记 vault 跟项目 git 同步。会话后工程师追加发现,下次 AI 读 vault
拿上下文。知识复利。
</Card>
</CardGroup>

## 投稿你的案例

想写长一点的 case study?发邮件到 `hello@opendray.dev` 或者直接 PR
往 `docs/zh/releases/showcase/` 加一篇 markdown。
