<script setup>
import { ref, onMounted } from 'vue'
import { mockReferralStats, referralApi } from '../../mock/referral'
import { STATS_PERIOD_OPTIONS } from '../../constants/referral'

// 统计周期
const selectedPeriod = ref('month')

// 统计数据
const stats = ref(mockReferralStats)

// 加载统计数据
const loadStats = async () => {
  try {
    const result = await referralApi.getReferralStats(selectedPeriod.value)
    if (result.success) {
      stats.value = result.data
    }
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

// 周期改变时重新加载
const changePeriod = (period) => {
  selectedPeriod.value = period
  loadStats()
}

// 格式化大数字
const formatLargeNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(2) + '万'
  }
  return num.toLocaleString()
}

// 页面加载时获取数据
onMounted(() => {
  loadStats()
})
</script>

<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">分销统计</h1>
      <p class="mt-1 text-sm text-gray-500">查看分销数据和业绩分析</p>
    </div>

    <!-- 周期选择 -->
    <div class="bg-white rounded-lg shadow p-4">
      <div class="flex space-x-2">
        <button
          v-for="period in STATS_PERIOD_OPTIONS"
          :key="period.value"
          @click="changePeriod(period.value)"
          :class="selectedPeriod === period.value 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          class="px-4 py-2 rounded-lg transition-colors"
        >
          {{ period.label }}
        </button>
      </div>
    </div>

    <!-- 总览统计 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <p class="text-sm opacity-90">总佣金</p>
        <p class="mt-2 text-3xl font-bold">${{ stats[selectedPeriod]?.totalCommission.toLocaleString() || 0 }}</p>
        <p class="mt-2 text-xs opacity-80">累计发放佣金</p>
      </div>
      
      <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <p class="text-sm opacity-90">总订单数</p>
        <p class="mt-2 text-3xl font-bold">{{ formatLargeNumber(stats[selectedPeriod]?.totalOrders || 0) }}</p>
        <p class="mt-2 text-xs opacity-80">分佣订单总数</p>
      </div>
      
      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
        <p class="text-sm opacity-90">已完成</p>
        <p class="mt-2 text-3xl font-bold">{{ formatLargeNumber(stats[selectedPeriod]?.completedOrders || 0) }}</p>
        <p class="mt-2 text-xs opacity-80">完成率 {{ ((stats[selectedPeriod]?.completedOrders / stats[selectedPeriod]?.totalOrders * 100) || 0).toFixed(1) }}%</p>
      </div>
      
      <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
        <p class="text-sm opacity-90">平均佣金</p>
        <p class="mt-2 text-3xl font-bold">${{ stats[selectedPeriod]?.avgCommission.toFixed(2) || 0 }}</p>
        <p class="mt-2 text-xs opacity-80">单笔平均金额</p>
      </div>
    </div>

    <!-- 按类型统计 -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">按类型统计</h3>
      <div class="space-y-4">
        <div v-for="item in stats.byType" :key="item.type" class="border-b pb-4 last:border-b-0">
          <div class="flex justify-between items-center mb-2">
            <div class="flex items-center space-x-3">
              <div class="w-3 h-3 rounded-full" 
                :class="{
                  'bg-blue-500': item.type === 'deposit',
                  'bg-purple-500': item.type === 'periodic',
                  'bg-green-500': item.type === 'lending',
                  'bg-yellow-500': item.type === 'ai_quant'
                }"
              ></div>
              <span class="font-medium text-gray-900">
                {{ 
                  item.type === 'deposit' ? '充值分销' :
                  item.type === 'periodic' ? '周期产品' :
                  item.type === 'lending' ? '理财产品' :
                  'AI量化'
                }}
              </span>
            </div>
            <div class="text-right">
              <div class="text-lg font-bold text-gray-900">${{ item.commission.toLocaleString() }}</div>
              <div class="text-xs text-gray-500">{{ item.count }} 笔订单</div>
            </div>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="h-2 rounded-full"
              :class="{
                'bg-blue-500': item.type === 'deposit',
                'bg-purple-500': item.type === 'periodic',
                'bg-green-500': item.type === 'lending',
                'bg-yellow-500': item.type === 'ai_quant'
              }"
              :style="{ width: item.rate + '%' }"
            ></div>
          </div>
          <div class="mt-1 text-xs text-gray-500 text-right">占比 {{ item.rate.toFixed(1) }}%</div>
        </div>
      </div>
    </div>

    <!-- 按层级统计 -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">按层级统计</h3>
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div v-for="item in stats.byLevel" :key="item.level" class="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
          <div class="text-2xl font-bold text-purple-600">{{ item.level }}级</div>
          <div class="mt-2 text-sm text-gray-600">{{ formatLargeNumber(item.count) }} 笔</div>
          <div class="mt-1 text-lg font-semibold text-gray-900">${{ item.commission.toLocaleString() }}</div>
          <div class="mt-1 text-xs text-gray-500">{{ item.rate.toFixed(1) }}%</div>
        </div>
      </div>
    </div>

    <!-- Top代理排行 -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b bg-gray-50">
        <h3 class="text-lg font-semibold text-gray-900">Top 代理排行</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">排名</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户名</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">佣金总额</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">订单数</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(agent, index) in stats.topAgents" :key="agent.uid" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center justify-center w-8 h-8 rounded-full"
                  :class="{
                    'bg-yellow-100 text-yellow-700 font-bold': index === 0,
                    'bg-gray-200 text-gray-600 font-bold': index === 1,
                    'bg-orange-100 text-orange-600 font-bold': index === 2,
                    'bg-gray-100 text-gray-500': index > 2
                  }"
                >
                  {{ index + 1 }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ agent.uid }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ agent.username }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                ${{ agent.commission.toLocaleString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ agent.orders }} 笔
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 趋势图占位 -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">分佣趋势</h3>
      <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div class="text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          <p class="mt-2 text-sm text-gray-500">图表组件待集成</p>
          <p class="text-xs text-gray-400">可使用 Chart.js 或 ECharts</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义样式 */
</style>
