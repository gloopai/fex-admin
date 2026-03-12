<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { COMMON_FILTER_ALL, DELIVERY_CONTRACT_TAB, DELIVERY_STATUS } from '../../constants/delivery'
import { createDeliveryProductsMock, createDeliveryTemplatesMock } from '../../mock/delivery'

const statusTab = ref(COMMON_FILTER_ALL)
const search = ref('')

const templates = ref(createDeliveryTemplatesMock())
const products = ref(createDeliveryProductsMock())

// 分页状态
const pagination = reactive({
  currentPage: 1,
  pageSize: 5,
  total: 0
})

const allFilteredProducts = computed(() => {
  const kw = search.value.trim().toLowerCase()
  return products.value.filter((p) => {
    const hitStatus = statusTab.value === COMMON_FILTER_ALL || p.status === statusTab.value
    const hitKw = !kw || `${p.name} ${p.code} ${p.pair}`.toLowerCase().includes(kw)
    return hitStatus && hitKw
  })
})

const filteredProducts = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return allFilteredProducts.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(allFilteredProducts.value.length / pagination.pageSize))

// 监听筛选变化，重置页码
watch([statusTab, search], () => {
  pagination.currentPage = 1
})

const durationLabel = (sec) => {
  if (sec < 60) return `${sec}秒`
  if (sec % 60 === 0) return `${sec / 60}分钟`
  return `${sec}s`
}

const templateById = computed(() => Object.fromEntries(templates.value.map((t) => [t.id, t])))
const productCycles = (product) => templateById.value[product.templateId]?.cycles || []

const showContractModal = ref(false)
const editingContractId = ref('')
const contractTab = ref(DELIVERY_CONTRACT_TAB.BASIC)

const contractForm = reactive({
  name: '',
  code: '',
  baseCurrency: 'BTC',
  quoteCurrency: 'USDT',
  status: DELIVERY_STATUS.ENABLED,
  templateId: 'tpl-standard',
  minBuy: '10',
  maxBuy: '10000',
  maxHold: '50000',
  buyFee: '0.1',
  sellFee: '0.2'
})

const selectedTemplate = computed(() => templates.value.find((t) => t.id === contractForm.templateId) || null)
const selectedTemplateCycles = computed(() => selectedTemplate.value?.cycles || [])

const openCreateContract = () => {
  editingContractId.value = ''
  contractTab.value = DELIVERY_CONTRACT_TAB.BASIC
  contractForm.name = ''
  contractForm.code = ''
  contractForm.baseCurrency = 'BTC'
  contractForm.quoteCurrency = 'USDT'
  contractForm.status = DELIVERY_STATUS.ENABLED
  contractForm.templateId = templates.value[0]?.id || ''
  contractForm.minBuy = '10'
  contractForm.maxBuy = '10000'
  contractForm.maxHold = '50000'
  contractForm.buyFee = '0.1'
  contractForm.sellFee = '0.2'
  showContractModal.value = true
}

const openEditContract = (item) => {
  editingContractId.value = item.id
  contractTab.value = DELIVERY_CONTRACT_TAB.BASIC
  contractForm.name = item.name
  contractForm.code = item.code
  const [baseCurrency, quoteCurrency] = item.pair.split('/')
  contractForm.baseCurrency = baseCurrency
  contractForm.quoteCurrency = quoteCurrency
  contractForm.status = item.status
  contractForm.templateId = item.templateId
  contractForm.minBuy = item.minBuy
  contractForm.maxBuy = item.maxBuy
  contractForm.maxHold = item.maxHold
  contractForm.buyFee = item.buyFee
  contractForm.sellFee = item.sellFee
  showContractModal.value = true
}

const saveContract = () => {
  const payload = {
    name: contractForm.name.trim(),
    code: contractForm.code.trim().toUpperCase(),
    pair: `${contractForm.baseCurrency}/${contractForm.quoteCurrency}`,
    status: contractForm.status,
    templateId: contractForm.templateId,
    templateName: selectedTemplate.value?.name || '-',
    buyRange: `${Number(contractForm.minBuy).toLocaleString()} - ${Number(contractForm.maxBuy).toLocaleString()} USDT`,
    maxPosition: `${Number(contractForm.maxHold).toLocaleString()} USDT`,
    minBuy: contractForm.minBuy,
    maxBuy: contractForm.maxBuy,
    maxHold: contractForm.maxHold,
    buyFee: contractForm.buyFee,
    sellFee: contractForm.sellFee
  }

  if (editingContractId.value) {
    products.value = products.value.map((item) => (item.id === editingContractId.value ? { ...item, ...payload } : item))
  } else {
    products.value.unshift({ id: `prod-${Date.now()}`, ...payload })
  }

  showContractModal.value = false
}

