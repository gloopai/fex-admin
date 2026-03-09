<template>
	<section class="space-y-4">
		<header class="flex flex-wrap items-start justify-between gap-4">
			<div>
				<h1 class="text-3xl font-semibold text-slate-900">调控管理</h1>
				<p class="mt-1 text-sm text-slate-500">系统级风控操作：产品收益率调整、暂停申购、流动性注入等</p>
			</div>
			<button type="button" class="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700" @click="openCreateControl">+ 新建调控</button>
		</header>

		<!-- 风险提示 -->
		<div class="bg-orange-50 border border-orange-200 rounded-xl p-4">
			<div class="flex items-start">
				<div class="text-orange-600 text-xl mr-3">⚠️</div>
				<div class="flex-1">
					<div class="font-semibold text-orange-900">调控操作风险提示</div>
					<div class="text-sm text-orange-700 mt-1">
						调控操作将直接影响用户收益和平台资金流动性，请谨慎操作。所有调控记录将被永久保存并可被审计。
					</div>
				</div>
			</div>
		</div>

		<article class="rounded-xl border border-slate-200 bg-white">
			<div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
				<div class="inline-flex items-center gap-3 text-sm">
					<button type="button" class="font-medium" :class="statusFilter === COMMON_FILTER_ALL ? 'text-blue-600' : 'text-slate-500'" @click="statusFilter = COMMON_FILTER_ALL">全部</button>
					<button type="button" class="font-medium" :class="statusFilter === CONTROL_STATUS.ACTIVE ? 'text-blue-600' : 'text-slate-500'" @click="statusFilter = CONTROL_STATUS.ACTIVE">生效中</button>
					<button type="button" class="font-medium" :class="statusFilter === CONTROL_STATUS.COMPLETED ? 'text-blue-600' : 'text-slate-500'" @click="statusFilter = CONTROL_STATUS.COMPLETED">已完成</button>
					<button type="button" class="font-medium" :class="statusFilter === CONTROL_STATUS.CANCELLED ? 'text-blue-600' : 'text-slate-500'" @click="statusFilter = CONTROL_STATUS.CANCELLED">已取消</button>
				</div>
				<input v-model="search" type="text" placeholder="搜索目标ID或原因..." class="w-full max-w-sm rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500" />
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-slate-50 text-slate-500">
						<tr>
							<th class="px-4 py-3 text-left font-medium">调控ID</th>
							<th class="px-4 py-3 text-left font-medium">类型</th>
							<th class="px-4 py-3 text-left font-medium">目标</th>
							<th class="px-4 py-3 text-left font-medium">调整方式</th>
							<th class="px-4 py-3 text-left font-medium">原因</th>
							<th class="px-4 py-3 text-left font-medium">生效时间</th>
							<th class="px-4 py-3 text-left font-medium">状态</th>
							<th class="px-4 py-3 text-left font-medium">操作</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="ctrl in filteredControls" :key="ctrl.id" class="border-t border-slate-100">
							<td class="px-4 py-3 font-mono text-xs text-slate-600">{{ ctrl.id }}</td>
							<td class="px-4 py-3">
								<span class="rounded-md px-2 py-0.5 text-xs font-medium" :class="controlTypeMeta[ctrl.type].class">
									{{ controlTypeMeta[ctrl.type].label }}
								</span>
							</td>
							<td class="px-4 py-3">
							<div class="text-xs text-slate-600">{{ getTargetTypeLabel(ctrl.targetType) }}</div>
							<div class="text-slate-700 font-mono text-xs">{{ ctrl.targetId }}</div>
							</td>
							<td class="px-4 py-3">
								<div class="font-medium text-slate-900">{{ getAdjustmentTypeLabel(ctrl.adjustmentType) }}</div>
								<div v-if="ctrl.adjustmentValue" class="text-xs text-slate-600">
									{{ formatAdjustmentValue(ctrl.adjustmentType, ctrl.adjustmentValue) }}
								</div>
							</td>
							<td class="px-4 py-3">
								<div class="text-slate-700 max-w-xs truncate">{{ ctrl.reason }}</div>
							</td>
							<td class="px-4 py-3">
								<div class="text-slate-700">{{ ctrl.startDate }}</div>
								<div v-if="ctrl.endDate" class="text-xs text-slate-500">至 {{ ctrl.endDate }}</div>
								<div v-else class="text-xs text-slate-500">永久生效</div>
							</td>
							<td class="px-4 py-3">
								<span class="rounded-md px-2 py-0.5 text-xs font-medium" :class="controlStatusMeta[ctrl.status].class">
									{{ controlStatusMeta[ctrl.status].label }}
								</span>
							</td>
							<td class="px-4 py-3">
								<button type="button" @click="viewControlDetail(ctrl)" class="text-blue-600 hover:text-blue-700 text-xs font-medium">详情</button>
								<span v-if="ctrl.status === CONTROL_STATUS.ACTIVE" class="text-slate-300 mx-1">|</span>
								<button v-if="ctrl.status === CONTROL_STATUS.ACTIVE" type="button" @click="cancelControl(ctrl)" class="text-red-600 hover:text-red-700 text-xs font-medium">
									取消
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</article>

		<!-- 新建调控弹窗 -->
		<div v-if="showControlModal" class="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
			<article class="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col" @click.stop>
				<!-- 弹窗头部 -->
				<header class="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-red-50 flex-shrink-0">
					<div>
						<h2 class="text-xl font-semibold text-slate-900">新建调控操作</h2>
						<p class="text-sm text-red-700 mt-1">⚠️ 系统级调控操作影响范围广，具有高风险，请确认操作无误后再提交</p>
					</div>
					<button type="button" class="text-slate-400 hover:text-slate-600" @click="showControlModal = false">
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
							<!-- 调控类型 -->
							<div>
								<h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
									<svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
									</svg>
									调控类型
								</h3>
							<div class="grid grid-cols-2 gap-3">
								<button 
									v-for="(meta, key) in controlTypeMeta" 
									:key="key"
									type="button"
									@click="controlForm.type = key"
									class="p-4 text-left border-2 rounded-lg transition-all hover:shadow-md"
									:class="controlForm.type === key 
										? 'border-red-500 bg-red-50 shadow-sm' 
										: 'border-slate-300 hover:border-red-300'"
								>
									<div class="flex items-center gap-2 mb-2">
										<span :class="['px-2 py-0.5 text-xs font-medium rounded-md', meta.class]">{{ meta.label }}</span>
									</div>
									<div class="text-xs text-slate-600">{{ meta.description }}</div>
								</button>
							</div>
						</div>

						<!-- 目标信息 -->
						<div>
							<h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
								<svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
									<path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
								</svg>
								目标信息
							</h3>
							<div>
									<label class="block text-xs text-slate-600 mb-1.5">
										{{ currentTargetLabel }}
										<span v-if="isSystemLevel" class="text-slate-400">(系统级操作无需填写)</span>
									</label>
									<input 
										v-model="controlForm.targetId" 
										:placeholder="currentTargetPlaceholder" 
										:disabled="isSystemLevel"
										class="w-full rounded-lg border px-3 py-2 text-sm font-mono transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
										:class="isSystemLevel ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed' : (!controlForm.targetId.trim() ? 'border-red-300 bg-red-50' : 'border-slate-300')"
									/>
								</div>
							</div>

							<!-- 调整参数 -->
							<div>
								<h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
									<svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
									</svg>
									调整参数
								</h3>
								<div class="space-y-3">
									<div class="grid grid-cols-2 gap-4">
										<div>
											<label class="block text-xs text-slate-600 mb-1.5">调整方式</label>
											<select v-model="controlForm.adjustmentType" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20">
												<option value="multiply">乘数（倍率调整）</option>
												<option value="add">加法（百分点增减）</option>
												<option value="override">覆盖（强制设定值）</option>
												<option value="stop">停止（暂停交易）</option>
												<option value="inject">注入（注入流动性）</option>
											</select>
										</div>
										<div>
											<label class="block text-xs text-slate-600 mb-1.5">调整数值</label>
											<input 
												v-model.number="controlForm.adjustmentValue" 
												type="number" 
												step="0.01" 
												placeholder="根据调整方式填写" 
												class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
											/>
										</div>
									</div>

									<!-- 快捷数值 -->
									<div v-if="controlForm.adjustmentType === 'multiply'">
										<label class="block text-xs text-slate-600 mb-2">快捷倍率</label>
										<div class="flex flex-wrap gap-2">
											<button 
												v-for="val in [0.8, 0.9, 1.0, 1.2, 1.5, 2.0]"
												:key="val"
												type="button"
												@click="controlForm.adjustmentValue = val"
												class="px-3 py-1.5 text-xs border border-slate-300 rounded hover:border-red-400 hover:bg-red-50 transition-colors"
											>
												×{{ val }}
											</button>
										</div>
									</div>
									<div v-else-if="controlForm.adjustmentType === 'add'">
										<label class="block text-xs text-slate-600 mb-2">快捷百分点</label>
										<div class="flex flex-wrap gap-2">
											<button 
												v-for="val in [-1, -0.5, 0.5, 1, 2, 5]"
												:key="val"
												type="button"
												@click="controlForm.adjustmentValue = val"
												class="px-3 py-1.5 text-xs border border-slate-300 rounded hover:border-red-400 hover:bg-red-50 transition-colors"
											>
												{{ val > 0 ? '+' : '' }}{{ val }}%
											</button>
										</div>
									</div>
									<div v-else-if="controlForm.adjustmentType === 'inject'">
										<label class="block text-xs text-slate-600 mb-2">快捷金额（USDT）</label>
										<div class="flex flex-wrap gap-2">
											<button 
												v-for="val in [10000, 50000, 100000, 500000, 1000000]"
												:key="val"
												type="button"
												@click="controlForm.adjustmentValue = val"
												class="px-3 py-1.5 text-xs border border-slate-300 rounded hover:border-red-400 hover:bg-red-50 transition-colors"
											>
												{{ val.toLocaleString() }}
											</button>
										</div>
									</div>
								</div>
							</div>

							<!-- 生效时间 -->
							<div>
								<h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
									<svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
									</svg>
									生效时间
								</h3>
								<div class="grid grid-cols-2 gap-4">
									<div>
										<label class="block text-xs text-slate-600 mb-1.5">生效日期</label>
										<input v-model="controlForm.startDate" type="date" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20" />
									</div>
									<div>
										<label class="block text-xs text-slate-600 mb-1.5">结束日期 <span class="text-slate-400">(可选)</span></label>
										<input v-model="controlForm.endDate" type="date" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20" />
									</div>
								</div>
							</div>

							<!-- 操作原因 -->
							<div>
								<h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
									<svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
									</svg>
									操作原因
								</h3>
								<div class="space-y-2">
									<div>
										<label class="block text-xs text-slate-600 mb-2">常用原因模板（点击快速填入）</label>
										<div class="flex flex-wrap gap-2">
											<button
												type="button"
												v-for="template in [
													'市场波动风险控制',
													'用户投诉紧急处理',
													'流动性不足应急',
													'系统异常临时措施',
													'监管要求合规调整',
													'产品策略优化'
												]"
												:key="template"
												@click="controlForm.reason = template"
												class="px-3 py-1.5 text-xs bg-white border border-slate-300 hover:border-red-400 hover:bg-red-50 text-slate-700 rounded transition-colors"
											>
												{{ template }}
											</button>
										</div>
									</div>
									<textarea 
										v-model="controlForm.reason" 
										rows="4" 
										maxlength="300" 
										placeholder="请详细说明调控操作的原因和预期影响..." 
										class="w-full rounded-lg border px-3 py-2 text-sm resize-none transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
										:class="!controlForm.reason.trim() ? 'border-red-300 bg-red-50' : 'border-slate-300'"
									></textarea>
									<div v-if="!controlForm.reason.trim()" class="text-xs text-red-600 flex items-center gap-1 bg-red-50 px-3 py-2 rounded">
										<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
										</svg>
										必须填写操作原因才能提交
									</div>
									<div v-else class="text-xs text-green-600 flex items-center gap-1">
										<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
										</svg>
										已填写操作原因
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- 右侧：实时预览区域 (40%) -->
					<div class="w-2/5 bg-slate-50 flex flex-col">
						<div class="flex-1 overflow-y-auto p-6 space-y-4">
							<!-- 调控类型说明 -->
							<div>
								<h4 class="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
									<svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
									</svg>
									调控类型说明
								</h4>
								<div class="bg-white rounded-lg p-4 border border-slate-200 space-y-3">
									<span class="rounded-md px-2 py-0.5 text-xs font-medium" :class="controlTypeMeta[controlForm.type].class">
										{{ controlTypeMeta[controlForm.type].label }}
									</span>
									<p class="text-sm text-slate-600 mt-2">{{ getControlTypeDescription(controlForm.type) }}</p>
									<div class="mt-3 pt-3 border-t border-slate-200">
										<div class="flex items-center gap-2 text-xs text-slate-500">
											<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
												<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
											</svg>
											<span>允许操作的目标类型：</span>
										</div>
										<div class="flex flex-wrap gap-1.5 mt-2">
											<span 
												v-for="target in allowedTargetTypes" 
												:key="target"
												class="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded border border-blue-200"
											>
												{{ getTargetTypeLabel(target) }}
											</span>
										</div>
									</div>
								</div>
							</div>

							<!-- 调控信息预览 -->
							<div>
								<h4 class="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
									<svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
										<path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
										<path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
									</svg>
									调控信息预览
								</h4>
								<div class="bg-white rounded-lg p-4 border border-slate-200 space-y-3 text-sm">
									<div class="flex justify-between items-center">
										<span class="text-slate-600">操作目标</span>
										<span class="font-medium text-slate-900">{{ getTargetTypeLabel(currentTargetType) }}</span>
									</div>
									<div class="flex justify-between items-center">
										<span class="text-slate-600">{{ currentTargetLabel }}</span>
										<span class="font-mono text-xs text-slate-900">{{ controlForm.targetId || (isSystemLevel ? '系统级' : '未填写') }}</span>
									</div>
									<div class="flex justify-between items-center pt-2 border-t border-slate-200">
										<span class="text-slate-600">调整方式</span>
										<span class="font-medium text-slate-900">{{ getAdjustmentTypeLabel(controlForm.adjustmentType) }}</span>
									</div>
									<div class="flex justify-between items-center">
										<span class="text-slate-600">调整数值</span>
										<span class="font-bold text-red-600 text-lg">{{ formatAdjustmentValue(controlForm.adjustmentType, controlForm.adjustmentValue) }}</span>
									</div>
									<div class="flex justify-between items-center pt-2 border-t border-slate-200">
										<span class="text-slate-600">生效时间</span>
										<span class="font-medium text-slate-900">{{ controlForm.startDate || '未设置' }}</span>
									</div>
									<div class="flex justify-between items-center">
										<span class="text-slate-600">结束时间</span>
										<span class="font-medium text-slate-900">{{ controlForm.endDate || '永久生效' }}</span>
									</div>
								</div>
							</div>

							<!-- 调整方式说明 -->
							<div>
								<h4 class="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
									<svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
									</svg>
									调整方式说明
								</h4>
								<div class="bg-white rounded-lg p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
									<div v-if="controlForm.adjustmentType === 'multiply'" class="space-y-1">
										<div class="font-medium text-slate-900">乘数倍率调整</div>
										<div>• 原收益率 × 调整值 = 新收益率</div>
										<div>• 示例：5% × 1.2 = 6%（提升20%）</div>
									</div>
									<div v-else-if="controlForm.adjustmentType === 'add'" class="space-y-1">
										<div class="font-medium text-slate-900">百分点加减</div>
										<div>• 原收益率 + 调整值 = 新收益率</div>
										<div>• 示例：5% + 0.5 = 5.5%（增加0.5个百分点）</div>
									</div>
									<div v-else-if="controlForm.adjustmentType === 'override'" class="space-y-1">
										<div class="font-medium text-slate-900">强制覆盖</div>
										<div>• 直接将收益率设置为调整值</div>
										<div>• 示例：不管原收益率，统一设为8%</div>
									</div>
									<div v-else-if="controlForm.adjustmentType === 'stop'" class="space-y-1">
										<div class="font-medium text-slate-900">暂停交易</div>
										<div>• 暂停产品的申购/赎回操作</div>
										<div>• 已有订单继续计息，但无法新增或退出</div>
									</div>
									<div v-else-if="controlForm.adjustmentType === 'inject'" class="space-y-1">
										<div class="font-medium text-slate-900">流动性注入</div>
										<div>• 向流动性池注入资金</div>
										<div>• 用于应对大额赎回或流动性危机</div>
									</div>
								</div>
							</div>

							<!-- 影响范围 -->
							<div>
								<h4 class="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
									<svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd"/>
									</svg>
									影响范围
								</h4>
								<div class="bg-white rounded-lg p-4 border border-slate-200 text-sm text-slate-600">
									<div v-if="currentTargetType === 'user'" class="space-y-1">
										<div class="flex items-start gap-2">
											<span class="text-red-600 mt-0.5">•</span>
											<span>仅影响指定用户在AI量化交易的订单</span>
										</div>
										<div class="flex items-start gap-2">
											<span class="text-red-600 mt-0.5">•</span>
											<span>不影响该用户的其他产品或其他用户</span>
										</div>
									</div>
									<div v-else-if="currentTargetType === 'product'" class="space-y-1">
										<div class="flex items-start gap-2">
											<span class="text-red-600 mt-0.5">•</span>
											<span>将影响该产品的所有用户订单</span>
										</div>
										<div class="flex items-start gap-2">
											<span class="text-red-600 mt-0.5">•</span>
											<span>包括新订单和已有运行中的订单</span>
										</div>
										<div class="flex items-start gap-2">
											<span class="text-red-600 mt-0.5">•</span>
											<span>不影响其他产品</span>
										</div>
									</div>
									<div v-else-if="currentTargetType === 'system'" class="space-y-1">
										<div class="flex items-start gap-2">
											<span class="text-red-600 mt-0.5">•</span>
											<span class="font-semibold text-red-600">影响整个系统的所有AI量化产品</span>
										</div>
										<div class="flex items-start gap-2">
											<span class="text-red-600 mt-0.5">•</span>
											<span>包括所有产品和所有用户订单</span>
										</div>
										<div class="flex items-start gap-2">
											<span class="text-red-600 mt-0.5">•</span>
											<span class="font-semibold">请务必谨慎操作，需要最高权限审批</span>
										</div>
									</div>
								</div>
							</div>

							<!-- 风险警告 -->
							<div class="bg-red-50 border border-red-200 rounded-lg p-4">
								<div class="flex items-start gap-2">
									<svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
									</svg>
									<div class="flex-1">
										<div class="text-sm font-medium text-red-900 mb-1">⚠️ 风险提示</div>
										<ul class="text-xs text-red-800 space-y-1">
											<li>• 调控操作将立即生效</li>
											<li>• 所有操作均被永久记录</li>
											<li>• 可能直接影响用户收益</li>
											<li>• 请确保操作合规且合理</li>
											<li>• 必须填写详细的操作原因</li>
										</ul>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- 底部操作栏 -->
				<footer class="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50 flex-shrink-0">
					<button type="button" class="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition" @click="showControlModal = false">取消</button>
					<button 
						type="button" 
						class="rounded-lg px-4 py-2 text-sm text-white transition"
						:class="isFormValid ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-400 cursor-not-allowed'"
						:disabled="!isFormValid"
						@click="saveControl"
					>
						确认调控
					</button>
				</footer>
			</article>
		</div>

		<!-- 调控详情弹窗 -->
		<div v-if="showDetailModal && selectedControl" class="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
			<article class="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col" @click.stop>
				<!-- 弹窗头部 -->
				<header class="flex items-center justify-between border-b border-slate-200 px-6 py-4 flex-shrink-0 bg-slate-50">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
							<svg class="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
							</svg>
						</div>
						<div>
							<h2 class="text-xl font-semibold text-slate-900">调控详情</h2>
							<p class="text-sm text-slate-500 mt-0.5 font-mono">{{ selectedControl.id }}</p>
						</div>
					</div>
					<button type="button" class="text-slate-400 hover:text-slate-600 transition" @click="showDetailModal = false">
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</header>

				<!-- 弹窗主体：左右分栏 -->
				<div class="flex-1 flex overflow-hidden">
					<!-- 左侧：主要信息 (60%) -->
					<div class="w-3/5 border-r border-slate-200 flex flex-col">
						<div class="flex-1 overflow-y-auto p-6 space-y-5">
							<!-- 基本信息 -->
							<div>
								<h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
									<svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
									</svg>
									基本信息
								</h3>
								<div class="space-y-3">
									<div class="bg-slate-50 rounded-lg p-4 border border-slate-200">
										<div class="text-xs text-slate-500 mb-2">调控类型</div>
										<span class="rounded-md px-2 py-1 text-xs font-medium inline-block" :class="controlTypeMeta[selectedControl.type].class">
											{{ controlTypeMeta[selectedControl.type].label }}
										</span>
										<p class="text-xs text-slate-600 mt-2">{{ getControlTypeDescription(selectedControl.type) }}</p>
									</div>
								</div>
							</div>

							<!-- 目标信息 -->
							<div>
								<h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
									<svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
										<path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
									</svg>
									目标对象
								</h3>
								<div class="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3 text-sm">
									<div class="flex justify-between items-center">
										<span class="text-slate-600">目标类型</span>
										<span class="font-medium text-slate-900">{{ getTargetTypeLabel(selectedControl.targetType) }}</span>
									</div>
									<div class="flex justify-between items-center pt-2 border-t border-slate-200">
										<span class="text-slate-600">目标ID</span>
										<span class="font-medium font-mono text-xs text-slate-900">{{ selectedControl.targetId }}</span>
									</div>
								</div>
							</div>

							<!-- 调整参数 -->
							<div>
								<h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
									<svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
									</svg>
									调整参数
								</h3>
								<div class="bg-slate-50 rounded-lg p-4 border border-slate-200">
									<div class="grid grid-cols-2 gap-4 mb-3">
										<div>
											<div class="text-xs text-slate-500 mb-1">调整方式</div>
											<div class="font-medium text-slate-900">{{ getAdjustmentTypeLabel(selectedControl.adjustmentType) }}</div>
										</div>
										<div>
											<div class="text-xs text-slate-500 mb-1">调整数值</div>
											<div class="font-bold text-red-600 text-lg">{{ formatAdjustmentValue(selectedControl.adjustmentType, selectedControl.adjustmentValue) }}</div>
										</div>
									</div>
									<div class="pt-3 border-t border-slate-200">
										<div class="text-xs text-slate-600" v-if="selectedControl.adjustmentType === 'multiply'">
											<div class="font-medium text-slate-900 mb-1">计算说明</div>
											<div>原收益率 × {{ selectedControl.adjustmentValue }} = 新收益率</div>
											<div class="text-slate-500 mt-1">示例：5% × {{ selectedControl.adjustmentValue }} = {{ (5 * selectedControl.adjustmentValue).toFixed(2) }}%</div>
										</div>
										<div class="text-xs text-slate-600" v-else-if="selectedControl.adjustmentType === 'add'">
											<div class="font-medium text-slate-900 mb-1">计算说明</div>
											<div>原收益率 + {{ selectedControl.adjustmentValue }}% = 新收益率</div>
											<div class="text-slate-500 mt-1">示例：5% + {{ selectedControl.adjustmentValue }}% = {{ (5 + selectedControl.adjustmentValue).toFixed(2) }}%</div>
										</div>
										<div class="text-xs text-slate-600" v-else-if="selectedControl.adjustmentType === 'override'">
											<div class="font-medium text-slate-900 mb-1">计算说明</div>
											<div>直接将收益率设置为 {{ selectedControl.adjustmentValue }}%</div>
										</div>
										<div class="text-xs text-slate-600" v-else-if="selectedControl.adjustmentType === 'stop'">
											<div class="font-medium text-slate-900 mb-1">操作说明</div>
											<div>暂停产品的申购和赎回操作</div>
										</div>
										<div class="text-xs text-slate-600" v-else-if="selectedControl.adjustmentType === 'inject'">
											<div class="font-medium text-slate-900 mb-1">操作说明</div>
											<div>向流动性池注入 {{ formatAdjustmentValue(selectedControl.adjustmentType, selectedControl.adjustmentValue) }}</div>
										</div>
									</div>
								</div>
							</div>

							<!-- 操作原因 -->
							<div>
								<h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
									<svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
									</svg>
									操作原因
								</h3>
								<div class="bg-slate-50 rounded-lg p-4 border border-slate-200">
									<p class="text-sm text-slate-700 leading-relaxed">{{ selectedControl.reason }}</p>
								</div>
							</div>
						</div>
					</div>

					<!-- 右侧：状态与辅助信息 (40%) -->
					<div class="w-2/5 bg-slate-50 flex flex-col">
						<div class="flex-1 overflow-y-auto p-6 space-y-4">
							<!-- 当前状态卡片 -->
							<div>
								<h4 class="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
									<svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
									</svg>
									当前状态
								</h4>
								<div class="bg-white rounded-lg p-4 border-2" :class="selectedControl.status === CONTROL_STATUS.ACTIVE ? 'border-green-300 bg-green-50' : selectedControl.status === CONTROL_STATUS.CANCELLED ? 'border-red-300 bg-red-50' : 'border-slate-200'">
									<div class="flex items-center justify-between mb-2">
										<span class="text-xs text-slate-600">状态</span>
										<span class="rounded-md px-3 py-1 text-xs font-medium" :class="controlStatusMeta[selectedControl.status].class">
											{{ controlStatusMeta[selectedControl.status].label }}
										</span>
									</div>
									<div v-if="selectedControl.status === CONTROL_STATUS.ACTIVE" class="flex items-start gap-2 text-xs text-green-700 mt-3 pt-3 border-t border-green-200">
										<svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
										</svg>
										<span>该调控正在生效中，影响范围内的操作正在执行</span>
									</div>
									<div v-else-if="selectedControl.status === CONTROL_STATUS.CANCELLED" class="flex items-start gap-2 text-xs text-red-700 mt-3 pt-3 border-t border-red-200">
										<svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
										</svg>
										<span>该调控已被取消，不再生效</span>
									</div>
									<div v-else class="flex items-start gap-2 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-200">
										<svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
										</svg>
										<span>该调控已完成执行</span>
									</div>
								</div>
							</div>

							<!-- 时间信息 -->
							<div>
								<h4 class="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
									<svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
									</svg>
									时间信息
								</h4>
								<div class="bg-white rounded-lg p-4 border border-slate-200 space-y-3 text-sm">
									<div>
										<div class="text-xs text-slate-500 mb-1">生效时间</div>
										<div class="font-medium text-slate-900">{{ selectedControl.startDate }}</div>
									</div>
									<div class="pt-2 border-t border-slate-200">
										<div class="text-xs text-slate-500 mb-1">结束时间</div>
										<div class="font-medium" :class="selectedControl.endDate ? 'text-slate-900' : 'text-blue-600'">
											{{ selectedControl.endDate || '永久生效' }}
										</div>
									</div>
									<div class="pt-2 border-t border-slate-200">
										<div class="text-xs text-slate-500 mb-1">创建时间</div>
										<div class="font-medium text-slate-700 text-xs">{{ selectedControl.createdAt }}</div>
									</div>
									<div class="pt-2 border-t border-slate-200">
										<div class="text-xs text-slate-500 mb-1">执行时间</div>
										<div class="font-medium text-slate-700 text-xs">{{ selectedControl.executedAt || '-' }}</div>
									</div>
								</div>
							</div>

							<!-- 操作人信息 -->
							<div>
								<h4 class="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
									<svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
									</svg>
									操作人员
								</h4>
								<div class="bg-white rounded-lg p-4 border border-slate-200">
									<div class="flex items-center gap-3">
										<div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
											<span class="text-red-600 font-semibold text-sm">{{ selectedControl.operatorName.substring(0, 2) }}</span>
										</div>
										<div class="flex-1 min-w-0">
											<div class="font-medium text-slate-900">{{ selectedControl.operatorName }}</div>
											<div class="text-xs text-slate-500 font-mono truncate">{{ selectedControl.operator }}</div>
										</div>
									</div>
								</div>
							</div>

							<!-- 影响范围说明 -->
							<div>
								<h4 class="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
									<svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd"/>
									</svg>
									影响范围
								</h4>
								<div class="bg-white rounded-lg p-4 border border-slate-200 text-sm text-slate-600">
									<div v-if="selectedControl.targetType === 'user'" class="space-y-1">
										<div class="flex items-start gap-2">
											<span class="text-red-600 mt-0.5">•</span>
											<span>仅影响该用户的AI量化产品订单</span>
										</div>
										<div class="flex items-start gap-2">
											<span class="text-red-600 mt-0.5">•</span>
											<span>不影响该用户的其他产品</span>
										</div>
									</div>
									<div v-else-if="selectedControl.targetType === 'product'" class="space-y-1">
										<div class="flex items-start gap-2">
											<span class="text-red-600 mt-0.5">•</span>
											<span>将影响该产品的所有用户订单</span>
										</div>
										<div class="flex items-start gap-2">
											<span class="text-red-600 mt-0.5">•</span>
											<span>包括新订单和已有订单</span>
										</div>
									</div>
									<div v-else class="space-y-1">
										<div class="flex items-start gap-2">
											<span class="text-red-600 mt-0.5">•</span>
											<span>影响整个系统的所有AI量化产品</span>
										</div>
										<div class="flex items-start gap-2">
											<span class="text-red-600 mt-0.5">•</span>
											<span>请务必谨慎操作</span>
										</div>
									</div>
								</div>
							</div>

							<!-- 操作记录 -->
							<div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
								<div class="flex items-start gap-2">
									<svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
									</svg>
									<div class="flex-1">
										<div class="text-sm font-medium text-amber-900 mb-1">记录说明</div>
										<ul class="text-xs text-amber-800 space-y-1">
											<li>• 所有调控操作均被永久记录</li>
											<li>• 可用于审计和追溯</li>
											<li>• 操作记录不可修改和删除</li>
										</ul>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- 底部操作栏 -->
				<footer class="flex justify-between items-center border-t border-slate-200 px-6 py-4 bg-slate-50 flex-shrink-0">
					<div class="text-xs text-slate-500">
						记录ID: <span class="font-mono">{{ selectedControl.id }}</span>
					</div>
					<div class="flex gap-3">
						<button 
							v-if="selectedControl.status === CONTROL_STATUS.ACTIVE" 
							@click="cancelControl(selectedControl); showDetailModal = false" 
							class="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm transition"
						>
							取消调控
						</button>
						<button 
							@click="showDetailModal = false" 
							class="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm transition"
						>
							关闭
						</button>
					</div>
				</footer>
			</article>
		</div>
	</section>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import {
	CONTROL_TYPE,
	controlTypeMeta,
	CONTROL_STATUS,
	controlStatusMeta,
	COMMON_FILTER_ALL
} from '../../constants/aiQuant'
import { createControlRecordsMock } from '../../mock/aiQuant'

