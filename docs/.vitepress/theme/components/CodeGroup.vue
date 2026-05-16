<template>
  <div class="od-codegroup">
    <div class="od-codegroup__bar" role="tablist">
      <button
        v-for="(tab, idx) in tabs"
        :key="tab.id"
        :class="['od-codegroup__tab', { 'is-active': active === idx }]"
        :aria-selected="active === idx"
        role="tab"
        @click="active = idx"
      >
        <span v-if="tab.icon" class="od-codegroup__icon">{{ tab.icon }}</span>
        {{ tab.label }}
      </button>
    </div>
    <div class="od-codegroup__panel">
      <div
        v-for="(tab, idx) in tabs"
        :key="tab.id"
        v-show="active === idx"
      >
        <component :is="tab.vnode" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  useSlots,
  type VNode,
  Comment,
} from 'vue'

const slots = useSlots()
const active = ref(0)

interface CodeTabDef {
  id: string
  label: string
  icon?: string
  vnode: VNode
}

const tabs = computed<CodeTabDef[]>(() => {
  const raw = slots.default?.() ?? []
  return raw
    .filter((n) => n.type !== Comment)
    .map((n, i) => {
      const props = (n.props ?? {}) as Record<string, unknown>
      return {
        id: (props.id as string) ?? `code-${i}`,
        label: (props.label as string) ?? `Tab ${i + 1}`,
        icon: props.icon as string | undefined,
        vnode: n,
      }
    })
})
</script>

<style scoped>
.od-codegroup {
  margin: 24px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-code-block-bg, #161618);
}

.od-codegroup__bar {
  display: flex;
  gap: 0;
  background: rgba(0, 0, 0, 0.18);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  overflow-x: auto;
  scrollbar-width: none;
}

.od-codegroup__bar::-webkit-scrollbar {
  display: none;
}

.od-codegroup__tab {
  padding: 10px 18px;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: rgba(255, 255, 255, 0.55);
  background: transparent;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: color 0.15s ease, border-color 0.15s ease,
              background-color 0.15s ease;
}

.od-codegroup__tab:hover {
  color: rgba(255, 255, 255, 0.82);
  background: rgba(255, 255, 255, 0.04);
}

.od-codegroup__tab.is-active {
  color: #ffffff;
  border-bottom-color: var(--od-purple-400);
  background: rgba(126, 20, 255, 0.12);
}

.od-codegroup__icon {
  font-size: 13px;
  display: inline-flex;
  width: 16px;
  height: 16px;
  align-items: center;
  justify-content: center;
}

.od-codegroup__panel :deep(div[class*='language-']) {
  margin: 0 !important;
  border: 0 !important;
  border-radius: 0 !important;
}

.od-codegroup__panel :deep(div[class*='language-']::before) {
  display: none !important;
}
</style>
