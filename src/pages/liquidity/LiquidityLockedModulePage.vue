<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import MfaVerificationModal from '../../components/MfaVerificationModal.vue'
import {
  ADJUSTMENT_STATUS,
  ADJUSTMENT_TYPE,
  adjustmentStatusMeta,
  adjustmentTypeMeta,
  ALERT_LEVEL,
  alertLevelMeta,
  COMMON_FILTER_ALL,
  LOCKED_SECTION,
  ORDER_STATUS,
  orderStatusMeta,
  PRODUCT_STATUS,
  productStatusMeta,
  PURCHASE_LIMIT_TYPE,
  SUPPORTED_CURRENCIES
} from '../../constants/liquidityLocked'
import {
  createLockedAdjustmentsMock,
  createLockedAlertsMock,
  createLockedOrdersMock,
  createLockedProductsMock,
  createLockedRulesMock
} from '../../mock/liquidityLocked'

const route = useRoute()

const products = ref(createLockedProductsMock())
const orders = ref(createLockedOrdersMock())
const adjustments = ref(createLockedAdjustmentsMock())
const alerts = ref(createLockedAlertsMock())
const rules = ref(createLockedRulesMock())

const section = computed(() => String(route.meta.section || LOCKED_SECTION.PRODUCTS))

// 通用搜索和筛选
const search = ref('')
const statusFilter = ref(COMMON_FILTER_ALL)

// ========== 产品管理 ==========
const showProductModal = ref(false)
const editingProductId = ref('')
const showMfaModal = ref(false)
const pendingSaveData = ref(null)
const mfaLoading = ref(false)

const productForm = reactive({
  name: '',
  currency: 'USDT',
  periods: [],
  earlyRedeemEnabled: true,
  earlyRedeemFee: 4,
  purchaseLimitType: PURCHASE_LIMIT_TYPE.LIFETIME,
  lifetimeLimit: 50000,
  periodLimit: 10000,
  periodDays: 30,
  status: PRODUCT_STATUS.ENABLED
})

const openCreateProduct = () => {
  editingProductId.value = ''
  productForm.name = ''
  productForm.currency = 'USDT'
  productForm.periods = [{ days: 10, dailyRate: 0.3, minAmount: 100, maxAmount: 5000 }]
  productForm.earlyRedeemEnabled = true
  productForm.earlyRedeemFee = 4
  productForm.purchaseLimitType = PURCHASE_LIMIT_TYPE.LIFETIME
  productForm.lifetimeLimit = 50000
  productForm.periodLimit = 10000
  productForm.periodDays = 30
  productForm.status = PRODUCT_STATUS.ENABLED
  showProductModal.value = true
}

const openEditProduct = (product) => {
  editingProductId.value = product.id
  productForm.name = product.name
  productForm.currency = product.currency
  productForm.periods = product.periods.map(p => ({ ...p }))
  productForm.earlyRedeemEnabled = product.earlyRedeemEnabled
  productForm.earlyRedeemFee = product.earlyRedeemFee
  productForm.purchaseLimitType = product.purchaseLimitType
  productForm.lifetimeLimit = product.lifetimeLimit
  productForm.periodLimit = product.periodLimit
  productForm.periodDays = product.periodDays
  productForm.status = product.status
  showProductModal.value = true
}

const addPeriod = () => {
  productForm.periods.push({ days: 10, dailyRate: 0.3, minAmount: 100, maxAmount: 5000 })
}

const removePeriod = (index) => {
  productForm.periods.splice(index, 1)
}

const saveProduct = () => {
  const payload = {
    name: productForm.name.trim(),
    currency: productForm.currency,
    icon: productForm.currency === 'USDT' ? '₮' : productForm.currency === 'BTC' ? '₿' : productForm.currency === 'ETH' ? 'Ξ' : productForm.currency,
    periods: productForm.periods.map(p => ({ ...p, dailyRate: Number(p.dailyRate), minAmount: Number(p.minAmount), maxAmount: Number(p.maxAmount) })),
    earlyRedeemEnabled: productForm.earlyRedeemEnabled,
    earlyRedeemFee: Number(productForm.earlyRedeemFee),
    purchaseLimitType: productForm.purchaseLimitType,
    lifetimeLimit: Number(productForm.lifetimeLimit),
    periodLimit: Number(productForm.periodLimit),
    periodDays: Number(productForm.periodDays),
    status: productForm.status
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
      if (editingProductId.value) {
        products.value = products.value.map(p => p.id === editingProductId.value ? { ...p, ...pendingSaveData.value } : p)
      } else {
        products.value.unshift({ id: `prod-${Date.now()}`, ...pendingSaveData.value, totalLocked: 0, totalOrders: 0, createdAt: new Date().toISOString().split('T')[0] })
      }
      
      showProductModal.value = false
      pendingSaveData.value = null
      showMfaModal.value = false
      alert('产品保存成功！')
    }
  } catch (error) {
    alert('MFA 验证失败：' + (error.message || '请稍后重试'))
  } finally {
    mfaLoading.value = false
  }
}

