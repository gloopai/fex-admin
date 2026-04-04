<script setup>
import { nextTick, ref, watch } from 'vue'
import BindEmailFlow from './BindEmailFlow.vue'
import FrontPopupCloseButton from './FrontPopupCloseButton.vue'
import FrontPopupShell from './FrontPopupShell.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'completed', 'send-code', 'backdrop-close'])

const flowRef = ref(null)

watch(
  () => props.modelValue,
  (open) => {
    if (!open) nextTick(() => flowRef.value?.reset())
  }
)

function closeOut() {
  emit('update:modelValue', false)
}

function onFlowBack() {
  closeOut()
}

function onFlowComplete(payload) {
  emit('completed', payload)
  closeOut()
}
</script>

<template>
  <FrontPopupShell
    :model-value="modelValue"
    aria-labelledby="bind-email-dialog-title"
    @update:model-value="emit('update:modelValue', $event)"
    @backdrop-click="emit('backdrop-close')"
  >
    <div
      class="popup-card relative z-[121] flex max-h-[min(92vh,680px)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#121212] shadow-2xl"
      @click.stop
    >
      <FrontPopupCloseButton @click="closeOut" />
      <span id="bind-email-dialog-title" class="sr-only" tabindex="-1">绑定邮箱</span>
      <BindEmailFlow
        ref="flowRef"
        @back="onFlowBack"
        @completed="onFlowComplete"
        @send-code="(e) => emit('send-code', e)"
      />
    </div>
  </FrontPopupShell>
</template>
