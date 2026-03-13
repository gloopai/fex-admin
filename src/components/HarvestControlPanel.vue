<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const clamp = (n, min, max) => Math.min(max, Math.max(min, n))

const median = (arr) => {
  const xs = (arr || []).map((x) => Number(x)).filter((x) => Number.isFinite(x))
  if (!xs.length) return 0
  xs.sort((a, b) => a - b)
  const mid = Math.floor((xs.length - 1) / 2)
  return xs.length % 2 ? xs[mid] : (xs[mid] + xs[mid + 1]) / 2
}

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
const selectedUids = ref([])

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
    const holdingMin = i < 6 ? 18 : 2
    const holdingMax = i < 6 ? 55 : 28
    const holdingSec = (holdingMin + rand() * (holdingMax - holdingMin)) * 60
    const openTs = Date.now() - holdingSec * 1000
    items.push({
      uid,
      side,
      principal,
      leverage,
      entryPrice,
      qty,
      liquidationPrice,
      openTs
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

const targetedPositions = computed(() => {
  const picked = selectedUids.value.map((x) => String(x))
  if (picked.length === 0) return allPositions.value
  const set = new Set(picked)
  return allPositions.value.filter((p) => set.has(String(p.uid)))
})

const userPnlAt = (pos, settlementPrice) => {
  const p = Number(settlementPrice || 0)
  const entry = Number(pos.entryPrice || 0)
  const qty = Number(pos.qty || 0)
  if (!qty) return 0
  const signed = (p - entry) * qty
  return pos.side === 'short' ? -signed : signed
}

const priceHistory = ref([])
const windowPriceEnabled = ref(false)

const contractWindowSec = computed(() => {
  const sec = Number(tierSec.value || 0)
  if (!Number.isFinite(sec) || sec <= 0) return 0
  return clamp(sec, 5, 600)
})

const windowMarkPrice = computed(() => {
  const raw = Number(marketPrice.value || 0)
  if (!windowPriceEnabled.value) return raw
  const sec = Math.max(0, Number(contractWindowSec.value || 0))
  const hist = priceHistory.value
  if (!sec || !hist.length || !Number.isFinite(raw) || raw <= 0) return raw
  const cutoff = Date.now() - sec * 1000
  const picked = hist.filter((x) => Number(x?.t || 0) >= cutoff)
  if (picked.length === 0) return raw
  const sum = picked.reduce((s, x) => s + Number(x?.p || 0), 0)
  const avg = sum / picked.length
  return Number.isFinite(avg) && avg > 0 ? avg : raw
})

const markPrice = computed(() => {
  const p = Number(windowMarkPrice.value || 0)
  const raw = Number(marketPrice.value || 0)
  if (Number.isFinite(p) && p > 0) return p
  return Number.isFinite(raw) && raw > 0 ? raw : 0
})

const priceBandPct = computed(() => {
  const p = markPrice.value
  if (p >= 1000) return 0.02
  if (p >= 10) return 0.03
  return 0.05
})

const priceMin = computed(() => roundToTick(markPrice.value * (1 - priceBandPct.value), tickSize.value))
const priceMax = computed(() => roundToTick(markPrice.value * (1 + priceBandPct.value), tickSize.value))

const platformProfitAtUniform = (settlementPrice) => {
  return -targetedPositions.value.reduce((sum, pos) => sum + userPnlAt(pos, settlementPrice), 0)
}

const platformProfitAtSqueeze = (longSettlementPrice, shortSettlementPrice) => {
  return -targetedPositions.value.reduce((sum, pos) => {
    const p = pos.side === 'long' ? longSettlementPrice : shortSettlementPrice
    return sum + userPnlAt(pos, p)
  }, 0)
}

const controlPrice = ref(0)
const mode = ref('force')
const slippagePoints = ref(8)
const slippageDir = ref('sub')
const squeezePoints = ref(6)
const squeezeCenter = ref(0)
const locked = ref(false)
const lastAction = ref('')
const hoverPrice = ref(null)

const squeezeGap = computed(() => Math.max(0, Number(squeezePoints.value || 0)) * tickSize.value)

const squeezeCenterMin = computed(() => {
  const min = priceMin.value + squeezeGap.value
  const max = priceMax.value - squeezeGap.value
  if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) return priceMin.value
  return roundToTick(min, tickSize.value)
})

const squeezeCenterMax = computed(() => {
  const min = priceMin.value + squeezeGap.value
  const max = priceMax.value - squeezeGap.value
  if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) return priceMax.value
  return roundToTick(max, tickSize.value)
})

