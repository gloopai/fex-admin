<script setup>
import { ref, computed, watch } from 'vue'
import { 
  REPORT_TIME_RANGE, 
  REPORT_TIME_RANGE_OPTIONS, 
  RISK_LEVEL_CONFIG,
  USER_TYPE_CONFIG,
  RISK_ASSESSMENT_CRITERIA
} from '../../constants/perpetualReport'
import {
  marketOverviewData,
  contractsData,
  leverageDistribution,
  pnlDistribution,
  whalesList,
  positionTrendData,
  pnlTrendData,
  volumeTrendData,
  controlTriggerStats,
  riskAlerts,
  controlEffectComparison,
  actionSuggestions
} from '../../mock/perpetualReport'

// 时间范围
const timeRange = ref(REPORT_TIME_RANGE.TODAY)
const customDateRange = ref({ start: '', end: '' })

// 合约选择
const selectedContract = ref('ALL') // ALL 或具体合约symbol
const contractOptions = computed(() => [
  { value: 'ALL', label: '全部合约' },
  ...contractsData.map(c => ({ value: c.symbol, label: c.name }))
])

// 当前激活的标签
const activeTab = ref('overview') // overview, position, pnl, risk, control

// 市场概览数据
const overview = ref(marketOverviewData)
const contracts = ref(contractsData)

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
    totalUsers: overview.value.totalUsers, // 这个保持全局
    activeUsers24h: contract.activeUsers,
    platformPnl24h: contract.platformPnl24h,
    userPnl24h: contract.userPnl24h,
    longShortRatio: contract.longShortRatio,
    avgLeverage: contract.avgLeverage,
    riskLevel: contract.riskLevel
  }
})

// 筛选后的操作建议
const filteredActionSuggestions = computed(() => {
  if (selectedContract.value === 'ALL') {
    return actionSuggestions
  }
  return actionSuggestions.filter(s => s.contract === selectedContract.value)
})

// 筛选后的风险预警
const filteredRiskAlerts = computed(() => {
  if (selectedContract.value === 'ALL') {
    return riskAlerts
  }
  return riskAlerts.filter(a => a.contract === selectedContract.value)
})

// 筛选后的线控触发统计
const filteredControlTriggerStats = computed(() => {
  if (selectedContract.value === 'ALL') {
    return controlTriggerStats
  }
  return controlTriggerStats.filter(s => s.contractSymbol === selectedContract.value)
})

// 筛选后的大户列表
const filteredWhalesList = computed(() => {
  if (selectedContract.value === 'ALL') {
    return whalesList
  }
  return whalesList.filter(w => w.contracts.includes(selectedContract.value))
})

// 风险等级帮助模态框
const showRiskHelpModal = ref(false)
const selectedRiskLevel = ref('LOW') // LOW, MEDIUM, HIGH, CRITICAL

// 操作建议展开/收起
const showAllSuggestions = ref(false)
const displayedActionSuggestions = computed(() => {
  if (showAllSuggestions.value || filteredActionSuggestions.value.length <= 3) {
    return filteredActionSuggestions.value
  }
  return filteredActionSuggestions.value.slice(0, 3)
})

// 风险预警展开/收起
const showAllRiskAlerts = ref(false)
const displayedRiskAlerts = computed(() => {
  if (showAllRiskAlerts.value || filteredRiskAlerts.value.length <= 5) {
    return filteredRiskAlerts.value
  }
  return filteredRiskAlerts.value.slice(0, 5)
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
// 计算显示的页码（当页数较多时只显示部分）
const whalesPageNumbers = computed(() => {
  const total = whalesTotalPages.value
  const current = whalesCurrentPage.value
  const pages = []
  
  if (total <= 7) {
    // 页数少于7页，全部显示
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // 页数较多，显示首页、当前页前后2页、末页
    pages.push(1)
    
    if (current > 3) {
      pages.push('...')
    }
    
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i)
    }
    
    if (current < total - 2) {
      pages.push('...')
    }
    
    pages.push(total)
  }
  
  return pages
})
// 监听合约切换，重置页码
const resetWhalesPage = () => {
  whalesCurrentPage.value = 1
}

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

// 格式化百分比
const formatPercent = (value) => {
  return `${value.toFixed(2)}%`
}

