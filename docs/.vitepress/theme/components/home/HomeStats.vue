<template>
  <section class="od-st">
    <div class="od-st__inner">
      <div class="od-st__grid">
        <StatBlock
          v-for="s in stats"
          :key="s.label"
          :value="s.value"
          :suffix="s.suffix"
          :label="s.label"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import StatBlock from '../StatBlock.vue'

const { lang } = useData()
const isZh = computed(() => lang.value?.startsWith('zh'))

const stats = computed(() => isZh.value ? [
  { value: '8', label: '内置消息平台' },
  { value: '4', label: 'CLI providers 开箱即用' },
  { value: '15', suffix: '+', label: '后台页面' },
  { value: '1', label: 'Go 二进制 · 不需要其他 runtime' },
] : [
  { value: '8', label: 'Bundled messengers' },
  { value: '4', label: 'CLI providers built in' },
  { value: '15', suffix: '+', label: 'Admin pages' },
  { value: '1', label: 'Go binary · zero runtime deps' },
])
</script>

<style scoped>
.od-st {
  padding: 64px 24px;
  background: var(--vp-c-bg-alt);
  border-top: 1px solid var(--vp-c-divider);
  border-bottom: 1px solid var(--vp-c-divider);
}

.dark .od-st {
  background: rgba(126, 20, 255, 0.04);
}

.od-st__inner {
  max-width: 1080px;
  margin: 0 auto;
}

.od-st__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

@media (max-width: 720px) {
  .od-st__grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
