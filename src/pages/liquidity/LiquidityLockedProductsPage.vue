
<script setup>
import { ref, reactive, computed } from 'vue'
import {
	PRODUCT_STATUS,
	productStatusMeta,
	PURCHASE_LIMIT_TYPE,
	COMMON_FILTER_ALL,
	SUPPORTED_CURRENCIES
} from '../../constants/liquidityLocked'
import { createLockedProductsMock } from '../../mock/liquidityLocked'

const products = ref(createLockedProductsMock())
const search = ref('')
const statusFilter = ref(COMMON_FILTER_ALL)

const showProductModal = ref(false)
const editingProductId = ref('')

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

	if (editingProductId.value) {
		products.value = products.value.map(p => p.id === editingProductId.value ? { ...p, ...payload } : p)
	} else {
		products.value.unshift({ id: `prod-${Date.now()}`, ...payload, totalLocked: 0, totalOrders: 0, createdAt: new Date().toISOString().split('T')[0] })
	}

	showProductModal.value = false
}

const filteredProducts = computed(() => {
	const kw = search.value.trim().toLowerCase()
	return products.value.filter(p => {
		const matchStatus = statusFilter.value === COMMON_FILTER_ALL || p.status === statusFilter.value
		const matchKeyword = !kw || `${p.name} ${p.currency}`.toLowerCase().includes(kw)
		return matchStatus && matchKeyword
	})
})

const fmtNumber = (val, decimals = 2) => Number(val).toFixed(decimals)
const fmtCurrency = (val, currency, decimals = 2) => {
	if (currency === 'BTC' || currency === 'ETH') return `${fmtNumber(val, decimals === 2 ? 4 : decimals)} ${currency}`
	return `${Number(val).toLocaleString()} ${currency}`
}

// Tab 配置
const tabs = [
	{ key: 'base', label: '基础信息' },
	{ key: 'periods', label: '周期配置' },
	{ key: 'redeem', label: '提前赎回' },
	{ key: 'limit', label: '限购策略' }
]
const activeTab = ref('base')
</script>

