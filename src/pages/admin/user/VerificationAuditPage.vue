<script setup>
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { getVerificationAudits, verificationAuditList } from '../../../admin/mock/verification'
import AuditStatsCards from '../../../admin/components/verification-audit/AuditStatsCards.vue'
import AuditFilters from '../../../admin/components/verification-audit/AuditFilters.vue'
import AuditTable from '../../../admin/components/verification-audit/AuditTable.vue'
import AuditDetailModal from '../../../admin/components/verification-audit/AuditDetailModal.vue'
import {
  VERIFICATION_LEVEL,
  VERIFICATION_LEVEL_OPTIONS,
  VERIFICATION_STATUS,
  VERIFICATION_STATUS_OPTIONS,
  VERIFICATION_DOC_TYPE,
  VERIFICATION_DOC_TYPE_OPTIONS
} from '../../../constants/verification'

const auditList = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const filterLevel = ref('all')
const filterStatus = ref('all')
const dateRange = ref({ start: '', end: '' })
const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })
const totalPages = computed(() => Math.ceil(pagination.total / pagination.pageSize))

const showDetailModal = ref(false)
const selectedAudit = ref(null)
const auditAction = ref(null)
const auditNote = ref('')
const toast = ref({ visible: false, message: '' })

const statusConfig = {
  [VERIFICATION_STATUS.PENDING]: { text: '待审核', class: 'bg-blue-100 text-blue-700' },
  [VERIFICATION_STATUS.APPROVED]: { text: '已通过', class: 'bg-emerald-100 text-emerald-700' },
  [VERIFICATION_STATUS.REJECTED]: { text: '已拒绝', class: 'bg-rose-100 text-rose-700' },
  [VERIFICATION_STATUS.RESUBMIT]: { text: '需补件', class: 'bg-amber-100 text-amber-700' }
}

const levelConfig = {
  [VERIFICATION_LEVEL.NONE]: { text: '未认证', class: 'bg-gray-100 text-gray-700' },
  [VERIFICATION_LEVEL.BASIC]: { text: '初级认证', class: 'bg-sky-100 text-sky-700' },
  [VERIFICATION_LEVEL.ADVANCED]: { text: '高级认证', class: 'bg-violet-100 text-violet-700' }
}

const requiredDocsByLevel = {
  [VERIFICATION_LEVEL.BASIC]: [VERIFICATION_DOC_TYPE.ID_CARD],
  [VERIFICATION_LEVEL.ADVANCED]: [
    VERIFICATION_DOC_TYPE.ID_CARD,
    VERIFICATION_DOC_TYPE.ID_CARD_HOLD,
    VERIFICATION_DOC_TYPE.INCOME_PROOF,
    VERIFICATION_DOC_TYPE.BANK_STATEMENT,
    VERIFICATION_DOC_TYPE.ADDRESS_PROOF
  ]
}

const getRequiredDocs = (level) => requiredDocsByLevel[level] || []
const getUploadedDocTypes = (audit) => new Set((audit?.documents || []).map(doc => doc.type))
const getMissingDocs = (audit) => getRequiredDocs(audit.applyLevel).filter(type => !getUploadedDocTypes(audit).has(type))
const getDocTypeLabel = (docType) => VERIFICATION_DOC_TYPE_OPTIONS.find(opt => opt.value === docType)?.label || docType
const getProgress = (audit) => {
  const required = getRequiredDocs(audit.applyLevel).length
  if (!required) return { done: 0, total: 0, percent: 100 }
  const done = required - getMissingDocs(audit).length
  return { done, total: required, percent: Math.round((done / required) * 100) }
}

