<script setup>
import { computed, reactive, ref, watch, onBeforeUnmount, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import MfaVerificationModal from '../../components/MfaVerificationModal.vue'
import ControlConfigModal from '../../components/ControlConfigModal.vue'
import {
  PERP_CONTROL_CONTRACT_STATUS,
  PERP_CONTROL_OFFSET_DIRECTION,
  PERP_CONTROL_RULE_DIRECTION,
  PERP_CONTROL_RULE_MODAL_TAB,
  PERP_CONTROL_RULE_TRIGGER_TYPE,
  PERP_CONTROL_TIME_WINDOW
} from '../../constants/perpetualControl'
import {
  createPerpetualControlContractsMock,
  perpetualControlOffsetDirections,
  perpetualControlRuleTriggers,
  perpetualControlTimeWindows
} from '../../mock/perpetualControl'
import { createDefaultPerpetualControlConfig } from '../../mock/perpetual'

const clone = (value) => JSON.parse(JSON.stringify(value))

const route = useRoute()
const pageMode = computed(() => route.meta?.mode || 'full')
const isManualLineMode = computed(() => pageMode.value === 'manual_line')

const contracts = ref(createPerpetualControlContractsMock())

const keyword = ref('')

const summary = computed(() => {
  const total = contracts.value.length
  const running = contracts.value.filter((item) => item.status === PERP_CONTROL_CONTRACT_STATUS.RUNNING).length
  const autoTriggerOn = contracts.value.filter((item) => item.config?.autoTriggerEnabled).length
  const enabledRules = contracts.value.reduce((sum, item) => sum + (item.rules || []).filter((r) => r.enabled).length, 0)
  return [
    { label: '合约数', value: total },
    { label: '线控中', value: running },
    { label: '自动触发开', value: autoTriggerOn },
    { label: '启用规则', value: enabledRules }
  ]
})

const boardRefreshIntervalMs = ref(2000)
const boardTopN = ref(20)
const boardLastRefreshAt = ref('')

const metricLabel = {
  LONG: '多头持仓',
  SHORT: '空头持仓',
  NET: '净持仓',
  RATIO: '多空比',
  USERS: '活跃用户',
  VOLUME: '24h交易量',
  PLATFORM_PNL: '平台盈亏',
  USER_PNL: '用户盈亏'
}

const parseCompactUsd = (raw) => {
  if (raw == null) return 0
  const text = String(raw).trim().replaceAll(',', '')
  if (!text) return 0
  let sign = 1
  let s = text
  if (s.startsWith('+')) {
    sign = 1
    s = s.slice(1)
  } else if (s.startsWith('-')) {
    sign = -1
    s = s.slice(1)
  }
  s = s.trim()
  if (s.startsWith('$')) s = s.slice(1)
  const unit = s.slice(-1).toUpperCase()
  let multiplier = 1
  let numberPart = s
  if (unit === 'K') {
    multiplier = 1e3
    numberPart = s.slice(0, -1)
  } else if (unit === 'M') {
    multiplier = 1e6
    numberPart = s.slice(0, -1)
  } else if (unit === 'B') {
    multiplier = 1e9
    numberPart = s.slice(0, -1)
  }
  const n = Number(numberPart)
  if (!Number.isFinite(n)) return 0
  return sign * n * multiplier
}

const formatCompactNumber = (n, digits) => {
  const str = Number(n).toFixed(digits)
  return str.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1')
}

const formatCompactUsd = (value, { withSign = false } = {}) => {
  const sign = value < 0 ? '-' : value > 0 ? '+' : ''
  const abs = Math.abs(value || 0)
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
  } else {
    unit = ''
    scaled = abs
    digits = 0
  }
  const body = `${formatCompactNumber(scaled, digits)}${unit}`
  return `${withSign ? sign : ''}$${body}`
}

const getMetric = (contract, label) => {
  return (contract.metrics || []).find((m) => m.label === label) || null
}

const upsertMetric = (contract, label, next) => {
  const metrics = Array.isArray(contract.metrics) ? contract.metrics : []
  const idx = metrics.findIndex((m) => m.label === label)
  if (idx === -1) return [...metrics, { label, ...next }]
  const updated = metrics.slice()
  updated[idx] = { ...updated[idx], ...next }
  return updated
}

const ensureMetrics = (contract) => {
  const seed = String(contract.symbol || contract.id || '')
    .split('')
    .reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  const baseVol = 8_000_000 + (seed % 45) * 900_000
  const baseUsers = 320 + (seed % 900)
  const baseLong = 650_000 + (seed % 30) * 85_000
  const baseShort = 600_000 + (seed % 28) * 80_000
  const net = baseLong - baseShort
  const ratio = baseShort > 0 ? baseLong / baseShort : 1
  const platformPnl = (seed % 2 === 0 ? 1 : -1) * (15_000 + (seed % 70) * 800)
  const userPnl = (seed % 3 === 0 ? 1 : -1) * (12_000 + (seed % 90) * 750)

  const existing = Array.isArray(contract.metrics) ? contract.metrics : []
  const byLabel = new Map(existing.map((m) => [m.label, { ...m }]))
  const getOr = (label, fallback) => {
    const hit = byLabel.get(label)
    return hit ? { ...fallback, ...hit } : fallback
  }

  return [
    getOr(metricLabel.LONG, { label: metricLabel.LONG, value: formatCompactUsd(baseLong), tone: 'up' }),
    getOr(metricLabel.SHORT, { label: metricLabel.SHORT, value: formatCompactUsd(baseShort), tone: 'down' }),
    getOr(metricLabel.NET, { label: metricLabel.NET, value: formatCompactUsd(net, { withSign: true }), tone: net >= 0 ? 'up' : 'down' }),
    getOr(metricLabel.RATIO, { label: metricLabel.RATIO, value: ratio.toFixed(2), tone: 'neutral' }),
    getOr(metricLabel.USERS, { label: metricLabel.USERS, value: String(baseUsers), tone: 'neutral' }),
    getOr(metricLabel.VOLUME, { label: metricLabel.VOLUME, value: formatCompactUsd(baseVol), tone: 'neutral' }),
    getOr(metricLabel.PLATFORM_PNL, { label: metricLabel.PLATFORM_PNL, value: formatCompactUsd(platformPnl, { withSign: true }), tone: platformPnl >= 0 ? 'up' : 'down' }),
    getOr(metricLabel.USER_PNL, { label: metricLabel.USER_PNL, value: formatCompactUsd(userPnl, { withSign: true }), tone: userPnl >= 0 ? 'up' : 'down' })
  ]
}

contracts.value = contracts.value.map((contract) => ({ ...contract, metrics: ensureMetrics(contract) }))

const jitter = (base, pct) => {
  const factor = 1 + (Math.random() * 2 - 1) * pct
  return Math.max(0, base * factor)
}

const ensureNonZeroSigned = (raw, minAbs) => {
  const v = Number(raw || 0)
  const abs = Math.abs(v)
  if (abs >= minAbs) return v
  const sign = v === 0 ? (Math.random() > 0.5 ? 1 : -1) : v > 0 ? 1 : -1
  return sign * minAbs
}

const marketPrices = ref({})

const baseMarketPrice = (symbol) => {
  const s = String(symbol || '')
  if (s.includes('BTC')) return 50000
  if (s.includes('ETH')) return 3000
  if (s.includes('SOL')) return 100
  const seed = s.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  return 500 + (seed % 4500)
}

const marketVolatilityPct = (symbol) => {
  const s = String(symbol || '')
  if (s.includes('BTC')) return 0.0015
  if (s.includes('ETH')) return 0.002
  if (s.includes('SOL')) return 0.0035
  return 0.0025
}

const manualOverrides = ref({})
const manualTimers = new Map()

const isManualActive = (contractId) => Boolean(manualOverrides.value[contractId])

const clearManualTimer = (contractId) => {
  const existing = manualTimers.get(contractId)
  if (existing) clearTimeout(existing)
  manualTimers.delete(contractId)
}

const revertManual = (contractId) => {
  const entry = manualOverrides.value[contractId]
  if (!entry) return
  clearManualTimer(contractId)
  contracts.value = contracts.value.map((c) => {
    if (c.id !== contractId) return c
    return { ...c, status: entry.baseStatus ?? c.status, config: clone(entry.baseConfig) }
  })
  const next = { ...manualOverrides.value }
  delete next[contractId]
  manualOverrides.value = next
}

const scheduleManualExpiry = (contractId, durationSec) => {
  clearManualTimer(contractId)
  if (!Number(durationSec) || Number(durationSec) <= 0) return
  const handle = setTimeout(() => revertManual(contractId), Number(durationSec) * 1000)
  manualTimers.set(contractId, handle)
}

