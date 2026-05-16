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
  { value: '6', suffix: '+', label: '内置消息平台' },
  { value: '3', suffix: '+', label: '支持的 AI CLI' },
  { value: '100', suffix: '%', label: '自托管,数据不出网' },
  { value: '<60', suffix: 's', label: '从安装到第一个会话' },
] : [
  { value: '6', suffix: '+', label: 'Bundled messengers' },
  { value: '3', suffix: '+', label: 'AI CLIs supported' },
  { value: '100', suffix: '%', label: 'Self-hosted, on-prem' },
  { value: '<60', suffix: 's', label: 'Install to first session' },
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
