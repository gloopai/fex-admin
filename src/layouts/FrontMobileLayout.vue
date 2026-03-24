<script setup>
import { useRoute } from 'vue-router'
import CrossPlatformFloatNav from '../components/CrossPlatformFloatNav.vue'

const route = useRoute()

const menus = [
  { key: 'personal', label: '个人中心', to: '/m/personal-center' },
  { key: 'verify', label: '认证流程', to: '/m/verification-flow' }
]

const isActive = (to) => route.path.startsWith(to)
</script>

<template>
  <div class="min-h-screen bg-black text-white">
    <div class="sticky top-0 z-20 border-b border-white/10 bg-black/80 backdrop-blur">
      <div class="flex items-center gap-2 px-4 py-3">
        <RouterLink
          v-for="item in menus"
          :key="item.key"
          :to="item.to"
          class="rounded-full border px-3 py-1.5 text-xs transition"
          :class="isActive(item.to) ? 'border-lime-300/40 bg-lime-300/15 text-lime-200' : 'border-white/15 bg-white/[0.04] text-white/75'"
        >
          {{ item.label }}
        </RouterLink>
      </div>
    </div>
    <RouterView />
    <CrossPlatformFloatNav />
  </div>
</template>
