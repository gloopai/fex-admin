<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const clamp = (n, min, max) => Math.min(max, Math.max(min, n))

const formatCompactNumber = (n, digits) => {
  const str = Number(n).toFixed(digits)
  return str.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1')
}

const formatCompactUsd = (value, withSign = false) => {
  const n = Number(value || 0)
  const sign = n < 0 ? '-' : n > 0 ? '+' : ''
  const abs = Math.abs(n)
  let unit = ''
  let scaled = abs
  let digits = 0
  if (abs >= 1e9) {
    unit = 'B'
    scaled = abs / 1e9
    digits = 1
  } else if (abs >= 1e6) {
    unit = 'M'
    scaled = abs / 1e6
    digits = 1
  } else if (abs >= 1e3) {
    unit = 'K'
    scaled = abs / 1e3
    digits = 1
  }
  const body = `${formatCompactNumber(scaled, digits)}${unit}`
  return `${withSign ? sign : ''}$${body}`
}

const formatPrice = (value) => {
  const v = Number(value || 0)
  if (!Number.isFinite(v)) return '-'
  const digits = v >= 1000 ? 2 : v >= 10 ? 3 : 5
  return v.toFixed(digits).replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1')
}

const pad2 = (n) => String(n).padStart(2, '0')
const formatCountdown = (sec) => {
  const s = Math.max(0, Math.floor(Number(sec || 0)))
  return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`
}

const tickSizeFor = (asset, price) => {
  const s = String(asset || '').toUpperCase()
  if (s.includes('BTC')) return 1
  if (s.includes('ETH')) return 0.1
  if (s.includes('SOL')) return 0.01
  if (price >= 10) return 0.01
  if (price >= 1) return 0.001
  return 0.00001
}

const roundToTick = (price, tick) => {
  const t = Number(tick || 0)
  if (!t) return Number(price || 0)
  return Math.round(Number(price || 0) / t) * t
}

const seeded = (key) => {
  const s = String(key || '')
  let x = 2166136261
  for (let i = 0; i < s.length; i++) {
    x ^= s.charCodeAt(i)
    x = Math.imul(x, 16777619)
  }
  return () => {
    x ^= x << 13
    x ^= x >>> 17
    x ^= x << 5
    return (x >>> 0) / 4294967296
  }
}

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  row: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue', 'lock'])

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const close = () => {
  open.value = false
}

const key = computed(() => props.row?.key || '')
const label = computed(() => props.row?.label || '-')
const asset = computed(() => props.row?.asset || '')
const tierSec = computed(() => Number(props.row?.tierSec || 0))
const marketPrice = computed(() => Number(props.row?.marketPrice || 0))
const remainSec = computed(() => Number(props.row?.remainSec ?? 0))
const tickSize = computed(() => tickSizeFor(asset.value, marketPrice.value))

const positionsByKey = ref({})

const generatePositions = (seedKey, mp) => {
  const rand = seeded(`${seedKey}_positions`)
  const items = []
  const baseCount = 28
  const maintenance = 0.005
  const maxLev = 100

  const mkUid = (i) => {
    const base = Math.floor(rand() * 1_000_000)
    return String(100000 + ((base + i * 97) % 899999))
  }

  for (let i = 0; i < baseCount; i++) {
    const uid = mkUid(i)
    const whaleBoost = i < 3 ? 1.75 : 1
    const leverage = Math.max(2, Math.min(maxLev, Math.round(2 + rand() * 98)))
    const principal = Math.round((800 + rand() * 12_000) * whaleBoost)
    const side = rand() < 0.56 ? 'long' : 'short'
    const entrySkew = (rand() * 2 - 1) * (i < 3 ? 0.006 : 0.014)
    const entryPrice = mp * (1 - entrySkew)
    const notional = principal * leverage
    const qty = mp ? notional / mp : 0
    const liquidationPrice =
      side === 'long'
        ? entryPrice * (1 - (1 / leverage) + maintenance)
        : entryPrice * (1 + (1 / leverage) - maintenance)
    items.push({
      uid,
      side,
      principal,
      leverage,
      entryPrice,
      qty,
      liquidationPrice
    })
  }

  items.sort((a, b) => Number(b.principal * b.leverage) - Number(a.principal * a.leverage))
  return items
}

watch(
  () => key.value,
  () => {
    if (!key.value) return
    if (!positionsByKey.value[key.value]) {
      positionsByKey.value = {
        ...positionsByKey.value,
        [key.value]: generatePositions(key.value, marketPrice.value)
      }
    }
  },
  { immediate: true }
)

const allPositions = computed(() => {
  if (!key.value) return []
  return positionsByKey.value[key.value] || []
})

const userPnlAt = (pos, settlementPrice) => {
  const p = Number(settlementPrice || 0)
  const entry = Number(pos.entryPrice || 0)
  const qty = Number(pos.qty || 0)
  if (!qty) return 0
  const signed = (p - entry) * qty
  return pos.side === 'short' ? -signed : signed
}

const priceBandPct = computed(() => {
  const p = marketPrice.value
  if (p >= 1000) return 0.02
  if (p >= 10) return 0.03
  return 0.05
})

const priceMin = computed(() => roundToTick(marketPrice.value * (1 - priceBandPct.value), tickSize.value))
const priceMax = computed(() => roundToTick(marketPrice.value * (1 + priceBandPct.value), tickSize.value))

const platformProfitAt = (settlementPrice) => {
  return -allPositions.value.reduce((sum, pos) => sum + userPnlAt(pos, settlementPrice), 0)
}

const profitCurve = computed(() => {
  const min = priceMin.value
  const max = priceMax.value
  const steps = 120
  if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) return []
  const points = []
  for (let i = 0; i <= steps; i++) {
    const price = min + ((max - min) * i) / steps
    points.push({ price, profit: platformProfitAt(price) })
  }
  return points
})

const bestPoint = computed(() => {
  const points = profitCurve.value
  if (points.length === 0) return { price: marketPrice.value, profit: platformProfitAt(marketPrice.value) }
  let best = points[0]
  for (const p of points) {
    if (p.profit > best.profit) best = p
  }
  return best
})

const breakevenPoint = computed(() => {
  const points = profitCurve.value
  if (points.length === 0) return { price: marketPrice.value, profit: 0 }
  let best = points[0]
  let bestAbs = Math.abs(best.profit)
  for (const p of points) {
    const abs = Math.abs(p.profit)
    if (abs < bestAbs) {
      bestAbs = abs
      best = p
    }
  }
  return best
})

const svgLandscape = computed(() => {
  const points = profitCurve.value
  const w = 620
  const h = 220
  const pad = 22
  if (points.length === 0) return { w, h, pad, path: '', minProfit: 0, maxProfit: 0, xFor: null, yFor: null }
  const profits = points.map((p) => p.profit)
  const minProfit = Math.min(...profits)
  const maxProfit = Math.max(...profits)
  const span = maxProfit - minProfit || 1
  const xFor = (price) => {
    const t = (price - priceMin.value) / (priceMax.value - priceMin.value)
    return pad + clamp(t, 0, 1) * (w - pad * 2)
  }
  const yFor = (profit) => {
    const t = (profit - minProfit) / span
    return h - pad - clamp(t, 0, 1) * (h - pad * 2)
  }
  const d = points
    .map((p, idx) => {
      const x = xFor(p.price)
      const y = yFor(p.profit)
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
  return { w, h, pad, path: d, minProfit, maxProfit, xFor, yFor }
})

const deathZones = computed(() => {
  if (!svgLandscape.value.xFor) return []
  const points = profitCurve.value
  const zones = []
  let start = null
  for (let i = 0; i < points.length; i++) {
    const neg = Number(points[i].profit || 0) < 0
    if (neg && start === null) start = points[i].price
    if (!neg && start !== null) {
      zones.push({ from: start, to: points[i].price })
      start = null
    }
  }
  if (start !== null && points.length) zones.push({ from: start, to: points[points.length - 1].price })
  return zones
})

const harvestZone = computed(() => {
  const points = profitCurve.value
  if (points.length < 2) return null
  const span = (priceMax.value - priceMin.value) * 0.06
  return { from: bestPoint.value.price - span, to: bestPoint.value.price + span }
})

const controlPrice = ref(0)
const mode = ref('force')
const slippagePoints = ref(8)
const slippageDir = ref('sub')
const locked = ref(false)
const lastAction = ref('')
const hoverPrice = ref(null)

const previewSettlementPrice = computed(() => {
  if (hoverPrice.value !== null && Number.isFinite(Number(hoverPrice.value))) return Number(hoverPrice.value)
  return finalSettlementPrice.value
})

const previewPlatformPnl = computed(() => platformProfitAt(previewSettlementPrice.value))

const markHoverPrice = (evt) => {
  if (!svgLandscape.value.xFor) return
  const box = evt.currentTarget?.getBoundingClientRect?.()
  if (!box) return
  const x = clamp(evt.clientX - box.left, svgLandscape.value.pad, svgLandscape.value.w - svgLandscape.value.pad)
  const t = (x - svgLandscape.value.pad) / (svgLandscape.value.w - svgLandscape.value.pad * 2)
  const p = priceMin.value + t * (priceMax.value - priceMin.value)
  hoverPrice.value = roundToTick(p, tickSize.value)
}

const clearHover = () => {
  hoverPrice.value = null
}

watch(
  () => key.value,
  () => {
    controlPrice.value = roundToTick(marketPrice.value, tickSize.value)
    mode.value = 'force'
    slippagePoints.value = 8
    slippageDir.value = 'sub'
    locked.value = false
    lastAction.value = ''
    hoverPrice.value = null
  },
  { immediate: true }
)

watch([priceMin, priceMax, tickSize], () => {
  if (mode.value !== 'force') return
  const next = roundToTick(clamp(controlPrice.value, priceMin.value, priceMax.value), tickSize.value)
  if (Number.isFinite(next)) controlPrice.value = next
})

const finalSettlementPrice = computed(() => {
  if (mode.value === 'slippage') {
    const sign = slippageDir.value === 'add' ? 1 : -1
    const points = Math.max(0, Number(slippagePoints.value || 0))
    return roundToTick(marketPrice.value + sign * points * tickSize.value, tickSize.value)
  }
  return roundToTick(clamp(controlPrice.value, priceMin.value, priceMax.value), tickSize.value)
})

const estPlatformPnl = computed(() => platformProfitAt(finalSettlementPrice.value))

const onCurveClick = (evt) => {
  if (locked.value) return
  const box = evt.currentTarget?.getBoundingClientRect?.()
  if (!box) return
  const x = clamp(evt.clientX - box.left, svgLandscape.value.pad, svgLandscape.value.w - svgLandscape.value.pad)
  const t = (x - svgLandscape.value.pad) / (svgLandscape.value.w - svgLandscape.value.pad * 2)
  const p = priceMin.value + t * (priceMax.value - priceMin.value)
  mode.value = 'force'
  controlPrice.value = roundToTick(p, tickSize.value)
  lastAction.value = `曲线点选：${formatPrice(controlPrice.value)}`
}

const stopLossPriceOf = (pos, lossFraction) => {
  const entry = Number(pos.entryPrice || 0)
  const qty = Number(pos.qty || 0)
  const principal = Math.max(0, Number(pos.principal || 0))
  if (!qty) return entry
  const loss = principal * clamp(Number(lossFraction || 0), 0, 1)
  const p = pos.side === 'long' ? entry - loss / qty : entry + loss / qty
  return roundToTick(clamp(p, priceMin.value, priceMax.value), tickSize.value)
}

const blastPriceOf = (pos) => stopLossPriceOf(pos, 1)

const positionsWithStats = computed(() => {
  return allPositions.value.map((p) => {
    return {
      ...p,
      pnlNow: userPnlAt(p, marketPrice.value),
      stopLossPrice: stopLossPriceOf(p, 0.5),
      blastPrice: blastPriceOf(p)
    }
  })
})

const topProfitUsers = computed(() => {
  return [...positionsWithStats.value].sort((a, b) => Number(b.pnlNow || 0) - Number(a.pnlNow || 0)).slice(0, 20)
})

const blastOne = (pos) => {
  if (locked.value) return
  if (!pos) return
  mode.value = 'force'
  controlPrice.value = pos.blastPrice
  hoverPrice.value = null
  lastAction.value = `一键爆破：${pos.uid} → ${formatPrice(controlPrice.value)}`
}

const nudge = (dir) => {
  if (locked.value) return
  mode.value = 'force'
  controlPrice.value = roundToTick(controlPrice.value + Number(dir || 0) * tickSize.value, tickSize.value)
}

const lockPlan = () => {
  locked.value = true
  lastAction.value = `锁定收割方案：${formatPrice(finalSettlementPrice.value)}`
  emit('lock', {
    key: key.value,
    label: label.value,
    asset: asset.value,
    tierSec: tierSec.value,
    mode: mode.value,
    settlementPrice: finalSettlementPrice.value,
    estPlatformPnl: estPlatformPnl.value
  })
}

const hedgeStatus = computed(() => {
  const exposure = Number(props.row?.platformDelta || 0)
  const denom = Math.max(1, Number(props.row?.position || 0))
  const ratio = Math.abs(exposure) / denom
  if (ratio >= 0.35) return { text: '极度风险', cls: 'bg-rose-100 text-rose-700 border-rose-200' }
  if (ratio >= 0.18) return { text: '平衡', cls: 'bg-amber-100 text-amber-700 border-amber-200' }
  return { text: '绝对安全', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
})

const priceHistory = ref([])
watch(
  () => marketPrice.value,
  (p) => {
    if (!Number.isFinite(p) || p <= 0) return
    const now = Date.now()
    const next = [...priceHistory.value, { t: now, p: Number(p) }].slice(-90)
    const cutoff = now - 60_000
    priceHistory.value = next.filter((x) => x.t >= cutoff)
  },
  { immediate: true }
)

const volatilityPct = computed(() => {
  const hist = priceHistory.value
  if (!hist || hist.length < 6) return 0
  const rets = []
  for (let i = 1; i < hist.length; i++) {
    const prev = Number(hist[i - 1].p || 0)
    const cur = Number(hist[i].p || 0)
    if (!prev || !cur) continue
    rets.push(Math.log(cur / prev))
  }
  if (rets.length < 5) return 0
  const mean = rets.reduce((s, x) => s + x, 0) / rets.length
  const v = rets.reduce((s, x) => s + (x - mean) * (x - mean), 0) / Math.max(1, rets.length - 1)
  return Math.sqrt(v) * 100
})

const volTone = computed(() => {
  const v = volatilityPct.value
  if (v >= 0.9) return { text: '波动偏大', cls: 'text-rose-700' }
  if (v >= 0.45) return { text: '波动适中', cls: 'text-amber-700' }
  return { text: '波动平稳', cls: 'text-emerald-700' }
})

const flowWindowSec = ref(20)
const flowEvents = ref([])
const heartbeat = ref(0)
let flowTimer = null

const pushFlow = () => {
  if (!key.value) return
  const rand = seeded(`${key.value}_${Math.floor(Date.now() / 1000)}_flow`)
  const notional = allPositions.value.reduce((s, p) => s + Number(p.principal || 0) * Number(p.leverage || 0), 0)
  const base = Math.max(800, notional * 0.0018)
  const spike = rand() < 0.08 ? 3.5 : 1
  const longIn = base * spike * (0.55 + rand() * 0.75)
  const shortIn = base * spike * (0.55 + rand() * 0.75)
  const now = Date.now()
  const next = [...flowEvents.value, { t: now, longIn, shortIn }].slice(-240)
  const cutoff = now - Math.max(5, Number(flowWindowSec.value || 20)) * 1000
  flowEvents.value = next.filter((x) => x.t >= cutoff)
  heartbeat.value++
}

watch(
  () => open.value,
  (v) => {
    if (v) {
      if (!flowTimer) {
        pushFlow()
        flowTimer = setInterval(pushFlow, 1000)
      }
    } else if (flowTimer) {
      clearInterval(flowTimer)
      flowTimer = null
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (flowTimer) clearInterval(flowTimer)
})

const flowSpeed = computed(() => {
  heartbeat.value
  const events = flowEvents.value
  const window = Math.max(5, Number(flowWindowSec.value || 20))
  if (!events.length) return { longPerSec: 0, shortPerSec: 0 }
  const longSum = events.reduce((s, e) => s + Number(e.longIn || 0), 0)
  const shortSum = events.reduce((s, e) => s + Number(e.shortIn || 0), 0)
  return { longPerSec: longSum / window, shortPerSec: shortSum / window }
})

const indexPrices = computed(() => {
  heartbeat.value
  if (!key.value) return { binance: marketPrice.value, okx: marketPrice.value, avg: marketPrice.value }
  const t = Math.floor(Date.now() / 1000)
  const r1 = seeded(`${key.value}_${t}_bin`)()
  const r2 = seeded(`${key.value}_${t}_okx`)()
  const binance = marketPrice.value * (1 + (r1 * 2 - 1) * 0.0016)
  const okx = marketPrice.value * (1 + (r2 * 2 - 1) * 0.0014)
  return { binance, okx, avg: (binance + okx) / 2 }
})

const outlierCheck = computed(() => {
  const avg = Number(indexPrices.value.avg || 0)
  const p = Number(previewSettlementPrice.value || 0)
  const diffPct = avg ? (Math.abs(p - avg) / avg) * 100 : 0
  if (diffPct < 0.3) return { tone: 'green', text: '绿灯', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', diffPct }
  if (diffPct < 1.0) return { tone: 'yellow', text: '黄灯', cls: 'bg-amber-100 text-amber-700 border-amber-200', diffPct }
  return { tone: 'red', text: '红灯', cls: 'bg-rose-100 text-rose-700 border-rose-200', diffPct }
})

const klineByKey = ref({})
const generateKline = (seedKey, mp) => {
  const rand = seeded(`${seedKey}_kline`)
  const candles = []
  let last = Number(mp || 0) || 1
  for (let i = 0; i < 26; i++) {
    const drift = (rand() * 2 - 1) * 0.0022
    const open = last
    const close = Math.max(0.00001, open * (1 + drift))
    const wick = Math.abs((rand() * 2 - 1) * 0.0018)
    const high = Math.max(open, close) * (1 + wick)
    const low = Math.min(open, close) * (1 - wick)
    candles.push({ open, close, high, low })
    last = close
  }
  if (candles.length) candles[candles.length - 1].close = Number(mp || candles[candles.length - 1].close)
  return candles
}

watch(
  () => key.value,
  () => {
    if (!key.value) return
    if (!klineByKey.value[key.value]) {
      klineByKey.value = { ...klineByKey.value, [key.value]: generateKline(key.value, marketPrice.value) }
    }
  },
  { immediate: true }
)

watch(
  () => marketPrice.value,
  (p) => {
    if (!key.value) return
    const candles = klineByKey.value[key.value]
    if (!candles?.length || !Number.isFinite(p) || p <= 0) return
    const last = candles[candles.length - 1]
    const close = Number(p)
    const high = Math.max(Number(last.high || 0), close)
    const low = Math.min(Number(last.low || 0), close)
    const next = [...candles]
    next[next.length - 1] = { ...last, close, high, low }
    klineByKey.value = { ...klineByKey.value, [key.value]: next }
  }
)

const klineSvg = computed(() => {
  const candles = klineByKey.value[key.value] || []
  const w = 620
  const h = 160
  const pad = 18
  if (!candles.length) return { w, h, pad, candles: [], yFor: null, xFor: null, min: 0, max: 0 }
  const lows = candles.map((c) => Number(c.low || 0))
  const highs = candles.map((c) => Number(c.high || 0))
  const extra = [Number(previewSettlementPrice.value || 0), Number(marketPrice.value || 0)]
  const min = Math.min(...lows, ...extra)
  const max = Math.max(...highs, ...extra)
  const span = max - min || 1
  const yFor = (price) => {
    const t = (Number(price || 0) - min) / span
    return h - pad - clamp(t, 0, 1) * (h - pad * 2)
  }
  const xFor = (idx) => {
    const step = (w - pad * 2) / Math.max(1, candles.length)
    return pad + idx * step + step * 0.5
  }
  return { w, h, pad, candles, yFor, xFor, min, max }
})

</script>

<template>
  <transition name="slide">
    <div v-if="open" class="fixed inset-0 z-40">
      <div class="absolute inset-0 bg-slate-900/35" @click="close"></div>
      <div class="absolute right-0 top-0 h-full w-full max-w-7xl bg-white shadow-2xl flex flex-col">
        <div class="border-b border-slate-200 px-6 py-4">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="text-xs text-slate-500">The War Room Header</div>
              <h2 class="mt-1 text-xl font-semibold text-slate-900">实施场控：{{ label }}</h2>
              <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                <span class="font-mono">倒计时 {{ formatCountdown(remainSec) }}</span>
                <span class="text-slate-300">|</span>
                <span>市价 {{ formatPrice(marketPrice) }}</span>
                <span class="text-slate-300">|</span>
                <span>预演结算 {{ formatPrice(previewSettlementPrice) }}</span>
                <span class="text-slate-300">|</span>
                <span>平台利润 {{ formatCompactUsd(previewPlatformPnl, true) }}</span>
              </div>
            </div>
          <button
            type="button"
            class="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            @click="close"
          >
            关闭
          </button>
          </div>

          <div class="mt-4 grid gap-3 md:grid-cols-3">
            <div class="rounded-xl border border-slate-200 bg-white p-4">
              <div class="flex items-center justify-between">
                <div class="text-xs font-semibold text-slate-900">平台对冲状态</div>
                <span class="inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold" :class="hedgeStatus.cls">
                  {{ hedgeStatus.text }}
                </span>
              </div>
              <div class="mt-2 text-[11px] text-slate-500">基于净敞口与持仓规模估算的安全区间</div>
            </div>

            <div class="rounded-xl border border-slate-200 bg-white p-4">
              <div class="flex items-center justify-between">
                <div class="text-xs font-semibold text-slate-900">价格波动计</div>
                <div class="font-mono text-sm text-slate-900">{{ volatilityPct.toFixed(2) }}%</div>
              </div>
              <div class="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>近 60s 波动率</span>
                <span :class="volTone.cls">{{ volTone.text }}</span>
              </div>
            </div>

            <div class="rounded-xl border border-slate-200 bg-white p-4">
              <div class="flex items-center justify-between">
                <div class="text-xs font-semibold text-slate-900">资金流速</div>
                <div class="text-[11px] text-slate-500">近 {{ flowWindowSec }}s</div>
              </div>
              <div class="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div class="text-slate-500">多头注入</div>
                  <div class="mt-1 font-mono text-slate-900">{{ formatCompactUsd(flowSpeed.longPerSec, true) }}/s</div>
                </div>
                <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div class="text-slate-500">空头注入</div>
                  <div class="mt-1 font-mono text-slate-900">{{ formatCompactUsd(flowSpeed.shortPerSec, true) }}/s</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <div class="grid gap-4 lg:grid-cols-12">
             <section class="lg:col-span-6 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50/40">
                <div>
                  <h3 class="text-sm font-semibold text-slate-900">用户列表</h3>
                  <p class="mt-0.5 text-[11px] text-slate-500">Top 20 · 关键参数/爆仓止损/一键爆破</p>
                </div>
                <div class="text-[11px] text-slate-400 font-mono">Advanced Scanner</div>
              </div>

              <div class="space-y-4">
                <div class="max-h-[520px] overflow-auto">
                  <table class="w-full text-left text-xs">
                    <thead class="bg-slate-50 text-[11px] text-slate-500">
                      <tr>
                        <th class="px-3 py-2 font-medium">UID</th>
                        <th class="px-3 py-2 font-medium">方向</th>
                        <th class="px-3 py-2 font-medium">本金</th>
                        <th class="px-3 py-2 font-medium">开仓价</th>
                        <th class="px-3 py-2 font-medium">当前盈亏</th>
                        <th class="px-3 py-2 font-medium">爆仓/止损</th>
                        <th class="px-3 py-2 font-medium">预演盈亏</th>
                        <th class="px-3 py-2 font-medium text-right">爆破</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      <tr v-for="pos in topProfitUsers" :key="pos.uid" class="hover:bg-slate-50/60">
                        <td class="px-3 py-2 align-top font-mono text-slate-900">{{ pos.uid }}</td>
                        <td class="px-3 py-2 align-top">
                          <span
                            class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
                            :class="pos.side === 'long' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'"
                          >
                            {{ pos.side === 'long' ? '多' : '空' }}
                          </span>
                        </td>
                        <td class="px-3 py-2 align-top font-mono text-slate-700">{{ formatCompactUsd(pos.principal) }}</td>
                        <td class="px-3 py-2 align-top font-mono text-slate-700">{{ formatPrice(pos.entryPrice) }}</td>
                        <td class="px-3 py-2 align-top font-mono" :class="pos.pnlNow < 0 ? 'text-rose-700' : 'text-emerald-700'">
                          {{ formatCompactUsd(pos.pnlNow, true) }}
                        </td>
                        <td class="px-3 py-2 align-top">
                          <div class="font-mono text-[11px] text-slate-700">{{ formatPrice(pos.liquidationPrice) }}</div>
                          <div class="mt-1 font-mono text-[11px] text-slate-500">{{ formatPrice(pos.stopLossPrice) }}</div>
                        </td>
                        <td
                          class="px-3 py-2 align-top font-mono"
                          :class="userPnlAt(pos, previewSettlementPrice) < 0 ? 'text-rose-700' : 'text-emerald-700'"
                        >
                          {{ formatCompactUsd(userPnlAt(pos, previewSettlementPrice), true) }}
                        </td>
                        <td class="px-3 py-2 align-top text-right">
                          <button
                            type="button"
                            class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                            :disabled="locked"
                            @click="blastOne(pos)"
                            title="一键爆破：自动调至吞掉本金的价位"
                          >
                            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M12 2v4m0 12v4M2 12h4m12 0h4" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
           

            <section class="lg:col-span-3 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50/40">
                <div>
                  <h3 class="text-sm font-semibold text-slate-900">指令执行区</h3>
                  <p class="mt-0.5 text-[11px] text-slate-500">强制结算价 / 滑点注入</p>
                </div>
                <div class="text-[11px] text-slate-400 font-mono">Command Center</div>
              </div>

              <div class="p-5 space-y-4">
                <div class="space-y-2">
                  <div class="text-xs font-semibold text-slate-900">干预模式</div>
                  <div class="grid gap-2">
                    <label class="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
                      <input
                        type="radio"
                        name="mode"
                        value="force"
                        class="h-4 w-4 text-slate-900 focus:ring-slate-900"
                        v-model="mode"
                        :disabled="locked"
                      />
                      <div class="text-sm text-slate-900">强制结算价</div>
                    </label>
                    <label class="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
                      <input
                        type="radio"
                        name="mode"
                        value="slippage"
                        class="h-4 w-4 text-slate-900 focus:ring-slate-900"
                        v-model="mode"
                        :disabled="locked"
                      />
                      <div class="text-sm text-slate-900">滑点注入</div>
                    </label>
                  </div>
                </div>

                <div class="rounded-lg border border-slate-200 p-3 space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="text-xs font-semibold text-slate-900">结算价</div>
                    <div class="font-mono text-xs text-slate-700">{{ formatPrice(finalSettlementPrice) }}</div>
                  </div>

                  <div v-if="mode === 'force'" class="space-y-2">
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        class="h-9 w-9 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                        :disabled="locked"
                        @click="nudge(-1)"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        class="h-9 flex-1 rounded-lg border border-slate-200 px-3 font-mono text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-0 disabled:bg-slate-50"
                        v-model.number="controlPrice"
                        :step="tickSize"
                        :min="priceMin"
                        :max="priceMax"
                        :disabled="locked"
                      />
                      <button
                        type="button"
                        class="h-9 w-9 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                        :disabled="locked"
                        @click="nudge(1)"
                      >
                        +
                      </button>
                    </div>
                    <div class="text-[11px] text-slate-500">
                      区间 {{ formatPrice(priceMin) }} ~ {{ formatPrice(priceMax) }} · Tick {{ formatPrice(tickSize) }}
                    </div>
                  </div>

                  <div v-else class="space-y-2">
                    <div class="grid grid-cols-2 gap-2">
                      <select
                        class="h-9 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-0 disabled:bg-slate-50"
                        v-model="slippageDir"
                        :disabled="locked"
                      >
                        <option value="sub">-</option>
                        <option value="add">+</option>
                      </select>
                      <input
                        type="number"
                        class="h-9 rounded-lg border border-slate-200 px-3 font-mono text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-0 disabled:bg-slate-50"
                        v-model.number="slippagePoints"
                        min="0"
                        :disabled="locked"
                      />
                    </div>
                    <div class="text-[11px] text-slate-500">基于当前市价注入滑点：N 个点（Tick）</div>
                  </div>
                </div>

                <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div class="text-xs text-slate-600">
                    平台预估盈亏
                    <span class="ml-1 font-mono" :class="estPlatformPnl < 0 ? 'text-rose-700' : 'text-emerald-700'">
                      {{ formatCompactUsd(estPlatformPnl, true) }}
                    </span>
                  </div>
                  <div v-if="lastAction" class="mt-1 text-[11px] text-slate-500">{{ lastAction }}</div>
                </div>

                <button
                  type="button"
                  class="w-full rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
                  :disabled="locked"
                  @click="lockPlan"
                >
                  锁定收割方案
                </button>
              </div>
            </section>

             <section class="lg:col-span-3 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50/40">
                <div>
                  <h3 class="text-sm font-semibold text-slate-900">预览</h3>
                  <p class="mt-0.5 text-[11px] text-slate-500">K 线模拟 + 利润地图</p>
                </div>
                <div class="text-[11px] text-slate-400 font-mono">Preview</div>
              </div>

              <div class="p-5 space-y-4">
                <div class="rounded-lg border border-slate-200 bg-white p-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="text-xs font-semibold text-slate-900">K 线模拟</div>
                      <div class="mt-0.5 text-[11px] text-slate-500">虚线插针：按预演结算价显示“针”的长度</div>
                    </div>
                    <div class="text-right text-[11px]">
                      <div class="text-slate-400">离群度自检</div>
                      <div class="mt-1 inline-flex items-center rounded-full border px-2.5 py-1 font-semibold" :class="outlierCheck.cls">
                        {{ outlierCheck.text }} · {{ outlierCheck.diffPct.toFixed(2) }}%
                      </div>
                    </div>
                  </div>

                  <svg class="mt-3 w-full" :viewBox="`0 0 ${klineSvg.w} ${klineSvg.h}`">
                    <rect x="0" y="0" :width="klineSvg.w" :height="klineSvg.h" fill="#ffffff" rx="10" />
                    <g v-if="klineSvg.candles.length && klineSvg.xFor">
                      <g v-for="(c, i) in klineSvg.candles" :key="i">
                        <line
                          :x1="klineSvg.xFor(i)"
                          :x2="klineSvg.xFor(i)"
                          :y1="klineSvg.yFor(c.high)"
                          :y2="klineSvg.yFor(c.low)"
                          stroke="#94a3b8"
                          stroke-width="1.2"
                        />
                        <rect
                          :x="klineSvg.xFor(i) - 4.2"
                          :y="Math.min(klineSvg.yFor(c.open), klineSvg.yFor(c.close))"
                          width="8.4"
                          :height="Math.max(2, Math.abs(klineSvg.yFor(c.open) - klineSvg.yFor(c.close)))"
                          :fill="c.close >= c.open ? '#10b981' : '#f43f5e'"
                          opacity="0.85"
                          rx="2"
                        />
                      </g>

                      <line
                        :x1="klineSvg.xFor(klineSvg.candles.length - 1)"
                        :x2="klineSvg.xFor(klineSvg.candles.length - 1)"
                        :y1="klineSvg.yFor(marketPrice)"
                        :y2="klineSvg.yFor(previewSettlementPrice)"
                        stroke="#0f172a"
                        stroke-width="2"
                        stroke-dasharray="6 5"
                        opacity="0.8"
                      />
                      <circle
                        :cx="klineSvg.xFor(klineSvg.candles.length - 1)"
                        :cy="klineSvg.yFor(previewSettlementPrice)"
                        r="3.4"
                        fill="#0f172a"
                      />
                    </g>
                  </svg>

                  <div class="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-500">
                    <div>
                      <div class="text-slate-400">Binance 指数</div>
                      <div class="font-mono text-slate-900">{{ formatPrice(indexPrices.binance) }}</div>
                    </div>
                    <div>
                      <div class="text-slate-400">OKX 指数</div>
                      <div class="font-mono text-slate-900">{{ formatPrice(indexPrices.okx) }}</div>
                    </div>
                    <div>
                      <div class="text-slate-400">预演结算</div>
                      <div class="font-mono text-slate-900">{{ formatPrice(previewSettlementPrice) }}</div>
                    </div>
                  </div>
                </div>

                <div class="rounded-lg border border-slate-200 bg-white p-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="text-xs font-semibold text-slate-900">利润曲线图（利润地图）</div>
                      <div class="mt-0.5 text-[11px] text-slate-500">
                        悬停预演 · 点击选定结算价 · 红色为死亡区间 · 绿色为黄金收割区
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-[11px] text-slate-400">预演</div>
                      <div class="font-mono text-xs text-slate-900">{{ formatPrice(previewSettlementPrice) }}</div>
                    </div>
                  </div>

                  <svg
                    class="mt-3 w-full select-none"
                    :viewBox="`0 0 ${svgLandscape.w} ${svgLandscape.h}`"
                    @mousemove="markHoverPrice"
                    @mouseleave="clearHover"
                    @click="onCurveClick"
                  >
                    <rect x="0" y="0" :width="svgLandscape.w" :height="svgLandscape.h" fill="#ffffff" rx="10" />
                    <g v-if="svgLandscape.xFor">
                      <rect
                        v-for="(z, i) in deathZones"
                        :key="i"
                        :x="svgLandscape.xFor(z.from)"
                        :y="svgLandscape.pad"
                        :width="Math.max(1, svgLandscape.xFor(z.to) - svgLandscape.xFor(z.from))"
                        :height="svgLandscape.h - svgLandscape.pad * 2"
                        fill="#fb7185"
                        opacity="0.12"
                      />
                      <rect
                        v-if="harvestZone"
                        :x="svgLandscape.xFor(harvestZone.from)"
                        :y="svgLandscape.pad"
                        :width="Math.max(1, svgLandscape.xFor(harvestZone.to) - svgLandscape.xFor(harvestZone.from))"
                        :height="svgLandscape.h - svgLandscape.pad * 2"
                        fill="#22c55e"
                        opacity="0.10"
                      />
                      <line
                        :x1="svgLandscape.xFor(breakevenPoint.price)"
                        :x2="svgLandscape.xFor(breakevenPoint.price)"
                        :y1="svgLandscape.pad"
                        :y2="svgLandscape.h - svgLandscape.pad"
                        stroke="#cbd5e1"
                        stroke-dasharray="4 4"
                      />
                      <line
                        v-if="hoverPrice !== null"
                        :x1="svgLandscape.xFor(previewSettlementPrice)"
                        :x2="svgLandscape.xFor(previewSettlementPrice)"
                        :y1="svgLandscape.pad"
                        :y2="svgLandscape.h - svgLandscape.pad"
                        stroke="#0f172a"
                        stroke-dasharray="6 4"
                        opacity="0.8"
                      />
                      <path :d="svgLandscape.path" fill="none" stroke="#0f172a" stroke-width="2.25" />
                      <circle
                        :cx="svgLandscape.xFor(bestPoint.price)"
                        :cy="svgLandscape.yFor(bestPoint.profit)"
                        r="5"
                        fill="#22c55e"
                      />
                      <circle
                        :cx="svgLandscape.xFor(breakevenPoint.price)"
                        :cy="svgLandscape.yFor(breakevenPoint.profit)"
                        r="4.2"
                        fill="#64748b"
                      />
                      <circle
                        :cx="svgLandscape.xFor(marketPrice)"
                        :cy="svgLandscape.yFor(platformProfitAt(marketPrice))"
                        r="4.2"
                        fill="#0ea5e9"
                      />
                    </g>
                  </svg>

                  <div class="mt-3 grid grid-cols-3 gap-2 text-[11px] text-slate-500">
                    <div>
                      <div class="text-slate-400">盈亏平衡</div>
                      <div class="font-mono text-slate-900">{{ formatPrice(breakevenPoint.price) }}</div>
                    </div>
                    <div>
                      <div class="text-slate-400">最大利润点</div>
                      <div class="font-mono text-slate-900">{{ formatPrice(bestPoint.price) }}</div>
                    </div>
                    <div>
                      <div class="text-slate-400">预演利润</div>
                      <div class="font-mono" :class="previewPlatformPnl < 0 ? 'text-rose-700' : 'text-emerald-700'">
                        {{ formatCompactUsd(previewPlatformPnl, true) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

           
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 220ms ease, opacity 220ms ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(24px);
  opacity: 0;
}
</style>
