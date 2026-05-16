<template>
  <section class="od-ch">
    <div class="od-ch__inner">
      <div class="od-ch__head">
        <div class="od-ch__eyebrow">{{ t.eyebrow }}</div>
        <h2 class="od-ch__title">{{ t.title }}</h2>
        <p class="od-ch__sub">{{ t.sub }}</p>
      </div>
      <div class="od-ch__grid">
        <ChannelLogo
          v-for="c in channels"
          :key="c"
          :kind="c"
        />
      </div>
      <div class="od-ch__foot">
        <a class="od-ch__link" :href="link">
          {{ t.cta }} <span>→</span>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import ChannelLogo from '../ChannelLogo.vue'

const { lang } = useData()
const isZh = computed(() => lang.value?.startsWith('zh'))

const channels = ['telegram', 'slack', 'discord', 'feishu',
                  'dingtalk', 'wecom', 'bridge'] as const

const t = computed(() => isZh.value ? {
  eyebrow: '6+ 平台 · 1 个适配器',
  title: '所有人都在用的聊天工具,通通搞定。',
  sub: '六大消息平台开箱即用,加上一个 Bridge WebSocket 适配器 —— 自己接 Line / KakaoTalk / 飞书自建机器人都行。',
  cta: '查看频道接入文档',
} : {
  eyebrow: '6+ platforms · 1 adapter',
  title: 'Talk to your sessions where your team already lives.',
  sub: 'Six bundled platforms ready out of the box, plus a Bridge WebSocket adapter to plug in any custom protocol — Line, KakaoTalk, your own.',
  cta: 'Channel setup guides',
})

const link = computed(() => isZh.value
  ? '/zh/channels/overview'
  : '/channels/overview')
</script>

<style scoped>
.od-ch {
  padding: 80px 24px;
  position: relative;
}

.od-ch__inner {
  max-width: 1080px;
  margin: 0 auto;
}

.od-ch__head { text-align: center; margin-bottom: 48px; }

.od-ch__eyebrow {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
  margin-bottom: 14px;
}

.od-ch__title {
  margin: 0 0 14px;
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 800;
  letter-spacing: -0.025em;
  color: var(--vp-c-text-1);
  border: 0 !important; padding-top: 0 !important; margin-top: 0 !important;
}

.od-ch__sub {
  max-width: 620px;
  margin: 0 auto;
  font-size: 16px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.od-ch__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 14px;
}

@media (max-width: 880px) {
  .od-ch__grid { grid-template-columns: repeat(4, 1fr); }
}

@media (max-width: 520px) {
  .od-ch__grid { grid-template-columns: repeat(3, 1fr); }
}

.od-ch__foot { text-align: center; margin-top: 36px; }

.od-ch__link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--vp-c-brand-1);
  font-weight: 600;
  font-size: 14.5px;
  text-decoration: none;
  transition: color 0.16s ease;
}

.od-ch__link span { transition: transform 0.16s ease; }
.od-ch__link:hover span { transform: translateX(4px); }
.od-ch__link:hover { color: var(--vp-c-brand-2); }
</style>
