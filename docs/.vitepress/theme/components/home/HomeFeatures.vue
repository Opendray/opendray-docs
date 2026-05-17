<template>
  <section class="od-ft">
    <div class="od-ft__inner">
      <div class="od-ft__head">
        <div class="od-ft__eyebrow">{{ t.eyebrow }}</div>
        <h2 class="od-ft__title">{{ t.title }}</h2>
        <p class="od-ft__sub">{{ t.sub }}</p>
      </div>

      <div class="od-ft__grid">
        <FeatureCard
          v-for="f in features"
          :key="f.title"
          :icon="f.icon"
          :title="f.title"
          :details="f.details"
          :hue="f.hue"
          :href="f.href"
          :badge="f.badge"
        />
      </div>

      <div class="od-ft__sub-block">
        <div class="od-ft__sub-label">{{ t.infraLabel }}</div>
        <div class="od-ft__sub-grid">
          <a
            v-for="i in infra"
            :key="i.title"
            class="od-ft__sub-card"
            :href="i.href"
          >
            <span class="od-ft__sub-icon">{{ i.icon }}</span>
            <div class="od-ft__sub-body">
              <div class="od-ft__sub-title">{{ i.title }}</div>
              <div class="od-ft__sub-text">{{ i.text }}</div>
            </div>
            <span class="od-ft__sub-arrow">→</span>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import FeatureCard from '../FeatureCard.vue'

const { lang } = useData()
const isZh = computed(() => lang.value?.startsWith('zh'))

const t = computed(() => isZh.value ? {
  eyebrow: '能力清单',
  title: '它做的六件事 —— 按 design.md 里的 VP 优先级排。',
  sub: '不是 feature 堆砌,而是按 maintainer 自己在 design.md §3 排好的 value proposition 顺序。前 6 张是核心,下面那一排是配套的基础设施。',
  infraLabel: '配套的基础设施(让它像"完整产品")',
} : {
  eyebrow: 'Capabilities',
  title: 'The six things it does — in design.md priority order.',
  sub: 'Not a feature dump — the order mirrors the value-proposition list in design.md §3. The six cards are the core. The strip beneath is the supporting infrastructure that makes it feel like a product, not a side project.',
  infraLabel: 'Supporting infrastructure (makes it feel like a product)',
})

const features = computed(() => isZh.value ? [
  {
    icon: '📡', hue: 'sky' as const,
    title: 'VP #1 · 无处不在的 CLI 控制',
    href: '/zh/sessions/overview',
    details: 'Web 后台 + iOS / Android Flutter app + REST/WS API,同一个 PTY 会话可被多端同时观看。1 MB ring buffer 滚屏,断线即重连。手机不再是"凑合看",是完整控制器。',
  },
  {
    icon: '💰', hue: 'green' as const,
    title: 'VP #2 · 订阅成本套利',
    href: '/zh/consuming/overview',
    details: '一份 Claude Pro $20/mo 服务你的所有项目。pettracker / materialscout / shoponline / 下一个 app 都注册成集成,共享同一份订阅,各自有 scope key + 独立 audit 记录。',
  },
  {
    icon: '🧠', hue: 'purple' as const,
    title: 'VP #3 · 多 CLI + 跨 CLI 记忆',
    href: '/zh/memory/overview',
    badge: 'NEW',
    details: 'Claude Code / Codex / Gemini 并行跑,project 记忆三家共享。BM25 默认,Ollama / ONNX 可选;auto-capture 自动写,summarizer worker 后台浓缩,冲突自动检测。',
  },
  {
    icon: '🔌', hue: 'pink' as const,
    title: 'VP #4 · 集成生态',
    href: '/zh/consuming/overview',
    details: '/api/v1/proxy/<prefix>/* 反向代理 + scope 限权 API key + 30s 健康探活 + 调用审计。你写的应用注册即用,不污染 opendray 本体代码。',
  },
  {
    icon: '💬', hue: 'amber' as const,
    title: 'VP #5 · 异步消息驱动',
    href: '/zh/channels/overview',
    details: 'Telegram / Slack / Discord / 飞书 / 钉钉 / 企业微信 / 微信 / bridge —— 8 个 channel 全在 internal/channel/<name>/ 真实实现。回复就是 stdin,卡片 + 按钮 + 签名都正确处理。',
  },
  {
    icon: '🛰', hue: 'purple' as const,
    title: 'VP #6 · 完整远程开发循环',
    href: '/zh/sessions/overview',
    details: '会话 inspector + child sessions、Files / Git / Notes 联动、加密备份、笔记 vault、xterm.js 终端(支持中文 IME / 滚屏 / live resize)、Skills + MCP 注册表。',
  },
] : [
  {
    icon: '📡', hue: 'sky' as const,
    title: 'VP #1 · Ubiquitous CLI control',
    href: '/sessions/overview',
    details: 'Web admin + native iOS / Android (Flutter) + REST/WS API. The same PTY session is watchable from multiple clients in parallel. 1 MB ring buffer, instant reconnect. Mobile is a real controller, not a peephole.',
  },
  {
    icon: '💰', hue: 'green' as const,
    title: 'VP #2 · Subscription cost arbitrage',
    href: '/consuming/overview',
    details: 'One Claude Pro at $20/mo serves every project you own. pettracker / materialscout / shoponline / next-project register as integrations, share the subscription, each with scoped keys and independent audit trail.',
  },
  {
    icon: '🧠', hue: 'purple' as const,
    title: 'VP #3 · Multi-CLI + cross-CLI memory',
    href: '/memory/overview',
    badge: 'NEW',
    details: 'Claude Code / Codex / Gemini in parallel; project memory shared by all three. BM25 by default, Ollama / ONNX optional. Auto-capture writes, summarizer workers compact in the background, conflicts auto-detected.',
  },
  {
    icon: '🔌', hue: 'pink' as const,
    title: 'VP #4 · Integration ecosystem',
    href: '/consuming/overview',
    details: 'Reverse-proxy at /api/v1/proxy/<prefix>/* + scoped API keys + 30s health probes + call audit. The apps you write register and consume without polluting the opendray codebase.',
  },
  {
    icon: '💬', hue: 'amber' as const,
    title: 'VP #5 · Async messaging workflow',
    href: '/channels/overview',
    details: 'Telegram / Slack / Discord / Feishu / DingTalk / WeCom / WeChat / bridge — all 8 channels are real Go code under internal/channel/<name>/. Replies become stdin; cards, buttons, and signing all handled correctly.',
  },
  {
    icon: '🛰', hue: 'purple' as const,
    title: 'VP #6 · Full remote dev loop',
    href: '/sessions/overview',
    details: 'Session inspector + child sessions, Files / Git / Notes integration, encrypted backup, notes vault, xterm.js terminal (CJK IME / scrollback / live resize), Skills + MCP registry.',
  },
])

