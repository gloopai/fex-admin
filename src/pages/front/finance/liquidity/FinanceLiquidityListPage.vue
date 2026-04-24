<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import FrontPopupCard from '../../../../components/front/FrontPopupCard.vue'
import FrontPopupCloseButton from '../../../../components/front/FrontPopupCloseButton.vue'
import FrontPopupShell from '../../../../components/front/FrontPopupShell.vue'
import { createLockedProductsMock, createLockedOrdersMock } from '../../../../admin/mock/liquidityLocked'
import {
  LOCKED_MIN_VIP_OPTIONS,
  PRODUCT_STATUS,
  productStatusMeta,
  orderStatusMeta,
  ORDER_STATUS,
  PURCHASE_LIMIT_TYPE,
  lockYieldAnnualPct,
  lockedMinKycRequirementPhrase
} from '../../../../admin/constants/liquidityLocked'

const prefix = '/front'
const route = useRoute()

/** Keep UX copy aligned with product detail where relevant */
const DEMO_AVAILABLE_FUNDS = 5.562875

const currencyTab = ref('')
const orderTab = ref('active')
/** Hero 主入口：挖矿产品 / 我的订单（与 AI 量化、借贷一致） */
const heroPanel = ref('products')

const products = ref(createLockedProductsMock())
const orders = ref(createLockedOrdersMock())

const currenciesFromProducts = computed(() => {
  const set = new Set(products.value.map((p) => p.currency).filter(Boolean))
  return [...set].sort()
})

const filteredProducts = computed(() => {
  let rows = products.value
  if (currencyTab.value) {
    rows = rows.filter((p) => p.currency === currencyTab.value)
  }
  return rows
})

const periodRows = computed(() => {
  const out = []
  for (const p of filteredProducts.value) {
    const periods = p.periods ?? []
    for (const row of periods) {
      out.push({
        key: `${p.id}-${row.days}`,
        product: p,
        period: row,
        annual: lockYieldAnnualPct(row)
      })
    }
  }
  return out
})

const activeOrders = computed(() =>
  orders.value.filter((o) => o.status === ORDER_STATUS.LOCKED)
)
const redeemedOrders = computed(() =>
  orders.value.filter(
    (o) => o.status === ORDER_STATUS.COMPLETED || o.status === ORDER_STATUS.EARLY_REDEEMED
  )
)
const ordersForTab = computed(() => (orderTab.value === 'active' ? activeOrders.value : redeemedOrders.value))

function statusPillClass(status) {
  if (status === PRODUCT_STATUS.ENABLED) return 'bg-lime-400/15 text-lime-200'
  if (status === PRODUCT_STATUS.SOLD_OUT) return 'bg-amber-400/15 text-amber-200'
  return 'bg-white/10 text-white/55'
}

function orderStatusClass(status) {
  return orderStatusMeta[status]?.class ?? 'bg-white/10 text-white/60'
}

const mineDialogOpen = ref(false)
const mineProduct = ref(null)
const minePeriod = ref(null)
const purchaseAmount = ref('')

/** 弹层离场动画后再清空上下文，避免 FrontPopupShell 过渡期内内容闪空 */
let clearMineRefsTimer = null

function openMineDialog(product, period) {
  if (clearMineRefsTimer != null) {
    clearTimeout(clearMineRefsTimer)
    clearMineRefsTimer = null
  }
  mineProduct.value = product
  minePeriod.value = period
  purchaseAmount.value = ''
  mineDialogOpen.value = true
}

function closeMineDialog() {
  mineDialogOpen.value = false
}

function onMineDialogEscape(e) {
  if (e.key === 'Escape' && mineDialogOpen.value) closeMineDialog()
}

