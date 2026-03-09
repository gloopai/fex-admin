<script setup>
import { computed, reactive, ref, watch } from 'vue'
import ControlConfigModal from '../../components/ControlConfigModal.vue'
import {
  PERP_CONTROL_CONTRACT_STATUS,
  PERP_CONTROL_OFFSET_DIRECTION,
  PERP_CONTROL_RULE_DIRECTION,
  PERP_CONTROL_RULE_MODAL_TAB,
  PERP_CONTROL_RULE_TRIGGER_TYPE
} from '../../constants/perpetualControl'
import {
  createPerpetualControlContractsMock,
  perpetualControlOffsetDirections,
  perpetualControlRuleTriggers
} from '../../mock/perpetualControl'
import { createDefaultPerpetualControlConfig } from '../../mock/perpetual'

const contracts = ref(createPerpetualControlContractsMock())

const keyword = ref('')
const filteredContracts = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return contracts.value
  return contracts.value.filter((item) => `${item.symbol} ${item.alias}`.toLowerCase().includes(kw))
})

const summary = computed(() => {
  const total = contracts.value.length
  const monitoring = contracts.value.filter((item) => item.status === PERP_CONTROL_CONTRACT_STATUS.RUNNING).length
  const autoOn = contracts.value.filter((item) => item.config.autoTriggerEnabled).length
  const autoOff = contracts.value.filter((item) => !item.config.autoTriggerEnabled).length
  return [
    { label: '合约总数', value: String(total) },
    { label: '线控中', value: String(monitoring) },
    { label: '自动触发已开启', value: String(autoOn) },
    { label: '自动触发已关闭', value: String(autoOff) }
  ]
})

const formatParams = (config) => {
  const direction = {
    [PERP_CONTROL_OFFSET_DIRECTION.RANDOM]: '随机偏移',
    [PERP_CONTROL_OFFSET_DIRECTION.UP]: '向上偏移',
    [PERP_CONTROL_OFFSET_DIRECTION.DOWN]: '向下偏移'
  }[config.offsetDirection] || '随机偏移'
  return [
    `价格偏移: ${config.priceOffset} 点 (${direction})`,
    `点差倍数: ${config.spreadMultiplier.toFixed(1)}x`,
    `滑点率: ${config.slippagePct.toFixed(2)}%`,
    `成交延迟: ${config.latencyMs}ms`,
    `拒单率: ${config.rejectRatePct.toFixed(1)}%`,
    `杠杆限制: ${config.maxLeverage}x`,
    `自动触发: ${config.autoTriggerEnabled ? '启用' : '关闭'}`
  ]
}

const showConfigModal = ref(false)
const activeConfigContractId = ref('')
const activeConfig = computed(() => contracts.value.find((item) => item.id === activeConfigContractId.value)?.config || createDefaultPerpetualControlConfig())

const openConfig = (contractId) => {
  activeConfigContractId.value = contractId
  showConfigModal.value = true
}

const saveConfig = (next) => {
  contracts.value = contracts.value.map((contract) =>
    contract.id === activeConfigContractId.value ? { ...contract, config: { ...next } } : contract
  )
  showConfigModal.value = false
}

const showRuleModal = ref(false)
const activeContractId = ref('')
const editingRuleId = ref(null)
const ruleModalTab = ref(PERP_CONTROL_RULE_MODAL_TAB.BASIC)
const ruleTriggers = perpetualControlRuleTriggers
const offsetDirections = perpetualControlOffsetDirections

const ruleForm = reactive({
  name: '',
  triggerType: PERP_CONTROL_RULE_TRIGGER_TYPE.NET_POSITION,
  thresholdValue: 100000,
  triggerDirection: PERP_CONTROL_RULE_DIRECTION.LONG_HEAVY,
  priceOffset: 5,
  offsetDirection: PERP_CONTROL_OFFSET_DIRECTION.AGAINST,
  spreadMultiplier: 1.2,
  slippagePct: 0.2,
  rejectRatePct: 3,
  durationSec: 0,
  enabled: true
})

