# 更新日志

opendray 所有显著变更都记录在这里。格式遵循
[Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/),版本号
遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

<Callout type="tip">
权威来源是 GitHub Releases 页面 —
[github.com/opendray/opendray/releases](https://github.com/opendray/opendray/releases)。
本页面镜像它,方便在文档里离线浏览。
</Callout>

## 未发布

### 新增

- _(占位)_ 描述刚 merge 到 `main` 的新功能。

### 变更

- _(占位)_ 不破坏兼容性的行为变更。

### 修复

- _(占位)_ 上次 tag 之后的 bug 修复。

---

## v0.1.0 — _即将发布_ <Badge type="beta">Pre-release</Badge>

第一个公开预览版。具体进展见
[GitHub Projects](https://github.com/opendray/opendray) 上的 milestone。

<CardGroup :cols="2">
<Card icon="🛰" title="Sessions">
长耗时 CLI 会话,完整 PTY、多客户端镜像、跨设备断线重连。
</Card>
<Card icon="💬" title="6 个频道适配器">
Telegram、Slack、Discord、飞书、钉钉、企业微信,外加 Bridge WebSocket
适配器接入自定义平台。
</Card>
<Card icon="🧠" title="本地优先记忆">
ONNX、Ollama、LM Studio 三选一做嵌入。用户/项目/会话三层检索。
</Card>
<Card icon="🔌" title="集成 API">
REST + WebSocket 接口,在 opendray 之上做自己的客户端。
</Card>
</CardGroup>

---

## 版本约定

- **主版本** (`x.0.0`) — 破坏性的配置/API 变更,需要迁移。
- **次版本** (`0.x.0`) — 新能力,不破坏兼容性。
- **修订版本** (`0.0.x`) — 只修 bug,可以放心升级。

破坏性变更总是在 release notes 的 **Breaking** 段单独标出,并附带
迁移方案。
