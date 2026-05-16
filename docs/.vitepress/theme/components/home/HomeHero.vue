<template>
  <section class="od-hero">
    <div class="od-hero__bg" aria-hidden="true">
      <div class="od-hero__blob od-hero__blob--purple" />
      <div class="od-hero__blob od-hero__blob--sky" />
      <div class="od-hero__grid" />
    </div>

    <div class="od-hero__inner">
      <div class="od-hero__copy">
        <div class="od-hero__pill">
          <span class="od-hero__pill-dot" /> {{ t.tag }}
        </div>
        <h1 class="od-hero__title">
          <span class="od-hero__title-line">{{ t.titleA }}</span>
          <span class="od-hero__title-line od-hero__title-line--gradient">
            {{ t.titleB }}
          </span>
        </h1>
        <p class="od-hero__sub">{{ t.sub }}</p>
        <div class="od-hero__cta">
          <a class="od-hero__btn od-hero__btn--primary" :href="links.start">
            {{ t.start }}
            <span class="od-hero__btn-arrow">→</span>
          </a>
          <a class="od-hero__btn od-hero__btn--alt" :href="links.gh"
             target="_blank" rel="noopener">
            <span class="od-hero__btn-glyph">★</span>
            {{ t.github }}
          </a>
        </div>
        <div class="od-hero__meta">
          <span class="od-hero__meta-item">
            <span class="od-hero__meta-glyph">⌘</span>
            <code>curl -fsSL get.opendray.dev | sh</code>
          </span>
          <span class="od-hero__meta-sep">·</span>
          <span class="od-hero__meta-item">{{ t.license }}</span>
        </div>
      </div>

      <div class="od-hero__visual">
        <div class="od-hero__panel od-hero__panel--term">
          <div class="od-hero__chrome">
            <span class="od-hero__dot od-hero__dot--r" />
            <span class="od-hero__dot od-hero__dot--y" />
            <span class="od-hero__dot od-hero__dot--g" />
            <div class="od-hero__chrome-title">opendray · session-42</div>
          </div>
          <div class="od-hero__term-body">
            <div class="od-hero__line">
              <span class="od-hero__prompt">$</span>
              <span class="od-hero__cmd">opendray spawn claude --cwd ~/proj</span>
            </div>
            <div class="od-hero__line od-hero__line--out">
              <span class="od-hero__check">✓</span>
              <span>session <b>s_42</b> attached · pty 88×24 · provider <b>claude</b></span>
            </div>
            <div class="od-hero__line">
              <span class="od-hero__prompt">›</span>
              <span class="od-hero__user">{{ t.userMsg }}</span>
            </div>
            <div class="od-hero__line od-hero__line--ai">
              <span class="od-hero__ai-pill">claude</span>
              <span>{{ t.aiMsg }}<span class="od-hero__cursor"/></span>
            </div>
          </div>
        </div>

        <div class="od-hero__panel od-hero__panel--msg">
          <div class="od-hero__msg-head">
            <div class="od-hero__msg-avatar">
              <img src="/channel-icons/telegram.svg"
                   alt="Telegram" width="32" height="32" />
            </div>
            <div>
              <div class="od-hero__msg-name">Telegram · @opendray_bot</div>
              <div class="od-hero__msg-time">just now</div>
            </div>
          </div>
          <div class="od-hero__msg-body">
            <div class="od-hero__msg-from">[s_42] {{ t.notifTitle }}</div>
            <div class="od-hero__msg-content">{{ t.notifBody }}</div>
            <div class="od-hero__msg-buttons">
              <span class="od-hero__msg-btn">{{ t.btnApprove }}</span>
              <span class="od-hero__msg-btn">{{ t.btnDeny }}</span>
              <span class="od-hero__msg-btn">{{ t.btnOpen }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { lang } = useData()
const isZh = computed(() => lang.value?.startsWith('zh'))

const t = computed(() => isZh.value ? {
  tag: '开源 · 自托管 · 多平台',
  titleA: '把 AI 编程 CLI',
  titleB: '装进任何聊天里。',
  sub: '在服务器上运行 Claude Code、Codex、Gemini CLI,从 Telegram、Slack、Discord、飞书、钉钉、企业微信回复 —— 整套自托管,不出内网。',
  start: '开始使用',
  github: 'GitHub',
  license: 'MIT 许可',
  userMsg: '帮我把这个文件的测试补全',
  aiMsg: '好的,我先扫描 src/auth/login.ts 的导出 ',
  notifTitle: '会话需要确认',
  notifBody: 'Claude 想要执行 `npm install playwright` —— 是否允许?',
  btnApprove: '✓ 允许',
  btnDeny: '✗ 拒绝',
  btnOpen: '🌐 打开',
} : {
  tag: 'Open source · Self-hosted · Multi-platform',
  titleA: 'Bring AI coding CLIs',
  titleB: 'into any chat app.',
  sub: 'Run Claude Code, Codex, and Gemini CLI on your own server. Reply from Telegram, Slack, Discord, Feishu, DingTalk, or WeCom. Fully self-hosted — your code never leaves your network.',
  start: 'Get started',
  github: 'GitHub',
  license: 'MIT licensed',
  userMsg: 'add tests to login.ts',
  aiMsg: 'Reading exports from src/auth/login.ts ',
  notifTitle: 'Session needs confirmation',
  notifBody: 'Claude wants to run `npm install playwright` — allow?',
  btnApprove: '✓ Approve',
  btnDeny: '✗ Deny',
  btnOpen: '🌐 Open',
})

const links = computed(() => ({
  start: isZh.value
    ? '/zh/getting-started/welcome'
    : '/getting-started/welcome',
  gh: 'https://github.com/opendray/opendray',
}))
</script>

<style scoped>
.od-hero {
  position: relative;
  padding: 96px 24px 80px;
  overflow: hidden;
  isolation: isolate;
}

.od-hero__bg {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
}

.od-hero__blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(96px);
  opacity: 0.55;
}

