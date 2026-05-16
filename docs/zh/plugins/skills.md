# Skill

*Skill* 是一个 markdown 文件,描述一个可复用的 prompt 或
流程。opendray 会把配置好的 skill 目录同步到每个 Claude 会话
的 `~/.claude/skills/`,这样 Claude Code 就能通过 slash 命令
调用它们。

## 什么时候用

- "用我们的标准 PR review 流程审一下这个 diff" — 把审阅
  清单编码为一个 skill,用 `/pr-review` 调用。
- "给问题 X 生成 bug 报告模板" — skill 收一个参数,填模板。
- 任何你发现自己输入了超过两次的 prompt — 都是 skill 候选。

## 文件布局

```
~/.opendray/vault/skills/
  pr-review.md
  bug-report.md
  refactor-helper.md
```

每个 `.md` 文件是一个 skill。文件名(去掉 `.md`)就是 Claude
注册的 slash 命令名。所以 `pr-review.md` 在 Claude 内部会
变成 `/pr-review`。

## Skill markdown 格式

```markdown
# pr-review

Run a structured PR review.

## Args

- `$1` (optional) — branch to review against; defaults to `main`

## Prompt

You are reviewing a pull request against `$1`. Walk through the
diff one file at a time:

1. Identify intent — what is this PR trying to do?
2. Flag bugs, regressions, missed edge cases
3. Suggest tests to add
4. Comment on style only when it materially affects readability

Use `git diff` and `git log` to gather context. Output
should be a single comment block ready to paste into the PR
review.
```

第一个 H1 就是命令名(会规范化 — 应该和文件名一致以保持
清晰,但当它们不一致时 opendray 会尊重 H1)。正文章节是
自由格式;`## Prompt` 标题之后的所有内容,会成为发给
Claude 的实际 prompt。

`$1`、`$2`、…… 占位符会插值 slash 命令的位置参数。`$@` 插值
完整的参数字符串。

## 同步模型

opendray 监视 skill 目录(默认是 `~/.opendray/vault/skills/`):

1. opendray 启动时 → 读取每个文件 → 发布
   `skills.changed` 事件。
2. 任何一次拉起 Claude 会话时 → 把每个 skill 写到
   `~/.claude/skills/`(或者会话绑定账号对应的
   `CLAUDE_CONFIG_DIR`)。
3. 文件系统发生变化(Linux 上是 inotify、macOS 上是
   FSEvents)→ 重新发布变更事件;运行中的会话在它们的下一
   次 prompt 时会拿到新的 skill。

你可以从笔记编辑器(它们就是 vault 里的 markdown)、从
Obsidian、从 VS Code,或者其他任何编辑器编辑 skill —
opendray 两边都能看到变化。

## 禁用一个 skill

两种方法:

- **软禁用**:在文件名前面加 `_`(比如 `_pr-review.md`)。
  opendray 会跳过以 `_` 开头的文件。
- **硬禁用**:删掉文件。skill 会在下一次同步时消失。

目前没有 per-session 的禁用列表(只有 per-host 的)。

## 命名规则

- Skill 文件名必须是 `[a-z0-9-]+\.md`(小写、连字符)。
- 名字不能和 Claude 内置 slash 命令(`/init`、`/clear` 等)
  撞车。如果你尝试,opendray 会警告。
- 把 skill 正文保持在 ~5KB 以下,Claude prompt 加载会快。
- 一个文件一个 skill — 多 skill 文件不会被解析。
