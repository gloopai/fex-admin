<script setup>
import { computed, ref } from 'vue'
import FrontBindSuccessState from './FrontBindSuccessState.vue'
import FrontDarkField from './FrontDarkField.vue'
import FrontFlowStepHeader from './FrontFlowStepHeader.vue'
import FrontLimeButton from './FrontLimeButton.vue'

/**
 * 绑定手机号流程（无 Teleport，可嵌入安全总览或单独弹窗）。
 */
const emit = defineEmits(['back', 'completed', 'send-code'])

const step = ref(1)
const phone = ref('')
const smsCode = ref('')

const phoneOk = computed(() => /^1\d{10}$/.test(phone.value))
const codeOk = computed(() => /^\d{6}$/.test(smsCode.value))

function reset() {
  step.value = 1
  phone.value = ''
  smsCode.value = ''
}

defineExpose({ reset })

function onBack() {
  if (step.value === 1) {
    emit('back')
    return
  }
  if (step.value === 2) {
    step.value = 1
    smsCode.value = ''
    return
  }
  step.value = 2
}

function onSendCode() {
  if (!phoneOk.value) return
  emit('send-code', phone.value)
  step.value = 2
}

function onConfirmBind() {
  if (!codeOk.value) return
  step.value = 3
}

function onFinish() {
  emit('completed', { phone: phone.value.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') })
}
</script>

<template>
  <div class="flex min-h-0 w-full flex-1 flex-col overflow-hidden text-white">
    <FrontFlowStepHeader title="绑定手机号" @back="onBack" />

    <div class="min-h-0 flex-1 overflow-y-auto px-4 py-4">
      <template v-if="step === 1">
        <p class="text-sm leading-relaxed text-emerald-100/85">
          用于接收安全验证码与异常登录提醒，请填写本人实名手机号。
        </p>
        <FrontDarkField
          v-model="phone"
          class="mt-4"
          label="手机号码"
          type="tel"
          maxlength="11"
          inputmode="numeric"
          placeholder="11 位手机号"
        />
        <FrontLimeButton class="mt-4 w-full" :disabled="!phoneOk" @click="onSendCode">
          获取验证码
        </FrontLimeButton>
      </template>

      <template v-else-if="step === 2">
        <p class="text-sm text-white/70">
          验证码已发送至
          <span class="font-medium text-white/90">{{ phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') }}</span>
          ，请查收短信并填写验证码。
        </p>
        <FrontDarkField
          v-model="smsCode"
          class="mt-4"
          label="短信验证码"
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
        <FrontBindSuccessState @primary="onFinish">
          <template #title>手机号绑定成功</template>
          <template #description>
            号码
            <span class="font-medium text-emerald-100/90 tabular-nums">{{
              phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
            }}</span>
            已可用于短信验证与账户安全通知。
          </template>
        </FrontBindSuccessState>
      </template>
    </div>
  </div>
</template>
