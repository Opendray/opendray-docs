# opendray-docs

Documentation site for [opendray](https://github.com/opendray/opendray) — a multi-CLI control gateway that bridges Claude Code / Codex / Gemini CLI sessions to messaging platforms (Telegram, Slack, Discord, Feishu, DingTalk, WeCom, …).

Live: <https://docs.opendray.dev>

## Stack

- [VitePress](https://vitepress.dev/) — static-site generator (Vite + Vue)
- Deployed to Cloudflare Pages, auto-built on push to `main`
- Bilingual: English (root) and 简体中文 (`/zh/`)

## Local development

```sh
pnpm install
pnpm dev          # http://localhost:5173
pnpm build        # output: docs/.vitepress/dist/
pnpm preview      # serve the built bundle locally
```

## Content layout

```
docs/
├── .vitepress/
│   ├── config.ts                # site-level config + i18n entry
│   └── locales/
│       ├── en.ts                # English sidebar / nav / themeConfig
│       └── zh.ts                # Chinese sidebar / nav / themeConfig
├── public/                      # static assets (images, favicon)
│   └── tutorial/                # screenshots referenced by md files
├── index.md                     # English home (root locale)
├── getting-started/             # English content
├── sessions/
├── channels/
│   ├── overview.md
│   ├── telegram.md
│   └── …
└── zh/
    ├── index.md                 # Chinese home
    ├── getting-started/
    └── …
```

## Contributing

PRs welcome — file paths mirror between locales, so a change in `docs/channels/telegram.md` should ship alongside an updated `docs/zh/channels/telegram.md`.

If you only know one language, that's fine — open the PR with the language you can write, and a maintainer or LLM-assisted pass will sync the other locale before merge.

## License

See [LICENSE](./LICENSE) — content is licensed CC BY 4.0; the build tooling (VitePress config, scripts) is MIT.
