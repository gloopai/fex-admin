import { createRouter, createWebHistory } from 'vue-router'
import ConsoleLayout from '../layouts/ConsoleLayout.vue'
import FrontDesktopLayout from '../layouts/FrontDesktopLayout.vue'
import FrontMobileLayout from '../layouts/FrontMobileLayout.vue'
import HomeEntryPage from '../pages/HomeEntryPage.vue'
import { consoleRoutes } from './modules/console'
import { legacyRoutes } from './modules/legacy'
import { frontDesktopRoutes, frontMobileRoutes } from './modules/front'

const routes = [
  {
    path: '/',
    component: HomeEntryPage
  },
  {
    path: '/:legacyBase(users|contracts|perpetual|delivery|assets|system|liquidity|lending|ai-quant|spot|agent|referral)/:legacyRest(.*)*',
    redirect: (to) => `/admin/${to.params.legacyBase}${to.params.legacyRest ? `/${to.params.legacyRest}` : ''}`
  },
  {
    path: '/admin',
    component: ConsoleLayout,
    children: [...consoleRoutes, ...legacyRoutes]
  },
  {
    path: '/front',
    component: FrontDesktopLayout,
    children: frontDesktopRoutes
  },
  {
    path: '/m',
    component: FrontMobileLayout,
    children: frontMobileRoutes
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
