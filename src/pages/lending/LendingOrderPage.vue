<template>
  <section class="space-y-4">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl font-semibold text-slate-900">订单管理</h1>
        <p class="mt-1 text-sm text-slate-500">监控借贷订单状态、LTV与风险等级</p>
      </div>
      <button type="button" class="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2" @click="exportOrders">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
        <span>导出订单</span>
      </button>
    </header>

    <article class="rounded-xl border border-slate-200 bg-white">
      <div class="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4">
        <select v-model="filters.status" class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500">
          <option value="">全部状态</option>
          <option value="pending">待审核</option>
          <option value="active">借贷中</option>
          <option value="repaying">还款中</option>
          <option value="completed">已完成</option>
          <option value="liquidated">已清算</option>
        </select>
        <select v-model="filters.collateralType" class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500">
          <option value="">全部抵押币种</option>
          <option value="BTC">BTC</option>
          <option value="ETH">ETH</option>
          <option value="USDT">USDT</option>
          <option value="BNB">BNB</option>
        </select>
        <input v-model="filters.userId" type="text" placeholder="搜索用户ID..." class="w-full max-w-xs rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500" />
        <button type="button" class="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50" @click="resetFilters">重置</button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-slate-500">
            <tr>
              <th class="px-4 py-3 text-left font-medium">订单ID</th>
              <th class="px-4 py-3 text-left font-medium">用户信息</th>
              <th class="px-4 py-3 text-left font-medium">产品名称</th>
              <th class="px-4 py-3 text-left font-medium">抵押资产</th>
              <th class="px-4 py-3 text-left font-medium">借贷金额</th>
              <th class="px-4 py-3 text-left font-medium">LTV</th>
              <th class="px-4 py-3 text-left font-medium">利息/总债务</th>
              <th class="px-4 py-3 text-left font-medium">期限</th>
              <th class="px-4 py-3 text-left font-medium">状态</th>
              <th class="px-4 py-3 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.orderId" class="border-t border-slate-100" :class="{'bg-rose-50': order.currentLtv > 75}">
              <td class="px-4 py-3">
                <div class="font-mono text-xs text-slate-600">{{ order.orderId }}</div>
                <div class="text-xs text-slate-500">{{ formatDate(order.createTime) }}</div>
              </td>
              <td class="px-4 py-3">
                <div class="text-slate-700">{{ order.userId }}</div>
                <div class="text-xs text-slate-500">{{ order.userName }}</div>
              </td>
              <td class="px-4 py-3 font-medium text-slate-900">{{ order.productName }}</td>
              <td class="px-4 py-3">
                <div class="font-medium text-slate-900">{{ order.collateralAmount }} {{ order.collateralType }}</div>
                <div class="text-xs text-slate-500">≈ {{ formatCurrency(order.collateralValue) }}</div>
              </td>
              <td class="px-4 py-3">
                <div class="font-medium text-slate-900">{{ formatCurrency(order.loanAmount) }}</div>
                <div class="text-xs text-slate-500">{{ order.loanCurrency }}</div>
              </td>
              <td class="px-4 py-3">
                <div class="mb-1 font-medium" :class="{
                  'text-emerald-600': order.currentLtv <= 60,
                  'text-amber-600': order.currentLtv > 60 && order.currentLtv <= 75,
                  'text-rose-600': order.currentLtv > 75
                }">
                  {{ order.currentLtv }}%
                </div>
                <div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div class="h-full transition-all" :class="{
                    'bg-emerald-500': order.currentLtv <= 60,
                    'bg-amber-500': order.currentLtv > 60 && order.currentLtv <= 75,
                    'bg-rose-500': order.currentLtv > 75
                  }" :style="{width: `${order.currentLtv}%`}"></div>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="text-xs text-slate-600">利息: {{ formatCurrency(order.interestAccrued) }}</div>
                <div class="font-medium text-slate-900">{{ formatCurrency(order.totalDebt) }}</div>
              </td>
              <td class="px-4 py-3">
                <div class="text-slate-700">{{ order.daysElapsed }}d / {{ order.loanDuration }}d</div>
                <div class="text-xs text-slate-500">剩余 {{ order.daysRemaining }}d</div>
              </td>
              <td class="px-4 py-3">
                <span class="rounded-md px-2 py-0.5 text-xs font-medium" :class="{
                  'bg-blue-50 text-blue-700': order.status === 'pending',
                  'bg-emerald-50 text-emerald-700': order.status === 'active',
                  'bg-cyan-50 text-cyan-700': order.status === 'repaying',
                  'bg-slate-100 text-slate-600': order.status === 'completed',
                  'bg-rose-50 text-rose-700': order.status === 'liquidated'
                }">
                  {{ statusLabel(order.status) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <button 
                    v-if="order.status === 'pending'" 
                    type="button" 
                    class="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100 font-medium transition-colors whitespace-nowrap" 
                    @click="reviewOrder(order)"
                  >
                    审核
                  </button>
                  <button 
                    v-else
                    type="button" 
                    class="rounded border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors whitespace-nowrap" 
                    @click="viewOrder(order)"
                  >
                    详情
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-between border-t border-slate-200 px-4 py-3">
        <button type="button" :disabled="currentPage === 1" class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed" @click="prevPage">
          上一页
        </button>
        <span class="text-sm text-slate-600">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
        <button type="button" :disabled="currentPage === totalPages" class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed" @click="nextPage">
          下一页
        </button>
      </div>
    </article>

    <!-- 审核/详情模态框 -->
    <div v-if="showReviewModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="closeReviewModal">
      <article class="relative w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl flex flex-col">
        <!-- 头部 - 简洁设计 -->
        <header class="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-full" :class="{
              'bg-blue-100': isReviewMode,
              'bg-slate-100': !isReviewMode
            }">
              <svg v-if="isReviewMode" class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <svg v-else class="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-semibold text-slate-900">{{ isReviewMode ? '借款单审核' : '订单详情' }}</h2>
              <p class="mt-0.5 text-sm text-slate-500">订单编号: {{ currentReviewOrder?.orderId }}</p>
            </div>
          </div>
          <button type="button" class="text-slate-400 hover:text-slate-600 transition-colors" @click="closeReviewModal">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </header>

        <!-- Tab 导航 -->
        <div class="border-b border-slate-200 bg-slate-50 px-6">
          <div class="flex gap-1">
            <button
              type="button"
              @click="detailTab = 'overview'"
              class="px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2"
              :class="detailTab === 'overview' 
                ? 'border-blue-600 text-blue-600 bg-white' 
                : 'border-transparent text-slate-600 hover:text-slate-900'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              <span>概览</span>
            </button>
            <button
              type="button"
              @click="detailTab = 'details'"
              class="px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2"
              :class="detailTab === 'details' 
                ? 'border-blue-600 text-blue-600 bg-white' 
                : 'border-transparent text-slate-600 hover:text-slate-900'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
              </svg>
              <span>借贷详情</span>
            </button>
            <button
              type="button"
              @click="detailTab = 'risk'"
              class="px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2"
              :class="detailTab === 'risk' 
                ? 'border-blue-600 text-blue-600 bg-white' 
                : 'border-transparent text-slate-600 hover:text-slate-900'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <span>风险分析</span>
            </button>
            <button
              type="button"
              @click="detailTab = 'notes'"
              class="px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2"
              :class="detailTab === 'notes' 
                ? 'border-blue-600 text-blue-600 bg-white' 
                : 'border-transparent text-slate-600 hover:text-slate-900'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              <span>申请说明</span>
            </button>
            <button
              v-if="isReviewMode"
              type="button"
              @click="detailTab = 'review'"
              class="px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2"
              :class="detailTab === 'review' 
                ? 'border-blue-600 text-blue-600 bg-white' 
                : 'border-transparent text-slate-600 hover:text-slate-900'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>审核意见</span>
            </button>
          </div>
        </div>

        <!-- 内容区域 - 可滚动 -->
        <div class="flex-1 overflow-y-auto bg-slate-50">
          <!-- Tab: 概览 -->
          <div v-if="detailTab === 'overview'" class="p-6 space-y-5">
            <!-- 关键指标卡片 -->
            <div class="grid gap-4 md:grid-cols-4">
              <div class="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-4">
                <div class="flex items-center gap-2 text-sm text-blue-700">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>借款金额</span>
                </div>
                <p class="mt-2 text-2xl font-bold text-blue-900">{{ formatCurrency(currentReviewOrder?.requestedAmount) }}</p>
                <p class="mt-1 text-xs text-blue-600">{{ currentReviewOrder?.loanCurrency }}</p>
              </div>

              <div class="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 p-4">
                <div class="flex items-center gap-2 text-sm text-purple-700">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                  <span>抵押价值</span>
                </div>
                <p class="mt-2 text-2xl font-bold text-purple-900">{{ formatCurrency(currentReviewOrder?.collateralValue) }}</p>
                <p class="mt-1 text-xs text-purple-600">{{ currentReviewOrder?.collateralAmount }} {{ currentReviewOrder?.collateralType }}</p>
              </div>

              <div class="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50 p-4">
                <div class="flex items-center gap-2 text-sm text-amber-700">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span>LTV 比率</span>
                </div>
                <p class="mt-2 text-2xl font-bold" :class="{
                  'text-emerald-600': currentReviewOrder?.initialLtv <= 60,
                  'text-amber-600': currentReviewOrder?.initialLtv > 60 && currentReviewOrder?.initialLtv <= 75,
                  'text-rose-600': currentReviewOrder?.initialLtv > 75
                }">{{ currentReviewOrder?.initialLtv }}%</p>
                <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-white">
                  <div class="h-full transition-all" :class="{
                    'bg-emerald-500': currentReviewOrder?.initialLtv <= 60,
                    'bg-amber-500': currentReviewOrder?.initialLtv > 60 && currentReviewOrder?.initialLtv <= 75,
                    'bg-rose-500': currentReviewOrder?.initialLtv > 75
                  }" :style="{width: `${currentReviewOrder?.initialLtv}%`}"></div>
                </div>
              </div>

              <div class="rounded-xl border p-4" :class="{
                'border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50': currentReviewOrder?.riskLevel === 'low',
                'border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50': currentReviewOrder?.riskLevel === 'medium',
                'border-rose-200 bg-gradient-to-br from-rose-50 to-rose-100/50': currentReviewOrder?.riskLevel === 'high'
              }">
                <div class="flex items-center gap-2 text-sm" :class="{
                  'text-emerald-700': currentReviewOrder?.riskLevel === 'low',
                  'text-amber-700': currentReviewOrder?.riskLevel === 'medium',
                  'text-rose-700': currentReviewOrder?.riskLevel === 'high'
                }">
                  <svg v-if="currentReviewOrder?.riskLevel === 'low'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <svg v-else-if="currentReviewOrder?.riskLevel === 'medium'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>风险评级</span>
                </div>
                <p class="mt-2 text-2xl font-bold" :class="{
                  'text-emerald-900': currentReviewOrder?.riskLevel === 'low',
                  'text-amber-900': currentReviewOrder?.riskLevel === 'medium',
                  'text-rose-900': currentReviewOrder?.riskLevel === 'high'
                }">
                  {{ currentReviewOrder?.riskLevel === 'low' ? '低风险' : currentReviewOrder?.riskLevel === 'medium' ? '中风险' : '高风险' }}
                </p>
                <p class="mt-1 text-xs" :class="{
                  'text-emerald-600': currentReviewOrder?.riskLevel === 'low',
                  'text-amber-600': currentReviewOrder?.riskLevel === 'medium',
                  'text-rose-600': currentReviewOrder?.riskLevel === 'high'
                }">信用评分: {{ currentReviewOrder?.creditScore || '-' }}</p>
              </div>
            </div>

            <!-- 用户信息 -->
            <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                  <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </span>
                <span>用户信息</span>
              </h3>
              <div class="grid gap-4 md:grid-cols-3">
                <div class="space-y-1">
                  <label class="text-xs font-medium text-slate-500">用户ID</label>
                  <p class="font-mono text-sm font-medium text-slate-900">{{ currentReviewOrder?.userId }}</p>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-slate-500">用户姓名</label>
                  <p class="text-sm font-medium text-slate-900">{{ currentReviewOrder?.userName }}</p>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-slate-500">信用评分</label>
                  <div class="flex items-center gap-2">
                    <p class="text-sm font-bold" :class="{
                      'text-emerald-600': (currentReviewOrder?.creditScore || 0) >= 750,
                      'text-amber-600': (currentReviewOrder?.creditScore || 0) >= 650 && (currentReviewOrder?.creditScore || 0) < 750,
                      'text-rose-600': (currentReviewOrder?.creditScore || 0) < 650
                    }">{{ currentReviewOrder?.creditScore || '-' }}</p>
                    <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="{
                      'bg-emerald-100 text-emerald-700': (currentReviewOrder?.creditScore || 0) >= 750,
                      'bg-amber-100 text-amber-700': (currentReviewOrder?.creditScore || 0) >= 650 && (currentReviewOrder?.creditScore || 0) < 750,
                      'bg-rose-100 text-rose-700': (currentReviewOrder?.creditScore || 0) < 650
                    }">
                      {{ (currentReviewOrder?.creditScore || 0) >= 750 ? '优秀' : (currentReviewOrder?.creditScore || 0) >= 650 ? '良好' : '一般' }}
                    </span>
                  </div>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-slate-500">邮箱地址</label>
                  <p class="text-sm text-slate-700">{{ currentReviewOrder?.email || '-' }}</p>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-slate-500">联系电话</label>
                  <p class="text-sm text-slate-700">{{ currentReviewOrder?.phone || '-' }}</p>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-slate-500">申请时间</label>
                  <p class="text-sm text-slate-700">{{ currentReviewOrder?.createTime }}</p>
                </div>
              </div>
            </section>
          </div>

          <!-- Tab: 借贷详情 -->
          <div v-if="detailTab === 'details'" class="p-6 space-y-5">
            <!-- 产品与期限 -->
            <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                  <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                </span>
                <span>产品信息</span>
              </h3>
              <div class="grid gap-4 md:grid-cols-2">
                <div class="rounded-lg border border-blue-100 bg-blue-50 p-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-blue-700">产品名称</span>
                    <span class="text-lg font-bold text-blue-900">{{ currentReviewOrder?.productName }}</span>
                  </div>
                  <div class="mt-3 flex items-center justify-between">
                    <span class="text-sm font-medium text-blue-700">年化利率</span>
                    <span class="text-lg font-bold text-blue-900">{{ currentReviewOrder?.interestRate }}%</span>
                  </div>
                </div>
                <div class="rounded-lg border border-purple-100 bg-purple-50 p-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-purple-700">借款期限</span>
                    <span class="text-lg font-bold text-purple-900">{{ currentReviewOrder?.loanDuration }} 天</span>
                  </div>
                  <div class="mt-3 flex items-center justify-between">
                    <span class="text-sm font-medium text-purple-700">到期日期</span>
                    <span class="text-sm font-medium text-purple-900">{{ formatDate(currentReviewOrder?.maturityDate) }}</span>
                  </div>
                </div>
              </div>
            </section>

            <!-- 借款金额 -->
            <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </span>
                <span>借款信息</span>
              </h3>
              <div class="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                <div class="grid gap-4 md:grid-cols-3">
                  <div>
                    <p class="text-xs text-emerald-600">申请金额</p>
                    <p class="mt-1 text-2xl font-bold text-emerald-900">{{ formatCurrency(currentReviewOrder?.requestedAmount) }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-emerald-600">借出币种</p>
                    <p class="mt-1 text-xl font-bold text-emerald-900">{{ currentReviewOrder?.loanCurrency }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-emerald-600">预计利息</p>
                    <p class="mt-1 text-xl font-bold text-emerald-900">{{ formatCurrency(estimatedInterest) }}</p>
                  </div>
                </div>
              </div>
            </section>

            <!-- 抵押物详情 -->
            <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                  <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </span>
                <span>抵押资产</span>
              </h3>
              <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div class="grid gap-4 md:grid-cols-4">
                  <div>
                    <p class="text-xs text-slate-500">币种</p>
                    <p class="mt-1 text-xl font-bold text-slate-900">{{ currentReviewOrder?.collateralType }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500">数量</p>
                    <p class="mt-1 text-xl font-bold text-slate-900">{{ currentReviewOrder?.collateralAmount }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500">当前单价</p>
                    <p class="mt-1 text-sm font-bold text-slate-900">{{ formatCurrency(currentReviewOrder?.currentPrice) }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500">总价值</p>
                    <p class="mt-1 text-sm font-bold text-emerald-600">{{ formatCurrency(currentReviewOrder?.collateralValue) }}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <!-- Tab: 风险分析 -->
          <div v-if="detailTab === 'risk'" class="p-6 space-y-5">
            <!-- 风险分析面板 -->
            <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100">
                  <svg class="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </span>
                <span>风险指标</span>
              </h3>
              <div class="grid gap-4 md:grid-cols-3">
                <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p class="text-sm font-medium text-slate-700">安全边际</p>
                  <p class="mt-2 text-2xl font-bold" :class="{
                    'text-emerald-600': safetyMargin >= 15,
                    'text-amber-600': safetyMargin >= 5 && safetyMargin < 15,
                    'text-rose-600': safetyMargin < 5
                  }">{{ safetyMargin }}%</p>
                  <p class="mt-1 text-xs text-slate-500">清算阈值 - 当前LTV</p>
                </div>
                <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p class="text-sm font-medium text-slate-700">清算价格</p>
                  <p class="mt-2 text-2xl font-bold text-slate-900">{{ formatCurrency(currentReviewOrder?.liquidationPrice) }}</p>
                  <p class="mt-1 text-xs text-slate-500">跌幅: {{ priceDropToLiquidation }}%</p>
                </div>
                <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p class="text-sm font-medium text-slate-700">清算阈值</p>
                  <p class="mt-2 text-2xl font-bold text-slate-900">{{ currentReviewOrder?.liquidationThreshold }}%</p>
                  <p class="mt-1 text-xs text-slate-500">触发清算的LTV值</p>
                </div>
              </div>
            </section>

            <!-- LTV 可视化 -->
            <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                  <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
                  </svg>
                </span>
                <span>LTV 可视化</span>
              </h3>
              <div class="space-y-4">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm text-slate-600">当前 LTV</span>
                    <span class="text-lg font-bold" :class="{
                      'text-emerald-600': currentReviewOrder?.initialLtv <= 60,
                      'text-amber-600': currentReviewOrder?.initialLtv > 60 && currentReviewOrder?.initialLtv <= 75,
                      'text-rose-600': currentReviewOrder?.initialLtv > 75
                    }">{{ currentReviewOrder?.initialLtv }}%</span>
                  </div>
                  <div class="relative h-8 w-full overflow-hidden rounded-full bg-slate-200">
                    <div class="h-full transition-all" :class="{
                      'bg-emerald-500': currentReviewOrder?.initialLtv <= 60,
                      'bg-amber-500': currentReviewOrder?.initialLtv > 60 && currentReviewOrder?.initialLtv <= 75,
                      'bg-rose-500': currentReviewOrder?.initialLtv > 75
                    }" :style="{width: `${currentReviewOrder?.initialLtv}%`}"></div>
                    <div class="absolute left-0 top-0 h-full w-px bg-rose-600" :style="{left: `${currentReviewOrder?.liquidationThreshold}%`}">
                      <div class="absolute -top-6 -left-8 text-xs text-rose-600 font-medium whitespace-nowrap">
                        清算线 {{ currentReviewOrder?.liquidationThreshold }}%
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="grid gap-3 md:grid-cols-2">
                  <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                    <p class="text-xs text-emerald-700">安全区间</p>
                    <p class="mt-1 text-sm font-medium text-emerald-900">0% - 60%</p>
                  </div>
                  <div class="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p class="text-xs text-amber-700">警告区间</p>
                    <p class="mt-1 text-sm font-medium text-amber-900">60% - {{ currentReviewOrder?.liquidationThreshold }}%</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <!-- Tab: 申请说明 -->
          <div v-if="detailTab === 'notes'" class="p-6 space-y-5">
            <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100">
                  <svg class="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </span>
                <span>申请说明</span>
              </h3>
              <div class="space-y-4">
                <div>
                  <label class="text-sm font-semibold text-slate-700">借款用途</label>
                  <p class="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-900">{{ currentReviewOrder?.purpose || '未填写' }}</p>
                </div>
                <div>
                  <label class="text-sm font-semibold text-slate-700">风控备注</label>
                  <p class="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600">{{ currentReviewOrder?.remarks || '无备注' }}</p>
                </div>
              </div>
            </section>
          </div>

          <!-- Tab: 审核意见（仅审核模式） -->
          <div v-if="detailTab === 'review' && isReviewMode" class="p-6">
            <section class="rounded-xl border border-amber-200 bg-white p-5 shadow-sm">
              <h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-amber-900">
                <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                  <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </span>
                <span>审核意见</span>
              </h3>
              <textarea 
                v-model="reviewComment" 
                rows="8" 
                placeholder="请输入审核意见和理由（批准时选填，拒绝时必填）..."
                class="w-full rounded-lg border-2 border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-relaxed outline-none transition-colors focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200"
              ></textarea>
              <p class="mt-2 flex items-center gap-1 text-xs text-slate-500">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>审核意见将记录在系统中，请认真填写</span>
              </p>
            </section>
          </div>
        </div>

        <!-- 操作按钮 -->
        <footer class="border-t border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="text-sm text-slate-500">
              {{ isReviewMode ? '请仔细审核后做出决策' : '如需操作请联系管理员' }}
            </div>
            <div class="flex items-center gap-3">
              <button 
                type="button" 
                class="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                @click="closeReviewModal"
              >
                {{ isReviewMode ? '取消' : '关闭' }}
              </button>
              <template v-if="isReviewMode">
                <button 
                  type="button" 
                  class="rounded-lg border border-rose-300 bg-rose-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rose-600 flex items-center gap-2"
                  @click="rejectOrder"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                  <span>拒绝申请</span>
                </button>
                <button 
                  type="button" 
                  class="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:from-emerald-600 hover:to-emerald-700 flex items-center gap-2"
                  @click="approveOrder"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span>批准放款</span>
                </button>
              </template>
            </div>
          </div>
        </footer>
      </article>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { mockOrders } from '../../mock/cryptoLending'
import { LOAN_ORDER_STATUS_LABELS } from '../../constants/cryptoLending'

const orders = ref([])
const currentPage = ref(1)
const pageSize = ref(10)

const filters = ref({
  status: '',
  collateralType: '',
  userId: ''
})

onMounted(() => {
  orders.value = mockOrders
})

// 计算属性：安全边际
const safetyMargin = computed(() => {
  if (!currentReviewOrder.value) return 0
  const threshold = currentReviewOrder.value.liquidationThreshold || 0
  const ltv = currentReviewOrder.value.initialLtv || 0
  return Number((threshold - ltv).toFixed(2))
})

// 计算属性：清算价格跌幅
const priceDropToLiquidation = computed(() => {
  if (!currentReviewOrder.value) return 0
  const currentPrice = currentReviewOrder.value.currentPrice || 0
  const liquidationPrice = currentReviewOrder.value.liquidationPrice || 0
  if (currentPrice === 0) return 0
  return Number((((currentPrice - liquidationPrice) / currentPrice) * 100).toFixed(2))
})

// 计算属性：预计总利息
const estimatedInterest = computed(() => {
  if (!currentReviewOrder.value) return 0
  const amount = currentReviewOrder.value.requestedAmount || currentReviewOrder.value.loanAmount || 0
  const rate = (currentReviewOrder.value.interestRate || 0) / 100
  const days = currentReviewOrder.value.loanDuration || 0
  return Number((amount * rate * days / 365).toFixed(2))
})

const filteredOrders = computed(() => {
  let result = orders.value

  if (filters.value.status) {
    result = result.filter(o => o.status === filters.value.status)
  }
  if (filters.value.collateralType) {
    result = result.filter(o => o.collateralType === filters.value.collateralType)
  }
  if (filters.value.userId) {
    result = result.filter(o => o.userId.includes(filters.value.userId))
  }

  return result
})

const totalPages = computed(() => {
  return Math.ceil(filteredOrders.value.length / pageSize.value)
})

const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0'
  }
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(value)
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return dateStr.split(' ')[0]
}

