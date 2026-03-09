<template>
	<section class="space-y-5">
		<header class="flex justify-between items-center">
			<div>
				<h1 class="text-3xl font-semibold text-slate-900">AI量化产品管理</h1>
				<p class="mt-1 text-sm text-slate-500">配置理财产品、收益阶梯及准入门槛</p>
			</div>
			<button @click="openCreateProduct" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition">
				+ 创建产品
			</button>
		</header>

		<!-- 筛选器 -->
		<div class="rounded-xl border border-slate-200 bg-white p-4">
			<div class="grid grid-cols-4 gap-4">
				<div>
					<input v-model="search" placeholder="搜索产品名称或币种" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
				</div>
				<div>
					<select v-model="statusFilter" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
						<option :value="COMMON_FILTER_ALL">全部状态</option>
						<option v-for="(meta, key) in productStatusMeta" :key="key" :value="key">{{ meta.label }}</option>
					</select>
				</div>
				<div>
					<select v-model="currencyFilter" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
						<option :value="COMMON_FILTER_ALL">全部币种</option>
						<option v-for="currency in SUPPORTED_CURRENCIES" :key="currency" :value="currency">{{ currency }}</option>
					</select>
				</div>
				<div>
					<select v-model="modeFilter" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
						<option :value="COMMON_FILTER_ALL">全部模式</option>
						<option v-for="(meta, key) in operationModeMeta" :key="key" :value="key">{{ meta.label }}</option>
					</select>
				</div>
			</div>
		</div>

		<!-- 产品列表 -->
		<article class="rounded-xl border border-slate-200 bg-white overflow-hidden">
			<table class="w-full">
				<thead class="bg-slate-50 border-b border-slate-200">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">产品信息</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">运营模式</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">收益阶梯</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">限购规则</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">运营数据</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">状态</th>
						<th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-200">
					<tr v-for="product in filteredProducts" :key="product.id" class="transition hover:bg-slate-50">
						<td class="px-6 py-4">
							<div>
								<div class="font-medium text-slate-900">{{ product.name }}</div>
								<div class="flex items-center gap-1.5 mt-0.5">
									<span class="text-xs text-slate-400 font-mono">{{ product.id }}</span>
									<button 
										@click="copyProductId(product.id)" 
										class="text-slate-400 hover:text-blue-600 transition p-0.5 rounded hover:bg-blue-50"
										title="复制产品ID"
									>
										<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
										</svg>
									</button>
								</div>
								<div class="text-sm text-slate-500 mt-1">{{ product.currency }} · {{ vipLevelMeta[product.minVipLevel].label }}+</div>
							</div>
						</td>
						<td class="px-6 py-4">
							<div class="text-sm">
								<div class="font-medium text-slate-900">{{ operationModeMeta[product.operationMode].label }}</div>
								<div class="text-xs text-slate-500">{{ settlementPeriodMeta[product.settlementPeriod].label }}</div>
							</div>
						</td>
						<td class="px-6 py-4">
							<div class="text-xs space-y-1">
								<div v-for="(tier, idx) in product.tiers" :key="idx" class="flex items-center justify-between">
									<span class="text-slate-600">{{ tier.minAmount }}-{{ tier.maxAmount }} {{ product.currency }}</span>
									<span class="font-medium text-green-600">{{ tier.dailyRate }}%</span>
								</div>
							</div>
						</td>
						<td class="px-6 py-4">
							<div class="text-sm text-slate-600">
								<div>额度: {{ product.limitAmount }} {{ product.currency }}</div>
								<div>次数: {{ product.monthlyLimitCount }}/月</div>
							</div>
						</td>
						<td class="px-6 py-4">
							<div class="text-sm text-slate-600">
								<div>锁定: {{ product.totalLocked }} {{ product.currency }}</div>
								<div>订单: {{ product.totalOrders }} 笔</div>
								<div class="text-green-600">收益: {{ product.totalYield }} {{ product.currency }}</div>
							</div>
						</td>
						<td class="px-6 py-4">
							<span :class="['px-2 py-1 text-xs rounded-full', productStatusMeta[product.status].color]">
								{{ productStatusMeta[product.status].label }}
							</span>
						</td>
						<td class="px-6 py-4 text-right">
							<button @click="openYieldAdjustment(product)" class="text-sm font-medium text-green-600 hover:text-green-800 transition mr-3">调整收益</button>
							<button @click="openEditProduct(product)" class="text-sm font-medium text-blue-600 hover:text-blue-800 transition mr-3">编辑</button>
							<button @click="toggleProductStatus(product)" class="text-sm font-medium text-slate-600 transition hover:text-slate-800">
								{{ product.status === PRODUCT_STATUS.ENABLED ? '禁用' : '启用' }}
							</button>
						</td>
					</tr>
				</tbody>
			</table>

			<div v-if="filteredProducts.length === 0" class="text-center py-12 text-slate-500">
				暂无产品数据
			</div>
		</article>

		<!-- 产品编辑弹窗 -->
		<div v-if="showProductModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showProductModal = false">
			<div class="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
				<!-- 弹窗头部 -->
				<div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
					<div>
						<h2 class="text-xl font-semibold text-slate-900">{{ editingProductId ? '编辑产品' : '创建产品' }}</h2>
						<p class="text-sm text-slate-500 mt-1">配置产品信息，右侧实时预览效果</p>
					</div>
					<button @click="showProductModal = false" class="text-slate-400 hover:text-slate-600">
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<!-- 弹窗主体：左右分栏 -->
				<div class="flex-1 flex overflow-hidden">
					<!-- 左侧：表单编辑区域 (60%) -->
					<div class="w-3/5 border-r border-slate-200 flex flex-col">
						<div class="flex-1 overflow-y-auto p-6 space-y-6">
							<!-- 基础信息 -->
							<div>
								<h3 class="font-semibold text-slate-900 mb-3">基础信息</h3>
								<div class="grid grid-cols-2 gap-4">
									<div>
										<label class="block text-sm font-medium text-slate-700 mb-1">产品名称</label>
										<input v-model="productForm.name" placeholder="例如：BTC 智能量化基金 A" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
									</div>
									<div>
										<label class="block text-sm font-medium text-slate-700 mb-1">计价币种</label>
										<select v-model="productForm.currency" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
											<option v-for="currency in SUPPORTED_CURRENCIES" :key="currency" :value="currency">{{ currency }}</option>
										</select>
									</div>
									<div>
										<label class="block text-sm font-medium text-slate-700 mb-1">运营模式</label>
										<select v-model="productForm.operationMode" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
											<option v-for="(meta, key) in operationModeMeta" :key="key" :value="key">{{ meta.label }}</option>
										</select>
									</div>
									<div>
										<label class="block text-sm font-medium text-slate-700 mb-1">最低 VIP 等级</label>
										<select v-model="productForm.minVipLevel" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
											<option v-for="(meta, key) in vipLevelMeta" :key="key" :value="Number(key)">{{ meta.label }}</option>
										</select>
									</div>
								</div>
							</div>

							<!-- 结算周期 -->
							<div>
								<h3 class="font-semibold text-slate-900 mb-3">结算周期</h3>
								<div class="grid grid-cols-2 gap-4">
									<div>
										<label class="block text-sm font-medium text-slate-700 mb-1">周期类型</label>
										<select v-model="productForm.settlementPeriod" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
											<option v-for="(meta, key) in settlementPeriodMeta" :key="key" :value="key">{{ meta.label }}</option>
										</select>
									</div>
									<div v-if="productForm.settlementPeriod === SETTLEMENT_PERIOD.CUSTOM">
										<label class="block text-sm font-medium text-slate-700 mb-1">自定义天数</label>
										<input v-model.number="productForm.customDays" type="number" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
									</div>
								</div>
							</div>

							<!-- 收益阶梯 -->
							<div>
								<div class="flex justify-between items-center mb-3">
									<h3 class="font-semibold text-slate-900">收益阶梯配置</h3>
									<button @click="addTier" class="text-sm font-medium text-blue-600 hover:text-blue-800 transition">+ 添加阶梯</button>
								</div>
								<div class="space-y-3">
									<div v-for="(tier, idx) in productForm.tiers" :key="idx" class="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
										<div class="flex-1 space-y-2">
											<div class="grid grid-cols-2 gap-2">
												<input v-model.number="tier.minAmount" placeholder="最小金额" type="number" step="0.01" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
												<input v-model.number="tier.maxAmount" placeholder="最大金额" type="number" step="0.01" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
											</div>
											<div class="grid grid-cols-2 gap-2">
												<input v-model.number="tier.dailyRate" placeholder="日收益率 %" type="number" step="0.01" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
												<input v-model="tier.label" placeholder="阶梯名称" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
											</div>
										</div>
										<button @click="removeTier(idx)" class="text-red-600 hover:text-red-800 text-sm mt-2">删除</button>
									</div>
								</div>
							</div>

							<!-- 赎回规则 -->
							<div>
								<h3 class="font-semibold text-slate-900 mb-3">赎回规则</h3>
								<div class="space-y-3">
									<label class="flex items-center">
										<input v-model="productForm.earlyRedeemEnabled" type="checkbox" class="mr-2 rounded border-slate-300" />
										<span class="text-sm text-slate-700">允许提前赎回</span>
									</label>
									<div v-if="productForm.earlyRedeemEnabled">
										<label class="block text-sm font-medium text-slate-700 mb-1">提前赎回手续费 (%)</label>
										<input v-model.number="productForm.earlyRedeemFeePercent" type="number" step="0.1" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
									</div>
								</div>
							</div>

							<!-- 限购规则 -->
							<div>
								<h3 class="font-semibold text-slate-900 mb-3">限购规则</h3>
								<div class="grid grid-cols-3 gap-4">
									<div>
										<label class="block text-sm font-medium text-slate-700 mb-1">单用户最大持仓</label>
										<input v-model.number="productForm.limitAmount" type="number" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
									</div>
									<div>
										<label class="block text-sm font-medium text-slate-700 mb-1">产品总限额</label>
										<input v-model.number="productForm.limitCount" type="number" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
									</div>
									<div>
										<label class="block text-sm font-medium text-slate-700 mb-1">月限购次数</label>
										<input v-model.number="productForm.monthlyLimitCount" type="number" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
									</div>
								</div>
							</div>

							<!-- 产品状态 -->
							<div>
								<label class="block text-sm font-medium text-slate-700 mb-1">产品状态</label>
								<select v-model="productForm.status" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
									<option v-for="(meta, key) in productStatusMeta" :key="key" :value="key">{{ meta.label }}</option>
								</select>
							</div>
						</div>
					</div>

					<!-- 右侧：实时预览区域 (40%) -->
					<div class="w-2/5 bg-slate-50 flex flex-col">
						<div class="flex-1 overflow-y-auto p-6 space-y-4">
							<!-- 产品卡片预览 -->
							<div>
								<h4 class="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
									<svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
										<path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
										<path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
									</svg>
									产品卡片预览
								</h4>
								<div class="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
									<div class="flex items-start justify-between">
										<div class="flex items-center gap-3">
											<div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
												{{ productForm.currency.slice(0, 1) }}
											</div>
											<div>
												<div class="font-semibold text-slate-900">{{ productForm.name || '产品名称' }}</div>
												<div class="text-xs text-slate-500">{{ productForm.currency }} · {{ vipLevelMeta[productForm.minVipLevel].label }}+</div>
											</div>
										</div>
										<span :class="['px-2 py-1 text-xs rounded-full', productStatusMeta[productForm.status].color]">
											{{ productStatusMeta[productForm.status].label }}
										</span>
									</div>
									<div class="flex items-center justify-between text-sm pt-2 border-t border-slate-200">
										<span class="text-slate-600">运营模式</span>
										<span class="font-medium text-slate-900">{{ operationModeMeta[productForm.operationMode].label }}</span>
									</div>
									<div class="flex items-center justify-between text-sm">
										<span class="text-slate-600">结算周期</span>
										<span class="font-medium text-slate-900">{{ settlementPeriodMeta[productForm.settlementPeriod].label }}</span>
									</div>
								</div>
							</div>

							<!-- 收益阶梯预览 -->
							<div>
								<h4 class="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
									<svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd"/>
									</svg>
									收益阶梯预览
								</h4>
								<div class="bg-white border border-slate-200 rounded-xl p-4">
									<div v-if="productForm.tiers.length === 0" class="text-center py-6 text-slate-400 text-sm">
										暂无收益阶梯配置
									</div>
									<div v-else class="space-y-2">
										<div v-for="(tier, idx) in productForm.tiers" :key="idx" class="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
											<div class="flex-1">
												<div class="text-xs font-medium text-slate-900 mb-1">{{ tier.label || `阶梯 ${idx + 1}` }}</div>
												<div class="text-xs text-slate-600">{{ tier.minAmount }} - {{ tier.maxAmount }} {{ productForm.currency }}</div>
											</div>
											<div class="text-right">
												<div class="text-sm font-semibold text-green-600">{{ tier.dailyRate }}%</div>
												<div class="text-xs text-slate-500">日利率</div>
											</div>
										</div>
									</div>
								</div>
							</div>

							<!-- 收益计算器 -->
							<div>
								<h4 class="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
									<svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
										<path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
										<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
									</svg>
									收益计算示例
								</h4>
								<div class="bg-white border border-slate-200 rounded-xl p-4">
									<div v-if="productForm.tiers.length === 0" class="text-center py-6 text-slate-400 text-sm">
										配置收益阶梯后查看示例
									</div>
									<div v-else class="space-y-3">
										<div v-for="(tier, idx) in productForm.tiers.slice(0, 2)" :key="idx" class="p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
											<div class="text-xs text-slate-600 mb-2">{{ tier.label || `阶梯 ${idx + 1}` }} 示例</div>
											<div class="space-y-1 text-xs">
												<div class="flex justify-between">
													<span class="text-slate-600">投资金额</span>
													<span class="font-medium text-slate-900">{{ tier.minAmount }} {{ productForm.currency }}</span>
												</div>
												<div class="flex justify-between">
													<span class="text-slate-600">日收益</span>
													<span class="font-medium text-green-600">{{ (tier.minAmount * tier.dailyRate / 100).toFixed(2) }} {{ productForm.currency }}</span>
												</div>
												<div class="flex justify-between">
													<span class="text-slate-600">30天收益</span>
													<span class="font-semibold text-green-600">{{ (tier.minAmount * tier.dailyRate / 100 * 30).toFixed(2) }} {{ productForm.currency }}</span>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>

							<!-- 规则说明预览 -->
							<div>
								<h4 class="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
									<svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
									</svg>
									规则说明
								</h4>
								<div class="bg-white border border-slate-200 rounded-xl p-4 space-y-2 text-xs text-slate-600">
									<div class="flex items-start gap-2">
										<span class="text-blue-600 mt-0.5">•</span>
										<span>单用户最大持仓：{{ productForm.limitAmount }} {{ productForm.currency }}</span>
									</div>
									<div class="flex items-start gap-2">
										<span class="text-blue-600 mt-0.5">•</span>
										<span>每月限购次数：{{ productForm.monthlyLimitCount }} 次</span>
									</div>
									<div v-if="productForm.earlyRedeemEnabled" class="flex items-start gap-2">
										<span class="text-blue-600 mt-0.5">•</span>
										<span>提前赎回手续费：{{ productForm.earlyRedeemFeePercent }}%</span>
									</div>
									<div v-else class="flex items-start gap-2">
										<span class="text-orange-600 mt-0.5">•</span>
										<span class="text-orange-600">不支持提前赎回</span>
									</div>
									<div class="flex items-start gap-2">
										<span class="text-blue-600 mt-0.5">•</span>
										<span>结算周期：{{ settlementPeriodMeta[productForm.settlementPeriod].label }}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- 底部操作栏 -->
				<div class="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 flex-shrink-0">
					<button @click="showProductModal = false" class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">取消</button>
					<button @click="saveProduct" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition">保存产品</button>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
	PRODUCT_STATUS,
	productStatusMeta,
	COMMON_FILTER_ALL,
	SUPPORTED_CURRENCIES,
	vipLevelMeta,
	operationModeMeta,
	settlementPeriodMeta,
	SETTLEMENT_PERIOD,
	OPERATION_MODE,
	VIP_LEVEL
} from '../../constants/aiQuant'
import { createAiQuantProductsMock } from '../../mock/aiQuant'

