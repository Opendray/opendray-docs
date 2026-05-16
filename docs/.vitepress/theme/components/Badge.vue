<template>
  <span :class="['od-badge', `od-badge--${type}`]">
    <slot>{{ text }}</slot>
  </span>
</template>

<script setup lang="ts">
type BadgeType = 'new' | 'beta' | 'stable' | 'deprecated' | 'tip' | 'info'

withDefaults(defineProps<{
  type?: BadgeType
  text?: string
}>(), {
  type: 'info',
})
</script>

<style scoped>
.od-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border: 1px solid transparent;
  vertical-align: middle;
  line-height: 1.4;
}

.od-badge--new {
  background: linear-gradient(135deg, var(--od-purple-500), var(--od-sky-500));
  color: #fff;
  box-shadow: 0 1px 3px rgba(126, 20, 255, 0.32);
}

.od-badge--beta {
  background: rgba(126, 20, 255, 0.12);
  color: var(--od-purple-700);
  border-color: rgba(126, 20, 255, 0.28);
}

.dark .od-badge--beta {
  color: var(--od-purple-200);
  background: rgba(126, 20, 255, 0.22);
}

.od-badge--stable {
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
  border-color: rgba(16, 185, 129, 0.32);
}

.dark .od-badge--stable {
  color: #6ee7b7;
  background: rgba(16, 185, 129, 0.18);
}

.od-badge--deprecated {
  background: rgba(239, 68, 68, 0.12);
  color: #b91c1c;
  border-color: rgba(239, 68, 68, 0.32);
  text-decoration: line-through;
  text-decoration-thickness: 1.5px;
  text-decoration-color: rgba(185, 28, 28, 0.5);
}

.dark .od-badge--deprecated {
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.18);
}

.od-badge--tip {
  background: rgba(245, 158, 11, 0.14);
  color: #b45309;
  border-color: rgba(245, 158, 11, 0.32);
}

.dark .od-badge--tip {
  color: #fcd34d;
}

.od-badge--info {
  background: rgba(30, 167, 255, 0.14);
  color: var(--od-sky-600);
  border-color: rgba(30, 167, 255, 0.32);
}

.dark .od-badge--info {
  color: var(--od-sky-400);
}
</style>
