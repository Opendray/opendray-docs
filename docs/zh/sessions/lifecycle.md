# 会话生命周期

每个会话会经过一个小型状态机。终端面板顶部的状态标签告诉你它当前的位置。

| 状态 | 含义 | 你能做什么 |
|---|---|---|
| **STARTING** | DB 行已插入,PTY 正在 spawn | 等待 — 通常 <500ms |
| **RUNNING** | 进程存活,最近有 stdout 活动 | 在终端里输入 |
| **IDLE** | 进程存活,静默 ≥30 秒(可配置) | 正常回复;idle 只是一个事件信号 |
| **STOPPED** | 操作员点 ✕ → SIGTERM → 进程退出 | 查看回滚;**Restart** 会以同一个 id 重新启动 |
| **ENDED** | 进程自行退出 | 查看回滚;**Restart** 重新启动 |
| **FAILED** | spawn 或运行时错误,未能干净退出 | 检查对话框错误 / 日志;不修配置通常无法恢复 |

## 进入空闲

空闲就是 "N 秒内没有 stdout" — 进程仍然存活并在监听。opendray 用空闲作为一个信号在事件总线上触发 `session.idle`,这会:

- [Channels](#channels-overview) 按其 `notify_on` 过滤推送通知
- 状态标签变成 `IDLE`(黄色)
- CLI 发出的下一个字节会把状态翻回 `RUNNING`

阈值(默认 30 秒)和监视器轮询间隔(默认 5 秒)在 `config.toml` 的 `[session]` 里。阈值越低 = 通知越多,阈值越高 = 错过短暂停顿。

> 频道还有自己的每频道通知策略叠加在上面 — 见 Channels 下的 *Notifications panel deep-dive* 章节,里面有 `once` / `cooldown` / `every` 模式。

## 停止一个会话

会话离开 `RUNNING` 有三种方式:

### 操作员停止(× 按钮)

点击运行中标签上的 × → 确认对话框 → opendray 发送 **SIGTERM**,等 3 秒,如果进程还活着再发 **SIGKILL**。状态翻到 `STOPPED`,环形缓冲区保留供回看。

### 进程退出

CLI 自行退出 — `q` / `Ctrl-D` / 脚本的 `exit 0` / panic。opendray 捕获退出码,把行标为 `ENDED`(填充 `exit_code`),在事件总线发布 `session.ended`。

如果 `exit_code != 0`,渲染 session.ended 卡片的频道会显示**红色**色彩模板。

### opendray 重启时的对账

opendray 自身重启(新构建、主机重启)时,任何处于非终止状态的行都会被标为 `ENDED`,原因是 `"previous gateway process exited; PTYs gone"`。PTY 无法在父进程死亡后存活,所以行老老实实地反映这一点。

启动日志里你会看到这一行:

```
INFO reconciled stale sessions on startup count=N
```

## 从已停止的会话重启

Restart 按钮(在 stopped/ended 标签上可见)会用相同的下列字段重跑 spawn 流程:

- Provider id
- 工作目录
- 参数
- Claude 账号绑定
- 父会话 id

但分配**新的会话 id**。老的行留在 DB 里用于审计。Inspector 链接的笔记会跟到新会话,因为它按文件路径而非会话 id 标识。

## 关闭标签

**已结束**标签上的 × 按钮视觉上关闭标签,但**保留 DB 行**。可以通过 Sessions 列表顶部的 *History* 过滤器找到旧会话。

要真正从数据库删除一个会话行,用 API:

```bash
curl -X DELETE -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:8770/api/v1/sessions/<sid>
```

Web 管理后台故意不暴露破坏性删除按钮 — 误点会丢失审计上下文。
