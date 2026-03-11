<script setup>
import { computed, reactive, ref } from 'vue'
import MfaVerificationModal from '../../components/MfaVerificationModal.vue'
import {
  EXCHANGE_RATE_SOURCE,
  EXCHANGE_RATE_TYPE,
  USER_LEVEL_TIER,
  ASSET_STATUS,
  FEE_TEMPLATE_TYPE
} from '../../constants/assets'
import { createExchangeRatePairsMock, createFeeTemplatesMock } from '../../mock/assets'

const viewTab = ref('rates')
const statusTab = ref('all')
const search = ref('')
const showEditModal = ref(false)
const editingId = ref('')
const activeSection = ref('basic')

// MFA 验证相关
const showMfaModal = ref(false)
const pendingSaveData = ref(null)
const mfaLoading = ref(false)

const pairs = ref(createExchangeRatePairsMock())
const feeTemplates = ref(createFeeTemplatesMock())

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

// ========== 通用方法 ==========
const clonePairToForm = (pair) => {
  rateForm.baseAsset = pair.baseAsset
  rateForm.quoteAsset = pair.quoteAsset
  rateForm.source = pair.source
  rateForm.type = pair.type
  rateForm.marketRate = pair.marketRate
  rateForm.feeTemplateId = pair.feeTemplateId || ''
  rateForm.buyMarkup = pair.buyMarkup
  rateForm.sellMarkup = pair.sellMarkup
  rateForm.enabled = pair.enabled
  rateForm.autoReverse = pair.autoReverse
  rateForm.userLevelRates = JSON.parse(JSON.stringify(pair.userLevelRates))
}

const cloneTemplateToForm = (template) => {
  templateForm.name = template.name
  templateForm.type = template.type
  templateForm.description = template.description
  templateForm.baseMarkup = JSON.parse(JSON.stringify(template.baseMarkup))
  templateForm.userLevelRates = JSON.parse(JSON.stringify(template.userLevelRates))
  templateForm.enabled = template.enabled
}

const initUserLevelRates = () => {
  const baseBuy = templateForm.baseMarkup.buy
  const baseSell = templateForm.baseMarkup.sell
  templateForm.userLevelRates = {
    [USER_LEVEL_TIER.BASIC]: { buy: baseBuy, sell: baseSell },
    [USER_LEVEL_TIER.SILVER]: { buy: baseBuy * 0.8, sell: baseSell * 0.8 },
    [USER_LEVEL_TIER.GOLD]: { buy: baseBuy * 0.6, sell: baseSell * 0.6 },
    [USER_LEVEL_TIER.PLATINUM]: { buy: baseBuy * 0.4, sell: baseSell * 0.4 },
    [USER_LEVEL_TIER.VIP]: { buy: baseBuy * 0.2, sell: baseSell * 0.2 }
  }
}

const calculateRates = () => {
  rateForm.buyRate = rateForm.marketRate * (1 + rateForm.buyMarkup)
  rateForm.sellRate = rateForm.marketRate * (1 - rateForm.sellMarkup)
}

const toggleSection = (section) => {
  activeSection.value = activeSection.value === section ? '' : section
}

// ========== 汇率管理操作 ==========
const openEditRate = (pair) => {
  editingId.value = pair.id
  clonePairToForm(pair)
  activeSection.value = 'basic'
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
  initUserLevelRates()
  activeSection.value = 'basic'
  showEditModal.value = true
}

const applyFeeTemplate = (templateId) => {
  const template = feeTemplates.value.find(t => t.id === templateId)
  if (template) {
    rateForm.feeTemplateId = templateId
    rateForm.buyMarkup = template.baseMarkup.buy
    rateForm.sellMarkup = template.baseMarkup.sell
    rateForm.userLevelRates = JSON.parse(JSON.stringify(template.userLevelRates))
    calculateRates()
  }
}

