<script setup>
import { ref, computed } from 'vue'
import { mockAgentApplications, agentApi } from '../../mock/agent'
import { AGENT_APPLICATION_STATUS, AGENT_APPLICATION_STATUS_OPTIONS, AGENT_LEVEL, AGENT_LEVEL_OPTIONS } from '../../constants/agent'

// 搜索和筛选
const searchKeyword = ref('')
const statusFilter = ref('all')

// 申请列表
const applicationList = ref(mockAgentApplications)

// 审核弹窗
const showReviewModal = ref(false)
const selectedApplication = ref(null)
const reviewForm = ref({
  action: 'approve',
  level: AGENT_LEVEL.LEVEL_1,
  note: ''
})

// 过滤后的列表
const filteredApplications = computed(() => {
  let list = [...applicationList.value]
  
  // 搜索关键词
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    list = list.filter(app => 
      app.username.toLowerCase().includes(keyword) ||
      app.email.toLowerCase().includes(keyword) ||
      app.uid.toString().includes(keyword)
    )
  }
  
  // 状态筛选
  if (statusFilter.value !== 'all') {
    list = list.filter(app => app.status === statusFilter.value)
  }
  
  return list
})

// 统计数据
const stats = computed(() => {
  const total = applicationList.value.length
  const pending = applicationList.value.filter(a => a.status === AGENT_APPLICATION_STATUS.PENDING).length
  const approved = applicationList.value.filter(a => a.status === AGENT_APPLICATION_STATUS.APPROVED).length
  const rejected = applicationList.value.filter(a => a.status === AGENT_APPLICATION_STATUS.REJECTED).length
  
  return [
    { label: '全部申请', value: total, color: 'blue' },
    { label: '待审核', value: pending, color: 'yellow' },
    { label: '已通过', value: approved, color: 'green' },
    { label: '已拒绝', value: rejected, color: 'red' }
  ]
})

// 获取状态配置
const getStatusConfig = (status) => {
  const config = AGENT_APPLICATION_STATUS_OPTIONS.find(s => s.value === status)
  return {
    text: config?.label || status,
    color: config?.color || 'gray'
  }
}

// 获取等级名称
const getLevelLabel = (level) => {
  return AGENT_LEVEL_OPTIONS.find(l => l.value === level)?.label || level
}

// 打开审核弹窗
const openReviewModal = (application, action) => {
  selectedApplication.value = application
  reviewForm.value = {
    action: action,
    level: AGENT_LEVEL.LEVEL_1,
    note: ''
  }
  showReviewModal.value = true
}

// 提交审核
const handleReview = async () => {
  if (!reviewForm.value.note.trim() && reviewForm.value.action === 'reject') {
    alert('拒绝申请时必须填写拒绝原因')
    return
  }
  
  try {
    const result = await agentApi.reviewApplication(
      selectedApplication.value.id,
      reviewForm.value.action,
      reviewForm.value.note
    )
    
    if (result.success) {
      // 更新本地数据
      const app = applicationList.value.find(a => a.id === selectedApplication.value.id)
      if (app) {
        app.status = reviewForm.value.action === 'approve' 
          ? AGENT_APPLICATION_STATUS.APPROVED 
          : AGENT_APPLICATION_STATUS.REJECTED
        app.reviewedAt = new Date().toISOString()
        app.reviewNote = reviewForm.value.note
      }
      
      alert(result.message)
      showReviewModal.value = false
      selectedApplication.value = null
    }
  } catch (error) {
    alert('操作失败：' + error.message)
  }
}

