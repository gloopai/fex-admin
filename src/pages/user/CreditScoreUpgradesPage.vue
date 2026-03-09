<script setup>
import { ref, computed } from 'vue'
import { creditScoreUpgrades } from '../../mock/creditScore'
import { CREDIT_SCORE_UPGRADE_REASON, CREDIT_SCORE_UPGRADE_REASON_OPTIONS } from '../../constants/creditScore'

// 搜索和筛选
const searchKeyword = ref('')
const selectedUpgradeReason = ref('all')
const selectedFromVipLevel = ref('all')
const selectedToVipLevel = ref('all')
const dateRange = ref({ start: '', end: '' })

// 分页
const currentPage = ref(1)
const pageSize = ref(20)

// 升级原因配置
const upgradeReasonConfig = {
  [CREDIT_SCORE_UPGRADE_REASON.CREDIT_SCORE]: { text: '信用分达标', class: 'bg-emerald-100 text-emerald-700' },
  [CREDIT_SCORE_UPGRADE_REASON.RECHARGE]: { text: '充值升级', class: 'bg-blue-100 text-blue-700' },
  [CREDIT_SCORE_UPGRADE_REASON.MANUAL]: { text: '手动升级', class: 'bg-amber-100 text-amber-700' }
}

// VIP等级选项
const vipLevelOptions = computed(() => {
  const levels = new Set()
  creditScoreUpgrades.forEach(upgrade => {
    levels.add(upgrade.fromVipLevel)
    levels.add(upgrade.toVipLevel)
  })
  return Array.from(levels).sort((a, b) => a - b)
})

// 过滤数据
const filteredUpgrades = computed(() => {
  let upgrades = [...creditScoreUpgrades]

  // 按升级原因筛选
  if (selectedUpgradeReason.value !== 'all') {
    upgrades = upgrades.filter(upgrade => upgrade.upgradeReason === selectedUpgradeReason.value)
  }

  // 按起始等级筛选
  if (selectedFromVipLevel.value !== 'all') {
    upgrades = upgrades.filter(upgrade => upgrade.fromVipLevel === parseInt(selectedFromVipLevel.value))
  }

  // 按目标等级筛选
  if (selectedToVipLevel.value !== 'all') {
    upgrades = upgrades.filter(upgrade => upgrade.toVipLevel === parseInt(selectedToVipLevel.value))
  }

  // 按关键词搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    upgrades = upgrades.filter(upgrade =>
      upgrade.username.toLowerCase().includes(keyword) ||
      upgrade.userId.toLowerCase().includes(keyword) ||
      upgrade.fromVipName.toLowerCase().includes(keyword) ||
      upgrade.toVipName.toLowerCase().includes(keyword) ||
      upgrade.remarks.toLowerCase().includes(keyword)
    )
  }

  // 按日期筛选
  if (dateRange.value.start) {
    upgrades = upgrades.filter(upgrade => new Date(upgrade.createdAt) >= new Date(dateRange.value.start))
  }
  if (dateRange.value.end) {
    upgrades = upgrades.filter(upgrade => new Date(upgrade.createdAt) <= new Date(dateRange.value.end))
  }

  // 按时间倒序排序
  return upgrades.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

// 分页数据
const paginatedUpgrades = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredUpgrades.value.slice(start, end)
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(filteredUpgrades.value.length / pageSize.value)
})

