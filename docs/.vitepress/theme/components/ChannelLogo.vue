<template>
  <div class="od-chan" :title="label">
    <div class="od-chan__icon">
      <img
        :src="`/channel-icons/${kind}.svg`"
        :alt="`${label} logo`"
        loading="lazy"
        width="48"
        height="48"
      />
    </div>
    <div class="od-chan__label">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Channel =
  | 'telegram'
  | 'slack'
  | 'discord'
  | 'feishu'
  | 'dingtalk'
  | 'wecom'
  | 'wechat'
  | 'bridge'

const props = defineProps<{
  kind: Channel
  label?: string
}>()

const labels: Record<Channel, string> = {
  telegram: 'Telegram',
  slack: 'Slack',
  discord: 'Discord',
  feishu: '飞书 Feishu',
  dingtalk: '钉钉 DingTalk',
  wecom: '企业微信 WeCom',
  wechat: '微信 WeChat',
  bridge: 'Bridge',
}

const label = computed(() => props.label ?? labels[props.kind])
</script>

<style scoped>
.od-chan {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 22px 14px 18px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  transition: all 0.2s ease;
  cursor: default;
}

.od-chan:hover {
  border-color: var(--vp-c-brand-2);
  background: var(--vp-c-bg);
  transform: translateY(-3px);
  box-shadow: 0 10px 30px -12px rgba(126, 20, 255, 0.36);
}

.od-chan__icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* a subtle background lets self-colored marks "land" on a card.
     For dark mode we go warmer so very dark / very light marks
     both stay readable. */
  background: rgba(15, 23, 42, 0.04);
  border-radius: 12px;
  padding: 6px;
}

.dark .od-chan__icon {
  background: rgba(255, 255, 255, 0.06);
}

.od-chan__icon img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.od-chan__label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  text-align: center;
  letter-spacing: 0.005em;
}
</style>
