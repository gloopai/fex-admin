<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getFrontNavItems } from '../constants/frontNav'

const props = defineProps({
  /** '/front' | '/m' */
  prefix: { type: String, required: true },
  /** desktop | mobile */
  variant: { type: String, default: 'desktop' }
})

const route = useRoute()

const moreOpen = ref(false)
const mobileOpen = ref(false)
const desktopMoreRoot = ref(null)
const mobileMenuRoot = ref(null)

const items = computed(() => getFrontNavItems(props.prefix))
const primaryItems = computed(() => items.value.filter((i) => i.primary))
const moreItems = computed(() => items.value.filter((i) => !i.primary))

const isMobile = computed(() => props.variant === 'mobile')

const linkBase =
  'rounded-lg border text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/40'

function isActive(to) {
  const p = route.path
  const pcHome = `${props.prefix}/personal-center`
  if (to === pcHome) {
    return p === pcHome || p === `${pcHome}/`
  }
  return p === to || p.startsWith(`${to}/`)
}

function activeClass(to) {
  return isActive(to)
    ? 'border-lime-300/40 bg-lime-300/15 text-lime-200'
    : 'border-white/15 bg-white/[0.04] text-white/75 hover:bg-white/[0.08]'
}

function closeOverlays() {
  moreOpen.value = false
  mobileOpen.value = false
}

watch(
  () => route.fullPath,
  () => {
    closeOverlays()
  }
)

function onDocPointerDown(ev) {
  const t = ev.target
  if (desktopMoreRoot.value?.contains(t) || mobileMenuRoot.value?.contains(t)) return
  closeOverlays()
}

const anyPanelOpen = computed(() => moreOpen.value || mobileOpen.value)

watch(anyPanelOpen, (open) => {
  if (open) {
    document.addEventListener('pointerdown', onDocPointerDown, true)
  } else {
    document.removeEventListener('pointerdown', onDocPointerDown, true)
  }
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocPointerDown, true)
})
</script>

<template>
  <!-- 移动端：单行标题 +「导航」折叠面板 -->
  <div
    v-if="isMobile"
    ref="mobileMenuRoot"
    class="sticky top-0 z-20 border-b border-white/10 bg-black/85 backdrop-blur-md"
  >
    <div class="flex items-center justify-between gap-2 px-4 py-2.5">
      <RouterLink
        :to="primaryItems[0]?.to ?? `${prefix}/personal-center`"
        class="min-w-0 text-sm font-semibold text-white/90"
      >
        账户中心
      </RouterLink>
      <div class="relative shrink-0">
        <button
          type="button"
          class="flex items-center gap-1 rounded-lg border border-white/18 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/85 hover:bg-white/[0.1]"
          :aria-expanded="mobileOpen"
          aria-haspopup="true"
          aria-controls="front-mobile-nav-panel"
          @click="mobileOpen = !mobileOpen"
        >
          导航
          <span class="text-[10px] text-white/50" aria-hidden="true">{{ mobileOpen ? '▲' : '▼' }}</span>
        </button>
        <div
          v-show="mobileOpen"
          id="front-mobile-nav-panel"
          class="absolute right-0 z-30 mt-1.5 max-h-[min(70vh,24rem)] w-[min(18rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-white/12 bg-[#0d0d0d] py-1 shadow-2xl"
          role="menu"
        >
          <RouterLink
            v-for="item in items"
            :key="item.key"
            :to="item.to"
            role="menuitem"
            class="block border-b border-white/[0.06] px-3 py-3 text-sm last:border-b-0"
            :class="
              isActive(item.to)
                ? 'bg-lime-300/10 text-lime-200'
                : 'text-white/80 hover:bg-white/[0.06]'
            "
            @click="mobileOpen = false"
          >
            {{ item.label }}
          </RouterLink>
        </div>
      </div>
    </div>
  </div>

  <!-- 桌面端：品牌 + 主入口 +「更多」下拉 -->
  <div
    v-else
    ref="desktopMoreRoot"
    class="sticky top-0 z-20 border-b border-white/10 bg-black/75 backdrop-blur-md"
  >
    <div class="mx-auto flex max-w-[1280px] items-center gap-3 px-4 py-3 sm:px-6">
      <RouterLink
        :to="primaryItems[0]?.to ?? `${prefix}/personal-center`"
        class="mr-1 shrink-0 text-sm font-semibold tracking-tight text-white/90 hover:text-lime-200/90"
      >
        账户中心
      </RouterLink>

      <nav class="flex min-w-0 flex-1 flex-wrap items-center gap-2" aria-label="前台主导航">
        <RouterLink
          v-for="item in primaryItems"
          :key="item.key"
          :to="item.to"
          class="shrink-0 px-4 py-2"
          :class="[linkBase, activeClass(item.to)]"
        >
          {{ item.label }}
        </RouterLink>

        <div v-if="moreItems.length" class="relative shrink-0">
          <button
            type="button"
            class="flex items-center gap-1 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white/78 hover:bg-white/[0.08]"
            :aria-expanded="moreOpen"
            aria-haspopup="true"
            aria-controls="front-desktop-more-panel"
            @click="moreOpen = !moreOpen"
          >
            更多
            <span class="text-[10px] text-white/45" aria-hidden="true">{{ moreOpen ? '▲' : '▼' }}</span>
          </button>
          <div
            v-show="moreOpen"
            id="front-desktop-more-panel"
            class="absolute left-0 z-30 mt-1.5 min-w-[220px] rounded-xl border border-white/12 bg-[#111] py-1 shadow-2xl"
            role="menu"
          >
            <RouterLink
              v-for="item in moreItems"
              :key="item.key"
              :to="item.to"
              role="menuitem"
              class="block px-4 py-2.5 text-sm"
              :class="
                isActive(item.to)
                  ? 'bg-lime-300/12 text-lime-200'
                  : 'text-white/80 hover:bg-white/[0.06]'
              "
              @click="moreOpen = false"
            >
              {{ item.label }}
            </RouterLink>
          </div>
        </div>
      </nav>
    </div>
  </div>
</template>
