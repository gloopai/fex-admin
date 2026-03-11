<script setup>
import { computed, reactive, ref } from 'vue'
import MfaVerificationModal from '../../components/MfaVerificationModal.vue'
import {
  EXCHANGE_RATE_SOURCE,
  EXCHANGE_RATE_TYPE,
  USER_LEVEL_TIER,
  ASSET_STATUS
} from '../../constants/assets'
import { createExchangeRatePairsMock, createFeeTemplatesMock } from '../../mock/assets'

const statusTab = ref('all')
const search = ref('')
const showEditModal = ref(false)
const editingPairId = ref('')
const activeSection = ref('basic')

// MFA 验证相关
const showMfaModal = ref(false)
const pendingSaveData = ref(null)
const mfaLoading = ref(false)

const pairs = ref(createExchangeRatePairsMock())
const feeTemplates = ref(createFeeTemplatesMock())

const form = reactive({
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

const enabledCount = computed(() => pairs.value.filter((p) => p.enabled).length)

const clonePairToForm = (pair) => {
  form.baseAsset = pair.baseAsset
  form.quoteAsset = pair.quoteAsset
  form.source = pair.source
  form.type = pair.type
  form.marketRate = pair.marketRate
  form.feeTemplateId = pair.feeTemplateId || ''
  form.buyMarkup = pair.buyMarkup
  form.sellMarkup = pair.sellMarkup
  form.enabled = pair.enabled
  form.autoReverse = pair.autoReverse
  form.userLevelRates = JSON.parse(JSON.stringify(pair.userLevelRates))
}

const initUserLevelRates = () => {
  form.userLevelRates = {
    [USER_LEVEL_TIER.BASIC]: { buy: form.buyMarkup, sell: form.sellMarkup },
    [USER_LEVEL_TIER.SILVER]: { buy: form.buyMarkup * 0.8, sell: form.sellMarkup * 0.8 },
    [USER_LEVEL_TIER.GOLD]: { buy: form.buyMarkup * 0.6, sell: form.sellMarkup * 0.6 },
    [USER_LEVEL_TIER.PLATINUM]: { buy: form.buyMarkup * 0.4, sell: form.sellMarkup * 0.4 },
    [USER_LEVEL_TIER.VIP]: { buy: form.buyMarkup * 0.2, sell: form.sellMarkup * 0.2 }
  }
}

const openEdit = (pair) => {
  editingPairId.value = pair.id
  clonePairToForm(pair)
  activeSection.value = 'basic'
  showEditModal.value = true
}

const openCreate = () => {
  editingPairId.value = ''
  form.baseAsset = ''
  form.quoteAsset = ''
  form.source = EXCHANGE_RATE_SOURCE.BINANCE
  form.type = EXCHANGE_RATE_TYPE.FLOATING
  form.marketRate = 0
  form.feeTemplateId = ''
  form.buyMarkup = 0.005
  form.sellMarkup = 0.005
  form.enabled = true
  form.autoReverse = true
  initUserLevelRates()
  activeSection.value = 'basic'
  showEditModal.value = true
}

const calculateRates = () => {
  form.buyRate = form.marketRate * (1 + form.buyMarkup)
  form.sellRate = form.marketRate * (1 - form.sellMarkup)
}

const savePair = () => {
  calculateRates()
  
  const payload = {
    baseAsset: form.baseAsset.trim().toUpperCase(),
    quoteAsset: form.quoteAsset.trim().toUpperCase(),
    source: form.source,
    type: form.type,
    marketRate: Number(form.marketRate),
    feeTemplateId: form.feeTemplateId || null,
    buyMarkup: Number(form.buyMarkup),
    sellMarkup: Number(form.sellMarkup),
    buyRate: Number(form.buyRate),
    sellRate: Number(form.sellRate),
    enabled: Boolean(form.enabled),
    autoReverse: Boolean(form.autoReverse),
    userLevelRates: form.userLevelRates,
    lastUpdate: new Date().toISOString().replace('T', ' ').substring(0, 19)
  }

  // 保存待提交的数据，先显示 MFA 验证弹窗
  pendingSaveData.value = payload
  showMfaModal.value = true
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
      if (editingPairId.value) {
        pairs.value = pairs.value.map((pair) => 
          pair.id === editingPairId.value ? { ...pair, ...pendingSaveData.value } : pair
        )
      } else {
        pairs.value.unshift({ 
          id: `pair-${Date.now()}`, 
          ...pendingSaveData.value 
        })
      }

      showEditModal.value = false
      pendingSaveData.value = null
      showMfaModal.value = false
      alert('汇率配置保存成功！')
    }
  } catch (error) {
    alert('MFA 验证失败：' + (error.message || '请稍后重试'))
  } finally {
    mfaLoading.value = false
  }
}

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

const toggleSection = (section) => {
  activeSection.value = activeSection.value === section ? '' : section
}

