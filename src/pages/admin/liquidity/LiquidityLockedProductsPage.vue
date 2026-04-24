
<script setup>
import { ref, reactive, computed } from 'vue'
import {
	PRODUCT_STATUS,
	productStatusMeta,
	PURCHASE_LIMIT_TYPE,
	COMMON_FILTER_ALL,
	SUPPORTED_CURRENCIES,
	LOCK_PERIODS,
	LOCKED_MIN_VIP_OPTIONS,
	LOCKED_MIN_KYC_OPTIONS,
	lockYieldAnnualPct,
	lockedMinKycLabel
} from '../../../admin/constants/liquidityLocked'
import { createLockedProductsMock } from '../../../admin/mock/liquidityLocked'

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
	minVipLevel: 0,
	minKycLevel: 'none',
	status: PRODUCT_STATUS.ENABLED
})

const openCreateProduct = () => {
	editingProductId.value = ''
	activeTab.value = 'base'
	productForm.name = ''
	productForm.currency = 'USDT'
	productForm.periods = [{ days: 10, annualRate: 12, minAmount: 100, maxAmount: 5000 }]
	productForm.earlyRedeemEnabled = true
	productForm.earlyRedeemFee = 4
	productForm.purchaseLimitType = PURCHASE_LIMIT_TYPE.LIFETIME
	productForm.lifetimeLimit = 50000
	productForm.periodLimit = 10000
	productForm.periodDays = 30
	productForm.minVipLevel = 0
	productForm.minKycLevel = 'none'
	productForm.status = PRODUCT_STATUS.ENABLED
	showProductModal.value = true
}

const openEditProduct = (product) => {
	editingProductId.value = product.id
	activeTab.value = 'base'
	productForm.name = product.name
	productForm.currency = product.currency
	productForm.periods = product.periods.map((p) => ({
		days: p.days,
		annualRate: lockYieldAnnualPct(p),
		minAmount: p.minAmount,
		maxAmount: p.maxAmount
	}))
	productForm.earlyRedeemEnabled = product.earlyRedeemEnabled
	productForm.earlyRedeemFee = product.earlyRedeemFee
	productForm.purchaseLimitType = product.purchaseLimitType
	productForm.lifetimeLimit = product.lifetimeLimit
	productForm.periodLimit = product.periodLimit
	productForm.periodDays = product.periodDays
	productForm.minVipLevel = product.minVipLevel ?? 0
	productForm.minKycLevel = product.minKycLevel ?? 'none'
	productForm.status = product.status
	showProductModal.value = true
}

const addPeriod = () => {
	productForm.periods.push({ days: 10, annualRate: 12, minAmount: 100, maxAmount: 5000 })
}

const removePeriod = (index) => {
	productForm.periods.splice(index, 1)
}

