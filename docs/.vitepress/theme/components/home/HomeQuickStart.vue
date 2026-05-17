<template>
  <section class="od-qs">
    <div class="od-qs__inner">
      <div class="od-qs__head">
        <div class="od-qs__eyebrow">{{ t.eyebrow }}</div>
        <h2 class="od-qs__title">{{ t.title }}</h2>
        <p class="od-qs__sub">{{ t.sub }}</p>
      </div>

      <div class="od-qs__body">
        <div class="od-qs__tabs" role="tablist">
          <button
            v-for="(o, i) in options"
            :key="o.id"
            :class="['od-qs__tab', { 'is-active': active === i }]"
            @click="active = i"
          >
            <span class="od-qs__tab-icon">{{ o.icon }}</span>
            {{ o.label }}
          </button>
        </div>
        <div class="od-qs__panel">
          <div class="od-qs__panel-head">
            <span class="od-qs__panel-file">{{ options[active].file }}</span>
            <button
              class="od-qs__copy"
              :class="{ copied }"
              @click="copy(options[active].cmd)"
            >
              <span v-if="!copied">📋 {{ t.copy }}</span>
              <span v-else>✓ {{ t.copied }}</span>
            </button>
          </div>
          <pre class="od-qs__code"><code>{{ options[active].cmd }}</code></pre>
        </div>

        <div class="od-qs__steps">
          <div class="od-qs__step">
            <div class="od-qs__step-num">1</div>
            <div>
              <div class="od-qs__step-title">{{ t.step1Title }}</div>
              <div class="od-qs__step-text">{{ t.step1Text }}</div>
            </div>
          </div>
          <div class="od-qs__step-arrow">→</div>
          <div class="od-qs__step">
            <div class="od-qs__step-num">2</div>
            <div>
              <div class="od-qs__step-title">{{ t.step2Title }}</div>
              <div class="od-qs__step-text">{{ t.step2Text }}</div>
            </div>
          </div>
          <div class="od-qs__step-arrow">→</div>
          <div class="od-qs__step">
            <div class="od-qs__step-num">3</div>
            <div>
              <div class="od-qs__step-title">{{ t.step3Title }}</div>
              <div class="od-qs__step-text">{{ t.step3Text }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useData } from 'vitepress'

const { lang } = useData()
const isZh = computed(() => lang.value?.startsWith('zh'))

const t = computed(() => isZh.value ? {
  eyebrow: '5 分钟跑起来',
  title: '克隆 → 起 DB → 跑 → 访问后台。',
  sub: 'opendray v1.0 是一个 Go 二进制(内嵌 web bundle)+ 一个外置 Postgres。下面四种部署路径都有真实命令,默认端口 8770,后台在 /admin/。',
  copy: '复制', copied: '已复制',
  step1Title: '起 DB', step1Text: 'docker compose 起本地 Postgres',
  step2Title: '配置', step2Text: 'cp config.example.toml',
  step3Title: '跑起来', step3Text: 'opendray serve → :8770/admin/',
} : {
  eyebrow: 'Running in 5 minutes',
  title: 'Clone → DB → run → open the admin.',
  sub: 'opendray v1.0 ships as a single Go binary (with the web bundle embedded) plus an external Postgres. Four real deployment paths below — default port 8770, admin lives at /admin/.',
  copy: 'Copy', copied: 'Copied',
  step1Title: 'Start DB', step1Text: 'docker compose for local Postgres',
  step2Title: 'Configure', step2Text: 'cp config.example.toml',
  step3Title: 'Run it', step3Text: 'opendray serve → :8770/admin/',
})