const settlementPrices = computed(() => {
  if (mode.value !== 'squeeze') {
    const p = finalSettlementPrice.value
    return { long: p, short: p }
  }
  const center = clamp(squeezeCenter.value, squeezeCenterMin.value, squeezeCenterMax.value)
  const gap = squeezeGap.value
  const long = roundToTick(clamp(center - gap, priceMin.value, priceMax.value), tickSize.value)
  const short = roundToTick(clamp(center + gap, priceMin.value, priceMax.value), tickSize.value)
  return { long, short }
})

const platformProfitAtForCurve = (centerOrUniformPrice) => {
  const p = Number(centerOrUniformPrice || 0)
  if (mode.value === 'squeeze') {
    const gap = squeezeGap.value
    const longP = clamp(p - gap, priceMin.value, priceMax.value)
    const shortP = clamp(p + gap, priceMin.value, priceMax.value)
    return platformProfitAtSqueeze(longP, shortP)
  }
  return platformProfitAtUniform(p)
}

const curveMin = computed(() => {
  if (mode.value !== 'squeeze') return priceMin.value
  const min = squeezeCenterMin.value
  const max = squeezeCenterMax.value
  if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) return priceMin.value
  return min
})

const curveMax = computed(() => {
  if (mode.value !== 'squeeze') return priceMax.value
  const min = squeezeCenterMin.value
  const max = squeezeCenterMax.value
  if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) return priceMax.value
  return max
})

const profitCurve = computed(() => {
  const min = curveMin.value
  const max = curveMax.value
  const steps = 120
  if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) return []
  const points = []
  for (let i = 0; i <= steps; i++) {
    const price = min + ((max - min) * i) / steps
    points.push({ price, profit: platformProfitAtForCurve(price) })
  }
  return points
})

const bestPoint = computed(() => {
  const points = profitCurve.value
  if (points.length === 0) return { price: marketPrice.value, profit: platformProfitAtForCurve(marketPrice.value) }
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
    const t = (price - curveMin.value) / (curveMax.value - curveMin.value)
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
  const span = (curveMax.value - curveMin.value) * 0.06
  return { from: bestPoint.value.price - span, to: bestPoint.value.price + span }
})

const hoverSettlementPrice = computed(() => {
  const raw = hoverPrice.value
  const n = Number(raw)
  if (raw === null) return null
  if (!Number.isFinite(n)) return null
  return n
})

const previewSettlementPrice = computed(() => {
  return finalSettlementPrice.value
})

const previewPlatformPnl = computed(() => {
  if (mode.value === 'squeeze') return platformProfitAtSqueeze(settlementPrices.value.long, settlementPrices.value.short)
  return platformProfitAtUniform(previewSettlementPrice.value)
})

const userPreviewSettlementPrice = (pos) => {
  if (mode.value !== 'squeeze') return previewSettlementPrice.value
  return pos?.side === 'long' ? settlementPrices.value.long : settlementPrices.value.short
}

const userPreviewPnl = (pos) => {
  return userPnlAt(pos, userPreviewSettlementPrice(pos))
}

const markHoverPrice = (evt) => {
  if (!svgLandscape.value.xFor) return
  const box = evt.currentTarget?.getBoundingClientRect?.()
  if (!box) return
  const x = clamp(evt.clientX - box.left, svgLandscape.value.pad, svgLandscape.value.w - svgLandscape.value.pad)
  const t = (x - svgLandscape.value.pad) / (svgLandscape.value.w - svgLandscape.value.pad * 2)
  const p = curveMin.value + t * (curveMax.value - curveMin.value)
  hoverPrice.value = roundToTick(p, tickSize.value)
}

