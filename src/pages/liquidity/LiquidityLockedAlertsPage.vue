
<script setup>
import { ref, computed } from 'vue'
import {
	ALERT_LEVEL,
	alertLevelMeta,
	COMMON_FILTER_ALL
} from '../../constants/liquidityLocked'
import { createLockedAlertsMock } from '../../mock/liquidityLocked'

const alerts = ref(createLockedAlertsMock())
const search = ref('')
const statusFilter = ref(COMMON_FILTER_ALL)

const filteredAlerts = computed(() => {
	const levelFilter = statusFilter.value
	const kw = search.value.trim().toLowerCase()
	return alerts.value.filter(a => {
		const matchLevel = levelFilter === COMMON_FILTER_ALL || a.level === levelFilter
		const matchKeyword = !kw || `${a.orderId} ${a.userName} ${a.currency}`.toLowerCase().includes(kw)
		return matchLevel && matchKeyword
	})
})

const fmtNumber = (val, decimals = 2) => Number(val).toFixed(decimals)
const fmtCurrency = (val, currency, decimals = 2) => {
	if (currency === 'BTC' || currency === 'ETH') return `${fmtNumber(val, decimals === 2 ? 4 : decimals)} ${currency}`
	return `${Number(val).toLocaleString()} ${currency}`
}
</script>

<template>
	<section class="space-y-5">
		<header>
			<h1 class="text-3xl font-semibold text-slate-900">到期预警</h1>
			<p class="mt-1 text-sm text-slate-500">预警即将到期的锁仓订单与资金回流压力</p>
		</header>

		<!-- 筛选区 card -->
		<article class="rounded-xl border border-slate-200 bg-white p-4">
			<div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
				<div class="inline-flex items-center gap-3 text-sm">
					<button type="button" class="font-medium" :class="statusFilter === COMMON_FILTER_ALL ? 'text-blue-600' : 'text-slate-500'" @click="statusFilter = COMMON_FILTER_ALL">全部</button>
					<button type="button" class="font-medium" :class="statusFilter === ALERT_LEVEL.URGENT ? 'text-blue-600' : 'text-slate-500'" @click="statusFilter = ALERT_LEVEL.URGENT">紧急</button>
					<button type="button" class="font-medium" :class="statusFilter === ALERT_LEVEL.WARNING ? 'text-blue-600' : 'text-slate-500'" @click="statusFilter = ALERT_LEVEL.WARNING">警告</button>
					<button type="button" class="font-medium" :class="statusFilter === ALERT_LEVEL.INFO ? 'text-blue-600' : 'text-slate-500'" @click="statusFilter = ALERT_LEVEL.INFO">信息</button>
				</div>
				<input v-model="search" type="text" placeholder="搜索订单ID、用户名..." class="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
			</div>
		</article>

		<!-- 表格区 card -->
		<article class="overflow-hidden rounded-xl border border-slate-200 bg-white">
			<div class="overflow-x-auto">
				<table class="w-full min-w-[900px] text-left text-sm">
					<thead class="bg-slate-50 text-slate-500">
						<tr>
							<th class="px-4 py-3 font-medium">预警级别</th>
							<th class="px-4 py-3 font-medium">剩余小时</th>
							<th class="px-4 py-3 font-medium">订单ID</th>
							<th class="px-4 py-3 font-medium">用户</th>
							<th class="px-4 py-3 font-medium">本金</th>
							<th class="px-4 py-3 font-medium">利息</th>
							<th class="px-4 py-3 font-medium">到期时间</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="alert in filteredAlerts" :key="alert.id" class="border-t border-slate-100 align-top hover:bg-blue-50 transition">
							<td class="px-4 py-3 align-middle">
								<span class="rounded px-2 py-0.5 text-xs font-semibold" :class="alertLevelMeta[alert.level].class">{{ alertLevelMeta[alert.level].label }}</span>
							</td>
							<td class="px-4 py-3 align-middle font-mono">{{ alert.hoursRemaining }}</td>
							<td class="px-4 py-3 align-middle text-blue-700 font-mono">{{ alert.orderId }}</td>
							<td class="px-4 py-3 align-middle">{{ alert.userName }}</td>
							<td class="px-4 py-3 align-middle">{{ fmtCurrency(alert.amount, alert.currency) }}</td>
							<td class="px-4 py-3 align-middle">{{ fmtCurrency(alert.interest, alert.currency) }}</td>
							<td class="px-4 py-3 align-middle whitespace-nowrap">{{ alert.unlockAt }}</td>
						</tr>
					</tbody>
				</table>
			</div>
			<p v-if="filteredAlerts.length === 0" class="p-8 text-center text-sm text-slate-500">暂无预警数据</p>
		</article>
	</section>
</template>
