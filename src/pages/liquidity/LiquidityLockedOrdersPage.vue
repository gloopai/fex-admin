
<script setup>
import { ref, computed } from 'vue'
import {
	ORDER_STATUS,
	orderStatusMeta,
	COMMON_FILTER_ALL
} from '../../constants/liquidityLocked'
import { createLockedOrdersMock } from '../../mock/liquidityLocked'

const orders = ref(createLockedOrdersMock())
const search = ref('')
const statusFilter = ref(COMMON_FILTER_ALL)

const filteredOrders = computed(() => {
	const kw = search.value.trim().toLowerCase()
	return orders.value.filter(o => {
		const matchStatus = statusFilter.value === COMMON_FILTER_ALL || o.status === statusFilter.value
		const matchKeyword = !kw || `${o.id} ${o.userName} ${o.productName} ${o.currency}`.toLowerCase().includes(kw)
		return matchStatus && matchKeyword
	})
})

const fmtNumber = (val, decimals = 2) => Number(val).toFixed(decimals)
const fmtCurrency = (val, currency, decimals = 2) => {
	if (currency === 'BTC' || currency === 'ETH') return `${fmtNumber(val, decimals === 2 ? 4 : decimals)} ${currency}`
	return `${Number(val).toLocaleString()} ${currency}`
}
</script>

<template>
	<section class="space-y-4">
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
	</section>
</template>
