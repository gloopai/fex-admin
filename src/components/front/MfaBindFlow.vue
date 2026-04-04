<script setup>
import { computed, ref } from 'vue'

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
    <div class="flex shrink-0 items-center gap-2 border-b border-white/10 px-3 py-3">
      <button
        type="button"
        class="rounded-lg px-2 py-1.5 text-sm text-white/80 hover:bg-white/10"
        aria-label="返回"
        @click="onBack"
      >
        ←
      </button>
      <h2 class="text-base font-semibold">绑定 Google 验证器</h2>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto px-4 py-4">
      <template v-if="step === 1">
        <p class="text-sm leading-relaxed text-emerald-100/85">
          使用 Google Authenticator 等应用生成动态口令。扫描下方二维码或手动输入密钥（演示数据）。
        </p>
        <div class="mt-4 flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-5">
          <p class="text-xs text-white/50">二维码（演示占位）</p>
          <div
            class="flex h-32 w-32 items-center justify-center rounded-lg border border-white/15 bg-white"
            role="img"
            aria-label="演示二维码"
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
        <button
          type="button"
          class="mt-4 w-full rounded-lg bg-lime-400 px-4 py-3 text-sm font-semibold text-black hover:bg-lime-300"
          @click="onNextFromQr"
        >
          已在验证器中添加，下一步
        </button>
      </template>

      <template v-else-if="step === 2">
        <p class="text-sm leading-relaxed text-emerald-100/85">
          请输入验证器中 6 位动态码（演示任意 6 位数字可通过）。
        </p>
        <label class="mt-4 block">
          <span class="text-xs text-white/50">验证码</span>
          <input
            v-model="otp"
            type="text"
            inputmode="numeric"
            maxlength="6"
            autocomplete="one-time-code"
            placeholder="000000"
            class="mt-1.5 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-3 text-center font-mono text-lg tracking-[0.35em] text-white placeholder:text-white/25 focus:border-lime-400/50 focus:outline-none focus:ring-1 focus:ring-lime-400/30"
            @keydown.enter.prevent="onVerify"
          />
        </label>
        <button
          type="button"
          :disabled="!otpOk"
          class="mt-4 w-full rounded-lg bg-lime-400 px-4 py-3 text-sm font-semibold text-black hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-40"
          @click="onVerify"
        >
          验证并绑定
        </button>
      </template>

      <template v-else>
        <p class="text-sm leading-relaxed text-emerald-100/85">两步验证已开启。</p>
        <p class="mt-2 text-xs text-white/50">请妥善保管设备；换机请按平台规则迁移或重新绑定。</p>
        <button
          type="button"
          class="mt-6 w-full rounded-lg bg-lime-400 px-4 py-3 text-sm font-semibold text-black hover:bg-lime-300"
          @click="onFinish"
        >
          完成
        </button>
      </template>
    </div>
  </div>
</template>