const statusClass = (status) =>
  status === DELIVERY_STATUS.ENABLED
    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
    : 'bg-rose-50 text-rose-600 border-rose-100'
</script>

<template>
  <section class="space-y-4">
    <!-- Page Header -->
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl font-semibold text-slate-900">交割合约管理</h1>
        <p class="mt-1 text-sm text-slate-500">管理平台交割合约产品的核心配置，包括周期模板、交易限额及手续费率</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        @click="openCreateContract()"
      >
        <span class="text-base">+</span>
        <span>新增合约</span>
      </button>
    </header>

    <article class="rounded-xl border border-slate-200 bg-white">
      <!-- 筛选栏 -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-4">
        <div class="flex flex-wrap items-center gap-4">
          <div class="inline-flex items-center gap-2 text-sm">
            <button
              type="button"
              class="font-medium"
              :class="statusTab === COMMON_FILTER_ALL ? 'text-blue-600' : 'text-slate-500'"
              @click="statusTab = COMMON_FILTER_ALL"
            >
              全部
            </button>
            <button
              type="button"
              class="font-medium"
              :class="statusTab === DELIVERY_STATUS.ENABLED ? 'text-blue-600' : 'text-slate-500'"
              @click="statusTab = DELIVERY_STATUS.ENABLED"
            >
              已启用
            </button>
            <button
              type="button"
              class="font-medium"
              :class="statusTab === DELIVERY_STATUS.DISABLED ? 'text-blue-600' : 'text-slate-500'"
              @click="statusTab = DELIVERY_STATUS.DISABLED"
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

      <!-- 列表内容 -->
      <div class="p-4 space-y-4">
        <article
          v-for="item in filteredProducts"
          :key="item.id"
          class="rounded-xl border border-slate-200 bg-white transition-all hover:border-blue-500/30 hover:shadow-sm"
        >
          <div class="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 p-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 flex-wrap">
                <h3 class="text-lg font-semibold text-slate-900">{{ item.name }}</h3>
                <span class="text-sm font-mono text-slate-500">{{ item.code }}</span>
                <span
                  class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md"
                  :class="statusClass(item.status)"
                >
                  {{ item.status === DELIVERY_STATUS.ENABLED ? '已启用' : '已禁用' }}
                </span>
                <span class="px-2 py-0.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-md">
                  {{ item.templateName }}
                </span>
              </div>
              <p class="mt-2 text-sm text-slate-600">
                交易对: <span class="text-slate-900 font-medium">{{ item.pair }}</span>
                <span class="mx-3 text-slate-200">|</span>
                买入范围: <span class="text-slate-900 font-medium">{{ item.buyRange }}</span>
                <span class="mx-3 text-slate-200">|</span>
                最大持仓: <span class="text-slate-900 font-medium">{{ item.maxPosition }}</span>
              </p>
              <div class="mt-3 flex flex-wrap items-center gap-2">
                <span class="text-xs text-slate-400">可选周期:</span>
                <span
                  v-for="cycle in productCycles(item)"
                  :key="cycle.id"
                  class="px-2 py-0.5 text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-md"
                >
                  {{ durationLabel(cycle.durationSec) }} ({{ cycle.payoutPct.toFixed(1) }}%)
                </span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="text-blue-600 hover:text-blue-700 text-xs font-medium"
                @click="openEditContract(item)"
              >
                编辑配置
              </button>
            </div>
          </div>

          <div class="grid gap-0 md:grid-cols-2 bg-slate-50/50">
            <div class="border-b border-slate-100 p-4 md:border-b-0 md:border-r">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">交易限制</p>
              <ul class="mt-3 grid grid-cols-3 gap-4 text-sm">
                <li class="flex flex-col gap-1">
                  <span class="text-slate-500 text-xs">最低买入</span>
                  <span class="text-slate-900 font-semibold font-mono">{{ Number(item.minBuy).toLocaleString() }}</span>
                </li>
                <li class="flex flex-col gap-1">
                  <span class="text-slate-500 text-xs">最大买入</span>
                  <span class="text-slate-900 font-semibold font-mono">{{ Number(item.maxBuy).toLocaleString() }}</span>
                </li>
                <li class="flex flex-col gap-1">
                  <span class="text-slate-500 text-xs">最大持仓</span>
                  <span class="text-slate-900 font-semibold font-mono">{{ Number(item.maxHold).toLocaleString() }}</span>
                </li>
              </ul>
            </div>
            <div class="p-4">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">手续费率</p>
              <ul class="mt-3 grid grid-cols-2 gap-4 text-sm">
                <li class="flex flex-col gap-1">
                  <span class="text-slate-500 text-xs">买入费率</span>
                  <span class="text-emerald-600 font-bold font-mono">{{ Number(item.buyFee).toFixed(2) }}%</span>
                </li>
                <li class="flex flex-col gap-1">
                  <span class="text-slate-500 text-xs">卖出费率</span>
                  <span class="text-rose-600 font-bold font-mono">{{ Number(item.sellFee).toFixed(2) }}%</span>
                </li>
              </ul>
            </div>
          </div>
        </article>
      </div>

      <!-- 分页组件 -->
      <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-slate-100 p-4">
        <div class="text-sm text-slate-500">
          共 <span class="font-medium text-slate-900">{{ allFilteredProducts.length }}</span> 条记录，第
          <span class="font-medium text-slate-900">{{ pagination.currentPage }}</span> / {{ totalPages }} 页
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="pagination.currentPage === 1"
            @click="pagination.currentPage--"
          >
            上一页
          </button>
          <button
            type="button"
            class="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="pagination.currentPage === totalPages"
            @click="pagination.currentPage++"
          >
            下一页
          </button>
        </div>
      </div>
    </article>

    <!-- 编辑模态框 -->
    <Transition name="modal">
      <div
        v-if="showContractModal"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
        @click.self="showContractModal = false"
      >
        <section
          class="flex flex-col w-full max-w-4xl h-[90vh] overflow-hidden rounded-xl bg-white shadow-2xl border border-slate-200"
        >
          <header class="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 px-6 py-4">
            <div>
              <h2 class="text-xl font-semibold text-slate-900">{{ editingContractId ? '编辑交割合约' : '新增交割合约' }}</h2>
              <p class="mt-0.5 text-xs text-slate-500">配置交割合约的基本参数、周期模板与交易限额</p>
            </div>
            <button
              type="button"
              class="text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none"
              @click="showContractModal = false"
            >
              ×
            </button>
          </header>

          <div class="px-6 py-3 border-b border-slate-200 bg-white">
            <div class="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                class="rounded-md px-4 py-1.5 text-sm transition-all"
                :class="
                  contractTab === DELIVERY_CONTRACT_TAB.BASIC
                    ? 'bg-white text-blue-600 shadow-sm font-medium'
                    : 'text-slate-500 hover:text-slate-700'
                "
                @click="contractTab = DELIVERY_CONTRACT_TAB.BASIC"
              >
                基本信息
              </button>
              <button
                type="button"
                class="rounded-md px-4 py-1.5 text-sm transition-all"
                :class="
                  contractTab === DELIVERY_CONTRACT_TAB.CYCLE
                    ? 'bg-white text-blue-600 shadow-sm font-medium'
                    : 'text-slate-500 hover:text-slate-700'
                "
                @click="contractTab = DELIVERY_CONTRACT_TAB.CYCLE"
              >
                周期设置
              </button>
              <button
                type="button"
                class="rounded-md px-4 py-1.5 text-sm transition-all"
                :class="
                  contractTab === DELIVERY_CONTRACT_TAB.LIMIT
                    ? 'bg-white text-blue-600 shadow-sm font-medium'
                    : 'text-slate-500 hover:text-slate-700'
                "
                @click="contractTab = DELIVERY_CONTRACT_TAB.LIMIT"
              >
                交易限制
              </button>
              <button
                type="button"
                class="rounded-md px-4 py-1.5 text-sm transition-all"
                :class="
                  contractTab === DELIVERY_CONTRACT_TAB.FEE
                    ? 'bg-white text-blue-600 shadow-sm font-medium'
                    : 'text-slate-500 hover:text-slate-700'
                "
                @click="contractTab = DELIVERY_CONTRACT_TAB.FEE"
              >
                费率设置
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto bg-slate-50/30 p-6 space-y-6">
            <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div v-if="contractTab === DELIVERY_CONTRACT_TAB.BASIC" class="grid gap-6 md:grid-cols-2">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-slate-900">合约名称 <span class="text-rose-500">*</span></label>
                  <input
                    v-model="contractForm.name"
                    type="text"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 text-sm"
                    placeholder="如：BTC 周期合约"
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-slate-900">合约代码 <span class="text-rose-500">*</span></label>
                  <input
                    v-model="contractForm.code"
                    type="text"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 text-sm"
                    placeholder="如：BTC_DELIVERY"
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-slate-900">基础币种</label>
                  <select
                    v-model="contractForm.baseCurrency"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 text-sm"
                  >
                    <option>BTC</option>
                    <option>ETH</option>
                    <option>SOL</option>
                  </select>
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-slate-900">计价币种</label>
                  <select
                    v-model="contractForm.quoteCurrency"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 text-sm"
                  >
                    <option>USDT</option>
                    <option>USDC</option>
                  </select>
                </div>
                <div class="space-y-2 md:col-span-2">
                  <span class="text-sm font-medium text-slate-900">产品状态</span>
                  <div class="flex rounded-lg border border-slate-200 bg-slate-50 p-1 w-fit mt-1">
                    <button
                      type="button"
                      class="rounded-md px-4 py-1.5 text-sm transition-all"
                      :class="
                        contractForm.status === DELIVERY_STATUS.ENABLED
                          ? 'bg-white shadow-sm font-medium text-blue-600'
                          : 'text-slate-500 hover:text-slate-700'
                      "
                      @click="contractForm.status = DELIVERY_STATUS.ENABLED"
                    >
                      已启用
                    </button>
                    <button
                      type="button"
                      class="rounded-md px-4 py-1.5 text-sm transition-all"
                      :class="
                        contractForm.status === DELIVERY_STATUS.DISABLED
                          ? 'bg-white shadow-sm font-medium text-blue-600'
                          : 'text-slate-500 hover:text-slate-700'
                      "
                      @click="contractForm.status = DELIVERY_STATUS.DISABLED"
                    >
                      已禁用
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="contractTab === DELIVERY_CONTRACT_TAB.CYCLE" class="space-y-6">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-slate-900">选择周期模板 <span class="text-rose-500">*</span></label>
                  <select
                    v-model="contractForm.templateId"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 text-sm"
                  >
                    <option v-for="tpl in templates" :key="tpl.id" :value="tpl.id">{{ tpl.name }}</option>
                  </select>
                </div>
                <article v-if="selectedTemplate" class="rounded-xl border border-blue-100 bg-blue-50/30 p-4 space-y-4">
                  <div class="flex items-center justify-between">
                    <h4 class="font-semibold text-slate-900">模板详情: {{ selectedTemplate.name }}</h4>
                    <span class="text-xs text-blue-600 font-medium">{{ selectedTemplateCycles.length }} 个预设周期</span>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <div
                      v-for="cycle in selectedTemplateCycles"
                      :key="cycle.id"
                      class="px-3 py-1.5 rounded-lg bg-white border border-blue-100 text-xs flex items-center gap-2"
                    >
                      <span class="text-slate-500">时长:</span>
                      <span class="font-bold text-slate-900">{{ durationLabel(cycle.durationSec) }}</span>
                      <span class="text-slate-200">|</span>
                      <span class="text-slate-500">收益:</span>
                      <span class="font-bold text-emerald-600">{{ cycle.payoutPct }}%</span>
                    </div>
                  </div>
                </article>
              </div>

              <div v-if="contractTab === DELIVERY_CONTRACT_TAB.LIMIT" class="grid gap-6 md:grid-cols-3">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-slate-900">最低买入额 (USDT)</label>
                  <input
                    v-model="contractForm.minBuy"
                    type="number"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 text-sm font-mono"
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-slate-900">最高买入额 (USDT)</label>
                  <input
                    v-model="contractForm.maxBuy"
                    type="number"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 text-sm font-mono"
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-slate-900">最大持仓额 (USDT)</label>
                  <input
                    v-model="contractForm.maxHold"
                    type="number"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 text-sm font-mono"
                  />
                </div>
              </div>

              <div v-if="contractTab === DELIVERY_CONTRACT_TAB.FEE" class="grid gap-6 md:grid-cols-2">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-slate-900">买入费率 (%)</label>
                  <div class="relative">
                    <input
                      v-model="contractForm.buyFee"
                      type="number"
                      step="0.01"
                      class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 text-sm font-mono pr-8"
                    />
                    <span class="absolute right-3 top-2 text-slate-400 text-sm">%</span>
                  </div>
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-slate-900">卖出费率 (%)</label>
                  <div class="relative">
                    <input
                      v-model="contractForm.sellFee"
                      type="number"
                      step="0.01"
                      class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 text-sm font-mono pr-8"
                    />
                    <span class="absolute right-3 top-2 text-slate-400 text-sm">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer class="flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
            <button
              type="button"
              class="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              @click="showContractModal = false"
            >
              取消
            </button>
            <button
              type="button"
              class="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-colors"
              @click="saveContract"
            >
              保存合约
            </button>
          </footer>
        </section>
      </div>
    </Transition>
  </section>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