<template>
	<section class="space-y-4">
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

		<!-- 产品编辑弹窗（Tab分步式） -->
		<div v-if="showProductModal" class="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" @click.self="showProductModal = false">
			<section class="w-full max-w-2xl rounded-xl bg-white">
				<header class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
					<h2 class="text-xl font-semibold text-slate-900">{{ editingProductId ? '编辑产品' : '新增产品' }}</h2>
					<button type="button" class="text-2xl text-slate-400" @click="showProductModal = false">×</button>
				</header>
				<div class="px-5 pt-4">
					<nav class="flex gap-2 border-b border-slate-200 mb-4">
						<button v-for="(tab, idx) in tabs" :key="tab.key" @click="activeTab = tab.key" :class="['px-4 py-2 text-sm font-medium rounded-t', activeTab === tab.key ? 'bg-white border-x border-t border-slate-200 text-blue-600' : 'bg-slate-100 text-slate-500']">{{ tab.label }}</button>
					</nav>
				</div>
				<div class="max-h-[60vh] overflow-y-auto px-5 pb-4">
					<section v-if="activeTab === 'base'">
						<h3 class="text-base font-semibold text-slate-800 mb-2">基础信息</h3>
						<div class="grid gap-3 md:grid-cols-2">
							<label class="space-y-1">
								<span class="text-sm font-medium">产品名称 <span class="text-xs text-slate-400">（必填，简明易懂）</span></span>
								<input v-model="productForm.name" type="text" class="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="如：USDT 30天锁仓" />
							</label>
							<label class="space-y-1">
								<span class="text-sm font-medium">币种 <span class="text-xs text-slate-400">（支持主流币）</span></span>
								<select v-model="productForm.currency" class="w-full rounded-lg border border-slate-300 px-3 py-2">
									<option v-for="curr in SUPPORTED_CURRENCIES" :key="curr" :value="curr">{{ curr }}</option>
								</select>
							</label>
							<label class="space-y-1 md:col-span-2">
								<span class="text-sm font-medium">产品状态</span>
								<select v-model="productForm.status" class="w-full rounded-lg border border-slate-300 px-3 py-2">
									<option :value="PRODUCT_STATUS.ENABLED">上架中</option>
									<option :value="PRODUCT_STATUS.DISABLED">已下架</option>
									<option :value="PRODUCT_STATUS.SOLD_OUT">已售罄</option>
								</select>
							</label>
						</div>
					</section>
					<section v-else-if="activeTab === 'periods'">
						<h3 class="text-base font-semibold text-slate-800 mb-2">周期配置 <span class="text-xs text-slate-400">（可设置多个阶梯周期）</span></h3>
						<div class="rounded-lg border border-slate-200 p-3 bg-slate-50">
							<div class="flex items-center justify-between mb-2">
								<p class="text-sm font-medium">锁仓周期列表</p>
								<button type="button" class="rounded-md bg-blue-600 px-3 py-1 text-sm text-white" @click="addPeriod">+ 添加周期</button>
							</div>
							<div class="overflow-x-auto">
								<div class="max-h-64 overflow-y-auto">
									<table class="min-w-full text-sm">
										<thead>
											<tr class="text-slate-500 bg-slate-100">
												<th class="px-2 py-1 font-medium">天数</th>
												<th class="px-2 py-1 font-medium">日利率</th>
												<th class="px-2 py-1 font-medium">最小金额</th>
												<th class="px-2 py-1 font-medium">最大金额</th>
												<th class="px-2 py-1 font-medium">操作</th>
											</tr>
										</thead>
										<tbody>
											<tr v-for="(period, idx) in productForm.periods" :key="idx" class="bg-white even:bg-slate-50">
												<td class="px-2 py-1">
													<input v-model.number="period.days" type="number" min="1" class="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm" />
												</td>
												<td class="px-2 py-1">
													<input v-model.number="period.dailyRate" type="number" min="0" step="0.0001" class="w-24 rounded-lg border border-slate-300 px-2 py-1 text-sm" />
												</td>
												<td class="px-2 py-1">
													<input v-model.number="period.minAmount" type="number" min="0" class="w-28 rounded-lg border border-slate-300 px-2 py-1 text-sm" />
												</td>
												<td class="px-2 py-1">
													<input v-model.number="period.maxAmount" type="number" min="0" class="w-28 rounded-lg border border-slate-300 px-2 py-1 text-sm" />
												</td>
												<td class="px-2 py-1">
													<button type="button" class="rounded-md border border-rose-300 px-2 text-rose-600" @click="removePeriod(idx)">×</button>
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</section>
					<section v-else-if="activeTab === 'redeem'">
						<h3 class="text-base font-semibold text-slate-800 mb-2">提前赎回</h3>
						<div class="flex flex-wrap gap-4 items-center">
							<label class="inline-flex items-center gap-2">
								<input v-model="productForm.earlyRedeemEnabled" type="checkbox" class="h-4 w-4" />
								<span class="text-sm">启用提前赎回</span>
							</label>
							<label v-if="productForm.earlyRedeemEnabled" class="flex items-center gap-2">
								<span class="text-sm font-medium">违约金比例</span>
								<input v-model.number="productForm.earlyRedeemFee" type="number" min="0" class="w-24 rounded-lg border border-slate-300 px-3 py-2" />
								<span class="text-xs text-slate-400">%</span>
								<span class="text-xs text-slate-400">（提前赎回时收取）</span>
							</label>
						</div>
					</section>
					<section v-else-if="activeTab === 'limit'">
					<h3 class="text-base font-semibold text-slate-800 mb-3">限购策略</h3>
					
					<!-- 卡片式选择 -->
					<div class="grid grid-cols-3 gap-3 mb-4">
						<button type="button" @click="productForm.purchaseLimitType = PURCHASE_LIMIT_TYPE.NONE" 
								:class="['rounded-lg border-2 p-4 text-center transition cursor-pointer', 
										productForm.purchaseLimitType === PURCHASE_LIMIT_TYPE.NONE 
										? 'border-blue-500 bg-blue-50 text-blue-700' 
										: 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50']">
							<div class="font-semibold">不限购</div>
							<div class="text-xs mt-1 text-slate-500">不设置限购策略</div>
						</button>
						
						<button type="button" @click="productForm.purchaseLimitType = PURCHASE_LIMIT_TYPE.LIFETIME"
								:class="['rounded-lg border-2 p-4 text-center transition cursor-pointer',
										productForm.purchaseLimitType === PURCHASE_LIMIT_TYPE.LIFETIME
										? 'border-blue-500 bg-blue-50 text-blue-700'
										: 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50']">
							<div class="font-semibold">终身限购</div>
							<div class="text-xs mt-1 text-slate-500">单用户终身限额</div>
						</button>
						
						<button type="button" @click="productForm.purchaseLimitType = PURCHASE_LIMIT_TYPE.PERIOD"
								:class="['rounded-lg border-2 p-4 text-center transition cursor-pointer',
										productForm.purchaseLimitType === PURCHASE_LIMIT_TYPE.PERIOD
										? 'border-blue-500 bg-blue-50 text-blue-700'
										: 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50']">
							<div class="font-semibold">周期限购</div>
							<div class="text-xs mt-1 text-slate-500">按周期设置限额</div>
						</button>
					</div>
					
					<!-- 配置项 -->
					<div v-if="productForm.purchaseLimitType === PURCHASE_LIMIT_TYPE.LIFETIME" class="grid gap-3 md:grid-cols-1">
						<label class="space-y-1">
							<span class="text-sm font-medium">终身限购额度 <span class="text-xs text-slate-400">（单用户最大可购总额）</span></span>
							<input v-model.number="productForm.lifetimeLimit" type="number" min="0" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
						</label>
					</div>
					<div v-if="productForm.purchaseLimitType === PURCHASE_LIMIT_TYPE.PERIOD" class="grid gap-3 md:grid-cols-2">
						<label class="space-y-1">
							<span class="text-sm font-medium">周期天数 <span class="text-xs text-slate-400">（限购周期）</span></span>
							<input v-model.number="productForm.periodDays" type="number" min="1" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
						</label>
						<label class="space-y-1">
							<span class="text-sm font-medium">周期限购额度 <span class="text-xs text-slate-400">（每周期最大可购）</span></span>
							<input v-model.number="productForm.periodLimit" type="number" min="0" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
						</label>
				</div>
			</section>
		</div>
		<footer class="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
			<button type="button" class="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700" @click="showProductModal = false">取消</button>
			<button type="button" class="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white" @click="saveProduct">保存</button>
		</footer>
	</section>
</div>
</section>
</template>
