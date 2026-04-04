<script setup>
defineOptions({ inheritAttrs: false })

/**
 * 嵌在 shell 型 FrontPopupCard 内的实色圆角面板（安全总览 / 充币 MFA 等滑动切换容器）。
 */
const props = defineProps({
  maxPreset: {
    type: String,
    default: '720',
    validator: (v) => ['680', '720', '760'].includes(v)
  }
})

const maxHClass = {
  680: 'max-h-[min(92vh,680px)]',
  720: 'max-h-[min(92vh,720px)]',
  760: 'max-h-[min(92vh,760px)]'
}
</script>

<template>
  <div
    :class="[
      'relative flex min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#121212] text-white shadow-2xl',
      maxHClass[maxPreset]
    ]"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>