const clearHover = () => {
  hoverPrice.value = null
}

watch(
  () => key.value,
  () => {
    priceHistory.value = []
    controlPrice.value = roundToTick(marketPrice.value, tickSize.value)
    squeezeCenter.value = roundToTick(marketPrice.value, tickSize.value)
    mode.value = 'force'
    slippagePoints.value = 8
    slippageDir.value = 'sub'
    squeezePoints.value = 6
    locked.value = false
    lastAction.value = ''
    hoverPrice.value = null
    selectedUids.value = []
  },
  { immediate: true }
)

watch([priceMin, priceMax, tickSize, squeezePoints], () => {
  if (mode.value === 'force') {
    const next = roundToTick(clamp(controlPrice.value, priceMin.value, priceMax.value), tickSize.value)
    if (Number.isFinite(next)) controlPrice.value = next
  }
  if (mode.value === 'squeeze') {
    const next = roundToTick(clamp(squeezeCenter.value, squeezeCenterMin.value, squeezeCenterMax.value), tickSize.value)
    if (Number.isFinite(next)) squeezeCenter.value = next
  }
})

const finalSettlementPrice = computed(() => {
  if (mode.value === 'squeeze') {
    return roundToTick(clamp(squeezeCenter.value, squeezeCenterMin.value, squeezeCenterMax.value), tickSize.value)
  }
  return roundToTick(clamp(controlPrice.value, priceMin.value, priceMax.value), tickSize.value)
})

const estPlatformPnl = computed(() => {
  if (mode.value === 'squeeze') return platformProfitAtSqueeze(settlementPrices.value.long, settlementPrices.value.short)
  return platformProfitAtUniform(finalSettlementPrice.value)
})

const applySlippageToControlPrice = () => {
  if (locked.value) return
  mode.value = 'force'
  const sign = slippageDir.value === 'add' ? 1 : -1
  const points = Math.max(0, Number(slippagePoints.value || 0))
  const next = roundToTick(markPrice.value + sign * points * tickSize.value, tickSize.value)
  controlPrice.value = roundToTick(clamp(next, priceMin.value, priceMax.value), tickSize.value)
  hoverPrice.value = null
  lastAction.value = `滑点应用：${slippageDir.value === 'add' ? '+' : '-'}${points} → ${formatPrice(controlPrice.value)}`
}

const onCurveClick = (evt) => {
  if (locked.value) return
  const box = evt.currentTarget?.getBoundingClientRect?.()
  if (!box) return
  const x = clamp(evt.clientX - box.left, svgLandscape.value.pad, svgLandscape.value.w - svgLandscape.value.pad)
  const t = (x - svgLandscape.value.pad) / (svgLandscape.value.w - svgLandscape.value.pad * 2)
  const p = curveMin.value + t * (curveMax.value - curveMin.value)
  if (mode.value === 'squeeze') {
    squeezeCenter.value = roundToTick(clamp(p, squeezeCenterMin.value, squeezeCenterMax.value), tickSize.value)
    lastAction.value = `曲线点选：中心 ${formatPrice(squeezeCenter.value)}`
  } else {
    mode.value = 'force'
    controlPrice.value = roundToTick(p, tickSize.value)
    lastAction.value = `曲线点选：${formatPrice(controlPrice.value)}`
  }
  hoverPrice.value = null
}

