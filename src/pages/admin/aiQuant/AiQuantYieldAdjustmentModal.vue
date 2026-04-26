<template>
	<Teleport to="body">
		<div v-if="showAdjustmentModal" class="fixed inset-0 z-[60] grid place-items-center bg-black/45 p-4">
			<article class="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col" @click.stop>
				<header class="flex items-center justify-between border-b border-slate-200 px-5 py-4 flex-shrink-0">
					<div>
						<h2 class="text-lg font-semibold text-slate-900">订单收益调整</h2>
						<p class="text-xs text-slate-500 mt-0.5">仅作用于当前订单，提交后可在「收益调整记录」中查询</p>
					</div>
					<button type="button" class="text-slate-400 hover:text-slate-600 p-1" aria-label="关闭" @click="showAdjustmentModal = false">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</header>

				<div class="flex-1 overflow-y-auto p-5 space-y-4">
					<div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm space-y-1.5">
						<div class="flex justify-between gap-3">
							<span class="text-slate-500 shrink-0">订单</span>
							<span class="font-mono text-xs text-slate-900 text-right break-all">{{ adjustmentForm.orderId }}</span>
						</div>
						<div class="flex justify-between gap-3">
							<span class="text-slate-500">产品</span>
							<span class="text-slate-900 text-right">{{ adjustmentForm.productName }}</span>
						</div>
						<div class="flex justify-between gap-3">
							<span class="text-slate-500">币种</span>
							<span class="font-medium text-slate-900">{{ adjustmentForm.currency }}</span>
						</div>
					</div>

					<div>
						<label class="block text-sm font-medium text-slate-700 mb-1.5">调整类型</label>
						<select
							v-model="adjustmentForm.type"
							class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
						>
							<option v-for="(meta, key) in adjustmentTypeMeta" :key="key" :value="key">
								{{ meta.label }}
							</option>
						</select>
						<p class="mt-1.5 text-xs text-slate-500">{{ adjustmentTypeMeta[adjustmentForm.type].desc }}</p>
					</div>

					<div>
						<label class="block text-sm font-medium text-slate-700 mb-1.5">调整金额</label>
						<div class="flex gap-2">
							<input
								v-model.number="adjustmentForm.amount"
								type="number"
								step="0.01"
								min="0"
								class="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
								placeholder="0.00"
							/>
							<span class="flex w-20 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700">
								{{ adjustmentForm.currency }}
							</span>
						</div>
						<div v-if="adjustmentForm.currency === 'USDT'" class="mt-2 flex flex-wrap gap-1.5">
							<button
								v-for="preset in amountPresetsUsdt"
								:key="preset"
								type="button"
								class="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 hover:border-blue-300 hover:bg-blue-50"
								@click="adjustmentForm.amount = preset"
							>
								+{{ preset }}
							</button>
						</div>
					</div>

					<div v-if="adjustmentForm.type === ADJUSTMENT_TYPE.INCREASE || adjustmentForm.type === ADJUSTMENT_TYPE.DECREASE">
						<label class="block text-sm font-medium text-slate-700 mb-1.5">
							收益率变动 <span class="font-normal text-slate-400">（可选，%）</span>
						</label>
						<input
							v-model.number="adjustmentForm.percentage"
							type="number"
							step="0.01"
							class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
							placeholder="如 10 表示 10%"
						/>
					</div>

					<div>
						<label class="block text-sm font-medium text-slate-700 mb-1.5">原因说明 <span class="text-red-500">*</span></label>
						<div class="mb-2 flex flex-wrap gap-1.5">
							<button
								v-for="t in reasonTemplates"
								:key="t"
								type="button"
								class="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 hover:border-blue-300 hover:bg-blue-50"
								@click="adjustmentForm.reason = t"
							>
								{{ t }}
							</button>
						</div>
						<textarea
							v-model="adjustmentForm.reason"
							rows="3"
							maxlength="200"
							class="w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
							:class="adjustmentForm.reason.trim() ? 'border-slate-300' : 'border-red-200 bg-red-50/50'"
							placeholder="简要说明调整依据，便于审计"
						/>
					</div>

					<p class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
						提交后立即生效，且不可撤销；请核对金额与类型后再提交。
					</p>
				</div>

				<footer class="flex justify-end gap-2 border-t border-slate-200 px-5 py-3 flex-shrink-0 bg-slate-50">
					<button type="button" class="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" @click="showAdjustmentModal = false">
						取消
					</button>
					<button
						type="button"
						class="rounded-lg px-4 py-2 text-sm font-medium text-white transition"
						:class="isFormValid ? 'bg-blue-600 hover:bg-blue-700' : 'cursor-not-allowed bg-slate-400'"
						:disabled="!isFormValid"
						@click="saveAdjustment"
					>
						提交调整
					</button>
				</footer>
			</article>
		</div>
	</Teleport>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import {
	ADJUSTMENT_TYPE,
	adjustmentTypeMeta
} from '../../../admin/constants/aiQuant'
import { aiQuantYieldAdjustments } from '../../../admin/state/aiQuantYieldAdjustments'

const amountPresetsUsdt = [100, 500, 1000, 5000]
const reasonTemplates = ['活动奖励补发', '系统差错修正', '违规扣减', 'VIP 激励']

const showAdjustmentModal = ref(false)
const adjustmentForm = reactive({
	type: ADJUSTMENT_TYPE.BONUS,
	targetType: 'order',
	targetId: '',
	targetName: '',
	orderId: '',
	productName: '',
	amount: 0,
	currency: 'USDT',
	percentage: null,
	reason: ''
})

const openForOrder = (order) => {
	adjustmentForm.type = ADJUSTMENT_TYPE.BONUS
	adjustmentForm.targetType = 'order'
	adjustmentForm.targetId = ''
	adjustmentForm.targetName = ''
	adjustmentForm.orderId = order.id
	adjustmentForm.productName = order.productName
	adjustmentForm.currency = order.currency
	adjustmentForm.amount = 0
	adjustmentForm.percentage = null
	adjustmentForm.reason = ''
	showAdjustmentModal.value = true
}

const saveAdjustment = () => {
	const orderId = adjustmentForm.orderId.trim()
	const payload = {
		...adjustmentForm,
		targetId: orderId,
		targetName: `订单 ${orderId}`
	}

	aiQuantYieldAdjustments.value.unshift({
		id: `adj-${Date.now()}`,
		...payload,
		operator: 'admin-001',
		operatorName: 'Current Admin',
		createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
	})

	showAdjustmentModal.value = false
}

const isFormValid = computed(() => {
	return !!(adjustmentForm.reason.trim() && adjustmentForm.orderId.trim())
})

defineExpose({ openForOrder })
</script>
