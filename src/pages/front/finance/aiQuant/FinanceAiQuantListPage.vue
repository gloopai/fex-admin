<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import FrontPopupCard from '../../../../components/front/FrontPopupCard.vue'
import FrontPopupCloseButton from '../../../../components/front/FrontPopupCloseButton.vue'
import FrontPopupShell from '../../../../components/front/FrontPopupShell.vue'
import FrontStrokeIcon from '../../../../components/front/FrontStrokeIcon.vue'
import {
  createAiQuantProductsMock,
  createAiQuantOrdersMock,
  createYieldAdjustmentsMock
} from '../../../../admin/mock/aiQuant'
import {
  PRODUCT_STATUS,
  productStatusMeta,
  ORDER_STATUS,
  orderStatusMeta,
  SETTLEMENT_PERIOD,
  settlementPeriodMeta,
  adjustmentTypeMeta
} from '../../../../admin/constants/aiQuant'

const prefix = '/front'
const route = useRoute()

/** 顶部币种 Tab（与设计稿一致；无产品币种仍可切换，列表为空） */
const TAB_CURRENCIES = ['USDC', 'BTC', 'ETH', 'DOGE', 'XRP', 'SOL', 'BNB', 'TRX']

const products = ref(createAiQuantProductsMock())
const orders = ref(createAiQuantOrdersMock())
const yieldAdjustments = ref(createYieldAdjustmentsMock())

const currencyTab = ref('USDT')

watch(
  products,
  (list) => {
    const withProd = TAB_CURRENCIES.find((c) => list.some((p) => productCurrencyMatchesTab(p.currency, c)))
    if (withProd) currencyTab.value = withProd
  },
  { immediate: true }
)

function productCurrencyMatchesTab(productCurrency, tab) {
  const pc = String(productCurrency || '').toUpperCase()
  const t = String(tab || '').toUpperCase()
  if (t === 'USDC') return pc === 'USDC' || pc === 'USDT'
  return pc === t
}

const productsForTab = computed(() =>
  products.value.filter((p) => productCurrencyMatchesTab(p.currency, currencyTab.value))
)

const vipBadgeRing = [
  'border-violet-400/40 bg-violet-500/15 text-violet-100',
  'border-fuchsia-400/35 bg-fuchsia-500/12 text-fuchsia-100',
  'border-lime-400/35 bg-lime-400/12 text-lime-100',
  'border-amber-400/35 bg-amber-500/15 text-amber-100'
]

function vipBadgeClass(i) {
  return vipBadgeRing[i % vipBadgeRing.length]
}

/** 分档行：每个产品 × 档位 → 一行「机器人」租用入口 */
const tierRows = computed(() => {
  const rows = []
  for (const p of productsForTab.value) {
    const tiers = p.tiers || []
    tiers.forEach((tier, idx) => {
      const vipNum = Math.min(9, (Number(p.minVipLevel) || 0) + idx + 1)
      rows.push({
        rowKey: `${p.id}-${idx}`,
        product: p,
        tier,
        tierIndex: idx,
        vipLabel: `VIP.${vipNum}`
      })
    })
  }
  return rows
})

function cycleLabel(p) {
  if (p.settlementPeriod === SETTLEMENT_PERIOD.CUSTOM && p.customDays) {
    return `${p.customDays} 天`
  }
  const m = settlementPeriodMeta[p.settlementPeriod]
  if (p.settlementPeriod === SETTLEMENT_PERIOD.DAILY) {
    return '无限期'
  }
  return m?.label?.replace('结算', '') ?? '—'
}

function formatAmountSpan(min, max, currency) {
  const a = Number(min)
  const b = Number(max)
  if (!Number.isFinite(a) || !Number.isFinite(b)) return '—'
  return `${formatCompact(a)} ~ ${formatCompact(b)} ${currency}`
}

function formatCompact(n) {
  const v = Number(n)
  if (!Number.isFinite(v)) return '—'
  const abs = Math.abs(v)
  if (abs >= 1e9) return `${(v / 1e9).toFixed(2)}B`
  if (abs >= 1e6) return `${(v / 1e6).toFixed(2)}M`
  if (abs >= 1e3) return `${(v / 1e3).toFixed(2)}K`
  if (abs >= 1 && abs < 1e3) return v.toLocaleString(undefined, { maximumFractionDigits: 2 })
  return String(v)
}