const updateUserLevelRate = (level, type, value) => {
  if (!form.userLevelRates[level]) {
    form.userLevelRates[level] = { buy: form.buyMarkup, sell: form.sellMarkup }
  }
  form.userLevelRates[level][type] = Number(value)
}

const applyFeeTemplate = (templateId) => {
  const template = feeTemplates.value.find(t => t.id === templateId)
  if (template) {
    form.feeTemplateId = templateId
    form.buyMarkup = template.baseMarkup.buy
    form.sellMarkup = template.baseMarkup.sell
    form.userLevelRates = JSON.parse(JSON.stringify(template.userLevelRates))
    calculateRates()
  }
}
</script>

<template>
  <section class="space-y-3">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl font-semibold text-slate-900">汇率管理</h1>
        <p class="mt-1 text-sm text-slate-500">管理平台交易对汇率和手续费配置</p>
      </div>
      <div class="flex items-center gap-4">
        <p class="text-sm text-slate-500">启用交易对：<span class="font-semibold text-blue-600">{{ enabledCount }}</span> / {{ pairs.length }}</p>
        <button type="button" class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700" @click="openCreate">+ 新增交易对</button>
      </div>
    </header>

    <article class="rounded-xl border border-slate-200 bg-white">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-3">
        <div class="inline-flex items-center gap-4 text-sm">
          <button type="button" class="font-medium" :class="statusTab === 'all' ? 'text-blue-600' : 'text-slate-500'" @click="statusTab = 'all'">全部</button>
          <button type="button" class="font-medium" :class="statusTab === 'enabled' ? 'text-blue-600' : 'text-slate-500'" @click="statusTab = 'enabled'">已启用</button>
          <button type="button" class="font-medium" :class="statusTab === 'disabled' ? 'text-blue-600' : 'text-slate-500'" @click="statusTab = 'disabled'">已禁用</button>
        </div>
        <input v-model="search" type="text" placeholder="搜索交易对..." class="w-full max-w-sm rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500" />
      </div>

      <div class="space-y-3 p-3">
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
            <button type="button" class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50" @click="openEdit(pair)">编辑</button>
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
    </article>
  </section>

  <!-- 编辑/新增弹窗 -->
  <div v-if="showEditModal" class="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" @click.self="showEditModal = false">
    <section class="w-full max-w-4xl rounded-xl bg-white">
      <header class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 class="text-xl font-semibold text-slate-900">{{ editingPairId ? '编辑汇率配置' : '新增汇率配置' }}</h2>
        <button type="button" class="text-2xl text-slate-400" @click="showEditModal = false">×</button>
      </header>

      <div class="max-h-[74vh] space-y-5 overflow-y-auto px-5 py-4">
        <!-- 基本信息 -->
        <section class="rounded-lg border border-slate-200">
          <button 
            type="button" 
            class="flex w-full items-center justify-between px-4 py-3"
            @click="toggleSection('basic')"
          >
            <h3 class="text-sm font-medium text-slate-900">基本信息</h3>
            <span class="text-slate-400 transition-transform" :class="activeSection === 'basic' ? 'rotate-180' : ''">⌄</span>
          </button>
          
          <div v-show="activeSection === 'basic'" class="border-t border-slate-200 px-4 py-4">
            <!-- 快速选择费率模板 -->
            <div class="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <label class="space-y-1">
                <span class="text-sm font-medium text-blue-900">💰 快速应用费率模板</span>
                <select 
                  v-model="form.feeTemplateId" 
                  @change="applyFeeTemplate(form.feeTemplateId)"
                  class="w-full rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">—— 请选择费率模板 ——</option>
                  <option v-for="template in feeTemplates.filter(t => t.enabled)" :key="template.id" :value="template.id">
                    {{ template.name }} (买：{{ (template.baseMarkup.buy * 100).toFixed(2) }}% | 卖：{{ (template.baseMarkup.sell * 100).toFixed(2) }}%)
                  </option>
                </select>
              </label>
              <p class="mt-2 text-xs text-blue-700">
                💡 选择模板后将自动填充基础费率和分级费率，也可手动调整
              </p>
            </div>

            <div class="grid gap-3 md:grid-cols-2">
              <label class="space-y-1">
                <span class="text-sm">基础资产</span>
                <input v-model="form.baseAsset" type="text" placeholder="如：USDT" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label class="space-y-1">
                <span class="text-sm">目标资产</span>
                <input v-model="form.quoteAsset" type="text" placeholder="如：BTC" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label class="space-y-1">
                <span class="text-sm">数据源</span>
                <select v-model="form.source" class="w-full rounded-lg border border-slate-300 px-3 py-2">
                  <option :value="EXCHANGE_RATE_SOURCE.BINANCE">币安 (Binance)</option>
                  <option :value="EXCHANGE_RATE_SOURCE.OKX">OKX</option>
                  <option :value="EXCHANGE_RATE_SOURCE.COINGECKO">CoinGecko</option>
                  <option :value="EXCHANGE_RATE_SOURCE.CUSTOM">自定义</option>
                </select>
              </label>
              <label class="space-y-1">
                <span class="text-sm">汇率类型</span>
                <select v-model="form.type" class="w-full rounded-lg border border-slate-300 px-3 py-2">
                  <option :value="EXCHANGE_RATE_TYPE.FLOATING">浮动汇率</option>
                  <option :value="EXCHANGE_RATE_TYPE.FIXED">固定汇率</option>
                </select>
              </label>
              <label class="space-y-1">
                <span class="text-sm">市场汇率</span>
                <input v-model.number="form.marketRate" type="number" step="any" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label class="inline-flex items-center gap-2 text-sm">
                <input v-model="form.enabled" type="checkbox" class="h-4 w-4" />
                启用该交易对
              </label>
              <label class="inline-flex items-center gap-2 text-sm">
                <input v-model="form.autoReverse" type="checkbox" class="h-4 w-4" />
                自动反向映射
              </label>
            </div>
          </div>
        </section>

        <!-- 手续费设置 -->
        <section class="rounded-lg border border-slate-200">
          <button 
            type="button" 
            class="flex w-full items-center justify-between px-4 py-3"
            @click="toggleSection('fee')"
          >
            <h3 class="text-sm font-medium text-slate-900">手续费与价差</h3>
            <span class="text-slate-400 transition-transform" :class="activeSection === 'fee' ? 'rotate-180' : ''">⌄</span>
          </button>
          
          <div v-show="activeSection === 'fee'" class="border-t border-slate-200 px-4 py-4">
            <div class="grid gap-3 md:grid-cols-2">
              <label class="space-y-1">
                <span class="text-sm">买入手续费率 (%)</span>
                <input v-model.number="form.buyMarkup" type="number" step="0.001" @input="calculateRates" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label class="space-y-1">
                <span class="text-sm">卖出手续费率 (%)</span>
                <input v-model.number="form.sellMarkup" type="number" step="0.001" @input="calculateRates" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label class="space-y-1">
                <span class="text-sm">计算买入价</span>
                <input v-model.number="form.buyRate" type="number" step="any" readonly class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500" />
              </label>
              <label class="space-y-1">
                <span class="text-sm">计算卖出价</span>
                <input v-model.number="form.sellRate" type="number" step="any" readonly class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500" />
              </label>
            </div>
            <p class="mt-2 text-xs text-slate-500">
              买入价 = 市场价 × (1 + 买入费率) | 卖出价 = 市场价 × (1 - 卖出费率)
            </p>
          </div>
        </section>

        <!-- 分级费率 -->
        <section class="rounded-lg border border-slate-200">
          <button 
            type="button" 
            class="flex w-full items-center justify-between px-4 py-3"
            @click="toggleSection('levels')"
          >
            <h3 class="text-sm font-medium text-slate-900">分级费率设置</h3>
            <span class="text-slate-400 transition-transform" :class="activeSection === 'levels' ? 'rotate-180' : ''">⌄</span>
          </button>
          
          <div v-show="activeSection === 'levels'" class="border-t border-slate-200 px-4 py-4">
            <p class="text-xs text-slate-500 mb-3">为不同用户等级设置不同的手续费率（相对于基础费率的百分比）</p>
            <div class="space-y-3">
              <div v-for="(rates, level) in form.userLevelRates" :key="level" class="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-slate-700">{{ level.toUpperCase() }}</span>
                  <button 
                    type="button" 
                    class="text-xs text-blue-600 hover:text-blue-700"
                    @click="initUserLevelRates"
                  >
                    重置为默认
                  </button>
                </div>
                <div class="grid gap-3 md:grid-cols-2">
                  <label class="space-y-1">
                    <span class="text-xs text-slate-600">买入费率 (%)</span>
                    <input 
                      v-model.number="form.userLevelRates[level].buy" 
                      type="number" 
                      step="0.001"
                      @input="calculateRates"
                      class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" 
                    />
                  </label>
                  <label class="space-y-1">
                    <span class="text-xs text-slate-600">卖出费率 (%)</span>
                    <input 
                      v-model.number="form.userLevelRates[level].sell" 
                      type="number" 
                      step="0.001"
                      @input="calculateRates"
                      class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" 
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer class="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
        <button type="button" class="rounded-lg border border-slate-300 px-4 py-2" @click="showEditModal = false">取消</button>
        <button type="button" class="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white" @click="savePair">保存</button>
      </footer>
    </section>
  </div>

  <!-- MFA 验证弹窗 -->
  <MfaVerificationModal
    v-model:open="showMfaModal"
    :loading="mfaLoading"
    title="安全验证"
    description="编辑汇率配置属于敏感操作，请输入 MFA 验证码"
    @verify="handleMfaVerify"
    @cancel="pendingSaveData = null"
  />
</template>
