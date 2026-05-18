<script setup>
import { ref, computed, onMounted, onUnmounted, reactive, watch } from 'vue'
import { referralApi } from '../../../admin/mock/referral'
import {
  COMMISSION_STATUS,
  COMMISSION_STATUS_OPTIONS,
  REFERRAL_TYPE_OPTIONS
} from '../../../admin/constants/referral'

const STATUS_BADGE_CLASS = {
  yellow: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200',
  blue: 'bg-blue-50 text-blue-800 ring-1 ring-inset ring-blue-200',
  green: 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200',
  red: 'bg-red-50 text-red-800 ring-1 ring-inset ring-red-200',
  gray: 'bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200'
}

// 搜索和筛选
const searchKeyword = ref('')
const statusFilter = ref('all')
const typeFilter = ref('all')
const levelFilter = ref('all')
const loading = ref(false)

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const totalPages = computed(() => Math.ceil(pagination.total / pagination.pageSize))

// 记录列表
const recordList = ref([])
const aggregates = ref(null)
const settlementGlobal = ref(null)
const toast = ref({ visible: false, message: '', kind: 'info' })
const confirmDialog = ref({
  visible: false,
  message: '',
  loading: false,
  onConfirm: null
})
let toastTimer = null

function showToast(message, kind = 'info') {
  if (toastTimer) {
    clearTimeout(toastTimer)
    toastTimer = null
  }
  toast.value = { visible: true, message: String(message || ''), kind }
  toastTimer = setTimeout(() => {
    toast.value.visible = false
    toastTimer = null
  }, 3600)
}

const toastBorderClass = computed(() => {
  if (toast.value.kind === 'success') return 'border-emerald-200'
  if (toast.value.kind === 'error') return 'border-red-200'
  return 'border-blue-200'
})

const toastIconBgClass = computed(() => {
  if (toast.value.kind === 'success') return 'bg-emerald-500'
  if (toast.value.kind === 'error') return 'bg-red-500'
  return 'bg-blue-500'
})

function openConfirm(message, onConfirm) {
  confirmDialog.value = {
    visible: true,
    message,
    loading: false,
    onConfirm
  }
}

function closeConfirm() {
  if (confirmDialog.value.loading) return
  confirmDialog.value.visible = false
  confirmDialog.value.message = ''
  confirmDialog.value.onConfirm = null
}

async function submitConfirm() {
  const fn = confirmDialog.value.onConfirm
  if (!fn) {
    closeConfirm()
    return
  }
  confirmDialog.value.loading = true
  try {
    await fn()
  } catch (error) {
    showToast(error?.message || '操作失败', 'error')
  } finally {
    confirmDialog.value.loading = false
    closeConfirm()
  }
}

