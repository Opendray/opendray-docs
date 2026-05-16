// Single source of truth for the documentation site's structure.
//
// Every entry maps to a markdown file at
//   docs/<group-id>/<slug>.md   (English, root locale)
//   docs/zh/<group-id>/<slug>.md (Simplified Chinese)
//
// Adding a page = appending an entry here. The sidebar in both
// locales is generated from this data, so nothing else needs editing
// (no manual sidebar arrays per locale).
//
// titleEn is the literal sidebar text in English. titleZh is read
// from the H1 of the corresponding zh markdown at build time — see
// `readH1` below. So translating a page = writing its zh file; the
// sidebar picks the title up automatically. If a zh file doesn't
// exist yet, the sidebar falls back to titleEn.
//
// SUPER-GROUPS (since v2 redesign):
// We also ship `SUPERGROUPS` — a 5-bucket layer above the 16 groups.
// Different top-nav items (Docs / Build / Operate / Reference …) bind
// to different super-groups so the sidebar focuses on what the user is
// currently doing, not the whole tree at once.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DOCS_ROOT = path.resolve(__dirname, '..')

export interface Section {
  slug: string
  titleEn: string
  /** optional inline badge: 'NEW' | 'BETA' | etc. — purely for sidebar UX */
  badge?: string
}

export interface Group {
  /** url segment, e.g. 'channels' → /channels/... */
  id: string
  labelEn: string
  labelZh: string
  /** unicode glyph rendered before the group label */
  icon: string
  sections: Section[]
}

/**
 * Top-level "super-groups" — the 5 buckets the user picks between in
 * the top nav. Each maps to a list of Group ids that should appear
 * in the sidebar when that super-group is active.
 */
export interface SuperGroup {
  id: string
  labelEn: string
  labelZh: string
  /** Group ids belonging to this super-group, in display order */
  groupIds: string[]
}

