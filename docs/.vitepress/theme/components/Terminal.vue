<template>
  <div class="od-term" :class="{ 'is-mac': mac }">
    <div class="od-term__chrome">
      <div class="od-term__dots">
        <span class="od-term__dot od-term__dot--r" />
        <span class="od-term__dot od-term__dot--y" />
        <span class="od-term__dot od-term__dot--g" />
      </div>
      <div class="od-term__title">{{ title }}</div>
      <div class="od-term__spacer" />
    </div>
    <div class="od-term__body">
      <div
        v-for="(line, idx) in lines"
        :key="idx"
        :class="['od-term__line', `od-term__line--${line.kind}`]"
      >
        <span v-if="line.kind === 'cmd'" class="od-term__prompt">$</span>
        <span v-if="line.kind === 'arrow'" class="od-term__prompt">→</span>
        <span v-if="line.kind === 'check'" class="od-term__prompt">✓</span>
        <span v-if="line.kind === 'cross'" class="od-term__prompt">✗</span>
        <span class="od-term__text" v-html="formatLine(line.text)" />
      </div>
      <div v-if="cursor" class="od-term__line od-term__line--cmd">
        <span class="od-term__prompt">$</span>
        <span class="od-term__cursor" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Line {
  kind: 'cmd' | 'out' | 'arrow' | 'check' | 'cross'
  text: string
}

const props = withDefaults(defineProps<{
  title?: string
  mac?: boolean
  cursor?: boolean
  content?: string
}>(), {
  title: '~/opendray',
  mac: true,
  cursor: false,
  content: '',
})

/**
 * Parse content like:
 *   $ pnpm install
 *   added 142 packages
 *   $ pnpm dev
 *   ✓ ready in 312ms
 */
const lines = computed<Line[]>(() => {
  if (!props.content) return []
  return props.content
    .split('\n')
    .map((raw) => raw.trimEnd())
    .filter((l) => l.length > 0)
    .map((raw): Line => {
      if (raw.startsWith('$ ')) return { kind: 'cmd', text: raw.slice(2) }
      if (raw.startsWith('→ ')) return { kind: 'arrow', text: raw.slice(2) }
      if (raw.startsWith('✓ ')) return { kind: 'check', text: raw.slice(2) }
      if (raw.startsWith('✗ ')) return { kind: 'cross', text: raw.slice(2) }
      return { kind: 'out', text: raw }
    })
})

function formatLine(text: string): string {
  // basic syntax: highlight flags, paths, urls
  return text
    .replace(/(--?[\w-]+)/g, '<i class="od-term__flag">$1</i>')
    .replace(/(https?:\/\/\S+)/g, '<i class="od-term__url">$1</i>')
}
</script>

<style scoped>
.od-term {
  border-radius: 12px;
  background: #0d0e1a;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.18),
    0 28px 60px -28px rgba(126, 20, 255, 0.36),
    0 12px 32px -16px rgba(0, 0, 0, 0.42);
  overflow: hidden;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 1.65;
  color: #cfd2e6;
  border: 1px solid rgba(126, 20, 255, 0.22);
}

.od-term__chrome {
  display: flex;
  align-items: center;
  height: 34px;
  padding: 0 14px;
  background: linear-gradient(180deg, #1a1c33 0%, #14162a 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  position: relative;
}

.od-term__dots {
  display: flex;
  gap: 6px;
  align-items: center;
  width: 60px;
}

.od-term__dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  display: block;
}

.od-term__dot--r { background: #ff5f57; }
.od-term__dot--y { background: #febc2e; }
.od-term__dot--g { background: #28c840; }

.od-term__title {
  flex: 1;
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.42);
  letter-spacing: 0.02em;
}

.od-term__spacer {
  width: 60px;
}

.od-term__body {
  padding: 16px 20px 18px;
  background:
    radial-gradient(ellipse at top right,
      rgba(126, 20, 255, 0.16),
      transparent 60%),
    radial-gradient(ellipse at bottom left,
      rgba(71, 191, 255, 0.10),
      transparent 60%),
    #0d0e1a;
  min-height: 180px;
}

.od-term__line {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 1px 0;
}

.od-term__prompt {
  flex-shrink: 0;
  width: 16px;
  font-weight: 700;
  user-select: none;
}

.od-term__line--cmd .od-term__prompt { color: #b896ff; }
.od-term__line--arrow .od-term__prompt { color: #47bfff; }
.od-term__line--check .od-term__prompt { color: #4ade80; }
.od-term__line--cross .od-term__prompt { color: #f87171; }
.od-term__line--out .od-term__prompt { width: 0; }

.od-term__text {
  flex: 1;
  white-space: pre-wrap;
  word-break: break-word;
}

.od-term__line--cmd .od-term__text { color: #ffffff; }
.od-term__line--out .od-term__text { color: rgba(255, 255, 255, 0.62); }
.od-term__line--check .od-term__text { color: #d1fae5; }
.od-term__line--arrow .od-term__text { color: #dbeafe; }

.od-term__text :deep(.od-term__flag) {
  font-style: normal;
  color: #fbbf24;
}

.od-term__text :deep(.od-term__url) {
  font-style: normal;
  color: #47bfff;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.od-term__cursor {
  display: inline-block;
  width: 8px;
  height: 16px;
  background: #b896ff;
  margin-left: 2px;
  animation: od-term-blink 1s steps(2, jump-none) infinite;
  vertical-align: middle;
}

@keyframes od-term-blink {
  50% { opacity: 0; }
}
</style>
