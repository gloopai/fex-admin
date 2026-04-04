<script setup>
import { computed } from 'vue'

/**
 * 细边框 + 淡色底的胶囊标签（账户 VIP / KYC 等）。
 */
const props = defineProps({
  tone: {
    type: String,
    default: 'lime',
    validator: (v) => ['amber', 'sky', 'lime'].includes(v)
  },
  /** 与前置图标并排时使用 */
  inlineFlex: { type: Boolean, default: false }
})

const toneClass = computed(() => {
  const map = {
    amber: 'border-amber-400/45 bg-amber-400/[0.12] text-white',
    sky: 'border-sky-400/45 bg-sky-400/[0.12] text-white',
    lime: 'border-lime-400/35 bg-lime-400/[0.06] text-lime-100'
  }
  return map[props.tone] ?? map.lime
})
</script>

<template>
  <span
    :class="[
      'rounded-full border px-2.5 py-1 text-xs font-medium',
      toneClass,
      inlineFlex ? 'inline-flex items-center gap-1.5' : ''
    ]"
  >
    <slot />
  </span>
</template>
