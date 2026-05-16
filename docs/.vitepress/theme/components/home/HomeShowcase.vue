<template>
  <section class="od-sc">
    <div class="od-sc__inner">
      <div class="od-sc__head">
        <div class="od-sc__eyebrow">{{ t.eyebrow }}</div>
        <h2 class="od-sc__title">{{ t.title }}</h2>
        <p class="od-sc__sub">{{ t.sub }}</p>
      </div>

      <div class="od-sc__grid">
        <!-- left column: scenario list -->
        <div class="od-sc__menu">
          <button
            v-for="(s, i) in scenarios"
            :key="s.id"
            :class="['od-sc__item', { 'is-active': active === i }]"
            @click="active = i"
          >
            <div class="od-sc__item-num">0{{ i + 1 }}</div>
            <div class="od-sc__item-body">
              <div class="od-sc__item-title">{{ s.title }}</div>
              <div class="od-sc__item-text">{{ s.text }}</div>
            </div>
          </button>
        </div>

        <!-- right column: rendered scenario -->
        <div class="od-sc__stage">
          <div class="od-sc__chrome">
            <div class="od-sc__dots">
              <span class="od-sc__dot od-sc__dot--r" />
              <span class="od-sc__dot od-sc__dot--y" />
              <span class="od-sc__dot od-sc__dot--g" />
            </div>
            <div class="od-sc__chrome-tag">{{ scenarios[active].tag }}</div>
          </div>
          <div class="od-sc__body" :key="active">
            <div
              v-for="(line, idx) in scenarios[active].lines"
              :key="idx"
              :class="['od-sc__line', `od-sc__line--${line.k}`]"
            >
              <span class="od-sc__pre">{{ prefixOf(line.k) }}</span>
              <span class="od-sc__txt" v-html="line.t" />
            </div>
          </div>
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

const t = computed(() => isZh.value ? {
  eyebrow: '真实场景',
  title: '不是 Demo,是日常用法。',
  sub: '从早上六点收到 Telegram 通知,到晚上 11 点从手机批准一次部署 —— opendray 把所有 AI 编程动作搬进消息流。',
} : {
  eyebrow: 'Real workflows',
  title: 'Not demos. Daily driving.',
  sub: 'From a 6am Telegram ping to an 11pm phone-approval before a deploy — opendray puts every AI coding action into the messaging flow you already check.',
})

interface Line { k: 'cmd'|'out'|'ai'|'user'|'check'|'warn'; t: string }

interface Scenario {
  id: string
  title: string
  text: string
  tag: string
  lines: Line[]
}