const infra = computed(() => isZh.value ? [
  { icon: '📓', title: '笔记 vault', href: '/zh/notes/overview',
    text: 'Obsidian 兼容 · wiki link · git sync · AI 共用知识库' },
  { icon: '💾', title: '加密备份', href: '/zh/backup/overview',
    text: '本地 + 云目标 · pg_dump + AES-GCM 加密 · 一键 restore' },
  { icon: '🧩', title: 'Skills + MCP 注册表', href: '/zh/plugins/overview',
    text: 'opendray notes / skill / mcp 命令 · 不 fork 就能扩展' },
  { icon: '🖥️', title: '完整终端体验', href: '/zh/sessions/overview',
    text: 'xterm.js · CJK IME · 1 MB scrollback · live resize' },
  { icon: '📡', title: '事件总线 + Activity', href: '/zh/activity/overview',
    text: 'session / channel / memory / notification 全部进 bus · 实时尾随' },
  { icon: '📱', title: '多端访问', href: '/zh/getting-started/welcome',
    text: 'Web admin · iOS · Android · REST/WS API' },
] : [
  { icon: '📓', title: 'Notes vault', href: '/notes/overview',
    text: 'Obsidian-compatible · wiki links · git sync · shared with the AI' },
  { icon: '💾', title: 'Encrypted backup', href: '/backup/overview',
    text: 'Local + cloud targets · pg_dump + AES-GCM · one-click restore' },
  { icon: '🧩', title: 'Skills + MCP registry', href: '/plugins/overview',
    text: 'opendray notes / skill / mcp commands · extend without forking' },
  { icon: '🖥️', title: 'Full terminal UX', href: '/sessions/overview',
    text: 'xterm.js · CJK IME · 1 MB scrollback · live resize' },
  { icon: '📡', title: 'Event bus + Activity tail', href: '/activity/overview',
    text: 'session / channel / memory / notification all on the bus · tail live' },
  { icon: '📱', title: 'Multi-device clients', href: '/getting-started/welcome',
    text: 'Web admin · iOS · Android · REST/WS API' },
])
</script>

<style scoped>
.od-ft {
  padding: 80px 24px;
}

.od-ft__inner {
  max-width: 1280px;
  margin: 0 auto;
}

.od-ft__head { text-align: center; margin-bottom: 48px; }

.od-ft__eyebrow {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
  margin-bottom: 14px;
}

.od-ft__title {
  margin: 0 0 14px;
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 800;
  letter-spacing: -0.025em;
  color: var(--vp-c-text-1);
  border: 0 !important; padding-top: 0 !important; margin-top: 0 !important;
}

.od-ft__sub {
  max-width: 700px;
  margin: 0 auto;
  font-size: 16px;
  line-height: 1.65;
  color: var(--vp-c-text-2);
}

.od-ft__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

@media (max-width: 980px) {
  .od-ft__grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 600px) {
  .od-ft__grid { grid-template-columns: 1fr; }
}

.od-ft__sub-block {
  margin-top: 60px;
  padding-top: 36px;
  border-top: 1px dashed var(--vp-c-divider);
}

.od-ft__sub-label {
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
  margin-bottom: 24px;
}

.od-ft__sub-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

@media (max-width: 880px) {
  .od-ft__sub-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 540px) {
  .od-ft__sub-grid { grid-template-columns: 1fr; }
}

.od-ft__sub-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  text-decoration: none !important;
  color: inherit;
  transition: all 0.18s ease;
}

.od-ft__sub-card:hover {
  border-color: var(--vp-c-brand-2);
  background: var(--vp-c-bg);
}

.od-ft__sub-icon {
  font-size: 18px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(126, 20, 255, 0.08);
  border-radius: 8px;
}

.od-ft__sub-body { flex: 1; min-width: 0; }

.od-ft__sub-title {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  letter-spacing: -0.005em;
  margin-bottom: 2px;
}

.od-ft__sub-text {
  font-size: 12.5px;
  line-height: 1.45;
  color: var(--vp-c-text-3);
}

.od-ft__sub-arrow {
  font-size: 14px;
  color: var(--vp-c-text-3);
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.18s ease;
  flex-shrink: 0;
}

.od-ft__sub-card:hover .od-ft__sub-arrow {
  opacity: 1;
  transform: translateX(0);
  color: var(--vp-c-brand-1);
}
</style>
