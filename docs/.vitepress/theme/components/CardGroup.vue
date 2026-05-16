<template>
  <div class="od-card-group" :style="{ '--cols': cols }">
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ cols?: number | string }>(), { cols: 2 })
</script>

<style scoped>
.od-card-group {
  display: grid;
  grid-template-columns: repeat(var(--cols, 2), minmax(0, 1fr));
  gap: 14px;
  margin: 24px 0;
}

@media (max-width: 768px) {
  .od-card-group {
    grid-template-columns: 1fr;
  }
}
</style>
