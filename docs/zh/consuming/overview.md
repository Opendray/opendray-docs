---
kind: concept
title: 接入 opendray — 概览
tldr: 第三方开发者构建调用 opendray 的 app 的指南。注册集成 → scope key → REST/WS API。一份 Claude Pro 订阅替代按 token 计费。
status: stable
since: v0.1.0
topic: consuming
related: [consuming/quickstart, consuming/authentication, consuming/rest-api, consuming/websocket-events, consuming/scopes, consuming/key-rotation, consuming/typescript-sdk, consuming/error-handling, integrations/overview]
references:
  capabilities: [integrations]
---

# 接入 opendray — 概览

> **tldr:** 第三方开发者构建调用 opendray 的 app 的指南。注册集成 → scope key → REST/WS API。一份 Claude Pro 订阅替代按 token 计费。

## 受众

| 组 | 什么 |
|---|---|
| 你 | 在写一个 app(pettracker、materialscout、下一个 app) |
| opendray | 已在你服务器上跑 |
| 目标 | 你的 app 通过 opendray API 起 Claude 会话 / 发 channel 消息 / 查记忆 |
| 成本好处 | 一份 $20/mo Claude Pro 服务你所有 app |

## 按顺序读

| # | 主题 | 为什么先 |
|---|---|---|
| 1 | [Quickstart](./quickstart) | 5 分钟冒烟测试 |
| 2 | [Authentication](./authentication) | bearer / scope 词汇 |
| 3 | [REST API](./rest-api) | per-端点 参考 |
| 4 | [WebSocket events](./websocket-events) | 需要 push 不 poll 时 |
| 5 | [Scopes](./scopes) | 枚举每个 scope id |
| 6 | [Key rotation](./key-rotation) | 零停机密钥替换 |
| 7 | [TypeScript SDK](./typescript-sdk) | 类型化客户端 |
| 8 | [Error handling](./error-handling) | `{code, message, hint}` 信封 |

## 跟 integrations 页文档的区别

| `/integrations/*` | `/consuming/*` |
|---|---|
| 运维方(自托管你的)注册集成 | 开发者(第三方)写集成 |
| 反向代理、call log、事件 WS 内部 | 怎么调 API |
| `/capabilities/integrations.json` 权威 | `/openapi.yaml` 权威 |

## AI agents 的机器可读 artifact

| Artifact | 用途 |
|---|---|
| [/openapi.yaml](/openapi.yaml) | 喂给你选用的代码生成器 |
| [/capabilities/integrations.json](/capabilities/integrations.json) | scope 词汇 |
| [/llms.txt](/llms.txt) | 每页索引 |
| [/manifest.json](/manifest.json) | 一次性站点总结 |
