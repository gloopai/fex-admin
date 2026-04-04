<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import BindEmailFlow from './BindEmailFlow.vue'
import BindPhoneFlow from './BindPhoneFlow.vue'
import FrontPopupCard from './FrontPopupCard.vue'
import FrontPopupCloseButton from './FrontPopupCloseButton.vue'
import FrontPopupInnerPanel from './FrontPopupInnerPanel.vue'
import FrontPopupShell from './FrontPopupShell.vue'
import FrontStrokeIcon from './FrontStrokeIcon.vue'
import MfaBindFlow from './MfaBindFlow.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  phoneBound: { type: Boolean, default: false },
  emailBound: { type: Boolean, default: false },
  mfaBound: { type: Boolean, default: false },
  demoSecret: { type: String, default: 'JBSWY3DPEHPK3PXP' }
})

const emit = defineEmits([
  'update:modelValue',
  'update:phoneBound',
  'update:emailBound',
  'update:mfaBound',
  'backdrop-close',
  'phone-send-code',
  'email-send-code',
  'mfa-secret-copied'
])

/** hub | phone | email | mfa */
const view = ref('hub')
const slideForward = ref(true)

const phoneFlowRef = ref(null)
const emailFlowRef = ref(null)
const mfaFlowRef = ref(null)

const slideName = computed(() => (slideForward.value ? 'sec-slide-fwd' : 'sec-slide-back'))

const viewKey = computed(() => view.value)

function resetAllFlows() {
  nextTick(() => {
    phoneFlowRef.value?.reset()
    emailFlowRef.value?.reset()
    mfaFlowRef.value?.reset()
  })
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) {
      view.value = 'hub'
      resetAllFlows()
    }
  }
)

function closeOut() {
  emit('update:modelValue', false)
}

function openSub(next) {
  slideForward.value = true
  view.value = next
}

function backToHub() {
  slideForward.value = false
  view.value = 'hub'
  resetAllFlows()
}

function onPhoneDone() {
  emit('update:phoneBound', true)
  backToHub()
}

function onEmailDone() {
  emit('update:emailBound', true)
  backToHub()
}

function onMfaDone() {
  emit('update:mfaBound', true)
  backToHub()
}
</script>