watch(mineDialogOpen, (open) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = open ? 'hidden' : ''
  if (typeof window === 'undefined') return
  if (open) {
    if (clearMineRefsTimer != null) {
      clearTimeout(clearMineRefsTimer)
      clearMineRefsTimer = null
    }
    window.addEventListener('keydown', onMineDialogEscape)
  } else {
    window.removeEventListener('keydown', onMineDialogEscape)
    if (clearMineRefsTimer != null) clearTimeout(clearMineRefsTimer)
    clearMineRefsTimer = window.setTimeout(() => {
      mineProduct.value = null
      minePeriod.value = null
      clearMineRefsTimer = null
    }, 360)
  }
})

onUnmounted(() => {
  if (clearMineRefsTimer != null) clearTimeout(clearMineRefsTimer)
  if (typeof document !== 'undefined') document.body.style.overflow = ''
  if (typeof window !== 'undefined') window.removeEventListener('keydown', onMineDialogEscape)
})

const mineCanSubmit = computed(
  () => mineProduct.value != null && mineProduct.value.status === PRODUCT_STATUS.ENABLED
)

const parsedPurchase = computed(() => {
  const n = Number(String(purchaseAmount.value).replace(/,/g, ''))
  return Number.isFinite(n) && n >= 0 ? n : 0
})

const mineSelectedAnnualPct = computed(() =>
  minePeriod.value ? lockYieldAnnualPct(minePeriod.value) : 0
)

const mineEstimatedYield = computed(() => {
  const row = minePeriod.value
  if (!row) return 0
  const apr = lockYieldAnnualPct(row) / 100
  return parsedPurchase.value * apr * (row.days / 365)
})

function fillAllPurchase() {
  const row = minePeriod.value
  if (!row) return
  const cap = Math.min(DEMO_AVAILABLE_FUNDS, Number(row.maxAmount) || DEMO_AVAILABLE_FUNDS)
  purchaseAmount.value = String(cap)
}

const mineLimitDesc = computed(() => {
  const p = mineProduct.value
  if (!p) return ''
  if (p.purchaseLimitType === PURCHASE_LIMIT_TYPE.LIFETIME) {
    return `终身累计申购上限 ${p.lifetimeLimit?.toLocaleString?.() ?? p.lifetimeLimit} ${p.currency}`
  }
  if (p.purchaseLimitType === PURCHASE_LIMIT_TYPE.PERIOD) {
    return `每 ${p.periodDays} 天周期内上限 ${p.periodLimit?.toLocaleString?.() ?? p.periodLimit} ${p.currency}`
  }
  return '当前产品不设个人申购上限（以实际风控为准）'
})

