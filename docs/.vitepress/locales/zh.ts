import type { LocaleSpecificConfig } from 'vitepress'
import { buildNav, buildSidebar } from '../data'

export const zhConfig: LocaleSpecificConfig = {
  label: '简体中文',
  lang: 'zh-CN',
  title: 'opendray',
  description:
    '多 CLI 控制网关 — 把 Claude Code、Codex、Gemini CLI 会话接入到消息平台',
  themeConfig: {
    nav: buildNav('zh'),
    sidebar: buildSidebar('zh'),

    docFooter: { prev: '上一篇', next: '下一篇' },
    outline: { label: '本页目录', level: [2, 3] },

    editLink: {
      pattern:
        'https://github.com/opendray/opendray-docs/edit/main/docs/:path',
      text: '在 GitHub 上编辑本页',
    },
    lastUpdated: { text: '最后更新' },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到亮色主题',
    darkModeSwitchTitle: '切换到暗色主题',
    langMenuLabel: '切换语言',
  },
}
