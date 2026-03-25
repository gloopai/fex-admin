<script setup>
import { useRoute } from 'vue-router'
import CrossPlatformFloatNav from '../components/CrossPlatformFloatNav.vue'

const route = useRoute()

const menus = [
  { key: 'personal', label: '个人中心', to: '/front/personal-center' },
  { key: 'verify', label: '认证流程', to: '/front/verification-flow' },
  { key: 'perm', label: '权限提示', to: '/front/verification-permission-demo' },
  { key: 'popup', label: '弹窗演示', to: '/front/verification-popup-demo' }
]

const isActive = (to) => route.path.startsWith(to)
</script>

<template>
  <div class="min-h-screen bg-[#050505] text-white">
    <div class="sticky top-0 z-20 border-b border-white/10 bg-black/70 backdrop-blur">
      <div class="mx-auto flex max-w-[1280px] items-center gap-3 px-6 py-3">
        <RouterLink
          v-for="item in menus"
          :key="item.key"
          :to="item.to"
          class="rounded-lg border px-4 py-2 text-sm transition"
          :class="isActive(item.to) ? 'border-lime-300/40 bg-lime-300/15 text-lime-200' : 'border-white/15 bg-white/[0.04] text-white/75 hover:bg-white/[0.08]'"
        >
          {{ item.label }}
        </RouterLink>
      </div>
    </div>
    <RouterView />
    <CrossPlatformFloatNav />
  </div>
</template>
