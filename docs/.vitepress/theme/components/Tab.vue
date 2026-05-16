<template>
  <div class="od-tab"><slot /></div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  id?: string
}>()
</script>
