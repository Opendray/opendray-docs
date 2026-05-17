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
        <div class="od-hero__chips">
          <span class="od-hero__chip">
            <span class="od-hero__chip-glyph">🌐</span> {{ t.chip1 }}
          </span>
          <span class="od-hero__chip">
            <span class="od-hero__chip-glyph">🧠</span> {{ t.chip2 }}
          </span>
          <span class="od-hero__chip">
            <span class="od-hero__chip-glyph">🔌</span> {{ t.chip3 }}
          </span>
        </div>
      </div>

      <!--
        Visual is now driven by REAL admin screenshots from
        docs/public/tutorial/* (the same files used throughout the doc
        pages). We frame each in a Mac-style browser chrome so it
        clearly reads as "this is the actual product", not a mockup.
      -->
      <div class="od-hero__visual">
        <!-- Main: real Sessions page (PDA / Claude Code session) -->
        <figure class="od-shot od-shot--main">
          <div class="od-shot__chrome">
            <span class="od-shot__dot od-shot__dot--r" />
            <span class="od-shot__dot od-shot__dot--y" />
            <span class="od-shot__dot od-shot__dot--g" />
            <div class="od-shot__addr">
              <span class="od-shot__addr-lock">🔒</span>
              opendray.local <span class="od-shot__addr-path">/sessions</span>
            </div>
            <div class="od-shot__live">
              <span class="od-shot__live-dot" /> {{ t.live }}
            </div>
          </div>
          <div class="od-shot__media">
            <img
              src="/tutorial/sessions-layout.png"
              :alt="t.altMain"
              width="1440" height="900"
              loading="eager"
              decoding="async"
            />
          </div>
          <figcaption class="od-shot__cap">{{ t.capMain }}</figcaption>
        </figure>

        <!-- Floating: real Channels-picker showing 8 platforms in the actual UI -->
        <figure class="od-shot od-shot--float">
          <div class="od-shot__chrome od-shot__chrome--mini">
            <span class="od-shot__dot od-shot__dot--r" />
            <span class="od-shot__dot od-shot__dot--y" />
            <span class="od-shot__dot od-shot__dot--g" />
            <div class="od-shot__addr od-shot__addr--mini">
              {{ t.regCh }}
            </div>
          </div>
          <div class="od-shot__media">
            <img
              src="/tutorial/channels-kind-picker.png"
              :alt="t.altFloat"
              width="720" height="900"
              loading="lazy"
              decoding="async"
            />
          </div>
          <figcaption class="od-shot__cap od-shot__cap--small">
            {{ t.capFloat }}
          </figcaption>
        </figure>
      </div>
    </div>

    <div class="od-hero__caption">
      <span class="od-hero__caption-arrow">↑</span>
      <span class="od-hero__caption-text">{{ t.captionA }}</span>
      <span class="od-hero__caption-sep">·</span>
      <span class="od-hero__caption-text od-hero__caption-text--mute">
        {{ t.captionB }}
      </span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { lang } = useData()
const isZh = computed(() => lang.value?.startsWith('zh'))

const t = computed(() => isZh.value ? {
  tag: 'v1.0 已稳定 · 单 Go 二进制 · MIT',

  // Mission 一句话(design.md §1):"Let an AI agent CLI follow me
  // wherever I am, and let any app I build use it." 中文译法:
  titleA: '让 AI 编程 CLI 跟着你走 ——',
  titleB: '你写的所有应用,都能调用它。',

  sub: '一台 opendray 实例 wrap 本机的 Claude Code / Codex / Gemini / 任意 shell,通过 REST + WebSocket 暴露出去。后台 / 手机 / 你的其他 app 都接同一个网关 —— 一份 Claude Pro 订阅,服务你所有的个人项目。',
  start: '快速上手',
  github: 'GitHub',

  chip1: '4 个 CLI provider · 8 个消息平台',
  chip2: '跨 CLI 项目记忆 + 自动 capture',
  chip3: '集成 API · 反向代理 · scope 化 key',

  live: '实时',
  regCh: '注册频道 · Kind 选择器',

  altMain: 'opendray 后台 — Sessions 主页,Claude Code 在跑',
  altFloat: 'opendray 注册频道对话框 — 8 个 kind 全在下拉里',

  capMain: '真实截图 · Sessions 主页,左侧会话列表、中部 Claude Code PTY 实时输出、右侧 Files / Git / Notes 三栏。',
  capFloat: '8 个 channel 内置',

  captionA: '上图是 v1.0 后台的实拍。',
  captionB: '继续往下看 Why(为什么不用别的)、产品全貌(5 张截图)、60 秒 Quickstart。',
} : {
  tag: 'v1.0 stable · single Go binary · MIT',

  // Mission as published in design.md §1, verbatim:
  titleA: 'Let your AI coding CLI follow you —',
  titleB: 'and every app you build, use it too.',

  sub: 'One opendray instance wraps your local Claude Code / Codex / Gemini / any shell and exposes them via REST + WebSocket. Your admin, your phone, and every app you build talk to one gateway — one Claude Pro subscription, every personal project served.',
  start: 'Get started',
  github: 'GitHub',

  chip1: '4 CLI providers · 8 messaging platforms',
  chip2: 'Cross-CLI project memory + auto-capture',
  chip3: 'Integration API · reverse proxy · scoped keys',

  live: 'live',
  regCh: 'Register channel · kind picker',

  altMain: 'opendray admin — Sessions page with Claude Code running',
  altFloat: 'opendray channel registration dialog with the 8-kind dropdown',

  capMain: 'Real screenshot · Sessions page — session list on the left, live Claude Code PTY in the middle, Files / Git / Notes on the right.',
  capFloat: '8 channels built in',

  captionA: 'The shot above is the real v1.0 admin.',
  captionB: 'Keep scrolling for Why, the 5-frame product tour, and the 60-second Quickstart.',
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
  padding: 88px 24px 56px;
  overflow: hidden;
  isolation: isolate;
}

.od-hero__bg { position: absolute; inset: 0; z-index: -1; pointer-events: none; }

.od-hero__blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(96px);
  opacity: 0.55;
}

.od-hero__blob--purple {
  width: 540px; height: 540px; top: -160px; left: -120px;
  background: radial-gradient(circle, #b896ff, transparent 70%);
}

.od-hero__blob--sky {
  width: 480px; height: 480px; top: -100px; right: -120px;
  background: radial-gradient(circle, #47bfff, transparent 70%);
}

.dark .od-hero__blob { opacity: 0.35; }

.od-hero__grid {
  position: absolute; inset: 0;
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
  max-width: 1340px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 0.85fr 1.25fr;
  gap: 56px;
  align-items: center;
}

@media (max-width: 1024px) {
  .od-hero__inner { grid-template-columns: 1fr; gap: 48px; }
  .od-hero { padding: 56px 20px 40px; }
}

.od-hero__copy { max-width: 540px; }

.od-hero__pill {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 14px 6px 12px;
  border-radius: 999px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  font-size: 12.5px; font-weight: 600; letter-spacing: 0.01em;
  color: var(--vp-c-text-2);
  margin-bottom: 24px;
}

.od-hero__pill-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.18);
  animation: od-pulse 2s ease-in-out infinite;
}

@keyframes od-pulse { 50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); } }

.od-hero__title {
  margin: 0 0 18px;
  font-size: clamp(30px, 4.4vw, 50px);
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--vp-c-text-1);
}

.od-hero__title-line { display: block; }

.od-hero__title-line--gradient {
  background: linear-gradient(120deg, var(--od-purple-600) 0%, var(--od-sky-500) 60%, var(--od-purple-500) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark .od-hero__title-line--gradient {
  background: linear-gradient(120deg, #b896ff 0%, var(--od-sky-400) 60%, #d6c2ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.od-hero__sub {
  margin: 0 0 32px;
  font-size: 16.5px; line-height: 1.6;
  color: var(--vp-c-text-2);
  letter-spacing: -0.005em;
}

.od-hero__cta {
  display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 28px;
}

.od-hero__btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 22px;
  border-radius: 12px;
  font-size: 14.5px; font-weight: 600; letter-spacing: -0.005em;
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

.od-hero__btn-arrow { transition: transform 0.18s ease; }
.od-hero__btn:hover .od-hero__btn-arrow { transform: translateX(3px); }
.od-hero__btn-glyph { font-size: 14px; color: #f59e0b; }

.od-hero__chips {
  display: flex; flex-wrap: wrap; gap: 8px;
}

.od-hero__chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 12px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  font-size: 12.5px; font-weight: 500;
  color: var(--vp-c-text-2);
  letter-spacing: -0.005em;
}

.od-hero__chip-glyph { font-size: 12px; }

/* ---------- visual side ---------- */
.od-hero__visual {
  position: relative;
  min-height: 460px;
}

