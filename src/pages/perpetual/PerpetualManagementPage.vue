<script setup>
import { computed, reactive, ref } from 'vue'
import ControlConfigModal from '../../components/ControlConfigModal.vue'
import {
  PERPETUAL_COMMON_FILTER_ALL,
  PERPETUAL_CONTRACT_STEP,
  PERPETUAL_STATUS,
  PERPETUAL_VIEW_TAB
} from '../../constants/perpetual'
import {
  createDefaultPerpetualControlConfig,
  createPerpetualControlConfigsMock,
  createPerpetualProductsMock,
  createPerpetualTemplatesMock,
  perpetualLeverageLevels,
  perpetualProductStatusMeta
} from '../../mock/perpetual'

const viewTab = ref(PERPETUAL_VIEW_TAB.PRODUCTS)
const statusTab = ref(PERPETUAL_COMMON_FILTER_ALL)
const search = ref('')

const leverageLevels = perpetualLeverageLevels

const buildLeverageBadges = (levels = []) => {
  const visible = levels.slice(0, 6)
  const more = levels.length - visible.length
  return more > 0 ? [...visible, `+${more}`] : visible
}
const parseNumeric = (text) => String(text || '').replace(/[^0-9.]/g, '')
const parsePair = (pair = 'BTC/USDT') => {
  const [baseCurrency = 'BTC', quoteCurrency = 'USDT'] = pair.split('/')
  return { baseCurrency, quoteCurrency }
}
const fmtUsdt = (value) => `${Number(value).toLocaleString()} USDT`
const pctText = (value) => `${(Number(value) * 100).toFixed(3)}%`
const toSymbol = (pair = '') => pair.replace('/', '')
const templates = ref(createPerpetualTemplatesMock())
const products = ref(createPerpetualProductsMock())
const controlConfigs = reactive(createPerpetualControlConfigsMock())

const controlModalOpen = ref(false)
const activeControlSymbol = ref('')
const productStatusMeta = perpetualProductStatusMeta

const ensureControlConfig = (symbol) => {
  if (!symbol) return
  if (!controlConfigs[symbol]) controlConfigs[symbol] = createDefaultPerpetualControlConfig()
}

const openControlModal = (item) => {
  const symbol = toSymbol(item.pair)
  ensureControlConfig(symbol)
  activeControlSymbol.value = symbol
  controlModalOpen.value = true
}

const saveControlConfig = (next) => {
  if (!activeControlSymbol.value) return
  controlConfigs[activeControlSymbol.value] = { ...next }
  controlModalOpen.value = false
}

const normalizeProductOrder = () => {
  const ordered = [...products.value]
    .sort((a, b) => Number(a.sortOrder || 9999) - Number(b.sortOrder || 9999))
    .map((item, index) => ({ ...item, sortOrder: index + 1 }))
  products.value = ordered
}

const orderedProductIds = computed(() =>
  [...products.value]
    .sort((a, b) => Number(a.sortOrder || 9999) - Number(b.sortOrder || 9999))
    .map((item) => item.id)
)

const canMoveProductUp = (id) => orderedProductIds.value.indexOf(id) > 0
const canMoveProductDown = (id) => {
  const index = orderedProductIds.value.indexOf(id)
  return index > -1 && index < orderedProductIds.value.length - 1
}

const moveProductOrder = (id, direction) => {
  const ordered = [...products.value].sort((a, b) => Number(a.sortOrder || 9999) - Number(b.sortOrder || 9999))
  const index = ordered.findIndex((item) => item.id === id)
  if (index < 0) return
  const target = direction === 'up' ? index - 1 : index + 1
  if (target < 0 || target >= ordered.length) return
  ;[ordered[index], ordered[target]] = [ordered[target], ordered[index]]
  products.value = ordered.map((item, idx) => ({ ...item, sortOrder: idx + 1 }))
}