const saveRate = () => {
  calculateRates()
  
  const payload = {
    baseAsset: rateForm.baseAsset.trim().toUpperCase(),
    quoteAsset: rateForm.quoteAsset.trim().toUpperCase(),
    source: rateForm.source,
    type: rateForm.type,
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
  activeSection.value = 'basic'
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
  activeSection.value = 'basic'
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
const badgeClass = (enabled) => enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'

const sourceLabel = (source) => {
  const map = {
    [EXCHANGE_RATE_SOURCE.BINANCE]: '币安',
    [EXCHANGE_RATE_SOURCE.OKX]: 'OKX',
    [EXCHANGE_RATE_SOURCE.COINGECKO]: 'CoinGecko',
    [EXCHANGE_RATE_SOURCE.CUSTOM]: '自定义'
  }
  return map[source] || source
}

const typeLabel = (type) => {
  const map = {
    [EXCHANGE_RATE_TYPE.FLOATING]: '浮动汇率',
    [EXCHANGE_RATE_TYPE.FIXED]: '固定汇率'
  }
  return map[type] || type
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
</script>

<template>
  <section class="space-y-4">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl font-semibold text-slate-900">汇率与费率管理</h1>
        <p class="mt-1 text-sm text-slate-500">管理交易对汇率和可复用的费率模板</p>
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
      <div v-if="viewTab === 'rates'" class="space-y-4 p-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200">
          <p class="text-sm text-slate-600">
            启用交易对：<span class="font-semibold text-blue-600">{{ enabledPairsCount }}</span> / {{ pairs.length }}
          </p>
        </div>

        <article
          v-for="pair in filteredPairs"
          :key="pair.id"
          class="rounded-xl border border-slate-200 bg-white p-3 transition-colors"
          :class="pair.enabled ? 'hover:border-emerald-200 hover:bg-emerald-50/30' : 'hover:border-slate-300 hover:bg-slate-50'"
        >
          <div class="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-2xl font-semibold leading-none text-slate-900">{{ pair.baseAsset }}/{{ pair.quoteAsset }}</h3>
                <span class="rounded-md px-2 py-0.5 text-xs font-medium" :class="badgeClass(pair.enabled)">{{ pair.enabled ? '已启用' : '已禁用' }}</span>
                <span class="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">{{ sourceLabel(pair.source) }}</span>
                <span class="rounded-md bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-600">{{ typeLabel(pair.type) }}</span>
              </div>
              <p class="mt-1.5 text-xs text-slate-600">
                市场价：<span class="font-semibold text-slate-900">{{ pair.marketRate }}</span>
                <span class="mx-2 text-slate-300">|</span>
                买入价：<span class="font-semibold text-emerald-600">{{ pair.buyRate }}</span>
                <span class="mx-2 text-slate-300">|</span>
                卖出价：<span class="font-semibold text-rose-600">{{ pair.sellRate }}</span>
              </p>
              <p class="mt-1 text-xs text-slate-500">
                买入手续费：<span class="font-medium text-slate-700">{{ (pair.buyMarkup * 100).toFixed(2) }}%</span>
                <span class="mx-2 text-slate-300">|</span>
                卖出手续费：<span class="font-medium text-slate-700">{{ (pair.sellMarkup * 100).toFixed(2) }}%</span>
                <span class="mx-2 text-slate-300">|</span>
                反向映射：<span class="font-medium" :class="pair.autoReverse ? 'text-blue-600' : 'text-slate-500'">{{ pair.autoReverse ? '开启' : '关闭' }}</span>
              </p>
              <p class="mt-1 text-xs text-slate-400">最后更新：{{ pair.lastUpdate }}</p>
            </div>
            <button type="button" class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50" @click="openEditRate(pair)">编辑</button>
          </div>

          <!-- 分级费率预览 -->
          <div class="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p class="text-xs font-medium text-slate-700">分级费率设置</p>
            <div class="mt-2 grid grid-cols-5 gap-2">
              <div v-for="(rates, level) in pair.userLevelRates" :key="level" class="rounded border border-slate-200 bg-white p-2 text-center">
                <p class="text-xs font-medium text-slate-600">{{ level.toUpperCase() }}</p>
                <p class="mt-1 text-xs text-slate-500">买：{{ (rates.buy * 100).toFixed(2) }}%</p>
                <p class="text-xs text-slate-500">卖：{{ (rates.sell * 100).toFixed(2) }}%</p>
              </div>
            </div>
          </div>
        </article>
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
          class="rounded-xl border border-slate-200 bg-white p-3 transition-colors"
          :class="template.enabled ? 'hover:border-emerald-200 hover:bg-emerald-50/30' : 'hover:border-slate-300 hover:bg-slate-50'"
        >
          <div class="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-2xl font-semibold leading-none text-slate-900">{{ template.name }}</h3>
                <span class="rounded-md px-2 py-0.5 text-xs font-medium" :class="badgeClass(template.enabled)">{{ template.enabled ? '已启用' : '已禁用' }}</span>
                <span class="rounded-md px-2 py-0.5 text-xs font-medium" :class="templateTypeBadgeClass(template.type)">{{ templateTypeLabel(template.type) }}</span>
              </div>
              <p class="mt-1.5 text-sm text-slate-600">{{ template.description }}</p>
              <p class="mt-1 text-xs text-slate-500">
                基础买入费率：<span class="font-semibold text-emerald-600">{{ (template.baseMarkup.buy * 100).toFixed(2) }}%</span>
                <span class="mx-2 text-slate-300">|</span>
                基础卖出费率：<span class="font-semibold text-rose-600">{{ (template.baseMarkup.sell * 100).toFixed(2) }}%</span>
                <span class="mx-2 text-slate-300">|</span>
                已应用：<span class="font-medium text-blue-600">{{ template.usageCount }} 个交易对</span>
              </p>
              <p class="mt-1 text-xs text-slate-400">最后更新：{{ template.updatedAt }}</p>
            </div>
            <button type="button" class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50" @click="openEditTemplate(template)">编辑</button>
          </div>

          <!-- 分级费率预览 -->
          <div class="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p class="text-xs font-medium text-slate-700">分级费率设置（共 {{ Object.keys(template.userLevelRates).length }} 级）</p>
            <div class="mt-2 grid grid-cols-5 gap-2">
              <div v-for="(rates, level) in template.userLevelRates" :key="level" class="rounded border border-slate-200 bg-white p-2 text-center">
                <p class="text-xs font-medium text-slate-600">{{ level.toUpperCase() }}</p>
                <p class="mt-1 text-xs text-slate-500">买：{{ (rates.buy * 100).toFixed(2) }}%</p>
                <p class="text-xs text-slate-500">卖：{{ (rates.sell * 100).toFixed(2) }}%</p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </article>
  </section>

  <!-- 编辑/新增弹窗 -->
  <div v-if="showEditModal" class="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" @click.self="showEditModal = false">
    <section class="w-full max-w-4xl rounded-xl bg-white">
      <header class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 class="text-xl font-semibold text-slate-900">
          {{ editingId ? (viewTab === 'rates' ? '编辑汇率配置' : '编辑费率模板') : (viewTab === 'rates' ? '新增交易对' : '新增费率模板') }}
        </h2>
        <button type="button" class="text-2xl text-slate-400" @click="showEditModal = false">×</button>
      </header>

      <div class="max-h-[74vh] space-y-5 overflow-y-auto px-5 py-4">
        <!-- 汇率管理弹窗内容 -->
        <template v-if="viewTab === 'rates'">
          <!-- 基本信息 -->
          <section class="rounded-lg border border-slate-200">
            <button type="button" class="flex w-full items-center justify-between px-4 py-3" @click="toggleSection('basic')">
              <h3 class="text-sm font-medium text-slate-900">基本信息</h3>
              <span class="text-slate-400 transition-transform" :class="activeSection === 'basic' ? 'rotate-180' : ''">⌄</span>
            </button>
            
            <div v-show="activeSection === 'basic'" class="border-t border-slate-200 px-4 py-4">
              <!-- 快速选择费率模板 -->
              <div class="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                <label class="space-y-1">
                  <span class="text-sm font-medium text-blue-900">💰 快速应用费率模板</span>
                  <select 
                    v-model="rateForm.feeTemplateId" 
                    @change="applyFeeTemplate(rateForm.feeTemplateId)"
                    class="w-full rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">—— 请选择费率模板 ——</option>
                    <option v-for="template in feeTemplates.filter(t => t.enabled)" :key="template.id" :value="template.id">
                      {{ template.name }} (买：{{ (template.baseMarkup.buy * 100).toFixed(2) }}% | 卖：{{ (template.baseMarkup.sell * 100).toFixed(2) }}%)
                    </option>
                  </select>
                </label>
                <p class="mt-2 text-xs text-blue-700">💡 选择模板后将自动填充基础费率和分级费率，也可手动调整</p>
              </div>

              <div class="grid gap-3 md:grid-cols-2">
                <label class="space-y-1">
                  <span class="text-sm">基础资产</span>
                  <input v-model="rateForm.baseAsset" type="text" placeholder="如：USDT" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
                </label>
                <label class="space-y-1">
                  <span class="text-sm">目标资产</span>
                  <input v-model="rateForm.quoteAsset" type="text" placeholder="如：BTC" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
                </label>
                <label class="space-y-1">
                  <span class="text-sm">数据源</span>
                  <select v-model="rateForm.source" class="w-full rounded-lg border border-slate-300 px-3 py-2">
                    <option :value="EXCHANGE_RATE_SOURCE.BINANCE">币安 (Binance)</option>
                    <option :value="EXCHANGE_RATE_SOURCE.OKX">OKX</option>
                    <option :value="EXCHANGE_RATE_SOURCE.COINGECKO">CoinGecko</option>
                    <option :value="EXCHANGE_RATE_SOURCE.CUSTOM">自定义</option>
                  </select>
                </label>
                <label class="space-y-1">
                  <span class="text-sm">汇率类型</span>
                  <select v-model="rateForm.type" class="w-full rounded-lg border border-slate-300 px-3 py-2">
                    <option :value="EXCHANGE_RATE_TYPE.FLOATING">浮动汇率</option>
                    <option :value="EXCHANGE_RATE_TYPE.FIXED">固定汇率</option>
                  </select>
                </label>
                <label class="space-y-1">
                  <span class="text-sm">市场汇率</span>
                  <input v-model.number="rateForm.marketRate" type="number" step="any" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
                </label>
                <label class="inline-flex items-center gap-2 text-sm">
                  <input v-model="rateForm.enabled" type="checkbox" class="h-4 w-4" />
                  启用该交易对
                </label>
                <label class="inline-flex items-center gap-2 text-sm">
                  <input v-model="rateForm.autoReverse" type="checkbox" class="h-4 w-4" />
                  自动反向映射
                </label>
              </div>
            </div>
          </section>

          <!-- 手续费设置 -->
          <section class="rounded-lg border border-slate-200">
            <button type="button" class="flex w-full items-center justify-between px-4 py-3" @click="toggleSection('fee')">
              <h3 class="text-sm font-medium text-slate-900">手续费与价差</h3>
              <span class="text-slate-400 transition-transform" :class="activeSection === 'fee' ? 'rotate-180' : ''">⌄</span>
            </button>
            
            <div v-show="activeSection === 'fee'" class="border-t border-slate-200 px-4 py-4">
              <div class="grid gap-3 md:grid-cols-2">
                <label class="space-y-1">
                  <span class="text-sm">买入手续费率 (%)</span>
                  <input v-model.number="rateForm.buyMarkup" type="number" step="0.001" @input="calculateRates" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
                </label>
                <label class="space-y-1">
                  <span class="text-sm">卖出手续费率 (%)</span>
                  <input v-model.number="rateForm.sellMarkup" type="number" step="0.001" @input="calculateRates" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
                </label>
                <label class="space-y-1">
                  <span class="text-sm">计算买入价</span>
                  <input v-model.number="rateForm.buyRate" type="number" step="any" readonly class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500" />
                </label>
                <label class="space-y-1">
                  <span class="text-sm">计算卖出价</span>
                  <input v-model.number="rateForm.sellRate" type="number" step="any" readonly class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500" />
                </label>
              </div>
              <p class="mt-2 text-xs text-slate-500">买入价 = 市场价 × (1 + 买入费率) | 卖出价 = 市场价 × (1 - 卖出费率)</p>
            </div>
          </section>

          <!-- 分级费率 -->
          <section class="rounded-lg border border-slate-200">
            <button type="button" class="flex w-full items-center justify-between px-4 py-3" @click="toggleSection('levels')">
              <h3 class="text-sm font-medium text-slate-900">分级费率设置</h3>
              <span class="text-slate-400 transition-transform" :class="activeSection === 'levels' ? 'rotate-180' : ''">⌄</span>
            </button>
            
            <div v-show="activeSection === 'levels'" class="border-t border-slate-200 px-4 py-4">
              <p class="text-xs text-slate-500 mb-3">为不同用户等级设置不同的手续费率</p>
              <div class="space-y-3">
                <div v-for="(rates, level) in rateForm.userLevelRates" :key="level" class="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-slate-700">{{ level.toUpperCase() }}</span>
                  </div>
                  <div class="grid gap-3 md:grid-cols-2">
                    <label class="space-y-1">
                      <span class="text-xs text-slate-600">买入费率 (%)</span>
                      <input v-model.number="rateForm.userLevelRates[level].buy" type="number" step="0.001" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                    </label>
                    <label class="space-y-1">
                      <span class="text-xs text-slate-600">卖出费率 (%)</span>
                      <input v-model.number="rateForm.userLevelRates[level].sell" type="number" step="0.001" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </template>

        <!-- 费率模板弹窗内容 -->
        <template v-else>
          <!-- 基本信息 -->
          <section class="rounded-lg border border-slate-200">
            <button type="button" class="flex w-full items-center justify-between px-4 py-3" @click="toggleSection('basic')">
              <h3 class="text-sm font-medium text-slate-900">基本信息</h3>
              <span class="text-slate-400 transition-transform" :class="activeSection === 'basic' ? 'rotate-180' : ''">⌄</span>
            </button>
            
            <div v-show="activeSection === 'basic'" class="border-t border-slate-200 px-4 py-4">
              <div class="grid gap-3 md:grid-cols-2">
                <label class="space-y-1 md:col-span-2">
                  <span class="text-sm">模板名称</span>
                  <input v-model="templateForm.name" type="text" placeholder="如：标准费率模板" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
                </label>
                <label class="space-y-1">
                  <span class="text-sm">模板类型</span>
                  <select v-model="templateForm.type" class="w-full rounded-lg border border-slate-300 px-3 py-2">
                    <option :value="FEE_TEMPLATE_TYPE.STANDARD">标准费率</option>
                    <option :value="FEE_TEMPLATE_TYPE.PREMIUM">优惠费率</option>
                    <option :value="FEE_TEMPLATE_TYPE.VIP">VIP 专属</option>
                    <option :value="FEE_TEMPLATE_TYPE.CUSTOM">自定义</option>
                  </select>
                </label>
                <label class="space-y-1">
                  <span class="text-sm">描述说明</span>
                  <input v-model="templateForm.description" type="text" placeholder="模板适用场景说明" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
                </label>
                <label class="inline-flex items-center gap-2 text-sm md:col-span-2">
                  <input v-model="templateForm.enabled" type="checkbox" class="h-4 w-4" />
                  启用该模板
                </label>
              </div>
            </div>
          </section>

          <!-- 基础费率设置 -->
          <section class="rounded-lg border border-slate-200">
            <button type="button" class="flex w-full items-center justify-between px-4 py-3" @click="toggleSection('fee')">
              <h3 class="text-sm font-medium text-slate-900">基础手续费与价差</h3>
              <span class="text-slate-400 transition-transform" :class="activeSection === 'fee' ? 'rotate-180' : ''">⌄</span>
            </button>
            
            <div v-show="activeSection === 'fee'" class="border-t border-slate-200 px-4 py-4">
              <div class="grid gap-3 md:grid-cols-2">
                <label class="space-y-1">
                  <span class="text-sm">买入手续费率 (%)</span>
                  <input v-model.number="templateForm.baseMarkup.buy" type="number" step="0.001" @input="updateBaseMarkup" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
                </label>
                <label class="space-y-1">
                  <span class="text-sm">卖出手续费率 (%)</span>
                  <input v-model.number="templateForm.baseMarkup.sell" type="number" step="0.001" @input="updateBaseMarkup" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
                </label>
              </div>
              <p class="mt-2 text-xs text-slate-500">修改基础费率将自动同步到所有用户等级</p>
            </div>
          </section>

          <!-- 分级费率 -->
          <section class="rounded-lg border border-slate-200">
            <button type="button" class="flex w-full items-center justify-between px-4 py-3" @click="toggleSection('levels')">
              <h3 class="text-sm font-medium text-slate-900">分级费率设置</h3>
              <span class="text-slate-400 transition-transform" :class="activeSection === 'levels' ? 'rotate-180' : ''">⌄</span>
            </button>
            
            <div v-show="activeSection === 'levels'" class="border-t border-slate-200 px-4 py-4">
              <p class="text-xs text-slate-500 mb-3">为不同用户等级设置不同的手续费率（基于基础费率的百分比）</p>
              <div class="space-y-3">
                <div v-for="(rates, level) in templateForm.userLevelRates" :key="level" class="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-slate-700">{{ level.toUpperCase() }}</span>
                    <button type="button" class="text-xs text-blue-600 hover:text-blue-700" @click="initUserLevelRates">重置为默认</button>
                  </div>
                  <div class="grid gap-3 md:grid-cols-2">
                    <label class="space-y-1">
                      <span class="text-xs text-slate-600">买入费率 (%)</span>
                      <input v-model.number="templateForm.userLevelRates[level].buy" type="number" step="0.001" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                    </label>
                    <label class="space-y-1">
                      <span class="text-xs text-slate-600">卖出费率 (%)</span>
                      <input v-model.number="templateForm.userLevelRates[level].sell" type="number" step="0.001" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </template>
      </div>

      <footer class="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
        <button type="button" class="rounded-lg border border-slate-300 px-4 py-2" @click="showEditModal = false">取消</button>
        <button type="button" class="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white" @click="viewTab === 'rates' ? saveRate() : saveTemplate()">保存</button>
      </footer>
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