const saveProduct = () => {
	const payload = {
		name: productForm.name.trim(),
		currency: productForm.currency,
		icon: productForm.currency === 'USDT' ? '₮' : productForm.currency === 'BTC' ? '₿' : productForm.currency === 'ETH' ? 'Ξ' : productForm.currency,
		periods: productForm.periods.map((p) => ({
			days: Number(p.days),
			annualRate: Number(p.annualRate),
			minAmount: Number(p.minAmount),
			maxAmount: Number(p.maxAmount)
		})),
		earlyRedeemEnabled: productForm.earlyRedeemEnabled,
		earlyRedeemFee: Number(productForm.earlyRedeemFee),
		purchaseLimitType: productForm.purchaseLimitType,
		lifetimeLimit: Number(productForm.lifetimeLimit),
		periodLimit: Number(productForm.periodLimit),
		periodDays: Number(productForm.periodDays),
		minVipLevel: Number(productForm.minVipLevel) || 0,
		minKycLevel: productForm.minKycLevel || 'none',
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

// 配置分步：基础（含上下架）→ 收益阶梯 → 赎回规则 → 限购
const tabs = [
	{ key: 'base', label: '基础信息' },
	{ key: 'periods', label: '锁仓与收益' },
	{ key: 'redeem', label: '提前赎回' },
	{ key: 'limit', label: '限购策略' }
]
const activeTab = ref('base')

const applyPresetDays = (days) => {
	if (productForm.periods.some((p) => Number(p.days) === days)) return
	productForm.periods.push({ days, annualRate: 12, minAmount: 100, maxAmount: 5000 })
}
</script>

<template>
	<section class="space-y-4">
		<header class="flex flex-wrap items-start justify-between gap-4">
			<div>
				<h1 class="text-3xl font-semibold text-slate-900">流动性挖矿产品</h1>
				<p class="mt-1 text-sm text-slate-500">流动性挖矿（锁仓版）：维护展示名称、多档锁仓年化收益、赎回与限购及申购门槛，与前台申购页一致</p>
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
									{{ period.days }}天 · 年化 {{ lockYieldAnnualPct(period).toFixed(2) }}%
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
							<p class="mt-1 text-[11px] text-slate-500">
								{{ (product.minVipLevel ?? 0) === 0 ? 'VIP 无门槛' : `最低 VIP ${product.minVipLevel}` }} · {{ lockedMinKycLabel(product.minKycLevel) }}
							</p>
						</div>
					</div>
				</article>
			</div>
		</article>

		<!-- 产品编辑弹窗：Teleport 到 body，避免主区域 overflow 导致遮罩仅覆盖内容区 -->
		<Teleport to="body">
			<div
				v-if="showProductModal"
				class="fixed inset-0 z-[100] grid min-h-[100dvh] w-full place-items-center overflow-y-auto bg-black/50 p-4 sm:p-6"
				role="dialog"
				aria-modal="true"
			>
			<section class="w-full max-w-2xl rounded-xl bg-white shadow-xl">
				<header class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
					<h2 class="text-xl font-semibold text-slate-900">{{ editingProductId ? '编辑产品' : '新增产品' }}</h2>
					<button type="button" class="text-2xl text-slate-400" @click="showProductModal = false">×</button>
				</header>
				<div class="px-5 pt-4">
					<nav class="mb-4 flex flex-wrap gap-1 border-b border-slate-200">
						<button
							v-for="tab in tabs"
							:key="tab.key"
							type="button"
							@click="activeTab = tab.key"
							:class="[
								'rounded-t px-3 py-2 text-sm font-medium sm:px-4',
								activeTab === tab.key ? 'border-x border-t border-slate-200 bg-white text-blue-600' : 'bg-slate-100 text-slate-500 hover:text-slate-700'
							]"
						>
							{{ tab.label }}
						</button>
					</nav>
				</div>
				<div class="max-h-[60vh] overflow-y-auto px-5 pb-4">
					<section v-if="activeTab === 'base'" class="space-y-3">
						<div>
							<h3 class="text-base font-semibold text-slate-800">基础信息</h3>
							<p class="mt-1 text-xs text-slate-500">展示名称、计价币种与上下架状态；收益档位在「锁仓与收益」中配置。</p>
						</div>
						<div class="grid gap-x-5 gap-y-4 md:grid-cols-2">
							<div class="lb-stack">
								<div class="lb-label-row">
									<span class="lb-label">产品名称</span>
									<span class="lb-label-aux">必填</span>
								</div>
								<input v-model="productForm.name" type="text" class="lb-ctrl" placeholder="如：USDT 稳健锁仓" autocomplete="off" />
							</div>
							<div class="lb-stack">
								<div class="lb-label-row">
									<span class="lb-label">计价币种</span>
								</div>
								<select v-model="productForm.currency" class="lb-ctrl lb-select">
									<option v-for="curr in SUPPORTED_CURRENCIES" :key="curr" :value="curr">{{ curr }}</option>
								</select>
							</div>
							<div class="lb-stack md:col-span-2">
								<div class="lb-label-row">
									<span class="lb-label">上下架</span>
								</div>
								<select v-model="productForm.status" class="lb-ctrl lb-select max-w-md">
									<option :value="PRODUCT_STATUS.ENABLED">上架中（可申购）</option>
									<option :value="PRODUCT_STATUS.DISABLED">已下架（前端隐藏或不可申购）</option>
									<option :value="PRODUCT_STATUS.SOLD_OUT">已售罄（展示但不可申购）</option>
								</select>
								<p class="lb-hint">与 C 端列表可见性一致；「已售罄」可用于额度抢光但仍保留展示。</p>
							</div>
						</div>
					</section>
					<section v-else-if="activeTab === 'periods'" class="space-y-3">
						<div>
							<h3 class="text-base font-semibold text-slate-800">锁仓与收益</h3>
							<p class="mt-1 text-xs text-slate-500">每一行对应 C 端可选的一档：锁仓天数、年化收益率（%，按单利口径展示）、该档单笔申购上下限（与计价币种一致）。</p>
						</div>
						<div class="lb-stack">
							<div class="lb-label-row">
								<span class="lb-label">常用锁仓天数</span>
								<span class="lb-label-aux">点击追加一档</span>
							</div>
							<div class="flex flex-wrap gap-2">
								<button
									v-for="d in LOCK_PERIODS"
									:key="d"
									type="button"
									class="h-9 shrink-0 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
									@click="applyPresetDays(d)"
								>
									{{ d }} 天
								</button>
							</div>
						</div>
						<div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
							<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
								<span class="text-sm font-medium text-slate-800">收益档位列表</span>
								<button type="button" class="h-9 rounded-md bg-blue-600 px-3 text-sm font-medium text-white transition hover:bg-blue-700" @click="addPeriod">+ 空白档位</button>
							</div>
							<div class="overflow-x-auto rounded-md border border-slate-200 bg-white">
								<div class="max-h-64 overflow-y-auto">
									<table class="lb-table min-w-full text-sm">
										<thead>
											<tr class="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
												<th class="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide">锁仓天数</th>
												<th class="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide">年化 %</th>
												<th class="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide">单笔最小</th>
												<th class="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide">单笔最大</th>
												<th class="w-12 px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wide">操作</th>
											</tr>
										</thead>
										<tbody>
											<tr v-for="(period, idx) in productForm.periods" :key="idx" class="border-b border-slate-100 last:border-0 odd:bg-white even:bg-slate-50/80">
												<td class="p-2 align-middle">
													<input v-model.number="period.days" type="number" min="1" inputmode="numeric" class="lb-cell-in w-[4.5rem]" />
												</td>
												<td class="p-2 align-middle">
													<input v-model.number="period.annualRate" type="number" min="0" step="0.01" inputmode="decimal" class="lb-cell-in w-[6.25rem]" />
												</td>
												<td class="p-2 align-middle">
													<input v-model.number="period.minAmount" type="number" min="0" inputmode="decimal" class="lb-cell-in min-w-[6.5rem] max-w-[10rem]" />
												</td>
												<td class="p-2 align-middle">
													<input v-model.number="period.maxAmount" type="number" min="0" inputmode="decimal" class="lb-cell-in min-w-[6.5rem] max-w-[10rem]" />
												</td>
												<td class="p-2 align-middle text-center">
													<button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-base text-rose-600 transition hover:border-rose-200 hover:bg-rose-50" title="删除该档" @click="removePeriod(idx)">×</button>
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</section>
					<section v-else-if="activeTab === 'redeem'" class="space-y-3">
						<div>
							<h3 class="text-base font-semibold text-slate-800">提前赎回</h3>
							<p class="mt-1 text-xs text-slate-500">关闭后用户仅可持有到期；开启时可按违约金比例扣除后赎回（比例相对本金）。</p>
						</div>
						<div class="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
							<div class="lb-stack max-w-xl">
								<div class="lb-label-row">
									<span class="lb-label">提前赎回</span>
								</div>
								<label class="flex h-10 cursor-pointer items-center gap-2.5 rounded-md border border-transparent px-1">
									<input v-model="productForm.earlyRedeemEnabled" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
									<span class="text-sm text-slate-700">允许用户在锁仓期内申请提前赎回</span>
								</label>
							</div>
							<div v-if="productForm.earlyRedeemEnabled" class="lb-stack mt-4 max-w-xs border-t border-slate-200 pt-4">
								<div class="lb-label-row">
									<span class="lb-label">违约金比例</span>
									<span class="lb-label-aux">相对本金</span>
								</div>
								<div class="flex items-center gap-2">
									<input v-model.number="productForm.earlyRedeemFee" type="number" min="0" step="0.1" inputmode="decimal" class="lb-ctrl w-28 flex-none tabular-nums" />
									<span class="text-sm font-medium text-slate-500">%</span>
								</div>
								<p class="lb-hint">自本金扣收；未开启提前赎回时本项不生效。</p>
							</div>
						</div>
					</section>
					<section v-else-if="activeTab === 'limit'" class="space-y-3">
						<div>
							<h3 class="text-base font-semibold text-slate-800">限购策略</h3>
							<p class="mt-1 text-xs text-slate-500">按单用户维度控制可申购规模，并设置 VIP 与认证门槛；用于赔付、流动性敞口与合规分层。</p>
						</div>
					<div class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
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
					
					<div v-if="productForm.purchaseLimitType === PURCHASE_LIMIT_TYPE.LIFETIME" class="lb-stack max-w-lg">
						<div class="lb-label-row">
							<span class="lb-label">终身限购额度</span>
							<span class="lb-label-aux">单用户累计</span>
						</div>
						<input v-model.number="productForm.lifetimeLimit" type="number" min="0" inputmode="decimal" class="lb-ctrl tabular-nums" />
					</div>
					<div v-if="productForm.purchaseLimitType === PURCHASE_LIMIT_TYPE.PERIOD" class="grid gap-x-5 gap-y-4 sm:grid-cols-2">
						<div class="lb-stack">
							<div class="lb-label-row">
								<span class="lb-label">周期天数</span>
								<span class="lb-label-aux">限购滚动窗口</span>
							</div>
							<input v-model.number="productForm.periodDays" type="number" min="1" inputmode="numeric" class="lb-ctrl tabular-nums" />
						</div>
						<div class="lb-stack">
							<div class="lb-label-row">
								<span class="lb-label">周期限购额度</span>
								<span class="lb-label-aux">每窗口上限</span>
							</div>
							<input v-model.number="productForm.periodLimit" type="number" min="0" inputmode="decimal" class="lb-ctrl tabular-nums" />
						</div>
					</div>
					<div class="rounded-lg border border-slate-200 bg-slate-50/90 p-4">
						<div class="lb-label-row mb-3 border-b border-slate-200/80 pb-2">
							<span class="text-sm font-semibold text-slate-800">申购门槛</span>
						</div>
						<div class="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
							<div class="lb-stack">
								<div class="lb-label-row">
									<span class="lb-label">最低 VIP 等级</span>
								</div>
								<select v-model.number="productForm.minVipLevel" class="lb-ctrl lb-select">
									<option v-for="opt in LOCKED_MIN_VIP_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
								</select>
								<p class="lb-hint">低于所选 VIP 的用户无法发起申购。</p>
							</div>
							<div class="lb-stack">
								<div class="lb-label-row">
									<span class="lb-label">最低认证等级</span>
								</div>
								<select v-model="productForm.minKycLevel" class="lb-ctrl lb-select">
									<option v-for="opt in LOCKED_MIN_KYC_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
								</select>
								<p class="lb-hint">用户认证等级须不低于所选档位方可申购。</p>
							</div>
						</div>
					</div>
					</section>
		</div>
		<footer class="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
			<button type="button" class="h-10 rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50" @click="showProductModal = false">取消</button>
			<button type="button" class="h-10 rounded-md bg-blue-600 px-5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700" @click="saveProduct">保存</button>
		</footer>
	</section>
			</div>
		</Teleport>
</section>
</template>

<style scoped>
.lb-stack {
	@apply flex flex-col gap-1.5;
}
.lb-label-row {
	@apply flex min-h-[1.125rem] items-baseline justify-between gap-2;
}
.lb-label {
	@apply text-sm font-medium tracking-tight text-slate-700;
}
.lb-label-aux {
	@apply shrink-0 text-right text-xs font-normal tabular-nums text-slate-400;
}
.lb-ctrl {
	@apply h-10 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 text-sm leading-5 text-slate-900 shadow-sm;
	@apply transition-[border-color,box-shadow] placeholder:text-slate-400;
	@apply focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20;
}
.lb-select {
	@apply cursor-pointer bg-white pr-9;
	background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
	background-position: right 0.5rem center;
	background-size: 1.25rem 1.25rem;
	background-repeat: no-repeat;
	-webkit-appearance: none;
	appearance: none;
}
.lb-hint {
	@apply text-xs leading-relaxed text-slate-500;
}
.lb-cell-in {
	@apply h-9 w-full min-w-0 rounded-md border border-slate-300 bg-white px-2.5 text-sm tabular-nums text-slate-900 shadow-sm;
	@apply focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30;
}
.lb-table tbody tr:hover {
	@apply bg-slate-50/90;
}
</style>