const scenarios = computed<Scenario[]>(() => isZh.value ? [
  {
    id: 'spawn', title: '启动远程会话',
    text: '在服务器上拉一个 Claude Code,从手机操控它读代码。',
    tag: 'opendray spawn',
    lines: [
      { k: 'cmd', t: 'opendray spawn claude --cwd ~/projects/payments' },
      { k: 'out', t: '<b>session</b> s_42 attached · pty 88×24 · provider <b>claude</b>' },
      { k: 'check', t: 'channel <b>telegram</b> bound · notifications: <i>idle/ask/done</i>' },
      { k: 'user', t: '> 看下 src/api/charge.ts 的错误处理' },
      { k: 'ai', t: 'Reading <b>src/api/charge.ts</b>... 看到第 47 行有个 try 没 catch unsealed errors' },
    ],
  },
  {
    id: 'notify', title: '推送通知到 Telegram',
    text: '会话进入 idle 或者请求确认时,你的手机会收到富格式卡片。',
    tag: 'telegram notification',
    lines: [
      { k: 'warn', t: '<b>[s_42]</b> Claude 想执行: <code>npm install playwright</code>' },
      { k: 'out', t: '上下文: <i>"为 login.test.ts 增加 e2e 测试"</i>' },
      { k: 'out', t: '风险: <i>新依赖 · 写 node_modules · 200MB</i>' },
      { k: 'cmd', t: '回复 <b>y</b> 允许 · <b>n</b> 拒绝 · <b>?</b> 让 Claude 解释一下' },
      { k: 'user', t: 'y' },
      { k: 'check', t: 'approved · session resumed' },
    ],
  },
  {
    id: 'memory', title: '跨项目记忆召回',
    text: '在新项目里聊到旧项目的事,opendray 自动从 user/project 层调出相关记忆。',
    tag: 'memory recall',
    lines: [
      { k: 'user', t: '> 这个 auth flow 跟之前 payments 项目一样,直接抄过来吧' },
      { k: 'check', t: '<b>memory recall</b> 命中 3 条:' },
      { k: 'out', t: '  · <b>[project:payments]</b> JWT refresh 实现 + 单测 · score 0.92' },
      { k: 'out', t: '  · <b>[user]</b> 偏好: refresh token 走 httpOnly cookie · score 0.78' },
      { k: 'out', t: '  · <b>[user]</b> 历史决定: 不用 NextAuth, 自建 · score 0.71' },
      { k: 'ai', t: '基于 payments 的 jwt-refresh 模式,我会用 httpOnly cookie 实现...' },
    ],
  },
  {
    id: 'multi', title: '多人协同审阅',
    text: '一个会话被多人同时盯着,任何人在 Slack 上回复都进 stdin,谁动谁负责。',
    tag: 'multi-client',
    lines: [
      { k: 'check', t: 'session <b>s_42</b> · viewers: <b>kev</b>, <b>alice</b>, <b>bob</b>' },
      { k: 'user', t: '<b>kev</b>: 这个 SQL 注入风险有么?' },
      { k: 'ai', t: '看了下,使用了参数化查询,没有 string concat,安全。' },
      { k: 'user', t: '<b>alice</b>: 那 ORM 那层呢?' },
      { k: 'ai', t: '检查 src/db/queries.ts...' },
      { k: 'check', t: '所有回复带 <b>@user</b> 标记 · 完整审计日志' },
    ],
  },
] : [
  {
    id: 'spawn', title: 'Spawn a remote session',
    text: 'Run Claude Code on a server. Drive it from your phone.',
    tag: 'opendray spawn',
    lines: [
      { k: 'cmd', t: 'opendray spawn claude --cwd ~/projects/payments' },
      { k: 'out', t: '<b>session</b> s_42 attached · pty 88×24 · provider <b>claude</b>' },
      { k: 'check', t: 'channel <b>telegram</b> bound · notifications: <i>idle/ask/done</i>' },
      { k: 'user', t: '> review error handling in src/api/charge.ts' },
      { k: 'ai', t: 'Reading <b>src/api/charge.ts</b>... line 47 has a try with no catch on unsealed errors' },
    ],
  },
  {
    id: 'notify', title: 'Push notifications anywhere',
    text: 'When the session goes idle or asks to confirm, you get a rich card on your phone.',
    tag: 'telegram notification',
    lines: [
      { k: 'warn', t: '<b>[s_42]</b> Claude wants to run: <code>npm install playwright</code>' },
      { k: 'out', t: 'context: <i>"add e2e tests for login.test.ts"</i>' },
      { k: 'out', t: 'risk: <i>new dep · writes node_modules · 200MB</i>' },
      { k: 'cmd', t: 'reply <b>y</b> to allow · <b>n</b> to deny · <b>?</b> to ask Claude' },
      { k: 'user', t: 'y' },
      { k: 'check', t: 'approved · session resumed' },
    ],
  },
  {
    id: 'memory', title: 'Cross-project memory recall',
    text: 'Mention an old project and opendray surfaces relevant user/project memories.',
    tag: 'memory recall',
    lines: [
      { k: 'user', t: '> auth flow is same as the payments project, copy it' },
      { k: 'check', t: '<b>memory recall</b> 3 hits:' },
      { k: 'out', t: '  · <b>[project:payments]</b> JWT refresh impl + unit tests · score 0.92' },
      { k: 'out', t: '  · <b>[user]</b> prefers refresh tokens via httpOnly cookie · score 0.78' },
      { k: 'out', t: '  · <b>[user]</b> historical: avoid NextAuth, roll our own · score 0.71' },
      { k: 'ai', t: 'Based on the payments jwt-refresh pattern, I will use httpOnly cookies...' },
    ],
  },
  {
    id: 'multi', title: 'Multi-client collaboration',
    text: 'Multiple viewers watch a session. Anyone can reply from Slack — actions are attributed.',
    tag: 'multi-client',
    lines: [
      { k: 'check', t: 'session <b>s_42</b> · viewers: <b>kev</b>, <b>alice</b>, <b>bob</b>' },
      { k: 'user', t: '<b>kev</b>: any SQL injection risk?' },
      { k: 'ai', t: 'Parameterized queries throughout, no string concat. Safe.' },
      { k: 'user', t: '<b>alice</b>: what about the ORM layer?' },
      { k: 'ai', t: 'Checking src/db/queries.ts...' },
      { k: 'check', t: 'every reply tagged <b>@user</b> · full audit log' },
    ],
  },
])

const active = ref(0)

function prefixOf(k: Line['k']): string {
  return ({
    cmd: '$', out: ' ', ai: '⌬', user: '›', check: '✓', warn: '!',
  } as const)[k]
}
</script>

