<template>
	<section class="space-y-4">
		<header class="flex flex-wrap items-start justify-between gap-4">
			<div>
				<h1 class="text-3xl font-semibold text-slate-900">收益调整</h1>
				<p class="mt-1 text-sm text-slate-500">订单级别的收益补偿、奖励发放与违规惩罚处理</p>
			</div>
			<button type="button" class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700" @click="openCreateAdjustment">+ 新建调整</button>
		</header>

		<article class="rounded-xl border border-slate-200 bg-white">
			<div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
				<div class="text-sm text-slate-600">
					共 {{ filteredAdjustments.length }} 条调整记录
				</div>
				<input v-model="search" type="text" placeholder="搜索用户、订单或产品..." class="w-full max-w-sm rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500" />
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-slate-50 text-slate-500">
						<tr>
							<th class="px-4 py-3 text-left font-medium">调整ID</th>
							<th class="px-4 py-3 text-left font-medium">类型</th>
							<th class="px-4 py-3 text-left font-medium">目标</th>
							<th class="px-4 py-3 text-left font-medium">产品</th>
							<th class="px-4 py-3 text-left font-medium">金额</th>
							<th class="px-4 py-3 text-left font-medium">原因</th>
							<th class="px-4 py-3 text-left font-medium">操作人</th>
							<th class="px-4 py-3 text-left font-medium">调整时间</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="adj in filteredAdjustments" :key="adj.id" class="border-t border-slate-100">
							<td class="px-4 py-3 font-mono text-xs text-slate-600">{{ adj.id }}</td>
							<td class="px-4 py-3">
								<div class="flex items-center gap-1.5">
								<component :is="getAdjustmentIcon(adj.type)" class="w-4 h-4" :class="getIconColor(adj.type)" />
									<span class="rounded-md px-2 py-0.5 text-xs font-medium" :class="adjustmentTypeMeta[adj.type].class">{{ adjustmentTypeMeta[adj.type].label }}</span>
								</div>
							</td>
							<td class="px-4 py-3">
								<div class="text-slate-700">{{ adj.targetName }}</div>
								<div class="text-xs text-slate-500">{{ adj.targetType === 'user' ? '用户' : adj.targetType === 'product' ? '产品' : '订单' }}</div>
							</td>
							<td class="px-4 py-3">
								<div class="text-slate-700">{{ adj.productName }}</div>
								<div v-if="adj.orderId" class="text-xs text-slate-500 font-mono">{{ adj.orderId }}</div>
							</td>
							<td class="px-4 py-3">
								<div class="font-medium text-slate-900">{{ fmtCurrency(adj.amount, adj.currency) }}</div>
								<div v-if="adj.percentage" class="text-xs text-slate-500">{{ adj.percentage }}%</div>
							</td>
							<td class="px-4 py-3">
								<div class="text-slate-700 max-w-xs truncate">{{ adj.reason }}</div>
							</td>
							<td class="px-4 py-3">
								<div class="text-slate-700">{{ adj.operatorName }}</div>
							</td>
							<td class="px-4 py-3">
								<div class="text-slate-700">{{ adj.createdAt }}</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</article>

		<!-- 调整申请弹窗 -->
