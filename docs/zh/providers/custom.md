---
kind: capability
title: 自定义 provider manifest
tldr: 丢一个 JSON manifest 到 internal/catalog/builtin/(编译期)或 POST 到 /api/v1/catalog/providers(运行时)→ 新 CLI 出现在 spawn 下拉。
status: stable
since: v0.1.0
topic: providers
related:
  - providers/overview
  - providers/bundled
capability:
  - text-cli
  - custom-binary
  - env-override
x-implementation:
  - internal/catalog/manifest.go
  - internal/catalog/validator.go
---

# 自定义 provider manifest

> **tldr:** 丢一个 JSON manifest 到 `internal/catalog/builtin/`(编译期)或 POST 到 `/api/v1/catalog/providers`(运行时)→ 新 CLI 出现在 spawn 下拉。

## Manifest schema

```json
{
  "$schema": "https://opendray.dev/schemas/manifest-v2.json",
  "id": "myshell",
  "displayName": "Plain Shell",
  "displayName_zh": "纯 Shell",
  "description": "Interactive shell session, no AI assistance.",
  "description_zh": "交互式 shell 会话,无 AI 辅助。",
  "icon": "🐚",
  "version": "1.0.0",
  "kind": "cli",
  "executable": "zsh",
  "args": ["-l"],
  "env": {
    "TERM": "xterm-256color"
  },
  "spawnHint": {
    "cwdPlaceholder": "/Users/me/projects",
    "argsExample": "--login"
  }
}
```

## 字段参考

| 字段 | 类型 | 必填 | 约束 |
|---|---|---|---|
| `id` | string | ✓ | `[a-z0-9-]+`,2–40 字符,唯一 |
| `displayName` | string | ✓ | 下拉显示 |
| `displayName_zh` | string | ✗ | `lang=zh` 时使用 |
| `description` | string | ✗ | 一行 picker hint |
| `description_zh` | string | ✗ | CJK 变体 |
| `icon` | string | ✗ | 单个 emoji |
| `version` | string | ✗ | 自由格式,provider 卡显示 |
| `kind` | enum | ✓ | 目前固定 `cli` |
| `executable` | string | ✓ | 路径或 PATH 解析名 |
| `args` | string[] | ✗ | 每次 spawn 默认追加的 args |
| `env` | map\<string, string\> | ✗ | 合并到进程 env |
| `spawnHint.cwdPlaceholder` | string | ✗ | UI 提示 |
| `spawnHint.argsExample` | string | ✗ | UI 提示 |

## 安装路径

### 编译期(内置)

```bash
# 1. 丢 manifest 到 internal/catalog/builtin/
cp my-provider.json internal/catalog/builtin/myshell.json

# 2. 重新构建(go:embed 嵌入)
go build ./cmd/opendray

# 3. 重启
./opendray serve -config config.toml
```

### 运行时(不重建)

```bash
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  http://localhost:8770/api/v1/catalog/providers \
  -d @my-provider.json
```

catalog 包按 schema 校验 manifest 并持久化。下一轮 sync 周期会拾起 ——
不用重启。

## 校验规则

| 规则 | 行为 |
|---|---|
| `id` 正则不匹配 | manifest 拒绝,HTTP 400 |
| 未知 top-level key | manifest 拒绝,HTTP 400 |
| 启动时 `executable` 不在 PATH | provider 标记为 **unavailable**(下拉里灰显) |
| `id` 与已存在 collide | manifest 拒绝,HTTP 409 |

启动日志:

```
INFO catalog synced count=4
WARN provider unavailable id=myshell err="executable not found in $PATH: zsh"
```

## 运行时 override

Web UI 让你按主机覆盖 `executable` / `args` / `env` / `displayName` /
`disabled`,不用改源 manifest。Override 写 DB,叠加在内置默认值上 ——
同一份 opendray 二进制跑在多个主机时,文件系统布局不同的情况下有用。

provider 卡的 **Reset** 按钮丢弃 override,恢复 manifest 默认值。

## Errors

| code | http | 原因 | 修复 |
|---|---|---|---|
| `manifest_invalid_id` | 400 | id 正则不匹配 | `[a-z0-9-]+`,2–40 字符 |
| `manifest_unknown_field` | 400 | 未知 top-level key | 对照 schema |
| `manifest_executable_missing` | (启动 warn) | 二进制不在 PATH | 装上或写绝对路径 |
| `provider_id_conflict` | 409 | id 已在目录里 | 换 id 或删现有 |
| `manifest_schema_mismatch` | 400 | 字段类型错 | 对照 `$schema` URL |

<details>
<summary>📖 叙事说明</summary>

加一个 opendray 不自带的 CLI,只需要丢一个 JSON 文件。不用改代码、
不用重新构建 —— 但编译期添加需要重启 opendray 才能拾起(运行时
POST 会在下一轮 sync 生效)。

内置的 manifest 存在 Go 二进制里的 `internal/catalog/builtin/`,
通过 `embed.FS`。

</details>
