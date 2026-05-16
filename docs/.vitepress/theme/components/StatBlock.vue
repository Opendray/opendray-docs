<template>
  <div class="od-stat">
    <div class="od-stat__value">
      <span class="od-stat__num">{{ value }}</span>
      <span v-if="suffix" class="od-stat__suffix">{{ suffix }}</span>
    </div>
    <div class="od-stat__label">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  value: string | number
  suffix?: string
  label: string
}>()
</script>

<style scoped>
.od-stat {
  text-align: center;
  padding: 18px 12px;
}

.od-stat__value {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  background: linear-gradient(
    120deg,
    var(--od-purple-600) 0%,
    var(--od-sky-500) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark .od-stat__value {
  background: linear-gradient(
    120deg,
    #b896ff 0%,
    var(--od-sky-400) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.od-stat__num {
  font-size: 38px;
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.05;
}

.od-stat__suffix {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.od-stat__label {
  margin-top: 4px;
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-3);
  letter-spacing: 0.02em;
}
</style>
