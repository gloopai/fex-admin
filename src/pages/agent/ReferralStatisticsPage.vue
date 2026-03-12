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
      <h1 class="text-2xl font-bold text-slate-900">分销统计</h1>
      <p class="mt-1 text-sm text-slate-500">查看分销数据和业绩分析</p>
    </div>

    <!-- 周期选择 -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div class="flex items-center gap-2">
        <button
          v-for="period in STATS_PERIOD_OPTIONS"
          :key="period.value"
          @click="changePeriod(period.value)"
          :class="selectedPeriod === period.value 
            ? 'ant-btn-primary' 
            : ''"
          class="ant-btn"
        >
          {{ period.label }}
        </button>
      </div>
    </div>

    <!-- 总览统计 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white border border-blue-400/20">
        <p class="text-xs opacity-80 font-medium uppercase tracking-wider">总佣金</p>
        <p class="mt-2 text-3xl font-bold font-mono tracking-tight">${{ stats[selectedPeriod]?.totalCommission.toLocaleString() || 0 }}</p>
        <div class="mt-4 pt-4 border-t border-white/10 text-xs opacity-70">累计发放佣金</div>
      </div>
      
      <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md p-6 text-white border border-purple-400/20">
        <p class="text-xs opacity-80 font-medium uppercase tracking-wider">总订单数</p>
        <p class="mt-2 text-3xl font-bold font-mono tracking-tight">{{ formatLargeNumber(stats[selectedPeriod]?.totalOrders || 0) }}</p>
        <div class="mt-4 pt-4 border-t border-white/10 text-xs opacity-70">分佣订单总数</div>
      </div>
      
      <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-md p-6 text-white border border-emerald-400/20">
        <p class="text-xs opacity-80 font-medium uppercase tracking-wider">已完成</p>
        <p class="mt-2 text-3xl font-bold font-mono tracking-tight">{{ formatLargeNumber(stats[selectedPeriod]?.completedOrders || 0) }}</p>
        <div class="mt-4 pt-4 border-t border-white/10 text-xs opacity-70">完成率 {{ ((stats[selectedPeriod]?.completedOrders / stats[selectedPeriod]?.totalOrders * 100) || 0).toFixed(1) }}%</div>
      </div>
      
      <div class="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-md p-6 text-white border border-amber-400/20">
        <p class="text-xs opacity-80 font-medium uppercase tracking-wider">平均佣金</p>
        <p class="mt-2 text-3xl font-bold font-mono tracking-tight">${{ stats[selectedPeriod]?.avgCommission.toFixed(2) || 0 }}</p>
        <div class="mt-4 pt-4 border-t border-white/10 text-xs opacity-70">单笔平均金额</div>
      </div>
    </div>

    <!-- 图表和分类统计 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 按类型统计 -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 class="text-base font-semibold text-slate-900 mb-6 flex items-center">
          <span class="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
          按产品类型统计
        </h3>
        <div class="space-y-6">
          <div v-for="item in stats.byType" :key="item.type" class="group">
            <div class="flex justify-between items-end mb-2">
              <div class="flex items-center space-x-3">
                <div class="w-2.5 h-2.5 rounded-full" 
                  :class="{
                    'bg-blue-500': item.type === 'deposit',
                    'bg-purple-500': item.type === 'periodic',
                    'bg-emerald-500': item.type === 'lending',
                    'bg-amber-500': item.type === 'ai_quant'
                  }"
                ></div>
                <span class="font-medium text-slate-700">
                  {{ 
                    item.type === 'deposit' ? '充值分销' :
                    item.type === 'periodic' ? '周期产品' :
                    item.type === 'lending' ? '理财产品' :
                    'AI量化'
                  }}
                </span>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-slate-900 font-mono">${{ item.commission.toLocaleString() }}</div>
                <div class="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{{ item.count }} 笔订单</div>
              </div>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                class="h-full rounded-full transition-all duration-1000 ease-out group-hover:opacity-80"
                :class="{
                  'bg-blue-500': item.type === 'deposit',
                  'bg-purple-500': item.type === 'periodic',
                  'bg-emerald-500': item.type === 'lending',
                  'bg-amber-500': item.type === 'ai_quant'
                }"
                :style="{ width: item.rate + '%' }"
              ></div>
            </div>
            <div class="mt-1 text-[10px] text-slate-400 font-bold text-right tracking-wider">占比 {{ item.rate.toFixed(1) }}%</div>
          </div>
        </div>
      </div>

      <!-- 按层级统计 -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 class="text-base font-semibold text-slate-900 mb-6 flex items-center">
          <span class="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2"></span>
          按推荐层级统计
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <div v-for="item in stats.byLevel" :key="item.level" class="text-center p-4 bg-slate-50/50 rounded-xl border border-slate-100 transition-all hover:border-purple-200 hover:bg-purple-50/30 group">
            <div class="text-xl font-bold text-purple-600 font-mono group-hover:scale-110 transition-transform">{{ item.level }}级</div>
            <div class="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ formatLargeNumber(item.count) }} 笔</div>
            <div class="mt-1 text-sm font-bold text-slate-800 font-mono">${{ item.commission.toLocaleString() }}</div>
            <div class="mt-1 text-[10px] font-bold text-purple-400 bg-purple-50 rounded-full px-2 py-0.5 inline-block">{{ item.rate.toFixed(1) }}%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top代理排行 -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 bg-white">
        <h3 class="text-base font-semibold text-slate-900 flex items-center">
          <span class="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></span>
          Top 代理排行榜
        </h3>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">排名</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">UID</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">用户名</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">佣金总额</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">订单数</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-50">
            <tr v-for="(agent, index) in stats.topAgents" :key="agent.uid" class="hover:bg-slate-50/50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center justify-center w-7 h-7 rounded-lg text-sm"
                  :class="{
                    'bg-amber-100 text-amber-700 font-bold shadow-sm border border-amber-200': index === 0,
                    'bg-slate-200 text-slate-600 font-bold shadow-sm border border-slate-300': index === 1,
                    'bg-orange-50 text-orange-600 font-bold shadow-sm border border-orange-100': index === 2,
                    'text-slate-400 font-medium': index > 2
                  }"
                >
                  {{ index + 1 }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 font-mono">
                {{ agent.uid }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                {{ agent.username }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600 font-mono">
                ${{ agent.commission.toLocaleString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                {{ agent.orders }} <span class="text-[10px] text-slate-400 font-bold ml-1">笔</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 趋势图占位 -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h3 class="text-base font-semibold text-slate-900 mb-6 flex items-center">
        <span class="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
        分佣趋势分析
      </h3>
      <div class="h-64 flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <div class="text-center">
          <div class="bg-white p-4 rounded-2xl shadow-sm inline-block mb-3 border border-slate-100">
            <svg class="h-10 w-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <p class="text-sm text-slate-500 font-semibold tracking-wide">可视化图表待集成</p>
          <p class="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Recommended: ECharts / Chart.js</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义样式 */
</style>
