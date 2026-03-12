<template>
  <div class="-m-4 md:-m-8">
    <!-- Page Header -->
    <header class="bg-white px-4 py-4 mb-6 border-b border-black/[0.06] md:px-8">
      <div class="mb-2 flex items-center gap-2 text-sm text-black/45">
        <span>首页</span>
        <span class="text-black/15">/</span>
        <span>现货管理</span>
        <span class="text-black/15">/</span>
        <span class="text-black/85">现货产品管理</span>
      </div>
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="text-xl font-semibold text-black/85">现货产品管理</h1>
          <p class="mt-2 text-sm text-black/45">管理现货交易产品、交易对及费率配置，支持产品的上下架和费率调整。</p>
        </div>
        <button type="button" class="ant-btn ant-btn-primary" @click="showAddProduct">
          + 添加产品
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <div class="px-4 pb-8 md:px-8">
      <div class="pro-card p-6">
        <!-- Filters -->
        <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="text-sm text-black/85">状态:</span>
              <select v-model="filters.status" class="ant-select !w-32">
                <option value="">全部状态</option>
                <option value="trading">交易中</option>
                <option value="suspended">暂停交易</option>
                <option value="delisted">已下架</option>
              </select>
            </div>
            <button type="button" class="ant-btn" @click="resetFilters">重置</button>
          </div>

          <div class="relative w-full max-w-sm">
            <input
              v-model="searchKeyword"
              type="text"
              class="ant-input pl-9"
              placeholder="搜索产品名称或交易对..."
            />
            <svg viewBox="0 0 20 20" class="pointer-events-none absolute left-3 top-2 h-4 w-4 text-black/25" fill="none">
              <circle cx="9" cy="9" r="5.8" stroke="currentColor" stroke-width="1.6" />
              <path d="M13.6 13.6L16.4 16.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
          </div>
        </div>

        <!-- Table-like List -->
        <div class="space-y-4">
          <div v-for="product in paginatedProducts" :key="product.productId" class="group relative overflow-hidden rounded-lg border border-black/[0.06] bg-white transition-all hover:border-antd-primary/30 hover:shadow-md">
            <div class="flex flex-wrap items-start justify-between gap-4 p-4">
              <div class="flex-1">
                <div class="flex items-center gap-3">
                  <h3 class="text-base font-medium text-black/85">{{ product.productName }}</h3>
                  <span class="text-xs text-black/45 font-mono bg-black/5 px-1.5 py-0.5 rounded">{{ product.productId }}</span>
                  <span 
                    class="relative flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full"
                    :class="{
                      'bg-emerald-50 text-emerald-600': product.status === 'trading',
                      'bg-orange-50 text-orange-600': product.status === 'suspended',
                      'bg-gray-100 text-gray-500': product.status === 'delisted'
                    }"
                  >
                    <span class="h-1.5 w-1.5 rounded-full" :class="{
                      'bg-emerald-500': product.status === 'trading',
                      'bg-orange-500': product.status === 'suspended',
                      'bg-gray-400': product.status === 'delisted'
                    }"></span>
                    {{ statusLabel(product.status) }}
                  </span>
                </div>
                <div class="mt-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-y-3 gap-x-8 text-sm">
                  <div>
                    <p class="text-black/45 text-xs mb-0.5">交易对</p>
                    <p class="text-black/85 font-medium">{{ product.baseCurrency }}/{{ product.quoteCurrency }}</p>
                  </div>
                  <div>
                    <p class="text-black/45 text-xs mb-0.5">买入费率</p>
                    <p class="text-black/85">{{ product.buyFee }}%</p>
                  </div>
                  <div>
                    <p class="text-black/45 text-xs mb-0.5">卖出费率</p>
                    <p class="text-black/85">{{ product.sellFee }}%</p>
                  </div>
                  <div>
                    <p class="text-black/45 text-xs mb-0.5">价格精度</p>
                    <p class="text-black/85">{{ product.pricePrecision }}</p>
                  </div>
                  <div>
                    <p class="text-black/45 text-xs mb-0.5">数量精度</p>
                    <p class="text-black/85">{{ product.quantityPrecision }}</p>
                  </div>
                  <div>
                    <p class="text-black/45 text-xs mb-0.5">最小交易量</p>
                    <p class="text-black/85">{{ product.minOrderQuantity }}</p>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <button 
                  type="button" 
                  class="ant-btn ant-btn-link"
                  @click="editProduct(product)"
                >
                  编辑
                </button>
                <div class="w-px h-3 bg-black/10"></div>
                <button 
                  type="button" 
                  class="ant-btn ant-btn-link"
                  :class="product.status === 'trading' ? '!text-orange-500 hover:!text-orange-600' : '!text-emerald-500 hover:!text-emerald-600'"
                  @click="toggleProductStatus(product)"
                >
                  {{ product.status === 'trading' ? '暂停' : '恢复' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="mt-6 flex justify-between items-center">
          <p class="text-sm text-black/45">
            共 <span class="text-black/85 font-medium">{{ totalItems }}</span> 条
          </p>
          <div class="flex items-center gap-2">
            <button 
              class="ant-pagination-item !m-0 disabled:opacity-30"
              @click="pagination.currentPage--"
              :disabled="pagination.currentPage <= 1"
            >&lt;</button>
            <span v-for="page in totalPages" :key="page" 
              class="ant-pagination-item !m-0"
              :class="{ 'ant-pagination-item-active': pagination.currentPage === page }"
              @click="pagination.currentPage = page"
            >
              <a class="text-inherit">{{ page }}</a>
            </span>
            <button 
              class="ant-pagination-item !m-0 disabled:opacity-30"
              @click="pagination.currentPage++"
              :disabled="pagination.currentPage >= totalPages"
            >&gt;</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Modal (Mock) -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" @click.self="closeModal">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
        <div class="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between">
          <h2 class="text-lg font-medium text-black/85">{{ isEditing ? '编辑产品' : '添加产品' }}</h2>
          <button type="button" class="text-black/45 hover:text-black/65 transition-colors" @click="closeModal">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-black/85 mb-1.5">产品名称</label>
              <input v-model="formData.productName" type="text" class="ant-input" />
            </div>
            <div>
              <label class="block text-sm text-black/85 mb-1.5">状态</label>
              <select v-model="formData.status" class="ant-select">
                <option value="trading">交易中</option>
                <option value="suspended">暂停交易</option>
                <option value="delisted">已下架</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-black/85 mb-1.5">基础币种</label>
              <input v-model="formData.baseCurrency" type="text" class="ant-input" />
            </div>
            <div>
              <label class="block text-sm text-black/85 mb-1.5">计价币种</label>
              <input v-model="formData.quoteCurrency" type="text" class="ant-input" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-black/85 mb-1.5">买入费率 (%)</label>
              <input v-model.number="formData.buyFee" type="number" step="0.001" class="ant-input" />
            </div>
            <div>
              <label class="block text-sm text-black/85 mb-1.5">卖出费率 (%)</label>
              <input v-model.number="formData.sellFee" type="number" step="0.001" class="ant-input" />
            </div>
          </div>
        </div>
        <div class="px-6 py-4 bg-gray-50 border-t border-black/[0.06] flex justify-end gap-2">
          <button type="button" class="ant-btn" @click="closeModal">取消</button>
          <button type="button" class="ant-btn ant-btn-primary" @click="saveProduct">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { mockSpotProducts } from '../../mock/spot'

const products = ref([])
const showModal = ref(false)
const isEditing = ref(false)
const editingProductId = ref(null)
const searchKeyword = ref('')
const activeTab = ref('basic')

const filters = ref({
  status: ''
})

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 5
})

