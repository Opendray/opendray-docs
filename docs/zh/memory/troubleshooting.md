# 故障排查

记忆出问题时,从这里查。

## 现象: agent 从不调用记忆工具

**可能原因**: system-prompt 指导没被注入,或者 MCP server 没被自动挂载。

**检查**:
```bash
ls /var/folders/.../opendray-sess-<your-session-id>/
cat /var/folders/.../opendray-sess-<your-session-id>/claude-mcp.json
```

你应该看到 `opendray-memory` 条目。如果没有:

1. 会话是不是在记忆启用**之前**启动的?重启会话。
2. 供应商支不支持 MCP?查 `internal/catalog/builtin/<provider>.json: capabilities.supportsMcp`。
3. `app.New` 启动时有没有打印 `memory MCP auto-attach enabled`?如果这行缺失,integration key 没被造出来 — 在 `/tmp/opendray.log` 里找 `init memory:` 错误。

## 现象: `tool error: 401 unauthorized`

**原因**: 会话 `mcp.json` 里的 API key 过期(比如 opendray 重启过,缓存文件被清掉)。agent 的 mcp-memory 子进程无法认证。

**恢复**: 结束 + 重启会话。opendray 会用实时缓存的 key 重新渲染 `mcp.json`。

如果重启后 401 仍在:
```bash
rm ~/.opendray/memory.key
pkill -f "opendray serve"
go run ./cmd/opendray serve -config config.toml
```
这会强制重新轮换 + 缓存。

## 现象: 我刚存的记忆搜不到

**可能原因**:

1. **BM25 token 不匹配**。稀疏 hash 向量只匹配精确 token。`query="package manager"` 对 `text="opendray prefers pnpm"` 返回 0,因为没有共同词。试一个含存储文本里字面词的查询。解决方案: 切到 `backend = "http"` 配真实 embedder。
2. **scope_key 不对**。Inspector → 把 `scope_key` 设为你存储时用的 cwd。不同 cwd = 不同作用域 = 无命中。
3. **阈值过高**。Settings → Memory → Similarity threshold。默认 0.1。设为 0(或 API 调用里 `min_similarity=-1`)以看到所有排序后的命中。

## 现象: 我在 Inspector 删掉的记忆又回来了

**原因**: 镜像在下次启动会话时从 Claude 本地 `.md` 文件重新摄取了它们。

**恢复**:
```bash
rm ~/.claude/projects/-encoded-cwd/memory/<topic>.md
rm ~/.claude-accounts/*/projects/-encoded-cwd/memory/<topic>.md
```

然后在 Inspector 里重新删行。Phase 2 可能会加 "blocklist",让镜像跳过特定源路径。

## 现象: opendray 起不来,日志里有 `pgvector` 相关错误

**原因**: `opendray_v2` 数据库没装 pgvector 扩展,或者装了但 PG 容器里的二进制缺失。

**恢复**:
```bash
ssh -i ~/.ssh/home_lab_key root@<pg-host> \
  "docker exec mypostgresql_container psql -U <superuser> -d opendray_v2 \
    -c 'CREATE EXTENSION IF NOT EXISTS vector;'"
```

如果 `CREATE EXTENSION` 报 "could not open extension control file",需要在容器内装 pgvector 二进制 — 重建路径见 `docs/setup/pgvector.md`。

## 现象: `memory ready` 日志完全缺失

**原因**: `app.New` 从 `init memory: …` 返回了错误。

**检查**: 往上翻日志。常见原因:

- `database url` 为空 → `[database.url]` 没配
- migration 0011 没跑 → `go run ./cmd/opendray migrate -config config.toml`
- DB 不可达 → 检查 Postgres 在配置的 URL 上是否在运行

## 现象: `gateway returned 502/503 from mcp-memory`

**原因**: `mcp-memory` 子进程联系不到 opendray gateway。要么 gateway 崩了,要么它调用的 BASE_URL 错了。

**检查**渲染后的 `mcp.json`:

```bash
cat /var/folders/.../opendray-sess-<id>/claude-mcp.json | jq '.mcpServers["opendray-memory"].env'
```

`OPENDRAY_BASE_URL` 应该是 `http://127.0.0.1:<your-port>`。如果 opendray 绑在 `0.0.0.0`,opendray 内部会写 `127.0.0.1` 以便子进程能联系到。如果 URL 不对,重启 opendray(它启动时会从 `[listen]` 重新推导)。

## 现象: `/memory/*` 即便带 admin token 也 401

**原因**: phase 2 期间路由在 admin-only 与 dual-auth 组之间挪过。旧 admin 客户端打 `/admin/memory/*` 拿 404;新路径是 `/memory/*`。

**更新**: 任何用旧路径的自定义脚本应切到 `/api/v1/memory/*`。`mcp-memory` 子进程已经用新路径。

## 终极恢复: 全部清空

如果记忆陷入很奇怪的状态,你只想要个干净起点:

```sql
DELETE FROM memories;
DELETE FROM memory_index_state;
```

然后 `rm ~/.opendray/memory.key` 并重启 opendray。你会丢掉所有存储的记忆,但保留 integration 行 + UI 配置。

要把 `opendray-memory` integration 行也删掉(强制下次启动重新注册):

```bash
# Web UI: Integrations → opendray-memory → Delete
# Or:
TOKEN=$(curl -s -X POST .../auth/login ... | jq -r .token)
ID=$(curl -s ... /integrations | jq -r '.integrations[]|select(.name=="opendray-memory").id')
curl -X DELETE -H "Authorization: Bearer $TOKEN" .../integrations/$ID
```

## 什么时候报 bug

如果现象不在这里,到 <https://github.com/Opendray/opendray_v2/issues> 提 issue,附:

1. `tail -100 /tmp/opendray.log` 的输出
2. 会话的 `mcp.json`(先把 api_key 涂掉)
3. agent 工具调用如果报错的输出
4. SQL: `SELECT count(*), embedder FROM memories GROUP BY embedder;`
