---
kind: concept
title: 按 task 挑 worker
tldr: 有观点的表 — 给每个后台 task 派什么。默认偏向 Haiku(质量 / 成本平衡);Ollama 免费;Sonnet 只给 conflict resolution。
status: stable
since: v0.1.0
topic: memory-workers
related: [memory-workers/overview, memory-workers/verification, ambient-memory/providers]
references:
  capabilities: [memory]
x-implementation: [internal/memory/worker/]
---

# 按 task 挑 worker

> **tldr:** 有观点的表 —— 给每个后台 task 派什么。默认偏向 Haiku(质量 / 成本平衡);Ollama 免费;Sonnet 只给 conflict resolution。

## 推荐默认

| Task | 省钱 | 重质量 | 备注 |
|---|---|---|---|
| ambient-summarize | Ollama `llama3.1:8b` | Anthropic Haiku | 每 session.ended 跑;量敏感 |
| project-scanner | Anthropic Haiku | Anthropic Haiku | 需结构化输出;Ollama 也行但更糙 |
| conflict-resolver | Anthropic Haiku | Anthropic Sonnet | 低量高赌;质量重要 |
| daily-cleaner | n/a(纯规则) | n/a | 不需要 LLM |

## 成本量级(每 1000 事件)

| Worker @ provider | ~tokens/event | ~每 1000 事件 |
|---|---|---|
| ambient @ Haiku | 800 in + 100 out | $0.30 |
| ambient @ Ollama(本地) | n/a | $0 + 电费 |
| scanner @ Haiku | 1500 in + 200 out | $0.60 |
| conflict @ Sonnet | 2000 in + 300 out | $9 |

## 权衡

| 选择 | 优 | 劣 |
|---|---|---|
| 全 Anthropic | 质量最好,结构化输出可靠 | 高量时成本积累 |
| 全 Ollama | 免费 | 需要 GPU 主机才合理延迟;输出更糙 |
| 混合(ambient=Ollama,scanner+conflict=Anthropic) | 成本 + 质量平衡 | 两套配置要维护 |
