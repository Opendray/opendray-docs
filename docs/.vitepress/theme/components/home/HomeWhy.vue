<template>
  <section class="od-why">
    <div class="od-why__inner">
      <div class="od-why__head">
        <div class="od-why__eyebrow">{{ t.eyebrow }}</div>
        <h2 class="od-why__title">{{ t.title }}</h2>
        <p class="od-why__sub">{{ t.sub }}</p>
      </div>

      <div class="od-why__grid">
        <div
          v-for="card in cards"
          :key="card.id"
          class="od-why__card"
        >
          <div class="od-why__card-head">
            <span class="od-why__card-glyph" aria-hidden="true">
              {{ card.glyph }}
            </span>
            <h3 class="od-why__card-title">{{ card.title }}</h3>
          </div>

          <div class="od-why__cmp">
            <div class="od-why__cmp-side od-why__cmp-side--us">
              <div class="od-why__cmp-label">
                <span class="od-why__cmp-pill od-why__cmp-pill--us">
                  opendray
                </span>
              </div>
              <div class="od-why__cmp-text">{{ card.us }}</div>
            </div>
            <div class="od-why__cmp-side od-why__cmp-side--them">
              <div class="od-why__cmp-label">
                <span class="od-why__cmp-pill od-why__cmp-pill--them">
                  {{ card.themLabel }}
                </span>
              </div>
              <div class="od-why__cmp-text od-why__cmp-text--mute">
                {{ card.them }}
              </div>
            </div>
          </div>

          <div class="od-why__card-foot">
            <span class="od-why__card-tag" v-for="tag in card.tags" :key="tag">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { lang } = useData()
const isZh = computed(() => lang.value?.startsWith('zh'))

const t = computed(() => isZh.value ? {
  eyebrow: '为什么是 opendray',
  title: '三件别人不做的事。',
  sub: '市面上"AI 编程"工具一大堆,但要么是 SaaS、要么是单机 wrapper、要么是 chat bot 三选一。opendray 是个人 AI 基础设施 —— 这三张卡讲它跟主流方案的真正区别。',
} : {
  eyebrow: 'Why opendray',
  title: 'Three things nobody else does.',
  sub: 'The AI-coding tool category is crowded. Most are SaaS, single-machine wrappers, or chat bots — pick one. opendray is personal AI infrastructure. The three contrasts below show how it differs from the mainstream.',
})

const cards = computed(() => isZh.value ? [
  {
    id: 'cost-arbitrage',
    glyph: '💰',
    title: '一份订阅,N 个 app 共用',
    themLabel: '按 token 计费的 API',
    us: '本地一台 opendray wrap 你的 Claude Code(走 Claude Pro $20/mo)。你写的 pettracker / materialscout / shoponline 等等,都通过 opendray 的集成 API + scope key 调用,共享同一份订阅。下个项目 += 0 美元。',
    them: '每个 app 单独接 Anthropic / OpenAI API,按 token 计费。3 个 app 跑起来每月可能就是几百刀,10 个项目几乎一定要上千。每多一个项目就要重新算账。',
    tags: ['$20/mo 封顶', '反向代理 /api/v1/proxy/<prefix>', 'scope-限权 API key'],
  },
  {
    id: 'personal-infra',
    glyph: '🏠',
    title: '一个人就能拥有的"基础设施"',
    themLabel: '企业级 / 多租户平台',
    us: '单 Go 二进制,跑在自家 LXC / Docker / Synology / Pi。Web 后台 + Flutter 移动 app + REST/WS API + 8 个消息平台 + 笔记 vault + 加密备份 —— 没有 k8s、没有 RBAC、不用付 SaaS。',
    them: '为团队设计的产品上 k8s 集群、多租户、SSO、合规审计...单人 self-host 要么装不动,要么 owners-cost 一周起步。SaaS 替代品要么数据上云、要么订阅叠加。',
    tags: ['单二进制 ≤ 50MB', '15+ 后台页面', '自家硬件即可'],
  },
  {
    id: 'cross-cli-mem',
    glyph: '🧠',
    title: 'CLI 换了,记忆还在',
    themLabel: '换 CLI 等于换大脑',
    us: '项目记忆按 scope(session / project / global)存,跨 Claude / Codex / Gemini 自动共享。Session 结束时 auto-capture 写入,summarizer worker 后台浓缩,下次任意 CLI 在同一 cwd 自动召回。',
    them: '每个 CLI 一个独立黑盒。换 Codex 重新解释项目;换回 Claude 再讲一遍。要保留上下文只能手动维护 git CLAUDE.md,人工同步几个不同 CLI 的配置文件。',
    tags: ['BM25 / Ollama / ONNX 三选一', 'auto-capture + summarize', '冲突检测'],
  },
] : [
  {
    id: 'cost-arbitrage',
    glyph: '💰',
    title: 'One subscription. N apps. Done.',
    themLabel: 'Per-token API billing',
    us: 'Local opendray wraps your Claude Code (running on your Claude Pro at $20/mo). pettracker / materialscout / shoponline / your next project all call opendray\'s integration API with scoped keys — sharing that one subscription. Next project = $0 more.',
    them: 'Each app wires up Anthropic / OpenAI directly, billed per token. Three apps could be hundreds/month; ten basically guarantee thousands. Every new project means re-doing the math.',
    tags: ['$20/mo capped', 'reverse-proxy /api/v1/proxy/<prefix>', 'scoped API keys'],
  },
  {
    id: 'personal-infra',
    glyph: '🏠',
    title: 'Infrastructure one person can own',
    themLabel: 'Enterprise / multi-tenant platforms',
    us: 'One Go binary on your LXC / Docker / Synology / Pi. Web admin + Flutter mobile app + REST/WS API + 8 messengers + notes vault + encrypted backup — no k8s, no RBAC, no SaaS subscription stack.',
    them: 'Team-grade products bring k8s clusters, multi-tenancy, SSO, compliance audits. Solo self-host either won\'t stand up or burns a week of ops time. SaaS alternatives push your data to the cloud or stack subscriptions.',
    tags: ['single binary ≤ 50MB', '15+ admin pages', 'runs on your hardware'],
  },
  {
    id: 'cross-cli-mem',
    glyph: '🧠',
    title: 'Switch CLIs. Memory stays.',
    themLabel: 'New CLI = new brain',
    us: 'Project memory is scope-keyed (session / project / global), auto-shared across Claude / Codex / Gemini. Auto-capture writes on session end, summarizer workers compact in the background, the next CLI in the same cwd recalls automatically.',
    them: 'Each CLI is an isolated black box. Switch to Codex → re-explain project. Back to Claude → explain again. To preserve context you maintain a hand-edited git CLAUDE.md and sync N different per-CLI config files.',
    tags: ['BM25 / Ollama / ONNX', 'auto-capture + summarize', 'conflict detection'],
  },
])
</script>