const router = useRouter()

const products = ref(createAiQuantProductsMock())
const search = ref('')
const statusFilter = ref(COMMON_FILTER_ALL)
const currencyFilter = ref(COMMON_FILTER_ALL)
const modeFilter = ref(COMMON_FILTER_ALL)

const showProductModal = ref(false)
const editingProductId = ref('')

const productForm = reactive({
	name: '',
	currency: 'USDT',
	operationMode: OPERATION_MODE.INTERNAL,
	settlementPeriod: SETTLEMENT_PERIOD.DAILY,
	customDays: 1,
	minVipLevel: VIP_LEVEL.VIP0,
	tiers: [],
	earlyRedeemEnabled: true,
	earlyRedeemFeePercent: 3,
	limitAmount: 100000,
	limitCount: 100,
	monthlyLimitCount: 5,
	status: PRODUCT_STATUS.ENABLED
})

const openCreateProduct = () => {
	editingProductId.value = ''
	productForm.name = ''
	productForm.currency = 'USDT'
	productForm.operationMode = OPERATION_MODE.INTERNAL
	productForm.settlementPeriod = SETTLEMENT_PERIOD.DAILY
	productForm.customDays = 1
	productForm.minVipLevel = VIP_LEVEL.VIP0
	productForm.tiers = [{ minAmount: 100, maxAmount: 10000, dailyRate: 0.15, label: '标准级' }]
	productForm.earlyRedeemEnabled = true
	productForm.earlyRedeemFeePercent = 3
	productForm.limitAmount = 100000
	productForm.limitCount = 100
	productForm.monthlyLimitCount = 5
	productForm.status = PRODUCT_STATUS.ENABLED
	showProductModal.value = true
}