const refreshBoard = () => {
  const now = Date.now()
  const nextMarketPrices = { ...marketPrices.value }
  contracts.value = contracts.value.map((contract) => {
    const next = { ...contract }
    const metrics = ensureMetrics(next)

    const contractId = next.id
    const symbol = next.symbol || next.id
    const prevPrice = Number(nextMarketPrices[contractId] ?? baseMarketPrice(symbol))
    const vol = marketVolatilityPct(symbol)
    const nextPrice = Math.max(0.0001, prevPrice * (1 + (Math.random() * 2 - 1) * vol))
    nextMarketPrices[contractId] = nextPrice

    const long = jitter(parseCompactUsd(getMetric({ metrics }, metricLabel.LONG)?.value), 0.012)
    const short = jitter(parseCompactUsd(getMetric({ metrics }, metricLabel.SHORT)?.value), 0.012)
    const net = long - short
    const ratio = short > 0 ? long / short : 1
    const users = Math.max(0, Math.round(jitter(Number(getMetric({ metrics }, metricLabel.USERS)?.value || 0), 0.02)))
    const volume = jitter(parseCompactUsd(getMetric({ metrics }, metricLabel.VOLUME)?.value), 0.03)
    const platformPnl = ensureNonZeroSigned(
      jitter(parseCompactUsd(getMetric({ metrics }, metricLabel.PLATFORM_PNL)?.value), 0.06) * (Math.random() > 0.52 ? 1 : -1),
      500
    )
    const userPnl = ensureNonZeroSigned(
      jitter(parseCompactUsd(getMetric({ metrics }, metricLabel.USER_PNL)?.value), 0.08) * (Math.random() > 0.52 ? 1 : -1),
      500
    )

    let updated = metrics
    updated = upsertMetric({ metrics: updated }, metricLabel.LONG, { value: formatCompactUsd(long), tone: 'up' })
    updated = upsertMetric({ metrics: updated }, metricLabel.SHORT, { value: formatCompactUsd(short), tone: 'down' })
    updated = upsertMetric({ metrics: updated }, metricLabel.NET, { value: formatCompactUsd(net, { withSign: true }), tone: net >= 0 ? 'up' : 'down' })
    updated = upsertMetric({ metrics: updated }, metricLabel.RATIO, { value: ratio.toFixed(2), tone: 'neutral' })
    updated = upsertMetric({ metrics: updated }, metricLabel.USERS, { value: String(users), tone: 'neutral' })
    updated = upsertMetric({ metrics: updated }, metricLabel.VOLUME, { value: formatCompactUsd(volume), tone: 'neutral' })
    updated = upsertMetric({ metrics: updated }, metricLabel.PLATFORM_PNL, { value: formatCompactUsd(platformPnl, { withSign: true }), tone: platformPnl >= 0 ? 'up' : 'down' })
    updated = upsertMetric({ metrics: updated }, metricLabel.USER_PNL, { value: formatCompactUsd(userPnl, { withSign: true }), tone: userPnl >= 0 ? 'up' : 'down' })

    next.metrics = updated
    return next
  })
  marketPrices.value = nextMarketPrices
  boardLastRefreshAt.value = new Date(now).toISOString().replace('T', ' ').split('.')[0]
}

let boardTimer = null
const stopBoardTimer = () => {
  if (boardTimer) clearInterval(boardTimer)
  boardTimer = null
}
const startBoardTimer = () => {
  stopBoardTimer()
  if (!isManualLineMode.value) return
  boardTimer = setInterval(() => refreshBoard(), Number(boardRefreshIntervalMs.value))
}

watch([boardRefreshIntervalMs, isManualLineMode], ([, manual]) => {
  if (manual) refreshBoard()
  startBoardTimer()
})

onMounted(() => {
  if (isManualLineMode.value) {
    refreshBoard()
    startBoardTimer()
  } else {
    stopBoardTimer()
  }
})

onBeforeUnmount(() => {
  stopBoardTimer()
  for (const [, timer] of manualTimers.entries()) clearTimeout(timer)
  manualTimers.clear()
})

const boardContracts = computed(() => {
  const list = filteredContracts.value.slice()
  list.sort((a, b) => {
    const av = parseCompactUsd(getMetric(a, metricLabel.VOLUME)?.value)
    const bv = parseCompactUsd(getMetric(b, metricLabel.VOLUME)?.value)
    return bv - av
  })
  const n = Math.max(1, Math.min(list.length, Number(boardTopN.value) || 20))
  return list.slice(0, n)
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 5
})

const filteredContracts = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return contracts.value
  return contracts.value.filter((item) => `${item.symbol} ${item.alias}`.toLowerCase().includes(kw))
})

const paginatedContracts = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filteredContracts.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredContracts.value.length / pagination.pageSize))

watch([keyword], () => {
  pagination.currentPage = 1
})

const formatParams = (config) => {
  const direction = {
    [PERP_CONTROL_OFFSET_DIRECTION.RANDOM]: '随机偏移',
    [PERP_CONTROL_OFFSET_DIRECTION.UP]: '向上偏移',
    [PERP_CONTROL_OFFSET_DIRECTION.DOWN]: '向下偏移'
  }[config.offsetDirection] || '随机偏移'
  return [
    `价格偏移: ${config.priceOffset} 点 (${direction})`,
    `滑点率: ${config.slippagePct.toFixed(2)}%`,
    `成交延迟: ${config.latencyMs}ms`,
    `杠杆限制: ${config.maxLeverage}x`,
    `自动触发: ${config.autoTriggerEnabled ? '启用' : '关闭'}`
  ]
}

const showConfigModal = ref(false)
const activeConfigContractId = ref('')
const activeConfig = computed(() => contracts.value.find((item) => item.id === activeConfigContractId.value)?.config || createDefaultPerpetualControlConfig())

// MFA 验证相关
const showMfaModal = ref(false)
const pendingSaveData = ref(null)
const mfaLoading = ref(false)
const currentSaveAction = ref(null)

const openConfig = (contractId) => {
  activeConfigContractId.value = contractId
  showConfigModal.value = true
}

const saveConfig = (next) => {
  // 准备保存数据
  pendingSaveData.value = {
    type: 'CONFIG',
    contractId: activeConfigContractId.value,
    config: next
  }
  currentSaveAction.value = 'config'
  showMfaModal.value = true
}

const showManualModal = ref(false)
const manualContractId = ref('')
const manualForm = reactive({
  priceOffset: 5,
  offsetDirection: PERP_CONTROL_OFFSET_DIRECTION.AGAINST,
  slippagePct: 0.2,
  latencyMs: 80,
  durationSec: 1800
})

const quickManualInputs = {
  priceOffset: [0, 2, 5, 10, 15],
  slippagePct: [0, 0.1, 0.2, 0.3, 0.5],
  latencyMs: [0, 50, 100, 200, 500],
  durationSec: [0, 300, 900, 1800, 3600, 7200]
}

const applyQuickManual = (key, value) => {
  if (key === 'priceOffset') manualForm.priceOffset = Number(value)
  if (key === 'slippagePct') manualForm.slippagePct = Number(value)
  if (key === 'latencyMs') manualForm.latencyMs = Number(value)
  if (key === 'durationSec') manualForm.durationSec = Number(value)
}

const manualContract = computed(() => contracts.value.find((c) => c.id === manualContractId.value) || null)
const manualContractMetrics = computed(() => {
  const c = manualContract.value
  return {
    volume: getMetric(c || {}, metricLabel.VOLUME)?.value || '-',
    users: getMetric(c || {}, metricLabel.USERS)?.value || '-',
    long: getMetric(c || {}, metricLabel.LONG)?.value || '-',
    short: getMetric(c || {}, metricLabel.SHORT)?.value || '-',
    net: getMetric(c || {}, metricLabel.NET)?.value || '-',
    ratio: getMetric(c || {}, metricLabel.RATIO)?.value || '-',
    platformPnl: getMetric(c || {}, metricLabel.PLATFORM_PNL)?.value || '-'
  }
})

const manualOffsetDirectionLabel = computed(() => {
  const map = {
    [PERP_CONTROL_OFFSET_DIRECTION.AGAINST]: '逆势',
    [PERP_CONTROL_OFFSET_DIRECTION.FOLLOW]: '顺势',
    [PERP_CONTROL_OFFSET_DIRECTION.RANDOM]: '随机',
    [PERP_CONTROL_OFFSET_DIRECTION.UP]: '向上',
    [PERP_CONTROL_OFFSET_DIRECTION.DOWN]: '向下'
  }
  return map[manualForm.offsetDirection] || '随机'
})

const manualBasePrice = computed(() => {
  const id = manualContractId.value
  if (id && marketPrices.value[id]) return Number(marketPrices.value[id])
  const symbol = manualContract.value?.symbol || id || 'BTCUSDT'
  return baseMarketPrice(symbol)
})

