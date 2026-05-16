<template>
  <ol class="od-steps">
    <slot />
  </ol>
</template>

<style scoped>
.od-steps {
  counter-reset: od-step;
  list-style: none;
  padding: 0;
  margin: 24px 0;
  position: relative;
}

.od-steps::before {
  content: '';
  position: absolute;
  left: 17px;
  top: 16px;
  bottom: 16px;
  width: 2px;
  background: linear-gradient(
    180deg,
    var(--od-purple-300),
    var(--od-purple-100) 50%,
    transparent
  );
}

.dark .od-steps::before {
  background: linear-gradient(
    180deg,
    var(--od-purple-500),
    rgba(126, 20, 255, 0.3) 50%,
    transparent
  );
}
</style>
