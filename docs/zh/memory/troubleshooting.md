---
kind: concept
title: 记忆故障排查
tldr: 症状 → 可能原因 → 修复。最常见 6 种记忆故障模式的速查表。
status: stable
since: v0.1.0
topic: memory
related: [memory/overview, memory/quickstart, memory/configuration]
references:
  capabilities: [memory]
x-implementation: [internal/memory/]
---

# 记忆故障排查

> **tldr:** 症状 → 可能原因 → 修复。最常见 6 种记忆故障模式的速查表。

## 症状表

| 症状 | 可能原因 | 修复 |
|---|---|---|
| Agent 从不调记忆工具 | 系统提示未注入 或 MCP 未 auto-attach | 检查 `mcp.json` 含 `opendray-memory`;重启 session;验证 `app.New` 日志了 `memory MCP auto-attach enabled` |
| `tool error: 401 unauthorized` | session 的 `mcp.json` 里 API key 过期 | 重启 session — opendray 用当前 key 重渲染 `mcp.json` |
| 搜索返回 0 命中 | BM25 仅精确 token | 用 stored text 里的字面词;或切 `http` 后端带语义 embedder |
| `connection refused` mcp-memory | gateway 崩了 | `tail -f /tmp/opendray.log`;查 panic;重启 |
| `embedder_dim_mismatch`(后端切换后) | 行有旧 dim,embedder 期待新 dim | 用 Memory 页 **Migrate** banner → 重新 embed |
| Mirror 看不到 Claude 记忆 | cwd 编码错 或 权限拒绝 | `ls ~/.claude/projects/<encoded-cwd>/memory/` 应列出文件 |

## 验证命令

```bash
# 记忆准备好了?
grep "memory ready" /tmp/opendray.log

# MCP 接上了?
ls /var/folders/.../opendray-sess-<sid>/
cat /var/folders/.../opendray-sess-<sid>/claude-mcp.json

# Provider 支持 MCP?
jq '.capabilities.supportsMcp' internal/catalog/builtin/<provider>.json

# Mirror 看到文件?
ls ~/.claude/projects/<encoded-cwd>/memory/
```

## 深入

| 问题 | 读 |
|---|---|
| 后端选择 / 迁移 | [configuration](./configuration)、[maintenance](./maintenance) |
| 跨 CLI 桥接不工作 | [mirror](./mirror) |
| 冲突解析 | [maintenance](./maintenance) |
| Worker 卡住 | [memory-workers/verification](../memory-workers/verification) |
