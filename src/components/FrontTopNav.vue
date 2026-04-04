<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getFrontMainNavLinks, getFrontTradeMenuGroups } from '../constants/frontNav'
import { getPersonalCenterShellMobileNavItems } from '../constants/personalCenterNav'

const props = defineProps({
  /** 固定为 `/front`（旧 /m 会重定向至 /front） */
  prefix: { type: String, required: true }
})

const route = useRoute()

const tradeOpen = ref(false)
const mobileOpen = ref(false)
const navRoot = ref(null)
/** Teleport 抽屉，供外点关闭判断 */
const mobileDrawerRef = ref(null)

const mainLinks = computed(() => getFrontMainNavLinks(props.prefix))
const tradeMenuGroups = computed(() => getFrontTradeMenuGroups(props.prefix))

const pcDrawerShortcuts = computed(() =>
  getPersonalCenterShellMobileNavItems(props.prefix).filter((i) => i.key !== 'assets')
)

const pcBase = computed(() => `${props.prefix}/personal-center`)
const assetsBase = computed(() => `${props.prefix}/personal-center/assets`)

/** 抽屉：首页 / 行情 / 资产 */
const drawerPrimaryNavEntries = computed(() =>
  mainLinks.value.map((i) => ({ ...i, icon: i.key }))
)

/** 抽屉：个人中心 */
const drawerPersonalNavEntries = computed(() => {
  const p = props.prefix
  return [
    { key: 'pc-overview', label: '账户总览', to: `${p}/personal-center`, icon: 'user' },
    ...pcDrawerShortcuts.value.map((i) => ({ ...i, icon: drawerPcIconKey(i.key) })),
    {
      key: 'pc-fees',
      label: '费率与 VIP',
      to: `${p}/personal-center/fees-vip`,
      icon: 'percent'
    },
    {
      key: 'pc-notify',
      label: '消息通知',
      to: `${p}/personal-center/notifications`,
      icon: 'bell'
    }
  ]
})

function drawerPcIconKey(key) {
  const m = {
    security: 'shield',
    verify: 'badge',
    'withdraw-addresses': 'send',
    referral: 'gift',
    preferences: 'sliders'
  }
  return m[key] || 'circle'
}

/** 小图标：若干为多段 path */
function drawerIconPaths(icon) {
  const stroke = {
    home: [
      'M3 10.5 12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 20V10.5Z',
      'M9 21.5V14h6v7.5'
    ],
    market: ['M4 16l4-6 4 3 4-8 4 5', 'M4 20h16'],
    assets: [
      'M19 7V4H5v3M5 11c0 4.5 3.6 8 8 8s8-3.5 8-8m-16 0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9'
    ],
    user: [
      'M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
      'M4 20.5c1.6-3.2 4.7-5 8-5s6.4 1.8 8 5'
    ],
    wallet: [
      'M19 7V4H5v3M5 11c0 4.5 3.6 8 8 8s8-3.5 8-8m-16 0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9'
    ],
    shield: [
      'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z'
    ],
    badge: ['M14 3v4a1 1 0 0 0 1 1h4', 'M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z'],
    send: ['M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z'],
    gift: [
      'M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8',
      'M12 22V12M2 7h20v5H2V7Z',
      'M12 12H7.5a2.5 2.5 0 0 1 0-5C11 7 12 12 12 12Z',
      'M12 12h4.5a2.5 2.5 0 0 0 0-5C13 7 12 12 12 12Z'
    ],
    bell: [
      'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9',
      'M10.3 21a1.94 1.94 0 0 0 3.4 0'
    ],
    sliders: ['M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h4M17 14h4M9 8h4'],
    percent: ['M19 5 5 19', 'M7.5 7.5h.01M16.5 16.5h.01'],
    circle: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z']
  }
  return stroke[icon] || stroke.circle
}

function isAssetsActive() {
  const p = route.path
  const a = assetsBase.value
  return p === a || p.startsWith(`${a}/`)
}

function isPersonalCenterNavActive() {
  const p = route.path
  const b = pcBase.value
  if (!(p === b || p.startsWith(`${b}/`))) return false
  return !isAssetsActive()
}

function isActivePath(to) {
  const p = route.path
  return p === to || p.startsWith(`${to}/`)
}

function isMainActive(to) {
  const assetsTo = assetsBase.value
  return to === assetsTo ? isAssetsActive() : isActivePath(to)
}

function isTradeSectionActive() {
  const p = route.path
  const base = `${props.prefix}/trade/`
  return p.startsWith(base)
}

