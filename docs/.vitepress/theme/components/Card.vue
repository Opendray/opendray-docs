<template>
  <component
    :is="href ? 'a' : 'div'"
    class="od-card"
    :class="{ 'od-card--linked': href }"
    :href="href || undefined"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
  >
    <div v-if="icon" class="od-card__icon" aria-hidden="true">
      <span class="od-card__icon-bg" />
      <span class="od-card__icon-glyph">{{ icon }}</span>
    </div>
    <div class="od-card__body">
      <h3 v-if="title" class="od-card__title">{{ title }}</h3>
      <p v-if="$slots.default" class="od-card__text">
        <slot />
      </p>
    </div>
    <span v-if="href" class="od-card__arrow" aria-hidden="true">→</span>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title?: string
  icon?: string
  href?: string
}>()

const external = computed(
  () => !!props.href && /^(https?:)?\/\//.test(props.href),
)
</script>

<style scoped>
.od-card {
  display: flex;
  gap: 16px;
  padding: 20px 22px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  text-decoration: none !important;
  color: inherit;
  position: relative;
  transition: all 0.18s ease;
  align-items: flex-start;
}

.od-card--linked {
  cursor: pointer;
}

.od-card--linked:hover {
  border-color: var(--vp-c-brand-2);
  background: var(--vp-c-bg);
  transform: translateY(-2px);
  box-shadow:
    0 1px 2px rgba(126, 20, 255, 0.08),
    0 8px 24px -8px rgba(126, 20, 255, 0.18);
}

.od-card__icon {
  position: relative;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.od-card__icon-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--od-purple-100), var(--od-purple-50));
  border-radius: 10px;
  opacity: 1;
}

.dark .od-card__icon-bg {
  background: linear-gradient(135deg, rgba(126, 20, 255, 0.22), rgba(126, 20, 255, 0.05));
}

.od-card__icon-glyph {
  position: relative;
  font-size: 20px;
  line-height: 1;
}

.od-card__body {
  flex: 1;
  min-width: 0;
}

.od-card__title {
  margin: 0 0 6px;
  font-size: 15.5px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--vp-c-text-1);
}

.od-card__text {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  color: var(--vp-c-text-2);
}

.od-card__arrow {
  position: absolute;
  top: 18px;
  right: 18px;
  font-size: 14px;
  color: var(--vp-c-text-3);
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.18s ease;
}

.od-card--linked:hover .od-card__arrow {
  opacity: 1;
  transform: translateX(0);
  color: var(--vp-c-brand-1);
}
</style>