// 统计信息
const statistics = computed(() => {
  const total = creditScoreUpgrades.length
  const byCreditScore = creditScoreUpgrades.filter(u => u.upgradeReason === CREDIT_SCORE_UPGRADE_REASON.CREDIT_SCORE).length
  const byRecharge = creditScoreUpgrades.filter(u => u.upgradeReason === CREDIT_SCORE_UPGRADE_REASON.RECHARGE).length
  const byManual = creditScoreUpgrades.filter(u => u.upgradeReason === CREDIT_SCORE_UPGRADE_REASON.MANUAL).length

  return [
    { label: '总升级记录', value: total.toLocaleString(), class: 'text-blue-600' },
    { label: '信用分达标', value: byCreditScore.toLocaleString(), class: 'text-emerald-600' },
    { label: '充值升级', value: byRecharge.toLocaleString(), class: 'text-purple-600' },
    { label: '手动升级', value: byManual.toLocaleString(), class: 'text-amber-600' }
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
  selectedUpgradeReason.value = 'all'
  selectedFromVipLevel.value = 'all'
  selectedToVipLevel.value = 'all'
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
        <h1 class="text-2xl font-bold text-slate-900">信用分升级日志</h1>
        <p class="text-sm text-slate-500 mt-1">查看所有用户的VIP等级升级记录</p>
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
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- 搜索 -->
        <div class="md:col-span-3">
          <label class="block text-sm font-medium text-slate-700 mb-2">搜索</label>
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="用户名、用户ID、VIP等级名称..."
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- 升级原因 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">升级原因</label>
          <select
            v-model="selectedUpgradeReason"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部原因</option>
            <option
              v-for="option in CREDIT_SCORE_UPGRADE_REASON_OPTIONS"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>

        <!-- 起始等级 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">起始等级</label>
          <select
            v-model="selectedFromVipLevel"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部等级</option>
            <option
              v-for="level in vipLevelOptions"
              :key="level"
              :value="level"
            >
              {{ level === 0 ? '普通用户' : `VIP${level}` }}
            </option>
          </select>
        </div>

        <!-- 目标等级 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">目标等级</label>
          <select
            v-model="selectedToVipLevel"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部等级</option>
            <option
              v-for="level in vipLevelOptions"
              :key="level"
              :value="level"
            >
              {{ level === 0 ? '普通用户' : `VIP${level}` }}
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
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">等级变化</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">升级原因</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">当时信用分</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">充值金额</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">备注</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">时间</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="upgrade in paginatedUpgrades"
              :key="upgrade.id"
              class="hover:bg-slate-50 transition-colors"
            >
              <!-- 用户 -->
              <td class="px-4 py-3">
                <div>
                  <p class="text-sm font-medium text-slate-900">{{ upgrade.username }}</p>
                  <p class="text-xs text-slate-500">{{ upgrade.userId }}</p>
                </div>
              </td>

              <!-- 等级变化 -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-2">
                  <div class="text-center">
                    <p class="text-xs text-slate-500">{{ upgrade.fromVipName }}</p>
                    <p class="text-sm font-semibold text-slate-700">{{ upgrade.fromVipLevel === 0 ? '普通' : `VIP${upgrade.fromVipLevel}` }}</p>
                  </div>
                  <svg class="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <div class="text-center">
                    <p class="text-xs text-emerald-600">{{ upgrade.toVipName }}</p>
                    <p class="text-sm font-semibold text-emerald-700">{{ upgrade.toVipLevel === 0 ? '普通' : `VIP${upgrade.toVipLevel}` }}</p>
                  </div>
                </div>
              </td>

              <!-- 升级原因 -->
              <td class="px-4 py-3">
                <span
                  :class="upgradeReasonConfig[upgrade.upgradeReason].class"
                  class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{ upgradeReasonConfig[upgrade.upgradeReason].text }}
                </span>
              </td>

              <!-- 当时信用分 -->
              <td class="px-4 py-3 text-center">
                <span class="text-sm font-medium text-slate-700">{{ upgrade.creditScore }}</span>
              </td>

              <!-- 充值金额 -->
              <td class="px-4 py-3">
                <span v-if="upgrade.rechargeAmount" class="text-sm text-slate-700 font-medium">
                  {{ formatAmount(upgrade.rechargeAmount) }}
                </span>
                <span v-else class="text-sm text-slate-400">-</span>
              </td>

              <!-- 备注 -->
              <td class="px-4 py-3">
                <span class="text-sm text-slate-700">{{ upgrade.remarks }}</span>
              </td>

              <!-- 时间 -->
              <td class="px-4 py-3">
                <span class="text-sm text-slate-600">{{ formatDateTime(upgrade.createdAt) }}</span>
              </td>
            </tr>

            <!-- 空状态 -->
            <tr v-if="paginatedUpgrades.length === 0">
              <td colspan="7" class="px-4 py-12 text-center">
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
          共 {{ filteredUpgrades.length }} 条记录，第 {{ currentPage }} / {{ totalPages }} 页
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
