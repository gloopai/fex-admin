<script setup>
import { computed, ref, nextTick, reactive, watch } from 'vue'
import {
  DELIVERY_RULE_STATUS,
  DELIVERY_RULE_PRIORITY,
  DELIVERY_RULE_TRIGGER_TYPE,
  DELIVERY_RULE_ACTION
} from '../../constants/deliveryControl'
import {
  createDeliveryAutoRulesMock,
  createRuleStatisticsMock
} from '../../mock/deliveryControl'
import DeliveryRuleModal from '../../components/DeliveryRuleModal.vue'

const rules = ref(createDeliveryAutoRulesMock())
const statistics = ref(createRuleStatisticsMock())

// 模态框状态
const modalOpen = ref(false)
const modalMode = ref('create') // 'create' | 'edit' | 'duplicate'
const currentRule = ref(null)

const keyword = ref('')
const statusFilter = ref('all')
const priorityFilter = ref('all')

// 分页状态
const pagination = reactive({
  currentPage: 1,
  pageSize: 5,
  total: 0
})

const summary = computed(() => [
  { label: '规则总数', value: statistics.value.totalRules, icon: '📋', color: 'blue' },
  { label: '运行中', value: statistics.value.enabledRules, icon: '✅', color: 'emerald' },
  { label: '今日触发', value: statistics.value.todayHits, icon: '⚡', color: 'orange' },
  { label: '今日影响用户', value: statistics.value.todayAffectedUsers, icon: '👥', color: 'violet' }
])

const allFilteredRules = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return rules.value.filter((r) => {
    const hitStatus = statusFilter.value === 'all' || r.status === statusFilter.value
    const hitPriority = priorityFilter.value === 'all' || r.priority === priorityFilter.value
    const hitKw = !kw || `${r.name} ${r.description}`.toLowerCase().includes(kw)
    return hitStatus && hitPriority && hitKw
  })
})

const filteredRules = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return allFilteredRules.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(allFilteredRules.value.length / pagination.pageSize))

// 监听筛选变化，重置页码
watch([statusFilter, priorityFilter, keyword], () => {
  pagination.currentPage = 1
})

const priorityClass = (priority) => {
  const map = {
    [DELIVERY_RULE_PRIORITY.HIGH]: 'bg-rose-50 text-rose-600 border-rose-100',
    [DELIVERY_RULE_PRIORITY.MEDIUM]: 'bg-amber-50 text-amber-600 border-amber-100',
    [DELIVERY_RULE_PRIORITY.LOW]: 'bg-slate-50 text-slate-500 border-slate-100'
  }
  return map[priority] || 'bg-slate-50 text-slate-500 border-slate-100'
}

const priorityLabel = (priority) => {
  const map = {
    [DELIVERY_RULE_PRIORITY.HIGH]: '高',
    [DELIVERY_RULE_PRIORITY.MEDIUM]: '中',
    [DELIVERY_RULE_PRIORITY.LOW]: '低'
  }
  return map[priority] || '-'
}

const statusClass = (status) => {
  const map = {
    [DELIVERY_RULE_STATUS.ENABLED]: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    [DELIVERY_RULE_STATUS.DISABLED]: 'bg-slate-50 text-slate-400 border-slate-100',
    [DELIVERY_RULE_STATUS.PAUSED]: 'bg-orange-50 text-orange-600 border-orange-100'
  }
  return map[status] || 'bg-slate-50 text-slate-400 border-slate-100'
}

const statusLabel = (status) => {
  const map = {
    [DELIVERY_RULE_STATUS.ENABLED]: '运行中',
    [DELIVERY_RULE_STATUS.DISABLED]: '已禁用',
    [DELIVERY_RULE_STATUS.PAUSED]: '已暂停'
  }
  return map[status] || '-'
}

const triggerTypeLabel = (type) => {
  const map = {
    [DELIVERY_RULE_TRIGGER_TYPE.TRADE_COUNT]: '交易次数',
    [DELIVERY_RULE_TRIGGER_TYPE.PROFIT_LOSS]: '盈亏',
    [DELIVERY_RULE_TRIGGER_TYPE.DAILY_PROFIT]: '日盈利',
    [DELIVERY_RULE_TRIGGER_TYPE.POSITION_VALUE]: '持仓价值',
    [DELIVERY_RULE_TRIGGER_TYPE.CONSECUTIVE_WINS]: '连续盈利',
    [DELIVERY_RULE_TRIGGER_TYPE.CONSECUTIVE_LOSS]: '连续亏损',
    [DELIVERY_RULE_TRIGGER_TYPE.NET_DEPOSIT]: '净入金'
  }
  return map[type] || '-'
}

