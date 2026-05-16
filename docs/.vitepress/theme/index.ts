import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'

import './style.css'

// home-page sections
import HomeHero from './components/home/HomeHero.vue'
import HomeQuickStart from './components/home/HomeQuickStart.vue'
import HomeChannels from './components/home/HomeChannels.vue'
import HomeFeatures from './components/home/HomeFeatures.vue'
import HomeShowcase from './components/home/HomeShowcase.vue'
import HomeStats from './components/home/HomeStats.vue'
import HomeFooterCta from './components/home/HomeFooterCta.vue'

// content components (used inside markdown)
import Card from './components/Card.vue'
import CardGroup from './components/CardGroup.vue'
import Steps from './components/Steps.vue'
import Step from './components/Step.vue'
import Tabs from './components/Tabs.vue'
import Tab from './components/Tab.vue'
import Callout from './components/Callout.vue'
import Badge from './components/Badge.vue'
import CodeGroup from './components/CodeGroup.vue'
import CodeTab from './components/CodeTab.vue'
import Terminal from './components/Terminal.vue'
import ChannelLogo from './components/ChannelLogo.vue'
import FeatureCard from './components/FeatureCard.vue'
import StatBlock from './components/StatBlock.vue'

// custom 404
import NotFound from './NotFound.vue'

const theme: Theme = {
  extends: DefaultTheme,

  Layout() {
    // we keep the default layout — slot system lets pages opt into
    // the home sections via HTML inside index.md
    return h(DefaultTheme.Layout, null, {})
  },

  enhanceApp({ app }) {
    // home sections
    app.component('HomeHero', HomeHero)
    app.component('HomeQuickStart', HomeQuickStart)
    app.component('HomeChannels', HomeChannels)
    app.component('HomeFeatures', HomeFeatures)
    app.component('HomeShowcase', HomeShowcase)
    app.component('HomeStats', HomeStats)
    app.component('HomeFooterCta', HomeFooterCta)

    // content
    app.component('Card', Card)
    app.component('CardGroup', CardGroup)
    app.component('Steps', Steps)
    app.component('Step', Step)
    app.component('Tabs', Tabs)
    app.component('Tab', Tab)
    app.component('Callout', Callout)
    app.component('Badge', Badge)
    app.component('CodeGroup', CodeGroup)
    app.component('CodeTab', CodeTab)
    app.component('Terminal', Terminal)
    app.component('ChannelLogo', ChannelLogo)
    app.component('FeatureCard', FeatureCard)
    app.component('StatBlock', StatBlock)

    // 404
    app.component('NotFound', NotFound)
  },
}

export default theme
