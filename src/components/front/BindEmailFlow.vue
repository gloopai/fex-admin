<script setup>
import { computed, ref } from 'vue'

/**
 * 绑定邮箱流程（无 Teleport，可嵌入安全总览或单独弹窗）。
 */
const emit = defineEmits(['back', 'completed', 'send-code'])

const step = ref(1)
const email = ref('')
const mailCode = ref('')

const emailOk = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))
const codeOk = computed(() => /^\d{6}$/.test(mailCode.value))

function reset() {
  step.value = 1
  email.value = ''
  mailCode.value = ''
}

defineExpose({ reset })

function onBack() {
  if (step.value === 1) {
    emit('back')
    return
  }
  if (step.value === 2) {
    step.value = 1
    mailCode.value = ''
    return
  }
  step.value = 2
}

function onSendCode() {
  if (!emailOk.value) return
  emit('send-code', email.value)
  step.value = 2
}

function onConfirmBind() {
  if (!codeOk.value) return
  step.value = 3
}

function onFinish() {
  emit('completed', { email: email.value })
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
      <h2 class="text-base font-semibold">绑定邮箱</h2>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto px-4 py-4">
      <template v-if="step === 1">
        <p class="text-sm leading-relaxed text-emerald-100/85">
          用于接收安全通知与找回验证。演示中不会真实发信，验证码可任意 6 位数字通过。
        </p>
        <label class="mt-4 block">
          <span class="text-xs text-white/50">邮箱地址</span>
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            class="mt-1.5 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-3 text-sm text-white placeholder:text-white/25 focus:border-lime-400/50 focus:outline-none focus:ring-1 focus:ring-lime-400/30"
          />
        </label>
        <button
          type="button"
          :disabled="!emailOk"
          class="mt-4 w-full rounded-lg bg-lime-400 px-4 py-3 text-sm font-semibold text-black hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-40"
          @click="onSendCode"
        >
          获取验证码
        </button>
      </template>

      <template v-else-if="step === 2">
        <p class="text-sm text-white/70">
          验证码已发送至
          <span class="break-all font-medium text-white/90">{{ email }}</span>
          （演示）。
        </p>
        <label class="mt-4 block">
          <span class="text-xs text-white/50">邮箱验证码</span>
          <input
            v-model="mailCode"
            type="text"
            inputmode="numeric"
            maxlength="6"
            autocomplete="one-time-code"
            placeholder="000000"
            class="mt-1.5 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-3 text-center font-mono text-lg tracking-[0.35em] text-white placeholder:text-white/25 focus:border-lime-400/50 focus:outline-none focus:ring-1 focus:ring-lime-400/30"
            @keydown.enter.prevent="onConfirmBind"
          />
        </label>
        <button
          type="button"
          :disabled="!codeOk"
          class="mt-4 w-full rounded-lg bg-lime-400 px-4 py-3 text-sm font-semibold text-black hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-40"
          @click="onConfirmBind"
        >
          确认绑定
        </button>
      </template>

      <template v-else>
        <p class="text-sm leading-relaxed text-emerald-100/85">邮箱已绑定成功。</p>
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