<style scoped>
.od-sc {
  padding: 80px 24px;
  background:
    radial-gradient(ellipse 60% 60% at 50% 100%,
      rgba(126, 20, 255, 0.08), transparent 70%),
    var(--vp-c-bg);
}

.dark .od-sc {
  background:
    radial-gradient(ellipse 60% 60% at 50% 100%,
      rgba(126, 20, 255, 0.16), transparent 70%),
    var(--vp-c-bg);
}

.od-sc__inner {
  max-width: 1280px;
  margin: 0 auto;
}

.od-sc__head { text-align: center; margin-bottom: 48px; }

.od-sc__eyebrow {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
  margin-bottom: 14px;
}

.od-sc__title {
  margin: 0 0 14px;
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 800;
  letter-spacing: -0.025em;
  color: var(--vp-c-text-1);
  border: 0 !important; padding-top: 0 !important; margin-top: 0 !important;
}

.od-sc__sub {
  max-width: 620px;
  margin: 0 auto;
  font-size: 16px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.od-sc__grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
}

@media (max-width: 880px) {
  .od-sc__grid { grid-template-columns: 1fr; }
}

.od-sc__menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.od-sc__item {
  display: flex;
  gap: 14px;
  padding: 16px 18px;
  text-align: left;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.16s ease;
  font: inherit;
  color: inherit;
}

.od-sc__item:hover {
  border-color: var(--vp-c-brand-3);
  background: var(--vp-c-bg);
}

.od-sc__item.is-active {
  border-color: var(--vp-c-brand-2);
  background: var(--vp-c-bg);
  box-shadow: 0 8px 24px -10px rgba(126, 20, 255, 0.32);
}

.od-sc__item-num {
  font-family: var(--vp-font-family-mono);
  font-weight: 700;
  font-size: 13px;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
  width: 24px;
}

.od-sc__item.is-active .od-sc__item-num {
  color: var(--vp-c-brand-1);
}

.od-sc__item-title {
  font-size: 14.5px;
  font-weight: 700;
  letter-spacing: -0.005em;
  color: var(--vp-c-text-1);
  margin-bottom: 4px;
}

.od-sc__item-text {
  font-size: 13px;
  line-height: 1.5;
  color: var(--vp-c-text-3);
}

.od-sc__stage {
  border-radius: 14px;
  background: #0d0e1a;
  border: 1px solid rgba(126, 20, 255, 0.22);
  overflow: hidden;
  font-family: var(--vp-font-family-mono);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.18),
    0 18px 50px -22px rgba(126, 20, 255, 0.42),
    0 12px 32px -16px rgba(0, 0, 0, 0.42);
  min-height: 360px;
  display: flex;
  flex-direction: column;
}

.od-sc__chrome {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 14px;
  gap: 6px;
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.od-sc__dots { display: flex; gap: 6px; width: 60px; }
.od-sc__dot { width: 11px; height: 11px; border-radius: 50%; }
.od-sc__dot--r { background: #ff5f57; }
.od-sc__dot--y { background: #febc2e; }
.od-sc__dot--g { background: #28c840; }

.od-sc__chrome-tag {
  flex: 1;
  text-align: center;
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.5);
  font-family: var(--vp-font-family-base);
}

.od-sc__body {
  flex: 1;
  padding: 18px 22px 22px;
  font-size: 13px;
  line-height: 1.75;
  animation: od-sc-fade 0.35s ease;
}

@keyframes od-sc-fade {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.od-sc__line {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 1px 0;
}

.od-sc__pre {
  width: 16px;
  flex-shrink: 0;
  font-weight: 700;
  text-align: center;
  user-select: none;
}

.od-sc__line--cmd .od-sc__pre { color: #b896ff; }
.od-sc__line--cmd .od-sc__txt { color: #ffffff; }
.od-sc__line--out .od-sc__pre { opacity: 0; }
.od-sc__line--out .od-sc__txt { color: rgba(255, 255, 255, 0.66); }
.od-sc__line--ai .od-sc__pre { color: #47bfff; }
.od-sc__line--ai .od-sc__txt { color: #ede6ff; }
.od-sc__line--user .od-sc__pre { color: #fbbf24; }
.od-sc__line--user .od-sc__txt { color: #fef3c7; font-style: italic; }
.od-sc__line--check .od-sc__pre { color: #4ade80; }
.od-sc__line--check .od-sc__txt { color: #d1fae5; }
.od-sc__line--warn .od-sc__pre { color: #f87171; }
.od-sc__line--warn .od-sc__txt { color: #fecaca; }

.od-sc__txt :deep(b) { color: inherit; font-weight: 700; }
.od-sc__txt :deep(code) {
  background: rgba(126, 20, 255, 0.22);
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: #ede6ff;
}
</style>