const fillSettlementPrice = (price, labelText) => {
  if (locked.value) return
  if (mode.value === 'squeeze') {
    squeezeCenter.value = roundToTick(clamp(Number(price || 0), squeezeCenterMin.value, squeezeCenterMax.value), tickSize.value)
    lastAction.value = `${labelText}：中心 ${formatPrice(squeezeCenter.value)}`
  } else {
    mode.value = 'force'
    controlPrice.value = roundToTick(Number(price || 0), tickSize.value)
    lastAction.value = `${labelText}：${formatPrice(controlPrice.value)}`
  }
  hoverPrice.value = null
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

const positionsWithStats = computed(() => {
  return allPositions.value.map((p) => {
    return {
      ...p,
      pnlNow: userPnlAt(p, marketPrice.value),
      stopLossPrice: stopLossPriceOf(p, 0.5)
    }
  })
})

const topProfitUsers = computed(() => {
  return [...positionsWithStats.value].sort((a, b) => Number(b.pnlNow || 0) - Number(a.pnlNow || 0)).slice(0, 20)
})

const nudge = (dir) => {
  if (locked.value) return
  mode.value = 'force'
  controlPrice.value = roundToTick(controlPrice.value + Number(dir || 0) * tickSize.value, tickSize.value)
}

const squeezeNudge = (dir) => {
  if (locked.value) return
  mode.value = 'squeeze'
  squeezeCenter.value = roundToTick(squeezeCenter.value + Number(dir || 0) * tickSize.value, tickSize.value)
}

const squeezeAll = () => {
  if (locked.value) return
  mode.value = 'squeeze'
  squeezeCenter.value = roundToTick(clamp(bestPoint.value.price, squeezeCenterMin.value, squeezeCenterMax.value), tickSize.value)
  hoverPrice.value = null
  lastAction.value = `整体收缩：中心 ${formatPrice(squeezeCenter.value)}`
}

const lockPlan = () => {
  locked.value = true
  const picked = selectedUids.value.map((x) => String(x))
  const userLabel = picked.length ? `已选 ${picked.length}` : '全部'
  lastAction.value =
    mode.value === 'squeeze'
      ? `锁定收割方案：多 ${formatPrice(settlementPrices.value.long)} / 空 ${formatPrice(settlementPrices.value.short)} · 用户：${userLabel}`
      : `锁定收割方案：${formatPrice(finalSettlementPrice.value)} · 用户：${userLabel}`
  emit('lock', {
    key: key.value,
    label: label.value,
    asset: asset.value,
    tierSec: tierSec.value,
    mode: mode.value,
    settlementPrice: finalSettlementPrice.value,
    settlementPriceLong: mode.value === 'squeeze' ? settlementPrices.value.long : null,
    settlementPriceShort: mode.value === 'squeeze' ? settlementPrices.value.short : null,
    squeezePoints: mode.value === 'squeeze' ? Number(squeezePoints.value || 0) : null,
    estPlatformPnl: estPlatformPnl.value,
    targetUids: picked.length ? picked : null
  })
}

watch(
  () => marketPrice.value,
  (p) => {
    if (!Number.isFinite(p) || p <= 0) return
    const now = Date.now()
    const keepSec = clamp(Number(tierSec.value || 0), 60, 600)
    const keepPoints = Math.min(620, Math.max(90, Math.ceil(keepSec) + 20))
    const next = [...priceHistory.value, { t: now, p: Number(p) }].slice(-keepPoints)
    const cutoff = now - keepSec * 1000
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

const heartbeat = ref(0)
let heartbeatTimer = null

const bumpHeartbeat = () => {
  heartbeat.value++
}

watch(
  () => open.value,
  (v) => {
    if (v) {
      if (!heartbeatTimer) {
        bumpHeartbeat()
        heartbeatTimer = setInterval(bumpHeartbeat, 1000)
      }
    } else if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (heartbeatTimer) clearInterval(heartbeatTimer)
})

const exposureSummary = computed(() => {
  const positions = targetedPositions.value
  let longNotional = 0
  let shortNotional = 0
  let longUsers = 0
  let shortUsers = 0
  for (const p of positions) {
    const notional = Math.max(0, Number(p.principal || 0)) * Math.max(0, Number(p.leverage || 0))
    if (p.side === 'long') {
      longNotional += notional
      longUsers += 1
    } else {
      shortNotional += notional
      shortUsers += 1
    }
  }
  const totalNotional = longNotional + shortNotional
  const ratio = shortNotional > 0 ? longNotional / shortNotional : longNotional > 0 ? Infinity : 0
  return {
    longNotional,
    shortNotional,
    totalNotional,
    longUsers,
    shortUsers,
    netNotional: longNotional - shortNotional,
    ratio
  }
})

const platformPnlNow = computed(() => {
  return platformProfitAtUniform(markPrice.value)
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
                <span>设置结算策略并预览影响，确认后执行场控</span>
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

          <div class="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2.5">
            <div class="flex items-center gap-4 overflow-x-auto whitespace-nowrap text-[11px] text-slate-600">
              <div class="flex items-baseline gap-2 shrink-0">
                <span class="text-slate-500">波动(60s)</span>
                <span class="font-mono text-slate-900">{{ volatilityPct.toFixed(2) }}%</span>
                <span :class="volTone.cls">{{ volTone.text }}</span>
              </div>

              <span class="h-4 w-px bg-slate-200 shrink-0"></span>

              <div class="flex items-baseline gap-2 shrink-0">
                <span class="text-slate-500">实时盈亏 (PnL)</span>
                <span class="font-mono" :class="platformPnlNow < 0 ? 'text-rose-700' : 'text-emerald-700'">
                  {{ formatCompactUsd(platformPnlNow, true) }}
                </span>
              </div>

              <div class="flex items-baseline gap-2 shrink-0">
                <span class="text-slate-500">预演利润</span>
                <span class="font-mono" :class="previewPlatformPnl < 0 ? 'text-rose-700' : 'text-emerald-700'">
                  {{ formatCompactUsd(previewPlatformPnl, true) }}
                </span>
              </div>

              <span class="h-4 w-px bg-slate-200 shrink-0"></span>

              <div class="flex items-baseline gap-2 shrink-0">
                <span class="text-slate-500">多仓</span>
                <span class="font-mono text-slate-900">{{ formatCompactUsd(exposureSummary.longNotional) }}</span>
                <span class="font-mono text-slate-400">({{ exposureSummary.longUsers }})</span>
              </div>

              <div class="flex items-baseline gap-2 shrink-0">
                <span class="text-slate-500">空仓</span>
                <span class="font-mono text-slate-900">{{ formatCompactUsd(exposureSummary.shortNotional) }}</span>
                <span class="font-mono text-slate-400">({{ exposureSummary.shortUsers }})</span>
              </div>

              <div class="flex items-baseline gap-2 shrink-0">
                <span class="text-slate-500">净头寸</span>
                <span class="font-mono text-slate-900">{{ formatCompactUsd(exposureSummary.netNotional, true) }}</span>
              </div>

              <div class="flex items-baseline gap-2 shrink-0">
                <span class="text-slate-500">多空比</span>
                <span class="font-mono text-slate-900">{{ Number.isFinite(exposureSummary.ratio) ? exposureSummary.ratio.toFixed(2) : '∞' }}</span>
              </div>

              <span class="h-4 w-px bg-slate-200 shrink-0"></span>

              <div class="flex items-baseline gap-2 shrink-0 ml-auto">
                <span class="text-slate-500">范围</span>
                <span class="font-mono text-slate-900">{{ selectedUids.length ? `已选 ${selectedUids.length}` : '全部用户' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <div class="grid gap-4 lg:grid-cols-12 h-full">
             <section class="lg:col-span-6 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50/40">
                <div>
                  <h3 class="text-sm font-semibold text-slate-900">用户列表</h3>
                  <p class="mt-0.5 text-[11px] text-slate-500">Top 20 · 勾选用户则仅对勾选生效（不选=全部）</p>
                </div>
                <div class="text-[11px] text-slate-400 font-mono">Advanced Scanner</div>
              </div>

              <div class="space-y-4 h-full">
                <div class="max-h-[90%] overflow-auto">
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
                        <th class="px-3 py-2 font-medium text-right">选择</th>
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
                          :class="userPreviewPnl(pos) < 0 ? 'text-rose-700' : 'text-emerald-700'"
                        >
                          {{ formatCompactUsd(userPreviewPnl(pos), true) }}
                        </td>
                        <td class="px-3 py-2 align-top text-right">
                          <input
                            type="checkbox"
                            class="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 disabled:opacity-40"
                            :disabled="locked"
                            :value="pos.uid"
                            v-model="selectedUids"
                          />
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
                  <p class="mt-0.5 text-[11px] text-slate-500">统一结算 / 双向挤压</p>
                </div>
                <div class="text-[11px] text-slate-400 font-mono">Command Center</div>
              </div>

              <div class="p-5 space-y-4">
                <div class="space-y-2">
                  <div class="text-xs font-semibold text-slate-900">结算策略</div>
                  <div class="grid grid-cols-2 gap-2">
                    <label class="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
                      <input
                        type="radio"
                        name="mode"
                        value="force"
                        class="h-4 w-4 text-slate-900 focus:ring-slate-900"
                        v-model="mode"
                        :disabled="locked"
                      />
                      <div class="text-sm text-slate-900">统一结算</div>
                    </label>
                    <label class="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
                      <input
                        type="radio"
                        name="mode"
                        value="squeeze"
                        class="h-4 w-4 text-slate-900 focus:ring-slate-900"
                        v-model="mode"
                        :disabled="locked"
                      />
                      <div class="text-sm text-slate-900">双向挤压</div>
                    </label>
                  </div>
                </div>

                <div class="rounded-lg border border-slate-200 p-3 space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="text-xs font-semibold text-slate-900">标记价</div>
                    <div class="font-mono text-xs text-slate-700">{{ formatPrice(markPrice) }}</div>
                  </div>
                  
                  <div class="flex items-start justify-between gap-2">
                    <div class="text-xs font-semibold text-slate-900">用户结算价</div>
                    <div class="text-right">
                      <div v-if="mode === 'squeeze'" class="space-y-0.5">
                        <div class="font-mono text-xs text-slate-700">多 {{ formatPrice(settlementPrices.long) }}</div>
                        <div class="font-mono text-xs text-slate-700">空 {{ formatPrice(settlementPrices.short) }}</div>
                      </div>
                      <div v-else class="font-mono text-xs text-slate-700">{{ formatPrice(finalSettlementPrice) }}</div>
                    </div>
                  </div>

                  <div v-if="mode === 'force'" class="space-y-2">
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        class="h-9 w-9 shrink-0 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center justify-center leading-none"
                        :disabled="locked"
                        @click="nudge(-1)"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        class="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 font-mono text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-0 disabled:bg-slate-50"
                        v-model.number="controlPrice"
                        :step="tickSize"
                        :min="priceMin"
                        :max="priceMax"
                        :disabled="locked"
                      />
                      <button
                        type="button"
                        class="h-9 w-9 shrink-0 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center justify-center leading-none"
                        :disabled="locked"
                        @click="nudge(1)"
                      >
                        +
                      </button>
                    </div>

                    <div class="pt-1 text-[11px] font-semibold text-slate-700">滑点</div>
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
                    <button
                      type="button"
                      class="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-40"
                      :disabled="locked"
                      @click="applySlippageToControlPrice"
                    >
                      按滑点生成结算价
                    </button>
                    <div class="text-[11px] text-slate-500">
                      区间 {{ formatPrice(priceMin) }} ~ {{ formatPrice(priceMax) }} · Tick {{ formatPrice(tickSize) }}
                    </div>
                    <div class="flex items-center justify-between">
                        <label class="flex items-center gap-2 text-[11px] text-slate-500">
                          <input
                            type="checkbox"
                            class="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 disabled:opacity-40"
                            v-model="windowPriceEnabled"
                            :disabled="locked"
                          />
                          启用时间窗口修正（{{ Math.round(contractWindowSec) }}s）
                      </label>
                  </div>
                  </div>

                  <div v-else class="space-y-2">
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        class="h-9 w-9 shrink-0 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center justify-center leading-none"
                        :disabled="locked"
                        @click="squeezeNudge(-1)"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        class="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 font-mono text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-0 disabled:bg-slate-50"
                        v-model.number="squeezeCenter"
                        :step="tickSize"
                        :min="squeezeCenterMin"
                        :max="squeezeCenterMax"
                        :disabled="locked"
                      />
                      <button
                        type="button"
                        class="h-9 w-9 shrink-0 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center justify-center leading-none"
                        :disabled="locked"
                        @click="squeezeNudge(1)"
                      >
                        +
                      </button>
                    </div>

                    <div class="grid grid-cols-2 gap-2 text-[11px]">
                      <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <div class="text-slate-500">多头结算价</div>
                        <div class="mt-1 font-mono text-slate-900">{{ formatPrice(settlementPrices.long) }}</div>
                      </div>
                      <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <div class="text-slate-500">空头结算价</div>
                        <div class="mt-1 font-mono text-slate-900">{{ formatPrice(settlementPrices.short) }}</div>
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        class="h-9 rounded-lg border border-slate-200 px-3 font-mono text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-0 disabled:bg-slate-50"
                        v-model.number="squeezePoints"
                        min="0"
                        :disabled="locked"
                      />
                      <button
                        type="button"
                        class="h-9 rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40"
                        :disabled="locked"
                        @click="squeezeAll"
                      >
                        整体收缩
                      </button>
                    </div>
                    
                    <div class="text-[11px] text-slate-500">
                      中心区间 {{ formatPrice(squeezeCenterMin) }} ~ {{ formatPrice(squeezeCenterMax) }} · Gap {{ formatPrice(squeezeGap) }}
                    </div>
                    <div class="flex items-center justify-between">
                          <label class="flex items-center gap-2 text-[11px] text-slate-500">
                            <input
                              type="checkbox"
                              class="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 disabled:opacity-40"
                              v-model="windowPriceEnabled"
                              :disabled="locked"
                            />
                            启用时间窗口修正（{{ Math.round(contractWindowSec) }}s）
                        </label>
                    </div>
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
                  执行方案
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
                        :x1="svgLandscape.xFor(previewSettlementPrice)"
                        :x2="svgLandscape.xFor(previewSettlementPrice)"
                        :y1="svgLandscape.pad"
                        :y2="svgLandscape.h - svgLandscape.pad"
                        stroke="#0ea5e9"
                        stroke-dasharray="6 4"
                        opacity="0.85"
                      />
                      <line
                        v-if="hoverSettlementPrice !== null"
                        :x1="svgLandscape.xFor(hoverSettlementPrice)"
                        :x2="svgLandscape.xFor(hoverSettlementPrice)"
                        :y1="svgLandscape.pad"
                        :y2="svgLandscape.h - svgLandscape.pad"
                        stroke="#0f172a"
                        stroke-dasharray="4 4"
                        opacity="0.75"
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
                        :cy="svgLandscape.yFor(platformProfitAtForCurve(marketPrice))"
                        r="4.2"
                        fill="#0ea5e9"
                      />
                    </g>
                  </svg>

                  <div class="mt-3 grid grid-cols-3 gap-2 text-[11px] text-slate-500">
                    <div>
                      <div class="text-slate-400">盈亏平衡</div>
                      <button
                        type="button"
                        class="font-mono text-slate-900 hover:underline disabled:opacity-40"
                        :disabled="locked"
                        @click="fillSettlementPrice(breakevenPoint.price, '盈亏平衡')"
                      >
                        {{ formatPrice(breakevenPoint.price) }}
                      </button>
                    </div>
                    <div>
                      <div class="text-slate-400">最大利润点</div>
                      <button
                        type="button"
                        class="font-mono text-slate-900 hover:underline disabled:opacity-40"
                        :disabled="locked"
                        @click="fillSettlementPrice(bestPoint.price, '最大利润点')"
                      >
                        {{ formatPrice(bestPoint.price) }}
                      </button>
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
