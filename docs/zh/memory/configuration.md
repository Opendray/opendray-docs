# 配置

记忆在 `config.toml` 的 `[memory]` 段配置,并在 **Settings → Server → Memory** 中镜像呈现。所有字段都是可选的 — 零值配置就是 BM25 + pgvector + 项目作用域,这是文档化的默认值。

## config.toml 形态

```toml
[memory]
backend              = "auto"      # auto | bm25 | http
store                = "pgvector"  # only option in v1
default_top_k        = 5
similarity_threshold = 0.1
chromem_path         = ""          # phase 2 placeholder

[memory.local]
model = "bge-m3"                   # phase 2 placeholder

[memory.http]
base_url   = "http://localhost:11434/v1"
model      = "nomic-embed-text"
api_key    = ""                    # blank for ollama; required for OpenAI etc.
dimensions = 0                     # 0 = autodetect

[memory.scope]
default = "project"                # session | project | global
```

## 后端选择

| 值 | 行为 | 何时选用 |
|---|---|---|
| `auto` | 今天是 BM25;phase 2 上线后将是 ONNX(bge-m3) | 默认值。让 opendray 透明升级你。 |
| `bm25` | 纯 Go 关键字检索,384 维 hash-bucket 向量 | 想要零外部依赖,接受仅关键字匹配。 |
| `http` | 兼容 OpenAI 的 `/v1/embeddings` 端点 | 你有嵌入服务在跑(ollama、OpenAI、LocalAI、vLLM),并且想现在就有真正的语义搜索。 |

### BM25 局限

BM25 的 hash-bucket 向量只匹配**精确 token 重叠**。如果用户写的是 "我喜欢 pnpm",你搜 "package manager",BM25 返回零结果 — 没有共同词。做 demo 时这是最快、最可复现的路径;追求生产质量召回,切到 `http` 加真实嵌入模型。

### HTTP 后端示例

**ollama(本地、免费、无 key)**

```toml
[memory.http]
base_url = "http://localhost:11434/v1"
model    = "nomic-embed-text"
```

确保 ollama 在跑,且模型已拉取: `ollama pull nomic-embed-text`。opendray 在首次调用时自动检测维度。

**OpenAI**

```toml
[memory.http]
base_url = "https://api.openai.com/v1"
model    = "text-embedding-3-small"
api_key  = "sk-…"
```

最便宜的官方选项(每百万 token 约 0.02 美元)。1536 维,多语言。

**Voyage AI**

```toml
[memory.http]
base_url = "https://api.voyageai.com/v1"
model    = "voyage-3-lite"
api_key  = "voyage-…"
```

Anthropic 推荐的嵌入合作伙伴。代码场景比 OpenAI 小模型质量更好。

## 阈值 + Top-K

`similarity_threshold` 是 `memory_search` 命中过滤的下限。默认 `0.1`,因为 BM25 稀疏向量即便在相关文本上也很少突破 0.5。**切换到稠密 embedder 时调到 0.5+** — 稀疏向量的误报无害,稠密向量的误报很伤。

`default_top_k` 是 agent 没指定时 MCP 工具返回的命中数。5 是上下文窗口预算的甜点;agent 很少用超过前 3 个。

## 作用域默认值

`memory.scope.default` 控制 agent 调用 `memory_store` 没显式传作用域时使用什么。**推荐 project** — 实践中这是最有用的共享边界。详见 [Scopes](#memory-scopes)。

## 重启

修改 `[memory]` 下**任何**字段都需要服务器重启 — embedder + store 在 `app.New` 时绑定一次。一旦你编辑某个字段,Settings UI 会在 Memory 段标黄色的 "restart required" 徽章。

## 不需重启就能改的

- Inspector 面板 — 浏览、搜索、删除记忆: 即时
- agent 的 `memory_store` / `memory_search`: 即时(它们用当前绑定的 embedder)

需要重启的:

- embedder 后端(auto → http 或反向)
- HTTP base_url、model、api_key
- 阈值、default_top_k(在 `app.New` 时读一次进 Service 选项)
- 默认作用域

## 验证实时配置

Settings → Server → Memory → Inspector → 状态条:

- `bm25 · 384-dim · enabled` → BM25 后端已绑定
- `http:nomic-embed-text · 768-dim · enabled` → http 后端,冒号后跟模型名,维度已探测
- `unavailable` → 记忆子系统未初始化(查 `tail /tmp/opendray.log`)

还有 **Test embedder** 按钮 — 把一小段文本走一遍配置好的 embedder,显示结果向量的前 4 维。能在 agent 发现之前抓到"我 ollama 配错了"。
