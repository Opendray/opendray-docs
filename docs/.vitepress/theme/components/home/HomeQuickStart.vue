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
  eyebrow: '60 秒上手',
  title: '一行命令,跑起来。',
  sub: '不需要 Docker compose 文件,不需要 K8s manifest。一条 shell 命令就能拉起一个全功能 opendray 实例。',
  copy: '复制', copied: '已复制',
  step1Title: '安装', step1Text: '一行 install 脚本',
  step2Title: '启动', step2Text: 'opendray run 起服务',
  step3Title: '接入频道', step3Text: '在 UI 里贴 token',
} : {
  eyebrow: 'Up in 60 seconds',
  title: 'One command. Done.',
  sub: 'No docker-compose to write. No K8s manifests to chew through. One shell command and you have a full opendray instance.',
  copy: 'Copy', copied: 'Copied',
  step1Title: 'Install', step1Text: 'one-line installer',
  step2Title: 'Start', step2Text: 'opendray run',
  step3Title: 'Wire a channel', step3Text: 'paste tokens in UI',
})

const options = computed(() => [
  {
    id: 'sh', icon: '⚡',
    label: 'curl', file: 'install.sh',
    cmd: `# Install opendray (linux / macos)
curl -fsSL https://get.opendray.dev | sh

# Start the server (defaults to :8651)
opendray run

# Open the admin in your browser
open http://localhost:8651`,
  },
  {
    id: 'docker', icon: '🐳',
    label: 'Docker', file: 'docker-run',
    cmd: `# Pull and run (data persists in ./opendray-data)
docker run -d \\
  --name opendray \\
  -p 8651:8651 \\
  -v $PWD/opendray-data:/data \\
  ghcr.io/opendray/opendray:latest

# Tail logs
docker logs -f opendray`,
  },
  {
    id: 'lxc', icon: '📦',
    label: 'LXC / VM', file: 'install.sh',
    cmd: `# Inside a fresh Debian/Ubuntu LXC or VM
apt-get update && apt-get install -y curl
curl -fsSL https://get.opendray.dev | sh

# Optional: persist as a systemd service
opendray service install
systemctl enable --now opendray`,
  },
  {
    id: 'src', icon: '🛠️',
    label: 'From source', file: 'build',
    cmd: `# Requires Go 1.22+ and pnpm
git clone https://github.com/opendray/opendray
cd opendray

make build      # → ./bin/opendray
./bin/opendray run`,
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
