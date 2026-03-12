<script setup>
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { getVerificationLogs, verificationLogList } from '../../mock/verification'
import { 
  LOG_ACTION_TYPE_OPTIONS,
  VERIFICATION_LEVEL_OPTIONS 
} from '../../constants/verification'

// 日志列表数据
const logList = ref([])
const loading = ref(false)

// 搜索和筛选
const searchKeyword = ref('')
const filterActionType = ref('all')
const filterDateRange = ref('all')

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const totalPages = computed(() => Math.ceil(pagination.total / pagination.pageSize))

// 获取数据
const fetchLogs = async () => {
  loading.value = true
  try {
    const { list, total } = await getVerificationLogs({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      searchKeyword: searchKeyword.value,
      actionType: filterActionType.value,
      dateRange: filterDateRange.value
    })
    logList.value = list
    pagination.total = total
  } catch (error) {
    console.error('获取认证日志失败:', error)
  } finally {
    loading.value = false
  }
}

// 监听筛选和分页变化
watch(
  [searchKeyword, filterActionType, filterDateRange, () => pagination.currentPage],
  (newVal, oldVal) => {
    // 如果是筛选条件变化，重置页码到1
    const isPaginationChange = newVal[3] !== oldVal[3]
    if (!isPaginationChange && pagination.currentPage !== 1) {
      pagination.currentPage = 1
    } else {
      fetchLogs()
    }
  },
  { deep: true }
)

onMounted(fetchLogs)

// 统计信息
const statistics = computed(() => {
  const total = verificationLogList.length
  const today = verificationLogList.filter(log => {
    const logDate = new Date(log.actionTime).toDateString()
    const nowDate = new Date().toDateString()
    return logDate === nowDate
  }).length
  
  const configUpdates = verificationLogList.filter(log => log.actionType === 'config_update').length
  const auditActions = verificationLogList.filter(log => 
    log.actionType === 'audit_approved' || 
    log.actionType === 'audit_rejected' || 
    log.actionType === 'audit_resubmit'
  ).length
  
  return [
    {
      label: '今日日志',
      value: today.toLocaleString(),
      trend: '条记录',
      color: 'blue'
    },
    {
      label: '总日志数',
      value: total.toLocaleString(),
      trend: '所有记录',
      color: 'gray'
    },
    {
      label: '配置变更',
      value: configUpdates.toLocaleString(),
      trend: '次修改',
      color: 'purple'
    },
    {
      label: '审核操作',
      value: auditActions.toLocaleString(),
      trend: '次审核',
      color: 'emerald'
    }
  ]
})

// 操作类型配置
const actionTypeConfig = {
  'config_update': { 
    text: '配置更新', 
    class: 'bg-purple-100 text-purple-700',
    icon: '⚙️'
  },
  'audit_approved': { 
    text: '审核通过', 
    class: 'bg-emerald-100 text-emerald-700',
    icon: '✓'
  },
  'audit_rejected': { 
    text: '审核拒绝', 
    class: 'bg-rose-100 text-rose-700',
    icon: '✗'
  },
  'audit_resubmit': { 
    text: '要求补件', 
    class: 'bg-amber-100 text-amber-700',
    icon: '↩'
  },
  'level_upgrade': { 
    text: '等级升级', 
    class: 'bg-blue-100 text-blue-700',
    icon: '↑'
  },
  'level_downgrade': { 
    text: '等级降级', 
    class: 'bg-orange-100 text-orange-700',
    icon: '↓'
  }
}

// 等级配置
const levelConfig = {
  'none': { text: '未认证', class: 'bg-gray-100 text-gray-700' },
  'basic': { text: '普通认证', class: 'bg-blue-100 text-blue-700' },
  'advanced': { text: '高级认证', class: 'bg-purple-100 text-purple-700' }
}

// 格式化日期
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 查看详情
const showDetailModal = ref(false)
const selectedLog = ref(null)

// Toast提示
const toast = ref({
  visible: false,
  message: ''
})

