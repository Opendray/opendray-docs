---
kind: capability
title: 密钥轮换
tldr: POST /api/v1/integrations/{id}/rotate → 返回新 key + 24h grace 期(旧 key 仍可用)。按计划轮换或怀疑泄露时轮换。
status: stable
since: v0.1.0
topic: consuming
related: [consuming/authentication, integrations/auth-model]
capability: [grace-period-rotation, immediate-revoke]
inbound: api
outbound: postgres
x-implementation: [internal/integration/rotate.go]
---

# 密钥轮换

> **tldr:** `POST /api/v1/integrations/{id}/rotate` → 返回新 key + 24h grace 期(旧 key 仍可用)。按计划轮换或怀疑泄露时轮换。

## Rotate API

```http
POST /api/v1/integrations/int_wN79.../rotate
Authorization: Bearer od_admin_xxx
```

```json
{
  "id": "int_wN79...",
  "api_key": "od_live_new_xxx",
  "previous_key_expires_at": "2026-05-18T10:24:00Z"
}
```

## Grace 期

| 时间 | 旧 key | 新 key |
|---|---|---|
| T+0(轮换时) | ✓ 工作(标 `rotated_pending`) | ✓ 工作 |
| T+24h | 401 `key_revoked` | ✓ 工作 |

24h 是故意的 —— 给你时间部署新 key 不停机。

## 零停机替换流程

| # | 动作 | 在哪 |
|---|---|---|
| 1 | 调 rotate API | opendray |
| 2 | 保存新 key 到 secret manager | Vault / AWS Secrets / 1Password |
| 3 | 用新 key 部署 app | 你的基础设施 |
| 4 | 验证(用新 key curl) | 你的基础设施 |
| 5 | 完成 —— 旧 key 在 T+24h 过期 | 自动 |

## 立即吊销(无 grace)

可疑泄露:

```http
DELETE /api/v1/integrations/{id}
```

→ key 立即吊销;后续 → 401 `key_revoked`。
