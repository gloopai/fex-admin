<template>
  <section class="space-y-4">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl font-semibold text-slate-900">产品管理</h1>
        <p class="mt-1 text-sm text-slate-500">管理抵押借贷产品配置、利率与风控参数</p>
      </div>
      <button type="button" class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700" @click="showAddProduct">
        + 添加产品
      </button>
    </header>

    <article class="rounded-xl border border-slate-200 bg-white">
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-4">
        <div class="flex flex-wrap items-center gap-2">
          <select v-model="filters.collateralType" class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500">
            <option value="">全部抵押币种</option>
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
            <option value="USDT">USDT</option>
            <option value="BNB">BNB</option>
          </select>
          <select v-model="filters.status" class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500">
            <option value="">全部状态</option>
            <option value="active">活跃</option>
            <option value="inactive">停用</option>
            <option value="suspended">暂停</option>
          </select>
          <select v-model="filters.interestRateType" class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500">
            <option value="">全部利率类型</option>
            <option value="fixed">固定利率</option>
            <option value="floating">浮动利率</option>
            <option value="tiered">阶梯利率</option>
          </select>
          <button type="button" class="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50" @click="resetFilters">重置</button>
        </div>

        <div class="relative w-full max-w-sm">
          <input
            v-model="searchKeyword"
            type="text"
            class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
            placeholder="搜索产品名称或代码..."
          />
          <svg viewBox="0 0 20 20" class="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none">
            <circle cx="9" cy="9" r="5.8" stroke="currentColor" stroke-width="1.6" />
            <path d="M13.6 13.6L16.4 16.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
        </div>
      </div>

      <div class="space-y-4 p-4">
        <article v-for="product in filteredProducts" :key="product.productId" class="rounded-xl border border-slate-200 bg-white">
          <div class="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 p-4">
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-semibold text-slate-900">{{ product.productName }}</h3>
                <span class="text-sm text-slate-500">{{ product.productId }}</span>
                <span 
                  class="rounded-md px-2 py-0.5 text-xs font-medium"
                  :class="{
                    'bg-emerald-50 text-emerald-700': product.status === 'active',
                    'bg-slate-100 text-slate-600': product.status === 'inactive',
                    'bg-amber-50 text-amber-700': product.status === 'suspended'
                  }"
                >
                  {{ statusLabel(product.status) }}
                </span>
                <span class="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {{ interestRateTypeLabel(product.interestRateType) }}
                </span>
              </div>
              <p class="mt-2 text-sm text-slate-700">
                抵押借贷: 
                <span class="font-medium">{{ product.collateralType }}</span>
                <span class="mx-1 text-slate-400">→</span>
                <span class="font-medium">{{ product.loanCurrency }}</span>
                <span class="mx-3 text-slate-300">|</span>
                <!-- 固定利率 -->
                <template v-if="product.interestRateType === 'fixed'">
                  年化利率: <span class="font-medium text-emerald-600">{{ product.interestRate }}%</span>
                </template>
                <!-- 浮动利率 -->
                <template v-else-if="product.interestRateType === 'floating' && product.floatingRateConfig">
                  利率范围: <span class="font-medium text-blue-600">{{ product.floatingRateConfig.minRate }}% - {{ product.floatingRateConfig.maxRate }}%</span>
                </template>
                <!-- 阶梯利率 -->
                <template v-else-if="product.interestRateType === 'tiered'">
                  <span class="font-medium text-purple-600">阶梯计费</span>
                </template>
                <!-- 兜底显示 -->
                <template v-else>
                  年化利率: <span class="font-medium text-emerald-600">{{ product.interestRate }}%</span>
                </template>
                <span class="mx-3 text-slate-300">|</span>
                LTV: <span class="font-medium">{{ product.ltvRatio }}%</span>
                <span class="mx-3 text-slate-300">|</span>
                清算阈值: <span class="font-medium">{{ product.liquidationThreshold }}%</span>
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button 
                type="button" 
                class="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-100"
                @click="editProduct(product)"
              >
                编辑
              </button>
              <button 
                type="button" 
                class="rounded-lg border px-3 py-1.5 text-sm"
                :class="product.status === 'active' ? 'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100' : 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'"
                @click="toggleProductStatus(product)"
              >
                {{ product.status === 'active' ? '暂停' : '启用' }}
              </button>
            </div>
          </div>

          <div class="grid gap-0 md:grid-cols-3">
            <div class="border-b border-slate-200 p-4 md:border-b-0 md:border-r">
              <p class="text-sm text-slate-500">借款范围</p>
              <ul class="mt-2 space-y-1 text-sm text-slate-700">
                <li><span class="font-medium">最小:</span> {{ formatCurrency(product.minLoanAmount) }}</li>
                <li><span class="font-medium">最大:</span> {{ formatCurrency(product.maxLoanAmount) }}</li>
              </ul>
            </div>
            <div class="border-b border-slate-200 p-4 md:border-b-0 md:border-r">
              <p class="text-sm text-slate-500">资金状况</p>
              <ul class="mt-2 space-y-1 text-sm text-slate-700">
                <li><span class="font-medium">总借出:</span> {{ formatCurrency(product.totalLent) }}</li>
                <li><span class="font-medium">可用流动性:</span> <span class="text-emerald-600">{{ formatCurrency(product.availableLiquidity) }}</span></li>
              </ul>
            </div>
            <div class="p-4">
              <p class="text-sm text-slate-500">使用情况</p>
              <ul class="mt-2 space-y-1 text-sm text-slate-700">
                <li><span class="font-medium">活跃用户:</span> {{ product.activeUsers }} 人</li>
                <li><span class="font-medium">活跃订单:</span> {{ product.activeOrders || 0 }} 单</li>
              </ul>
            </div>
          </div>
        </article>

        <p v-if="filteredProducts.length === 0" class="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          没有匹配的借贷产品
        </p>
      </div>
    </article>

    <!-- 产品编辑模态框 - 左右布局 -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" @click.self="closeModal">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <!-- 弹窗头部 -->
        <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 class="text-xl font-semibold text-slate-900">{{ isEditing ? '编辑产品' : '新增产品' }}</h2>
            <p class="text-sm text-slate-500 mt-1">配置借贷产品参数并实时预览</p>
          </div>
          <button type="button" class="text-slate-400 hover:text-slate-600" @click="closeModal">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 弹窗主体：左右分栏 -->
        <div class="flex-1 flex overflow-hidden">
          <!-- 左侧：产品设置区域 (60%) -->
          <div class="w-3/5 border-r border-slate-200 flex flex-col">
            <!-- Tab 导航 -->
            <div class="border-b border-slate-200 px-6">
              <div class="flex gap-1">
                <button
                  type="button"
                  @click="activeTab = 'basic'"
                  class="px-4 py-3 text-sm font-medium border-b-2 transition-colors"
                  :class="activeTab === 'basic' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-600 hover:text-slate-900'"
                >
                  基本配置
                </button>
                <button
                  type="button"
                  @click="activeTab = 'interest'"
                  class="px-4 py-3 text-sm font-medium border-b-2 transition-colors"
                  :class="activeTab === 'interest' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-600 hover:text-slate-900'"
                >
                  利率设置
                </button>
                <button
                  type="button"
                  @click="activeTab = 'risk'"
                  class="px-4 py-3 text-sm font-medium border-b-2 transition-colors"
                  :class="activeTab === 'risk' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-600 hover:text-slate-900'"
                >
                  风控设置
                </button>
                <button
                  type="button"
                  @click="activeTab = 'other'"
                  class="px-4 py-3 text-sm font-medium border-b-2 transition-colors"
                  :class="activeTab === 'other' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-600 hover:text-slate-900'"
                >
                  其他信息
                </button>
              </div>
            </div>

            <div class="flex-1 overflow-y-auto p-6">
              <!-- Tab 1: 基本配置 -->
              <div v-show="activeTab === 'basic'" class="space-y-6">
                <!-- 基本信息 -->
                <div>
                  <h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                    </svg>
                    基本信息
                  </h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1.5">产品名称</label>
                      <input 
                        v-model="formData.productName" 
                        type="text" 
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="例如：BTC质押USDT借贷"
                      />
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1.5">抵押币种</label>
                        <select 
                          v-model="formData.collateralType" 
                          class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">请选择</option>
                          <option value="BTC">BTC</option>
                          <option value="ETH">ETH</option>
                          <option value="USDT">USDT</option>
                          <option value="BNB">BNB</option>
                          <option value="SOL">SOL</option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1.5">借出币种</label>
                        <select 
                          v-model="formData.loanCurrency" 
                          class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">请选择</option>
                          <option value="USDT">USDT</option>
                          <option value="USDC">USDC</option>
                          <option value="DAI">DAI</option>
                          <option value="BTC">BTC</option>
                          <option value="ETH">ETH</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 借款额度 -->
                <div>
                  <h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
                    </svg>
                    借款额度
                  </h3>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1.5">最小借款额</label>
                      <input 
                        v-model.number="formData.minLoanAmount" 
                        type="number" 
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="1000"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1.5">最大借款额</label>
                      <input 
                        v-model.number="formData.maxLoanAmount" 
                        type="number" 
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="500000"
                      />
                    </div>
                  </div>
                </div>

                <!-- 期限设置 -->
                <div>
                  <h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                    </svg>
                    期限设置
                  </h3>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1.5">最短期限 (天)</label>
                      <input 
                        v-model.number="formData.minLoanDuration" 
                        type="number" 
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="7"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1.5">最长期限 (天)</label>
                      <input 
                        v-model.number="formData.maxLoanDuration" 
                        type="number" 
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="90"
                      />
                    </div>
                  </div>
                </div>

                <!-- 产品状态 -->
                <div>
                  <h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
                    </svg>
                    产品状态
                  </h3>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1.5">状态</label>
                    <select 
                      v-model="formData.status" 
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">活跃</option>
                      <option value="inactive">停用</option>
                      <option value="suspended">暂停</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Tab 2: 利率设置 -->
              <div v-show="activeTab === 'interest'" class="space-y-6">
                <!-- 利率设置 -->
                <div>
                  <h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                    </svg>
                    利率设置
                  </h3>
                  <div class="space-y-4">
                    <!-- 利率类型选择 -->
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1.5">利率类型</label>
                      <select 
                        v-model="formData.interestRateType" 
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="fixed">固定利率</option>
                        <option value="floating">浮动利率</option>
                        <option value="tiered">阶梯利率</option>
                      </select>
                    </div>

                    <!-- 固定利率配置 -->
                    <div v-if="formData.interestRateType === 'fixed'">
                      <label class="block text-sm font-medium text-slate-700 mb-1.5">年化利率 (%)</label>
                      <input 
                        v-model.number="formData.interestRate" 
                        type="number" 
                        step="0.01"
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="8.50"
                      />
                    </div>

                    <!-- 浮动利率配置 -->
                    <div v-if="formData.interestRateType === 'floating'" class="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <!-- 基准设置 -->
                      <div>
                        <h4 class="text-xs font-semibold text-slate-800 mb-2">基准设置</h4>
                        <div class="grid grid-cols-2 gap-3">
                          <div>
                            <label class="block text-xs font-medium text-slate-700 mb-1">参考利率</label>
                            <select 
                              v-model="formData.floatingRateConfig.referenceRate" 
                              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                              <option value="internal">内部基准</option>
                              <option value="libor">LIBOR</option>
                              <option value="sofr">SOFR</option>
                              <option value="fed">联邦基金利率</option>
                            </select>
                          </div>
                          <div>
                            <label class="block text-xs font-medium text-slate-700 mb-1">基准利率 (%)</label>
                            <input 
                              v-model.number="formData.floatingRateConfig.baseRate" 
                              type="number" 
                              step="0.01"
                              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="8.00"
                            />
                          </div>
                        </div>
                      </div>

                      <!-- 利率计算 -->
                      <div>
                        <h4 class="text-xs font-semibold text-slate-800 mb-2">利率计算</h4>
                        <div class="grid grid-cols-2 gap-3">
                          <div>
                            <label class="block text-xs font-medium text-slate-700 mb-1">浮动系数</label>
                            <input 
                              v-model.number="formData.floatingRateConfig.floatingFactor" 
                              type="number" 
                              step="0.1"
                              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="1.0"
                            />
                          </div>
                          <div>
                            <label class="block text-xs font-medium text-slate-700 mb-1">利差 (%)</label>
                            <input 
                              v-model.number="formData.floatingRateConfig.spread" 
                              type="number" 
                              step="0.1"
                              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="2.0"
                            />
                          </div>
                        </div>
                        <div class="mt-2 p-2 bg-white rounded border border-blue-200">
                          <p class="text-xs text-slate-600">
                            实际利率 = (基准利率 × 浮动系数) + 利差
                          </p>
                          <p class="text-xs font-semibold text-blue-700 mt-1">
                            当前预计: {{ ((formData.floatingRateConfig.baseRate * formData.floatingRateConfig.floatingFactor) + formData.floatingRateConfig.spread).toFixed(2) }}%
                          </p>
                        </div>
                      </div>

                      <!-- 利率限制 -->
                      <div>
                        <h4 class="text-xs font-semibold text-slate-800 mb-2">利率限制</h4>
                        <div class="grid grid-cols-2 gap-3">
                          <div>
                            <label class="block text-xs font-medium text-slate-700 mb-1">最低利率 (%)</label>
                            <input 
                              v-model.number="formData.floatingRateConfig.minRate" 
                              type="number" 
                              step="0.01"
                              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="5.00"
                            />
                          </div>
                          <div>
                            <label class="block text-xs font-medium text-slate-700 mb-1">最高利率 (%)</label>
                            <input 
                              v-model.number="formData.floatingRateConfig.maxRate" 
                              type="number" 
                              step="0.01"
                              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="15.00"
                            />
                          </div>
                        </div>
                      </div>

                      <!-- 调整规则 -->
                      <div>
                        <h4 class="text-xs font-semibold text-slate-800 mb-2">调整规则</h4>
                        <div class="grid grid-cols-2 gap-3">
                          <div>
                            <label class="block text-xs font-medium text-slate-700 mb-1">调整周期</label>
                            <select 
                              v-model="formData.floatingRateConfig.adjustmentPeriod" 
                              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                              <option value="daily">每日调整</option>
                              <option value="weekly">每周调整</option>
                              <option value="monthly">每月调整</option>
                            </select>
                          </div>
                          <div>
                            <label class="block text-xs font-medium text-slate-700 mb-1">调整阈值 (%)</label>
                            <input 
                              v-model.number="formData.floatingRateConfig.adjustmentThreshold" 
                              type="number" 
                              step="0.1"
                              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="0.5"
                            />
                          </div>
                        </div>
                        <div class="mt-2">
                          <label class="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                            <input 
                              v-model="formData.floatingRateConfig.autoAdjust" 
                              type="checkbox" 
                              class="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span>启用自动调整（当市场利率变化超过阈值时自动调整）</span>
                          </label>
                        </div>
                      </div>

                      <div class="pt-2 border-t border-blue-200">
                        <p class="text-xs text-blue-700">💡 浮动利率根据市场条件自动调整，确保利率既有竞争力又能控制风险</p>
                      </div>
                    </div>

                    <!-- 阶梯利率配置 -->
                    <div v-if="formData.interestRateType === 'tiered'" class="space-y-3">
                      <div class="flex items-center justify-between">
                        <label class="text-xs font-medium text-slate-700">借款金额阶梯</label>
                        <button 
                          type="button"
                          @click="formData.tieredRateConfig.tiers.push({ minAmount: 0, maxAmount: 0, rate: 0 })"
                          class="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          + 添加阶梯
                        </button>
                      </div>
                      <div 
                        v-for="(tier, index) in formData.tieredRateConfig.tiers" 
                        :key="index"
                        class="p-3 bg-purple-50 rounded-lg border border-purple-200 space-y-2"
                      >
                        <div class="flex items-center justify-between">
                          <span class="text-xs font-medium text-purple-700">阶梯 {{ index + 1 }}</span>
                          <button 
                            v-if="formData.tieredRateConfig.tiers.length > 1"
                            type="button"
                            @click="formData.tieredRateConfig.tiers.splice(index, 1)"
                            class="text-xs text-red-600 hover:text-red-700"
                          >
                            删除
                          </button>
                        </div>
                        <div class="grid grid-cols-3 gap-2">
                          <div>
                            <label class="block text-xs text-slate-600 mb-1">最小金额</label>
                            <input 
                              v-model.number="tier.minAmount" 
                              type="number" 
                              class="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label class="block text-xs text-slate-600 mb-1">最大金额</label>
                            <input 
                              v-model.number="tier.maxAmount" 
                              type="number" 
                              class="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label class="block text-xs text-slate-600 mb-1">利率 (%)</label>
                            <input 
                              v-model.number="tier.rate" 
                              type="number" 
                              step="0.01"
                              class="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                      <p class="text-xs text-purple-700 mt-2">💡 阶梯利率根据借款金额自动匹配对应档位的利率</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tab 3: 风控设置 -->
              <div v-show="activeTab === 'risk'" class="space-y-6">
                <!-- 风控参数 -->
                <div>
                  <h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    风控参数
                  </h3>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1.5">LTV比率 (%)</label>
                      <input 
                        v-model.number="formData.ltvRatio" 
                        type="number" 
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="75"
                      />
                      <p class="mt-1 text-xs text-slate-500">贷款价值比率，建议50-75%</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1.5">清算阈值 (%)</label>
                      <input 
                        v-model.number="formData.liquidationThreshold" 
                        type="number" 
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="85"
                      />
                      <p class="mt-1 text-xs text-slate-500">必须大于LTV，建议80-90%</p>
                    </div>
                  </div>
                </div>

                <!-- 流动性管理 -->
                <div>
                  <h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                    </svg>
                    流动性管理
                  </h3>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1.5">可用流动性</label>
                    <input 
                      v-model.number="formData.availableLiquidity" 
                      type="number" 
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1000000"
                    />
                    <p class="mt-1 text-xs text-slate-500">设置该产品可用于借贷的总资金池</p>
                  </div>
                </div>
              </div>

              <!-- Tab 4: 其他信息 -->
              <div v-show="activeTab === 'other'" class="space-y-6">
                <!-- 产品描述 -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">产品描述</label>
                  <textarea 
                    v-model="formData.description" 
                    rows="3"
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="详细描述该借贷产品的特点和适用场景..."
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- 左侧底部按钮 -->
            <div class="flex items-center justify-end gap-3 border-t border-slate-200 p-4">
              <button 
                type="button" 
                class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                @click="closeModal"
              >
                取消
              </button>
              <button 
                type="button" 
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                @click="saveProduct"
              >
                {{ isEditing ? '保存修改' : '创建产品' }}
              </button>
            </div>
          </div>

          <!-- 右侧：实时预览区域 (40%) -->
          <div class="w-2/5 bg-slate-50 flex flex-col">
            <div class="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <h4 class="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                  </svg>
                  产品预览
                </h4>

                <!-- 产品卡片预览 -->
                <article class="rounded-xl border border-slate-200 bg-white">
                  <div class="border-b border-slate-200 p-4">
                    <div class="flex items-center gap-2 mb-2">
                      <h3 class="text-lg font-semibold text-slate-900">
                        {{ formData.productName || '未命名产品' }}
                      </h3>
                      <span 
                        class="rounded-md px-2 py-0.5 text-xs font-medium"
                        :class="{
                          'bg-emerald-50 text-emerald-700': formData.status === 'active',
                          'bg-slate-100 text-slate-600': formData.status === 'inactive',
                          'bg-amber-50 text-amber-700': formData.status === 'suspended'
                        }"
                      >
                        {{ statusLabel(formData.status) }}
                      </span>
                      <span class="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {{ interestRateTypeLabel(formData.interestRateType) }}
                      </span>
                    </div>
                    <p class="text-sm text-slate-700">
                      抵押借贷: 
                      <span class="font-medium">{{ formData.collateralType || '-' }}</span>
                      <span class="mx-1 text-slate-400">→</span>
                      <span class="font-medium">{{ formData.loanCurrency || '-' }}</span>
                    </p>
                  </div>

                  <div class="p-4 space-y-3">
                    <!-- 固定利率显示 -->
                    <div v-if="formData.interestRateType === 'fixed'" class="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span class="text-xs text-slate-600">年化利率</span>
                      <span class="text-sm font-semibold text-emerald-600">
                        {{ formData.interestRate || 0 }}%
                      </span>
                    </div>

                    <!-- 浮动利率显示 -->
                    <div v-if="formData.interestRateType === 'floating'" class="pb-2 border-b border-slate-200">
                      <div class="flex justify-between items-center mb-2">
                        <span class="text-xs text-slate-600">浮动利率配置</span>
                        <span class="text-xs font-medium text-blue-600">
                          {{ formData.floatingRateConfig.adjustmentPeriod === 'daily' ? '每日' : formData.floatingRateConfig.adjustmentPeriod === 'weekly' ? '每周' : '每月' }}调整
                        </span>
                      </div>
                      <div class="space-y-1.5 text-xs">
                        <div class="flex justify-between py-1">
                          <span class="text-slate-500">参考指标:</span>
                          <span class="font-semibold text-slate-700">
                            {{ formData.floatingRateConfig.referenceRate === 'internal' ? '内部基准' : 
                               formData.floatingRateConfig.referenceRate === 'libor' ? 'LIBOR' : 
                               formData.floatingRateConfig.referenceRate === 'sofr' ? 'SOFR' : '联邦基金利率' }}
                          </span>
                        </div>
                        <div class="flex justify-between py-1">
                          <span class="text-slate-500">基准利率:</span>
                          <span class="font-semibold text-slate-700">{{ formData.floatingRateConfig.baseRate }}%</span>
                        </div>
                        <div class="flex justify-between py-1">
                          <span class="text-slate-500">浮动系数:</span>
                          <span class="font-semibold text-slate-700">{{ formData.floatingRateConfig.floatingFactor }}x</span>
                        </div>
                        <div class="flex justify-between py-1">
                          <span class="text-slate-500">利差:</span>
                          <span class="font-semibold text-slate-700">+{{ formData.floatingRateConfig.spread }}%</span>
                        </div>
                        <div class="flex justify-between py-1 border-t border-blue-100 pt-1.5">
                          <span class="text-slate-600 font-medium">实际利率:</span>
                          <span class="font-bold text-blue-600">
                            {{ ((formData.floatingRateConfig.baseRate * formData.floatingRateConfig.floatingFactor) + formData.floatingRateConfig.spread).toFixed(2) }}%
                          </span>
                        </div>
                        <div class="flex justify-between py-1">
                          <span class="text-slate-500">利率范围:</span>
                          <span class="font-semibold text-slate-700">{{ formData.floatingRateConfig.minRate }}% - {{ formData.floatingRateConfig.maxRate }}%</span>
                        </div>
                        <div class="flex justify-between py-1">
                          <span class="text-slate-500">调整阈值:</span>
                          <span class="font-semibold text-slate-700">{{ formData.floatingRateConfig.adjustmentThreshold }}%</span>
                        </div>
                        <div class="flex justify-between py-1">
                          <span class="text-slate-500">自动调整:</span>
                          <span class="font-semibold" :class="formData.floatingRateConfig.autoAdjust ? 'text-green-600' : 'text-slate-700'">
                            {{ formData.floatingRateConfig.autoAdjust ? '已启用' : '未启用' }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- 阶梯利率显示 -->
                    <div v-if="formData.interestRateType === 'tiered'" class="pb-2 border-b border-slate-200">
                      <div class="text-xs text-slate-600 mb-2">阶梯利率</div>
                      <div class="space-y-1.5">
                        <div 
                          v-for="(tier, index) in formData.tieredRateConfig.tiers" 
                          :key="index"  
                          class="flex items-center justify-between text-xs bg-purple-50 px-2 py-1.5 rounded"
                        >
                          <span class="text-slate-600">
                            {{ formatCurrency(tier.minAmount) }} - {{ formatCurrency(tier.maxAmount) }}
                          </span>
                          <span class="font-semibold text-purple-700">{{ tier.rate }}%</span>
                        </div>
                      </div>
                    </div>

                    <div class="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span class="text-xs text-slate-600">LTV比率</span>
                      <span class="text-sm font-semibold text-slate-900">
                        {{ formData.ltvRatio || 0 }}%
                      </span>
                    </div>
                    <div class="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span class="text-xs text-slate-600">清算阈值</span>
                      <span class="text-sm font-semibold text-orange-600">
                        {{ formData.liquidationThreshold || 0 }}%
                      </span>
                    </div>
                    <div class="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span class="text-xs text-slate-600">借款范围</span>
                      <span class="text-sm font-semibold text-slate-900">
                        {{ formatCurrency(formData.minLoanAmount) }} - {{ formatCurrency(formData.maxLoanAmount) }}
                      </span>
                    </div>
                    <div class="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span class="text-xs text-slate-600">期限范围</span>
                      <span class="text-sm font-semibold text-slate-900">
                        {{ formData.minLoanDuration || 0 }} - {{ formData.maxLoanDuration || 0 }} 天
                      </span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-xs text-slate-600">可用流动性</span>
                      <span class="text-sm font-semibold text-blue-600">
                        {{ formatCurrency(formData.availableLiquidity) }}
                      </span>
                    </div>
                  </div>
                </article>

                <!-- 风险提示 -->
                <div v-if="formData.ltvRatio && formData.liquidationThreshold" class="mt-4">
                  <div 
                    v-if="formData.ltvRatio >= formData.liquidationThreshold"
                    class="rounded-lg border-2 border-red-400 bg-red-50 p-3"
                  >
                    <div class="flex items-start gap-2">
                      <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                      </svg>
                      <div class="text-xs text-red-700">
                        <div class="font-semibold mb-1">参数错误</div>
                        <div>清算阈值必须大于LTV比率，否则会立即触发清算</div>
                      </div>
                    </div>
                  </div>
                  <div 
                    v-else-if="formData.liquidationThreshold - formData.ltvRatio < 5"
                    class="rounded-lg border-2 border-amber-400 bg-amber-50 p-3"
                  >
                    <div class="flex items-start gap-2">
                      <svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                      </svg>
                      <div class="text-xs text-amber-700">
                        <div class="font-semibold mb-1">风险提示</div>
                        <div>LTV与清算阈值差距较小（{{ formData.liquidationThreshold - formData.ltvRatio }}%），建议至少保持5%以上的安全边际</div>
                      </div>
                    </div>
                  </div>
                  <div 
                    v-else
                    class="rounded-lg border-2 border-green-400 bg-green-50 p-3"
                  >
                    <div class="flex items-start gap-2">
                      <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                      </svg>
                      <div class="text-xs text-green-700">
                        <div class="font-semibold mb-1">参数合理</div>
                        <div>风控参数设置合理，安全边际为 {{ formData.liquidationThreshold - formData.ltvRatio }}%</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 描述预览 -->
                <div v-if="formData.description" class="bg-white border border-slate-200 rounded-lg p-4">
                  <h5 class="text-xs font-medium text-slate-600 mb-2">产品描述</h5>
                  <p class="text-sm text-slate-700 leading-relaxed">{{ formData.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { mockProducts } from '../../mock/cryptoLending'
import {
  PRODUCT_STATUS_LABELS,
  INTEREST_RATE_TYPE_LABELS
} from '../../constants/cryptoLending'

const products = ref([])
const showModal = ref(false)
const isEditing = ref(false)
const editingProductId = ref(null)
const searchKeyword = ref('')
const activeTab = ref('basic')

const filters = ref({
  collateralType: '',
  status: '',
  interestRateType: ''
})

const formData = ref({
  productName: '',
  collateralType: '',
  loanCurrency: '',
  minLoanAmount: 0,
  maxLoanAmount: 0,
  interestRateType: 'fixed',
  interestRate: 0,
  // 浮动利率配置
  floatingRateConfig: {
    baseRate: 8.0,
    floatingFactor: 1.0,
    minRate: 5.0,
    maxRate: 15.0,
    adjustmentPeriod: 'daily', // daily, weekly, monthly
    referenceRate: 'internal', // internal(内部基准), libor(伦敦银行同业拆借利率), sofr(担保隔夜融资利率)
    spread: 2.0, // 利差(基点)
    autoAdjust: true, // 是否自动调整
    adjustmentThreshold: 0.5 // 触发调整的阈值(%)
  },
  // 阶梯利率配置
  tieredRateConfig: {
    tiers: [
      { minAmount: 0, maxAmount: 10000, rate: 10.0 },
      { minAmount: 10000, maxAmount: 50000, rate: 8.5 },
      { minAmount: 50000, maxAmount: 999999999, rate: 7.0 }
    ]
  },
  ltvRatio: 0,
  liquidationThreshold: 0,
  minLoanDuration: 7,
  maxLoanDuration: 90,
  availableLiquidity: 0,
  status: 'active',
  description: ''
})

onMounted(() => {
  products.value = mockProducts
})

const filteredProducts = computed(() => {
  let result = products.value

  if (filters.value.collateralType) {
    result = result.filter(p => p.collateralType === filters.value.collateralType)
  }
  if (filters.value.status) {
    result = result.filter(p => p.status === filters.value.status)
  }
  if (filters.value.interestRateType) {
    result = result.filter(p => p.interestRateType === filters.value.interestRateType)
  }
  
  // 搜索关键词过滤
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (keyword) {
    result = result.filter(p => 
      p.productName.toLowerCase().includes(keyword) ||
      p.productId.toLowerCase().includes(keyword) ||
      p.collateralType.toLowerCase().includes(keyword) ||
      p.loanCurrency.toLowerCase().includes(keyword)
    )
  }

  return result
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(value)
}

const statusLabel = (status) => {
  return PRODUCT_STATUS_LABELS[status] || status
}

const interestRateTypeLabel = (type) => {
  return INTEREST_RATE_TYPE_LABELS[type] || type
}

const resetFilters = () => {
  filters.value = {
    collateralType: '',
    status: '',
    interestRateType: ''
  }
}

const resetFormData = () => {
  formData.value = {
    productName: '',
    collateralType: '',
    loanCurrency: '',
    minLoanAmount: 0,
    maxLoanAmount: 0,
    interestRateType: 'fixed',
    interestRate: 0,
    floatingRateConfig: {
      baseRate: 8.0,
      floatingFactor: 1.0,
      minRate: 5.0,
      maxRate: 15.0,
      adjustmentPeriod: 'daily',
      referenceRate: 'internal',
      spread: 2.0,
      autoAdjust: true,
      adjustmentThreshold: 0.5
    },
    tieredRateConfig: {
      tiers: [
        { minAmount: 0, maxAmount: 10000, rate: 10.0 },
        { minAmount: 10000, maxAmount: 50000, rate: 8.5 },
        { minAmount: 50000, maxAmount: 999999999, rate: 7.0 }
      ]
    },
    ltvRatio: 0,
    liquidationThreshold: 0,
    minLoanDuration: 7,
    maxLoanDuration: 90,
    availableLiquidity: 0,
    status: 'active',
    description: ''
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
    collateralType: product.collateralType,
    loanCurrency: product.loanCurrency,
    minLoanAmount: product.minLoanAmount,
    maxLoanAmount: product.maxLoanAmount,
    interestRateType: product.interestRateType,
    interestRate: product.interestRate,
    floatingRateConfig: product.floatingRateConfig || {
      baseRate: 8.0,
      floatingFactor: 1.0,
      minRate: 5.0,
      maxRate: 15.0,
      adjustmentPeriod: 'daily',
      referenceRate: 'internal',
      spread: 2.0,
      autoAdjust: true,
      adjustmentThreshold: 0.5
    },
    tieredRateConfig: product.tieredRateConfig || {
      tiers: [
        { minAmount: 0, maxAmount: 10000, rate: 10.0 },
        { minAmount: 10000, maxAmount: 50000, rate: 8.5 },
        { minAmount: 50000, maxAmount: 999999999, rate: 7.0 }
      ]
    },
    ltvRatio: product.ltvRatio,
    liquidationThreshold: product.liquidationThreshold,
    minLoanDuration: product.minLoanDuration,
    maxLoanDuration: product.maxLoanDuration,
    availableLiquidity: product.availableLiquidity,
    status: product.status,
    description: product.description || ''
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
  if (!formData.value.collateralType || !formData.value.loanCurrency) {
    alert('请选择抵押币种和借出币种')
    return
  }
  if (formData.value.minLoanAmount >= formData.value.maxLoanAmount) {
    alert('最大借款额必须大于最小借款额')
    return
  }
  if (formData.value.ltvRatio >= formData.value.liquidationThreshold) {
    alert('清算阈值必须大于LTV比率')
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
      productId: `PROD${String(products.value.length + 1).padStart(3, '0')}`,
      ...formData.value,
      totalLent: 0,
      activeUsers: 0,
      activeOrders: 0
    }
    products.value.unshift(newProduct)
    alert('产品创建成功')
  }

  closeModal()
}

const toggleProductStatus = (product) => {
  const index = products.value.findIndex(p => p.productId === product.productId)
  if (index !== -1) {
    const newStatus = products.value[index].status === 'active' ? 'suspended' : 'active'
    products.value[index].status = newStatus
  }
}
</script>