const controls = ref(createControlRecordsMock())
const search = ref('')
const statusFilter = ref(COMMON_FILTER_ALL)

const showControlModal = ref(false)
const showDetailModal = ref(false)
const selectedControl = ref(null)

const controlForm = reactive({
	type: CONTROL_TYPE.USER_YIELD,
	title: '',
	targetId: '',
	adjustmentType: 'multiply',
	adjustmentValue: 1.0,
	startDate: new Date().toISOString().split('T')[0],
	endDate: '',
	reason: ''
})

// 根据调控类型自动获取目标类型
const currentTargetType = computed(() => {
	return controlTypeMeta[controlForm.type]?.targetType || 'user'
})

// 获取当前目标标签
const currentTargetLabel = computed(() => {
	return controlTypeMeta[controlForm.type]?.targetLabel || '目标ID'
})

// 获取当前目标占位符
const currentTargetPlaceholder = computed(() => {
	return controlTypeMeta[controlForm.type]?.targetPlaceholder || '输入目标ID'
})

// 是否为系统级操作
const isSystemLevel = computed(() => {
	return currentTargetType.value === 'system'
})

// 监听调控类型变化，自动设置系统级操作的目标ID
watch(() => controlForm.type, (newType) => {
	const targetType = controlTypeMeta[newType]?.targetType
	
	// 如果是系统级操作，自动设置目标ID
	if (targetType === 'system') {
		controlForm.targetId = 'SYSTEM'
	} else if (controlForm.targetId === 'SYSTEM') {
		// 如果从系统级切换到其他类型，清空目标ID
		controlForm.targetId = ''
	}
})

