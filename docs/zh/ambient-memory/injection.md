---
kind: capability
title: 环境记忆 — 注入档案
tldr: 档案 = 注入到 session 初始上下文的内容。3 种模式 — dense(top-K 通过 search)、sparse(仅最近)、off。按 (provider, cwd) 匹配。
status: stable
since: v0.1.0
topic: ambient-memory
related: [ambient-memory/overview, ambient-memory/capture-rules, memory/scopes]
capability: [dense-injection, sparse-injection, off-mode]
inbound: session-spawn
outbound: system-prompt-prefix
x-implementation: [internal/memory/injector/]
---

# 环境记忆 — 注入档案

> **tldr:** 档案 = 注入到 session 初始上下文的内容。3 种模式 —— `dense`(top-K 通过 search)、`sparse`(仅最近)、`off`。按 (provider, cwd) 匹配。

## 模式

| 模式 | 注入什么 | 何时用 |
|---|---|---|
| `dense`(默认) | `memory_search("project context")` 的 top-K 命中 | 丰富上下文,agent 先拿到相关事实 |
| `sparse` | 最近 N 条记忆(不搜索) | 便宜,spawn 时无 embedding 调用 |
| `off` | 什么都不 | 干净起步;纯工具使用 |

## Config

```yaml
- id: "default-dense"
  match:
    provider: [claude]
    cwd_glob: "**"
  profile:
    mode: dense
    top_k: 5
    scope: [project, global]
    template: |
      # 项目上下文(自动从记忆加载)
      {{- range .hits }}
      - {{ .text }}(置信 {{ .score }})
      {{- end }}

- id: "codex-sparse"
  match:
    provider: [codex]
  profile:
    mode: sparse
    recent: 10

- id: "shell-off"
  match:
    provider: [shell]
  profile:
    mode: off
```

## 注入到哪

| Provider | 注入点 |
|---|---|
| `claude` | system prompt 前缀(通过 MCP) |
| `codex` | system prompt 前缀(supportsMcp 时;否则跳过) |
| `gemini` | system prompt 前缀 |
| `shell` | 无(非 AI) |

## Errors

| code | http | 原因 | 修复 |
|---|---|---|---|
| `injection_template_invalid` | 400 | Go template 语法错 | 在 Settings → Preview 测 |
| `injection_too_large` | 413 | 渲染 > 32 KB | 减 `top_k` 或模板长度 |
| `injection_skipped_off` | (log info) | 规则匹配 `off` | 故意为之 |
