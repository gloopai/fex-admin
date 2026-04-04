<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = computed(() => route.meta.title || '页面')
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-16 text-white md:px-6">
    <h1 class="text-2xl font-semibold tracking-tight">{{ title }}</h1>
    <p class="mt-2 text-sm text-white/50">此为前台占位页，可后续接入真实行情或交易模块。</p>
  </div>
</template>
