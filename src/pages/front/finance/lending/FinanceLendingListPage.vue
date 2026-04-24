<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import FrontPopupCard from '../../../../components/front/FrontPopupCard.vue'
import FrontPopupCloseButton from '../../../../components/front/FrontPopupCloseButton.vue'
import FrontPopupShell from '../../../../components/front/FrontPopupShell.vue'
import FrontStrokeIcon from '../../../../components/front/FrontStrokeIcon.vue'
import { mockProducts, mockOrders, mockRepayments } from '../../../../admin/mock/cryptoLending'
import {
  PRODUCT_STATUS,
  PRODUCT_STATUS_LABELS,
  LOAN_ORDER_STATUS,
  LOAN_ORDER_STATUS_LABELS,
  REPAYMENT_STATUS_LABELS,
  REPAYMENT_TYPE_LABELS
} from '../../../../admin/constants/cryptoLending'

const prefix = '/front'
const route = useRoute()

const products = ref([...mockProducts])
const orders = ref([...mockOrders])
const repayments = ref([...mockRepayments])

/** 借出币种筛选（顶部资产卡） */
const loanCurrencyFilter = ref('')

const loanCurrencies = computed(() => {
  const set = new Set(products.value.map((p) => p.loanCurrency).filter(Boolean))
  return [...set].sort()
})

const filteredProducts = computed(() => {
  if (!loanCurrencyFilter.value) return products.value
  return products.value.filter((p) => p.loanCurrency === loanCurrencyFilter.value)
})

function formatUsdCompact(n) {
  if (n == null || !Number.isFinite(Number(n))) return '—'
  const v = Number(n)
  if (v >= 1e9) return `$ ${(v / 1e9).toFixed(2)}B`
  if (v >= 1e6) return `$ ${(v / 1e6).toFixed(1)}M`
  if (v >= 1e3) return `$ ${(v / 1e3).toFixed(1)}K`
  return `$ ${v.toLocaleString()}`
}

const liquidityTotal = computed(() =>
  filteredProducts.value.reduce((s, p) => s + (Number(p.availableLiquidity) || 0), 0)
)

const activeStatuses = [LOAN_ORDER_STATUS.PENDING, LOAN_ORDER_STATUS.ACTIVE, LOAN_ORDER_STATUS.REPAYING]

const pendingRepayTotal = computed(() =>
  orders.value
    .filter((o) => activeStatuses.includes(o.status))
    .filter((o) => !loanCurrencyFilter.value || o.loanCurrency === loanCurrencyFilter.value)
    .reduce((s, o) => s + (Number(o.totalDebt) || 0), 0)
)

/** 演示：授信与剩余可借（随币种筛选仅影响展示口径说明） */
const demoTotalCredit = 2_500_000
const demoWalletBalance = 128_430.55

const usedCreditApprox = computed(() => pendingRepayTotal.value)

const remainingBorrowApprox = computed(() =>
  Math.max(0, Math.round(demoTotalCredit - usedCreditApprox.value))
)

const recordTab = ref('current')
/** Hero 主入口：借币一览 / 我的记录（与流动性挖矿页结构一致） */
const heroPanel = ref('overview')

const currentOrders = computed(() =>
  orders.value.filter((o) => activeStatuses.includes(o.status))
)

const historyOrders = computed(() =>
  orders.value.filter(
    (o) =>
      o.status === LOAN_ORDER_STATUS.COMPLETED ||
      o.status === LOAN_ORDER_STATUS.LIQUIDATED ||
      o.status === LOAN_ORDER_STATUS.CANCELLED
  )
)

function statusClass(s) {
  if (s === PRODUCT_STATUS.ACTIVE) return 'bg-lime-400/12 text-lime-200'
  if (s === PRODUCT_STATUS.SUSPENDED) return 'bg-amber-400/15 text-amber-200'
  return 'bg-white/10 text-white/50'
}

/** 借款弹窗 */
const borrowOpen = ref(false)
const borrowProduct = ref(null)
const borrowAmount = ref('')
let clearBorrowTimer = null

function openBorrowDialog(p) {
  if (clearBorrowTimer != null) {
    clearTimeout(clearBorrowTimer)
    clearBorrowTimer = null
  }
  borrowProduct.value = p
  borrowAmount.value = ''
  borrowOpen.value = true
}

function closeBorrowDialog() {
  borrowOpen.value = false
}