<template>
  <FrontPopupShell
    :model-value="modelValue"
    aria-labelledby="security-check-title"
    @update:model-value="emit('update:modelValue', $event)"
    @backdrop-click="emit('backdrop-close')"
  >
    <FrontPopupCard variant="shell">
      <Transition :name="slideName" mode="out-in">
        <FrontPopupInnerPanel :key="viewKey" max-preset="720" @click.stop>
          <FrontPopupCloseButton @click="closeOut" />
          <!-- 总览 -->
          <template v-if="view === 'hub'">
            <div class="shrink-0 border-b border-white/10 px-4 pb-4 pt-5">
              <div class="flex items-start gap-3">
                <div
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-400/15 text-violet-200/90"
                  aria-hidden="true"
                >
                  <FrontStrokeIcon name="shield" size-class="h-5 w-5" />
                </div>
                <div class="min-w-0 flex-1 pr-10 sm:pr-11">
                  <h2 id="security-check-title" class="text-lg font-semibold leading-snug">账号安全检测</h2>
                  <p class="mt-1.5 text-xs leading-relaxed text-white/55">
                    建议完成手机、邮箱与两步验证，以提高账户与资金安全。点击下方项目分别进入绑定流程。
                  </p>
                </div>
              </div>
            </div>

            <div class="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-4">
              <button
                type="button"
                class="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-left transition hover:bg-white/[0.07]"
                @click="openSub('phone')"
              >
                <div class="min-w-0">
                  <p class="text-sm font-medium text-white/90">手机号码</p>
                  <p class="mt-0.5 text-xs text-white/45">
                    {{ phoneBound ? '已绑定 · 用于短信验证与安全提醒' : '未绑定 · 可接收短信验证码' }}
                  </p>
                </div>
                <span
                  class="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="
                    phoneBound
                      ? 'bg-emerald-500/20 text-emerald-200/90'
                      : 'bg-lime-400/20 text-lime-200'
                  "
                >
                  {{ phoneBound ? '已绑定' : '去绑定' }}
                </span>
              </button>

              <button
                type="button"
                class="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-left transition hover:bg-white/[0.07]"
                @click="openSub('email')"
              >
                <div class="min-w-0">
                  <p class="text-sm font-medium text-white/90">邮箱</p>
                  <p class="mt-0.5 text-xs text-white/45">
                    {{ emailBound ? '已绑定 · 用于通知与找回' : '未绑定 · 可接收邮件验证码' }}
                  </p>
                </div>
                <span
                  class="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="
                    emailBound ? 'bg-emerald-500/20 text-emerald-200/90' : 'bg-lime-400/20 text-lime-200'
                  "
                >
                  {{ emailBound ? '已绑定' : '去绑定' }}
                </span>
              </button>

              <button
                type="button"
                class="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-left transition hover:bg-white/[0.07]"
                @click="openSub('mfa')"
              >
                <div class="min-w-0">
                  <p class="text-sm font-medium text-white/90">Google 验证器（MFA）</p>
                  <p class="mt-0.5 text-xs text-white/45">
                    {{ mfaBound ? '已开启 · 提币等操作需动态口令' : '未开启 · 强烈建议绑定' }}
                  </p>
                </div>
                <span
                  class="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="
                    mfaBound ? 'bg-emerald-500/20 text-emerald-200/90' : 'bg-lime-400/20 text-lime-200'
                  "
                >
                  {{ mfaBound ? '已开启' : '去绑定' }}
                </span>
              </button>
            </div>

            <div class="shrink-0 border-t border-white/10 px-4 pb-5 pt-4">
              <button
                type="button"
                class="w-full rounded-lg border border-white/20 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10"
                @click="closeOut"
              >
                关闭
              </button>
            </div>
          </template>

          <BindPhoneFlow
            v-else-if="view === 'phone'"
            ref="phoneFlowRef"
            @back="backToHub"
            @completed="onPhoneDone"
            @send-code="(p) => emit('phone-send-code', p)"
          />

          <BindEmailFlow
            v-else-if="view === 'email'"
            ref="emailFlowRef"
            @back="backToHub"
            @completed="onEmailDone"
            @send-code="(e) => emit('email-send-code', e)"
          />

          <MfaBindFlow
            v-else
            ref="mfaFlowRef"
            :demo-secret="demoSecret"
            @back="backToHub"
            @completed="onMfaDone"
            @secret-copied="emit('mfa-secret-copied')"
          />
        </FrontPopupInnerPanel>
      </Transition>
    </FrontPopupCard>
  </FrontPopupShell>
</template>

<style scoped>
.sec-slide-fwd-enter-active,
.sec-slide-fwd-leave-active,
.sec-slide-back-enter-active,
.sec-slide-back-leave-active {
  transition: transform 0.34s cubic-bezier(0.32, 0.72, 0, 1);
}

.sec-slide-fwd-enter-from {
  transform: translateX(100%);
}

.sec-slide-fwd-leave-to {
  transform: translateX(-100%);
}

.sec-slide-back-enter-from {
  transform: translateX(-100%);
}

.sec-slide-back-leave-to {
  transform: translateX(100%);
}

@media (prefers-reduced-motion: reduce) {
  .sec-slide-fwd-enter-active,
  .sec-slide-fwd-leave-active,
  .sec-slide-back-enter-active,
  .sec-slide-back-leave-active {
    transition-duration: 0.01ms !important;
  }

  .sec-slide-fwd-enter-from,
  .sec-slide-fwd-leave-to,
  .sec-slide-back-enter-from,
  .sec-slide-back-leave-to {
    transform: none !important;
  }
}
</style>
