<template>
  <div class="od-codetab"><slot /></div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  id?: string
  icon?: string
}>()
</script>
