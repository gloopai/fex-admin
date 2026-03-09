<script setup>
import { ref, computed } from 'vue'
import { verificationAuditList } from '../../mock/verification'
import { 
  VERIFICATION_LEVEL_OPTIONS, 
  VERIFICATION_STATUS, 
  VERIFICATION_STATUS_OPTIONS,
  VERIFICATION_DOC_TYPE_OPTIONS 
} from '../../constants/verification'

// 审核列表数据
const auditList = ref([...verificationAuditList])

// 搜索和筛选
const searchKeyword = ref('')
const filterLevel = ref('all')
const filterStatus = ref('all')

// 模态框
const showDetailModal = ref(false)
const selectedAudit = ref(null)
const auditAction = ref(null) // 'approve', 'reject', 'resubmit'
const auditNote = ref('')

// Toast提示
const toast = ref({
  visible: false,
  message: ''
})

// 过滤后的列表
const filteredAuditList = computed(() => {
  let list = [...auditList.value]
  
  // 搜索关键词
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    list = list.filter(audit => 
      audit.username.toLowerCase().includes(keyword) ||
      audit.email.toLowerCase().includes(keyword) ||
      audit.userId.toLowerCase().includes(keyword) ||
      audit.basicInfo.realName.includes(keyword)
    )
  }
  
  // 筛选认证等级
  if (filterLevel.value !== 'all') {
    list = list.filter(audit => audit.applyLevel === filterLevel.value)
  }
  
  // 筛选审核状态
  if (filterStatus.value !== 'all') {
    list = list.filter(audit => audit.status === filterStatus.value)
  }
  
  return list
})

// 统计信息
const statistics = computed(() => {
  const total = auditList.value.length
  const pending = auditList.value.filter(a => a.status === VERIFICATION_STATUS.PENDING).length
  const approved = auditList.value.filter(a => a.status === VERIFICATION_STATUS.APPROVED).length
  const rejected = auditList.value.filter(a => a.status === VERIFICATION_STATUS.REJECTED).length
  
  return [
    {
      label: '待审核',
      value: pending.toLocaleString(),
      trend: '需处理',
      color: 'blue'
    },
    {
      label: '已通过',
      value: approved.toLocaleString(),
      trend: `${((approved / total) * 100).toFixed(1)}% 通过率`,
      color: 'emerald'
    },
    {
      label: '已拒绝',
      value: rejected.toLocaleString(),
      trend: `${((rejected / total) * 100).toFixed(1)}% 拒绝率`,
      color: 'rose'
    },
    {
      label: '总申请',
      value: total.toLocaleString(),
      trend: '本月',
      color: 'gray'
    }
  ]
})

// 状态配置
const statusConfig = {
  [VERIFICATION_STATUS.PENDING]: { text: '待审核', class: 'bg-blue-100 text-blue-700' },
  [VERIFICATION_STATUS.APPROVED]: { text: '已通过', class: 'bg-emerald-100 text-emerald-700' },
  [VERIFICATION_STATUS.REJECTED]: { text: '已拒绝', class: 'bg-rose-100 text-rose-700' },
  [VERIFICATION_STATUS.RESUBMIT]: { text: '需补件', class: 'bg-amber-100 text-amber-700' }
}

