# 环境记忆 — 供应商

**summarizer 供应商**是把对话窗口转成 JSON `{facts: [...]}` 数组的 LLM(或包装服务)。v1 发布五种供应商类型,覆盖本地优先和云 API 两条路径。

## `ollama` — 本地

最直接的本地优先选项。跑 `ollama pull qwen2.5:7b`(或任何 chat 模型),让 opendray 指向 daemon。

```
Base URL:  http://localhost:11434
Model:     qwen2.5:7b
API key:   (none)
```

讲 ollama 原生 `/api/chat` 端点,配 `format: "json"` 严格 JSON 输出。

## `lmstudio` — 带 GUI 的本地

LM Studio 暴露兼容 OpenAI 的 HTTP server。GUI 比 ollama 友好,其他方面可互换。

```
Base URL:  http://localhost:1234/v1
Model:     <model name from LM Studio's loaded list>
API key:   (none — LM Studio ignores)
```

讲 chat completions,配 `response_format: {"type": "json_object"}`。

## `anthropic` — Claude API

用 Haiku 4.5 获得最便宜 / 最快的抽取。成本表里 Sonnet 4.6 和 Opus 4.7 条目是给想要更高质量的运维准备的。

```
Base URL:  https://api.anthropic.com  (default; can override)
Model:     claude-haiku-4-5
API key:   sk-ant-…  (encrypted at rest with backup cipher)
```

使用 Anthropic tool-use API(`tool_choice = record_facts`)保证结构化输出。

## `openai` — OpenAI API + 任何兼容

和处理 LM Studio 的同一个 OpenAICompatProvider — 只是默认值不同。`gpt-4o-mini`、`gpt-4o`、`gpt-4.1`、`gpt-4.1-mini`、`gpt-4.1-nano`、`o3-mini` 的定价已内置。

```
Base URL:  https://api.openai.com/v1  (default)
Model:     gpt-4o-mini
API key:   sk-…  (encrypted at rest)
```

兼容: Azure OpenAI(设 base_url)、Together、Groq、Fireworks、vLLM、Anyscale、Novita,以及大多数再导出 OpenAI 形态的国内中文 gateway。

## `integration` — 你的本地服务

"opendray CLI 作为 summarizer" 路径。**任何**讲文档化 `/summarize` 协议的服务都能作为 summarizer 后端。服务用任何语言写;opendray 通过反向代理把对话块转发给它。

协议(integration 必须实现):

```
POST <base_url>/summarize
  body:    {"messages":[{"role","text","timestamp"}, ...],
            "scope": "session|project|global",
            "scope_key": "<cwd or session id or 'operator'>"}
  reply:   {"facts":[{"text","category","confidence"}, ...],
            "input_tokens": N,    (optional)
            "output_tokens": M}   (optional)
```

配置:
1. 在某处(localhost、内网、你的 LXC)跑一个服务,按协议 POST 处理 `/summarize`。
2. 把该服务注册为带 `memory:summarize` scope 的 opendray integration。
3. 创建 summarizer 供应商,`kind: integration`,引用你 integration 的 id。
4. 可选: 如果你的服务需要认证,提供外向 bearer token(静态加密)。

这解锁了所有能想到的后端: 基于规则的抽取器、自托管 Llama 集群、内部 LLM gateway,甚至把请求交给更聪明模型的蒸馏服务。

## `is_default` 标志

恰好一个 provider 可以被标为 default。当 capture rule 没钉住特定 provider 时,会用 default。把新 provider 标为 default 会自动清掉任何其他行上的该标志(事务化)。
