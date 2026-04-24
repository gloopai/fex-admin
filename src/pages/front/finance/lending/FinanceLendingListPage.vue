<script setup>
import { computed, onUnmounted, ref, watch, watchEffect } from 'vue'
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
  REPAYMENT_STATUS,
  REPAYMENT_STATUS_LABELS,
  REPAYMENT_TYPE,
  REPAYMENT_TYPE_LABELS
} from '../../../../admin/constants/cryptoLending'

const prefix = '/front'
const route = useRoute()

const products = ref([...mockProducts])
const orders = ref([...mockOrders])
const repayments = ref([...mockRepayments])

/** 借出币种筛选（顶部资产卡；用弹层选择，避免卡内 Tab 过窄） */
const loanCurrencyFilter = ref('')
const currencyPickerOpen = ref(false)

/** 资产卡主数字：短文案避免窄格换行 */
const loanCurrencyHeadline = computed(() =>
  loanCurrencyFilter.value ? String(loanCurrencyFilter.value) : '全部'
)

const loanCurrencyHint = computed(() =>
  loanCurrencyFilter.value ? `筛选「${loanCurrencyFilter.value}」` : '借出币种未限定'
)

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

/** Headline credit stats; currency filter affects summary context */
const demoTotalCredit = 2_500_000
const demoWalletBalance = 128_430.55

const usedCreditApprox = computed(() => pendingRepayTotal.value)

const remainingBorrowApprox = computed(() =>
  Math.max(0, Math.round(demoTotalCredit - usedCreditApprox.value))
)

const recordTab = ref('current')
/** Hero 主入口：借币一览 / 我的记录（与 AI 量化、流动性列表一致） */
const heroPanel = ref('overview')

/** 还款弹窗（mock 更新订单 + 还款记录） */
const repayOpen = ref(false)
const repayOrder = ref(null)
const repayAmount = ref('')
let clearRepayTimer = null