// 等级配置
const levelConfig = {
  'none': { text: '未认证', class: 'bg-gray-100 text-gray-700' },
  'basic': { text: '普通认证', class: 'bg-blue-100 text-blue-700' },
  'advanced': { text: '高级认证', class: 'bg-purple-100 text-purple-700' }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取证件类型标签
const getDocTypeLabel = (docType) => {
  const option = VERIFICATION_DOC_TYPE_OPTIONS.find(opt => opt.value === docType)
  return option ? option.label : docType
}

// 查看详情
const viewDetail = (audit) => {
  selectedAudit.value = audit
  showDetailModal.value = true
  auditAction.value = null
  auditNote.value = ''
}

// 关闭详情
const closeDetail = () => {
  showDetailModal.value = false
  selectedAudit.value = null
  auditAction.value = null
  auditNote.value = ''
}

// 开始审核操作
const startAuditAction = (action) => {
  auditAction.value = action
}

// 提交审核
const submitAudit = () => {
  if (!selectedAudit.value || !auditAction.value) return
  
  const auditIndex = auditList.value.findIndex(a => a.id === selectedAudit.value.id)
  if (auditIndex === -1) return
  
  const now = new Date().toISOString()
  const audit = auditList.value[auditIndex]
  
  switch (auditAction.value) {
    case 'approve':
      audit.status = VERIFICATION_STATUS.APPROVED
      audit.auditTime = now
      audit.auditor = 'admin_current'
      closeDetail()
      showToast('审核通过！')
      break
    case 'reject':
      audit.status = VERIFICATION_STATUS.REJECTED
      audit.auditTime = now
      audit.auditor = 'admin_current'
      audit.rejectReason = auditNote.value || '不符合认证要求'
      closeDetail()
      showToast('已拒绝申请！')
      break
    case 'resubmit':
      audit.status = VERIFICATION_STATUS.RESUBMIT
      audit.auditTime = now
      audit.auditor = 'admin_current'
      audit.rejectReason = auditNote.value || '需要补充材料'
      closeDetail()
      showToast('已要求用户补充材料！')
      break
  }
}

// 预览文档
const previewDocument = (doc) => {
  alert(`预览文档: ${getDocTypeLabel(doc.type)}\n\n实际系统中会在这里显示图片/PDF预览`)
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
    <div>
      <h1 class="text-2xl font-bold text-gray-900">认证审核</h1>
      <p class="mt-1 text-sm text-gray-600">审核用户的身份认证申请</p>
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
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">搜索</label>
          <input 
            v-model="searchKeyword"
            type="text" 
            placeholder="用户名、邮箱、姓名..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">认证等级</label>
          <select 
            v-model="filterLevel"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">全部等级</option>
            <option 
              v-for="option in VERIFICATION_LEVEL_OPTIONS" 
              :key="option.value" 
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">审核状态</label>
          <select 
            v-model="filterStatus"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">全部状态</option>
            <option 
              v-for="option in VERIFICATION_STATUS_OPTIONS" 
              :key="option.value" 
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- 审核列表 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户信息</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">认证等级</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">提交时间</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">审核时间</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="audit in filteredAuditList" :key="audit.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col">
                  <div class="text-sm font-medium text-gray-900">{{ audit.username }}</div>
                  <div class="text-sm text-gray-500">{{ audit.basicInfo.realName }}</div>
                  <div class="text-xs text-gray-400">{{ audit.email }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col space-y-1">
                  <span :class="levelConfig[audit.currentLevel].class" class="inline-flex text-xs px-2 py-1 rounded-full font-semibold">
                    {{ levelConfig[audit.currentLevel].text }}
                  </span>
                  <div class="flex items-center text-xs text-gray-400">
                    <span>↓ 申请</span>
                  </div>
                  <span :class="levelConfig[audit.applyLevel].class" class="inline-flex text-xs px-2 py-1 rounded-full font-semibold">
                    {{ levelConfig[audit.applyLevel].text }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="statusConfig[audit.status].class" class="px-2 py-1 text-xs font-semibold rounded-full">
                  {{ statusConfig[audit.status].text }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(audit.submitTime) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(audit.auditTime) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button 
                  @click="viewDetail(audit)"
                  class="text-blue-600 hover:text-blue-900"
                >
                  查看详情
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="filteredAuditList.length === 0" class="text-center py-12">
        <p class="text-gray-500">暂无审核记录</p>
      </div>
    </div>

    <!-- 详情模态框 -->
    <div v-if="showDetailModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">认证申请详情</h3>
          <button @click="closeDetail" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div v-if="selectedAudit" class="p-6 space-y-6">
          <!-- 基本信息 -->
          <div>
            <h4 class="text-sm font-semibold text-gray-900 mb-3">基本信息</h4>
            <div class="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
              <div>
                <span class="text-sm text-gray-600">用户名：</span>
                <span class="text-sm font-medium text-gray-900">{{ selectedAudit.username }}</span>
              </div>
              <div>
                <span class="text-sm text-gray-600">邮箱：</span>
                <span class="text-sm font-medium text-gray-900">{{ selectedAudit.email }}</span>
              </div>
              <div>
                <span class="text-sm text-gray-600">当前等级：</span>
                <span :class="levelConfig[selectedAudit.currentLevel].class" class="text-xs px-2 py-1 rounded-full font-semibold ml-2">
                  {{ levelConfig[selectedAudit.currentLevel].text }}
                </span>
              </div>
              <div>
                <span class="text-sm text-gray-600">申请等级：</span>
                <span :class="levelConfig[selectedAudit.applyLevel].class" class="text-xs px-2 py-1 rounded-full font-semibold ml-2">
                  {{ levelConfig[selectedAudit.applyLevel].text }}
                </span>
              </div>
              <div>
                <span class="text-sm text-gray-600">提交时间：</span>
                <span class="text-sm font-medium text-gray-900">{{ formatDate(selectedAudit.submitTime) }}</span>
              </div>
              <div>
                <span class="text-sm text-gray-600">审核状态：</span>
                <span :class="statusConfig[selectedAudit.status].class" class="text-xs px-2 py-1 rounded-full font-semibold ml-2">
                  {{ statusConfig[selectedAudit.status].text }}
                </span>
              </div>
            </div>
          </div>

          <!-- 身份信息 -->
          <div>
            <h4 class="text-sm font-semibold text-gray-900 mb-3">身份信息</h4>
            <div class="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
              <div>
                <span class="text-sm text-gray-600">真实姓名：</span>
                <span class="text-sm font-medium text-gray-900">{{ selectedAudit.basicInfo.realName }}</span>
              </div>
              <div>
                <span class="text-sm text-gray-600">身份证号：</span>
                <span class="text-sm font-medium text-gray-900">{{ selectedAudit.basicInfo.idNumber }}</span>
              </div>
              <div>
                <span class="text-sm text-gray-600">国籍：</span>
                <span class="text-sm font-medium text-gray-900">{{ selectedAudit.basicInfo.nationality }}</span>
              </div>
              <div>
                <span class="text-sm text-gray-600">职业：</span>
                <span class="text-sm font-medium text-gray-900">{{ selectedAudit.basicInfo.occupation }}</span>
              </div>
              <div class="col-span-2">
                <span class="text-sm text-gray-600">地址：</span>
                <span class="text-sm font-medium text-gray-900">{{ selectedAudit.basicInfo.address }}</span>
              </div>
            </div>
          </div>

          <!-- 上传文档 -->
          <div>
            <h4 class="text-sm font-semibold text-gray-900 mb-3">上传文档</h4>
            <div class="space-y-3">
              <div 
                v-for="doc in selectedAudit.documents" 
                :key="doc.type"
                class="flex items-center justify-between bg-gray-50 rounded-lg p-4"
              >
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ getDocTypeLabel(doc.type) }}</div>
                    <div class="text-xs text-gray-500">上传时间：{{ formatDate(doc.uploadTime) }}</div>
                  </div>
                </div>
                <button 
                  @click="previewDocument(doc)"
                  class="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-600 rounded-lg hover:bg-blue-50"
                >
                  预览
                </button>
              </div>
            </div>
          </div>

          <!-- 审核记录 -->
          <div v-if="selectedAudit.auditTime">
            <h4 class="text-sm font-semibold text-gray-900 mb-3">审核记录</h4>
            <div class="bg-gray-50 rounded-lg p-4 space-y-2">
              <div>
                <span class="text-sm text-gray-600">审核人：</span>
                <span class="text-sm font-medium text-gray-900">{{ selectedAudit.auditor }}</span>
              </div>
              <div>
                <span class="text-sm text-gray-600">审核时间：</span>
                <span class="text-sm font-medium text-gray-900">{{ formatDate(selectedAudit.auditTime) }}</span>
              </div>
              <div v-if="selectedAudit.rejectReason">
                <span class="text-sm text-gray-600">原因：</span>
                <span class="text-sm font-medium text-gray-900">{{ selectedAudit.rejectReason }}</span>
              </div>
            </div>
          </div>

          <!-- 审核操作 -->
          <div v-if="selectedAudit.status === VERIFICATION_STATUS.PENDING" class="border-t pt-6">
            <h4 class="text-sm font-semibold text-gray-900 mb-3">审核操作</h4>
            
            <div v-if="!auditAction" class="flex space-x-3">
              <button 
                @click="startAuditAction('approve')"
                class="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                通过
              </button>
              <button 
                @click="startAuditAction('resubmit')"
                class="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                要求补件
              </button>
              <button 
                @click="startAuditAction('reject')"
                class="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
              >
                拒绝
              </button>
            </div>

            <div v-else class="space-y-3">
              <div v-if="auditAction === 'approve'" class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p class="text-sm font-medium text-emerald-900 mb-2">确认通过该认证申请？</p>
                <p class="text-xs text-emerald-700">用户的认证等级将升级为 {{ levelConfig[selectedAudit.applyLevel].text }}</p>
              </div>

              <div v-else-if="auditAction === 'resubmit'" class="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p class="text-sm font-medium text-amber-900 mb-2">要求用户补充材料</p>
                <textarea 
                  v-model="auditNote"
                  placeholder="请说明需要补充的材料..."
                  rows="3"
                  class="w-full mt-2 px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                ></textarea>
              </div>

              <div v-else-if="auditAction === 'reject'" class="bg-rose-50 border border-rose-200 rounded-lg p-4">
                <p class="text-sm font-medium text-rose-900 mb-2">确认拒绝该认证申请？</p>
                <textarea 
                  v-model="auditNote"
                  placeholder="请说明拒绝原因..."
                  rows="3"
                  class="w-full mt-2 px-3 py-2 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                ></textarea>
              </div>

              <div class="flex space-x-2">
                <button 
                  @click="submitAudit"
                  class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  确认提交
                </button>
                <button 
                  @click="auditAction = null"
                  class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 成功提示 Toast -->
    <div 
      v-if="toast.visible"
      class="fixed top-4 right-4 z-50 bg-white border border-emerald-200 rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 animate-slide-in"
    >
      <div class="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
        <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <span class="text-sm font-medium text-slate-900">{{ toast.message }}</span>
    </div>
  </div>
</template>

<style scoped>
/* 自定义样式 */
</style>
