<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getFrontBottomTabs } from '../constants/frontNav'

const props = defineProps({
  prefix: { type: String, required: true }
})

const route = useRoute()

const tabs = computed(() => getFrontBottomTabs(props.prefix))

const pcRoot = computed(() => `${props.prefix}/personal-center`)
const assetsPath = computed(() => `${props.prefix}/personal-center/assets`)
const tradePath = computed(() => `${props.prefix}/trade`)

function isTabActive(key) {
  const p = route.path
  const pc = pcRoot.value
  const assets = assetsPath.value
  switch (key) {
    case 'home':
      return p === `${props.prefix}/home` || p.startsWith(`${props.prefix}/home/`)
    case 'market':
      return p.startsWith(`${props.prefix}/market`)
    case 'trade':
      return p.startsWith(tradePath.value)
    case 'assets':
      return p === assets || p.startsWith(`${assets}/`)
    case 'me':
      if (p === assets || p.startsWith(`${assets}/`)) return false
      return p === pc || p === `${pc}/` || p.startsWith(`${pc}/`)
    default:
      return false
  }
}
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-40 px-3 pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))] pt-2 pointer-events-none lg:hidden"
    aria-label="底部导航"
  >
    <div
      class="pointer-events-auto rounded-2xl border border-white/[0.05] bg-[#0b0e11]/82 shadow-[0_-4px_32px_rgba(0,0,0,0.35),0_8px_24px_-8px_rgba(0,0,0,0.25)] backdrop-blur-xl supports-[backdrop-filter]:bg-[#0b0e11]/70"
    >
      <div class="flex h-[3.35rem] items-stretch justify-around sm:h-14">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.key"
        :to="tab.to"
        class="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-[10px] font-medium transition-colors duration-200 [-webkit-tap-highlight-color:transparent] sm:text-[11px]"
        :class="
          isTabActive(tab.key)
            ? 'text-lime-300'
            : 'text-[#848e9c]/90 hover:text-white/70 active:bg-white/[0.04]'
        "
      >
        <!-- 首页 -->
        <svg
          v-if="tab.key === 'home'"
          class="h-[22px] w-[22px] shrink-0 sm:h-6 sm:w-6"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 10.5 12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 20V10.5Z"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linejoin="round"
          />
          <path
            d="M9 21.5V14h6v7.5"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
          />
        </svg>
        <!-- 行情 -->
        <svg
          v-else-if="tab.key === 'market'"
          class="h-[22px] w-[22px] shrink-0 sm:h-6 sm:w-6"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 16l4-6 4 3 4-8 4 5"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path d="M4 20h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
        <!-- 交易 -->
        <svg
          v-else-if="tab.key === 'trade'"
          class="h-[22px] w-[22px] shrink-0 sm:h-6 sm:w-6"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <!-- 资产 -->
        <svg
          v-else-if="tab.key === 'assets'"
          class="h-[22px] w-[22px] shrink-0 sm:h-6 sm:w-6"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M19 7V4H5v3M5 11c0 4.5 3.6 8 8 8s8-3.5 8-8m-16 0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <!-- 我的 -->
        <svg
          v-else-if="tab.key === 'me'"
          class="h-[22px] w-[22px] shrink-0 sm:h-6 sm:w-6"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
            stroke="currentColor"
            stroke-width="1.6"
          />
          <path
            d="M4 20.5c1.6-3.2 4.7-5 8-5s6.4 1.8 8 5"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
          />
        </svg>
        <span class="max-w-[4.25rem] truncate text-center leading-tight">{{ tab.label }}</span>
      </RouterLink>
      </div>
    </div>
  </nav>
</template>
