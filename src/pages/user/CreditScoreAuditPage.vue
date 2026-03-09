<script setup>
import { ref, computed } from 'vue'
import { creditScoreAuditList } from '../../mock/creditScore'
import { 
  CREDIT_SCORE_CHANGE_TYPE,
  CREDIT_SCORE_CHANGE_TYPE_OPTIONS,
  CREDIT_SCORE_AUDIT_STATUS,
  CREDIT_SCORE_AUDIT_STATUS_OPTIONS
} from '../../constants/creditScore'

// 审核列表数据
const auditList = ref([...creditScoreAuditList])

// 搜索和筛选
const searchKeyword = ref('')
const filterChangeType = ref('all')
const filterStatus = ref('all')

// 模态框
const showDetailModal = ref(false)
const selectedAudit = ref(null)
const auditAction = ref(null) // 'approve', 'reject'
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
      audit.reason.toLowerCase().includes(keyword) ||
      audit.applyOperatorName.toLowerCase().includes(keyword)
    )
  }
  
  // 筛选变动类型
  if (filterChangeType.value !== 'all') {
    list = list.filter(audit => audit.changeType === filterChangeType.value)
  }
  
  // 筛选审核状态
  if (filterStatus.value !== 'all') {
    list = list.filter(audit => audit.auditStatus === filterStatus.value)
  }
  
  return list.sort((a, b) => new Date(b.applyTime) - new Date(a.applyTime))
})

// 统计信息
const statistics = computed(() => {
  const total = auditList.value.length
  const pending = auditList.value.filter(a => a.auditStatus === CREDIT_SCORE_AUDIT_STATUS.PENDING).length
  const approved = auditList.value.filter(a => a.auditStatus === CREDIT_SCORE_AUDIT_STATUS.APPROVED).length
  const rejected = auditList.value.filter(a => a.auditStatus === CREDIT_SCORE_AUDIT_STATUS.REJECTED).length
  
  return [
    {
      label: '待审核',
      value: pending.toLocaleString(),
      trend: '需处理',
      color: 'amber'
    },
    {
      label: '已通过',
      value: approved.toLocaleString(),
      trend: `${total > 0 ? ((approved / total) * 100).toFixed(1) : 0}% 通过率`,
      color: 'emerald'
    },
    {
      label: '已拒绝',
      value: rejected.toLocaleString(),
      trend: `${total > 0 ? ((rejected / total) * 100).toFixed(1) : 0}% 拒绝率`,
      color: 'rose'
    },
    {
      label: '总申请',
      value: total.toLocaleString(),
      trend: '本月',
      color: 'blue'
    }
  ]
})

// 状态配置
const statusConfig = {
  [CREDIT_SCORE_AUDIT_STATUS.PENDING]: { text: '待审核', class: 'bg-amber-100 text-amber-700' },
  [CREDIT_SCORE_AUDIT_STATUS.APPROVED]: { text: '已通过', class: 'bg-emerald-100 text-emerald-700' },
  [CREDIT_SCORE_AUDIT_STATUS.REJECTED]: { text: '已拒绝', class: 'bg-rose-100 text-rose-700' },
  [CREDIT_SCORE_AUDIT_STATUS.AUTO_APPROVED]: { text: '自动通过', class: 'bg-blue-100 text-blue-700' }
}

// 变动类型配置
const changeTypeConfig = {
  [CREDIT_SCORE_CHANGE_TYPE.RECHARGE]: { text: '充值', class: 'bg-blue-100 text-blue-700' },
  [CREDIT_SCORE_CHANGE_TYPE.PRIMARY_KYC]: { text: '初级认证', class: 'bg-emerald-100 text-emerald-700' },
  [CREDIT_SCORE_CHANGE_TYPE.ADVANCED_KYC]: { text: '高级认证', class: 'bg-purple-100 text-purple-700' },
  [CREDIT_SCORE_CHANGE_TYPE.MANUAL_ADJUST]: { text: '手动调整', class: 'bg-amber-100 text-amber-700' },
  [CREDIT_SCORE_CHANGE_TYPE.AUTO_UPGRADE]: { text: '自动升级', class: 'bg-indigo-100 text-indigo-700' },
  [CREDIT_SCORE_CHANGE_TYPE.PENALTY]: { text: '惩罚', class: 'bg-rose-100 text-rose-700' },
  [CREDIT_SCORE_CHANGE_TYPE.REWARD]: { text: '奖励', class: 'bg-teal-100 text-teal-700' }
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
      audit.auditStatus = CREDIT_SCORE_AUDIT_STATUS.APPROVED
      audit.auditTime = now
      audit.auditorId = 'admin_current'
      audit.auditorName = '当前管理员'
      audit.auditNote = auditNote.value || null
      closeDetail()
      showToast('审核通过，积分变动已生效！')
      break
    case 'reject':
      audit.auditStatus = CREDIT_SCORE_AUDIT_STATUS.REJECTED
      audit.auditTime = now
      audit.auditorId = 'admin_current'
      audit.auditorName = '当前管理员'
      audit.auditNote = auditNote.value || '审核未通过'
      closeDetail()
      showToast('已拒绝申请，积分变动不生效！')
      break
  }
}

