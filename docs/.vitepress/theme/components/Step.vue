<template>
  <li class="od-step">
    <div class="od-step__bullet" aria-hidden="true">
      <span class="od-step__num" />
    </div>
    <div class="od-step__body">
      <h4 v-if="title" class="od-step__title">{{ title }}</h4>
      <div class="od-step__content">
        <slot />
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<style scoped>
.od-step {
  display: flex;
  gap: 16px;
  padding: 4px 0 28px;
  position: relative;
}

.od-step:last-child {
  padding-bottom: 0;
}

.od-step__bullet {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--vp-c-bg);
  border: 2px solid var(--od-purple-400);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  box-shadow: 0 0 0 4px var(--vp-c-bg);
}

.dark .od-step__bullet {
  background: var(--vp-c-bg);
  box-shadow: 0 0 0 4px var(--vp-c-bg);
}

.od-step__num {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--od-purple-500);
  display: block;
}

.od-step__body {
  flex: 1;
  min-width: 0;
  padding-top: 4px;
}

.od-step__title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--vp-c-text-1);
}

.od-step__content :deep(p) {
  margin: 0 0 8px;
  color: var(--vp-c-text-2);
  line-height: 1.65;
}

.od-step__content :deep(p:last-child) {
  margin-bottom: 0;
}

.od-step__content :deep(code) {
  font-size: 0.86em;
}
</style>
