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
      class="mx-auto flex max-w-[1400px] flex-col gap-6 px-3 pt-3 pb-6 sm:px-4 lg:flex-row lg:gap-8 lg:px-6 lg:pt-8 lg:pb-8"
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
                  class="text-sm font-medium"
                  :class="navActive(item) ? 'text-lime-100' : 'text-white/85'"
                >
                  {{ item.label }}
                </span>
                <span
                  class="mt-0.5 text-xs"
                  :class="navActive(item) ? 'text-lime-100/50' : 'text-white/42'"
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
        >
          <RouterView v-slot="{ Component }">
            <Transition name="pc-fade" mode="out-in">
              <component :is="Component" />
            </Transition>
          </RouterView>
        </div>
      </main>

      <!-- 窄屏：仅在总览页底部放入口（无标题文案） -->
      <nav
        v-if="isPersonalOverview"
        class="lg:hidden rounded-2xl border border-white/[0.045] bg-white/[0.03] p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]"
        aria-label="个人中心入口"
      >
        <div class="grid grid-cols-2 gap-2">
          <RouterLink
            v-for="item in mobileQuickNav"
            :key="`m-${item.key}`"
            :to="item.to"
            class="rounded-xl bg-black/18 px-3 py-3 text-center text-sm font-medium ring-1 ring-white/[0.03] transition active:scale-[0.99]"
            :class="
              navActive(item)
                ? 'bg-gradient-to-b from-lime-400/[0.12] to-lime-400/[0.04] text-lime-50 ring-lime-400/18'
                : 'text-white/88 hover:bg-white/[0.04] hover:ring-white/[0.06]'
            "
          >
            {{ item.label }}
          </RouterLink>
          <RouterLink
            :to="`${prefix}/personal-center/fees-vip`"
            class="rounded-xl bg-black/18 px-3 py-3 text-center text-sm font-medium text-white/88 ring-1 ring-white/[0.03] transition hover:bg-white/[0.04] hover:ring-white/[0.06] active:scale-[0.99]"
            :class="
              navActive({ to: `${prefix}/personal-center/fees-vip`, match: 'prefix' })
                ? 'bg-gradient-to-b from-lime-400/[0.12] to-lime-400/[0.04] text-lime-50 ring-lime-400/18'
                : ''
            "
          >
            费率与 VIP
          </RouterLink>
          <RouterLink
            :to="`${prefix}/personal-center/notifications`"
            class="rounded-xl bg-black/18 px-3 py-3 text-center text-sm font-medium text-white/88 ring-1 ring-white/[0.03] transition hover:bg-white/[0.04] hover:ring-white/[0.06] active:scale-[0.99]"
            :class="
              navActive({ to: `${prefix}/personal-center/notifications`, match: 'prefix' })
                ? 'bg-gradient-to-b from-lime-400/[0.12] to-lime-400/[0.04] text-lime-50 ring-lime-400/18'
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
