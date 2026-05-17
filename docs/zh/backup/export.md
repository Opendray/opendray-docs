---
kind: capability
title: 备份 — 导出(Plan C)
tldr: /export = 可移植 zip-bundle。解码数据(JSON/markdown),不是 pg_dump。可导入到不同 opendray 主机。AES-GCM 加密。
status: stable
since: v0.1.0
topic: backup
related: [backup/overview, backup/restore-and-import]
capability: [portable-zip, json-bundle, cross-host-import, scope-selective]
inbound: gateway
outbound: zip-file
x-implementation: [internal/backup/export.go]
---

# 备份 — 导出(Plan C)

> **tldr:** `/export` = 可移植 zip-bundle。解码数据(JSON/markdown),**不是** `pg_dump`。可导入到 **不同** opendray 主机。AES-GCM 加密。

## Plan A vs Plan C

| | Plan A(备份) | Plan C(导出) |
|---|---|---|
| 格式 | pg_dump(二进制) | JSON + markdown 的 zip |
| 恢复目标 | 同 opendray,同 DB | 任何 opendray 实例 |
| schema 版本锁定 | 是 | 否 —— 导入时 key 重新生成 |
| 用途 | "哎呀,恢复昨天的 DB" | "从一台服务器迁移到另一台" |

## zip 里有什么

```
opendray-export-<ts>.zip.enc                    # 整体 AES-GCM 加密
├── manifest.json                               # 内容、版本等
├── sessions/                                   # 每 session 一个 JSON
├── memory/
│   ├── project.jsonl                           # 每行一行
│   ├── global.jsonl
│   └── session.jsonl
├── channels/                                   # 每 channel 一个 JSON
├── integrations/                               # API key 不含
├── notes/                                      # 完整 vault(markdown)
└── audit/
    └── audit_log.jsonl
```

## 选择性导出

| UI toggle | 含 |
|---|---|
| Sessions | session 元数据 + transcript |
| Memory | project / global / session scope |
| Channels | 配置 + secret(加密包里再加密) |
| Integrations | 元数据(API key 不导出,导入时重新生成) |
| Notes | 完整 vault |
| 审计 + 调用日志 | 可选(大) |
