<script setup>
/**
 * 安全绑定类流程顶栏：返回 + 标题（右侧需为关闭按钮预留空间时使用 pr-12 父级或由弹窗层叠关闭）。
 */
defineProps({
  title: { type: String, required: true }
})

defineEmits(['back'])
</script>

<template>
  <div class="flex shrink-0 items-center gap-2 border-b border-white/10 py-3 pl-3 pr-12">
    <button
      type="button"
      class="rounded-lg px-2 py-1.5 text-sm text-white/80 hover:bg-white/10"
      aria-label="返回"
      @click="$emit('back')"
    >
      ←
    </button>
    <h2 class="text-base font-semibold">{{ title }}</h2>
  </div>
</template>