.od-hero__blob--purple {
  width: 540px;
  height: 540px;
  top: -160px;
  left: -120px;
  background: radial-gradient(circle, #b896ff, transparent 70%);
}

.od-hero__blob--sky {
  width: 480px;
  height: 480px;
  top: -100px;
  right: -120px;
  background: radial-gradient(circle, #47bfff, transparent 70%);
}

.dark .od-hero__blob {
  opacity: 0.35;
}

.od-hero__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(126, 20, 255, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(126, 20, 255, 0.06) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, #000 30%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, #000 30%, transparent 75%);
}

.dark .od-hero__grid {
  background-image:
    linear-gradient(rgba(184, 150, 255, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(184, 150, 255, 0.07) 1px, transparent 1px);
}

.od-hero__inner {
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 64px;
  align-items: center;
}

@media (max-width: 960px) {
  .od-hero__inner {
    grid-template-columns: 1fr;
    gap: 48px;
  }
  .od-hero { padding: 60px 20px 60px; }
}

.od-hero__copy { max-width: 580px; }

.od-hero__pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px 6px 12px;
  border-radius: 999px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--vp-c-text-2);
  margin-bottom: 24px;
}

.od-hero__pill-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.18);
  animation: od-pulse 2s ease-in-out infinite;
}

@keyframes od-pulse {
  50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
}

.od-hero__title {
  margin: 0 0 18px;
  font-size: clamp(40px, 6vw, 64px);
  line-height: 1.05;
  font-weight: 800;
  letter-spacing: -0.035em;
  color: var(--vp-c-text-1);
}

.od-hero__title-line {
  display: block;
}

.od-hero__title-line--gradient {
  background: linear-gradient(
    120deg,
    var(--od-purple-600) 0%,
    var(--od-sky-500) 60%,
    var(--od-purple-500) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark .od-hero__title-line--gradient {
  background: linear-gradient(
    120deg,
    #b896ff 0%,
    var(--od-sky-400) 60%,
    #d6c2ff 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.od-hero__sub {
  margin: 0 0 32px;
  font-size: 17.5px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  letter-spacing: -0.005em;
}

.od-hero__cta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 28px;
}

.od-hero__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  border-radius: 12px;
  font-size: 14.5px;
  font-weight: 600;
  letter-spacing: -0.005em;
  text-decoration: none;
  transition: all 0.18s ease;
  border: 1px solid transparent;
}

.od-hero__btn--primary {
  background: var(--od-purple-600);
  color: #fff;
  box-shadow:
    0 1px 2px rgba(126, 20, 255, 0.2),
    0 8px 22px -8px rgba(126, 20, 255, 0.55);
}

.od-hero__btn--primary:hover {
  background: var(--od-purple-700);
  transform: translateY(-1px);
  box-shadow:
    0 1px 2px rgba(126, 20, 255, 0.24),
    0 12px 28px -10px rgba(126, 20, 255, 0.6);
}

.od-hero__btn--alt {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-divider);
}

