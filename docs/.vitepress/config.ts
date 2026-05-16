import { defineConfig } from 'vitepress'
import { enConfig } from './locales/en'
import { zhConfig } from './locales/zh'

export default defineConfig({
  // English is the root locale (/), Chinese lives at /zh/.
  // GitHub's primary audience reads English; the bilingual switcher in
  // the top nav lets Chinese readers pivot in one click.
  title: 'opendray',
  description: 'Multi-CLI control gateway',
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: false,

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#3b82f6' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'opendray docs' }],
    ['meta', { property: 'og:url', content: 'https://docs.opendray.dev' }],
  ],

  themeConfig: {
    logo: { src: '/logo.svg', width: 24, height: 24 },

    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档',
              },
              modal: {
                noResultsText: '无相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭',
                },
              },
            },
          },
        },
      },
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/opendray/opendray' },
    ],

    footer: {
      message: 'Content licensed CC BY 4.0 · Tooling licensed MIT',
      copyright: 'Copyright © 2026 opendray contributors',
    },
  },

  locales: {
    root: { ...enConfig },
    zh: { ...zhConfig },
  },

  sitemap: {
    hostname: 'https://docs.opendray.dev',
  },
})
