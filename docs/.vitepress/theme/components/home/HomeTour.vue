<template>
  <section class="od-tour">
    <div class="od-tour__inner">
      <div class="od-tour__head">
        <div class="od-tour__eyebrow">{{ t.eyebrow }}</div>
        <h2 class="od-tour__title">{{ t.title }}</h2>
        <p class="od-tour__sub">{{ t.sub }}</p>
      </div>

      <div class="od-tour__body">
        <!-- left: tab list -->
        <div class="od-tour__nav" role="tablist">
          <button
            v-for="(s, i) in shots"
            :key="s.id"
            :class="['od-tour__nav-item', { 'is-active': active === i }]"
            :aria-selected="active === i"
            role="tab"
            @click="active = i"
          >
            <span class="od-tour__nav-num">0{{ i + 1 }}</span>
            <div class="od-tour__nav-body">
              <div class="od-tour__nav-title">
                <span class="od-tour__nav-glyph">{{ s.glyph }}</span>
                {{ s.title }}
              </div>
              <div class="od-tour__nav-text">{{ s.subtitle }}</div>
            </div>
          </button>
        </div>

        <!-- right: rendered shot -->
        <div class="od-tour__stage">
          <figure class="od-tour__shot">
            <div class="od-tour__chrome">
              <span class="od-tour__dot od-tour__dot--r" />
              <span class="od-tour__dot od-tour__dot--y" />
              <span class="od-tour__dot od-tour__dot--g" />
              <div class="od-tour__addr">
                <span class="od-tour__addr-lock">🔒</span>
                opendray.local
                <span class="od-tour__addr-path">{{ shots[active].path }}</span>
              </div>
              <div class="od-tour__badge">
                {{ shots[active].badge }}
              </div>
            </div>
            <div class="od-tour__media" :key="active">
              <img
                :src="shots[active].src"
                :alt="shots[active].alt"
                width="1440" height="900"
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption class="od-tour__cap">{{ shots[active].caption }}</figcaption>
          </figure>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useData } from 'vitepress'

const { lang } = useData()
const isZh = computed(() => lang.value?.startsWith('zh'))

const active = ref(0)

const t = computed(() => isZh.value ? {
  eyebrow: '产品全貌 · 真实截图',
  title: '点 5 下,看完整个后台。',
  sub: '从启动会话、配置 provider、接消息平台、注册外部 app、到查审计日志 —— 5 张实拍覆盖核心 5 个工作流。左侧选项点一下,右图即换。',
} : {
  eyebrow: 'Product tour · real screenshots',
  title: 'Five clicks. The whole admin.',
  sub: 'From spawning a session, configuring a provider, wiring a messenger, registering an external app, to reading the audit log — five real screenshots covering the five core workflows. Click a tab on the left, the shot swaps on the right.',
})

