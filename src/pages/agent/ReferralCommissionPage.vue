<script setup>
import { ref, computed } from 'vue'
import { mockCommissionRecords, referralApi } from '../../mock/referral'
import { COMMISSION_STATUS, COMMISSION_STATUS_OPTIONS, REFERRAL_TYPE_OPTIONS } from '../../constants/referral'

// 搜索和筛选
const searchKeyword = ref('')
const statusFilter = ref('all')
const typeFilter = ref('all')
const levelFilter = ref('all')

// 记录列表
const recordList = ref(mockCommissionRecords)

// 选中的记录
const selectedRecords = ref([])

// 过滤后的列表
const filteredRecords = computed(() => {
  let list = [...recordList.value]
  
  // 搜索关键词
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    list = list.filter(record => 
      record.id.toLowerCase().includes(keyword) ||
      record.agentUsername.toLowerCase().includes(keyword) ||
      record.referralUsername.toLowerCase().includes(keyword) ||
      record.agentUid.toString().includes(keyword)
    )
  }
  
  // 状态筛选
  if (statusFilter.value !== 'all') {
    list = list.filter(record => record.status === statusFilter.value)
  }
  
  // 类型筛选
  if (typeFilter.value !== 'all') {
    list = list.filter(record => record.type === typeFilter.value)
  }
  
  // 层级筛选
  if (levelFilter.value !== 'all') {
    list = list.filter(record => record.level === parseInt(levelFilter.value))
  }
  
  return list
})

// 统计数据
const stats = computed(() => {
  const total = recordList.value.length
  const pending = recordList.value.filter(r => r.status === COMMISSION_STATUS.PENDING).length
  const completed = recordList.value.filter(r => r.status === COMMISSION_STATUS.COMPLETED).length
  const totalAmount = recordList.value.reduce((sum, r) => sum + r.commission, 0)
  const completedAmount = recordList.value
    .filter(r => r.status === COMMISSION_STATUS.COMPLETED)
    .reduce((sum, r) => sum + r.commission, 0)
  
  return [
    { label: '总记录数', value: total, color: 'blue' },
    { label: '待发放', value: pending, color: 'yellow' },
    { label: '已完成', value: completed, color: 'green' },
    { label: '累计佣金', value: `$${totalAmount.toLocaleString()}`, color: 'purple' },
    { label: '已发放佣金', value: `$${completedAmount.toLocaleString()}`, color: 'green' }
  ]
})

// 获取状态配置
const getStatusConfig = (status) => {
  const config = COMMISSION_STATUS_OPTIONS.find(s => s.value === status)
  return {
    text: config?.label || status,
    color: config?.color || 'gray'
  }
}

// 获取类型标签
const getTypeLabel = (type) => {
  return REFERRAL_TYPE_OPTIONS.find(t => t.value === type)?.label || type
}

// 全选/取消全选
const toggleSelectAll = () => {
  if (selectedRecords.value.length === filteredRecords.value.length) {
    selectedRecords.value = []
  } else {
    selectedRecords.value = filteredRecords.value.map(r => r.id)
  }
}

// 切换单个选择
const toggleSelect = (recordId) => {
  const index = selectedRecords.value.indexOf(recordId)
  if (index > -1) {
    selectedRecords.value.splice(index, 1)
  } else {
    selectedRecords.value.push(recordId)
  }
}

// 检查是否选中
const isSelected = (recordId) => {
  return selectedRecords.value.includes(recordId)
}

// 手动执行分佣
const executeCommission = async (recordId) => {
  if (!confirm('确认执行该笔分佣？')) return
  
  try {
    const result = await referralApi.executeCommission(recordId)
    if (result.success) {
      const record = recordList.value.find(r => r.id === recordId)
      if (record) {
        record.status = COMMISSION_STATUS.COMPLETED
        record.completedAt = new Date().toISOString()
      }
      alert(result.message)
    }
  } catch (error) {
    alert('执行失败：' + error.message)
  }
}