const openCreateControl = () => {
	controlForm.type = CONTROL_TYPE.USER_YIELD
	controlForm.targetId = ''
	controlForm.adjustmentType = 'multiply'
	controlForm.adjustmentValue = 1.0
	controlForm.startDate = new Date().toISOString().split('T')[0]
	controlForm.endDate = ''
	controlForm.reason = ''
	showControlModal.value = true
}

const saveControl = () => {
	const newControl = {
		id: `ctrl-${Date.now()}`,
		...controlForm,
		targetType: currentTargetType.value,
		status: CONTROL_STATUS.ACTIVE,
		operator: 'admin-001',
		operatorName: 'Current Admin',
		createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
		executedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
	}

	controls.value.unshift(newControl)
	showControlModal.value = false
}

const viewControlDetail = (control) => {
	selectedControl.value = control
	showDetailModal.value = true
}

const cancelControl = (control) => {
	const controlLabel = `${controlTypeMeta[control.type].label} (${control.targetId})`
	if (confirm(`确认取消调控操作 "${controlLabel}"？`)) {
		controls.value = controls.value.map(c =>
			c.id === control.id ? { ...c, status: CONTROL_STATUS.CANCELLED } : c
		)
	}
}

const filteredControls = computed(() => {
	const kw = search.value.trim().toLowerCase()
	return controls.value.filter(ctrl => {
		const matchStatus = statusFilter.value === COMMON_FILTER_ALL || ctrl.status === statusFilter.value
		const matchKeyword = !kw || `${ctrl.targetId} ${ctrl.reason}`.toLowerCase().includes(kw)
		return matchStatus && matchKeyword
	})
})