const triggerMeta = computed(() => ruleTriggers[ruleForm.triggerType] || ruleTriggers[PERP_CONTROL_RULE_TRIGGER_TYPE.NET_POSITION])
const triggerOptions = computed(() => Object.entries(ruleTriggers).map(([value, cfg]) => ({ value, label: cfg.label })))
const currentTriggerDirectionLabel = computed(
  () => triggerMeta.value.directionOptions.find((item) => item.value === ruleForm.triggerDirection)?.label || '-'
)
const currentOffsetDirectionLabel = computed(() => offsetDirections.find((item) => item.value === ruleForm.offsetDirection)?.label || '-')
const durationText = computed(() => (Number(ruleForm.durationSec) === 0 ? '持续生效' : `${Number(ruleForm.durationSec)} 秒`))
watch(
  () => ruleForm.triggerType,
  (next) => {
    const options = ruleTriggers[next]?.directionOptions || []
    if (!options.some((item) => item.value === ruleForm.triggerDirection)) {
      ruleForm.triggerDirection = options[0]?.value || PERP_CONTROL_RULE_DIRECTION.LONG_HEAVY
    }
  }
)

const formatThreshold = (type, value) => {
  if (type === PERP_CONTROL_RULE_TRIGGER_TYPE.NET_POSITION) return `$${Number(value).toLocaleString()}`
  if (type === PERP_CONTROL_RULE_TRIGGER_TYPE.PNL_RATIO || type === PERP_CONTROL_RULE_TRIGGER_TYPE.VOLATILITY) return `${Number(value)}%`
  return `${Number(value)}x`
}

const ruleConditionText = (rule) => {
  const meta = ruleTriggers[rule.triggerType] || ruleTriggers[PERP_CONTROL_RULE_TRIGGER_TYPE.NET_POSITION]
  const direction = meta.directionOptions.find((item) => item.value === rule.triggerDirection)?.label || ''
  return `${direction} | ${formatThreshold(rule.triggerType, rule.thresholdValue)}`
}

const ruleActionText = (rule) => {
  const duration = Number(rule.durationSec) === 0 ? '持续生效' : `${Number(rule.durationSec)} 秒`
  return `偏移 ${rule.priceOffset} 点 | 点差 ${rule.spreadMultiplier.toFixed(1)}x | 滑点 ${rule.slippagePct.toFixed(2)}% | 拒单 ${rule.rejectRatePct.toFixed(1)}% | ${duration}`
}

const liveRuleConditionText = computed(
  () => `${currentTriggerDirectionLabel.value} | ${formatThreshold(ruleForm.triggerType, ruleForm.thresholdValue)}`
)
const liveRuleActionText = computed(
  () =>
    `偏移 ${ruleForm.priceOffset} 点（${currentOffsetDirectionLabel.value}） | 点差 ${ruleForm.spreadMultiplier.toFixed(1)}x | 滑点 ${ruleForm.slippagePct.toFixed(
      2
    )}% | 拒单 ${ruleForm.rejectRatePct.toFixed(1)}% | ${durationText.value}`
)

const toneClass = {
  up: 'text-emerald-600',
  down: 'text-rose-600',
  neutral: 'text-slate-900'
}

const currentContract = computed(() => contracts.value.find((item) => item.id === activeContractId.value) || null)

const resetRuleForm = () => {
  ruleForm.name = ''
  ruleForm.triggerType = PERP_CONTROL_RULE_TRIGGER_TYPE.NET_POSITION
  ruleForm.thresholdValue = 100000
  ruleForm.triggerDirection = PERP_CONTROL_RULE_DIRECTION.LONG_HEAVY
  ruleForm.priceOffset = 5
  ruleForm.offsetDirection = PERP_CONTROL_OFFSET_DIRECTION.AGAINST
  ruleForm.spreadMultiplier = 1.2
  ruleForm.slippagePct = 0.2
  ruleForm.rejectRatePct = 3
  ruleForm.durationSec = 0
  ruleForm.enabled = true
}

