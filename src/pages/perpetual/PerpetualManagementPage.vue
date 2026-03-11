<script setup>
import { computed, reactive, ref } from 'vue'
import ControlConfigModal from '../../components/ControlConfigModal.vue'
import {
  PERPETUAL_COMMON_FILTER_ALL,
  PERPETUAL_CONTRACT_STEP,
  PERPETUAL_STATUS
} from '../../constants/perpetual'
import {
  createDefaultPerpetualControlConfig,
  createPerpetualControlConfigsMock,
  createPerpetualProductsMock,
  createPerpetualTemplatesMock,
  perpetualLeverageLevels,
  perpetualProductStatusMeta
} from '../../mock/perpetual'

const statusTab = ref(PERPETUAL_COMMON_FILTER_ALL)
const search = ref('')

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
        <p class="mt-1 text-sm text-slate-500">管理永续合约产品配置</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        @click="openCreateContract"
      >
        <span class="text-base">+</span>
        <span>新增合约</span>
      </button>
    </header>

    <article class="rounded-xl border border-slate-200 bg-white">
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-4">
        <div class="flex flex-wrap items-center gap-4">
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
              placeholder="搜索产品名称或代码..."
            />
            <svg viewBox="0 0 20 20" class="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none">
              <circle cx="9" cy="9" r="5.8" stroke="currentColor" stroke-width="1.6" />
              <path d="M13.6 13.6L16.4 16.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
          </div>
        </div>
      </div>

      <div class="space-y-4 p-4">
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
    </article>
  </section>

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