/* shared browser-frame component */
.od-shot {
  margin: 0;
  border-radius: 14px;
  background: #0d0e1a;
  border: 1px solid rgba(126, 20, 255, 0.22);
  overflow: hidden;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.18),
    0 28px 70px -16px rgba(126, 20, 255, 0.4),
    0 12px 32px -16px rgba(0, 0, 0, 0.42);
}

.od-shot__chrome {
  display: flex; align-items: center;
  height: 36px;
  padding: 0 14px;
  gap: 10px;
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.od-shot__chrome--mini {
  height: 28px;
  padding: 0 10px;
}

.od-shot__dot { width: 11px; height: 11px; border-radius: 50%; flex-shrink: 0; }
.od-shot__chrome--mini .od-shot__dot { width: 8px; height: 8px; }
.od-shot__dot--r { background: #ff5f57; }
.od-shot__dot--y { background: #febc2e; }
.od-shot__dot--g { background: #28c840; }

.od-shot__addr {
  flex: 1;
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
  font-family: var(--vp-font-family-base);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.od-shot__addr--mini { font-size: 10.5px; }

.od-shot__addr-lock { font-size: 10px; margin-right: 4px; }
.od-shot__addr-path { color: rgba(255, 255, 255, 0.4); }

.od-shot__live {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(74, 222, 128, 0.18);
  border: 1px solid rgba(74, 222, 128, 0.3);
  color: #d1fae5;
  font-size: 10.5px;
  font-weight: 700;
  font-family: var(--vp-font-family-base);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  flex-shrink: 0;
}

.od-shot__live-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.2);
  animation: od-pulse 2s ease-in-out infinite;
}

.od-shot__media {
  position: relative;
  background: #0d0e1a;
  line-height: 0;
}

.od-shot__media img {
  width: 100%;
  height: auto;
  display: block;
}

.od-shot__cap {
  padding: 10px 14px 12px;
  font-size: 12px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.55);
  font-family: var(--vp-font-family-base);
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  background: rgba(255, 255, 255, 0.02);
  letter-spacing: -0.005em;
}

.od-shot__cap--small {
  text-align: center;
  font-size: 11px;
  padding: 8px 12px 10px;
}

/* ---------- main shot ---------- */
.od-shot--main {
  position: relative;
  transform: rotate(0.6deg);
  transform-origin: top right;
  z-index: 1;
}

/* ---------- floating shot ---------- */
.od-shot--float {
  position: absolute;
  width: 32%;
  min-width: 200px;
  max-width: 240px;
  left: -22px;
  bottom: -32px;
  z-index: 2;
  transform: rotate(-4.5deg);
  border-radius: 12px;
}

.od-shot--float .od-shot__media {
  max-height: 280px;
  overflow: hidden;
}

.od-shot--float .od-shot__media img {
  object-fit: cover;
  object-position: top left;
}

/* ---------- caption ---------- */
.od-hero__caption {
  max-width: 920px;
  margin: 64px auto 0;
  padding: 14px 22px;
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 14px;
  line-height: 1.55;
  color: var(--vp-c-text-2);
}

.od-hero__caption-arrow {
  color: var(--vp-c-brand-1);
  font-weight: 700;
  margin-top: 2px;
}

.od-hero__caption-text { flex: none; }
.od-hero__caption-text--mute { color: var(--vp-c-text-3); flex: 1; }
.od-hero__caption-sep { color: var(--vp-c-text-3); opacity: 0.4; }

@media (max-width: 720px) {
  .od-hero__caption { flex-direction: column; gap: 4px; }
  .od-hero__caption-sep { display: none; }
}

@media (max-width: 1024px) {
  .od-shot--main { transform: none; }
  .od-shot--float {
    position: relative;
    left: auto; bottom: auto;
    width: 70%;
    margin: -40px auto 0;
    transform: none;
  }
  .od-hero__visual {
    min-height: auto;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
}
</style>
