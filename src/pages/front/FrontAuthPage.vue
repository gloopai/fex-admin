<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WithdrawAuthDialog from '../../components/front/WithdrawAuthDialog.vue'
import {
  FRONT_DEMO_SEED_USERS,
  FRONT_WALLET_LOGIN_PROVIDERS,
  useFrontAuthStore
} from '../../stores/frontAuth'
import { useFrontSecurityStore } from '../../stores/frontSecurity'

const route = useRoute()
const router = useRouter()
const auth = useFrontAuthStore()
const security = useFrontSecurityStore()

const isRegister = computed(
  () => route.name === 'front-register' || route.query.tab === 'register'
)

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const nickname = ref('')
const errorMsg = ref('')
const pending = ref(false)
const walletPendingKey = ref(null)

const loginVerifyOpen = ref(false)
const loginVerifySessionActive = ref(false)
const loginVerifySucceeded = ref(false)

const loginVerifyBindings = computed(() => ({
  phoneBound: security.currentBindings.phoneBound,
  emailBound: security.currentBindings.emailBound,
  mfaBound: security.currentBindings.mfaBound
}))

function navigateAfterAuth() {
  const redir = typeof route.query.redirect === 'string' ? route.query.redirect : ''
  router.replace(redir.startsWith('/front') ? redir : '/front/personal-center')
}

watch(loginVerifyOpen, (open) => {
  if (!open) {
    if (loginVerifySessionActive.value && !loginVerifySucceeded.value) {
      auth.logout()
      errorMsg.value = '需完成安全验证后才能登录'
    }
    loginVerifySessionActive.value = false
    loginVerifySucceeded.value = false
  }
})

function onLoginVerifyConfirmed() {
  loginVerifySucceeded.value = true
  navigateAfterAuth()
}

function maybeStartLoginSecondFactor() {
  security.ensureHydrated()
  if (!security.hasAnyVerifyChannel) {
    navigateAfterAuth()
    return
  }
  loginVerifySessionActive.value = true
  loginVerifySucceeded.value = false
  loginVerifyOpen.value = true
}

const walletProviders = FRONT_WALLET_LOGIN_PROVIDERS

const walletAccentClass = {
  metamask: 'from-orange-400/90 to-orange-600/80',
  walletconnect: 'from-sky-400/85 to-blue-600/75',
  coinbase: 'from-blue-400/85 to-indigo-600/80',
  okx: 'from-slate-500/85 to-slate-800/80',
  rabby: 'from-lime-400/75 to-teal-600/75'
}

watch(
  () => route.fullPath,
  () => {
    errorMsg.value = ''
  }
)

const demoLoginDefaults = () => {
  const d = FRONT_DEMO_SEED_USERS[0]
  email.value = d.email
  password.value = d.password
}

watch(
  isRegister,
  (reg) => {
    errorMsg.value = ''
    if (reg) {
      email.value = ''
      password.value = ''
      confirmPassword.value = ''
      nickname.value = ''
    } else {
      confirmPassword.value = ''
      nickname.value = ''
      demoLoginDefaults()
    }
  },
  { immediate: true }
)

const title = computed(() => (isRegister.value ? '创建账户' : '欢迎回来'))
const subtitle = computed(() => {
  if (isRegister.value) {
    return '邮箱注册即可开始'
  }
  return '邮箱登录，或使用下方钱包登录（本机模拟）'
})

function authQuery(overrides = {}) {
  const q = { ...route.query }
  delete q.tab
  return { ...q, ...overrides }
}

function switchToLogin() {
  router.replace({ name: 'front-login', query: authQuery() })
}

function switchToRegister() {
  router.replace({ name: 'front-register', query: authQuery() })
}

async function onSubmit() {
  errorMsg.value = ''
  pending.value = true
  try {
    await Promise.resolve()
    auth.ensureHydrated()
    const r = isRegister.value
      ? auth.register(email.value, password.value, confirmPassword.value, nickname.value)
      : auth.login(email.value, password.value)
    if (!r.ok) {
      errorMsg.value = r.message
      return
    }
    if (isRegister.value) {
      navigateAfterAuth()
      return
    }
    maybeStartLoginSecondFactor()
  } finally {
    pending.value = false
  }
}

