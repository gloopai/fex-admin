<script setup>
import { computed, ref } from 'vue'
import FrontBindSuccessState from './FrontBindSuccessState.vue'
import FrontDarkField from './FrontDarkField.vue'
import FrontFlowStepHeader from './FrontFlowStepHeader.vue'
import FrontLimeButton from './FrontLimeButton.vue'

/**
 * MFA（Google 验证器）绑定流程，无充币场景文案；供安全总览等嵌入。
 */
const props = defineProps({
  demoSecret: { type: String, default: 'JBSWY3DPEHPK3PXP' }
})

const emit = defineEmits(['back', 'completed', 'secret-copied'])

const step = ref(1)
const otp = ref('')

const otpOk = computed(() => /^\d{6}$/.test(otp.value))

function reset() {
  step.value = 1
  otp.value = ''
}

defineExpose({ reset })

function onBack() {
  if (step.value === 1) {
    emit('back')
    return
  }
  if (step.value === 2) {
    step.value = 1
    otp.value = ''
    return
  }
  step.value = 2
}

function onNextFromQr() {
  step.value = 2
}

function copySecret() {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(props.demoSecret).catch(() => {})
  }
  emit('secret-copied')
}

function onVerify() {
  if (!otpOk.value) return
  step.value = 3
}

function onFinish() {
  emit('completed')
}
</script>

<template>
  <div class="flex min-h-0 w-full flex-1 flex-col overflow-hidden text-white">
    <FrontFlowStepHeader title="绑定 Google 验证器" @back="onBack" />

    <div class="min-h-0 flex-1 overflow-y-auto px-4 py-4">
      <template v-if="step === 1">
        <p class="text-sm leading-relaxed text-emerald-100/85">
          使用 Google Authenticator 等应用生成动态口令。请扫描下方二维码或手动输入密钥。
        </p>
        <div class="mt-4 flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-5">
          <p class="text-xs text-white/50">使用验证器扫描以下二维码</p>
          <div
            class="flex h-32 w-32 items-center justify-center rounded-lg border border-white/15 bg-white"
            role="img"
            aria-label="Google 验证器绑定二维码"
          >
            <span class="text-center text-[10px] text-neutral-400">QR</span>
          </div>
          <div class="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5">
            <p class="text-[10px] uppercase tracking-wide text-white/45">密钥</p>
            <p class="mt-1 break-all font-mono text-xs text-lime-200/90">
              {{ demoSecret }}
            </p>
            <button
              type="button"
              class="mt-2 text-xs font-medium text-sky-300 hover:text-sky-200"
              @click="copySecret"
            >
              复制密钥
            </button>
          </div>
        </div>
        <FrontLimeButton class="mt-4 w-full" @click="onNextFromQr">
          已在验证器中添加，下一步
        </FrontLimeButton>
      </template>

      <template v-else-if="step === 2">
        <p class="text-sm leading-relaxed text-emerald-100/85">
          请输入验证器中显示的 6 位动态码。
        </p>
        <FrontDarkField
          v-model="otp"
          class="mt-4"
          label="验证码"
          variant="otp"
          type="text"
          inputmode="numeric"
          maxlength="6"
          autocomplete="one-time-code"
          placeholder="000000"
          @keydown.enter.prevent="onVerify"
        />
        <FrontLimeButton class="mt-4 w-full" :disabled="!otpOk" @click="onVerify">
          验证并绑定
        </FrontLimeButton>
      </template>

      <template v-else>
        <FrontBindSuccessState @primary="onFinish">
          <template #title>Google 验证器已启用</template>
          <template #description>
            提币等敏感操作将校验动态码。请妥善保管当前设备；换机或重装应用时，请在安全中心重新绑定。
          </template>
        </FrontBindSuccessState>
      </template>
    </div>
  </div>
</template>