const filteredProducts = computed(() => {
  const kw = search.value.trim().toLowerCase()
  return products.value.filter(p => {
    const matchStatus = statusFilter.value === COMMON_FILTER_ALL || p.status === statusFilter.value
    const matchKeyword = !kw || `${p.name} ${p.currency}`.toLowerCase().includes(kw)
    return matchStatus && matchKeyword
  })
})

// ========== 订单管理 ==========
const filteredOrders = computed(() => {
  const kw = search.value.trim().toLowerCase()
  return orders.value.filter(o => {
    const matchStatus = statusFilter.value === COMMON_FILTER_ALL || o.status === statusFilter.value
    const matchKeyword = !kw || `${o.id} ${o.userName} ${o.productName} ${o.currency}`.toLowerCase().includes(kw)
    return matchStatus && matchKeyword
  })
})

// ========== 手工调整 ==========
const showAdjustmentModal = ref(false)
const adjustmentForm = reactive({
  orderId: '',
  type: ADJUSTMENT_TYPE.ADD_INTEREST,
  amount: 0,
  reason: ''
})

const openCreateAdjustment = () => {
  adjustmentForm.orderId = ''
  adjustmentForm.type = ADJUSTMENT_TYPE.ADD_INTEREST
  adjustmentForm.amount = 0
  adjustmentForm.reason = ''
  showAdjustmentModal.value = true
}

const saveAdjustment = () => {
  const order = orders.value.find(o => o.id === adjustmentForm.orderId)
  if (!order) return

  adjustments.value.unshift({
    id: `adj-${Date.now()}`,
    orderId: adjustmentForm.orderId,
    userId: order.userId,
    userName: order.userName,
    type: adjustmentForm.type,
    amount: Number(adjustmentForm.amount),
    currency: order.currency,
    reason: adjustmentForm.reason.trim(),
    status: ADJUSTMENT_STATUS.PENDING,
    requestedBy: 'admin@platform.com',
    requestedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    executedAt: null
  })

  showAdjustmentModal.value = false
}

const approveAdjustment = (id) => {
  adjustments.value = adjustments.value.map(a => 
    a.id === id ? { ...a, status: ADJUSTMENT_STATUS.APPROVED } : a
  )
}

const executeAdjustment = (id) => {
  adjustments.value = adjustments.value.map(a => 
    a.id === id ? { ...a, status: ADJUSTMENT_STATUS.EXECUTED, executedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) } : a
  )
}

const rejectAdjustment = (id) => {
  adjustments.value = adjustments.value.map(a => 
    a.id === id ? { ...a, status: ADJUSTMENT_STATUS.REJECTED } : a
  )
}

const filteredAdjustments = computed(() => {
  const kw = search.value.trim().toLowerCase()
  return adjustments.value.filter(a => {
    const matchStatus = statusFilter.value === COMMON_FILTER_ALL || a.status === statusFilter.value
    const matchKeyword = !kw || `${a.orderId} ${a.userName}`.toLowerCase().includes(kw)
    return matchStatus && matchKeyword
  })
})

// ========== 到期预警 ==========
const filteredAlerts = computed(() => {
  const levelFilter = statusFilter.value
  const kw = search.value.trim().toLowerCase()
  return alerts.value.filter(a => {
    const matchLevel = levelFilter === COMMON_FILTER_ALL || a.level === levelFilter
    const matchKeyword = !kw || `${a.orderId} ${a.userName} ${a.currency}`.toLowerCase().includes(kw)
    return matchLevel && matchKeyword
  })
})

