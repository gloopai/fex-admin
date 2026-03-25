<script setup>
import { computed, ref, watch } from 'vue'
import { USER_STATUS, USER_ROLE, USER_KYC_STATUS } from '../../constants/user'

const props = defineProps({
  visible: { type: Boolean, default: false },
  user: { type: Object, default: null }
})

const emit = defineEmits(['close'])

const close = () => emit('close')

const statusConfig = {
  [USER_STATUS.ACTIVE]: { text: '正常', class: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' },
  [USER_STATUS.INACTIVE]: { text: '不活跃', class: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200' },
  [USER_STATUS.SUSPENDED]: { text: '暂停', class: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200' },
  [USER_STATUS.BANNED]: { text: '禁用', class: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200' }
}

const roleConfig = {
  [USER_ROLE.USER]: { text: '普通用户', class: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200' },
  [USER_ROLE.AGENT]: { text: '代理', class: 'bg-purple-100 text-purple-700 ring-1 ring-purple-200' }
}

const kycConfig = {
  [USER_KYC_STATUS.NOT_VERIFIED]: { text: '未认证', class: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200' },
  [USER_KYC_STATUS.PENDING]: { text: '审核中', class: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200' },
  [USER_KYC_STATUS.VERIFIED]: { text: '已认证', class: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' },
  [USER_KYC_STATUS.REJECTED]: { text: '已拒绝', class: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200' }
}

const uidNumber = computed(() => {
  const raw = props.user?.id || ''
  const n = String(raw).match(/\d+/)?.[0] || ''
  return n
})

const formatMoney = (value, opts = {}) => {
  const num = Number(value || 0)
  const {
    min = 0,
    max = 2
  } = opts

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: min,
    maximumFractionDigits: max
  }).format(num)
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const d = new Date(dateString)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatAddress = (addr) => {
  if (!addr) return '-'
  if (addr.length <= 14) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

const hashToSeed = (input) => {
  const s = String(input || '')
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// Deterministic RNG (so UI doesn't "jump" on re-render)
const mulberry32 = (seed) => {
  return () => {
    let t = (seed += 0x6D2B79F5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const genAddressFromSeed = (seed, index) => {
  const rand = mulberry32(seed + index * 1013904223)
  const bytes = Array.from({ length: 20 }, () => Math.floor(rand() * 256))
  return `0x${bytes.map((b) => b.toString(16).padStart(2, '0')).join('')}`
}

const moneyWithTail = (base, seed, index) => {
  const rand = mulberry32(seed + index * 2654435761)
  const frac = Math.floor(rand() * 10000) / 100 // 0.00 - 99.99
  return Number(base || 0) + frac
}

const incomeList = computed(() => {
  const user = props.user
  if (!user) return []

  const seed = hashToSeed(user.id)
  const rand = mulberry32(seed)

  const chainOptions = ['Ethereum', 'Ethereum', 'Ethereum']

  const baseTs = Date.now()
  const totalBase = Number(user.balance || 0) + Number(user.frozenBalance || 0)

  return Array.from({ length: 3 }).map((_, i) => {
    const chain = chainOptions[i] || 'Ethereum'
    const address = genAddressFromSeed(seed, i)

    const daysAgo = Math.floor(rand() * 25) + i * 2
    const createdAtDate = new Date(baseTs - daysAgo * 24 * 60 * 60 * 1000)
    // Make timestamps look consistent like the screenshot (11:11:11)
    createdAtDate.setHours(11, 11, 11, 0)
    const createdAt = createdAtDate.toISOString()

    // Make amounts roughly align with user assets
    const amountUsd = totalBase * (0.03 + rand() * 0.04)

    return {
      chain,
      address,
      createdAt,
      amountUsd
    }
  })
})

const tabs = [
  { id: 'assets', label: '账户资产' },
  { id: 'income', label: '入金' },
  { id: 'trades', label: '交易记录' },
  { id: 'perp', label: '永久合约' },
  { id: 'freeze', label: '冻结' }
]

const activeTab = ref('assets')

watch(
  () => [props.visible, props.user?.id],
  () => {
    if (props.visible) activeTab.value = 'assets'
  }
)

const computedAssets = computed(() => {
  const user = props.user
  if (!user) return null
  const seed = hashToSeed(user.id)
  const b = Number(user.balance || 0)
  const f = Number(user.frozenBalance || 0)
  const profit = Number(user.totalProfit || 0)
  const tradingVolume = Number(user.tradingVolume || 0)

  // Derived parts to match the screenshot 2x2 card layout
  const marketAccount = moneyWithTail(b, seed, 1) + moneyWithTail(f, seed, 2) * 0.15
  const tradingContract = moneyWithTail(b * 0.16, seed, 3)
  const wealthAccount = moneyWithTail(f * 2.5, seed, 4)
  const perpetualContract = moneyWithTail(b * 0.52, seed, 5)

  return {
    marketAccount,
    tradingContract,
    wealthAccount,
    perpetualContract,
    tradingVolume,
    frozenBalance: f,
    totalProfit: moneyWithTail(profit, seed, 6)
  }
})

const tabButtonClass = (id) => {
  const active = activeTab.value === id
  return active
    ? 'text-blue-600 border-blue-500 font-semibold'
    : 'text-slate-500 border-transparent hover:text-slate-700'
}
</script>

<template>
  <Teleport to="body">
    <Transition name="user-detail-drawer">
      <div
        v-if="visible && user"
        class="fixed inset-0 z-50 bg-black/40"
        @click.self="close"
      >
        <section
          class="user-detail-drawer-panel absolute left-0 right-0 top-0 flex h-[92vh] w-full flex-col overflow-hidden rounded-b-2xl border-b border-slate-200 bg-slate-50 shadow-2xl"
        >
          <!-- Header -->
          <div class="border-b border-slate-200 bg-gradient-to-r from-white to-slate-100 px-6 py-4">
            <div class="flex items-start justify-between gap-6">
              <div class="flex items-start gap-4 min-w-0">
                <div class="relative shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-slate-900 to-indigo-700">
                  <div class="absolute inset-0 rounded-full ring-2 ring-white/60" />
                  <div class="h-full w-full flex items-center justify-center text-white font-semibold">
                    {{ String(user.username || 'U').slice(0, 1).toUpperCase() }}
                  </div>
                </div>

                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <div class="text-xl font-bold text-slate-900 truncate max-w-[220px]">
                      {{ user.username }}
                    </div>

                    <span
                      :class="statusConfig[user.status]?.class || 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'"
                      class="px-3 py-1 text-xs font-medium rounded-full"
                    >
                      {{ statusConfig[user.status]?.text || user.status }}
                    </span>

                    <span
                      :class="roleConfig[user.role]?.class || 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'"
                      class="px-3 py-1 text-xs font-medium rounded-full"
                    >
                      {{ roleConfig[user.role]?.text || user.role }}
                    </span>

                    <span
                      v-if="user.isVip"
                      class="px-3 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700 ring-1 ring-amber-200"
                    >
                      VIP
                    </span>
                  </div>

                  <div class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span class="font-mono text-slate-600">UID: {{ uidNumber }}</span>
                    <span class="truncate max-w-[320px]">{{ user.email }}</span>
                    <span class="font-mono">{{ user.phone }}</span>
                  </div>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="mt-1 hidden sm:flex items-center gap-2">
                  <button type="button" class="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">
                    冻结
                  </button>
                  <button type="button" class="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">
                    更新
                  </button>
                  <button type="button" class="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                    入金
                  </button>
                </div>

                <button
                  type="button"
                  class="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                  @click="close"
                  aria-label="关闭"
                >
                  <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <section class="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div class="text-xs text-slate-500">最后登录时间</div>
                <div class="mt-1 text-sm font-medium text-slate-900">{{ formatDateTime(user.lastLoginTime) }}</div>
              </section>
              <section class="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div class="text-xs text-slate-500">最后登录IP</div>
                <div class="mt-1 text-sm font-mono text-slate-900">{{ user.lastLoginIp || '-' }}</div>
              </section>
              <section class="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div class="text-xs text-slate-500">最后登录地区</div>
                <div class="mt-1 text-sm font-medium text-slate-900">Beijing, China</div>
              </section>
            </div>

            <!-- Tabs -->
            <nav class="mt-4 flex items-center gap-2 overflow-x-auto border-b border-slate-200">
              <button
                v-for="t in tabs"
                :key="t.id"
                type="button"
                class="shrink-0 px-3 py-2 text-sm font-medium border-b-2 transition-colors"
                :class="tabButtonClass(t.id)"
                @click="activeTab = t.id"
              >
                {{ t.label }}
              </button>
            </nav>
          </div>

          <!-- Body -->
          <div class="min-h-0 flex-1 overflow-y-auto p-6">
            <!-- Account assets -->
            <template v-if="activeTab === 'assets'">
              <div class="grid gap-4 lg:grid-cols-2">
                <section class="rounded-xl border border-slate-200 bg-white p-5">
                  <div class="text-sm font-semibold text-slate-900">账户资产</div>
                  <div class="mt-3 grid grid-cols-2 gap-4 text-sm">
                    <div class="rounded-lg bg-slate-50 px-4 py-3">
                      <div class="text-xs text-slate-500">市值账户</div>
                      <div class="mt-2 font-semibold text-slate-900 text-lg">
                        {{ computedAssets ? formatMoney(computedAssets.marketAccount, { min: 2, max: 2 }) : '-' }}
                      </div>
                    </div>
                    <div class="rounded-lg bg-slate-50 px-4 py-3">
                      <div class="text-xs text-slate-500">理财账户</div>
                      <div class="mt-2 font-semibold text-slate-900 text-lg">
                        {{ computedAssets ? formatMoney(computedAssets.wealthAccount, { min: 2, max: 2 }) : '-' }}
                      </div>
                    </div>
                    <div class="rounded-lg bg-slate-50 px-4 py-3">
                      <div class="text-xs text-slate-500">交易合约</div>
                      <div class="mt-2 font-semibold text-slate-900 text-lg">
                        {{ computedAssets ? formatMoney(computedAssets.tradingContract, { min: 2, max: 2 }) : '-' }}
                      </div>
                    </div>
                    <div class="rounded-lg bg-slate-50 px-4 py-3">
                      <div class="text-xs text-slate-500">永续合约</div>
                      <div class="mt-2 font-semibold text-slate-900 text-lg">
                        {{ computedAssets ? formatMoney(computedAssets.perpetualContract, { min: 2, max: 2 }) : '-' }}
                      </div>
                    </div>
                  </div>
                </section>

                <section class="rounded-xl border border-slate-200 bg-white p-5">
                  <div class="text-sm font-semibold text-slate-900">账户盈利</div>
                  <div class="mt-2 flex items-end justify-between gap-4">
                    <div class="text-4xl font-extrabold text-slate-900 leading-none">
                      {{ computedAssets ? formatMoney(computedAssets.totalProfit, { min: 2, max: 2 }) : '-' }}
                    </div>
                  </div>

                  <div class="mt-4 grid grid-cols-1 gap-2">
                    <div class="rounded-lg bg-slate-50 px-3 py-2">
                      <div class="text-xs text-slate-500">KYC状态</div>
                      <div class="mt-1">
                        <span
                          :class="kycConfig[user.kycStatus]?.class || 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'"
                          class="inline-flex px-3 py-1 text-xs font-medium rounded-full"
                        >
                          {{ kycConfig[user.kycStatus]?.text || user.kycStatus }}
                        </span>
                      </div>
                    </div>
                    <div class="rounded-lg bg-slate-50 px-3 py-2">
                      <div class="text-xs text-slate-500">信用分</div>
                      <div class="mt-1 text-lg font-semibold text-slate-900">
                        {{ user.creditScore }} / 800
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <section class="mt-6 rounded-xl border border-slate-200 bg-white p-5">
                <div class="flex items-center justify-between gap-4">
                  <div class="text-sm font-semibold text-slate-900">概览信息</div>
                  <div class="text-xs text-slate-500">可快速查看用户基础与关系</div>
                </div>

                <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div class="rounded-lg bg-slate-50 px-3 py-2">
                    <div class="text-xs text-slate-500">上级</div>
                    <div class="mt-1 text-sm font-medium text-slate-900">
                      {{ user.parentUsername || '-' }}
                    </div>
                  </div>
                  <div class="rounded-lg bg-slate-50 px-3 py-2">
                    <div class="text-xs text-slate-500">注册时间</div>
                    <div class="mt-1 text-sm font-medium text-slate-900">
                      {{ formatDateTime(user.registerTime) }}
                    </div>
                  </div>
                  <div class="rounded-lg bg-slate-50 px-3 py-2">
                    <div class="text-xs text-slate-500">备注</div>
                    <div class="mt-1 text-sm font-medium text-slate-900">
                      {{ user.remark || '-' }}
                    </div>
                  </div>
                </div>
              </section>
            </template>

            <!-- Income -->
            <template v-else-if="activeTab === 'income'">
              <section class="rounded-xl border border-slate-200 bg-white p-5">
                <div class="flex items-center justify-between gap-4">
                  <div>
                    <div class="text-sm font-semibold text-slate-900">入金</div>
                    <div class="mt-1 text-xs text-slate-500">展示用户最近的入金记录（模拟数据）</div>
                  </div>
                  <div class="text-xs text-slate-500">共 {{ incomeList.length }} 条</div>
                </div>

                <div class="mt-4 overflow-x-auto">
                  <table class="min-w-[520px] w-full">
                    <thead class="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">公链</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">地址</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">创建时间</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200">
                      <tr v-for="row in incomeList" :key="row.address + row.createdAt" class="hover:bg-slate-50 transition-colors">
                        <td class="px-4 py-3 text-sm text-slate-700">{{ row.chain }}</td>
                        <td class="px-4 py-3 text-sm">
                          <span class="font-mono text-slate-800">{{ formatAddress(row.address) }}</span>
                        </td>
                        <td class="px-4 py-3 text-sm text-slate-700">{{ formatDateTime(row.createdAt) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </template>

            <!-- Trades -->
            <template v-else-if="activeTab === 'trades'">
              <section class="rounded-xl border border-slate-200 bg-white p-5">
                <div class="text-sm font-semibold text-slate-900">交易记录</div>
                <div class="mt-1 text-xs text-slate-500">当前页面仅展示入金表格样式；其余标签页用于预留结构。</div>
                <div class="mt-4 rounded-lg bg-slate-50 px-4 py-4 text-sm text-slate-600">
                  暂无数据（可后续接入真实交易接口）
                </div>
              </section>
            </template>

            <!-- Perp -->
            <template v-else-if="activeTab === 'perp'">
              <section class="rounded-xl border border-slate-200 bg-white p-5">
                <div class="text-sm font-semibold text-slate-900">永久合约</div>
                <div class="mt-1 text-xs text-slate-500">预留结构</div>
                <div class="mt-4 rounded-lg bg-slate-50 px-4 py-4 text-sm text-slate-600">
                  暂无数据
                </div>
              </section>
            </template>

            <!-- Freeze -->
            <template v-else-if="activeTab === 'freeze'">
              <section class="rounded-xl border border-slate-200 bg-white p-5">
                <div class="text-sm font-semibold text-slate-900">冻结资金</div>
                <div class="mt-1 text-xs text-slate-500">可快速查看冻结余额与影响</div>
                <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div class="rounded-lg bg-slate-50 px-4 py-3">
                    <div class="text-xs text-slate-500">冻结金额</div>
                    <div class="mt-1 text-2xl font-semibold text-slate-900">
                      {{ formatMoney(user.frozenBalance) }}
                    </div>
                  </div>
                  <div class="rounded-lg bg-slate-50 px-4 py-3">
                    <div class="text-xs text-slate-500">备注</div>
                    <div class="mt-1 text-sm font-medium text-slate-900">
                      {{ user.remark || '-' }}
                    </div>
                  </div>
                </div>
              </section>
            </template>
          </div>

          <!-- Footer -->
          <div class="shrink-0 border-t border-slate-200 bg-white px-6 py-4">
            <div class="flex justify-end gap-2">
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                @click="close"
              >
                关闭
              </button>
            </div>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.user-detail-drawer-enter-active,
.user-detail-drawer-leave-active {
  transition: opacity 0.25s ease;
}

.user-detail-drawer-enter-from,
.user-detail-drawer-leave-to {
  opacity: 0;
}

.user-detail-drawer-enter-to,
.user-detail-drawer-leave-from {
  opacity: 1;
}

.user-detail-drawer-enter-from > section,
.user-detail-drawer-leave-to > section {
  transform: translateY(-100%);
}

.user-detail-drawer-enter-active > section,
.user-detail-drawer-leave-active > section {
  transition: transform 0.25s ease;
  transform: translateY(0);
}
</style>