const manualPreview = computed(() => {
  const basePrice = manualBasePrice.value
  const offset = Number(manualForm.priceOffset || 0)
  const slippage = Number(manualForm.slippagePct || 0) / 100
  const orderAmount = 10000
  const baseAmount = basePrice > 0 ? orderAmount / basePrice : 0

  let buyBase = basePrice
  let sellBase = basePrice

  if (manualForm.offsetDirection === PERP_CONTROL_OFFSET_DIRECTION.AGAINST) {
    buyBase = basePrice + offset
    sellBase = basePrice - offset
  } else if (manualForm.offsetDirection === PERP_CONTROL_OFFSET_DIRECTION.FOLLOW) {
    buyBase = basePrice - offset
    sellBase = basePrice + offset
  } else if (manualForm.offsetDirection === PERP_CONTROL_OFFSET_DIRECTION.UP) {
    buyBase = basePrice + offset
    sellBase = basePrice + offset
  } else if (manualForm.offsetDirection === PERP_CONTROL_OFFSET_DIRECTION.DOWN) {
    buyBase = basePrice - offset
    sellBase = basePrice - offset
  } else {
    buyBase = basePrice
    sellBase = basePrice
  }

  const buySlippage = buyBase * slippage
  const sellSlippage = sellBase * slippage
  const buyPrice = buyBase + buySlippage
  const sellPrice = sellBase - sellSlippage

  const priceOffsetCost = Math.abs((buyBase - basePrice) + (basePrice - sellBase)) * baseAmount / 2
  const slippageCost = (buySlippage + sellSlippage) * baseAmount / 2
  const totalExtraCost = priceOffsetCost + slippageCost
  const totalExtraCostPct = orderAmount > 0 ? (totalExtraCost / orderAmount) * 100 : 0

  return {
    basePrice,
    buyPrice,
    sellPrice,
    priceOffsetCost,
    slippageCost,
    totalExtraCost,
    totalExtraCostPct
  }
})

const openManualLine = (contractId) => {
  const contract = contracts.value.find((c) => c.id === contractId)
  manualContractId.value = contractId
  manualForm.priceOffset = Number(contract?.config?.priceOffset ?? 5)
  manualForm.offsetDirection = contract?.config?.offsetDirection ?? PERP_CONTROL_OFFSET_DIRECTION.AGAINST
  manualForm.slippagePct = Number(contract?.config?.slippagePct ?? 0.2)
  manualForm.latencyMs = Number(contract?.config?.latencyMs ?? 80)
  manualForm.durationSec = 1800
  showManualModal.value = true
}

const requestSaveManualLine = () => {
  const contract = contracts.value.find((c) => c.id === manualContractId.value)
  if (!contract) return
  const baseConfig = isManualActive(contract.id) ? clone(manualOverrides.value[contract.id].baseConfig) : clone(contract.config)
  const baseStatus = isManualActive(contract.id) ? manualOverrides.value[contract.id].baseStatus : contract.status
  const overrideConfig = {
    priceOffset: Math.max(0, Math.min(50, Number(manualForm.priceOffset || 0))),
    offsetDirection: manualForm.offsetDirection,
    slippagePct: Math.max(0, Math.min(2, Number(manualForm.slippagePct || 0))),
    latencyMs: Math.max(0, Math.min(5000, Number(manualForm.latencyMs || 0))),
    maxLeverage: Math.max(1, Math.min(125, Number(baseConfig?.maxLeverage ?? contract?.config?.maxLeverage ?? 100))),
    autoTriggerEnabled: false
  }
  pendingSaveData.value = {
    type: 'MANUAL',
    contractId: contract.id,
    baseConfig,
    baseStatus,
    overrideConfig,
    durationSec: Number(manualForm.durationSec || 0)
  }
  currentSaveAction.value = 'manual'
  showManualModal.value = false
  showMfaModal.value = true
}

const requestRemoveManualLine = (contractId) => {
  if (!isManualActive(contractId)) return
  pendingSaveData.value = {
    type: 'MANUAL_REMOVE',
    contractId
  }
  currentSaveAction.value = 'manual_remove'
  showMfaModal.value = true
}

const mfaMeta = computed(() => {
  if (currentSaveAction.value === 'manual') {
    const symbol = pendingSaveData.value?.contractId || ''
    return { title: '手动插线验证', description: `对 ${symbol} 执行手动插线属于敏感操作，请输入 MFA 验证码` }
  }
  if (currentSaveAction.value === 'manual_remove') {
    const symbol = pendingSaveData.value?.contractId || ''
    return { title: '解除手动线控验证', description: `解除 ${symbol} 的手动线控属于敏感操作，请输入 MFA 验证码` }
  }
  return { title: '线控配置验证', description: '修改永续合约线控配置属于敏感操作，请输入 MFA 验证码' }
})

const showRuleModal = ref(false)
const activeContractId = ref('')
const editingRuleId = ref(null)
const ruleModalTab = ref(PERP_CONTROL_RULE_MODAL_TAB.BASIC)
const ruleTriggers = perpetualControlRuleTriggers
const offsetDirections = perpetualControlOffsetDirections
const timeWindows = perpetualControlTimeWindows

const ruleForm = reactive({
  name: '',
  triggerType: PERP_CONTROL_RULE_TRIGGER_TYPE.NET_POSITION,
  thresholdValue: 100000,
  triggerDirection: PERP_CONTROL_RULE_DIRECTION.LONG_HEAVY,
  positionRatio: 60,
  timeWindow: PERP_CONTROL_TIME_WINDOW.REALTIME,
  priceOffset: 5,
  offsetDirection: PERP_CONTROL_OFFSET_DIRECTION.AGAINST,
  slippagePct: 0.2,
  durationSec: 0,
  enabled: true
})

const triggerMeta = computed(() => ruleTriggers[ruleForm.triggerType] || ruleTriggers[PERP_CONTROL_RULE_TRIGGER_TYPE.NET_POSITION])
const triggerOptions = computed(() => Object.entries(ruleTriggers).map(([value, cfg]) => ({ value, label: cfg.label })))

// 判断当前触发类型是否需要时间区间配置
const needsTimeWindow = computed(() => {
  return ruleForm.triggerType === PERP_CONTROL_RULE_TRIGGER_TYPE.PNL_RATIO ||
         ruleForm.triggerType === PERP_CONTROL_RULE_TRIGGER_TYPE.VOLUME_SPIKE || 
         ruleForm.triggerType === PERP_CONTROL_RULE_TRIGGER_TYPE.VOLATILITY
})

// 判断当前触发类型是否需要单边占比配置
const needsPositionRatio = computed(() => {
  return ruleForm.triggerType === PERP_CONTROL_RULE_TRIGGER_TYPE.NET_POSITION
})

// 根据触发类型过滤时间区间选项
const availableTimeWindows = computed(() => {
  if (!needsTimeWindow.value) {
    return timeWindows
  }
  // 交易量突增和波动率触发，排除"实时数据"选项
  return timeWindows.filter(tw => tw.value !== PERP_CONTROL_TIME_WINDOW.REALTIME)
})

const currentTriggerDirectionLabel = computed(
  () => triggerMeta.value.directionOptions.find((item) => item.value === ruleForm.triggerDirection)?.label || '-'
)
const currentOffsetDirectionLabel = computed(() => offsetDirections.find((item) => item.value === ruleForm.offsetDirection)?.label || '-')
const currentTimeWindowLabel = computed(() => timeWindows.find((item) => item.value === ruleForm.timeWindow)?.label || '实时数据')
const durationText = computed(() => (Number(ruleForm.durationSec) === 0 ? '持续生效' : `${Number(ruleForm.durationSec)} 秒`))

// 数据计算预览
const mockBasePrice = computed(() => {
  const symbol = currentContract.value?.symbol || 'BTCUSDT'
  if (symbol.includes('BTC')) return 50000
  if (symbol.includes('ETH')) return 3000
  if (symbol.includes('SOL')) return 100
  return 1000
})

const calculatedPreview = computed(() => {
  const basePrice = mockBasePrice.value
  const offset = Number(ruleForm.priceOffset || 0)
  const slippage = Number(ruleForm.slippagePct || 0) / 100
  
  // 根据偏移方向计算价格
  let buyPrice = basePrice
  let sellPrice = basePrice
  
  if (ruleForm.offsetDirection === PERP_CONTROL_OFFSET_DIRECTION.AGAINST) {
    // 逆势：买入价提高，卖出价降低
    buyPrice = basePrice + offset
    sellPrice = basePrice - offset
  } else if (ruleForm.offsetDirection === PERP_CONTROL_OFFSET_DIRECTION.FOLLOW) {
    // 顺势：买入价降低，卖出价提高（有利于用户）
    buyPrice = basePrice - offset
    sellPrice = basePrice + offset
  } else {
    // 随机
    buyPrice = basePrice
    sellPrice = basePrice
  }
  
  // 加上滑点影响
  const buySlippage = buyPrice * slippage
  const sellSlippage = sellPrice * slippage
  
  // 计算用户成本
  const orderSize = 10000 // 假设订单金额 10000 USDT
  const slippageCost = (buySlippage + sellSlippage) * (orderSize / basePrice) / 2
  const totalExtraCost = slippageCost
  
  // 风险等级评估
  let riskLevel = 'low'
  let riskScore = 0
  riskScore += offset > 10 ? 2 : offset > 5 ? 1 : 0
  riskScore += slippage > 0.003 ? 2 : slippage > 0.001 ? 1 : 0
  
  if (riskScore >= 3) riskLevel = 'high'
  else if (riskScore >= 2) riskLevel = 'medium'
  
  return {
    basePrice,
    buyPrice: buyPrice + buySlippage,
    sellPrice: sellPrice - sellSlippage,
    buySlippage,
    sellSlippage,
    slippageCost,
    totalExtraCost,
    totalExtraCostPct: (totalExtraCost / orderSize) * 100,
    riskLevel,
    riskScore
  }
})

