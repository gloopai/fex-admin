<template>
  <section class="space-y-4">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">清算管理</h1>
        <p class="mt-1 text-sm text-slate-500">监控抵押品清算流程与风险处置情况</p>
      </div>
    </header>

    <article class="rounded-xl border border-slate-200 bg-white p-6">
      <div class="flex flex-wrap items-end gap-4 mb-6">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-slate-600">清算状态</label>
          <select v-model="filters.status" class="px-3 py-2 rounded-lg border border-slate-200 text-sm min-w-[150px]">
            <option value="">全部</option>
            <option value="pending">待清算</option>
            <option value="in_progress">清算中</option>
            <option value="completed">已完成</option>
            <option value="failed">失败</option>
            <option value="partial">部分清算</option>
          </select>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-slate-600">触发类型</label>
          <select v-model="filters.triggerType" class="px-3 py-2 rounded-lg border border-slate-200 text-sm min-w-[150px]">
            <option value="">全部</option>
            <option value="ltv_threshold">LTV阈值</option>
            <option value="manual">手动清算</option>
            <option value="overdue">逾期清算</option>
            <option value="price_drop">价格暴跌</option>
          </select>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-slate-600">抵押币种</label>
          <select v-model="filters.collateralType" class="px-3 py-2 rounded-lg border border-slate-200 text-sm min-w-[150px]">
            <option value="">全部</option>
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
            <option value="BNB">BNB</option>
          </select>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-slate-600">搜索</label>
          <input 
            v-model="filters.searchText" 
            class="px-3 py-2 rounded-lg border border-slate-200 text-sm min-w-[150px]"
            placeholder="订单/用户ID"
          />
        </div>
        <button 
          @click="resetFilters"
          class="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
        >
          重置
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b-2 border-slate-200">
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 bg-slate-50">清算ID</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 bg-slate-50">订单/用户</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 bg-slate-50">触发条件</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 bg-slate-50">抵押品/价格</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 bg-slate-50">清算金额</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 bg-slate-50">状态</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 bg-slate-50">清算时间</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 bg-slate-50 w-24">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="liquidation in filteredLiquidations" 
              :key="liquidation.liquidationId"
              class="border-b border-slate-100 hover:bg-slate-50 transition-colors group"
            >
              <td class="px-4 py-4">
                <div class="text-sm font-medium text-slate-900">{{ liquidation.liquidationId }}</div>
                <div class="text-xs text-slate-500">{{ liquidation.productName }}</div>
              </td>
              <td class="px-4 py-4">
                <div class="space-y-0.5">
                  <div class="text-sm font-medium text-blue-600">{{ liquidation.orderId }}</div>
                  <div class="text-xs text-slate-500">{{ liquidation.userId }}</div>
                  <div class="text-xs text-slate-400">{{ liquidation.userName }}</div>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="space-y-1">
                  <span 
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="{
                      'bg-rose-100 text-rose-700': liquidation.triggerType === 'ltv_threshold',
                      'bg-amber-100 text-amber-700': liquidation.triggerType === 'manual',
                      'bg-red-100 text-red-700': liquidation.triggerType === 'overdue',
                      'bg-purple-100 text-purple-700': liquidation.triggerType === 'price_drop'
                    }"
                  >
                    {{ triggerTypeLabel(liquidation.triggerType) }}
                  </span>
                  <div class="text-xs text-slate-600">
                    LTV: <strong :class="{'text-rose-600': liquidation.triggerLtv > 80}">
                      {{ liquidation.triggerLtv }}%
                    </strong>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="space-y-0.5">
                  <div class="text-sm font-medium text-slate-900">
                    {{ liquidation.collateralSold }} {{ liquidation.collateralType }}
                  </div>
                  <div class="text-xs text-slate-500">
                    @${{ liquidation.liquidationPrice.toLocaleString() }}
                  </div>
                  <div v-if="liquidation.collateralRemaining > 0" class="text-xs text-amber-600">
                    剩余: {{ liquidation.collateralRemaining }}
                  </div>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="space-y-0.5">
                  <div class="text-sm font-semibold text-slate-900">
                    {{ formatCurrency(liquidation.liquidationValue) }}
                  </div>
                  <div class="flex items-center gap-2 text-xs">
                    <span class="text-emerald-600">+{{ formatCurrency(liquidation.debtRecovered) }}</span>
                    <span class="text-rose-600">-{{ formatCurrency(liquidation.penalty) }}</span>
                  </div>
                  <div v-if="liquidation.netProceeds > 0" class="text-xs text-blue-600">
                    净余: {{ formatCurrency(liquidation.netProceeds) }}
                  </div>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="space-y-1">
                  <span 
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                    :class="{
                      'bg-amber-100 text-amber-700': liquidation.status === 'pending',
                      'bg-blue-100 text-blue-700': liquidation.status === 'in_progress',
                      'bg-emerald-100 text-emerald-700': liquidation.status === 'completed',
                      'bg-rose-100 text-rose-700': liquidation.status === 'failed',
                      'bg-purple-100 text-purple-700': liquidation.status === 'partial'
                    }"
                  >
                    {{ statusLabel(liquidation.status) }}
                  </span>
                  <div v-if="liquidation.failureReason" class="text-xs text-rose-600">
                    {{ liquidation.failureReason }}
                  </div>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="space-y-0.5">
                  <div v-if="liquidation.liquidationTime" class="text-xs text-slate-700">
                    {{ formatDateTime(liquidation.liquidationTime) }}
                  </div>
                  <div v-else class="text-xs text-slate-400">
                    {{ formatDateTime(liquidation.createTime) }}
                  </div>
                  <div class="text-xs text-slate-500">
                    {{ liquidation.executedBy }}
                  </div>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-1">
                  <button 
                    @click="viewDetails(liquidation)" 
                    class="px-2 py-1 text-xs font-medium text-slate-700 border border-slate-300 rounded hover:bg-slate-50 transition-colors whitespace-nowrap"
                  >
                    详情
                  </button>
                  
                  <button 
                    v-if="liquidation.status === 'pending'" 
                    @click="approveLiquidation(liquidation)"
                    class="px-2 py-1 text-xs font-medium text-emerald-700 border border-emerald-300 rounded hover:bg-emerald-50 transition-colors whitespace-nowrap"
                  >
                    审核
                  </button>
                  
                  <button 
                    v-if="liquidation.status === 'pending'" 
                    @click="cancelLiquidation(liquidation)"
                    class="px-2 py-1 text-xs font-medium text-rose-700 border border-rose-300 rounded hover:bg-rose-50 transition-colors whitespace-nowrap"
                  >
                    取消
                  </button>
                  
                  <button 
                    v-if="liquidation.status === 'in_progress'" 
                    @click="pauseLiquidation(liquidation)"
                    class="px-2 py-1 text-xs font-medium text-amber-700 border border-amber-300 rounded hover:bg-amber-50 transition-colors whitespace-nowrap"
                  >
                    暂停
                  </button>
                  
                  <button 
                    v-if="liquidation.status === 'failed'" 
                    @click="retryLiquidation(liquidation)"
                    class="px-2 py-1 text-xs font-medium text-purple-700 border border-purple-300 rounded hover:bg-purple-50 transition-colors whitespace-nowrap"
                  >
                    重试
                  </button>
                  
                  <button 
                    v-if="liquidation.status === 'partial'" 
                    @click="continueLiquidation(liquidation)"
                    class="px-2 py-1 text-xs font-medium text-cyan-700 border border-cyan-300 rounded hover:bg-cyan-50 transition-colors whitespace-nowrap"
                  >
                    继续
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-slate-200">
        <button 
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          上一页
        </button>
        <span class="text-sm text-slate-600">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
        <button 
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          下一页
        </button>
      </div>
    </article>

    <!-- 清算详情模态框 -->
    <div 
      v-if="showDetailModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="closeDetailModal"
    >
      <article class="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
        <header class="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100">
              <svg class="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-slate-900">清算详情</h2>
              <p class="text-sm text-slate-500">{{ currentDetailLiquidation?.liquidationId }}</p>
            </div>
          </div>
          <button 
            type="button" 
            class="text-slate-400 hover:text-slate-600 transition-colors" 
            @click="closeDetailModal"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </header>

        <div class="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-5">
          <!-- 清算状态卡片 -->
          <div class="rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 p-5">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-rose-700">清算状态</p>
                <p class="mt-1 text-2xl font-bold text-rose-900">{{ statusLabel(currentDetailLiquidation?.status) }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm text-rose-700">清算价值</p>
                <p class="mt-1 text-2xl font-bold text-rose-900">{{ formatCurrency(currentDetailLiquidation?.liquidationValue) }}</p>
              </div>
            </div>
            <div v-if="currentDetailLiquidation?.failureReason" class="mt-3 rounded-lg bg-white/60 px-3 py-2">
              <p class="text-xs text-rose-600">失败原因: {{ currentDetailLiquidation.failureReason }}</p>
            </div>
          </div>

          <!-- 触发信息 -->
          <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 class="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
              <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
                <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </span>
              <span>触发条件</span>
            </h3>
            <div class="grid gap-4 md:grid-cols-3">
              <div>
                <label class="text-xs font-medium text-slate-500">触发类型</label>
                <p class="mt-1 text-sm font-medium text-slate-900">{{ triggerTypeLabel(currentDetailLiquidation?.triggerType) }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">触发LTV</label>
                <p class="mt-1 text-sm font-semibold text-rose-600">{{ currentDetailLiquidation?.triggerLtv }}%</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">清算阈值</label>
                <p class="mt-1 text-sm font-medium text-slate-900">{{ currentDetailLiquidation?.liquidationThreshold }}%</p>
              </div>
            </div>
          </section>

          <!-- 抵押品信息 -->
          <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 class="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
              <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100">
                <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </span>
              <span>抵押品清算</span>
            </h3>
            <div class="grid gap-4 md:grid-cols-3">
              <div>
                <label class="text-xs font-medium text-slate-500">抵押币种</label>
                <p class="mt-1 text-sm font-medium text-slate-900">{{ currentDetailLiquidation?.collateralType }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">清算数量</label>
                <p class="mt-1 text-sm font-semibold text-slate-900">{{ currentDetailLiquidation?.collateralSold }} {{ currentDetailLiquidation?.collateralType }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">剩余数量</label>
                <p class="mt-1 text-sm font-medium text-amber-600">{{ currentDetailLiquidation?.collateralRemaining }} {{ currentDetailLiquidation?.collateralType }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">清算价格</label>
                <p class="mt-1 text-sm font-semibold text-rose-600">${{ currentDetailLiquidation?.liquidationPrice?.toLocaleString() }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">市场价格</label>
                <p class="mt-1 text-sm font-medium text-slate-900">${{ currentDetailLiquidation?.marketPrice?.toLocaleString() }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">清算价值</label>
                <p class="mt-1 text-sm font-semibold text-slate-900">{{ formatCurrency(currentDetailLiquidation?.liquidationValue) }}</p>
              </div>
            </div>
          </section>

          <!-- 债务信息 -->
          <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 class="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
              <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100">
                <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
              </span>
              <span>债务及罚金</span>
            </h3>
            <div class="grid gap-4 md:grid-cols-3">
              <div>
                <label class="text-xs font-medium text-slate-500">收回债务</label>
                <p class="mt-1 text-sm font-semibold text-emerald-600">{{ formatCurrency(currentDetailLiquidation?.debtRecovered) }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">清算罚金</label>
                <p class="mt-1 text-sm font-semibold text-rose-600">{{ formatCurrency(currentDetailLiquidation?.penalty) }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">净余额</label>
                <p class="mt-1 text-sm font-medium text-blue-600">{{ formatCurrency(currentDetailLiquidation?.netProceeds) }}</p>
              </div>
            </div>
          </section>

          <!-- 订单信息 -->
          <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 class="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
              <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-100">
                <svg class="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </span>
              <span>关联订单</span>
            </h3>
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="text-xs font-medium text-slate-500">订单编号</label>
                <p class="mt-1 text-sm font-medium text-blue-600">{{ currentDetailLiquidation?.orderId }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">产品名称</label>
                <p class="mt-1 text-sm font-medium text-slate-900">{{ currentDetailLiquidation?.productName }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">用户ID</label>
                <p class="mt-1 text-sm font-mono text-slate-900">{{ currentDetailLiquidation?.userId }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">用户姓名</label>
                <p class="mt-1 text-sm font-medium text-slate-900">{{ currentDetailLiquidation?.userName }}</p>
              </div>
            </div>
          </section>

          <!-- 时间信息 -->
          <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 class="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
              <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </span>
              <span>时间记录</span>
            </h3>
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="text-xs font-medium text-slate-500">创建时间</label>
                <p class="mt-1 text-sm text-slate-900">{{ formatDateTime(currentDetailLiquidation?.createTime) }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">清算时间</label>
                <p class="mt-1 text-sm text-slate-900">{{ currentDetailLiquidation?.liquidationTime ? formatDateTime(currentDetailLiquidation.liquidationTime) : '-' }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">执行人</label>
                <p class="mt-1 text-sm text-slate-900">{{ currentDetailLiquidation?.executedBy || '-' }}</p>
              </div>
            </div>
          </section>
        </div>

        <footer class="border-t border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4">
          <div class="flex items-center justify-end gap-3">
            <button 
              type="button" 
              class="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
              @click="closeDetailModal"
            >
              关闭
            </button>
          </div>
        </footer>
      </article>
    </div>

    <!-- 审核确认模态框 -->
    <div 
      v-if="showApproveModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="showApproveModal = false"
    >
      <article class="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <header class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
              <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-slate-900">审核确认清算</h2>
              <p class="text-sm text-slate-500">{{ currentApproveLiquidation?.liquidationId }}</p>
            </div>
          </div>
          <button 
            type="button" 
            class="text-slate-400 hover:text-slate-600" 
            @click="showApproveModal = false"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </header>

        <div class="p-6 space-y-4">
          <div class="rounded-lg bg-emerald-50 border border-emerald-200 p-4 flex gap-3">
            <svg class="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div class="text-sm text-emerald-900">
              <p class="font-medium mb-1">确认审核通过并执行清算？</p>
              <p class="text-emerald-700">审核通过后将立即开始执行清算操作，请确认清算条件已满足。</p>
            </div>
          </div>

          <div class="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-600">订单ID:</span>
              <span class="font-medium text-slate-900">{{ currentApproveLiquidation?.orderId }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">用户:</span>
              <span class="font-medium text-slate-900">{{ currentApproveLiquidation?.userName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">清算金额:</span>
              <span class="font-medium text-rose-600">{{ formatCurrency(currentApproveLiquidation?.liquidationValue) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">触发LTV:</span>
              <span class="font-medium text-rose-600">{{ currentApproveLiquidation?.triggerLtv }}%</span>
            </div>
          </div>
        </div>

        <footer class="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button 
            type="button" 
            class="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            @click="showApproveModal = false"
          >
            取消
          </button>
          <button 
            type="button" 
            class="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 flex items-center gap-2"
            @click="submitApproval"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span>确认执行</span>
          </button>
        </footer>
      </article>
    </div>

    <!-- 取消清算模态框 -->
    <div 
      v-if="showCancelModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="showCancelModal = false"
    >
      <article class="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <header class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100">
              <svg class="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-slate-900">取消清算</h2>
              <p class="text-sm text-slate-500">{{ currentCancelLiquidation?.liquidationId }}</p>
            </div>
          </div>
          <button 
            type="button" 
            class="text-slate-400 hover:text-slate-600" 
            @click="showCancelModal = false"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </header>

        <div class="p-6 space-y-4">
          <div class="rounded-lg bg-rose-50 border border-rose-200 p-4 flex gap-3">
            <svg class="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <div class="text-sm text-rose-900">
              <p class="font-medium mb-1">确认取消该清算？</p>
              <p class="text-rose-700">此操作将删除本条清算记录，该操作不可恢复。请确认您的操作并说明取消原因。</p>
            </div>
          </div>

          <div class="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-600">订单ID:</span>
              <span class="font-medium text-slate-900">{{ currentCancelLiquidation?.orderId }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">清算金额:</span>
              <span class="font-medium text-slate-900">{{ formatCurrency(currentCancelLiquidation?.liquidationValue) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">触发类型:</span>
              <span class="font-medium text-slate-900">{{ triggerTypeLabel(currentCancelLiquidation?.triggerType) }}</span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">取消原因 <span class="text-rose-500">*</span></label>
            <textarea 
              v-model="cancelForm.reason"
              rows="4"
              class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
              placeholder="请详细说明取消清算的原因，例如：LTV已恢复正常、系统误判、用户已补充抵押品等..."
            ></textarea>
          </div>
        </div>

        <footer class="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button 
            type="button" 
            class="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            @click="showCancelModal = false"
          >
            放弃取消
          </button>
          <button 
            type="button" 
            class="rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700 flex items-center gap-2"
            @click="submitCancellation"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            <span>确认取消</span>
          </button>
        </footer>
      </article>
    </div>

    <!-- 暂停清算模态框 -->
    <div 
      v-if="showPauseModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="showPauseModal = false"
    >
      <article class="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <header class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
              <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-slate-900">暂停清算</h2>
              <p class="text-sm text-slate-500">{{ currentPauseLiquidation?.liquidationId }}</p>
            </div>
          </div>
          <button 
            type="button" 
            class="text-slate-400 hover:text-slate-600" 
            @click="showPauseModal = false"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </header>

        <div class="p-6 space-y-4">
          <div class="rounded-lg bg-amber-50 border border-amber-200 p-4 flex gap-3">
            <svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div class="text-sm text-amber-900">
              <p class="font-medium mb-1">确认暂停该清算？</p>
              <p class="text-amber-700">暂停后可以手动继续或取消，请说明暂停原因。</p>
            </div>
          </div>

          <div class="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-600">订单ID:</span>
              <span class="font-medium text-slate-900">{{ currentPauseLiquidation?.orderId }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">用户:</span>
              <span class="font-medium text-slate-900">{{ currentPauseLiquidation?.userName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">清算金额:</span>
              <span class="font-medium text-slate-900">{{ formatCurrency(currentPauseLiquidation?.liquidationValue) }}</span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">暂停原因 <span class="text-amber-500">*</span></label>
            <textarea 
              v-model="pauseForm.reason"
              rows="3"
              class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              placeholder="请说明暂停清算的原因..."
            ></textarea>
          </div>
        </div>

        <footer class="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button 
            type="button" 
            class="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            @click="showPauseModal = false"
          >
            取消
          </button>
          <button 
            type="button" 
            class="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-700 flex items-center gap-2"
            @click="submitPause"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>确认暂停</span>
          </button>
        </footer>
      </article>
    </div>

    <!-- 重试清算模态框 -->
    <div 
      v-if="showRetryModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="showRetryModal = false"
    >
      <article class="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <header class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-slate-900">重试清算</h2>
              <p class="text-sm text-slate-500">{{ currentRetryLiquidation?.liquidationId }}</p>
            </div>
          </div>
          <button 
            type="button" 
            class="text-slate-400 hover:text-slate-600" 
            @click="showRetryModal = false"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </header>

        <div class="p-6 space-y-4">
          <div class="rounded-lg bg-purple-50 border border-purple-200 p-4 flex gap-3">
            <svg class="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div class="text-sm text-purple-900">
              <p class="font-medium mb-1">确认重试该清算？</p>
              <p class="text-purple-700">系统将重新执行清算操作，请确认问题已解决。</p>
            </div>
          </div>

          <div class="rounded-lg bg-rose-50 border border-rose-200 p-4">
            <div class="text-sm">
              <p class="font-medium text-rose-900 mb-1">失败原因:</p>
              <p class="text-rose-700">{{ currentRetryLiquidation?.failureReason }}</p>
            </div>
          </div>

          <div class="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-600">订单ID:</span>
              <span class="font-medium text-slate-900">{{ currentRetryLiquidation?.orderId }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">用户:</span>
              <span class="font-medium text-slate-900">{{ currentRetryLiquidation?.userName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">清算金额:</span>
              <span class="font-medium text-slate-900">{{ formatCurrency(currentRetryLiquidation?.liquidationValue) }}</span>
            </div>
          </div>
        </div>

        <footer class="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button 
            type="button" 
            class="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            @click="showRetryModal = false"
          >
            取消
          </button>
          <button 
            type="button" 
            class="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700 flex items-center gap-2"
            @click="submitRetry"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <span>确认重试</span>
          </button>
        </footer>
      </article>
    </div>

    <!-- 继续清算模态框 -->
    <div 
      v-if="showContinueModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="showContinueModal = false"
    >
      <article class="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <header class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100">
              <svg class="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-slate-900">继续清算</h2>
              <p class="text-sm text-slate-500">{{ currentContinueLiquidation?.liquidationId }}</p>
            </div>
          </div>
          <button 
            type="button" 
            class="text-slate-400 hover:text-slate-600" 
            @click="showContinueModal = false"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </header>

        <div class="p-6 space-y-4">
          <div class="rounded-lg bg-cyan-50 border border-cyan-200 p-4 flex gap-3">
            <svg class="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div class="text-sm text-cyan-900">
              <p class="font-medium mb-1">确认继续清算？</p>
              <p class="text-cyan-700">系统将继续清算剩余的抵押品。</p>
            </div>
          </div>

          <div class="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-600">订单ID:</span>
              <span class="font-medium text-slate-900">{{ currentContinueLiquidation?.orderId }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">已清算:</span>
              <span class="font-medium text-emerald-600">{{ currentContinueLiquidation?.collateralSold }} {{ currentContinueLiquidation?.collateralType }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">剩余:</span>
              <span class="font-medium text-amber-600">{{ currentContinueLiquidation?.collateralRemaining }} {{ currentContinueLiquidation?.collateralType }}</span>
            </div>
          </div>
        </div>

        <footer class="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button 
            type="button" 
            class="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            @click="showContinueModal = false"
          >
            取消
          </button>
          <button 
            type="button" 
            class="rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-cyan-700 flex items-center gap-2"
            @click="submitContinue"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>继续执行</span>
          </button>
        </footer>
      </article>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { mockLiquidations } from '../../mock/cryptoLending'
import {
  LIQUIDATION_STATUS_LABELS,
  LIQUIDATION_TRIGGER_LABELS
} from '../../constants/cryptoLending'

const liquidations = ref([])
const currentPage = ref(1)
const pageSize = ref(10)

// 模态框状态
const showDetailModal = ref(false)
const showApproveModal = ref(false)
const showCancelModal = ref(false)
const showPauseModal = ref(false)
const showRetryModal = ref(false)
const showContinueModal = ref(false)

// 当前操作的清算记录
const currentDetailLiquidation = ref(null)
const currentApproveLiquidation = ref(null)
const currentCancelLiquidation = ref(null)
const currentPauseLiquidation = ref(null)
const currentRetryLiquidation = ref(null)
const currentContinueLiquidation = ref(null)

// 表单数据
const cancelForm = ref({ reason: '' })
const pauseForm = ref({ reason: '' })

const filters = ref({
  status: '',
  triggerType: '',
  collateralType: '',
  searchText: ''
})

onMounted(() => {
  liquidations.value = mockLiquidations
})

const filteredLiquidations = computed(() => {
  let result = liquidations.value

  if (filters.value.status) {
    result = result.filter(l => l.status === filters.value.status)
  }
  if (filters.value.triggerType) {
    result = result.filter(l => l.triggerType === filters.value.triggerType)
  }
  if (filters.value.collateralType) {
    result = result.filter(l => l.collateralType === filters.value.collateralType)
  }
  if (filters.value.searchText) {
    const search = filters.value.searchText.toLowerCase()
    result = result.filter(l => 
      l.orderId.toLowerCase().includes(search) ||
      l.userId.toLowerCase().includes(search)
    )
  }

  return result
})

const totalPages = computed(() => {
  return Math.ceil(filteredLiquidations.value.length / pageSize.value)
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(value)
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  return dateStr.replace(' ', '\n')
}

const statusLabel = (status) => {
  return LIQUIDATION_STATUS_LABELS[status] || status
}

const triggerTypeLabel = (type) => {
  return LIQUIDATION_TRIGGER_LABELS[type] || type
}

const resetFilters = () => {
  filters.value = {
    status: '',
    triggerType: '',
    collateralType: '',
    searchText: ''
  }
}

// 查看详情
const viewDetails = (liquidation) => {
  currentDetailLiquidation.value = liquidation
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  currentDetailLiquidation.value = null
}

// 审核确认
const approveLiquidation = (liquidation) => {
  currentApproveLiquidation.value = liquidation
  showApproveModal.value = true
}

const submitApproval = () => {
  if (currentApproveLiquidation.value) {
    currentApproveLiquidation.value.status = 'in_progress'
    showApproveModal.value = false
    currentApproveLiquidation.value = null
  }
}

// 取消清算
const cancelLiquidation = (liquidation) => {
  currentCancelLiquidation.value = liquidation
  cancelForm.value.reason = ''
  showCancelModal.value = true
}

const submitCancellation = () => {
  if (!cancelForm.value.reason.trim()) {
    alert('请填写取消原因')
    return
  }
  
  if (currentCancelLiquidation.value) {
    const index = liquidations.value.findIndex(
      l => l.liquidationId === currentCancelLiquidation.value.liquidationId
    )
    if (index > -1) {
      liquidations.value.splice(index, 1)
    }
    showCancelModal.value = false
    currentCancelLiquidation.value = null
    cancelForm.value.reason = ''
  }
}

// 暂停清算
const pauseLiquidation = (liquidation) => {
  currentPauseLiquidation.value = liquidation
  pauseForm.value.reason = ''
  showPauseModal.value = true
}

const submitPause = () => {
  if (!pauseForm.value.reason.trim()) {
    alert('请填写暂停原因')
    return
  }
  
  if (currentPauseLiquidation.value) {
    currentPauseLiquidation.value.status = 'pending'
    showPauseModal.value = false
    currentPauseLiquidation.value = null
    pauseForm.value.reason = ''
  }
}

// 重试清算
const retryLiquidation = (liquidation) => {
  currentRetryLiquidation.value = liquidation
  showRetryModal.value = true
}

const submitRetry = () => {
  if (currentRetryLiquidation.value) {
    currentRetryLiquidation.value.status = 'in_progress'
    currentRetryLiquidation.value.failureReason = ''
    showRetryModal.value = false
    currentRetryLiquidation.value = null
  }
}

// 继续清算
const continueLiquidation = (liquidation) => {
  currentContinueLiquidation.value = liquidation
  showContinueModal.value = true
}

const submitContinue = () => {
  if (currentContinueLiquidation.value) {
    currentContinueLiquidation.value.status = 'in_progress'
    showContinueModal.value = false
    currentContinueLiquidation.value = null
  }
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}
</script>