const openEditProduct = (product) => {
	editingProductId.value = product.id
	productForm.name = product.name
	productForm.currency = product.currency
	productForm.operationMode = product.operationMode
	productForm.settlementPeriod = product.settlementPeriod
	productForm.customDays = product.customDays
	productForm.minVipLevel = product.minVipLevel
	productForm.tiers = product.tiers.map(t => ({ ...t }))
	productForm.earlyRedeemEnabled = product.earlyRedeemEnabled
	productForm.earlyRedeemFeePercent = product.earlyRedeemFeePercent
	productForm.limitAmount = product.limitAmount
	productForm.limitCount = product.limitCount
	productForm.monthlyLimitCount = product.monthlyLimitCount
	productForm.status = product.status
	showProductModal.value = true
}

const addTier = () => {
	productForm.tiers.push({ minAmount: 0, maxAmount: 0, dailyRate: 0, label: '' })
}

const removeTier = (index) => {
	productForm.tiers.splice(index, 1)
}

const saveProduct = () => {
	const payload = {
		...productForm,
		icon: productForm.currency === 'USDT' ? '₮' : productForm.currency === 'BTC' ? '₿' : productForm.currency === 'ETH' ? 'Ξ' : productForm.currency
	}

	if (editingProductId.value) {
		products.value = products.value.map(p => p.id === editingProductId.value ? { ...p, ...payload } : p)
	} else {
		products.value.unshift({
			id: `aiq-prod-${Date.now()}`,
			...payload,
			totalLocked: 0,
			totalOrders: 0,
			totalYield: 0,
			createdAt: new Date().toISOString().split('T')[0]
		})
	}

	showProductModal.value = false
}

