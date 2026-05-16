# 自定义供应商 manifest

加一个 opendray 没自带的 CLI,只需要丢一个 JSON 文件。不用
改代码,不用重新编译 — 不过你需要重启 opendray 才能让新
manifest 生效。

## Manifest 模式

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

| 字段 | 用途 |
|---|---|
| `id` | 唯一供应商 id(URL 安全、小写)|
| `displayName` / `displayName_zh` | 显示在下拉框里;中文 locale 用 CJK 变体 |
| `description` | 同一个选择器里的一行描述 |
| `icon` | 单个 emoji,或者 `🟣` 风格的装饰 |
| `version` | 自由格式;显示在供应商卡片上 |
| `kind` | 目前只能是 `cli` |
| `executable` | 路径或 `$PATH` 里的名字 |
| `args` | 默认参数,每次拉起都会追加 |
| `env` | 在主机环境之上合并的额外环境变量 |
| `spawnHint` | 拉起对话框的 UI 提示 |

## 文件该放哪

内置的 manifest 通过 `embed.FS` 存在 Go 二进制里,位置在
`internal/catalog/builtin/<id>.json`。要从源码里加一个新的:

1. 把你的 JSON 文件丢到那个目录。
2. 重新编译 opendray(`go build ./cmd/opendray`)。
3. 重启。

要在不重新编译的情况下做运行时添加,API 支持 POST 一份
manifest:

```bash
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  http://localhost:8770/api/v1/catalog/providers \
  -d @my-provider.json
```

catalog 包会用模式校验 manifest 并持久化该行。下一次同步周期
就会捡起来。

## 校验

opendray 对每份 manifest 做严格校验:

- `id` 必须是 `[a-z0-9-]+`,2–40 字符
- `executable` 必须在启动时能解析;找不到二进制的供应商会被
  标记为 **unavailable**(在下拉框里灰掉)。
- 顶层有未知 key 会让 manifest 直接被 **拒绝**。

启动时检查服务器日志:

```
INFO catalog synced count=4
WARN provider unavailable id=myshell err="executable not found in $PATH: zsh"
```

## 运行时覆盖

Web UI 让你在不修改源 manifest 的情况下按主机给
`executable` / `args` / `env` / `displayName` / `disabled` 打补丁。
覆盖项存在数据库里,叠加在内置默认值之上 — 当同一个
opendray 二进制跑在多台主机上、文件系统布局又不同的时候很
方便。

供应商卡片上的 **Reset** 按钮会丢掉你的覆盖项,回到 manifest
里内置的值。