const syncProductsWithTemplates = () => {
  products.value = products.value.map((item) => {
    const template = templates.value.find((tpl) => tpl.id === item.templateId) || templates.value.find((tpl) => tpl.name === item.templateName)
    if (!template) return item
    return {
      ...item,
      templateId: template.id,
      templateName: template.name,
      leverageRange: template.leverageRange,
      leverageBadges: buildLeverageBadges(template.levels)
    }
  })
}

const refreshTemplateUsage = () => {
  templates.value = templates.value.map((tpl) => {
    const linked = products.value.filter((item) => item.templateId === tpl.id)
    return {
      ...tpl,
      inUseCount: linked.length,
      contracts: linked.map((item) => item.name)
    }
  })
}

syncProductsWithTemplates()
refreshTemplateUsage()
normalizeProductOrder()

const filteredProducts = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return products.value
    .filter((item) => {
    const matchesStatus = statusTab.value === PERPETUAL_COMMON_FILTER_ALL || item.status === statusTab.value
    const matchesKeyword = !keyword || [item.name, item.code, item.pair].join(' ').toLowerCase().includes(keyword)
    return matchesStatus && matchesKeyword
  })
    .sort((a, b) => Number(a.sortOrder || 9999) - Number(b.sortOrder || 9999))
})

const filteredTemplates = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return templates.value.filter((item) => {
    const matchesStatus = statusTab.value === PERPETUAL_COMMON_FILTER_ALL || item.status === statusTab.value
    const matchesKeyword = !keyword || item.name.toLowerCase().includes(keyword)
    return matchesStatus && matchesKeyword
  })
})

const showTemplateModal = ref(false)
const editingTemplateId = ref(null)
const newTemplateName = ref('')
const selectedLeverages = ref([])

const toggleLeverage = (value) => {
  if (selectedLeverages.value.includes(value)) {
    selectedLeverages.value = selectedLeverages.value.filter((item) => item !== value)
    return
  }
  selectedLeverages.value = [...selectedLeverages.value, value].sort((a, b) => a - b)
}

const pickLeveragePack = (type) => {
  if (type === 'all') selectedLeverages.value = [...leverageLevels]
  if (type === 'clear') selectedLeverages.value = []
  if (type === 'low') selectedLeverages.value = leverageLevels.filter((item) => item <= 10)
  if (type === 'mid') selectedLeverages.value = leverageLevels.filter((item) => item >= 10 && item <= 50)
  if (type === 'high') selectedLeverages.value = leverageLevels.filter((item) => item >= 50)
}

const openCreateTemplate = () => {
  editingTemplateId.value = null
  newTemplateName.value = ''
  selectedLeverages.value = []
  showTemplateModal.value = true
}

const openEditTemplate = (template) => {
  editingTemplateId.value = template.id
  newTemplateName.value = template.name
  selectedLeverages.value = template.levels.map((item) => Number(parseNumeric(item))).filter((item) => Number.isFinite(item))
  showTemplateModal.value = true
}

const submitTemplate = () => {
  if (!newTemplateName.value.trim() || selectedLeverages.value.length === 0) return
  const payload = {
    name: newTemplateName.value.trim(),
    status: PERPETUAL_STATUS.ENABLED,
    leverageRange: `${Math.min(...selectedLeverages.value)}x - ${Math.max(...selectedLeverages.value)}x`,
    leverageCount: selectedLeverages.value.length,
    levels: selectedLeverages.value.map((item) => `${item}x`)
  }
  if (editingTemplateId.value) {
    templates.value = templates.value.map((item) => (item.id === editingTemplateId.value ? { ...item, ...payload } : item))
  } else {
    templates.value.unshift({
      id: `tpl-${Date.now()}`,
      ...payload,
      inUseCount: 0,
      contracts: []
    })
  }
  syncProductsWithTemplates()
  refreshTemplateUsage()
  showTemplateModal.value = false
  editingTemplateId.value = null
  newTemplateName.value = ''
  selectedLeverages.value = []
}

const showContractModal = ref(false)
const editingContractId = ref(null)
const contractStep = ref(PERPETUAL_CONTRACT_STEP.BASE)

