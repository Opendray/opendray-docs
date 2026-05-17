---
kind: capability
title: Skills
tldr: 给 Claude 调用的 markdown 程序。从 builtin(嵌二进制)+ vault(运维编辑)加载。spawn 时注入系统 prompt。opendray skill CLI 列出/加载。
status: stable
since: v0.1.0
topic: plugins
related: [plugins/overview, plugins/mcp, notes/overview]
capability: [builtin-skills, vault-skills, system-prompt-injection]
inbound: vault-watcher
outbound: system-prompt-prefix
x-implementation: [internal/skills/, cmd/opendray/skill.go]
---

# Skills

> **tldr:** 给 Claude 调用的 markdown 程序。从 builtin(嵌二进制)+ vault(运维编辑)加载。spawn 时注入系统 prompt。`opendray skill` CLI 列出/加载。

## Skill 文件结构

```markdown
---
id: write-pr-description
name: 写 PR 描述
description: 从已 staged 的变更生成 PR 描述
triggers:
  - "write pr description"
  - "generate pr text"
applies_to:
  providers: [claude, codex]
  cwd_glob: "**"
---

# 流程

1. 跑 `git diff --staged` 取变更集。
2. 识别变更的 WHY(链 issue 如有)。
3. 把变更分组为 Summary / Changes / Test plan 段。
4. 输出格式化的 PR 描述。
```

## Frontmatter 字段

| 字段 | 类型 | 必填 |
|---|---|---|
| `id` | string(kebab-case) | ✓ |
| `name` | string | ✓ |
| `description` | string | ✓ |
| `triggers` | string[] | 可选 |
| `applies_to.providers` | string[] | 可选 |
| `applies_to.cwd_glob` | glob string | 可选 |

## 两种来源

| 来源 | 位置 | 可编辑 |
|---|---|---|
| Builtins | Go 二进制里通过 `go:embed` 嵌入 `internal/skills/builtin/` | 仅 rebuild |
| Vault | `<vault>/skills/*.md` | 实时 — 运维在 Notes 页或外部编辑器编辑 |

## CLI

```bash
opendray skill list                        # 列出所有 skill(builtin + vault)
opendray skill show write-pr-description   # 打印 markdown
opendray skill load <file>                 # 加到 vault 并 reload
opendray skill validate <file>             # 检查 frontmatter + 结构
```