const selectedProgress = computed(() => (selectedAudit.value ? getProgress(selectedAudit.value) : { done: 0, total: 0, percent: 0 }))
const selectedMissingDocs = computed(() => (selectedAudit.value ? getMissingDocs(selectedAudit.value) : []))
const selectedRiskHints = computed(() => {
  if (!selectedAudit.value) return []
  const hints = []
  if (selectedMissingDocs.value.length) {
    hints.push(`缺少必审材料：${selectedMissingDocs.value.map(getDocTypeLabel).join('、')}`)
  }
  if (selectedAudit.value.status === VERIFICATION_STATUS.RESUBMIT) {
    hints.push('该申请有补件历史，建议优先核验历史退回原因是否已修复')
  }
  if (selectedAudit.value.status === VERIFICATION_STATUS.REJECTED) {
    hints.push('该申请曾被拒绝，建议重点检查证件清晰度和信息一致性')
  }
  return hints
})

const groupedDocuments = computed(() => {
  if (!selectedAudit.value) return { idDocs: [], proofs: [] }
  const idTypes = new Set([VERIFICATION_DOC_TYPE.ID_CARD, VERIFICATION_DOC_TYPE.ID_CARD_HOLD])
  return {
    idDocs: selectedAudit.value.documents.filter(d => idTypes.has(d.type)),
    proofs: selectedAudit.value.documents.filter(d => !idTypes.has(d.type))
  }
})

const fetchAudits = async () => {
  loading.value = true
  try {
    const { list, total } = await getVerificationAudits({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      searchKeyword: searchKeyword.value,
      applyLevel: filterLevel.value,
      status: filterStatus.value,
      dateRange: dateRange.value
    })
    auditList.value = list
    pagination.total = total
  } catch (error) {
    console.error('获取认证审核列表失败:', error)
  } finally {
    loading.value = false
  }
}

watch([searchKeyword, filterLevel, filterStatus, dateRange, () => pagination.currentPage], (newVal, oldVal) => {
  const isPaginationChange = newVal[4] !== oldVal[4]
  if (!isPaginationChange && pagination.currentPage !== 1) {
    pagination.currentPage = 1
  } else {
    fetchAudits()
  }
}, { deep: true })

onMounted(fetchAudits)

const statistics = computed(() => {
  const total = verificationAuditList.length
  const pending = verificationAuditList.filter(a => a.status === VERIFICATION_STATUS.PENDING).length
  const approved = verificationAuditList.filter(a => a.status === VERIFICATION_STATUS.APPROVED).length
  const rejected = verificationAuditList.filter(a => a.status === VERIFICATION_STATUS.REJECTED).length
  return [
    { label: '待审核', value: pending.toLocaleString(), trend: '需处理', color: 'blue' },
    { label: '已通过', value: approved.toLocaleString(), trend: `${total > 0 ? ((approved / total) * 100).toFixed(1) : 0}% 通过率`, color: 'emerald' },
    { label: '已拒绝', value: rejected.toLocaleString(), trend: `${total > 0 ? ((rejected / total) * 100).toFixed(1) : 0}% 拒绝率`, color: 'rose' },
    { label: '总申请', value: total.toLocaleString(), trend: '本月', color: 'gray' }
  ]
})

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  })
}

const viewDetail = (audit) => {
  selectedAudit.value = audit
  showDetailModal.value = true
  auditAction.value = null
  auditNote.value = ''
}

const closeDetail = () => {
  showDetailModal.value = false
  selectedAudit.value = null
  auditAction.value = null
  auditNote.value = ''
}

const startAuditAction = (action) => { auditAction.value = action }

const submitAudit = () => {
  if (!selectedAudit.value || !auditAction.value) return
  const idx = verificationAuditList.findIndex(a => a.id === selectedAudit.value.id)
  if (idx === -1) return
  const now = new Date().toISOString()
  const audit = verificationAuditList[idx]
  if (auditAction.value === 'approve') {
    audit.status = VERIFICATION_STATUS.APPROVED
    audit.auditTime = now
    audit.auditor = 'admin_current'
    showToast('审核通过！')
  } else if (auditAction.value === 'reject') {
    audit.status = VERIFICATION_STATUS.REJECTED
    audit.auditTime = now
    audit.auditor = 'admin_current'
    audit.rejectReason = auditNote.value || '不符合认证要求'
    showToast('已拒绝申请！')
  } else if (auditAction.value === 'resubmit') {
    audit.status = VERIFICATION_STATUS.RESUBMIT
    audit.auditTime = now
    audit.auditor = 'admin_current'
    audit.rejectReason = auditNote.value || '需要补充材料'
    showToast('已要求用户补件！')
  }
  closeDetail()
  fetchAudits()
}

