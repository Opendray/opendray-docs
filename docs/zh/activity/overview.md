---
kind: concept
title: 活动 Activity — 概览
tldr: opendray 系统级事件总线的 tail -f。每个 session / channel / memory / notification 事件滚动经过。按 integration / direction / status / time / topic 过滤。
status: stable
since: v0.1.0
topic: activity
related: [activity/topics-catalogue, integrations/call-log, integrations/events-ws]
references:
  capabilities: [integrations]
x-implementation: [internal/eventbus/, internal/integration/calllog.go]
---

# 活动 Activity — 概览

> **tldr:** opendray 系统级事件总线的 `tail -f`。每个 session / channel / memory / notification 事件滚动经过。按 integration / direction / status / time / topic 过滤。

## 两种数据源

| 源 | 页 tab | 什么 |
|---|---|---|
| 事件总线 | Activity → Events | `internal/eventbus/` 的 live 流;短暂 |
| 调用日志 | Activity → API calls | 持久化到 `integration_call_log` 表 |

## 顶部过滤器

| 过滤 | 源 |
|---|---|
| Integration | 注册的 + `admin` 下拉 |
| Direction | inbound / outbound / proxied / event |
| Status | 2xx / 3xx / 4xx / 5xx(API)/ event-type(bus) |
| 时间范围 | 5m / 1h / 24h / 7d / 自定义 |
| Topic 模式 | `session.*` / `channel.*.delivery` / `memory.*` 等 |

![Activity 布局](/tutorial/activity-layout.png)

## 何时用

| 目标 | 怎么用 |
|---|---|
| 调试 "为什么我的集成没收到事件?" | 按 integration + topic 过滤 |
| 合规审计 | 按时间 + integration 过滤 → 导出 CSV |
| 检测异常集成调用 | 按 5xx 状态过滤 |
| 追请求过系统 | 搜 `request_id` |
