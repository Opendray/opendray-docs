<template>
  <section class="od-ft">
    <div class="od-ft__inner">
      <div class="od-ft__head">
        <div class="od-ft__eyebrow">{{ t.eyebrow }}</div>
        <h2 class="od-ft__title">{{ t.title }}</h2>
        <p class="od-ft__sub">{{ t.sub }}</p>
      </div>

      <div class="od-ft__grid">
        <FeatureCard
          v-for="f in features"
          :key="f.title"
          :icon="f.icon"
          :title="f.title"
          :details="f.details"
          :hue="f.hue"
          :href="f.href"
          :badge="f.badge"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import FeatureCard from '../FeatureCard.vue'

const { lang } = useData()
const isZh = computed(() => lang.value?.startsWith('zh'))

const t = computed(() => isZh.value ? {
  eyebrow: '为什么选 opendray',
  title: '不只是把 CLI 套个壳。',
  sub: '从远程会话、消息桥接、本地记忆到插件系统 —— 每个能力都是为长跑型 AI 工作流设计的。',
} : {
  eyebrow: 'Why opendray',
  title: 'More than a CLI wrapper.',
  sub: 'Remote sessions, multi-platform messaging, local-first memory, and a plugin system — built end-to-end for long-running AI workflows.',
})

const features = computed(() => isZh.value ? [
  { icon: '🛰️', hue: 'purple' as const,
    title: '远程会话', href: '/zh/sessions/overview',
    details: '在服务器上跑长耗时 CLI 会话,从手机/平板/另一台机器实时操控。完整 PTY、多客户端镜像、断线重连。' },
  { icon: '💬', hue: 'sky' as const,
    title: '6+ 消息平台', href: '/zh/channels/overview',
    details: 'Telegram / Slack / Discord / 飞书 / 钉钉 / 企业微信 + Bridge 自定义协议。回复直接喂回 stdin。' },
  { icon: '🧠', hue: 'pink' as const,
    title: '本地优先记忆', href: '/zh/memory/overview', badge: 'NEW',
    details: 'ONNX / Ollama / LM Studio 三选一做嵌入。跨用户、项目、会话三层检索 + 智能排序 + 冲突检测。' },
  { icon: '🔌', hue: 'green' as const,
    title: '集成 API', href: '/zh/consuming/overview',
    details: 'REST + WebSocket 接口给你做自己的客户端。Scope 化 API key、审计日志、反向代理挂载。' },
  { icon: '📓', hue: 'amber' as const,
    title: '笔记 + Wiki 链接', href: '/zh/notes/overview',
    details: 'Markdown 笔记 + 双向 wiki 链接 + 源码/预览编辑器 + git 同步 vault,跟 Claude 共用一个知识库。' },
  { icon: '🧩', hue: 'purple' as const,
    title: '插件 & Skills', href: '/zh/plugins/overview',
    details: 'Skills、MCP 服务器、Git 主机适配器 —— 不 fork 就能扩展能力,接入即对所有会话生效。' },
] : [
  { icon: '🛰️', hue: 'purple' as const,
    title: 'Remote sessions', href: '/sessions/overview',
    details: 'Spawn long-running CLI sessions on a server. Drive them from a phone or tablet. Full PTY, multi-client mirroring, reconnect.' },
  { icon: '💬', hue: 'sky' as const,
    title: '6+ messengers', href: '/channels/overview',
    details: 'Telegram / Slack / Discord / Feishu / DingTalk / WeCom + a Bridge adapter. Reply text flows back into the session’s stdin.' },
  { icon: '🧠', hue: 'pink' as const,
    title: 'Local-first memory', href: '/memory/overview', badge: 'NEW',
    details: 'Embeddings via local ONNX, Ollama, or LM Studio. Cross-layer retrieval (user / project / session) with smart ranking.' },
  { icon: '🔌', hue: 'green' as const,
    title: 'Integration API', href: '/consuming/overview',
    details: 'REST + WebSocket surface for building your own client. Scoped API keys, audit logs, reverse-proxy mounts.' },
  { icon: '📓', hue: 'amber' as const,
    title: 'Notes & wiki-links', href: '/notes/overview',
    details: 'Markdown notes with bi-directional wiki links, dual-pane editor, git-synced vault. The same vault Claude can read back.' },
  { icon: '🧩', hue: 'purple' as const,
    title: 'Plugins & Skills', href: '/plugins/overview',
    details: 'Skills, MCP servers, Git host adapters — extend opendray without forking. Capabilities propagate to every session.' },
])
</script>

<style scoped>
.od-ft {
  padding: 80px 24px;
}

.od-ft__inner {
  max-width: 1280px;
  margin: 0 auto;
}

.od-ft__head { text-align: center; margin-bottom: 48px; }

.od-ft__eyebrow {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
  margin-bottom: 14px;
}

.od-ft__title {
  margin: 0 0 14px;
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 800;
  letter-spacing: -0.025em;
  color: var(--vp-c-text-1);
  border: 0 !important; padding-top: 0 !important; margin-top: 0 !important;
}

.od-ft__sub {
  max-width: 620px;
  margin: 0 auto;
  font-size: 16px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.od-ft__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

@media (max-width: 980px) {
  .od-ft__grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 600px) {
  .od-ft__grid { grid-template-columns: 1fr; }
}
</style>