<div v-if="showAdjustmentModal" class="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
		<article class="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col" @click.stop>
			<!-- 弹窗头部 -->
			<header class="flex items-center justify-between border-b border-slate-200 px-6 py-4 flex-shrink-0">
				<div>
					<h2 class="text-xl font-semibold text-slate-900">新建收益调整</h2>
					<p class="text-sm text-slate-500 mt-1">针对特定订单进行一次性收益调整，左侧输入信息，右侧实时预览</p>
				</div>
				<button type="button" class="text-slate-400 hover:text-slate-600" @click="showAdjustmentModal = false">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
				</header>

			<!-- 弹窗主体：左右分栏 -->
			<div class="flex-1 flex overflow-hidden">
				<!-- 左侧：表单输入区域 (60%) -->
				<div class="w-3/5 border-r border-slate-200 flex flex-col">
					<div class="flex-1 overflow-y-auto p-6 space-y-5">
						<!-- 调整类型选择 -->
						<div>
							<h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
								<svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
								</svg>
								调整类型
							</h3>
							<div class="grid grid-cols-2 gap-3">
								<button 
									v-for="(meta, key) in adjustmentTypeMeta" 
									:key="key"
									type="button"
									@click="adjustmentForm.type = key"
									class="p-4 text-left border-2 rounded-lg transition-all hover:shadow-md"
									:class="adjustmentForm.type === key 
										? 'border-blue-500 bg-blue-50 shadow-sm' 
										: 'border-slate-300 hover:border-blue-300'"
								>
									<div class="flex items-center gap-2 mb-2">
									<component :is="getAdjustmentIcon(key)" class="w-5 h-5" :class="getIconColor(key)" />
										<span :class="['px-2 py-0.5 text-xs font-medium rounded-md', meta.class]">{{ meta.label }}</span>
									</div>
									<div class="text-xs text-slate-600">{{ meta.desc }}</div>
								</button>
							</div>
						</div>

						<!-- 目标信息 -->
						<div>
							<h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
								<svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"/>
								</svg>
								目标对象
							</h3>
							<div class="space-y-3">
								<div>
									<label class="block text-sm font-medium text-slate-700 mb-1">目标类型</label>
									<div class="grid grid-cols-3 gap-2">
										<button 
											v-for="type in targetTypes"
											:key="type.key"
											type="button"
											@click="adjustmentForm.targetType = type.key"
											class="flex items-center justify-center gap-1.5 px-3 py-2 text-sm border-2 rounded-lg transition-all"
											:class="adjustmentForm.targetType === type.key 
												? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' 
												: 'border-slate-300 text-slate-700 hover:border-blue-300'"
										>
											<component :is="type.icon" class="w-4 h-4" />
											<span>{{ type.label }}</span>
										</button>
									</div>
								</div>

								<div v-if="adjustmentForm.targetType === 'order'">
									<label class="block text-sm font-medium text-slate-700 mb-1">订单ID <span class="text-red-600">*</span></label>
									<input v-model="adjustmentForm.orderId" type="text" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="输入订单ID，例如：aiq-ord-001" />
									<p class="text-xs text-slate-500 mt-1">订单ID唯一标识该订单，已包含用户和产品信息</p>
								</div>

							<template v-if="adjustmentForm.targetType === 'user'">
								<div>
									<label class="block text-sm font-medium text-slate-700 mb-1">用户ID <span class="text-red-600">*</span></label>
									<input v-model="adjustmentForm.targetId" type="text" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="输入用户ID" />
								</div>
								<div>
									<label class="block text-sm font-medium text-slate-700 mb-1">关联订单ID <span class="text-red-600">*</span></label>
									<input v-model="adjustmentForm.orderId" type="text" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="输入关联订单ID" />
									<p class="text-xs text-slate-500 mt-1">调整该用户的特定订单收益</p>
								</div>
							</template>

							<div v-if="adjustmentForm.targetType !== 'order'">
								<label class="block text-sm font-medium text-slate-700 mb-1">产品名称</label>
								<select v-model="adjustmentForm.productName" @change="onProductChange" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
									<option value="">选择产品</option>
									<option v-for="product in products" :key="product.id" :value="product.name">
										{{ product.name }} ({{ product.currency }})
									</option>
								</select>
								<p class="text-xs text-slate-500 mt-1">选择产品后将自动匹配币种</p>
							</div>
							</div>
						</div>

						<!-- 调整金额 -->
						<div>
							<h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
								<svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
									<path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
									<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
								</svg>
								金额设置
							</h3>
							<div class="space-y-3">
								<div class="grid grid-cols-2 gap-3">
									<div>
										<label class="block text-sm font-medium text-slate-700 mb-1">调整金额</label>
										<input v-model.number="adjustmentForm.amount" type="number" step="0.01" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="0.00" />
									</div>
									<div>
										<label class="block text-sm font-medium text-slate-700 mb-1">币种</label>
										<select v-model="adjustmentForm.currency" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
											<option v-for="currency in SUPPORTED_CURRENCIES" :key="currency" :value="currency">{{ currency }}</option>
										</select>
									</div>
								</div>

								<div v-if="adjustmentForm.type === ADJUSTMENT_TYPE.INCREASE || adjustmentForm.type === ADJUSTMENT_TYPE.DECREASE">
									<label class="block text-sm font-medium text-slate-700 mb-1">
										调整百分比 <span class="text-slate-400 text-xs">(% 可选)</span>
									</label>
									<input v-model.number="adjustmentForm.percentage" type="number" step="0.01" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="例如：10 表示增加10%" />
									<p class="text-xs text-slate-500 mt-1">设置后将按此百分比调整收益率</p>
								</div>

								<!-- 快捷金额 -->
								<div>
									<label class="block text-sm text-slate-600 mb-2">快捷金额</label>
									<div class="flex flex-wrap gap-2">
										<button 
											v-for="amount in [100, 500, 1000, 5000, 10000]"
											:key="amount"
											type="button"
											@click="adjustmentForm.amount = amount"
											class="px-3 py-1.5 text-xs border border-slate-300 rounded hover:border-blue-400 hover:bg-blue-50 transition-colors"
										>
											{{ amount }}
										</button>
									</div>
								</div>
							</div>
						</div>

						<!-- 原因说明 -->
						<div>
							<h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
								<svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
								</svg>
								原因说明
							</h3>
							<div class="space-y-2">
								<div>
									<label class="block text-xs text-slate-600 mb-2">常用原因模板（点击快速填入）</label>
									<div class="flex flex-wrap gap-2">
										<button
											type="button"
											v-for="template in [
												'用户活动奖励补发',
												'系统错误补偿',
												'VIP客户额外奖励',
												'违规行为惩罚',
												'推广活动奖励'
											]"
											:key="template"
											@click="adjustmentForm.reason = template"
											class="px-3 py-1.5 text-xs bg-white border border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-700 rounded transition-colors"
										>
											{{ template }}
										</button>
									</div>
								</div>
								<textarea v-model="adjustmentForm.reason" rows="4" maxlength="200" class="w-full rounded-lg border px-3 py-2 text-sm resize-none" :class="!adjustmentForm.reason.trim() ? 'border-red-300 bg-red-50' : 'border-slate-300'" placeholder="请详细说明本次调整的原因..."></textarea>
								<div v-if="!adjustmentForm.reason.trim()" class="text-xs text-red-600 flex items-center gap-1 bg-red-50 px-3 py-2 rounded">
									<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
									</svg>
									必须填写原因才能提交
								</div>
								<div v-else class="text-xs text-green-600 flex items-center gap-1">
									<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
									</svg>
									已填写原因
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- 右侧：实时预览区域 (40%) -->
				<div class="w-2/5 bg-slate-50 flex flex-col">
					<div class="flex-1 overflow-y-auto p-6 space-y-4">
						<!-- 调整类型说明 -->
						<div>
							<h4 class="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
								<svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
								</svg>
								调整说明
							</h4>
							<div class="bg-white rounded-lg p-4 border border-slate-200">
								<div class="flex items-center gap-2 mb-2">
								<component :is="getAdjustmentIcon(adjustmentForm.type)" class="w-5 h-5" :class="getIconColor(adjustmentForm.type)" />
									<span :class="['px-2 py-0.5 text-xs font-medium rounded-md', adjustmentTypeMeta[adjustmentForm.type].class]">
										{{ adjustmentTypeMeta[adjustmentForm.type].label }}
									</span>
								</div>
								<p class="text-sm text-slate-700">{{ adjustmentTypeMeta[adjustmentForm.type].desc }}</p>
							</div>
						</div>

						<!-- 调整预览 -->
						<div>
							<h4 class="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
								<svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
									<path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
									<path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
								</svg>
								调整预览
							</h4>
							<div class="bg-white rounded-lg p-4 border border-slate-200 space-y-3">
								<div v-if="adjustmentForm.targetType === 'order'" class="flex justify-between items-center text-sm">
									<span class="text-slate-600">订单ID</span>
									<span class="font-medium text-slate-900 font-mono text-xs">{{ adjustmentForm.orderId || '未填写' }}</span>
								</div>
								<template v-else-if="adjustmentForm.targetType === 'user'">
									<div class="flex justify-between items-center text-sm">
										<span class="text-slate-600">用户ID</span>
										<span class="font-medium text-slate-900 font-mono text-xs">{{ adjustmentForm.targetId || '未填写' }}</span>
									</div>
									<div class="flex justify-between items-center text-sm">
										<span class="text-slate-600">关联订单ID</span>
										<span class="font-medium text-slate-900 font-mono text-xs">{{ adjustmentForm.orderId || '未填写' }}</span>
									</div>
								</template>
								<div v-if="adjustmentForm.targetType !== 'order'" class="flex justify-between items-center text-sm">
									<span class="text-slate-600">产品</span>
									<span class="font-medium text-slate-900">{{ adjustmentForm.productName || '未填写' }}</span>
								</div>

								<div class="flex justify-between items-center text-sm pt-2 border-t border-slate-200">
									<span class="text-slate-600">调整金额</span>
									<span class="text-lg font-bold" :class="adjustmentForm.type === ADJUSTMENT_TYPE.PENALTY ? 'text-red-600' : 'text-green-600'">
										{{ adjustmentForm.type === ADJUSTMENT_TYPE.PENALTY ? '-' : '+' }}{{ adjustmentForm.amount || 0 }} {{ adjustmentForm.currency }}
									</span>
								</div>
								<div v-if="adjustmentForm.percentage" class="flex justify-between items-center text-sm">
									<span class="text-slate-600">百分比调整</span>
									<span class="font-medium text-blue-600">{{ adjustmentForm.type === ADJUSTMENT_TYPE.DECREASE ? '-' : '+' }}{{ adjustmentForm.percentage }}%</span>
								</div>
							</div>
						</div>

						<!-- 计算示例 -->
						<div v-if="adjustmentForm.amount > 0">
							<h4 class="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
								<svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
								</svg>
								计算示例
							</h4>
							<div class="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200 space-y-2 text-sm">
								<div class="font-medium text-slate-900 mb-2">假设用户原有订单：</div>
								<div class="flex justify-between items-center">
									<span class="text-slate-600">原本金</span>
									<span class="text-slate-900">10,000 {{ adjustmentForm.currency }}</span>
								</div>
								<div class="flex justify-between items-center">
									<span class="text-slate-600">原日收益</span>
									<span class="text-slate-900">20 {{ adjustmentForm.currency }}</span>
								</div>
								<div class="flex justify-between items-center pt-2 border-t border-blue-300">
									<span class="text-slate-600">调整后增量</span>
									<span class="font-bold" :class="adjustmentForm.type === ADJUSTMENT_TYPE.PENALTY ? 'text-red-600' : 'text-green-600'">
										{{ adjustmentForm.type === ADJUSTMENT_TYPE.PENALTY ? '-' : '+' }}{{ adjustmentForm.amount }} {{ adjustmentForm.currency }}
									</span>
								</div>
								<div class="flex justify-between items-center">
									<span class="text-slate-600">调整后日收益</span>
									<span class="font-bold text-green-600">
										{{ adjustmentForm.type === ADJUSTMENT_TYPE.PENALTY ? 20 - adjustmentForm.amount : 20 + adjustmentForm.amount }} {{ adjustmentForm.currency }}
									</span>
								</div>
							</div>
						</div>

						<!-- 影响范围 -->
						<div>
							<h4 class="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
								<svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd"/>
								</svg>
								影响范围
							</h4>
							<div class="bg-white rounded-lg p-4 border border-slate-200 text-sm text-slate-600">
								<div v-if="adjustmentForm.targetType === 'user'" class="space-y-1">
									<div class="flex items-start gap-2">
										<span class="text-blue-600 mt-0.5">•</span>
										<span>仅影响该用户的指定订单</span>
									</div>
								</div>
								<div v-else-if="adjustmentForm.targetType === 'product'" class="space-y-1">
									<div class="flex items-start gap-2">
										<span class="text-blue-600 mt-0.5">•</span>
										<span>将影响该产品的所有活跃订单</span>
									</div>
								</div>
								<div v-else class="space-y-1">
									<div class="flex items-start gap-2">
										<span class="text-blue-600 mt-0.5">•</span>
										<span>仅影响该订单，不影响用户的其他订单</span>
									</div>
								</div>
								<div class="flex items-start gap-2 mt-2 pt-2 border-t border-slate-200">
									<svg class="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
									</svg>
									<span class="text-orange-600">调整将立即生效且不可撤销</span>
								</div>
							</div>
						</div>

						<!-- 操作风险提示 -->
						<div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
							<div class="flex items-start gap-2">
								<svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
								</svg>
								<div class="flex-1">
									<div class="text-sm font-medium text-amber-900">操作提示</div>
									<ul class="mt-2 text-xs text-amber-800 space-y-1">
										<li>• 所有调整操作均会被记录</li>
										<li>• 请务必填写详细的调整原因</li>
										<li>• 金额调整将影响用户收益</li>
										<li>• 提交后立即生效且不可撤销</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- 底部操作栏 -->
			<footer class="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 flex-shrink-0 bg-slate-50">
				<button type="button" class="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition" @click="showAdjustmentModal = false">取消</button>
				<button 
					type="button" 
					class="rounded-lg px-4 py-2 text-sm text-white transition"
					:class="isFormValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-400 cursor-not-allowed'"
					:disabled="!isFormValid"
					@click="saveAdjustment"
				>
					提交调整
				</button>
			</footer>
			</article>
		</div>
	</section>
