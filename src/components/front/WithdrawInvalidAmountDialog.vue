<script setup>
import FrontPopupCloseButton from './FrontPopupCloseButton.vue'
import FrontPopupShell from './FrontPopupShell.vue'

defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '提币数量不在允许范围内' },
  message: { type: String, required: true }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

function close() {
  emit('update:modelValue', false)
}

function onCancel() {
  emit('cancel')
  close()
}

function onConfirm() {
  emit('confirm')
  close()
}
</script>

<template>
  <FrontPopupShell
    :model-value="modelValue"
    aria-labelledby="withdraw-range-dialog-title"
    @update:model-value="emit('update:modelValue', $event)"
    @backdrop-click="emit('cancel')"
  >
    <div
      class="popup-card relative z-[121] w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#121212] px-4 pb-6 pt-5 text-white shadow-2xl"
      @click.stop
    >
      <FrontPopupCloseButton @click="onCancel" />
      <div class="flex items-start gap-3">
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/15 text-xl text-lime-200"
        >
          !
        </div>
        <div class="min-w-0 flex-1 pr-10 sm:pr-11">
          <h3 id="withdraw-range-dialog-title" class="text-lg font-semibold leading-snug">
            {{ title }}
          </h3>
          <p class="mt-2 text-sm leading-relaxed text-emerald-100/85">
            {{ message }}
          </p>
        </div>
      </div>

      <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          class="rounded-lg border border-white/20 px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10"
          @click="onCancel"
        >
          返回修改
        </button>
        <button
          type="button"
          class="rounded-lg bg-lime-400 px-4 py-2.5 text-sm font-semibold text-black hover:bg-lime-300"
          @click="onConfirm"
        >
          知道了
        </button>
      </div>
    </div>
  </FrontPopupShell>
</template>
