<script setup>
import { ref, computed } from 'vue'
import { mockAgentList, mockAgentStats, agentApi } from '../../mock/agent'
import { AGENT_STATUS, AGENT_LEVEL, AGENT_STATUS_OPTIONS, AGENT_LEVEL_OPTIONS } from '../../constants/agent'

// 搜索和筛选
const searchKeyword = ref('')
const statusFilter = ref('all')
const levelFilter = ref('all')

// 模态状态
const showUpgradeModal = ref(false)
const showDetailModal = ref(false)
const selectedAgent = ref(null)
const upgradeForm = ref({
  uid: '',
  level: AGENT_LEVEL.LEVEL_1
})

// 统计数据
const stats = ref(mockAgentStats)

// 代理列表
const agentList = ref(mockAgentList)

// 过滤后的列表
const filteredAgents = computed(() => {
  let list = [...agentList.value]
  
  // 搜索关键词
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    list = list.filter(agent => 
      agent.username.toLowerCase().includes(keyword) ||
      agent.email.toLowerCase().includes(keyword) ||
      agent.uid.toString().includes(keyword)
    )
  }
  
  // 状态筛选
  if (statusFilter.value !== 'all') {
    list = list.filter(agent => agent.status === statusFilter.value)
  }
  
  // 等级筛选
  if (levelFilter.value !== 'all') {
    list = list.filter(agent => agent.level === levelFilter.value)
  }
  
  return list
})

// 统计卡片
const statCards = computed(() => [
  {
    label: '总代理数',
    value: stats.value.totalAgents.toLocaleString(),
    trend: `+${stats.value.activeAgents} 活跃`,
    color: 'blue',
    good: true
  },
  {
    label: '总推荐人数',
    value: stats.value.totalReferrals.toLocaleString(),
    trend: '累计推荐用户',
    color: 'purple',
    good: true
  },
  {
    label: '累计佣金',
    value: `$${stats.value.totalCommission.toLocaleString()}`,
    trend: `本月 $${stats.value.monthCommission.toLocaleString()}`,
    color: 'green',
    good: true
  },
  {
    label: '今日佣金',
    value: `$${stats.value.todayCommission.toLocaleString()}`,
    trend: '实时数据',
    color: 'yellow',
    good: true
  }
])

// 获取状态配置
const getStatusConfig = (status) => {
  const config = AGENT_STATUS_OPTIONS.find(s => s.value === status)
  return {
    text: config?.label || status,
    color: config?.color || 'gray'
  }
}

// 获取等级配置
const getLevelConfig = (level) => {
  const config = AGENT_LEVEL_OPTIONS.find(l => l.value === level)
  return config?.label || level
}

// 打开升级弹窗
const openUpgradeModal = () => {
  upgradeForm.value = {
    uid: '',
    level: AGENT_LEVEL.LEVEL_1
  }
  showUpgradeModal.value = true
}

// 升级用户为代理
const handleUpgrade = async () => {
  try {
    const result = await agentApi.upgradeToAgent(upgradeForm.value.uid, upgradeForm.value.level)
    if (result.success) {
      alert(result.message)
      showUpgradeModal.value = false
      // 重新加载列表
      loadAgentList()
    }
  } catch (error) {
    alert('升级失败：' + error.message)
  }
}

// 更新代理状态
const updateStatus = async (agent, newStatus) => {
  if (!confirm(`确认${newStatus === AGENT_STATUS.SUSPENDED ? '暂停' : '激活'}该代理？`)) {
    return
  }
  
  try {
    const result = await agentApi.updateAgentStatus(agent.uid, newStatus)
    if (result.success) {
      agent.status = newStatus
      alert(result.message)
    }
  } catch (error) {
    alert('操作失败：' + error.message)
  }
}

// 更新代理等级
const updateLevel = async (agent) => {
  const newLevel = prompt('请输入新等级（level_1 到 level_5）', agent.level)
  if (!newLevel || newLevel === agent.level) return
  
  try {
    const result = await agentApi.updateAgentLevel(agent.uid, newLevel)
    if (result.success) {
      agent.level = newLevel
      alert(result.message)
    }
  } catch (error) {
    alert('操作失败：' + error.message)
  }
}

// 查看详情
const viewDetail = async (agent) => {
  selectedAgent.value = agent
  showDetailModal.value = true
}

// 加载代理列表
const loadAgentList = async () => {
  try {
    const result = await agentApi.getAgentList({ page: 1, pageSize: 100 })
    if (result.success) {
      agentList.value = result.data.list
    }
  } catch (error) {
    console.error('Failed to load agent list:', error)
  }
}