const previewDocument = (doc) => {
  alert(`预览文档: ${getDocTypeLabel(doc.type)}\n\n实际系统中会在这里显示图片/PDF预览`)
}

const resetFilters = () => {
  searchKeyword.value = ''
  filterLevel.value = 'all'
  filterStatus.value = 'all'
  dateRange.value = { start: '', end: '' }
  pagination.currentPage = 1
}

const exportData = () => showToast('正在导出审核记录数据...')
const showToast = (message) => {
  toast.value.message = message
  toast.value.visible = true
  setTimeout(() => { toast.value.visible = false }, 3000)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">认证身份审核</h1>
        <p class="mt-1 text-sm text-gray-600">按初级/高级认证规则分层审核，减少误判与重复沟通</p>
      </div>
    </div>

    <AuditStatsCards :statistics="statistics" />

    <div class="relative min-h-[400px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div class="flex items-center justify-between border-b border-slate-200 bg-white p-4">
        <h3 class="text-base font-semibold text-slate-900">审核申请列表</h3>
        <button class="ant-btn inline-flex items-center gap-2" @click="exportData">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          导出数据
        </button>
      </div>

      <AuditFilters
        :search-keyword="searchKeyword"
        :filter-level="filterLevel"
        :filter-status="filterStatus"
        :date-range="dateRange"
        :level-options="VERIFICATION_LEVEL_OPTIONS"
        :status-options="VERIFICATION_STATUS_OPTIONS"
        @update:search-keyword="searchKeyword = $event"
        @update:filter-level="filterLevel = $event"
        @update:filter-status="filterStatus = $event"
        @update:date-range="dateRange = $event"
        @reset="resetFilters"
      />

      <div v-if="loading" class="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
        <div class="flex flex-col items-center">
          <div class="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p class="mt-2 text-sm font-medium text-slate-500">加载中...</p>
        </div>
      </div>

      <AuditTable
        :loading="loading"
        :audit-list="auditList"
        :status-config="statusConfig"
        :level-config="levelConfig"
        :total-pages="totalPages"
        :pagination="pagination"
        :get-progress="getProgress"
        :format-date="formatDate"
        @view-detail="viewDetail"
        @prev-page="pagination.currentPage--"
        @next-page="pagination.currentPage++"
      />
    </div>

    <AuditDetailModal
      :visible="showDetailModal"
      :selected-audit="selectedAudit"
      :status-config="statusConfig"
      :level-config="levelConfig"
      :audit-action="auditAction"
      :audit-note="auditNote"
      :selected-progress="selectedProgress"
      :selected-missing-docs="selectedMissingDocs"
      :selected-risk-hints="selectedRiskHints"
      :grouped-documents="groupedDocuments"
      :get-required-docs="getRequiredDocs"
      :get-doc-type-label="getDocTypeLabel"
      :format-date="formatDate"
      @close="closeDetail"
      @start-action="startAuditAction"
      @submit="submitAudit"
      @cancel-action="auditAction = null"
      @update:note="auditNote = $event"
      @preview="previewDocument"
    />

    <div v-if="toast.visible" class="animate-slide-in fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg border border-emerald-200 bg-white px-4 py-3 shadow-lg">
      <div class="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
        <svg class="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span class="text-sm font-medium text-slate-900">{{ toast.message }}</span>
    </div>
  </div>
</template>

<style scoped>
/* 自定义样式 */
</style>
