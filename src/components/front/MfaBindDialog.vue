<script setup>
import { nextTick, ref, watch } from 'vue'
import FrontPopupCard from './FrontPopupCard.vue'
import FrontPopupCloseButton from './FrontPopupCloseButton.vue'
import FrontPopupShell from './FrontPopupShell.vue'
import MfaBindFlow from './MfaBindFlow.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  demoSecret: { type: String, default: 'JBSWY3DPEHPK3PXP' }
})

const emit = defineEmits(['update:modelValue', 'completed', 'backdrop-close', 'secret-copied'])

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

function onFlowComplete() {
  emit('completed')
  close()
}
</script>

<template>
  <FrontPopupShell
    :model-value="modelValue"
    aria-labelledby="mfa-bind-dialog-title"
    @update:model-value="emit('update:modelValue', $event)"
    @backdrop-click="emit('backdrop-close')"
  >
    <FrontPopupCard variant="flow" flow-max="680" @click.stop>
      <FrontPopupCloseButton @click="close" />
      <span id="mfa-bind-dialog-title" class="sr-only" tabindex="-1">绑定 Google 验证器</span>
      <MfaBindFlow
        ref="flowRef"
        :demo-secret="demoSecret"
        @back="onFlowBack"
        @completed="onFlowComplete"
        @secret-copied="emit('secret-copied')"
      />
    </FrontPopupCard>
  </FrontPopupShell>
</template>
