# Ollama 实操指南

对大多数运维来说,这是**通向高质量语义记忆的最简路径**。Ollama 在 side-car daemon 里跑一个本地嵌入模型,opendray 通过 HTTP 与它通信,不需要 API key。总配置时间: 5 分钟。无 cgo,无需重编译。

## 为什么选它而不是 LocalONNX

| 路径 | 配置 | 编译 | 优点 |
|---|---|---|---|
| **HTTP + ollama** *(本节)* | 5 分钟 | 无 | 极简,一条 CLI 切换模型,daemon 自托管 |
| LocalONNX | 30 分钟 | 用 `-tags local_onnx` 重编 | 单二进制部署,离网,无额外 daemon |
| BM25 | 0 | 无 | 默认;仅关键字 |

如果你没有硬性要求跳过 ollama daemon,选 HTTP + ollama。仅当你需要"一切打包到一个二进制"时再切到 LocalONNX。

## 第 1 步 · 安装 ollama

macOS:
```bash
brew install ollama
brew services start ollama         # background daemon, persists across reboots
```

Linux:
```bash
curl -fsSL https://ollama.com/install.sh | sh
sudo systemctl enable --now ollama
```

验证:
```bash
curl http://localhost:11434/api/tags
# {"models":[]}  (or your existing models)
```

## 第 2 步 · 拉一个嵌入模型

语义记忆有三个不错的选择;挑一个:

```bash
ollama pull nomic-embed-text       # 137 MB, 768-dim, English-strong, fast
ollama pull mxbai-embed-large      # 670 MB, 1024-dim, multilingual, top quality
ollama pull bge-m3                 # 1.2 GB, 1024-dim, multilingual SOTA
```

推荐:

- **nomic-embed-text** — 从这开始。最小、最快,对英文代码/笔记非常胜任。
- **bge-m3** — 当你有大量中文 / 混合内容,且能接受额外延迟时切到它(每次调用约 80ms 对比约 30ms)。

你可以拉多个模型,在 opendray 配置里切换,不需要碰 ollama。

## 第 3 步 · 配置 opendray

Settings → Server → Memory:

```
Backend:               http
Default scope:         project
Similarity threshold:  0.5     (raise from 0.1 — dense embeddings score higher)
```

然后在 **HTTP backend (used when backend=http)** 下:

```
Base URL:    http://localhost:11434/v1
Model:       nomic-embed-text       (or whichever you pulled)
API key:     (leave blank — ollama doesn't need one)
```

点 **Save changes**,然后 **Restart server**。

重启后,Inspector 状态条应显示:

```
http:nomic-embed-text · 768-dim · enabled
```

点 **Test embedder**。你应该看到 toast:

```
Embedder OK: http:nomic-embed-text · 768 dimensions
vector_preview = [0.041, -0.013, 0.027, …]
```

这证实 opendray → ollama → embedding 往返工作正常。

## 第 4 步 · 验证跨 CLI 记忆

在任意项目(cwd)启动 Claude 会话:

```
me: "I prefer pnpm as my package manager"
claude: Called opendray-memory.memory_store("...")
        → stored as mem_xxx
```

现在在**相同 cwd** 启动 Codex 会话:

```
me: "what's my package manager preference?"
codex: Called opendray-memory.memory_search("package manager preference")
       → Found 1 memory hit(s)
       Based on memory: you prefer pnpm.
```

跨 CLI 链路成立,因为:
1. Claude 通过 opendray-memory MCP 写入事实
2. opendray 用 nomic-embed-text 嵌入 → 768 维向量 → pgvector
3. Codex 的搜索查询走同一个 embedder
4. 余弦相似度找到匹配(语义,不只是关键字)

如果你用 `backend=bm25` 走同样流程,"package manager preference" 不会匹配 "pnpm",因为没有 token 重叠。

## 调优

### 阈值

`similarity_threshold` 默认 0.1(BM25 友好)。稠密嵌入要调高:

| 模型 | 建议阈值 |
|---|---|
| nomic-embed-text | 0.5 |
| mxbai-embed-large | 0.55 |
| bge-m3 | 0.6 |

太低 → 噪声命中。太高 → 相关事实被过滤掉。每次上下调 0.05,看 `memory_search` 输出。

### Top-K

默认 5 已经很慷慨。如果发现 agent 把太多记忆塞进上下文,降到 3。"广召回"会话调到 10。

### 切换模型

拉新模型,编辑 `[memory.http].model`,保存,重启。在旧模型下嵌入的现有记忆**还在 pgvector,但不会被返回** — opendray 按 embedder 名过滤,以保持余弦数学有意义。要复用它们,要么:

1. 留在旧模型上,或者
2. 通过 Inspector 删 + 重存(小数据集),或者
3. 等待 phase 2.B.3 的重新嵌入工具(计划中)。

## 故障排查

**Test embedder 报 Connection refused**

```
ollama is probably not running.

  brew services restart ollama        # macOS
  sudo systemctl restart ollama       # Linux
  curl http://localhost:11434/api/tags  # should return JSON
```

**`model not found`**

你配置了没拉的模型。拉它:

```bash
ollama list                          # see what you have
ollama pull <model-name>
```

**嵌入返回了,但搜索命中始终不出现**

阈值太高。Settings → Memory → Similarity threshold → 0.3,重启。等看到几个命中并摸到分布后再调高。

**嵌入延迟很慢(每次调用 >500ms)**

查 `ollama ps` — 如果模型不在内存,ollama 会在首次调用时加载(nomic 约 2s,bge-m3 约 5s)。之后保持热加载。`ollama ps` 默认保持加载约 5 分钟;通过 systemd unit 里的 `OLLAMA_KEEP_ALIVE=24h` 或 `launchctl setenv` 调高。

## 你现在拥有

- 跨 Claude / Codex / Gemini 共享的跨 CLI 语义记忆
- 零供应商 API key
- 模型用一条 CLI 命令就能切换
- 全部推理在本地 — 数据不出机
- 热加载后每次调用延迟低于 100ms

这是大多数运维在试过 BM25(太关键字)、衡量过 LocalONNX(重编麻烦)后落定的配置。
