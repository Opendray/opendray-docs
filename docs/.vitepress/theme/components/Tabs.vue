<template>
  <div class="od-tabs">
    <div class="od-tabs__bar" role="tablist">
      <button
        v-for="(tab, idx) in tabs"
        :key="tab.id"
        :class="['od-tabs__tab', { 'is-active': active === idx }]"
        :aria-selected="active === idx"
        role="tab"
        @click="active = idx"
      >
        {{ tab.label }}
      </button>
      <span class="od-tabs__indicator" :style="indicatorStyle" />
    </div>
    <div class="od-tabs__panels">
      <div
        v-for="(tab, idx) in tabs"
        :key="tab.id"
        v-show="active === idx"
        role="tabpanel"
      >
        <component :is="tab.vnode" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
  useSlots,
  type VNode,
  Comment,
} from 'vue'

const slots = useSlots()
const active = ref(0)

interface TabDef {
  id: string
  label: string
  vnode: VNode
}

const tabs = computed<TabDef[]>(() => {
  const raw = slots.default?.() ?? []
  return raw
    .filter((n) => n.type !== Comment)
    .map((n, i) => {
      const props = (n.props ?? {}) as Record<string, unknown>
      const label = (props.label as string) ?? `Tab ${i + 1}`
      const id = (props.id as string) ?? `tab-${i}`
      return { id, label, vnode: n }
    })
})

const indicatorStyle = ref<Record<string, string>>({})

function updateIndicator() {
  const bar = document.querySelector('.od-tabs__bar') as HTMLElement | null
  if (!bar) return
  const btns = bar.querySelectorAll<HTMLButtonElement>('.od-tabs__tab')
  const el = btns[active.value]
  if (!el) return
  indicatorStyle.value = {
    transform: `translateX(${el.offsetLeft}px)`,
    width: `${el.offsetWidth}px`,
  }
}

onMounted(() => {
  updateIndicator()
  window.addEventListener('resize', updateIndicator)
})

import { watch } from 'vue'
watch(active, () => requestAnimationFrame(updateIndicator))
</script>

<style scoped>
.od-tabs {
  margin: 24px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
}

.od-tabs__bar {
  position: relative;
  display: flex;
  gap: 4px;
  padding: 6px 8px 0;
  background: var(--vp-c-bg);
  border-bottom: 1px solid var(--vp-c-divider);
  overflow-x: auto;
  scrollbar-width: none;
}

.od-tabs__bar::-webkit-scrollbar {
  display: none;
}

.od-tabs__tab {
  position: relative;
  padding: 10px 16px;
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: -0.005em;
  color: var(--vp-c-text-2);
  background: transparent;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s ease;
}

.od-tabs__tab:hover {
  color: var(--vp-c-text-1);
}

.od-tabs__tab.is-active {
  color: var(--vp-c-brand-1);
}

.od-tabs__indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    var(--od-purple-500),
    var(--od-sky-500)
  );
  border-radius: 2px;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.od-tabs__panels {
  padding: 18px 22px;
}

.od-tabs__panels :deep(> div > :first-child) {
  margin-top: 0;
}

.od-tabs__panels :deep(> div > :last-child) {
  margin-bottom: 0;
}

.od-tabs__panels :deep(div[class*='language-']) {
  margin: 0;
}
</style>
