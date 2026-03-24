<script setup>
defineProps({
  statistics: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
    <div
      v-for="stat in statistics"
      :key="stat.label"
      class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <p class="text-sm text-slate-600">{{ stat.label }}</p>
      <p :class="`mt-2 text-2xl font-bold text-${stat.color}-600`">{{ stat.value }}</p>
      <p class="mt-1 text-xs text-slate-500">{{ stat.trend }}</p>
    </div>
  </div>
</template>
