---
kind: capability
title: Ambient Memory — providers
tldr: 3 summarizer backends — Anthropic API, OpenAI-compatible HTTP (Ollama / OpenAI / LocalAI), and a noop dry-run mode. Config under [ambient.summarizer].
status: stable
since: v0.1.0
topic: ambient-memory
related:
  - ambient-memory/overview
  - ambient-memory/capture-rules
  - memory-workers/overview
capability:
  - anthropic
  - openai-compat
  - noop
inbound: capture-queue
outbound: api
x-implementation:
  - internal/memory/summarizer/
---

# Ambient Memory — providers

> **tldr:** 3 summarizer backends — Anthropic API, OpenAI-compatible HTTP (Ollama / OpenAI / LocalAI), and a `noop` dry-run mode. Config under `[ambient.summarizer]`.

## Providers

| id | Backend | Auth | Cost | Notes |
|---|---|---|---|---|
| `anthropic` | Claude API (haiku / sonnet) | `ANTHROPIC_API_KEY` | paid per token | highest quality summaries |
| `openai-compat` | any OAI-compat (Ollama / OpenAI / LocalAI / vLLM) | api_key (blank for local) | depends | recommended default for local |
| `noop` | none — dry-run | n/a | free | sees what WOULD be captured; nothing written |

## Config

```toml
[ambient.summarizer]
provider = "openai-compat"     # anthropic | openai-compat | noop
model    = "llama3.1:8b"       # ignored for noop

[ambient.summarizer.anthropic]
api_key = "sk-ant-..."
model   = "claude-haiku-4-5-20251001"

[ambient.summarizer.openai_compat]
base_url = "http://localhost:11434/v1"
api_key  = ""                  # blank for Ollama
```

## Provider comparison

| Concern | anthropic | openai-compat (local) | openai-compat (cloud) | noop |
|---|---|---|---|---|
| Setup time | 2 min | 10 min (model pull) | 2 min | 0 |
| Cost | $0.001/summary | free | $0.0001–0.01/summary | free |
| Quality | ✓✓✓ | ✓✓ (model-dep) | ✓✓✓ | n/a |
| Privacy | sends to Anthropic | local | sends to provider | n/a |
| Latency | 1–3s | 2–8s (CPU) | 0.5–2s | 0 |

## Recommended setup

| Phase | Recommended |
|---|---|
| Trying it out | `noop` → see what would be captured |
| Production self-host | `openai-compat` + Ollama `llama3.1:8b` |
| Heavy use, no GPU | `anthropic` `claude-haiku-4-5-20251001` (cheap, fast) |

## Errors

| code | http | cause | fix |
|---|---|---|---|
| `summarizer_unavailable` | 503 | provider service down | check Settings → Test summarizer |
| `summarizer_quota_exceeded` | 429 | API quota hit | switch provider or wait |
| `summarizer_model_not_found` | 404 | model name typo | check `model` field |