function linkNavClass(active) {
  return [
    'inline-flex items-center gap-1 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 lg:px-3.5 lg:text-[0.9375rem]',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0e11]',
    active ? 'text-lime-300' : 'text-[#eaecef] hover:text-lime-300'
  ]
}

function mainNavClass(to) {
  return linkNavClass(isMainActive(to))
}

function tradeTriggerClass() {
  return linkNavClass(tradeOpen.value || isTradeSectionActive())
}

function closeOverlays() {
  tradeOpen.value = false
  mobileOpen.value = false
}

watch(() => route.fullPath, closeOverlays)

function closeIfDesktopBreakpoint() {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(min-width: 1024px)').matches) {
    mobileOpen.value = false
    tradeOpen.value = false
  }
}

let removeMediaListener = () => {}

onMounted(() => {
  const mq = window.matchMedia('(min-width: 1024px)')
  const onChange = () => closeIfDesktopBreakpoint()
  mq.addEventListener('change', onChange)
  removeMediaListener = () => mq.removeEventListener('change', onChange)
})

function onDocPointerDown(ev) {
  if (navRoot.value?.contains(ev.target)) return
  if (mobileDrawerRef.value?.contains(ev.target)) return
  closeOverlays()
}

function pathNorm(p) {
  return p.replace(/\/+$/, '') || '/'
}

function isPcOverviewActive() {
  return pathNorm(route.path) === pathNorm(pcBase.value)
}

const anyPanelOpen = computed(() => tradeOpen.value || mobileOpen.value)

function onEscape(ev) {
  if (ev.key === 'Escape') closeOverlays()
}

watch(anyPanelOpen, (open) => {
  if (open) {
    document.addEventListener('pointerdown', onDocPointerDown, true)
    window.addEventListener('keydown', onEscape)
  } else {
    document.removeEventListener('pointerdown', onDocPointerDown, true)
    window.removeEventListener('keydown', onEscape)
  }
})

watch(mobileOpen, (open) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = open ? 'hidden' : ''
})

onUnmounted(() => {
  removeMediaListener()
  document.removeEventListener('pointerdown', onDocPointerDown, true)
  window.removeEventListener('keydown', onEscape)
  document.body.style.overflow = ''
})

const homeTo = computed(() => `${props.prefix}/home`)

function dropdownItemClass(to) {
  return isActivePath(to)
    ? 'bg-lime-400/12 text-lime-300'
    : 'text-[#eaecef] hover:bg-white/[0.06]'
}

function drawerPillActive(to) {
  const assetsTo = assetsBase.value
  let on = isActivePath(to)
  if (to === assetsTo) on = isAssetsActive()
  return on
}

function drawerRowActive(item) {
  if (item.key === 'pc-overview') return isPcOverviewActive()
  return drawerPillActive(item.to)
}

/** 左侧抽屉：柔和分层，避免粗线框 + 重色块 */
function drawerRowClass(item) {
  const on = drawerRowActive(item)
  return [
    'drawer-nav-row flex w-full min-h-[2.75rem] items-center gap-3 rounded-lg px-2.5 py-2.5 text-[15px] leading-snug font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/28 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0e11] sm:min-h-0 sm:py-2 sm:text-[14px]',
    on
      ? 'bg-gradient-to-r from-lime-400/[0.09] via-white/[0.03] to-transparent text-lime-100'
      : 'text-[#eaecef] hover:bg-white/[0.04]'
  ]
}

</script>

