<script setup>
import { ref, computed, onMounted, onUnmounted, reactive, watch } from 'vue'
import { agentSettlementApi } from '../../../admin/mock/agentSettlement'
import {
  AGENT_SETTLEMENT_ACTION,
  AGENT_SETTLEMENT_STATUS,
  AGENT_SETTLEMENT_STATUS_OPTIONS,
  agentSettlementStatusLabel
} from '../../../admin/constants/agentSettlement'

const searchKeyword = ref('')
const statusFilter = ref('all')
const agentUidFilter = ref('')
const loading = ref(false)

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const recordList = ref([])
const aggregates = ref(null)
const selectedIds = ref([])

const totalPages = computed(() => Math.max(1, Math.ceil(pagination.total / pagination.pageSize)))

const statusOptions = AGENT_SETTLEMENT_STATUS_OPTIONS

const badgeClass = (status) => {
  const o = statusOptions.find((x) => x.value === status)
  return o?.badgeClass || 'bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200'
}

const loadList = async () => {
  loading.value = true
  try {
    const res = await agentSettlementApi.listBatches({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      status: statusFilter.value,
      searchKeyword: searchKeyword.value,
      agentUid: agentUidFilter.value.trim() || undefined
    })
    if (res.success) {
      recordList.value = res.data.list
      pagination.total = res.data.total
      aggregates.value = res.data.aggregates
      selectedIds.value = selectedIds.value.filter((id) => recordList.value.some((r) => r.id === id))
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadList()
}

const handleReset = () => {
  searchKeyword.value = ''
  statusFilter.value = 'all'
  agentUidFilter.value = ''
  pagination.currentPage = 1
  loadList()
}

watch(
  () => pagination.currentPage,
  () => {
    loadList()
  }
)

onMounted(() => {
  loadList()
})

const stats = computed(() => {
  const a = aggregates.value
  if (!a) {
    return [
      { label: '批次总数', value: '—' },
      { label: '待复核', value: '—' },
      { label: '出款中', value: '—' },
      { label: '已结算批次', value: '—' }
    ]
  }
  return [
    { label: '批次总数', value: a.totalBatches },
    { label: '待复核', value: a.pendingReview },
    { label: '出款中', value: a.paying },
    { label: '已结算批次', value: a.completed }
  ]
})

const toggleAll = () => {
  if (selectedIds.value.length === recordList.value.length) {
    selectedIds.value = []
  } else {
    selectedIds.value = recordList.value.map((r) => r.id)
  }
}

const toggleOne = (id) => {
  const i = selectedIds.value.indexOf(id)
  if (i > -1) selectedIds.value.splice(i, 1)
  else selectedIds.value.push(id)
}

const isSelected = (id) => selectedIds.value.includes(id)

/** 非原生提示（右上角 Toast） */
const toast = ref({ visible: false, message: '', kind: 'info' })
let toastHideTimer = null

function showToast(message, kind = 'info') {
  if (toastHideTimer) {
    clearTimeout(toastHideTimer)
    toastHideTimer = null
  }
  toast.value = { visible: true, message: String(message ?? ''), kind }
  toastHideTimer = setTimeout(() => {
    toast.value.visible = false
    toastHideTimer = null
  }, 3800)
}

const toastBorderClass = computed(() => {
  const k = toast.value.kind
  if (k === 'success') return 'border-emerald-200'
  if (k === 'error') return 'border-red-200'
  return 'border-blue-200'
})

const toastIconBgClass = computed(() => {
  const k = toast.value.kind
  if (k === 'success') return 'bg-emerald-500'
  if (k === 'error') return 'bg-red-500'
  return 'bg-blue-500'
})

/** 非原生确认框 */
const confirmDialog = ref({
  visible: false,
  message: '',
  loading: false,
  /** @type {null | (() => void | Promise<void>)} */
  onConfirm: null
})

function closeConfirm() {
  if (confirmDialog.value.loading) return
  confirmDialog.value.visible = false
  confirmDialog.value.message = ''
  confirmDialog.value.onConfirm = null
}

function openConfirm(message, onConfirm) {
  confirmDialog.value = {
    visible: true,
    message,
    loading: false,
    onConfirm
  }
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
  } catch (e) {
    showToast(e?.message || '操作失败', 'error')
  } finally {
    confirmDialog.value.loading = false
    closeConfirm()
  }
}

onUnmounted(() => {
  if (toastHideTimer) clearTimeout(toastHideTimer)
})

const doAdvance = (batchId, action, label) => {
  openConfirm(`确认${label}？`, async () => {
    const res = await agentSettlementApi.advanceBatch(batchId, action)
    showToast(res.message || (res.success ? '已更新' : '失败'), res.success ? 'success' : 'error')
    if (res.success) await loadList()
  })
}

const batchByStatus = (action, label, allowedStatus) => {
  const picked = recordList.value.filter((r) => selectedIds.value.includes(r.id))
  const ok = picked.filter((r) => r.status === allowedStatus)
  if (!ok.length) {
    showToast(`所选记录中没有处于「${agentSettlementStatusLabel(allowedStatus)}」的项`, 'error')
    return
  }
  openConfirm(`确认对 ${ok.length} 条记录批量${label}？`, async () => {
    const res = await agentSettlementApi.batchAdvance(
      ok.map((r) => r.id),
      action
    )
    showToast(res.message, res.success ? 'success' : 'error')
    selectedIds.value = []
    await loadList()
  })
}
</script>

<template>
  <div class="space-y-6 p-6">
    <div>
      <h1 class="text-xl font-semibold text-slate-900">代理佣金结算</h1>
      <p class="mt-1 text-sm text-slate-600">
        按账期批次处理：复核 → 出款 → 入账。演示数据为内存态，刷新页面会重置。
      </p>
    </div>

    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="(s, idx) in stats"
        :key="idx"
        class="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
      >
        <p class="text-xs font-medium text-slate-500">{{ s.label }}</p>
        <p class="mt-1 text-2xl font-semibold text-slate-900">{{ s.value }}</p>
      </div>
    </div>

    <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div class="flex flex-wrap gap-3">
          <div>
            <label class="block text-xs font-medium text-slate-600">关键词</label>
            <input
              v-model="searchKeyword"
              type="search"
              placeholder="批次号 / UID / 邮箱 / 账期"
              class="mt-1 w-56 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              @keyup.enter="handleSearch"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600">代理 UID</label>
            <input
              v-model="agentUidFilter"
              type="text"
              inputmode="numeric"
              placeholder="可选"
              class="mt-1 w-32 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              @keyup.enter="handleSearch"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600">状态</label>
            <select
              v-model="statusFilter"
              class="mt-1 w-44 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option v-for="o in statusOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
            @click="handleSearch"
          >
            查询
          </button>
          <button
            type="button"
            class="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            @click="handleReset"
          >
            重置
          </button>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          class="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
          @click="batchByStatus(AGENT_SETTLEMENT_ACTION.APPROVE, '复核通过', AGENT_SETTLEMENT_STATUS.PENDING_REVIEW)"
        >
          批量复核通过
        </button>
        <button
          type="button"
          class="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
          @click="
            batchByStatus(AGENT_SETTLEMENT_ACTION.START_PAYOUT, '发起出款', AGENT_SETTLEMENT_STATUS.APPROVED)
          "
        >
          批量发起出款
        </button>
        <button
          type="button"
          class="rounded-md bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-900"
          @click="batchByStatus(AGENT_SETTLEMENT_ACTION.MARK_COMPLETED, '确认入账', AGENT_SETTLEMENT_STATUS.PAYING)"
        >
          批量确认入账
        </button>
      </div>
    </div>

    <div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead class="bg-slate-50 text-xs font-medium uppercase text-slate-600">
            <tr>
              <th class="px-3 py-3">
                <input
                  type="checkbox"
                  :checked="recordList.length > 0 && selectedIds.length === recordList.length"
                  @change="toggleAll"
                />
              </th>
              <th class="px-3 py-3">批次号</th>
              <th class="px-3 py-3">账期</th>
              <th class="px-3 py-3">代理</th>
              <th class="px-3 py-3 text-right">金额 (USDT)</th>
              <th class="px-3 py-3">状态</th>
              <th class="px-3 py-3">流水号</th>
              <th class="px-3 py-3">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="loading">
              <td colspan="8" class="px-4 py-8 text-center text-slate-500">加载中…</td>
            </tr>
            <tr v-else-if="!recordList.length">
              <td colspan="8" class="px-4 py-8 text-center text-slate-500">暂无数据</td>
            </tr>
            <tr v-for="row in recordList" v-else :key="row.id" class="hover:bg-slate-50/80">
              <td class="px-3 py-2">
                <input type="checkbox" :checked="isSelected(row.id)" @change="toggleOne(row.id)" />
              </td>
              <td class="px-3 py-2 font-mono text-xs text-slate-800">{{ row.batchNo }}</td>
              <td class="px-3 py-2 font-mono">{{ row.period }}</td>
              <td class="px-3 py-2">
                <div class="font-medium text-slate-900">{{ row.agentName }}</div>
                <div class="text-xs text-slate-500">UID {{ row.agentUid }} · {{ row.agentEmail }}</div>
              </td>
              <td class="px-3 py-2 text-right tabular-nums font-medium text-slate-900">
                {{ row.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }}
              </td>
              <td class="px-3 py-2">
                <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium" :class="badgeClass(row.status)">
                  {{ agentSettlementStatusLabel(row.status) }}
                </span>
              </td>
              <td class="px-3 py-2 font-mono text-xs text-slate-600">{{ row.creditTxnId || '—' }}</td>
              <td class="px-3 py-2">
                <div class="flex flex-wrap gap-1">
                  <button
                    v-if="row.status === AGENT_SETTLEMENT_STATUS.PENDING_REVIEW"
                    type="button"
                    class="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-900 hover:bg-emerald-100"
                    @click="doAdvance(row.id, AGENT_SETTLEMENT_ACTION.APPROVE, '复核通过')"
                  >
                    通过
                  </button>
                  <button
                    v-if="row.status === AGENT_SETTLEMENT_STATUS.PENDING_REVIEW"
                    type="button"
                    class="rounded border border-red-200 bg-red-50 px-2 py-0.5 text-xs text-red-800 hover:bg-red-100"
                    @click="doAdvance(row.id, AGENT_SETTLEMENT_ACTION.REJECT, '驳回该账期')"
                  >
                    驳回
                  </button>
                  <button
                    v-if="row.status === AGENT_SETTLEMENT_STATUS.APPROVED"
                    type="button"
                    class="rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs text-indigo-900 hover:bg-indigo-100"
                    @click="doAdvance(row.id, AGENT_SETTLEMENT_ACTION.START_PAYOUT, '发起出款')"
                  >
                    出款
                  </button>
                  <button
                    v-if="row.status === AGENT_SETTLEMENT_STATUS.PAYING"
                    type="button"
                    class="rounded border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs text-slate-800 hover:bg-slate-200"
                    @click="doAdvance(row.id, AGENT_SETTLEMENT_ACTION.MARK_COMPLETED, '确认已入账')"
                  >
                    入账完成
                  </button>
                  <span v-if="row.status === AGENT_SETTLEMENT_STATUS.COMPLETED" class="text-xs text-slate-400">—</span>
                  <span v-if="row.status === AGENT_SETTLEMENT_STATUS.REJECTED" class="text-xs text-slate-400">—</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
        <span>共 {{ pagination.total }} 条</span>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="rounded border border-slate-300 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="pagination.currentPage <= 1 || loading"
            @click="pagination.currentPage -= 1"
          >
            上一页
          </button>
          <span>{{ pagination.currentPage }} / {{ totalPages }}</span>
          <button
            type="button"
            class="rounded border border-slate-300 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="pagination.currentPage >= totalPages || loading"
            @click="pagination.currentPage += 1"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <!-- 确认操作 -->
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

    <!-- 结果提示 -->
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
</template>