<style scoped>
.od-why {
  padding: 80px 24px;
  background:
    radial-gradient(ellipse 100% 60% at 50% 0%,
      rgba(126, 20, 255, 0.06), transparent 70%),
    var(--vp-c-bg);
}

.dark .od-why {
  background:
    radial-gradient(ellipse 100% 60% at 50% 0%,
      rgba(126, 20, 255, 0.14), transparent 70%),
    var(--vp-c-bg);
}

.od-why__inner {
  max-width: 1280px;
  margin: 0 auto;
}

.od-why__head { text-align: center; margin-bottom: 56px; }

.od-why__eyebrow {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
  margin-bottom: 14px;
}

.od-why__title {
  margin: 0 0 14px;
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 800;
  letter-spacing: -0.025em;
  color: var(--vp-c-text-1);
  border: 0 !important;
  padding-top: 0 !important;
  margin-top: 0 !important;
}

.od-why__sub {
  max-width: 700px;
  margin: 0 auto;
  font-size: 16px;
  line-height: 1.65;
  color: var(--vp-c-text-2);
}

.od-why__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

@media (max-width: 980px) {
  .od-why__grid { grid-template-columns: 1fr; }
}

.od-why__card {
  padding: 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background: var(--vp-c-bg);
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.22s ease;
}

.dark .od-why__card {
  background: rgba(255, 255, 255, 0.02);
}

.od-why__card:hover {
  border-color: var(--vp-c-brand-2);
  transform: translateY(-3px);
  box-shadow:
    0 1px 2px rgba(126, 20, 255, 0.08),
    0 14px 36px -12px rgba(126, 20, 255, 0.22);
}

.od-why__card-head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.od-why__card-glyph {
  font-size: 26px;
  line-height: 1;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg,
    rgba(126, 20, 255, 0.16),
    rgba(71, 191, 255, 0.06));
  border-radius: 12px;
}

.od-why__card-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.015em;
  color: var(--vp-c-text-1);
  line-height: 1.3;
}

.od-why__cmp {
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: 8px;
  border-radius: 10px;
  overflow: hidden;
}

.od-why__cmp-side {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-radius: 10px;
}

.od-why__cmp-side--us {
  background: linear-gradient(135deg,
    rgba(126, 20, 255, 0.08),
    rgba(71, 191, 255, 0.04));
  border: 1px solid rgba(126, 20, 255, 0.24);
}

.od-why__cmp-side--them {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
}

.od-why__cmp-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.od-why__cmp-pill--us {
  background: linear-gradient(135deg, var(--od-purple-500), var(--od-sky-500));
  color: #ffffff;
}

.od-why__cmp-pill--them {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-3);
  border: 1px solid var(--vp-c-divider);
}

.od-why__cmp-text {
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--vp-c-text-1);
}

.od-why__cmp-text--mute {
  color: var(--vp-c-text-3);
}

.od-why__card-foot {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  border-top: 1px dashed var(--vp-c-divider);
  padding-top: 14px;
}

.od-why__card-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  font-size: 11.5px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
  letter-spacing: -0.005em;
}
</style>