const openAddRule = (contractId) => {
  activeContractId.value = contractId
  editingRuleId.value = null
  ruleModalTab.value = PERP_CONTROL_RULE_MODAL_TAB.BASIC
  resetRuleForm()
  showRuleModal.value = true
}

const openEditRule = (contractId, rule) => {
  activeContractId.value = contractId
  editingRuleId.value = rule.id
  ruleModalTab.value = PERP_CONTROL_RULE_MODAL_TAB.BASIC
  ruleForm.name = rule.name
  ruleForm.triggerType = rule.triggerType || PERP_CONTROL_RULE_TRIGGER_TYPE.NET_POSITION
  ruleForm.thresholdValue = Number(rule.thresholdValue || 100000)
  ruleForm.triggerDirection = rule.triggerDirection || (ruleForm.triggerType === PERP_CONTROL_RULE_TRIGGER_TYPE.NET_POSITION ? PERP_CONTROL_RULE_DIRECTION.LONG_HEAVY : PERP_CONTROL_RULE_DIRECTION.PROFIT_HIGH)
  ruleForm.priceOffset = Number(rule.priceOffset || 5)
  ruleForm.offsetDirection = rule.offsetDirection || PERP_CONTROL_OFFSET_DIRECTION.AGAINST
  ruleForm.spreadMultiplier = Number(rule.spreadMultiplier || 1.2)
  ruleForm.slippagePct = Number(rule.slippagePct || 0.2)
  ruleForm.rejectRatePct = Number(rule.rejectRatePct || 3)
  ruleForm.durationSec = Number(rule.durationSec || 0)
  ruleForm.enabled = rule.enabled
  showRuleModal.value = true
}

const saveRule = () => {
  if (!currentContract.value || !ruleForm.name.trim() || Number(ruleForm.thresholdValue) <= 0) return
  const payload = {
    name: ruleForm.name.trim(),
    triggerType: ruleForm.triggerType,
    thresholdValue: Number(ruleForm.thresholdValue),
    triggerDirection: ruleForm.triggerDirection,
    priceOffset: Number(ruleForm.priceOffset),
    offsetDirection: ruleForm.offsetDirection,
    spreadMultiplier: Number(ruleForm.spreadMultiplier),
    slippagePct: Number(ruleForm.slippagePct),
    rejectRatePct: Number(ruleForm.rejectRatePct),
    durationSec: Number(ruleForm.durationSec),
    enabled: ruleForm.enabled
  }

  contracts.value = contracts.value.map((contract) => {
    if (contract.id !== activeContractId.value) return contract
    if (editingRuleId.value) {
      return {
        ...contract,
        rules: contract.rules.map((rule) => (rule.id === editingRuleId.value ? { ...rule, ...payload } : rule))
      }
    }
    return {
      ...contract,
      rules: [
        {
          id: `rule-${Date.now()}`,
          ...payload,
          hitCount: 0,
          lastHitAt: '-'
        },
        ...contract.rules
      ]
    }
  })

  showRuleModal.value = false
  resetRuleForm()
  editingRuleId.value = null
}

const deleteRule = (contractId, ruleId) => {
  contracts.value = contracts.value.map((contract) =>
    contract.id === contractId ? { ...contract, rules: contract.rules.filter((rule) => rule.id !== ruleId) } : contract
  )
}

const toggleRule = (contractId, ruleId) => {
  contracts.value = contracts.value.map((contract) => {
    if (contract.id !== contractId) return contract
    return {
      ...contract,
      rules: contract.rules.map((rule) => (rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule))
    }
  })
}

