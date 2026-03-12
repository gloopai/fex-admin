<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { mockAgentStats, agentApi } from '../../mock/agent'
import { AGENT_STATUS, AGENT_LEVEL, AGENT_STATUS_OPTIONS, AGENT_LEVEL_OPTIONS } from '../../constants/agent'

// 搜索和筛选
const searchKeyword = ref('')
const statusFilter = ref('all')
const levelFilter = ref('all')
const loading = ref(false)

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const totalPages = computed(() => Math.ceil(pagination.total / pagination.pageSize))

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
const agentList = ref([])

// 加载代理列表
const loadAgentList = async () => {
  loading.value = true
  try {
    const result = await agentApi.getAgentList({ 
      page: pagination.currentPage, 
      pageSize: pagination.pageSize,
      searchKeyword: searchKeyword.value,
      status: statusFilter.value,
      level: levelFilter.value
    })
    if (result.success) {
      agentList.value = result.data.list
      pagination.total = result.data.total
    }
  } catch (error) {
    console.error('Failed to load agent list:', error)
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.currentPage = 1
  loadAgentList()
}

// 重置处理
const handleReset = () => {
  searchKeyword.value = ''
  statusFilter.value = 'all'
  levelFilter.value = 'all'
  pagination.currentPage = 1
  loadAgentList()
}

// 监听页码变化
watch(() => pagination.currentPage, () => {
  loadAgentList()
})

// 组件加载时获取数据
onMounted(() => {
  loadAgentList()
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
        <h1 class="text-2xl font-bold text-slate-900">代理管理</h1>
        <p class="mt-1 text-sm text-slate-500">管理平台代理用户，升级普通用户为代理</p>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="card in statCards"
        :key="card.label"
        class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-slate-600 font-medium">{{ card.label }}</p>
            <p class="mt-2 text-2xl font-bold text-slate-900">{{ card.value }}</p>
            <p class="mt-1 text-xs font-medium" :class="card.good ? 'text-emerald-600' : 'text-slate-500'">
              {{ card.trend }}
            </p>
          </div>
          <div :class="`w-12 h-12 bg-${card.color}-50 rounded-xl flex items-center justify-center border border-${card.color}-100 transition-all hover:scale-105 font-medium`">
             <div :class="`w-6 h-6 bg-${card.color}-500 rounded-lg shadow-sm opacity-80 text-white flex items-center justify-center text-xs font-bold italic font-medium`">
               {{ card.label.charAt(0) }}
             </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 代理列表卡片 (包含筛选和表格) -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm relative min-h-[400px]">
      <div class="flex items-center justify-between border-b border-slate-200 p-4 bg-white">
        <h3 class="text-base font-semibold text-slate-900">代理列表</h3>
        <button
          @click="openUpgradeModal"
          class="ant-btn ant-btn-primary"
        >
          + 升级为代理
        </button>
      </div>

      <!-- 筛选栏 -->
      <div class="p-4 border-b border-slate-100 bg-slate-50/30">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="flex flex-col space-y-1.5">
            <label class="text-xs font-medium text-slate-500 ml-1">关键词搜索</label>
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="UID、用户名或邮箱..."
              class="ant-input !py-1.5"
              @keyup.enter="handleSearch"
            />
          </div>
          
          <div class="flex flex-col space-y-1.5">
            <label class="text-xs font-medium text-slate-500 ml-1">状态筛选</label>
            <select
              v-model="statusFilter"
              class="ant-select !py-1.5"
              @change="handleSearch"
            >
              <option value="all">全部状态</option>
              <option v-for="status in AGENT_STATUS_OPTIONS" :key="status.value" :value="status.value">
                {{ status.label }}
              </option>
            </select>
          </div>
          
          <div class="flex flex-col space-y-1.5">
            <label class="text-xs font-medium text-slate-500 ml-1">等级筛选</label>
            <select
              v-model="levelFilter"
              class="ant-select !py-1.5"
              @change="handleSearch"
            >
              <option value="all">全部等级</option>
              <option v-for="level in AGENT_LEVEL_OPTIONS" :key="level.value" :value="level.value">
                {{ level.label }}
              </option>
            </select>
          </div>

          <div class="flex items-end space-x-2">
            <button
              @click="handleSearch"
              class="ant-btn ant-btn-primary flex-1 !h-[34px]"
            >
              搜索
            </button>
            <button
              @click="handleReset"
              class="ant-btn flex-1 !h-[34px]"
            >
              重置
            </button>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <!-- 加载遮罩 -->
        <div v-if="loading" class="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>

        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">UID</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">用户信息</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">等级</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">状态</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">推荐人数</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">累计佣金</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">成为代理时间</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            <tr v-for="agent in agentList" :key="agent.id" class="hover:bg-gray-50">
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
            <tr v-if="agentList.length === 0 && !loading">
              <td colspan="8" class="px-6 py-10 text-center text-gray-500">
                暂无代理数据
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div v-if="pagination.total > 0" class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <div class="text-sm text-slate-700">
          共 <span class="font-medium">{{ pagination.total }}</span> 条记录，
          每页显示
          <select 
            v-model="pagination.pageSize" 
            class="ant-select !w-16 !h-7 !py-0 !px-1 text-xs"
            @change="handleSearch"
          >
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
          条
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="pagination.currentPage--"
            :disabled="pagination.currentPage === 1 || loading"
            class="ant-btn !h-8 !px-3 !text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            上一页
          </button>
          
          <div class="flex items-center space-x-1">
            <template v-for="page in totalPages" :key="page">
              <button
                v-if="page === 1 || page === totalPages || (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)"
                @click="pagination.currentPage = page"
                :class="[
                  'ant-btn !h-8 !w-8 !p-0 !text-xs transition-colors',
                  pagination.currentPage === page 
                    ? 'ant-btn-primary' 
                    : ''
                ]"
              >
                {{ page }}
              </button>
              <span v-else-if="page === 2 && pagination.currentPage > 3" class="text-slate-400 text-xs px-1">...</span>
              <span v-else-if="page === totalPages - 1 && pagination.currentPage < totalPages - 2" class="text-slate-400 text-xs px-1">...</span>
            </template>
          </div>

          <button
            @click="pagination.currentPage++"
            :disabled="pagination.currentPage === totalPages || loading"
            class="ant-btn !h-8 !px-3 !text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- 升级为代理弹窗 -->
    <div v-if="showUpgradeModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-slate-900 mb-5">升级用户为代理</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">用户 UID</label>
            <input
              v-model="upgradeForm.uid"
              type="text"
              placeholder="请输入用户 UID"
              class="ant-input"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">代理等级</label>
            <select
              v-model="upgradeForm.level"
              class="ant-select"
            >
              <option v-for="level in AGENT_LEVEL_OPTIONS" :key="level.value" :value="level.value">
                {{ level.label }} (佣金比例: {{ (level.commissionRate * 100).toFixed(0) }}%)
              </option>
            </select>
          </div>
        </div>
        
        <div class="mt-8 flex justify-end space-x-3">
          <button
            @click="showUpgradeModal = false"
            class="ant-btn"
          >
            取消
          </button>
          <button
            @click="handleUpgrade"
            class="ant-btn ant-btn-primary"
          >
            确认升级
          </button>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <div v-if="showDetailModal && selectedAgent" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
          <h3 class="text-lg font-semibold text-slate-900">代理详情</h3>
          <button @click="showDetailModal = false" class="text-slate-400 hover:text-slate-600 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
          <div class="flex flex-col">
            <span class="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">UID</span>
            <p class="font-mono text-slate-900 font-semibold">{{ selectedAgent.uid }}</p>
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">用户名</span>
            <p class="text-slate-900 font-semibold">{{ selectedAgent.username }}</p>
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">邮箱</span>
            <p class="text-slate-900 font-semibold">{{ selectedAgent.email }}</p>
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">手机</span>
            <p class="text-slate-900 font-semibold">{{ selectedAgent.phone }}</p>
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">代理等级</span>
            <span class="inline-flex w-fit px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-50 text-purple-700 border border-purple-100">
              {{ getLevelConfig(selectedAgent.level) }}
            </span>
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">状态</span>
            <span 
              :class="`inline-flex w-fit px-2.5 py-1 text-xs font-bold rounded-lg bg-${getStatusConfig(selectedAgent.status).color}-50 text-${getStatusConfig(selectedAgent.status).color}-700 border border-${getStatusConfig(selectedAgent.status).color}-100`"
            >
              {{ getStatusConfig(selectedAgent.status).text }}
            </span>
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">总推荐人数</span>
            <p class="text-slate-900 font-bold text-lg">{{ selectedAgent.totalReferrals }}</p>
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">直推人数</span>
            <p class="text-slate-900 font-bold text-lg">{{ selectedAgent.directReferrals }}</p>
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">累计佣金</span>
            <p class="text-emerald-600 font-bold text-lg">${{ selectedAgent.totalCommission.toLocaleString() }}</p>
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">本月佣金</span>
            <p class="text-emerald-600 font-bold text-lg">${{ selectedAgent.monthCommission.toLocaleString() }}</p>
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">成为代理时间</span>
            <p class="text-slate-900 font-medium text-sm">{{ formatDate(selectedAgent.createdAt) }}</p>
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">最后活跃</span>
            <p class="text-slate-900 font-medium text-sm">{{ formatDate(selectedAgent.lastActiveAt) }}</p>
          </div>
        </div>

        <div class="mt-10 pt-6 border-t border-slate-100">
          <button 
            @click="showDetailModal = false"
            class="ant-btn w-full !h-10"
          >
            关闭详情
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义样式 */
</style>
