<script setup>
import { ref, computed, watch } from 'vue'
import { 
  DELIVERY_REPORT_TIME_RANGE, 
  DELIVERY_REPORT_TIME_RANGE_OPTIONS, 
  DELIVERY_RISK_LEVEL_CONFIG,
  DELIVERY_USER_TYPE_CONFIG,
  DELIVERY_CYCLE_TYPE_CONFIG,
  DELIVERY_CONTRACT_STATUS_CONFIG,
  DELIVERY_CONTROL_ACTION_CONFIG
} from '../../constants/deliveryReport'
import {
  deliveryMarketOverview,
  deliveryContractsData,
  deliveryExpiryDistribution,
  deliveryPnlDistribution,
  deliveryWhalesList,
  deliveryControlStats,
  deliveryControlEffectComparison,
  deliveryHistoryStats,
  deliveryPositionTrendData,
  deliveryPnlTrendData,
  deliveryVolumeTrendData
} from '../../mock/deliveryReport'

// 时间范围
const timeRange = ref(DELIVERY_REPORT_TIME_RANGE.TODAY)
const customDateRange = ref({ start: '', end: '' })

// 合约选择
const selectedContract = ref('ALL') // ALL 或具体合约symbol
const contractOptions = computed(() => [
  { value: 'ALL', label: '全部合约' },
  ...deliveryContractsData.map(c => ({ value: c.symbol, label: c.name }))
])

// 当前激活的标签
const activeTab = ref('overview') // overview, position, pnl, risk, control

// 市场概览数据
const overview = ref(deliveryMarketOverview)
const contracts = ref(deliveryContractsData)

// 根据选择的合约筛选数据
const filteredContracts = computed(() => {
  if (selectedContract.value === 'ALL') {
    return contracts.value
  }
  return contracts.value.filter(c => c.symbol === selectedContract.value)
})

// 筛选后的汇总数据
const filteredOverview = computed(() => {
  if (selectedContract.value === 'ALL') {
    return overview.value
  }
  
  const contract = contracts.value.find(c => c.symbol === selectedContract.value)
  if (!contract) return overview.value
  
  return {
    totalVolume24h: contract.volume24h,
    totalPosition: contract.position,
    totalUsers: overview.value.totalUsers,
    activeUsers24h: contract.activeUsers,
    platformPnl24h: contract.platformPnl24h,
    userPnl24h: contract.userPnl24h,
    longShortRatio: contract.longShortRatio,
    nearExpiryContracts: contract.daysToExpiry <= 3 ? 1 : 0,
    todaySettlements: contract.daysToExpiry === 0 ? 1 : 0,
    riskLevel: contract.riskLevel
  }
})

// 筛选后的大户列表
const filteredWhalesList = computed(() => {
  if (selectedContract.value === 'ALL') {
    return deliveryWhalesList
  }
  return deliveryWhalesList.filter(w => w.contracts.includes(selectedContract.value))
})

// 大户监控分页
const whalesCurrentPage = ref(1)
const whalesPageSize = ref(10)
const paginatedWhalesList = computed(() => {
  const start = (whalesCurrentPage.value - 1) * whalesPageSize.value
  const end = start + whalesPageSize.value
  return filteredWhalesList.value.slice(start, end)
})
const whalesTotalPages = computed(() => {
  return Math.ceil(filteredWhalesList.value.length / whalesPageSize.value)
})