const options = computed(() => [
  {
    id: 'src', icon: '🛠️',
    label: 'From source', file: '~/opendray-v2 $',
    cmd: `# Real 5-min path from docs/quickstart.md
git clone https://github.com/Opendray/opendray_v2.git
cd opendray_v2

# 1. Start the bundled Postgres
docker compose -f docker-compose.test.yml up -d

# 2. Local config (gitignored — set [admin].password)
cp config.example.toml config.toml

# 3. Build the web bundle so the binary embeds it
cd app/web && pnpm install --frozen-lockfile && pnpm build && cd ../..

# 4. Apply schema (idempotent)
go run ./cmd/opendray migrate -config config.toml

# 5. Run the gateway
go run ./cmd/opendray serve -config config.toml
# → REST + WS :  http://127.0.0.1:8770/api/v1/...
# → Web admin :  http://127.0.0.1:8770/admin/`,
  },
  {
    id: 'docker', icon: '🐳',
    label: 'Docker (built locally)', file: '~/opendray-v2 $',
    cmd: `# Build the image (multi-stage: web + go + distroless runtime)
git clone https://github.com/Opendray/opendray_v2.git && cd opendray_v2
docker build -t opendray:v1 .

# Bring your own Postgres (any v15+, vector ext optional)
docker run -d --name opendray-pg \\
  -e POSTGRES_USER=opendray -e POSTGRES_PASSWORD=opendray \\
  -e POSTGRES_DB=opendray -p 127.0.0.1:5432:5432 \\
  postgres:17-alpine

# Run opendray pointing at it
docker run -d --name opendray -p 8770:8770 \\
  -e OPENDRAY_DATABASE_URL='postgres://opendray:opendray@host.docker.internal:5432/opendray?sslmode=disable' \\
  -e OPENDRAY_ADMIN_PASSWORD='change-me' \\
  opendray:v1 serve

# Tail
docker logs -f opendray`,
  },
  {
    id: 'lxc', icon: '📦',
    label: 'LXC (Proxmox)', file: 'pct exec',
    cmd: `# Inside a fresh Debian 12 / Ubuntu 24.04 LXC
apt update && apt install -y postgresql-17 git golang-1.25 nodejs npm
corepack enable && corepack prepare pnpm@10 --activate

# Build + install
git clone https://github.com/Opendray/opendray_v2.git /opt/opendray
cd /opt/opendray
make build       # → ./bin/opendray (or 'go build ./cmd/opendray')

# Configure (edit DB URL + admin password)
cp config.example.toml /etc/opendray/config.toml

# Systemd service template lives at deploy/systemd/opendray.service
cp deploy/systemd/opendray.service /etc/systemd/system/
systemctl enable --now opendray
journalctl -fu opendray`,
  },
  {
    id: 'backup', icon: '🔐',
    label: 'Add encrypted backup', file: 'env',
    cmd: `# Optional: enable encrypted DB dumps + zip-bundle exports
# (Backups page appears in the admin sidebar.)

# Master passphrase — env only, never write into config.toml
export OPENDRAY_BACKUP_KEY="$(openssl rand -base64 32)"
export OPENDRAY_BACKUP_ENABLED=1

# pg_dump / pg_restore must match the server's major version. On
# Apple Silicon dev pointing at a PG17 server:
export OPENDRAY_BACKUP_PG_DUMP_PATH=/opt/homebrew/opt/postgresql@17/bin/pg_dump
export OPENDRAY_BACKUP_PG_RESTORE_PATH=/opt/homebrew/opt/postgresql@17/bin/pg_restore

# Restart opendray — Backups (/backups) + Exports (/export) light up.`,
  },
])

const active = ref(0)
const copied = ref(false)

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => (copied.value = false), 1600)
  } catch {
    /* clipboard blocked — silently ignore */
  }
}
</script>

<style scoped>
.od-qs {
  padding: 80px 24px;
  background:
    linear-gradient(180deg, transparent 0%, var(--vp-c-bg-alt) 50%, transparent 100%);
}

.od-qs__inner {
  max-width: 1080px;
  margin: 0 auto;
}

.od-qs__head { text-align: center; margin-bottom: 48px; }

.od-qs__eyebrow {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
  margin-bottom: 14px;
}

.od-qs__title {
  margin: 0 0 14px;
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 800;
  letter-spacing: -0.025em;
  color: var(--vp-c-text-1);
  border: 0 !important; padding-top: 0 !important; margin-top: 0 !important;
}

.od-qs__sub {
  max-width: 580px;
  margin: 0 auto;
  font-size: 16px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.od-qs__body {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  overflow: hidden;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 18px 50px -22px rgba(126, 20, 255, 0.18);
}

.dark .od-qs__body {
  background: var(--vp-c-bg-soft);
}

.od-qs__tabs {
  display: flex;
  gap: 0;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
  overflow-x: auto;
  scrollbar-width: none;
}

.od-qs__tabs::-webkit-scrollbar { display: none; }

.od-qs__tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 22px;
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: -0.005em;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.16s ease;
  white-space: nowrap;
}

.od-qs__tab:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
}

.od-qs__tab.is-active {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg);
}

.od-qs__tab-icon {
  font-size: 14px;
}

.od-qs__panel {
  background: #0d0e1a;
  font-family: var(--vp-font-family-mono);
}

.od-qs__panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.od-qs__panel-file {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.02em;
}

.od-qs__copy {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 7px;
  font-size: 11.5px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  transition: all 0.16s ease;
}

.od-qs__copy:hover {
  background: rgba(126, 20, 255, 0.22);
  border-color: rgba(184, 150, 255, 0.4);
}

.od-qs__copy.copied {
  background: rgba(16, 185, 129, 0.22);
  border-color: rgba(110, 231, 183, 0.4);
  color: #d1fae5;
}

.od-qs__code {
  margin: 0;
  padding: 18px 22px 22px;
  background: transparent;
  font-size: 13px;
  line-height: 1.75;
  color: #e2e8f0;
  overflow-x: auto;
  white-space: pre;
}

.od-qs__steps {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 22px;
  background: var(--vp-c-bg-soft);
  border-top: 1px solid var(--vp-c-divider);
  flex-wrap: wrap;
}

.od-qs__step {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.od-qs__step-num {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--od-purple-500), var(--od-sky-500));
  color: #fff;
  font-size: 12.5px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.od-qs__step-title {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  letter-spacing: -0.005em;
}

.od-qs__step-text {
  font-size: 12.5px;
  color: var(--vp-c-text-3);
  margin-top: 2px;
}

.od-qs__step-arrow {
  font-size: 16px;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}

@media (max-width: 720px) {
  .od-qs__steps { flex-direction: column; align-items: flex-start; }
  .od-qs__step-arrow { display: none; }
  .od-qs__step { width: 100%; }
}
</style>