const formData = ref({
  productName: '',
  baseCurrency: '',
  quoteCurrency: '',
  pricePrecision: 2,
  quantityPrecision: 6,
  minOrderQuantity: 0.00001,
  minOrderValue: 10,
  maxOrderValue: 1000000,
  buyFee: 0.1,
  sellFee: 0.1,
  status: 'trading',
  volume24h: 0,
  priceChange24h: 0,
  bidDepth: 0,
  askDepth: 0
})

onMounted(() => {
  products.value = mockSpotProducts
})

// 监听筛选和搜索变化，重置分页
watch([filters, searchKeyword], () => {
  pagination.value.currentPage = 1
}, { deep: true })

const filteredProducts = computed(() => {
  let result = products.value

  if (filters.value.status) {
    result = result.filter(p => p.status === filters.value.status)
  }
  
  // 搜索关键词过滤
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (keyword) {
    result = result.filter(p => 
      p.productName.toLowerCase().includes(keyword) ||
      p.productId.toLowerCase().includes(keyword) ||
      p.baseCurrency.toLowerCase().includes(keyword) ||
      p.quoteCurrency.toLowerCase().includes(keyword)
    )
  }
  
  return result
})

const totalItems = computed(() => filteredProducts.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / pagination.value.pageSize))

const paginatedProducts = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredProducts.value.slice(start, end)
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value)
}

