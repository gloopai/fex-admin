<script setup>
import { nextTick, ref, watch } from 'vue'
import BindPhoneFlow from './BindPhoneFlow.vue'
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

function close() {
  emit('update:modelValue', false)
}

function onFlowBack() {
  close()
}

function onFlowComplete(payload) {
  emit('completed', payload)
  close()
}
</script>

<template>
  <FrontPopupShell
    :model-value="modelValue"
    aria-labelledby="bind-phone-dialog-title"
    @update:model-value="emit('update:modelValue', $event)"
    @backdrop-click="emit('backdrop-close')"
  >
    <div
      class="popup-card relative z-[121] flex max-h-[min(92vh,680px)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#121212] shadow-2xl"
      @click.stop
    >
      <span id="bind-phone-dialog-title" class="sr-only" tabindex="-1">绑定手机号</span>
      <BindPhoneFlow
        ref="flowRef"
        @back="onFlowBack"
        @completed="onFlowComplete"
        @send-code="(p) => emit('send-code', p)"
      />
    </div>
  </FrontPopupShell>
</template>