function displayCurrency(tab) {
  return tab === 'USDC' ? 'USDC' : tab
}

const ordersForTabCurrency = computed(() =>
  orders.value.filter((o) => productCurrencyMatchesTab(o.currency, currencyTab.value))
)

const runningOrdersTab = computed(() =>
  ordersForTabCurrency.value.filter((o) => o.status === ORDER_STATUS.RUNNING)
)

const custodyPrincipal = computed(() =>
  runningOrdersTab.value.reduce((s, o) => s + (Number(o.principal) || 0), 0)
)

const expectedDailyTab = computed(() =>
  runningOrdersTab.value.reduce((s, o) => s + (Number(o.expectedDailyYield) || 0), 0)
)

const accumulatedYieldTab = computed(() =>
  ordersForTabCurrency.value.reduce((s, o) => s + (Number(o.accumulatedYield) || 0), 0)
)

const custodyOrderCount = computed(() => runningOrdersTab.value.length)

function formatAmountForTab(n, currency) {
  const v = Number(n)
  if (!Number.isFinite(v)) return '0'
  const dec = currency === 'BTC' || currency === 'ETH' ? 4 : 2
  return v.toLocaleString(undefined, { maximumFractionDigits: dec })
}

const recordTab = ref('buy')

const buyOrders = computed(() =>
  ordersForTabCurrency.value.filter(
    (o) =>
      o.status === ORDER_STATUS.RUNNING ||
      o.status === ORDER_STATUS.COMPLETED ||
      o.status === ORDER_STATUS.SETTLED ||
      o.status === ORDER_STATUS.LOCKED
  )
)

const redeemOrders = computed(() =>
  ordersForTabCurrency.value.filter((o) => o.status === ORDER_STATUS.EARLY_REDEEMED)
)

const interestRows = computed(() => yieldAdjustments.value.filter((a) => productCurrencyMatchesTab(a.currency, currencyTab.value)))

function orderStatusPillClass(status) {
  if (status === ORDER_STATUS.RUNNING) return 'bg-sky-400/15 text-sky-200'
  if (status === ORDER_STATUS.COMPLETED) return 'bg-lime-400/12 text-lime-200'
  if (status === ORDER_STATUS.SETTLED) return 'bg-white/10 text-white/60'
  if (status === ORDER_STATUS.EARLY_REDEEMED) return 'bg-violet-500/15 text-violet-200'
  if (status === ORDER_STATUS.LOCKED) return 'bg-amber-400/15 text-amber-200'
  if (status === ORDER_STATUS.CANCELLED) return 'bg-rose-400/15 text-rose-200'
  return 'bg-white/10 text-white/55'
}

function productRentable(p) {
  return p.status === PRODUCT_STATUS.ENABLED
}

/** 展示用币种（Tab 为 USDC 时 USDT 产品显示为 USDC） */
function displayAssetCurrency(productCurrency) {
  const c = String(productCurrency || '').toUpperCase()
  if (c === 'USDT') return 'USDC'
  return c || '—'
}

function distributionLabel(p) {
  if (!p) return '—'
  if (p.settlementPeriod === SETTLEMENT_PERIOD.DAILY) return '每天'
  if (p.settlementPeriod === SETTLEMENT_PERIOD.WEEKLY) return '每周'
  if (p.settlementPeriod === SETTLEMENT_PERIOD.MONTHLY) return '每月'
  if (p.settlementPeriod === SETTLEMENT_PERIOD.CUSTOM && p.customDays) {
    return `每 ${p.customDays} 天`
  }
  return settlementPeriodMeta[p.settlementPeriod]?.label ?? '—'
}

function formatValueDateUtc8() {
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
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')} (UTC+8)`
}

function formatTierAmountPlain(min, max, productCurrency) {
  const cur = displayAssetCurrency(productCurrency)
  const a = Number(min)
  const b = Number(max)
  if (!Number.isFinite(a) || !Number.isFinite(b)) return `— ${cur}`
  return `${a} ~ ${b} ${cur}`
}

