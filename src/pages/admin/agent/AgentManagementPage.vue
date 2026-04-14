<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { mockAgentStats, agentApi, normalizeAgentProductCommission } from '../../../admin/mock/agent'
import { AGENT_STATUS, AGENT_STATUS_OPTIONS, AGENT_ROLE_LABEL } from '../../../admin/constants/agent'
import { AGENT_PRODUCT_LINE_DEFS, AGENT_PRODUCT_GROUPS, normalizeAgentLineRate } from '../../../admin/constants/agentCommission'

const searchKeyword = ref('')
const statusFilter = ref('all')
const loading = ref(false)

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const totalPages = computed(() => Math.ceil(pagination.total / pagination.pageSize))

const showUpgradeModal = ref(false)
const showDetailModal = ref(false)
const showCommissionModal = ref(false)
const selectedAgent = ref(null)
const upgradeForm = ref({
  uid: ''
})

const commissionDraft = ref(null)
const commissionTargetUid = ref(null)
const commissionSaving = ref(false)
const commissionLoading = ref(false)

const BORDER_ACCENT = {
  blue: 'border-l-blue-500',
  indigo: 'border-l-indigo-500',
  violet: 'border-l-violet-500',
  orange: 'border-l-orange-500',
  amber: 'border-l-amber-500',
  emerald: 'border-l-emerald-500',
  rose: 'border-l-rose-500'
}

const stats = ref(mockAgentStats)

const agentList = ref([])

function lineByKey(key) {
  return AGENT_PRODUCT_LINE_DEFS.find((p) => p.key === key)
}

function linesInAgentGroup(group) {
  return group.lineKeys.map((k) => lineByKey(k)).filter(Boolean)
}

function groupGridClass(group) {
  const n = group.lineKeys.length
  if (n <= 1) return 'grid-cols-1'
  if (n === 2) return 'grid-cols-1 md:grid-cols-2'
  return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
}

function rateNumForDraft(line) {
  if (!commissionDraft.value) return 0
  return parseFloat(normalizeAgentLineRate(commissionDraft.value[line.rateKey]))
}

function setDraftRate(line, raw) {
  if (!commissionDraft.value) return
  const v = raw == null ? '' : String(raw).trim()
  let n = parseFloat(v)
  if (v === '' || Number.isNaN(n)) n = 0
  commissionDraft.value[line.rateKey] = normalizeAgentLineRate(n)
}

function isLineEnabledDraft(line) {
  return commissionDraft.value && commissionDraft.value[line.enabledKey] === true
}

function toggleLineDraft(line) {
  if (!commissionDraft.value) return
  commissionDraft.value[line.enabledKey] = !commissionDraft.value[line.enabledKey]
}

function validateDraftCommission() {
  const d = commissionDraft.value
  if (!d) return false
  const validateOne = (rateStr) => {
    const n = parseFloat(normalizeAgentLineRate(rateStr))
    return !Number.isNaN(n) && n >= 0 && n <= 1
  }
  for (const line of AGENT_PRODUCT_LINE_DEFS) {
    if (!d[line.enabledKey]) continue
    d[line.rateKey] = normalizeAgentLineRate(d[line.rateKey])
    if (!validateOne(d[line.rateKey])) {
      alert(`「${line.title}」已开启记佣：比例须为 0～1 之间的小数。`)
      return false
    }
  }
  for (const line of AGENT_PRODUCT_LINE_DEFS) {
    if (d[line.enabledKey]) continue
    const raw = d[line.rateKey]
    if (raw != null && String(raw).trim() && !validateOne(raw)) {
      alert(`「${line.title}」比例格式有误，请修正或清空。`)
      return false
    }
  }
  return true
}

