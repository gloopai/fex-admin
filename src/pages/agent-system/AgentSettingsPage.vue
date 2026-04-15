<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { PHONE_DIAL_PRESETS } from '../../admin/constants/i18nCatalog'
import { AGENT_DEFAULT_LOGIN_PASSWORD, useAgentAuthStore } from '../../stores/agentAuth'

const auth = useAgentAuthStore()
const router = useRouter()

const pwdOld = ref('')
const pwdNew = ref('')
const pwdConfirm = ref('')
const pwdMsg = ref('')
const pwdErr = ref('')
const pwdSubmitting = ref(false)

const phoneDial = ref('+86')
const phoneNational = ref('')
const phoneSms = ref('')
const phoneMsg = ref('')
const phoneErr = ref('')
const smsPreview = ref('')
const smsCooldown = ref(0)
const phoneSubmitting = ref(false)
const sendLoading = ref(false)

let smsTimer = null

const canSendSms = computed(() => smsCooldown.value <= 0 && phoneNational.value.replace(/\D/g, '').length >= 5)

const TABS = [
  { id: 'profile', label: '基本资料' },
  { id: 'password', label: '登录密码' },
  { id: 'phone', label: '绑定手机' }
]
const activeTab = ref('profile')

onMounted(() => {
  auth.ensureHydrated()
})

watch(
  () => auth.isPhoneBound,
  (bound) => {
    if (!bound) {
      phoneDial.value = '+86'
      phoneNational.value = ''
    }
  },
  { immediate: true }
)

function logout() {
  auth.logout()
  router.push('/agent-system/login')
}

async function submitPassword() {
  pwdErr.value = ''
  pwdMsg.value = ''
  pwdSubmitting.value = true
  try {
    const r = auth.changePassword({
      oldPassword: pwdOld.value,
      newPassword: pwdNew.value,
      confirmPassword: pwdConfirm.value
    })
    if (!r.ok) {
      pwdErr.value = r.message || '修改失败'
      return
    }
    pwdMsg.value = r.message || '已更新'
    pwdOld.value = ''
    pwdNew.value = ''
    pwdConfirm.value = ''
  } finally {
    pwdSubmitting.value = false
  }
}

async function sendSms() {
  phoneErr.value = ''
  phoneMsg.value = ''
  smsPreview.value = ''
  if (!canSendSms.value) return
  sendLoading.value = true
  try {
    const r = auth.sendPhoneBindSms()
    if (!r.ok) {
      phoneErr.value = r.message || '发送失败'
      return
    }
    phoneMsg.value = r.message || '已发送'
    if (r.previewCode) smsPreview.value = r.previewCode
    smsCooldown.value = 60
    smsTimer = window.setInterval(() => {
      smsCooldown.value -= 1
      if (smsCooldown.value <= 0 && smsTimer) {
        clearInterval(smsTimer)
        smsTimer = null
      }
    }, 1000)
  } finally {
    sendLoading.value = false
  }
}

async function submitPhone() {
  phoneErr.value = ''
  phoneMsg.value = ''
  phoneSubmitting.value = true
  try {
    const r = auth.bindPhone({
      dial: phoneDial.value,
      nationalDigits: phoneNational.value,
      smsCode: phoneSms.value
    })
    if (!r.ok) {
      phoneErr.value = r.message || '绑定失败'
      return
    }
    phoneMsg.value = r.message || '已绑定'
    phoneSms.value = ''
    smsPreview.value = ''
  } finally {
    phoneSubmitting.value = false
  }
}
</script>

