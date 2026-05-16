# 插件 — 概览

Plugins 页注册的是工具扩展,opendray 会在会话拉起时把它们
注入到兼容的 CLI 会话里。这里有三类插件:

| 插件类型 | 做什么 |
|---|---|
| **Skill** | 可复用的 prompt / 模式(markdown 文件),Claude 可以作为 slash 命令调用 |
| **MCP 服务器** | Model Context Protocol 服务器,向兼容的 CLI 暴露工具目录 |
| **Git 主机** | 远程 git 推送的凭据(vault 同步、代码库克隆) — 笔记 vault 和集成那边都用 |

![插件页面](/tutorial/plugins-layout.png)

## 继续阅读

| 主题 | 章节 |
|---|---|
| Skill 目录 + slash 命令注册 | Skill |
| MCP 服务器目录 + 密钥保险库 | MCP |
| 给 git remote 用的 SSH key / HTTPS PAT | Git 主机 |

## 插件状态存在哪儿

| 插件 | 存储 |
|---|---|
| Skill | `~/.opendray/vault/skills/` 下的 markdown 文件(由 vault 管理,通过 git 同步)|
| MCP 服务器 | `~/.opendray/mcp/servers.json` 里的 JSON 配置 |
| MCP 密钥 | 加密文件 `~/.opendray/secrets.env`(密钥在 OS keychain)|
| Git 主机 | Postgres `git_hosts` 表;HTTPS token 在同一个密钥保险库里 |

这种切分是有意的:skill 内容在 vault 里(所以多主机同步直接
就能用),但密钥材料留在 per-host 的、被 OS keychain 保护的
保险库里。