const contractForm = reactive({
  productName: '',
  productCode: '',
  baseCurrency: 'BTC',
  quoteCurrency: 'USDT',
  status: PERPETUAL_STATUS.ENABLED,
  templateId: 'all-levels',
  minBuy: '10',
  maxBuy: '100000',
  maxPosition: '500000',
  buyFee: '0.02',
  sellFee: '0.05'
})

const resetContractForm = () => {
  contractForm.productName = ''
  contractForm.productCode = ''
  contractForm.baseCurrency = 'BTC'
  contractForm.quoteCurrency = 'USDT'
  contractForm.status = PERPETUAL_STATUS.ENABLED
  contractForm.templateId = templates.value[0]?.id || 'all-levels'
  contractForm.minBuy = '10'
  contractForm.maxBuy = '100000'
  contractForm.maxPosition = '500000'
  contractForm.buyFee = '0.02'
  contractForm.sellFee = '0.05'
}

const steps = [
  { key: PERPETUAL_CONTRACT_STEP.BASE, label: '基本信息' },
  { key: PERPETUAL_CONTRACT_STEP.LEVERAGE, label: '杠杆设置' },
  { key: PERPETUAL_CONTRACT_STEP.LIMIT, label: '交易限制' },
  { key: PERPETUAL_CONTRACT_STEP.FEE, label: '费率' }
]

const selectedTemplate = computed(() => templates.value.find((item) => item.id === contractForm.templateId) || null)

const limitValid = computed(() => Number(contractForm.maxBuy) <= Number(contractForm.maxPosition))

const isContractValid = computed(() => {
  const requiredOk = contractForm.productName.trim() && contractForm.productCode.trim() && selectedTemplate.value
  const limitOk = Number(contractForm.minBuy) > 0 && Number(contractForm.maxBuy) >= Number(contractForm.minBuy) && limitValid.value
  const feeOk = Number(contractForm.buyFee) >= 0 && Number(contractForm.sellFee) >= 0
  return Boolean(requiredOk && limitOk && feeOk)
})

const openCreateContract = () => {
  editingContractId.value = null
  resetContractForm()
  showContractModal.value = true
  contractStep.value = PERPETUAL_CONTRACT_STEP.BASE
}

const openEditContract = (item) => {
  const { baseCurrency, quoteCurrency } = parsePair(item.pair)
  editingContractId.value = item.id
  contractForm.productName = item.name
  contractForm.productCode = item.code
  contractForm.baseCurrency = baseCurrency
  contractForm.quoteCurrency = quoteCurrency
  contractForm.status = item.status
  contractForm.templateId = item.templateId || templates.value.find((tpl) => tpl.name === item.templateName)?.id || templates.value[0]?.id || ''
  contractForm.minBuy = parseNumeric(item.minBuy)
  contractForm.maxBuy = parseNumeric(item.maxBuy)
  contractForm.maxPosition = parseNumeric(item.maxPosition)
  contractForm.buyFee = parseNumeric(item.buyFee)
  contractForm.sellFee = parseNumeric(item.sellFee)
  contractStep.value = PERPETUAL_CONTRACT_STEP.BASE
  showContractModal.value = true
}

const submitContract = () => {
  if (!isContractValid.value || !selectedTemplate.value) return
  const payload = {
    name: contractForm.productName.trim(),
    code: contractForm.productCode.trim(),
    pair: `${contractForm.baseCurrency}/${contractForm.quoteCurrency}`,
    status: contractForm.status,
    templateId: selectedTemplate.value.id,
    templateName: selectedTemplate.value.name,
    leverageRange: selectedTemplate.value.leverageRange,
    buyRange: `${Number(contractForm.minBuy).toLocaleString()} - ${Number(contractForm.maxBuy).toLocaleString()} USDT`,
    maxPosition: fmtUsdt(contractForm.maxPosition),
    minBuy: fmtUsdt(contractForm.minBuy),
    maxBuy: fmtUsdt(contractForm.maxBuy),
    buyFee: `${Number(contractForm.buyFee).toFixed(3)}%`,
    sellFee: `${Number(contractForm.sellFee).toFixed(3)}%`,
    leverageBadges: buildLeverageBadges(selectedTemplate.value.levels)
  }

  if (editingContractId.value) {
    products.value = products.value.map((item) => (item.id === editingContractId.value ? { ...item, ...payload } : item))
  } else {
    products.value.unshift({
      id: `prod-${Date.now()}`,
      sortOrder: products.value.length + 1,
      ...payload
    })
  }

  ensureControlConfig(toSymbol(payload.pair))

  syncProductsWithTemplates()
  normalizeProductOrder()
  refreshTemplateUsage()
  showContractModal.value = false
  editingContractId.value = null
  resetContractForm()
}

