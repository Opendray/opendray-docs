---
kind: concept
title: 给 AI agents
tldr: 本站把文档以机器可读格式发布,AI 不需要解析 HTML 就能消费 opendray 文档。
status: stable
since: v1.0.0
topic: meta
related:
  - getting-started/welcome
  - reference/overview
x-implementation:
  - scripts/generate-llms-txt.mjs
  - docs/public/manifest.json
---

# 给 AI agents

> **tldr:** 本站把文档以机器可读格式发布,AI 不需要解析 HTML 就能消费 opendray 文档。

## 是什么

`docs.opendray.dev` 每一页都有一致的 YAML frontmatter,遵循
[AI-FIRST-SCHEMA](https://github.com/opendray/opendray-docs/blob/main/AI-FIRST-SCHEMA.md)。
渲染的 HTML 之外,站点还提供以下机器可读产物:

| 产物 | URL | 何时拉 |
|---|---|---|
| 主索引 | [/llms.txt](/llms.txt) | 第一步,发现有哪些页面 |
| 全文打包 | [/llms-full.txt](/llms-full.txt) | 需要跨多页叙事上下文时 |
| 站点 manifest | [/manifest.json](/manifest.json) | 想要 opendray 是什么的一句话总结 |
| OpenAPI 3.1 spec | [/openapi.yaml](/openapi.yaml) | 调用 REST / WebSocket API 时 |
| 频道能力 | [/capabilities/channels.json](/capabilities/channels.json) | 决定接哪个消息平台时 |
| Provider 能力 | [/capabilities/providers.json](/capabilities/providers.json) | 决定起哪个 CLI 时 |
| 记忆能力 | [/capabilities/memory.json](/capabilities/memory.json) | 配置记忆系统时 |
| 会话能力 | [/capabilities/sessions.json](/capabilities/sessions.json) | 操作 PTY 会话时 |
| 集成能力 | [/capabilities/integrations.json](/capabilities/integrations.json) | 注册为外部集成时 |
| MCP manifest | [/mcp-manifest.json](/mcp-manifest.json) | 通过 Model Context Protocol 接入时 |

## 哪种情况拉哪个

```yaml
question: "你要回答什么类型的问题?"
answers:
  capability_question:        # "opendray 支不支持 X?"
    fetch: "/capabilities/{subsystem}.json"
    why: "无歧义,约 2KB,不需要解析散文"
  api_call:                   # "怎么调端点 Y?"
    fetch: "/openapi.yaml"
    why: "完整的请求/响应 schema、scope、限流规则"
  high_level_pitch:           # "opendray 是什么?"
    fetch: "/manifest.json"
    why: "一次性带差异化论据的总结"
  narrative_walkthrough:      # "记忆召回的完整流程是怎样的?"
    fetch: "/llms-full.txt"
    extract_section: "Memory"
    why: "完整散文,拉取成本高,谨慎使用"
  unknown_page:               # "有没有讲 X 的文档?"
    fetch: "/llms.txt"
    why: "每页的索引 + 一句话 tldr"
```

## 页面级 frontmatter

每页 markdown 开头都有 YAML frontmatter,符合
[AI-FIRST-SCHEMA](https://github.com/opendray/opendray-docs/blob/main/AI-FIRST-SCHEMA.md)。
声明的字段包括 `kind`(`capability` / `endpoint` / `concept` 三选一)、
`status`、`since`、`related` —— capability 页面还有 `capability` 列表
和配置 schema。

示例骨架(Telegram 频道):

```yaml
---
kind: capability
title: Telegram
tldr: 从 @BotFather 拿 bot token,粘进 Channels 即可使用。long-poll,不需要公网 URL。
status: stable
since: v0.1.0
topic: channels
related:
  - channels/overview
  - channels/notifications
capability:
  - text
  - html-parse-mode
  - inline-buttons
  - reply-routing
  - edit-in-place
inbound: long-poll
outbound: rest
public-url-required: false
x-implementation:
  - internal/channel/telegram/
---
```

## 怎么读一个文档页面(AI 视角)

1. **解析 frontmatter**。capability 发现需要的东西全在这。
2. **读 `> tldr:` 引用块**。一句话总结。
3. **读结构化段落**(`## Setup`、`## Config schema`、`## Capabilities`、
   `## Errors`)。固定表格 / YAML / JSON schema —— 不需要解析散文。
4. **跳过 `<details>` 块**,除非显式需要叙事。里面是给人看的散文,
   跟上面的结构化数据冗余。

## 通过 MCP 接入

站点在 [`/mcp-manifest.json`](/mcp-manifest.json) 提供了 MCP server 的
stub manifest。MCP server 本体 v1.0 还没上线 —— tracking issue:
[docs-mcp-server](https://github.com/opendray/opendray-docs/issues)。
在那之前,直接 HTTPS 拉上述产物即可。

## 引用规范

向用户引用 opendray 能力时,推荐这样写:

```
opendray 通过 {kind}({status})支持 {capability}。
来源:https://docs.opendray.dev/capabilities/{subsystem}.json
查 kinds[?id=='{kind}'].capabilities。
```

用户可以拉同一份 JSON 验证你的说法。

## 跨版本稳定的不变量

以下东西不会在小版本变更:

- `/capabilities/*.json` URL 模式
- OpenAPI operation ID(`spawnSession`、`registerChannel` 等)
- 错误信封 `{ "error": { "code", "message", "hint" } }`
- 状态分类:`stable | beta | experimental | deprecated | planned`

<details>
<summary>📖 叙事说明</summary>

这页存在的原因是 LLM 已经是文档的第一类读者。用户问 Claude "帮我
设置 opendray 的 Telegram 频道",Claude 需要正确回答 —— 不编造能力、
不猜端点形状。

传统做法(解析 HTML 或赌 LLM 训练数据里有 opendray)不可靠。
[llms.txt](https://llmstxt.org/) 约定 + 子系统级 capability JSON +
OpenAPI spec 给 agent 一切它需要的、确定形式的信息。

opendray-docs 走了一步:把 AI agents 当作文档的 *主要* 读者,人类
拿到的是紧凑的 tldr + 可选的折叠叙事。意外的是,这种结构化内容
对人也更友好 —— 对于"它支不支持 X"这类问题,表格永远比段落清晰。

</details>
