<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const entries = [
  { key: 'admin', label: '管理台', to: '/admin' },
  { key: 'pc', label: 'PC 端', to: '/front/personal-center' },
  { key: 'mobile', label: '移动端', to: '/m/personal-center' }
]

const currentEntry = computed(() => {
  if (route.path.startsWith('/admin')) return 'admin'
  if (route.path.startsWith('/front')) return 'pc'
  if (route.path.startsWith('/m')) return 'mobile'
  return ''
})
</script>

<template>
  <div class="fixed right-4 bottom-4 z-50">
    <div class="rounded-2xl border border-white/20 bg-black/70 p-2 shadow-2xl backdrop-blur">
      <div class="flex items-center gap-2">
        <RouterLink
          v-for="entry in entries"
          :key="entry.key"
          :to="entry.to"
          class="rounded-lg border px-3 py-1.5 text-xs transition"
          :class="currentEntry === entry.key ? 'border-lime-300/50 bg-lime-300/20 text-lime-200' : 'border-white/20 bg-white/5 text-white/80 hover:bg-white/10'"
        >
          {{ entry.label }}
        </RouterLink>
      </div>
    </div>
  </div>
</template>
