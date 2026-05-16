---
layout: home

hero:
  name: opendray
  text: 多 CLI 控制网关
  tagline: 把 Claude Code、Codex、Gemini CLI 会话接入 Telegram、Slack、Discord、飞书、钉钉、企业微信 —— 随时随地,任意设备。
  actions:
    - theme: brand
      text: 开始使用
      link: /zh/getting-started/welcome
    - theme: alt
      text: 在 GitHub 查看
      link: https://github.com/opendray/opendray

features:
  - icon: 🛰️
    title: 远程运行会话
    details: 在服务器上启动 Claude Code / Codex / Gemini CLI 会话,从手机、平板或另一台笔记本上操控。完整 PTY、多客户端镜像、断线重连。
  - icon: 💬
    title: 任意消息平台回复
    details: 内置六大平台 —— Telegram、Slack、Discord、飞书、钉钉、企业微信,外加自定义协议的 Bridge 适配器。回复一条通知,内容直接喂回会话的 stdin。
  - icon: 🧠
    title: 本地优先的记忆系统
    details: 嵌入向量走本地 ONNX、Ollama 或 LM Studio。跨层检索(用户、项目、会话)+ 智能排序 + 冲突检测。数据不出内网。
  - icon: 🔌
    title: 集成 API
    details: REST + WebSocket 接口给你构建自己的客户端。Scope 化的 API key、审计日志、反向代理挂载。把 opendray 作为产品后端的网关。
  - icon: 📓
    title: 笔记 + wiki 链接
    details: 支持 wiki 双向链接的 Markdown 笔记、源代码/预览双视图编辑器、git 同步 vault。在会话旁记录知识 —— 跟 Claude 共用同一个 vault。
  - icon: 🧩
    title: 插件与 Skills
    details: Skills、MCP 服务器、Git 主机适配器 —— 不 fork 就能扩展。插件注册表向接入的所有会话暴露能力。
---
