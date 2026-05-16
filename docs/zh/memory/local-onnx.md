# 本地 ONNX 嵌入

opendray 默认的记忆 embedder 是 BM25 — 关键字匹配,无模型文件。如果你想要语义搜索**但又不要 HTTP 后端**(不要 ollama、不要 OpenAI、完全离网),用 `local_onnx` 标签编译,并指向磁盘上的 sentence-transformer ONNX 模型。

这是**可选项**,因为编译会拉入 cgo + 原生库,不是每个运维都想要。默认 `go build` 产出无 cgo 二进制,LocalONNX 路径会被 stub 掉。

## 你需要什么

| 制品 | 从哪获取 | 约略大小 |
|---|---|---|
| `libonnxruntime.dylib`(macOS)或 `.so`(Linux) | `brew install onnxruntime` / 包管理器 | 约 25 MB |
| `libtokenizers.a` | <https://github.com/daulet/tokenizers/releases/latest>(每平台 tarball) | 约 37 MB |
| `model.onnx` | 任何 sentence-transformer 的 HuggingFace ONNX 导出(BGE-m3、BGE-small、nomic-embed) | 90 MB - 2 GB |
| `tokenizer.json` | 与模型同一个 HuggingFace 仓库 | 1-17 MB |

具体到 BGE-m3,从 HuggingFace 下载 `Xenova/bge-m3`:

```bash
mkdir -p ~/.opendray/models/bge-m3
cd ~/.opendray/models/bge-m3

curl -L -o tokenizer.json \
  https://huggingface.co/Xenova/bge-m3/resolve/main/tokenizer.json
curl -L -o model.onnx \
  https://huggingface.co/Xenova/bge-m3/resolve/main/onnx/model.onnx
# Optional INT8 quantized version (~565 MB instead of ~2 GB):
# curl -L -o model.onnx \
#   https://huggingface.co/Xenova/bge-m3/resolve/main/onnx/model_quantized.onnx
```

## 带标签编译

```bash
brew install onnxruntime           # one-time
mkdir -p ~/.opendray/deps
curl -L https://github.com/daulet/tokenizers/releases/latest/download/libtokenizers.darwin-arm64.tar.gz \
  | tar -xz -C ~/.opendray/deps    # produces libtokenizers.a

CGO_LDFLAGS="-L/opt/homebrew/opt/onnxruntime/lib -L$HOME/.opendray/deps" \
DYLD_LIBRARY_PATH="/opt/homebrew/opt/onnxruntime/lib" \
go build -tags local_onnx -o opendray ./cmd/opendray
```

**运行时**也要设 `DYLD_LIBRARY_PATH`(macOS)或 `LD_LIBRARY_PATH`(Linux) — 动态链接器需要在进程启动时找到 `libonnxruntime.dylib`。systemd 风格部署通常把它放在 service unit 的 `Environment=` 指令里。

## 配置

```toml
[memory]
backend = "local"

[memory.local]
model           = "bge-m3"   # cosmetic — appears in logs / UI
library_path    = "/opt/homebrew/opt/onnxruntime/lib"
model_path      = "~/.opendray/models/bge-m3/model.onnx"
tokenizer_path  = "~/.opendray/models/bge-m3/tokenizer.json"
max_seq_len     = 512
```

重启 opendray。启动日志应该显示:

```
INFO memory ready  embedder=local-onnx:model.onnx  dimensions=1024
```

Settings → Server → Memory → Inspector → 状态条也是相同信息。点 "Test embedder" 跑一遍样例文本,确认全部接通。

## 性能预期

| 模型 | 维度 | macOS arm64 延迟(每次调用平均) |
|---|---|---|
| `bge-m3`(FP32) | 1024 | 约 150 ms |
| `bge-m3`(INT8 量化) | 1024 | 约 80 ms |
| `bge-small-en-v1.5` | 384 | 约 30 ms |

pgvector 存储随维度线性增长 — 1024 维每行约 4 KB,加索引。1 万条记忆: 约 40 MB 加 HNSW 索引。可忽略。

## 切回去

把 `[memory.backend]` 改成别的值(`bm25` / `http`),重启 opendray。用本地模型嵌入的现有记忆仍在 pgvector,但未来搜索不会返回 — opendray 按 `embedder` 名过滤,以保持余弦比较有意义。要让它们重新可搜,要么把后端切回去,要么从 Inspector 删 + 重新嵌入。

## 这个 build 跳过了什么

- 模型字节的 `go:embed` — 保持二进制小,代价是运维要做配置。Phase 2.B.2 会可选地嵌入 bge-small(120 MB),实现真正离线 / 单二进制部署。
- GitHub Actions 跨平台矩阵 — macOS arm64 已验证;amd64 和 Linux 可能能工作但未测试。发现平台问题请提 issue。
- 任意模型即时 INT8 量化 — 先在 HuggingFace 预量化,再下载。

## 什么时候值得用

用 BM25(默认)当:
- 你在测试或做关键字形召回(文件名、代码标识符)。

用 HTTP 后端(ollama / OpenAI 兼容)当:
- 你能本地跑 ollama — 高质量语义搜索的最简路径,无需重编译。

用 LocalONNX(本文)当:
- 离网部署、无网络出口。
- 你已对 BGE / nomic / mxbai 变种做过基准,要某个特定模型且不要 daemon。
- 你想把 opendray 作为单二进制发布(phase 2.B.2 加 `go:embed` 后)。