const formatVolume = (value) => {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(2) + 'B'
  }
  if (value >= 1000000) {
    return (value / 1000000).toFixed(2) + 'M'
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(2) + 'K'
  }
  return value.toFixed(2)
}

const statusLabel = (status) => {
  const labels = {
    trading: '交易中',
    suspended: '暂停交易',
    delisted: '已下架'
  }
  return labels[status] || status
}

const resetFilters = () => {
  filters.value = {
    status: ''
  }
}

const resetFormData = () => {
  formData.value = {
    productName: '',
    baseCurrency: '',
    quoteCurrency: '',
    pricePrecision: 2,
    quantityPrecision: 6,
    minOrderQuantity: 0.00001,
    minOrderValue: 10,
    maxOrderValue: 1000000,
    buyFee: 0.1,
    sellFee: 0.1,
    status: 'trading',
    volume24h: 0,
    priceChange24h: 0,
    bidDepth: 0,
    askDepth: 0
  }
}

const showAddProduct = () => {
  isEditing.value = false
  editingProductId.value = null
  resetFormData()
  activeTab.value = 'basic'
  showModal.value = true
}

const editProduct = (product) => {
  isEditing.value = true
  editingProductId.value = product.productId
  formData.value = {
    productName: product.productName,
    baseCurrency: product.baseCurrency,
    quoteCurrency: product.quoteCurrency,
    pricePrecision: product.pricePrecision,
    quantityPrecision: product.quantityPrecision,
    minOrderQuantity: product.minOrderQuantity,
    minOrderValue: product.minOrderValue,
    maxOrderValue: product.maxOrderValue,
    buyFee: product.buyFee,
    sellFee: product.sellFee,
    status: product.status,
    volume24h: product.volume24h,
    priceChange24h: product.priceChange24h,
    bidDepth: product.bidDepth,
    askDepth: product.askDepth
  }
  activeTab.value = 'basic'
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  activeTab.value = 'basic'
  resetFormData()
}

const saveProduct = () => {
  // 表单验证
  if (!formData.value.productName) {
    alert('请输入产品名称')
    return
  }
  if (!formData.value.baseCurrency || !formData.value.quoteCurrency) {
    alert('请选择基础币种和计价币种')
    return
  }
  if (formData.value.minOrderValue >= formData.value.maxOrderValue) {
    alert('最大订单金额必须大于最小订单金额')
    return
  }
  if (formData.value.buyFee < 0 || formData.value.sellFee < 0) {
    alert('费率不能为负数')
    return
  }

  if (isEditing.value) {
    // 编辑产品
    const index = products.value.findIndex(p => p.productId === editingProductId.value)
    if (index !== -1) {
      products.value[index] = {
        ...products.value[index],
        ...formData.value
      }
      alert('产品修改成功')
    }
  } else {
    // 新增产品
    const newProduct = {
      productId: `SPOT${String(products.value.length + 1).padStart(3, '0')}`,
      ...formData.value,
      volume24h: Math.random() * 10000000,
      priceChange24h: (Math.random() - 0.5) * 20,
      bidDepth: Math.random() * 1000000,
      askDepth: Math.random() * 1000000
    }
    products.value.unshift(newProduct)
    alert('产品创建成功')
  }

  closeModal()
}

const toggleProductStatus = (product) => {
  const index = products.value.findIndex(p => p.productId === product.productId)
  if (index !== -1) {
    const newStatus = products.value[index].status === 'trading' ? 'suspended' : 'trading'
    products.value[index].status = newStatus
  }
}
</script>