const toggleContractStatus = (contractId) => {
  contracts.value = contracts.value.map((contract) => {
    if (contract.id !== contractId) return contract
    return {
      ...contract,
      status: contract.status === PERP_CONTROL_CONTRACT_STATUS.RUNNING ? PERP_CONTROL_CONTRACT_STATUS.PAUSED : PERP_CONTROL_CONTRACT_STATUS.RUNNING
    }
  })
}
</script>

<template>
  <section class="space-y-5">
    <header>
      <h1 class="text-3xl font-semibold text-slate-900">合约线控</h1>
      <p class="mt-1 text-sm text-slate-500">管理永续合约线控参数、自动规则与运行状态</p>
    </header>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article v-for="card in summary" :key="card.label" class="rounded-xl border border-slate-200 bg-white p-4">
        <p class="text-sm text-slate-500">{{ card.label }}</p>
        <p class="mt-2 text-2xl font-semibold text-slate-900">{{ card.value }}</p>
      </article>
    </div>

    <div class="max-w-lg">
      <input
        v-model="keyword"
        type="text"
        placeholder="搜索合约..."
        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
      />
    </div>

    <article
      v-for="contract in filteredContracts"
      :key="contract.id"
      class="rounded-xl border border-blue-200 bg-slate-50/40 p-5"
    >
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-2xl font-semibold text-slate-900">{{ contract.symbol }}</h3>
            <span class="rounded-md px-2 py-0.5 text-xs font-medium" :class="contract.status === PERP_CONTROL_CONTRACT_STATUS.RUNNING ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'">
              {{ contract.status === PERP_CONTROL_CONTRACT_STATUS.RUNNING ? '线控中' : '暂停' }}
            </span>
            <span
              class="rounded-md px-2 py-0.5 text-xs font-medium"
              :class="contract.config.autoTriggerEnabled ? 'bg-violet-100 text-violet-700' : 'bg-slate-200 text-slate-600'"
            >
              {{ contract.config.autoTriggerEnabled ? '自动触发开' : '自动触发关' }}
            </span>
          </div>
          <p class="mt-1 text-slate-500">{{ contract.alias }}</p>
        </div>

        <div class="flex items-center gap-3 text-sm">
          <button type="button" class="font-medium text-amber-600" @click="toggleContractStatus(contract.id)">
            {{ contract.status === PERP_CONTROL_CONTRACT_STATUS.RUNNING ? '暂停' : '恢复' }}
          </button>
          <button type="button" class="font-medium text-slate-700" @click="openConfig(contract.id)">配置</button>
        </div>
      </div>

      <div class="mt-4 grid gap-2 md:grid-cols-4 xl:grid-cols-8">
        <div v-for="metric in contract.metrics" :key="metric.label" class="rounded-lg border border-slate-200 bg-white p-2.5">
          <p class="text-xs text-slate-500">{{ metric.label }}</p>
          <p class="mt-1 text-sm font-semibold" :class="toneClass[metric.tone]">{{ metric.value }}</p>
        </div>
      </div>

      <div class="mt-4 rounded-lg border border-slate-200 bg-white p-3">
        <p class="text-sm text-slate-500">当前线控参数</p>
        <div class="mt-2 flex flex-wrap gap-2">
          <span v-for="param in formatParams(contract.config)" :key="param" class="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">{{ param }}</span>
        </div>
      </div>

      <div class="mt-4 rounded-lg border border-violet-200 bg-violet-50/40 p-3">
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium text-violet-700">自动线控规则</p>
          <button type="button" class="text-sm font-medium text-violet-600" @click="openAddRule(contract.id)">+ 添加规则</button>
        </div>

        <div class="mt-2 space-y-2">
          <article v-for="rule in contract.rules" :key="rule.id" class="rounded-lg border border-violet-100 bg-white p-3">
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-start gap-3">
                <button
                  type="button"
                  class="relative mt-1 h-5 w-10 rounded-full transition"
                  :class="rule.enabled ? 'bg-blue-600' : 'bg-slate-300'"
                  @click="toggleRule(contract.id, rule.id)"
                >
                  <span class="absolute top-0.5 h-4 w-4 rounded-full bg-white transition" :class="rule.enabled ? 'left-5' : 'left-0.5'"></span>
                </button>
                <div>
                  <p class="font-medium text-slate-900">{{ rule.name }}</p>
                  <p class="mt-1 text-sm text-slate-500">{{ ruleTriggers[rule.triggerType]?.label || ruleTriggers[PERP_CONTROL_RULE_TRIGGER_TYPE.NET_POSITION].label }} | {{ ruleConditionText(rule) }}</p>
                  <p class="text-sm text-slate-500">{{ ruleActionText(rule) }}</p>
                  <p class="text-sm text-slate-500">已触发 {{ rule.hitCount }} 次 | 最近: {{ rule.lastHitAt }}</p>
                </div>
              </div>

              <div class="flex items-center gap-2 text-sm">
                <button type="button" class="text-slate-600" @click="openEditRule(contract.id, rule)">编辑</button>
                <button type="button" class="text-rose-500" @click="deleteRule(contract.id, rule.id)">删除</button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </article>

    <p v-if="filteredContracts.length === 0" class="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">没有匹配的线控合约</p>
  </section>

  <ControlConfigModal
    :open="showConfigModal"
    :symbol="activeConfigContractId"
    :config="activeConfig"
    @close="showConfigModal = false"
    @save="saveConfig"
  />

  <div v-if="showRuleModal" class="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" @click.self="showRuleModal = false">
    <section class="w-full max-w-2xl rounded-xl bg-white">
      <header class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 class="text-xl font-semibold text-slate-900">{{ editingRuleId ? '编辑线控规则' : '新增线控规则' }}</h2>
        <button type="button" class="text-2xl text-slate-400" @click="showRuleModal = false">×</button>
      </header>

      <div class="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-4">
        <nav class="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            class="rounded-md px-3 py-1.5 text-sm"
            :class="ruleModalTab === PERP_CONTROL_RULE_MODAL_TAB.BASIC ? 'bg-white font-medium text-blue-600 shadow-sm' : 'text-slate-600'"
            @click="ruleModalTab = PERP_CONTROL_RULE_MODAL_TAB.BASIC"
          >
            基础信息
          </button>
          <button
            type="button"
            class="rounded-md px-3 py-1.5 text-sm"
            :class="ruleModalTab === PERP_CONTROL_RULE_MODAL_TAB.TRIGGER ? 'bg-white font-medium text-blue-600 shadow-sm' : 'text-slate-600'"
            @click="ruleModalTab = PERP_CONTROL_RULE_MODAL_TAB.TRIGGER"
          >
            触发条件
          </button>
          <button
            type="button"
            class="rounded-md px-3 py-1.5 text-sm"
            :class="ruleModalTab === PERP_CONTROL_RULE_MODAL_TAB.ACTION ? 'bg-white font-medium text-blue-600 shadow-sm' : 'text-slate-600'"
            @click="ruleModalTab = PERP_CONTROL_RULE_MODAL_TAB.ACTION"
          >
            执行动作
          </button>
        </nav>

        <section v-if="ruleModalTab === PERP_CONTROL_RULE_MODAL_TAB.BASIC" class="space-y-3 rounded-lg border border-slate-200 p-4">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-slate-800">规则名称</span>
            <input
              v-model="ruleForm.name"
              type="text"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              placeholder="如：多头过重自动调整"
            />
          </label>
          <label class="inline-flex items-center gap-2 text-sm text-slate-700">
            <input v-model="ruleForm.enabled" type="checkbox" class="h-4 w-4" />
            保存后立即启用
          </label>
          <div class="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            当前规则会作用于：<span class="font-medium text-slate-900">{{ currentContract?.symbol || '-' }}</span>
          </div>
        </section>

        <section v-if="ruleModalTab === PERP_CONTROL_RULE_MODAL_TAB.TRIGGER" class="space-y-3 rounded-lg border border-slate-200 p-4">
          <p class="text-sm font-medium text-slate-900">触发条件</p>
          <div class="grid gap-3 md:grid-cols-3">
            <label class="block space-y-2">
              <span class="text-sm text-slate-600">触发类型</span>
              <select v-model="ruleForm.triggerType" class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500">
                <option v-for="opt in triggerOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </label>
            <label class="block space-y-2">
              <span class="text-sm text-slate-600">{{ triggerMeta.thresholdLabel }}</span>
              <input
                v-model.number="ruleForm.thresholdValue"
                type="number"
                min="0"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              />
            </label>
            <label class="block space-y-2">
              <span class="text-sm text-slate-600">触发方向</span>
              <select v-model="ruleForm.triggerDirection" class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500">
                <option v-for="d in triggerMeta.directionOptions" :key="d.value" :value="d.value">{{ d.label }}</option>
              </select>
            </label>
          </div>
          <div class="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
            触发预览：{{ triggerMeta.label }} | {{ liveRuleConditionText }}
          </div>
        </section>

        <section v-if="ruleModalTab === PERP_CONTROL_RULE_MODAL_TAB.ACTION" class="space-y-3 rounded-lg border border-slate-200 p-4">
          <p class="text-sm font-medium text-slate-900">触发后执行的动作</p>
          <div class="grid gap-4 md:grid-cols-2">
            <label class="block space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span>价格偏移 (点)</span>
                <span class="font-medium">{{ ruleForm.priceOffset }}</span>
              </div>
              <input v-model.number="ruleForm.priceOffset" type="range" min="0" max="50" step="1" class="w-full accent-blue-600" />
            </label>
            <label class="block space-y-2">
              <span class="text-sm text-slate-600">偏移方向</span>
              <select v-model="ruleForm.offsetDirection" class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500">
                <option v-for="d in offsetDirections" :key="d.value" :value="d.value">{{ d.label }}</option>
              </select>
            </label>
            <label class="block space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span>点差倍数</span>
                <span class="font-medium">{{ ruleForm.spreadMultiplier.toFixed(1) }}x</span>
              </div>
              <input v-model.number="ruleForm.spreadMultiplier" type="range" min="1" max="5" step="0.1" class="w-full accent-blue-600" />
            </label>
            <label class="block space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span>滑点率 (%)</span>
                <span class="font-medium">{{ ruleForm.slippagePct.toFixed(2) }}%</span>
              </div>
              <input v-model.number="ruleForm.slippagePct" type="range" min="0" max="2" step="0.01" class="w-full accent-blue-600" />
            </label>
            <label class="block space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span>拒单率 (%)</span>
                <span class="font-medium">{{ ruleForm.rejectRatePct.toFixed(1) }}%</span>
              </div>
              <input v-model.number="ruleForm.rejectRatePct" type="range" min="0" max="20" step="0.1" class="w-full accent-blue-600" />
            </label>
            <label class="block space-y-2">
              <span class="text-sm text-slate-600">持续时间 (秒，0=持续生效)</span>
              <input
                v-model.number="ruleForm.durationSec"
                type="number"
                min="0"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              />
            </label>
          </div>
          <div class="rounded-md border border-violet-100 bg-violet-50 px-3 py-2 text-sm text-violet-700">
            执行动作预览：{{ liveRuleActionText }}
          </div>
        </section>
      </div>

      <footer class="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
        <button type="button" class="rounded-lg border border-slate-300 px-4 py-2" @click="showRuleModal = false">取消</button>
        <button
          type="button"
          class="rounded-lg px-4 py-2 font-medium text-white"
          :class="ruleForm.name.trim() && Number(ruleForm.thresholdValue) > 0 ? 'bg-violet-600 hover:bg-violet-700' : 'bg-violet-300'"
          :disabled="!ruleForm.name.trim() || Number(ruleForm.thresholdValue) <= 0"
          @click="saveRule"
        >
          保存规则
        </button>
      </footer>
    </section>
  </div>
</template>
