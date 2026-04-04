<script setup>
import FrontLimeButton from './FrontLimeButton.vue'
import FrontStrokeIcon from './FrontStrokeIcon.vue'

defineProps({
  primaryLabel: { type: String, default: '完成' }
})

const emit = defineEmits(['primary'])
</script>

<template>
  <div class="mx-auto flex max-w-sm flex-col items-center py-6 text-center">
    <div
      class="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/[0.18] text-emerald-100 shadow-[0_0_0_1px_rgba(52,211,153,0.25),0_12px_40px_-12px_rgba(52,211,153,0.35)]"
      aria-hidden="true"
    >
      <FrontStrokeIcon name="check" size-class="h-8 w-8" />
    </div>
    <h3 class="mt-6 text-[1.05rem] font-semibold leading-snug tracking-tight text-white">
      <slot name="title" />
    </h3>
    <p v-if="$slots.description" class="mt-3 text-sm leading-relaxed text-white/55">
      <slot name="description" />
    </p>
    <FrontLimeButton class="mt-8 w-full" @click="emit('primary')">
      {{ primaryLabel }}
    </FrontLimeButton>
  </div>
</template>
