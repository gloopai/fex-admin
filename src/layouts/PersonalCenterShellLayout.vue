<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getPersonalCenterNavItems } from '../constants/personalCenterNav'

const route = useRoute()

const prefix = computed(() => (route.path.startsWith('/m') ? '/m' : '/front'))
const isMobile = computed(() => route.path.startsWith('/m'))

const primaryNav = computed(() => getPersonalCenterNavItems(prefix.value))

const showMobileBackToOverview = computed(() => {
  if (!isMobile.value) return false
  const home = `${prefix.value}/personal-center`
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
  <div class="min-h-[calc(100vh-3.5rem)] border-t border-white/[0.06] bg-[#050505] text-white">
    <div
      class="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-6 md:flex-row md:gap-8 md:px-6 md:py-8"
    >
      <!-- PC 侧栏 -->
      <aside
        v-if="!isMobile"
        class="hidden w-[260px] shrink-0 md:block"
        aria-label="个人中心导航"
      >
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
          v-if="isMobile && showMobileBackToOverview"
          :to="`${prefix}/personal-center`"
          class="mb-4 inline-flex items-center gap-1.5 text-sm text-lime-300/90 hover:text-lime-200"
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
