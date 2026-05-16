# 记忆 worker — 概览

M25 让你为 opendray 记忆系统的每个触点挑选**用哪个 LLM** — 各触点独立。

触点(M25 最初 4 个;Phase A / C / E 扩到 7 个):

| 触点 | 触发时机 | 它做什么 |
|---|---|---|
| **Gatekeeper** | 每次 `memory_store` | 判断 agent 提议的事实是否足够持久值得存。 |
| **Cleaner** | 每 24h | LLM librarian — 对老化记忆提议 keep/stale/duplicate 裁决。 |
| **Git activity** | 每 24h | 把 7 天 `git log` 变成给启动横幅用的 2-3 段叙述。 |
| **Transcript** | 每次会话结束 | "这次会话 agent 实际做了什么" — 1-3 段摘要。 |
| **Plan drift** *(Phase A)* | 每次会话结束 | 查看新对话摘要 + 当前 plan;若需更新就提交提议。 |
| **Conflict detector** *(Phase C)* | 每 24h | 跨层扫描 — 浮现事实 / plan / goal / journal 之间的矛盾。 |
| **Capture engine** *(Phase E)* | 每个捕获规则触发 | 按触发从会话对话抽取事实;落行到 `memories`。 |

## 两种 worker 类型

| Worker | 是什么 | 延迟 | 成本 | 质量 |
|---|---|---|---|---|
| **Summarizer** | HTTP POST 到你本地 LM Studio / OpenAI 兼容端点 | 约 0.5-2s | 免费(本地) | 中等(3-13B) |
| **Agent** | 无头启动 `claude --print` 或 `gemini --print` | 约 5-15s | Claude/Gemini 配额 | 前沿模型 |

默认部署每个触点都种成 **summarizer**。不翻转任何一行,什么都不会改变。

## 为什么按触点配置

触点们的特征非常不同。一个全局开关会强迫你做坏的折中:

- Gatekeeper 一天跑数百次。即便每次 +5s 都让 `memory_store` 感觉坏了。⇒ 仅 summarizer。
- Git activity 总结器一天触发一次,反正要花 60-150s,产出每个 agent 都读的横幅。这里 Claude Opus 通过更好的 agent priming 把成本赚回来。⇒ agent(Claude)合理。
- Cleaner / Conflict detector 介于中间 — 24h 批处理,但有时你会手动跑。两种都行。
- Transcript / Plan drift 每次会话结束跑(一天可能很多次)。延迟 OK(后台),但成本会累。
- Capture engine 一会话内多次触发,如果你设短触发(每 6 条消息)。这里 agent 模式给最好的事实质量,如果 CLI 配额允许。

配置表让你按行选,带按行 metric,这样你事后可以验证折中。

## 在哪

打开 **Memory → Workers**(Web 侧栏) — 或直接 `/memory/workers`。从 M-PF 起,本页面是统一的 **Memory 配置**着陆页,五节同处:

1. **Providers** — HTTP 端点注册
2. **Workers** — 按任务 summarizer/agent 路由(本节)
3. **Capture rules** — 触发配置
4. **Injection profiles** — 启动时策略
5. **Token cost** — 全程调用审计

每个 Worker 卡片(第 2 节)显示:

- **Worker 选择器**: `Summarizer` ↔ `Agent` 下拉(gatekeeper 锁定 Summarizer — 见下方 "为什么 gatekeeper 不动")。
- **Provider 选择器**:
  - summarizer 时: 选哪个 `memory_summarizer_providers` 行(和你在 Memory 配置页看到的同一下拉)。空 = 注册表默认。
  - agent 时: 选 `claude` 或 `gemini`;claude 时,选你多账户行的哪一个。
- **Enabled** 勾选框: 把整个触点关掉(降级到无 LLM 行为 — 仅元数据 journal、原始统计 git activity 等等)。
- **Test** 按钮: 跑合成 ping("reply with OK")。浮现往返延迟 + 任何 auth / 网络错误。
- **Save** 按钮: 持久化。下次调用生效 — 不需重启。
- **Recent calls** 展开器: 最近 25 次调用,带每行时间戳、worker 类型、毫秒时长、success 标志。

## 为什么 gatekeeper 不动

Gatekeeper 在每次 `memory_store` MCP 调用时触发 — 它在 agent 说"记住 X"和 agent 下条 prompt 之间的热路径上。超过 500ms 就感觉坏了。

本地 summarizer 端点(LM Studio 带 3B 模型)通常 100-300ms 搞定。Agent 启动往返是 5-15s。数学不工作,所以 M25 不为该行提供切换。

该行在配置表里仍然存在 — 你可以为 gatekeeper 钉一个特定 summarizer 供应商,和你 cleaner 用的不同。只是不能 agent。

## 接下来读

- **02 — 按任务挑 worker** 用本地实测的延迟 / 成本数字具体走一遍折中。
- **03 — 验证 & 指标** 涵盖 24h 汇总里看什么、何时信指标、如何回滚坏切换。
