<script setup>
/**
 * 前台主操作按钮（亮绿）。
 */
defineProps({
  disabled: { type: Boolean, default: false }
})
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    class="rounded-lg bg-lime-400 px-4 py-3 text-sm font-semibold text-black hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-40"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>