const actionTypeLabel = (type) => {
  const map = {
    [DELIVERY_RULE_ACTION.FORCE_WIN]: '强制盈利',
    [DELIVERY_RULE_ACTION.FORCE_LOSS]: '强制亏损',
    [DELIVERY_RULE_ACTION.PRICE_ADJUST]: '价格调整',
    [DELIVERY_RULE_ACTION.PROFIT_CONTROL]: '盈亏控制',
    [DELIVERY_RULE_ACTION.REJECT_ORDER]: '订单拒绝',
    [DELIVERY_RULE_ACTION.LIMIT_POSITION]: '仓位限制'
  }
  return map[type] || '-'
}

const toggleRuleStatus = (ruleId) => {
  const rule = rules.value.find((r) => r.id === ruleId)
  if (!rule) return
  
  if (rule.status === DELIVERY_RULE_STATUS.ENABLED) {
    rule.status = DELIVERY_RULE_STATUS.PAUSED
  } else {
    rule.status = DELIVERY_RULE_STATUS.ENABLED
  }
}

const deleteRule = (ruleId) => {
  if (confirm('确定要删除这条规则吗？删除后将无法恢复。')) {
    rules.value = rules.value.filter((r) => r.id !== ruleId)
  }
}

const openCreateModal = () => {
  modalMode.value = 'create'
  currentRule.value = null
  nextTick(() => {
    modalOpen.value = true
  })
}

const openEditModal = (rule) => {
  modalMode.value = 'edit'
  currentRule.value = rule
  nextTick(() => {
    modalOpen.value = true
  })
}

const openDuplicateModal = (rule) => {
  modalMode.value = 'duplicate'
  currentRule.value = rule
  nextTick(() => {
    modalOpen.value = true
  })
}

const closeModal = () => {
  modalOpen.value = false
  currentRule.value = null
}

const saveRule = (ruleData) => {
  if (modalMode.value === 'create' || modalMode.value === 'duplicate') {
    // 新增规则
    const newRule = {
      id: `rule_${Date.now()}`,
      ...ruleData,
      hitCount: 0,
      lastHitAt: '-',
      totalAffectedUsers: 0,
      createdAt: new Date().toLocaleString('zh-CN'),
      updatedAt: new Date().toLocaleString('zh-CN')
    }
    rules.value.unshift(newRule)
  } else if (modalMode.value === 'edit') {
    // 编辑规则
    const index = rules.value.findIndex(r => r.id === currentRule.value.id)
    if (index !== -1) {
      rules.value[index] = {
        ...rules.value[index],
        ...ruleData,
        updatedAt: new Date().toLocaleString('zh-CN')
      }
    }
  }
  
  closeModal()
}
</script>

