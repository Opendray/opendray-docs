# Deployment — Cloudflare Pages

The site is published at <https://docs.opendray.dev>. This document
covers the one-time Cloudflare Pages setup and the day-to-day push
workflow.

## One-time setup

1. Push this repo to GitHub:
   ```sh
   gh repo create opendray/opendray-docs --public --source=. --push
   ```

2. In the Cloudflare dashboard:
   - **Workers & Pages** → **Create application** → **Pages** →
     **Connect to Git**
   - Pick the `opendray/opendray-docs` repository
   - **Production branch**: `main`
   - **Framework preset**: pick **VitePress** if offered, else **None**
   - **Build command**: `pnpm install --frozen-lockfile && pnpm build`
   - **Build output directory**: `docs/.vitepress/dist`
   - **Root directory**: `/` (leave blank)
   - **Environment variables**:
     - `NODE_VERSION` = `20`
     - `PNPM_VERSION` = `9.15.0`

3. Save and trigger the first deploy. Cloudflare will install pnpm via
   corepack, run the build, and publish the static bundle.

4. **Custom domain**:
   - Pages app → **Custom domains** → **Set up a custom domain**
   - Enter `docs.opendray.dev`
   - Cloudflare auto-provisions the TLS cert (no manual DNS needed if
     `opendray.dev` already lives in this Cloudflare account)

## Day-to-day

- Push to `main` → production deploy (~1 min)
- Push to any other branch → preview deploy at
  `<branch>.opendray-docs.pages.dev`
- Open a PR → Cloudflare posts the preview URL as a status check

## Local dev

```sh
pnpm install
pnpm dev      # http://localhost:5173
pnpm build    # static output: docs/.vitepress/dist/
pnpm preview  # serve the built output
```

The `pnpm dev` and `pnpm build` scripts auto-run `scripts/stub-missing-images.mjs`
first to drop 1×1 PNG placeholders for any image a markdown page references
but isn't present yet. This keeps the build green when new pages are added
faster than screenshots are captured. See `docs/public/tutorial/README.md`
for the list of missing screenshots that still need real captures.

## Cache strategy

`docs/public/_headers` controls Cloudflare Pages cache lifetimes:

- `/assets/*` (Vite-hashed JS / CSS) — 1 year, immutable
- `/tutorial/*` (screenshots) — 1 day (revalidate quickly when updated)
- everything else — Cloudflare's default

## Redirects

`docs/public/_redirects` covers legacy paths:

- `/docs/*` → `/*` (collapse the redundant `docs/` prefix if it ever
  gets surfaced)

Add new redirects (one per line: `source destination status`) when
you rename a section so deep links from existing chat threads keep
working.

## Backup mirror (optional)

If you also want a Proxmox-hosted mirror as a fallback for when
Cloudflare's account is unavailable:

1. Spin up a tiny LXC (~64 MB RAM) on the cluster.
2. Run `pnpm build` and `rsync -av docs/.vitepress/dist/ root@lxc:/var/www/opendray-docs/`
3. Serve with nginx; expose via your existing Cloudflare Tunnel.
4. Add a low-priority DNS record so the mirror picks up traffic when
   Pages is down.

This is **not** wired up by default — Cloudflare Pages has good
uptime and a global anycast network, so the primary deploy is enough
for most cases.
