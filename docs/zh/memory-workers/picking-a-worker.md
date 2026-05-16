# 按任务挑 worker

这是有观点的 — 正确答案取决于你的硬件、Claude 预算和启动会话的频度。下列建议来自在 Mac Studio 上跑 opendray 配 LM Studio(qwen-3.5-9b)+ Claude Pro 订阅。

## Gatekeeper — 保持 Summarizer

设计上强制(见概览)。微调: 如果你默认 summarizer 是较大的模型,专门给 gatekeeper 钉一个又小又快的模型。

在 **Memory → Workers → Gatekeeper** 配置:

- Worker: `Summarizer`(锁定)
- Provider: 如果你有小模型行就选;否则留 "Registry default"

## Cleaner — Summarizer(默认),仅本地太蠢时选 Agent

Cleaner 把记忆条目裁为 keep / stale / duplicate。这是结构化输出任务,JSON schema 清晰、标准清晰。7-13B 本地模型在我们测试里处理得不错 — 对老化短期条目("正在调试 X")的判断质量过硬。

仅在以下情况切到 Agent(Claude):

- 你的本地模型返回不一致裁决(明显陈旧条目混着 `keep`)。
- 你的记忆存储里有许多语义相似度没合并、但智能审阅者会合并的微妙近重复。

24h 频度意味着每次跑的成本是有界的。每次跑在一个 prompt 里处理至多 `batch_size`(默认 20)条记忆 — 这是一次 Claude API 调用。agent worker 下,每次跑约 10s + 几分钱。

## Gitactivity — 推荐 Agent(Claude)

这是 agent worker 最强的论据。总结器读 7 天 `git log`,产出 2-3 段叙述,每个后续 agent 启动时都读。质量复利。

本地 9-13B 模型倾向于产出泛泛摘要("项目做了记忆和移动相关的改动")。Claude Opus 产出具体到文件级的见解("M16-M17 工作在 `internal/projectscan/` 跨度引入了自动捕获技术栈扫描,然后 M22 在跨会话 jsonl 混乱触发的生产 bug 浮现之后,在 `internal/session/transcript.go` 加了三层对话隔离")。

在 **Memory → Workers → Git activity summariser** 配置:

- Worker: `Agent`
- CLI: `Claude`
- Claude 账户: 你为本工作区认证过的那个账户

每 24h 或 stale-spawn(自上次刷新 >12h)触发一次。成本: 每天每活跃项目约 1 次 Claude API 调用 — 有界且可预期。

## Transcript — 活跃项目推荐 Agent(Claude)

按会话结束总结。频度高于 gitactivity(每次会话 vs 一天一次),但每次调用短(对话上限 16 KB,所以约 4k 输入 token)。

配置: 同 gitactivity。system prompt 里的 "too sparse" 防护意味着琐碎会话(单一 "hi")花零成本 — Claude 返回空 `<summary></summary>`,journal 保持仅元数据。

切回 summarizer 当:

- 你一天启动几十个微会话,成本累起来。
- 你不在乎叙述质量的会话摘要(仅元数据的回落仍有用)。

## 合理的起点配置

| 任务 | Worker | 为什么 |
|---|---|---|
| Gatekeeper | Summarizer(小模型) | 热路径,反正锁定 |
| Cleaner | Summarizer(默认) | 本地处理结构化判断没问题 |
| Gitactivity | **Agent — Claude** | 最佳质量 / 成本比;一天 ≤ 1 次 |
| Transcript | **Agent — Claude** | 你真会去读的会话 journal |

Claude 总用量: 在活跃项目上每天约 5-15 次 API 调用。成本: Pro 档下远低于 $1/天。

## 保存前怎么测

每个行都有 **Test** 按钮,跑一行合成 prompt 并报告往返延迟。用它来:

- 在下次 24h tick 触发前,理智检查所选 Claude 账户在本主机上确实已认证。
- 给定任务在翻行前对比 summarizer vs agent 延迟 — 给你真实数字,不是猜测。
- 验证 `gemini` agent worker 在你机器上能否工作(gemini CLI 在不在不会预检)。