// 格式化金额
const formatAmount = (value) => {
  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`
  } else if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toFixed(0)
}

// 格式化金额（带符号和货币）
const formatCurrency = (value) => {
  const sign = value >= 0 ? '+' : ''
  return `${sign}$${formatAmount(value)}`
}

// 标签配置
const tabs = [
  { id: 'overview', name: '市场概览', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'position', name: '持仓分析', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'pnl', name: '盈亏分析', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'risk', name: '风险监控', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  { id: 'control', name: '场控效果', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
]

// 刷新数据
const refreshData = () => {
  console.log('刷新数据', { timeRange: timeRange.value, contract: selectedContract.value })
}

// 监听合约切换，重置页码
watch(selectedContract, () => {
  whalesCurrentPage.value = 1
})

// 导出报表
const exportReport = () => {
  alert('导出报表功能待实现')
}
</script>

<template>
  <section class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">场控操作决策报表</h1>
        <p class="text-sm text-slate-500 mt-1">提供交割合约场控数据分析，辅助交割前后的调控决策</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="refreshData"
          class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          刷新
        </button>
        <button
          @click="exportReport"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          导出报表
        </button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <div class="flex items-center gap-6 flex-wrap">
        <!-- 合约选择 -->
        <div class="flex items-center gap-3">
          <span class="text-sm font-medium text-slate-700">合约：</span>
          <select
            v-model="selectedContract"
            class="px-4 py-2 text-sm font-medium border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
          >
            <option v-for="option in contractOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <!-- 时间范围 -->
        <div class="flex items-center gap-3">
          <span class="text-sm font-medium text-slate-700">时间：</span>
          <div class="flex items-center gap-2">
            <button
              v-for="option in DELIVERY_REPORT_TIME_RANGE_OPTIONS"
              :key="option.value"
              @click="timeRange = option.value"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                timeRange === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              ]"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
        
        <!-- 自定义日期范围 -->
        <div v-if="timeRange === DELIVERY_REPORT_TIME_RANGE.CUSTOM" class="flex items-center gap-2">
          <input
            v-model="customDateRange.start"
            type="date"
            class="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span class="text-slate-500">至</span>
          <input
            v-model="customDateRange.end"
            type="date"
            class="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>

    <!-- 标签导航 -->
    <div class="bg-white rounded-xl border border-slate-200">
      <div class="border-b border-slate-200">
        <div class="flex overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            ]"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon" />
            </svg>
            {{ tab.name }}
          </button>
        </div>
      </div>

      <!-- 标签内容 -->
      <div class="p-6">
        <!-- 市场概览 -->
        <div v-show="activeTab === 'overview'" class="space-y-6">
          <!-- 关键指标卡片 -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-slate-900">24h 交易量</h3>
                <svg class="h-7 w-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p class="text-2xl font-bold text-slate-900 mb-1">${{ formatAmount(filteredOverview.totalVolume24h) }}</p>
              <p class="text-xs text-slate-600">USDT</p>
            </div>

            <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-5">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-slate-900">平台盈亏</h3>
                <svg class="h-7 w-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="text-2xl font-bold text-emerald-600 mb-1">{{ formatCurrency(filteredOverview.platformPnl24h) }}</p>
              <p class="text-xs text-slate-600">24小时</p>
            </div>

            <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-5">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-slate-900">临近交割</h3>
                <svg class="h-7 w-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="text-2xl font-bold text-slate-900 mb-1">{{ filteredOverview.nearExpiryContracts }}</p>
              <p class="text-xs text-slate-600">3天内交割合约</p>
            </div>

            <div 
              :class="[
                'rounded-xl p-5 bg-gradient-to-br',
                DELIVERY_RISK_LEVEL_CONFIG[filteredOverview.riskLevel].color === 'emerald' 
                  ? 'from-emerald-50 to-teal-50 border border-emerald-200' 
                  : DELIVERY_RISK_LEVEL_CONFIG[filteredOverview.riskLevel].color === 'amber'
                  ? 'from-amber-50 to-yellow-50 border border-amber-200'
                  : DELIVERY_RISK_LEVEL_CONFIG[filteredOverview.riskLevel].color === 'orange'
                  ? 'from-orange-50 to-amber-50 border border-orange-200'
                  : 'from-rose-50 to-red-50 border border-rose-200'
              ]"
            >
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-slate-900">风险等级</h3>
                <svg 
                  :class="[
                    'h-7 w-7',
                    DELIVERY_RISK_LEVEL_CONFIG[filteredOverview.riskLevel].color === 'emerald'
                      ? 'text-emerald-600'
                      : DELIVERY_RISK_LEVEL_CONFIG[filteredOverview.riskLevel].color === 'amber'
                      ? 'text-amber-600'
                      : DELIVERY_RISK_LEVEL_CONFIG[filteredOverview.riskLevel].color === 'orange'
                      ? 'text-orange-600'
                      : 'text-rose-600'
                  ]"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <span
                :class="DELIVERY_RISK_LEVEL_CONFIG[filteredOverview.riskLevel].class"
                class="inline-flex items-center px-3 py-1 rounded-lg text-base font-bold border-2"
              >
                {{ DELIVERY_RISK_LEVEL_CONFIG[filteredOverview.riskLevel].text }}
              </span>
            </div>
          </div>

          <!-- 次要指标 -->
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div class="bg-white border border-slate-200 rounded-lg p-4">
              <p class="text-sm text-slate-600 mb-1">总持仓</p>
              <p class="text-xl font-bold text-slate-900">${{ formatAmount(filteredOverview.totalPosition) }}</p>
            </div>
            <div class="bg-white border border-slate-200 rounded-lg p-4">
              <p class="text-sm text-slate-600 mb-1">活跃用户</p>
              <p class="text-xl font-bold text-slate-900">{{ filteredOverview.activeUsers24h.toLocaleString() }}</p>
            </div>
            <div class="bg-white border border-slate-200 rounded-lg p-4">
              <p class="text-sm text-slate-600 mb-1">多空比</p>
              <p class="text-xl font-bold text-slate-900">{{ filteredOverview.longShortRatio.toFixed(2) }}</p>
            </div>
          </div>

          <!-- 各合约数据 -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-slate-900">交割合约数据</h3>
            </div>
            <div class="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div class="max-h-96 overflow-y-auto">
                <table class="w-full">
                  <thead class="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">合约</th>
                      <th class="px-6 py-3 text-center text-xs font-semibold text-slate-900 uppercase">交割时间</th>
                      <th class="px-6 py-3 text-center text-xs font-semibold text-slate-900 uppercase">状态</th>
                      <th class="px-6 py-3 text-right text-xs font-semibold text-slate-900 uppercase">持仓</th>
                      <th class="px-6 py-3 text-right text-xs font-semibold text-slate-900 uppercase">多空比</th>
                      <th class="px-6 py-3 text-right text-xs font-semibold text-slate-900 uppercase">平台盈亏</th>
                      <th class="px-6 py-3 text-center text-xs font-semibold text-slate-900 uppercase">风险</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200">
                    <tr v-for="contract in filteredContracts" :key="contract.symbol" class="hover:bg-slate-50">
                      <td class="px-6 py-4">
                        <div>
                          <p class="text-sm font-medium text-slate-900">{{ contract.name }}</p>
                          <span
                            :class="DELIVERY_CYCLE_TYPE_CONFIG[contract.cycleType].class"
                            class="inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-medium"
                          >
                            {{ DELIVERY_CYCLE_TYPE_CONFIG[contract.cycleType].text }}
                          </span>
                        </div>
                      </td>
                      <td class="px-6 py-4 text-center">
                        <p class="text-sm text-slate-900">{{ contract.expiryDate.split(' ')[0] }}</p>
                        <p class="text-xs text-slate-500">{{ contract.daysToExpiry }}天后</p>
                      </td>
                      <td class="px-6 py-4 text-center">
                        <span
                          :class="DELIVERY_CONTRACT_STATUS_CONFIG[contract.status].class"
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        >
                          {{ DELIVERY_CONTRACT_STATUS_CONFIG[contract.status].text }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-right">
                        <p class="text-sm font-medium text-slate-900">${{ formatAmount(contract.position) }}</p>
                        <p class="text-xs text-slate-500">
                          多: ${{ formatAmount(contract.longPosition) }} / 
                          空: ${{ formatAmount(contract.shortPosition) }}
                        </p>
                      </td>
                      <td class="px-6 py-4 text-right">
                        <p class="text-sm font-medium text-slate-900">{{ contract.longShortRatio.toFixed(2) }}</p>
                      </td>
                      <td class="px-6 py-4 text-right">
                        <p :class="contract.platformPnl24h >= 0 ? 'text-emerald-600' : 'text-rose-600'" class="text-sm font-medium">
                          {{ formatCurrency(contract.platformPnl24h) }}
                        </p>
                      </td>
                      <td class="px-6 py-4 text-center">
                        <span
                          :class="DELIVERY_RISK_LEVEL_CONFIG[contract.riskLevel].class"
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                        >
                          {{ DELIVERY_RISK_LEVEL_CONFIG[contract.riskLevel].text }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- 持仓分析 -->
        <div v-show="activeTab === 'position'" class="space-y-6">
          <div class="bg-white border border-slate-200 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-slate-900 mb-4">持仓分布（按到期时间）</h3>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-slate-900">到期时间</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-slate-900">多头人数</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-slate-900">空头人数</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-slate-900">多头持仓</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-slate-900">空头持仓</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-slate-900">净持仓</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                  <tr v-for="item in deliveryExpiryDistribution" :key="item.range" class="hover:bg-slate-50">
                    <td class="px-4 py-3 text-sm font-medium text-slate-900">{{ item.range }}</td>
                    <td class="px-4 py-3 text-right text-sm text-slate-700">{{ item.longCount }}</td>
                    <td class="px-4 py-3 text-right text-sm text-slate-700">{{ item.shortCount }}</td>
                    <td class="px-4 py-3 text-right text-sm text-emerald-600 font-medium">${{ formatAmount(item.longVolume) }}</td>
                    <td class="px-4 py-3 text-right text-sm text-rose-600 font-medium">${{ formatAmount(item.shortVolume) }}</td>
                    <td class="px-4 py-3 text-right text-sm font-medium" 
                        :class="(item.longVolume - item.shortVolume) >= 0 ? 'text-emerald-600' : 'text-rose-600'">
                      {{ formatCurrency(item.longVolume - item.shortVolume) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 盈亏分析 -->
        <div v-show="activeTab === 'pnl'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white border border-slate-200 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-slate-900 mb-4">用户盈亏分布</h3>
              <div class="space-y-3">
                <div v-for="item in deliveryPnlDistribution" :key="item.range" class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-sm text-slate-700">{{ item.range }}</span>
                      <span class="text-sm font-medium text-slate-900">{{ item.count }} 人 ({{ item.percentage.toFixed(1) }}%)</span>
                    </div>
                    <div class="w-full bg-slate-200 rounded-full h-2">
                      <div
                        :class="item.totalPnl >= 0 ? 'bg-emerald-500' : 'bg-rose-500'"
                        class="h-2 rounded-full transition-all"
                        :style="{ width: `${item.percentage * 2}%` }"
                      ></div>
                    </div>
                  </div>
                  <span
                    :class="item.totalPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'"
                    class="ml-4 text-sm font-medium min-w-[80px] text-right"
                  >
                    {{ formatCurrency(item.totalPnl) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-slate-900 mb-4">平台盈亏统计</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between p-4 bg-white rounded-lg">
                  <span class="text-sm text-slate-700">平台盈亏</span>
                  <span class="text-xl font-bold text-emerald-600">{{ formatCurrency(filteredOverview.platformPnl24h) }}</span>
                </div>
                <div class="flex items-center justify-between p-4 bg-white rounded-lg">
                  <span class="text-sm text-slate-700">用户盈亏</span>
                  <span class="text-xl font-bold text-rose-600">{{ formatCurrency(filteredOverview.userPnl24h) }}</span>
                </div>
                <div class="flex items-center justify-between p-4 bg-white rounded-lg">
                  <span class="text-sm text-slate-700">盈利用户占比</span>
                  <span class="text-xl font-bold text-slate-900">
                    {{ ((deliveryPnlDistribution.filter(d => d.range.includes('盈利')).reduce((sum, d) => sum + d.count, 0) / deliveryPnlDistribution.reduce((sum, d) => sum + d.count, 0)) * 100).toFixed(1) }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 风险监控 -->
        <div v-show="activeTab === 'risk'" class="space-y-6">
          <div class="bg-white border border-slate-200 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-slate-900 mb-4">大户监控</h3>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-slate-900">用户</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-slate-900">类型</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-slate-900">总持仓</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-slate-900">24h盈亏</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-slate-900">临期持仓</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-slate-900">合约</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-slate-900">风险</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                  <tr v-for="whale in paginatedWhalesList" :key="whale.userId" class="hover:bg-slate-50">
                    <td class="px-4 py-3">
                      <div>
                        <p class="text-sm font-medium text-slate-900">{{ whale.username }}</p>
                        <p class="text-xs text-slate-500">{{ whale.userId }}</p>
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <span
                        :class="DELIVERY_USER_TYPE_CONFIG[whale.type].class"
                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                      >
                        {{ DELIVERY_USER_TYPE_CONFIG[whale.type].icon }} {{ DELIVERY_USER_TYPE_CONFIG[whale.type].text }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <p class="text-sm font-medium text-slate-900">${{ formatAmount(whale.totalPosition) }}</p>
                      <p class="text-xs text-slate-500">
                        多: ${{ formatAmount(whale.longPosition) }} / 
                        空: ${{ formatAmount(whale.shortPosition) }}
                      </p>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <p :class="whale.pnl24h >= 0 ? 'text-emerald-600' : 'text-rose-600'" class="text-sm font-medium">
                        {{ formatCurrency(whale.pnl24h) }}
                      </p>
                      <p :class="whale.pnlRate >= 0 ? 'text-emerald-600' : 'text-rose-600'" class="text-xs">
                        {{ whale.pnlRate >= 0 ? '+' : '' }}{{ whale.pnlRate.toFixed(1) }}%
                      </p>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <span class="text-sm font-medium text-slate-900">${{ formatAmount(whale.nearExpiryPositions) }}</span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex flex-wrap gap-1">
                        <span
                          v-for="contract in whale.contracts.slice(0, 2)"
                          :key="contract"
                          class="text-xs text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded"
                        >
                          {{ contract }}
                        </span>
                        <span v-if="whale.contracts.length > 2" class="text-xs text-slate-500">
                          +{{ whale.contracts.length - 2 }}
                        </span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span
                        :class="DELIVERY_RISK_LEVEL_CONFIG[whale.riskLevel].class"
                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border"
                      >
                        {{ DELIVERY_RISK_LEVEL_CONFIG[whale.riskLevel].text }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="whalesTotalPages > 1" class="mt-4 flex items-center justify-center gap-2">
              <button
                @click="whalesCurrentPage = Math.max(1, whalesCurrentPage - 1)"
                :disabled="whalesCurrentPage === 1"
                class="px-3 py-1 text-sm border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                上一页
              </button>
              <span class="text-sm text-slate-600">
                第 {{ whalesCurrentPage }} / {{ whalesTotalPages }} 页
              </span>
              <button
                @click="whalesCurrentPage = Math.min(whalesTotalPages, whalesCurrentPage + 1)"
                :disabled="whalesCurrentPage === whalesTotalPages"
                class="px-3 py-1 text-sm border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                下一页
              </button>
            </div>
          </div>
        </div>

        <!-- 场控效果 -->
        <div v-show="activeTab === 'control'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-white border border-slate-200 rounded-lg p-4">
              <p class="text-sm text-slate-600 mb-1">24h操作次数</p>
              <p class="text-2xl font-bold text-slate-900">{{ deliveryControlStats.totalActions }}</p>
              <p class="text-xs text-slate-500 mt-1">成功: {{ deliveryControlStats.successActions }} / 失败: {{ deliveryControlStats.failedActions }}</p>
            </div>
            <div class="bg-white border border-slate-200 rounded-lg p-4">
              <p class="text-sm text-slate-600 mb-1">24h总影响</p>
              <p class="text-2xl font-bold text-emerald-600">{{ formatCurrency(deliveryControlStats.totalImpact) }}</p>
              <p class="text-xs text-slate-500 mt-1">平台盈亏改善</p>
            </div>
            <div class="bg-white border border-slate-200 rounded-lg p-4">
              <p class="text-sm text-slate-600 mb-1">控制类型</p>
              <p class="text-2xl font-bold text-slate-900">{{ deliveryControlStats.actionsByType.length }}</p>
              <p class="text-xs text-slate-500 mt-1">种操作类型</p>
            </div>
            <div class="bg-white border border-slate-200 rounded-lg p-4">
              <p class="text-sm text-slate-600 mb-1">成功率</p>
              <p class="text-2xl font-bold text-slate-900">{{ ((deliveryControlStats.successActions / deliveryControlStats.totalActions) * 100).toFixed(1) }}%</p>
              <p class="text-xs text-slate-500 mt-1">场控执行成功率</p>
            </div>
          </div>

          <div class="bg-white border border-slate-200 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-slate-900 mb-4">场控效果对比</h3>
            <div class="space-y-4">
              <div v-for="item in deliveryControlEffectComparison" :key="item.contract" class="p-4 border border-slate-200 rounded-lg">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="font-semibold text-slate-900">{{ item.contract }}</h4>
                  <span class="text-sm px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                    改善 {{ formatCurrency(item.improvement) }}
                  </span>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs text-slate-500 mb-2">场控前</p>
                    <div class="space-y-1 text-sm">
                      <div class="flex justify-between">
                        <span class="text-slate-600">平台盈亏:</span>
                        <span :class="item.beforeControl.platformPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'" class="font-medium">
                          {{ formatCurrency(item.beforeControl.platformPnl) }}
                        </span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-600">多空比:</span>
                        <span class="font-medium text-slate-900">{{ item.beforeControl.longShortRatio.toFixed(2) }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-600">风险等级:</span>
                        <span
                          :class="DELIVERY_RISK_LEVEL_CONFIG[item.beforeControl.riskLevel].class"
                          class="text-xs px-2 py-0.5 rounded"
                        >
                          {{ DELIVERY_RISK_LEVEL_CONFIG[item.beforeControl.riskLevel].text }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 mb-2">场控后</p>
                    <div class="space-y-1 text-sm">
                      <div class="flex justify-between">
                        <span class="text-slate-600">平台盈亏:</span>
                        <span :class="item.afterControl.platformPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'" class="font-medium">
                          {{ formatCurrency(item.afterControl.platformPnl) }}
                        </span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-600">多空比:</span>
                        <span class="font-medium text-slate-900">{{ item.afterControl.longShortRatio.toFixed(2) }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-600">风险等级:</span>
                        <span
                          :class="DELIVERY_RISK_LEVEL_CONFIG[item.afterControl.riskLevel].class"
                          class="text-xs px-2 py-0.5 rounded"
                        >
                          {{ DELIVERY_RISK_LEVEL_CONFIG[item.afterControl.riskLevel].text }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white border border-slate-200 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-slate-900 mb-4">操作类型统计</h3>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-slate-900">操作类型</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-slate-900">执行次数</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-slate-900">影响金额</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-slate-900">平均影响</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                  <tr v-for="item in deliveryControlStats.actionsByType" :key="item.action" class="hover:bg-slate-50">
                    <td class="px-4 py-3">
                      <span
                        :class="DELIVERY_CONTROL_ACTION_CONFIG[item.action].class"
                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                      >
                        {{ DELIVERY_CONTROL_ACTION_CONFIG[item.action].text }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right text-sm font-medium text-slate-900">{{ item.count }}</td>
                    <td class="px-4 py-3 text-right text-sm font-medium"
                        :class="item.impact >= 0 ? 'text-emerald-600' : 'text-rose-600'">
                      {{ formatCurrency(item.impact) }}
                    </td>
                    <td class="px-4 py-3 text-right text-sm text-slate-700">
                      {{ formatCurrency(item.impact / item.count) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