const shots = computed(() => isZh.value ? [
  {
    id: 'spawn',
    glyph: '🚀',
    path: '/sessions/new',
    title: '启动会话',
    subtitle: '一键起 Claude Code / Codex / Gemini / Shell',
    badge: 'Sessions',
    src: '/tutorial/spawn-dialog.png',
    alt: 'opendray spawn session dialog showing four providers',
    caption: '4 个 provider 内置 · 多 Claude 账号切换 · 可浏览工作目录 · 命令行参数自由 override。Session 起来后即写入 PTY,1MB ring buffer 可断线重连。',
  },
  {
    id: 'providers',
    glyph: '🧠',
    path: '/providers',
    title: 'Provider 配置',
    subtitle: '权限 / 超时 / 路径 / 跳过确认 全部声明式',
    badge: 'Providers',
    src: '/tutorial/providers-layout.png',
    alt: 'opendray providers config page with Claude Code details',
    caption: 'Anthropic 认证 / Bypass permissions / Max turns / 命令路径 / Extra CLI args / Skills 开关 —— 每个 provider 一份独立配置,即时生效不重启。',
  },
  {
    id: 'channels',
    glyph: '💬',
    path: '/channels/new',
    title: '消息平台接入',
    subtitle: '8 个 kind 全部已实现 · 通知粒度按事件勾选',
    badge: 'Channels',
    src: '/tutorial/channels-notifications-panel.png',
    alt: 'channel notifications panel showing Telegram config',
    caption: '按事件订阅(session.started / idle / ended)· repeat policy 防止刷屏 · terminal snippet 直接把终端最近几行嵌进通知 —— 每个 channel 独立配置。',
  },
  {
    id: 'integrations',
    glyph: '🔌',
    path: '/integrations',
    title: '集成 · 反向代理',
    subtitle: '你写的 app 注册 = scope key + 反代路径 + 健康监测',
    badge: 'Integrations',
    src: '/tutorial/integrations-layout.png',
    alt: 'opendray integrations page showing registered apps and proxy paths',
    caption: '每个集成拿独立 API key、scope 限权(session:read / event:subscribe:*)、/api/v1/proxy/<prefix>/* 反代,opendray 每 30s 健康探活,一键 rotate key。',
  },
  {
    id: 'activity',
    glyph: '📡',
    path: '/activity',
    title: '调用审计',
    subtitle: '每条 API call 留底,按 integration / direction / status 筛选',
    badge: 'Activity',
    src: '/tutorial/activity-layout.png',
    alt: 'opendray activity audit log page',
    caption: '入站 / 出站 / 反代调用全部审计,记录 latency、resource_kind/id、status。集成出问题先来这查,合规 trail 同一张表。',
  },
] : [
  {
    id: 'spawn',
    glyph: '🚀',
    path: '/sessions/new',
    title: 'Spawn a session',
    subtitle: 'One click to start Claude Code / Codex / Gemini / Shell',
    badge: 'Sessions',
    src: '/tutorial/spawn-dialog.png',
    alt: 'opendray spawn session dialog showing four providers',
    caption: '4 providers built in · switch between multiple Claude accounts · browsable cwd · override CLI args freely. Sessions write to PTY with a 1MB ring buffer — reconnect any time.',
  },
  {
    id: 'providers',
    glyph: '🧠',
    path: '/providers',
    title: 'Provider config',
    subtitle: 'Auth / timeouts / paths / bypass — declarative',
    badge: 'Providers',
    src: '/tutorial/providers-layout.png',
    alt: 'opendray providers config page with Claude Code details',
    caption: 'Anthropic auth / bypass permissions / max turns / command path / extra CLI args / skills toggle — each provider its own profile, hot-reload, no restart needed.',
  },
  {
    id: 'channels',
    glyph: '💬',
    path: '/channels/new',
    title: 'Channel wiring',
    subtitle: 'All 8 kinds implemented · per-event notification controls',
    badge: 'Channels',
    src: '/tutorial/channels-notifications-panel.png',
    alt: 'channel notifications panel showing Telegram config',
    caption: 'Subscribe per event (session.started / idle / ended) · repeat policy keeps your phone quiet · embed the last N lines of terminal output into the notification — every channel configured independently.',
  },
  {
    id: 'integrations',
    glyph: '🔌',
    path: '/integrations',
    title: 'Integrations · reverse proxy',
    subtitle: 'Your app registers → scoped key + proxy path + health probe',
    badge: 'Integrations',
    src: '/tutorial/integrations-layout.png',
    alt: 'opendray integrations page showing registered apps and proxy paths',
    caption: 'Each integration gets its own API key, scoped permissions (session:read / event:subscribe:*), an /api/v1/proxy/<prefix>/* reverse-proxy mount, 30s health probe, and one-click key rotation.',
  },
  {
    id: 'activity',
    glyph: '📡',
    path: '/activity',
    title: 'Call audit',
    subtitle: 'Every API call logged · filter by integration / direction / status',
    badge: 'Activity',
    src: '/tutorial/activity-layout.png',
    alt: 'opendray activity audit log page',
    caption: 'Inbound / outbound / proxied calls all audited with latency, resource_kind/id, status. First stop when an integration misbehaves. Same table is the compliance trail.',
  },
])
</script>

<style scoped>
.od-tour {
  padding: 80px 24px;
  background:
    radial-gradient(ellipse 100% 60% at 50% 100%,
      rgba(126, 20, 255, 0.06), transparent 70%),
    var(--vp-c-bg);
}

