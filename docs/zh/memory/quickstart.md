# 快速入门

启动 opendray 时,记忆**默认开启**。没有 flag、没有额外服务、没有 API key。本节走一遍 5 分钟体验。

## 你**不需要**做的事

- ❌ 安装 qdrant 或 chromadb
- ❌ 把 mem0 作为子进程跑起来
- ❌ 注册 OpenAI / Voyage / Cohere
- ❌ 配置任何环境变量

## 第 1 步 · 启动 opendray

```bash
go run ./cmd/opendray serve -config config.toml
```

你应该看到这样的日志:

```
INFO memory ready  embedder=bm25  dimensions=384
INFO memory MCP auto-attach enabled
```

如果记忆初始化失败(比如 pgvector 扩展缺失),错误会在这里报出来,opendray 其余部分仍会正常启动 — 只是会话不会挂载记忆工具。

## 第 2 步 · 启动任意会话

打开 Web UI → Sessions → Spawn → 选 Claude/Codex/Gemini 和工作目录。opendray 会写一份按会话生成的 `mcp.json`,自动包含 `opendray-memory`。

你可以查看渲染后的文件来验证:

```bash
ls /var/folders/.../opendray-sess-<id>/
cat /var/folders/.../opendray-sess-<id>/claude-mcp.json
```

你会看到 `opendray-memory` 条目和你注册过的其他 MCP server 并列。

## 第 3 步 · 告诉 agent 需要记住的内容

在 Claude 会话中:

```
me: my preferred frontend frameworks are vue and react
```

agent 会做两件事之一:

- **调用 `opendray-memory.memory_store(text)`** — 首选路径,立刻写入共享存储,或者
- 写 `<project>/.claude/.../memory/<topic>.md` — 仅 Claude 本地。下一次启动会话时,opendray 的镜像会把它捞起来(详见 [Mirror](#memory-mirror))。

无论哪种,事实都会落到 pgvector 的 `scope=project, scope_key=<your cwd>` 下。

## 第 4 步 · 在 UI 中验证

刻意分成两个页面:

- **Settings → Server → Memory** 是*配置草稿* — embedder 选择、端口、维度、需重启的字段。点 **Test embedder**,toast 会确认当前后端存活。
- **Memory**(左侧栏 🧠,快捷键 `g m`)是*运行时检查器* — 浏览、搜索、编辑、删除实际存储的记忆。

在 Memory 页面你应该看到:

- 状态徽章: `bm25 · 384-dim · enabled`
- Inspector 列出你刚存的记忆
- 搜索 "vue" 或 "react" 返回相似度 > 0 的行
- 一旦搜索命中,每行会显示 hit-count

之后切换 embedder 后端(比如接上 ollama)时,本页会出现黄色的 Migrate 横幅,用于对旧记忆重新嵌入 — 见 [Maintenance](#memory-maintenance)。

## 第 5 步 · 跨 CLI 测试

在**相同 cwd** 下启动 Codex 会话,问:

```
me: what frontend framework do I usually use?
```

Codex 应该调用 `opendray-memory.memory_search` 并拿回相同的事实。这就是跨 CLI 的价值主张,真实运转。

## 哪些事**不会**发生

- agent 的回复不走 opendray;只有工具调用走。
- opendray 不读 agent 的 stdout 来抓取记忆;不会从对话里抽取任何内容。只有显式工具调用(或通过镜像捞到的 Claude 本地记忆文件)才会进 pgvector。
- 同一 opendray 实例上的其他操作者看不到你的记忆 — `scope_key` 是你的 cwd;如果他们 cwd 不同,这些行对他们不可见。

## 故障排查一览

| 现象 | 先查什么 |
|---|---|
| agent 从不调用记忆工具 | 你是不是在 system-prompt 指导添加**之后**才启动会话?重启 opendray,重启会话。 |
| `tool error: 401 unauthorized` | mcp.json 里 API key 过期。重启会话 — opendray 会用缓存的 key 重新渲染 mcp.json。 |
| 搜索没命中 | BM25 只匹配精确 token。试试存储文本里字面出现过的查询词。 |
| mcp-memory 报 `connection refused` | opendray gateway 崩了。查 `tail -f /tmp/opendray.log`。 |

深入: [Troubleshooting](#memory-troubleshooting)。