.od-hero__btn--alt:hover {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-brand-2);
}

.od-hero__btn-arrow {
  transition: transform 0.18s ease;
}

.od-hero__btn:hover .od-hero__btn-arrow {
  transform: translateX(3px);
}

.od-hero__btn-glyph {
  font-size: 14px;
  color: #f59e0b;
}

.od-hero__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12.5px;
  color: var(--vp-c-text-3);
}

.od-hero__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.od-hero__meta-glyph {
  font-size: 11px;
  opacity: 0.7;
}

.od-hero__meta code {
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 5px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
}

.od-hero__meta-sep {
  opacity: 0.4;
}

/* ---------- visual side ---------- */
.od-hero__visual {
  position: relative;
  min-height: 360px;
}

.od-hero__panel {
  border-radius: 14px;
  background: var(--vp-c-bg);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.06),
    0 18px 48px -16px rgba(126, 20, 255, 0.34),
    0 8px 24px -10px rgba(0, 0, 0, 0.18);
  border: 1px solid var(--vp-c-divider);
  overflow: hidden;
}

.dark .od-hero__panel {
  background: #0f1230;
  border-color: rgba(184, 150, 255, 0.18);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.4),
    0 28px 70px -16px rgba(126, 20, 255, 0.42);
}

.od-hero__panel--term {
  background: #0d0e1a;
  border-color: rgba(126, 20, 255, 0.22);
  font-family: var(--vp-font-family-mono);
}

.od-hero__chrome {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 14px;
  gap: 6px;
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.od-hero__dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
}
.od-hero__dot--r { background: #ff5f57; }
.od-hero__dot--y { background: #febc2e; }
.od-hero__dot--g { background: #28c840; }

.od-hero__chrome-title {
  flex: 1;
  text-align: center;
  font-size: 11.5px;
  font-family: var(--vp-font-family-base);
  color: rgba(255, 255, 255, 0.5);
}

.od-hero__term-body {
  padding: 18px 18px 22px;
  font-size: 13px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.74);
}

.od-hero__line {
  display: flex;
  gap: 8px;
}

.od-hero__line--out { color: #cbd5e1; }
.od-hero__line--ai { color: #ede6ff; }

.od-hero__prompt { color: #b896ff; font-weight: 700; width: 14px; }
.od-hero__check { color: #4ade80; font-weight: 700; width: 14px; }
.od-hero__cmd { color: #ffffff; }
.od-hero__user { color: #ffffff; font-style: italic; }

.od-hero__ai-pill {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 7px;
  margin-right: 4px;
  border-radius: 5px;
  background: linear-gradient(135deg, #863bff, #47bfff);
  color: #fff;
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex-shrink: 0;
  margin-top: 2px;
}

.od-hero__cursor {
  display: inline-block;
  width: 7px;
  height: 14px;
  background: #b896ff;
  margin-left: 2px;
  vertical-align: middle;
  animation: od-term-blink 1.1s steps(2, jump-none) infinite;
}

@keyframes od-term-blink {
  50% { opacity: 0; }
}

/* ---------- floating message panel ---------- */
.od-hero__panel--msg {
  position: absolute;
  width: 78%;
  bottom: -28px;
  right: -12px;
  padding: 14px 16px 16px;
  background: var(--vp-c-bg);
  z-index: 2;
  transform: rotate(-1.5deg);
}

.dark .od-hero__panel--msg {
  background: #0f1230;
}

.od-hero__msg-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.od-hero__msg-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px;
  flex-shrink: 0;
}

.dark .od-hero__msg-avatar {
  background: rgba(255, 255, 255, 0.06);
}

.od-hero__msg-avatar img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.od-hero__msg-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.od-hero__msg-time {
  font-size: 11px;
  color: var(--vp-c-text-3);
}

.od-hero__msg-from {
  font-size: 12px;
  font-weight: 700;
  color: var(--od-purple-600);
  margin-bottom: 4px;
  font-family: var(--vp-font-family-mono);
}

.dark .od-hero__msg-from { color: #b896ff; }

.od-hero__msg-content {
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--vp-c-text-1);
  margin-bottom: 10px;
}

.od-hero__msg-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.od-hero__msg-btn {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  font-size: 11.5px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

@media (max-width: 960px) {
  .od-hero__panel--msg {
    position: relative;
    width: 100%;
    bottom: auto;
    right: auto;
    margin-top: 18px;
    transform: none;
  }
}
</style>
