<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FRONT_DEMO_SEED_USERS, useFrontAuthStore } from '../../stores/frontAuth'

const route = useRoute()
const router = useRouter()
const auth = useFrontAuthStore()

const isRegister = computed(
  () => route.name === 'front-register' || route.query.tab === 'register'
)

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const nickname = ref('')
const errorMsg = ref('')
const pending = ref(false)

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
const subtitle = computed(() =>
  isRegister.value
    ? '使用邮箱注册，开始使用 CryptoX Pro'
    : '使用注册邮箱与密码登录'
)

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
    const redir = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    router.replace(redir.startsWith('/front') ? redir : '/front/personal-center')
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div
    class="relative min-h-[calc(100dvh-3.5rem)] px-4 py-10 lg:min-h-[calc(100vh-3.5rem)] lg:py-14"
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
        class="rounded-2xl border border-white/[0.08] bg-[#0b0e11]/90 p-6 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)] backdrop-blur-md sm:p-8"
      >
        <div class="mb-8 text-center">
          <p
            class="inline-flex items-center gap-2 rounded-full border border-lime-400/20 bg-lime-400/[0.06] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-lime-200/90"
          >
            CryptoX Pro
          </p>
          <h1 class="mt-4 text-2xl font-bold tracking-tight text-white">{{ title }}</h1>
          <p class="mt-2 text-sm leading-relaxed text-white/50">{{ subtitle }}</p>
        </div>

        <div
          class="mb-6 flex rounded-xl border border-white/[0.06] bg-black/30 p-1"
          role="tablist"
          aria-label="账户"
        >
          <button
            type="button"
            role="tab"
            :aria-selected="!isRegister"
            class="flex-1 rounded-lg py-2.5 text-sm font-medium transition"
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
            class="flex-1 rounded-lg py-2.5 text-sm font-medium transition"
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

        <form class="space-y-4" @submit.prevent="onSubmit">
          <div v-if="isRegister">
            <label class="block text-xs font-medium text-white/45">昵称（可选）</label>
            <input
              v-model="nickname"
              type="text"
              autocomplete="nickname"
              placeholder="用于前台展示"
              class="mt-1.5 w-full rounded-xl border border-white/[0.1] bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-lime-400/45 focus:outline-none focus:ring-1 focus:ring-lime-400/25"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-white/45">邮箱</label>
            <input
              v-model="email"
              type="email"
              autocomplete="email"
              required
              placeholder="name@example.com"
              class="mt-1.5 w-full rounded-xl border border-white/[0.1] bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-lime-400/45 focus:outline-none focus:ring-1 focus:ring-lime-400/25"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-white/45">密码</label>
            <input
              v-model="password"
              type="password"
              :autocomplete="isRegister ? 'new-password' : 'current-password'"
              required
              minlength="6"
              placeholder="至少 6 位"
              class="mt-1.5 w-full rounded-xl border border-white/[0.1] bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-lime-400/45 focus:outline-none focus:ring-1 focus:ring-lime-400/25"
            />
          </div>

          <div v-if="isRegister">
            <label class="block text-xs font-medium text-white/45">确认密码</label>
            <input
              v-model="confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              minlength="6"
              placeholder="再次输入密码"
              class="mt-1.5 w-full rounded-xl border border-white/[0.1] bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-lime-400/45 focus:outline-none focus:ring-1 focus:ring-lime-400/25"
            />
          </div>

          <p
            v-if="errorMsg"
            class="rounded-lg border border-rose-400/25 bg-rose-500/[0.08] px-3 py-2 text-sm text-rose-100/95"
            role="alert"
          >
            {{ errorMsg }}
          </p>

          <button
            type="submit"
            class="flex w-full items-center justify-center rounded-xl bg-lime-400 py-3.5 text-sm font-semibold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="pending"
          >
            {{ pending ? '请稍候…' : isRegister ? '注册并登录' : '登录' }}
          </button>
        </form>

        <p class="mt-6 text-center text-xs leading-relaxed text-white/40">
          当前为前端模拟：账号仅保存在本机浏览器。注册后即可访问个人中心、资产等需登录页面；对接后端后替换
          <code class="rounded bg-white/[0.06] px-1 py-0.5 text-[10px] text-white/55">frontAuth</code>
          调用即可。
        </p>
      </div>
    </div>
  </div>
</template>