/** 立即租用弹窗 */
const rentOpen = ref(false)
const rentRow = ref(null)
const rentAmount = ref('')
let clearRentTimer = null

/** 演示可用余额（与币种相关） */
const demoAvailableBalance = {
  USDT: 5.562875,
  USDC: 5.562875,
  BTC: 0.015628,
  ETH: 1.2482,
  BNB: 12.905,
  SOL: 48.33,
  DOGE: 10240.5,
  XRP: 888.2,
  TRX: 22000
}

const rentAvailable = computed(() => {
  const p = rentRow.value?.product
  if (!p?.currency) return 0
  const key = String(p.currency).toUpperCase()
  return demoAvailableBalance[key] ?? 0
})

function openRentDialog(row) {
  if (clearRentTimer != null) {
    clearTimeout(clearRentTimer)
    clearRentTimer = null
  }
  rentRow.value = row
  rentAmount.value = ''
  rentOpen.value = true
}

function closeRentDialog() {
  rentOpen.value = false
}

function onRentEscape(e) {
  if (e.key === 'Escape' && rentOpen.value) closeRentDialog()
}

watch(rentOpen, (open) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = open ? 'hidden' : ''
  if (typeof window === 'undefined') return
  if (open) {
    if (clearRentTimer != null) {
      clearTimeout(clearRentTimer)
      clearRentTimer = null
    }
    window.addEventListener('keydown', onRentEscape)
  } else {
    window.removeEventListener('keydown', onRentEscape)
    if (clearRentTimer != null) clearTimeout(clearRentTimer)
    clearRentTimer = window.setTimeout(() => {
      rentRow.value = null
      rentAmount.value = ''
      clearRentTimer = null
    }, 360)
  }
})

onUnmounted(() => {
  if (clearRentTimer != null) clearTimeout(clearRentTimer)
  if (typeof document !== 'undefined') document.body.style.overflow = ''
  if (typeof window !== 'undefined') window.removeEventListener('keydown', onRentEscape)
})

function fillRentAll() {
  const row = rentRow.value
  if (!row?.tier) return
  rentAmount.value = String(row.tier.maxAmount ?? '')
}
</script>

