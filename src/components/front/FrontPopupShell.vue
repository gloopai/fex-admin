<script setup>
/**
 * 前台弹窗外壳：遮罩 + 纵向滑入/滑出（popup-shell），槽位内放置带 .popup-card 的面板。
 */
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  ariaLabelledby: { type: String, default: '' },
  closeOnBackdrop: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'backdrop-click'])

function onBackdrop() {
  emit('backdrop-click')
  if (props.closeOnBackdrop) {
    emit('update:modelValue', false)
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="popup-shell">
      <div
        v-if="modelValue"
        class="popup-root fixed inset-0 z-[120] flex items-end justify-center px-4 pb-4 sm:items-center sm:p-4"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="ariaLabelledby || undefined"
      >
        <div
          class="popup-backdrop absolute inset-0 bg-black/60 backdrop-blur-[2px]"
          @click="onBackdrop"
        />
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.popup-shell-enter-active {
  transition: opacity 0.28s ease;
}

.popup-shell-leave-active {
  transition: opacity 0.22s ease;
}

.popup-shell-enter-active :deep(.popup-card),
.popup-shell-leave-active :deep(.popup-card) {
  transition: transform 0.38s cubic-bezier(0.32, 0.72, 0, 1);
}

.popup-shell-enter-from,
.popup-shell-leave-to {
  opacity: 0;
}

.popup-shell-enter-from :deep(.popup-card),
.popup-shell-leave-to :deep(.popup-card) {
  transform: translateY(100%);
}

@media (min-width: 640px) {
  .popup-shell-enter-from :deep(.popup-card),
  .popup-shell-leave-to :deep(.popup-card) {
    transform: translateY(min(28vh, 10rem));
  }
}

@media (prefers-reduced-motion: reduce) {
  .popup-shell-enter-active,
  .popup-shell-leave-active,
  .popup-shell-enter-active :deep(.popup-card),
  .popup-shell-leave-active :deep(.popup-card) {
    transition-duration: 0.01ms !important;
  }

  .popup-shell-enter-from :deep(.popup-card),
  .popup-shell-leave-to :deep(.popup-card) {
    transform: none !important;
  }
}
</style>