// ========== 工具函数 ==========
const fmtNumber = (val, decimals = 2) => Number(val).toFixed(decimals)
const fmtCurrency = (val, currency, decimals = 2) => {
  if (currency === 'BTC' || currency === 'ETH') return `${fmtNumber(val, decimals === 2 ? 4 : decimals)} ${currency}`
  return `${Number(val).toLocaleString()} ${currency}`
}
</script>

<template>
  <section class="space-y-4">
    <!-- 产品管理 -->
    <template v-if="section === LOCKED_SECTION.PRODUCTS">
      <header class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="text-3xl font-semibold text-slate-900">产品管理</h1>
          <p class="mt-1 text-sm text-slate-500">配置锁仓产品、阶梯收益与限购策略</p>
        </div>
        <button type="button" class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700" @click="openCreateProduct">+ 新增产品</button>
      </header>

      <article class="rounded-xl border border-slate-200 bg-white">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
          <div class="inline-flex items-center gap-3 text-sm">
            <button type="button" class="font-medium" :class="statusFilter === COMMON_FILTER_ALL ? 'text-blue-600' : 'text-slate-500'" @click="statusFilter = COMMON_FILTER_ALL">全部</button>
            <button type="button" class="font-medium" :class="statusFilter === PRODUCT_STATUS.ENABLED ? 'text-blue-600' : 'text-slate-500'" @click="statusFilter = PRODUCT_STATUS.ENABLED">上架中</button>
            <button type="button" class="font-medium" :class="statusFilter === PRODUCT_STATUS.DISABLED ? 'text-blue-600' : 'text-slate-500'" @click="statusFilter = PRODUCT_STATUS.DISABLED">已下架</button>
            <button type="button" class="font-medium" :class="statusFilter === PRODUCT_STATUS.SOLD_OUT ? 'text-blue-600' : 'text-slate-500'" @click="statusFilter = PRODUCT_STATUS.SOLD_OUT">已售罄</button>
          </div>
          <input v-model="search" type="text" placeholder="搜索产品名称或币种..." class="w-full max-w-sm rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500" />
        </div>

        <div class="space-y-3 p-4">
          <article v-for="product in filteredProducts" :key="product.id" class="rounded-xl border border-slate-200 bg-white p-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="flex items-start gap-3">
                <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-2xl">{{ product.icon }}</div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-lg font-semibold text-slate-900">{{ product.name }}</h3>
                    <span class="rounded-md px-2 py-0.5 text-xs font-medium" :class="productStatusMeta[product.status].class">{{ productStatusMeta[product.status].label }}</span>
                  </div>
                  <p class="mt-0.5 text-sm text-slate-500">{{ product.currency }} · {{ product.periods.length }} 个周期可选</p>
                  <div class="mt-2 flex flex-wrap gap-1.5">
                    <span v-for="(period, idx) in product.periods" :key="idx" class="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      {{ period.days }}天 ({{ period.dailyRate.toFixed(4) }}%)
                    </span>
                  </div>
                </div>
              </div>
              <button type="button" class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50" @click="openEditProduct(product)">编辑</button>
            </div>

            <div class="mt-3 grid gap-3 md:grid-cols-4">
              <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p class="text-xs text-slate-500">总锁仓</p>
                <p class="mt-1 font-semibold text-slate-900">{{ fmtCurrency(product.totalLocked, product.currency) }}</p>
              </div>
              <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p class="text-xs text-slate-500">订单数</p>
                <p class="mt-1 font-semibold text-slate-900">{{ product.totalOrders }}</p>
              </div>
              <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p class="text-xs text-slate-500">提前赎回</p>
                <p class="mt-1 font-semibold" :class="product.earlyRedeemEnabled ? 'text-amber-600' : 'text-slate-500'">{{ product.earlyRedeemEnabled ? `${product.earlyRedeemFee}% 违约金` : '不支持' }}</p>
              </div>
              <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p class="text-xs text-slate-500">限购策略</p>
                <p class="mt-1 text-xs font-medium text-slate-700">
                  <span v-if="product.purchaseLimitType === PURCHASE_LIMIT_TYPE.LIFETIME">终身 {{ fmtCurrency(product.lifetimeLimit, product.currency) }}</span>
                  <span v-else-if="product.purchaseLimitType === PURCHASE_LIMIT_TYPE.PERIOD">{{ product.periodDays }}天 {{ fmtCurrency(product.periodLimit, product.currency) }}</span>
                  <span v-else>不限购</span>
                </p>
              </div>
            </div>
          </article>
        </div>
      </article>
    </template>

    <!-- 订单管理 -->
    <template v-else-if="section === LOCKED_SECTION.ORDERS">
      <header>
        <h1 class="text-3xl font-semibold text-slate-900">订单管理</h1>
        <p class="mt-1 text-sm text-slate-500">审查锁仓订单状态与收益兑现节奏</p>
      </header>

      <article class="rounded-xl border border-slate-200 bg-white">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
          <div class="inline-flex items-center gap-3 text-sm">
            <button type="button" class="font-medium" :class="statusFilter === COMMON_FILTER_ALL ? 'text-blue-600' : 'text-slate-500'" @click="statusFilter = COMMON_FILTER_ALL">全部</button>
            <button type="button" class="font-medium" :class="statusFilter === ORDER_STATUS.LOCKED ? 'text-blue-600' : 'text-slate-500'" @click="statusFilter = ORDER_STATUS.LOCKED">锁定中</button>
            <button type="button" class="font-medium" :class="statusFilter === ORDER_STATUS.COMPLETED ? 'text-blue-600' : 'text-slate-500'" @click="statusFilter = ORDER_STATUS.COMPLETED">已完成</button>
            <button type="button" class="font-medium" :class="statusFilter === ORDER_STATUS.EARLY_REDEEMED ? 'text-blue-600' : 'text-slate-500'" @click="statusFilter = ORDER_STATUS.EARLY_REDEEMED">提前赎回</button>
          </div>
          <input v-model="search" type="text" placeholder="搜索订单ID、用户名..." class="w-full max-w-sm rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500" />
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-500">
              <tr>
                <th class="px-4 py-3 text-left font-medium">订单ID</th>
                <th class="px-4 py-3 text-left font-medium">用户</th>
                <th class="px-4 py-3 text-left font-medium">产品</th>
                <th class="px-4 py-3 text-left font-medium">金额</th>
                <th class="px-4 py-3 text-left font-medium">周期</th>
                <th class="px-4 py-3 text-left font-medium">日利率</th>
                <th class="px-4 py-3 text-left font-medium">预计收益</th>
                <th class="px-4 py-3 text-left font-medium">状态</th>
                <th class="px-4 py-3 text-left font-medium">剩余天数</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in filteredOrders" :key="order.id" class="border-t border-slate-100">
                <td class="px-4 py-3 font-mono text-xs text-slate-600">{{ order.id }}</td>
                <td class="px-4 py-3 text-slate-700">{{ order.userName }}</td>
                <td class="px-4 py-3 text-slate-700">{{ order.productName }}</td>
                <td class="px-4 py-3 font-medium text-slate-900">{{ fmtCurrency(order.amount, order.currency) }}</td>
                <td class="px-4 py-3 text-slate-700">{{ order.lockDays }} 天</td>
                <td class="px-4 py-3 font-medium text-emerald-600">{{ order.dailyRate.toFixed(4) }}%</td>
                <td class="px-4 py-3 font-medium text-blue-600">{{ fmtCurrency(order.totalInterest, order.currency) }}</td>
                <td class="px-4 py-3"><span class="rounded-md px-2 py-0.5 text-xs font-medium" :class="orderStatusMeta[order.status].class">{{ orderStatusMeta[order.status].label }}</span></td>
                <td class="px-4 py-3 text-slate-700">{{ order.daysRemaining > 0 ? `${order.daysRemaining} 天` : '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </template>

    <!-- 手工调整 -->
    <template v-else-if="section === LOCKED_SECTION.ADJUSTMENTS">
      <header class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="text-3xl font-semibold text-slate-900">手工调整</h1>
          <p class="mt-1 text-sm text-slate-500">处理补息、扣息、展期与提前赎回</p>
        </div>
        <button type="button" class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700" @click="openCreateAdjustment">+ 新建调整</button>
      </header>

      <article class="rounded-xl border border-slate-200 bg-white">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
          <div class="inline-flex items-center gap-3 text-sm">
            <button type="button" class="font-medium" :class="statusFilter === COMMON_FILTER_ALL ? 'text-blue-600' : 'text-slate-500'" @click="statusFilter = COMMON_FILTER_ALL">全部</button>
            <button type="button" class="font-medium" :class="statusFilter === ADJUSTMENT_STATUS.PENDING ? 'text-blue-600' : 'text-slate-500'" @click="statusFilter = ADJUSTMENT_STATUS.PENDING">待处理</button>
            <button type="button" class="font-medium" :class="statusFilter === ADJUSTMENT_STATUS.APPROVED ? 'text-blue-600' : 'text-slate-500'" @click="statusFilter = ADJUSTMENT_STATUS.APPROVED">已批准</button>
            <button type="button" class="font-medium" :class="statusFilter === ADJUSTMENT_STATUS.EXECUTED ? 'text-blue-600' : 'text-slate-500'" @click="statusFilter = ADJUSTMENT_STATUS.EXECUTED">已执行</button>
          </div>
          <input v-model="search" type="text" placeholder="搜索订单ID、用户名..." class="w-full max-w-sm rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500" />
        </div>

        <div class="space-y-3 p-4">
          <article v-for="adj in filteredAdjustments" :key="adj.id" class="rounded-xl border border-slate-200 bg-white p-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="rounded-md px-2 py-0.5 text-xs font-medium" :class="adjustmentTypeMeta[adj.type].class">{{ adjustmentTypeMeta[adj.type].label }}</span>
                  <span class="rounded-md px-2 py-0.5 text-xs font-medium" :class="adjustmentStatusMeta[adj.status].class">{{ adjustmentStatusMeta[adj.status].label }}</span>
                  <span class="text-sm text-slate-500">{{ adj.requestedAt }}</span>
                </div>
                <div class="mt-2 text-sm text-slate-700">
                  <p><span class="font-medium">订单:</span> {{ adj.orderId }} · <span class="font-medium">用户:</span> {{ adj.userName }}</p>
                  <p class="mt-1"><span class="font-medium">金额:</span> {{ fmtCurrency(adj.amount, adj.currency) }}</p>
                  <p class="mt-1"><span class="font-medium">原因:</span> {{ adj.reason }}</p>
                  <p class="mt-1 text-xs text-slate-500">操作人: {{ adj.requestedBy }}</p>
                </div>
              </div>
              <div v-if="adj.status === ADJUSTMENT_STATUS.PENDING" class="flex gap-2">
                <button type="button" class="rounded-lg border border-emerald-500 px-3 py-1.5 text-sm text-emerald-600 hover:bg-emerald-50" @click="approveAdjustment(adj.id)">批准</button>
                <button type="button" class="rounded-lg border border-rose-500 px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50" @click="rejectAdjustment(adj.id)">拒绝</button>
              </div>
              <div v-else-if="adj.status === ADJUSTMENT_STATUS.APPROVED" class="flex gap-2">
                <button type="button" class="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700" @click="executeAdjustment(adj.id)">执行</button>
              </div>
            </div>
          </article>
        </div>
      </article>
    </template>

    <!-- 到期预警 -->
    <template v-else-if="section === LOCKED_SECTION.ALERTS">
      <header>
        <h1 class="text-3xl font-semibold text-slate-900">到期预警</h1>
        <p class="mt-1 text-sm text-slate-500">预警即将到期的锁仓订单与资金回流压力</p>
      </header>

      <article class="rounded-xl border border-slate-200 bg-white">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
          <div class="inline-flex items-center gap-3 text-sm">
            <button type="button" class="font-medium" :class="statusFilter === COMMON_FILTER_ALL ? 'text-blue-600' : 'text-slate-500'" @click="statusFilter = COMMON_FILTER_ALL">全部</button>
            <button type="button" class="font-medium" :class="statusFilter === ALERT_LEVEL.URGENT ? 'text-blue-600' : 'text-slate-500'" @click="statusFilter = ALERT_LEVEL.URGENT">紧急</button>
            <button type="button" class="font-medium" :class="statusFilter === ALERT_LEVEL.WARNING ? 'text-blue-600' : 'text-slate-500'" @click="statusFilter = ALERT_LEVEL.WARNING">警告</button>
            <button type="button" class="font-medium" :class="statusFilter === ALERT_LEVEL.INFO ? 'text-blue-600' : 'text-slate-500'" @click="statusFilter = ALERT_LEVEL.INFO">信息</button>
          </div>
          <input v-model="search" type="text" placeholder="搜索订单ID、用户名..." class="w-full max-w-sm rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500" />
        </div>

        <div class="space-y-3 p-4">
          <article v-for="alert in filteredAlerts" :key="alert.id" class="rounded-xl border p-4" :class="alert.level === ALERT_LEVEL.URGENT ? 'border-rose-200 bg-rose-50' : alert.level === ALERT_LEVEL.WARNING ? 'border-amber-200 bg-amber-50' : 'border-blue-200 bg-blue-50'">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="rounded-md px-2 py-0.5 text-xs font-medium" :class="alertLevelMeta[alert.level].class">{{ alertLevelMeta[alert.level].label }}</span>
                  <span class="text-sm text-slate-600">剩余 {{ alert.hoursRemaining }} 小时</span>
                </div>
                <div class="mt-2 text-sm">
                  <p><span class="font-medium">订单:</span> {{ alert.orderId }} · <span class="font-medium">用户:</span> {{ alert.userName }}</p>
                  <p class="mt-1"><span class="font-medium">本金:</span> {{ fmtCurrency(alert.amount, alert.currency) }} · <span class="font-medium">利息:</span> {{ fmtCurrency(alert.interest, alert.currency) }}</p>
                  <p class="mt-1 text-slate-600">到期时间: {{ alert.unlockAt }}</p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </article>
    </template>

    <!-- 规则说明 -->
    <template v-else>
      <header>
        <h1 class="text-3xl font-semibold text-slate-900">规则说明</h1>
        <p class="mt-1 text-sm text-slate-500">展示锁仓版收益、赎回、限购与资金用途规则</p>
      </header>

      <article class="space-y-4">
        <div class="rounded-xl border border-slate-200 bg-white p-5">
          <h2 class="text-lg font-semibold text-slate-900">产品定位</h2>
          <p class="mt-2 text-sm leading-relaxed text-slate-700">{{ rules.positioning.description }}</p>
          <p class="mt-2 text-sm leading-relaxed text-slate-600">{{ rules.positioning.note }}</p>
          <div class="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p class="text-sm font-medium text-blue-900">资金用途说明</p>
            <ul class="mt-2 space-y-1 text-sm text-blue-800">
              <li v-for="item in rules.positioning.capitalUsage" :key="item">• {{ item }}</li>
            </ul>
          </div>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-5">
          <h2 class="text-lg font-semibold text-slate-900">提前赎回规则</h2>
          <div class="mt-3 grid gap-3 md:grid-cols-3">
            <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p class="text-sm text-slate-500">提前赎回开关</p>
              <p class="mt-1 font-semibold">{{ rules.earlyRedeem.enabled ? '开启' : '关闭' }}</p>
            </div>
            <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p class="text-sm text-slate-500">违约金比例</p>
              <p class="mt-1 font-semibold text-rose-600">{{ rules.earlyRedeem.feePct }}%</p>
            </div>
            <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p class="text-sm text-slate-500">最短持有</p>
              <p class="mt-1 font-semibold">{{ rules.earlyRedeem.minHoldDays }} 天</p>
            </div>
          </div>
          <p class="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">{{ rules.earlyRedeem.note }}</p>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-5">
          <h2 class="text-lg font-semibold text-slate-900">限购策略（赔付控制核心）</h2>
          <div class="mt-3 grid gap-3 md:grid-cols-3">
            <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p class="text-sm text-slate-500">终身限购</p>
              <p class="mt-1 font-semibold">{{ rules.purchaseLimit.lifetimeEnabled ? `${rules.purchaseLimit.lifetimeAmount.toLocaleString()} USDT` : '关闭' }}</p>
            </div>
            <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p class="text-sm text-slate-500">周期限购</p>
              <p class="mt-1 font-semibold">{{ rules.purchaseLimit.cycleEnabled ? `${rules.purchaseLimit.cycleDays} 天 / ${rules.purchaseLimit.cycleAmount.toLocaleString()} USDT` : '关闭' }}</p>
            </div>
            <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p class="text-sm text-slate-500">风险分层限额</p>
              <p class="mt-1 font-semibold">{{ rules.purchaseLimit.userRiskCapEnabled ? '开启' : '关闭' }}</p>
            </div>
          </div>
          <div class="mt-3 overflow-x-auto rounded-lg border border-slate-200">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-slate-500">
                <tr>
                  <th class="px-3 py-2 text-left font-medium">用户层级</th>
                  <th class="px-3 py-2 text-left font-medium">限购上限</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in rules.purchaseLimit.riskCaps" :key="item.level" class="border-t border-slate-100">
                  <td class="px-3 py-2">{{ item.level }}</td>
                  <td class="px-3 py-2 font-medium">{{ item.maxAmount.toLocaleString() }} USDT</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-5">
          <h2 class="text-lg font-semibold text-slate-900">风险预警与运营监控</h2>
          <div class="mt-3 grid gap-3 md:grid-cols-3">
            <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p class="text-sm text-slate-500">赔付预警</p>
              <p class="mt-1 font-semibold">{{ rules.riskAlert.payoutWarningEnabled ? `超过 ${rules.riskAlert.payoutWarningAmount.toLocaleString()} USDT 告警` : '关闭' }}</p>
            </div>
            <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p class="text-sm text-slate-500">流动性预警</p>
              <p class="mt-1 font-semibold">{{ rules.riskAlert.liquidityWarningEnabled ? `占用率 > ${rules.riskAlert.liquidityWarningRatio}%` : '关闭' }}</p>
            </div>
            <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p class="text-sm text-slate-500">到期集中预警</p>
              <p class="mt-1 font-semibold">{{ rules.riskAlert.maturityWarningEnabled ? `${rules.riskAlert.maturityWindowHours} 小时窗口` : '关闭' }}</p>
            </div>
          </div>
        </div>
      </article>
    </template>

    <!-- 产品编辑弹窗 -->
    <div v-if="showProductModal" class="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" @click.self="showProductModal = false">
      <section class="w-full max-w-2xl rounded-xl bg-white">
        <header class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 class="text-xl font-semibold text-slate-900">{{ editingProductId ? '编辑产品' : '新增产品' }}</h2>
          <button type="button" class="text-2xl text-slate-400" @click="showProductModal = false">×</button>
        </header>

        <div class="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-4">
          <div class="grid gap-3 md:grid-cols-2">
            <label class="space-y-1">
              <span class="text-sm font-medium">产品名称</span>
              <input v-model="productForm.name" type="text" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>
            <label class="space-y-1">
              <span class="text-sm font-medium">币种</span>
              <select v-model="productForm.currency" class="w-full rounded-lg border border-slate-300 px-3 py-2">
                <option v-for="curr in SUPPORTED_CURRENCIES" :key="curr" :value="curr">{{ curr }}</option>
              </select>
            </label>
          </div>

          <div class="rounded-lg border border-slate-200 p-3">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium">锁仓周期配置</p>
              <button type="button" class="rounded-md bg-blue-600 px-3 py-1 text-sm text-white" @click="addPeriod">+ 添加周期</button>
            </div>
            <div class="mt-3 space-y-2">
              <div v-for="(period, idx) in productForm.periods" :key="idx" class="flex gap-2">
                <input v-model.number="period.days" type="number" placeholder="天数" class="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm" />
                <input v-model.number="period.dailyRate" type="number" step="0.0001" placeholder="日利率%" class="w-24 rounded-lg border border-slate-300 px-2 py-1 text-sm" />
                <input v-model.number="period.minAmount" type="number" placeholder="最小金额" class="flex-1 rounded-lg border border-slate-300 px-2 py-1 text-sm" />
                <input v-model.number="period.maxAmount" type="number" placeholder="最大金额" class="flex-1 rounded-lg border border-slate-300 px-2 py-1 text-sm" />
                <button type="button" class="rounded-md border border-rose-300 px-2 text-rose-600" @click="removePeriod(idx)">×</button>
              </div>
            </div>
          </div>

          <div class="grid gap-3 md:grid-cols-2">
            <label class="inline-flex items-center gap-2">
              <input v-model="productForm.earlyRedeemEnabled" type="checkbox" class="h-4 w-4" />
              <span class="text-sm">启用提前赎回</span>
            </label>
            <label v-if="productForm.earlyRedeemEnabled" class="space-y-1">
              <span class="text-sm font-medium">违约金比例 (%)</span>
              <input v-model.number="productForm.earlyRedeemFee" type="number" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>
          </div>

          <div class="space-y-2">
            <label class="space-y-1">
              <span class="text-sm font-medium">限购类型</span>
              <select v-model="productForm.purchaseLimitType" class="w-full rounded-lg border border-slate-300 px-3 py-2">
                <option :value="PURCHASE_LIMIT_TYPE.NONE">不限购</option>
                <option :value="PURCHASE_LIMIT_TYPE.LIFETIME">终身限购</option>
                <option :value="PURCHASE_LIMIT_TYPE.PERIOD">周期限购</option>
              </select>
            </label>
            <div v-if="productForm.purchaseLimitType === PURCHASE_LIMIT_TYPE.LIFETIME" class="grid gap-3 md:grid-cols-1">
              <label class="space-y-1">
                <span class="text-sm font-medium">终身限购额度</span>
                <input v-model.number="productForm.lifetimeLimit" type="number" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
            </div>
            <div v-if="productForm.purchaseLimitType === PURCHASE_LIMIT_TYPE.PERIOD" class="grid gap-3 md:grid-cols-2">
              <label class="space-y-1">
                <span class="text-sm font-medium">周期天数</span>
                <input v-model.number="productForm.periodDays" type="number" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label class="space-y-1">
                <span class="text-sm font-medium">周期限购额度</span>
                <input v-model.number="productForm.periodLimit" type="number" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
            </div>
          </div>

          <label class="space-y-1">
            <span class="text-sm font-medium">产品状态</span>
            <select v-model="productForm.status" class="w-full rounded-lg border border-slate-300 px-3 py-2">
              <option :value="PRODUCT_STATUS.ENABLED">上架中</option>
              <option :value="PRODUCT_STATUS.DISABLED">已下架</option>
              <option :value="PRODUCT_STATUS.SOLD_OUT">已售罄</option>
            </select>
          </label>
        </div>

        <footer class="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
          <button type="button" class="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700" @click="showProductModal = false">取消</button>
          <button type="button" class="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white" @click="saveProduct">保存</button>
        </footer>
      </section>
    </div>

    <!-- 调整申请弹窗 -->
    <div v-if="showAdjustmentModal" class="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" @click.self="showAdjustmentModal = false">
      <section class="w-full max-w-md rounded-xl bg-white">
        <header class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 class="text-xl font-semibold text-slate-900">新建调整</h2>
          <button type="button" class="text-2xl text-slate-400" @click="showAdjustmentModal = false">×</button>
        </header>

        <div class="space-y-4 px-5 py-4">
          <label class="space-y-1">
            <span class="text-sm font-medium">订单ID</span>
            <input v-model="adjustmentForm.orderId" type="text" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>

          <label class="space-y-1">
            <span class="text-sm font-medium">调整类型</span>
            <select v-model="adjustmentForm.type" class="w-full rounded-lg border border-slate-300 px-3 py-2">
              <option :value="ADJUSTMENT_TYPE.ADD_INTEREST">补息</option>
              <option :value="ADJUSTMENT_TYPE.DEDUCT_INTEREST">扣息</option>
              <option :value="ADJUSTMENT_TYPE.EXTEND">展期</option>
              <option :value="ADJUSTMENT_TYPE.EARLY_REDEEM">提前赎回</option>
            </select>
          </label>

          <label class="space-y-1">
            <span class="text-sm font-medium">金额</span>
            <input v-model.number="adjustmentForm.amount" type="number" step="0.0001" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>

          <label class="space-y-1">
            <span class="text-sm font-medium">原因说明</span>
            <textarea v-model="adjustmentForm.reason" rows="3" class="w-full rounded-lg border border-slate-300 px-3 py-2"></textarea>
          </label>
        </div>

        <footer class="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
          <button type="button" class="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700" @click="showAdjustmentModal = false">取消</button>
          <button type="button" class="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white" @click="saveAdjustment">提交</button>
        </footer>
      </section>
    </div>

    <!-- MFA 验证弹窗 -->
    <MfaVerificationModal
      v-model:open="showMfaModal"
      :loading="mfaLoading"
      title="安全验证"
      description="编辑产品比重配置属于敏感操作，请输入 MFA 验证码"
      @verify="handleMfaVerify"
      @cancel="pendingSaveData = null"
    />
  </section>
</template>
