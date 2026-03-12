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

const statusClass = (status) => (status === DELIVERY_STATUS.ENABLED ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600')
</script>

<template>
  <section class="space-y-4">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl font-semibold text-slate-900">交割合约管理</h1>
        <p class="mt-1 text-sm text-slate-500">管理交割合约产品配置</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        @click="openCreateContract()"
      >
        <span class="text-base">+</span>
        <span>新增合约</span>
      </button>
    </header>

    <article class="rounded-xl border border-slate-200 bg-white">
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-4">
        <div class="flex items-center gap-4">
          <div class="inline-flex items-center gap-3 text-sm">
            <button type="button" class="font-medium" :class="statusTab === COMMON_FILTER_ALL ? 'text-blue-600' : 'text-slate-500'" @click="statusTab = COMMON_FILTER_ALL">全部</button>
            <button type="button" class="font-medium" :class="statusTab === DELIVERY_STATUS.ENABLED ? 'text-blue-600' : 'text-slate-500'" @click="statusTab = DELIVERY_STATUS.ENABLED">已启用</button>
            <button type="button" class="font-medium" :class="statusTab === DELIVERY_STATUS.DISABLED ? 'text-blue-600' : 'text-slate-500'" @click="statusTab = DELIVERY_STATUS.DISABLED">已禁用</button>
          </div>
        </div>

        <input v-model="search" type="text" placeholder="搜索产品名称或代码..." class="w-full max-w-sm rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500" />
      </div>

      <div class="space-y-3 p-4">
        <article v-for="item in filteredProducts" :key="item.id" class="rounded-xl border border-slate-200 bg-white">
          <div class="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 p-4">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-semibold text-slate-900">{{ item.name }}</h3>
                <span class="text-sm text-slate-500">{{ item.code }}</span>
                <span class="rounded-md px-2 py-0.5 text-xs font-medium" :class="statusClass(item.status)">{{ item.status === DELIVERY_STATUS.ENABLED ? '已启用' : '已禁用' }}</span>
                <span class="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{{ item.templateName }}</span>
              </div>
              <p class="mt-1.5 text-sm text-slate-700">
                交易对: {{ item.pair }}
                <span class="mx-3 text-slate-300">|</span>
                买入范围: {{ item.buyRange }}
                <span class="mx-3 text-slate-300">|</span>
                最大持仓: {{ item.maxPosition }}
              </p>
              <div class="mt-1.5 flex flex-wrap gap-1.5 text-xs">
                <span class="text-slate-500">可选周期:</span>
                <span v-for="cycle in productCycles(item)" :key="cycle.id" class="rounded-md bg-blue-50 px-2 py-0.5 font-medium text-blue-600">{{ durationLabel(cycle.durationSec) }} ({{ cycle.payoutPct }}%)</span>
              </div>
            </div>
            <button type="button" class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700" @click="openEditContract(item)">编辑</button>
          </div>

          <div class="grid gap-0 md:grid-cols-2">
            <div class="border-b border-slate-200 p-4 md:border-b-0 md:border-r">
              <p class="text-sm text-slate-500">交易限制</p>
              <ul class="mt-2 space-y-1 text-sm text-slate-700">
                <li><span class="font-medium">最低买入:</span> {{ Number(item.minBuy).toLocaleString() }} USDT</li>
                <li><span class="font-medium">最大买入:</span> {{ Number(item.maxBuy).toLocaleString() }} USDT</li>
                <li><span class="font-medium">最大持仓:</span> {{ Number(item.maxHold).toLocaleString() }} USDT</li>
              </ul>
            </div>
            <div class="p-4">
              <p class="text-sm text-slate-500">手续费率</p>
              <ul class="mt-2 space-y-1 text-sm text-slate-700">
                <li><span class="font-medium">买入费率:</span> {{ Number(item.buyFee).toFixed(2) }}%</li>
                <li><span class="font-medium">卖出费率:</span> {{ Number(item.sellFee).toFixed(2) }}%</li>
              </ul>
            </div>
          </div>
        </article>
      </div>

      <!-- 分页组件 -->
      <div v-if="totalPages > 1" class="border-t border-slate-200 px-6 py-4 flex items-center justify-between">
        <div class="text-sm text-slate-600">
          共 <span class="font-medium">{{ allFilteredProducts.length }}</span> 条记录，第 <span class="font-medium">{{ pagination.currentPage }}</span> / <span class="font-medium">{{ totalPages }}</span> 页
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="pagination.currentPage--"
            :disabled="pagination.currentPage === 1"
            class="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            上一页
          </button>
          <button
            type="button"
            @click="pagination.currentPage++"
            :disabled="pagination.currentPage === totalPages"
            class="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            下一页
          </button>
        </div>
      </div>
    </article>
  </section>

  <div v-if="showContractModal" class="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" @click.self="showContractModal = false">
    <section class="w-full max-w-3xl rounded-xl bg-white">
      <header class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <h2 class="text-xl font-semibold text-slate-900">{{ editingContractId ? '编辑交割合约' : '新增交割合约' }}</h2>
        <button type="button" class="text-2xl text-slate-400" @click="showContractModal = false">×</button>
      </header>

      <div class="space-y-5 px-6 py-5">
        <div class="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button type="button" class="rounded-md px-4 py-1.5 text-sm" :class="contractTab === DELIVERY_CONTRACT_TAB.BASIC ? 'bg-white font-medium text-blue-600 shadow-sm' : 'text-slate-600'" @click="contractTab = DELIVERY_CONTRACT_TAB.BASIC">基本信息</button>
          <button type="button" class="rounded-md px-4 py-1.5 text-sm" :class="contractTab === DELIVERY_CONTRACT_TAB.CYCLE ? 'bg-white font-medium text-blue-600 shadow-sm' : 'text-slate-600'" @click="contractTab = DELIVERY_CONTRACT_TAB.CYCLE">周期设置</button>
          <button type="button" class="rounded-md px-4 py-1.5 text-sm" :class="contractTab === DELIVERY_CONTRACT_TAB.LIMIT ? 'bg-white font-medium text-blue-600 shadow-sm' : 'text-slate-600'" @click="contractTab = DELIVERY_CONTRACT_TAB.LIMIT">交易限制</button>
          <button type="button" class="rounded-md px-4 py-1.5 text-sm" :class="contractTab === DELIVERY_CONTRACT_TAB.FEE ? 'bg-white font-medium text-blue-600 shadow-sm' : 'text-slate-600'" @click="contractTab = DELIVERY_CONTRACT_TAB.FEE">费率</button>
        </div>

        <div v-if="contractTab === DELIVERY_CONTRACT_TAB.BASIC" class="grid gap-4 md:grid-cols-2">
          <label class="space-y-1"><span class="text-sm">产品名称</span><input v-model="contractForm.name" type="text" class="w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
          <label class="space-y-1"><span class="text-sm">产品代码</span><input v-model="contractForm.code" type="text" class="w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
          <label class="space-y-1"><span class="text-sm">基础币种</span><select v-model="contractForm.baseCurrency" class="w-full rounded-lg border border-slate-300 px-3 py-2"><option>BTC</option><option>ETH</option></select></label>
          <label class="space-y-1"><span class="text-sm">计价币种</span><select v-model="contractForm.quoteCurrency" class="w-full rounded-lg border border-slate-300 px-3 py-2"><option>USDT</option><option>USDC</option></select></label>
          <label class="space-y-1 md:col-span-2"><span class="text-sm">产品状态</span><select v-model="contractForm.status" class="w-full max-w-[220px] rounded-lg border border-slate-300 px-3 py-2"><option :value="DELIVERY_STATUS.ENABLED">已启用</option><option :value="DELIVERY_STATUS.DISABLED">已禁用</option></select></label>
        </div>

        <div v-if="contractTab === DELIVERY_CONTRACT_TAB.CYCLE" class="space-y-4">
          <label class="block max-w-sm space-y-1"><span class="text-sm">选择周期模板</span><select v-model="contractForm.templateId" class="w-full rounded-lg border border-slate-300 px-3 py-2"><option v-for="tpl in templates" :key="tpl.id" :value="tpl.id">{{ tpl.name }}</option></select></label>
          <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p class="font-medium text-slate-800">模板详情: {{ selectedTemplate?.name || '-' }}</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <span v-for="cycle in selectedTemplateCycles" :key="cycle.id" class="rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">{{ durationLabel(cycle.durationSec) }} ({{ cycle.payoutPct }}%)</span>
            </div>
            <p class="mt-3 text-sm text-slate-500">用户可在以上周期中选择交易时长。</p>
          </div>
          <div class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            <p class="font-medium">周期模板说明</p>
            <p class="mt-1">周期越短，风控压力越高；周期越长，收益率通常更高。</p>
          </div>
        </div>

        <div v-if="contractTab === DELIVERY_CONTRACT_TAB.LIMIT" class="space-y-4">
          <div class="grid gap-3 md:grid-cols-3">
            <label class="space-y-1"><span class="text-sm">最低买入量 (USDT)</span><input v-model="contractForm.minBuy" type="number" class="w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label class="space-y-1"><span class="text-sm">最大买入量 (USDT)</span><input v-model="contractForm.maxBuy" type="number" class="w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label class="space-y-1"><span class="text-sm">最大持仓量 (USDT)</span><input v-model="contractForm.maxHold" type="number" class="w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
          </div>
          <div class="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-slate-700">
            <p class="font-medium text-slate-900">交易限制说明</p>
            <p class="mt-1">单笔交易范围: {{ Number(contractForm.minBuy).toLocaleString() }} - {{ Number(contractForm.maxBuy).toLocaleString() }} USDT</p>
            <p>最大持仓: {{ Number(contractForm.maxHold).toLocaleString() }} USDT</p>
          </div>
        </div>

        <div v-if="contractTab === DELIVERY_CONTRACT_TAB.FEE" class="space-y-4">
          <div class="grid gap-3 md:grid-cols-2">
            <label class="space-y-1"><span class="text-sm">买入费率 (%)</span><input v-model="contractForm.buyFee" type="number" step="0.01" class="w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label class="space-y-1"><span class="text-sm">卖出费率 (%)</span><input v-model="contractForm.sellFee" type="number" step="0.01" class="w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
          </div>
          <div class="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
            <p class="font-medium text-slate-900">费率说明</p>
            <p class="mt-1 text-slate-700">买入费率: {{ Number(contractForm.buyFee).toFixed(4) }}%</p>
            <p class="text-slate-700">卖出费率: {{ Number(contractForm.sellFee).toFixed(4) }}%</p>
          </div>
        </div>
      </div>

      <footer class="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
        <button type="button" class="rounded-lg border border-slate-300 px-4 py-2" @click="showContractModal = false">取消</button>
        <button type="button" class="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white" @click="saveContract">保存</button>
      </footer>
    </section>
  </div>
</template>
