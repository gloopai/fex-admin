<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  getPersonalCenterNavItems,
  getPersonalCenterShellMobileNavItems
} from '../constants/personalCenterNav'

const route = useRoute()

const prefix = '/front'

const primaryNav = computed(() => getPersonalCenterNavItems(prefix))
const mobileQuickNav = computed(() => getPersonalCenterShellMobileNavItems(prefix))

function pathNorm(p) {
  return p.replace(/\/+$/, '') || '/'
}

/** 个人中心首页（窄屏在此展示快捷网格；子页只保留返回 + 内容） */
const isPersonalOverview = computed(() => {
  const home = pathNorm(`${prefix}/personal-center`)
  return pathNorm(route.path) === home
})

/** 非总览子页时显示返回（仅窄屏展示，见模板 lg:hidden） */
const showMobileBackToOverview = computed(() => {
  const home = `${prefix}/personal-center`
  const p = route.path
  if (p === home || p === `${home}/`) return false
  return p.startsWith(`${home}/`)
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
    class="min-h-[calc(100vh-3.5rem)] max-lg:min-h-[calc(100vh-7rem-env(safe-area-inset-bottom,0px))] border-t border-white/[0.06] bg-[#050505] text-white"
  >
    <div
      class="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-6 lg:flex-row lg:gap-8 lg:px-6 lg:py-8"
    >
      <!-- 大屏左侧导航 -->
      <aside class="hidden w-[260px] shrink-0 lg:block" aria-label="个人中心导航">
        <div class="sticky top-20 space-y-6">
          <div class="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p class="text-xs font-medium uppercase tracking-wider text-white/40">菜单</p>
            <nav class="mt-3 space-y-1">
              <RouterLink
                v-for="item in primaryNav"
                :key="item.key"
                :to="item.to"
                class="flex flex-col rounded-xl px-3 py-2.5 text-left transition"
                :class="
                  navActive(item)
                    ? 'bg-lime-400/12 ring-1 ring-lime-400/25'
                    : 'hover:bg-white/[0.06]'
                "
              >
                <span
                  class="text-sm font-medium"
                  :class="navActive(item) ? 'text-lime-200' : 'text-white/88'"
                >
                  {{ item.label }}
                </span>
                <span class="mt-0.5 text-xs text-white/45">{{ item.description }}</span>
              </RouterLink>
            </nav>
          </div>
        </div>
      </aside>

      <!-- 主内容 -->
      <main class="min-w-0 flex-1">
        <RouterLink
          v-if="showMobileBackToOverview"
          :to="`${prefix}/personal-center`"
          class="mb-4 inline-flex items-center gap-1.5 text-sm text-lime-300/90 hover:text-lime-200 lg:hidden"
        >
          <span aria-hidden="true" class="text-base leading-none">←</span>
          返回个人中心
        </RouterLink>
        <RouterView v-slot="{ Component }">
          <Transition name="pc-fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>

      <!-- 窄屏：仅在总览页底部放入口（无标题文案） -->
      <nav
        v-if="isPersonalOverview"
        class="lg:hidden rounded-2xl border border-white/10 bg-white/[0.04] p-3"
        aria-label="个人中心入口"
      >
        <div class="grid grid-cols-2 gap-2">
          <RouterLink
            v-for="item in mobileQuickNav"
            :key="`m-${item.key}`"
            :to="item.to"
            class="rounded-xl border border-white/[0.08] bg-black/20 px-3 py-3 text-center text-sm font-medium transition active:scale-[0.99]"
            :class="
              navActive(item)
                ? 'border-lime-400/35 bg-lime-400/10 text-lime-100'
                : 'text-white/88 hover:border-white/15 hover:bg-white/[0.05]'
            "
          >
            {{ item.label }}
          </RouterLink>
          <RouterLink
            :to="`${prefix}/personal-center/fees-vip`"
            class="rounded-xl border border-white/[0.08] bg-black/20 px-3 py-3 text-center text-sm font-medium text-white/88 transition hover:border-white/15 hover:bg-white/[0.05] active:scale-[0.99]"
            :class="
              navActive({ to: `${prefix}/personal-center/fees-vip`, match: 'prefix' })
                ? 'border-lime-400/35 bg-lime-400/10 text-lime-100'
                : ''
            "
          >
            费率与 VIP
          </RouterLink>
          <RouterLink
            :to="`${prefix}/personal-center/notifications`"
            class="rounded-xl border border-white/[0.08] bg-black/20 px-3 py-3 text-center text-sm font-medium text-white/88 transition hover:border-white/15 hover:bg-white/[0.05] active:scale-[0.99]"
            :class="
              navActive({ to: `${prefix}/personal-center/notifications`, match: 'prefix' })
                ? 'border-lime-400/35 bg-lime-400/10 text-lime-100'
                : ''
            "
          >
            消息通知
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
