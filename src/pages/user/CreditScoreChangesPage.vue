<script setup>
import { ref, computed } from 'vue'
import { creditScoreChanges } from '../../mock/creditScore'
import { CREDIT_SCORE_CHANGE_TYPE, CREDIT_SCORE_CHANGE_TYPE_OPTIONS } from '../../constants/creditScore'

// 搜索和筛选
const searchKeyword = ref('')
const selectedChangeType = ref('all')
const dateRange = ref({ start: '', end: '' })

// 分页
const currentPage = ref(1)
const pageSize = ref(20)

// 类型配置
const changeTypeConfig = {
  [CREDIT_SCORE_CHANGE_TYPE.RECHARGE]: { text: '充值', class: 'bg-blue-100 text-blue-700' },
  [CREDIT_SCORE_CHANGE_TYPE.PRIMARY_KYC]: { text: '初级认证', class: 'bg-emerald-100 text-emerald-700' },
  [CREDIT_SCORE_CHANGE_TYPE.ADVANCED_KYC]: { text: '高级认证', class: 'bg-purple-100 text-purple-700' },
  [CREDIT_SCORE_CHANGE_TYPE.MANUAL_ADJUST]: { text: '手动调整', class: 'bg-amber-100 text-amber-700' },
  [CREDIT_SCORE_CHANGE_TYPE.AUTO_UPGRADE]: { text: '自动升级', class: 'bg-indigo-100 text-indigo-700' },
  [CREDIT_SCORE_CHANGE_TYPE.PENALTY]: { text: '惩罚', class: 'bg-rose-100 text-rose-700' },
  [CREDIT_SCORE_CHANGE_TYPE.REWARD]: { text: '奖励', class: 'bg-teal-100 text-teal-700' }
}

// 过滤数据
const filteredChanges = computed(() => {
  let changes = [...creditScoreChanges]

  // 按类型筛选
  if (selectedChangeType.value !== 'all') {
    changes = changes.filter(change => change.changeType === selectedChangeType.value)
  }

  // 按关键词搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    changes = changes.filter(change =>
      change.username.toLowerCase().includes(keyword) ||
      change.userId.toLowerCase().includes(keyword) ||
      change.reason.toLowerCase().includes(keyword) ||
      change.operatorName.toLowerCase().includes(keyword)
    )
  }

  // 按日期筛选
  if (dateRange.value.start) {
    changes = changes.filter(change => new Date(change.createdAt) >= new Date(dateRange.value.start))
  }
  if (dateRange.value.end) {
    changes = changes.filter(change => new Date(change.createdAt) <= new Date(dateRange.value.end))
  }

  // 按时间倒序排序
  return changes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

// 分页数据
const paginatedChanges = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredChanges.value.slice(start, end)
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(filteredChanges.value.length / pageSize.value)
})

// 统计信息
const statistics = computed(() => {
  const total = creditScoreChanges.length
  const increases = creditScoreChanges.filter(c => c.changeAmount > 0).length
  const decreases = creditScoreChanges.filter(c => c.changeAmount < 0).length
  const totalIncrease = creditScoreChanges.reduce((sum, c) => c.changeAmount > 0 ? sum + c.changeAmount : sum, 0)

  return [
    { label: '总变动记录', value: total.toLocaleString(), class: 'text-blue-600' },
    { label: '增加记录', value: increases.toLocaleString(), class: 'text-emerald-600' },
    { label: '减少记录', value: decreases.toLocaleString(), class: 'text-rose-600' },
    { label: '累计增加', value: `+${totalIncrease}`, class: 'text-purple-600' }
  ]
})

// 格式化日期时间
const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