</template>

<script setup>
import { ref, reactive, computed, onMounted, h } from 'vue'
import { useRoute } from 'vue-router'
import {
	ADJUSTMENT_TYPE,
	adjustmentTypeMeta,
	SUPPORTED_CURRENCIES
} from '../../constants/aiQuant'
import { createYieldAdjustmentsMock, createAiQuantProductsMock } from '../../mock/aiQuant'

const route = useRoute()
const adjustments = ref(createYieldAdjustmentsMock())
const products = ref(createAiQuantProductsMock())
const search = ref('')

// 目标类型配置（带SVG图标）
const targetTypes = [
	{
		key: 'user',
		label: '用户',
		icon: (props) => h('svg', { ...props, fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
			h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' })
		])
	},
	{
		key: 'product',
		label: '产品',
		icon: (props) => h('svg', { ...props, fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
			h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' })
		])
	},
	{
		key: 'order',
		label: '订单',
		icon: (props) => h('svg', { ...props, fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
			h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' })
		])
	}
]

// 根据调整类型返回SVG图标组件
const getAdjustmentIcon = (type) => {
	const icons = {
		[ADJUSTMENT_TYPE.BONUS]: (props) => h('svg', { ...props, fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
			h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7' })
		]),
		[ADJUSTMENT_TYPE.PENALTY]: (props) => h('svg', { ...props, fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
			h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' })
		]),
		[ADJUSTMENT_TYPE.CORRECTION]: (props) => h('svg', { ...props, fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
			h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }),
			h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' })
		]),
		[ADJUSTMENT_TYPE.INCREASE]: (props) => h('svg', { ...props, fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
			h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' })
		]),
		[ADJUSTMENT_TYPE.DECREASE]: (props) => h('svg', { ...props, fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
			h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6' })
		])
	}
	return icons[type] || icons[ADJUSTMENT_TYPE.BONUS]
}

