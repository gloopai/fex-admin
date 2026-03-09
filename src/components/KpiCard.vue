<script setup>
defineProps({
  label: String,
  value: String,
  trend: String,
  good: Boolean
})
</script>

<template>
  <article class="rounded-xl border border-slate-200 bg-white p-4">
    <p class="text-sm text-slate-500">{{ label }}</p>
    <p class="mt-2 text-2xl font-semibold text-slate-900">{{ value }}</p>
    <p class="mt-2 text-sm font-medium" :class="good ? 'text-emerald-600' : 'text-rose-600'">
      {{ trend }}
    </p>
  </article>
</template>
