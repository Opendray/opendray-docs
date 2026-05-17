<template>
  <section class="od-ch">
    <div class="od-ch__inner">
      <div class="od-ch__head">
        <div class="od-ch__eyebrow">{{ t.eyebrow }}</div>
        <h2 class="od-ch__title">{{ t.title }}</h2>
        <p class="od-ch__sub">{{ t.sub }}</p>
      </div>

      <div class="od-ch__layout">
        <!-- Left: logo grid -->
        <div class="od-ch__grid">
          <ChannelLogo
            v-for="c in channels"
            :key="c"
            :kind="c"
          />
        </div>

        <!-- Right: real channels-kind-picker screenshot proves it -->
        <figure class="od-ch__shot">
          <div class="od-ch__shot-chrome">
            <span class="od-ch__shot-dot od-ch__shot-dot--r" />
            <span class="od-ch__shot-dot od-ch__shot-dot--y" />
            <span class="od-ch__shot-dot od-ch__shot-dot--g" />
            <div class="od-ch__shot-addr">{{ t.regCh }}</div>
          </div>
          <img
            src="/tutorial/channels-kind-picker.png"
            :alt="t.alt"
            width="720" height="900"
            loading="lazy"
          />
          <figcaption class="od-ch__shot-cap">{{ t.shotCap }}</figcaption>
        </figure>
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
                  'dingtalk', 'wecom', 'wechat', 'bridge'] as const

const t = computed(() => isZh.value ? {
  eyebrow: '8 个平台 · 全部已实现',
  title: '所有人都在用的聊天工具,通通搞定。',
  sub: '不是"先做 Telegram 其他在路上",是 8 个平台在 internal/channel/<name>/ 里都有真实代码。下面右图是后台真实的 channel kind 选择器。',
  cta: '查看频道接入文档',
  regCh: '注册频道 · Kind 选择器',
  shotCap: '真实截图 · Telegram / Slack / Discord / 飞书 / 钉钉 / 企业微信 / 个人微信 / bridge — 都在下拉里。',
  alt: 'opendray 频道注册对话框 · 8 个平台下拉列表',
} : {
  eyebrow: '8 platforms · all implemented',
  title: 'Talk to your sessions where your team lives.',
  sub: 'Not "Telegram first, others later" — all 8 are real Go code under internal/channel/<name>/. The screenshot on the right is the actual channel-kind picker in the admin.',
  cta: 'Channel setup guides',
  regCh: 'Register channel · kind picker',
  shotCap: 'Real screenshot · Telegram / Slack / Discord / Feishu / DingTalk / WeCom / WeChat / bridge — all in the dropdown.',
  alt: 'opendray channel registration dialog with 8-platform dropdown',
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
  max-width: 1280px;
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
  max-width: 660px;
  margin: 0 auto;
  font-size: 16px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.od-ch__layout {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 36px;
  align-items: center;
}

@media (max-width: 920px) {
  .od-ch__layout { grid-template-columns: 1fr; gap: 32px; }
}

.od-ch__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

@media (max-width: 520px) {
  .od-ch__grid { grid-template-columns: repeat(3, 1fr); }
}

/* shot frame */
.od-ch__shot {
  margin: 0;
  border-radius: 14px;
  background: #0d0e1a;
  border: 1px solid rgba(126, 20, 255, 0.22);
  overflow: hidden;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.1),
    0 18px 50px -22px rgba(126, 20, 255, 0.32),
    0 8px 24px -12px rgba(0, 0, 0, 0.24);
}

.od-ch__shot-chrome {
  display: flex; align-items: center;
  height: 30px;
  padding: 0 12px;
  gap: 8px;
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.od-ch__shot-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.od-ch__shot-dot--r { background: #ff5f57; }
.od-ch__shot-dot--y { background: #febc2e; }
.od-ch__shot-dot--g { background: #28c840; }

.od-ch__shot-addr {
  flex: 1;
  text-align: center;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  font-family: var(--vp-font-family-base);
}

.od-ch__shot img {
  width: 100%;
  height: auto;
  display: block;
  line-height: 0;
}

.od-ch__shot-cap {
  padding: 10px 14px 12px;
  font-size: 11.5px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.55);
  font-family: var(--vp-font-family-base);
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.od-ch__foot { text-align: center; margin-top: 48px; }

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
