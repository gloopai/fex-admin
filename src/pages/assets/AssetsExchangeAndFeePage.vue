<script setup>
import { computed, reactive, ref } from 'vue'
import MfaVerificationModal from '../../components/MfaVerificationModal.vue'
import {
  EXCHANGE_RATE_SOURCE,
  EXCHANGE_RATE_TYPE,
  FEE_TEMPLATE_TYPE
} from '../../constants/assets'
import { createExchangeRatePairsMock, createFeeTemplatesMock } from '../../mock/assets'
import { getActiveVipLevels } from '../../mock/vip'

const viewTab = ref('rates')
const statusTab = ref('all')
const search = ref('')
const showEditModal = ref(false)
const editingId = ref('')

// MFA 验证相关
const showMfaModal = ref(false)
const pendingSaveData = ref(null)
const mfaLoading = ref(false)

const pairs = ref(createExchangeRatePairsMock())
const feeTemplates = ref(createFeeTemplatesMock())
const availableAssets = ref(['USDT', 'BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'XRP', 'DOT', 'TRX', 'DOGE'])

// 汇率管理表单
const rateForm = reactive({
  baseAsset: '',
  quoteAsset: '',
  source: EXCHANGE_RATE_SOURCE.BINANCE,
  type: EXCHANGE_RATE_TYPE.FLOATING,
  marketRate: 0,
  feeTemplateId: '',
  buyMarkup: 0.005,
  sellMarkup: 0.005,
  enabled: true,
  autoReverse: true,
  userLevelRates: {}
})

// 费率模板表单
const templateForm = reactive({
  name: '',
  type: FEE_TEMPLATE_TYPE.STANDARD,
  description: '',
  baseMarkup: { buy: 0.005, sell: 0.005 },
  userLevelRates: {},
  enabled: true
})

const filteredPairs = computed(() => {
  const kw = search.value.trim().toLowerCase()
  return pairs.value.filter((pair) => {
    const hitStatus = statusTab.value === 'all' || 
      (statusTab.value === 'enabled' && pair.enabled) || 
      (statusTab.value === 'disabled' && !pair.enabled)
    const hitKeyword = !kw || `${pair.baseAsset}/${pair.quoteAsset}`.toLowerCase().includes(kw)
    return hitStatus && hitKeyword
  })
})

const filteredTemplates = computed(() => {
  const kw = search.value.trim().toLowerCase()
  return feeTemplates.value.filter((template) => {
    const hitStatus = statusTab.value === 'all' || 
      (statusTab.value === 'enabled' && template.enabled) || 
      (statusTab.value === 'disabled' && !template.enabled)
    const hitKeyword = !kw || `${template.name} ${template.description}`.toLowerCase().includes(kw)
    return hitStatus && hitKeyword
  })
})

const enabledPairsCount = computed(() => pairs.value.filter((p) => p.enabled).length)
const enabledTemplatesCount = computed(() => feeTemplates.value.filter((t) => t.enabled).length)
const activeVipLevels = computed(() => getActiveVipLevels().slice().sort((a, b) => a.level - b.level))
const selectedRateTemplate = computed(() => feeTemplates.value.find((t) => t.id === rateForm.feeTemplateId) || null)
const ratePreviewPair = computed(() => {
  const base = rateForm.baseAsset.trim().toUpperCase()
  const quote = rateForm.quoteAsset.trim().toUpperCase()
  return `${base || '—'}/${quote || '—'}`
})
const ratePreviewLevelEntries = computed(() => {
  const rates = rateForm.userLevelRates || {}
  const byVip = activeVipLevels.value
    .map((vip) => {
      const key = `vip${vip.level}`
      return rates[key] ? [key, rates[key]] : null
    })
    .filter(Boolean)
  const has = new Set(byVip.map(([key]) => key))
  const rest = Object.entries(rates).filter(([key]) => !has.has(key))
  return [...byVip, ...rest]
})
const templatePreviewLevelEntries = computed(() => {
  const rates = templateForm.userLevelRates || {}
  const byVip = activeVipLevels.value
    .map((vip) => {
      const key = `vip${vip.level}`
      return rates[key] ? [key, rates[key]] : null
    })
    .filter(Boolean)
  const has = new Set(byVip.map(([key]) => key))
  const rest = Object.entries(rates).filter(([key]) => !has.has(key))
  return [...byVip, ...rest]
})

const getTemplateLevelEntries = (template) => {
  const rates = template?.userLevelRates || {}
  const byVip = activeVipLevels.value
    .map((vip) => {
      const key = `vip${vip.level}`
      return rates[key] ? [key, rates[key]] : null
    })
    .filter(Boolean)
  const has = new Set(byVip.map(([key]) => key))
  const rest = Object.entries(rates).filter(([key]) => !has.has(key))
  return [...byVip, ...rest]
}

const RATE_LEVEL_PREVIEW_LIMIT = 5
const rateLevelsExpanded = ref(false)

const TEMPLATE_LEVEL_PREVIEW_LIMIT = 5
const templateLevelsExpandedMap = ref({})
const templatePreviewExpanded = ref(false)

const isTemplateLevelsExpanded = (templateId) => Boolean(templateLevelsExpandedMap.value[templateId])

const toggleTemplateLevelsExpand = (templateId) => {
  templateLevelsExpandedMap.value = {
    ...templateLevelsExpandedMap.value,
    [templateId]: !templateLevelsExpandedMap.value[templateId]
  }
}

const getVisibleTemplateLevelEntries = (template) => {
  const entries = getTemplateLevelEntries(template)
  if (isTemplateLevelsExpanded(template.id)) return entries
  return entries.slice(0, TEMPLATE_LEVEL_PREVIEW_LIMIT)
}

const hasMoreTemplateLevels = (template) => getTemplateLevelEntries(template).length > TEMPLATE_LEVEL_PREVIEW_LIMIT

const getVisibleRatePreviewLevelEntries = () => {
  if (rateLevelsExpanded.value) return ratePreviewLevelEntries.value
  return ratePreviewLevelEntries.value.slice(0, RATE_LEVEL_PREVIEW_LIMIT)
}

const hasMoreRatePreviewLevels = computed(() => ratePreviewLevelEntries.value.length > RATE_LEVEL_PREVIEW_LIMIT)

const getVisibleTemplatePreviewLevelEntries = () => {
  if (templatePreviewExpanded.value) return templatePreviewLevelEntries.value
  return templatePreviewLevelEntries.value.slice(0, TEMPLATE_LEVEL_PREVIEW_LIMIT)
}

const hasMoreTemplatePreviewLevels = computed(() => templatePreviewLevelEntries.value.length > TEMPLATE_LEVEL_PREVIEW_LIMIT)

// ========== 通用方法 ==========
const clonePairToForm = (pair) => {
  rateForm.baseAsset = pair.baseAsset
  rateForm.quoteAsset = pair.quoteAsset
  rateForm.source = pair.source || EXCHANGE_RATE_SOURCE.BINANCE
  rateForm.type = EXCHANGE_RATE_TYPE.FLOATING
  rateForm.marketRate = pair.marketRate
  rateForm.feeTemplateId = pair.feeTemplateId || ''
  rateForm.buyMarkup = pair.buyMarkup
  rateForm.sellMarkup = pair.sellMarkup
  rateForm.enabled = pair.enabled
  rateForm.autoReverse = pair.autoReverse
  rateForm.userLevelRates = syncRateVipLevelRatesWithModule(
    JSON.parse(JSON.stringify(pair.userLevelRates || {})),
    pair.buyMarkup,
    pair.sellMarkup
  )
}

const getVipLevelNumber = (level) => {
  const match = String(level || '').toLowerCase().match(/^vip(\d+)$/)
  return match ? Number(match[1]) : null
}

const sortVipLevels = (levels) => {
  return [...levels].sort((a, b) => {
    const aNum = getVipLevelNumber(a)
    const bNum = getVipLevelNumber(b)
    if (aNum !== null && bNum !== null) return aNum - bNum
    if (aNum !== null) return -1
    if (bNum !== null) return 1
    return String(a).localeCompare(String(b))
  })
}

const defaultVipRateFactor = (index) => Math.max(0.2, 1 - index * 0.2)

const normalizeVipLevelRates = (levelRates, baseMarkup = templateForm.baseMarkup) => {
  const baseBuy = Number(baseMarkup.buy) || 0
  const baseSell = Number(baseMarkup.sell) || 0
  const entries = Object.entries(levelRates || {})

  if (!entries.length) {
    return {
      vip0: { buy: baseBuy, sell: baseSell }
    }
  }

  const normalized = {}
  let nextIndex = 0

  sortVipLevels(entries.map(([level]) => level)).forEach((level) => {
    const origin = levelRates[level] || {}
    const vipIndex = getVipLevelNumber(level) ?? nextIndex
    const key = `vip${vipIndex}`
    normalized[key] = {
      buy: Number(origin.buy) || 0,
      sell: Number(origin.sell) || 0
    }
    nextIndex = Math.max(nextIndex, vipIndex + 1)
  })

  return normalized
}

const syncVipLevelRatesWithModule = (levelRates = {}, baseMarkup = templateForm.baseMarkup) => {
  const normalized = normalizeVipLevelRates(levelRates, baseMarkup)
  const baseBuy = Number(baseMarkup.buy) || 0
  const baseSell = Number(baseMarkup.sell) || 0

  return activeVipLevels.value.reduce((acc, vip, index) => {
    const key = `vip${vip.level}`
    const fallbackByOrder = normalized[`vip${index}`] || normalized[`vip${index + 1}`]
    const fallback = normalized[key] || fallbackByOrder
    const factor = defaultVipRateFactor(index)
    acc[key] = {
      buy: Number((Number(fallback?.buy ?? baseBuy * factor) || 0).toFixed(6)),
      sell: Number((Number(fallback?.sell ?? baseSell * factor) || 0).toFixed(6))
    }
    return acc
  }, {})
}

const cloneTemplateToForm = (template) => {
  templateForm.name = template.name
  templateForm.type = template.type
  templateForm.description = template.description
  templateForm.baseMarkup = JSON.parse(JSON.stringify(template.baseMarkup))
  templateForm.userLevelRates = syncVipLevelRatesWithModule(JSON.parse(JSON.stringify(template.userLevelRates)), template.baseMarkup)
  templateForm.enabled = template.enabled
}

const initUserLevelRates = () => {
  templateForm.userLevelRates = syncVipLevelRatesWithModule({}, templateForm.baseMarkup)
}

const syncRateVipLevelRatesWithModule = (levelRates = {}, buyMarkup = rateForm.buyMarkup, sellMarkup = rateForm.sellMarkup) => {
  return syncVipLevelRatesWithModule(levelRates, {
    buy: Number(buyMarkup) || 0,
    sell: Number(sellMarkup) || 0
  })
}

const initRateUserLevelRates = () => {
  rateForm.userLevelRates = syncRateVipLevelRatesWithModule({}, rateForm.buyMarkup, rateForm.sellMarkup)
}

const updateRateBaseMarkup = () => {
  rateForm.userLevelRates = syncRateVipLevelRatesWithModule(rateForm.userLevelRates, rateForm.buyMarkup, rateForm.sellMarkup)
}

const vipLevelLabel = (level) => {
  const number = getVipLevelNumber(level)
  const meta = activeVipLevels.value.find((vip) => vip.level === number)
  if (meta) {
    return meta.displayName ? `${meta.name}（${meta.displayName}）` : meta.name
  }
  return number !== null ? `VIP ${number}` : String(level || '').toUpperCase()
}

const calculateRates = () => {
  rateForm.buyRate = rateForm.marketRate * (1 + rateForm.buyMarkup)
  rateForm.sellRate = rateForm.marketRate * (1 - rateForm.sellMarkup)
}

// ========== 汇率管理操作 ==========
const openEditRate = (pair) => {
  editingId.value = pair.id
  clonePairToForm(pair)
  rateLevelsExpanded.value = false
  showEditModal.value = true
}

const openCreateRate = () => {
  editingId.value = ''
  Object.assign(rateForm, {
    baseAsset: '',
    quoteAsset: '',
    source: EXCHANGE_RATE_SOURCE.BINANCE,
    type: EXCHANGE_RATE_TYPE.FLOATING,
    marketRate: 0,
    feeTemplateId: '',
    buyMarkup: 0.005,
    sellMarkup: 0.005,
    enabled: true,
    autoReverse: true,
    userLevelRates: {}
  })
  initRateUserLevelRates()
  rateLevelsExpanded.value = false
  showEditModal.value = true
}

const applyFeeTemplate = (templateId) => {
  const template = feeTemplates.value.find(t => t.id === templateId)
  if (template) {
    rateForm.feeTemplateId = templateId
    rateForm.buyMarkup = template.baseMarkup.buy
    rateForm.sellMarkup = template.baseMarkup.sell
    rateForm.userLevelRates = syncRateVipLevelRatesWithModule(
      JSON.parse(JSON.stringify(template.userLevelRates || {})),
      template.baseMarkup.buy,
      template.baseMarkup.sell
    )
    calculateRates()
  }
}

const saveRate = () => {
  calculateRates()
  
  const payload = {
    baseAsset: rateForm.baseAsset.trim().toUpperCase(),
    quoteAsset: rateForm.quoteAsset.trim().toUpperCase(),
    source: rateForm.source,
    type: EXCHANGE_RATE_TYPE.FLOATING,
    marketRate: Number(rateForm.marketRate),
    feeTemplateId: rateForm.feeTemplateId || null,
    buyMarkup: Number(rateForm.buyMarkup),
    sellMarkup: Number(rateForm.sellMarkup),
    buyRate: Number(rateForm.buyRate),
    sellRate: Number(rateForm.sellRate),
    enabled: Boolean(rateForm.enabled),
    autoReverse: Boolean(rateForm.autoReverse),
    userLevelRates: rateForm.userLevelRates,
    lastUpdate: new Date().toISOString().replace('T', ' ').substring(0, 19)
  }

  pendingSaveData.value = payload
  showMfaModal.value = true
}

// ========== 费率模板操作 ==========
const openEditTemplate = (template) => {
  editingId.value = template.id
  cloneTemplateToForm(template)
  templatePreviewExpanded.value = false
  showEditModal.value = true
}

const openCreateTemplate = () => {
  editingId.value = ''
  Object.assign(templateForm, {
    name: '',
    type: FEE_TEMPLATE_TYPE.STANDARD,
    description: '',
    baseMarkup: { buy: 0.005, sell: 0.005 },
    userLevelRates: {},
    enabled: true
  })
  initUserLevelRates()
  templatePreviewExpanded.value = false
  showEditModal.value = true
}

const updateBaseMarkup = () => {
  initUserLevelRates()
}

const saveTemplate = () => {
  const payload = {
    name: templateForm.name.trim(),
    type: templateForm.type,
    description: templateForm.description.trim(),
    baseMarkup: {
      buy: Number(templateForm.baseMarkup.buy),
      sell: Number(templateForm.baseMarkup.sell)
    },
    userLevelRates: templateForm.userLevelRates,
    enabled: Boolean(templateForm.enabled),
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
  }

  pendingSaveData.value = payload
  showMfaModal.value = true
}

// ========== MFA 验证处理 ==========
const handleMfaVerify = async (code) => {
  mfaLoading.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (pendingSaveData.value) {
      if (viewTab.value === 'rates') {
        // 保存汇率配置
        if (editingId.value) {
          pairs.value = pairs.value.map((pair) => 
            pair.id === editingId.value ? { ...pair, ...pendingSaveData.value } : pair
          )
        } else {
          pairs.value.unshift({ id: `pair-${Date.now()}`, ...pendingSaveData.value })
        }
      } else {
        // 保存费率模板
        if (editingId.value) {
          const template = feeTemplates.value.find(t => t.id === editingId.value)
          Object.assign(template, {
            ...pendingSaveData.value,
            usageCount: template.usageCount
          })
        } else {
          feeTemplates.value.unshift({ 
            id: `template-${Date.now()}`, 
            ...pendingSaveData.value,
            usageCount: 0,
            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
          })
        }
      }

      showEditModal.value = false
      pendingSaveData.value = null
      showMfaModal.value = false
      alert(viewTab.value === 'rates' ? '汇率配置保存成功！' : '费率模板保存成功！')
    }
  } catch (error) {
    alert('MFA 验证失败：' + (error.message || '请稍后重试'))
  } finally {
    mfaLoading.value = false
  }
}

// ========== 工具函数 ==========
const sourceLabel = (source) => {
  const map = {
    [EXCHANGE_RATE_SOURCE.BINANCE]: '币安',
    [EXCHANGE_RATE_SOURCE.OKX]: 'OKX',
    [EXCHANGE_RATE_SOURCE.COINGECKO]: 'CoinGecko',
    [EXCHANGE_RATE_SOURCE.CUSTOM]: '自定义'
  }
  return map[source] || source
}

const templateTypeLabel = (type) => {
  const map = {
    [FEE_TEMPLATE_TYPE.STANDARD]: '标准',
    [FEE_TEMPLATE_TYPE.PREMIUM]: '优惠',
    [FEE_TEMPLATE_TYPE.VIP]: 'VIP',
    [FEE_TEMPLATE_TYPE.CUSTOM]: '自定义'
  }
  return map[type] || type
}

const templateTypeBadgeClass = (type) => {
  const map = {
    [FEE_TEMPLATE_TYPE.STANDARD]: 'bg-blue-50 text-blue-600',
    [FEE_TEMPLATE_TYPE.PREMIUM]: 'bg-purple-50 text-purple-600',
    [FEE_TEMPLATE_TYPE.VIP]: 'bg-amber-50 text-amber-600',
    [FEE_TEMPLATE_TYPE.CUSTOM]: 'bg-slate-50 text-slate-600'
  }
  return map[type] || 'bg-slate-50 text-slate-600'
}
const getTemplateName = (templateId) => {
  if (!templateId) return '手动配置'
  const template = feeTemplates.value.find(t => t.id === templateId)
  return template ? template.name : '未知模板'
}
</script>

<template>
  <section class="space-y-4">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl font-semibold text-slate-900">闪兑汇率与费率管理</h1>
        <p class="mt-1 text-sm text-slate-500">管理闪兑模块兑换汇率以及手续费</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        @click="viewTab === 'rates' ? openCreateRate() : openCreateTemplate()"
      >
        <span class="text-base">+</span>
        <span>{{ viewTab === 'rates' ? '新增交易对' : '新增模板' }}</span>
      </button>
    </header>

    <article class="rounded-xl border border-slate-200 bg-white">
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-4">
        <div class="flex flex-wrap items-center gap-4">
          <!-- View Tab Switcher -->
          <div class="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              class="rounded-md px-4 py-1.5 text-sm"
              :class="viewTab === 'rates' ? 'bg-white font-medium text-blue-600 shadow-sm' : 'text-slate-600'"
              @click="viewTab = 'rates'"
            >
              汇率管理
            </button>
            <button
              type="button"
              class="rounded-md px-4 py-1.5 text-sm"
              :class="viewTab === 'templates' ? 'bg-white font-medium text-blue-600 shadow-sm' : 'text-slate-600'"
              @click="viewTab = 'templates'"
            >
              费率模板
            </button>
          </div>

          <!-- Status Filter -->
          <div class="inline-flex items-center gap-2 text-sm">
            <button type="button" class="font-medium" :class="statusTab === 'all' ? 'text-blue-600' : 'text-slate-500'" @click="statusTab = 'all'">全部</button>
            <button type="button" class="font-medium" :class="statusTab === 'enabled' ? 'text-blue-600' : 'text-slate-500'" @click="statusTab = 'enabled'">已启用</button>
            <button type="button" class="font-medium" :class="statusTab === 'disabled' ? 'text-blue-600' : 'text-slate-500'" @click="statusTab = 'disabled'">已禁用</button>
          </div>
        </div>

        <!-- Search -->
        <div class="flex w-full max-w-2xl flex-wrap items-center justify-end gap-2">
          <div class="relative w-full max-w-sm">
            <input
              v-model="search"
              type="text"
              class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
              :placeholder="viewTab === 'rates' ? '搜索交易对...' : '搜索模板名称...'"
            />
            <svg viewBox="0 0 20 20" class="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none">
              <circle cx="9" cy="9" r="5.8" stroke="currentColor" stroke-width="1.6" />
              <path d="M13.6 13.6L16.4 16.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
          </div>
        </div>
      </div>

      <!-- 汇率管理内容 -->
      <div v-if="viewTab === 'rates'" class="space-y-3 p-4">
        <div class="flex items-center justify-between pb-2">
          <p class="text-sm text-slate-500">
            共 <span class="font-semibold text-slate-900">{{ filteredPairs.length }}</span> 个交易对，已启用 <span class="font-semibold text-emerald-600">{{ enabledPairsCount }}</span>
          </p>
        </div>

        <div
          v-for="pair in filteredPairs"
          :key="pair.id"
          class="group flex flex-col items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:border-blue-200 hover:shadow-md md:flex-row md:items-center"
        >
          <!-- 交易对基础信息 -->
          <div class="flex w-full items-center gap-4 border-b border-slate-100 bg-slate-50/50 p-4 md:w-1/4 md:border-b-0 md:border-r md:bg-white">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg font-bold text-blue-600">
              {{ pair.baseAsset[0] }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <h3 class="truncate text-lg font-bold text-slate-900">{{ pair.baseAsset }}/{{ pair.quoteAsset }}</h3>
                <span class="rounded px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider" :class="pair.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'">
                  {{ pair.enabled ? 'ON' : 'OFF' }}
                </span>
              </div>
              <div class="mt-1 flex flex-wrap gap-1.5">
                <span class="rounded bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-600">{{ sourceLabel(pair.source) }}</span>
                <span v-if="pair.autoReverse" class="rounded bg-indigo-50 px-1.5 py-0.5 text-xs font-medium text-indigo-600">反向映射</span>
              </div>
            </div>
          </div>

          <!-- 核心汇率数据 -->
          <div class="grid flex-1 grid-cols-2 gap-4 p-4 md:grid-cols-4">
            <div class="space-y-1">
              <p class="text-xs  text-slate-400">市场中间价</p>
              <p class="text-base font-bold text-slate-900">{{ pair.marketRate }}</p>
              <p class="text-xs text-slate-500">数据源 {{ sourceLabel(pair.source) }}</p>
            </div>
            <div class="space-y-1 border-r border-slate-50 md:border-r-0">
              <p class="text-xs font-medium uppercase tracking-wider text-slate-400">兑换费率加成</p>
              <p class="text-sm font-bold text-blue-600">正 {{ (pair.sellMarkup * 100).toFixed(2) }}% / 逆 {{ (pair.buyMarkup * 100).toFixed(2) }}%</p>
              <p class="text-xs text-slate-500">{{ getTemplateName(pair.feeTemplateId) }}</p>
            </div>
            <div class="space-y-1 md:col-span-2">
              <p class="text-xs font-medium uppercase tracking-wider text-slate-400">状态与更新</p>
              <p class="text-sm font-medium text-slate-600">{{ pair.lastUpdate }}</p>
              <p class="text-xs text-slate-400">
                反向映射：<span :class="pair.autoReverse ? 'text-indigo-600 font-medium' : 'text-slate-400'">{{ pair.autoReverse ? '已开启' : '已关闭' }}</span>
              </p>
            </div>
          </div>

          <!-- 操作区 -->
          <div class="flex items-center justify-end border-t border-slate-100 bg-slate-50/30 p-4 md:w-32 md:border-t-0 md:bg-white">
            <button 
              type="button" 
              class="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-blue-600 hover:text-white hover:border-blue-600 active:scale-95 md:w-20"
              @click="openEditRate(pair)"
            >
              <span>编辑</span>
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 费率模板内容 -->
      <div v-else class="space-y-4 p-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200">
          <p class="text-sm text-slate-600">
            启用模板：<span class="font-semibold text-blue-600">{{ enabledTemplatesCount }}</span> / {{ feeTemplates.length }}
          </p>
        </div>

        <article
          v-for="template in filteredTemplates"
          :key="template.id"
          class="rounded-xl border border-slate-200 bg-white p-4 transition-colors"
          :class="template.enabled ? 'hover:border-emerald-200 hover:bg-emerald-50/30' : 'hover:border-slate-300 hover:bg-slate-50'"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 space-y-1">
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-xl font-semibold leading-none text-slate-900">{{ template.name }}</h3>
                <span class="rounded-md px-2 py-0.5 text-xs font-medium" :class="template.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'">{{ template.enabled ? '已启用' : '已禁用' }}</span>
              </div>
              <p class="text-sm text-slate-600">{{ template.description || '—' }}</p>
              <p class="text-xs text-slate-400">最后更新：{{ template.updatedAt }}</p>
            </div>
            <button type="button" class="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50" @click="openEditTemplate(template)">编辑</button>
          </div>

          <div class="mt-4 grid gap-3 lg:grid-cols-2">
            <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p class="text-xs font-semibold text-emerald-900">基础费率设置</p>
              <div class="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div class="rounded border border-emerald-100 bg-white px-2.5 py-2">
                  <p class="text-slate-500">逆向费率 (Quote → Base)</p>
                  <p class="mt-1 font-semibold text-emerald-600">{{ ((Number(template.baseMarkup.buy) || 0) * 100).toFixed(2) }}%</p>
                </div>
                <div class="rounded border border-emerald-100 bg-white px-2.5 py-2">
                  <p class="text-slate-500">正向费率 (Base → Quote)</p>
                  <p class="mt-1 font-semibold text-rose-600">{{ ((Number(template.baseMarkup.sell) || 0) * 100).toFixed(2) }}%</p>
                </div>
              </div>
            </div>

            <div class="rounded-lg border border-violet-200 bg-violet-50 p-3">
              <div class="flex items-center justify-between">
                <p class="text-xs font-semibold text-violet-900">VIP 分级费率设置</p>
                <span class="text-xs text-violet-700">共 {{ getTemplateLevelEntries(template).length }} 级</span>
              </div>
              <div class="mt-2 space-y-1.5">
                <div v-if="getTemplateLevelEntries(template).length === 0" class="rounded border border-dashed border-violet-200 bg-white px-2.5 py-2 text-xs text-slate-500">
                  暂无分级费率
                </div>
                <div v-for="([level, rates]) in getVisibleTemplateLevelEntries(template)" :key="`${template.id}-${level}`" class="flex items-center justify-between rounded border border-violet-100 bg-white px-2.5 py-2 text-xs">
                  <span class="font-medium text-slate-700">{{ vipLevelLabel(level) }}</span>
                  <span class="text-slate-500">逆 {{ ((Number(rates.buy) || 0) * 100).toFixed(2) }}% / 正 {{ ((Number(rates.sell) || 0) * 100).toFixed(2) }}%</span>
                </div>
                <button
                  v-if="hasMoreTemplateLevels(template)"
                  type="button"
                  class="w-full rounded border border-violet-200 bg-white px-2.5 py-1.5 text-xs font-medium text-violet-700 transition hover:bg-violet-100"
                  @click="toggleTemplateLevelsExpand(template.id)"
                >
                  {{ isTemplateLevelsExpanded(template.id) ? '收起' : `展开剩余 ${getTemplateLevelEntries(template).length - TEMPLATE_LEVEL_PREVIEW_LIMIT} 级` }}
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </article>
  </section>

  <!-- 编辑/新增弹窗 -->
  <div v-if="showEditModal" class="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" @click.self="showEditModal = false">
    <template v-if="viewTab === 'rates'">
      <section class="flex max-h-[75vh] w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div class="flex w-3/5 flex-col border-r border-slate-200">
          <header class="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4">
            <div>
              <h2 class="text-xl font-semibold text-slate-900">{{ editingId ? '编辑汇率配置' : '新增交易对' }}</h2>
              <p class="mt-0.5 text-xs text-slate-500">左侧配置基本信息，费率详情请参考右侧预览</p>
            </div>
            <button type="button" class="text-2xl text-slate-400 transition-colors hover:text-slate-600" @click="showEditModal = false">×</button>
          </header>

          <div class="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <section class="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  <svg class="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 class="text-base font-semibold text-slate-900">基本信息</h3>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <label class="space-y-2 md:col-span-2">
                  <div class="flex flex-col">
                    <span class="text-sm font-medium text-slate-700">费率模板</span>
                    <span class="text-xs text-slate-500">选择模板后，基础费率和 VIP 分级费率将自动从模板同步，无需手动配置</span>
                  </div>
                  <select
                    v-model="rateForm.feeTemplateId"
                    @change="applyFeeTemplate(rateForm.feeTemplateId)"
                    class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">请选择费率模板</option>
                    <option v-for="template in feeTemplates.filter(t => t.enabled)" :key="template.id" :value="template.id">
                  {{ template.name }} (逆：{{ (template.baseMarkup.buy * 100).toFixed(2) }}% | 正：{{ (template.baseMarkup.sell * 100).toFixed(2) }}%)
                </option>
                  </select>
                </label>
                <label class="space-y-2">
                  <div class="flex flex-col">
                    <span class="text-sm font-medium text-slate-700">基础资产</span>
                    <span class="text-xs text-slate-500">交易对的主体资产（如 USDT）</span>
                  </div>
                  <select
                    v-model="rateForm.baseAsset"
                    class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">请选择资产</option>
                    <option v-for="asset in availableAssets" :key="asset" :value="asset">{{ asset }}</option>
                  </select>
                </label>
                <label class="space-y-2">
                  <div class="flex flex-col">
                    <span class="text-sm font-medium text-slate-700">目标资产</span>
                    <span class="text-xs text-slate-500">交易对的兑换资产（如 BTC）</span>
                  </div>
                  <select
                    v-model="rateForm.quoteAsset"
                    class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">请选择资产</option>
                    <option v-for="asset in availableAssets" :key="asset" :value="asset">{{ asset }}</option>
                  </select>
                </label>
                <label class="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50/50 px-4 py-3 md:col-span-2">
                  <div class="flex flex-col">
                    <span class="text-sm font-medium text-blue-900">自动反向映射</span>
                    <span class="text-xs text-blue-700">开启后，系统会自动创建反向交易对（如 BTC/USDT）并保持汇率联动</span>
                  </div>
                  <input v-model="rateForm.autoReverse" type="checkbox" class="h-5 w-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500" />
                </label>
                <label class="space-y-2 md:col-span-2">
                  <div class="flex flex-col">
                    <span class="text-sm font-medium text-slate-700">市场汇率来源</span>
                    <span class="text-xs text-slate-500">实时获取 market 中间价的价格接口来源</span>
                  </div>
                  <select
                    v-model="rateForm.source"
                    class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option :value="EXCHANGE_RATE_SOURCE.BINANCE">币安 (Binance)</option>
                  </select>
                </label>
                <label class="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/50 px-4 py-3 md:col-span-2">
                  <div class="flex flex-col">
                    <span class="text-sm font-medium text-emerald-900">启用该交易对</span>
                    <span class="text-xs text-emerald-700">是否允许用户在前端看到并交易此币对</span>
                  </div>
                  <input v-model="rateForm.enabled" type="checkbox" class="h-5 w-5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500" />
                </label>
              </div>
            </section>
          </div>

          <footer class="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button type="button" class="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-white" @click="showEditModal = false">取消</button>
            <button type="button" class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700" @click="saveRate()">保存</button>
          </footer>
        </div>

        <div class="flex w-2/5 flex-col bg-gradient-to-br from-slate-50 to-slate-100">
          <header class="border-b border-slate-200 px-5 py-4">
            <h3 class="text-lg font-semibold text-slate-900">实时预览</h3>
            <p class="mt-0.5 text-xs text-slate-500">调整左侧配置后即时更新</p>
          </header>

          <div class="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div class="flex items-center justify-between">
                <h4 class="text-sm font-semibold text-slate-900">交易对概览</h4>
                <span class="rounded-md px-2 py-1 text-xs font-medium" :class="rateForm.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'">
                  {{ rateForm.enabled ? '已启用' : '已禁用' }}
                </span>
              </div>
              <div class="mt-3 space-y-2 text-sm">
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">交易对</span>
                  <span class="font-semibold text-slate-900">{{ ratePreviewPair }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">数据源</span>
                  <span class="font-medium text-slate-900">{{ sourceLabel(rateForm.source) }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">反向映射</span>
                  <span class="font-medium" :class="rateForm.autoReverse ? 'text-blue-600' : 'text-slate-500'">{{ rateForm.autoReverse ? '开启' : '关闭' }}</span>
                </div>
              </div>
            </div>

            <div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 class="text-sm font-semibold text-blue-900">费率配置预览</h4>
              <div class="mt-3 rounded-md border border-blue-100 bg-white p-3 text-sm">
                <p class="font-medium text-slate-900">{{ selectedRateTemplate?.name || '未选择模板（当前为手动配置）' }}</p>
                <p class="mt-1 text-xs text-slate-500">{{ selectedRateTemplate?.description || '可直接编辑当前交易对的基础费率与 VIP 分级费率' }}</p>
                <div class="mt-2 space-y-1 text-xs text-slate-600">
                  <p>逆向费率 (Quote → Base)：<span class="font-semibold text-emerald-600">{{ ((Number(rateForm.buyMarkup) || 0) * 100).toFixed(2) }}%</span></p>
                  <p>正向费率 (Base → Quote)：<span class="font-semibold text-rose-600">{{ ((Number(rateForm.sellMarkup) || 0) * 100).toFixed(2) }}%</span></p>
                </div>
              </div>
            </div>

            <div class="rounded-lg border border-violet-200 bg-violet-50 p-4">
              <div class="flex items-center justify-between">
                <h4 class="text-sm font-semibold text-violet-900">分级费率预览</h4>
                <span class="text-xs text-violet-700">共 {{ ratePreviewLevelEntries.length }} 级</span>
              </div>
              <div class="mt-3 space-y-2">
                <div v-if="ratePreviewLevelEntries.length === 0" class="rounded-md border border-dashed border-violet-200 bg-white p-3 text-xs text-slate-500">
                  暂无分级费率数据
                </div>
                <div v-for="([level, rates]) in getVisibleRatePreviewLevelEntries()" :key="level" class="rounded-md border border-violet-100 bg-white p-3 text-xs">
                  <div class="flex items-center justify-between">
                    <span class="font-semibold text-slate-700">{{ vipLevelLabel(level) }}</span>
                    <span class="text-slate-500">逆向 {{ ((Number(rates.buy) || 0) * 100).toFixed(2) }}% / 正向 {{ ((Number(rates.sell) || 0) * 100).toFixed(2) }}%</span>
                  </div>
                </div>
                <button
                  v-if="hasMoreRatePreviewLevels"
                  type="button"
                  class="w-full rounded border border-violet-200 bg-white px-2.5 py-1.5 text-xs font-medium text-violet-700 transition hover:bg-violet-100"
                  @click="rateLevelsExpanded = !rateLevelsExpanded"
                >
                  {{ rateLevelsExpanded ? '收起' : `展开剩余 ${ratePreviewLevelEntries.length - RATE_LEVEL_PREVIEW_LIMIT} 级` }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>

    <section v-else class="flex h-[88vh] w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl">
      <div class="flex w-3/5 flex-col border-r border-slate-200">
        <header class="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-violet-50 to-blue-50 px-6 py-4">
          <div>
            <h2 class="text-xl font-semibold text-slate-900">{{ editingId ? '编辑费率模板' : '新增费率模板' }}</h2>
            <p class="mt-0.5 text-xs text-slate-500">左侧配置模板参数，右侧实时预览效果</p>
          </div>
          <button type="button" class="text-2xl text-slate-400 transition-colors hover:text-slate-600" @click="showEditModal = false">×</button>
        </header>

        <div class="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <section class="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                <svg class="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-base font-semibold text-slate-900">基本信息</h3>
            </div>

            <div class="grid gap-3.5 md:grid-cols-2">
              <label class="space-y-1.5 md:col-span-2">
                <span class="text-sm font-medium text-slate-700">模板名称</span>
                <input v-model="templateForm.name" type="text" placeholder="如：标准费率模板" class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </label>
              <label class="space-y-1.5 md:col-span-2">
                <span class="text-sm font-medium text-slate-700">描述说明</span>
                <input v-model="templateForm.description" type="text" placeholder="模板适用场景说明" class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </label>
              <label class="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm md:col-span-2">
                <span class="text-slate-700">启用该模板</span>
                <input v-model="templateForm.enabled" type="checkbox" class="h-4 w-4" />
              </label>
            </div>
          </section>

          <section class="space-y-4 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4V9m3 8V7M4 19h16" />
                </svg>
              </div>
              <h3 class="text-base font-semibold text-slate-900">基础费率设置</h3>
            </div>

            <div class="grid gap-3.5 md:grid-cols-2 rounded-lg bg-white p-4">
              <label class="space-y-1.5">
                  <span class="text-sm font-medium text-slate-700">逆向费率加成 (Quote → Base, %)</span>
                  <input v-model.number="templateForm.baseMarkup.buy" type="number" step="0.001" @input="updateBaseMarkup" class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </label>
                <label class="space-y-1.5">
                  <span class="text-sm font-medium text-slate-700">正向费率加成 (Base → Quote, %)</span>
                  <input v-model.number="templateForm.baseMarkup.sell" type="number" step="0.001" @input="updateBaseMarkup" class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </label>
            </div>
            <p class="text-xs text-blue-700">修改基础费率将按 VIP 模块等级重新生成分级费率</p>
          </section>

          <section class="space-y-4 rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-5 shadow-sm">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
                  <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h.01a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51h.01a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.01a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
                  </svg>
                </div>
                <h3 class="text-base font-semibold text-slate-900">VIP 分级费率设置</h3>
              </div>
              <button type="button" class="rounded-md border border-violet-200 bg-white px-2.5 py-1 text-xs text-violet-700 hover:bg-violet-50" @click="initUserLevelRates">按VIP模块重置</button>
            </div>

            <div v-if="activeVipLevels.length === 0" class="rounded-md border border-dashed border-violet-200 bg-white p-3 text-xs text-slate-500">
              VIP 模块暂无可用等级，请先在 VIP 配置中启用等级
            </div>
            <div v-else class="space-y-3">
              <div v-for="vip in activeVipLevels" :key="vip.id" class="rounded-lg border border-violet-100 bg-white p-4">
                <div class="mb-3 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="rounded-md bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">VIP {{ vip.level }}</span>
                    <span class="text-sm font-medium text-slate-700">{{ vip.displayName ? `${vip.name}（${vip.displayName}）` : vip.name }}</span>
                  </div>
                </div>
                <div class="grid gap-3 md:grid-cols-2">
                  <label class="space-y-1.5">
                    <span class="text-xs text-slate-600">买入费率 (%)</span>
                    <input v-model.number="templateForm.userLevelRates[`vip${vip.level}`].buy" type="number" step="0.001" class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100" />
                  </label>
                  <label class="space-y-1.5">
                    <span class="text-xs text-slate-600">卖出费率 (%)</span>
                    <input v-model.number="templateForm.userLevelRates[`vip${vip.level}`].sell" type="number" step="0.001" class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100" />
                  </label>
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer class="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button type="button" class="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-white" @click="showEditModal = false">取消</button>
          <button type="button" class="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700" @click="saveTemplate()">保存模板</button>
        </footer>
      </div>

      <div class="flex w-2/5 flex-col bg-gradient-to-br from-slate-50 to-slate-100">
        <header class="border-b border-slate-200 px-5 py-4">
          <h3 class="text-lg font-semibold text-slate-900">实时预览</h3>
          <p class="mt-0.5 text-xs text-slate-500">调整左侧配置后即时更新模板效果</p>
        </header>

        <div class="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-semibold text-slate-900">模板概览</h4>
              <span class="rounded-md px-2 py-1 text-xs font-medium" :class="templateForm.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'">
                {{ templateForm.enabled ? '已启用' : '已禁用' }}
              </span>
            </div>
            <div class="mt-3 space-y-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-slate-500">模板名称</span>
                <span class="font-medium text-slate-900">{{ templateForm.name || '未命名模板' }}</span>
              </div>
            </div>
          </div>

          <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <h4 class="text-sm font-semibold text-emerald-900">基础费率预览</h4>
            <div class="mt-3 rounded-md border border-emerald-100 bg-white p-3 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-slate-500">买入费率</span>
                <span class="font-semibold text-emerald-600">{{ ((Number(templateForm.baseMarkup.buy) || 0) * 100).toFixed(2) }}%</span>
              </div>
              <div class="mt-2 flex items-center justify-between">
                <span class="text-slate-500">卖出费率</span>
                <span class="font-semibold text-rose-600">{{ ((Number(templateForm.baseMarkup.sell) || 0) * 100).toFixed(2) }}%</span>
              </div>
            </div>
          </div>

          <div class="rounded-lg border border-violet-200 bg-violet-50 p-4">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-semibold text-violet-900">VIP 分级费率预览</h4>
              <span class="text-xs text-violet-700">共 {{ templatePreviewLevelEntries.length }} 级</span>
            </div>
            <div class="mt-3 space-y-2">
              <div v-if="templatePreviewLevelEntries.length === 0" class="rounded-md border border-dashed border-violet-200 bg-white p-3 text-xs text-slate-500">
                暂无分级费率数据
              </div>
              <div v-for="([level, rates]) in getVisibleTemplatePreviewLevelEntries()" :key="level" class="rounded-md border border-violet-100 bg-white p-3 text-xs">
                <div class="flex items-center justify-between">
                  <span class="font-semibold text-slate-700">{{ vipLevelLabel(level) }}</span>
                  <span class="text-slate-500">买 {{ ((Number(rates.buy) || 0) * 100).toFixed(2) }}% / 卖 {{ ((Number(rates.sell) || 0) * 100).toFixed(2) }}%</span>
                </div>
              </div>
              <button
                v-if="hasMoreTemplatePreviewLevels"
                type="button"
                class="w-full rounded border border-violet-200 bg-white px-2.5 py-1.5 text-xs font-medium text-violet-700 transition hover:bg-violet-100"
                @click="templatePreviewExpanded = !templatePreviewExpanded"
              >
                {{ templatePreviewExpanded ? '收起' : `展开剩余 ${templatePreviewLevelEntries.length - TEMPLATE_LEVEL_PREVIEW_LIMIT} 级` }}
              </button>
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
    title="安全验证"
    :description="viewTab === 'rates' ? '编辑汇率配置属于敏感操作，请输入 MFA 验证码' : '编辑费率模板属于敏感操作，请输入 MFA 验证码'"
    @verify="handleMfaVerify"
    @cancel="pendingSaveData = null"
  />
</template>