watch(
  () => ruleForm.triggerType,
  (next) => {
    const options = ruleTriggers[next]?.directionOptions || []
    if (!options.some((item) => item.value === ruleForm.triggerDirection)) {
      ruleForm.triggerDirection = options[0]?.value || PERP_CONTROL_RULE_DIRECTION.LONG_HEAVY
    }
    
    // 当切换到需要时间区间的触发类型时，设置默认时间区间
    const needsTime = next === PERP_CONTROL_RULE_TRIGGER_TYPE.PNL_RATIO ||
                      next === PERP_CONTROL_RULE_TRIGGER_TYPE.VOLUME_SPIKE || 
                      next === PERP_CONTROL_RULE_TRIGGER_TYPE.VOLATILITY
    if (!needsTime) {
      ruleForm.timeWindow = PERP_CONTROL_TIME_WINDOW.REALTIME
    } else if (ruleForm.timeWindow === PERP_CONTROL_TIME_WINDOW.REALTIME) {
      // 如果是实时数据，切换到有意义的时间区间
      ruleForm.timeWindow = PERP_CONTROL_TIME_WINDOW.LAST_5MIN
    }
  }
)

const formatThreshold = (type, value) => {
  if (type === PERP_CONTROL_RULE_TRIGGER_TYPE.NET_POSITION) return `$${Number(value).toLocaleString()}`
  if (type === PERP_CONTROL_RULE_TRIGGER_TYPE.PNL_RATIO || type === PERP_CONTROL_RULE_TRIGGER_TYPE.VOLATILITY) return `${Number(value)}%`
  return `${Number(value)}x`
}

const ruleConditionText = (rule) => {
  const meta = ruleTriggers[rule.triggerType] || ruleTriggers[PERP_CONTROL_RULE_TRIGGER_TYPE.NET_POSITION]
  const direction = meta.directionOptions.find((item) => item.value === rule.triggerDirection)?.label || ''
  
  // 盈亏比、交易量突增和波动率触发才显示时间区间
  const showTimeWindow = rule.triggerType === PERP_CONTROL_RULE_TRIGGER_TYPE.PNL_RATIO ||
                         rule.triggerType === PERP_CONTROL_RULE_TRIGGER_TYPE.VOLUME_SPIKE || 
                         rule.triggerType === PERP_CONTROL_RULE_TRIGGER_TYPE.VOLATILITY
  const timeWindowLabel = showTimeWindow && rule.timeWindow ? 
    (timeWindows.find((item) => item.value === rule.timeWindow)?.label || '') : ''
  
  const parts = [direction, formatThreshold(rule.triggerType, rule.thresholdValue)]
  
  // 净持仓触发显示单边占比
  if (rule.triggerType === PERP_CONTROL_RULE_TRIGGER_TYPE.NET_POSITION && rule.positionRatio) {
    const sideLabel = rule.triggerDirection === PERP_CONTROL_RULE_DIRECTION.LONG_HEAVY ? '多头' : '空头'
    parts.push(`${sideLabel}占比≥${rule.positionRatio}%`)
  }
  
  if (timeWindowLabel) parts.push(timeWindowLabel)
  
  return parts.join(' | ')
}

const ruleActionText = (rule) => {
  const duration = Number(rule.durationSec) === 0 ? '持续生效' : `${Number(rule.durationSec)} 秒`
  return `偏移 ${rule.priceOffset} 点 | 滑点 ${rule.slippagePct.toFixed(2)}% | ${duration}`
}

const ruleAffectsText = (rule) => {
  const affects = []
  if (Number(rule.priceOffset) > 0) affects.push('价格偏移')
  if (Number(rule.slippagePct) > 0) affects.push('滑点')
  return affects.length > 0 ? affects.join('、') : '无影响'
}

const liveRuleConditionText = computed(() => {
  const parts = [currentTriggerDirectionLabel.value, formatThreshold(ruleForm.triggerType, ruleForm.thresholdValue)]
  
  // 净持仓触发显示单边占比
  if (needsPositionRatio.value) {
    const sideLabel = ruleForm.triggerDirection === PERP_CONTROL_RULE_DIRECTION.LONG_HEAVY ? '多头' : '空头'
    parts.push(`${sideLabel}占比≥${ruleForm.positionRatio}%`)
  }
  
  if (needsTimeWindow.value) {
    parts.push(currentTimeWindowLabel.value)
  }
  return parts.join(' | ')
})
const liveRuleActionText = computed(
  () =>
    `偏移 ${ruleForm.priceOffset} 点（${currentOffsetDirectionLabel.value}） | 滑点 ${ruleForm.slippagePct.toFixed(
      2
    )}% | ${durationText.value}`
)

const toneClass = {
  up: 'text-emerald-600',
  down: 'text-rose-600',
  neutral: 'text-slate-900'
}

const currentContract = computed(() => contracts.value.find((item) => item.id === activeContractId.value) || null)

const resetRuleForm = () => {
  ruleForm.name = ''
  ruleForm.triggerType = PERP_CONTROL_RULE_TRIGGER_TYPE.NET_POSITION
  ruleForm.thresholdValue = 100000
  ruleForm.triggerDirection = PERP_CONTROL_RULE_DIRECTION.LONG_HEAVY
  ruleForm.positionRatio = 60
  ruleForm.timeWindow = PERP_CONTROL_TIME_WINDOW.REALTIME
  ruleForm.priceOffset = 5
  ruleForm.offsetDirection = PERP_CONTROL_OFFSET_DIRECTION.AGAINST
  ruleForm.slippagePct = 0.2
  ruleForm.durationSec = 0
  ruleForm.enabled = true
}

const openAddRule = (contractId) => {
  activeContractId.value = contractId
  editingRuleId.value = null
  ruleModalTab.value = PERP_CONTROL_RULE_MODAL_TAB.BASIC
  resetRuleForm()
  showRuleModal.value = true
}

const openEditRule = (contractId, rule) => {
  activeContractId.value = contractId
  editingRuleId.value = rule.id
  ruleModalTab.value = PERP_CONTROL_RULE_MODAL_TAB.BASIC
  ruleForm.name = rule.name
  ruleForm.triggerType = rule.triggerType || PERP_CONTROL_RULE_TRIGGER_TYPE.NET_POSITION
  ruleForm.thresholdValue = Number(rule.thresholdValue || 100000)
  ruleForm.triggerDirection = rule.triggerDirection || (ruleForm.triggerType === PERP_CONTROL_RULE_TRIGGER_TYPE.NET_POSITION ? PERP_CONTROL_RULE_DIRECTION.LONG_HEAVY : PERP_CONTROL_RULE_DIRECTION.PROFIT_HIGH)
  ruleForm.positionRatio = Number(rule.positionRatio || 60)
  ruleForm.timeWindow = rule.timeWindow || PERP_CONTROL_TIME_WINDOW.REALTIME
  ruleForm.priceOffset = Number(rule.priceOffset || 5)
  ruleForm.offsetDirection = rule.offsetDirection || PERP_CONTROL_OFFSET_DIRECTION.AGAINST
  ruleForm.slippagePct = Number(rule.slippagePct || 0.2)
  ruleForm.durationSec = Number(rule.durationSec || 0)
  ruleForm.enabled = rule.enabled
  showRuleModal.value = true
}

const saveRule = () => {
  if (!currentContract.value || !ruleForm.name.trim() || Number(ruleForm.thresholdValue) <= 0) return
  
  const payload = {
    name: ruleForm.name.trim(),
    triggerType: ruleForm.triggerType,
    thresholdValue: Number(ruleForm.thresholdValue),
    triggerDirection: ruleForm.triggerDirection,
    priceOffset: Number(ruleForm.priceOffset),
    offsetDirection: ruleForm.offsetDirection,
    slippagePct: Number(ruleForm.slippagePct),
    durationSec: Number(ruleForm.durationSec),
    enabled: ruleForm.enabled
  }
  
  // 只有交易量突增和波动率触发才保存时间区间
  if (needsTimeWindow.value) {
    payload.timeWindow = ruleForm.timeWindow
  }  
  // 只有净持仓触发才保存单边占比
  if (needsPositionRatio.value) {
    payload.positionRatio = Number(ruleForm.positionRatio)
  }
  
  // 准备保存数据，显示 MFA 验证
  pendingSaveData.value = {
    type: 'RULE',
    contractId: activeContractId.value,
    ruleId: editingRuleId.value,
    payload
  }
  currentSaveAction.value = 'rule'
  showMfaModal.value = true
}

const deleteRule = (contractId, ruleId) => {
  contracts.value = contracts.value.map((contract) =>
    contract.id === contractId ? { ...contract, rules: contract.rules.filter((rule) => rule.id !== ruleId) } : contract
  )
}

const toggleRule = (contractId, ruleId) => {
  contracts.value = contracts.value.map((contract) => {
    if (contract.id !== contractId) return contract
    return {
      ...contract,
      rules: contract.rules.map((rule) => (rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule))
    }
  })
}

