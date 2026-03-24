import { createRouter, createWebHistory } from 'vue-router'
import ConsoleLayout from '../layouts/ConsoleLayout.vue'
import FrontDesktopLayout from '../layouts/FrontDesktopLayout.vue'
import FrontMobileLayout from '../layouts/FrontMobileLayout.vue'
import { consoleRoutes } from './modules/console'
import { legacyRoutes } from './modules/legacy'
import { frontDesktopRoutes, frontMobileRoutes } from './modules/front'

const routes = [
  {
    path: '/',
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