<template>
  <div class="max-w-xl space-y-4">
    <div
      class="flex gap-1 overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.03] p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="安全设置分区"
    >
      <button
        v-for="t in TABS"
        :key="t.id"
        type="button"
        role="tab"
        :aria-selected="activeTab === t.id"
        class="shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition sm:text-sm"
        :class="
          activeTab === t.id
            ? 'bg-emerald-600/35 text-white shadow-sm ring-1 ring-emerald-500/35'
            : 'text-white/45 hover:bg-white/[0.06] hover:text-white/80'
        "
        @click="activeTab = t.id"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- 基本资料 -->
    <div v-show="activeTab === 'profile'" class="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
      <h2 class="text-sm font-semibold text-white">基本资料</h2>
      <dl class="mt-4 space-y-3 text-sm">
        <div class="flex justify-between gap-4">
          <dt class="text-white/45">用户 UID</dt>
          <dd class="font-mono text-emerald-200/95">{{ auth.uid ?? '—' }}</dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-white/45">登录邮箱</dt>
          <dd class="font-mono text-emerald-200/95">{{ auth.email }}</dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-white/45">显示名</dt>
          <dd>{{ auth.nickname }}</dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-white/45">绑定手机</dt>
          <dd class="text-right">
            <span v-if="auth.isPhoneBound" class="font-mono text-emerald-200/95">{{ auth.phoneDisplay }}</span>
            <span v-else class="text-white/40">未绑定</span>
          </dd>
        </div>
      </dl>
      <div class="mt-6 border-t border-white/[0.08] pt-5">
        <button
          type="button"
          class="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/85 hover:bg-white/[0.06]"
          @click="logout"
        >
          退出登录
        </button>
      </div>
    </div>

    <!-- 修改登录密码 -->
    <div v-show="activeTab === 'password'" class="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
      <h2 class="text-sm font-semibold text-white">修改登录密码</h2>
      <p class="mt-1 text-xs text-white/40">
        修改后将用于代理系统登录；初始默认密码为 <span class="font-mono text-white/55">{{ AGENT_DEFAULT_LOGIN_PASSWORD }}</span>（未改过前）。
      </p>
      <form class="mt-4 space-y-3" @submit.prevent="submitPassword">
        <div>
          <label class="block text-xs text-white/45">当前密码</label>
          <input
            v-model="pwdOld"
            type="password"
            autocomplete="current-password"
            class="mt-1 w-full rounded-lg border border-white/10 bg-[#0c1219] px-3 py-2 text-sm text-white"
          />
        </div>
        <div>
          <label class="block text-xs text-white/45">新密码</label>
          <input
            v-model="pwdNew"
            type="password"
            autocomplete="new-password"
            class="mt-1 w-full rounded-lg border border-white/10 bg-[#0c1219] px-3 py-2 text-sm text-white"
          />
        </div>
        <div>
          <label class="block text-xs text-white/45">确认新密码</label>
          <input
            v-model="pwdConfirm"
            type="password"
            autocomplete="new-password"
            class="mt-1 w-full rounded-lg border border-white/10 bg-[#0c1219] px-3 py-2 text-sm text-white"
          />
        </div>
        <p v-if="pwdErr" class="text-sm text-rose-300">{{ pwdErr }}</p>
        <p v-if="pwdMsg" class="text-sm text-emerald-300/95">{{ pwdMsg }}</p>
        <button
          type="submit"
          class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          :disabled="pwdSubmitting"
        >
          {{ pwdSubmitting ? '保存中…' : '保存新密码' }}
        </button>
      </form>
    </div>

    <!-- 绑定手机 -->
    <div v-show="activeTab === 'phone'" class="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
      <h2 class="text-sm font-semibold text-white">绑定手机</h2>
      <p class="mt-1 text-xs text-white/40">
        用于代理系统安全校验；验证码先走本地会话模拟，接入短信网关后替换为真实下发。
      </p>
      <form class="mt-4 space-y-3" @submit.prevent="submitPhone">
        <div class="flex flex-wrap gap-3">
          <div>
            <label class="block text-xs text-white/45">区号</label>
            <select
              v-model="phoneDial"
              class="mt-1 rounded-lg border border-white/10 bg-[#0c1219] px-2 py-2 text-sm text-white"
            >
              <option v-for="p in PHONE_DIAL_PRESETS" :key="p.dial" :value="p.dial">{{ p.label }}</option>
            </select>
          </div>
          <div class="min-w-[12rem] flex-1">
            <label class="block text-xs text-white/45">手机号</label>
            <input
              v-model="phoneNational"
              type="tel"
              inputmode="numeric"
              autocomplete="tel-national"
              class="mt-1 w-full rounded-lg border border-white/10 bg-[#0c1219] px-3 py-2 text-sm text-white"
              placeholder="不含区号"
            />
          </div>
        </div>
        <div class="flex flex-wrap items-end gap-2">
          <div class="min-w-[8rem] flex-1">
            <label class="block text-xs text-white/45">短信验证码</label>
            <input
              v-model="phoneSms"
              type="text"
              inputmode="numeric"
              maxlength="6"
              class="mt-1 w-full rounded-lg border border-white/10 bg-[#0c1219] px-3 py-2 text-sm text-white"
              placeholder="6 位数字"
            />
          </div>
          <button
            type="button"
            class="rounded-lg border border-white/15 px-3 py-2 text-xs text-white/90 hover:bg-white/[0.06] disabled:opacity-40"
            :disabled="!canSendSms || sendLoading"
            @click="sendSms"
          >
            {{ sendLoading ? '发送中…' : smsCooldown > 0 ? `${smsCooldown}s 后重发` : '获取验证码' }}
          </button>
        </div>
        <p v-if="smsPreview" class="rounded border border-amber-500/25 bg-amber-950/30 px-2 py-1.5 font-mono text-xs text-amber-100/90">
          会话校验码（短信网关接入前仅本机可见）：{{ smsPreview }}
        </p>
        <p v-if="phoneErr" class="text-sm text-rose-300">{{ phoneErr }}</p>
        <p v-if="phoneMsg" class="text-sm text-emerald-300/95">{{ phoneMsg }}</p>
        <button
          type="submit"
          class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          :disabled="phoneSubmitting"
        >
          {{ phoneSubmitting ? '提交中…' : auth.isPhoneBound ? '更新绑定' : '确认绑定' }}
        </button>
      </form>
    </div>
  </div>
</template>