function onBorrowEscape(e) {
  if (e.key === 'Escape' && borrowOpen.value) closeBorrowDialog()
}

watch(borrowOpen, (open) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = open ? 'hidden' : ''
  if (typeof window === 'undefined') return
  if (open) {
    if (clearBorrowTimer != null) {
      clearTimeout(clearBorrowTimer)
      clearBorrowTimer = null
    }
    window.addEventListener('keydown', onBorrowEscape)
  } else {
    window.removeEventListener('keydown', onBorrowEscape)
    if (clearBorrowTimer != null) clearTimeout(clearBorrowTimer)
    clearBorrowTimer = window.setTimeout(() => {
      borrowProduct.value = null
      borrowAmount.value = ''
      clearBorrowTimer = null
    }, 360)
  }
})

onUnmounted(() => {
  if (clearBorrowTimer != null) clearTimeout(clearBorrowTimer)
  if (typeof document !== 'undefined') document.body.style.overflow = ''
  if (typeof window !== 'undefined') window.removeEventListener('keydown', onBorrowEscape)
})

const parsedBorrow = computed(() => {
  const n = Number(String(borrowAmount.value).replace(/,/g, ''))
  return Number.isFinite(n) && n >= 0 ? n : 0
})

const borrowInterestPreview = computed(() => {
  const p = borrowProduct.value
  if (!p) return 0
  const amt = parsedBorrow.value
  const days = Math.max(1, Number(p.minLoanDuration) || 7)
  return (amt * (Number(p.interestRate) / 100) * days) / 365
})

function fillBorrowAll() {
  const p = borrowProduct.value
  if (!p) return
  borrowAmount.value = String(p.maxLoanAmount ?? '')
}

const borrowCanSubmit = computed(
  () => borrowProduct.value != null && borrowProduct.value.status === PRODUCT_STATUS.ACTIVE
)

const overdueFeePct = computed(() => borrowProduct.value?.liquidationPenalty ?? 4)
</script>