export const GROUPS: Group[] = [
  {
    id: 'getting-started',
    icon: '🚀',
    labelEn: 'Getting Started',
    labelZh: '开始使用',
    sections: [
      { slug: 'welcome', titleEn: 'Welcome to OpenDray' },
    ],
  },
  {
    id: 'sessions',
    icon: '🛰',
    labelEn: 'Sessions',
    labelZh: '会话 Sessions',
    sections: [
      { slug: 'overview', titleEn: 'Sessions — overview' },
      { slug: 'spawning', titleEn: 'Spawning a session' },
      { slug: 'inspector', titleEn: 'Inspector panel' },
      { slug: 'lifecycle', titleEn: 'Session lifecycle' },
      { slug: 'tabs', titleEn: 'Tabs & keyboard nav' },
      { slug: 'multi-client', titleEn: 'Multi-client session access' },
      { slug: 'git-workflow', titleEn: 'Git workflow' },
      { slug: 'mobile-git', titleEn: 'Mobile Git workflow' },
    ],
  },
  {
    id: 'channels',
    icon: '💬',
    labelEn: 'Channels',
    labelZh: '频道 Channels',
    sections: [
      { slug: 'overview', titleEn: 'Channels — overview' },
      { slug: 'telegram', titleEn: 'Telegram' },
      { slug: 'slack', titleEn: 'Slack' },
      { slug: 'discord', titleEn: 'Discord' },
      { slug: 'feishu', titleEn: 'Feishu (飞书 / Lark)' },
      { slug: 'dingtalk', titleEn: 'DingTalk (钉钉)' },
      { slug: 'wecom', titleEn: 'WeCom / Enterprise WeChat (企业微信)' },
      { slug: 'bridge', titleEn: 'Bridge — custom platforms via WebSocket' },
      { slug: 'notifications', titleEn: 'Notifications panel deep-dive' },
      { slug: 'routing', titleEn: 'Multi-session routing' },
    ],
  },
  {
    id: 'providers',
    icon: '🧠',
    labelEn: 'Providers',
    labelZh: '供应商 Providers',
    sections: [
      { slug: 'overview', titleEn: 'Providers — overview' },
      { slug: 'bundled', titleEn: 'Bundled providers' },
      { slug: 'custom', titleEn: 'Custom provider manifest' },
      { slug: 'claude-accounts', titleEn: 'Claude accounts' },
    ],
  },
  {
    id: 'plugins',
    icon: '🧩',
    labelEn: 'Plugins',
    labelZh: '插件 Plugins',
    sections: [
      { slug: 'overview', titleEn: 'Plugins — overview' },
      { slug: 'skills', titleEn: 'Skills' },
      { slug: 'mcp', titleEn: 'MCP servers' },
      { slug: 'git-hosts', titleEn: 'Git hosts' },
    ],
  },
  {
    id: 'notes',
    icon: '📓',
    labelEn: 'Notes',
    labelZh: '笔记 Notes',
    sections: [
      { slug: 'overview', titleEn: 'Notes — overview' },
      { slug: 'wiki-links', titleEn: 'Wiki links + backlinks' },
      { slug: 'vault-git-sync', titleEn: 'Vault git sync' },
      { slug: 'editor', titleEn: 'Note editor' },
    ],
  },
  {
    id: 'memory',
    icon: '🧬',
    labelEn: 'Memory',
    labelZh: '记忆 Memory',
    sections: [
      { slug: 'overview', titleEn: 'Memory — overview' },
      { slug: 'quickstart', titleEn: 'Quickstart' },
      { slug: 'scopes', titleEn: 'Scopes' },
      { slug: 'configuration', titleEn: 'Configuration' },
      { slug: 'mirror', titleEn: 'The Claude local-memory mirror' },
      { slug: 'troubleshooting', titleEn: 'Troubleshooting' },
      { slug: 'local-onnx', titleEn: 'Local ONNX embeddings' },
      { slug: 'ollama-walkthrough', titleEn: 'Ollama walkthrough' },
      { slug: 'lmstudio-walkthrough', titleEn: 'LM Studio walkthrough' },
      { slug: 'maintenance', titleEn: 'Memory — maintenance' },
    ],
  },
  {
    id: 'ambient-memory',
    icon: '🌫',
    labelEn: 'Ambient Memory',
    labelZh: '环境记忆',
    sections: [
      { slug: 'overview', titleEn: 'Ambient Memory — overview' },
      { slug: 'providers', titleEn: 'Ambient Memory — providers' },
      { slug: 'capture-rules', titleEn: 'Ambient Memory — capture rules' },
      { slug: 'injection', titleEn: 'Ambient Memory — injection profiles' },
    ],
  },
  {
    id: 'project-memory',
    icon: '📁',
    labelEn: 'Project Memory',
    labelZh: '项目记忆',
    sections: [
      { slug: 'overview', titleEn: 'Project memory — overview' },
      { slug: 'workflow', titleEn: 'Project memory — day-to-day workflow' },
      { slug: 'scanner-and-cleaner', titleEn: 'Scanner & cleaner — auto-managed memory' },
      { slug: 'reset-and-troubleshooting', titleEn: 'Reset & troubleshooting' },
    ],
  },
  {
    id: 'memory-workers',
    icon: '⚙',
    labelEn: 'Memory Workers',
    labelZh: '记忆 Worker',
    sections: [
      { slug: 'overview', titleEn: 'Memory workers — overview' },
      { slug: 'picking-a-worker', titleEn: 'Picking a worker per task' },
      { slug: 'verification', titleEn: 'Verification & metrics' },
    ],
  },
  {
    id: 'integrations',
    icon: '🔌',
    labelEn: 'Integrations',
    labelZh: '集成 Integrations',
    sections: [
      { slug: 'overview', titleEn: 'Integrations — overview' },
      { slug: 'auth-model', titleEn: 'Auth model' },
      { slug: 'reverse-proxy', titleEn: 'Reverse proxy' },
      { slug: 'call-log', titleEn: 'Call log' },
      { slug: 'events-ws', titleEn: 'Events WebSocket' },
    ],
  },
  {
    id: 'consuming',
    icon: '📦',
    labelEn: 'Consuming opendray',
    labelZh: '接入 opendray',
    sections: [
      { slug: 'overview', titleEn: 'Consuming opendray — overview' },
      { slug: 'quickstart', titleEn: 'Quickstart' },
      { slug: 'authentication', titleEn: 'Authentication' },
      { slug: 'rest-api', titleEn: 'REST API reference' },
      { slug: 'websocket-events', titleEn: 'Event subscriptions' },
      { slug: 'scopes', titleEn: 'Scopes reference' },
      { slug: 'key-rotation', titleEn: 'Key rotation' },
      { slug: 'typescript-sdk', titleEn: 'TypeScript SDK' },
      { slug: 'error-handling', titleEn: 'Error handling' },
    ],
  },
  {
    id: 'activity',
    icon: '📡',
    labelEn: 'Activity',
    labelZh: '活动 Activity',
    sections: [
      { slug: 'overview', titleEn: 'Activity — overview' },
      { slug: 'topics-catalogue', titleEn: 'Topics catalogue' },
    ],
  },
  {
    id: 'backup',
    icon: '💾',
    labelEn: 'Backups',
    labelZh: '备份 Backups',
    sections: [
      { slug: 'overview', titleEn: 'Backup — overview' },
      { slug: 'quickstart', titleEn: 'Backup — quickstart' },
      { slug: 'targets', titleEn: 'Backup — targets' },
      { slug: 'schedules', titleEn: 'Backup — schedules' },
      { slug: 'export', titleEn: 'Backup — exports (Plan C)' },
      { slug: 'restore-and-import', titleEn: 'Backup — restore (A) and import (C)' },
    ],
  },
  {
    id: 'settings',
    icon: '⚙',
    labelEn: 'Settings',
    labelZh: '设置 Settings',
    sections: [
      { slug: 'overview', titleEn: 'Settings — overview' },
      { slug: 'general', titleEn: 'General' },
      { slug: 'session-defaults', titleEn: 'Session defaults' },
      { slug: 'keyboard-and-theme', titleEn: 'Keyboard & theme' },
      { slug: 'logging', titleEn: 'Logging' },
      { slug: 'storage-paths', titleEn: 'Storage paths' },
      { slug: 'restart', titleEn: 'Restart' },
    ],
  },

  /* -------- new skeleton groups (Phase 5) -------- */
  {
    id: 'reference',
    icon: '📚',
    labelEn: 'API Reference',
    labelZh: 'API 参考',
    sections: [
      { slug: 'overview', titleEn: 'API Reference — overview' },
      { slug: 'rest', titleEn: 'REST endpoints', badge: 'BETA' },
      { slug: 'websocket', titleEn: 'WebSocket events', badge: 'BETA' },
      { slug: 'errors', titleEn: 'Error codes' },
      { slug: 'rate-limits', titleEn: 'Rate limits' },
    ],
  },
  {
    id: 'releases',
    icon: '📰',
    labelEn: 'Releases',
    labelZh: '版本动态',
    sections: [
      { slug: 'changelog', titleEn: 'Changelog' },
      { slug: 'roadmap', titleEn: 'Roadmap' },
      { slug: 'showcase', titleEn: 'Showcase', badge: 'NEW' },
    ],
  },
]

