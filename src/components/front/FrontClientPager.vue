<script setup>
import { FINANCE_FX as fx } from '../../constants/frontFinanceUi'

defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  total: { type: Number, required: true },
  pageSize: { type: Number, default: 8 }
})

defineEmits(['prev', 'next'])
</script>

<template>
  <div
    v-if="total > pageSize"
    class="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] px-3 py-3 sm:px-5"
  >
    <p class="text-[11px] tabular-nums text-white/40 sm:text-xs">
      共 {{ total }} 条 · 每页 {{ pageSize }} 条
    </p>
    <div class="flex items-center gap-2">
      <button
        type="button"
        :disabled="page <= 1"
        :class="[fx.btnInlineNeutral, 'min-h-0 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-30']"
        @click="$emit('prev')"
      >
        上一页
      </button>
      <span class="min-w-[3.5rem] text-center text-xs tabular-nums text-white/55">{{ page }} / {{ totalPages }}</span>
      <button
        type="button"
        :disabled="page >= totalPages"
        :class="[fx.btnInlineNeutral, 'min-h-0 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-30']"
        @click="$emit('next')"
      >
        下一页
      </button>
    </div>
  </div>
</template>
