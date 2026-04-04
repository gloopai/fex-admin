<script setup>
import { computed } from 'vue'

defineOptions({ inheritAttrs: false })

/**
 * 与 FrontPopupShell 配合使用的面板外壳：统一 popup-card、圆角与最大高度。
 * - flow：纵向 flex + max-height，用于绑定流程 / 修改密码 / 设备管理
 * - padded：带内边距的静态高度内容区，用于简单提示 + 表单（如提现校验弹窗）
 * - shell：仅 overflow 容器，视觉用内层 FrontPopupInnerPanel（安全总览、充币 MFA）
 */
const props = defineProps({
  variant: {
    type: String,
    default: 'flow',
    validator: (v) => ['flow', 'padded', 'shell'].includes(v)
  },
  flowMax: {
    type: String,
    default: '680',
    validator: (v) => ['680', '720', '760'].includes(v)
  },
  wide: { type: Boolean, default: false }
})

const maxHClass = {
  680: 'max-h-[min(92vh,680px)]',
  720: 'max-h-[min(92vh,720px)]',
  760: 'max-h-[min(92vh,760px)]'
}

const rootClass = computed(() => {
  const base = ['popup-card relative z-[121] w-full max-w-md overflow-hidden']
  if (props.wide) base.push('sm:max-w-lg')

  if (props.variant === 'shell') {
    return base.join(' ')
  }

  base.push('rounded-2xl border border-white/10 bg-[#121212] shadow-2xl')

  if (props.variant === 'flow') {
    base.push('flex flex-col', maxHClass[props.flowMax])
  } else if (props.variant === 'padded') {
    base.push('px-4 pb-6 pt-5 text-white')
  }

  return base.join(' ')
})
</script>

<template>
  <div :class="rootClass" v-bind="$attrs">
    <slot />
  </div>
</template>
