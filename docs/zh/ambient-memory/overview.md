# 环境记忆 — 概览

opendray 的**环境记忆**子系统解决"模型只在被告知时才存"的问题: 不再等用户说"记住 X",而是后台 goroutine 每 10 秒轮询每个活跃 agent 会话,把新的对话消息发给可配置的 LLM("summarizer 供应商"),拿回一个 JSON 形式的持久事实列表,与现有记忆去重,把幸存者以 `source_kind='summarizer'` 写入。

结果: 当你 `/clear` 上下文或换到不同 agent 时,你建立起来的项目记忆已经在那里 — 新 agent 通过 `memory_search` 找到它(或者根据你的注入档案,在 system prompt 前部看到近期记忆的横幅)。

## 三个可配置部件

```
┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   Provider      │    │   Capture rule   │    │  Injection       │
│   (which LLM)   │ +  │   (when to fire) │ +  │  profile         │
│                 │    │                  │    │  (how to inject) │
└────────┬────────┘    └────────┬─────────┘    └────────┬─────────┘
         │                      │                       │
         ▼                      ▼                       ▼
   internal/memory/      internal/memory/         internal/memory/
    summarizer/           capture/                  injector/
```

- **Provider** — 哪个 LLM 抽取事实。今天支持 Anthropic、OpenAI、LM Studio、Ollama、一个直通的 Integration kind(任何讲文档化 `/summarize` 协议的服务都能作为 summarizer 工作 — 零 API 成本路径),**还有**启动 headless `claude --print` / `gemini --print` 的 M-PE Agent 路径,以 CLI 配额为代价获得更高质量的事实抽取。
- **Capture rule** — 什么时候触发。4 种触发类型: `after_messages`、`on_idle`、`k_chars`、`manual`。
- **Injection profile** — 启动时如何(或是否)把记忆前置到 agent 的 system prompt。5 种策略: `none`、`top_k_recent`、`top_k_relevant`、`manual_only`、`hybrid`(加上 `on_keyword`,预留给未来发布)。

三者都在 **Memory → Workers**(侧栏)下配置 — 这个页面以前只是 "Workers",在 M-PF 中被重建为单一记忆配置着陆页,如今同时承载 Providers / Workers / Capture rules / Injection profiles / Token cost,让相关旋钮挨在一起,而不是分散在两页。

## 你**不需要**的

- 不需要 env vars 来启用 — 子系统一直接好线。它就是不做任何事,直到你创建第一个 provider + rule。
- 除非你想用 Anthropic / OpenAI provider,不需要外部服务。Ollama 和 LM Studio 完全覆盖本地优先路径。
- 不需要显式"memorize this"提示 — 模型不知道环境捕获在发生;它只是照常回答。

## 什么花钱

Anthropic(Haiku $1/$5 每 MTok)和 OpenAI(gpt-4o-mini $0.15/$0.60 每 MTok)通过付费 API summarize。每次调用都写一行 `memory_summarizer_calls`,记录 token 数和估算的 USD 数字,聚合在 **Token cost** 面板。

本地 provider(Ollama、LM Studio)和 Integration provider 计价 $0 — 你拥有硬件 / 外部服务。
