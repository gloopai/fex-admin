<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tradeMode = computed(() => route.meta.tradeMode || 'perpetual')

const prefix = computed(() => {
  const p = route.path
  const i = p.indexOf('/trade')
  return i > 0 ? p.slice(0, i) : '/front'
})

const tradeTabs = computed(() => {
  const pre = prefix.value
  return [
    { key: 'spot', label: '现货', to: `${pre}/trade/spot` },
    { key: 'perpetual', label: '永续合约', to: `${pre}/trade/perpetual` },
    { key: 'delivery', label: '交割合约', to: `${pre}/trade/delivery` }
  ]
})

const modeMenuLabel = computed(() => {
  switch (tradeMode.value) {
    case 'spot':
      return '现货'
    case 'delivery':
      return '交割合约'
    default:
      return '永续合约'
  }
})

const isContract = computed(() => tradeMode.value === 'perpetual' || tradeMode.value === 'delivery')

const pairs = [
  { base: 'ETH', quote: 'USDT' },
  { base: 'BTC', quote: 'USDT' },
  { base: 'SOL', quote: 'USDT' }
]

const activePairIdx = ref(0)
const activePair = computed(() => pairs[activePairIdx.value])

const symbol = computed(() => `${activePair.value.base} / ${activePair.value.quote}`)

const midNumeric = ref(2050.43)
const changePct = ref(-0.358)

function syncPairMarket(i) {
  midNumeric.value = i === 1 ? 98420.5 : i === 2 ? 188.35 : 2050.43
  changePct.value = i === 1 ? 1.24 : i === 2 ? 2.91 : -0.358
}

watch(activePairIdx, syncPairMarket)

const decimals = computed(() => {
  const m = midNumeric.value
  return m >= 1000 ? 2 : m >= 1 ? 2 : 4
})

