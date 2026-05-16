# Tutorial screenshots

This directory holds the PNG screenshots referenced by tutorial pages.
Files are served from the site root, so a markdown file references
them as `/tutorial/foo.png` (regardless of what locale the markdown
itself lives in — both `docs/sessions/inspector.md` and
`docs/zh/sessions/inspector.md` use the same image URL).

## Status

**8 real screenshots** are in place:

- `activity-layout.png`
- `channels-kind-picker.png`
- `channels-notifications-panel.png`
- `integrations-layout.png`
- `providers-layout.png`
- `sessions-layout.png`
- `sidebar-overview.png`
- `spawn-dialog.png`

**25 placeholder stubs (1×1 transparent PNG)** still need real
screenshots. Replace each with a real capture before publishing the
section that references it:

- `bridge-adapter-setup.png` — Bridge adapter setup dialog (Python/Node tabs)
- `bridge-create-form.png` — Bridge channel create form (token + capabilities)
- `channels-running.png` — Channels page with one running telegram bot
- `dingtalk-robot-create.png` — DingTalk group robot create dialog with Sign secret
- `discord-card-buttons.png` — Discord embed with action row buttons
- `discord-token.png` — Discord developer portal Bot tab with Reset Token
- `feishu-channel-webhook.png` — opendray channel card displaying the Feishu webhook URL row
- `feishu-credentials.png` — Feishu open platform Credentials & Basic Info
- `integration-key-reveal.png` — modal showing a freshly-created integration key
- `integrations-proxy-mount.png` — reverse-proxy mount form
- `notes-layout.png` — Notes page
- `notes-source-preview.png` — Source / Preview tabs on the editor
- `notes-wiki-link-suggest.png` — wiki-link suggestion popup
- `notifications-panel-detail.png` — Notifications panel inside Edit dialog
- `plugins-layout.png` — Plugins page
- `plugins-mcp-add.png` — MCP server registration form
- `routing-reply-to-message.png` — Telegram long-press reply demonstration
- `sessions-inspector.png` — Inspector panel sub-tabs (Outline / Notes / Context / Activity)
- `sessions-tab-strip.png` — multi-tab strip with running + ended tabs
- `settings-shortcuts.png` — keyboard shortcuts editor
- `slack-app-create.png` — api.slack.com/apps "Create New App" flow
- `slack-channel-id.png` — Slack channel details panel showing Channel ID
- `telegram-botfather-token.png` — BotFather chat showing the token reveal
- `telegram-new-channel.png` — opendray Create channel form filled for Telegram
- `wecom-robot-url.png` — WeCom group robot URL reveal

## Capture tips

- macOS: **Cmd+Shift+5** → *Selected Window* → click the window.
- Crop tightly with Preview (**Cmd+K** after pasting).
- Dark mode if your admin runs in dark mode.
- Anonymise tokens / chat ids before saving.
- Target ≤ 500 KB per screenshot.

## Conventions

Filename matches the slug in the tutorial markdown verbatim — see the
`![alt](/tutorial/foo.png)` references inside `docs/**/*.md`. Don't
rename without updating every reference.