// 批量执行分佣
const batchExecute = async () => {
  if (selectedRecords.value.length === 0) {
    alert('请先选择要执行的记录')
    return
  }
  
  if (!confirm(`确认批量执行${selectedRecords.value.length}条分佣记录？`)) return
  
  try {
    const result = await referralApi.batchExecuteCommission(selectedRecords.value)
    if (result.success) {
      // 更新所有选中记录的状态
      selectedRecords.value.forEach(id => {
        const record = recordList.value.find(r => r.id === id)
        if (record) {
          record.status = COMMISSION_STATUS.COMPLETED
          record.completedAt = new Date().toISOString()
        }
      })
      selectedRecords.value = []
      alert(result.message)
    }
  } catch (error) {
    alert('批量执行失败：' + error.message)
  }
}

// 导出数据
const exportData = () => {
  alert('导出功能开发中...')
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">分佣记录</h1>
        <p class="mt-1 text-sm text-gray-500">查看和管理所有分佣记录</p>
      </div>
      <div class="flex space-x-3">
        <button
          v-if="selectedRecords.length > 0"
          @click="batchExecute"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          批量执行 ({{ selectedRecords.length }})
        </button>
        <button
          @click="exportData"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          导出数据
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-white rounded-lg shadow p-4"
      >
        <p class="text-xs text-gray-600">{{ stat.label }}</p>
        <p class="mt-1 text-xl font-bold" :class="`text-${stat.color}-600`">{{ stat.value }}</p>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="bg-white rounded-lg shadow p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索记录ID、代理或用户..."
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        <select
          v-model="statusFilter"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">全部状态</option>
          <option v-for="status in COMMISSION_STATUS_OPTIONS" :key="status.value" :value="status.value">
            {{ status.label }}
          </option>
        </select>
        
        <select
          v-model="typeFilter"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">全部类型</option>
          <option v-for="type in REFERRAL_TYPE_OPTIONS" :key="type.value" :value="type.value">
            {{ type.label }}
          </option>
        </select>
        
        <select
          v-model="levelFilter"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">全部层级</option>
          <option value="1">一级</option>
          <option value="2">二级</option>
          <option value="3">三级</option>
          <option value="4">四级</option>
          <option value="5">五级</option>
        </select>
      </div>
    </div>

    <!-- 记录列表 -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  :checked="selectedRecords.length === filteredRecords.length && filteredRecords.length > 0"
                  @change="toggleSelectAll"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">记录ID</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">代理信息</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">被推荐人</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型/层级</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">订单金额</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">佣金比例</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">佣金</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">生成时间</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="record in filteredRecords" :key="record.id" class="hover:bg-gray-50">
              <td class="px-4 py-4">
                <input
                  type="checkbox"
                  :checked="isSelected(record.id)"
                  @change="toggleSelect(record.id)"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                {{ record.id }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ record.agentUsername }}</div>
                <div class="text-xs text-gray-500">UID: {{ record.agentUid }}</div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ record.referralUsername }}</div>
                <div class="text-xs text-gray-500">UID: {{ record.referralUid }}</div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ getTypeLabel(record.type) }}</div>
                <span class="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">
                  {{ record.level }}级
                </span>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                ${{ record.amount.toLocaleString() }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ (record.commissionRate * 100).toFixed(2) }}%
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                ${{ record.commission.toLocaleString() }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <span 
                  :class="`px-2 py-1 text-xs font-semibold rounded-full bg-${getStatusConfig(record.status).color}-100 text-${getStatusConfig(record.status).color}-800`"
                >
                  {{ getStatusConfig(record.status).text }}
                </span>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                <div>{{ formatDate(record.createdAt) }}</div>
                <div v-if="record.completedAt" class="text-xs text-green-600">
                  完成: {{ formatDate(record.completedAt) }}
                </div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  v-if="record.status === COMMISSION_STATUS.PENDING"
                  @click="executeCommission(record.id)"
                  class="text-green-600 hover:text-green-900"
                >
                  执行
                </button>
                <span v-else class="text-gray-400">已处理</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 空状态 -->
      <div v-if="filteredRecords.length === 0" class="text-center py-12">
        <p class="text-gray-500">暂无分佣记录</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义样式 */
</style>
