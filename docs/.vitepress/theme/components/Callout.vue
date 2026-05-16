<template>
  <aside :class="['od-callout', `od-callout--${type}`]" role="note">
    <div class="od-callout__head">
      <span class="od-callout__icon" aria-hidden="true">{{ iconGlyph }}</span>
      <span class="od-callout__title">{{ title || defaultTitle }}</span>
    </div>
    <div class="od-callout__body">
      <slot />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type CalloutType = 'info' | 'tip' | 'warning' | 'danger' | 'success'

const props = withDefaults(defineProps<{
  type?: CalloutType
  title?: string
}>(), {
  type: 'info',
})

const iconMap: Record<CalloutType, string> = {
  info: 'i',
  tip: '★',
  warning: '!',
  danger: '×',
  success: '✓',
}

const titleMap: Record<CalloutType, string> = {
  info: 'Note',
  tip: 'Tip',
  warning: 'Warning',
  danger: 'Danger',
  success: 'Success',
}

const iconGlyph = computed(() => iconMap[props.type])
const defaultTitle = computed(() => titleMap[props.type])
</script>

<style scoped>
.od-callout {
  margin: 20px 0;
  padding: 14px 18px;
  border-radius: 10px;
  border: 1px solid;
  background: var(--vp-c-bg-soft);
}

.od-callout--info {
  border-color: rgba(30, 167, 255, 0.32);
  background: rgba(30, 167, 255, 0.07);
}

.od-callout--tip {
  border-color: rgba(126, 20, 255, 0.32);
  background: rgba(126, 20, 255, 0.07);
}

.od-callout--warning {
  border-color: rgba(245, 158, 11, 0.36);
  background: rgba(245, 158, 11, 0.08);
}

.od-callout--danger {
  border-color: rgba(239, 68, 68, 0.36);
  background: rgba(239, 68, 68, 0.07);
}

.od-callout--success {
  border-color: rgba(16, 185, 129, 0.36);
  background: rgba(16, 185, 129, 0.07);
}

.od-callout__head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.od-callout__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  font-family: var(--vp-font-family-mono);
  color: #fff;
}

.od-callout--info .od-callout__icon { background: var(--od-info); }
.od-callout--tip .od-callout__icon { background: var(--od-purple-500); }
.od-callout--warning .od-callout__icon { background: var(--od-warning); }
.od-callout--danger .od-callout__icon { background: var(--od-danger); }
.od-callout--success .od-callout__icon { background: var(--od-success); }

.od-callout__title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.od-callout--info .od-callout__title { color: var(--od-sky-600); }
.od-callout--tip .od-callout__title { color: var(--od-purple-700); }
.od-callout--warning .od-callout__title { color: #b45309; }
.od-callout--danger .od-callout__title { color: #b91c1c; }
.od-callout--success .od-callout__title { color: #047857; }

.dark .od-callout--info .od-callout__title { color: var(--od-sky-400); }
.dark .od-callout--tip .od-callout__title { color: var(--od-purple-300); }
.dark .od-callout--warning .od-callout__title { color: #fcd34d; }
.dark .od-callout--danger .od-callout__title { color: #fca5a5; }
.dark .od-callout--success .od-callout__title { color: #6ee7b7; }

.od-callout__body :deep(p) {
  margin: 6px 0;
  line-height: 1.65;
  color: var(--vp-c-text-1);
}

.od-callout__body :deep(p:first-child) { margin-top: 0; }
.od-callout__body :deep(p:last-child) { margin-bottom: 0; }
</style>