const toggleContractStatus = (contractId) => {
  contracts.value = contracts.value.map((contract) => {
    if (contract.id !== contractId) return contract
    return {
      ...contract,
      status: contract.status === PERP_CONTROL_CONTRACT_STATUS.RUNNING ? PERP_CONTROL_CONTRACT_STATUS.PAUSED : PERP_CONTROL_CONTRACT_STATUS.RUNNING
    }
  })
}

// 处理 MFA 验证
const handleMfaVerify = async (code) => {
  mfaLoading.value = true
  
  try {
    // TODO: 这里调用后端 API 验证 MFA 验证码
    // const response = await api.verifyMFA(code)
    
    // 模拟 API 调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 验证成功后执行实际的保存操作
    if (pendingSaveData.value) {
      if (currentSaveAction.value === 'config') {
        // 保存配置
        contracts.value = contracts.value.map((contract) =>
          contract.id === pendingSaveData.value.contractId ? { ...contract, config: { ...pendingSaveData.value.config } } : contract
        )
        showConfigModal.value = false
        alert('线控配置保存成功！')
      } else if (currentSaveAction.value === 'rule') {
        // 保存规则
        contracts.value = contracts.value.map((contract) => {
          if (contract.id !== pendingSaveData.value.contractId) return contract
          if (pendingSaveData.value.ruleId) {
            return {
              ...contract,
              rules: contract.rules.map((rule) => (rule.id === pendingSaveData.value.ruleId ? { ...rule, ...pendingSaveData.value.payload } : rule))
            }
          }
          return {
            ...contract,
            rules: [
              {
                id: `rule-${Date.now()}`,
                ...pendingSaveData.value.payload,
                hitCount: 0,
                lastHitAt: '-'
              },
              ...contract.rules
            ]
          }
        })
        showRuleModal.value = false
        resetRuleForm()
        editingRuleId.value = null
        alert('线控规则保存成功！')
      } else if (currentSaveAction.value === 'manual') {
        const { contractId, baseConfig, baseStatus, overrideConfig, durationSec } = pendingSaveData.value
        manualOverrides.value = {
          ...manualOverrides.value,
          [contractId]: { baseConfig: clone(baseConfig), baseStatus, overrideConfig: clone(overrideConfig), startedAt: Date.now(), durationSec: Number(durationSec || 0) }
        }
        contracts.value = contracts.value.map((c) => (c.id === contractId ? { ...c, status: PERP_CONTROL_CONTRACT_STATUS.RUNNING, config: clone(overrideConfig) } : c))
        scheduleManualExpiry(contractId, durationSec)
        alert('手动插线已生效！')
      } else if (currentSaveAction.value === 'manual_remove') {
        const { contractId } = pendingSaveData.value
        revertManual(contractId)
        alert('手动线控已解除！')
      }
      
      pendingSaveData.value = null
      currentSaveAction.value = null
      showMfaModal.value = false
    }
  } catch (error) {
    alert('MFA 验证失败：' + (error.message || '请稍后重试'))
  } finally {
    mfaLoading.value = false
  }
}
</script>

