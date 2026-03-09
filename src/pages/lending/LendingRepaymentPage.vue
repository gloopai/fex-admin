<template>
  <section class="space-y-4">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">还款管理</h1>
        <p class="mt-1 text-sm text-slate-500">管理和追踪所有还款记录</p>
      </div>
    </header>

    <article class="rounded-xl border border-slate-200 bg-white p-6">
      <div class="flex flex-wrap items-end gap-4 mb-6">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-slate-600">还款状态</label>
          <select v-model="filters.status" class="px-3 py-2 rounded-lg border border-slate-200 text-sm min-w-[150px]">
            <option value="">全部</option>
            <option value="pending">待还款</option>
            <option value="processing">处理中</option>
            <option value="completed">已完成</option>
            <option value="failed">失败</option>
            <option value="overdue">逾期</option>
          </select>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-slate-600">还款类型</label>
          <select v-model="filters.repaymentType" class="px-3 py-2 rounded-lg border border-slate-200 text-sm min-w-[150px]">
            <option value="">全部</option>
            <option value="partial">部分还款</option>
            <option value="full">全额还款</option>
            <option value="interest_only">仅还利息</option>
            <option value="auto">自动还款</option>
          </select>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-slate-600">时间范围</label>
          <select v-model="filters.timeRange" class="px-3 py-2 rounded-lg border border-slate-200 text-sm min-w-[150px]">
            <option value="today">今天</option>
            <option value="week">本周</option>
            <option value="month">本月</option>
            <option value="all">全部</option>
          </select>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-slate-600">用户/订单ID</label>
          <input 
            v-model="filters.searchText" 
            class="px-3 py-2 rounded-lg border border-slate-200 text-sm min-w-[150px]"
            placeholder="搜索..."
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
          <thead class="bg-slate-50 text-slate-500">
            <tr class="border-b-2 border-slate-200">
              <th class="px-4 py-3 text-left font-medium">还款ID</th>
              <th class="px-4 py-3 text-left font-medium">订单/用户信息</th>
              <th class="px-4 py-3 text-left font-medium">产品名称</th>
              <th class="px-4 py-3 text-left font-medium">还款类型</th>
              <th class="px-4 py-3 text-left font-medium">还款金额</th>
              <th class="px-4 py-3 text-left font-medium">利息/本金</th>
              <th class="px-4 py-3 text-left font-medium">剩余债务</th>
              <th class="px-4 py-3 text-left font-medium">支付方式</th>
              <th class="px-4 py-3 text-left font-medium">状态</th>
              <th class="px-4 py-3 text-left font-medium">还款时间</th>
              <th class="px-4 py-3 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="repayment in filteredRepayments" 
              :key="repayment.repaymentId"
              class="border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <td class="px-4 py-4">
                <div class="text-sm font-medium text-slate-900">{{ repayment.repaymentId }}</div>
              </td>
              <td class="px-4 py-4">
                <div class="space-y-0.5">
                  <div class="text-sm font-medium text-blue-600">{{ repayment.orderId }}</div>
                  <div class="text-xs text-slate-500">{{ repayment.userId }} - {{ repayment.userName }}</div>
                </div>
              </td>
              <td class="px-4 py-4">
                <span class="text-sm font-medium text-slate-900">{{ repayment.productName }}</span>
              </td>
              <td class="px-4 py-4">
                <span 
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                  :class="{
                    'bg-blue-100 text-blue-700': repayment.repaymentType === 'partial',
                    'bg-emerald-100 text-emerald-700': repayment.repaymentType === 'full',
                    'bg-amber-100 text-amber-700': repayment.repaymentType === 'interest_only',
                    'bg-purple-100 text-purple-700': repayment.repaymentType === 'auto'
                  }"
                >
                  {{ repaymentTypeLabel(repayment.repaymentType) }}
                </span>
              </td>
              <td class="px-4 py-4">
                <div class="text-sm font-semibold text-slate-900">{{ formatCurrency(repayment.amount) }}</div>
              </td>
              <td class="px-4 py-4">
                <div class="space-y-0.5 text-xs">
                  <div class="text-slate-500">利息: {{ formatCurrency(repayment.interestPaid) }}</div>
                  <div class="text-slate-500">本金: {{ formatCurrency(repayment.principalPaid) }}</div>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="text-sm font-medium text-slate-700">{{ formatCurrency(repayment.remainingDebt) }}</div>
              </td>
              <td class="px-4 py-4">
                <div class="space-y-0.5">
                  <div class="text-sm text-slate-900">{{ repayment.paymentMethod }}</div>
                  <div v-if="repayment.transactionId" class="text-xs text-slate-400 font-mono">
                    {{ repayment.transactionId }}
                  </div>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="space-y-1">
                  <span 
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                    :class="{
                      'bg-amber-100 text-amber-700': repayment.status === 'pending',
                      'bg-blue-100 text-blue-700': repayment.status === 'processing',
                      'bg-emerald-100 text-emerald-700': repayment.status === 'completed',
                      'bg-rose-100 text-rose-700': repayment.status === 'failed',
                      'bg-red-100 text-red-700': repayment.status === 'overdue'
                    }"
                  >
                    {{ statusLabel(repayment.status) }}
                  </span>
                  <div v-if="repayment.failureReason" class="text-xs text-rose-600">
                    {{ repayment.failureReason }}
                  </div>
                </div>
              </td>
              <td class="px-4 py-4">
                <div v-if="repayment.repaymentTime" class="text-sm text-slate-700">
                  {{ formatDateTime(repayment.repaymentTime) }}
                </div>
                <div v-else class="text-xs text-slate-400">
                  创建: {{ formatDateTime(repayment.createTime) }}
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-1">
                  <button 
                    @click="viewDetails(repayment)" 
                    class="px-2 py-1 text-xs font-medium text-slate-700 border border-slate-300 rounded hover:bg-slate-50 transition-colors whitespace-nowrap"
                  >
                    详情
                  </button>
                  
                  <button 
                    v-if="repayment.status === 'pending'" 
                    @click="confirmRepayment(repayment)"
                    class="px-2 py-1 text-xs font-medium text-emerald-700 border border-emerald-300 rounded hover:bg-emerald-50 transition-colors whitespace-nowrap"
                  >
                    确认
                  </button>
                  
                  <button 
                    v-if="repayment.status === 'failed'" 
                    @click="retryRepayment(repayment)"
                    class="px-2 py-1 text-xs font-medium text-amber-700 border border-amber-300 rounded hover:bg-amber-50 transition-colors whitespace-nowrap"
                  >
                    重试
                  </button>
                  
                  <button 
                    v-if="['pending', 'overdue'].includes(repayment.status)" 
                    @click="sendReminder(repayment)"
                    class="px-2 py-1 text-xs font-medium text-purple-700 border border-purple-300 rounded hover:bg-purple-50 transition-colors whitespace-nowrap"
                  >
                    提醒
                  </button>
                  
                  <button 
                    v-if="['pending', 'processing'].includes(repayment.status)"
                    @click="cancelRepayment(repayment)"
                    class="px-2 py-1 text-xs font-medium text-rose-700 border border-rose-300 rounded hover:bg-rose-50 transition-colors whitespace-nowrap"
                  >
                    取消
                  </button>
                  
                  <button 
                    v-if="repayment.status === 'completed'"
                    @click="exportReceipt(repayment)"
                    class="px-2 py-1 text-xs font-medium text-cyan-700 border border-cyan-300 rounded hover:bg-cyan-50 transition-colors whitespace-nowrap"
                  >
                    导出
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

    <!-- 还款详情模态框 -->
    <div 
      v-if="showDetailModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="closeDetailModal"
    >
      <article class="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
        <!-- 标题栏 -->
        <header class="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-slate-900">还款详情</h2>
              <p class="text-sm text-slate-500">{{ currentDetailRepayment?.repaymentId }}</p>
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

        <!-- 内容区域 -->
        <div class="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-5">
          <!-- 还款状态卡片 -->
          <div class="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-5">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-blue-700">还款状态</p>
                <p class="mt-1 text-2xl font-bold text-blue-900">{{ statusLabel(currentDetailRepayment?.status) }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm text-blue-700">还款金额</p>
                <p class="mt-1 text-2xl font-bold text-blue-900">{{ formatCurrency(currentDetailRepayment?.amount) }}</p>
              </div>
            </div>
            <div v-if="currentDetailRepayment?.failureReason" class="mt-3 rounded-lg bg-white/60 px-3 py-2">
              <p class="text-xs text-rose-600">失败原因: {{ currentDetailRepayment.failureReason }}</p>
            </div>
          </div>

          <!-- 还款信息 -->
          <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 class="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
              <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100">
                <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </span>
              <span>还款信息</span>
            </h3>
            <div class="grid gap-4 md:grid-cols-3">
              <div>
                <label class="text-xs font-medium text-slate-500">还款类型</label>
                <p class="mt-1 text-sm font-medium text-slate-900">{{ repaymentTypeLabel(currentDetailRepayment?.repaymentType) }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">支付方式</label>
                <p class="mt-1 text-sm font-medium text-slate-900">{{ currentDetailRepayment?.paymentMethod }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">交易单号</label>
                <p class="mt-1 text-sm font-mono text-slate-900">{{ currentDetailRepayment?.transactionId || '-' }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">已还利息</label>
                <p class="mt-1 text-sm font-semibold text-amber-600">{{ formatCurrency(currentDetailRepayment?.interestPaid) }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">已还本金</label>
                <p class="mt-1 text-sm font-semibold text-emerald-600">{{ formatCurrency(currentDetailRepayment?.principalPaid) }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">剩余债务</label>
                <p class="mt-1 text-sm font-semibold text-slate-900">{{ formatCurrency(currentDetailRepayment?.remainingDebt) }}</p>
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
                <p class="mt-1 text-sm font-medium text-blue-600">{{ currentDetailRepayment?.orderId }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">产品名称</label>
                <p class="mt-1 text-sm font-medium text-slate-900">{{ currentDetailRepayment?.productName }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">用户ID</label>
                <p class="mt-1 text-sm font-mono text-slate-900">{{ currentDetailRepayment?.userId }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">用户姓名</label>
                <p class="mt-1 text-sm font-medium text-slate-900">{{ currentDetailRepayment?.userName }}</p>
              </div>
            </div>
          </section>

          <!-- 时间信息 -->
          <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 class="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
              <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
                <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </span>
              <span>时间记录</span>
            </h3>
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="text-xs font-medium text-slate-500">创建时间</label>
                <p class="mt-1 text-sm text-slate-900">{{ formatDateTime(currentDetailRepayment?.createTime) }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">完成时间</label>
                <p class="mt-1 text-sm text-slate-900">{{ currentDetailRepayment?.repaymentTime ? formatDateTime(currentDetailRepayment.repaymentTime) : '-' }}</p>
              </div>
            </div>
          </section>
        </div>

        <!-- 底部操作 -->
        <footer class="border-t border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4">
          <div class="flex items-center justify-end gap-3">
            <button 
              type="button" 
              class="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
              @click="closeDetailModal"
            >
              关闭
            </button>
            <button 
              v-if="currentDetailRepayment?.status === 'pending'"
              type="button" 
              class="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors flex items-center gap-2"
              @click="confirmRepayment(currentDetailRepayment)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span>确认还款</span>
            </button>
          </div>
        </footer>
      </article>
    </div>

    <!-- 调整还款计划模态框 -->
    <div 
      v-if="showAdjustModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="showAdjustModal = false"
    >
      <article class="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <header class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
              <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-slate-900">调整还款计划</h2>
              <p class="text-sm text-slate-500">{{ currentAdjustRepayment?.repaymentId }}</p>
            </div>
          </div>
          <button 
            type="button" 
            class="text-slate-400 hover:text-slate-600" 
            @click="showAdjustModal = false"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </header>

        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">还款金额 (USD)</label>
            <input 
              v-model.number="adjustForm.amount"
              type="number"
              class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="输入还款金额"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">预计还款日期</label>
            <input 
              v-model="adjustForm.scheduledDate"
              type="date"
              class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">调整原因 <span class="text-rose-500">*</span></label>
            <textarea 
              v-model="adjustForm.reason"
              rows="4"
              class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="请说明调整还款计划的原因..."
            ></textarea>
          </div>
        </div>

        <footer class="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button 
            type="button" 
            class="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            @click="showAdjustModal = false"
          >
            取消
          </button>
          <button 
            type="button" 
            class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 flex items-center gap-2"
            @click="submitAdjustment"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span>确认调整</span>
          </button>
        </footer>
      </article>
    </div>

    <!-- 取消还款模态框 -->
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
              <h2 class="text-lg font-semibold text-slate-900">取消还款</h2>
              <p class="text-sm text-slate-500">{{ currentCancelRepayment?.repaymentId }}</p>
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
          <!-- 警告提示 -->
          <div class="rounded-lg bg-rose-50 border border-rose-200 p-4 flex gap-3">
            <svg class="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <div class="text-sm text-rose-900">
              <p class="font-medium mb-1">确认取消该还款？</p>
              <p class="text-rose-700">此操作将删除本条还款记录，该操作不可恢复。请确认您的操作并说明取消原因。</p>
            </div>
          </div>

          <!-- 还款信息 -->
          <div class="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-600">订单ID:</span>
              <span class="font-medium text-slate-900">{{ currentCancelRepayment?.orderId }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">还款金额:</span>
              <span class="font-medium text-slate-900">${{ currentCancelRepayment?.repaymentAmount?.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">还款类型:</span>
              <span class="font-medium text-slate-900">{{ currentCancelRepayment?.repaymentType }}</span>
            </div>
          </div>

          <!-- 取消原因 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">取消原因 <span class="text-rose-500">*</span></label>
            <textarea 
              v-model="cancelForm.reason"
              rows="4"
              class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
              placeholder="请详细说明取消还款的原因，例如：用户已提前全额还款、系统错误记录、用户申请取消等..."
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

    <!-- 交易详情模态框 -->
    <div 
      v-if="showTransactionModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="closeTransactionModal"
    >
      <article class="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
        <!-- 标题栏 -->
        <header class="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100">
              <svg class="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-slate-900">区块链交易详情</h2>
              <p class="text-sm text-slate-500">{{ currentTransaction?.transactionId }}</p>
            </div>
          </div>
          <button 
            type="button" 
            class="text-slate-400 hover:text-slate-600 transition-colors" 
            @click="closeTransactionModal"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </header>

        <!-- 内容区域 -->
        <div class="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-5">
          <!-- 交易状态卡片 -->
          <div class="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 p-5">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-emerald-700">交易状态</p>
                <div class="mt-1 flex items-center gap-2">
                  <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p class="text-2xl font-bold text-emerald-900">已确认</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm text-emerald-700">确认数</p>
                <p class="mt-1 text-2xl font-bold text-emerald-900">{{ currentTransaction?.confirmations }}</p>
              </div>
            </div>
          </div>

          <!-- 基本信息 -->
          <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 class="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
              <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </span>
              <span>基本信息</span>
            </h3>
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="text-xs font-medium text-slate-500">交易哈希</label>
                <div class="mt-1 flex items-center gap-2">
                  <p class="text-sm font-mono text-slate-900 break-all">{{ currentTransaction?.txHash }}</p>
                  <button 
                    @click="copyToClipboard(currentTransaction?.txHash)"
                    class="flex-shrink-0 p-1 rounded hover:bg-slate-100"
                    title="复制"
                  >
                    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">区块链网络</label>
                <p class="mt-1 text-sm font-medium text-slate-900">{{ currentTransaction?.blockchainType }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">区块高度</label>
                <p class="mt-1 text-sm font-medium text-slate-900">#{{ currentTransaction?.blockNumber?.toLocaleString() }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">区块时间</label>
                <p class="mt-1 text-sm text-slate-900">{{ currentTransaction?.blockTime }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">交易金额</label>
                <p class="mt-1 text-base font-semibold text-emerald-600">{{ formatCurrency(currentTransaction?.amount) }} {{ currentTransaction?.currency }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">支付方式</label>
                <p class="mt-1 text-sm font-medium text-slate-900">{{ currentTransaction?.paymentMethod }}</p>
              </div>
            </div>
          </section>

          <!-- 地址信息 -->
          <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 class="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
              <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100">
                <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </span>
              <span>地址信息</span>
            </h3>
            <div class="space-y-4">
              <div>
                <label class="text-xs font-medium text-slate-500">发送地址 (From)</label>
                <div class="mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p class="flex-1 text-sm font-mono text-slate-900 break-all">{{ currentTransaction?.fromAddress }}</p>
                  <button 
                    @click="copyToClipboard(currentTransaction?.fromAddress)"
                    class="flex-shrink-0 p-1 rounded hover:bg-slate-200"
                    title="复制"
                  >
                    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="flex justify-center">
                <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                </svg>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">接收地址 (To)</label>
                <div class="mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p class="flex-1 text-sm font-mono text-slate-900 break-all">{{ currentTransaction?.toAddress }}</p>
                  <button 
                    @click="copyToClipboard(currentTransaction?.toAddress)"
                    class="flex-shrink-0 p-1 rounded hover:bg-slate-200"
                    title="复制"
                  >
                    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- Gas 费用 -->
          <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 class="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
              <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
                <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </span>
              <span>费用详情</span>
            </h3>
            <div class="grid gap-4 md:grid-cols-3">
              <div class="rounded-lg border border-amber-100 bg-amber-50 p-3">
                <label class="text-xs font-medium text-amber-700">Gas 费用</label>
                <p class="mt-1 text-lg font-bold text-amber-900">{{ currentTransaction?.gasFee }} ETH</p>
              </div>
              <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <label class="text-xs font-medium text-slate-600">Gas 价格</label>
                <p class="mt-1 text-base font-semibold text-slate-900">{{ currentTransaction?.gasPrice }} Gwei</p>
              </div>
              <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <label class="text-xs font-medium text-slate-600">Gas 使用量</label>
                <p class="mt-1 text-base font-semibold text-slate-900">{{ currentTransaction?.gasUsed?.toLocaleString() }}</p>
              </div>
            </div>
          </section>

          <!-- 技术参数 -->
          <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 class="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
              <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
                <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                </svg>
              </span>
              <span>技术参数</span>
            </h3>
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="text-xs font-medium text-slate-500">Nonce</label>
                <p class="mt-1 text-sm text-slate-900">{{ currentTransaction?.nonce }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">网络费用</label>
                <p class="mt-1 text-sm text-slate-900">{{ currentTransaction?.networkFee }} USD</p>
              </div>
              <div class="md:col-span-2">
                <label class="text-xs font-medium text-slate-500">Input Data</label>
                <p class="mt-1 text-xs font-mono text-slate-600 break-all bg-slate-50 p-2 rounded">{{ currentTransaction?.inputData }}</p>
              </div>
            </div>
          </section>

          <!-- 关联信息 -->
          <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 class="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
              <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-100">
                <svg class="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                </svg>
              </span>
              <span>关联订单</span>
            </h3>
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="text-xs font-medium text-slate-500">还款ID</label>
                <p class="mt-1 text-sm font-medium text-blue-600">{{ currentTransaction?.repaymentId }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">订单ID</label>
                <p class="mt-1 text-sm font-medium text-blue-600">{{ currentTransaction?.orderId }}</p>
              </div>
            </div>
          </section>
        </div>

        <!-- 底部操作 -->
        <footer class="border-t border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4">
          <div class="flex items-center justify-between">
            <button 
              type="button" 
              class="rounded-lg border border-cyan-300 bg-cyan-50 px-5 py-2.5 text-sm font-medium text-cyan-700 shadow-sm hover:bg-cyan-100 transition-colors flex items-center gap-2"
              @click="openBlockExplorer(currentTransaction?.txHash)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
              <span>在区块浏览器中查看</span>
            </button>
            <button 
              type="button" 
              class="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
              @click="closeTransactionModal"
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
import { ref, computed, onMounted } from 'vue'
import { mockRepayments } from '../../mock/cryptoLending'
import {
  REPAYMENT_STATUS_LABELS,
  REPAYMENT_TYPE_LABELS
} from '../../constants/cryptoLending'

const repayments = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const showMoreMenuId = ref(null)
const showDetailModal = ref(false)
const currentDetailRepayment = ref(null)
const showAdjustModal = ref(false)
const currentAdjustRepayment = ref(null)
const showTransactionModal = ref(false)
const currentTransaction = ref(null)
const showCancelModal = ref(false)
const currentCancelRepayment = ref(null)
const cancelForm = ref({
  reason: ''
})
const adjustForm = ref({
  amount: 0,
  scheduledDate: '',
  reason: ''
})

const filters = ref({
  status: '',
  repaymentType: '',
  timeRange: 'all',
  searchText: ''
})

onMounted(() => {
  repayments.value = mockRepayments
  // 点击外部关闭菜单
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.relative')) {
      showMoreMenuId.value = null
    }
  })
})

const filteredRepayments = computed(() => {
  let result = repayments.value

  if (filters.value.status) {
    result = result.filter(r => r.status === filters.value.status)
  }
  if (filters.value.repaymentType) {
    result = result.filter(r => r.repaymentType === filters.value.repaymentType)
  }
  if (filters.value.searchText) {
    const search = filters.value.searchText.toLowerCase()
    result = result.filter(r => 
      r.orderId.toLowerCase().includes(search) ||
      r.userId.toLowerCase().includes(search) ||
      r.userName.toLowerCase().includes(search)
    )
  }

  return result
})

const totalPages = computed(() => {
  return Math.ceil(filteredRepayments.value.length / pageSize.value)
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(value)
}

const formatDateTime = (dateStr) => {
  return dateStr
}

const statusLabel = (status) => {
  return REPAYMENT_STATUS_LABELS[status] || status
}

const repaymentTypeLabel = (type) => {
  return REPAYMENT_TYPE_LABELS[type] || type
}

const resetFilters = () => {
  filters.value = {
    status: '',
    repaymentType: '',
    timeRange: 'all',
    searchText: ''
  }
}

const toggleMoreMenu = (repaymentId) => {
  showMoreMenuId.value = showMoreMenuId.value === repaymentId ? null : repaymentId
}

const viewDetails = (repayment) => {
  currentDetailRepayment.value = repayment
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  currentDetailRepayment.value = null
}

const confirmRepayment = (repayment) => {
  if (confirm(`确认收到还款 ${repayment.repaymentId} 的款项吗？`)) {
    // 更新状态为已完成
    const index = repayments.value.findIndex(r => r.repaymentId === repayment.repaymentId)
    if (index !== -1) {
      repayments.value[index].status = 'completed'
      repayments.value[index].repaymentTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
    }
    alert('还款已确认')
  }
  showMoreMenuId.value = null
}

const retryRepayment = (repayment) => {
  if (confirm(`确定重新发起还款 ${repayment.repaymentId} 吗？`)) {
    const index = repayments.value.findIndex(r => r.repaymentId === repayment.repaymentId)
    if (index !== -1) {
      repayments.value[index].status = 'processing'
      repayments.value[index].failureReason = null
    }
    alert('已重新发起还款')
  }
  showMoreMenuId.value = null
}

const sendReminder = (repayment) => {
  alert(`已向用户 ${repayment.userName} 发送还款提醒`)
  showMoreMenuId.value = null
}

const viewTransaction = (repayment) => {
  // 模拟获取完整的交易详情
  currentTransaction.value = {
    transactionId: repayment.transactionId,
    repaymentId: repayment.repaymentId,
    orderId: repayment.orderId,
    amount: repayment.amount,
    currency: 'USDT',
    paymentMethod: repayment.paymentMethod,
    status: 'confirmed',
    // 区块链信息
    blockchainType: 'Ethereum',
    txHash: '0x' + Math.random().toString(16).substr(2, 64),
    blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
    blockTime: repayment.repaymentTime || repayment.createTime,
    confirmations: Math.floor(Math.random() * 50) + 12,
    // 费用信息
    gasFee: (Math.random() * 10 + 5).toFixed(4),
    gasPrice: (Math.random() * 50 + 20).toFixed(2),
    gasUsed: Math.floor(Math.random() * 50000) + 21000,
    networkFee: (Math.random() * 2 + 1).toFixed(2),
    // 地址信息
    fromAddress: '0x' + Math.random().toString(16).substr(2, 40),
    toAddress: '0x' + Math.random().toString(16).substr(2, 40),
    // 时间信息
    createTime: repayment.createTime,
    confirmTime: repayment.repaymentTime,
    // 其他信息
    nonce: Math.floor(Math.random() * 1000),
    inputData: '0xa9059cbb' + Math.random().toString(16).substr(2, 120)
  }
  showTransactionModal.value = true
  showMoreMenuId.value = null
}

const closeTransactionModal = () => {
  showTransactionModal.value = false
  currentTransaction.value = null
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    alert('已复制到剪贴板')
  }).catch(() => {
    alert('复制失败')
  })
}

const openBlockExplorer = (txHash) => {
  window.open(`https://etherscan.io/tx/${txHash}`, '_blank')
}

const adjustRepaymentPlan = (repayment) => {
  currentAdjustRepayment.value = repayment
  adjustForm.value = {
    amount: repayment.amount,
    scheduledDate: '',
    reason: ''
  }
  showAdjustModal.value = true
  showMoreMenuId.value = null
}

const submitAdjustment = () => {
  if (!adjustForm.value.reason) {
    alert('请填写调整原因')
    return
  }
  
  const index = repayments.value.findIndex(r => r.repaymentId === currentAdjustRepayment.value.repaymentId)
  if (index !== -1) {
    repayments.value[index].amount = adjustForm.value.amount
  }
  
  alert('还款计划已调整')
  showAdjustModal.value = false
}

const cancelRepayment = (repayment) => {
  currentCancelRepayment.value = repayment
  cancelForm.value.reason = ''
  showCancelModal.value = true
  showMoreMenuId.value = null
}

const submitCancellation = () => {
  if (!cancelForm.value.reason.trim()) {
    alert('请输入取消原因')
    return
  }
  
  const index = repayments.value.findIndex(r => r.repaymentId === currentCancelRepayment.value.repaymentId)
  if (index !== -1) {
    repayments.value.splice(index, 1)
  }
  alert(`还款已取消\n原因: ${cancelForm.value.reason}`)
  showCancelModal.value = false
}

const exportReceipt = (repayment) => {
  alert(`导出还款凭证: ${repayment.repaymentId}`)
  showMoreMenuId.value = null
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}
</script>