<template>
  <div class="min-h-[calc(100dvh-3.5rem)] bg-[#050505] pb-8 lg:pb-10">
    <header class="relative overflow-hidden border-b border-white/[0.06] bg-[#050505]">
      <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          class="absolute -left-1/4 top-0 h-[22rem] w-[22rem] rounded-full bg-lime-400/[0.06] blur-[100px] sm:h-[28rem] sm:w-[28rem]"
        />
        <div
          class="absolute -right-1/4 bottom-0 h-[18rem] w-[18rem] rounded-full bg-violet-500/[0.07] blur-[90px] sm:h-[24rem] sm:w-[24rem]"
        />
        <div
          class="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,#050505_50%,#050505_100%)]"
        />
      </div>
      <div
        class="relative mx-auto max-w-7xl px-4 pb-6 pt-6 sm:px-8 sm:pb-8 sm:pt-8 lg:px-10 lg:pb-10 lg:pt-10"
      >
        <nav class="text-xs text-white/40 sm:text-sm">
          <RouterLink :to="`${prefix}/finance`" class="transition hover:text-lime-300">金融</RouterLink>
          <span class="mx-1.5 text-white/20 sm:mx-2">/</span>
          <span class="text-white/70">信用借贷</span>
        </nav>
        <p
          class="mt-4 inline-flex items-center gap-2 rounded-full border border-lime-400/20 bg-lime-400/[0.06] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-lime-200/90 sm:mt-6 sm:px-3.5 sm:py-1 sm:text-[11px] sm:tracking-[0.3em]"
        >
          Borrow · 信用借币
        </p>
        <h1
          class="mt-2 text-3xl font-bold tracking-tight text-white sm:mt-3 sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-tight"
        >
          信用借贷
        </h1>

        <div
          class="mt-5 inline-flex w-fit max-w-full rounded-xl border border-white/[0.07] bg-black/40 p-1 shadow-inner shadow-black/20 sm:mt-6"
          role="tablist"
          aria-label="页面主入口"
        >
          <button
            type="button"
            role="tab"
            :aria-selected="heroPanel === 'overview'"
            class="min-h-[2.75rem] shrink-0 rounded-lg px-4 py-2.5 text-center text-sm font-semibold tracking-tight transition focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] sm:min-h-[3rem] sm:px-6 sm:py-2.5 sm:text-[15px] md:text-base"
            :class="
              heroPanel === 'overview'
                ? 'bg-white/[0.1] text-lime-200 shadow-sm'
                : 'text-white/45 hover:text-white/75'
            "
            @click="heroPanel = 'overview'"
          >
            借币一览
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="heroPanel === 'records'"
            class="min-h-[2.75rem] shrink-0 rounded-lg px-4 py-2.5 text-center text-sm font-semibold tracking-tight transition focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] sm:min-h-[3rem] sm:px-6 sm:py-2.5 sm:text-[15px] md:text-base"
            :class="
              heroPanel === 'records'
                ? 'bg-white/[0.1] text-lime-200 shadow-sm'
                : 'text-white/45 hover:text-white/75'
            "
            @click="heroPanel = 'records'"
          >
            我的记录
          </button>
        </div>

        <div
          v-if="heroPanel === 'records'"
          class="mt-4 flex flex-wrap items-center gap-2 sm:mt-5 sm:gap-3"
        >
          <div
            class="inline-flex w-fit max-w-full flex-wrap rounded-xl border border-white/[0.07] bg-black/40 p-1 shadow-inner shadow-black/20"
            role="tablist"
            aria-label="记录类型"
          >
            <button
              type="button"
              role="tab"
              :aria-selected="recordTab === 'current'"
              class="min-h-10 shrink-0 rounded-lg px-3 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/40 sm:min-h-[2.5rem] sm:px-4 sm:text-sm"
              :class="
                recordTab === 'current'
                  ? 'bg-white/[0.1] text-lime-200 shadow-sm'
                  : 'text-white/45 hover:text-white/75'
              "
              @click="recordTab = 'current'"
            >
              当前记录
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="recordTab === 'repayment'"
              class="min-h-10 shrink-0 rounded-lg px-3 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/40 sm:min-h-[2.5rem] sm:px-4 sm:text-sm"
              :class="
                recordTab === 'repayment'
                  ? 'bg-white/[0.1] text-lime-200 shadow-sm'
                  : 'text-white/45 hover:text-white/75'
              "
              @click="recordTab = 'repayment'"
            >
              还款记录
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="recordTab === 'history'"
              class="min-h-10 shrink-0 rounded-lg px-3 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/40 sm:min-h-[2.5rem] sm:px-4 sm:text-sm"
              :class="
                recordTab === 'history'
                  ? 'bg-white/[0.1] text-lime-200 shadow-sm'
                  : 'text-white/45 hover:text-white/75'
              "
              @click="recordTab = 'history'"
            >
              历史记录
            </button>
          </div>
        </div>

        <p
          v-if="heroPanel === 'overview'"
          class="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/55 sm:mt-5 sm:text-lg md:text-xl"
        >
          顶部为额度与流动性摘要；下方按借出币种浏览期限档位，右侧为账户授信演示（数据与后台抵押借贷字段一致）。
        </p>
        <p
          v-else
          class="mt-3 max-w-2xl text-xs leading-relaxed text-white/45 sm:mt-4 sm:text-[15px]"
        >
          下方为演示订单与还款流水，与真实账户无关；接入接口后将按登录用户展示。
        </p>
      </div>
    </header>

    <div
      class="mx-auto max-w-7xl px-4 sm:px-8 lg:px-10"
      :class="heroPanel === 'records' ? 'py-4 sm:py-6 lg:py-8' : 'py-5 sm:py-8 lg:py-10'"
    >
      <template v-if="heroPanel === 'overview'">
      <!-- 顶部四卡 -->
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <div
          class="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3.5 sm:px-5 sm:py-4"
        >
          <div class="min-w-0">
            <p class="text-[11px] font-medium uppercase tracking-wide text-white/40">资产</p>
            <label class="sr-only">借出币种</label>
            <select
              v-model="loanCurrencyFilter"
              class="mt-1.5 w-full max-w-[10rem] cursor-pointer truncate rounded-lg border border-white/[0.12] bg-black/35 py-1.5 pl-2 pr-7 text-sm font-semibold text-white focus:border-lime-400/45 focus:outline-none focus:ring-2 focus:ring-lime-400/25"
            >
              <option value="">全部币种</option>
              <option v-for="c in loanCurrencies" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.02] text-white/45"
            aria-hidden="true"
          >
            <FrontStrokeIcon name="arrows-swap" size-class="h-5 w-5" />
          </div>
        </div>

        <div
          class="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3.5 sm:px-5 sm:py-4"
        >
          <div class="min-w-0">
            <p class="text-[11px] font-medium uppercase tracking-wide text-white/40">可流动性</p>
            <p class="mt-1.5 truncate text-lg font-bold tabular-nums text-white sm:text-xl">
              {{ formatUsdCompact(liquidityTotal) }}
            </p>
          </div>
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.02] text-white/45"
            aria-hidden="true"
          >
            <FrontStrokeIcon name="bolt" size-class="h-5 w-5" />
          </div>
        </div>

        <div
          class="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3.5 sm:px-5 sm:py-4"
        >
          <div class="min-w-0">
            <p class="text-[11px] font-medium uppercase tracking-wide text-white/40">可借数量</p>
            <p class="mt-1.5 truncate text-lg font-bold tabular-nums text-lime-300 sm:text-xl">
              {{ remainingBorrowApprox.toLocaleString() }}
            </p>
          </div>
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.02] text-white/45"
            aria-hidden="true"
          >
            <FrontStrokeIcon name="id-card" size-class="h-5 w-5" />
          </div>
        </div>

        <div
          class="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3.5 sm:px-5 sm:py-4"
        >
          <div class="min-w-0">
            <p class="text-[11px] font-medium uppercase tracking-wide text-white/40">待还数量</p>
            <p class="mt-1.5 truncate text-lg font-bold tabular-nums text-violet-200/95 sm:text-xl">
              {{ Math.round(pendingRepayTotal).toLocaleString() }}
            </p>
          </div>
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.02] text-white/45"
            aria-hidden="true"
          >
            <FrontStrokeIcon name="clipboard" size-class="h-5 w-5" />
          </div>
        </div>
      </div>

      <!-- 中部：借币期限 + 账户（标题均在框外，与左侧结构一致） -->
      <div class="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <section class="min-w-0 flex-1">
          <h2 class="mb-3 text-base font-semibold leading-snug tracking-tight text-lime-200/95 sm:text-lg">
            借币期限
          </h2>
          <div
            class="overflow-x-auto rounded-xl border border-white/[0.08] bg-white/[0.025] lg:rounded-2xl"
          >
            <table class="w-full min-w-[640px] border-collapse text-left text-sm text-white/90">
              <thead>
                <tr class="border-b border-white/[0.08] text-xs font-semibold uppercase tracking-wide text-white/45">
                  <th class="px-4 py-3 font-semibold sm:px-5">币种</th>
                  <th class="px-4 py-3 font-semibold sm:px-5">利率</th>
                  <th class="px-4 py-3 font-semibold sm:px-5">还款周期</th>
                  <th class="px-4 py-3 font-semibold sm:px-5">可借额度</th>
                  <th class="px-4 py-3 text-right font-semibold sm:px-5">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="p in filteredProducts"
                  :key="p.productId"
                  class="border-b border-white/[0.05] transition hover:bg-white/[0.03]"
                >
                  <td class="px-4 py-3.5 sm:px-5">
                    <div class="flex items-center gap-2">
                      <span
                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.12] bg-transparent text-white/40"
                      >
                        <FrontStrokeIcon name="wallet" size-class="h-4 w-4" />
                      </span>
                      <div>
                        <span class="font-semibold text-white">{{ p.loanCurrency }}</span>
                        <span
                          class="ml-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          :class="statusClass(p.status)"
                        >
                          {{ PRODUCT_STATUS_LABELS[p.status] }}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3.5 font-bold tabular-nums text-lime-300 sm:px-5">
                    {{ p.interestRate }}%
                  </td>
                  <td class="px-4 py-3.5 tabular-nums text-white/75 sm:px-5">
                    {{ p.minLoanDuration }} – {{ p.maxLoanDuration }} 天
                  </td>
                  <td class="px-4 py-3.5 tabular-nums text-white/70 sm:px-5">
                    {{ p.minLoanAmount?.toLocaleString() }} – {{ p.maxLoanAmount?.toLocaleString() }}
                  </td>
                  <td class="px-4 py-3.5 text-right sm:px-5">
                    <button
                      v-if="p.status === PRODUCT_STATUS.ACTIVE"
                      type="button"
                      class="rounded-lg border border-lime-400/50 px-3 py-1.5 text-xs font-semibold text-lime-200 transition hover:bg-lime-400/10 sm:px-4 sm:text-sm"
                      @click="openBorrowDialog(p)"
                    >
                      借款
                    </button>
                    <RouterLink
                      v-else
                      :to="`${prefix}/finance/lending/${p.productId}`"
                      class="inline-block rounded-lg border border-white/20 px-3 py-1.5 text-xs font-medium text-white/60 transition hover:bg-white/10 sm:px-4 sm:text-sm"
                    >
                      查看
                    </RouterLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="filteredProducts.length === 0" class="mt-4 text-center text-sm text-white/45">
            暂无该币种产品
          </p>
        </section>

        <aside class="w-full shrink-0 lg:w-[min(100%,20rem)] xl:w-[min(100%,22rem)]">
          <h2 class="mb-3 text-base font-semibold leading-snug tracking-tight text-lime-200/95 sm:text-lg">
            账户信息
          </h2>
          <div
            class="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4 shadow-[inset_0_0_0_1px_rgba(167,139,250,0.06)] sm:p-5 lg:rounded-2xl"
          >
            <dl class="space-y-3 text-sm">
              <div class="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                <dt class="text-white/45">钱包余额</dt>
                <dd class="font-semibold tabular-nums text-white">
                  {{ demoWalletBalance.toLocaleString(undefined, { maximumFractionDigits: 2 }) }} USDT
                </dd>
              </div>
              <div class="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                <dt class="text-white/45">授信总额</dt>
                <dd class="font-semibold tabular-nums text-white">
                  {{ demoTotalCredit.toLocaleString() }} USDT
                </dd>
              </div>
              <div class="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                <dt class="text-white/45">已用额度</dt>
                <dd class="font-semibold tabular-nums text-violet-200/95">
                  {{ Math.round(usedCreditApprox).toLocaleString() }} USDT
                </dd>
              </div>
              <div class="flex items-center justify-between gap-3 pb-1">
                <dt class="text-white/45">剩余额度</dt>
                <dd class="font-semibold tabular-nums text-lime-200/90">
                  {{ remainingBorrowApprox.toLocaleString() }} USDT
                </dd>
              </div>
            </dl>
            <RouterLink
              :to="{ path: `${prefix}/login`, query: { redirect: route.path } }"
              class="mt-5 flex w-full items-center justify-center rounded-lg border border-lime-400/45 py-2.5 text-sm font-semibold text-lime-200 transition hover:bg-lime-400/10"
            >
              获取借款额度
            </RouterLink>
            <p class="mt-3 text-center text-[11px] leading-relaxed text-white/35">
              演示环境：正式接入后将按风控与授信策略展示。
            </p>
          </div>
        </aside>
      </div>
      </template>

      <template v-else>
        <div
          class="overflow-x-auto rounded-xl border border-white/[0.08] bg-white/[0.02] sm:rounded-2xl"
        >
          <!-- 当前记录 -->
          <table
            v-if="recordTab === 'current'"
            class="w-full min-w-[560px] border-collapse text-left text-xs text-white/85 sm:text-sm"
          >
            <thead>
              <tr class="border-b border-white/[0.08] text-[10px] font-semibold uppercase tracking-wide text-white/40 sm:text-xs">
                <th class="px-3 py-2.5 sm:px-5 sm:py-3">币种</th>
                <th class="px-3 py-2.5 sm:px-5 sm:py-3">借款金额</th>
                <th class="hidden px-3 py-2.5 sm:table-cell sm:px-5 sm:py-3">利率</th>
                <th class="px-3 py-2.5 sm:px-5 sm:py-3">状态</th>
                <th class="hidden px-3 py-2.5 md:table-cell md:px-5 md:py-3">到期</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="o in currentOrders"
                :key="o.orderId"
                class="border-b border-white/[0.05] hover:bg-white/[0.02]"
              >
                <td class="px-3 py-2.5 font-medium text-white sm:px-5 sm:py-3">{{ o.loanCurrency }}</td>
                <td class="px-3 py-2.5 tabular-nums sm:px-5 sm:py-3">
                  {{ o.loanAmount?.toLocaleString() }}
                </td>
                <td class="hidden tabular-nums text-lime-300/90 sm:table-cell sm:px-5 sm:py-3">
                  {{ o.interestRate }}%
                </td>
                <td class="px-3 py-2.5 sm:px-5 sm:py-3">
                  {{ LOAN_ORDER_STATUS_LABELS[o.status] ?? o.status }}
                </td>
                <td class="hidden tabular-nums text-white/50 md:table-cell md:px-5 md:py-3">
                  {{ o.maturityDate }}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 还款记录 -->
          <table
            v-else-if="recordTab === 'repayment'"
            class="w-full min-w-[560px] border-collapse text-left text-xs text-white/85 sm:text-sm"
          >
            <thead>
              <tr class="border-b border-white/[0.08] text-[10px] font-semibold uppercase tracking-wide text-white/40 sm:text-xs">
                <th class="px-3 py-2.5 sm:px-5 sm:py-3">产品</th>
                <th class="px-3 py-2.5 sm:px-5 sm:py-3">金额</th>
                <th class="hidden px-3 py-2.5 sm:table-cell sm:px-5 sm:py-3">类型</th>
                <th class="px-3 py-2.5 sm:px-5 sm:py-3">状态</th>
                <th class="hidden px-3 py-2.5 md:table-cell md:px-5 md:py-3">时间</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="r in repayments"
                :key="r.repaymentId"
                class="border-b border-white/[0.05] hover:bg-white/[0.02]"
              >
                <td class="max-w-[10rem] truncate px-3 py-2.5 sm:max-w-none sm:px-5 sm:py-3">
                  {{ r.productName }}
                </td>
                <td class="px-3 py-2.5 tabular-nums sm:px-5 sm:py-3">{{ r.amount?.toLocaleString() }}</td>
                <td class="hidden sm:table-cell sm:px-5 sm:py-3">
                  {{ REPAYMENT_TYPE_LABELS[r.repaymentType] ?? r.repaymentType }}
                </td>
                <td class="px-3 py-2.5 sm:px-5 sm:py-3">
                  {{ REPAYMENT_STATUS_LABELS[r.status] ?? r.status }}
                </td>
                <td class="hidden tabular-nums text-white/50 md:table-cell md:px-5 md:py-3">
                  {{ r.repaymentTime ?? r.createTime }}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 历史记录 -->
          <table
            v-else
            class="w-full min-w-[560px] border-collapse text-left text-xs text-white/85 sm:text-sm"
          >
            <thead>
              <tr class="border-b border-white/[0.08] text-[10px] font-semibold uppercase tracking-wide text-white/40 sm:text-xs">
                <th class="px-3 py-2.5 sm:px-5 sm:py-3">币种</th>
                <th class="px-3 py-2.5 sm:px-5 sm:py-3">借款金额</th>
                <th class="px-3 py-2.5 sm:px-5 sm:py-3">状态</th>
                <th class="hidden px-3 py-2.5 md:table-cell md:px-5 md:py-3">更新时间</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="o in historyOrders"
                :key="o.orderId"
                class="border-b border-white/[0.05] hover:bg-white/[0.02]"
              >
                <td class="px-3 py-2.5 font-medium text-white sm:px-5 sm:py-3">{{ o.loanCurrency }}</td>
                <td class="px-3 py-2.5 tabular-nums sm:px-5 sm:py-3">
                  {{ o.loanAmount?.toLocaleString() }}
                </td>
                <td class="px-3 py-2.5 sm:px-5 sm:py-3">
                  {{ LOAN_ORDER_STATUS_LABELS[o.status] ?? o.status }}
                </td>
                <td class="hidden tabular-nums text-white/50 md:table-cell md:px-5 md:py-3">
                  {{ o.updateTime }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p
          v-if="
            (recordTab === 'current' && !currentOrders.length) ||
            (recordTab === 'repayment' && !repayments.length) ||
            (recordTab === 'history' && !historyOrders.length)
          "
          class="mt-4 text-center text-sm text-white/40"
        >
          暂无数据
        </p>
      </template>
    </div>

    <!-- 产品详情 / 借款 -->
    <FrontPopupShell
      v-model="borrowOpen"
      aria-labelledby="credit-borrow-dialog-title"
      close-on-backdrop
      @backdrop-click="closeBorrowDialog"
    >
      <FrontPopupCard v-if="borrowProduct" variant="flow" flow-max="680" wide @click.stop>
        <FrontPopupCloseButton @click="closeBorrowDialog" />

        <div
          class="relative flex min-h-0 flex-1 flex-col overflow-hidden border-b border-white/10"
        >
          <div class="shrink-0 px-4 pb-3 pt-5 pr-11 sm:px-5 sm:pr-12">
            <h2 id="credit-borrow-dialog-title" class="text-lg font-semibold text-white">
              产品详情
            </h2>
            <div class="mt-4 flex items-center gap-3">
              <div
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/[0.12] bg-transparent text-white/45"
              >
                <FrontStrokeIcon name="wallet" size-class="h-6 w-6" />
              </div>
              <p class="text-xl font-semibold text-white">{{ borrowProduct.loanCurrency }}</p>
            </div>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-2 sm:px-5">
            <dl class="space-y-2.5 text-sm">
              <div class="flex items-center justify-between gap-3 border-b border-white/[0.06] py-2.5">
                <dt class="text-white/45">利率</dt>
                <dd class="font-bold tabular-nums text-lime-300">{{ borrowProduct.interestRate }}%</dd>
              </div>
              <div class="flex items-center justify-between gap-3 border-b border-white/[0.06] py-2.5">
                <dt class="text-white/45">还款周期</dt>
                <dd class="tabular-nums text-white">
                  {{ borrowProduct.minLoanDuration }} – {{ borrowProduct.maxLoanDuration }} 天
                </dd>
              </div>
              <div class="flex items-center justify-between gap-3 border-b border-white/[0.06] py-2.5">
                <dt class="text-white/45">借款币种</dt>
                <dd class="font-medium text-white">{{ borrowProduct.loanCurrency }}</dd>
              </div>
              <div class="flex items-center justify-between gap-3 py-2.5">
                <dt class="text-white/45">借款金额（最小 / 最大）</dt>
                <dd class="text-right tabular-nums text-white">
                  {{ borrowProduct.minLoanAmount?.toLocaleString() }} –
                  {{ borrowProduct.maxLoanAmount?.toLocaleString() }}
                </dd>
              </div>
            </dl>

            <div
              class="mt-4 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-xs leading-relaxed text-orange-200/95 sm:text-sm"
            >
              请及时还款；若逾期，每日额外收取（本金+利息）约
              <span class="font-semibold">{{ overdueFeePct }}%</span>
              作为逾期费（演示口径，以实际合约与规则为准）。
            </div>

            <div v-if="borrowCanSubmit" class="mt-5 border-t border-white/[0.08] pt-5">
              <div class="flex flex-wrap items-baseline justify-between gap-2">
                <span class="text-sm font-medium text-white/75">借币数量</span>
                <span class="text-xs text-white/45">
                  可借数量（{{ borrowProduct.loanCurrency }}）：{{
                    remainingBorrowApprox.toLocaleString()
                  }}
                </span>
              </div>
              <div class="mt-2 flex gap-2">
                <input
                  v-model="borrowAmount"
                  type="text"
                  inputmode="decimal"
                  :placeholder="`最少 ${borrowProduct.minLoanAmount} 起`"
                  class="min-w-0 flex-1 rounded-lg border border-white/[0.12] bg-black/40 px-3 py-2.5 text-[15px] text-white placeholder:text-white/30 focus:border-lime-400/45 focus:outline-none focus:ring-2 focus:ring-lime-400/25"
                />
                <button
                  type="button"
                  class="shrink-0 rounded-lg border border-lime-400/50 px-3 py-2.5 text-xs font-semibold text-lime-200 transition hover:bg-lime-400/10 sm:px-4 sm:text-sm"
                  @click="fillBorrowAll"
                >
                  全部
                </button>
              </div>
              <p class="mt-2 text-xs tabular-nums text-white/50 sm:text-sm">
                利息（{{ borrowProduct.loanCurrency }}，按最短周期粗算演示）：
                <span class="font-semibold text-lime-300/90">
                  {{ borrowInterestPreview.toFixed(4) }} {{ borrowProduct.loanCurrency }}
                </span>
              </p>
            </div>

            <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                class="rounded-lg border border-white/20 px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10"
                @click="closeBorrowDialog"
              >
                取消
              </button>
              <RouterLink
                v-if="borrowCanSubmit"
                :to="{ path: `${prefix}/login`, query: { redirect: route.path } }"
                class="inline-flex items-center justify-center rounded-lg bg-lime-400 px-4 py-2.5 text-sm font-semibold text-[#0b0e11] shadow-sm transition hover:bg-lime-300"
                @click="closeBorrowDialog"
              >
                申购
              </RouterLink>
            </div>
          </div>
        </div>
      </FrontPopupCard>
    </FrontPopupShell>
  </div>
</template>