// 根据调整类型返回图标颜色
const getIconColor = (type) => {
	const colors = {
		[ADJUSTMENT_TYPE.BONUS]: 'text-green-600',
		[ADJUSTMENT_TYPE.PENALTY]: 'text-red-600',
		[ADJUSTMENT_TYPE.CORRECTION]: 'text-blue-600',
		[ADJUSTMENT_TYPE.INCREASE]: 'text-purple-600',
		[ADJUSTMENT_TYPE.DECREASE]: 'text-orange-600'
	}
	return colors[type] || 'text-slate-600'
}

const showAdjustmentModal = ref(false)
const adjustmentForm = reactive({
	type: ADJUSTMENT_TYPE.BONUS,
	targetType: 'user',
	targetId: '',
	targetName: '',
	orderId: '',
	productName: '',
	amount: 0,
	currency: 'USDT',
	percentage: null,
	reason: ''
})

const openCreateAdjustment = () => {
	adjustmentForm.type = ADJUSTMENT_TYPE.BONUS
	adjustmentForm.targetType = 'user'
	adjustmentForm.targetId = ''
	adjustmentForm.targetName = ''
	adjustmentForm.orderId = ''
	
	// 从路由参数预填充
	if (route.query.productName) {
		adjustmentForm.productName = route.query.productName
		adjustmentForm.targetType = 'product'
		adjustmentForm.targetId = route.query.productId || ''
	} else {
		adjustmentForm.productName = ''
	}
	
	if (route.query.currency) {
		adjustmentForm.currency = route.query.currency
	} else {
		adjustmentForm.currency = 'USDT'
	}
	
	adjustmentForm.amount = 0
	adjustmentForm.percentage = null
	adjustmentForm.reason = ''
	showAdjustmentModal.value = true
}