const statusLabel = (status) => {
  return LOAN_ORDER_STATUS_LABELS[status] || status
}

const resetFilters = () => {
  filters.value = {
    status: '',
    collateralType: '',
    userId: ''
  }
}

const exportOrders = () => {
  alert('导出订单数据')
}

const viewOrder = (order) => {
  currentReviewOrder.value = order
  reviewComment.value = ''
  isReviewMode.value = false
  detailTab.value = 'overview'
  showReviewModal.value = true
}

// 审核相关
const showReviewModal = ref(false)
const currentReviewOrder = ref(null)
const reviewComment = ref('')
const isReviewMode = ref(false)
const detailTab = ref('overview')

const reviewOrder = (order) => {
  currentReviewOrder.value = order
  reviewComment.value = ''
  isReviewMode.value = true
  detailTab.value = 'overview'
  showReviewModal.value = true
}

const closeReviewModal = () => {
  showReviewModal.value = false
  currentReviewOrder.value = null
  reviewComment.value = ''
  isReviewMode.value = false
  detailTab.value = 'overview'
}

const approveOrder = () => {
  if (!currentReviewOrder.value) return
  
  // 更新订单状态为活跃
  const order = orders.value.find(o => o.orderId === currentReviewOrder.value.orderId)
  if (order) {
    order.status = 'active'
    order.updateTime = new Date().toISOString().replace('T', ' ').substring(0, 19)
  }
  
  alert(`订单 ${currentReviewOrder.value.orderId} 已批准放款\n${reviewComment.value ? '审核意见: ' + reviewComment.value : ''}`)
  closeReviewModal()
}

const rejectOrder = () => {
  if (!currentReviewOrder.value) return
  
  if (!reviewComment.value.trim()) {
    alert('拒绝申请时必须填写审核意见')
    return
  }
  
  // 从订单列表中移除
  const index = orders.value.findIndex(o => o.orderId === currentReviewOrder.value.orderId)
  if (index > -1) {
    orders.value.splice(index, 1)
  }
  
  alert(`订单 ${currentReviewOrder.value.orderId} 已拒绝\n拒绝理由: ${reviewComment.value}`)
  closeReviewModal()
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}
</script>
