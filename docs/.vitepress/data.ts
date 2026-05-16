// Single source of truth for the documentation site's structure.
//
// Every entry maps to a markdown file at docs/<group-id>/<slug>.md
// (English, the root locale) and docs/zh/<group-id>/<slug>.md
// (Simplified Chinese).
//
// Adding a new page = appending an entry here. The sidebar in both
// locales is generated from this data, so nothing else needs editing
// (no manual sidebar arrays per locale).
//
// titleEn is the literal sidebar text in English. titleZh is read
// from the H1 of the corresponding zh markdown at build time — see
// `readZhTitleFromMarkdown` below. So translating a page = writing
// its zh file; the sidebar picks the title up automatically. If a zh
// file doesn't exist yet, the sidebar falls back to titleEn.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DOCS_ROOT = path.resolve(__dirname, '..')

export interface Section {
  /** url segment after the group, e.g. "telegram" → /channels/telegram */
  slug: string
  titleEn: string
}

export interface Group {
  /** url segment, e.g. "channels" → /channels/... */
  id: string
  labelEn: string
  labelZh: string
  sections: Section[]
}

export const GROUPS: Group[] = [
  {
    id: 'getting-started',
    labelEn: 'Getting Started',
    labelZh: '开始使用',
    sections: [
      { slug: 'welcome', titleEn: 'Welcome to OpenDray' },
    ],
  },
  {
    id: 'sessions',
    labelEn: 'Sessions',
    labelZh: '会话(Sessions)',
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
    labelEn: 'Channels',
    labelZh: '频道(Channels)',
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
    labelEn: 'Providers',
    labelZh: '供应商(Providers)',
    sections: [
      { slug: 'overview', titleEn: 'Providers — overview' },
      { slug: 'bundled', titleEn: 'Bundled providers' },
      { slug: 'custom', titleEn: 'Custom provider manifest' },
      { slug: 'claude-accounts', titleEn: 'Claude accounts' },
    ],
  },
  {
    id: 'integrations',
    labelEn: 'Integrations',
    labelZh: '集成(Integrations)',
    sections: [
      { slug: 'overview', titleEn: 'Integrations — overview' },
      { slug: 'auth-model', titleEn: 'Auth model' },
      { slug: 'reverse-proxy', titleEn: 'Reverse proxy' },
      { slug: 'call-log', titleEn: 'Call log' },
      { slug: 'events-ws', titleEn: 'Events WebSocket' },
    ],
  },
  {
    id: 'activity',
    labelEn: 'Activity',
    labelZh: '活动(Activity)',
    sections: [
      { slug: 'overview', titleEn: 'Activity — overview' },
      { slug: 'topics-catalogue', titleEn: 'Topics catalogue' },
    ],
  },
  {
    id: 'notes',
    labelEn: 'Notes',
    labelZh: '笔记(Notes)',
    sections: [
      { slug: 'overview', titleEn: 'Notes — overview' },
      { slug: 'wiki-links', titleEn: 'Wiki links + backlinks' },
      { slug: 'vault-git-sync', titleEn: 'Vault git sync' },
      { slug: 'editor', titleEn: 'Note editor' },
    ],
  },
  {
    id: 'plugins',
    labelEn: 'Plugins',
    labelZh: '插件(Plugins)',
    sections: [
      { slug: 'overview', titleEn: 'Plugins — overview' },
      { slug: 'skills', titleEn: 'Skills' },
      { slug: 'mcp', titleEn: 'MCP servers' },
      { slug: 'git-hosts', titleEn: 'Git hosts' },
    ],
  },
  {
    id: 'settings',
    labelEn: 'Settings',
    labelZh: '设置(Settings)',
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
  {
    id: 'consuming',
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
    id: 'memory',
    labelEn: 'Memory',
    labelZh: '记忆(Memory)',
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
    id: 'backup',
    labelEn: 'Backups',
    labelZh: '备份(Backups)',
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
    id: 'ambient-memory',
    labelEn: 'Ambient Memory',
    labelZh: '环境记忆(Ambient Memory)',
    sections: [
      { slug: 'overview', titleEn: 'Ambient Memory — overview' },
      { slug: 'providers', titleEn: 'Ambient Memory — providers' },
      { slug: 'capture-rules', titleEn: 'Ambient Memory — capture rules' },
      { slug: 'injection', titleEn: 'Ambient Memory — injection profiles' },
    ],
  },
  {
    id: 'project-memory',
    labelEn: 'Project Memory',
    labelZh: '项目记忆(Project Memory)',
    sections: [
      { slug: 'overview', titleEn: 'Project memory — overview' },
      { slug: 'workflow', titleEn: 'Project memory — day-to-day workflow' },
      { slug: 'scanner-and-cleaner', titleEn: 'Scanner & cleaner — auto-managed memory' },
      { slug: 'reset-and-troubleshooting', titleEn: 'Reset & troubleshooting' },
    ],
  },
  {
    id: 'memory-workers',
    labelEn: 'Memory Workers',
    labelZh: '记忆 Worker',
    sections: [
      { slug: 'overview', titleEn: 'Memory workers — overview' },
      { slug: 'picking-a-worker', titleEn: 'Picking a worker per task' },
      { slug: 'verification', titleEn: 'Verification & metrics' },
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

/**
 * Read the H1 of a markdown file (best effort). Returns null if the
 * file doesn't exist or has no H1.
 */
function readH1(absPath: string): string | null {
  try {
    const text = fs.readFileSync(absPath, 'utf8')
    const m = text.match(/^#\s+(.+?)\s*$/m)
    return m ? m[1].trim() : null
  } catch {
    return null
  }
}

/**
 * Build the sidebar tree for a given locale.
 *
 * English pages live at `/<group>/<slug>`; Chinese pages live at
 * `/zh/<group>/<slug>`. VitePress 1.x resolves both forms from the
 * docs/ root.
 *
 * For zh, the sidebar text is read from the H1 of the actual zh
 * markdown — falling back to the English title if the file doesn't
 * exist yet. This keeps data.ts as a structural index without
 * duplicating every translated string.
 */
export function buildSidebar(lang: Locale): SidebarSection[] {
  const prefix = lang === 'en' ? '' : '/zh'
  return GROUPS.map((g) => ({
    text: lang === 'en' ? g.labelEn : g.labelZh,
    collapsed: false,
    items: g.sections.map((s) => {
      let text = s.titleEn
      if (lang === 'zh') {
        const abs = path.join(DOCS_ROOT, 'zh', g.id, `${s.slug}.md`)
        text = readH1(abs) ?? s.titleEn
      }
      return {
        text,
        link: `${prefix}/${g.id}/${s.slug}`,
      }
    }),
  }))
}
