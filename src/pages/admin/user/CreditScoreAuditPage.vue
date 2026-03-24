<script setup>
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { getCreditScoreAudits, creditScoreAuditList } from '../../../admin/mock/creditScore'
import { 
  CREDIT_SCORE_CHANGE_TYPE,
  CREDIT_SCORE_CHANGE_TYPE_OPTIONS,
  CREDIT_SCORE_AUDIT_STATUS
} from '../../../admin/constants/creditScore'

// 审核列表数据
const auditList = ref([])
const loading = ref(false)

// 搜索和筛选
const searchKeyword = ref('')
const filterChangeType = ref('all')
const filterStatus = ref(CREDIT_SCORE_AUDIT_STATUS.PENDING)
const dateRange = ref({ start: '', end: '' })

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const totalPages = computed(() => Math.ceil(pagination.total / pagination.pageSize))

// 获取数据
const fetchAudits = async () => {
  loading.value = true
  try {
    const { list, total } = await getCreditScoreAudits({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      searchKeyword: searchKeyword.value,
      changeType: filterChangeType.value,
      auditStatus: CREDIT_SCORE_AUDIT_STATUS.PENDING,
      dateRange: dateRange.value
    })
    auditList.value = list
    pagination.total = total
  } catch (error) {
    console.error('获取积分审核列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 监听筛选和分页变化
watch(
  [searchKeyword, filterChangeType, filterStatus, dateRange, () => pagination.currentPage],
  (newVal, oldVal) => {
    // 如果是筛选条件变化，重置页码到1
    const isPaginationChange = newVal[4] !== oldVal[4]
    if (!isPaginationChange && pagination.currentPage !== 1) {
      pagination.currentPage = 1
    } else {
      fetchAudits()
    }
  },
  { deep: true }
)

onMounted(fetchAudits)

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

// 统计信息
const statistics = computed(() => {
  const total = creditScoreAuditList.length
  const pending = creditScoreAuditList.filter(a => a.auditStatus === CREDIT_SCORE_AUDIT_STATUS.PENDING).length
  const approved = creditScoreAuditList.filter(a => a.auditStatus === CREDIT_SCORE_AUDIT_STATUS.APPROVED).length
  const rejected = creditScoreAuditList.filter(a => a.auditStatus === CREDIT_SCORE_AUDIT_STATUS.REJECTED).length
  
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

const noteTemplates = {
  approve: [
    '理由充分，积分变动符合策略阈值，审核通过',
    '结合近30天行为记录，风险可控，予以通过',
    '申请人与原因一致，证据链完整，允许生效'
  ],
  reject: [
    '变动幅度过大且缺少补充说明，暂不通过',
    '当前风控信号偏高，不满足通过条件',
    '依据不足，建议补充业务凭证后重新申请'
  ]
}

const selectedAuditContext = computed(() => {
  if (!selectedAudit.value) return null

  const audit = selectedAudit.value
  const absAmount = Math.abs(audit.changeAmount || 0)
  const beforeScore = Number(audit.beforeScore || 0)
  const changeRate = beforeScore > 0 ? ((absAmount / beforeScore) * 100) : 0

  return {
    absAmount,
    changeRate: changeRate.toFixed(1)
  }
})

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

const useNoteTemplate = (text) => {
  auditNote.value = text
}

// 提交审核
const submitAudit = () => {
  if (!selectedAudit.value || !auditAction.value) return
  
  const auditIndex = creditScoreAuditList.findIndex(a => a.id === selectedAudit.value.id)
  if (auditIndex === -1) return
  
  const now = new Date().toISOString()
  const audit = creditScoreAuditList[auditIndex]
  
  switch (auditAction.value) {
    case 'approve':
      audit.auditStatus = CREDIT_SCORE_AUDIT_STATUS.APPROVED
      audit.auditTime = now
      audit.auditorId = 'admin_current'
      audit.auditorName = '当前管理员'
      audit.auditNote = auditNote.value || null
      closeDetail()
      showToast('审核通过，积分变动已生效！')
      fetchAudits()
      break
    case 'reject':
      audit.auditStatus = CREDIT_SCORE_AUDIT_STATUS.REJECTED
      audit.auditTime = now
      audit.auditorId = 'admin_current'
      audit.auditorName = '当前管理员'
      audit.auditNote = auditNote.value || '审核未通过'
      closeDetail()
      showToast('已拒绝申请，积分变动不生效！')
      fetchAudits()
      break
  }
}

// 重置筛选
const resetFilters = () => {
  searchKeyword.value = ''
  filterChangeType.value = 'all'
  filterStatus.value = CREDIT_SCORE_AUDIT_STATUS.PENDING
  dateRange.value = { start: '', end: '' }
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
        <h1 class="text-2xl font-bold text-slate-900">信用分变动审核</h1>
        <p class="text-sm text-slate-500 mt-1">审核用户信用分变动申请</p>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div
        v-for="(stat, index) in statistics"
        :key="index"
        class="bg-white rounded-xl border p-4 shadow-sm transition-all hover:shadow-md"
        :class="`border-${stat.color}-100 bg-${stat.color}-50/10`"
      >
        <p class="text-sm text-slate-600 mb-1 font-medium">{{ stat.label }}</p>
        <div class="flex items-end justify-between">
          <p :class="`text-2xl font-bold text-${stat.color}-600`">{{ stat.value }}</p>
          <p class="text-xs text-slate-400 font-medium mb-1">{{ stat.trend }}</p>
        </div>
      </div>
    </div>

    <!-- 审核列表卡片 -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden relative min-h-[400px] shadow-sm">
      <div class="flex items-center justify-between border-b border-slate-200 p-4 bg-white">
        <h3 class="text-base font-semibold text-slate-900">待审核列表</h3>
        <button
          @click="exportData"
          class="ant-btn inline-flex items-center gap-2"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          导出数据
        </button>
      </div>

      <!-- 筛选栏 -->
      <div class="p-4 border-b border-slate-100 bg-slate-50/30">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- 搜索框 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">搜索</label>
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="用户名/ID/原因..."
              class="ant-input !py-1.5"
            />
          </div>
          
          <!-- 变动类型筛选 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">变动类型</label>
            <select
              v-model="filterChangeType"
              class="ant-select !py-1.5"
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
            <label class="block text-sm font-medium text-slate-700 mb-1.5">开始日期</label>
            <input
              v-model="dateRange.start"
              type="date"
              class="ant-input !py-1.5"
            />
          </div>

          <!-- 结束日期 -->
          <div class="flex items-end gap-2">
            <div class="flex-1">
              <label class="block text-sm font-medium text-slate-700 mb-1.5">结束日期</label>
              <input
                v-model="dateRange.end"
                type="date"
                class="ant-input !py-1.5"
              />
            </div>
            <button
              @click="resetFilters"
              title="重置筛选"
              class="p-2 text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 加载遮罩 -->
      <div v-if="loading" class="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
        <div class="flex flex-col items-center">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-sm text-slate-500 font-medium">加载中...</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50">
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
              v-for="audit in auditList"
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
                  v-if="changeTypeConfig[audit.changeType]"
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
        v-if="!loading && auditList.length === 0"
        class="text-center py-12"
      >
        <svg class="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-slate-900">没有找到记录</h3>
        <p class="mt-1 text-sm text-slate-500">尝试调整筛选条件</p>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="border-t border-slate-200 px-6 py-3 flex items-center justify-between">
        <div class="text-sm text-slate-600">
          共 <span class="font-medium">{{ pagination.total }}</span> 条记录，第 <span class="font-medium">{{ pagination.currentPage }}</span> / <span class="font-medium">{{ totalPages }}</span> 页
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="pagination.currentPage--"
            :disabled="pagination.currentPage === 1 || loading"
            class="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            上一页
          </button>
          <button
            @click="pagination.currentPage++"
            :disabled="pagination.currentPage === totalPages || loading"
            class="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- 详情模态框 -->
    <Transition name="audit-drawer">
      <div
        v-if="showDetailModal && selectedAudit && selectedAuditContext"
        class="fixed inset-0 z-40 bg-slate-900/35"
        @click.self="closeDetail"
      >
        <section class="audit-drawer-panel flex h-[88vh] w-full flex-col overflow-hidden rounded-b-2xl border-b border-slate-200 bg-slate-50 shadow-2xl">
          <div class="border-b border-slate-200 bg-gradient-to-r from-white to-slate-100 px-5 py-4">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="text-xs font-medium tracking-wide text-slate-500">信用分审核详情抽屉</div>
                <div class="mt-1 text-xl font-semibold text-slate-900">
                  {{ selectedAudit.username }}（{{ selectedAudit.userId }}）的信用分审核
                </div>
                <div class="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span class="rounded-full bg-slate-900 px-2.5 py-1 text-white">
                    状态：{{ statusConfig[selectedAudit.auditStatus]?.text || selectedAudit.auditStatus }}
                  </span>
                  <span :class="changeTypeConfig[selectedAudit.changeType].class" class="rounded-full px-2.5 py-1 ring-1 ring-slate-200">
                    类型：{{ changeTypeConfig[selectedAudit.changeType].text }}
                  </span>
                  <span class="rounded-full bg-white px-2.5 py-1 text-slate-600 ring-1 ring-slate-200">
                    申请时间：{{ formatDate(selectedAudit.applyTime) }}
                  </span>
                </div>
              </div>
              <button @click="closeDetail" class="text-slate-400 hover:text-slate-600 transition-colors">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto p-4">
            <div class="space-y-4">
              <section class="rounded-xl border border-slate-200 bg-white p-4">
                <div class="grid grid-cols-1 gap-3 lg:grid-cols-4">
                  <div class="rounded-lg border border-slate-200 bg-slate-50 p-3 lg:col-span-2">
                    <div class="text-xs text-slate-500">积分变动路径</div>
                    <div class="mt-2 flex items-center gap-2 text-lg font-semibold text-slate-900">
                      <span>{{ selectedAudit.beforeScore }}</span>
                      <span class="text-slate-400">-></span>
                      <span>{{ selectedAudit.afterScore }}</span>
                      <span
                        :class="selectedAudit.changeAmount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'"
                        class="ml-2 rounded-full px-2.5 py-0.5 text-sm"
                      >
                        {{ selectedAudit.changeAmount > 0 ? '+' : '' }}{{ selectedAudit.changeAmount }}
                      </span>
                    </div>
                  </div>
                  <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div class="text-xs text-slate-500">变动绝对值</div>
                    <div class="mt-2 text-lg font-semibold text-slate-900">{{ selectedAuditContext.absAmount }}</div>
                  </div>
                  <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div class="text-xs text-slate-500">相对变化</div>
                    <div class="mt-2 text-lg font-semibold text-slate-900">{{ selectedAuditContext.changeRate }}%</div>
                  </div>
                </div>
              </section>

              <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <section class="rounded-xl border border-slate-200 bg-white p-4">
                  <div class="text-xs text-slate-500">审核判断信息</div>
                  <div class="mt-3 space-y-2 text-sm">
                    <div class="flex justify-between rounded-lg bg-slate-50 px-3 py-2"><span class="text-slate-500">变动类型</span><span :class="changeTypeConfig[selectedAudit.changeType].class" class="rounded-full px-2 py-0.5 text-xs font-medium">{{ changeTypeConfig[selectedAudit.changeType].text }}</span></div>
                    <div class="rounded-lg bg-slate-50 px-3 py-2">
                      <div class="text-slate-500">申请原因</div>
                      <p class="mt-1 text-slate-900 leading-6">{{ selectedAudit.reason || '-' }}</p>
                    </div>
                  </div>
                </section>

                <section class="rounded-xl border border-slate-200 bg-white p-4">
                  <div class="text-xs text-slate-500">用户与申请信息</div>
                  <div class="mt-3 space-y-2 text-sm">
                    <div class="flex justify-between"><span class="text-slate-500">用户名</span><span class="font-medium text-slate-900">{{ selectedAudit.username }}</span></div>
                    <div class="flex justify-between"><span class="text-slate-500">用户ID</span><span class="font-medium text-slate-900">{{ selectedAudit.userId }}</span></div>
                    <div class="flex justify-between"><span class="text-slate-500">邮箱</span><span class="font-medium text-slate-900">{{ selectedAudit.email }}</span></div>
                    <div class="flex justify-between"><span class="text-slate-500">申请人</span><span class="font-medium text-slate-900">{{ selectedAudit.applyOperatorName }}</span></div>
                    <div class="flex justify-between"><span class="text-slate-500">申请时间</span><span class="font-medium text-slate-900">{{ formatDate(selectedAudit.applyTime) }}</span></div>
                  </div>
                </section>
              </div>

              <section class="rounded-xl border border-slate-200 bg-white p-4">
                <div class="text-xs text-slate-500">历史审核信息</div>
                <div class="mt-3 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                  <div class="rounded-lg bg-slate-50 px-3 py-2"><span class="text-slate-500">审核状态：</span><span class="font-medium text-slate-900">{{ statusConfig[selectedAudit.auditStatus].text }}</span></div>
                  <div class="rounded-lg bg-slate-50 px-3 py-2"><span class="text-slate-500">审核人：</span><span class="font-medium text-slate-900">{{ selectedAudit.auditorName || '-' }}</span></div>
                  <div class="rounded-lg bg-slate-50 px-3 py-2"><span class="text-slate-500">审核时间：</span><span class="font-medium text-slate-900">{{ formatDate(selectedAudit.auditTime) }}</span></div>
                  <div class="rounded-lg bg-slate-50 px-3 py-2"><span class="text-slate-500">审核备注：</span><span class="font-medium text-slate-900">{{ selectedAudit.auditNote || '-' }}</span></div>
                </div>
              </section>
            </div>
          </div>

          <section class="shrink-0 border-t border-slate-200 bg-white px-5 py-4">
            <div class="text-xs text-slate-500">审核操作</div>
            <div class="mt-3 flex flex-wrap justify-end gap-2">
              <button class="ant-btn" @click="closeDetail">关闭</button>
              <button class="ant-btn ant-btn-primary" @click="startAuditAction('approve')">通过</button>
              <button class="ant-btn ant-btn-danger" @click="startAuditAction('reject')">拒绝</button>
            </div>

            <div v-if="auditAction" class="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div class="text-sm font-medium text-slate-900">
                {{ auditAction === 'approve' ? '确认通过本次信用分变动' : '请填写拒绝原因' }}
              </div>

              <div class="mt-2 flex flex-wrap gap-2">
                <button
                  v-for="tpl in noteTemplates[auditAction]"
                  :key="tpl"
                  class="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700 hover:bg-slate-100"
                  @click="useNoteTemplate(tpl)"
                >
                  快捷填充
                </button>
              </div>

              <textarea
                v-model="auditNote"
                rows="3"
                class="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                :placeholder="auditAction === 'approve' ? '请输入通过备注（可选）...' : '请输入拒绝原因...'"
              />

              <div class="mt-3 flex justify-end gap-2">
                <button class="ant-btn ant-btn-primary" @click="submitAudit">确认提交</button>
                <button class="ant-btn" @click="auditAction = null">取消</button>
              </div>
            </div>
          </section>
        </section>
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

<style scoped>
.audit-drawer-enter-active,
.audit-drawer-leave-active {
  transition: opacity 0.25s ease;
}

.audit-drawer-enter-from,
.audit-drawer-leave-to {
  opacity: 0;
}

.audit-drawer-enter-to,
.audit-drawer-leave-from {
  opacity: 1;
}

.audit-drawer-enter-from > section,
.audit-drawer-leave-to > section {
  transform: translateY(-100%);
}

.audit-drawer-enter-active > section,
.audit-drawer-leave-active > section {
  transition: transform 0.25s ease;
  transform: translateY(0);
}
</style>