// 表单验证
const isFormValid = computed(() => {
	const hasTargetId = isSystemLevel.value || controlForm.targetId.trim() !== ''
	const hasReason = controlForm.reason.trim() !== ''
	return hasTargetId && hasReason
})

// 获取调控类型描述
const getControlTypeDescription = (type) => {
	return controlTypeMeta[type]?.description || '调控操作说明'
}

// 获取目标类型标签
const getTargetTypeLabel = (type) => {
	const labels = {
		user: '用户',
		product: '产品',
		system: '系统'
	}
	return labels[type] || type
}

// 获取调整方式标签
const getAdjustmentTypeLabel = (type) => {
	const labels = {
		multiply: '乘数倍率',
		add: '百分点加减',
		override: '强制覆盖',
		stop: '暂停交易',
		inject: '流动性注入'
	}
	return labels[type] || type
}

// 格式化调整数值
const formatAdjustmentValue = (type, value) => {
	if (!value) return '-'
	
	switch (type) {
		case 'multiply':
			return `×${value}`
		case 'add':
			return `${value > 0 ? '+' : ''}${value}%`
		case 'override':
			return `${value}%`
		case 'stop':
			return '暂停'
		case 'inject':
			return `${value.toLocaleString()} USDT`
		default:
			return value
	}
}
</script>