function fmtPriceNum(price, dec) {
  return price.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

const takeProfitPrice = ref('')
const stopLossPrice = ref('')

function priceTickSize() {
  const m = midNumeric.value
  if (m >= 10_000) return 1
  if (m >= 1000) return 0.1
  if (m >= 100) return 0.01
  return 0.0001
}

function parsePriceInputStr(s) {
  const n = parseFloat(String(s).replace(/,/g, ''))
  return Number.isNaN(n) ? null : n
}

function bumpTakeProfit(delta) {
  const step = priceTickSize()
  const cur = parsePriceInputStr(takeProfitPrice.value)
  const base = cur === null ? midNumeric.value : cur
  const next = Math.max(0, base + delta * step)
  takeProfitPrice.value = fmtPriceNum(next, decimals.value)
}

function bumpStopLoss(delta) {
  const step = priceTickSize()
  const cur = parsePriceInputStr(stopLossPrice.value)
  const base = cur === null ? midNumeric.value : cur
  const next = Math.max(0, base + delta * step)
  stopLossPrice.value = fmtPriceNum(next, decimals.value)
}

const depthAsks = computed(() => {
  const mid = midNumeric.value
  const tick =
    mid >= 10_000 ? mid * 0.00002 : mid >= 1_000 ? mid * 0.00005 : mid >= 100 ? 0.08 : 0.02
  const steps = [0.8, 2.4, 5.1, 8.2, 13.4].map((x) => x * tick)
  const sizes = [0.32, 0.58, 1.12, 0.44, 0.91]
  const maxQ = Math.max(...sizes)
  const dec = decimals.value
  return steps.map((s, i) => {
    const pNum = mid + s
    const qNum = sizes[i]
    const tNum = pNum * qNum
    return {
      p: fmtPriceNum(pNum, dec),
      q: qNum.toFixed(2),
      t: tNum.toLocaleString('en-US', { maximumFractionDigits: 2 }),
      bar: Math.round((qNum / maxQ) * 100)
    }
  })
})

const depthBids = computed(() => {
  const mid = midNumeric.value
  const tick =
    mid >= 10_000 ? mid * 0.00002 : mid >= 1_000 ? mid * 0.00005 : mid >= 100 ? 0.08 : 0.02
  const steps = [0.6, 1.4, 2.2, 2.8, 3.4].map((x) => x * tick)
  const sizes = [1.5, 1.44, 0.88, 2.03, 0.64]
  const maxQ = Math.max(...sizes)
  const dec = decimals.value
  return steps.map((s, i) => {
    const pNum = mid - s
    const qNum = sizes[i]
    const tNum = pNum * qNum
    return {
      p: fmtPriceNum(pNum, dec),
      q: qNum.toFixed(2),
      t: tNum.toLocaleString('en-US', { maximumFractionDigits: 2 }),
      bar: Math.round((qNum / maxQ) * 100)
    }
  })
})

/** K 线盘口：卖单从高价到低价向下展示 */
const depthAsksReversed = computed(() => [...depthAsks.value].reverse())

const lastPrice = computed(() => fmtPriceNum(midNumeric.value, decimals.value))

const stats24h = computed(() => {
  const m = midNumeric.value
  if (m > 50_000) {
    return {
      high: '99,120.50',
      low: '97,880.00',
      volBase: '482.31 BTC',
      turnover: '47.28M USDT',
      tradeAmtShort: '12.41M'
    }
  }
  if (m > 500) {
    return {
      high: '2,081.76',
      low: '2,041.65',
      volBase: '90.85K ETH',
      turnover: '186.21M USDT',
      tradeAmtShort: '90.91K'
    }
  }
  return {
    high: '198.20',
    low: '182.10',
    volBase: '4.2M SOL',
    turnover: '782.5M USDT',
    tradeAmtShort: '1.28M'
  }
})

const marketMiniRows = computed(() => [
  {
    idx: 0,
    label: 'ETH / USDT',
    price: lastPrice.value,
    pct: changePct.value,
    vol: '90.8K'
  },
  {
    idx: 1,
    label: 'BTC / USDT',
    price: '98,420.50',
    pct: 1.24,
    vol: '12.4K'
  },
  {
    idx: 2,
    label: 'SOL / USDT',
    price: '188.35',
    pct: 2.91,
    vol: '1.2M'
  }
])

const pairDrawerOpen = ref(false)
const modeSheetOpen = ref(false)
const chartExpanded = ref(false)

const positionSide = ref('long')
const orderType = ref('limit')
const leverage = ref('20')
const tpSl = ref(false)
const quantity = ref('')
const qtyQuote = ref('')

watch(tpSl, (on) => {
  if (!on) {
    takeProfitPrice.value = ''
    stopLossPrice.value = ''
  }
})

const deliveryPeriods = ['30s - 7%', '1m - 5%', '5m - 12%', '15m - 18%']
const selectedDeliveryPeriod = ref(deliveryPeriods[0])

const chartTimeframes = ['1分', '5分', '15分', '30分', '1小时', '1日', '1周', '1月']
const chartTimeframe = ref('1分')
/** K 线展开区域：市场盘口 / 最新成交（非个人委托） */
const chartMarketTab = ref('depth')
const tradeBottomTab = ref('orders')
const orderBookTab = ref('book')
const obSideMode = ref('both')

const orderBookSideSegments = [
  { id: 'both', label: '买卖' },
  { id: 'sell', label: '卖盘' },
  { id: 'buy', label: '买盘' }
]
const pcBottomTab = ref('positions')
const clockStr = ref('')

/** 移动端限价委托价格（演示） */
const orderPrice = ref('')

let clockTimer = null

watch(
  () => route.fullPath,
  () => {
    chartExpanded.value = false
    chartMarketTab.value = 'depth'
    orderPrice.value = ''
  }
)

/** K 线全屏浏览时仅保留方向入口，回到双列下单区填数量 */
function leaveChartToOrder(side) {
  positionSide.value = side
  chartExpanded.value = false
  nextTick(() => {
    document.getElementById('mobile-order-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

const pcBottomTabs = computed(() => {
  if (tradeMode.value === 'delivery') {
    return [
      { key: 'delivery-orders', label: '交割订单' },
      { key: 'hist', label: '历史订单' }
    ]
  }
  if (tradeMode.value === 'perpetual') {
    return [
      { key: 'positions', label: '当前持仓' },
      { key: 'open-orders', label: '当前委托' },
      { key: 'hist-orders', label: '历史委托' },
      { key: 'hist-trades', label: '历史成交' }
    ]
  }
  return [
    { key: 'open-orders', label: '当前委托' },
    { key: 'hist-orders', label: '历史委托' },
    { key: 'hist-trades', label: '历史成交' }
  ]
})

watch(
  () => tradeMode.value,
  () => {
    pcBottomTab.value = pcBottomTabs.value[0].key
    if (tradeMode.value === 'spot') positionSide.value = 'long'
  }
)

function openPairDrawer() {
  closeMobilePicker()
  pairDrawerOpen.value = true
}

function closePairDrawer() {
  pairDrawerOpen.value = false
}

function openModeSheet() {
  closeMobilePicker()
  modeSheetOpen.value = true
}

function closeModeSheet() {
  modeSheetOpen.value = false
}

function selectPair(i) {
  activePairIdx.value = i
  closePairDrawer()
}

/** 抽屉内左侧角标（与主导航图标格统一尺度） */
function pairListBadge(base) {
  const b = String(base || '')
  return b.length <= 4 ? b : `${b.slice(0, 3)}…`
}

function goMode(path) {
  closeModeSheet()
  if (route.path !== path) router.push(path)
}

/** 移动端：用底部抽屉代替原生 select */
const mobilePickerOpen = ref(false)
const mobilePickerTitle = ref('')
const mobilePickerKind = ref('')
const mobilePickerOptionList = ref([])

function mobilePickerCurrentValue() {
  const k = mobilePickerKind.value
  if (k === 'chartTf') return chartTimeframe.value
  if (k === 'orderType') return orderType.value
  if (k === 'leverage') return leverage.value
  if (k === 'delivery') return selectedDeliveryPeriod.value
  return ''
}

function isMobilePickerOptionSelected(value) {
  return String(mobilePickerCurrentValue()) === String(value)
}

function openMobilePicker(kind) {
  mobilePickerKind.value = kind
  if (kind === 'chartTf') {
    mobilePickerTitle.value = 'K 线周期'
    mobilePickerOptionList.value = chartTimeframes.slice(0, 4).map((tf) => ({
      value: tf,
      label: tf
    }))
  } else if (kind === 'orderType') {
    mobilePickerTitle.value = '委托类型'
    mobilePickerOptionList.value = [
      { value: 'market', label: '市价' },
      { value: 'limit', label: '限价' }
    ]
  } else if (kind === 'leverage') {
    mobilePickerTitle.value = '杠杆'
    mobilePickerOptionList.value = [
      { value: '1', label: '1×' },
      { value: '5', label: '5×' },
      { value: '10', label: '10×' },
      { value: '20', label: '20×' }
    ]
  } else if (kind === 'delivery') {
    mobilePickerTitle.value = '交割周期'
    mobilePickerOptionList.value = deliveryPeriods.map((p) => ({
      value: p,
      label: p
    }))
  } else {
    mobilePickerOptionList.value = []
  }
  mobilePickerOpen.value = true
}

function closeMobilePicker() {
  mobilePickerOpen.value = false
}

function confirmMobilePick(value) {
  const k = mobilePickerKind.value
  if (k === 'chartTf') chartTimeframe.value = value
  else if (k === 'orderType') orderType.value = value
  else if (k === 'leverage') leverage.value = String(value)
  else if (k === 'delivery') selectedDeliveryPeriod.value = value
  closeMobilePicker()
}

function setQtyPct(pct) {
  quantity.value = String(pct)
}

function tabLinkClass(to) {
  const active = route.path === to || route.path === `${to}/`
  return active
    ? 'bg-lime-400/15 text-lime-200 ring-1 ring-lime-400/25'
    : 'text-white/65 hover:bg-white/[0.06] hover:text-white/90'
}

function changeClass(pct) {
  if (pct > 0) return 'text-[#00b464]'
  if (pct < 0) return 'text-[#ff3b30]'
  return 'text-white/50'
}

const primaryCtaLabel = computed(() => {
  if (!isContract.value) {
    return positionSide.value === 'long' ? `买入 ${activePair.value.base}` : `卖出 ${activePair.value.base}`
  }
  return positionSide.value === 'long' ? '做多买入' : '做空买入'
})

/** 移动端「当前委托 / 历史订单」演示数据 */
const mobileDemoOpenOrders = computed(() => {
  const base = activePair.value.base
  const sym = `${base}/${activePair.value.quote}`
  const px = lastPrice.value
  const contract = isContract.value
  const unit = contract ? '张' : base
  const modeTag =
    tradeMode.value === 'delivery' ? '交割' : contract ? '永续' : '现货'
  const amt1 =
    contract ? '12' : base === 'BTC' ? '0.008' : base === 'SOL' ? '2.40' : '0.24'
  const amt2 =
    contract ? '3' : base === 'BTC' ? '0.015' : base === 'SOL' ? '1.20' : '0.10'
  return [
    {
      id: 'doo-1',
      pair: sym,
      modeTag,
      sideLong: true,
      sideLabel: contract ? '开多' : '买入',
      type: '限价',
      price: px,
      amount: `${amt1} ${unit}`,
      filled: '0%',
      time: '14:32:18'
    },
    {
      id: 'doo-2',
      pair: sym,
      modeTag,
      sideLong: false,
      sideLabel: contract ? '开空' : '卖出',
      type: '市价',
      price: '—',
      amount: `${amt2} ${unit}`,
      filled: '0%',
      time: '14:28:05'
    }
  ]
})

const mobileDemoHistOrders = computed(() => {
  const base = activePair.value.base
  const contract = isContract.value
  const unit = contract ? '张' : base
  const px = lastPrice.value
  const a1 =
    contract ? '8' : base === 'BTC' ? '0.020' : base === 'SOL' ? '3.50' : '0.35'
  const a2 =
    contract ? '4' : base === 'BTC' ? '0.010' : base === 'SOL' ? '0.90' : '0.80'
  const a3 = contract ? '2' : '0.08'
  return [
    {
      id: 'dho-1',
      sideLong: true,
      sideLabel: contract ? '平空' : '买入',
      type: '限价',
      price: px,
      amount: `${a1} ${unit}`,
      status: '完全成交',
      time: '04-03 09:12'
    },
    {
      id: 'dho-2',
      sideLong: false,
      sideLabel: contract ? '平多' : '卖出',
      type: '市价',
      price: '市价',
      amount: `${a2} ${unit}`,
      status: '完全成交',
      time: '04-02 22:40'
    },
    {
      id: 'dho-3',
      sideLong: true,
      sideLabel: contract ? '开多' : '买入',
      type: '限价',
      price: px,
      amount: `${a3} ${unit}`,
      status: '已撤销',
      time: '04-01 16:08'
    }
  ]
})

/** K 线区「最新成交」：示意市场成交明细，非用户订单 */
const klineMarketTrades = computed(() => {
  const mid = midNumeric.value
  const dec = decimals.value
  const tick =
    mid >= 10_000 ? 1 : mid >= 1_000 ? 0.1 : mid >= 100 ? 0.01 : 0.0001
  const pattern = [
    [true, 0, '0.04'],
    [false, 0.01, '0.05'],
    [true, -0.01, '0.09'],
    [false, 0.02, '0.12'],
    [true, 0.01, '0.03'],
    [false, -0.01, '0.07'],
    [true, 0, '0.11'],
    [false, 0.01, '0.02'],
    [true, -0.02, '0.08'],
    [false, 0, '0.15'],
    [true, 0.02, '0.06'],
    [false, -0.01, '0.04']
  ]
  const rows = []
  let ts = Date.now()
  for (let i = 0; i < pattern.length; i++) {
    const [isBuy, deltaTicks, q] = pattern[i]
    ts -= 700 + i * 320
    const d = new Date(ts)
    const timeStr = d.toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    const pNum = Math.max(0.00000001, mid + deltaTicks * tick * (isBuy ? -1 : 1))
    rows.push({
      time: timeStr,
      price: fmtPriceNum(pNum, dec),
      qty: q,
      isBuy
    })
  }
  return rows
})

const orderToast = ref('')
let orderToastTimer = null

function showTradeToast(message) {
  orderToast.value = message
  if (orderToastTimer) clearTimeout(orderToastTimer)
  orderToastTimer = setTimeout(() => {
    orderToast.value = ''
  }, 2600)
}

function validateOrderQty() {
  const q = String(quantity.value || '').trim()
  if (tradeMode.value === 'spot') {
    const qq = String(qtyQuote.value || '').trim()
    if (!q && !qq) return '请填写数量'
  } else if (!q) {
    return '请填写数量'
  }
  return null
}

/** 演示环境：校验数量后提示，无真实下单 */
function submitDemoOrder(forcedSide) {
  const err = validateOrderQty()
  if (err) {
    showTradeToast(err)
    return
  }
  const side = forcedSide || positionSide.value
  const sideLabel =
    tradeMode.value === 'spot'
      ? side === 'long'
        ? '买入'
        : '卖出'
      : side === 'long'
        ? '做多'
        : '做空'
  const pair = `${activePair.value.base}/${activePair.value.quote}`
  showTradeToast(`演示：已提交${sideLabel} ${pair}（无真实成交）`)
}

function onBodyKeydown(e) {
  if (e.key === 'Escape') {
    if (mobilePickerOpen.value) {
      closeMobilePicker()
      return
    }
    pairDrawerOpen.value = false
    modeSheetOpen.value = false
  }
}

function tickClock() {
  clockStr.value = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

onMounted(() => {
  document.body.addEventListener('keydown', onBodyKeydown)
  tickClock()
  clockTimer = setInterval(tickClock, 1000)
})

onUnmounted(() => {
  document.body.removeEventListener('keydown', onBodyKeydown)
  if (clockTimer) clearInterval(clockTimer)
  if (orderToastTimer) clearTimeout(orderToastTimer)
})

const pcBottomEmptyText = computed(() => {
  const t = pcBottomTab.value
  if (t === 'positions') return '暂无当前持仓'
  if (t === 'delivery-orders' || t === 'open-orders') return '暂无交易订单'
  if (t === 'hist' || t === 'hist-orders') return '暂无历史委托'
  if (t === 'hist-trades') return '暂无历史成交'
  return '暂无数据'
})
</script>

<template>
  <div class="trade-page w-full text-white lg:max-w-none">
    <!-- ——— PC：行情横条 + 类型切换 ——— -->
    <div
      class="hidden border-b border-[#1f2429] bg-[#0b0e11] lg:block lg:px-4 lg:py-2 xl:px-6"
    >
      <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div class="flex items-center gap-2">
          <label class="sr-only" for="pc-trade-pair">交易对</label>
          <select
            id="pc-trade-pair"
            v-model.number="activePairIdx"
            class="rounded-lg border border-[#1f2429] bg-[#1e2329] py-1.5 pl-2 pr-8 text-sm font-semibold text-white focus:border-[#00b464]/50 focus:outline-none"
          >
            <option v-for="(p, i) in pairs" :key="p.base + p.quote" :value="i">
              {{ p.base }} / {{ p.quote }}
            </option>
          </select>
        </div>

        <div class="flex flex-wrap items-baseline gap-x-8 gap-y-1">
          <div>
            <p class="font-mono text-xl font-bold tabular-nums" :class="changeClass(changePct)">
              {{ lastPrice }}
            </p>
            <p class="text-[11px] text-white/45">≈ $ {{ lastPrice }}</p>
          </div>
          <div class="text-xs">
            <span class="text-white/40">24H 涨跌</span>
            <span class="ml-2 font-mono tabular-nums" :class="changeClass(changePct)">
              {{ changePct >= 0 ? '+' : '' }}{{ changePct.toFixed(3) }}%
            </span>
          </div>
          <div class="text-xs">
            <span class="text-white/40">24H 高</span>
            <span class="ml-2 font-mono tabular-nums text-white/85">{{ stats24h.high }}</span>
          </div>
          <div class="text-xs">
            <span class="text-white/40">24H 低</span>
            <span class="ml-2 font-mono tabular-nums text-white/85">{{ stats24h.low }}</span>
          </div>
          <div class="text-xs">
            <span class="text-white/40">24H 成交量</span>
            <span class="ml-2 font-mono text-white/85">{{ stats24h.volBase }}</span>
          </div>
          <div class="text-xs">
            <span class="text-white/40">24H 交易额</span>
            <span class="ml-2 font-mono text-white/85">{{ stats24h.turnover }}</span>
          </div>
        </div>

        <div class="ml-auto flex items-center gap-4">
          <nav
            class="flex rounded-lg border border-white/[0.06] bg-white/[0.04] p-0.5"
            aria-label="交易类型"
          >
            <RouterLink
              v-for="t in tradeTabs"
              :key="t.key"
              :to="t.to"
              class="whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition"
              :class="tabLinkClass(t.to)"
            >
              {{ t.label }}
            </RouterLink>
          </nav>
          <time class="font-mono text-xs tabular-nums text-white/50">{{ clockStr }}</time>
        </div>
      </div>
    </div>

    <!-- ——— PC：三栏主终端 ——— -->
    <div
      class="hidden min-h-[calc(100vh-7.5rem)] border-[#1f2429] lg:flex lg:border-t lg:border-b"
    >
      <!-- 左：图表 + 底部订单 -->
      <div
        class="flex min-w-0 flex-[1.15] flex-col border-r border-[#1f2429] bg-[#050505]"
      >
        <div class="flex items-center justify-between border-b border-[#1f2429] px-2 py-1.5">
          <div class="flex flex-wrap gap-0.5" role="tablist" aria-label="K 线周期">
            <button
              v-for="tf in chartTimeframes"
              :key="tf"
              type="button"
              class="rounded px-2 py-1 text-xs font-medium transition"
              :class="
                chartTimeframe === tf
                  ? 'bg-[#00b464]/20 text-[#00b464]'
                  : 'text-white/45 hover:bg-white/[0.04] hover:text-white/75'
              "
              @click="chartTimeframe = tf"
            >
              {{ tf }}
            </button>
          </div>
          <div class="flex items-center gap-1 text-white/35">
            <button
              type="button"
              class="rounded p-1.5 hover:bg-white/[0.06] hover:text-white/70"
              aria-label="指标"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-width="1.5"
                  d="M12 6v12M6 12h12M9 3v2m6-2v2M9 19v2m6-2v2M19 9h2m-2 6h2M3 9h2m-2 6h2"
                />
              </svg>
            </button>
            <button
              type="button"
              class="rounded p-1.5 hover:bg-white/[0.06] hover:text-white/70"
              aria-label="全屏"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M4 8V4h4M16 4h4v4M4 16v4h4m12 0h4v-4"
                />
              </svg>
            </button>
          </div>
        </div>
        <div class="relative flex min-h-[380px] flex-1 flex-col bg-[#050505] xl:min-h-[440px]">
            <div
              class="pointer-events-none absolute inset-0 opacity-[0.08]"
              style="
                background-image: linear-gradient(#1f2429 1px, transparent 1px),
                  linear-gradient(90deg, #1f2429 1px, transparent 1px);
                background-size: 22px 22px;
              "
            />
            <div class="relative flex flex-1 items-end justify-center px-4 pb-6 pt-8">
              <div class="h-40 w-full max-w-4xl xl:h-48">
                <div
                  class="h-full w-full bg-gradient-to-t from-[#00b464]/15 via-rose-500/10 to-transparent"
                  style="clip-path: polygon(0% 72%, 10% 55%, 20% 62%, 30% 44%, 40% 52%, 50% 38%, 60% 46%, 70% 32%, 80% 40%, 90% 28%, 100% 36%, 100% 100%, 0% 100%)"
                />
              </div>
              <p class="absolute bottom-3 text-center text-[11px] text-white/35">
                K 线区域（示意）· 接入 TradingView / 自研图表
              </p>
            </div>
            <div class="relative h-14 border-t border-[#1f2429] bg-[#0b0e11]/80 px-2">
              <div
                class="flex h-full items-end gap-px pt-2"
                aria-hidden="true"
              >
                <div
                  v-for="(h, hi) in [40, 55, 35, 60, 45, 70, 30, 50, 65, 40, 58, 48]"
                  :key="hi"
                  class="flex-1 rounded-t-[1px] bg-[#00b464]/35"
                  :style="{ height: `${h}%` }"
                />
              </div>
            </div>
        </div>

        <div class="flex min-h-[200px] flex-col border-t border-[#1f2429] bg-[#0b0e11]">
          <div class="flex flex-wrap gap-0 border-b border-[#1f2429] px-1">
            <button
              v-for="bt in pcBottomTabs"
              :key="bt.key"
              type="button"
              class="border-b-2 px-3 py-2 text-xs font-medium transition"
              :class="
                pcBottomTab === bt.key
                  ? 'border-[#00b464] text-[#00b464]'
                  : 'border-transparent text-white/45 hover:text-white/75'
              "
              @click="pcBottomTab = bt.key"
            >
              {{ bt.label }}
            </button>
          </div>
          <div class="flex flex-1 items-center justify-center px-4 py-10 text-sm text-white/40">
            {{ pcBottomEmptyText }}
          </div>
        </div>
      </div>

      <!-- 中：盘口 / 成交 -->
      <div
        class="flex w-[300px] shrink-0 flex-col border-r border-[#1f2429] bg-[#0b0e11] xl:w-[340px]"
      >
        <div class="flex border-b border-[#1f2429]">
          <button
            type="button"
            class="flex-1 border-b-2 py-2.5 text-xs font-medium transition"
            :class="
              orderBookTab === 'book'
                ? 'border-[#00b464] text-[#00b464]'
                : 'border-transparent text-white/45'
            "
            @click="orderBookTab = 'book'"
          >
            委托订单
          </button>
          <button
            type="button"
            class="flex-1 border-b-2 py-2.5 text-xs font-medium transition"
            :class="
              orderBookTab === 'trades'
                ? 'border-[#00b464] text-[#00b464]'
                : 'border-transparent text-white/45'
            "
            @click="orderBookTab = 'trades'"
          >
            最新成交
          </button>
        </div>
        <div
          v-if="orderBookTab === 'book'"
          class="border-b border-[#1f2429] px-2.5 py-2"
        >
          <div
            class="flex w-full items-stretch rounded-lg bg-[#12141a] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ring-1 ring-[#1a1e25]"
            role="tablist"
            aria-label="盘口显示"
          >
            <button
              v-for="seg in orderBookSideSegments"
              :key="seg.id"
              type="button"
              role="tab"
              :aria-selected="obSideMode === seg.id"
              class="min-w-0 flex-1 rounded-md px-1.5 py-2 text-center text-[11px] font-medium leading-none tracking-tight transition-[color,background-color,box-shadow] duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00b464]/40 focus-visible:ring-offset-1 focus-visible:ring-offset-[#12141a]"
              :class="
                obSideMode === seg.id
                  ? 'bg-[#2f333c] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]'
                  : 'bg-transparent text-[#848e9c] hover:bg-white/[0.025] hover:text-[#b7bdc6]'
              "
              @click="obSideMode = seg.id"
            >
              {{ seg.label }}
            </button>
          </div>
        </div>

        <template v-if="orderBookTab === 'book'">
          <div
            class="grid grid-cols-3 border-b border-[#1f2429] px-2 py-2 text-[10px] font-medium text-[#848e9c]"
          >
            <span class="text-left">价格(USDT)</span>
            <span class="text-right">数量({{ activePair.base }})</span>
            <span class="text-right">合计(USDT)</span>
          </div>
          <div class="min-h-0 flex-1 overflow-y-auto">
            <ul v-if="obSideMode !== 'buy'">
              <li
                v-for="(row, i) in depthAsks"
                :key="'pa-' + i"
                class="relative grid grid-cols-3 font-mono text-[11px] tabular-nums leading-6"
              >
                <div
                  class="pointer-events-none absolute inset-y-0 right-0 bg-rose-500/15"
                  :style="{ width: `${row.bar}%` }"
                />
                <span class="relative px-2 text-left text-[#ff3b30]">{{ row.p }}</span>
                <span class="relative px-2 text-right text-white/70">{{ row.q }}</span>
                <span class="relative px-2 text-right text-white/50">{{ row.t }}</span>
              </li>
            </ul>
            <div
              class="flex items-center justify-center gap-2 border-y border-[#1f2429] bg-black/25 py-2"
            >
              <span class="font-mono text-sm font-bold tabular-nums text-white">{{ lastPrice }}</span>
              <svg
                class="h-4 w-4 shrink-0 text-[#ff3b30]"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 5v14M19 12l-7 7-7-7"
                />
              </svg>
            </div>
            <ul v-if="obSideMode !== 'sell'">
              <li
                v-for="(row, i) in depthBids"
                :key="'pb-' + i"
                class="relative grid grid-cols-3 font-mono text-[11px] tabular-nums leading-6"
              >
                <div
                  class="pointer-events-none absolute inset-y-0 right-0 bg-[#00b464]/12"
                  :style="{ width: `${row.bar}%` }"
                />
                <span class="relative px-2 text-left text-[#00b464]">{{ row.p }}</span>
                <span class="relative px-2 text-right text-white/70">{{ row.q }}</span>
                <span class="relative px-2 text-right text-white/50">{{ row.t }}</span>
              </li>
            </ul>
          </div>
        </template>
        <div v-else class="flex-1 overflow-y-auto px-2 py-3 text-center text-xs text-white/40">
          <p>最新成交接入行情后展示</p>
          <ul class="mt-4 space-y-2 text-left font-mono text-[11px] text-white/55">
            <li v-for="n in 6" :key="n" class="grid grid-cols-4 gap-1">
              <span>17:{{ String(40 + n).padStart(2, '0') }}:01</span>
              <span :class="n % 2 ? 'text-[#00b464]' : 'text-[#ff3b30]'">
                {{ n % 2 ? '做多' : '做空' }}
              </span>
              <span class="text-right">{{ lastPrice }}</span>
              <span class="text-right opacity-70">0.{{ n }}42</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- 右：下单 + 行情列表 + 资产（#121214 终端侧栏 + 橄榄绿 / 珊瑚红） -->
      <div
        class="flex w-[320px] shrink-0 flex-col border-l border-[#1a1c21] bg-[#121214] xl:w-[360px]"
      >
        <div class="flex-1 space-y-3.5 overflow-y-auto border-b border-[#1a1c21] px-3 py-3.5">
          <!-- 交割 -->
          <template v-if="tradeMode === 'delivery'">
            <div
              class="grid grid-cols-2 gap-1 rounded-lg bg-[#0e0f12] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] ring-1 ring-[#1a1c21]"
            >
              <button
                type="button"
                class="rounded-md py-2.5 text-xs font-bold tracking-tight transition duration-150"
                :class="
                  positionSide === 'long'
                    ? 'bg-[#152019] text-[#8fd4a8] shadow-[inset_0_1px_0_rgba(143,212,168,0.12)] ring-1 ring-[#4d7c59]/55'
                    : 'text-[#8e8e93] hover:bg-white/[0.03] hover:text-[#b4b4b8]'
                "
                @click="positionSide = 'long'"
              >
                做多买入
              </button>
              <button
                type="button"
                class="rounded-md py-2.5 text-xs font-bold tracking-tight transition duration-150"
                :class="
                  positionSide === 'short'
                    ? 'bg-[#231619] text-[#ffb0b3] shadow-[inset_0_1px_0_rgba(240,90,94,0.08)] ring-1 ring-[#8f3d42]/60'
                    : 'text-[#8e8e93] hover:bg-white/[0.03] hover:text-[#b4b4b8]'
                "
                @click="positionSide = 'short'"
              >
                做空买入
              </button>
            </div>
            <ul class="space-y-2 text-[11px] leading-snug">
              <li class="flex justify-between gap-2">
                <span class="text-[#8e8e93]">交易资产</span>
                <span class="font-medium text-white">{{ activePair.quote }}</span>
              </li>
              <li class="flex justify-between gap-2">
                <span class="text-[#8e8e93]">可用数量</span>
                <span class="font-mono font-medium text-white">0.00</span>
              </li>
              <li class="flex justify-between gap-2">
                <span class="text-[#8e8e93]">最低买入</span>
                <span class="font-mono font-medium text-white">100</span>
              </li>
              <li class="flex justify-between gap-2">
                <span class="text-[#8e8e93]">手续费</span>
                <span class="font-mono font-medium text-white">0.00</span>
              </li>
            </ul>
            <label class="block text-[11px] font-medium text-[#8e8e93]">合约周期</label>
            <select
              v-model="selectedDeliveryPeriod"
              class="w-full rounded-lg border border-[#24252b] bg-[#1a1b1f] py-2 pl-2.5 pr-8 text-xs text-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)] focus:border-[#4d7c59]/50 focus:outline-none focus:ring-1 focus:ring-[#4d7c59]/35"
            >
              <option v-for="o in deliveryPeriods" :key="o" :value="o">{{ o }}</option>
            </select>
            <label class="block text-[11px] font-medium text-[#8e8e93]">数量</label>
            <input
              v-model="quantity"
              type="text"
              placeholder="请输入数量"
              class="w-full rounded-lg border border-[#24252b] bg-[#1a1b1f] py-2 px-2.5 text-sm text-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)] placeholder:text-[#6b6b70] focus:border-[#4d7c59]/45 focus:outline-none focus:ring-1 focus:ring-[#4d7c59]/30"
            />
            <div class="grid grid-cols-4 gap-1.5">
              <button
                v-for="p in [25, 50, 75, 100]"
                :key="p"
                type="button"
                class="rounded-md border border-[#2a2b31] bg-transparent py-2 text-[10px] font-semibold text-[#a1a1a6] transition hover:border-[#4d7c59]/40 hover:text-white"
                @click="setQtyPct(p)"
              >
                {{ p }}%
              </button>
            </div>
            <div class="flex justify-between border-t border-[#1a1c21] pt-2 text-[11px] text-[#8e8e93]">
              <span>预计收益</span>
              <span class="font-mono">--</span>
            </div>
            <button
              type="button"
              class="w-full rounded-lg py-3 text-sm font-bold tracking-tight text-white shadow-md transition hover:brightness-105 active:brightness-95"
              :class="
                positionSide === 'long'
                  ? 'bg-[#3d8f62] shadow-[#3d8f62]/15'
                  : 'bg-[#F05A5E] shadow-[#F05A5E]/20'
              "
              @click="submitDemoOrder()"
            >
              {{ primaryCtaLabel }}
            </button>
          </template>

          <!-- 永续 -->
          <template v-else-if="tradeMode === 'perpetual'">
            <div
              class="flex rounded-lg bg-[#0e0f12] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] ring-1 ring-[#1a1c21]"
            >
              <button
                type="button"
                class="flex-1 rounded-md py-2 text-xs font-semibold tracking-tight transition duration-150"
                :class="
                  orderType === 'market'
                    ? 'bg-[#152019] text-[#9bc99f] shadow-[inset_0_1px_0_rgba(155,201,159,0.1)] ring-1 ring-[#4d7c59]/45'
                    : 'text-[#8e8e93] hover:bg-white/[0.025] hover:text-[#b4b4b8]'
                "
                @click="orderType = 'market'"
              >
                市价
              </button>
              <button
                type="button"
                class="flex-1 rounded-md py-2 text-xs font-semibold tracking-tight transition duration-150"
                :class="
                  orderType === 'limit'
                    ? 'bg-[#152019] text-[#9bc99f] shadow-[inset_0_1px_0_rgba(155,201,159,0.1)] ring-1 ring-[#4d7c59]/45'
                    : 'text-[#8e8e93] hover:bg-white/[0.025] hover:text-[#b4b4b8]'
                "
                @click="orderType = 'limit'"
              >
                限价
              </button>
            </div>
            <div class="flex justify-between text-[11px]">
              <span class="text-[#8e8e93]">可用数量</span>
              <span class="font-mono font-medium text-white">0.00 {{ activePair.quote }}</span>
            </div>
            <label class="block text-[11px] font-medium text-[#8e8e93]">杠杆</label>
            <select
              v-model="leverage"
              class="w-full rounded-lg border border-[#24252b] bg-[#1a1b1f] py-2 pl-2.5 pr-8 text-xs text-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)] focus:border-[#4d7c59]/50 focus:outline-none focus:ring-1 focus:ring-[#4d7c59]/35"
            >
              <option value="1">1X</option>
              <option value="5">5X</option>
              <option value="10">10X</option>
              <option value="20">20X</option>
            </select>
            <label class="block text-[11px] font-medium text-[#8e8e93]">价格 (USDT)</label>
            <input
              type="text"
              :placeholder="lastPrice"
              :disabled="orderType === 'market'"
              class="w-full rounded-lg border border-[#24252b] bg-[#1a1b1f] py-2 px-2.5 text-sm text-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)] placeholder:text-[#6b6b70] focus:border-[#4d7c59]/45 focus:outline-none focus:ring-1 focus:ring-[#4d7c59]/30 disabled:cursor-not-allowed disabled:opacity-45"
            />
            <label class="block text-[11px] font-medium text-[#8e8e93]">数量 (张)</label>
            <input
              v-model="quantity"
              type="text"
              placeholder="请输入数量(张)"
              class="w-full rounded-lg border border-[#24252b] bg-[#1a1b1f] py-2 px-2.5 text-sm text-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)] placeholder:text-[#6b6b70] focus:border-[#4d7c59]/45 focus:outline-none focus:ring-1 focus:ring-[#4d7c59]/30"
            />
            <div class="grid grid-cols-4 gap-1.5">
              <button
                v-for="p in [25, 50, 75, 100]"
                :key="p"
                type="button"
                class="rounded-md border border-[#2a2b31] bg-transparent py-2 text-[10px] font-semibold text-[#a1a1a6] transition hover:border-[#4d7c59]/40 hover:text-white"
                @click="setQtyPct(p)"
              >
                {{ p }}%
              </button>
            </div>
            <ul class="space-y-1.5 text-[11px] leading-snug">
              <li class="flex justify-between gap-2">
                <span class="text-[#8e8e93]">最大可开仓</span>
                <span class="font-mono font-medium text-[#9bc99f]">0.00 张</span>
              </li>
              <li class="flex justify-between gap-2">
                <span class="text-[#8e8e93]">初始保证金</span>
                <span class="font-mono text-white">--</span>
              </li>
              <li class="flex justify-between gap-2">
                <span class="text-[#8e8e93]">手续费</span>
                <span class="font-mono text-white">0.00</span>
              </li>
            </ul>
            <label class="flex cursor-pointer select-none items-center gap-2.5 text-[11px] text-[#8e8e93]">
              <input
                v-model="tpSl"
                type="checkbox"
                class="h-4 w-4 shrink-0 rounded border-[#2a2b31] bg-[#1a1b1f] accent-[#84cc16] focus:ring-2 focus:ring-[#84cc16]/30"
              />
              <span class="font-medium hover:text-[#b4b4b8]">止盈止损</span>
            </label>
            <div v-if="tpSl" class="space-y-2">
              <div
                class="flex h-10 overflow-hidden rounded-lg border border-[#24252b] bg-[#1a1b1f] shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"
              >
                <button
                  type="button"
                  class="flex w-9 shrink-0 items-center justify-center border-r border-[#24252b] bg-[#1f2026] text-lg leading-none text-[#a1a1a6] transition hover:bg-[#25262e] hover:text-white"
                  aria-label="降低止盈价"
                  @click="bumpTakeProfit(-1)"
                >
                  −
                </button>
                <input
                  v-model="takeProfitPrice"
                  type="text"
                  inputmode="decimal"
                  placeholder="请输入止盈价格(USDT)"
                  class="min-w-0 flex-1 border-0 bg-transparent px-2 text-center text-xs text-white placeholder:text-[#6b6b70] focus:outline-none focus:ring-0"
                />
                <button
                  type="button"
                  class="flex w-9 shrink-0 items-center justify-center border-l border-[#24252b] bg-[#1f2026] text-lg leading-none text-[#a1a1a6] transition hover:bg-[#25262e] hover:text-white"
                  aria-label="提高止盈价"
                  @click="bumpTakeProfit(1)"
                >
                  +
                </button>
              </div>
              <div
                class="flex h-10 overflow-hidden rounded-lg border border-[#24252b] bg-[#1a1b1f] shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"
              >
                <button
                  type="button"
                  class="flex w-9 shrink-0 items-center justify-center border-r border-[#24252b] bg-[#1f2026] text-lg leading-none text-[#a1a1a6] transition hover:bg-[#25262e] hover:text-white"
                  aria-label="降低止损价"
                  @click="bumpStopLoss(-1)"
                >
                  −
                </button>
                <input
                  v-model="stopLossPrice"
                  type="text"
                  inputmode="decimal"
                  placeholder="请输入止损价格(USDT)"
                  class="min-w-0 flex-1 border-0 bg-transparent px-2 text-center text-xs text-white placeholder:text-[#6b6b70] focus:outline-none focus:ring-0"
                />
                <button
                  type="button"
                  class="flex w-9 shrink-0 items-center justify-center border-l border-[#24252b] bg-[#1f2026] text-lg leading-none text-[#a1a1a6] transition hover:bg-[#25262e] hover:text-white"
                  aria-label="提高止损价"
                  @click="bumpStopLoss(1)"
                >
                  +
                </button>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                class="rounded-lg bg-[#3d8f62] py-3 text-xs font-bold tracking-tight text-white shadow-md shadow-[#3d8f62]/15 transition hover:brightness-105 active:brightness-95"
                @click="submitDemoOrder('long')"
              >
                做多买入
              </button>
              <button
                type="button"
                class="rounded-lg bg-[#F05A5E] py-3 text-xs font-bold tracking-tight text-white shadow-md shadow-[#F05A5E]/20 transition hover:brightness-105 active:brightness-95"
                @click="submitDemoOrder('short')"
              >
                做空买入
              </button>
            </div>
          </template>

          <!-- 现货 -->
          <template v-else>
            <div class="flex rounded-lg border border-[#1f2429] p-0.5 bg-[#121212]">
              <button
                type="button"
                class="flex-1 rounded-md py-1.5 text-xs font-medium"
                :class="orderType === 'market' ? 'bg-[#00b464]/20 text-[#00b464]' : 'text-white/45'"
                @click="orderType = 'market'"
              >
                市价
              </button>
              <button
                type="button"
                class="flex-1 rounded-md py-1.5 text-xs font-medium"
                :class="orderType === 'limit' ? 'bg-[#00b464]/20 text-[#00b464]' : 'text-white/45'"
                @click="orderType = 'limit'"
              >
                限价
              </button>
            </div>
            <div class="flex justify-between text-[11px] text-white/50">
              <span>可用</span>
              <span class="font-mono">0.00 {{ activePair.quote }}</span>
            </div>
            <label class="block text-[11px] text-white/45">{{ activePair.quote }}</label>
            <input
              v-model="qtyQuote"
              type="text"
              placeholder="请输入数量"
              class="w-full rounded-lg border border-[#1f2429] bg-[#1e2329] py-2 px-2 text-sm text-white placeholder:text-[#848e9c]"
            />
            <label class="block text-[11px] text-white/45">{{ activePair.base }}</label>
            <input
              v-model="quantity"
              type="text"
              placeholder="请输入数量"
              class="w-full rounded-lg border border-[#1f2429] bg-[#1e2329] py-2 px-2 text-sm text-white placeholder:text-[#848e9c]"
            />
            <div class="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                class="rounded-lg bg-[#3d8f62] py-3 text-xs font-bold tracking-tight text-white shadow-md shadow-[#3d8f62]/15 transition hover:brightness-105"
                @click="submitDemoOrder('long')"
              >
                买入
              </button>
              <button
                type="button"
                class="rounded-lg bg-[#F05A5E] py-3 text-xs font-bold tracking-tight text-white shadow-md shadow-[#F05A5E]/20 transition hover:brightness-105"
                @click="submitDemoOrder('short')"
              >
                卖出
              </button>
            </div>
          </template>
        </div>

        <div class="max-h-[220px] shrink-0 overflow-y-auto border-b border-[#1a1c21] bg-[#121214]">
          <div
            class="sticky top-0 flex items-center justify-between border-b border-[#1a1c21] bg-[#121214] px-3 py-2 text-[11px] font-medium text-[#8e8e93]"
          >
            <span>币对</span>
            <span>最新价</span>
            <span class="w-14 text-right">涨跌</span>
          </div>
          <button
            v-for="row in marketMiniRows"
            :key="row.idx"
            type="button"
            class="flex w-full items-center justify-between px-3 py-2 text-left text-xs transition hover:bg-white/[0.03]"
            :class="
              row.idx === activePairIdx
                ? 'bg-[#152019] text-[#9bc99f] ring-1 ring-inset ring-[#4d7c59]/25'
                : 'text-white'
            "
            @click="activePairIdx = row.idx"
          >
            <span class="font-medium">{{ row.label }}</span>
            <span class="font-mono tabular-nums">{{ row.price }}</span>
            <span
              class="w-14 text-right font-mono tabular-nums text-[10px]"
              :class="changeClass(row.pct)"
            >
              {{ row.pct >= 0 ? '+' : '' }}{{ row.pct.toFixed(2) }}%
            </span>
          </button>
        </div>

        <div class="flex gap-2 border-t border-[#1a1c21] bg-[#121214] p-3">
          <RouterLink
            :to="`${prefix}/personal-center/assets`"
            class="flex-1 rounded-lg border border-[#2a2b31] py-2 text-center text-xs text-[#a1a1a6] transition hover:border-[#4d7c59]/35 hover:bg-white/[0.03] hover:text-white"
          >
            充币
          </RouterLink>
          <RouterLink
            :to="`${prefix}/personal-center/assets`"
            class="flex-1 rounded-lg border border-[#2a2b31] py-2 text-center text-xs text-[#a1a1a6] transition hover:border-[#4d7c59]/35 hover:bg-white/[0.03] hover:text-white"
          >
            提币
          </RouterLink>
          <RouterLink
            :to="`${prefix}/personal-center/assets`"
            class="flex-1 rounded-lg border border-[#2a2b31] py-2 text-center text-xs text-[#a1a1a6] transition hover:border-[#4d7c59]/35 hover:bg-white/[0.03] hover:text-white"
          >
            划转
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- ——— 移动端：参考 MDFEX 双列（左下单 + 右盘口），K 线全屏时底部方向条 ——— -->
    <div class="lg:hidden bg-black text-white">
      <div
        class="sticky top-14 z-20 border-b border-white/[0.04] bg-black/95 px-2.5 py-2 backdrop-blur-sm supports-[backdrop-filter]:bg-black/90"
      >
        <div class="flex items-stretch gap-2">
          <button
            type="button"
            class="flex min-h-[42px] min-w-0 flex-[1.1] items-center gap-1.5 rounded-lg border border-white/[0.05] bg-[#141414] px-2.5 py-2 text-left active:bg-[#1a1a1a]"
            @click="openPairDrawer"
          >
            <span class="truncate text-[14px] font-semibold leading-tight tracking-tight">{{ symbol }}</span>
            <span class="truncate text-[11px] text-white/40">{{ modeMenuLabel }}</span>
            <svg class="ml-auto h-3.5 w-3.5 shrink-0 text-white/35" viewBox="0 0 24 24" fill="none">
              <path
                d="m6 9 6 6 6-6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            class="flex min-h-[42px] max-w-[36%] items-center gap-1 rounded-lg border border-white/[0.05] bg-[#141414] px-2.5 py-2 text-left text-[12px] font-medium text-white/90 active:bg-[#1a1a1a] sm:max-w-none"
            @click="openModeSheet"
          >
            <span class="truncate">{{ modeMenuLabel }}</span>
            <svg class="ml-auto h-3.5 w-3.5 shrink-0 text-white/35" viewBox="0 0 24 24" fill="none">
              <path
                d="m6 9 6 6 6-6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            class="flex min-h-[42px] min-w-[42px] shrink-0 items-center justify-center rounded-lg border border-white/[0.05] bg-[#141414] active:bg-[#1a1a1a]"
            :class="chartExpanded ? 'text-[#4ade80] ring-1 ring-[#4ade80]/35' : 'text-white/45'"
            aria-label="展开或收起 K 线"
            @click="chartExpanded = !chartExpanded"
          >
            <svg class="h-[1.15rem] w-[1.15rem]" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 18V6M8 16V9M12 14v-5M16 11V7M20 15v-6"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
              />
              <path d="M3 20h18" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div
        class="px-2.5 pt-2"
        :class="
          chartExpanded
            ? 'pb-[calc(10.85rem+env(safe-area-inset-bottom,0px))]'
            : 'pb-[calc(5.85rem+env(safe-area-inset-bottom,0px))]'
        "
      >
        <!-- 行情概要：交易视图与 K 线模式共用 -->
        <header
          class="mb-2 border-b border-white/[0.04] pb-2 pt-0"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1">
              <p
                class="font-mono text-[1.35rem] font-bold leading-none tracking-tight tabular-nums"
                :class="changeClass(changePct)"
              >
                {{ lastPrice }}
              </p>
              <div class="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0">
                <span
                  class="text-[11px] font-mono font-medium tabular-nums"
                  :class="changeClass(changePct)"
                >
                  {{ changePct >= 0 ? '+' : '' }}{{ changePct.toFixed(3) }}%
                </span>
                <span class="text-[11px] font-mono tabular-nums text-[#4ade80]">
                  ≈$ {{ lastPrice }}
                </span>
              </div>
            </div>
            <div
              class="flex w-[min(48%,11rem)] shrink-0 flex-col gap-1 text-[11px] leading-snug sm:w-auto sm:min-w-[10rem]"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="shrink-0 text-white/45">24H 最高</span>
                <span class="min-w-0 truncate text-right font-mono tabular-nums text-white">
                  {{ stats24h.high }}
                </span>
              </div>
              <div class="flex items-center justify-between gap-2">
                <span class="shrink-0 text-white/45">24H 最低</span>
                <span class="min-w-0 truncate text-right font-mono tabular-nums text-white">
                  {{ stats24h.low }}
                </span>
              </div>
              <div class="flex items-center justify-between gap-2">
                <span class="shrink-0 text-white/45">24H 交易额</span>
                <span class="min-w-0 truncate text-right font-mono tabular-nums text-white">
                  {{ stats24h.tradeAmtShort }}
                </span>
              </div>
            </div>
          </div>
        </header>

        <section
          v-show="chartExpanded"
          class="mb-3 overflow-hidden rounded-lg border border-white/[0.05] bg-[#0a0a0a]"
        >
          <div
            class="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.04] px-4 py-2.5"
          >
            <div class="flex w-full items-center gap-2 text-[11px] text-white/45">
              <span class="shrink-0">周期</span>
              <button
                type="button"
                class="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-[#141414] px-2.5 py-1.5 text-left text-xs text-[#eaecef] active:bg-[#1a1a1a]"
                @click="openMobilePicker('chartTf')"
              >
                <span class="truncate">{{ chartTimeframe }}</span>
                <svg
                  class="h-3.5 w-3.5 shrink-0 text-white/35"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="m6 9 6 6 6-6"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div class="relative flex min-h-[min(42vh,17.5rem)] items-end justify-center px-4 pb-4 pt-3">
            <div
              class="pointer-events-none absolute inset-0 opacity-[0.1]"
              style="
                background-image: linear-gradient(#1f2429 1px, transparent 1px),
                  linear-gradient(90deg, #1f2429 1px, transparent 1px);
                background-size: 20px 20px;
              "
            />
            <div class="relative h-28 w-[92%] max-w-md sm:h-32">
              <div
                class="h-full w-full bg-gradient-to-t from-rose-500/20 via-emerald-500/10 to-transparent"
                style="clip-path: polygon(0% 65%, 12% 48%, 22% 55%, 32% 40%, 42% 52%, 52% 35%, 62% 45%, 72% 30%, 82% 38%, 92% 28%, 100% 42%, 100% 100%, 0% 100%)"
              />
            </div>
          </div>
          <p class="border-t border-white/[0.04] px-3 pt-2 text-[10px] text-white/35">
            以下为市场公开数据（演示），非本人委托
          </p>
          <div class="flex border-b border-white/[0.04] px-1">
            <button
              type="button"
              class="flex-1 py-2 text-xs font-medium"
              :class="
                chartMarketTab === 'depth'
                  ? 'border-b-2 border-[#4ade80] text-[#4ade80]'
                  : 'text-white/45'
              "
              @click="chartMarketTab = 'depth'"
            >
              委托订单
            </button>
            <button
              type="button"
              class="flex-1 py-2 text-xs font-medium"
              :class="
                chartMarketTab === 'tape'
                  ? 'border-b-2 border-[#4ade80] text-[#4ade80]'
                  : 'text-white/45'
              "
              @click="chartMarketTab = 'tape'"
            >
              最新成交
            </button>
          </div>
          <!-- 市场盘口：左买量 | 中间价 | 右卖量 -->
          <div
            v-if="chartMarketTab === 'depth'"
            class="max-h-[14rem] overflow-y-auto overscroll-contain px-2 pb-2 pt-1"
          >
            <div
              class="grid grid-cols-3 gap-0.5 pb-1 text-[10px] font-medium text-white/40"
            >
              <span class="text-left">数量({{ activePair.base }})</span>
              <span class="text-center">价格({{ activePair.quote }})</span>
              <span class="text-right">数量({{ activePair.base }})</span>
            </div>
            <div class="font-mono text-[11px] tabular-nums leading-tight">
              <div
                v-for="(row, i) in depthAsksReversed"
                :key="'ask-' + i"
                class="grid grid-cols-3 items-center py-[3px]"
              >
                <span class="text-left text-white/25">—</span>
                <span class="text-center text-[#f87171]">{{ row.p }}</span>
                <div class="relative py-0.5 text-right">
                  <div
                    class="pointer-events-none absolute inset-y-0 right-0 bg-rose-500/16"
                    :style="{ width: `${row.bar}%` }"
                  />
                  <span class="relative text-white/75">{{ row.q }}</span>
                </div>
              </div>
              <div
                class="border-y border-white/[0.05] bg-black/40 py-1.5 text-center text-[13px] font-bold text-white"
              >
                {{ lastPrice }}
              </div>
              <div
                v-for="(row, i) in depthBids"
                :key="'bid-' + i"
                class="grid grid-cols-3 items-center py-[3px]"
              >
                <div class="relative py-0.5 text-left">
                  <div
                    class="pointer-events-none absolute inset-y-0 left-0 bg-emerald-500/16"
                    :style="{ width: `${row.bar}%` }"
                  />
                  <span class="relative text-white/75">{{ row.q }}</span>
                </div>
                <span class="text-center text-[#4ade80]">{{ row.p }}</span>
                <span class="text-right text-white/25">—</span>
              </div>
            </div>
          </div>
          <!-- 市场最新成交 -->
          <div
            v-else
            class="max-h-[14rem] overflow-y-auto overscroll-contain px-2 pb-2 pt-1"
          >
            <div
              class="grid grid-cols-3 gap-1 border-b border-white/[0.04] pb-1 text-[10px] font-medium text-white/40"
            >
              <span>时间</span>
              <span class="text-center">价格({{ activePair.quote }})</span>
              <span class="text-right">数量({{ activePair.base }})</span>
            </div>
            <ul class="m-0 list-none p-0 font-mono text-[11px] tabular-nums">
              <li
                v-for="(row, i) in klineMarketTrades"
                :key="'kt-' + i"
                class="grid grid-cols-3 items-center py-1.5 text-white/80"
              >
                <span class="text-white/45">{{ row.time }}</span>
                <span
                  class="text-center"
                  :class="row.isBuy ? 'text-[#4ade80]' : 'text-[#f87171]'"
                >
                  {{ row.price }}
                </span>
                <span class="text-right">{{ row.qty }}</span>
              </li>
            </ul>
          </div>
        </section>

        <!-- K 线收起：参考 MDFEX 左表单 + 右盘口 -->
        <div v-show="!chartExpanded" id="mobile-order-anchor" class="flex gap-2.5">
          <div class="min-w-0 flex-[1.12] space-y-2 py-0.5 pl-0.5 pr-0">
            <div v-if="isContract" class="flex flex-wrap gap-1.5 text-[10px] text-white/45">
              <span class="rounded border border-white/[0.06] px-1.5 py-0.5">全仓</span>
              <span class="rounded border border-white/[0.06] px-1.5 py-0.5">{{ leverage }}×</span>
            </div>

            <div class="grid grid-cols-2 gap-1">
              <template v-if="isContract">
                <button
                  type="button"
                  class="rounded-md py-2.5 text-[13px] font-bold transition"
                  :class="
                    positionSide === 'long'
                      ? 'bg-gradient-to-b from-[#1a4d38]/95 to-[#0d281c] text-[#4ade80] shadow-[inset_0_1px_0_rgba(74,222,128,0.15)] ring-1 ring-[#4ade80]/35'
                      : 'bg-[#1a1a1a] text-white/38'
                  "
                  @click="positionSide = 'long'"
                >
                  做多
                </button>
                <button
                  type="button"
                  class="rounded-md py-2.5 text-[13px] font-bold transition"
                  :class="
                    positionSide === 'short'
                      ? 'bg-gradient-to-b from-[#4a2529]/95 to-[#30181c] text-[#fca5a5] shadow-[inset_0_1px_0_rgba(252,165,165,0.12)] ring-1 ring-[#f87171]/35'
                      : 'bg-[#1a1a1a] text-white/38'
                  "
                  @click="positionSide = 'short'"
                >
                  做空
                </button>
              </template>
              <template v-else>
                <button
                  type="button"
                  class="rounded-md py-2.5 text-[13px] font-bold transition"
                  :class="
                    positionSide === 'long'
                      ? 'bg-gradient-to-b from-[#1a4d38]/95 to-[#0d281c] text-[#4ade80] shadow-[inset_0_1px_0_rgba(74,222,128,0.15)] ring-1 ring-[#4ade80]/35'
                      : 'bg-[#1a1a1a] text-white/38'
                  "
                  @click="positionSide = 'long'"
                >
                  买入
                </button>
                <button
                  type="button"
                  class="rounded-md py-2.5 text-[13px] font-bold transition"
                  :class="
                    positionSide === 'short'
                      ? 'bg-gradient-to-b from-[#4a2529]/95 to-[#30181c] text-[#fca5a5] shadow-[inset_0_1px_0_rgba(252,165,165,0.12)] ring-1 ring-[#f87171]/35'
                      : 'bg-[#1a1a1a] text-white/38'
                  "
                  @click="positionSide = 'short'"
                >
                  卖出
                </button>
              </template>
            </div>

            <button
              type="button"
              class="flex w-full items-center justify-between gap-2 rounded-md border border-white/[0.05] bg-[#141414] px-2.5 py-2 text-left text-[13px] text-white active:bg-[#1a1a1a]"
              @click="openMobilePicker('orderType')"
            >
              <span>{{ orderType === 'market' ? '市价' : '限价' }}</span>
              <svg
                class="h-4 w-4 shrink-0 text-white/30"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="m6 9 6 6 6-6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>

            <div v-if="tradeMode === 'perpetual'" class="flex items-center gap-2">
              <span class="shrink-0 text-[10px] text-white/40">杠杆</span>
              <button
                type="button"
                class="flex min-w-0 flex-1 items-center justify-between gap-1 rounded-md border border-white/[0.05] bg-[#141414] px-2 py-1.5 text-left text-[12px] text-white active:bg-[#1a1a1a]"
                @click="openMobilePicker('leverage')"
              >
                <span>{{ leverage }}×</span>
                <svg
                  class="h-3.5 w-3.5 shrink-0 text-white/30"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="m6 9 6 6 6-6"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div v-if="tradeMode === 'delivery'">
              <button
                type="button"
                class="flex w-full items-center justify-between gap-2 rounded-md border border-white/[0.05] bg-[#141414] px-2 py-1.5 text-left text-[11px] text-white active:bg-[#1a1a1a]"
                @click="openMobilePicker('delivery')"
              >
                <span class="line-clamp-2 min-w-0">{{ selectedDeliveryPeriod }}</span>
                <svg
                  class="h-3.5 w-3.5 shrink-0 text-white/30"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="m6 9 6 6 6-6"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div class="space-y-1">
              <input
                v-if="orderType === 'limit'"
                v-model="orderPrice"
                type="text"
                inputmode="decimal"
                :placeholder="lastPrice"
                class="w-full rounded-md border border-white/[0.05] bg-[#141414] px-2.5 py-2.5 font-mono text-[14px] font-semibold tabular-nums text-white placeholder:text-white/25 focus:border-[#4ade80]/50 focus:outline-none"
              />
              <input
                v-else
                type="text"
                readonly
                :value="lastPrice"
                class="w-full cursor-default rounded-md border border-white/[0.05] bg-[#141414] px-2.5 py-2.5 font-mono text-[14px] font-semibold tabular-nums text-white/90"
              />
              <p class="text-[10px] text-white/35">≈ ${{ lastPrice }}</p>
            </div>

            <template v-if="tradeMode === 'spot'">
              <div class="relative">
                <input
                  v-model="qtyQuote"
                  type="text"
                  inputmode="decimal"
                  placeholder="请输入数量"
                  class="w-full rounded-md border border-white/[0.05] bg-[#141414] py-2.5 pl-2.5 pr-10 text-[13px] text-white placeholder:text-white/25 focus:border-[#4ade80]/50 focus:outline-none"
                />
                <span
                  class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-white/35"
                >
                  USDT
                </span>
              </div>
            </template>
            <template v-else>
              <div class="relative">
                <input
                  v-model="quantity"
                  type="text"
                  inputmode="decimal"
                  :placeholder="tradeMode === 'perpetual' ? '数量(张)' : '请输入数量'"
                  class="w-full rounded-md border border-white/[0.05] bg-[#141414] py-2.5 pl-2.5 pr-9 text-[13px] text-white placeholder:text-white/25 focus:border-[#4ade80]/50 focus:outline-none"
                />
                <span
                  class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-white/35"
                >
                  {{ tradeMode === 'perpetual' ? '张' : activePair.base }}
                </span>
              </div>
            </template>

            <div class="grid grid-cols-4 gap-1">
              <button
                v-for="p in [25, 50, 75, 100]"
                :key="p"
                type="button"
                class="rounded border border-white/[0.09] bg-transparent py-2 text-[11px] font-semibold text-white/50 active:bg-white/[0.05]"
                @click="setQtyPct(p)"
              >
                {{ p }}%
              </button>
            </div>

            <template v-if="tradeMode === 'perpetual'">
              <label class="flex cursor-pointer items-center gap-2 text-[11px] text-white/45">
                <input
                  v-model="tpSl"
                  type="checkbox"
                  class="h-3.5 w-3.5 rounded border-white/[0.11] bg-[#141414] text-[#4ade80] accent-[#4ade80]"
                />
                止盈止损
              </label>
              <div v-if="tpSl" class="space-y-1">
                <input
                  v-model="takeProfitPrice"
                  type="text"
                  inputmode="decimal"
                  placeholder="止盈 USDT"
                  class="w-full rounded-md border border-white/[0.05] bg-[#141414] px-2 py-1.5 text-center text-[11px] text-white placeholder:text-white/25 focus:border-[#4ade80]/45 focus:outline-none"
                />
                <input
                  v-model="stopLossPrice"
                  type="text"
                  inputmode="decimal"
                  placeholder="止损 USDT"
                  class="w-full rounded-md border border-white/[0.05] bg-[#141414] px-2 py-1.5 text-center text-[11px] text-white placeholder:text-white/25 focus:border-[#4ade80]/45 focus:outline-none"
                />
              </div>
            </template>

            <div
              v-if="tradeMode === 'delivery'"
              class="flex justify-between text-[10px] text-white/40"
            >
              <span>预计收益</span>
              <span class="font-mono text-white/55">--</span>
            </div>

            <button
              type="button"
              class="w-full rounded-lg py-2.5 text-[14px] font-bold shadow-lg transition active:opacity-90"
              :class="
                positionSide === 'long'
                  ? 'bg-[#58bd8c] text-black shadow-[#58bd8c]/25'
                  : 'bg-[#e85d5d] text-white shadow-[#e85d5d]/20'
              "
              @click="submitDemoOrder()"
            >
              {{ primaryCtaLabel }}
            </button>

            <div class="space-y-0.5 text-[10px] leading-relaxed text-white/40">
              <p>可用 0.00 {{ activePair.quote }}</p>
              <p v-if="tradeMode === 'spot'">可用 0.00 {{ activePair.base }}</p>
            </div>

            <p class="text-center text-[10px] text-white/25">演示数据，无真实成交</p>
          </div>

          <div
            class="flex min-h-[14rem] min-w-0 flex-[0.88] flex-col border-l border-white/[0.04] pl-2"
          >
            <div
              class="grid grid-cols-2 gap-0.5 pb-1.5 text-[10px] font-medium text-white/40"
            >
              <span>价格(USDT)</span>
              <span class="text-right">数量({{ activePair.base }})</span>
            </div>
            <div
              class="max-h-[min(50vh,22rem)] flex-1 overflow-y-auto overscroll-contain pr-0.5 [-webkit-overflow-scrolling:touch]"
            >
              <ul class="m-0 list-none p-0">
                <li
                  v-for="(row, i) in depthAsks"
                  :key="'ma2-' + i"
                  class="relative grid grid-cols-2 py-[3px] font-mono text-[11px] tabular-nums leading-tight"
                >
                  <div
                    class="pointer-events-none absolute inset-y-0 right-0 bg-emerald-500/[0.14]"
                    :style="{ width: `${row.bar}%` }"
                  />
                  <span class="relative text-[#4ade80]">{{ row.p }}</span>
                  <span class="relative text-right text-white/55">{{ row.q }}</span>
                </li>
              </ul>
              <div
                class="sticky top-0 z-[1] border-y border-white/[0.05] bg-black py-2 text-center font-mono text-[13px] font-bold tabular-nums text-white"
              >
                {{ lastPrice }}
              </div>
              <ul class="m-0 list-none p-0">
                <li
                  v-for="(row, i) in depthBids"
                  :key="'mb2-' + i"
                  class="relative grid grid-cols-2 py-[3px] font-mono text-[11px] tabular-nums leading-tight"
                >
                  <div
                    class="pointer-events-none absolute inset-y-0 right-0 bg-rose-500/[0.14]"
                    :style="{ width: `${row.bar}%` }"
                  />
                  <span class="relative text-[#f87171]">{{ row.p }}</span>
                  <span class="relative text-right text-white/55">{{ row.q }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div v-show="!chartExpanded" class="mt-3 border-t border-white/[0.04] pt-1">
          <div class="flex text-[13px] font-medium">
            <button
              type="button"
              class="flex-1 py-2.5 transition"
              :class="
                tradeBottomTab === 'orders'
                  ? 'border-b-2 border-[#4ade80] text-[#4ade80]'
                  : 'border-b-2 border-transparent text-white/40'
              "
              @click="tradeBottomTab = 'orders'"
            >
              当前委托
            </button>
            <button
              type="button"
              class="flex-1 py-2.5 transition"
              :class="
                tradeBottomTab === 'trades'
                  ? 'border-b-2 border-[#4ade80] text-[#4ade80]'
                  : 'border-b-2 border-transparent text-white/40'
              "
              @click="tradeBottomTab = 'trades'"
            >
              历史订单
            </button>
          </div>
          <div
            class="max-h-[min(40vh,16rem)] overflow-y-auto overscroll-contain px-0.5"
          >
            <ul
              v-if="tradeBottomTab === 'orders'"
              class="m-0 list-none divide-y divide-white/[0.06] p-0"
            >
              <li
                v-for="row in mobileDemoOpenOrders"
                :key="'m-' + row.id"
                class="py-2.5 first:pt-1"
              >
                <div class="mb-1 flex items-start justify-between gap-2">
                  <div class="min-w-0 flex flex-wrap items-center gap-1.5">
                    <span
                      class="text-[12px] font-semibold"
                      :class="row.sideLong ? 'text-[#4ade80]' : 'text-[#f87171]'"
                    >
                      {{ row.sideLabel }}
                    </span>
                    <span class="text-[10px] text-white/35">{{ row.pair }}</span>
                    <span
                      class="rounded bg-white/[0.06] px-1 py-px text-[10px] text-white/45"
                    >
                      {{ row.modeTag }}
                    </span>
                  </div>
                  <span class="shrink-0 font-mono text-[10px] text-white/35">{{
                    row.time
                  }}</span>
                </div>
                <p class="font-mono text-[10px] leading-relaxed text-white/55">
                  <span class="text-white/40">{{ row.type }}</span>
                  <span class="mx-1 text-white/20">·</span>
                  <span>{{ row.price }}</span>
                  <span class="mx-1 text-white/20">·</span>
                  <span>{{ row.amount }}</span>
                </p>
                <p class="mt-1 text-[10px] text-white/35">已成交 {{ row.filled }}</p>
              </li>
            </ul>
            <ul
              v-else
              class="m-0 list-none divide-y divide-white/[0.06] p-0"
            >
              <li
                v-for="row in mobileDemoHistOrders"
                :key="'mh-' + row.id"
                class="py-2.5 first:pt-1"
              >
                <div class="mb-1 flex items-start justify-between gap-2">
                  <span
                    class="text-[12px] font-semibold"
                    :class="row.sideLong ? 'text-[#4ade80]' : 'text-[#f87171]'"
                  >
                    {{ row.sideLabel }}
                  </span>
                  <span class="shrink-0 font-mono text-[10px] text-white/35">{{
                    row.time
                  }}</span>
                </div>
                <p class="font-mono text-[10px] leading-relaxed text-white/55">
                  <span class="text-white/40">{{ row.type }}</span>
                  <span class="mx-1 text-white/20">·</span>
                  <span>{{ row.price }}</span>
                  <span class="mx-1 text-white/20">·</span>
                  <span>{{ row.amount }}</span>
                </p>
                <p
                  class="mt-1 text-[10px]"
                  :class="
                    row.status === '已撤销' ? 'text-amber-400/90' : 'text-white/40'
                  "
                >
                  {{ row.status }}
                </p>
              </li>
            </ul>
          </div>
        </div>

        <p class="mt-2 text-center text-[10px] text-white/25">
          行情与盘口为演示数据
        </p>
      </div>

      <!-- K 线展开：底部悬浮做多/做空（或买/卖），点击进入下单页填数量，不在此直接成交 -->
      <div
        v-show="chartExpanded"
        class="fixed left-0 right-0 z-[35] border-t border-white/[0.05] bg-black/95 px-3 py-2 shadow-[0_-12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md lg:hidden"
        :style="{ bottom: 'calc(0.5rem + 3.5rem + 0.6rem + env(safe-area-inset-bottom, 0px))' }"
      >
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            class="flex min-h-[46px] items-center justify-center rounded-lg bg-[#58bd8c] text-[14px] font-bold text-black active:opacity-90"
            @click="leaveChartToOrder('long')"
          >
            {{ isContract ? '做多买入' : '买入' }}
          </button>
          <button
            type="button"
            class="flex min-h-[46px] items-center justify-center rounded-lg bg-[#e85d5d] text-[14px] font-bold text-white active:opacity-90"
            @click="leaveChartToOrder('short')"
          >
            {{ isContract ? '做空卖出' : '卖出' }}
          </button>
        </div>
      </div>

    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="pairDrawerOpen"
          class="fixed inset-0 z-[60] bg-black/55 backdrop-blur-[1px] lg:hidden"
          aria-hidden="true"
          @click="closePairDrawer"
        />
      </Transition>
      <Transition name="slide-left">
        <aside
          v-if="pairDrawerOpen"
          class="trade-pair-drawer-panel fixed bottom-0 left-0 top-0 z-[61] flex h-full w-[min(18rem,86vw)] max-w-[100vw] flex-col border-r border-[#1f2429] bg-[#0b0e11] shadow-2xl shadow-black/50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="trade-pair-drawer-title"
          @click.stop
        >
          <div
            class="flex shrink-0 items-center justify-between gap-2 border-b border-[#1f2429] bg-[#0b0e11]/95 px-2 py-2 pt-[max(0.5rem,env(safe-area-inset-top,0px))]"
          >
            <div class="min-w-0 px-2">
              <h2 id="trade-pair-drawer-title" class="text-sm font-semibold text-lime-300">
                交易对
              </h2>
              <p class="mt-0.5 text-[11px] text-[#848e9c]">选择市场</p>
            </div>
            <button
              type="button"
              class="rounded-lg p-2 text-[#848e9c] transition hover:bg-white/[0.08] hover:text-white"
              aria-label="关闭"
              @click="closePairDrawer"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="m6 6 12 12M18 6 6 18"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>
          <ul
            class="pair-drawer-scroll min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain px-2 py-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]"
            role="listbox"
            aria-label="交易对列表"
          >
            <li v-for="(p, i) in pairs" :key="p.base + p.quote">
              <button
                type="button"
                role="option"
                :aria-selected="i === activePairIdx"
                class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium transition"
                :class="
                  i === activePairIdx
                    ? 'bg-lime-400/10 text-lime-200'
                    : 'text-[#eaecef] hover:bg-white/[0.06]'
                "
                @click="selectPair(i)"
              >
                <span
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1f2429] text-[11px] font-bold uppercase tracking-tight text-lime-400/90"
                  aria-hidden="true"
                >
                  {{ pairListBadge(p.base) }}
                </span>
                <span class="min-w-0 flex-1 truncate font-mono tabular-nums">{{ p.base }} / {{ p.quote }}</span>
                <svg
                  v-if="i === activePairIdx"
                  class="h-5 w-5 shrink-0 text-lime-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M20 6 9 17l-5-5"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </li>
          </ul>
        </aside>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="mobilePickerOpen"
          class="fixed inset-0 z-[62] bg-black/55 lg:hidden"
          @click="closeMobilePicker"
        />
      </Transition>
      <Transition name="slide-up">
        <div
          v-if="mobilePickerOpen"
          class="fixed bottom-0 left-0 right-0 z-[63] max-h-[min(70vh,28rem)] flex flex-col rounded-t-2xl border border-white/[0.06] bg-[#1e2329] pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] pt-2 shadow-[0_-16px_48px_rgba(0,0,0,0.45)] lg:hidden"
          role="dialog"
          :aria-label="mobilePickerTitle"
        >
          <div class="mx-auto mb-2 h-1 w-10 shrink-0 rounded-full bg-white/15" />
          <p class="shrink-0 px-4 pb-2 text-center text-sm font-semibold text-white">
            {{ mobilePickerTitle }}
          </p>
          <ul class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2">
            <li
              v-for="opt in mobilePickerOptionList"
              :key="String(opt.value)"
              class="border-b border-white/[0.04] last:border-0"
            >
              <button
                type="button"
                class="flex w-full items-center justify-between px-4 py-3.5 text-left text-base text-white/90 transition hover:bg-white/[0.04] active:bg-white/[0.06]"
                @click="confirmMobilePick(opt.value)"
              >
                <span class="min-w-0 flex-1 pr-2 leading-snug">{{ opt.label }}</span>
                <svg
                  v-if="isMobilePickerOptionSelected(opt.value)"
                  class="h-5 w-5 shrink-0 text-[#4ade80]"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M20 6 9 17l-5-5"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </li>
          </ul>
          <button
            type="button"
            class="mx-3 mt-2 w-[calc(100%-1.5rem)] shrink-0 rounded-xl border border-white/[0.06] py-3 text-sm text-white/70"
            @click="closeMobilePicker"
          >
            取消
          </button>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="modeSheetOpen" class="fixed inset-0 z-[60] bg-black/55 lg:hidden" @click="closeModeSheet" />
      </Transition>
      <Transition name="slide-up">
        <div
          v-if="modeSheetOpen"
          class="fixed bottom-0 left-0 right-0 z-[61] rounded-t-2xl border border-white/[0.06] bg-[#1e2329] pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] pt-2 lg:hidden"
          role="dialog"
          aria-label="选择交易类型"
        >
          <div class="mx-auto mb-2 h-1 w-10 rounded-full bg-white/15" />
          <ul class="px-2">
            <li v-for="t in tradeTabs" :key="t.key" class="border-b border-white/[0.04] last:border-0">
              <button
                type="button"
                class="flex w-full items-center justify-between px-4 py-3.5 text-left text-base text-white/90"
                @click="goMode(t.to)"
              >
                {{ t.label }}
                <svg
                  v-if="route.path.replace(/\/$/, '') === t.to.replace(/\/$/, '')"
                  class="h-5 w-5 text-[#a78bfa]"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M20 6 9 17l-5-5"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </li>
          </ul>
          <button
            type="button"
            class="mx-3 mt-2 w-[calc(100%-1.5rem)] rounded-xl border border-white/[0.06] py-3 text-sm text-white/70"
            @click="closeModeSheet"
          >
            取消
          </button>
        </div>
      </Transition>
      <Transition name="fade">
        <div
          v-if="orderToast"
          class="fixed left-1/2 top-[max(0.75rem,env(safe-area-inset-top))] z-[80] max-w-[min(92vw,24rem)] -translate-x-1/2 px-3"
          role="status"
        >
          <p
            class="rounded-xl bg-[#1e2329] px-4 py-2.5 text-center text-sm leading-snug text-white shadow-lg ring-1 ring-white/10"
          >
            {{ orderToast }}
          </p>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* 与主导航抽屉一致：可滚动、无滚动条轨 */
.pair-drawer-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.pair-drawer-scroll::-webkit-scrollbar {
  display: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.24s ease;
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.24s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