// 格式化日期
const formatDate = (dateString) => {
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
        <h1 class="text-2xl font-bold text-gray-900">代理管理</h1>
        <p class="mt-1 text-sm text-gray-500">管理平台代理用户，升级普通用户为代理</p>
      </div>
      <button
        @click="openUpgradeModal"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        升级为代理
      </button>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="card in statCards"
        :key="card.label"
        class="bg-white rounded-lg shadow p-6"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">{{ card.label }}</p>
            <p class="mt-2 text-2xl font-semibold text-gray-900">{{ card.value }}</p>
            <p class="mt-1 text-xs" :class="card.good ? 'text-green-600' : 'text-gray-500'">
              {{ card.trend }}
            </p>
          </div>
          <div :class="`w-12 h-12 bg-${card.color}-100 rounded-lg flex items-center justify-center`">
            <div :class="`w-6 h-6 bg-${card.color}-500 rounded`"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="bg-white rounded-lg shadow p-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索 UID、用户名或邮箱..."
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        <select
          v-model="statusFilter"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">全部状态</option>
          <option v-for="status in AGENT_STATUS_OPTIONS" :key="status.value" :value="status.value">
            {{ status.label }}
          </option>
        </select>
        
        <select
          v-model="levelFilter"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">全部等级</option>
          <option v-for="level in AGENT_LEVEL_OPTIONS" :key="level.value" :value="level.value">
            {{ level.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- 代理列表表格 -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户信息</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">等级</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">推荐人数</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">累计佣金</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">成为代理时间</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="agent in filteredAgents" :key="agent.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ agent.uid }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ agent.username }}</div>
                <div class="text-sm text-gray-500">{{ agent.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                  {{ getLevelConfig(agent.level) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="`px-2 py-1 text-xs font-semibold rounded-full bg-${getStatusConfig(agent.status).color}-100 text-${getStatusConfig(agent.status).color}-800`"
                >
                  {{ getStatusConfig(agent.status).text }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div>总计: {{ agent.totalReferrals }}</div>
                <div class="text-xs text-gray-500">直推: {{ agent.directReferrals }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="font-semibold">${{ agent.totalCommission.toLocaleString() }}</div>
                <div class="text-xs text-gray-500">本月: ${{ agent.monthCommission.toLocaleString() }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(agent.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button
                  @click="viewDetail(agent)"
                  class="text-blue-600 hover:text-blue-900"
                >
                  详情
                </button>
                <button
                  @click="updateLevel(agent)"
                  class="text-purple-600 hover:text-purple-900"
                >
                  等级
                </button>
                <button
                  v-if="agent.status === AGENT_STATUS.ACTIVE"
                  @click="updateStatus(agent, AGENT_STATUS.SUSPENDED)"
                  class="text-yellow-600 hover:text-yellow-900"
                >
                  暂停
                </button>
                <button
                  v-else
                  @click="updateStatus(agent, AGENT_STATUS.ACTIVE)"
                  class="text-green-600 hover:text-green-900"
                >
                  激活
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 空状态 -->
      <div v-if="filteredAgents.length === 0" class="text-center py-12">
        <p class="text-gray-500">暂无代理数据</p>
      </div>
    </div>

    <!-- 升级为代理弹窗 -->
    <div v-if="showUpgradeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">升级用户为代理</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">用户 UID</label>
            <input
              v-model="upgradeForm.uid"
              type="text"
              placeholder="请输入用户 UID"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">代理等级</label>
            <select
              v-model="upgradeForm.level"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option v-for="level in AGENT_LEVEL_OPTIONS" :key="level.value" :value="level.value">
                {{ level.label }} (佣金比例: {{ (level.commissionRate * 100).toFixed(0) }}%)
              </option>
            </select>
          </div>
        </div>
        
        <div class="mt-6 flex justify-end space-x-3">
          <button
            @click="showUpgradeModal = false"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            @click="handleUpgrade"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            确认升级
          </button>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <div v-if="showDetailModal && selectedAgent" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-lg font-semibold">代理详情</h3>
          <button @click="showDetailModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-sm text-gray-500">UID:</span>
              <p class="font-medium">{{ selectedAgent.uid }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">用户名:</span>
              <p class="font-medium">{{ selectedAgent.username }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">邮箱:</span>
              <p class="font-medium">{{ selectedAgent.email }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">手机:</span>
              <p class="font-medium">{{ selectedAgent.phone }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">代理等级:</span>
              <p class="font-medium">{{ getLevelConfig(selectedAgent.level) }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">状态:</span>
              <p class="font-medium">{{ getStatusConfig(selectedAgent.status).text }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">总推荐人数:</span>
              <p class="font-medium">{{ selectedAgent.totalReferrals }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">直推人数:</span>
              <p class="font-medium">{{ selectedAgent.directReferrals }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">累计佣金:</span>
              <p class="font-medium text-green-600">${{ selectedAgent.totalCommission.toLocaleString() }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">本月佣金:</span>
              <p class="font-medium text-green-600">${{ selectedAgent.monthCommission.toLocaleString() }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">成为代理时间:</span>
              <p class="font-medium">{{ formatDate(selectedAgent.createdAt) }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">最后活跃:</span>
              <p class="font-medium">{{ formatDate(selectedAgent.lastActiveAt) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义样式 */
</style>
