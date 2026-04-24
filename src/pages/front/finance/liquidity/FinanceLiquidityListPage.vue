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

/** 与详情页演示一致 */
const DEMO_AVAILABLE_FUNDS = 5.562875

const currencyTab = ref('')
const orderTab = ref('active')
/** Hero 切换：产品列表 / 我的订单 */
const pagePanel = ref('products')

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
  <div>
    <header
      class="relative overflow-hidden border-b border-white/[0.06] bg-[#050505]"
    >
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
          <span class="text-white/70">流动性挖矿</span>
        </nav>
        <p
          class="mt-4 inline-flex items-center gap-2 rounded-full border border-lime-400/20 bg-lime-400/[0.06] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-lime-200/90 sm:mt-6 sm:px-3.5 sm:py-1 sm:text-[11px] sm:tracking-[0.3em]"
        >
          Earn · 锁仓理财
        </p>
        <h1
          class="mt-2 text-3xl font-bold tracking-tight text-white sm:mt-3 sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-tight"
        >
          流动性挖矿
        </h1>

        <div
          class="mt-5 inline-flex w-fit max-w-full rounded-xl border border-white/[0.07] bg-black/40 p-1 shadow-inner shadow-black/20 sm:mt-6"
          role="tablist"
          aria-label="页面主入口"
        >
          <button
            type="button"
            role="tab"
            :aria-selected="pagePanel === 'products'"
            class="min-h-[2.75rem] shrink-0 rounded-lg px-4 py-2.5 text-center text-sm font-semibold tracking-tight transition focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] sm:min-h-[3rem] sm:px-6 sm:py-2.5 sm:text-[15px] md:text-base"
            :class="
              pagePanel === 'products'
                ? 'bg-white/[0.1] text-lime-200 shadow-sm'
                : 'text-white/45 hover:text-white/75'
            "
            @click="pagePanel = 'products'"
          >
            挖矿产品
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="pagePanel === 'orders'"
            class="min-h-[2.75rem] shrink-0 rounded-lg px-4 py-2.5 text-center text-sm font-semibold tracking-tight transition focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] sm:min-h-[3rem] sm:px-6 sm:py-2.5 sm:text-[15px] md:text-base"
            :class="
              pagePanel === 'orders'
                ? 'bg-white/[0.1] text-lime-200 shadow-sm'
                : 'text-white/45 hover:text-white/75'
            "
            @click="pagePanel = 'orders'"
          >
            我的订单
          </button>
        </div>

        <!-- 订单状态筛选放在 Hero，避免与主 Tab 叠成「两层导航」 -->
        <div
          v-if="pagePanel === 'orders'"
          class="mt-4 flex flex-wrap items-center gap-2 sm:mt-5 sm:gap-3"
        >
          <div
            class="inline-flex w-fit max-w-full flex-wrap rounded-xl border border-white/[0.07] bg-black/40 p-1 shadow-inner shadow-black/20"
            role="tablist"
            aria-label="订单状态"
          >
            <button
              type="button"
              role="tab"
              :aria-selected="orderTab === 'active'"
              class="min-h-10 shrink-0 rounded-lg px-3 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/40 sm:min-h-[2.5rem] sm:px-4 sm:text-sm"
              :class="
                orderTab === 'active'
                  ? 'bg-white/[0.1] text-lime-200 shadow-sm'
                  : 'text-white/45 hover:text-white/75'
              "
              @click="orderTab = 'active'"
            >
              进行中
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="orderTab === 'redeemed'"
              class="min-h-10 shrink-0 rounded-lg px-3 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/40 sm:min-h-[2.5rem] sm:px-4 sm:text-sm"
              :class="
                orderTab === 'redeemed'
                  ? 'bg-white/[0.1] text-lime-200 shadow-sm'
                  : 'text-white/45 hover:text-white/75'
              "
              @click="orderTab = 'redeemed'"
            >
              已赎回
            </button>
          </div>
        </div>

        <p
          v-if="pagePanel === 'products'"
          class="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/55 sm:mt-5 sm:text-lg md:text-xl"
        >
          按币种浏览产品；每一行对应一个锁定期档位。收益为年化口径（演示数据）。
        </p>
        <p v-else class="mt-3 max-w-2xl text-xs leading-relaxed text-white/45 sm:mt-4 sm:text-[15px]">
          下方为演示列表，与真实账户无关；接入接口后将按登录用户展示。
        </p>
      </div>
    </header>

    <div
      class="mx-auto max-w-7xl px-4 sm:px-8 lg:px-10"
      :class="pagePanel === 'orders' ? 'py-4 sm:py-6 lg:py-8' : 'py-5 sm:py-8 lg:py-10'"
    >
      <template v-if="pagePanel === 'products'">
        <div class="mt-2 sm:mt-4">
          <p class="text-[10px] font-semibold uppercase tracking-wider text-white/35 sm:text-xs">按币种</p>
          <div class="-mx-0.5 mt-2.5 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
            <button
              type="button"
              class="rounded-full border px-3 py-1.5 text-xs font-medium transition sm:px-4 sm:py-2 sm:text-sm"
              :class="
                currencyTab === ''
                  ? 'border-lime-400/40 bg-lime-400/10 text-lime-200'
                  : 'border-white/[0.1] bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white/80'
              "
              @click="currencyTab = ''"
            >
              全部
            </button>
            <button
              v-for="c in currenciesFromProducts"
              :key="c"
              type="button"
              class="rounded-full border px-3 py-1.5 text-xs font-medium transition sm:px-4 sm:py-2 sm:text-sm"
              :class="
                currencyTab === c
                  ? 'border-lime-400/40 bg-lime-400/10 text-lime-200'
                  : 'border-white/[0.1] bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white/80'
              "
              @click="currencyTab = c"
            >
              {{ c }}
            </button>
          </div>
        </div>

        <div
          class="mt-6 overflow-x-auto rounded-xl border border-white/[0.08] bg-white/[0.02] sm:mt-10 sm:rounded-2xl lg:rounded-3xl"
        >
          <table class="w-full min-w-0 table-fixed border-collapse text-left text-sm md:min-w-[640px] md:table-auto">
            <thead>
              <tr class="border-b border-white/[0.08] bg-white/[0.04] text-[10px] font-semibold uppercase tracking-wide text-white/45 sm:text-[11px]">
                <th class="w-[58%] px-3 py-2.5 font-semibold sm:w-[52%] sm:px-4 sm:py-3 md:w-auto md:px-5 md:py-3.5">
                  产品
                </th>
                <th class="hidden px-3 py-2.5 font-semibold md:table-cell md:px-4 md:py-3.5">参考年化</th>
                <th class="hidden px-3 py-2.5 font-semibold md:table-cell md:px-4 md:py-3.5">期限</th>
                <th class="hidden px-4 py-3.5 font-semibold lg:table-cell">申购区间</th>
                <th class="w-[42%] px-2 py-2.5 text-right font-semibold sm:w-auto sm:px-3 sm:py-3 md:px-5 md:py-3.5">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="r in periodRows"
                :key="r.key"
                class="border-b border-white/[0.05] transition hover:bg-white/[0.03]"
              >
                <td class="px-3 py-3 align-top sm:px-4 sm:py-3.5 md:px-5 md:py-4">
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
                        class="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 border-t border-white/[0.06] pt-2 text-[11px] text-white/50 md:hidden"
                      >
                        <span class="font-bold tabular-nums text-lime-300">{{ r.annual.toFixed(2) }}%</span>
                        <span class="tabular-nums text-white/70">{{ r.period.days }} 天</span>
                        <span class="w-full truncate tabular-nums text-white/40">
                          {{ r.period.minAmount }} – {{ r.period.maxAmount }} {{ r.product.currency }}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="hidden px-3 py-3 align-middle md:table-cell md:px-4 md:py-4">
                  <span class="text-sm font-bold tabular-nums text-lime-300 sm:text-base">{{
                    r.annual.toFixed(2)
                  }}%</span>
                </td>
                <td class="hidden px-3 py-3 tabular-nums text-white/85 md:table-cell md:px-4 md:py-4">
                  {{ r.period.days }} 天
                </td>
                <td class="hidden px-4 py-4 tabular-nums text-white/50 lg:table-cell">
                  {{ r.period.minAmount }} – {{ r.period.maxAmount }} {{ r.product.currency }}
                </td>
                <td class="px-2 py-3 align-middle text-right sm:px-3 sm:py-3.5 md:px-5 md:py-4">
                  <button
                    v-if="r.product.status === PRODUCT_STATUS.ENABLED"
                    type="button"
                    class="inline-flex min-h-[2.25rem] min-w-[4.25rem] items-center justify-center rounded-lg bg-lime-400 px-2.5 py-1.5 text-[11px] font-semibold text-black shadow-sm transition hover:bg-lime-300 sm:min-h-0 sm:min-w-0 sm:rounded-xl sm:px-4 sm:py-2 sm:text-xs md:text-sm"
                    @click="openMineDialog(r.product, r.period)"
                  >
                    <span class="sm:hidden">挖矿</span>
                    <span class="hidden sm:inline">立即挖矿</span>
                  </button>
                  <button
                    v-else
                    type="button"
                    class="inline-flex min-h-[2.25rem] min-w-[4.25rem] items-center justify-center rounded-lg border border-white/20 bg-transparent px-2.5 py-1.5 text-[11px] font-semibold text-white/70 transition hover:bg-white/10 hover:text-white/85 sm:min-h-0 sm:min-w-0 sm:rounded-xl sm:px-4 sm:py-2 sm:text-xs md:text-sm"
                    @click="openMineDialog(r.product, r.period)"
                  >
                    <span class="sm:hidden">查看</span>
                    <span class="hidden sm:inline">查看说明</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p v-if="periodRows.length === 0" class="py-12 text-center text-sm text-white/45 sm:py-16 sm:text-base">
          暂无匹配档位
        </p>
      </template>

      <section
        v-else
        id="my-liquidity-orders"
        class="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] sm:rounded-2xl lg:rounded-3xl"
        aria-label="锁仓订单列表"
      >
        <div
          v-if="ordersForTab.length > 0"
          class="flex items-center justify-end border-b border-white/[0.06] bg-white/[0.02] px-3 py-2 sm:px-4 sm:py-2.5 lg:px-5"
        >
          <span class="text-[11px] tabular-nums text-white/40 sm:text-xs">本页 {{ ordersForTab.length }} 条（演示）</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left text-xs sm:text-sm md:min-w-[640px] lg:min-w-[720px]">
            <thead>
              <tr
                class="border-b border-white/[0.06] bg-white/[0.03] text-[10px] font-semibold uppercase tracking-wide text-white/40 sm:text-[11px]"
              >
                <th class="max-w-[9.5rem] px-2.5 py-2 font-semibold sm:max-w-[14rem] sm:px-3 sm:py-2.5 md:max-w-none md:px-4 md:py-3">
                  产品
                </th>
                <th class="whitespace-nowrap px-1.5 py-2 font-semibold sm:px-3 sm:py-2.5 md:px-4 md:py-3">期限</th>
                <th class="hidden whitespace-nowrap px-2 py-2 font-semibold sm:table-cell sm:px-3 sm:py-2.5 md:px-4 md:py-3">
                  下单时间
                </th>
                <th class="whitespace-nowrap px-2 py-2 font-semibold sm:px-3 sm:py-2.5 md:px-4 md:py-3">金额</th>
                <th class="hidden whitespace-nowrap px-2 py-2 font-semibold md:table-cell md:px-4 md:py-3">到期</th>
                <th class="hidden whitespace-nowrap px-2 py-2 font-semibold lg:table-cell lg:px-4 lg:py-3">收益</th>
                <th class="whitespace-nowrap px-1.5 py-2 text-right font-semibold sm:px-3 sm:py-2.5 sm:text-left md:px-4 md:py-3">
                  状态
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in ordersForTab" :key="o.id" class="border-b border-white/[0.05]">
                <td class="min-w-0 px-2.5 py-2.5 text-[13px] text-white/90 sm:px-3 sm:py-3 sm:text-sm md:px-4">
                  <span class="line-clamp-2 break-words leading-snug">{{ o.productName }}</span>
                </td>
                <td class="px-1.5 py-2.5 tabular-nums text-white/70 sm:px-3 sm:py-3 md:px-4">{{ o.lockDays }} 天</td>
                <td class="hidden whitespace-nowrap px-2 py-2.5 tabular-nums text-white/50 sm:table-cell sm:px-3 sm:py-3 md:px-4">
                  {{ o.lockedAt }}
                </td>
                <td class="whitespace-nowrap px-2 py-2.5 tabular-nums text-white/70 sm:px-3 sm:py-3 md:px-4">
                  {{ o.amount }} {{ o.currency }}
                </td>
                <td class="hidden whitespace-nowrap px-2 py-2.5 tabular-nums text-white/50 md:table-cell md:px-4 md:py-3">
                  {{ o.unlockAt }}
                </td>
                <td class="hidden whitespace-nowrap px-2 py-2.5 tabular-nums text-lime-300/90 lg:table-cell lg:px-4 lg:py-3">
                  {{ o.totalInterest }} {{ o.currency }}
                </td>
                <td class="px-1.5 py-2.5 text-right sm:px-3 sm:py-3 sm:text-left md:px-4">
                  <span
                    class="inline-flex max-w-full justify-end rounded-full px-1.5 py-0.5 text-[10px] font-semibold sm:justify-start sm:px-2 sm:text-[11px]"
                    :class="orderStatusClass(o.status)"
                  >
                    {{ orderStatusMeta[o.status]?.label ?? o.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="ordersForTab.length === 0" class="py-10 text-center text-xs text-white/40 sm:py-14 sm:text-sm">
          当前分类暂无订单
        </p>
      </section>
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
            该产品当前不可申购，仅可查看参数（演示）。
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
            提前赎回手续费：约 {{ mineProduct.earlyRedeemFee }}%（演示）
          </div>

          <ul class="mt-4 space-y-2 text-xs leading-relaxed text-white/55 sm:text-[13px]">
            <li>VIP：{{ mineMinVipLabel }}</li>
            <li>认证：{{ lockedMinKycRequirementPhrase(mineProduct.minKycLevel) }}</li>
            <li>{{ mineLimitDesc }}</li>
          </ul>

          <div v-if="mineCanSubmit" class="mt-5 border-t border-white/[0.08] pt-5">
            <label class="block">
              <span class="text-sm font-medium text-white/70">购买金额（{{ mineProduct.currency }}）</span>
              <span class="mt-0.5 block text-xs text-white/40">演示可用资金：{{ DEMO_AVAILABLE_FUNDS }}</span>
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
              预计收益（演示）：
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
