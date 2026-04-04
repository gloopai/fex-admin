<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import FrontStrokeIcon from '../components/front/FrontStrokeIcon.vue'
import {
  getPersonalCenterNavItems,
  getPersonalCenterShellMobileNavItems
} from '../constants/personalCenterNav'

const route = useRoute()

const prefix = '/front'

const primaryNav = computed(() => getPersonalCenterNavItems(prefix))
const mobileQuickNav = computed(() => getPersonalCenterShellMobileNavItems(prefix))

/** 与个人中心首页 3×3 网格入口对应的描边图标 */
const shellQuickIconByKey = {
  assets: 'wallet',
  ledger: 'clipboard',
  security: 'shield',
  verify: 'id-card',
  'withdraw-addresses': 'link',
  notifications: 'bell',
  'fees-vip': 'star',
  referral: 'gift',
  preferences: 'cog'
}

function shellQuickIcon(key) {
  return shellQuickIconByKey[key] ?? 'monitor'
}

function pathNorm(p) {
  return p.replace(/\/+$/, '') || '/'
}

/** 个人中心首页（窄屏在此展示快捷网格；子页仅主内容） */
const isPersonalOverview = computed(() => {
  const home = pathNorm(`${prefix}/personal-center`)
  return pathNorm(route.path) === home
})

function navActive(item) {
  const p = route.path
  if (item.match === 'exact') {
    return p === item.to || p === `${item.to}/`
  }
  return p === item.to || p.startsWith(`${item.to}/`)
}
</script>

<template>
  <div
    class="min-h-[calc(100vh-3.5rem)] max-lg:min-h-[calc(100vh-3.5rem-0.5rem-3.5rem-0.6rem-env(safe-area-inset-bottom,0px))] border-t border-white/[0.04] bg-[#050505] text-white"
  >
    <div
      class="mx-auto flex max-w-[1400px] flex-col gap-5 px-3 pt-3 pb-6 sm:px-4 lg:flex-row lg:gap-8 lg:px-6 lg:pt-8 lg:pb-8"
      :class="
        isPersonalOverview
          ? 'max-lg:!pb-[calc(8.25rem+env(safe-area-inset-bottom,0px))] max-lg:gap-5'
          : ''
      "
    >
      <!-- 大屏左侧导航 -->
      <aside class="hidden w-[260px] shrink-0 lg:block" aria-label="个人中心导航">
        <div class="sticky top-20 space-y-6">
          <div class="rounded-2xl border border-white/[0.04] bg-white/[0.035] p-4">
            <p class="text-xs font-medium uppercase tracking-wider text-white/40">菜单</p>
            <nav class="mt-3 space-y-0.5">
              <RouterLink
                v-for="item in primaryNav"
                :key="item.key"
                :to="item.to"
                class="flex flex-col rounded-xl border px-3 py-2.5 text-left transition [-webkit-tap-highlight-color:transparent] focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090c]"
                :class="
                  navActive(item)
                    ? 'border-lime-400/35 bg-lime-400/[0.06]'
                    : 'border-transparent hover:bg-white/[0.04]'
                "
              >
                <span
                  class="text-[15px] font-semibold leading-snug tracking-tight"
                  :class="navActive(item) ? 'text-lime-50' : 'text-white/92'"
                >
                  {{ item.label }}
                </span>
                <span
                  class="mt-1 text-[11px] font-normal leading-relaxed"
                  :class="navActive(item) ? 'text-lime-300/50' : 'text-[#848e9c]'"
                >
                  {{ item.description }}
                </span>
              </RouterLink>
            </nav>
          </div>
        </div>
      </aside>

      <!-- 主内容：窄屏不留额外左右边距（由外壳 px 承担），底部与大屏留白统一 -->
      <main class="min-w-0 flex-1 text-white">
        <div
          class="mx-auto w-full max-w-[1280px] px-0 pb-6 max-lg:pt-0 lg:pb-0"
          :class="isPersonalOverview ? 'max-lg:!pb-1' : ''"
        >
          <RouterView v-slot="{ Component }">
            <Transition name="pc-fade" mode="out-in">
              <component :is="Component" />
            </Transition>
          </RouterView>
        </div>
      </main>

      <!-- 窄屏：仅在总览页底部 — 3×3 紧凑网格；页面额外 pb 避开固定「快捷菜单」 -->
      <nav
        v-if="isPersonalOverview"
        class="lg:hidden rounded-2xl bg-[#0b0c0e]/95 p-2.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
        aria-label="个人中心入口"
      >
        <h2
          class="mb-2 pl-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-white/35"
        >
          常用服务
        </h2>
        <div class="grid grid-cols-3 gap-x-1 gap-y-1">
          <RouterLink
            v-for="item in mobileQuickNav"
            :key="`m-${item.key}`"
            :to="item.to"
            class="group flex min-h-[4.75rem] flex-col items-center justify-center gap-1.5 rounded-xl px-1 py-2 text-center transition [-webkit-tap-highlight-color:transparent] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
            :class="
              navActive(item)
                ? 'bg-lime-400/[0.11] text-lime-50'
                : 'text-white/88 hover:bg-white/[0.055] active:bg-white/[0.08]'
            "
          >
            <span
              class="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/[0.08] text-lime-200/95 transition group-hover:bg-white/[0.12]"
              :class="navActive(item) ? 'bg-lime-400/25 text-lime-50' : ''"
              aria-hidden="true"
            >
              <FrontStrokeIcon :name="shellQuickIcon(item.key)" size-class="h-5 w-5" />
            </span>
            <span
              class="line-clamp-2 w-full px-0.5 text-center text-[12px] font-medium leading-[1.25] text-white/86"
              :class="navActive(item) ? 'text-lime-50/95' : ''"
            >
              {{ item.label }}
            </span>
          </RouterLink>
        </div>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.pc-fade-enter-active,
.pc-fade-leave-active {
  transition: opacity 0.18s ease;
}

.pc-fade-enter-from,
.pc-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .pc-fade-enter-active,
  .pc-fade-leave-active {
    transition: none;
  }
}
</style>
