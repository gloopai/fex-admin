<template>
  <section class="space-y-4">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl font-semibold text-slate-900">交割合约订单</h1>
        <p class="mt-1 text-sm text-slate-500">监控用户交割合约投资、收益与结算状态</p>
      </div>
      <button type="button" class="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2" @click="exportOrders">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
        <span>导出订单</span>
      </button>
    </header>

    <article class="rounded-xl border border-slate-200 bg-white">
      <!-- 筛选区域 -->
      <div class="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4">
        <select v-model="filters.status" class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500">
          <option value="">全部状态</option>
          <option :value="DELIVERY_ORDER_STATUS.PENDING">待结算</option>
          <option :value="DELIVERY_ORDER_STATUS.SETTLED">已结算</option>
          <option :value="DELIVERY_ORDER_STATUS.EXERCISED">已行权</option>
        </select>
        
        <select v-model="filters.product" class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500">
          <option value="">全部产品</option>
          <option value="BTC 期权">BTC 期权</option>
          <option value="ETH 期权">ETH 期权</option>
        </select>
        
        <select v-model="filters.result" class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500">
          <option value="">全部结果</option>
          <option :value="DELIVERY_ORDER_RESULT.WIN">赢利</option>
          <option :value="DELIVERY_ORDER_RESULT.LOSS">亏损</option>
        </select>
        
        <input v-model="filters.userId" type="text" placeholder="搜索用户 ID..." class="w-full max-w-xs rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500" />
        
        <button type="button" class="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-1" @click="showAdvancedFilters = !showAdvancedFilters">
          <span>{{ showAdvancedFilters ? '收起' : '高级筛选' }}</span>
          <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': showAdvancedFilters }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        
        <button type="button" class="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50" @click="resetFilters">重置</button>
      </div>
      
      <!-- 高级筛选 -->
      <div v-show="showAdvancedFilters" class="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div class="grid gap-3 md:grid-cols-4">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">投资金额范围 (USDT)</label>
            <div class="flex items-center gap-2">
              <input v-model="filters.minInvest" type="number" placeholder="最小" class="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm" />
              <span class="text-slate-500">-</span>
              <input v-model="filters.maxInvest" type="number" placeholder="最大" class="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm" />
            </div>
          </div>
          
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">收益率范围 (%)</label>
            <div class="flex items-center gap-2">
              <input v-model="filters.minYield" type="number" placeholder="最小" class="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm" />
              <span class="text-slate-500">-</span>
              <input v-model="filters.maxYield" type="number" placeholder="最大" class="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm" />
            </div>
          </div>
          
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">周期类型</label>
            <select v-model="filters.cycleType" class="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm">
              <option value="">全部周期</option>
              <option value="short">短期 (30-60s)</option>
              <option value="medium">中期 (60-180s)</option>
              <option value="long">长期 (180s+)</option>
            </select>
          </div>
          
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">下注时间范围</label>
            <input v-model="filters.dateRange" type="date" class="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm" />
          </div>
        </div>
      </div>

      <!-- 订单表格 -->
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-slate-500">
            <tr>
              <th class="px-4 py-3 text-left font-medium">订单 ID</th>
              <th class="px-4 py-3 text-left font-medium">用户信息</th>
              <th class="px-4 py-3 text-left font-medium">产品 / 方向</th>
              <th class="px-4 py-3 text-left font-medium">投资 / 预期收益</th>
              <th class="px-4 py-3 text-left font-medium">周期 / 收益率</th>
              <th class="px-4 py-3 text-left font-medium">实际收益</th>
              <th class="px-4 py-3 text-left font-medium">时间信息</th>
              <th class="px-4 py-3 text-left font-medium">状态 / 结果</th>
              <th class="px-4 py-3 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in paginatedOrders" :key="order.id" class="border-t border-slate-100 hover:bg-slate-50" :class="{
              'bg-emerald-50': order.result === DELIVERY_ORDER_RESULT.WIN,
              'bg-rose-50': order.result === DELIVERY_ORDER_RESULT.LOSS
            }">
              <td class="px-4 py-3">
                <div class="font-mono text-xs text-slate-600">{{ order.orderId }}</div>
                <div class="text-xs text-slate-500">{{ order.betTime.split(' ')[0] }}</div>
              </td>
              <td class="px-4 py-3">
                <div class="text-slate-700 font-medium">{{ order.userName }}</div>
                <div class="text-xs text-slate-500">{{ order.userId }}</div>
                <span :class="['text-xs px-2 py-0.5 rounded-md font-medium', vipLevelMeta[order.vipLevel]?.class || 'bg-slate-100 text-slate-600']">
                  {{ vipLevelMeta[order.vipLevel]?.label || order.vipLevel }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="font-medium text-slate-900 mb-1">{{ order.productName }}</div>
                <span :class="['text-xs px-2 py-0.5 rounded-md font-medium', deliveryOrderDirectionMeta[order.direction]?.badgeClass]">
                  {{ deliveryOrderDirectionMeta[order.direction]?.text }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="font-medium text-slate-900">${{ order.investAmount?.toFixed(2) }}</div>
                <div class="text-xs text-slate-500">预期：${{ order.expectedReturn?.toFixed(2) }}</div>
              </td>
              <td class="px-4 py-3">
                <div class="text-slate-700">{{ order.cycleSeconds }}s</div>
                <div class="text-xs" :class="order.expectedYield >= 30 ? 'text-emerald-600' : 'text-slate-500'">
                  {{ order.expectedYield }}%
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="font-medium" :class="{
                  'text-emerald-600': order.actualYield > 0,
                  'text-rose-600': order.actualYield < 0,
                  'text-slate-600': order.actualYield === 0
                }">
                  {{ order.actualYield >= 0 ? '+' : '' }}${{ (order.actualReturn - order.investAmount)?.toFixed(2) }}
                </div>
                <div class="text-xs" :class="{
                  'text-emerald-600': order.actualYield > 0,
                  'text-rose-600': order.actualYield < 0,
                  'text-slate-500': order.actualYield === 0
                }">
                  {{ order.actualYield?.toFixed(2) }}%
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="text-xs">
                  <div class="text-slate-600">下注：{{ order.betTime.split(' ')[1] }}</div>
                  <div class="text-slate-600">到期：{{ order.expiryTime.split(' ')[1] }}</div>
                  <div v-if="order.settleTime" class="text-slate-500">结算：{{ order.settleTime.split(' ')[1] }}</div>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2 mb-1">
                  <span class="rounded-md px-2 py-0.5 text-xs font-medium" :class="deliveryOrderStatusMeta[order.status]?.badgeClass">
                    {{ deliveryOrderStatusMeta[order.status]?.text }}
                  </span>
                  <span v-if="order.result" class="rounded-md px-2 py-0.5 text-xs font-medium" :class="deliveryOrderResultMeta[order.result]?.badgeClass">
                    {{ deliveryOrderResultMeta[order.result]?.text }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3">
                <button type="button" class="rounded border border-slate-200 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors" @click="viewOrder(order)">
                  详情
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="flex items-center justify-between border-t border-slate-200 px-4 py-3">
        <div class="text-sm text-slate-600">
          共 {{ filteredOrders.length }} 条订单 · 第 {{ currentPage }} / {{ totalPages }} 页
        </div>
        <div class="flex items-center gap-3">
          <button type="button" :disabled="currentPage === 1" class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed" @click="prevPage">
            上一页
          </button>
          <button type="button" :disabled="currentPage === totalPages" class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed" @click="nextPage">
            下一页
          </button>
        </div>
      </div>
    </article>

    <!-- 详情弹窗 -->
    <div v-if="showDetailModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="closeDetailModal">
      <article class="relative w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl flex flex-col">
        <!-- 头部 -->
        <header class="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M6 21l3.414-3.414A2 2 0 0010 16.172V14a2 2 0 012-2h4a2 2 0 012 2v2.172a2 2 0 00.586 1.414L21 21M12 10a4 4 0 110 8 4 4 0 010-8z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-semibold text-slate-900">交割合约订单详情</h2>
              <p class="mt-0.5 text-sm text-slate-500">订单编号：{{ currentOrder?.orderId }}</p>
            </div>
          </div>
          <button type="button" class="text-slate-400 hover:text-slate-600 transition-colors" @click="closeDetailModal">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </header>

        <!-- Tab 导航 -->
        <div class="border-b border-slate-200 bg-slate-50 px-6">
          <div class="flex gap-1">
            <button
              v-for="tab in detailTabs"
              :key="tab.id"
              type="button"
              @click="currentTab = tab.id"
              class="px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2"
              :class="currentTab === tab.id 
                ? 'border-amber-600 text-amber-600 bg-white' 
                : 'border-transparent text-slate-600 hover:text-slate-900'"
            >
              <span>{{ tab.label }}</span>
            </button>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="flex-1 overflow-y-auto bg-slate-50 p-6">
          <!-- Tab 1: 概览 -->
          <div v-if="currentTab === 'overview'" class="space-y-5">
            <!-- 关键指标卡片 -->
            <div class="grid gap-4 md:grid-cols-4">
              <div class="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50 p-4">
                <div class="flex items-center gap-2 text-sm text-amber-700">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>投资金额</span>
                </div>
                <p class="mt-2 text-2xl font-bold text-amber-900">${{ currentOrder?.investAmount?.toFixed(2) }}</p>
                <p class="mt-1 text-xs text-amber-600">{{ currentOrder?.productName }}</p>
              </div>

              <div class="rounded-xl border" :class="currentOrder?.actualYield >= 0 
                ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50' 
                : 'border-rose-200 bg-gradient-to-br from-rose-50 to-rose-100/50'">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 text-sm" :class="currentOrder?.actualYield >= 0 
                    ? 'text-emerald-700' 
                    : 'text-rose-700'">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                    </svg>
                    <span>实际收益</span>
                  </div>
                  <span class="text-xs font-medium" :class="currentOrder?.actualYield >= 0 
                    ? 'text-emerald-600' 
                    : 'text-rose-600'">
                    {{ currentOrder?.actualYield?.toFixed(2) }}%
                  </span>
                </div>
                <p class="mt-2 text-2xl font-bold" :class="currentOrder?.actualYield >= 0 
                  ? 'text-emerald-900' 
                  : 'text-rose-900'">
                  {{ currentOrder?.actualYield >= 0 ? '+' : '' }}${{ (currentOrder?.actualReturn - currentOrder?.investAmount)?.toFixed(2) }}
                </p>
              </div>

              <div class="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 p-4">
                <div class="flex items-center gap-2 text-sm text-purple-700">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                  <span>预期收益</span>
                </div>
                <p class="mt-2 text-2xl font-bold text-purple-900">${{ currentOrder?.expectedPayout?.toFixed(2) }}</p>
                <p class="mt-1 text-xs text-purple-600">预期：${{ currentOrder?.expectedReturn?.toFixed(2) }}</p>
              </div>

              <div class="rounded-xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-cyan-100/50 p-4">
                <div class="flex items-center gap-2 text-sm text-cyan-700">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>周期</span>
                </div>
                <p class="mt-2 text-2xl font-bold text-cyan-900">{{ currentOrder?.cycleSeconds }}s</p>
                <p class="mt-1 text-xs text-cyan-600">收益率 {{ currentOrder?.expectedYield }}%</p>
              </div>
            </div>

            <!-- 结果标识 -->
            <div v-if="currentOrder?.result" class="rounded-xl p-5 text-center" :class="currentOrder?.result === DELIVERY_ORDER_RESULT.WIN 
              ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200' 
              : 'bg-gradient-to-r from-rose-50 to-rose-100 border border-rose-200'">
              <div class="flex items-center justify-center gap-3">
                <svg class="w-8 h-8" :class="currentOrder?.result === DELIVERY_ORDER_RESULT.WIN 
                  ? 'text-emerald-600' 
                  : 'text-rose-600'" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span class="text-2xl font-bold" :class="currentOrder?.result === DELIVERY_ORDER_RESULT.WIN 
                  ? 'text-emerald-700' 
                  : 'text-rose-700'">
                  {{ currentOrder?.result === DELIVERY_ORDER_RESULT.WIN ? '赢利' : '亏损' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Tab 2: 订单详情 -->
          <div v-if="currentTab === 'details'" class="space-y-5">
            <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                  <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </span>
                <span>订单详情</span>
              </h3>
              <div class="grid gap-4 md:grid-cols-3">
                <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p class="text-xs text-slate-500">产品名称</p>
                  <p class="mt-1 text-lg font-bold text-slate-900">{{ currentOrder?.productName }}</p>
                </div>
                <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p class="text-xs text-slate-500">方向</p>
                  <span :class="['text-xs px-2 py-0.5 rounded-md font-medium', deliveryOrderDirectionMeta[currentOrder?.direction]?.badgeClass]">
                    {{ deliveryOrderDirectionMeta[currentOrder?.direction]?.text }}
                  </span>
                </div>
                <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p class="text-xs text-slate-500">状态</p>
                  <span class="rounded-md px-2 py-0.5 text-xs font-medium" :class="deliveryOrderStatusMeta[currentOrder?.status]?.badgeClass">
                    {{ deliveryOrderStatusMeta[currentOrder?.status]?.text }}
                  </span>
                </div>
                <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p class="text-xs text-slate-500">入场价格</p>
                  <p class="mt-1 text-lg font-bold text-slate-900">${{ currentOrder?.entryPrice?.toLocaleString() }}</p>
                </div>
                <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p class="text-xs text-slate-500">行权价格</p>
                  <p class="mt-1 text-lg font-bold text-slate-900">${{ currentOrder?.strikePrice?.toLocaleString() }}</p>
                </div>
                <div v-if="currentOrder?.settlementPrice" class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p class="text-xs text-slate-500">结算价格</p>
                  <p class="mt-1 text-lg font-bold text-slate-900">${{ currentOrder?.settlementPrice?.toLocaleString() }}</p>
                </div>
              </div>
            </section>

            <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100">
                  <svg class="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </span>
                <span>收益明细</span>
              </h3>
              <div class="grid gap-4 md:grid-cols-4">
                <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p class="text-xs text-slate-500">投资金额</p>
                  <p class="mt-1 text-xl font-bold text-slate-900">${{ currentOrder?.investAmount?.toFixed(2) }}</p>
                </div>
                <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p class="text-xs text-slate-500">预期 payout</p>
                  <p class="mt-1 text-xl font-bold text-slate-900">${{ currentOrder?.expectedPayout?.toFixed(2) }}</p>
                  <p class="mt-1 text-xs text-slate-500">收益率 {{ currentOrder?.expectedYield }}%</p>
                </div>
                <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p class="text-xs text-slate-500">实际 payout</p>
                  <p class="mt-1 text-xl font-bold" :class="{
                    'text-emerald-600': currentOrder?.result === DELIVERY_ORDER_RESULT.WIN,
                    'text-rose-600': currentOrder?.result === DELIVERY_ORDER_RESULT.LOSS,
                    'text-slate-600': !currentOrder?.result
                  }">
                    {{ currentOrder?.result === DELIVERY_ORDER_RESULT.WIN ? '$' + currentOrder?.actualPayout?.toFixed(2) : (currentOrder?.result === DELIVERY_ORDER_RESULT.LOSS ? '亏损全部本金' : '$' + currentOrder?.actualPayout?.toFixed(2)) }}
                  </p>
                  <p class="mt-1 text-xs" :class="{
                    'text-emerald-600': currentOrder?.actualYield > 0,
                    'text-rose-600': currentOrder?.actualYield < 0,
                    'text-slate-500': currentOrder?.actualYield === 0
                  }">
                    实际收益率：{{ currentOrder?.actualYield?.toFixed(2) }}%
                  </p>
                </div>
                <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p class="text-xs text-slate-500">手续费</p>
                  <p class="mt-1 text-xl font-bold text-slate-900">${{ currentOrder?.fee?.toFixed(2) }}</p>
                </div>
              </div>
            </section>
          </div>

          <!-- Tab 3: 用户信息 -->
          <div v-if="currentTab === 'user'" class="space-y-5">
            <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </span>
                <span>用户信息</span>
              </h3>
              <div class="grid gap-4 md:grid-cols-3">
                <div class="space-y-1">
                  <label class="text-xs font-medium text-slate-500">用户 ID</label>
                  <p class="font-mono text-sm font-medium text-slate-900">{{ currentOrder?.userId }}</p>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-slate-500">用户名</label>
                  <p class="text-sm font-medium text-slate-900">{{ currentOrder?.userName }}</p>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-slate-500">VIP 等级</label>
                  <span :class="['text-xs px-2 py-0.5 rounded-md font-medium', vipLevelMeta[currentOrder?.vipLevel]?.class]">
                    {{ vipLevelMeta[currentOrder?.vipLevel]?.label }}
                  </span>
                </div>
              </div>
            </section>
          </div>

          <!-- Tab 4: 结算记录 -->
          <div v-if="currentTab === 'settlement'" class="space-y-4">
            <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </span>
                <span>结算记录</span>
              </h3>
              <div class="space-y-3">
                <div class="flex items-start gap-3 pb-3 border-b border-slate-200">
                  <div class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-slate-900">下单</p>
                    <p class="text-xs text-slate-500 mt-1">{{ currentOrder?.betTime }}</p>
                    <p class="text-xs text-slate-600 mt-1">
                      买入 {{ currentOrder?.productName }} {{ deliveryOrderDirectionMeta[currentOrder?.direction]?.text }} 期权，投资 ${{ currentOrder?.investAmount?.toFixed(2) }}
                    </p>
                  </div>
                </div>
                
                <div class="flex items-start gap-3 pb-3 border-b border-slate-200">
                  <div class="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-slate-900">到期</p>
                    <p class="text-xs text-slate-500 mt-1">{{ currentOrder?.expiryTime }}</p>
                    <p class="text-xs text-slate-600 mt-1">
                      周期 {{ currentOrder?.cycleSeconds }}秒，预期收益率 {{ currentOrder?.expectedYield }}%
                    </p>
                  </div>
                </div>
                
                <div v-if="currentOrder?.settleTime" class="flex items-start gap-3">
                  <div class="w-8 h-8 rounded-full" :class="{
                    'bg-emerald-100': currentOrder?.result === DELIVERY_ORDER_RESULT.WIN,
                    'bg-rose-100': currentOrder?.result === DELIVERY_ORDER_RESULT.LOSS
                  }">
                    <svg class="w-4 h-4" :class="{
                      'text-emerald-600': currentOrder?.result === DELIVERY_ORDER_RESULT.WIN,
                      'text-rose-600': currentOrder?.result === DELIVERY_ORDER_RESULT.LOSS
                    }" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-slate-900">结算</p>
                    <p class="text-xs text-slate-500 mt-1">{{ currentOrder?.settleTime }}</p>
                    <p class="text-xs text-slate-600 mt-1">
                      结果：{{ currentOrder?.result === DELIVERY_ORDER_RESULT.WIN ? '赢利' : '亏损' }}
                      {{ currentOrder?.result === DELIVERY_ORDER_RESULT.WIN ? `，收益 $${currentOrder?.actualPayout?.toFixed(2)}` : (currentOrder?.result === DELIVERY_ORDER_RESULT.LOSS ? '，损失全部本金' : '') }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <footer class="border-t border-slate-200 bg-slate-50 px-6 py-4">
          <div class="flex items-center justify-end">
            <button type="button" class="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50" @click="closeDetailModal">
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
import { createDeliveryOrdersMock, DELIVERY_ORDER_STATUS, DELIVERY_ORDER_RESULT, deliveryOrderStatusMeta, deliveryOrderResultMeta, deliveryOrderDirectionMeta } from '../../mock/deliveryOrder'

const orders = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const showAdvancedFilters = ref(false)
const showDetailModal = ref(false)
const currentOrder = ref(null)
const currentTab = ref('overview')

const filters = ref({
  status: '',
  product: '',
  result: '',
  userId: '',
  minInvest: null,
  maxInvest: null,
  minYield: null,
  maxYield: null,
  cycleType: '',
  dateRange: ''
})

const vipLevelMeta = {
  VIP0: { label: 'VIP0', class: 'bg-slate-100 text-slate-600' },
  VIP1: { label: 'VIP1', class: 'bg-blue-100 text-blue-700' },
  VIP2: { label: 'VIP2', class: 'bg-purple-100 text-purple-700' },
  VIP3: { label: 'VIP3', class: 'bg-amber-100 text-amber-700' }
}

const detailTabs = [
  { id: 'overview', label: '概览' },
  { id: 'details', label: '订单详情' },
  { id: 'user', label: '用户信息' },
  { id: 'settlement', label: '结算记录' }
]

onMounted(() => {
  orders.value = createDeliveryOrdersMock()
})

const filteredOrders = computed(() => {
  let result = [...orders.value]

  if (filters.value.status) {
    result = result.filter(o => o.status === filters.value.status)
  }
  if (filters.value.product) {
    result = result.filter(o => o.productName === filters.value.product)
  }
  if (filters.value.result) {
    result = result.filter(o => o.result === filters.value.result)
  }
  if (filters.value.userId) {
    result = result.filter(o => o.userId.includes(filters.value.userId))
  }
  if (filters.value.minInvest) {
    result = result.filter(o => o.investAmount >= filters.value.minInvest)
  }
  if (filters.value.maxInvest) {
    result = result.filter(o => o.investAmount <= filters.value.maxInvest)
  }
  if (filters.value.minYield) {
    result = result.filter(o => o.actualYield >= filters.value.minYield)
  }
  if (filters.value.maxYield) {
    result = result.filter(o => o.actualYield <= filters.value.maxYield)
  }
  if (filters.value.cycleType) {
    if (filters.value.cycleType === 'short') {
      result = result.filter(o => o.cycleSeconds <= 60)
    } else if (filters.value.cycleType === 'medium') {
      result = result.filter(o => o.cycleSeconds > 60 && o.cycleSeconds <= 180)
    } else if (filters.value.cycleType === 'long') {
      result = result.filter(o => o.cycleSeconds > 180)
    }
  }
  if (filters.value.dateRange) {
    const date = filters.value.dateRange
    result = result.filter(o => o.betTime.startsWith(date))
  }

  return result
})

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredOrders.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredOrders.value.length / pageSize.value))

const viewOrder = (order) => {
  currentOrder.value = order
  currentTab.value = 'overview'
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  currentOrder.value = null
}

const resetFilters = () => {
  filters.value = {
    status: '',
    product: '',
    result: '',
    userId: '',
    minInvest: null,
    maxInvest: null,
    minYield: null,
    maxYield: null,
    cycleType: '',
    dateRange: ''
  }
  showAdvancedFilters.value = false
}

const exportOrders = () => {
  alert('导出交割合约订单数据')
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}
</script>