const mineMinVipLabel = computed(() => {
  const p = mineProduct.value
  if (!p) return ''
  const hit = LOCKED_MIN_VIP_OPTIONS.find((o) => o.value === p.minVipLevel)
  return hit?.label ?? `VIP ${p.minVipLevel}`
})
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
          <span class="text-white/70">流动性挖矿</span>
        </nav>

        <div class="mt-4 flex flex-col gap-5 sm:gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div class="min-w-0 flex-1 space-y-5 sm:space-y-6">
            <div>
              <p
                class="inline-flex items-center gap-2 rounded-full border border-lime-400/25 bg-lime-400/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-lime-200/95 sm:text-[11px] sm:tracking-[0.3em]"
              >
                Earn · 锁仓理财
              </p>
              <h1
                class="mt-2 text-3xl font-bold tracking-tight text-white sm:mt-3 sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-tight"
              >
                流动性挖矿
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
                :aria-selected="heroPanel === 'products'"
                class="min-h-[2.75rem] min-w-0 flex-1 rounded-lg px-3 py-2.5 text-center text-sm font-semibold tracking-tight transition focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] sm:min-h-[3rem] sm:flex-none sm:px-6 sm:py-2.5 sm:text-[15px] md:text-base"
                :class="
                  heroPanel === 'products'
                    ? 'bg-white/[0.1] text-lime-200 shadow-sm'
                    : 'text-white/45 hover:text-white/75'
                "
                @click="heroPanel = 'products'"
              >
                挖矿产品
              </button>
              <button
                type="button"
                role="tab"
                :aria-selected="heroPanel === 'orders'"
                class="min-h-[2.75rem] min-w-0 flex-1 rounded-lg px-3 py-2.5 text-center text-sm font-semibold tracking-tight transition focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] sm:min-h-[3rem] sm:flex-none sm:px-6 sm:py-2.5 sm:text-[15px] md:text-base"
                :class="
                  heroPanel === 'orders'
                    ? 'bg-white/[0.1] text-lime-200 shadow-sm'
                    : 'text-white/45 hover:text-white/75'
                "
                @click="heroPanel = 'orders'"
              >
                我的订单
              </button>
            </div>
          </div>

          <div
            v-if="heroPanel === 'products'"
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
      <template v-if="heroPanel === 'products'">
        <div class="flex w-full min-w-0 flex-wrap items-center gap-2">
          <p class="w-full text-[10px] font-semibold uppercase tracking-wider text-white/35 sm:hidden">资产</p>
          <div
            class="flex w-full min-w-0 max-w-full flex-nowrap gap-1 overflow-x-auto rounded-xl border border-white/[0.08] bg-black/35 p-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-x-visible [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="锁仓币种"
          >
            <button
              type="button"
              role="tab"
              :aria-selected="currencyTab === ''"
              class="min-h-[2.5rem] shrink-0 touch-manipulation rounded-lg px-3 py-2 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/40 sm:min-h-0 sm:px-4 sm:text-sm"
              :class="
                currencyTab === ''
                  ? 'bg-white/[0.12] text-white shadow-sm'
                  : 'text-white/45 hover:bg-white/[0.05] hover:text-white/75'
              "
              @click="currencyTab = ''"
            >
              全部
            </button>
            <button
              v-for="c in currenciesFromProducts"
              :key="c"
              type="button"
              role="tab"
              :aria-selected="currencyTab === c"
              class="min-h-[2.5rem] shrink-0 touch-manipulation rounded-lg px-3 py-2 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/40 sm:min-h-0 sm:px-4 sm:text-sm"
              :class="
                currencyTab === c
                  ? 'bg-white/[0.12] text-white shadow-sm'
                  : 'text-white/45 hover:bg-white/[0.05] hover:text-white/75'
              "
              @click="currencyTab = c"
            >
              {{ c }}
            </button>
          </div>
        </div>

        <div
          class="mt-5 overflow-x-auto rounded-xl border border-white/[0.08] bg-white/[0.025] sm:mt-6 sm:rounded-2xl lg:mt-6 max-md:-mx-1 max-md:rounded-lg max-md:border-white/[0.06]"
        >
          <table
            v-if="periodRows.length"
            class="w-full min-w-0 border-collapse text-left text-sm text-white/90 max-md:table-fixed md:min-w-[640px] md:table-auto"
          >
            <thead class="hidden md:table-header-group">
              <tr class="border-b border-white/[0.08] text-[10px] font-semibold uppercase tracking-wide text-white/40 sm:text-[11px]">
                <th class="px-4 py-2.5 font-semibold md:px-5 md:py-3">产品</th>
                <th class="hidden px-3 py-2.5 font-semibold md:table-cell md:px-5 md:py-3">参考年化</th>
                <th class="hidden px-3 py-2.5 font-semibold md:table-cell md:px-5 md:py-3">期限</th>
                <th class="hidden px-3 py-2.5 font-semibold lg:table-cell lg:px-5 lg:py-3">申购区间</th>
                <th class="px-3 py-2.5 text-right font-semibold md:px-5 md:py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="r in periodRows"
                :key="r.key"
                class="border-b border-white/[0.06] transition hover:bg-white/[0.03] max-md:block max-md:last:border-b-0 md:table-row"
              >
                <td class="max-md:block max-md:w-full max-md:px-3 max-md:pb-1 max-md:pt-4 md:table-cell md:px-5 md:py-3.5">
                  <div class="flex items-start gap-2 sm:gap-3">
                    <span class="shrink-0 text-xl leading-none sm:text-2xl" aria-hidden="true">{{
                      r.product.icon
                    }}</span>
                    <div class="min-w-0 flex-1">
                      <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span class="text-[15px] font-semibold leading-snug text-white sm:text-base">{{
                          r.product.name
                        }}</span>
                        <span
                          class="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold sm:px-2 sm:text-[10px]"
                          :class="statusPillClass(r.product.status)"
                        >
                          {{ productStatusMeta[r.product.status]?.label ?? r.product.status }}
                        </span>
                      </div>
                      <p class="mt-0.5 line-clamp-2 text-[11px] leading-snug text-white/40 sm:text-xs">
                        {{ r.product.currency }} · VIP{{ r.product.minVipLevel }} ·
                        {{ lockedMinKycRequirementPhrase(r.product.minKycLevel) }}
                      </p>
                      <div
                        class="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-white/[0.06] pt-3 text-[11px] text-white/50 max-md:grid-cols-2 md:hidden"
                      >
                        <span class="text-white/35">参考年化</span>
                        <span class="text-right font-bold tabular-nums text-lime-300">{{ r.annual.toFixed(2) }}%</span>
                        <span class="text-white/35">期限</span>
                        <span class="text-right tabular-nums text-white/70">{{ r.period.days }} 天</span>
                        <span class="text-white/35">区间</span>
                        <span class="text-right truncate tabular-nums text-white/70">
                          {{ r.period.minAmount }} – {{ r.period.maxAmount }} {{ r.product.currency }}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="hidden whitespace-nowrap px-3 py-3.5 md:table-cell md:px-5">
                  <span class="text-sm font-bold tabular-nums text-lime-300 sm:text-base">{{
                    r.annual.toFixed(2)
                  }}%</span>
                </td>
                <td class="hidden px-3 py-3.5 tabular-nums text-white/85 md:table-cell md:px-5">
                  {{ r.period.days }} 天
                </td>
                <td class="hidden px-3 py-3.5 tabular-nums text-white/70 lg:table-cell lg:px-5">
                  {{ r.period.minAmount }} – {{ r.period.maxAmount }} {{ r.product.currency }}
                </td>
                <td
                  class="max-md:block max-md:w-full max-md:px-3 max-md:pb-4 max-md:pt-3 md:table-cell md:px-5 md:py-3.5 sm:px-3"
                >
                  <button
                    v-if="r.product.status === PRODUCT_STATUS.ENABLED"
                    type="button"
                    class="inline-flex w-full min-h-[2.75rem] touch-manipulation items-center justify-center rounded-lg bg-lime-400 px-4 py-2.5 text-sm font-semibold text-black shadow-sm transition hover:bg-lime-300 max-md:w-full md:min-h-0 md:w-auto md:px-4 md:py-2 md:text-xs lg:text-sm"
                    @click="openMineDialog(r.product, r.period)"
                  >
                    立即挖矿
                  </button>
                  <button
                    v-else
                    type="button"
                    class="inline-flex w-full min-h-[2.75rem] touch-manipulation items-center justify-center rounded-lg border border-white/20 bg-transparent px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white/85 max-md:w-full md:min-h-0 md:w-auto md:px-4 md:py-2 md:text-xs lg:text-sm"
                    @click="openMineDialog(r.product, r.period)"
                  >
                    查看说明
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else class="px-3 py-12 text-center text-sm text-white/45 sm:py-14">暂无匹配档位</p>
        </div>
      </template>

      <template v-else>
        <section
          id="my-liquidity-orders"
          class="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] sm:rounded-2xl"
          aria-label="锁仓订单列表"
        >
          <div
            class="flex flex-col gap-2 border-b border-white/[0.08] bg-black/30 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4 sm:py-3 md:px-5"
          >
            <div class="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
              <p class="text-[10px] font-semibold uppercase tracking-wide text-white/40 sm:text-[11px]">订单明细</p>
              <span
                v-if="ordersForTab.length > 0"
                class="text-[11px] tabular-nums text-white/40 sm:text-xs"
              >本页共 {{ ordersForTab.length }} 条</span>
            </div>
            <div
              class="grid w-full grid-cols-2 gap-0 rounded-lg border border-white/[0.06] bg-black/40 p-0.5 sm:flex sm:w-auto sm:max-w-full sm:shrink-0 sm:overflow-x-auto sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="tablist"
              aria-label="订单状态"
            >
              <button
                type="button"
                role="tab"
                :aria-selected="orderTab === 'active'"
                class="min-h-[2.5rem] rounded-md border-b-2 border-transparent px-1 py-2 text-center text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/40 sm:min-h-0 sm:rounded-none sm:border-transparent sm:px-4 sm:pb-2.5 sm:text-left sm:text-sm sm:text-[15px]"
                :class="
                  orderTab === 'active'
                    ? 'border-b-2 border-lime-400 text-white max-sm:border-transparent max-sm:bg-white/[0.12] max-sm:text-lime-200 sm:bg-transparent'
                    : 'border-b-2 border-transparent text-white/45 hover:text-white/75 sm:text-white/45'
                "
                @click="orderTab = 'active'"
              >
                进行中
              </button>
              <button
                type="button"
                role="tab"
                :aria-selected="orderTab === 'redeemed'"
                class="min-h-[2.5rem] rounded-md border-b-2 border-transparent px-1 py-2 text-center text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/40 sm:min-h-0 sm:rounded-none sm:border-transparent sm:px-4 sm:pb-2.5 sm:text-left sm:text-sm sm:text-[15px]"
                :class="
                  orderTab === 'redeemed'
                    ? 'border-b-2 border-lime-400 text-white max-sm:border-transparent max-sm:bg-white/[0.12] max-sm:text-lime-200 sm:bg-transparent'
                    : 'border-b-2 border-transparent text-white/45 hover:text-white/75 sm:text-white/45'
                "
                @click="orderTab = 'redeemed'"
              >
                已赎回
              </button>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table
              v-if="ordersForTab.length"
              class="w-full min-w-0 border-collapse text-left text-xs text-white/85 sm:text-sm max-md:table-fixed md:min-w-[720px] md:table-auto"
            >
              <thead class="hidden md:table-header-group">
                <tr
                  class="border-b border-white/[0.08] text-[10px] font-semibold uppercase tracking-wide text-white/40 sm:text-[11px]"
                >
                  <th class="px-3 py-2.5 font-semibold md:px-5 md:py-3">产品</th>
                  <th class="hidden px-3 py-2.5 font-semibold md:table-cell md:px-5 md:py-3">期限</th>
                  <th class="hidden px-3 py-2.5 font-semibold md:table-cell md:px-5 md:py-3">下单时间</th>
                  <th class="hidden px-3 py-2.5 font-semibold md:table-cell md:px-5 md:py-3">金额</th>
                  <th class="hidden px-3 py-2.5 font-semibold md:table-cell md:px-5 md:py-3">到期</th>
                  <th class="hidden px-3 py-2.5 font-semibold lg:table-cell lg:px-5 lg:py-3">收益</th>
                  <th class="px-3 py-2.5 text-right font-semibold md:px-5 md:py-3 md:text-left">状态</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="o in ordersForTab"
                  :key="o.id"
                  class="border-b border-white/[0.06] transition hover:bg-white/[0.02] max-md:block max-md:last:border-b-0 md:table-row"
                >
                  <td class="min-w-0 max-md:block max-md:w-full max-md:px-3 max-md:pb-0 max-md:pt-4 md:table-cell md:px-5 md:py-3">
                    <p class="text-[14px] font-medium leading-snug text-white sm:text-sm">{{ o.productName }}</p>
                    <div
                      class="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-white/[0.06] pt-3 text-[11px] text-white/50 md:hidden"
                    >
                      <span class="text-white/35">期限</span>
                      <span class="text-right tabular-nums text-white/70">{{ o.lockDays }} 天</span>
                      <span class="text-white/35">下单</span>
                      <span class="text-right tabular-nums text-white/60">{{ o.lockedAt }}</span>
                      <span class="text-white/35">金额</span>
                      <span class="text-right tabular-nums text-white/80">{{ o.amount }} {{ o.currency }}</span>
                      <span class="text-white/35">到期</span>
                      <span class="text-right tabular-nums text-white/60">{{ o.unlockAt }}</span>
                      <span class="text-white/35">收益</span>
                      <span class="text-right tabular-nums text-lime-300/90">{{ o.totalInterest }} {{ o.currency }}</span>
                    </div>
                  </td>
                  <td class="hidden tabular-nums text-white/70 md:table-cell md:px-5 md:py-3">{{ o.lockDays }} 天</td>
                  <td class="hidden tabular-nums text-white/55 md:table-cell md:px-5 md:py-3">{{ o.lockedAt }}</td>
                  <td class="hidden tabular-nums md:table-cell md:px-5 md:py-3">{{ o.amount }} {{ o.currency }}</td>
                  <td class="hidden tabular-nums text-white/50 md:table-cell md:px-5 md:py-3">{{ o.unlockAt }}</td>
                  <td class="hidden tabular-nums text-lime-300/90 lg:table-cell lg:px-5 lg:py-3">
                    {{ o.totalInterest }} {{ o.currency }}
                  </td>
                  <td
                    class="max-md:block max-md:w-full max-md:px-3 max-md:pb-4 max-md:pt-3 md:table-cell md:px-5 md:py-3 md:text-left"
                  >
                    <span
                      class="inline-flex min-h-[1.75rem] items-center rounded-full px-2.5 py-1 text-[11px] font-semibold sm:text-xs"
                      :class="orderStatusClass(o.status)"
                    >
                      {{ orderStatusMeta[o.status]?.label ?? o.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="ordersForTab.length === 0" class="px-3 py-12 text-center text-sm text-white/40 sm:py-14">
            当前分类暂无订单
          </p>
        </section>
      </template>
    </div>

    <FrontPopupShell
      v-model="mineDialogOpen"
      aria-labelledby="liquidity-mine-dialog-title"
      close-on-backdrop
      @backdrop-click="closeMineDialog"
    >
      <FrontPopupCard
        v-if="mineProduct && minePeriod"
        variant="flow"
        flow-max="720"
        wide
        @click.stop
      >
        <FrontPopupCloseButton @click="closeMineDialog" />

        <div
          class="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-5 pr-11 sm:pr-12"
        >
          <div class="flex items-start gap-3">
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/15 text-2xl leading-none"
              aria-hidden="true"
            >
              {{ mineProduct.icon }}
            </div>
            <div class="min-w-0 flex-1">
              <h2 id="liquidity-mine-dialog-title" class="text-lg font-semibold leading-snug text-white">
                立即挖矿
              </h2>
              <p class="mt-2 text-sm leading-relaxed text-emerald-100/85">
                <span class="font-medium text-white/90">{{ mineProduct.name }}</span>
                <span class="mx-1.5 text-white/25">·</span>
                <span class="tabular-nums text-white/55">{{ mineProduct.currency }}</span>
                <span
                  class="ml-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold align-middle"
                  :class="statusPillClass(mineProduct.status)"
                >
                  {{ productStatusMeta[mineProduct.status]?.label ?? mineProduct.status }}
                </span>
              </p>
            </div>
          </div>

          <div
            v-if="!mineCanSubmit"
            class="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-100/90"
          >
            该产品当前不可申购，您仍可查看产品参数。
          </div>

          <dl class="mt-5 grid grid-cols-2 gap-3 text-sm sm:gap-4">
            <div class="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
              <dt class="text-[10px] font-medium uppercase tracking-wide text-white/40">参考年化</dt>
              <dd class="mt-0.5 text-lg font-bold tabular-nums text-lime-300">
                {{ mineSelectedAnnualPct.toFixed(2) }}%
              </dd>
            </div>
            <div class="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
              <dt class="text-[10px] font-medium uppercase tracking-wide text-white/40">锁仓期限</dt>
              <dd class="mt-0.5 text-lg font-semibold tabular-nums text-white">{{ minePeriod.days }} 天</dd>
            </div>
            <div class="col-span-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
              <dt class="text-[10px] font-medium uppercase tracking-wide text-white/40">单档最小申购</dt>
              <dd class="mt-0.5 font-semibold tabular-nums text-white">
                {{ minePeriod.minAmount }} {{ mineProduct.currency }}
              </dd>
            </div>
          </dl>

          <div
            v-if="mineProduct.earlyRedeemEnabled && mineProduct.earlyRedeemFee > 0"
            class="mt-4 rounded-xl border border-lime-400/25 bg-lime-400/10 px-3 py-2.5 text-center text-xs font-medium text-lime-100/90 sm:text-sm"
          >
            提前赎回手续费：约 {{ mineProduct.earlyRedeemFee }}%，以产品协议为准。
          </div>

          <ul class="mt-4 space-y-2 text-xs leading-relaxed text-white/55 sm:text-[13px]">
            <li>VIP：{{ mineMinVipLabel }}</li>
            <li>认证：{{ lockedMinKycRequirementPhrase(mineProduct.minKycLevel) }}</li>
            <li>{{ mineLimitDesc }}</li>
          </ul>

          <div v-if="mineCanSubmit" class="mt-5 border-t border-white/[0.08] pt-5">
            <label class="block">
              <span class="text-sm font-medium text-white/70">购买金额（{{ mineProduct.currency }}）</span>
              <span class="mt-0.5 block text-xs text-white/40">可用余额：{{ DEMO_AVAILABLE_FUNDS }}</span>
              <div class="mt-2 flex gap-2">
                <input
                  v-model="purchaseAmount"
                  type="text"
                  inputmode="decimal"
                  :placeholder="`最小 ${minePeriod.minAmount}`"
                  class="min-w-0 flex-1 rounded-lg border border-white/[0.12] bg-black/40 px-3 py-2.5 text-[15px] text-white placeholder:text-white/30 focus:border-lime-400/45 focus:outline-none focus:ring-2 focus:ring-lime-400/25 sm:px-4 sm:py-3"
                />
                <button
                  type="button"
                  class="shrink-0 rounded-lg border border-white/20 px-3 py-2.5 text-xs font-medium text-white/85 transition hover:bg-white/10 sm:px-4 sm:text-sm"
                  @click="fillAllPurchase"
                >
                  全部
                </button>
              </div>
            </label>
            <p class="mt-2 text-xs tabular-nums text-white/50 sm:text-sm">
              预计收益（估算）：
              <span class="font-semibold text-lime-300/90">
                {{ mineEstimatedYield.toFixed(6) }} {{ mineProduct.currency }}
              </span>
            </p>
          </div>

          <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              class="rounded-lg border border-white/20 px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10"
              @click="closeMineDialog"
            >
              关闭
            </button>
            <RouterLink
              v-if="mineCanSubmit"
              :to="{ path: `${prefix}/login`, query: { redirect: route.path } }"
              class="inline-flex items-center justify-center rounded-lg bg-lime-400 px-4 py-2.5 text-sm font-semibold text-black hover:bg-lime-300"
              @click="closeMineDialog"
            >
              立即挖矿
            </RouterLink>
          </div>
        </div>
      </FrontPopupCard>
    </FrontPopupShell>
  </div>
</template>