// 快速通过
const quickApprove = async (application) => {
  if (!confirm(`确认通过用户 ${application.username} 的代理申请？`)) {
    return
  }
  
  try {
    const result = await agentApi.reviewApplication(application.id, 'approve', '申请审核通过')
    if (result.success) {
      const app = applicationList.value.find(a => a.id === application.id)
      if (app) {
        app.status = AGENT_APPLICATION_STATUS.APPROVED
        app.reviewedAt = new Date().toISOString()
      }
      alert(result.message)
    }
  } catch (error) {
    alert('操作失败：' + error.message)
  }
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
    <div>
      <h1 class="text-2xl font-bold text-gray-900">代理申请审核</h1>
      <p class="mt-1 text-sm text-gray-500">审核用户的代理申请，管理申请流程</p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-white rounded-lg shadow p-6"
      >
        <p class="text-sm text-gray-600">{{ stat.label }}</p>
        <p class="mt-2 text-3xl font-bold" :class="`text-${stat.color}-600`">{{ stat.value }}</p>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="bg-white rounded-lg shadow p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <option v-for="status in AGENT_APPLICATION_STATUS_OPTIONS" :key="status.value" :value="status.value">
            {{ status.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- 申请列表 -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户信息</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申请理由</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申请时间</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">审核信息</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="app in filteredApplications" :key="app.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ app.uid }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ app.username }}</div>
                <div class="text-sm text-gray-500">{{ app.email }}</div>
                <div class="text-xs text-gray-400">{{ app.phone }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900 max-w-xs truncate" :title="app.reason">
                  {{ app.reason }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="`px-2 py-1 text-xs font-semibold rounded-full bg-${getStatusConfig(app.status).color}-100 text-${getStatusConfig(app.status).color}-800`"
                >
                  {{ getStatusConfig(app.status).text }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(app.appliedAt) }}
              </td>
              <td class="px-6 py-4">
                <div v-if="app.reviewedAt" class="text-sm">
                  <div class="text-gray-500">{{ formatDate(app.reviewedAt) }}</div>
                  <div v-if="app.reviewNote" class="text-xs text-gray-400 mt-1">{{ app.reviewNote }}</div>
                </div>
                <span v-else class="text-sm text-gray-400">-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div v-if="app.status === AGENT_APPLICATION_STATUS.PENDING" class="space-x-2">
                  <button
                    @click="quickApprove(app)"
                    class="text-green-600 hover:text-green-900"
                  >
                    通过
                  </button>
                  <button
                    @click="openReviewModal(app, 'reject')"
                    class="text-red-600 hover:text-red-900"
                  >
                    拒绝
                  </button>
                </div>
                <span v-else class="text-gray-400">已处理</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 空状态 -->
      <div v-if="filteredApplications.length === 0" class="text-center py-12">
        <p class="text-gray-500">暂无申请记录</p>
      </div>
    </div>

    <!-- 审核弹窗 -->
    <div v-if="showReviewModal && selectedApplication" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">
          {{ reviewForm.action === 'approve' ? '通过' : '拒绝' }}申请
        </h3>
        
        <div class="mb-4 p-4 bg-gray-50 rounded-lg">
          <div class="text-sm space-y-2">
            <div><span class="text-gray-500">UID:</span> <span class="font-medium">{{ selectedApplication.uid }}</span></div>
            <div><span class="text-gray-500">用户名:</span> <span class="font-medium">{{ selectedApplication.username }}</span></div>
            <div><span class="text-gray-500">申请理由:</span></div>
            <div class="text-gray-700 bg-white p-2 rounded">{{ selectedApplication.reason }}</div>
          </div>
        </div>
        
        <div class="space-y-4">
          <div v-if="reviewForm.action === 'approve'">
            <label class="block text-sm font-medium text-gray-700 mb-2">代理等级</label>
            <select
              v-model="reviewForm.level"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option v-for="level in AGENT_LEVEL_OPTIONS" :key="level.value" :value="level.value">
                {{ level.label }} (佣金比例: {{ (level.commissionRate * 100).toFixed(0) }}%)
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ reviewForm.action === 'approve' ? '审核备注' : '拒绝原因' }}
              <span v-if="reviewForm.action === 'reject'" class="text-red-500">*</span>
            </label>
            <textarea
              v-model="reviewForm.note"
              rows="3"
              :placeholder="reviewForm.action === 'approve' ? '选填，可留空' : '必填，请说明拒绝原因'"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>
        </div>
        
        <div class="mt-6 flex justify-end space-x-3">
          <button
            @click="showReviewModal = false"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            @click="handleReview"
            :class="reviewForm.action === 'approve' 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-red-600 hover:bg-red-700'"
            class="px-4 py-2 text-white rounded-lg"
          >
            确认{{ reviewForm.action === 'approve' ? '通过' : '拒绝' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义样式 */
</style>