<template>
  <div ref="navRoot" class="sticky top-0 z-20 w-full border-b border-[#1f2429] bg-[#0b0e11]">
    <div
      class="mx-auto flex min-h-[3.5rem] w-full items-center justify-between gap-2.5 px-3 sm:min-h-14 sm:gap-3 sm:px-4 lg:gap-6 lg:px-6 xl:px-8"
    >
      <!-- 左：品牌 + 大屏主导航 -->
      <div class="flex min-w-0 flex-1 items-center gap-4 lg:gap-10">
        <RouterLink
          :to="homeTo"
          class="group flex shrink-0 items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0e11]"
          @click="mobileOpen = false"
        >
          <span class="relative grid h-8 w-8 place-items-center" aria-hidden="true">
            <span
              class="absolute inset-0 rotate-45 rounded-[4px] bg-gradient-to-br from-lime-400 to-emerald-600 shadow-[0_0_20px_-4px_rgba(163,230,53,0.5)] transition group-hover:shadow-[0_0_24px_-2px_rgba(163,230,53,0.6)]"
            />
            <span class="relative text-[13px] font-black leading-none text-[#0b0e11] -rotate-45">X</span>
          </span>
          <span
            class="truncate text-[0.9375rem] font-semibold tracking-tight text-lime-300 sm:text-base lg:text-lg"
          >
            CryptoX Pro
          </span>
        </RouterLink>

        <nav
          class="hidden min-w-0 items-center gap-0.5 lg:flex lg:gap-1"
          aria-label="主导航"
        >
          <RouterLink
            v-for="item in mainLinks"
            :key="item.key"
            :to="item.to"
            :class="mainNavClass(item.to)"
          >
            {{ item.label }}
          </RouterLink>

          <div class="relative">
            <button
              type="button"
              class="inline-flex items-center gap-1"
              :class="tradeTriggerClass()"
              :aria-expanded="tradeOpen"
              aria-haspopup="true"
              aria-controls="front-trade-panel"
              @click="tradeOpen = !tradeOpen"
            >
              交易
              <svg
                class="h-3 w-3 shrink-0 opacity-70 transition-transform duration-200"
                :class="tradeOpen ? 'rotate-180' : ''"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 4.5 6 7.5 9 4.5"
                  stroke="currentColor"
                  stroke-width="1.25"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <Transition
              enter-active-class="transition duration-150 ease-out"
              enter-from-class="opacity-0 -translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-1"
            >
              <div
                v-show="tradeOpen"
                id="front-trade-panel"
                class="absolute left-0 top-full z-30 mt-1.5 flex min-w-[22rem] divide-x divide-[#1f2429] overflow-hidden rounded-md border border-[#1f2429] bg-[#1e2329] py-1.5 shadow-xl shadow-black/50"
                role="menu"
              >
                <div
                  v-for="group in tradeMenuGroups"
                  :key="group.key"
                  class="min-w-0 flex-1 px-0.5 first:pl-0 last:pr-0"
                >
                  <p
                    class="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#848e9c]"
                  >
                    {{ group.label }}
                  </p>
                  <RouterLink
                    v-for="item in group.items"
                    :key="item.key"
                    :to="item.to"
                    role="menuitem"
                    class="block px-3 py-2 text-sm transition-colors lg:text-[0.9375rem] lg:leading-snug"
                    :class="dropdownItemClass(item.to)"
                    @click="tradeOpen = false"
                  >
                    {{ item.label }}
                  </RouterLink>
                </div>
              </div>
            </Transition>
          </div>
        </nav>
      </div>

      <!-- 右：大屏工具 + 账户 -->
      <div class="hidden shrink-0 items-center gap-2 sm:gap-3 lg:flex">
        <button
          type="button"
          class="rounded-md p-2 text-[#eaecef] transition hover:bg-[#1f2429] hover:text-lime-300"
          aria-label="搜索"
        >
          <svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
            />
          </svg>
        </button>
        <button
          type="button"
          class="hidden rounded-md p-2 text-[#eaecef] transition hover:bg-[#1f2429] hover:text-lime-300 xl:block"
          aria-label="下载"
        >
          <svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 4v11m0 0-3.5-3.5M12 15l3.5-3.5M5 19h14"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          class="hidden rounded-md p-2 text-[#eaecef] transition hover:bg-[#1f2429] hover:text-lime-300 xl:block"
          aria-label="语言"
        >
          <svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
              stroke="currentColor"
              stroke-width="1.75"
            />
            <path
              d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18"
              stroke="currentColor"
              stroke-width="1.75"
            />
          </svg>
        </button>

        <RouterLink
          :to="`${prefix}/personal-center`"
          class="rounded-lg px-3.5 py-2 text-sm font-medium text-[#eaecef] transition [-webkit-tap-highlight-color:transparent] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0e11] hover:bg-[#3f4652] sm:px-4"
          :class="
            isPersonalCenterNavActive() ? 'bg-[#3f4652] text-white' : 'bg-[#1f2429]'
          "
          @click="mobileOpen = false"
        >
          个人中心
        </RouterLink>
      </div>

      <!-- 右：<lg 菜单 -->
      <div class="flex shrink-0 items-center gap-2 lg:hidden">
        <button
          type="button"
          class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#1f2429] text-[#eaecef] transition hover:bg-[#3f4652]"
          :aria-expanded="mobileOpen"
          aria-haspopup="dialog"
          aria-controls="front-nav-drawer"
          :aria-label="mobileOpen ? '关闭菜单' : '打开菜单'"
          @click="mobileOpen = !mobileOpen"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              v-if="!mobileOpen"
              d="M4 7h16M4 12h16M4 17h10"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
            />
            <path
              v-else
              d="m6 6 12 12M18 6 6 18"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="front-drawer">
        <div
          v-if="mobileOpen"
          id="front-nav-drawer"
          ref="mobileDrawerRef"
          class="fixed inset-0 z-[100] lg:hidden"
          role="presentation"
        >
          <div
            class="absolute inset-0 bg-black/55 backdrop-blur-[1px]"
            aria-hidden="true"
            @click="mobileOpen = false"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="菜单"
            class="front-drawer-panel absolute left-0 top-0 flex h-full w-[min(18rem,86vw)] max-w-[100vw] flex-col border-r border-white/[0.04] bg-[#0b0e11] shadow-[4px_0_24px_-4px_rgba(0,0,0,0.5)]"
            @click.stop
          >
            <div
              class="flex shrink-0 items-center justify-end border-b border-white/[0.04] bg-[#0b0e11]/95 px-2 py-2 pt-[max(0.5rem,env(safe-area-inset-top,0px))]"
            >
              <button
                type="button"
                class="rounded-lg p-2 text-[#848e9c] transition hover:bg-white/[0.08] hover:text-white"
                aria-label="关闭菜单"
                @click="mobileOpen = false"
              >
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="m6 6 12 12M18 6 6 18"
                    stroke="currentColor"
                    stroke-width="1.75"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </div>
            <nav
              class="drawer-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]"
              role="menu"
            >
              <p class="mb-2.5 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#848e9c]/90 sm:tracking-wider">
                主导航
              </p>
              <div class="space-y-1">
                <RouterLink
                  v-for="item in drawerPrimaryNavEntries"
                  :key="item.key"
                  :to="item.to"
                  role="menuitem"
                  :class="drawerRowClass(item)"
                  @click="mobileOpen = false"
                >
                  <span
                    class="drawer-nav-icon flex h-8 w-8 shrink-0 items-center justify-center"
                    :class="drawerRowActive(item) ? 'text-lime-300/95' : 'text-lime-400/65'"
                    aria-hidden="true"
                  >
                    <svg
                      class="h-[18px] w-[18px]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.65"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path v-for="(d, i) in drawerIconPaths(item.icon)" :key="i" :d="d" />
                    </svg>
                  </span>
                  <span class="min-w-0 truncate">{{ item.label }}</span>
                </RouterLink>
              </div>
              <div
                class="mx-3 mb-1 mt-6 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent"
                aria-hidden="true"
              />
              <p class="mb-2.5 mt-6 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#848e9c]/90 sm:tracking-wider">
                个人中心
              </p>
              <div class="space-y-1">
                <RouterLink
                  v-for="item in drawerPersonalNavEntries"
                  :key="item.key"
                  :to="item.to"
                  role="menuitem"
                  :class="drawerRowClass(item)"
                  @click="mobileOpen = false"
                >
                  <span
                    class="drawer-nav-icon flex h-8 w-8 shrink-0 items-center justify-center"
                    :class="drawerRowActive(item) ? 'text-lime-300/95' : 'text-lime-400/65'"
                    aria-hidden="true"
                  >
                    <svg
                      class="h-[18px] w-[18px]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.65"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path v-for="(d, i) in drawerIconPaths(item.icon)" :key="i" :d="d" />
                    </svg>
                  </span>
                  <span class="min-w-0 truncate">{{ item.label }}</span>
                </RouterLink>
              </div>
            </nav>
          </aside>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.front-drawer-enter-active,
.front-drawer-leave-active {
  transition: opacity 0.2s ease;
}

.front-drawer-enter-active .front-drawer-panel,
.front-drawer-leave-active .front-drawer-panel {
  transition: transform 0.2s ease;
}

.front-drawer-enter-from,
.front-drawer-leave-to {
  opacity: 0;
}

.front-drawer-enter-from .front-drawer-panel,
.front-drawer-leave-to .front-drawer-panel {
  transform: translateX(-100%);
}

@media (prefers-reduced-motion: reduce) {
  .front-drawer-enter-active,
  .front-drawer-leave-active,
  .front-drawer-enter-active .front-drawer-panel,
  .front-drawer-leave-active .front-drawer-panel {
    transition: none;
  }
}

/* 可滚动但不显示滚动条（触摸 / 滚轮 / 触控板仍可用） */
.drawer-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.drawer-scroll::-webkit-scrollbar {
  display: none;
}
</style>