// 显示Toast提示
const showToast = (message) => {
  toast.value.message = message
  toast.value.visible = true
  setTimeout(() => {
    toast.value.visible = false
  }, 3000)
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
        <h1 class="text-2xl font-bold text-slate-900">积分变动审核</h1>
        <p class="text-sm text-slate-500 mt-1">审核用户信用分变动申请</p>
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
        :class="`bg-white rounded-xl border border-${stat.color}-200 p-4`"
      >
        <p class="text-sm text-slate-600 mb-1">{{ stat.label }}</p>
        <p :class="`text-2xl font-bold text-${stat.color}-600 mb-1`">{{ stat.value }}</p>
        <p class="text-xs text-slate-500">{{ stat.trend }}</p>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="bg-white rounded-xl border border-slate-200 p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- 搜索框 -->
        <div class="md:col-span-2">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索用户名、邮箱、原因..."
            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <!-- 变动类型筛选 -->
        <div>
          <select
            v-model="filterChangeType"
            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        
        <!-- 状态筛选 -->
        <div>
          <select
            v-model="filterStatus"
            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部状态</option>
            <option
              v-for="option in CREDIT_SCORE_AUDIT_STATUS_OPTIONS"
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
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">用户信息</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">变动类型</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">积分变动</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">申请人</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">申请时间</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">状态</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="audit in filteredAuditList"
              :key="audit.id"
              class="hover:bg-slate-50 transition-colors"
            >
              <td class="px-6 py-4">
                <div>
                  <p class="text-sm font-medium text-slate-900">{{ audit.username }}</p>
                  <p class="text-xs text-slate-500">{{ audit.email }}</p>
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="changeTypeConfig[audit.changeType].class"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                >
                  {{ changeTypeConfig[audit.changeType].text }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm">
                  <span class="text-slate-600">{{ audit.beforeScore }}</span>
                  <svg class="inline-block h-4 w-4 mx-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span class="text-slate-900 font-semibold">{{ audit.afterScore }}</span>
                  <span 
                    :class="audit.changeAmount > 0 ? 'text-emerald-600' : 'text-rose-600'"
                    class="ml-2 font-semibold"
                  >
                    {{ audit.changeAmount > 0 ? '+' : '' }}{{ audit.changeAmount }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4">
                <p class="text-sm text-slate-700">{{ audit.applyOperatorName }}</p>
              </td>
              <td class="px-6 py-4">
                <p class="text-sm text-slate-700">{{ formatDate(audit.applyTime) }}</p>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="statusConfig[audit.auditStatus].class"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                >
                  {{ statusConfig[audit.auditStatus].text }}
                </span>
              </td>
              <td class="px-6 py-4">
                <button
                  @click="viewDetail(audit)"
                  class="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {{ audit.auditStatus === CREDIT_SCORE_AUDIT_STATUS.PENDING ? '审核' : '查看' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 空状态 -->
      <div
        v-if="filteredAuditList.length === 0"
        class="text-center py-12"
      >
        <svg class="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-slate-900">没有找到记录</h3>
        <p class="mt-1 text-sm text-slate-500">尝试调整筛选条件</p>
      </div>
    </div>

    <!-- 详情模态框 -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showDetailModal"
        class="fixed inset-0 bg-slate-900 bg-opacity-50 z-50 flex items-center justify-center p-4"
        @click.self="closeDetail"
      >
        <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <!-- 模态框头部 -->
          <div class="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
            <h3 class="text-lg font-semibold text-slate-900">积分变动详情</h3>
            <button
              @click="closeDetail"
              class="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- 模态框内容 -->
          <div v-if="selectedAudit" class="p-6 space-y-6">
            <!-- 用户信息 -->
            <div>
              <h4 class="text-sm font-semibold text-slate-900 mb-3">用户信息</h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-slate-600">用户名：</span>
                  <span class="text-slate-900 font-medium">{{ selectedAudit.username }}</span>
                </div>
                <div>
                  <span class="text-slate-600">邮箱：</span>
                  <span class="text-slate-900 font-medium">{{ selectedAudit.email }}</span>
                </div>
                <div>
                  <span class="text-slate-600">用户ID：</span>
                  <span class="text-slate-500 font-mono text-xs">{{ selectedAudit.userId }}</span>
                </div>
              </div>
            </div>

            <!-- 变动信息 -->
            <div class="border-t border-slate-200 pt-6">
              <h4 class="text-sm font-semibold text-slate-900 mb-3">变动信息</h4>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-slate-600">变动类型</span>
                  <span
                    :class="changeTypeConfig[selectedAudit.changeType].class"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  >
                    {{ changeTypeConfig[selectedAudit.changeType].text }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-slate-600">变动前</span>
                  <span class="text-lg font-semibold text-slate-900">{{ selectedAudit.beforeScore }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-slate-600">变动后</span>
                  <span class="text-lg font-semibold text-slate-900">{{ selectedAudit.afterScore }}</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span class="text-sm font-medium text-slate-700">变动数值</span>
                  <span 
                    :class="selectedAudit.changeAmount > 0 ? 'text-emerald-600' : 'text-rose-600'"
                    class="text-xl font-bold"
                  >
                    {{ selectedAudit.changeAmount > 0 ? '+' : '' }}{{ selectedAudit.changeAmount }}
                  </span>
                </div>
                <div>
                  <span class="text-sm text-slate-600">变动原因</span>
                  <p class="mt-1 text-sm text-slate-900 bg-slate-50 p-3 rounded-lg">
                    {{ selectedAudit.reason }}
                  </p>
                </div>
              </div>
            </div>

            <!-- 申请信息 -->
            <div class="border-t border-slate-200 pt-6">
              <h4 class="text-sm font-semibold text-slate-900 mb-3">申请信息</h4>
              <div class="space-y-2 text-sm">
                <div>
                  <span class="text-slate-600">申请人：</span>
                  <span class="text-slate-900 font-medium">{{ selectedAudit.applyOperatorName }}</span>
                </div>
                <div>
                  <span class="text-slate-600">申请时间：</span>
                  <span class="text-slate-900">{{ formatDate(selectedAudit.applyTime) }}</span>
                </div>
              </div>
            </div>

            <!-- 审核信息 -->
            <div v-if="selectedAudit.auditTime" class="border-t border-slate-200 pt-6">
              <h4 class="text-sm font-semibold text-slate-900 mb-3">审核信息</h4>
              <div class="space-y-2 text-sm">
                <div>
                  <span class="text-slate-600">审核人：</span>
                  <span class="text-slate-900 font-medium">{{ selectedAudit.auditorName }}</span>
                </div>
                <div>
                  <span class="text-slate-600">审核时间：</span>
                  <span class="text-slate-900">{{ formatDate(selectedAudit.auditTime) }}</span>
                </div>
                <div>
                  <span class="text-slate-600">审核状态：</span>
                  <span
                    :class="statusConfig[selectedAudit.auditStatus].class"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2"
                  >
                    {{ statusConfig[selectedAudit.auditStatus].text }}
                  </span>
                </div>
                <div v-if="selectedAudit.auditNote">
                  <span class="text-slate-600">审核备注：</span>
                  <p class="mt-1 text-slate-900 bg-slate-50 p-3 rounded-lg">
                    {{ selectedAudit.auditNote }}
                  </p>
                </div>
              </div>
            </div>

            <!-- 审核操作 -->
            <div 
              v-if="selectedAudit.auditStatus === CREDIT_SCORE_AUDIT_STATUS.PENDING"
              class="border-t border-slate-200 pt-6"
            >
              <h4 class="text-sm font-semibold text-slate-900 mb-3">审核操作</h4>
              
              <div v-if="!auditAction" class="flex gap-3">
                <button
                  @click="startAuditAction('approve')"
                  class="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  通过
                </button>
                <button
                  @click="startAuditAction('reject')"
                  class="flex-1 px-4 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium"
                >
                  拒绝
                </button>
              </div>

              <div v-else class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">
                    {{ auditAction === 'approve' ? '通过备注（可选）' : '拒绝原因' }}
                  </label>
                  <textarea
                    v-model="auditNote"
                    rows="3"
                    :placeholder="auditAction === 'approve' ? '请输入审核备注...' : '请输入拒绝原因...'"
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
                <div class="flex gap-3">
                  <button
                    @click="submitAudit"
                    :class="auditAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'"
                    class="flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium"
                  >
                    确认{{ auditAction === 'approve' ? '通过' : '拒绝' }}
                  </button>
                  <button
                    @click="auditAction = null"
                    class="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Toast 提示 -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="toast.visible"
        class="fixed bottom-4 right-4 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-lg z-50"
      >
        {{ toast.message }}
      </div>
    </Transition>
  </section>
</template>