const stepText = computed(() => {
  if (!selectedTemplate.value) return []
  return selectedTemplate.value.levels
})
</script>

<template>
  <section class="space-y-4">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl font-semibold text-slate-900">永续合约管理</h1>
        <p class="mt-1 text-sm text-slate-500">管理永续合约产品和杠杆模板配置</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        @click="viewTab === PERPETUAL_VIEW_TAB.PRODUCTS ? openCreateContract() : openCreateTemplate()"
      >
        <span class="text-base">+</span>
        <span>{{ viewTab === PERPETUAL_VIEW_TAB.PRODUCTS ? '新增合约' : '新增模板' }}</span>
      </button>
    </header>

    <article class="rounded-xl border border-slate-200 bg-white">
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-4">
        <div class="flex flex-wrap items-center gap-4">
          <div class="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              class="rounded-md px-4 py-1.5 text-sm"
              :class="viewTab === PERPETUAL_VIEW_TAB.PRODUCTS ? 'bg-white font-medium text-blue-600 shadow-sm' : 'text-slate-600'"
              @click="viewTab = PERPETUAL_VIEW_TAB.PRODUCTS"
            >
              合约产品
            </button>
            <button
              type="button"
              class="rounded-md px-4 py-1.5 text-sm"
              :class="viewTab === PERPETUAL_VIEW_TAB.TEMPLATES ? 'bg-white font-medium text-blue-600 shadow-sm' : 'text-slate-600'"
              @click="viewTab = PERPETUAL_VIEW_TAB.TEMPLATES"
            >
              杠杆模板
            </button>
          </div>

          <div class="inline-flex items-center gap-2 text-sm">
            <button type="button" class="font-medium" :class="statusTab === PERPETUAL_COMMON_FILTER_ALL ? 'text-blue-600' : 'text-slate-500'" @click="statusTab = PERPETUAL_COMMON_FILTER_ALL">全部</button>
            <button
              type="button"
              class="font-medium"
              :class="statusTab === PERPETUAL_STATUS.ENABLED ? 'text-blue-600' : 'text-slate-500'"
              @click="statusTab = PERPETUAL_STATUS.ENABLED"
            >
              已启用
            </button>
            <button
              type="button"
              class="font-medium"
              :class="statusTab === PERPETUAL_STATUS.DISABLED ? 'text-blue-600' : 'text-slate-500'"
              @click="statusTab = PERPETUAL_STATUS.DISABLED"
            >
              已禁用
            </button>
          </div>
        </div>

        <div class="flex w-full max-w-2xl flex-wrap items-center justify-end gap-2">
          <div class="relative w-full max-w-sm">
            <input
              v-model="search"
              type="text"
              class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
              :placeholder="viewTab === PERPETUAL_VIEW_TAB.PRODUCTS ? '搜索产品名称或代码...' : '搜索模板名称...'"
            />
            <svg viewBox="0 0 20 20" class="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none">
              <circle cx="9" cy="9" r="5.8" stroke="currentColor" stroke-width="1.6" />
              <path d="M13.6 13.6L16.4 16.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
          </div>
        </div>
      </div>

      <div v-if="viewTab === PERPETUAL_VIEW_TAB.PRODUCTS" class="space-y-4 p-4">
        <article v-for="item in filteredProducts" :key="item.id" class="rounded-xl border border-slate-200 bg-white">
          <div class="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 p-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">#{{ item.sortOrder }}</span>
                <h3 class="text-lg font-semibold text-slate-900">{{ item.name }}</h3>
                <span class="text-sm text-slate-500">{{ item.code }}</span>
                <span class="rounded-md px-2 py-0.5 text-xs font-medium" :class="productStatusMeta[item.status]?.badgeClass">
                  {{ productStatusMeta[item.status]?.text || '未知状态' }}
                </span>
              </div>
              <p class="mt-2 text-sm text-slate-700">
                交易对: {{ item.pair }}
                <span class="mx-3 text-slate-300">|</span>
                杠杆范围: {{ item.leverageRange }}
                <span class="mx-3 text-slate-300">|</span>
                买入范围: {{ item.buyRange }}
                <span class="mx-3 text-slate-300">|</span>
                最大持仓: {{ item.maxPosition }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <div class="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  class="rounded px-2 py-1 text-xs"
                  :class="canMoveProductUp(item.id) ? 'text-slate-700 hover:bg-white' : 'cursor-not-allowed text-slate-300'"
                  :disabled="!canMoveProductUp(item.id)"
                  @click="moveProductOrder(item.id, 'up')"
                >
                  上移
                </button>
                <button
                  type="button"
                  class="rounded px-2 py-1 text-xs"
                  :class="canMoveProductDown(item.id) ? 'text-slate-700 hover:bg-white' : 'cursor-not-allowed text-slate-300'"
                  :disabled="!canMoveProductDown(item.id)"
                  @click="moveProductOrder(item.id, 'down')"
                >
                  下移
                </button>
              </div>
              <button
                type="button"
                class="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-sm text-violet-600"
                @click="openControlModal(item)"
              >
                线控设置
              </button>
              <button type="button" class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700" @click="openEditContract(item)">编辑</button>
            </div>
          </div>

          <div class="grid gap-0 md:grid-cols-3">
            <div class="border-b border-slate-200 p-4 md:border-b-0 md:border-r">
              <p class="text-sm text-slate-500">杠杆模板</p>
              <p class="mt-2 font-medium text-slate-900">{{ item.templateName }}</p>
              <div class="mt-3 flex flex-wrap gap-2">
                <span v-for="tag in item.leverageBadges" :key="tag" class="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">{{ tag }}</span>
              </div>
            </div>
            <div class="border-b border-slate-200 p-4 md:border-b-0 md:border-r">
              <p class="text-sm text-slate-500">交易限制</p>
              <ul class="mt-2 space-y-1 text-sm text-slate-700">
                <li><span class="font-medium">最低买入:</span> {{ item.minBuy }}</li>
                <li><span class="font-medium">最大买入:</span> {{ item.maxBuy }}</li>
                <li><span class="font-medium">最大持仓:</span> {{ item.maxPosition }}</li>
              </ul>
            </div>
            <div class="p-4">
              <p class="text-sm text-slate-500">费率</p>
              <ul class="mt-2 space-y-1 text-sm text-slate-700">
                <li><span class="font-medium">买入费率:</span> {{ item.buyFee }}</li>
                <li><span class="font-medium">卖出费率:</span> {{ item.sellFee }}</li>
              </ul>
            </div>
          </div>
        </article>

        <p v-if="filteredProducts.length === 0" class="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">没有匹配的合约产品</p>
      </div>

      <div v-else class="space-y-4 p-4">
        <article v-for="tpl in filteredTemplates" :key="tpl.id" class="rounded-xl border border-slate-200 p-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-lg font-semibold text-slate-900">{{ tpl.name }}</h3>
                <span class="rounded-md bg-blue-50 px-2 py-0.5 text-xs text-blue-600">{{ tpl.leverageCount }} 个档位</span>
                <span class="rounded-md bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600">{{ tpl.inUseCount }} 个合约使用中</span>
              </div>
              <p class="mt-3 text-sm text-slate-600">杠杆范围: <span class="font-medium text-slate-900">{{ tpl.leverageRange }}</span></p>
            </div>
            <button type="button" class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700" @click="openEditTemplate(tpl)">编辑</button>
          </div>

          <div class="mt-4">
            <p class="text-sm text-slate-500">可用杠杆档位:</p>
            <div class="mt-2 flex flex-wrap gap-2">
              <span v-for="lv in tpl.levels" :key="lv" class="rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">{{ lv }}</span>
            </div>
          </div>

          <div class="mt-4">
            <p class="text-sm text-slate-500">使用此模板的合约:</p>
            <div class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="contract in tpl.contracts"
                :key="contract"
                class="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-700"
              >
                {{ contract }}
              </span>
              <span v-if="tpl.contracts.length === 0" class="text-sm text-slate-400">暂无</span>
            </div>
          </div>
        </article>

        <p v-if="filteredTemplates.length === 0" class="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">没有匹配的杠杆模板</p>
      </div>
    </article>
  </section>

  <div v-if="showTemplateModal" class="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" @click.self="showTemplateModal = false">
    <section class="w-full max-w-3xl rounded-xl bg-white">
      <header class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <h2 class="text-2xl font-semibold text-slate-900">{{ editingTemplateId ? '编辑杠杆模板' : '新增杠杆模板' }}</h2>
        <button type="button" class="text-2xl text-slate-400 hover:text-slate-700" @click="showTemplateModal = false">×</button>
      </header>

      <div class="space-y-5 px-6 py-5">
        <label class="block space-y-2">
          <span class="text-sm font-medium text-slate-700">模板名称 <span class="text-rose-500">*</span></span>
          <input
            v-model="newTemplateName"
            type="text"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
            placeholder="请输入模板名称"
          />
        </label>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-slate-700">选择杠杆档位 <span class="text-rose-500">*</span></p>
            <p class="text-sm text-slate-500">已选择: <span class="font-semibold text-blue-600">{{ selectedLeverages.length }}</span> 个档位</p>
          </div>

          <div class="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            <button
              v-for="lv in leverageLevels"
              :key="lv"
              type="button"
              class="rounded-lg border px-3 py-2 text-sm"
              :class="selectedLeverages.includes(lv) ? 'border-blue-300 bg-blue-50 font-medium text-blue-600' : 'border-slate-200 bg-slate-50 text-slate-700'
              "
              @click="toggleLeverage(lv)"
            >
              {{ lv }}x
            </button>
          </div>

          <div class="flex flex-wrap gap-2">
            <button type="button" class="rounded-md border border-slate-200 px-3 py-1 text-sm" @click="pickLeveragePack('all')">全选</button>
            <button type="button" class="rounded-md border border-slate-200 px-3 py-1 text-sm" @click="pickLeveragePack('clear')">清空</button>
            <button type="button" class="rounded-md border border-slate-200 px-3 py-1 text-sm" @click="pickLeveragePack('low')">低杠杆 (1-10x)</button>
            <button type="button" class="rounded-md border border-slate-200 px-3 py-1 text-sm" @click="pickLeveragePack('mid')">中等杠杆 (10-50x)</button>
            <button type="button" class="rounded-md border border-slate-200 px-3 py-1 text-sm" @click="pickLeveragePack('high')">高杠杆 (50-125x)</button>
          </div>

          <div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p class="font-medium text-slate-800">当前选择的杠杆档位</p>
            <div v-if="selectedLeverages.length" class="mt-2 flex flex-wrap gap-2">
              <span v-for="lv in selectedLeverages" :key="`picked-${lv}`" class="rounded-md bg-white px-2 py-0.5 text-sm text-blue-600">{{ lv }}x</span>
            </div>
            <p v-else class="mt-2 text-sm text-slate-500">暂无选择任何档位</p>
          </div>

          <div class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p class="font-medium">杠杆档位说明:</p>
            <p class="mt-2">- 1-10x: 低风险，适合稳健投资者</p>
            <p>- 10-50x: 中等风险，需要一定的风险承受能力</p>
            <p>- 50-125x: 高风险，仅适合专业交易者</p>
            <p class="mt-2 font-medium text-rose-500">杠杆越高，强制平仓风险越大</p>
          </div>
        </div>
      </div>

      <footer class="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
        <button type="button" class="rounded-lg border border-slate-200 px-4 py-2" @click="showTemplateModal = false">取消</button>
        <button
          type="button"
          class="rounded-lg px-4 py-2 font-medium text-white"
          :class="newTemplateName.trim() && selectedLeverages.length ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300'"
          :disabled="!newTemplateName.trim() || !selectedLeverages.length"
          @click="submitTemplate"
        >
          {{ editingTemplateId ? '保存' : '创建' }}
        </button>
      </footer>
    </section>
  </div>

  <div v-if="showContractModal" class="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" @click.self="showContractModal = false">
    <section class="w-full max-w-3xl rounded-xl bg-white">
      <header class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <h2 class="text-2xl font-semibold text-slate-900">{{ editingContractId ? '编辑永续合约' : '新增永续合约' }}</h2>
        <button type="button" class="text-2xl text-slate-400 hover:text-slate-700" @click="showContractModal = false">×</button>
      </header>

      <div class="px-6 pt-4">
        <div class="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            v-for="step in steps"
            :key="step.key"
            type="button"
            class="rounded-md px-4 py-1.5 text-sm"
            :class="contractStep === step.key ? 'bg-white font-medium text-blue-600 shadow-sm' : 'text-slate-600'"
            @click="contractStep = step.key"
          >
            {{ step.label }}
          </button>
        </div>
      </div>

      <div class="space-y-5 px-6 py-5">
        <div v-if="contractStep === PERPETUAL_CONTRACT_STEP.BASE" class="grid gap-4 md:grid-cols-2">
          <label class="space-y-2">
            <span class="text-sm font-medium">产品名称 <span class="text-rose-500">*</span></span>
            <input v-model="contractForm.productName" type="text" class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500" />
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium">产品代码 <span class="text-rose-500">*</span></span>
            <input v-model="contractForm.productCode" type="text" class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500" />
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium">基础币种 <span class="text-rose-500">*</span></span>
            <select v-model="contractForm.baseCurrency" class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500">
              <option>BTC</option>
              <option>ETH</option>
              <option>SOL</option>
              <option>XRP</option>
            </select>
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium">计价币种 <span class="text-rose-500">*</span></span>
            <select v-model="contractForm.quoteCurrency" class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500">
              <option>USDT</option>
              <option>USDC</option>
            </select>
          </label>
          <div class="space-y-2 md:col-span-2">
            <span class="text-sm font-medium">产品状态</span>
            <div class="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                class="rounded-md px-4 py-1.5 text-sm"
                :class="contractForm.status === PERPETUAL_STATUS.ENABLED ? 'bg-emerald-100 font-medium text-emerald-700' : 'text-slate-600'"
                @click="contractForm.status = PERPETUAL_STATUS.ENABLED"
              >
                已启用
              </button>
              <button
                type="button"
                class="rounded-md px-4 py-1.5 text-sm"
                :class="contractForm.status === PERPETUAL_STATUS.DISABLED ? 'bg-rose-100 font-medium text-rose-700' : 'text-slate-600'"
                @click="contractForm.status = PERPETUAL_STATUS.DISABLED"
              >
                已禁用
              </button>
            </div>
          </div>
        </div>

        <div v-if="contractStep === PERPETUAL_CONTRACT_STEP.LEVERAGE" class="space-y-4">
          <label class="block max-w-md space-y-2">
            <span class="text-sm font-medium">选择杠杆模板 <span class="text-rose-500">*</span></span>
            <select v-model="contractForm.templateId" class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500">
              <option v-for="tpl in templates" :key="tpl.id" :value="tpl.id">{{ tpl.name }}</option>
            </select>
          </label>

          <article v-if="selectedTemplate" class="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h4 class="font-medium text-slate-900">模板详情: {{ selectedTemplate.name }}</h4>
            <div class="mt-3 flex flex-wrap gap-2">
              <span v-for="lv in stepText" :key="`modal-${lv}`" class="rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">{{ lv }}</span>
            </div>
            <p class="mt-3 text-sm text-slate-600">- 用户可在以上 {{ selectedTemplate.leverageCount }} 个档位中选择杠杆倍数</p>
            <p class="text-sm text-slate-600">- 杠杆范围: {{ selectedTemplate.leverageRange }}</p>
          </article>

          <div class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p class="font-medium">杠杆模板说明:</p>
            <p class="mt-1">- 杠杆模板定义了该合约产品可用的杠杆倍数档位</p>
            <p>- 用户在交易时可以从模板中选择任意档位</p>
            <p>- 不同的杠杆模板以便不同风险偏好的用户</p>
            <p class="mt-1 font-medium text-rose-500">杠杆越高，强制平仓风险越大</p>
          </div>
        </div>

        <div v-if="contractStep === PERPETUAL_CONTRACT_STEP.LIMIT" class="space-y-4">
          <div class="grid gap-4 md:grid-cols-3">
            <label class="space-y-2">
              <span class="text-sm font-medium">最低买入量 (USDT) <span class="text-rose-500">*</span></span>
              <input v-model="contractForm.minBuy" type="number" class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500" />
            </label>
            <label class="space-y-2">
              <span class="text-sm font-medium">最大买入量 (USDT) <span class="text-rose-500">*</span></span>
              <input v-model="contractForm.maxBuy" type="number" class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500" />
            </label>
            <label class="space-y-2">
              <span class="text-sm font-medium">最大持仓量 (USDT) <span class="text-rose-500">*</span></span>
              <input v-model="contractForm.maxPosition" type="number" class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500" />
            </label>
          </div>

          <div class="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p class="font-medium text-slate-800">交易限制说明</p>
            <p class="mt-2">- 单笔交易范围: {{ Number(contractForm.minBuy).toLocaleString() }} - {{ Number(contractForm.maxBuy).toLocaleString() }} USDT</p>
            <p>- 最大持仓: {{ Number(contractForm.maxPosition).toLocaleString() }} USDT</p>
            <p class="mt-1" :class="limitValid ? 'text-slate-500' : 'font-medium text-rose-500'">注意: 最大买入量不能超过最大持仓量</p>
          </div>
        </div>

        <div v-if="contractStep === PERPETUAL_CONTRACT_STEP.FEE" class="space-y-4">
          <div class="grid gap-4 md:grid-cols-2">
            <label class="space-y-2">
              <span class="text-sm font-medium">买入费率 <span class="text-rose-500">*</span></span>
              <input v-model="contractForm.buyFee" type="number" step="0.001" class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500" />
            </label>
            <label class="space-y-2">
              <span class="text-sm font-medium">卖出费率 <span class="text-rose-500">*</span></span>
              <input v-model="contractForm.sellFee" type="number" step="0.001" class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500" />
            </label>
          </div>

          <div class="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p class="font-medium text-slate-800">费率说明</p>
            <p class="mt-2">- 买入费率: {{ pctText(contractForm.buyFee) }}</p>
            <p>- 卖出费率: {{ pctText(contractForm.sellFee) }}</p>
          </div>
        </div>
      </div>

      <footer class="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
        <button type="button" class="rounded-lg border border-slate-200 px-4 py-2" @click="showContractModal = false">取消</button>
        <button
          type="button"
          class="rounded-lg px-4 py-2 font-medium text-white"
          :class="isContractValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300'"
          :disabled="!isContractValid"
          @click="submitContract"
        >
          {{ editingContractId ? '保存' : '创建' }}
        </button>
      </footer>
    </section>
  </div>

  <ControlConfigModal
    :open="controlModalOpen"
    :symbol="activeControlSymbol"
    :config="controlConfigs[activeControlSymbol] || createDefaultPerpetualControlConfig()"
    @close="controlModalOpen = false"
    @save="saveControlConfig"
  />
</template>