<template>
  <div class="min-h-[calc(100dvh-3.5rem)] bg-[#050505] pb-8 lg:pb-10">
    <header class="relative overflow-hidden border-b border-white/[0.06] bg-[#050505]">
      <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          class="absolute -left-1/4 top-0 h-[20rem] w-[20rem] rounded-full bg-violet-500/[0.07] blur-[100px] sm:h-[26rem] sm:w-[26rem]"
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
          <span class="text-white/70">AI 量化</span>
        </nav>

        <div class="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div class="min-w-0 flex-1">
            <p
              class="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-violet-200/95 sm:text-[11px] sm:tracking-[0.3em]"
            >
              Quant · 策略托管
            </p>
            <h1
              class="mt-2 text-3xl font-bold tracking-tight text-white sm:mt-3 sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-tight"
            >
              AI 量化交易
            </h1>
            <p class="mt-3 max-w-xl text-sm leading-relaxed text-white/50 sm:text-base">
              托管机器人分档租用；日收益率与区间为演示配置。主色强调收益，紫罗兰用于操作与装饰。
            </p>

            <div class="mt-6 border-t border-white/[0.08] pt-6">
              <p class="text-xs font-medium text-white/40">托管金额（{{ displayCurrency(currencyTab) }}）</p>
              <p class="mt-1 text-3xl font-bold tabular-nums tracking-tight text-white sm:text-4xl">
                {{
                  runningOrdersTab.length
                    ? formatAmountForTab(custodyPrincipal, currencyTab)
                    : '0'
                }}
              </p>
              <div class="mt-5 grid grid-cols-3 gap-3 sm:mt-6 sm:gap-6">
                <div>
                  <p class="text-[11px] text-white/40">预计日收益</p>
                  <p class="mt-1 text-sm font-semibold tabular-nums text-lime-200/95 sm:text-base">
                    {{
                      runningOrdersTab.length
                        ? formatAmountForTab(expectedDailyTab, currencyTab)
                        : '0'
                    }}
                  </p>
                </div>
                <div>
                  <p class="text-[11px] text-white/40">累计收益</p>
                  <p class="mt-1 text-sm font-semibold tabular-nums text-lime-200/90 sm:text-base">
                    {{ formatAmountForTab(accumulatedYieldTab, currencyTab) }}
                  </p>
                </div>
                <div>
                  <p class="text-[11px] text-white/40">订单托管</p>
                  <p class="mt-1 text-sm font-semibold tabular-nums text-white sm:text-base">
                    {{ custodyOrderCount }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- 装饰轨道 -->
          <div
            class="pointer-events-none relative mx-auto h-40 w-40 shrink-0 opacity-90 sm:h-44 sm:w-44 lg:mx-0 lg:h-48 lg:w-48"
            aria-hidden="true"
          >
            <div
              class="absolute inset-0 rounded-full border border-violet-500/20 bg-gradient-to-br from-violet-600/20 via-transparent to-sky-500/10"
            />
            <div
              class="absolute inset-[18%] rounded-full border border-white/[0.06] bg-violet-500/[0.06]"
            />
            <div
              class="absolute inset-[38%] rounded-full border border-lime-400/15 bg-lime-400/[0.04]"
            />
            <div
              class="absolute -right-1 top-1/4 h-16 w-16 rounded-full bg-violet-400/20 blur-2xl"
            />
          </div>
        </div>
      </div>
    </header>

    <div class="mx-auto max-w-7xl px-4 py-5 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
      <!-- 币种 Tab -->
      <div class="flex flex-wrap items-center gap-2">
        <p class="w-full text-[10px] font-semibold uppercase tracking-wider text-white/35 sm:hidden">资产</p>
        <div
          class="inline-flex max-w-full shrink-0 flex-nowrap gap-1 overflow-x-auto rounded-xl border border-white/[0.08] bg-black/35 p-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="托管币种"
        >
          <button
            v-for="c in TAB_CURRENCIES"
            :key="c"
            type="button"
            role="tab"
            :aria-selected="currencyTab === c"
            class="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40 sm:px-4 sm:text-sm"
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

      <!-- 机器人分档表 -->
      <div
        class="mt-6 overflow-x-auto rounded-xl border border-white/[0.08] bg-white/[0.025] sm:mt-8 sm:rounded-2xl"
      >
        <table
          v-if="tierRows.length"
          class="w-full min-w-0 table-fixed border-collapse text-left text-sm text-white/90 md:min-w-[720px] md:table-auto"
        >
          <thead>
            <tr
              class="border-b border-white/[0.08] text-[10px] font-semibold uppercase tracking-wide text-white/40 sm:text-[11px]"
            >
              <th class="w-[52%] px-3 py-2.5 font-semibold sm:px-4 md:w-auto md:px-5 md:py-3">产品名称</th>
              <th class="hidden px-3 py-2.5 font-semibold md:table-cell md:px-5 md:py-3">周期</th>
              <th class="hidden px-3 py-2.5 font-semibold md:table-cell md:px-5 md:py-3">价格</th>
              <th class="hidden px-3 py-2.5 font-semibold md:table-cell md:px-5 md:py-3">日收益率</th>
              <th class="w-[48%] px-2 py-2.5 text-right font-semibold sm:px-3 md:w-auto md:px-5 md:py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in tierRows"
              :key="row.rowKey"
              class="border-b border-white/[0.05] transition hover:bg-white/[0.03]"
            >
              <td class="px-3 py-3 align-top sm:px-4 md:px-5 md:py-3.5">
                <div class="flex items-start gap-2.5 sm:gap-3">
                  <span
                    class="shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-bold tabular-nums sm:text-[10px]"
                    :class="vipBadgeClass(row.tierIndex)"
                  >
                    {{ row.vipLabel }}
                  </span>
                  <div class="flex min-w-0 flex-1 items-start gap-2">
                    <span
                      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.02] text-violet-300/90"
                    >
                      <FrontStrokeIcon name="cpu" size-class="h-4 w-4 sm:h-[1.125rem] sm:w-[1.125rem]" />
                    </span>
                    <div class="min-w-0 flex-1">
                      <p class="text-[15px] font-semibold leading-snug text-white sm:text-base">
                        {{ displayCurrency(currencyTab) }} 机器人
                      </p>
                      <p class="mt-0.5 truncate text-[11px] text-white/40 sm:text-xs">
                        {{ row.product.name }} · {{ productStatusMeta[row.product.status]?.label }}
                      </p>
                      <div
                        class="mt-2 flex flex-col gap-1 border-t border-white/[0.06] pt-2 text-[11px] text-white/50 md:hidden"
                      >
                        <span>周期 {{ cycleLabel(row.product) }}</span>
                        <span class="tabular-nums">{{
                          formatAmountSpan(row.tier.minAmount, row.tier.maxAmount, row.product.currency)
                        }}</span>
                        <span class="font-semibold text-lime-300/90 tabular-nums">{{ row.tier.dailyRate }}% 日</span>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
              <td class="hidden whitespace-nowrap px-3 py-3.5 text-white/75 md:table-cell md:px-5">
                {{ cycleLabel(row.product) }}
              </td>
              <td class="hidden px-3 py-3.5 tabular-nums text-white/70 md:table-cell md:px-5">
                {{ formatAmountSpan(row.tier.minAmount, row.tier.maxAmount, row.product.currency) }}
              </td>
              <td class="hidden px-3 py-3.5 font-semibold tabular-nums text-lime-300/95 md:table-cell md:px-5">
                {{ row.tier.dailyRate }}%
              </td>
              <td class="px-2 py-3 align-middle text-right sm:px-3 md:px-5 md:py-3.5">
                <button
                  v-if="productRentable(row.product)"
                  type="button"
                  class="inline-flex min-h-[2.25rem] min-w-[5.5rem] items-center justify-center rounded-lg bg-violet-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-violet-400 sm:min-h-0 sm:min-w-0 sm:px-4 sm:py-2 sm:text-xs md:text-sm"
                  @click="openRentDialog(row)"
                >
                  立即租用
                </button>
                <span
                  v-else
                  class="inline-flex min-h-[2.25rem] items-center justify-end text-[11px] text-white/40 sm:min-h-0 sm:text-xs"
                >
                  {{ productStatusMeta[row.product.status]?.label }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="py-12 text-center text-sm text-white/45 sm:py-14">暂无该币种机器人（演示）</p>
      </div>

      <!-- 记录区 -->
      <section class="mt-10 sm:mt-12">
        <div
          class="inline-flex w-fit max-w-full shrink-0 flex-nowrap gap-0 overflow-x-auto border-b border-white/[0.08] [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="记录类型"
        >
          <button
            type="button"
            role="tab"
            :aria-selected="recordTab === 'buy'"
            class="shrink-0 border-b-2 border-transparent px-3 pb-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40 sm:px-4"
            :class="
              recordTab === 'buy'
                ? 'border-violet-400 text-white'
                : 'text-white/45 hover:text-white/75'
            "
            @click="recordTab = 'buy'"
          >
            购买
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="recordTab === 'redeem'"
            class="shrink-0 border-b-2 border-transparent px-3 pb-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40 sm:px-4"
            :class="
              recordTab === 'redeem'
                ? 'border-violet-400 text-white'
                : 'text-white/45 hover:text-white/75'
            "
            @click="recordTab = 'redeem'"
          >
            赎回
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="recordTab === 'interest'"
            class="shrink-0 border-b-2 border-transparent px-3 pb-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40 sm:px-4"
            :class="
              recordTab === 'interest'
                ? 'border-violet-400 text-white'
                : 'text-white/45 hover:text-white/75'
            "
            @click="recordTab = 'interest'"
          >
            利息
          </button>
        </div>

        <div
          class="mt-4 overflow-x-auto rounded-xl border border-white/[0.08] bg-white/[0.02] sm:rounded-2xl"
        >
          <!-- 购买 -->
          <table
            v-if="recordTab === 'buy' && buyOrders.length"
            class="w-full min-w-0 table-fixed border-collapse text-left text-xs text-white/85 sm:text-sm md:min-w-[880px] md:table-auto"
          >
            <thead>
              <tr class="border-b border-white/[0.08] text-[10px] font-semibold uppercase tracking-wide text-white/40">
                <th class="w-[26%] px-2.5 py-2.5 sm:px-3 md:w-auto md:px-5">产品名称</th>
                <th class="hidden px-3 py-2.5 md:table-cell md:px-5">购买时间</th>
                <th class="hidden px-3 py-2.5 lg:table-cell lg:px-5">结束时间</th>
                <th class="hidden px-3 py-2.5 md:table-cell md:px-5">支付金额</th>
                <th class="hidden px-3 py-2.5 lg:table-cell lg:px-5">累计收益</th>
                <th class="hidden px-3 py-2.5 md:table-cell md:px-5">日收益</th>
                <th class="w-[74%] px-2.5 py-2.5 text-right sm:w-auto sm:px-3 sm:text-left md:px-5">状态</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="o in buyOrders"
                :key="o.id"
                class="border-b border-white/[0.05] hover:bg-white/[0.02]"
              >
                <td class="min-w-0 px-2.5 py-2.5 sm:px-3 md:px-5 md:py-3">
                  <p class="line-clamp-2 text-[13px] font-medium leading-snug text-white sm:text-sm">
                    {{ o.productName }}
                  </p>
                  <div
                    class="mt-1.5 space-y-0.5 border-t border-white/[0.06] pt-1.5 text-[10px] text-white/45 md:hidden"
                  >
                    <p>购买 {{ o.startDate }} · 结束 {{ o.endDate }}</p>
                    <p class="tabular-nums">
                      支付 {{ o.principal }} {{ o.currency }} · 累计收益 {{ o.accumulatedYield }} · 日
                      {{ o.expectedDailyYield }}
                    </p>
                  </div>
                </td>
                <td class="hidden tabular-nums text-white/55 md:table-cell md:px-5 md:py-3">{{ o.startDate }}</td>
                <td class="hidden tabular-nums text-white/55 lg:table-cell lg:px-5 lg:py-3">{{ o.endDate }}</td>
                <td class="hidden tabular-nums md:table-cell md:px-5 md:py-3">
                  {{ o.principal }} {{ o.currency }}
                </td>
                <td class="hidden tabular-nums text-lime-200/90 lg:table-cell lg:px-5 lg:py-3">
                  {{ o.accumulatedYield }}
                </td>
                <td class="hidden tabular-nums text-white/60 md:table-cell md:px-5 md:py-3">
                  {{ o.expectedDailyYield }}
                </td>
                <td class="px-2.5 py-2.5 text-right align-top sm:px-3 sm:text-left md:px-5 md:py-3">
                  <span
                    class="inline-block max-w-[9rem] rounded-full px-2 py-0.5 text-[10px] font-semibold sm:max-w-none sm:text-xs md:px-2.5"
                    :class="orderStatusPillClass(o.status)"
                  >
                    {{ orderStatusMeta[o.status]?.label ?? o.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <p
            v-else-if="recordTab === 'buy'"
            class="py-14 text-center text-sm text-white/40"
          >
            暂无数据
          </p>

          <!-- 赎回 -->
          <table
            v-else-if="recordTab === 'redeem' && redeemOrders.length"
            class="w-full min-w-0 table-fixed border-collapse text-left text-xs text-white/85 sm:text-sm md:min-w-[640px] md:table-auto"
          >
            <thead>
              <tr class="border-b border-white/[0.08] text-[10px] font-semibold uppercase tracking-wide text-white/40">
                <th class="w-[40%] px-2.5 py-2.5 sm:px-3 md:w-auto md:px-5">产品名称</th>
                <th class="hidden px-3 py-2.5 md:table-cell md:px-5">赎回时间</th>
                <th class="hidden px-3 py-2.5 md:table-cell md:px-5">本金</th>
                <th class="w-[60%] px-2.5 py-2.5 text-right sm:w-auto sm:px-3 sm:text-left md:px-5">状态</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="o in redeemOrders"
                :key="o.id"
                class="border-b border-white/[0.05] hover:bg-white/[0.02]"
              >
                <td class="min-w-0 px-2.5 py-2.5 sm:px-3 md:px-5 md:py-3">
                  <p class="font-medium text-white">{{ o.productName }}</p>
                  <p class="mt-1 text-[10px] text-white/45 md:hidden">
                    {{ o.settledAt || o.endDate }} · {{ o.principal }} {{ o.currency }}
                  </p>
                </td>
                <td class="hidden tabular-nums text-white/55 md:table-cell md:px-5 md:py-3">
                  {{ o.settledAt || '—' }}
                </td>
                <td class="hidden tabular-nums md:table-cell md:px-5 md:py-3">
                  {{ o.principal }} {{ o.currency }}
                </td>
                <td class="px-2.5 py-2.5 text-right sm:px-3 sm:text-left md:px-5 md:py-3">
                  <span
                    class="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-xs"
                    :class="orderStatusPillClass(o.status)"
                  >
                    {{ orderStatusMeta[o.status]?.label ?? o.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <p
            v-else-if="recordTab === 'redeem'"
            class="py-14 text-center text-sm text-white/40"
          >
            暂无数据
          </p>

          <!-- 利息 / 调整 -->
          <table
            v-else-if="recordTab === 'interest' && interestRows.length"
            class="w-full min-w-0 table-fixed border-collapse text-left text-xs text-white/85 sm:text-sm md:min-w-[720px] md:table-auto"
          >
            <thead>
              <tr class="border-b border-white/[0.08] text-[10px] font-semibold uppercase tracking-wide text-white/40">
                <th class="w-[36%] px-2.5 py-2.5 sm:px-3 md:w-auto md:px-5">说明</th>
                <th class="hidden px-3 py-2.5 md:table-cell md:px-5">类型</th>
                <th class="hidden px-3 py-2.5 md:table-cell md:px-5">金额</th>
                <th class="hidden px-3 py-2.5 lg:table-cell lg:px-5">时间</th>
                <th class="w-[64%] px-2.5 py-2.5 text-right sm:w-auto sm:px-3 sm:text-left md:px-5">关联</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="a in interestRows"
                :key="a.id"
                class="border-b border-white/[0.05] hover:bg-white/[0.02]"
              >
                <td class="min-w-0 px-2.5 py-2.5 sm:px-3 md:px-5 md:py-3">
                  <p class="line-clamp-2 text-[13px] text-white sm:text-sm">{{ a.reason }}</p>
                  <p class="mt-1 text-[10px] text-white/40 md:hidden">
                    {{ adjustmentTypeMeta[a.type]?.label }} · {{ a.amount }}{{ a.currency ? ` ${a.currency}` : '' }}
                    · {{ a.createdAt }}
                  </p>
                </td>
                <td class="hidden md:table-cell md:px-5 md:py-3">
                  {{ adjustmentTypeMeta[a.type]?.label ?? a.type }}
                </td>
                <td class="hidden tabular-nums md:table-cell md:px-5 md:py-3">
                  {{ a.amount }}{{ a.currency ? ` ${a.currency}` : a.percentage != null ? ` (${a.percentage}%)` : '' }}
                </td>
                <td class="hidden tabular-nums text-white/50 lg:table-cell lg:px-5 lg:py-3">{{ a.createdAt }}</td>
                <td class="px-2.5 py-2.5 text-right text-[11px] text-white/50 sm:px-3 sm:text-left md:px-5 md:py-3">
                  {{ a.productName || a.orderId || '—' }}
                </td>
              </tr>
            </tbody>
          </table>
          <p
            v-else-if="recordTab === 'interest'"
            class="py-14 text-center text-sm text-white/40"
          >
            暂无数据
          </p>
        </div>
      </section>
    </div>

    <FrontPopupShell
      v-model="rentOpen"
      aria-labelledby="ai-quant-rent-dialog-title"
      close-on-backdrop
      @backdrop-click="closeRentDialog"
    >
      <FrontPopupCard v-if="rentRow" variant="flow" flow-max="680" wide @click.stop>
        <FrontPopupCloseButton @click="closeRentDialog" />

        <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden border-b border-white/10">
          <div class="shrink-0 px-4 pb-3 pt-5 pr-11 sm:px-5 sm:pr-12">
            <h2 id="ai-quant-rent-dialog-title" class="text-lg font-semibold text-white">产品详情</h2>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-1 sm:px-5 sm:pb-6">
            <dl class="space-y-0 divide-y divide-white/[0.06] text-sm">
              <div class="flex items-center justify-between gap-3 py-2.5 first:pt-0">
                <dt class="shrink-0 text-white/45">机器人</dt>
                <dd class="text-right font-medium text-violet-300">
                  {{ displayAssetCurrency(rentRow.product.currency) }} 机器人
                </dd>
              </div>
              <div class="flex items-center justify-between gap-3 py-2.5">
                <dt class="shrink-0 text-white/45">金额</dt>
                <dd class="text-right tabular-nums text-white">
                  {{
                    formatTierAmountPlain(
                      rentRow.tier.minAmount,
                      rentRow.tier.maxAmount,
                      rentRow.product.currency
                    )
                  }}
                </dd>
              </div>
              <div class="flex items-center justify-between gap-3 py-2.5">
                <dt class="shrink-0 text-white/45">周期</dt>
                <dd class="text-right text-white">{{ cycleLabel(rentRow.product) }}</dd>
              </div>
              <div class="flex items-center justify-between gap-3 py-2.5">
                <dt class="shrink-0 text-white/45">日收益率</dt>
                <dd class="text-right font-medium tabular-nums text-lime-300/95">{{ rentRow.tier.dailyRate }}%</dd>
              </div>
              <div class="flex items-center justify-between gap-3 py-2.5">
                <dt class="shrink-0 text-white/45">派息时间</dt>
                <dd class="text-right text-white">{{ distributionLabel(rentRow.product) }}</dd>
              </div>
              <div class="flex items-start justify-between gap-3 py-2.5">
                <dt class="shrink-0 pt-0.5 text-white/45">起息日</dt>
                <dd class="max-w-[16rem] text-right text-xs leading-snug text-white/90 sm:text-sm">
                  {{ formatValueDateUtc8() }}
                </dd>
              </div>
            </dl>

            <div class="mt-5 border-t border-white/[0.08] pt-5">
              <div class="flex flex-wrap items-baseline justify-between gap-2">
                <span class="text-sm font-medium text-white/80">购买金额</span>
                <span class="text-xs text-white/40">
                  可用余额:
                  {{
                    Number.isInteger(rentAvailable)
                      ? rentAvailable
                      : rentAvailable.toLocaleString(undefined, { maximumFractionDigits: 8 })
                  }}{{ displayAssetCurrency(rentRow.product.currency) }}
                </span>
              </div>
              <div class="mt-2 flex gap-2">
                <input
                  v-model="rentAmount"
                  type="text"
                  inputmode="decimal"
                  :placeholder="`请输入购买金额`"
                  class="min-w-0 flex-1 rounded-lg border border-white/[0.12] bg-black/40 px-3 py-2.5 text-[15px] text-white placeholder:text-white/30 focus:border-violet-400/45 focus:outline-none focus:ring-2 focus:ring-violet-400/25"
                />
                <button
                  type="button"
                  class="shrink-0 rounded-lg border border-white/[0.18] px-3 py-2.5 text-xs font-semibold text-violet-200 transition hover:bg-white/[0.06] sm:px-4 sm:text-sm"
                  @click="fillRentAll"
                >
                  全部
                </button>
              </div>
            </div>

            <div class="mt-6 flex justify-end gap-2">
              <button
                type="button"
                class="rounded-lg border border-white/20 px-4 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/10"
                @click="closeRentDialog"
              >
                关闭
              </button>
              <RouterLink
                :to="{ path: `${prefix}/login`, query: { redirect: route.path } }"
                class="inline-flex items-center justify-center rounded-lg bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-400"
                @click="closeRentDialog"
              >
                确定
              </RouterLink>
            </div>
          </div>
        </div>
      </FrontPopupCard>
    </FrontPopupShell>
  </div>
</template>
