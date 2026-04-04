import { createRouter, createWebHistory } from 'vue-router'
import ConsoleLayout from '../layouts/ConsoleLayout.vue'
import FrontDesktopLayout from '../layouts/FrontDesktopLayout.vue'
import HomeEntryPage from '../pages/HomeEntryPage.vue'
import { consoleRoutes } from './modules/console'
import { legacyRoutes } from './modules/legacy'
import { frontDesktopRoutes } from './modules/front'

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
  /** 旧 /m 路径重定向到统一响应式前台 */
  {
    path: '/m',
    redirect: '/front/home'
  },
  {
    path: '/m/:pathMatch(.*)*',
    redirect: (to) => {
      const m = to.params.pathMatch
      const tail = Array.isArray(m) ? m.filter(Boolean).join('/') : (m ? String(m) : '')
      return tail ? `/front/${tail.replace(/^\/+/, '')}` : '/front/home'
    }
  }
]

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { left: 0, top: 0 }
  }
})
