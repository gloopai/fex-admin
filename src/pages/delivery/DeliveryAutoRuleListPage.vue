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
    [DELIVERY_RULE_PRIORITY.HIGH]: 'bg-rose-100 text-rose-700',
    [DELIVERY_RULE_PRIORITY.MEDIUM]: 'bg-amber-100 text-amber-700',
    [DELIVERY_RULE_PRIORITY.LOW]: 'bg-slate-100 text-slate-700'
  }
  return map[priority] || 'bg-slate-100 text-slate-700'
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
    [DELIVERY_RULE_STATUS.ENABLED]: 'bg-emerald-100 text-emerald-700',
    [DELIVERY_RULE_STATUS.DISABLED]: 'bg-slate-200 text-slate-600',
    [DELIVERY_RULE_STATUS.PAUSED]: 'bg-amber-100 text-amber-700'
  }
  return map[status] || 'bg-slate-100 text-slate-700'
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
  <section class="space-y-5">
    <header>
      <h1 class="text-3xl font-semibold text-slate-900">场控规则管理</h1>
      <p class="mt-1 text-sm text-slate-500">智能化场控系统，自动触发规则执行干预操作</p>
    </header>

    <!-- 统计卡片 -->
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article v-for="card in summary" :key="card.label" class="rounded-xl border border-slate-200 bg-white p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-slate-500">{{ card.label }}</p>
            <p class="mt-2 text-3xl font-semibold text-slate-900">{{ card.value }}</p>
          </div>
          <!-- 线框图标 -->
          <span>
            <svg v-if="card.label === '规则总数'" class="h-8 w-8 text-blue-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h8"/></svg>
            <svg v-else-if="card.label === '运行中'" class="h-8 w-8 text-emerald-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2l4 -4"/></svg>
            <svg v-else-if="card.label === '今日触发'" class="h-8 w-8 text-orange-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            <svg v-else class="h-8 w-8 text-violet-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
          </span>
        </div>
      </article>
    </div>

    <!-- 规则列表 -->
    <div>
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <input
            v-model="keyword"
            type="text"
            placeholder="搜索规则名称或描述..."
            class="w-full min-w-[280px] rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          />
          <select v-model="statusFilter" class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <option value="all">全部状态</option>
            <option :value="DELIVERY_RULE_STATUS.ENABLED">运行中</option>
            <option :value="DELIVERY_RULE_STATUS.PAUSED">已暂停</option>
            <option :value="DELIVERY_RULE_STATUS.DISABLED">已禁用</option>
          </select>
          <select v-model="priorityFilter" class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <option value="all">全部优先级</option>
            <option :value="DELIVERY_RULE_PRIORITY.HIGH">高优先级</option>
            <option :value="DELIVERY_RULE_PRIORITY.MEDIUM">中优先级</option>
            <option :value="DELIVERY_RULE_PRIORITY.LOW">低优先级</option>
          </select>
        </div>
        <button 
          type="button" 
          class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          @click="openCreateModal"
        >
          + 新增规则
        </button>
      </div>

      <div class="space-y-3">
        <article
          v-for="rule in filteredRules"
          :key="rule.id"
          class="rounded-xl border p-5 transition"
          :class="rule.status === DELIVERY_RULE_STATUS.ENABLED ? 'border-blue-200 bg-blue-50/30' : 'border-slate-200 bg-white'"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-xl text-slate-900">{{ rule.name }}</h3>
                <span class="rounded-md px-2 py-0.5 text-xs" :class="statusClass(rule.status)">
                  {{ statusLabel(rule.status) }}
                </span>
                <span class="rounded-md px-2 py-0.5 text-xs" :class="priorityClass(rule.priority)">
                  优先级: {{ priorityLabel(rule.priority) }}
                </span>
              </div>
              <p class="mt-2 text-sm text-slate-600">{{ rule.description }}</p>

              <!-- 触发条件和执行动作 -->
              <div class="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span class="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-slate-600 border border-slate-200">
                  <svg class="h-3 w-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="4" y="4" width="16" height="16" rx="2" stroke-width="2" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 8h8M8 12h8M8 16h8" />
                  </svg>
                  <span>
                    {{ triggerTypeLabel(rule.trigger.type) }}
                    <template v-if="rule.trigger.threshold !== undefined">
                      <span> ≥ {{ rule.trigger.threshold }}</span>
                    </template>
                    <template v-if="rule.trigger.period">
                      <span>（{{ rule.trigger.period === 'today' ? '今日' : rule.trigger.period === 'last_1h' ? '1小时' : rule.trigger.period === 'last_4h' ? '4小时' : rule.trigger.period === 'last_24h' ? '24小时' : rule.trigger.period }}）</span>
                    </template>
                    <template v-if="rule.trigger.conditions && rule.trigger.conditions.totalProfit">
                      <span>，盈利 {{ rule.trigger.conditions.totalProfit.operator }} {{ rule.trigger.conditions.totalProfit.value }}</span>
                    </template>
                  </span>
                </span>
                <span class="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-slate-600 border border-slate-200">
                  <svg class="h-3 w-3 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="4" y="4" width="16" height="16" rx="2" stroke-width="2" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 8h8M8 12h8M8 16h8" />
                  </svg>
                  <span>
                    {{ actionTypeLabel(rule.action.type) }}
                    <template v-if="rule.action.type === 'profit_control' && rule.action.params && rule.action.params.profitControl">
                      （胜率{{ Math.round((rule.action.params.profitControl.winProbability || 0) * 100) }}%，盈利{{ rule.action.params.profitControl.avgWinAmount || 0 }}%，亏损{{ rule.action.params.profitControl.avgLossAmount || 0 }}%）
                    </template>
                    <template v-if="rule.action.type === 'force_loss' && rule.action.params">
                      （亏损{{ Math.round((rule.action.params.lossPercent || 0) * 100) }}%，{{ rule.action.params.nextPositionCount || 1 }}单）
                    </template>
                    <template v-if="rule.action.type === 'force_win' && rule.action.params">
                      （盈利{{ Math.round((rule.action.params.profitPercent || 0) * 100) }}%，{{ rule.action.params.nextPositionCount || 1 }}单）
                    </template>
                    <template v-if="rule.action.type === 'price_adjust' && rule.action.params">
                      （{{ rule.action.params.settlePriceMode === 'unfavorable' ? '不利结算价' : rule.action.params.settlePriceMode === 'favorable' ? '有利结算价' : '市场价' }}，偏移{{ rule.action.params.offsetPercent || 0 }}%）
                    </template>
                    <template v-if="rule.action.type === 'reject_order' && rule.action.params">
                      （锁定新开仓）
                    </template>
                  </span>
                </span>
                </div>

              <!-- 统计数据 -->
              <div class="mt-3 grid grid-cols-3 gap-4">
                <div class="rounded-lg bg-slate-50 p-2.5">
                  <p class="text-xs text-slate-500">触发次数</p>
                  <p class="mt-1 text-slate-900">{{ rule.hitCount }}</p>
                </div>
                <div class="rounded-lg bg-slate-50 p-2.5">
                  <p class="text-xs text-slate-500">影响用户</p>
                  <p class="mt-1 text-slate-900">{{ rule.totalAffectedUsers }}</p>
                </div>
                <div class="rounded-lg bg-slate-50 p-2.5">
                  <p class="text-xs text-slate-500">最近触发</p>
                  <p class="mt-1 text-xs text-slate-700">{{ rule.lastHitAt }}</p>
                </div>
              </div>
            </div>

            <!-- 操作按钮和开关 -->
            <div class="flex flex-col items-end gap-2">
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="relative h-6 w-11 rounded-full border border-slate-300 transition"
                  :class="rule.status === DELIVERY_RULE_STATUS.ENABLED ? 'bg-blue-500' : 'bg-slate-100'"
                  @click="toggleRuleStatus(rule.id)"
                >
                  <span
                    class="absolute top-0.5 h-5 w-5 rounded-full bg-white border border-slate-300 transition"
                    :class="rule.status === DELIVERY_RULE_STATUS.ENABLED ? 'left-5' : 'left-0.5'"
                  ></span>
                </button>
                <button
                  type="button"
                  class="px-3  text-sm py-1 border border-blue-400 rounded text-blue-600 bg-white hover:bg-blue-50 transition"
                  @click="openEditModal(rule)"
                >
                  编辑
                </button>
                <button
                  type="button"
                  class="px-3 py-1 text-sm border border-slate-400 rounded text-slate-600 bg-white hover:bg-slate-50 transition"
                  @click="openDuplicateModal(rule)"
                >
                  复制
                </button>
                <button
                  type="button"
                  class="px-3 py-1 text-sm border border-rose-400 rounded text-rose-600 bg-white hover:bg-rose-50 transition"
                  @click="deleteRule(rule.id)"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- 分页组件 -->
      <div v-if="totalPages > 1" class="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-6 py-4">
        <div class="text-sm text-slate-600">
          共 <span class="font-medium">{{ allFilteredRules.length }}</span> 条规则，第 <span class="font-medium">{{ pagination.currentPage }}</span> / <span class="font-medium">{{ totalPages }}</span> 页
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="pagination.currentPage--"
            :disabled="pagination.currentPage === 1"
            class="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            上一页
          </button>
          <button
            type="button"
            @click="pagination.currentPage++"
            :disabled="pagination.currentPage === totalPages"
            class="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- 规则配置模态框 -->
    <DeliveryRuleModal
      :open="modalOpen"
      :mode="modalMode"
      :rule="currentRule"
      @close="closeModal"
      @save="saveRule"
    />
  </section>
</template>
