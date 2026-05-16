<template>
  <component
    :is="href ? 'a' : 'div'"
    class="od-fc"
    :href="href || undefined"
  >
    <div class="od-fc__icon-wrap" :style="iconStyle">
      <span class="od-fc__icon" aria-hidden="true">{{ icon }}</span>
    </div>
    <div class="od-fc__body">
      <h3 class="od-fc__title">
        {{ title }}
        <span v-if="badge" class="od-fc__badge">{{ badge }}</span>
      </h3>
      <p class="od-fc__details">
        <slot>{{ details }}</slot>
      </p>
    </div>
    <span v-if="href" class="od-fc__arrow" aria-hidden="true">→</span>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  icon: string
  title: string
  details?: string
  href?: string
  badge?: string
  hue?: 'purple' | 'sky' | 'green' | 'amber' | 'pink'
}>()

const huePalette: Record<string, { from: string; to: string }> = {
  purple: { from: 'rgba(126, 20, 255, 0.20)', to: 'rgba(184, 150, 255, 0.10)' },
  sky:    { from: 'rgba(30, 167, 255, 0.22)', to: 'rgba(71, 191, 255, 0.10)' },
  green:  { from: 'rgba(16, 185, 129, 0.20)', to: 'rgba(110, 231, 183, 0.10)' },
  amber:  { from: 'rgba(245, 158, 11, 0.22)', to: 'rgba(252, 211, 77, 0.10)' },
  pink:   { from: 'rgba(236, 72, 153, 0.22)', to: 'rgba(244, 114, 182, 0.10)' },
}

const iconStyle = computed(() => {
  const p = huePalette[props.hue ?? 'purple']
  return {
    background: `linear-gradient(135deg, ${p.from}, ${p.to})`,
  }
})
</script>

<style scoped>
.od-fc {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 24px;
  border: 1px solid var(--vp-home-feature-card-border, var(--vp-c-divider));
  border-radius: 14px;
  background: var(--vp-home-feature-card-bg, var(--vp-c-bg-soft));
  text-decoration: none !important;
  color: inherit;
  transition: all 0.22s ease;
  position: relative;
  overflow: hidden;
}

.od-fc::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    135deg,
    rgba(126, 20, 255, 0.06) 0%,
    transparent 60%
  );
  opacity: 0;
  transition: opacity 0.22s ease;
  pointer-events: none;
}

.od-fc:hover {
  border-color: var(--vp-c-brand-2);
  transform: translateY(-3px);
  box-shadow:
    0 1px 2px rgba(126, 20, 255, 0.08),
    0 14px 36px -12px rgba(126, 20, 255, 0.22);
}

.od-fc:hover::after {
  opacity: 1;
}

.od-fc__icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.od-fc__icon {
  font-size: 24px;
  line-height: 1;
}

.od-fc__body { position: relative; z-index: 1; }

.od-fc__title {
  margin: 0 0 6px;
  font-size: 16.5px;
  font-weight: 700;
  letter-spacing: -0.015em;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--vp-c-text-1);
}

.od-fc__badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--od-purple-500), var(--od-sky-500));
  color: #fff;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.od-fc__details {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.od-fc__arrow {
  position: absolute;
  bottom: 18px;
  right: 22px;
  font-size: 16px;
  color: var(--vp-c-text-3);
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.22s ease;
  z-index: 1;
}

.od-fc:hover .od-fc__arrow {
  opacity: 1;
  transform: translateX(0);
  color: var(--vp-c-brand-1);
}
</style>