const loadAgentList = async () => {
  loading.value = true
  try {
    const result = await agentApi.getAgentList({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      searchKeyword: searchKeyword.value,
      status: statusFilter.value
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

const handleSearch = () => {
  pagination.currentPage = 1
  loadAgentList()
}

const handleReset = () => {
  searchKeyword.value = ''
  statusFilter.value = 'all'
  pagination.currentPage = 1
  loadAgentList()
}

watch(() => pagination.currentPage, () => {
  loadAgentList()
})

onMounted(() => {
  loadAgentList()
})

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

const getStatusConfig = (status) => {
  const config = AGENT_STATUS_OPTIONS.find((s) => s.value === status)
  return {
    text: config?.label || status,
    color: config?.color || 'gray'
  }
}

const openUpgradeModal = () => {
  upgradeForm.value = {
    uid: ''
  }
  showUpgradeModal.value = true
}

const handleUpgrade = async () => {
  try {
    const result = await agentApi.upgradeToAgent(upgradeForm.value.uid)
    if (result.success) {
      alert(result.message)
      showUpgradeModal.value = false
      loadAgentList()
    }
  } catch (error) {
    alert('升级失败：' + error.message)
  }
}

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

const viewDetail = async (agent) => {
  selectedAgent.value = agent
  showDetailModal.value = true
  try {
    const res = await agentApi.getAgentDetail(agent.uid)
    if (res.success) {
      selectedAgent.value = res.data
    }
  } catch (e) {
    console.error(e)
  }
}

const openCommissionConfig = async (agent) => {
  commissionLoading.value = true
  commissionDraft.value = null
  commissionTargetUid.value = agent.uid
  try {
    const res = await agentApi.getAgentDetail(agent.uid)
    if (res.success) {
      commissionDraft.value = normalizeAgentProductCommission(res.data.productCommission)
      showCommissionModal.value = true
    }
  } catch (e) {
    alert('加载代理记佣失败')
    console.error(e)
  } finally {
    commissionLoading.value = false
  }
}

const closeCommissionModal = () => {
  showCommissionModal.value = false
  commissionDraft.value = null
  commissionTargetUid.value = null
}

const saveCommissionConfig = async () => {
  const uid = commissionTargetUid.value
  if (!uid || !commissionDraft.value) return
  if (!validateDraftCommission()) return
  commissionSaving.value = true
  try {
    const payload = normalizeAgentProductCommission({ ...commissionDraft.value })
    const res = await agentApi.updateAgentProductCommission(uid, payload)
    if (res.success) {
      alert(res.message)
      const row = agentList.value.find((a) => a.uid === uid)
      if (row && res.data?.productCommission) {
        row.productCommission = res.data.productCommission
      }
      if (selectedAgent.value?.uid === uid && res.data?.productCommission) {
        selectedAgent.value.productCommission = res.data.productCommission
      }
      closeCommissionModal()
      loadAgentList()
    }
  } catch (e) {
    alert(e.message || '保存失败')
  } finally {
    commissionSaving.value = false
  }
}

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
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">代理管理</h1>
        <p class="mt-1 text-sm text-slate-500">
          查看与管理后台代理：启用/暂停、各产品线一级记佣等。
        </p>
      </div>
    </div>

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
          <div
            :class="`w-12 h-12 bg-${card.color}-50 rounded-xl flex items-center justify-center border border-${card.color}-100 transition-all hover:scale-105 font-medium`"
          >
            <div
              :class="`w-6 h-6 bg-${card.color}-500 rounded-lg shadow-sm opacity-80 text-white flex items-center justify-center text-xs font-bold italic font-medium`"
            >
              {{ card.label.charAt(0) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm relative min-h-[400px]">
      <div
        class="flex flex-wrap items-center gap-3 justify-between border-b border-slate-200 p-4 md:px-6 bg-slate-50/30"
      >
        <div class="flex flex-wrap items-center gap-3 flex-1 min-w-0">
          <h3 class="text-base font-semibold text-slate-900 shrink-0">代理列表</h3>
          <select v-model="statusFilter" class="ant-select !w-36" @change="handleSearch">
            <option value="all">全部状态</option>
            <option v-for="status in AGENT_STATUS_OPTIONS" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>

          <div class="relative min-w-[180px] max-w-xl flex-1 basis-[200px]">
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索 UID、用户名或邮箱…"
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
        <button type="button" class="ant-btn ant-btn-primary shrink-0" @click="openUpgradeModal">+ 添加代理</button>
      </div>

      <div class="overflow-x-auto">
        <div
          v-if="loading"
          class="absolute inset-0 bg-white/60 z-10 flex items-center justify-center"
        >
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>

        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">UID</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">用户信息</th>
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
                <button type="button" class="text-blue-600 hover:text-blue-900" @click="viewDetail(agent)">详情</button>
                <button type="button" class="text-violet-600 hover:text-violet-900" @click="openCommissionConfig(agent)">
                  记佣配置
                </button>
                <button
                  v-if="agent.status === AGENT_STATUS.ACTIVE"
                  type="button"
                  class="text-yellow-600 hover:text-yellow-900"
                  @click="updateStatus(agent, AGENT_STATUS.SUSPENDED)"
                >
                  暂停
                </button>
                <button v-else type="button" class="text-green-600 hover:text-green-900" @click="updateStatus(agent, AGENT_STATUS.ACTIVE)">
                  激活
                </button>
              </td>
            </tr>
            <tr v-if="agentList.length === 0 && !loading">
              <td colspan="7" class="px-6 py-10 text-center text-gray-500">暂无代理数据</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="pagination.total > 0"
        class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between"
      >
        <div class="text-sm text-slate-700">
          共 <span class="font-medium">{{ pagination.total }}</span> 条记录， 每页显示
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
            type="button"
            class="ant-btn !h-8 !px-3 !text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            :disabled="pagination.currentPage === 1 || loading"
            @click="pagination.currentPage--"
          >
            上一页
          </button>

          <div class="flex items-center space-x-1">
            <template v-for="page in totalPages" :key="page">
              <button
                v-if="page === 1 || page === totalPages || (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)"
                type="button"
                :class="[
                  'ant-btn !h-8 !w-8 !p-0 !text-xs transition-colors',
                  pagination.currentPage === page ? 'ant-btn-primary' : ''
                ]"
                @click="pagination.currentPage = page"
              >
                {{ page }}
              </button>
              <span v-else-if="page === 2 && pagination.currentPage > 3" class="text-slate-400 text-xs px-1">...</span>
              <span
                v-else-if="page === totalPages - 1 && pagination.currentPage < totalPages - 2"
                class="text-slate-400 text-xs px-1"
              >...</span>
            </template>
          </div>

          <button
            type="button"
            class="ant-btn !h-8 !px-3 !text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            :disabled="pagination.currentPage === totalPages || loading"
            @click="pagination.currentPage++"
          >
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- 添加代理 -->
    <div v-if="showUpgradeModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-slate-900 mb-5">添加代理</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">用户 UID</label>
            <input v-model="upgradeForm.uid" type="text" placeholder="请输入用户 UID" class="ant-input" />
          </div>
          <p class="text-xs text-slate-500 leading-relaxed">
            添加后可在列表中打开「记佣配置」调整该代理各产品线比例；未单独配置时使用代理记佣全局默认。
          </p>
        </div>

        <div class="mt-8 flex justify-end space-x-3">
          <button type="button" class="ant-btn" @click="showUpgradeModal = false">取消</button>
          <button type="button" class="ant-btn ant-btn-primary" @click="handleUpgrade">确认添加</button>
        </div>
      </div>
    </div>

    <!-- 产品线记佣 -->
    <div
      v-if="showCommissionModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 overflow-y-auto"
    >
      <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-4xl max-h-[92vh] overflow-y-auto my-4">
        <div class="flex justify-between items-start mb-4 border-b border-slate-100 pb-3">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">代理产品线记佣</h3>
            <p class="mt-1 text-sm text-slate-500">
              UID {{ commissionTargetUid }} · 代理线仅一级比例 · 各产品线可单独开关
            </p>
          </div>
          <button type="button" class="text-slate-400 hover:text-slate-600" @click="closeCommissionModal">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="commissionLoading" class="py-20 flex justify-center">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
        </div>

        <div v-else-if="commissionDraft" class="space-y-8">
          <div v-for="group in AGENT_PRODUCT_GROUPS" :key="group.id">
            <div class="mb-3 flex flex-wrap items-end gap-2 border-b border-slate-100 pb-2">
              <h4 class="text-sm font-semibold text-slate-900">{{ group.name }}</h4>
              <span class="text-xs text-slate-500">{{ group.blurb }}</span>
            </div>
            <div class="grid w-full gap-4" :class="groupGridClass(group)">
              <div
                v-for="line in linesInAgentGroup(group)"
                :key="line.key"
                class="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
                :class="['border-l-4', BORDER_ACCENT[line.theme]]"
              >
                <div class="flex items-start justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-4 py-3">
                  <div class="min-w-0">
                    <h5 class="text-sm font-semibold text-slate-900">{{ line.title }}</h5>
                  </div>
                  <div class="flex shrink-0 flex-col items-end gap-0.5">
                    <span class="text-[10px] font-medium uppercase tracking-wide text-slate-400">记佣</span>
                    <button
                      type="button"
                      :class="isLineEnabledDraft(line) ? 'bg-blue-600' : 'bg-slate-200'"
                      class="relative inline-flex h-6 w-11 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none"
                      @click="toggleLineDraft(line)"
                    >
                      <span
                        :class="isLineEnabledDraft(line) ? 'translate-x-5' : 'translate-x-0'"
                        class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition"
                      />
                    </button>
                  </div>
                </div>

                <div class="flex flex-1 flex-col p-4" :class="{ 'bg-slate-50/40': !isLineEnabledDraft(line) }">
                  <template v-if="isLineEnabledDraft(line)">
                    <label class="mt-2 block text-xs font-medium text-slate-700" :for="'ac-rate-' + line.key">比例（0～1）</label>
                    <input
                      :id="'ac-rate-' + line.key"
                      type="number"
                      min="0"
                      max="1"
                      step="0.001"
                      class="ant-input mt-1 w-full max-w-[200px] text-sm"
                      :value="rateNumForDraft(line)"
                      @input="setDraftRate(line, $event.target.value)"
                    />
                    <p class="mt-2 text-[11px] text-slate-500">
                      约 {{ (rateNumForDraft(line) * 100).toFixed(2) }}%
                    </p>
                  </template>
                  <p v-else class="text-sm text-slate-500">未参与记佣</p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button type="button" class="ant-btn" @click="closeCommissionModal">取消</button>
            <button
              type="button"
              class="ant-btn ant-btn-primary"
              :disabled="commissionSaving"
              @click="saveCommissionConfig"
            >
              {{ commissionSaving ? '保存中…' : '保存' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情 -->
    <div v-if="showDetailModal && selectedAgent" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
          <h3 class="text-lg font-semibold text-slate-900">代理详情</h3>
          <button type="button" class="text-slate-400 hover:text-slate-600 transition-colors" @click="showDetailModal = false">
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
            <span class="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">身份</span>
            <span class="inline-flex w-fit px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
              {{ AGENT_ROLE_LABEL }}
            </span>
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

        <div class="mt-8 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            class="ant-btn ant-btn-primary flex-1 !h-10"
            @click="
              showDetailModal = false;
              openCommissionConfig(selectedAgent);
            "
          >
            编辑产品线记佣
          </button>
          <button type="button" class="ant-btn flex-1 !h-10" @click="showDetailModal = false">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
button:focus {
  outline: none;
}
</style>
