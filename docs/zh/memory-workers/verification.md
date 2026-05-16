# 验证 & 指标

把某触点翻到新 worker 后,你想确认两件事:

1. 新 worker 真的工作(无 auth / 网络问题)。
2. 延迟 / 质量折中符合文档承诺。

## 测试连接(即时)

每个 worker 卡片都有 **Test** 按钮。它跑:

```text
system: You are a connectivity test. Reply with the single word OK and nothing else.
user:   ping
```

通过配置好的 worker 60s 超时,显示:

- **OK** + 毫秒时长 + 响应的前 200 字符。
- **Error** + 精确错误信息(HTTP 状态 / 进程退出 / 超时 / 认证拒绝)。

使用场景:

- 首次为某触点挑 agent worker 后、下次 24h tick 触发前。如果 `claude --print` 没装或所选账户没认证,测试瞬间浮现。
- 在为高频触点(cleaner / transcript)批准配置变更前,跑测试看你机器上的实际延迟。数字 > 10s 暗示配错(慢 Claude 账户、网络) — 别保存。

## 24h 汇总(中期)

每个 worker 卡片显示最近 24h 三项统计:

```text
N calls · 24h
avg Xms
Y errors      (only when > 0)
```

来自 `memory_worker_calls` 审计表。几小时活动后刷新页面看滚动窗口更新。

注意什么:

- **平均毫秒**几天内呈上升 = 上游变慢(Claude 拥塞、LM Studio 在换模型)。和上周比 — 一致就接受;是回归就深挖。
- **错误数 > 0**: 展开 "Recent calls" 节看哪些调用失败、错误是什么。常见原因:
  - 主机上缺 agent CLI(`exec: "claude": executable file not found`)
  - Claude 账户配额耗尽(`HTTP 429`)
  - 网络打嗝(`context deadline exceeded`)
- **某触点启用后零调用**: 也许调度器还没触发(cleaner / gitactivity 是 24h),或者触发事件还没发生(transcript 没有会话结束)。等或强制。

## 强制一次 worker 调用

对有手动触发器的任务:

- **Cleaner**: Project → Cleanup 标签 → "Run cleanup now"
- **Gitactivity**: 对有陈旧行的 cwd 跑 `POST /api/v1/git-activity/run`

跑一次,刷新 Workers 页看新 metric 行。

对没有手动触发器的任务(gatekeeper、transcript),唯一验证路径是 **Test** 按钮 + 等下一次自然事件。

## Recent calls 表

每个 worker 卡片有可折叠 "Recent calls (N)" 节,显示最近 25 次调用:

| 列 | 是什么 |
|---|---|
| when | 调用的本地时间 |
| worker | summarizer 或 agent · provider id |
| ms | 时长 |
| ok | 成功 ✓,错误 ⚠ |

钻到失败调用读完整 error_message — 后端原样记录,包括 agent CLI 启动的 stderr。

## 回滚

如果切换不工作:

1. **Memory → Workers** 找到该任务。
2. 把 worker 改回上一个值。
3. **Save** — 下次调用生效,不需重启。

指标汇总几分钟内恢复 — 旧的高延迟调用自然滚出 24h 窗口。

## SQL 访问

更深入分析,审计表是平的:

```sql
SELECT task, worker_kind, provider_id,
       COUNT(*) AS n,
       ROUND(AVG(duration_ms)) AS avg_ms,
       COUNT(*) FILTER (WHERE NOT success) AS errors
  FROM memory_worker_calls
 WHERE started_at > NOW() - INTERVAL '7 days'
 GROUP BY task, worker_kind, provider_id
 ORDER BY task, avg_ms;
```

想把过去 7 天和过去 24h 对比,或算 UI 不显示的成本 / 体量数字时用它。
