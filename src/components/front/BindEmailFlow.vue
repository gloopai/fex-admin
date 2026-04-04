<script setup>
import { computed, ref } from 'vue'
import FrontDarkField from './FrontDarkField.vue'
import FrontFlowStepHeader from './FrontFlowStepHeader.vue'
import FrontLimeButton from './FrontLimeButton.vue'

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
    <FrontFlowStepHeader title="绑定邮箱" @back="onBack" />

    <div class="min-h-0 flex-1 overflow-y-auto px-4 py-4">
      <template v-if="step === 1">
        <p class="text-sm leading-relaxed text-emerald-100/85">
          用于接收安全通知与验证邮件，请填写本人常用邮箱。
        </p>
        <FrontDarkField
          v-model="email"
          class="mt-4"
          label="邮箱地址"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
        />
        <FrontLimeButton class="mt-4 w-full" :disabled="!emailOk" @click="onSendCode">
          获取验证码
        </FrontLimeButton>
      </template>

      <template v-else-if="step === 2">
        <p class="text-sm text-white/70">
          验证码已发送至
          <span class="break-all font-medium text-white/90">{{ email }}</span>
          ，请查收邮件并填写验证码。
        </p>
        <FrontDarkField
          v-model="mailCode"
          class="mt-4"
          label="邮箱验证码"
          variant="otp"
          type="text"
          inputmode="numeric"
          maxlength="6"
          autocomplete="one-time-code"
          placeholder="000000"
          @keydown.enter.prevent="onConfirmBind"
        />
        <FrontLimeButton class="mt-4 w-full" :disabled="!codeOk" @click="onConfirmBind">
          确认绑定
        </FrontLimeButton>
      </template>

      <template v-else>
        <p class="text-sm leading-relaxed text-emerald-100/85">邮箱已绑定成功。</p>
        <FrontLimeButton class="mt-6 w-full" @click="onFinish">完成</FrontLimeButton>
      </template>
    </div>
  </div>
</template>