// 加载分佣记录
const loadCommissionRecords = async () => {
  loading.value = true
  try {
    const result = await referralApi.getCommissionRecords({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      searchKeyword: searchKeyword.value,
      status: statusFilter.value,
      type: typeFilter.value,
      level: levelFilter.value
    })
    if (result.success) {
      recordList.value = result.data.list
      pagination.total = result.data.total
      aggregates.value = result.data.aggregates ?? null
      settlementGlobal.value = result.data.settlementGlobal ?? null
      selectedRecords.value = selectedRecords.value.filter(id =>
        result.data.list.some(r => r.id === id && r.status === COMMISSION_STATUS.PENDING)
      )
    }
  } catch (error) {
    console.error('Failed to load commission records:', error)
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.currentPage = 1
  loadCommissionRecords()
}

// 重置处理
const handleReset = () => {
  searchKeyword.value = ''
  statusFilter.value = 'all'
  typeFilter.value = 'all'
  levelFilter.value = 'all'
  pagination.currentPage = 1
  loadCommissionRecords()
}

// 监听页码变化
watch(() => pagination.currentPage, () => {
  loadCommissionRecords()
})

// 组件加载时获取数据
onMounted(() => {
  loadCommissionRecords()
})

onUnmounted(() => {
  if (toastTimer) clearTimeout(toastTimer)
})

// 选中的记录
const selectedRecords = ref([])

// 统计数据（与当前筛选条件一致的全量聚合，非仅当前页）
const stats = computed(() => {
  const a = aggregates.value
  if (!a) {
    return [
      { label: '总记录数', value: '—', colorKey: 'blue' },
      { label: '待发放', value: '—', colorKey: 'yellow' },
      { label: '已入账', value: '—', colorKey: 'green' },
      { label: '已入账佣金', value: '—', colorKey: 'green' }
    ]
  }
  return [
    { label: '总记录数', value: a.totalRecords, colorKey: 'blue' },
    { label: '待发放', value: a.pendingCount, colorKey: 'yellow' },
    { label: '已入账', value: a.completedCount, colorKey: 'green' },
    {
      label: '已入账佣金',
      value: `$${a.completedCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      colorKey: 'green'
    }
  ]
})

const statValueClass = (colorKey) => {
  const map = {
    blue: 'text-blue-600',
    yellow: 'text-amber-600',
    green: 'text-emerald-600',
    purple: 'text-violet-600'
  }
  return map[colorKey] || 'text-slate-700'
}

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

const executableRecords = computed(() => recordList.value.filter(r => r.status === COMMISSION_STATUS.PENDING))

// 全选/取消全选
const toggleSelectAll = () => {
  const ids = executableRecords.value.map(r => r.id)
  if (ids.length > 0 && ids.every(id => selectedRecords.value.includes(id))) {
    selectedRecords.value = []
  } else {
    selectedRecords.value = ids
  }
}

// 切换单个选择
const toggleSelect = (recordId) => {
  const row = recordList.value.find(r => r.id === recordId)
  if (!row || row.status !== COMMISSION_STATUS.PENDING) return
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
  openConfirm('确认发放该笔分佣？', async () => {
    try {
      const result = await referralApi.executeCommission(recordId)
      if (result.success) {
        showToast(result.message || '发放成功', 'success')
        await loadCommissionRecords()
      } else if (result.message) {
        showToast(result.message, 'error')
      }
    } catch (error) {
      showToast('发放失败：' + error.message, 'error')
    }
  })
}

// 批量发放分佣
const batchExecute = async () => {
  if (selectedRecords.value.length === 0) {
    showToast('请先选择待发放记录', 'error')
    return
  }
  
  openConfirm(`确认批量发放 ${selectedRecords.value.length} 条分佣记录？`, async () => {
    try {
      const result = await referralApi.batchExecuteCommission(selectedRecords.value)
      if (result.success) {
        selectedRecords.value = []
        showToast(result.message || '批量发放成功', 'success')
        await loadCommissionRecords()
      } else if (result.message) {
        showToast(result.message, 'error')
      }
    } catch (error) {
      showToast('批量发放失败：' + error.message, 'error')
    }
  })
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const d = new Date(dateString.includes('T') ? dateString : `${dateString.replace(' ', 'T')}`)
  if (Number.isNaN(d.getTime())) return dateString
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const statusBadgeClass = (status) => {
  const color = getStatusConfig(status).color
  return STATUS_BADGE_CLASS[color] || STATUS_BADGE_CLASS.gray
}
</script>

<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">裂变分佣记录</h1>
        <p class="mt-1 text-sm text-slate-500">邀请链分佣流水；发放时按「裂变分销设置 → 佣金结算」写入入账快照。</p>
      </div>
      <router-link
        to="/admin/agent/referral-config"
        class="ant-btn inline-flex shrink-0 items-center justify-center no-underline"
      >
        裂变分销设置
      </router-link>
    </div>

    <div v-if="settlementGlobal" class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
      当前入账：<span class="font-medium text-slate-900">{{ settlementGlobal.creditLabel }}</span>
      <span class="mx-2 text-slate-300">·</span>
      <span class="text-slate-500">结算安排：</span>
      <span class="font-medium text-slate-900">{{ settlementGlobal.settlementScheduleLabel }}</span>
      <p class="mt-1 text-xs text-slate-500">{{ settlementGlobal.settlementNotifyLine }}</p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <p class="text-xs font-medium text-slate-500">{{ stat.label }}</p>
        <p class="mt-1 text-xl font-bold tabular-nums" :class="statValueClass(stat.colorKey)">{{ stat.value }}</p>
      </div>
    </div>

    <!-- 分佣记录：标题 + 筛选 + 操作同一行 -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm relative min-h-[400px]">
      <div
        class="flex flex-wrap items-center gap-3 justify-between border-b border-slate-200 p-4 md:px-6 bg-slate-50/30"
      >
        <div class="flex flex-wrap items-center gap-3 flex-1 min-w-0">
          <h3 class="text-base font-semibold text-slate-900 shrink-0">记录列表</h3>
          <select v-model="statusFilter" class="ant-select !w-32" @change="handleSearch">
            <option value="all">全部状态</option>
            <option v-for="status in COMMISSION_STATUS_OPTIONS" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>

          <select v-model="typeFilter" class="ant-select !w-36" @change="handleSearch">
            <option value="all">全部类型</option>
            <option v-for="type in REFERRAL_TYPE_OPTIONS" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>

          <select v-model="levelFilter" class="ant-select !w-28" @change="handleSearch">
            <option value="all">全部层级</option>
            <option value="1">一级</option>
            <option value="2">二级</option>
            <option value="3">三级</option>
          </select>

          <div class="relative min-w-[180px] max-w-xl flex-1 basis-[200px]">
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="记录ID、上级 UID、被邀请人…"
              class="ant-input pl-9"
              @keyup.enter="handleSearch"
            />
            <svg
              viewBox="0 0 20 20"
              class="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400"
              fill="none"
            >
              <circle cx="9" cy="9" r="5.8" stroke="currentColor" stroke-width="1.6" />
              <path d="M13.6 13.6L16.4 16.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
          </div>

          <button type="button" class="ant-btn ant-btn-primary shrink-0" @click="handleSearch">搜索</button>
          <button type="button" class="ant-btn shrink-0" @click="handleReset">重置</button>
        </div>
        <div class="flex flex-wrap items-center gap-2 shrink-0">
          <button
            v-if="selectedRecords.length > 0"
            type="button"
            @click="batchExecute"
            class="ant-btn ant-btn-primary !bg-emerald-600 !border-emerald-600"
          >
            批量发放 ({{ selectedRecords.length }})
          </button>
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
              <th class="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  class="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  :checked="executableRecords.length > 0 && executableRecords.every(r => selectedRecords.includes(r.id))"
                  :disabled="executableRecords.length === 0"
                  @change="toggleSelectAll"
                />
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">记录ID</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">上级（获益方）</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">被邀请人</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">分佣详情</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider min-w-[9rem]">
                入账
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">状态</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">时间</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            <tr v-for="record in recordList" :key="record.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  :checked="isSelected(record.id)"
                  :disabled="record.status !== COMMISSION_STATUS.PENDING"
                  @change="toggleSelect(record.id)"
                />
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ record.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ record.agentUsername }}</div>
                <div class="text-xs text-gray-500">UID: {{ record.agentUid }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ record.referralUsername }}</div>
                <div class="text-xs text-gray-500">UID: {{ record.referralUid }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  金额: <span class="font-semibold">${{ record.amount.toLocaleString() }}</span>
                </div>
                <div class="text-xs text-gray-500">
                  {{ getTypeLabel(record.type) }} | {{ record.level }}级 ({{ (record.commissionRate * 100).toFixed(1) }}%)
                </div>
                <div class="text-sm text-green-600 font-bold">
                  佣金: ${{ record.commission.toLocaleString() }}
                </div>
              </td>
              <td class="px-6 py-4 align-top text-xs text-slate-700">
                <template v-if="record._settlement">
                  <p class="font-medium text-slate-900">{{ record._settlement.creditLabel }}</p>
                  <p class="mt-0.5 text-[11px] text-slate-500">{{ record._settlement.settlementScheduleLabel }}</p>
                  <p class="mt-0.5 text-[10px] text-slate-500">{{ record._settlement.settlementNotifyShort }}</p>
                  <p v-if="record._settlement.creditTxnId" class="mt-1 font-mono text-[10px] text-slate-400">
                    {{ record._settlement.creditTxnId }}
                  </p>
                </template>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="statusBadgeClass(record.status)">
                  {{ getStatusConfig(record.status).text }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="text-xs">创建: {{ formatDate(record.createdAt) }}</div>
                <div v-if="record.completedAt" class="text-xs text-green-600 mt-1">
                  完成: {{ formatDate(record.completedAt) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  v-if="record.status === COMMISSION_STATUS.PENDING"
                  type="button"
                  @click="executeCommission(record.id)"
                  class="text-green-600 hover:text-green-900"
                >
                  发放
                </button>
                <span v-else class="text-gray-400">-</span>
              </td>
            </tr>
            <tr v-if="recordList.length === 0 && !loading">
              <td colspan="9" class="px-6 py-10 text-center text-gray-500">
                暂无分佣记录
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

    <Teleport to="body">
      <div
        v-if="confirmDialog.visible"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4"
        role="dialog"
        aria-modal="true"
        @click.self="closeConfirm"
      >
        <div class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
          <p class="text-base font-semibold text-slate-900">请确认</p>
          <p class="mt-2 text-sm leading-relaxed text-slate-600">{{ confirmDialog.message }}</p>
          <div class="mt-6 flex justify-end gap-2">
            <button type="button" class="ant-btn" :disabled="confirmDialog.loading" @click="closeConfirm">
              取消
            </button>
            <button type="button" class="ant-btn ant-btn-primary" :disabled="confirmDialog.loading" @click="submitConfirm">
              {{ confirmDialog.loading ? '处理中…' : '确定' }}
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="toast.visible"
        class="fixed right-4 top-4 z-[110] flex max-w-sm items-center gap-3 rounded-lg border bg-white px-4 py-3 shadow-lg"
        :class="toastBorderClass"
      >
        <div class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full" :class="toastIconBgClass">
          <svg v-if="toast.kind === 'success'" class="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else-if="toast.kind === 'error'" class="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <svg v-else class="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span class="text-sm font-medium text-slate-900">{{ toast.message }}</span>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* 自定义样式 */
</style>
