<script setup>
import { computed, watch } from 'vue'
import {
  userMeetsVerificationLevel,
  getVerificationLevelLabel,
  getVerificationUpgradeDetailLine
} from '../../utils/verificationAccess'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  userLevel: { type: String, required: true },
  requiredLevel: { type: String, required: true },
  featureName: { type: String, default: '此功能' },
  verifyHref: { type: String, default: '/front/verification-flow' },
  /** PC：居中弹窗；移动端由样式改为底部抽屉 */
  dark: { type: Boolean, default: true },
  /** 是否仅在未满足等级时展示实质内容（否则点关闭即可） */
  onlyWhenBlocked: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue', 'go-verify', 'close'])

const blocked = computed(() => !userMeetsVerificationLevel(props.userLevel, props.requiredLevel))

const requiredLabel = computed(() => getVerificationLevelLabel(props.requiredLevel))

const bodyText = computed(() => {
  const detail = getVerificationUpgradeDetailLine(props.userLevel, props.requiredLevel)
  if (!detail) {
    return '当前认证状态异常，如需使用本功能请联系客服。'
  }
  return `${detail}完成后即可使用「${props.featureName}」。`
})

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function onVerifyClick() {
  emit('go-verify')
  close()
}

watch(
  () => props.modelValue,
  (open) => {
    if (open && props.onlyWhenBlocked && !blocked.value) {
      emit('update:modelValue', false)
    }
  }
)
</script>

<template>
  <Teleport to="body">
    <Transition name="vreq-dlg">
      <div
        v-if="modelValue && (!onlyWhenBlocked || blocked)"
        class="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4 sm:items-center sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vreq-dialog-title"
      >
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
          @click="close"
        />
        <div
          class="relative z-[101] w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl border border-white/10 bg-[#121212] px-4 pb-6 pt-5 text-white shadow-2xl sm:rounded-2xl sm:p-6 sm:px-6"
          @click.stop
        >
          <div class="mx-auto mb-4 hidden h-1 w-10 rounded-full bg-white/20 sm:hidden" aria-hidden="true" />

          <div class="flex items-start justify-between gap-3">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/15 text-xl text-lime-200">
              🔐
            </div>
            <button
              type="button"
              class="rounded-lg p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
              aria-label="关闭"
              @click="close"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <h2 id="vreq-dialog-title" class="mt-2 text-lg font-semibold leading-snug text-emerald-50">
            需完成「{{ requiredLabel }}」
          </h2>
          <p class="mt-2 text-sm leading-relaxed text-emerald-100/85">
            您当前为「{{ getVerificationLevelLabel(userLevel) }}」。{{ bodyText }}
          </p>

          <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              class="rounded-lg border border-white/20 px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10"
              @click="close"
            >
              知道了
            </button>
            <a
              :href="verifyHref"
              class="inline-flex items-center justify-center rounded-lg bg-lime-400 px-4 py-2.5 text-sm font-semibold text-black hover:bg-lime-300"
              @click="onVerifyClick"
            >
              前往身份认证
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.vreq-dlg-enter-active,
.vreq-dlg-leave-active {
  transition: opacity 0.2s ease;
}
.vreq-dlg-enter-active .relative,
.vreq-dlg-leave-active .relative {
  transition: transform 0.25s ease, opacity 0.2s ease;
}
.vreq-dlg-enter-from,
.vreq-dlg-leave-to {
  opacity: 0;
}
.vreq-dlg-enter-from .relative,
.vreq-dlg-leave-to .relative {
  transform: translateY(12px);
}
@media (min-width: 640px) {
  .vreq-dlg-enter-from .relative,
  .vreq-dlg-leave-to .relative {
    transform: scale(0.96);
  }
}
</style>
