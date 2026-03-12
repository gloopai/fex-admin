<script setup>
import { computed } from 'vue'
import { navTree } from '../config/nav'
import SidebarNode from './SidebarNode.vue'

const props = defineProps({
  mobileOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const sidebarClass = computed(() => {
  if (props.mobileOpen) return 'translate-x-0'
  return '-translate-x-full lg:translate-x-0'
})
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-40 w-[256px] shrink-0 bg-antd-sidebar-dark text-white/65 transition-transform duration-200 lg:static lg:z-auto"
    :class="sidebarClass"
  >
    <div class="flex h-full flex-col">
      <div class="flex items-center justify-between gap-3 px-5 py-4">
        <div class="flex items-center gap-3">
          <div class="grid h-8 w-8 place-items-center rounded-lg bg-antd-primary text-white">
            <svg viewBox="0 0 20 20" class="h-4 w-4" fill="none">
              <path d="M4 13L8 9L10.8 11.8L15.8 6.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div>
            <p class="text-lg leading-none font-bold text-white">CryptoX Pro</p>
          </div>
        </div>

        <button
          type="button"
          class="rounded-md p-1 text-white/45 transition hover:bg-white/10 hover:text-white lg:hidden"
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
          <SidebarNode v-for="item in navTree" :key="item.title + (item.path || '')" :item="item" :level="0" />
        </ul>
      </nav>
    </div>
  </aside>
</template>