const viewDetail = (log) => {
  selectedLog.value = log
  showDetailModal.value = true
}

const closeDetail = () => {
  showDetailModal.value = false
  selectedLog.value = null
}

// 导出日志
const exportLogs = () => {
  showToast('导出功能开发中...')
}

// 重置筛选
const resetFilters = () => {
  searchKeyword.value = ''
  filterActionType.value = 'all'
  filterDateRange.value = 'all'
  pagination.currentPage = 1
}

// 显示Toast提示
const showToast = (message) => {
  toast.value.message = message
  toast.value.visible = true
  setTimeout(() => {
    toast.value.visible = false
  }, 3000)
}
</script>

<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">认证日志</h1>
        <p class="mt-1 text-sm text-gray-600">查看所有认证相关的操作记录</p>
      </div>
      <button 
        @click="exportLogs"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <span>导出日志</span>
      </button>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div 
        v-for="stat in statistics" 
        :key="stat.label"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">{{ stat.label }}</p>
            <p :class="`text-2xl font-bold text-${stat.color}-600 mt-2`">{{ stat.value }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ stat.trend }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 搜索 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">搜索</label>
          <input 
            v-model="searchKeyword"
            type="text" 
            placeholder="用户名、操作人..."
            class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
        </div>
        
        <!-- 操作类型 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">操作类型</label>
          <select 
            v-model="filterActionType"
            class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">全部类型</option>
            <option 
              v-for="option in LOG_ACTION_TYPE_OPTIONS" 
              :key="option.value" 
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <!-- 时间范围 -->
        <div class="flex items-end gap-2">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">时间范围</label>
            <select 
              v-model="filterDateRange"
              class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">全部时间</option>
              <option value="today">今天</option>
              <option value="week">最近一周</option>
              <option value="month">最近一月</option>
            </select>
          </div>
          <button
            @click="resetFilters"
            title="重置筛选"
            class="p-2 text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 日志列表 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative min-h-[400px]">
      <!-- 加载遮罩 -->
      <div v-if="loading" class="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
        <div class="flex flex-col items-center">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-sm text-gray-500 font-medium">加载中...</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作类型</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">等级变更</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作人</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">描述</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="log in logList" :key="log.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(log.actionTime) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="actionTypeConfig[log.actionType].class" class="px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center">
                  <span class="mr-1">{{ actionTypeConfig[log.actionType].icon }}</span>
                  {{ actionTypeConfig[log.actionType].text }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ log.username }}</div>
                <div class="text-xs text-gray-400">{{ log.userId }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div v-if="log.beforeLevel && log.afterLevel" class="flex items-center space-x-2">
                  <span :class="levelConfig[log.beforeLevel].class" class="px-2 py-1 text-xs font-semibold rounded-full">
                    {{ levelConfig[log.beforeLevel].text }}
                  </span>
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                  <span :class="levelConfig[log.afterLevel].class" class="px-2 py-1 text-xs font-semibold rounded-full">
                    {{ levelConfig[log.afterLevel].text }}
                  </span>
                </div>
                <span v-else class="text-sm text-gray-400">-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ log.operator }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ log.description }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button 
                  @click="viewDetail(log)"
                  class="text-blue-600 hover:text-blue-900"
                >
                  详情
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!loading && logList.length === 0" class="text-center py-12">
        <p class="text-gray-500">暂无日志记录</p>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="border-t border-gray-200 px-6 py-3 flex items-center justify-between">
        <div class="text-sm text-gray-600">
          共 <span class="font-medium">{{ pagination.total }}</span> 条记录，第 <span class="font-medium">{{ pagination.currentPage }}</span> / <span class="font-medium">{{ totalPages }}</span> 页
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="pagination.currentPage--"
            :disabled="pagination.currentPage === 1 || loading"
            class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            上一页
          </button>
          <button
            @click="pagination.currentPage++"
            :disabled="pagination.currentPage === totalPages || loading"
            class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- 详情模态框 -->
    <div v-if="showDetailModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">日志详情</h3>
          <button @click="closeDetail" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div v-if="selectedLog" class="p-6 space-y-4">
          <!-- 基本信息 -->
          <div class="bg-gray-50 rounded-lg p-4 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">操作时间</span>
              <span class="text-sm font-medium text-gray-900">{{ formatDate(selectedLog.actionTime) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">操作类型</span>
              <span :class="actionTypeConfig[selectedLog.actionType].class" class="px-2 py-1 text-xs font-semibold rounded-full">
                {{ actionTypeConfig[selectedLog.actionType].text }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">操作人</span>
              <span class="text-sm font-medium text-gray-900">{{ selectedLog.operator }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">IP地址</span>
              <span class="text-sm font-medium text-gray-900">{{ selectedLog.ipAddress }}</span>
            </div>
          </div>

          <!-- 用户信息 -->
          <div class="bg-gray-50 rounded-lg p-4 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">用户名</span>
              <span class="text-sm font-medium text-gray-900">{{ selectedLog.username }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">用户ID</span>
              <span class="text-sm font-medium text-gray-900">{{ selectedLog.userId }}</span>
            </div>
          </div>

          <!-- 等级变更 -->
          <div v-if="selectedLog.beforeLevel && selectedLog.afterLevel" class="bg-gray-50 rounded-lg p-4">
            <div class="text-sm text-gray-600 mb-3">等级变更</div>
            <div class="flex items-center justify-center space-x-4">
              <div class="text-center">
                <div class="text-xs text-gray-500 mb-2">变更前</div>
                <span :class="levelConfig[selectedLog.beforeLevel].class" class="px-3 py-2 text-sm font-semibold rounded-lg">
                  {{ levelConfig[selectedLog.beforeLevel].text }}
                </span>
              </div>
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
              <div class="text-center">
                <div class="text-xs text-gray-500 mb-2">变更后</div>
                <span :class="levelConfig[selectedLog.afterLevel].class" class="px-3 py-2 text-sm font-semibold rounded-lg">
                  {{ levelConfig[selectedLog.afterLevel].text }}
                </span>
              </div>
            </div>
          </div>

          <!-- 描述 -->
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="text-sm text-gray-600 mb-2">操作描述</div>
            <div class="text-sm text-gray-900">{{ selectedLog.description }}</div>
          </div>

          <!-- 详细信息 -->
          <div v-if="selectedLog.details && Object.keys(selectedLog.details).length > 0" class="bg-gray-50 rounded-lg p-4">
            <div class="text-sm text-gray-600 mb-3">详细信息</div>
            <div class="space-y-2">
              <!-- 配置变更详情 -->
              <div v-if="selectedLog.details.changes" class="space-y-2">
                <div 
                  v-for="(change, index) in selectedLog.details.changes" 
                  :key="index"
                  class="bg-white rounded p-3 border border-gray-200"
                >
                  <div class="text-xs font-medium text-gray-700 mb-2">{{ change.field }}</div>
                  <div class="flex items-center space-x-2 text-xs">
                    <span class="text-gray-500">{{ change.before }}</span>
                    <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                    <span class="text-gray-900 font-medium">{{ change.after }}</span>
                  </div>
                </div>
              </div>

              <!-- 其他详情 -->
              <div v-else class="text-sm text-gray-700">
                <pre class="whitespace-pre-wrap">{{ JSON.stringify(selectedLog.details, null, 2) }}</pre>
              </div>
            </div>
          </div>

          <div class="pt-4">
            <button 
              @click="closeDetail"
              class="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 成功提示 Toast -->
    <div 
      v-if="toast.visible"
      class="fixed top-4 right-4 z-50 bg-white border border-blue-200 rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 animate-slide-in"
    >
      <div class="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
        <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <span class="text-sm font-medium text-slate-900">{{ toast.message }}</span>
    </div>
  </div>
</template>

<style scoped>
/* 自定义样式 */
</style>