async function onWalletLogin(providerKey) {
  errorMsg.value = ''
  walletPendingKey.value = providerKey
  try {
    await Promise.resolve()
    auth.ensureHydrated()
    const r = auth.loginWithMockWallet(providerKey)
    if (!r.ok) {
      errorMsg.value = r.message
      return
    }
    maybeStartLoginSecondFactor()
  } finally {
    walletPendingKey.value = null
  }
}
</script>

<template>
  <div
    class="relative min-h-[calc(100dvh-3.5rem)] px-4 py-5 lg:min-h-[calc(100vh-3.5rem)] lg:py-6"
  >
    <div
      class="pointer-events-none absolute inset-0 overflow-hidden bg-[#050505]"
      aria-hidden="true"
    >
      <div
        class="absolute -left-1/4 top-0 h-[28rem] w-[28rem] rounded-full bg-lime-400/[0.06] blur-[100px]"
      />
      <div
        class="absolute -right-1/4 bottom-0 h-[24rem] w-[24rem] rounded-full bg-violet-500/[0.07] blur-[90px]"
      />
      <div
        class="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,#050505_55%,#050505_100%)]"
      />
    </div>

    <div class="relative mx-auto w-full max-w-[420px]">
      <div
        class="rounded-2xl border border-white/[0.08] bg-[#0b0e11]/90 p-4 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)] backdrop-blur-md sm:p-5"
      >
        <div class="mb-4 text-center">
          <p
            class="inline-flex items-center gap-2 rounded-full border border-lime-400/20 bg-lime-400/[0.06] px-3 py-1 text-xs font-medium uppercase tracking-wider text-lime-200/90 sm:px-2.5 sm:py-0.5 sm:text-[10px]"
          >
            CryptoX Pro
          </p>
          <h1 class="mt-2 text-xl font-bold tracking-tight text-white sm:text-xl">{{ title }}</h1>
          <p class="mt-1.5 text-sm leading-normal text-white/50 sm:mt-1 sm:text-[13px] sm:leading-snug sm:text-white/45">
            {{ subtitle }}
          </p>
        </div>

        <div
          class="mb-3 flex rounded-lg border border-white/[0.06] bg-black/30 p-0.5"
          role="tablist"
          aria-label="账户"
        >
          <button
            type="button"
            role="tab"
            :aria-selected="!isRegister"
            class="flex-1 rounded-md py-2.5 text-sm font-medium transition sm:py-2 sm:text-sm"
            :class="
              !isRegister
                ? 'bg-white/[0.08] text-lime-200 shadow-sm'
                : 'text-white/45 hover:text-white/70'
            "
            @click="switchToLogin"
          >
            登录
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="isRegister"
            class="flex-1 rounded-md py-2.5 text-sm font-medium transition sm:py-2 sm:text-sm"
            :class="
              isRegister
                ? 'bg-white/[0.08] text-lime-200 shadow-sm'
                : 'text-white/45 hover:text-white/70'
            "
            @click="switchToRegister"
          >
            注册
          </button>
        </div>

        <p
          v-if="errorMsg"
          class="mb-2 rounded-lg border border-rose-400/25 bg-rose-500/[0.08] px-3 py-2 text-sm text-rose-100/95 sm:px-2.5 sm:py-1.5 sm:text-xs"
          role="alert"
        >
          {{ errorMsg }}
        </p>

        <form class="space-y-2" @submit.prevent="onSubmit">
          <div v-if="isRegister">
            <label class="mb-0.5 block text-sm font-medium text-white/55 sm:text-[11px] sm:text-white/45"
              >昵称（可选）</label
            >
            <input
              v-model="nickname"
              type="text"
              autocomplete="nickname"
              placeholder="前台展示"
              class="w-full rounded-lg border border-white/[0.1] bg-black/40 px-3 py-3 text-base text-white placeholder:text-white/35 focus:border-lime-400/45 focus:outline-none focus:ring-1 focus:ring-lime-400/25 sm:py-2 sm:text-sm sm:placeholder:text-white/30"
            />
          </div>

          <div>
            <label class="mb-0.5 block text-sm font-medium text-white/55 sm:text-[11px] sm:text-white/45">邮箱</label>
            <input
              v-model="email"
              type="email"
              autocomplete="email"
              required
              placeholder="name@example.com"
              class="w-full rounded-lg border border-white/[0.1] bg-black/40 px-3 py-3 text-base text-white placeholder:text-white/35 focus:border-lime-400/45 focus:outline-none focus:ring-1 focus:ring-lime-400/25 sm:py-2 sm:text-sm sm:placeholder:text-white/30"
            />
          </div>

          <div>
            <label class="mb-0.5 block text-sm font-medium text-white/55 sm:text-[11px] sm:text-white/45">密码</label>
            <input
              v-model="password"
              type="password"
              :autocomplete="isRegister ? 'new-password' : 'current-password'"
              required
              minlength="6"
              placeholder="至少 6 位"
              class="w-full rounded-lg border border-white/[0.1] bg-black/40 px-3 py-3 text-base text-white placeholder:text-white/35 focus:border-lime-400/45 focus:outline-none focus:ring-1 focus:ring-lime-400/25 sm:py-2 sm:text-sm sm:placeholder:text-white/30"
            />
          </div>

          <div v-if="isRegister">
            <label class="mb-0.5 block text-sm font-medium text-white/55 sm:text-[11px] sm:text-white/45"
              >确认密码</label
            >
            <input
              v-model="confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              minlength="6"
              placeholder="再次输入"
              class="w-full rounded-lg border border-white/[0.1] bg-black/40 px-3 py-3 text-base text-white placeholder:text-white/35 focus:border-lime-400/45 focus:outline-none focus:ring-1 focus:ring-lime-400/25 sm:py-2 sm:text-sm sm:placeholder:text-white/30"
            />
          </div>

          <button
            type="submit"
            class="mx-auto flex w-full max-w-[16.5rem] items-center justify-center rounded-lg bg-lime-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60 sm:max-w-[15rem] sm:py-2 sm:text-sm"
            :disabled="pending || Boolean(walletPendingKey)"
          >
            {{ pending ? '请稍候…' : isRegister ? '注册并登录' : '邮箱登录' }}
          </button>
        </form>

        <template v-if="!isRegister">
          <div class="relative my-3">
            <div class="absolute inset-0 flex items-center" aria-hidden="true">
              <div class="w-full border-t border-white/[0.06]"></div>
            </div>
            <div class="relative flex justify-center">
              <span class="bg-[#0b0e11] px-2 text-xs text-white/40 sm:text-[10px] sm:text-white/35">或钱包登录</span>
            </div>
          </div>
          <div class="flex flex-col gap-1.5">
            <button
              v-for="p in walletProviders"
              :key="p.key"
              type="button"
              :title="`${p.label} · ${p.mockAddress.slice(0, 8)}…`"
              class="flex w-full items-center gap-2 rounded-lg border border-white/[0.08] bg-black/35 px-2.5 py-1.5 text-left transition hover:border-white/[0.14] hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2.5 sm:px-3 sm:py-2"
              :disabled="pending || Boolean(walletPendingKey)"
              @click="onWalletLogin(p.key)"
            >
              <span
                class="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-gradient-to-br shadow-inner sm:h-8 sm:w-8"
                :class="walletAccentClass[p.key] || 'from-white/20 to-white/5'"
                aria-hidden="true"
              >
                <svg
                  class="h-4 w-4 text-white opacity-95 sm:h-[17px] sm:w-[17px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                </svg>
              </span>
              <span class="min-w-0 flex-1 leading-tight">
                <span class="block text-[13px] font-medium text-white/90 sm:text-[13px]">
                  {{ p.label }}
                </span>
                <span
                  v-if="walletPendingKey === p.key"
                  class="mt-0.5 block text-[11px] text-lime-300/90 sm:text-[10px]"
                >
                  连接中…
                </span>
              </span>
            </button>
          </div>
        </template>

        <p class="mt-3 text-center text-xs leading-snug text-white/38 sm:text-[9px] sm:text-white/32">
          演示：钱包未接真实扩展；账号仅存本机 ·
          <code class="rounded bg-white/[0.06] px-1 py-px text-[11px] text-white/55 sm:text-[9px] sm:text-white/45"
            >frontAuth</code
          >
        </p>
      </div>
    </div>

    <WithdrawAuthDialog
      v-model="loginVerifyOpen"
      variant="login"
      :phone-bound="loginVerifyBindings.phoneBound"
      :email-bound="loginVerifyBindings.emailBound"
      :mfa-bound="loginVerifyBindings.mfaBound"
      @confirmed="onLoginVerifyConfirmed"
    />
  </div>
</template>