const onProductChange = () => {
	const selectedProduct = products.value.find(p => p.name === adjustmentForm.productName)
	if (selectedProduct) {
		adjustmentForm.currency = selectedProduct.currency
	}
}

const saveAdjustment = () => {
	// 订单类型时，使用订单ID作为目标ID
	const payload = {
		...adjustmentForm,
		targetId: adjustmentForm.targetType === 'order' ? adjustmentForm.orderId : adjustmentForm.targetId,
		targetName: adjustmentForm.targetType === 'order' ? `订单 ${adjustmentForm.orderId}` : adjustmentForm.targetName
	}
	
	adjustments.value.unshift({
		id: `adj-${Date.now()}`,
		...payload,
		operator: 'admin-001',
		operatorName: 'Current Admin',
		createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
	})

	showAdjustmentModal.value = false
}

// 验证表单是否可提交
const isFormValid = computed(() => {
	if (!adjustmentForm.reason.trim()) return false
	
	// 订单类型只需要订单ID
	if (adjustmentForm.targetType === 'order') {
		if (!adjustmentForm.orderId.trim()) return false
	} else {
		// 用户和产品类型需要目标ID、目标名称和产品名称
		if (!adjustmentForm.targetId.trim()) return false
		if (!adjustmentForm.targetName.trim()) return false
		if (!adjustmentForm.productName.trim()) return false
	}
	
	return true
})

const filteredAdjustments = computed(() => {
	const kw = search.value.trim().toLowerCase()
	return adjustments.value.filter(adj => {
		const matchKeyword = !kw || `${adj.targetName} ${adj.productName} ${adj.orderId || ''}`.toLowerCase().includes(kw)
		return matchKeyword
	})
})

const fmtNumber = (val, decimals = 2) => Number(val).toFixed(decimals)
const fmtCurrency = (val, currency, decimals = 2) => {
	if (currency === 'BTC' || currency === 'ETH') return `${fmtNumber(val, decimals === 2 ? 4 : decimals)} ${currency}`
	return `${Number(val).toLocaleString()} ${currency}`
}

// 检查路由参数，如果有产品信息则自动打开弹窗
onMounted(() => {
	if (route.query.productName) {
		openCreateAdjustment()
	}
})
</script>