<template>
  <section class="space-y-4">
    <!-- Page Header -->
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl font-semibold text-slate-900">场控规则管理</h1>
        <p class="mt-1 text-sm text-slate-500">智能化场控系统，根据用户交易行为自动触发规则并执行干预操作</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        @click="openCreateModal"
      >
        <span class="text-base">+</span>
        <span>新增规则</span>
      </button>
    </header>

    <div class="space-y-6">
      <!-- 统计卡片 -->
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="card in summary"
          :key="card.label"
          class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-500">{{ card.label }}</p>
              <p class="mt-2 text-2xl font-bold text-slate-900 font-mono">{{ card.value }}</p>
            </div>
            <div class="h-10 w-10 rounded-lg flex items-center justify-center bg-slate-50 border border-slate-100">
              <svg
                v-if="card.label === '规则总数'"
                class="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <path d="M8 8h8M8 12h8M8 16h8" />
              </svg>
              <svg
                v-else-if="card.label === '运行中'"
                class="h-6 w-6 text-emerald-500"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9 12l2 2l4 -4" />
              </svg>
              <svg
                v-else-if="card.label === '今日触发'"
                class="h-6 w-6 text-orange-500"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
              <svg
                v-else
                class="h-6 w-6 text-violet-500"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8" />
                <path d="M12 8v8" />
              </svg>
            </div>
          </div>
        </article>
      </div>

      <!-- 规则列表 -->
      <article class="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-4 md:px-6">
          <div class="flex flex-wrap items-center gap-3">
            <div class="relative w-72">
              <input
                v-model="keyword"
                type="text"
                placeholder="搜索规则名称或描述..."
                class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
              />
              <svg viewBox="0 0 20 20" class="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none">
                <circle cx="9" cy="9" r="5.8" stroke="currentColor" stroke-width="1.6" />
                <path d="M13.6 13.6L16.4 16.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              </svg>
            </div>
            <select
              v-model="statusFilter"
              class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="all">全部状态</option>
              <option :value="DELIVERY_RULE_STATUS.ENABLED">运行中</option>
              <option :value="DELIVERY_RULE_STATUS.PAUSED">已暂停</option>
              <option :value="DELIVERY_RULE_STATUS.DISABLED">已禁用</option>
            </select>
            <select
              v-model="priorityFilter"
              class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="all">全部优先级</option>
              <option :value="DELIVERY_RULE_PRIORITY.HIGH">高优先级</option>
              <option :value="DELIVERY_RULE_PRIORITY.MEDIUM">中优先级</option>
              <option :value="DELIVERY_RULE_PRIORITY.LOW">低优先级</option>
            </select>
            <button
              type="button"
              class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              @click="
                keyword = '';
                statusFilter = 'all';
                priorityFilter = 'all'
              "
            >
              重置
            </button>
          </div>
        </div>

        <div class="p-4 md:p-6 space-y-4">
          <article
            v-for="rule in filteredRules"
            :key="rule.id"
            class="group relative overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:border-blue-500/30 hover:shadow-md"
          >
            <div class="p-5">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                  <div class="flex items-center gap-3 flex-wrap">
                    <h3 class="text-lg font-bold text-slate-900">{{ rule.name }}</h3>
                    <span
                      class="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border"
                      :class="statusClass(rule.status)"
                    >
                      <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
                      {{ statusLabel(rule.status) }}
                    </span>
                    <span
                      class="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border"
                      :class="priorityClass(rule.priority)"
                    >
                      优先级: {{ priorityLabel(rule.priority) }}
                    </span>
                  </div>
                  <p class="mt-2 text-sm text-slate-500">{{ rule.description }}</p>

                  <!-- 触发条件和执行动作 -->
                  <div class="mt-4 flex flex-wrap items-center gap-3">
                    <div class="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-100 px-3 py-1.5 text-xs">
                      <span class="text-blue-600 font-bold">触发:</span>
                      <span class="text-slate-700 font-medium">
                        {{ triggerTypeLabel(rule.trigger.type) }}
                        <template v-if="rule.trigger.threshold !== undefined">
                          {{ rule.trigger.operator }} {{ rule.trigger.threshold }}
                          {{ rule.trigger.unit }}
                        </template>
                      </span>
                    </div>
                    <svg class="h-4 w-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <div class="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-1.5 text-xs">
                      <span class="text-blue-600 font-bold">执行:</span>
                      <span class="text-blue-700 font-medium">{{ actionTypeLabel(rule.action.type) }}</span>
                    </div>
                  </div>

                  <!-- 统计信息 -->
                  <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                    <div>
                      <p class="text-[10px] text-slate-400 uppercase font-bold">累计触发</p>
                      <p class="mt-1 text-sm font-bold text-slate-900 font-mono">{{ rule.hitCount }} 次</p>
                    </div>
                    <div>
                      <p class="text-[10px] text-slate-400 uppercase font-bold">影响用户</p>
                      <p class="mt-1 text-sm font-bold text-slate-900 font-mono">{{ rule.totalAffectedUsers }} 人</p>
                    </div>
                    <div class="sm:col-span-2">
                      <p class="text-[10px] text-slate-400 uppercase font-bold">最后触发</p>
                      <p class="mt-1 text-sm font-medium text-slate-600">{{ rule.lastHitAt }}</p>
                    </div>
                  </div>
                </div>

                <!-- 操作按钮 -->
                <div class="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    class="rounded-lg bg-white border border-slate-200 p-2 text-slate-600 hover:text-blue-600 hover:border-blue-600 transition-all shadow-sm"
                    title="编辑"
                    @click="openEditModal(rule)"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="rounded-lg bg-white border border-slate-200 p-2 text-slate-600 hover:text-emerald-600 hover:border-emerald-600 transition-all shadow-sm"
                    title="复制"
                    @click="openDuplicateModal(rule)"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="rounded-lg bg-white border border-slate-200 p-2 text-slate-600 hover:text-rose-600 hover:border-rose-600 transition-all shadow-sm"
                    title="删除"
                    @click="deleteRule(rule.id)"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- 状态切换遮罩 -->
            <div
              v-if="rule.status === DELIVERY_RULE_STATUS.DISABLED"
              class="absolute inset-0 bg-slate-50/60 backdrop-blur-[1px] flex items-center justify-center"
            >
              <div class="text-center">
                <p class="text-sm font-bold text-slate-400 uppercase tracking-widest">该规则已禁用</p>
                <button
                  type="button"
                  class="mt-3 rounded-lg bg-white border border-slate-200 px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                  @click="toggleRuleStatus(rule.id)"
                >
                  立即启用
                </button>
              </div>
            </div>
          </article>
        </div>

        <!-- 分页 -->
        <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-slate-100 p-4 md:px-6">
          <div class="text-sm text-slate-500">
            共 <span class="font-bold text-slate-900">{{ allFilteredRules.length }}</span> 条规则，第
            <span class="font-bold text-slate-900">{{ pagination.currentPage }}</span> / {{ totalPages }} 页
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="pagination.currentPage === 1"
              @click="pagination.currentPage--"
            >
              上一页
            </button>
            <button
              type="button"
              class="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="pagination.currentPage === totalPages"
              @click="pagination.currentPage++"
            >
              下一页
            </button>
          </div>
        </div>
      </article>
    </div>

    <!-- 规则编辑模态框 -->
    <DeliveryRuleModal
      :open="modalOpen"
      :mode="modalMode"
      :rule="currentRule"
      @close="closeModal"
      @save="saveRule"
    />
  </section>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