// 格式化金额
const formatAmount = (amount) => {
  if (!amount) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// 重置筛选
const resetFilters = () => {
  searchKeyword.value = ''
  selectedChangeType.value = 'all'
  dateRange.value = { start: '', end: '' }
  currentPage.value = 1
}

// 导出数据
const exportData = () => {
  alert('导出功能待实现')
}
</script>

<template>
  <section class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">信用分变动日志</h1>
        <p class="text-sm text-slate-500 mt-1">查看所有用户的信用分变动记录</p>
      </div>
      <button
        @click="exportData"
        class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        导出数据
      </button>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div
        v-for="(stat, index) in statistics"
        :key="index"
        class="bg-white rounded-xl border border-slate-200 p-4"
      >
        <p class="text-sm text-slate-600 mb-1">{{ stat.label }}</p>
        <p :class="stat.class" class="text-2xl font-bold">{{ stat.value }}</p>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- 搜索 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">搜索</label>
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="用户名、用户ID、原因..."
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- 变动类型 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">变动类型</label>
          <select
            v-model="selectedChangeType"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部类型</option>
            <option
              v-for="option in CREDIT_SCORE_CHANGE_TYPE_OPTIONS"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>

        <!-- 开始日期 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">开始日期</label>
          <input
            v-model="dateRange.start"
            type="date"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- 结束日期 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">结束日期</label>
          <input
            v-model="dateRange.end"
            type="date"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- 重置按钮 -->
      <div class="mt-4 flex justify-end">
        <button
          @click="resetFilters"
          class="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
        >
          重置筛选
        </button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">用户</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">变动类型</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">变动前</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">变动值</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">变动后</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">关联金额</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">原因</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">操作人</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">时间</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="change in paginatedChanges"
              :key="change.id"
              class="hover:bg-slate-50 transition-colors"
            >
              <!-- 用户 -->
              <td class="px-4 py-3">
                <div>
                  <p class="text-sm font-medium text-slate-900">{{ change.username }}</p>
                  <p class="text-xs text-slate-500">{{ change.userId }}</p>
                </div>
              </td>

              <!-- 变动类型 -->
              <td class="px-4 py-3">
                <span
                  :class="changeTypeConfig[change.changeType].class"
                  class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{ changeTypeConfig[change.changeType].text }}
                </span>
              </td>

              <!-- 变动前 -->
              <td class="px-4 py-3 text-center">
                <span class="text-sm font-medium text-slate-700">{{ change.beforeScore }}</span>
              </td>

              <!-- 变动值 -->
              <td class="px-4 py-3 text-center">
                <span
                  :class="change.changeAmount > 0 ? 'text-emerald-600' : change.changeAmount < 0 ? 'text-rose-600' : 'text-slate-600'"
                  class="text-sm font-semibold"
                >
                  {{ change.changeAmount > 0 ? '+' : '' }}{{ change.changeAmount }}
                </span>
              </td>

              <!-- 变动后 -->
              <td class="px-4 py-3 text-center">
                <span class="text-sm font-medium text-slate-700">{{ change.afterScore }}</span>
              </td>

              <!-- 关联金额 -->
              <td class="px-4 py-3">
                <span v-if="change.relatedAmount" class="text-sm text-slate-700 font-medium">
                  {{ formatAmount(change.relatedAmount) }}
                </span>
                <span v-else class="text-sm text-slate-400">-</span>
              </td>

              <!-- 原因 -->
              <td class="px-4 py-3">
                <span class="text-sm text-slate-700">{{ change.reason }}</span>
              </td>

              <!-- 操作人 -->
              <td class="px-4 py-3">
                <span class="text-sm text-slate-700">{{ change.operatorName }}</span>
              </td>

              <!-- 时间 -->
              <td class="px-4 py-3">
                <span class="text-sm text-slate-600">{{ formatDateTime(change.createdAt) }}</span>
              </td>
            </tr>

            <!-- 空状态 -->
            <tr v-if="paginatedChanges.length === 0">
              <td colspan="9" class="px-4 py-12 text-center">
                <svg class="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p class="mt-2 text-sm text-slate-600">暂无数据</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="border-t border-slate-200 px-4 py-3 flex items-center justify-between">
        <div class="text-sm text-slate-600">
          共 {{ filteredChanges.length }} 条记录，第 {{ currentPage }} / {{ totalPages }} 页
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="px-3 py-1 text-sm text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            上一页
          </button>
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 text-sm text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