<template>
  <section class="space-y-5">
    <header>
      <h1 class="text-3xl font-semibold text-slate-900">{{ isManualLineMode ? '手动插线' : '合约线控' }}</h1>
      <p class="mt-1 text-sm text-slate-500">
        {{ isManualLineMode ? '实时筛选合约并快速执行手动线控操作' : '管理永续合约线控参数、自动规则与运行状态' }}
      </p>
    </header>

    <div v-if="!isManualLineMode" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article v-for="card in summary" :key="card.label" class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
        <p class="text-sm text-slate-500 font-medium">{{ card.label }}</p>
        <p class="mt-2 text-2xl font-bold text-slate-900">{{ card.value }}</p>
      </article>
    </div>

    <div v-if="isManualLineMode" class="max-w-lg">
      <input
        v-model="keyword"
        type="text"
        placeholder="搜索合约 (代码或名称)..."
        class="ant-input !py-2"
      />
    </div>

    <article v-if="isManualLineMode" class="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4">
        <div>
          <h2 class="text-lg font-semibold text-slate-900">实时合约数据看板</h2>
          <p class="mt-0.5 text-xs text-slate-500">按 24h 交易量排序，支持手动插线与快速解除</p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-xs text-slate-500">实时刷新中（{{ Number(boardRefreshIntervalMs) / 1000 }}s）</span>
          <span class="text-xs text-slate-500">最后刷新：{{ boardLastRefreshAt || '-' }}</span>
        </div>
      </div>
      <div class="max-h-[420px] overflow-auto">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-900 uppercase">排名</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-900 uppercase">合约</th>
              <th class="px-5 py-3 text-right text-xs font-semibold text-slate-900 uppercase">24h交易量</th>
              <th class="px-5 py-3 text-right text-xs font-semibold text-slate-900 uppercase">持仓(多/空/净)</th>
              <th class="px-5 py-3 text-right text-xs font-semibold text-slate-900 uppercase">多空比</th>
              <th class="px-5 py-3 text-right text-xs font-semibold text-slate-900 uppercase">活跃用户</th>
              <th class="px-5 py-3 text-right text-xs font-semibold text-slate-900 uppercase">平台盈亏</th>
              <th class="px-5 py-3 text-right text-xs font-semibold text-slate-900 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="(contract, idx) in boardContracts" :key="`board-${contract.id}`" class="hover:bg-slate-50">
              <td class="px-5 py-4 text-sm font-semibold text-slate-900">{{ idx + 1 }}</td>
              <td class="px-5 py-4">
                <div>
                  <p class="text-sm font-bold text-slate-900">{{ contract.symbol }}</p>
                  <p class="text-xs text-slate-500">{{ contract.alias }}</p>
                </div>
              </td>
              <td class="px-5 py-4 text-right text-sm font-semibold text-slate-900">
                {{ getMetric(contract, metricLabel.VOLUME)?.value || '-' }}
              </td>
              <td class="px-5 py-4 text-right text-xs">
                <p class="font-semibold text-slate-900">
                  {{ getMetric(contract, metricLabel.LONG)?.value || '-' }} /
                  {{ getMetric(contract, metricLabel.SHORT)?.value || '-' }} /
                  <span :class="parseCompactUsd(getMetric(contract, metricLabel.NET)?.value) >= 0 ? 'text-emerald-600' : 'text-rose-600'">
                    {{ getMetric(contract, metricLabel.NET)?.value || '-' }}
                  </span>
                </p>
              </td>
              <td class="px-5 py-4 text-right text-sm font-semibold text-slate-900">
                {{ getMetric(contract, metricLabel.RATIO)?.value || '-' }}
              </td>
              <td class="px-5 py-4 text-right text-sm font-semibold text-slate-900">
                {{ getMetric(contract, metricLabel.USERS)?.value || '-' }}
              </td>
              <td class="px-5 py-4 text-right text-sm font-semibold">
                <span :class="parseCompactUsd(getMetric(contract, metricLabel.PLATFORM_PNL)?.value) >= 0 ? 'text-emerald-600' : 'text-rose-600'">
                  {{ getMetric(contract, metricLabel.PLATFORM_PNL)?.value || '-' }}
                </span>
              </td>
              <td class="px-5 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button type="button" class="ant-btn !h-9 !px-4" @click="openManualLine(contract.id)">手动插线</button>
                  <button v-if="isManualActive(contract.id)" type="button" class="ant-btn !h-9 !px-4" @click="requestRemoveManualLine(contract.id)">解除</button>
                  <button type="button" class="ant-btn ant-btn-primary !h-9 !px-4" @click="openConfig(contract.id)">配置</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <div v-if="!isManualLineMode" class="max-w-lg">
      <input
        v-model="keyword"
        type="text"
        placeholder="搜索合约 (代码或名称)..."
        class="ant-input !py-2"
      />
    </div>

    <div v-if="!isManualLineMode">
    <article
      v-for="contract in paginatedContracts"
      :key="contract.id"
      class="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
    >
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/30 px-5 py-4">
        <div class="flex items-center gap-3">
          <h3 class="text-2xl font-bold text-slate-900">{{ contract.symbol }}</h3>
          <p class="text-sm text-slate-500 font-medium">{{ contract.alias }}</p>
          <div class="flex items-center gap-2 ml-2">
            <span class="rounded-md px-2 py-0.5 text-xs font-bold border" :class="contract.status === PERP_CONTROL_CONTRACT_STATUS.RUNNING ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-amber-50 text-amber-700 border-amber-100'">
              {{ contract.status === PERP_CONTROL_CONTRACT_STATUS.RUNNING ? '线控中' : '暂停' }}
            </span>
            <span
              class="rounded-md px-2 py-0.5 text-xs font-bold border"
              :class="contract.config.autoTriggerEnabled ? 'bg-violet-50 text-violet-700 border-violet-100' : 'bg-slate-100 text-slate-600 border-slate-200'"
            >
              {{ contract.config.autoTriggerEnabled ? '自动触发开' : '自动触发关' }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button type="button" class="ant-btn !h-9 !px-4" @click="toggleContractStatus(contract.id)">
            {{ contract.status === PERP_CONTROL_CONTRACT_STATUS.RUNNING ? '暂停线控' : '启动线控' }}
          </button>
          <button type="button" class="ant-btn ant-btn-primary !h-9 !px-4" @click="openConfig(contract.id)">线控配置</button>
        </div>
      </div>

      <div class="p-5 space-y-5">
        <div class="grid gap-2 md:grid-cols-4 xl:grid-cols-8">
          <div v-for="metric in contract.metrics" :key="metric.label" class="rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 transition-colors hover:bg-slate-50">
            <p class="text-[12px] text-slate-400  uppercase tracking-wider">{{ metric.label }}</p>
            <p class="mt-1 text-sm font-bold" :class="toneClass[metric.tone]">{{ metric.value }}</p>
          </div>
        </div>

        <div class="rounded-lg border border-slate-100 bg-white p-4">
          <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">当前线控参数</p>
          <div class="flex flex-wrap gap-2">
            <span v-for="param in formatParams(contract.config)" :key="param" class="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600 font-medium border border-slate-200/50">{{ param }}</span>
          </div>
        </div>

        <div class="rounded-xl border border-violet-100 bg-violet-50/20 p-4">
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm font-bold text-violet-700 flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              自动线控规则
            </p>
            <button type="button" class="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1" @click="openAddRule(contract.id)">
              <span class="text-base">+</span> 添加规则
            </button>
          </div>

          <div class="space-y-3">
            <article v-for="rule in contract.rules" :key="rule.id" class="rounded-lg border border-violet-100/50 bg-white p-4 shadow-sm transition-all hover:shadow-md">
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-start gap-4">
                  <button
                    type="button"
                    class="relative mt-1 h-5 w-9 rounded-full transition-colors duration-200 focus:outline-none"
                    :class="rule.enabled ? 'bg-blue-600' : 'bg-slate-300'"
                    @click="toggleRule(contract.id, rule.id)"
                  >
                    <span class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200" :class="rule.enabled ? 'translate-x-4.5 left-0' : 'translate-x-0.5 left-0'"></span>
                  </button>
                  <div>
                    <p class="font-bold text-slate-900">{{ rule.name }}</p>
                    <div class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-500">
                      <span class="bg-slate-100 px-1.5 py-0.5 rounded">{{ ruleTriggers[rule.triggerType]?.label }}</span>
                      <span class="text-slate-400">|</span>
                      <span>{{ ruleConditionText(rule) }}</span>
                      <span class="text-slate-400">|</span>
                      <span class="text-blue-600">{{ ruleActionText(rule) }}</span>
                    </div>
                    <div class="mt-2 flex items-center gap-4">
                      <div class="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                        <svg class="h-3 w-3 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>影响: {{ ruleAffectsText(rule) }}</span>
                      </div>
                      <div class="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                        <svg class="h-3 w-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
                        </svg>
                        <span>已触发 {{ rule.hitCount }} 次</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <button type="button" class="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors" @click="openEditRule(contract.id, rule)">编辑</button>
                  <button type="button" class="text-xs font-bold text-rose-400 hover:text-rose-600 transition-colors" @click="deleteRule(contract.id, rule.id)">删除</button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </article>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="mt-6 flex items-center justify-between border-t border-slate-200 pt-6">
      <div class="text-sm text-slate-500">
        共 <span class="font-medium">{{ filteredContracts.length }}</span> 个合约，第 <span class="font-medium">{{ pagination.currentPage }}</span> / <span class="font-medium">{{ totalPages }}</span> 页
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="ant-btn !h-9 !px-4 !text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          :disabled="pagination.currentPage === 1"
          @click="pagination.currentPage--"
        >
          上一页
        </button>
        <button
          type="button"
          class="ant-btn !h-9 !px-4 !text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          :disabled="pagination.currentPage === totalPages"
          @click="pagination.currentPage++"
        >
          下一页
        </button>
      </div>
    </div>

    <p v-if="filteredContracts.length === 0" class="py-20 text-center text-slate-400">没有匹配的合约</p>
    </div>
  </section>

  <ControlConfigModal
    :open="showConfigModal"
    :symbol="activeConfigContractId"
    :config="activeConfig"
    @close="showConfigModal = false"
    @save="saveConfig"
  />

  <div v-if="showManualModal" class="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
    <section class="flex h-[88vh] w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl">
      <div class="flex w-3/5 flex-col border-r border-slate-200">
        <header class="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-rose-50 to-amber-50 px-6 py-4">
          <div>
            <h2 class="text-xl font-semibold text-slate-900">手动插线</h2>
            <p class="mt-0.5 text-xs text-slate-500">对 {{ manualContractId }} 快速应用线控参数，可设置到期自动恢复</p>
          </div>
          <button type="button" class="text-2xl text-slate-400 hover:text-slate-600 transition-colors" @click="showManualModal = false">×</button>
        </header>

        <div class="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <section class="space-y-4 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
                <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-base font-semibold text-slate-900">价格控制</h3>
                <p class="text-xs text-slate-600">影响用户看到的价格</p>
              </div>
            </div>

            <div class="space-y-4 rounded-lg bg-white p-4">
              <label class="block space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="font-medium text-slate-700">价格偏移 (点)</span>
                  <input v-model.number="manualForm.priceOffset" type="number" min="0" max="50" class="ant-input !w-20 !h-8 !px-2 !text-right" />
                </div>
                <input v-model.number="manualForm.priceOffset" type="range" min="0" max="50" step="1" class="w-full accent-blue-600" />
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="v in quickManualInputs.priceOffset"
                    :key="`q-offset-${v}`"
                    type="button"
                    class="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    @click="applyQuickManual('priceOffset', v)"
                  >
                    {{ v }}
                  </button>
                </div>
              </label>

              <label class="block space-y-2">
                <span class="text-sm font-medium text-slate-700">偏移方向</span>
                <select v-model="manualForm.offsetDirection" class="ant-select">
                  <option :value="PERP_CONTROL_OFFSET_DIRECTION.AGAINST">逆势</option>
                  <option :value="PERP_CONTROL_OFFSET_DIRECTION.FOLLOW">顺势</option>
                  <option :value="PERP_CONTROL_OFFSET_DIRECTION.RANDOM">随机</option>
                  <option :value="PERP_CONTROL_OFFSET_DIRECTION.UP">向上</option>
                  <option :value="PERP_CONTROL_OFFSET_DIRECTION.DOWN">向下</option>
                </select>
              </label>
            </div>
          </section>

          <section class="space-y-4 rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50 to-purple-50 p-5 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
                <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-base font-semibold text-slate-900">成交控制</h3>
                <p class="text-xs text-slate-600">影响订单成交质量和速度</p>
              </div>
            </div>

            <div class="space-y-4 rounded-lg bg-white p-4">
              <label class="block space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="font-medium text-slate-700">滑点率 (%)</span>
                  <input v-model.number="manualForm.slippagePct" type="number" min="0" max="2" step="0.01" class="ant-input !w-20 !h-8 !px-2 !text-right" />
                </div>
                <input v-model.number="manualForm.slippagePct" type="range" min="0" max="2" step="0.01" class="w-full accent-violet-600" />
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="v in quickManualInputs.slippagePct"
                    :key="`q-slip-${v}`"
                    type="button"
                    class="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    @click="applyQuickManual('slippagePct', v)"
                  >
                    {{ v }}%
                  </button>
                </div>
              </label>

              <label class="block space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="font-medium text-slate-700">成交延迟 (ms)</span>
                  <input v-model.number="manualForm.latencyMs" type="number" min="0" max="5000" step="10" class="ant-input !w-20 !h-8 !px-2 !text-right" />
                </div>
                <input v-model.number="manualForm.latencyMs" type="range" min="0" max="5000" step="10" class="w-full accent-violet-600" />
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="v in quickManualInputs.latencyMs"
                    :key="`q-lat-${v}`"
                    type="button"
                    class="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    @click="applyQuickManual('latencyMs', v)"
                  >
                    {{ v }}ms
                  </button>
                </div>
              </label>
            </div>
          </section>

          <section class="space-y-4 rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
                <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-base font-semibold text-slate-900">持续时间</h3>
                <p class="text-xs text-slate-600">到期自动恢复（0=持续生效）</p>
              </div>
            </div>

            <div class="space-y-4 rounded-lg bg-white p-4">
              <label class="block space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="font-medium text-slate-700">持续时间 (秒)</span>
                  <input v-model.number="manualForm.durationSec" type="number" min="0" step="1" class="ant-input !w-24 !h-8 !px-2 !text-right" />
                </div>
                <input v-model.number="manualForm.durationSec" type="range" min="0" max="7200" step="60" class="w-full accent-amber-600" />
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="v in quickManualInputs.durationSec"
                    :key="`q-dur-${v}`"
                    type="button"
                    class="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    @click="applyQuickManual('durationSec', v)"
                  >
                    {{ v === 0 ? '持续' : `${v}s` }}
                  </button>
                </div>
              </label>
            </div>
          </section>
        </div>

        <footer class="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button type="button" class="ant-btn !h-10 !px-6" @click="showManualModal = false">取消</button>
          <button type="button" class="ant-btn ant-btn-primary !h-10 !px-8" @click="requestSaveManualLine">保存并生效</button>
        </footer>
      </div>

      <div class="flex w-2/5 flex-col bg-gradient-to-br from-slate-50 to-slate-100">
        <header class="border-b border-slate-200 px-5 py-4">
          <h3 class="text-lg font-semibold text-slate-900">实时预览</h3>
          <p class="mt-0.5 text-xs text-slate-500">参数变化即时反映到价格与成本估算</p>
        </header>

        <div class="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-semibold text-slate-900">配置概览</h4>
              <span class="rounded-md px-2 py-1 text-xs font-medium bg-rose-100 text-rose-700">手动插线</span>
            </div>
            <div class="mt-3 flex flex-wrap gap-2">
              <span class="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">偏移 {{ Number(manualForm.priceOffset || 0) }} 点</span>
              <span class="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">方向 {{ manualOffsetDirectionLabel }}</span>
              <span class="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">滑点 {{ Number(manualForm.slippagePct || 0).toFixed(2) }}%</span>
              <span class="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">延迟 {{ Number(manualForm.latencyMs || 0) }}ms</span>
              <span class="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                {{ Number(manualForm.durationSec || 0) === 0 ? '持续生效' : `持续 ${Number(manualForm.durationSec || 0)}s` }}
              </span>
            </div>
          </div>

          <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-semibold text-slate-900">实时数据</h4>
              <span class="text-xs text-slate-500">更新：{{ boardLastRefreshAt || '-' }}</span>
            </div>
            <div class="mt-3 grid gap-3 sm:grid-cols-2">
              <div class="rounded-lg bg-slate-50 p-3">
                <p class="text-xs font-semibold text-slate-500">24h交易量</p>
                <p class="mt-1 text-base font-bold text-slate-900">{{ manualContractMetrics.volume }}</p>
              </div>
              <div class="rounded-lg bg-slate-50 p-3">
                <p class="text-xs font-semibold text-slate-500">活跃用户</p>
                <p class="mt-1 text-base font-bold text-slate-900">{{ manualContractMetrics.users }}</p>
              </div>
              <div class="rounded-lg bg-slate-50 p-3">
                <p class="text-xs font-semibold text-slate-500">持仓(多/空/净)</p>
                <p class="mt-1 text-sm font-bold text-slate-900">
                  {{ manualContractMetrics.long }} /
                  {{ manualContractMetrics.short }} /
                  <span :class="parseCompactUsd(manualContractMetrics.net) >= 0 ? 'text-emerald-600' : 'text-rose-600'">
                    {{ manualContractMetrics.net }}
                  </span>
                </p>
              </div>
              <div class="rounded-lg bg-slate-50 p-3">
                <p class="text-xs font-semibold text-slate-500">多空比</p>
                <p class="mt-1 text-base font-bold text-slate-900">{{ manualContractMetrics.ratio }}</p>
              </div>
              <div class="rounded-lg bg-slate-50 p-3 sm:col-span-2">
                <p class="text-xs font-semibold text-slate-500">平台盈亏</p>
                <p class="mt-1 text-sm font-bold">
                  <span :class="parseCompactUsd(manualContractMetrics.platformPnl) >= 0 ? 'text-emerald-600' : 'text-rose-600'">
                    {{ manualContractMetrics.platformPnl }}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h4 class="text-sm font-semibold text-slate-900">价格预览</h4>
            <div class="mt-3 grid gap-3 sm:grid-cols-2">
              <div class="rounded-lg bg-slate-50 p-3">
                <p class="text-xs font-semibold text-slate-500">市场价</p>
                <p class="mt-1 text-lg font-bold text-slate-900">${{ manualPreview.basePrice.toLocaleString() }}</p>
              </div>
              <div class="rounded-lg bg-slate-50 p-3">
                <p class="text-xs font-semibold text-slate-500">买入价 (含滑点)</p>
                <p class="mt-1 text-lg font-bold text-slate-900">${{ manualPreview.buyPrice.toFixed(2) }}</p>
              </div>
              <div class="rounded-lg bg-slate-50 p-3">
                <p class="text-xs font-semibold text-slate-500">卖出价 (含滑点)</p>
                <p class="mt-1 text-lg font-bold text-slate-900">${{ manualPreview.sellPrice.toFixed(2) }}</p>
              </div>
              <div class="rounded-lg bg-slate-50 p-3">
                <p class="text-xs font-semibold text-slate-500">成交延迟</p>
                <p class="mt-1 text-lg font-bold text-slate-900">{{ Number(manualForm.latencyMs || 0) }} ms</p>
              </div>
            </div>
          </div>

          <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h4 class="text-sm font-semibold text-slate-900">成本估算</h4>
            <p class="mt-1 text-xs text-slate-500">按 10,000 USDT 订单金额估算</p>
            <div class="mt-3 space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-600">偏移成本</span>
                <span class="font-semibold text-slate-900">${{ manualPreview.priceOffsetCost.toFixed(2) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-600">滑点成本</span>
                <span class="font-semibold text-slate-900">${{ manualPreview.slippageCost.toFixed(2) }}</span>
              </div>
              <div class="h-px bg-slate-200" />
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-700 font-semibold">合计</span>
                <span class="font-bold text-slate-900">${{ manualPreview.totalExtraCost.toFixed(2) }}（{{ manualPreview.totalExtraCostPct.toFixed(2) }}%）</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>

  <div v-if="showRuleModal" class="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
    <section class="flex h-[88vh] w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl">
      <!-- 左侧配置区域 -->
      <div class="flex w-3/5 flex-col border-r border-slate-200">
        <header class="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-violet-50 to-blue-50 px-6 py-4">
          <div>
            <h2 class="text-xl font-semibold text-slate-900">{{ editingRuleId ? '编辑线控规则' : '新增线控规则' }}</h2>
            <p class="mt-0.5 text-xs text-slate-500">配置规则的触发条件和执行动作</p>
          </div>
          <button type="button" class="text-2xl text-slate-400 hover:text-slate-600 transition-colors" @click="showRuleModal = false">×</button>
        </header>

        <div class="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <!-- 基础信息 -->
          <section class="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                <svg class="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-base font-semibold text-slate-900">基础信息</h3>
            </div>
            
            <div class="space-y-4">
              <label class="block space-y-2">
                <span class="text-sm font-medium text-slate-700">规则名称 <span class="text-rose-500">*</span></span>
                <input
                  v-model="ruleForm.name"
                  type="text"
                  class="ant-input"
                  placeholder="如：多头过重自动调整"
                />
              </label>

              <div class="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <div class="flex items-center gap-2">
                  <svg class="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-sm text-slate-700 font-medium">保存后立即启用</span>
                </div>
                <label class="relative inline-flex cursor-pointer items-center">
                  <input v-model="ruleForm.enabled" type="checkbox" class="peer sr-only" />
                  <div class="peer h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-violet-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>

              <div class="rounded-lg border border-blue-100 bg-blue-50/50 px-4 py-3">
                <div class="flex items-start gap-2">
                  <svg class="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                  <div class="text-sm font-medium text-blue-700">
                    作用合约：<span class="font-bold text-blue-900">{{ currentContract?.symbol || '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 触发条件 -->
          <section class="space-y-4 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 class="text-base font-semibold text-slate-900">触发条件</h3>
            </div>
            
            <div class="space-y-3.5">
              <label class="block space-y-2">
                <span class="text-sm font-medium text-slate-700">触发类型</span>
                <select v-model="ruleForm.triggerType" class="ant-select">
                  <option v-for="opt in triggerOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                </select>
              </label>

              <div class="grid gap-3.5 sm:grid-cols-2">
                <label class="block space-y-2">
                  <span class="text-sm font-medium text-slate-700">{{ triggerMeta.thresholdLabel }} <span class="text-rose-500">*</span></span>
                  <input
                    v-model.number="ruleForm.thresholdValue"
                    type="number"
                    min="0"
                    class="ant-input"
                  />
                </label>
                <label class="block space-y-2">
                  <span class="text-sm font-medium text-slate-700">触发方向</span>
                  <select v-model="ruleForm.triggerDirection" class="ant-select">
                    <option v-for="d in triggerMeta.directionOptions" :key="d.value" :value="d.value">{{ d.label }}</option>
                  </select>
                </label>
              </div>

              <!-- 单边占比配置 - 仅净持仓触发时显示 -->
              <div v-if="needsPositionRatio" class="rounded-lg border border-blue-200 bg-white p-4">
                <label class="block space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-slate-700">
                      {{ ruleForm.triggerDirection === PERP_CONTROL_RULE_DIRECTION.LONG_HEAVY ? '多头' : '空头' }}占比阈值 (%)
                    </span>
                    <input
                      v-model.number="ruleForm.positionRatio"
                      type="number"
                      min="50"
                      max="100"
                      step="1"
                      class="ant-input !w-20 !h-8 !px-2 !text-right"
                    />
                  </div>
                  <input v-model.number="ruleForm.positionRatio" type="range" min="50" max="100" step="1" class="w-full accent-blue-600" />
                  <div class="flex items-start gap-1.5 rounded-md bg-blue-50 px-3 py-2">
                    <svg class="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="text-xs text-blue-700 font-medium">
                      定义"过重"：当{{ ruleForm.triggerDirection === PERP_CONTROL_RULE_DIRECTION.LONG_HEAVY ? '多头' : '空头' }}持仓占总持仓的比例达到此阈值时触发
                    </span>
                  </div>
                </label>
              </div>

              <!-- 时间区间配置 - 盈亏比、交易量突增和波动率触发时显示 -->
              <div v-if="needsTimeWindow" class="rounded-lg border border-blue-200 bg-white p-4">
                <label class="block space-y-2">
                  <span class="text-sm font-medium text-slate-700">统计时间区间</span>
                  <select v-model="ruleForm.timeWindow" class="ant-select">
                    <option v-for="tw in availableTimeWindows" :key="tw.value" :value="tw.value">{{ tw.label }}</option>
                  </select>
                  <div class="flex items-start gap-1.5 rounded-md bg-blue-50 px-3 py-2">
                    <svg class="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="text-xs text-blue-700 font-medium">指定在哪个时间范围内统计数据来判断是否触发</span>
                  </div>
                </label>
              </div>
            </div>
          </section>

          <!-- 执行动作 -->
          <section class="space-y-4 rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-5 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
                <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 class="text-base font-semibold text-slate-900">执行动作</h3>
            </div>
            
            <div class="space-y-4">
              <!-- 价格偏移 -->
              <div class="rounded-lg border border-violet-100 bg-white p-4">
                <label class="block space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-slate-700">价格偏移 (点)</span>
                    <input
                      v-model.number="ruleForm.priceOffset"
                      type="number"
                      min="0"
                      max="50"
                      step="1"
                      class="ant-input !w-20 !h-8 !px-2 !text-right"
                    />
                  </div>
                  <input v-model.number="ruleForm.priceOffset" type="range" min="0" max="50" step="1" class="w-full accent-violet-600" />
                  <div class="flex items-start gap-1.5 rounded-md bg-violet-50 px-3 py-2">
                    <svg class="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="text-xs text-violet-700 font-medium">影响用户看到的买卖价格</span>
                  </div>
                </label>
              </div>

              <!-- 偏移方向和滑点率 -->
              <div class="grid gap-4 sm:grid-cols-2">
                <label class="block space-y-2">
                  <span class="text-sm font-medium text-slate-700">偏移方向</span>
                  <select v-model="ruleForm.offsetDirection" class="ant-select">
                    <option v-for="d in offsetDirections" :key="d.value" :value="d.value">{{ d.label }}</option>
                  </select>
                </label>

                <label class="block space-y-2">
                  <span class="text-sm font-medium text-slate-700">持续时间 (秒)</span>
                  <input
                    v-model.number="ruleForm.durationSec"
                    type="number"
                    min="0"
                    class="ant-input"
                    placeholder="0 为持续生效"
                  />
                </label>
              </div>

              <!-- 滑点率 -->
              <div class="rounded-lg border border-violet-100 bg-white p-4">
                <label class="block space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-slate-700">滑点率 (%)</span>
                    <input
                      v-model.number="ruleForm.slippagePct"
                      type="number"
                      min="0"
                      max="2"
                      step="0.01"
                      class="ant-input !w-20 !h-8 !px-2 !text-right"
                    />
                  </div>
                  <input v-model.number="ruleForm.slippagePct" type="range" min="0" max="2" step="0.01" class="w-full accent-violet-600" />
                  <div class="flex items-start gap-1.5 rounded-md bg-violet-50 px-3 py-2">
                    <svg class="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="text-xs text-violet-700 font-medium">影响成交时的价格差异</span>
                  </div>
                </label>
              </div>
            </div>
          </section>
        </div>

        <footer class="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button type="button" class="ant-btn !h-10 !px-6" @click="showRuleModal = false">取消</button>
          <button
            type="button"
            class="ant-btn ant-btn-primary !h-10 !px-8"
            :disabled="!ruleForm.name.trim() || Number(ruleForm.thresholdValue) <= 0"
            @click="saveRule"
          >
            <span class="flex items-center gap-2">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              保存规则
            </span>
          </button>
        </footer>
      </div>

      <!-- 右侧预览区域 -->
      <div class="flex w-2/5 flex-col bg-gradient-to-br from-slate-50 to-slate-100">
        <header class="border-b border-slate-200 px-5 py-4">
          <h3 class="text-lg font-semibold text-slate-900">实时预览</h3>
          <p class="mt-0.5 text-xs text-slate-500">调整参数后即时显示效果</p>
        </header>

        <div class="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <!-- 规则概览 -->
          <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-semibold text-slate-900">规则概览</h4>
              <span class="rounded-md px-2 py-1 text-xs font-medium" :class="ruleForm.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'">
                {{ ruleForm.enabled ? '已启用' : '未启用' }}
              </span>
            </div>
            <div class="mt-3 space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">规则名称</span>
                <span class="font-medium text-slate-900">{{ ruleForm.name || '未命名规则' }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">作用合约</span>
                <span class="font-medium text-slate-900">{{ currentContract?.symbol || '-' }}</span>
              </div>
              <div class="pt-2 border-t border-slate-100">
                <div class="flex items-start gap-1.5 text-xs">
                  <svg class="h-3.5 w-3.5 text-violet-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <span class="font-medium text-slate-700">影响参数: </span>
                    <span class="text-slate-600">
                      {{ (() => {
                        const affects = [];
                        if (Number(ruleForm.priceOffset) > 0) affects.push('价格偏移');
                        if (Number(ruleForm.slippagePct) > 0) affects.push('滑点');
                        return affects.length > 0 ? affects.join('、') : '无影响';
                      })() }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 数据计算预览 -->
          <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-semibold text-emerald-900">数据计算预览</h4>
              <span 
                class="rounded-md px-2 py-1 text-xs font-medium" 
                :class="{
                  'bg-rose-100 text-rose-700': calculatedPreview.riskLevel === 'high',
                  'bg-amber-100 text-amber-700': calculatedPreview.riskLevel === 'medium',
                  'bg-emerald-100 text-emerald-700': calculatedPreview.riskLevel === 'low'
                }"
              >
                {{ calculatedPreview.riskLevel === 'high' ? '高风险' : calculatedPreview.riskLevel === 'medium' ? '中风险' : '低风险' }}
              </span>
            </div>
            <div class="mt-3 space-y-3">
              <!-- 价格影响 -->
              <div class="rounded-md border border-emerald-200 bg-white p-3">
                <p class="text-xs font-medium text-slate-500">基于模拟价格计算</p>
                <div class="mt-2 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p class="text-xs text-slate-500">市场价</p>
                    <p class="mt-1 text-sm font-bold text-slate-900">${{ calculatedPreview.basePrice.toLocaleString() }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-rose-600">用户买入价</p>
                    <p class="mt-1 text-sm font-bold text-rose-600">${{ calculatedPreview.buyPrice.toFixed(2) }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-emerald-600">用户卖出价</p>
                    <p class="mt-1 text-sm font-bold text-emerald-600">${{ calculatedPreview.sellPrice.toFixed(2) }}</p>
                  </div>
                </div>
              </div>

              <!-- 成本影响分析 -->
              <div class="rounded-md border border-emerald-200 bg-white p-3">
                <p class="text-xs font-medium text-slate-500">10,000 USDT 订单成本影响</p>
                <div class="mt-2 space-y-1.5">
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-slate-600">滑点成本</span>
                    <span class="font-semibold text-slate-900">${{ calculatedPreview.slippageCost.toFixed(2) }}</span>
                  </div>
                  <div class="flex items-center justify-between rounded bg-rose-50 px-2 py-1 text-xs border-t border-emerald-200 pt-1.5">
                    <span class="font-medium text-rose-700">总额外成本</span>
                    <span class="font-bold text-rose-700">${{ calculatedPreview.totalExtraCost.toFixed(2) }} ({{ calculatedPreview.totalExtraCostPct.toFixed(3) }}%)</span>
                  </div>
                </div>
              </div>

              <!-- 风险指标 -->
              <div class="rounded-md border border-emerald-200 bg-white p-3">
                <p class="text-xs font-medium text-slate-500">风险指标</p>
                <div class="mt-2 space-y-2">
                  <div class="text-xs">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-slate-600">综合风险评分</span>
                      <span class="font-semibold text-slate-900">{{ calculatedPreview.riskScore }} / 6</span>
                    </div>
                    <div class="text-xs text-slate-500">
                      <span v-if="calculatedPreview.riskLevel === 'low'">✓ 参数配置较为温和，对用户体验影响较小</span>
                      <span v-else-if="calculatedPreview.riskLevel === 'medium'">⚠ 参数配置会明显影响交易成本</span>
                      <span v-else>⚠ 参数配置较为激进，建议谨慎使用</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 效果说明 -->
          <div class="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div class="flex items-start gap-2">
              <svg class="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <div class="text-xs text-amber-900">
                <p class="font-medium">提示</p>
                <p class="mt-1">规则触发后，系统将自动应用上述线控参数，影响用户的交易体验。请谨慎配置各项参数值。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- MFA 验证弹窗 -->
  <MfaVerificationModal
    v-model:open="showMfaModal"
    :loading="mfaLoading"
    :title="mfaMeta.title"
    :description="mfaMeta.description"
    @verify="handleMfaVerify"
    @cancel="pendingSaveData = null; currentSaveAction = null"
  />
</template>
