# LM Studio 实操指南

LM Studio 是 ollama 的替代品,带管理本地模型的 GUI。opendray 的 HTTP 后端对 LM Studio 同样工作 — 唯一区别是默认端口。

## 为什么选 LM Studio 而不是 ollama

| | LM Studio | ollama |
|---|---|---|
| 浏览 / 加载模型的 GUI | ✅ | ❌(仅 CLI) |
| 默认端口 | `1234` | `11434` |
| 针对 Mac silicon 优化 | ✅(有 MLX 版本) | ✅ |
| GGUF / MLX 支持 | 都支持 | GGUF |
| systemd / launchd 后台 | 手动 | `brew services` / `systemctl` |
| 应用内模型搜索 | ✅ | 外部 `ollama search` |

从 opendray 视角看运维上完全一样。挑你喜欢的 GUI;也可以并排跑两个。

## 第 1 步 · 安装 LM Studio

从 <https://lmstudio.ai> 下载 macOS / Linux / Windows 安装包。打开它。首次启动会引导你挑选模型。

## 第 2 步 · 加载嵌入模型

在 LM Studio 应用里:

1. **Search** 标签 → 搜 `nomic-embed-text`(或 `bge-m3`,或 `qwen3-embedding`)。
2. 挑一个量化(Q4_K_M 是合理默认 — 快 + 小)。
3. 下载。
4. **Local Server** 标签 → 点模型下拉 → 选你下载的嵌入模型。
5. **Start Server** 按钮。默认端口 1234。

从终端验证:

```bash
curl http://localhost:1234/v1/models | jq '.data[].id'
```

应该至少列出你加载的模型。

## 第 3 步 · 配置 opendray

Settings → Server → Memory:

```
Backend:               http
Similarity threshold:  0.5
```

HTTP backend 下两个选项:

**选项 A — 点"Auto-detected"徽章**
opendray 启动时会探测两个端口。如果 LM Studio 在跑,你会在表单上方看到绿徽章: `lmstudio · http://localhost:1234/v1 (N models)`。点它 → base URL + 第一个看起来像嵌入的模型自动填入。

**选项 B — 预设按钮**

```
Click the [LM Studio] preset → fills http://localhost:1234/v1
Type the model id (e.g. text-embedding-nomic-embed-text-v1.5)
Leave API key blank
```

点 **Test connection** 确认。然后 **Save changes** + **Restart server**。

重启后,状态条显示:

```
http:text-embedding-nomic-embed-text-v1.5 · 768-dim · enabled
```

## 第 4 步 · 验证

流程同 ollama。Test embedder 往返,从一个 CLI 存记忆,从另一个搜。跨 CLI 记忆工作正常。

## 调优

模型特定阈值表同 ollama:

| 模型族 | 建议阈值 |
|---|---|
| nomic-embed-text-v1.5 | 0.5 |
| qwen3-embedding-0.6b | 0.5 |
| qwen3-embedding-8b | 0.55 |
| mxbai-embed-large | 0.55 |
| bge-m3 | 0.6 |

LM Studio 在它的服务器日志里显示模型延迟 — M 系列芯片上 nomic 约 30ms,bge-m3 约 80ms(大致和 ollama 相当)。

## 在 ollama 和 LM Studio 之间切换

你可以同时跑两个 daemon。opendray 的自动探测会展示两个 — 想用哪个点哪个。打着前一个 embedder 名标记的记忆行**切回去时仍可搜**(我们按 embedder 名过滤,以保持余弦数学有意义),所以 A/B 测试无害。

要清空并在新模型下重新嵌入: 通过 Inspector 删除(小数据集),或跑 SQL `DELETE FROM memories WHERE embedder = 'http:old-model-name'`。

## 故障排查

**Test connection 返回 "unreachable"**

LM Studio 的服务器没在跑。打开应用 → Local Server 标签 → Start Server。确认 `curl http://localhost:1234/v1/models` 能用。

**模型加载了,但每次嵌入调用返回空向量**

你加载了 chat 模型,不是嵌入模型。LM Studio 列表里嵌入模型 id 以 `text-embedding-` 开头。停掉服务器,切换加载的模型,重启服务器。

**自动探测显示 LM Studio,但我偏好 ollama**

预设只是起点;自动探测徽章出现后手动点 **ollama** 预设以覆盖。或者直接编辑 base URL 字段。

**LM Studio 长时间空闲后首次调用崩溃**

LM Studio 在空闲后会卸载模型(默认 5 分钟)。卸载后首次调用触发 1-3s 重载。opendray 的 HTTP 后端有 30s 超时,所以能撑过去 — 但等这次调用的 agent 会看到延迟。在服务器面板里配置 LM Studio 的 "Keep model loaded" 设置。