const toggleProductStatus = (product) => {
	const newStatus = product.status === PRODUCT_STATUS.ENABLED ? PRODUCT_STATUS.DISABLED : PRODUCT_STATUS.ENABLED
	products.value = products.value.map(p => p.id === product.id ? { ...p, status: newStatus } : p)
}

const openYieldAdjustment = (product) => {
	router.push({
		path: '/ai-quant/yield-adjustment',
		query: {
			productId: product.id,
			productName: product.name,
			currency: product.currency
		}
	})
}

const copyProductId = async (productId) => {
	try {
		await navigator.clipboard.writeText(productId)
		alert('产品ID已复制到剪贴板')
	} catch (err) {
		console.error('复制失败:', err)
		// 降级方案：使用传统方法
		const textarea = document.createElement('textarea')
		textarea.value = productId
		textarea.style.position = 'fixed'
		textarea.style.opacity = '0'
		document.body.appendChild(textarea)
		textarea.select()
		try {
			document.execCommand('copy')
			alert('产品ID已复制到剪贴板')
		} catch (e) {
			alert('复制失败，请手动复制')
		}
		document.body.removeChild(textarea)
	}
}

const filteredProducts = computed(() => {
	const kw = search.value.trim().toLowerCase()
	return products.value.filter(p => {
		const matchStatus = statusFilter.value === COMMON_FILTER_ALL || p.status === statusFilter.value
		const matchCurrency = currencyFilter.value === COMMON_FILTER_ALL || p.currency === currencyFilter.value
		const matchMode = modeFilter.value === COMMON_FILTER_ALL || p.operationMode === modeFilter.value
		const matchKeyword = !kw || `${p.name} ${p.currency}`.toLowerCase().includes(kw)
		return matchStatus && matchCurrency && matchMode && matchKeyword
	})
})
</script>