/**
 * Five user-facing buckets. The "current" super-group is decided by URL
 * prefix in `buildSidebar` so each top-nav item gets a focused sidebar.
 */
export const SUPERGROUPS: SuperGroup[] = [
  {
    id: 'docs',
    labelEn: 'Docs',
    labelZh: '文档',
    groupIds: [
      'getting-started',
      'sessions',
      'channels',
      'providers',
      'plugins',
      'notes',
    ],
  },
  {
    id: 'memory',
    labelEn: 'Memory',
    labelZh: '记忆系统',
    groupIds: [
      'memory',
      'ambient-memory',
      'project-memory',
      'memory-workers',
    ],
  },
  {
    id: 'integrate',
    labelEn: 'Integrate',
    labelZh: '集成',
    groupIds: [
      'integrations',
      'consuming',
      'reference',
    ],
  },
  {
    id: 'operate',
    labelEn: 'Operate',
    labelZh: '运维',
    groupIds: [
      'activity',
      'backup',
      'settings',
    ],
  },
  {
    id: 'releases',
    labelEn: 'Releases',
    labelZh: '版本',
    groupIds: [
      'releases',
    ],
  },
]

export type Locale = 'en' | 'zh'

export interface SidebarItem {
  text: string
  link: string
}

export interface SidebarSection {
  text: string
  collapsed: boolean
  items: SidebarItem[]
}

