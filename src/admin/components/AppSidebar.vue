<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { getSiteConfigSnapshot } from '../mock/siteConfig'
import { navTree } from '../config/nav'
import { useAdminPermissionsStore } from '../stores/adminPermissions'
import { filterNavTreeByPermissions } from '../utils/filterNavByPermissions'
import SidebarNode from './SidebarNode.vue'

const permStore = useAdminPermissionsStore()

const filteredNavTree = computed(() =>
  filterNavTreeByPermissions(navTree, (keys) => permStore.canAny(keys))
)

const props = defineProps({
  mobileOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const siteName = ref('CryptoX Pro')
const siteTagline = ref('')
const siteLogoUrlPc = ref('')
const siteLogoUrlMobile = ref('')

/** 宽屏侧栏：优先 PC Logo，否则移动端 */
const logoForDesktop = computed(
  () => siteLogoUrlPc.value || siteLogoUrlMobile.value || ''
)
/** 窄屏抽屉：优先移动端 Logo，否则 PC */
const logoForMobile = computed(
  () => siteLogoUrlMobile.value || siteLogoUrlPc.value || ''
)

const applySiteBranding = () => {
  const c = getSiteConfigSnapshot()
  siteName.value = c.siteName || 'CryptoX Pro'
  siteTagline.value = c.tagline || ''
  siteLogoUrlPc.value = c.logoUrlPc || ''
  siteLogoUrlMobile.value = c.logoUrlMobile || ''
}

onMounted(() => {
  applySiteBranding()
  window.addEventListener('admin-site-config-updated', applySiteBranding)
})

onUnmounted(() => {
  window.removeEventListener('admin-site-config-updated', applySiteBranding)
})

const sidebarClass = computed(() => {
  if (props.mobileOpen) return 'translate-x-0'
  return '-translate-x-full lg:translate-x-0'
})
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-40 w-[256px] shrink-0 border-r border-slate-200 bg-white text-slate-700 transition-transform duration-200 lg:static lg:z-auto"
    :class="sidebarClass"
  >
    <div class="flex h-full flex-col">
      <div class="flex items-center justify-between gap-3 border-b border-slate-200/70 px-5 py-4">
        <div class="flex min-w-0 items-center gap-3">
          <div
            class="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-lg bg-antd-primary text-white"
            :class="{ 'bg-white ring-1 ring-slate-200': logoForDesktop || logoForMobile }"
          >
            <img
              v-if="logoForDesktop"
              :src="logoForDesktop"
              alt=""
              class="hidden h-full w-full object-contain lg:block"
            />
            <img
              v-if="logoForMobile"
              :src="logoForMobile"
              alt=""
              class="h-full w-full object-contain lg:hidden"
            />
            <svg
              v-if="!logoForDesktop && !logoForMobile"
              viewBox="0 0 20 20"
              class="h-4 w-4"
              fill="none"
            >
              <path d="M4 13L8 9L10.8 11.8L15.8 6.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div class="min-w-0">
            <p class="truncate text-lg leading-none font-bold text-slate-900">{{ siteName }}</p>
            <p v-if="siteTagline" class="mt-0.5 truncate text-[11px] leading-tight text-slate-500">{{ siteTagline }}</p>
          </div>
        </div>

        <button
          type="button"
          class="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          aria-label="close menu"
          @click="emit('close')"
        >
          <svg viewBox="0 0 20 20" class="h-5 w-5" fill="none">
            <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <nav class="flex-1 overflow-y-auto px-3 py-3">
        <ul class="space-y-1">
          <SidebarNode v-for="item in filteredNavTree" :key="item.title + (item.path || '')" :item="item" :level="0" />
        </ul>
      </nav>
    </div>
  </aside>
</template>