// 标签配置
const tabs = [
  { id: 'overview', name: '市场概览', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'position', name: '持仓分析', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'pnl', name: '盈亏分析', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'risk', name: '风险监控', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  { id: 'control', name: '线控效果', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
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

// 打开风险评估帮助模态框
const openRiskHelpModal = () => {
  selectedRiskLevel.value = filteredOverview.value.riskLevel
  showRiskHelpModal.value = true
}
</script>

<template>
  <section class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">线控决策报表</h1>
        <p class="text-sm text-slate-500 mt-1">提供全面的市场数据分析，辅助线控调控决策</p>
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
            v-for="option in REPORT_TIME_RANGE_OPTIONS"
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
        <div v-if="timeRange === REPORT_TIME_RANGE.CUSTOM" class="flex items-center gap-2">
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
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-semibold text-slate-900">24h 交易量</h3>
                <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p class="text-3xl font-bold text-slate-900 mb-2">${{ formatAmount(filteredOverview.totalVolume24h) }}</p>
              <p class="text-sm text-slate-600">USDT</p>
            </div>

            <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-semibold text-slate-900">平台盈亏</h3>
                <svg class="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="text-3xl font-bold text-emerald-600 mb-2">{{ formatCurrency(filteredOverview.platformPnl24h) }}</p>
              <p class="text-sm text-slate-600">24小时</p>
            </div>

            <!-- 风险等级 - 已隐藏，让运营人员根据数据自行判断 -->
            <div 
              :class="[
                'rounded-xl p-6 bg-gradient-to-br',
                RISK_LEVEL_CONFIG[filteredOverview.riskLevel].color === 'emerald' 
                  ? 'from-emerald-50 to-teal-50 border border-emerald-200' 
                  : RISK_LEVEL_CONFIG[filteredOverview.riskLevel].color === 'amber'
                  ? 'from-amber-50 to-yellow-50 border border-amber-200'
                  : RISK_LEVEL_CONFIG[filteredOverview.riskLevel].color === 'orange'
                  ? 'from-orange-50 to-amber-50 border border-orange-200'
                  : 'from-rose-50 to-red-50 border border-rose-200'
              ]"
            >
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-semibold text-slate-900">风险等级</h3>
                  <button
                    @click="openRiskHelpModal"
                    :class="[
                      'p-1 rounded-full transition-colors',
                      RISK_LEVEL_CONFIG[filteredOverview.riskLevel].color === 'emerald'
                        ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100'
                        : RISK_LEVEL_CONFIG[filteredOverview.riskLevel].color === 'amber'
                        ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-100'
                        : RISK_LEVEL_CONFIG[filteredOverview.riskLevel].color === 'orange'
                        ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-100'
                        : 'text-rose-600 hover:text-rose-700 hover:bg-rose-100'
                    ]"
                    title="查看风险评估标准"
                  >
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
                <svg 
                  :class="[
                    'h-8 w-8',
                    RISK_LEVEL_CONFIG[filteredOverview.riskLevel].color === 'emerald'
                      ? 'text-emerald-600'
                      : RISK_LEVEL_CONFIG[filteredOverview.riskLevel].color === 'amber'
                      ? 'text-amber-600'
                      : RISK_LEVEL_CONFIG[filteredOverview.riskLevel].color === 'orange'
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
              <div class="flex items-center gap-3">
                <span
                  :class="RISK_LEVEL_CONFIG[filteredOverview.riskLevel].class"
                  class="inline-flex items-center px-4 py-2 rounded-lg text-lg font-bold border-2"
                >
                  {{ RISK_LEVEL_CONFIG[filteredOverview.riskLevel].text }}
                </span>
              </div>
            </div>
          </div>

          <!-- 次要指标 -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            <div class="bg-white border border-slate-200 rounded-lg p-4">
              <p class="text-sm text-slate-600 mb-1">平均杠杆</p>
              <p class="text-xl font-bold text-slate-900">{{ filteredOverview.avgLeverage.toFixed(1) }}x</p>
            </div>
          </div>

          <!-- 各合约数据 -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-slate-900">
                <span v-if="selectedContract === 'ALL'">各合约数据</span>
                <span v-else>合约详情</span>
              </h3>
              <span v-if="selectedContract !== 'ALL'" class="text-sm text-slate-500">
                当前仅显示 {{ contractOptions.find(c => c.value === selectedContract)?.label }} 的数据
              </span>
            </div>
            <div class="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div class="max-h-96 overflow-y-auto">
                <table class="w-full">
                <thead class="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">合约</th>
                    <th class="px-6 py-3 text-right text-xs font-semibold text-slate-900 uppercase">24h交易量</th>
                    <th class="px-6 py-3 text-right text-xs font-semibold text-slate-900 uppercase">持仓</th>
                    <th class="px-6 py-3 text-right text-xs font-semibold text-slate-900 uppercase">多空比</th>
                    <th class="px-6 py-3 text-right text-xs font-semibold text-slate-900 uppercase">平台盈亏</th>
                    <th class="px-6 py-3 text-right text-xs font-semibold text-slate-900 uppercase">活跃用户</th>
                    <th class="px-6 py-3 text-center text-xs font-semibold text-slate-900 uppercase">线控</th>
                    <!-- <th class="px-6 py-3 text-center text-xs font-semibold text-slate-900 uppercase">风险</th> -->
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                  <tr v-for="contract in filteredContracts" :key="contract.symbol" class="hover:bg-slate-50">
                    <td class="px-6 py-4">
                      <div>
                        <p class="text-sm font-medium text-slate-900">{{ contract.name }}</p>
                        <p class="text-xs text-slate-500">{{ contract.symbol }}</p>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <p class="text-sm font-medium text-slate-900">${{ formatAmount(contract.volume24h) }}</p>
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
                    <td class="px-6 py-4 text-right">
                      <p class="text-sm font-medium text-slate-900">{{ contract.activeUsers }}</p>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <span
                        :class="contract.controlActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      >
                        {{ contract.controlActive ? '开启' : '关闭' }}
                      </span>
                    </td>
                    <!-- 风险等级已隐藏 -->
                    <!-- <td class="px-6 py-4 text-center">
                      <span
                        :class="RISK_LEVEL_CONFIG[contract.riskLevel].class"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                      >
                        {{ RISK_LEVEL_CONFIG[contract.riskLevel].text }}
                      </span>
                    </td> -->
                  </tr>
                </tbody>
              </table>
              </div>
            </div>
            <div v-if="selectedContract === 'ALL' && filteredContracts.length > 5" class="mt-2 text-center">
              <p class="text-xs text-slate-500">💡 表格内容较多，可向下滚动查看更多合约数据</p>
            </div>
          </div>

          <!-- 操作建议 - 已隐藏，让运营人员根据数据自行决策 -->
          <div v-if="false">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-slate-900">
                <span v-if="selectedContract === 'ALL'">操作建议（全部合约）</span>
                <span v-else>操作建议（{{ contractOptions.find(c => c.value === selectedContract)?.label }}）</span>
              </h3>
              <div class="flex items-center gap-3">
                <span v-if="filteredActionSuggestions.length > 0" class="text-sm text-slate-500">
                  显示 {{ displayedActionSuggestions.length }} / {{ filteredActionSuggestions.length }} 条
                </span>
                <button
                  v-if="filteredActionSuggestions.length > 3"
                  @click="showAllSuggestions = !showAllSuggestions"
                  class="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  {{ showAllSuggestions ? '收起' : '显示全部' }}
                  <svg class="h-4 w-4" :class="{ 'rotate-180': showAllSuggestions }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
            <div v-if="filteredActionSuggestions.length === 0" class="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
              <svg class="h-12 w-12 text-slate-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-slate-600">该合约暂无操作建议</p>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="suggestion in displayedActionSuggestions"
                :key="suggestion.title"
                :class="[
                  'border-l-4 rounded-lg p-4',
                  suggestion.priority === 'critical' ? 'bg-rose-100 border-rose-600' :
                  suggestion.priority === 'high' ? 'bg-rose-50 border-rose-500' :
                  suggestion.priority === 'medium' ? 'bg-amber-50 border-amber-500' :
                  'bg-blue-50 border-blue-500'
                ]"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <span
                        :class="[
                          'px-2 py-0.5 rounded text-xs font-medium',
                          suggestion.priority === 'critical' ? 'bg-rose-200 text-rose-900 font-bold' :
                          suggestion.priority === 'high' ? 'bg-rose-100 text-rose-700' :
                          suggestion.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        ]"
                      >
                        {{ suggestion.priority === 'critical' ? '🚨 紧急' :
                           suggestion.priority === 'high' ? '高优先级' : 
                           suggestion.priority === 'medium' ? '中优先级' : '低优先级' }}
                      </span>
                      <span v-if="selectedContract === 'ALL'" class="text-xs text-slate-600">{{ suggestion.contract }}</span>
                    </div>
                    <h4 class="text-sm font-semibold text-slate-900 mb-2">{{ suggestion.title }}</h4>
                    <p class="text-sm text-slate-700 mb-2">{{ suggestion.reason }}</p>
                    <p class="text-xs text-emerald-700 font-medium mb-2">预期效果: {{ suggestion.expectedEffect }}</p>
                    <div class="flex items-start gap-1.5 text-xs text-slate-600 bg-white/70 rounded px-2 py-1.5">
                      <svg class="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span><span class="font-medium text-slate-700">影响参数:</span> {{ suggestion.affects }}</span>
                    </div>
                  </div>
                  <button 
                    :class="[
                      'ml-4 px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-colors whitespace-nowrap',
                      suggestion.priority === 'critical' ? 'bg-rose-600 hover:bg-rose-700' :
                      suggestion.priority === 'high' ? 'bg-orange-600 hover:bg-orange-700' :
                      'bg-blue-600 hover:bg-blue-700'
                    ]"
                  >
                    执行操作
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 持仓分析 -->
        <div v-show="activeTab === 'position'" class="space-y-6">
          <div class="bg-white border border-slate-200 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-slate-900 mb-4">持仓分布（按杠杆倍数）</h3>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-slate-900">杠杆区间</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-slate-900">多头人数</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-slate-900">空头人数</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-slate-900">多头持仓</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-slate-900">空头持仓</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-slate-900">净持仓</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                  <tr v-for="item in leverageDistribution" :key="item.leverage" class="hover:bg-slate-50">
                    <td class="px-4 py-3 text-sm font-medium text-slate-900">{{ item.leverage }}</td>
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

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <svg class="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <div class="text-sm text-blue-800">
                <p class="font-semibold mb-1">持仓分析要点：</p>
                <ul class="list-disc list-inside space-y-1">
                  <li>高杠杆区间（50x+）净持仓偏多，建议重点监控</li>
                  <li>10-20x区间持仓量最大，占总持仓的 37.8%</li>
                  <li>低杠杆区间（1-10x）相对平衡，风险较低</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 盈亏分析 -->
        <div v-show="activeTab === 'pnl'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white border border-slate-200 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-slate-900 mb-4">用户盈亏分布</h3>
              <div class="space-y-3">
                <div v-for="item in pnlDistribution" :key="item.range" class="flex items-center justify-between">
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
                  <span class="text-xl font-bold text-slate-900">26.4%</span>
                </div>
                <div class="flex items-center justify-between p-4 bg-white rounded-lg">
                  <span class="text-sm text-slate-700">亏损用户占比</span>
                  <span class="text-xl font-bold text-slate-900">32.4%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 风险监控 -->
        <div v-show="activeTab === 'risk'" class="space-y-6">
          <!-- 风险预警 - 已隐藏 -->
          <div v-if="false">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-slate-900">
                <span v-if="selectedContract === 'ALL'">风险预警（全部合约）</span>
                <span v-else>风险预警（{{ contractOptions.find(c => c.value === selectedContract)?.label }}）</span>
              </h3>
              <div class="flex items-center gap-3">
                <span v-if="filteredRiskAlerts.length > 0" class="text-sm text-slate-500">
                  共 {{ filteredRiskAlerts.length }} 条预警
                </span>
                <button
                  v-if="filteredRiskAlerts.length > 5"
                  @click="showAllRiskAlerts = !showAllRiskAlerts"
                  class="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <span>{{ showAllRiskAlerts ? '收起' : '展开全部' }}</span>
                  <svg
                    class="h-4 w-4 transition-transform duration-200"
                    :class="{ 'rotate-180': showAllRiskAlerts }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                  <span v-if="!showAllRiskAlerts" class="text-slate-500">(显示 5 / {{ filteredRiskAlerts.length }})</span>
                </button>
              </div>
            </div>
            <div v-if="filteredRiskAlerts.length === 0" class="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
              <svg class="h-12 w-12 text-emerald-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-slate-600">该合约暂无风险预警</p>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="alert in displayedRiskAlerts"
                :key="alert.id"
                :class="[
                  'border-l-4 rounded-lg p-4',
                  RISK_LEVEL_CONFIG[alert.level].color === 'rose' ? 'bg-rose-50 border-rose-500' :
                  RISK_LEVEL_CONFIG[alert.level].color === 'orange' ? 'bg-orange-50 border-orange-500' :
                  RISK_LEVEL_CONFIG[alert.level].color === 'amber' ? 'bg-amber-50 border-amber-500' :
                  'bg-emerald-50 border-emerald-500'
                ]"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-xs text-slate-600">{{ alert.type }}</span>
                      <span v-if="selectedContract === 'ALL'" class="text-xs text-slate-500">{{ alert.contract }}</span>
                      <span class="text-xs text-slate-400">{{ alert.time }}</span>
                    </div>
                    <p class="text-sm text-slate-900 font-medium mb-2">{{ alert.message }}</p>
                    <p class="text-xs text-slate-600">💡 建议: {{ alert.suggestion }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 大户监控 -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-slate-900">
                <span v-if="selectedContract === 'ALL'">大户监控（全部合约）</span>
                <span v-else>大户监控（{{ contractOptions.find(c => c.value === selectedContract)?.label }}）</span>
              </h3>
              <span v-if="filteredWhalesList.length > 0" class="text-sm text-slate-500">
                共 {{ filteredWhalesList.length }} 个大户
              </span>
            </div>
            <div v-if="filteredWhalesList.length === 0" class="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
              <svg class="h-12 w-12 text-slate-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p class="text-slate-600">该合约暂无大户交易</p>
            </div>
            <div v-else class="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <table class="w-full">
                <thead class="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">用户</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">类型</th>
                    <th v-if="selectedContract === 'ALL'" class="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">交易合约</th>
                    <th class="px-6 py-3 text-right text-xs font-semibold text-slate-900 uppercase">总持仓</th>
                    <th class="px-6 py-3 text-right text-xs font-semibold text-slate-900 uppercase">多头/空头</th>
                    <th class="px-6 py-3 text-right text-xs font-semibold text-slate-900 uppercase">杠杆</th>
                    <th class="px-6 py-3 text-right text-xs font-semibold text-slate-900 uppercase">24h盈亏</th>
                    <!-- <th class="px-6 py-3 text-center text-xs font-semibold text-slate-900 uppercase">风险</th> -->
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                <tr v-for="whale in paginatedWhalesList" :key="whale.userId" class="hover:bg-slate-50">
                    <td class="px-6 py-4">
                      <p class="text-sm font-medium text-slate-900">{{ whale.username }}</p>
                      <p class="text-xs text-slate-500">{{ whale.userId }}</p>
                    </td>
                    <td class="px-6 py-4">
                      <span :class="USER_TYPE_CONFIG[whale.type].class" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {{ USER_TYPE_CONFIG[whale.type].icon }} {{ USER_TYPE_CONFIG[whale.type].text }}
                      </span>
                    </td>
                    <td v-if="selectedContract === 'ALL'" class="px-6 py-4">
                      <div class="flex flex-wrap gap-1">
                        <span 
                          v-for="contract in whale.contracts" 
                          :key="contract"
                          class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700"
                        >
                          {{ contract }}
                        </span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <p class="text-sm font-medium text-slate-900">${{ formatAmount(whale.totalPosition) }}</p>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <p class="text-xs text-emerald-600">${{ formatAmount(whale.longPosition) }}</p>
                      <p class="text-xs text-rose-600">${{ formatAmount(whale.shortPosition) }}</p>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <p class="text-sm font-medium text-slate-900">{{ whale.leverage }}x</p>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <p :class="whale.pnl24h >= 0 ? 'text-emerald-600' : 'text-rose-600'" class="text-sm font-medium">
                        {{ formatCurrency(whale.pnl24h) }}
                      </p>
                      <p :class="whale.pnlRate >= 0 ? 'text-emerald-600' : 'text-rose-600'" class="text-xs">
                        ({{ whale.pnlRate >= 0 ? '+' : '' }}{{ whale.pnlRate.toFixed(2) }}%)
                      </p>
                    </td>
                    <!-- 风险等级已隐藏 -->
                    <!-- <td class="px-6 py-4 text-center">
                      <span :class="RISK_LEVEL_CONFIG[whale.riskLevel].class" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border">
                        {{ RISK_LEVEL_CONFIG[whale.riskLevel].text }}
                      </span>
                    </td> -->
                  </tr>
                </tbody>
              </table>
              
              <!-- 分页控件 -->
              <div v-if="whalesTotalPages > 1" class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <div class="text-sm text-slate-600">
                  共 {{ filteredWhalesList.length }} 个大户，第 {{ whalesCurrentPage }} / {{ whalesTotalPages }} 页
                </div>
                <div class="flex items-center gap-2">
                  <button
                    @click="whalesCurrentPage = Math.max(1, whalesCurrentPage - 1)"
                    :disabled="whalesCurrentPage === 1"
                    :class="[
                      'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                      whalesCurrentPage === 1
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                    ]"
                  >
                    上一页
                  </button>
                  <div class="flex items-center gap-1">
                    <template v-for="(page, index) in whalesPageNumbers" :key="index">
                      <button
                        v-if="page !== '...'"
                        @click="whalesCurrentPage = page"
                        :class="[
                          'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                          whalesCurrentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                        ]"
                      >
                        {{ page }}
                      </button>
                      <span v-else class="px-2 text-slate-400">...</span>
                    </template>
                  </div>
                  <button
                    @click="whalesCurrentPage = Math.min(whalesTotalPages, whalesCurrentPage + 1)"
                    :disabled="whalesCurrentPage === whalesTotalPages"
                    :class="[
                      'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                      whalesCurrentPage === whalesTotalPages
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                    ]"
                  >
                    下一页
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 线控效果 -->
        <div v-show="activeTab === 'control'" class="space-y-6">
          <!-- 线控效果对比 -->
          <div>
            <h3 class="text-lg font-semibold text-slate-900 mb-4">线控效果对比</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-slate-50 border border-slate-200 rounded-lg p-6">
                <h4 class="text-sm font-semibold text-slate-900 mb-4">{{ controlEffectComparison.beforeControl.period }}</h4>
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-slate-600">平台盈亏</span>
                    <span class="text-lg font-bold text-slate-900">{{ formatCurrency(controlEffectComparison.beforeControl.platformPnl) }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-slate-600">平均多空比</span>
                    <span class="text-lg font-bold text-slate-900">{{ controlEffectComparison.beforeControl.avgLongShortRatio.toFixed(2) }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-slate-600">最大回撤</span>
                    <span class="text-lg font-bold text-rose-600">{{ formatCurrency(controlEffectComparison.beforeControl.maxDrawdown) }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-slate-600">波动率</span>
                    <span class="text-lg font-bold text-slate-900">{{ formatPercent(controlEffectComparison.beforeControl.volatility * 100) }}</span>
                  </div>
                </div>
              </div>

              <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                <h4 class="text-sm font-semibold text-slate-900 mb-4">{{ controlEffectComparison.afterControl.period }}</h4>
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-slate-600">平台盈亏</span>
                    <div class="text-right">
                      <span class="text-lg font-bold text-emerald-600">{{ formatCurrency(controlEffectComparison.afterControl.platformPnl) }}</span>
                      <span class="ml-2 text-xs text-emerald-600">↑ {{ formatPercent(controlEffectComparison.improvement.pnlIncrease) }}</span>
                    </div>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-slate-600">平均多空比</span>
                    <div class="text-right">
                      <span class="text-lg font-bold text-slate-900">{{ controlEffectComparison.afterControl.avgLongShortRatio.toFixed(2) }}</span>
                      <span class="ml-2 text-xs text-emerald-600">↓ {{ formatPercent(controlEffectComparison.improvement.ratioImprove) }}</span>
                    </div>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-slate-600">最大回撤</span>
                    <div class="text-right">
                      <span class="text-lg font-bold text-emerald-600">{{ formatCurrency(controlEffectComparison.afterControl.maxDrawdown) }}</span>
                      <span class="ml-2 text-xs text-emerald-600">↓ {{ formatPercent(controlEffectComparison.improvement.drawdownReduce) }}</span>
                    </div>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-slate-600">波动率</span>
                    <div class="text-right">
                      <span class="text-lg font-bold text-slate-900">{{ formatPercent(controlEffectComparison.afterControl.volatility * 100) }}</span>
                      <span class="ml-2 text-xs text-emerald-600">↓ {{ formatPercent(controlEffectComparison.improvement.volatilityReduce) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 线控触发统计 -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-slate-900">
                <span v-if="selectedContract === 'ALL'">线控触发统计（全部合约）</span>
                <span v-else>线控触发统计（{{ contractOptions.find(c => c.value === selectedContract)?.label }}）</span>
              </h3>
              <span v-if="filteredControlTriggerStats.length > 0" class="text-sm text-slate-500">
                共 {{ filteredControlTriggerStats.length }} 条记录
              </span>
            </div>
            <div v-if="filteredControlTriggerStats.length === 0" class="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
              <svg class="h-12 w-12 text-slate-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p class="text-slate-600">该合约暂无线控触发记录</p>
            </div>
            <div v-else class="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div class="max-h-96 overflow-y-auto">
                <table class="w-full">
                  <thead class="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th v-if="selectedContract === 'ALL'" class="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">合约</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">规则名称</th>
                      <th class="px-6 py-3 text-right text-xs font-semibold text-slate-900 uppercase">触发次数</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">最后触发</th>
                      <th class="px-6 py-3 text-right text-xs font-semibold text-slate-900 uppercase">平均时长</th>
                      <th class="px-6 py-3 text-center text-xs font-semibold text-slate-900 uppercase">效果评价</th>
                      <th class="px-6 py-3 text-right text-xs font-semibold text-slate-900 uppercase">盈亏改善</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200">
                  <tr v-for="stat in filteredControlTriggerStats" :key="stat.contractSymbol + stat.ruleName" class="hover:bg-slate-50">
                    <td v-if="selectedContract === 'ALL'" class="px-6 py-4">
                      <p class="text-sm font-medium text-slate-900">{{ stat.contractName }}</p>
                    </td>
                    <td class="px-6 py-4">
                      <p class="text-sm text-slate-900">{{ stat.ruleName }}</p>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <p class="text-sm font-medium text-slate-900">{{ stat.triggerCount }}</p>
                    </td>
                    <td class="px-6 py-4">
                      <p class="text-sm text-slate-700">{{ stat.lastTriggerTime }}</p>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <p class="text-sm text-slate-700">{{ Math.floor(stat.avgDuration / 60) }}m {{ stat.avgDuration % 60 }}s</p>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <span
                        :class="stat.effectRating === 'good' ? 'bg-emerald-100 text-emerald-700' : stat.effectRating === 'normal' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      >
                        {{ stat.effectRating === 'good' ? '效果好' : stat.effectRating === 'normal' ? '一般' : '较差' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <p class="text-sm font-medium text-emerald-600">{{ formatCurrency(stat.pnlImprovement) }}</p>
                    </td>
                  </tr>
                </tbody>
              </table>
              </div>
              <div v-if="filteredControlTriggerStats.length > 5" class="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 text-center">
                💡 表格内容较多，可向下滚动查看更多线控触发记录
              </div>
            </div>
          </div>

          <!-- 线控效果总结 - 已隐藏 -->
          <div v-if="false" class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <svg class="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <div class="text-sm text-emerald-800">
                <p class="font-semibold mb-1">线控效果总结：</p>
                <ul class="list-disc list-inside space-y-1">
                  <li>平台盈亏提升 58.6%，效果显著</li>
                  <li>多空比从 1.58 优化到 1.32，持仓更加平衡</li>
                  <li>最大回撤减少 37.8%，风险控制有效</li>
                  <li>建议继续保持现有线控策略并优化触发条件</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 风险评估标准帮助模态框 -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showRiskHelpModal"
        class="fixed inset-0 bg-slate-900 bg-opacity-50 z-50 flex items-center justify-center p-4"
        @click.self="showRiskHelpModal = false"
      >
        <div class="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          <!-- 模态框头部 -->
          <div class="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
            <div class="flex items-center gap-3">
              <svg class="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 class="text-lg font-semibold text-slate-900">风险评估标准</h3>
            </div>
            <button
              @click="showRiskHelpModal = false"
              class="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- 模态框内容 -->
          <div class="flex flex-col h-[calc(90vh-5rem)]">
            <!-- 说明 -->
            <div class="px-6 pt-4 pb-3 border-b border-slate-200">
              <div class="flex items-start gap-2">
                <svg class="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                <div class="text-sm text-slate-600">
                  <p class="font-semibold mb-1 text-slate-900">风险评估说明</p>
                  <p>系统根据多空比、平台盈亏、持仓集中度、用户盈利分布、高杠杆使用情况等多维度指标，综合评估市场风险等级。</p>
                </div>
              </div>
            </div>

            <!-- Tab 切换 -->
            <div class="px-6 pt-3">
              <div class="flex gap-2 border-b border-slate-200">
                <button
                  v-for="(criteria, level) in RISK_ASSESSMENT_CRITERIA"
                  :key="level"
                  @click="selectedRiskLevel = level"
                  :class="[
                    'px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 -mb-px',
                    selectedRiskLevel === level
                      ? RISK_LEVEL_CONFIG[level].color === 'emerald' ? 'border-emerald-500 text-emerald-700' :
                        RISK_LEVEL_CONFIG[level].color === 'amber' ? 'border-amber-500 text-amber-700' :
                        RISK_LEVEL_CONFIG[level].color === 'orange' ? 'border-orange-500 text-orange-700' :
                        'border-rose-500 text-rose-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  ]"
                >
                  <span :class="selectedRiskLevel === level ? 'font-bold' : ''">{{ criteria.level }}</span>
                </button>
              </div>
            </div>

            <!-- Tab 内容 -->
            <div class="flex-1 overflow-y-auto px-6 py-4">
              <div
                v-for="(criteria, level) in RISK_ASSESSMENT_CRITERIA"
                v-show="selectedRiskLevel === level"
                :key="level"
                :class="[
                  'border-l-4 pl-4 py-2',
                  RISK_LEVEL_CONFIG[level].color === 'emerald' ? 'border-emerald-500' :
                  RISK_LEVEL_CONFIG[level].color === 'amber' ? 'border-amber-500' :
                  RISK_LEVEL_CONFIG[level].color === 'orange' ? 'border-orange-500' :
                  'border-rose-500'
                ]"
              >
                <!-- 等级标题 -->
                <div class="flex items-center gap-3 mb-4">
                  <span
                    :class="RISK_LEVEL_CONFIG[level].class"
                    class="inline-flex items-center px-3 py-1.5 rounded text-base font-bold border"
                  >
                    {{ criteria.level }}
                  </span>
                  <p class="text-sm text-slate-600">{{ criteria.description }}</p>
                </div>

                <!-- 判定标准 -->
                <div class="mb-4">
                  <h4 class="text-sm font-semibold text-slate-900 mb-2">判定标准</h4>
                  <div class="space-y-2">
                    <div
                      v-for="(criterion, index) in criteria.criteria"
                      :key="index"
                      class="flex items-start gap-3 py-2 border-b border-slate-200 last:border-b-0"
                    >
                      <div class="flex-shrink-0 w-28">
                        <span class="text-xs font-medium text-slate-600">{{ criterion.label }}</span>
                      </div>
                      <div class="flex-1">
                        <span class="text-sm font-semibold text-slate-900">{{ criterion.range }}</span>
                        <p class="text-xs text-slate-500 mt-0.5">{{ criterion.desc }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 建议操作 -->
                <div>
                  <h4 class="text-sm font-semibold text-slate-900 mb-2">建议操作</h4>
                  <ul class="space-y-1.5">
                    <li
                      v-for="(action, index) in criteria.actions"
                      :key="index"
                      class="flex items-start gap-2 text-sm text-slate-700"
                    >
                      <span class="text-slate-400 mt-0.5">•</span>
                      <span>{{ action }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- 底部提示 -->
            <div class="px-6 py-3 border-t border-slate-200">
              <p class="text-xs text-slate-500">
                <strong class="text-slate-700">注意：</strong>风险评估是基于多个指标的综合判断，实际操作时还需要结合市场环境、用户行为等因素进行综合分析。
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </section>
</template>
