import type { LocaleSpecificConfig } from 'vitepress'
import { buildNav, buildSidebar } from '../data'

export const enConfig: LocaleSpecificConfig = {
  label: 'English',
  lang: 'en-US',
  title: 'opendray',
  description:
    'Multi-CLI control gateway — bridge Claude Code, Codex, and Gemini CLI sessions to messaging platforms',
  themeConfig: {
    nav: buildNav('en'),
    sidebar: buildSidebar('en'),

    docFooter: { prev: 'Previous', next: 'Next' },
    outline: { label: 'On this page', level: [2, 3] },

    editLink: {
      pattern:
        'https://github.com/opendray/opendray-docs/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
    lastUpdated: { text: 'Last updated' },
    returnToTopLabel: 'Return to top',
    sidebarMenuLabel: 'Menu',
    darkModeSwitchLabel: 'Theme',
    lightModeSwitchTitle: 'Switch to light theme',
    darkModeSwitchTitle: 'Switch to dark theme',
  },
}
