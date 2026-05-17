---
kind: capability
title: 环境记忆 — 捕获规则
tldr: 规则 = 匹配(provider / cwd glob / 事件类型)+ 动作(summarize / regex 提取)。每事件可多规则。在 Settings → Ambient Memory 配置。
status: stable
since: v0.1.0
topic: ambient-memory
related: [ambient-memory/overview, ambient-memory/providers, ambient-memory/injection]
capability: [rule-matcher, regex-extractor, summarizer-trigger]
inbound: session-events
outbound: memory_store
x-implementation: [internal/memory/capture/rule.go]
---

# 环境记忆 — 捕获规则

> **tldr:** 规则 = 匹配(provider / cwd glob / 事件类型)+ 动作(summarize / regex 提取)。每事件可多规则。在 **Settings → Ambient Memory** 配置。

## 规则 schema

```yaml
- id: "capture-jwt-decisions"
  match:
    provider: [claude, codex]              # OR;空 = 全部
    cwd_glob: "/Users/me/projects/**"      # 可选
    event:    [session.ended, session.idle] # OR;空 = 都触发
    text_contains: ["jwt", "auth"]         # AND;可选预过滤
  action:
    type: summarize                        # summarize | regex_extract
    summary_prompt: |
      从此会话提取认证相关决策。
      关注:secret 存储、refresh 策略、scope 变更。
    scope: project                         # session | project | global
    tags: ["auth", "ambient"]
    confidence_threshold: 0.7              # < 0.7 跳过
```

## Action 类型

| `type` | 做什么 | 输出 |
|---|---|---|
| `summarize` | 通过 [providers](./providers) 做 LLM 摘要 | 每 session 一或多行 |
| `regex_extract` | regex 捕获组 → 每命中存一行 | 每命中一行 |

## 默认

| 规则 | 行为 |
|---|---|
| 内置 `session-summary` | session.ended 时 summarize Claude/Codex/Gemini,50-token 上限 |
| 内置 `permission-asks` | regex 提取 `--bypass-permissions` 讨论,存为 project-scoped |
| 用户规则 | 在内置 **之后** 应用;可按 `id` 覆盖 |

## Errors

| code | http | 原因 | 修复 |
|---|---|---|---|
| `capture_rule_invalid` | 400 | YAML 错或字段未知 | 检查 schema |
| `regex_pattern_invalid` | 400 | regex 不编译 | 先在 `regex101.com` 测 |
| `capture_skipped_threshold` | (log info) | 置信 < 阈值 | 调阈值或改 prompt |
