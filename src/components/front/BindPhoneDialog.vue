<script setup>
import { nextTick, ref, watch } from 'vue'
import BindPhoneFlow from './BindPhoneFlow.vue'
import FrontPopupCard from './FrontPopupCard.vue'
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
    <FrontPopupCard variant="flow" flow-max="680" @click.stop>
      <FrontPopupCloseButton @click="close" />
      <span id="bind-phone-dialog-title" class="sr-only" tabindex="-1">绑定手机号</span>
      <BindPhoneFlow
        ref="flowRef"
        @back="onFlowBack"
        @completed="onFlowComplete"
        @send-code="(p) => emit('send-code', p)"
      />
    </FrontPopupCard>
  </FrontPopupShell>
</template>
