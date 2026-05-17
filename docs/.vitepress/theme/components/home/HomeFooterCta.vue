<template>
  <section class="od-cta">
    <div class="od-cta__bg" aria-hidden="true">
      <div class="od-cta__blob od-cta__blob--purple" />
      <div class="od-cta__blob od-cta__blob--sky" />
    </div>
    <div class="od-cta__inner">
      <h2 class="od-cta__title">{{ t.title }}</h2>
      <p class="od-cta__sub">{{ t.sub }}</p>
      <div class="od-cta__actions">
        <a class="od-cta__btn od-cta__btn--primary" :href="links.start">
          {{ t.start }}
          <span>→</span>
        </a>
        <a class="od-cta__btn od-cta__btn--alt"
           :href="links.gh"
           target="_blank" rel="noopener">
          {{ t.gh }}
        </a>
      </div>
      <div class="od-cta__hint">{{ t.hint }}</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { lang } = useData()
const isZh = computed(() => lang.value?.startsWith('zh'))

const t = computed(() => isZh.value ? {
  title: '把它装上,跑起来。',
  sub: '克隆 → docker compose 起 Postgres → go run 跑起来,5 分钟看到 :8770/admin/。文档全程 EN / 中文,有问题直接 GitHub Issue。',
  start: '从 Quickstart 开始',
  gh: '查看 GitHub',
  hint: 'MIT 许可 · v1.0 稳定 · 完全自托管',
} : {
  title: 'Install it. Run it.',
  sub: 'Clone → docker compose for Postgres → go run → :8770/admin/ in five minutes. Bilingual docs (EN / 中文). Issues welcome on GitHub.',
  start: 'Start with Quickstart',
  gh: 'View on GitHub',
  hint: 'MIT licensed · v1.0 stable · self-hosted',
})

const links = computed(() => ({
  start: isZh.value ? '/zh/getting-started/welcome' : '/getting-started/welcome',
  gh: 'https://github.com/opendray/opendray',
}))
</script>

<style scoped>
.od-cta {
  padding: 100px 24px;
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

.od-cta__bg {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
}

.od-cta__blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(96px);
  opacity: 0.46;
}

.od-cta__blob--purple {
  width: 420px;
  height: 420px;
  top: -120px;
  left: 8%;
  background: radial-gradient(circle, var(--od-purple-500), transparent 70%);
}

.od-cta__blob--sky {
  width: 380px;
  height: 380px;
  bottom: -120px;
  right: 8%;
  background: radial-gradient(circle, var(--od-sky-500), transparent 70%);
}

.dark .od-cta__blob { opacity: 0.32; }

.od-cta__inner {
  max-width: 720px;
  margin: 0 auto;
  text-align: center;
}

.od-cta__title {
  margin: 0 0 16px;
  font-size: clamp(34px, 5vw, 52px);
  font-weight: 800;
  letter-spacing: -0.03em;
  background: linear-gradient(120deg,
    var(--od-purple-700), var(--od-sky-500), var(--od-purple-500));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  border: 0 !important; padding-top: 0 !important; margin-top: 0 !important;
}

.dark .od-cta__title {
  background: linear-gradient(120deg,
    #b896ff, var(--od-sky-400), #d6c2ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.od-cta__sub {
  margin: 0 auto 32px;
  max-width: 540px;
  font-size: 17px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.od-cta__actions {
  display: inline-flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 18px;
}

.od-cta__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 26px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.005em;
  text-decoration: none;
  transition: all 0.18s ease;
  border: 1px solid transparent;
}

.od-cta__btn--primary {
  background: var(--od-purple-600);
  color: #fff;
  box-shadow:
    0 1px 2px rgba(126, 20, 255, 0.24),
    0 12px 30px -10px rgba(126, 20, 255, 0.6);
}

.od-cta__btn--primary:hover {
  background: var(--od-purple-700);
  transform: translateY(-2px);
}

.od-cta__btn--primary span {
  transition: transform 0.18s ease;
}

.od-cta__btn--primary:hover span {
  transform: translateX(4px);
}

.od-cta__btn--alt {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-divider);
}

.od-cta__btn--alt:hover {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-brand-2);
}

.od-cta__hint {
  font-size: 13px;
  color: var(--vp-c-text-3);
  letter-spacing: 0.02em;
}
</style>