.dark .od-tour {
  background:
    radial-gradient(ellipse 100% 60% at 50% 100%,
      rgba(126, 20, 255, 0.14), transparent 70%),
    var(--vp-c-bg);
}

.od-tour__inner {
  max-width: 1280px;
  margin: 0 auto;
}

.od-tour__head { text-align: center; margin-bottom: 48px; }

.od-tour__eyebrow {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
  margin-bottom: 14px;
}

.od-tour__title {
  margin: 0 0 14px;
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 800;
  letter-spacing: -0.025em;
  color: var(--vp-c-text-1);
  border: 0 !important; padding-top: 0 !important; margin-top: 0 !important;
}

.od-tour__sub {
  max-width: 660px;
  margin: 0 auto;
  font-size: 16px;
  line-height: 1.65;
  color: var(--vp-c-text-2);
}

.od-tour__body {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  align-items: flex-start;
}

@media (max-width: 920px) {
  .od-tour__body { grid-template-columns: 1fr; gap: 20px; }
}

.od-tour__nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.od-tour__nav-item {
  display: flex;
  gap: 14px;
  padding: 14px 16px;
  text-align: left;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.16s ease;
  font: inherit;
  color: inherit;
  align-items: flex-start;
}

.od-tour__nav-item:hover {
  border-color: var(--vp-c-brand-3);
  background: var(--vp-c-bg);
}

.od-tour__nav-item.is-active {
  border-color: var(--vp-c-brand-2);
  background: var(--vp-c-bg);
  box-shadow: 0 8px 24px -10px rgba(126, 20, 255, 0.32);
}

.od-tour__nav-num {
  font-family: var(--vp-font-family-mono);
  font-weight: 700;
  font-size: 12px;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
  width: 24px;
  letter-spacing: -0.01em;
}

.od-tour__nav-item.is-active .od-tour__nav-num {
  color: var(--vp-c-brand-1);
}

.od-tour__nav-body { flex: 1; min-width: 0; }

.od-tour__nav-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.005em;
  color: var(--vp-c-text-1);
  margin-bottom: 3px;
}

.od-tour__nav-glyph {
  font-size: 14px;
  line-height: 1;
}

.od-tour__nav-text {
  font-size: 12.5px;
  line-height: 1.45;
  color: var(--vp-c-text-3);
}

.od-tour__stage {
  position: sticky;
  top: 80px;
}

@media (max-width: 920px) {
  .od-tour__stage { position: static; }
}

.od-tour__shot {
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

.od-tour__chrome {
  display: flex; align-items: center;
  height: 34px;
  padding: 0 14px;
  gap: 10px;
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.od-tour__dot { width: 11px; height: 11px; border-radius: 50%; flex-shrink: 0; }
.od-tour__dot--r { background: #ff5f57; }
.od-tour__dot--y { background: #febc2e; }
.od-tour__dot--g { background: #28c840; }

.od-tour__addr {
  flex: 1;
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
  font-family: var(--vp-font-family-base);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.od-tour__addr-lock { font-size: 10px; margin-right: 4px; }
.od-tour__addr-path { color: rgba(255, 255, 255, 0.4); }

.od-tour__badge {
  display: inline-flex; align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(126, 20, 255, 0.24), rgba(71, 191, 255, 0.18));
  border: 1px solid rgba(184, 150, 255, 0.32);
  color: #ede6ff;
  font-size: 10.5px;
  font-weight: 700;
  font-family: var(--vp-font-family-base);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  flex-shrink: 0;
}

.od-tour__media {
  background: #0d0e1a;
  line-height: 0;
  animation: od-tour-fade 0.3s ease;
}

@keyframes od-tour-fade {
  from { opacity: 0; transform: translateY(2px); }
  to { opacity: 1; transform: translateY(0); }
}

.od-tour__media img {
  width: 100%;
  height: auto;
  display: block;
}

.od-tour__cap {
  padding: 12px 16px 14px;
  font-size: 12.5px;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.62);
  font-family: var(--vp-font-family-base);
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  letter-spacing: -0.005em;
}
</style>
