<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CrossPlatformFloatNav from '../../components/CrossPlatformFloatNav.vue'
import { mockAgentList } from '../../admin/mock/agent'
import { AGENT_DEFAULT_LOGIN_PASSWORD, useAgentAuthStore } from '../../stores/agentAuth'

const route = useRoute()
const router = useRouter()
const auth = useAgentAuthStore()

const email = ref(mockAgentList[0]?.email || '')
const password = ref(AGENT_DEFAULT_LOGIN_PASSWORD)
const err = ref('')
const loading = ref(false)

const loginHintEmail = mockAgentList[0]?.email || ''

async function submit() {
  err.value = ''
  loading.value = true
  try {
    const r = auth.login(email.value, password.value)
    if (!r.ok) {
      err.value = r.message
      return
    }
    const redir =
      typeof route.query.redirect === 'string' &&
      route.query.redirect.startsWith('/agent-system') &&
      !route.query.redirect.startsWith('/agent-system/login')
        ? route.query.redirect
        : '/agent-system/dashboard'
    router.replace(redir)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="relative min-h-screen bg-[#0a0f14] px-4 py-10 text-slate-100">
    <div class="mx-auto w-full max-w-md">
      <p class="text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-400/85">
        Partner Portal
      </p>
      <h1 class="mt-2 text-center text-2xl font-semibold text-white">代理系统登录</h1>

      <form class="mt-8 space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-xl" @submit.prevent="submit">
        <div>
          <label class="block text-xs font-medium text-white/60">邮箱</label>
          <input
            v-model="email"
            type="email"
            autocomplete="username"
            class="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0c1219] px-3 py-2.5 text-sm text-white outline-none ring-emerald-500/30 focus:border-emerald-500/50 focus:ring-2"
            :placeholder="loginHintEmail"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-white/60">密码</label>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            class="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0c1219] px-3 py-2.5 text-sm text-white outline-none ring-emerald-500/30 focus:border-emerald-500/50 focus:ring-2"
            placeholder="至少 6 位"
          />
        </div>
        <p v-if="err" class="text-sm text-rose-300">{{ err }}</p>
        <button
          type="submit"
          class="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-500 disabled:opacity-50"
          :disabled="loading"
        >
          {{ loading ? '登录中…' : '登录' }}
        </button>
      </form>
    </div>
    <CrossPlatformFloatNav />
  </div>
</template>
