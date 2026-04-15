<script setup>
import { computed } from 'vue'
import FrontStrokeIcon from '../front/FrontStrokeIcon.vue'

const props = defineProps({
  dark: { type: Boolean, default: true },
  fill: { type: Boolean, default: false },
  /** 主标题 */
  title: { type: String, default: '暂无法提币' },
  /** 说明正文 */
  description: {
    type: String,
    default:
      '您已完成高级身份认证，但当前账户根据平台策略暂不可发起提币。如有疑问请联系客服或等待审核结果。'
  }
})

const wrapClass = computed(() => {
  const base = 'flex flex-col items-center justify-center rounded-2xl px-5 text-center'
  const size = props.fill ? 'min-h-[min(70vh,28rem)] py-10 sm:py-14' : 'py-12 sm:py-16'
  return `${base} ${size}`
})

const panelClass = computed(() =>
  props.dark
    ? 'border border-amber-400/30 bg-amber-400/[0.07] text-amber-50'
    : 'border border-amber-200 bg-amber-50/90 text-amber-950 shadow-sm'
)

const iconWrapClass = computed(() =>
  props.dark
    ? 'border border-amber-400/35 bg-amber-500/15 text-amber-200'
    : 'border border-amber-300 bg-amber-100 text-amber-800'
)
</script>

<template>
  <div class="w-full" :class="[wrapClass, panelClass]" role="status">
    <div
      class="flex h-16 w-16 items-center justify-center rounded-2xl sm:h-[4.5rem] sm:w-[4.5rem]"
      :class="iconWrapClass"
      aria-hidden="true"
    >
      <FrontStrokeIcon name="shield" size-class="h-9 w-9 sm:h-10 sm:w-10" />
    </div>

    <h3 class="mt-5 max-w-sm text-base font-semibold leading-snug sm:text-lg">
      {{ title }}
    </h3>
    <p
      class="mt-2 max-w-sm text-sm leading-relaxed"
      :class="dark ? 'text-amber-100/85' : 'text-amber-900/90'"
    >
      {{ description }}
    </p>
  </div>
</template>
