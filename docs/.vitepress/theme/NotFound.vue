<template>
  <div class="od-404">
    <div class="od-404__glow" aria-hidden="true" />
    <div class="od-404__inner">
      <div class="od-404__code">404</div>
      <h1 class="od-404__title">{{ t.title }}</h1>
      <p class="od-404__text">{{ t.text }}</p>
      <div class="od-404__actions">
        <a class="od-404__btn od-404__btn--primary" :href="homeLink">
          {{ t.home }}
        </a>
        <a class="od-404__btn od-404__btn--alt" :href="docsLink">
          {{ t.docs }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { lang } = useData()

const isZh = computed(() => lang.value?.startsWith('zh'))

const t = computed(() => isZh.value
  ? {
      title: '页面不见了',
      text: '你要找的页面可能已经被移走、改名或者从未存在。下面这两个入口能带你回到正轨。',
      home: '回到首页',
      docs: '打开文档',
    }
  : {
      title: 'This page took a wrong turn',
      text: 'The page you tried to reach has been moved, renamed, or never existed. The links below will get you back on track.',
      home: 'Back to home',
      docs: 'Open the docs',
    })

const homeLink = computed(() => isZh.value ? '/zh/' : '/')
const docsLink = computed(() => isZh.value
  ? '/zh/getting-started/welcome'
  : '/getting-started/welcome')
</script>

<style scoped>
.od-404 {
  min-height: calc(100vh - var(--vp-nav-height));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  position: relative;
  overflow: hidden;
}

.od-404__glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at top, rgba(126, 20, 255, 0.18), transparent 60%),
    radial-gradient(ellipse at bottom right, rgba(71, 191, 255, 0.14), transparent 60%);
  pointer-events: none;
  z-index: 0;
}

.od-404__inner {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 560px;
}

.od-404__code {
  font-size: 140px;
  font-weight: 800;
  letter-spacing: -0.05em;
  line-height: 1;
  background: linear-gradient(
    120deg,
    var(--od-purple-600) 0%,
    var(--od-sky-500) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.dark .od-404__code {
  background: linear-gradient(
    120deg,
    #b896ff 0%,
    var(--od-sky-400) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.od-404__title {
  margin: 0 0 12px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--vp-c-text-1);
}

.od-404__text {
  margin: 0 auto 28px;
  max-width: 420px;
  font-size: 15px;
  line-height: 1.65;
  color: var(--vp-c-text-2);
}

.od-404__actions {
  display: inline-flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.od-404__btn {
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.18s ease;
  border: 1px solid transparent;
}

.od-404__btn--primary {
  background: var(--od-purple-600);
  color: #fff;
  box-shadow: 0 6px 18px -8px rgba(126, 20, 255, 0.6);
}

.od-404__btn--primary:hover {
  background: var(--od-purple-700);
  transform: translateY(-1px);
}

.od-404__btn--alt {
  background: var(--od-purple-50);
  color: var(--od-purple-700);
}

.dark .od-404__btn--alt {
  background: rgba(126, 20, 255, 0.16);
  color: #d6c2ff;
}

.od-404__btn--alt:hover {
  background: var(--od-purple-100);
}

.dark .od-404__btn--alt:hover {
  background: rgba(126, 20, 255, 0.28);
}

@media (max-width: 600px) {
  .od-404__code { font-size: 92px; }
  .od-404__title { font-size: 22px; }
}
</style>