function readH1(absPath: string): string | null {
  try {
    const text = fs.readFileSync(absPath, 'utf8')
    const m = text.match(/^#\s+(.+?)\s*$/m)
    return m ? m[1].trim() : null
  } catch {
    return null
  }
}

function buildGroupSidebar(group: Group, lang: Locale): SidebarSection {
  const prefix = lang === 'en' ? '' : '/zh'
  const labelText = lang === 'en' ? group.labelEn : group.labelZh
  return {
    // VitePress doesn't natively render icons for sidebar group labels,
    // but our CSS hooks the icon prefix in via ::before on the data
    // attr on the `text` content. Since we can't pass HTML through
    // the `text` field reliably, we just inline the glyph in front
    // of the label. Visually it ends up as "🛰  Sessions" — clean.
    text: `${group.icon}  ${labelText}`,
    collapsed: false,
    items: group.sections.map((s) => {
      let text = s.titleEn
      if (lang === 'zh') {
        const abs = path.join(DOCS_ROOT, 'zh', group.id, `${s.slug}.md`)
        text = readH1(abs) ?? s.titleEn
      }
      // tack a tiny pseudo-badge into the text — VitePress just renders
      // the string, but our CSS could be extended later to highlight it.
      const display = s.badge
        ? `${text}  ·  ${s.badge}`
        : text
      return {
        text: display,
        link: `${prefix}/${group.id}/${s.slug}`,
      }
    }),
  }
}

/**
 * Build the sidebar tree.
 *
 * If `superGroupId` is provided, only the groups belonging to that
 * super-group are rendered. Otherwise the full sidebar with every
 * group is returned (kept for compatibility / fallback).
 */
function buildSidebarFor(lang: Locale, superGroupId?: string): SidebarSection[] {
  if (superGroupId) {
    const sg = SUPERGROUPS.find((s) => s.id === superGroupId)
    if (!sg) return []
    return sg.groupIds
      .map((id) => GROUPS.find((g) => g.id === id))
      .filter((g): g is Group => !!g)
      .map((g) => buildGroupSidebar(g, lang))
  }
  return GROUPS.map((g) => buildGroupSidebar(g, lang))
}

/**
 * VitePress sidebar config supports per-path objects: a URL prefix
 * maps to its own sidebar tree. We build one tree per super-group and
 * mount it under each contained group's URL prefix. So when the user
 * is on /sessions/... the sidebar shows the "Docs" super-group; when
 * on /memory/... it shows the "Memory" super-group, etc.
 */
export function buildSidebar(lang: Locale): Record<string, SidebarSection[]> {
  const langPrefix = lang === 'en' ? '' : '/zh'
  const out: Record<string, SidebarSection[]> = {}

  for (const sg of SUPERGROUPS) {
    const tree = buildSidebarFor(lang, sg.id)
    for (const groupId of sg.groupIds) {
      const key = `${langPrefix}/${groupId}/`
      out[key] = tree
    }
  }

  return out
}

/**
 * Build top-nav entries. The first item of each super-group becomes
 * the link target — usually /<group>/<first-slug>.
 */
export function buildNav(lang: Locale): Array<{
  text: string
  link?: string
  activeMatch?: string
  items?: Array<{ text: string; link: string }>
}> {
  const langPrefix = lang === 'en' ? '' : '/zh'

  function firstLink(sgId: string): string {
    const sg = SUPERGROUPS.find((s) => s.id === sgId)
    if (!sg) return langPrefix + '/'
    const firstGroupId = sg.groupIds[0]
    const firstGroup = GROUPS.find((g) => g.id === firstGroupId)
    if (!firstGroup) return langPrefix + '/'
    const firstSlug = firstGroup.sections[0]?.slug ?? ''
    return `${langPrefix}/${firstGroupId}/${firstSlug}`
  }

  function activeMatchFor(sgId: string): string {
    const sg = SUPERGROUPS.find((s) => s.id === sgId)
    if (!sg) return ''
    return `^${langPrefix}/(${sg.groupIds.join('|')})/`
  }

  const releasesActive = activeMatchFor('releases')

  return [
    {
      text: lang === 'en' ? 'Docs' : '文档',
      link: firstLink('docs'),
      activeMatch: activeMatchFor('docs'),
    },
    {
      text: lang === 'en' ? 'Memory' : '记忆系统',
      link: firstLink('memory'),
      activeMatch: activeMatchFor('memory'),
    },
    {
      text: lang === 'en' ? 'Integrate' : '集成',
      link: firstLink('integrate'),
      activeMatch: activeMatchFor('integrate'),
    },
    {
      text: lang === 'en' ? 'Operate' : '运维',
      link: firstLink('operate'),
      activeMatch: activeMatchFor('operate'),
    },
    {
      text: lang === 'en' ? 'Releases' : '版本',
      activeMatch: releasesActive,
      items: [
        {
          text: lang === 'en' ? 'Changelog' : '更新日志',
          link: `${langPrefix}/releases/changelog`,
        },
        {
          text: lang === 'en' ? 'Roadmap' : '路线图',
          link: `${langPrefix}/releases/roadmap`,
        },
        {
          text: lang === 'en' ? 'Showcase' : '案例',
          link: `${langPrefix}/releases/showcase`,
        },
      ],
    },
  ]
}