function formatLendingNow() {
  const d = new Date()
  const parts = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(d)
  const get = (t) => parts.find((x) => x.type === t)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`
}

function openRepayDialog(order) {
  if (
    order.status !== LOAN_ORDER_STATUS.ACTIVE &&
    order.status !== LOAN_ORDER_STATUS.REPAYING
  ) {
    return
  }
  if (clearRepayTimer != null) {
    clearTimeout(clearRepayTimer)
    clearRepayTimer = null
  }
  currencyPickerOpen.value = false
  borrowOpen.value = false
  repayOrder.value = order
  const debt = Number(order.totalDebt) || 0
  repayAmount.value = debt > 0 ? String(debt) : ''
  repayOpen.value = true
}

function closeRepayDialog() {
  repayOpen.value = false
}

function onRepayEscape(e) {
  if (e.key === 'Escape' && repayOpen.value) closeRepayDialog()
}

function fillRepayAll() {
  const o = repayOrder.value
  if (!o) return
  repayAmount.value = String(Number(o.totalDebt) || 0)
}

const parsedRepay = computed(() => {
  const n = Number(String(repayAmount.value).replace(/,/g, ''))
  return Number.isFinite(n) && n >= 0 ? n : 0
})

const repayConfirmEnabled = computed(() => {
  const o = repayOrder.value
  if (!o) return false
  const debt = Number(o.totalDebt) || 0
  const pay = parsedRepay.value
  return pay > 0 && debt > 0 && pay <= debt
})

function confirmRepay() {
  const o = repayOrder.value
  if (!o) return
  const debt = Number(o.totalDebt) || 0
  let pay = parsedRepay.value
  if (pay <= 0 || debt <= 0) return
  pay = Math.min(pay, debt)
  const accrued = Number(o.interestAccrued) || 0
  const interestPaid = Math.min(pay, accrued)
  const principalPaid = pay - interestPaid
  const newDebt = Math.max(0, debt - pay)
  const newAccrued = Math.max(0, accrued - interestPaid)
  const now = formatLendingNow()
  const idx = orders.value.findIndex((x) => x.orderId === o.orderId)
  if (idx === -1) return
  const nextStatus =
    newDebt <= 0 ? LOAN_ORDER_STATUS.COMPLETED : LOAN_ORDER_STATUS.REPAYING
  orders.value[idx] = {
    ...orders.value[idx],
    totalDebt: newDebt,
    interestAccrued: newAccrued,
    status: nextStatus,
    updateTime: now,
    daysRemaining: newDebt <= 0 ? 0 : o.daysRemaining
  }
  orders.value = [...orders.value]
  const rid = `REP-DEMO-${Date.now()}`
  repayments.value = [
    {
      repaymentId: rid,
      orderId: o.orderId,
      userId: o.userId,
      userName: o.userName,
      productName: o.productName,
      repaymentType: newDebt <= 0 ? REPAYMENT_TYPE.FULL : REPAYMENT_TYPE.PARTIAL,
      amount: pay,
      interestPaid,
      principalPaid,
      remainingDebt: newDebt,
      status: REPAYMENT_STATUS.COMPLETED,
      paymentMethod: '钱包余额（演示）',
      transactionId: `TXN-${rid}`,
      repaymentTime: now,
      createTime: now
    },
    ...repayments.value
  ]
  repayOpen.value = false
}

watch(repayOpen, (open) => {
  if (typeof window === 'undefined') return
  if (open) {
    window.addEventListener('keydown', onRepayEscape)
  } else {
    window.removeEventListener('keydown', onRepayEscape)
    if (clearRepayTimer != null) clearTimeout(clearRepayTimer)
    clearRepayTimer = window.setTimeout(() => {
      repayOrder.value = null
      repayAmount.value = ''
      clearRepayTimer = null
    }, 360)
  }
})

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
  if (s === PRODUCT_STATUS.INACTIVE) return 'bg-white/10 text-white/45'
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
  currencyPickerOpen.value = false
  repayOpen.value = false
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

function closeCurrencyPicker() {
  currencyPickerOpen.value = false
}

function onCurrencyPickerEscape(e) {
  if (e.key === 'Escape' && currencyPickerOpen.value) closeCurrencyPicker()
}

function applyLoanCurrency(code) {
  loanCurrencyFilter.value = code
  currencyPickerOpen.value = false
}

watch(borrowOpen, (open) => {
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

watch(currencyPickerOpen, (open) => {
  if (typeof window === 'undefined') return
  if (open) {
    window.addEventListener('keydown', onCurrencyPickerEscape)
  } else {
    window.removeEventListener('keydown', onCurrencyPickerEscape)
  }
})

watchEffect(() => {
  if (typeof document === 'undefined') return
  document.body.style.overflow =
    borrowOpen.value || currencyPickerOpen.value || repayOpen.value ? 'hidden' : ''
})

onUnmounted(() => {
  if (clearBorrowTimer != null) clearTimeout(clearBorrowTimer)
  if (clearRepayTimer != null) clearTimeout(clearRepayTimer)
  if (typeof document !== 'undefined') document.body.style.overflow = ''
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', onBorrowEscape)
    window.removeEventListener('keydown', onCurrencyPickerEscape)
    window.removeEventListener('keydown', onRepayEscape)
  }
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
          class="absolute -left-1/4 top-0 h-[20rem] w-[20rem] rounded-full bg-lime-400/[0.07] blur-[100px] sm:h-[26rem] sm:w-[26rem]"
        />
        <div
          class="absolute -right-1/4 bottom-0 h-[16rem] w-[16rem] rounded-full bg-lime-400/[0.05] blur-[90px] sm:h-[22rem] sm:w-[22rem]"
        />
        <div
          class="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,#050505_55%,#050505_100%)]"
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

        <div class="mt-4 flex flex-col gap-5 sm:gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div class="min-w-0 flex-1 space-y-5 sm:space-y-6">
            <div>
              <p
                class="inline-flex items-center gap-2 rounded-full border border-lime-400/25 bg-lime-400/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-lime-200/95 sm:text-[11px] sm:tracking-[0.3em]"
              >
                Borrow · 信用借币
              </p>
              <h1
                class="mt-2 text-3xl font-bold tracking-tight text-white sm:mt-3 sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-tight"
              >
                信用借贷
              </h1>
            </div>
            <div
              class="inline-flex w-full max-w-full rounded-xl border border-white/[0.07] bg-black/40 p-1 shadow-inner shadow-black/20 sm:w-fit"
              role="tablist"
              aria-label="页面主入口"
            >
              <button
                type="button"
                role="tab"
                :aria-selected="heroPanel === 'overview'"
                class="min-h-[2.75rem] min-w-0 flex-1 rounded-lg px-3 py-2.5 text-center text-sm font-semibold tracking-tight transition focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] sm:min-h-[3rem] sm:flex-none sm:px-6 sm:py-2.5 sm:text-[15px] md:text-base"
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
                class="min-h-[2.75rem] min-w-0 flex-1 rounded-lg px-3 py-2.5 text-center text-sm font-semibold tracking-tight transition focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] sm:min-h-[3rem] sm:flex-none sm:px-6 sm:py-2.5 sm:text-[15px] md:text-base"
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
          </div>

          <div
            v-if="heroPanel === 'overview'"
            class="pointer-events-none relative mx-auto h-36 w-36 shrink-0 sm:h-40 sm:w-40 lg:mx-0 lg:h-44 lg:w-44"
            aria-hidden="true"
          >
            <div
              class="absolute inset-0 rounded-full border border-lime-400/20 bg-gradient-to-br from-lime-400/15 via-transparent to-emerald-600/10 opacity-90"
            />
            <div
              class="absolute inset-[18%] rounded-full border border-white/[0.06] bg-lime-400/[0.06] opacity-90"
            />
            <div
              class="absolute inset-[38%] rounded-full border border-white/[0.08] bg-white/[0.03] opacity-90"
            />
            <div
              class="absolute -right-1 top-1/4 h-14 w-14 rounded-full bg-lime-400/18 opacity-90 blur-2xl sm:h-16 sm:w-16"
            />
          </div>
        </div>
      </div>
    </header>

    <div class="mx-auto max-w-7xl px-4 py-5 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
      <template v-if="heroPanel === 'overview'">
      <!-- 顶部四卡 -->
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <div
          class="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3.5 sm:px-5 sm:py-4"
        >
          <div class="min-w-0 flex-1 pr-1">
            <p class="text-[11px] font-medium uppercase tracking-wide text-white/40">资产</p>
            <div class="mt-1.5 flex min-w-0 items-center gap-0.5">
              <p
                class="min-w-0 truncate text-lg font-bold tabular-nums tracking-tight sm:text-xl"
                :class="loanCurrencyFilter ? 'text-lime-200/[0.92]' : 'text-white'"
              >
                {{ loanCurrencyHeadline }}
              </p>
              <button
                type="button"
                class="shrink-0 touch-manipulation rounded-md p-1 text-white/35 transition hover:bg-white/[0.06] hover:text-lime-300/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
                aria-label="选择借出币种"
                @click="currencyPickerOpen = true"
              >
                <FrontStrokeIcon
                  name="chevron-down"
                  size-class="h-4 w-4 sm:h-[1.125rem] sm:w-[1.125rem]"
                />
              </button>
            </div>
            <p class="mt-1 truncate text-[11px] leading-snug text-white/38">
              {{ loanCurrencyHint }}
            </p>
          </div>
          <button
            type="button"
            class="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.02] text-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-lime-400/30 hover:bg-lime-400/[0.08] hover:text-lime-300/95 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/40 active:scale-[0.96]"
            aria-label="选择借出币种"
            @click="currencyPickerOpen = true"
          >
            <FrontStrokeIcon name="arrows-swap" size-class="h-5 w-5" />
          </button>
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
            <p class="mt-1.5 truncate text-lg font-bold tabular-nums text-white sm:text-xl">
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
      <div class="mt-6 flex flex-col gap-5 sm:mt-8 sm:gap-6 lg:flex-row lg:items-start lg:gap-8">
        <section class="min-w-0 flex-1">
          <h2 class="mb-3 text-base font-semibold leading-snug tracking-tight text-lime-200/95 sm:text-lg">
            借币期限
          </h2>
          <div
            class="overflow-x-auto rounded-xl border border-white/[0.08] bg-white/[0.025] sm:rounded-2xl max-md:-mx-1 max-md:rounded-lg max-md:border-white/[0.06]"
          >
            <table
              class="w-full min-w-0 border-collapse text-left text-sm text-white/90 max-md:table-fixed md:min-w-[640px] md:table-auto"
            >
              <thead class="hidden md:table-header-group">
                <tr
                  class="border-b border-white/[0.08] text-[10px] font-semibold uppercase tracking-wide text-white/40 sm:text-[11px]"
                >
                  <th class="px-4 py-2.5 font-semibold md:px-5 md:py-3">币种</th>
                  <th class="hidden px-3 py-2.5 font-semibold md:table-cell md:px-5 md:py-3">利率</th>
                  <th class="hidden px-3 py-2.5 font-semibold md:table-cell md:px-5 md:py-3">还款周期</th>
                  <th class="hidden px-3 py-2.5 font-semibold md:table-cell md:px-5 md:py-3">可借额度</th>
                  <th class="px-3 py-2.5 text-right font-semibold md:px-5 md:py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="p in filteredProducts"
                  :key="p.productId"
                  class="border-b border-white/[0.06] transition hover:bg-white/[0.03] max-md:block max-md:last:border-b-0 md:table-row"
                >
                  <td class="max-md:block max-md:w-full max-md:px-3 max-md:pb-1 max-md:pt-4 md:table-cell md:px-5 md:py-3.5 sm:px-4 sm:py-3.5">
                    <div class="flex items-start gap-2 sm:gap-3">
                      <span
                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.12] bg-transparent text-white/40"
                      >
                        <FrontStrokeIcon name="wallet" size-class="h-4 w-4" />
                      </span>
                      <div class="min-w-0 flex-1">
                        <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span class="text-[15px] font-semibold leading-snug text-white sm:text-base">{{
                            p.loanCurrency
                          }}</span>
                          <span
                            class="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold sm:px-2 sm:text-[10px]"
                            :class="statusClass(p.status)"
                          >
                            {{ PRODUCT_STATUS_LABELS[p.status] }}
                          </span>
                        </div>
                        <div
                          class="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-white/[0.06] pt-3 text-[11px] text-white/50 md:hidden"
                        >
                          <span class="text-white/35">利率</span>
                          <span class="text-right font-bold tabular-nums text-lime-300">{{ p.interestRate }}%</span>
                          <span class="text-white/35">周期</span>
                          <span class="text-right tabular-nums text-white/70">
                            {{ p.minLoanDuration }} – {{ p.maxLoanDuration }} 天
                          </span>
                          <span class="text-white/35">额度</span>
                          <span class="truncate text-right tabular-nums text-white/70">
                            {{ p.minLoanAmount?.toLocaleString() }} – {{ p.maxLoanAmount?.toLocaleString() }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="hidden px-3 py-3.5 align-middle font-bold tabular-nums text-lime-300 md:table-cell md:px-5 md:py-4">
                    {{ p.interestRate }}%
                  </td>
                  <td class="hidden px-3 py-3.5 tabular-nums text-white/75 md:table-cell md:px-5 md:py-4">
                    {{ p.minLoanDuration }} – {{ p.maxLoanDuration }} 天
                  </td>
                  <td class="hidden px-3 py-3.5 tabular-nums text-white/70 md:table-cell md:px-5 md:py-4">
                    {{ p.minLoanAmount?.toLocaleString() }} – {{ p.maxLoanAmount?.toLocaleString() }}
                  </td>
                  <td
                    class="max-md:block max-md:w-full max-md:px-3 max-md:pb-4 max-md:pt-3 md:table-cell md:px-5 md:py-3.5 sm:px-3"
                  >
                    <button
                      v-if="p.status === PRODUCT_STATUS.ACTIVE"
                      type="button"
                      class="inline-flex w-full min-h-[2.75rem] touch-manipulation items-center justify-center rounded-lg border border-lime-400/50 px-4 py-2.5 text-sm font-semibold text-lime-200 transition hover:bg-lime-400/10 max-md:w-full md:min-h-0 md:w-auto md:px-4 md:py-2 md:text-xs lg:text-sm"
                      @click="openBorrowDialog(p)"
                    >
                      借款
                    </button>
                    <RouterLink
                      v-else
                      :to="`${prefix}/finance/lending/${p.productId}`"
                      class="inline-flex w-full min-h-[2.75rem] touch-manipulation items-center justify-center rounded-lg border border-white/20 px-4 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/10 max-md:w-full md:min-h-0 md:w-auto md:px-4 md:py-2 md:text-xs lg:text-sm"
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
            class="rounded-xl border border-white/[0.08] bg-white/[0.025] p-3.5 shadow-[inset_0_0_0_1px_rgba(167,139,250,0.06)] sm:p-5 lg:rounded-2xl"
          >
            <dl class="space-y-2.5 text-xs sm:space-y-3 sm:text-sm">
              <div class="flex items-start justify-between gap-2 border-b border-white/[0.06] pb-2.5 sm:items-center sm:gap-3 sm:pb-3">
                <dt class="shrink-0 text-white/45">钱包余额</dt>
                <dd class="max-w-[min(100%,11rem)] text-right text-[11px] font-semibold tabular-nums text-white sm:max-w-none sm:text-sm">
                  {{ demoWalletBalance.toLocaleString(undefined, { maximumFractionDigits: 2 }) }} USDT
                </dd>
              </div>
              <div class="flex items-start justify-between gap-2 border-b border-white/[0.06] pb-2.5 sm:items-center sm:gap-3 sm:pb-3">
                <dt class="shrink-0 text-white/45">授信总额</dt>
                <dd class="max-w-[min(100%,11rem)] text-right text-[11px] font-semibold tabular-nums text-white sm:max-w-none sm:text-sm">
                  {{ demoTotalCredit.toLocaleString() }} USDT
                </dd>
              </div>
              <div class="flex items-start justify-between gap-2 border-b border-white/[0.06] pb-2.5 sm:items-center sm:gap-3 sm:pb-3">
                <dt class="shrink-0 text-white/45">已用额度</dt>
                <dd class="max-w-[min(100%,11rem)] text-right text-[11px] font-semibold tabular-nums text-white sm:max-w-none sm:text-sm">
                  {{ Math.round(usedCreditApprox).toLocaleString() }} USDT
                </dd>
              </div>
              <div class="flex items-start justify-between gap-2 pb-1 sm:items-center sm:gap-3">
                <dt class="shrink-0 text-white/45">剩余额度</dt>
                <dd class="max-w-[min(100%,11rem)] text-right text-[11px] font-semibold tabular-nums text-lime-200/90 sm:max-w-none sm:text-sm">
                  {{ remainingBorrowApprox.toLocaleString() }} USDT
                </dd>
              </div>
            </dl>
            <RouterLink
              :to="{ path: `${prefix}/login`, query: { redirect: route.path } }"
              class="mt-4 flex min-h-11 w-full items-center justify-center rounded-lg border border-lime-400/45 py-2.5 text-sm font-semibold text-lime-200 transition hover:bg-lime-400/10 sm:mt-5"
            >
              获取借款额度
            </RouterLink>
            <p class="mt-3 text-center text-[11px] leading-relaxed text-white/35">
              授信额度与风控规则以平台公示及实际审核结果为准。
            </p>
          </div>
        </aside>
      </div>
      </template>

      <template v-else>
        <section class="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] sm:rounded-2xl">
          <div
            class="flex flex-col gap-2 border-b border-white/[0.08] bg-black/30 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4 sm:py-3 md:px-5"
          >
            <div class="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
              <p class="text-[10px] font-semibold uppercase tracking-wide text-white/40 sm:text-[11px]">记录明细</p>
              <span
                v-if="recordTab === 'current' && currentOrders.length"
                class="text-[11px] tabular-nums text-white/40 sm:text-xs"
              >本页共 {{ currentOrders.length }} 条</span>
              <span
                v-else-if="recordTab === 'repayment' && repayments.length"
                class="text-[11px] tabular-nums text-white/40 sm:text-xs"
              >本页共 {{ repayments.length }} 条</span>
              <span
                v-else-if="recordTab === 'history' && historyOrders.length"
                class="text-[11px] tabular-nums text-white/40 sm:text-xs"
              >本页共 {{ historyOrders.length }} 条</span>
            </div>
            <div
              class="grid w-full grid-cols-3 gap-0 rounded-lg border border-white/[0.06] bg-black/40 p-0.5 sm:flex sm:w-auto sm:max-w-full sm:shrink-0 sm:overflow-x-auto sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="tablist"
              aria-label="记录类型"
            >
              <button
                type="button"
                role="tab"
                :aria-selected="recordTab === 'current'"
                class="min-h-[2.5rem] rounded-md border-b-2 border-transparent px-1 py-2 text-center text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/40 sm:min-h-0 sm:rounded-none sm:border-transparent sm:px-4 sm:pb-2.5 sm:text-left sm:text-sm sm:text-[15px]"
                :class="
                  recordTab === 'current'
                    ? 'border-b-2 border-lime-400 text-white max-sm:border-transparent max-sm:bg-white/[0.12] max-sm:text-lime-200 sm:bg-transparent'
                    : 'border-b-2 border-transparent text-white/45 hover:text-white/75 sm:text-white/45'
                "
                @click="recordTab = 'current'"
              >
                当前
              </button>
              <button
                type="button"
                role="tab"
                :aria-selected="recordTab === 'repayment'"
                class="min-h-[2.5rem] rounded-md border-b-2 border-transparent px-1 py-2 text-center text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/40 sm:min-h-0 sm:rounded-none sm:border-transparent sm:px-4 sm:pb-2.5 sm:text-left sm:text-sm sm:text-[15px]"
                :class="
                  recordTab === 'repayment'
                    ? 'border-b-2 border-lime-400 text-white max-sm:border-transparent max-sm:bg-white/[0.12] max-sm:text-lime-200 sm:bg-transparent'
                    : 'border-b-2 border-transparent text-white/45 hover:text-white/75 sm:text-white/45'
                "
                @click="recordTab = 'repayment'"
              >
                还款
              </button>
              <button
                type="button"
                role="tab"
                :aria-selected="recordTab === 'history'"
                class="min-h-[2.5rem] rounded-md border-b-2 border-transparent px-1 py-2 text-center text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/40 sm:min-h-0 sm:rounded-none sm:border-transparent sm:px-4 sm:pb-2.5 sm:text-left sm:text-sm sm:text-[15px]"
                :class="
                  recordTab === 'history'
                    ? 'border-b-2 border-lime-400 text-white max-sm:border-transparent max-sm:bg-white/[0.12] max-sm:text-lime-200 sm:bg-transparent'
                    : 'border-b-2 border-transparent text-white/45 hover:text-white/75 sm:text-white/45'
                "
                @click="recordTab = 'history'"
              >
                历史
              </button>
            </div>
          </div>
          <div class="overflow-x-auto">
            <!-- 当前记录 -->
            <table
              v-if="recordTab === 'current'"
              class="w-full min-w-0 border-collapse text-left text-xs text-white/85 sm:text-sm max-md:table-fixed md:min-w-[560px] md:table-auto"
            >
              <thead class="hidden md:table-header-group">
                <tr
                  class="border-b border-white/[0.08] text-[10px] font-semibold uppercase tracking-wide text-white/40 sm:text-[11px]"
                >
                  <th class="px-3 py-2.5 font-semibold md:px-5 md:py-3">借币</th>
                  <th class="hidden px-3 py-2.5 font-semibold md:table-cell md:px-5 md:py-3">借款金额</th>
                  <th class="hidden px-3 py-2.5 font-semibold md:table-cell md:px-5 md:py-3">利率</th>
                  <th class="hidden px-3 py-2.5 font-semibold md:table-cell md:px-5 md:py-3">到期</th>
                  <th class="hidden px-3 py-2.5 font-semibold md:table-cell md:px-5 md:py-3">待还</th>
                  <th class="px-3 py-2.5 text-right font-semibold md:px-5 md:py-3 md:text-left">操作</th>
                  <th class="px-3 py-2.5 text-right font-semibold md:px-5 md:py-3 md:text-left">状态</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="o in currentOrders"
                  :key="o.orderId"
                  class="border-b border-white/[0.06] transition hover:bg-white/[0.02] max-md:block max-md:last:border-b-0 md:table-row"
                >
                  <td class="min-w-0 max-md:block max-md:w-full max-md:px-3 max-md:pb-0 max-md:pt-4 md:table-cell md:px-5 md:py-3">
                    <p class="text-[14px] font-semibold leading-snug text-white sm:text-sm">{{ o.loanCurrency }}</p>
                    <p class="mt-0.5 tabular-nums text-[11px] text-white/55 sm:text-xs">
                      {{ o.loanAmount?.toLocaleString() }}
                    </p>
                    <div
                      class="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-white/[0.06] pt-3 text-[11px] text-white/50 md:hidden"
                    >
                      <span class="text-white/35">利率</span>
                      <span class="text-right font-medium tabular-nums text-lime-300/90">{{ o.interestRate }}%</span>
                      <span class="text-white/35">到期</span>
                      <span class="text-right tabular-nums text-white/70">{{ o.maturityDate }}</span>
                      <span class="text-white/35">待还</span>
                      <span class="text-right font-medium tabular-nums text-white/85">{{ o.totalDebt?.toLocaleString() }}</span>
                    </div>
                    <div
                      v-if="
                        o.status === LOAN_ORDER_STATUS.ACTIVE || o.status === LOAN_ORDER_STATUS.REPAYING
                      "
                      class="mt-3 md:hidden"
                    >
                      <button
                        type="button"
                        class="w-full touch-manipulation rounded-lg border border-lime-400/45 py-2.5 text-xs font-semibold text-lime-200 transition hover:bg-lime-400/10"
                        @click="openRepayDialog(o)"
                      >
                        还款
                      </button>
                    </div>
                  </td>
                  <td class="hidden px-3 py-2.5 tabular-nums md:table-cell md:px-5 md:py-3">
                    {{ o.loanAmount?.toLocaleString() }}
                  </td>
                  <td class="hidden tabular-nums text-lime-300/90 md:table-cell md:px-5 md:py-3">
                    {{ o.interestRate }}%
                  </td>
                  <td class="hidden tabular-nums text-white/50 md:table-cell md:px-5 md:py-3">
                    {{ o.maturityDate }}
                  </td>
                  <td class="hidden tabular-nums text-white/80 md:table-cell md:px-5 md:py-3">
                    {{ o.totalDebt?.toLocaleString() }}
                  </td>
                  <td
                    class="max-md:hidden md:table-cell md:px-5 md:py-3 md:text-left"
                  >
                    <button
                      v-if="
                        o.status === LOAN_ORDER_STATUS.ACTIVE || o.status === LOAN_ORDER_STATUS.REPAYING
                      "
                      type="button"
                      class="touch-manipulation rounded-lg border border-lime-400/45 px-3 py-1.5 text-xs font-semibold text-lime-200 transition hover:bg-lime-400/10"
                      @click="openRepayDialog(o)"
                    >
                      还款
                    </button>
                    <span v-else class="text-xs text-white/35">—</span>
                  </td>
                  <td
                    class="max-md:block max-md:w-full max-md:px-3 max-md:pb-4 max-md:pt-1 md:table-cell md:px-5 md:py-3 md:text-left"
                  >
                    <span class="text-[11px] leading-snug text-white/85 sm:text-xs md:text-sm">
                      {{ LOAN_ORDER_STATUS_LABELS[o.status] ?? o.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- 还款记录 -->
            <table
              v-else-if="recordTab === 'repayment'"
              class="w-full min-w-0 border-collapse text-left text-xs text-white/85 sm:text-sm max-md:table-fixed md:min-w-[560px] md:table-auto"
            >
              <thead class="hidden md:table-header-group">
                <tr
                  class="border-b border-white/[0.08] text-[10px] font-semibold uppercase tracking-wide text-white/40 sm:text-[11px]"
                >
                  <th class="px-3 py-2.5 font-semibold md:px-5 md:py-3">产品 / 金额</th>
                  <th class="hidden px-3 py-2.5 font-semibold md:table-cell md:px-5 md:py-3">金额</th>
                  <th class="hidden px-3 py-2.5 font-semibold md:table-cell md:px-5 md:py-3">类型</th>
                  <th class="hidden px-3 py-2.5 font-semibold md:table-cell md:px-5 md:py-3">时间</th>
                  <th class="px-3 py-2.5 text-right font-semibold md:px-5 md:py-3 md:text-left">状态</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="r in repayments"
                  :key="r.repaymentId"
                  class="border-b border-white/[0.06] transition hover:bg-white/[0.02] max-md:block max-md:last:border-b-0 md:table-row"
                >
                  <td class="min-w-0 max-md:block max-md:w-full max-md:px-3 max-md:pb-0 max-md:pt-4 md:table-cell md:px-5 md:py-3">
                    <p class="line-clamp-2 text-[14px] font-medium leading-snug text-white sm:text-sm">
                      {{ r.productName }}
                    </p>
                    <p class="mt-0.5 tabular-nums text-[11px] text-white/55 sm:text-xs">
                      {{ r.amount?.toLocaleString() }}
                    </p>
                    <div
                      class="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-white/[0.06] pt-3 text-[11px] text-white/50 md:hidden"
                    >
                      <span class="text-white/35">类型</span>
                      <span class="text-right text-white/75">{{ REPAYMENT_TYPE_LABELS[r.repaymentType] ?? r.repaymentType }}</span>
                      <span class="text-white/35">时间</span>
                      <span class="text-right tabular-nums text-white/60">{{ r.repaymentTime ?? r.createTime }}</span>
                    </div>
                  </td>
                  <td class="hidden px-3 py-2.5 tabular-nums md:table-cell md:px-5 md:py-3">
                    {{ r.amount?.toLocaleString() }}
                  </td>
                  <td class="hidden md:table-cell md:px-5 md:py-3">
                    {{ REPAYMENT_TYPE_LABELS[r.repaymentType] ?? r.repaymentType }}
                  </td>
                  <td class="hidden tabular-nums text-white/50 md:table-cell md:px-5 md:py-3">
                    {{ r.repaymentTime ?? r.createTime }}
                  </td>
                  <td
                    class="max-md:block max-md:w-full max-md:px-3 max-md:pb-4 max-md:pt-3 md:table-cell md:px-5 md:py-3 md:text-left"
                  >
                    <span class="text-[11px] leading-snug sm:text-xs md:text-sm">
                      {{ REPAYMENT_STATUS_LABELS[r.status] ?? r.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- 历史记录 -->
            <table
              v-else
              class="w-full min-w-0 border-collapse text-left text-xs text-white/85 sm:text-sm max-md:table-fixed md:min-w-[560px] md:table-auto"
            >
              <thead class="hidden md:table-header-group">
                <tr
                  class="border-b border-white/[0.08] text-[10px] font-semibold uppercase tracking-wide text-white/40 sm:text-[11px]"
                >
                  <th class="px-3 py-2.5 font-semibold md:px-5 md:py-3">订单</th>
                  <th class="hidden px-3 py-2.5 font-semibold md:table-cell md:px-5 md:py-3">借款金额</th>
                  <th class="hidden px-3 py-2.5 font-semibold md:table-cell md:px-5 md:py-3">更新时间</th>
                  <th class="px-3 py-2.5 text-right font-semibold md:px-5 md:py-3 md:text-left">状态</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="o in historyOrders"
                  :key="o.orderId"
                  class="border-b border-white/[0.06] transition hover:bg-white/[0.02] max-md:block max-md:last:border-b-0 md:table-row"
                >
                  <td class="min-w-0 max-md:block max-md:w-full max-md:px-3 max-md:pb-0 max-md:pt-4 md:table-cell md:px-5 md:py-3">
                    <p class="text-[14px] font-semibold leading-snug text-white sm:text-sm">{{ o.loanCurrency }}</p>
                    <p class="mt-0.5 tabular-nums text-[11px] text-white/55 sm:text-xs">
                      {{ o.loanAmount?.toLocaleString() }}
                    </p>
                    <div
                      class="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-white/[0.06] pt-3 text-[11px] text-white/50 md:hidden"
                    >
                      <span class="text-white/35">更新</span>
                      <span class="text-right tabular-nums text-white/60">{{ o.updateTime }}</span>
                    </div>
                  </td>
                  <td class="hidden px-3 py-2.5 tabular-nums md:table-cell md:px-5 md:py-3">
                    {{ o.loanAmount?.toLocaleString() }}
                  </td>
                  <td class="hidden tabular-nums text-white/50 md:table-cell md:px-5 md:py-3">
                    {{ o.updateTime }}
                  </td>
                  <td
                    class="max-md:block max-md:w-full max-md:px-3 max-md:pb-4 max-md:pt-3 md:table-cell md:px-5 md:py-3 md:text-left"
                  >
                    <span class="text-[11px] leading-snug sm:text-xs md:text-sm">
                      {{ LOAN_ORDER_STATUS_LABELS[o.status] ?? o.status }}
                    </span>
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
            class="px-3 py-12 text-center text-sm text-white/40 sm:py-14"
          >
            暂无数据
          </p>
        </section>
      </template>
    </div>

    <!-- 还款（演示：更新订单与还款记录） -->
    <FrontPopupShell
      v-model="repayOpen"
      aria-labelledby="lending-repay-dialog-title"
      close-on-backdrop
      @backdrop-click="closeRepayDialog"
    >
      <FrontPopupCard v-if="repayOrder" variant="padded" wide @click.stop>
        <FrontPopupCloseButton @click="closeRepayDialog" />
        <h2 id="lending-repay-dialog-title" class="pr-10 text-lg font-semibold tracking-tight text-white">
          确认还款
        </h2>
        <p class="mt-1.5 text-[13px] leading-relaxed text-white/45">
          演示环境：提交后将按比例冲减已计利息与本金，并写入「还款」记录。
        </p>
        <dl class="mt-4 space-y-2 rounded-xl border border-white/[0.08] bg-black/35 px-3 py-3 text-sm">
          <div class="flex justify-between gap-3">
            <dt class="text-white/45">订单</dt>
            <dd class="font-mono text-xs text-white/80">{{ repayOrder.orderId }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-white/45">产品</dt>
            <dd class="text-right text-white/90">{{ repayOrder.productName }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-white/45">币种</dt>
            <dd class="font-medium text-white">{{ repayOrder.loanCurrency }}</dd>
          </div>
          <div class="flex justify-between gap-3 border-t border-white/[0.06] pt-2">
            <dt class="text-white/45">待还总额</dt>
            <dd class="tabular-nums font-semibold text-white">
              {{ repayOrder.totalDebt?.toLocaleString() }} {{ repayOrder.loanCurrency }}
            </dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-white/45">已计利息</dt>
            <dd class="tabular-nums text-lime-200/90">
              {{ repayOrder.interestAccrued?.toLocaleString() }} {{ repayOrder.loanCurrency }}
            </dd>
          </div>
        </dl>
        <div class="mt-5">
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <span class="text-sm font-medium text-white/75">还款金额</span>
            <button
              type="button"
              class="text-xs font-semibold text-lime-300/95 underline-offset-2 hover:underline"
              @click="fillRepayAll"
            >
              全额
            </button>
          </div>
          <input
            v-model="repayAmount"
            type="text"
            inputmode="decimal"
            class="mt-2 w-full rounded-lg border border-white/[0.12] bg-black/40 px-3 py-2.5 text-[15px] text-white placeholder:text-white/30 focus:border-lime-400/45 focus:outline-none focus:ring-2 focus:ring-lime-400/25"
            placeholder="输入还款金额"
          />
        </div>
        <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            class="rounded-lg border border-white/20 px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10"
            @click="closeRepayDialog"
          >
            取消
          </button>
          <button
            type="button"
            class="rounded-lg bg-lime-400 px-4 py-2.5 text-sm font-semibold text-[#0b0e11] shadow-sm transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="!repayConfirmEnabled"
            @click="confirmRepay"
          >
            确认还款
          </button>
        </div>
      </FrontPopupCard>
    </FrontPopupShell>

    <!-- 借出币种（弹层，避免资产卡内 Tab 过窄） -->
    <FrontPopupShell
      v-model="currencyPickerOpen"
      aria-labelledby="lending-currency-picker-title"
      close-on-backdrop
      @backdrop-click="closeCurrencyPicker"
    >
      <FrontPopupCard variant="padded" wide @click.stop>
        <FrontPopupCloseButton @click="closeCurrencyPicker" />
        <h2 id="lending-currency-picker-title" class="pr-10 text-lg font-semibold tracking-tight text-white">
          选择借出币种
        </h2>
        <p class="mt-1.5 text-[13px] leading-relaxed text-white/40">
          筛选借币期限列表与顶部额度统计口径。
        </p>
        <div
          class="mt-5 overflow-hidden rounded-xl border border-white/[0.08] bg-black/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
        >
          <ul
            class="max-h-[min(56vh,20rem)] divide-y divide-white/[0.06] overflow-y-auto overscroll-contain"
            role="listbox"
            aria-label="借出币种选项"
          >
            <li>
              <button
                type="button"
                role="option"
                :aria-selected="loanCurrencyFilter === ''"
                class="flex w-full min-h-[3.25rem] touch-manipulation items-center justify-between gap-3 px-4 py-3.5 text-left text-[15px] font-semibold transition focus:outline-none focus-visible:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-lime-400/30"
                :class="
                  loanCurrencyFilter === ''
                    ? 'bg-lime-400/[0.1] text-lime-50'
                    : 'text-white/90 hover:bg-white/[0.04]'
                "
                @click="applyLoanCurrency('')"
              >
                <span>全部币种</span>
                <FrontStrokeIcon
                  v-if="loanCurrencyFilter === ''"
                  name="check"
                  size-class="h-5 w-5 shrink-0 text-lime-400/90"
                />
              </button>
            </li>
            <li v-for="c in loanCurrencies" :key="c">
              <button
                type="button"
                role="option"
                :aria-selected="loanCurrencyFilter === c"
                class="flex w-full min-h-[3.25rem] touch-manipulation items-center justify-between gap-3 px-4 py-3.5 text-left text-[15px] font-semibold tabular-nums transition focus:outline-none focus-visible:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-lime-400/30"
                :class="
                  loanCurrencyFilter === c
                    ? 'bg-lime-400/[0.1] text-lime-50'
                    : 'text-white/90 hover:bg-white/[0.04]'
                "
                @click="applyLoanCurrency(c)"
              >
                <span>{{ c }}</span>
                <FrontStrokeIcon
                  v-if="loanCurrencyFilter === c"
                  name="check"
                  size-class="h-5 w-5 shrink-0 text-lime-400/90"
                />
              </button>
            </li>
          </ul>
        </div>
      </FrontPopupCard>
    </FrontPopupShell>

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
              作为逾期费，具体以借款合同及平台规则为准。
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
                利息预估（{{ borrowProduct.loanCurrency }}，按最短借款周期估算，仅供参考）：
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
