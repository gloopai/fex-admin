<script setup>
import { computed, reactive, ref, watch } from 'vue'
import {
  DELIVERY_RULE_TRIGGER_TYPE,
  DELIVERY_RULE_ACTION,
  DELIVERY_RULE_STATUS,
  DELIVERY_RULE_PRIORITY,
  DELIVERY_RULE_TIME_PERIOD,
  USER_RISK_LEVEL,
  PROFIT_CONTROL_STRATEGY
} from '../constants/deliveryControl'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  rule: {
    type: Object,
    default: null
  },
  mode: {
    type: String,
    default: 'create' // 'create' | 'edit' | 'duplicate'
  }
})

const emit = defineEmits(['close', 'save'])


// 表单数据
const form = reactive({
  // 基本信息
  name: '',
  description: '',
  status: DELIVERY_RULE_STATUS.ENABLED,
  priority: DELIVERY_RULE_PRIORITY.MEDIUM,
  
  // 触发条件
  trigger: {
    type: DELIVERY_RULE_TRIGGER_TYPE.TRADE_COUNT,
    period: DELIVERY_RULE_TIME_PERIOD.LAST_1H,
    threshold: 20,
    conditions: {
      totalProfit: { enabled: false, operator: '>', value: 1000 },
      dailyProfit: { enabled: false, operator: '>', value: 1000 },
      positionValue: { enabled: false, operator: '>', value: 5000 },
      riskLevel: { enabled: false, values: [] }
    }
  },
  
  // 执行动作
  action: {
    type: DELIVERY_RULE_ACTION.PROFIT_CONTROL,
    params: {
      // 盈亏控制（线控）- 百分比模式
      profitControl: {
          winFluctuationPercent: 2, // 盈利波动范围，单位%（±2%）
          lossFluctuationPercent: 2, // 亏损波动范围，单位%（±2%）
        winProbability: 0.3,                       // 盈利概率30%
        avgWinAmount: 20,                          // 赢时金额百分比 20%
        avgLossAmount: -15,                        // 输时金额百分比 -15%
        strategy: PROFIT_CONTROL_STRATEGY.SETTLEMENT_PRICE,  // 技术策略
        enableRiskLimits: false,                   // 是否启用风控限制
        maxProfit: 10000,                          // 最大累计盈利
        maxLossRatio: 0.3,                         // 最大亏损比例
      },
      applyToNewPositions: true,
      duration: 0,
      
      // 强制盈利/亏损
      nextPositionCount: 1,
      lossPercent: 0.3,
      profitPercent: 0.2,
      
      // 价格调整
      settlePriceMode: 'unfavorable', // 'favorable' | 'unfavorable' | 'market'
      offsetPercent: 0.5,
      
      // 订单拒绝
      lockNewPosition: true,
      existingProfitTarget: -100,
      notifyUser: false,
      notifyMessage: '',
      
      // 仓位限制
      maxPositionValue: 1000,
      maxLeverage: 20
    }
  },
  
  // 高级选项
  advanced: {
    enabled: true,
    schedule: {
      enabled: false,
      startTime: '09:00',
      endTime: '23:00',
      weekdays: [1, 2, 3, 4, 5, 6, 7] // 1-7 代表周一到周日
    },
    userFilter: {
      enabled: false,
      vipLevels: [],
      minDeposit: 0,
      maxDeposit: 0,
      registrationDays: { min: 0, max: 0 },
      excludeUserIds: ''
    },
    limits: {
      maxHitsPerDay: 0,
      maxHitsPerUser: 0,
      cooldownMinutes: 0
    },
    notification: {
      enabled: false,
      webhookUrl: '',
      emailList: ''
    }
  }
})

// 触发类型配置（精简后只保留核心必须的4种）
const triggerTypeOptions = [
  {
    value: DELIVERY_RULE_TRIGGER_TYPE.TRADE_COUNT,
    label: '交易次数',
    needsPeriod: true,
    defaultThreshold: 20
  },
  {
    value: DELIVERY_RULE_TRIGGER_TYPE.PROFIT_LOSS,
    label: '累计盈亏',
    needsPeriod: true,
    defaultThreshold: 1000
  },
  {
    value: DELIVERY_RULE_TRIGGER_TYPE.CONSECUTIVE_WINS,
    label: '连续盈利',
    needsPeriod: true,
    defaultThreshold: 5
  },
  {
    value: DELIVERY_RULE_TRIGGER_TYPE.CONSECUTIVE_LOSS,
    label: '连续亏损',
    needsPeriod: true,
    defaultThreshold: 5
  }
]


// 时间周期选项
const timePeriodOptions = [
  { value: DELIVERY_RULE_TIME_PERIOD.REAL_TIME, label: '实时' },
  { value: DELIVERY_RULE_TIME_PERIOD.LAST_1H, label: '最近1小时' },
  { value: DELIVERY_RULE_TIME_PERIOD.LAST_4H, label: '最近4小时' },
  { value: DELIVERY_RULE_TIME_PERIOD.LAST_24H, label: '最近24小时' },
  { value: DELIVERY_RULE_TIME_PERIOD.TODAY, label: '今日' },
  { value: DELIVERY_RULE_TIME_PERIOD.LAST_7D, label: '最近7天' }
]

// 执行动作配置（精简版 - 只保留核心功能）
const actionTypeOptions = [
  {
    value: DELIVERY_RULE_ACTION.PROFIT_CONTROL,
    label: '盈亏控制'
  },
  {
    value: DELIVERY_RULE_ACTION.FORCE_WIN,
    label: '强制盈利'
  },
  {
    value: DELIVERY_RULE_ACTION.FORCE_LOSS,
    label: '强制亏损'
  }
]


// 优先级选项
const priorityOptions = [
  { value: DELIVERY_RULE_PRIORITY.HIGH, label: '高优先级' },
  { value: DELIVERY_RULE_PRIORITY.MEDIUM, label: '中优先级' },
  { value: DELIVERY_RULE_PRIORITY.LOW, label: '低优先级' }
]

// 状态选项
const statusOptions = [
  { value: DELIVERY_RULE_STATUS.ENABLED, label: '运行中' },
  { value: DELIVERY_RULE_STATUS.PAUSED, label: '已暂停' },
  { value: DELIVERY_RULE_STATUS.DISABLED, label: '已禁用' }
]

// 风险等级选项
const riskLevelOptions = [
  { value: USER_RISK_LEVEL.VERY_HIGH, label: '极高风险' },
  { value: USER_RISK_LEVEL.HIGH, label: '高风险' },
  { value: USER_RISK_LEVEL.MEDIUM, label: '中风险' },
  { value: USER_RISK_LEVEL.LOW, label: '低风险' },
  { value: USER_RISK_LEVEL.SAFE, label: '安全' }
]

// 盈亏控制策略选项（技术实现方式）
const profitControlStrategyOptions = [
  { value: PROFIT_CONTROL_STRATEGY.SETTLEMENT_PRICE, label: '结算价格选择' },
  { value: PROFIT_CONTROL_STRATEGY.TIME_WINDOW, label: '时间窗口选择' },
  { value: PROFIT_CONTROL_STRATEGY.SLIPPAGE, label: '滑点控制' },
  { value: PROFIT_CONTROL_STRATEGY.KLINE_OFFSET, label: 'K线显示偏移' }
]

// 计算属性
const isEditMode = computed(() => props.mode === 'edit')
const isDuplicateMode = computed(() => props.mode === 'duplicate')
const modalTitle = computed(() => {
  if (isEditMode.value) return '编辑规则'
  if (isDuplicateMode.value) return '复制规则'
  return '新增规则'
})


const currentTriggerConfig = computed(() => {
  return triggerTypeOptions.find(opt => opt.value === form.trigger.type)
})

// 阈值单位和说明
const thresholdLabel = computed(() => {
  switch (form.trigger.type) {
    case DELIVERY_RULE_TRIGGER_TYPE.TRADE_COUNT:
      return '交易次数';
    case DELIVERY_RULE_TRIGGER_TYPE.PROFIT_LOSS:
      return '累计盈亏 (USDT)';
    case DELIVERY_RULE_TRIGGER_TYPE.CONSECUTIVE_WINS:
      return '连续盈利次数';
    case DELIVERY_RULE_TRIGGER_TYPE.CONSECUTIVE_LOSS:
      return '连续亏损次数';
    default:
      return '阈值';
  }
})

const formattedThreshold = computed(() => {
  const value = form.trigger.threshold
  switch (form.trigger.type) {
    case DELIVERY_RULE_TRIGGER_TYPE.TRADE_COUNT:
      return value + ' 次';
    case DELIVERY_RULE_TRIGGER_TYPE.PROFIT_LOSS:
      return value + ' USDT';
    case DELIVERY_RULE_TRIGGER_TYPE.CONSECUTIVE_WINS:
      return value + ' 次';
    case DELIVERY_RULE_TRIGGER_TYPE.CONSECUTIVE_LOSS:
      return value + ' 次';
    default:
      return value;
  }
})

const currentActionConfig = computed(() => {
  return actionTypeOptions.find(opt => opt.value === form.action.type)
})

const needsTimePeriod = computed(() => {
  return currentTriggerConfig.value?.needsPeriod
})


// 计算期望值（根据盈利概率、盈利金额、亏损金额自动计算）
const calculatedExpectedValue = computed(() => {
  if (form.action.type === DELIVERY_RULE_ACTION.PROFIT_CONTROL) {
    const { winProbability, avgWinAmount, avgLossAmount } = form.action.params.profitControl
    // 安全检查，确保所有值都是有效数字
    const prob = Number(winProbability) || 0
    const win = Number(avgWinAmount) || 0
    const loss = Number(avgLossAmount) || 0
    // 期望值 = 盈利金额 × 盈利概率 + 亏损金额 × (1 - 盈利概率)
    const expectedValue = win * prob + loss * (1 - prob)
    return isNaN(expectedValue) ? 0 : expectedValue
  }
  return 0
})

// 计算最大波动（取盈利/亏损波动范围较大者）
const maxFluctuation = computed(() => {
  if (form.action.type === DELIVERY_RULE_ACTION.PROFIT_CONTROL) {
    const { winFluctuationPercent = 0, lossFluctuationPercent = 0 } = form.action.params.profitControl
    return Math.max(Number(winFluctuationPercent) || 0, Number(lossFluctuationPercent) || 0)
  }
  return 0
})

// 计算平均每单收益区间（分别考虑盈利和亏损波动）
const expectedValueRange = computed(() => {
  if (form.action.type === DELIVERY_RULE_ACTION.PROFIT_CONTROL) {
          try {
            if (
              form.action &&
              form.action.type === DELIVERY_RULE_ACTION.PROFIT_CONTROL &&
              form.action.params &&
              form.action.params.profitControl
            ) {
              const pc = form.action.params.profitControl
              const win = Number(pc.avgWinAmount) || 0
              const loss = Number(pc.avgLossAmount) || 0
              const winFluct = Number(pc.winFluctuationPercent) || 0
              const lossFluct = Number(pc.lossFluctuationPercent) || 0
              const winMax = win + winFluct
              const winMin = win - winFluct
              const lossMax = loss + lossFluct
              const lossMin = loss - lossFluct
              const min = Math.min(winMin, winMax, lossMin, lossMax)
              const max = Math.max(winMin, winMax, lossMin, lossMax)
              return { min, max }
            }
          } catch (e) {
            console.error(e)
          }
          return { min: 0, max: 0 }
  }
  return { min: 0, max: 0 }
})


// 方法
const close = () => {
  emit('close')
}

const save = () => {
  // 基础验证
  if (!form.name.trim()) {
    alert('请输入规则名称')
    return
  }
  if (!form.description.trim()) {
    alert('请输入规则描述')
    return
  }
  if (!form.trigger.threshold || form.trigger.threshold <= 0) {
    alert('请设置有效的触发阈值')
    return
  }
  
  emit('save', { ...form })
  close()
}

// 监听触发类型变化，自动调整默认值
watch(() => form.trigger.type, (newType) => {
  const config = triggerTypeOptions.find(opt => opt.value === newType)
  if (config) {
    form.trigger.threshold = config.defaultThreshold
  }
})

// 监听打开状态，初始化表单
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    if (props.rule && (props.mode === 'edit' || props.mode === 'duplicate')) {
      // 编辑或复制模式，加载现有数据
      Object.assign(form, JSON.parse(JSON.stringify(props.rule)))
      
      // 确保新字段存在默认值（数据迁移）
      if (form.action.params.profitControl) {
        // 确保 enableRiskLimits 字段存在
        form.action.params.profitControl.enableRiskLimits = form.action.params.profitControl.enableRiskLimits ?? false
        
        // 如果是旧数据结构（使用 targetExpectedValue），迁移到新结构（使用 winProbability）
        if (form.action.params.profitControl.targetExpectedValue !== undefined && 
            form.action.params.profitControl.winProbability === undefined) {
          // 从期望值反推盈利概率：p = (EV - lossAmount) / (winAmount - lossAmount)
          const ev = Number(form.action.params.profitControl.targetExpectedValue) || -5
          const win = Number(form.action.params.profitControl.avgWinAmount) || 20
          const loss = Number(form.action.params.profitControl.avgLossAmount) || -15
          const calculatedProb = (ev - loss) / (win - loss)
          form.action.params.profitControl.winProbability = isNaN(calculatedProb) ? 0.3 : Math.max(0, Math.min(1, calculatedProb))
          // 删除旧字段
          delete form.action.params.profitControl.targetExpectedValue
        }
        
        // 确保所有数值字段都存在且是有效数字
        form.action.params.profitControl.winProbability = Number(form.action.params.profitControl.winProbability) || 0.3
        form.action.params.profitControl.avgWinAmount = Number(form.action.params.profitControl.avgWinAmount) || 20
        form.action.params.profitControl.avgLossAmount = Number(form.action.params.profitControl.avgLossAmount) || -15
        form.action.params.profitControl.maxProfit = Number(form.action.params.profitControl.maxProfit) || 10000
        form.action.params.profitControl.maxLossRatio = Number(form.action.params.profitControl.maxLossRatio) || 0.3
      }
      
      // 确保持续时间字段存在默认值
      form.action.params.duration = Number(form.action.params.duration) || 0
      
      // 复制模式，修改名称
      if (props.mode === 'duplicate') {
        form.name = `${form.name} (副本)`
      }
    } else {
      // 创建模式，重置表单
      Object.assign(form, {
        name: '',
        description: '',
        status: DELIVERY_RULE_STATUS.ENABLED,
        priority: DELIVERY_RULE_PRIORITY.MEDIUM,
        trigger: {
          type: DELIVERY_RULE_TRIGGER_TYPE.TRADE_COUNT,
          period: DELIVERY_RULE_TIME_PERIOD.LAST_1H,
          threshold: 20,
          conditions: {
            profitLoss: { enabled: false, operator: '>', value: 1000 },
            dailyProfit: { enabled: false, operator: '>', value: 1000 },
            positionValue: { enabled: false, operator: '>', value: 5000 },
            riskLevel: { enabled: false, values: [] }
          }
        },
        action: {
          type: DELIVERY_RULE_ACTION.PROFIT_CONTROL,
          params: {
            profitControl: {
              winProbability: 0.3,
              avgWinAmount: 20,
              avgLossAmount: -15,
              strategy: PROFIT_CONTROL_STRATEGY.SETTLEMENT_PRICE,
              enableRiskLimits: false,
              maxProfit: 10000,
              maxLossRatio: 0.3,
            },
            applyToNewPositions: true,
            duration: 0,
            nextPositionCount: 1,
            lossPercent: 0.3,
            profitPercent: 0.2,
            settlePriceMode: 'unfavorable',
            offsetPercent: 0.5,
            lockNewPosition: true,
            existingProfitTarget: -100,
            notifyUser: false,
            notifyMessage: '',
            maxPositionValue: 1000,
            maxLeverage: 20
          }
        },
        advanced: {
          enabled: true,
          schedule: {
            enabled: false,
            startTime: '09:00',
            endTime: '23:00',
            weekdays: [1, 2, 3, 4, 5, 6, 7]
          },
          userFilter: {
            enabled: false,
            vipLevels: [],
            minDeposit: 0,
            maxDeposit: 0,
            registrationDays: { min: 0, max: 0 },
            excludeUserIds: ''
          },
          limits: {
            maxHitsPerDay: 0,
            maxHitsPerUser: 0,
            cooldownMinutes: 0
          },
          notification: {
            enabled: false,
            webhookUrl: '',
            emailList: ''
          }
        }
      })
    }

  }
}, { flush: 'post' })
</script>

<template>
  <Transition name="modal">
    <div v-show="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <section class="flex h-[88vh] w-full max-w-6xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <!-- 左侧配置区域 -->
        <div class="flex w-3/5 flex-col border-r border-slate-200">
          <header class="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-blue-50 to-violet-50 px-6 py-4">
            <div>
              <h2 class="text-xl font-semibold text-slate-900">{{ modalTitle }}</h2>
              <p class="mt-0.5 text-xs text-slate-500">配置自动化规则的触发条件和执行动作</p>
            </div>
            <button type="button" class="text-2xl text-slate-400 hover:text-slate-600 transition-colors" @click="close">×</button>
          </header>

          <div class="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <!-- 基本信息 -->
            <section class="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-600">
                  <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="flex-1">
                  <h3 class="text-base font-semibold text-slate-900">基本信息</h3>
                  <p class="text-xs text-slate-600">规则的基础配置</p>
                </div>
              </div>

              <div class="space-y-3.5">
                <label class="block space-y-2">
                  <span class="text-sm font-medium text-slate-700">规则名称 <span class="text-rose-500">*</span></span>
                  <input
                    v-model="form.name"
                    type="text"
                    placeholder="如：高频交易风控规则"
                    class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label class="block space-y-2">
                  <span class="text-sm font-medium text-slate-700">规则描述</span>
                  <textarea
                    v-model="form.description"
                    rows="2"
                    placeholder="描述规则的用途和适用场景"
                    class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  ></textarea>
                </label>

                <div class="grid gap-3.5 sm:grid-cols-2">
                  <label class="block space-y-2">
                    <span class="text-sm font-medium text-slate-700">状态</span>
                    <select v-model="form.status" class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                      <option v-for="status in statusOptions" :key="status.value" :value="status.value">{{ status.label }}</option>
                    </select>
                  </label>

                  <label class="block space-y-2">
                    <span class="text-sm font-medium text-slate-700">优先级</span>
                    <select v-model="form.priority" class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                      <option v-for="priority in priorityOptions" :key="priority.value" :value="priority.value">{{ priority.label }}</option>
                    </select>
                  </label>
                </div>
              </div>
            </section>

            <!-- 触发条件 -->
            <section class="space-y-4 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 shadow-sm">
              <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                  <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 class="flex-1 text-base font-semibold text-slate-900">触发条件</h3>
              </div>

              <div class="space-y-3.5">
                <label class="block space-y-2">
                  <span class="text-sm font-medium text-slate-700">触发类型</span>
                  <select v-model="form.trigger.type" class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                    <option v-for="option in triggerTypeOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </label>

                <div class="grid gap-3.5 sm:grid-cols-2">
                  <label class="block space-y-2">
                    <span class="text-sm font-medium text-slate-700">{{ thresholdLabel }} <span class="text-rose-500">*</span></span>
                    <input
                      v-model.number="form.trigger.threshold"
                      type="number"
                      min="0"
                      class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <div class="text-xs text-slate-500 mt-1">{{ formattedThreshold }}</div>
                  </label>

                  <label v-if="needsTimePeriod" class="block space-y-2">
                    <span class="text-sm font-medium text-slate-700">时间周期</span>
                    <select v-model="form.trigger.period" class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                      <option v-for="period in timePeriodOptions" :key="period.value" :value="period.value">{{ period.label }}</option>
                    </select>
                  </label>
                </div>
              </div>

            </section>

            <!-- 执行动作 -->
            <section class="space-y-4 rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-5 shadow-sm">
              <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
                  <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 class="flex-1 text-base font-semibold text-slate-900">执行动作</h3>
              </div>

              <div class="space-y-3.5">
                <label class="block space-y-2">
                  <span class="text-sm font-medium text-slate-700">动作类型</span>
                  <select v-model="form.action.type" class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100">
                    <option v-for="action in actionTypeOptions" :key="action.value" :value="action.value">
                      {{ action.label }}
                    </option>
                  </select>
                </label>

                <!-- 盈亏控制参数 -->
                <div v-if="form.action.type === DELIVERY_RULE_ACTION.PROFIT_CONTROL" class="space-y-4 rounded-lg border border-blue-200 bg-white p-4">
                  <div class="flex items-center gap-2 pb-3 border-b border-blue-100">
                    <span class="text-2xl">🎚️</span>
                    <div class="flex-1">
                      <h4 class="text-sm font-semibold text-blue-900">盈亏控制配置</h4>
                      <p class="text-xs text-blue-600">设置盈利概率和单笔盈亏幅度，系统自动计算期望值</p>
                    </div>
                  </div>

                  <!-- 核心参数 -->
                  <div class="space-y-4">
                    <div class="space-y-1">
                      <h5 class="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <span class="inline-block w-1 h-4 bg-blue-500 rounded"></span>
                        核心参数
                      </h5>
                      <p class="text-xs text-slate-500">按盈利概率随机决定输赢，赢时按固定的单笔盈利%结算，输时按固定的单笔亏损%结算</p>
                    </div>
                    
                    <!-- 盈利概率 -->
                    <div class="rounded-lg border border-slate-200 bg-white p-3">
                      <label class="block space-y-2">
                        <div class="flex items-center justify-between">
                          <div>
                            <div class="text-sm font-medium text-slate-700">盈利概率</div>
                            <div class="text-xs text-slate-500 mt-0.5">用户赚钱的几率，值越大用户越容易赚</div>
                          </div>
                          <span class="text-xl font-bold text-blue-600">{{ ((form.action.params.profitControl.winProbability || 0) * 100).toFixed(0) }}%</span>
                        </div>
                        <div class="flex items-center gap-2">
                          <input
                            v-model.number="form.action.params.profitControl.winProbability"
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            class="flex-1 accent-blue-600"
                          />
                          <input
                            v-model.number="form.action.params.profitControl.winProbability"
                            type="number"
                            min="0"
                            max="1"
                            step="0.01"
                            class="w-16 rounded border border-slate-300 px-2 py-1 text-sm text-center focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </label>
                    </div>

                    <!-- 盈亏波动范围 -->

                    
                    <!-- 盈亏幅度 -->
                    <div class="grid gap-3 sm:grid-cols-2">
                      <div class="rounded-lg border border-slate-200 bg-white p-3">
                        <label class="block space-y-2">
                          <div class="flex items-center gap-1">
                            <span class="text-sm text-slate-700">单笔盈利</span>
                            <span class="text-lg font-bold text-green-600">+{{ form.action.params.profitControl.avgWinAmount || 0 }}%</span>
                          </div>
                          <div class="flex items-center gap-1">
                            <input
                              v-model.number="form.action.params.profitControl.avgWinAmount"
                              type="number"
                              min="1"
                              max="200"
                              step="1"
                              class="flex-1 rounded border border-slate-300 px-2.5 py-1.5 text-sm focus:border-green-500 focus:outline-none"
                            />
                            <span class="text-sm text-slate-500">%</span>
                          </div>
                          <div class="flex items-center gap-2 mt-1">
                            <span class="text-xs text-slate-500">盈利波动范围：</span>
                            <input
                              v-model.number="form.action.params.profitControl.winFluctuationPercent"
                              type="number"
                              min="0"
                              max="10"
                              step="0.1"
                              class="w-14 rounded border border-slate-300 px-2 py-1 text-xs text-center focus:border-green-500 focus:outline-none"
                            />
                            <span class="text-xs text-green-600">±{{ form.action.params.profitControl.winFluctuationPercent || 0 }}%</span>
                          </div>
                          <p class="text-xs text-slate-500">盈利时的收益比例，值越大用户赚得越多。每单盈利将在此基础上随机波动±{{ form.action.params.profitControl.winFluctuationPercent || 0 }}%。</p>
                        </label>
                      </div>
                      
                      <div class="rounded-lg border border-slate-200 bg-white p-3">
                        <label class="block space-y-2">
                          <div class="flex items-center gap-1">
                            <span class="text-sm text-slate-700">单笔亏损</span>
                            <span class="text-lg font-bold text-red-600">{{ form.action.params.profitControl.avgLossAmount || 0 }}%</span>
                          </div>
                          <div class="flex items-center gap-1">
                            <input
                              v-model.number="form.action.params.profitControl.avgLossAmount"
                              type="number"
                              min="-200"
                              max="-1"
                              step="1"
                              class="flex-1 rounded border border-slate-300 px-2.5 py-1.5 text-sm focus:border-red-500 focus:outline-none"
                            />
                            <span class="text-sm text-slate-500">%</span>
                          </div>
                          <div class="flex items-center gap-2 mt-1">
                            <span class="text-xs text-slate-500">亏损波动范围：</span>
                            <input
                              v-model.number="form.action.params.profitControl.lossFluctuationPercent"
                              type="number"
                              min="0"
                              max="10"
                              step="0.1"
                              class="w-14 rounded border border-slate-300 px-2 py-1 text-xs text-center focus:border-red-500 focus:outline-none"
                            />
                            <span class="text-xs text-red-600">±{{ form.action.params.profitControl.lossFluctuationPercent || 0 }}%</span>
                          </div>
                          <p class="text-xs text-slate-500">亏损时的亏损比例，值越小用户亏得越少。每单亏损将在此基础上随机波动±{{ form.action.params.profitControl.lossFluctuationPercent || 0 }}%。</p>
                        </label>
                      </div>
                    </div>

                    <!-- 风控限制（可选） -->
                    <div class="space-y-3 pt-4">
                      <div class="flex items-center justify-between">
                        <h5 class="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                          <span class="inline-block w-1 h-4 bg-amber-500 rounded"></span>
                          风控限制（可选）
                        </h5>
                        <button 
                          type="button"
                          @click="form.action.params.profitControl.enableRiskLimits = !form.action.params.profitControl.enableRiskLimits"
                          class="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {{ form.action.params.profitControl.enableRiskLimits ? '收起' : '展开' }}
                        </button>
                      </div>
                      <p class="text-xs text-slate-500">达到限制后将暂停规则执行，需要手动重新启用</p>
                      
                      <div v-show="form.action.params.profitControl.enableRiskLimits" class="grid gap-3 sm:grid-cols-2 pt-2">
                        <label class="block space-y-2">
                          <div class="flex items-center gap-1">
                            <span class="text-sm text-slate-700">最大累计盈利</span>
                            <span class="text-xs text-slate-400">(单用户)</span>
                          </div>
                          <div class="flex items-center gap-2">
                            <input
                              v-model.number="form.action.params.profitControl.maxProfit"
                              type="number"
                              step="1000"
                              placeholder="不限制"
                              class="flex-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-sm focus:border-amber-500 focus:outline-none"
                            />
                            <span class="text-sm text-slate-600 font-medium">USDT</span>
                          </div>
                          <p class="text-xs text-slate-500">某用户盈利达到此金额后停止对其控制</p>
                        </label>
                        <label class="block space-y-2">
                          <div class="flex items-center gap-1">
                            <span class="text-sm text-slate-700">最大单笔亏损</span>
                            <span class="text-xs text-slate-400">(保护用户)</span>
                          </div>
                          <div class="flex items-center gap-2">
                            <input
                              v-model.number="form.action.params.profitControl.maxLossRatio"
                              type="number"
                              min="0"
                              max="1"
                              step="0.05"
                              placeholder="0.5"
                              class="flex-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-sm focus:border-amber-500 focus:outline-none"
                            />
                            <span class="text-sm text-slate-600 font-medium">{{ ((form.action.params.profitControl.maxLossRatio || 0) * 100).toFixed(0) }}%</span>
                          </div>
                          <p class="text-xs text-slate-500">单笔亏损不超过持仓金额的此比例</p>
                        </label>
                      </div>
                    </div>

                    <!-- 实现方式 -->
                    <div class="space-y-3 pt-4 border-t border-slate-200">
                      <div class="flex items-center justify-between">
                        <h5 class="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                          <span class="inline-block w-1 h-4 bg-slate-400 rounded"></span>
                          实现方式
                        </h5>
                      </div>
                      <div class="grid grid-cols-2 gap-2">
                        <button
                          v-for="strategy in profitControlStrategyOptions"
                          :key="strategy.value"
                          type="button"
                          @click="form.action.params.profitControl.strategy = strategy.value"
                          :class="[
                            'relative rounded-lg border-2 p-3 text-left transition-all',
                            form.action.params.profitControl.strategy === strategy.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          ]"
                        >
                          <div class="flex items-start gap-2">
                            <div :class="[
                              'mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center',
                              form.action.params.profitControl.strategy === strategy.value
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-slate-300'
                            ]">
                              <div v-if="form.action.params.profitControl.strategy === strategy.value" class="h-1.5 w-1.5 rounded-full bg-white"></div>
                            </div>
                            <div class="flex-1">
                              <div class="text-sm font-medium text-slate-900">{{ strategy.label }}</div>
                              <!-- <div class="mt-0.5 text-xs text-slate-500">{{ strategy.description }}</div> -->
                            </div>
                          </div>
                        </button>
                      </div>
                      <div class="rounded-md bg-slate-50 border border-slate-200 p-2.5">
                        <p class="text-xs text-slate-600 leading-relaxed">
                          <span class="font-medium text-slate-700">推荐使用"结算价格选择"</span> - 在市场真实波动范围内选择对用户更有利或不利的价格点进行结算，自然且不易被发现。
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- 通用选项 -->
                  <div class="space-y-3 pt-4 border-t border-slate-200">
                    <label class="flex items-center gap-2">
                      <input
                        v-model="form.action.params.applyToNewPositions"
                        type="checkbox"
                        class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span class="text-sm text-slate-700">仅应用于新开仓位</span>
                    </label>
                    <label class="block space-y-2">
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-medium text-slate-700">持续时间</span>
                        <span class="text-xs text-slate-500">（0 表示持续生效直到手动停止）</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <input
                          v-model.number="form.action.params.duration"
                          type="number"
                          min="0"
                          placeholder="0"
                          class="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                        />
                        <span class="text-sm text-slate-600">分钟</span>
                      </div>
                    </label>
                  </div>
                </div>

                <!-- 强制亏损参数 -->
                <div v-if="form.action.type === DELIVERY_RULE_ACTION.FORCE_LOSS" class="space-y-4 rounded-lg border border-rose-200 bg-white p-4">
                  <div class="flex items-center gap-2 pb-3 border-b border-rose-100">
                    <span class="text-2xl">❌</span>
                    <div class="flex-1">
                      <h4 class="text-sm font-semibold text-rose-900">强制亏损</h4>
                      <p class="text-xs text-rose-600">让用户的下N单强制亏损指定比例</p>
                    </div>
                  </div>

                  <div class="space-y-4">
                    <div class="grid gap-4 sm:grid-cols-2">
                      <label class="block space-y-2">
                        <span class="text-sm font-medium text-slate-700">影响订单数</span>
                        <input
                          v-model.number="form.action.params.nextPositionCount"
                          type="number"
                          min="1"
                          max="10"
                          class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none"
                        />
                        <p class="text-xs text-slate-500">接下来的 {{ form.action.params.nextPositionCount }} 笔订单将执行此策略</p>
                      </label>

                      <label class="block space-y-2">
                        <span class="text-sm font-medium text-slate-700">亏损比例</span>
                        <div class="flex items-center gap-2">
                          <input
                            v-model.number="form.action.params.lossPercent"
                            type="number"
                            min="0"
                            max="1"
                            step="0.01"
                            class="w-20 rounded-md border border-rose-300 px-2 py-2 text-sm focus:border-rose-500 focus:outline-none"
                          />
                          <span class="text-sm font-bold text-rose-700">{{ (form.action.params.lossPercent * 100).toFixed(0) }}%</span>
                          <input v-model.number="form.action.params.lossPercent" type="range" min="0" max="1" step="0.01" class="flex-1 accent-rose-600" />
                        </div>
                      </label>
                    </div>

                    <div class="rounded-md bg-rose-50 border border-rose-200 px-3 py-2.5">
                      <p class="text-xs font-medium text-rose-900">
                        ✓ 用户接下来 {{ form.action.params.nextPositionCount }} 笔订单将强制亏损 <strong class="text-base">{{ (form.action.params.lossPercent * 100).toFixed(0) }}%</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <!-- 强制盈利参数 -->
                <div v-if="form.action.type === DELIVERY_RULE_ACTION.FORCE_WIN" class="space-y-4 rounded-lg border border-emerald-200 bg-white p-4">
                  <div class="flex items-center gap-2 pb-3 border-b border-emerald-100">
                    <span class="text-2xl">✅</span>
                    <div class="flex-1">
                      <h4 class="text-sm font-semibold text-emerald-900">强制盈利</h4>
                      <p class="text-xs text-emerald-600">让用户的下N单强制盈利指定比例</p>
                    </div>
                  </div>

                  <div class="space-y-4">
                    <div class="grid gap-4 sm:grid-cols-2">
                      <label class="block space-y-2">
                        <span class="text-sm font-medium text-slate-700">影响订单数</span>
                        <input
                          v-model.number="form.action.params.nextPositionCount"
                          type="number"
                          min="1"
                          max="10"
                          class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                        />
                        <p class="text-xs text-slate-500">接下来的 {{ form.action.params.nextPositionCount }} 笔订单将执行此策略</p>
                      </label>

                      <label class="block space-y-2">
                        <span class="text-sm font-medium text-slate-700">盈利比例</span>
                        <div class="flex items-center gap-2">
                          <input
                            v-model.number="form.action.params.profitPercent"
                            type="number"
                            min="0"
                            max="1"
                            step="0.01"
                            class="w-20 rounded-md border border-emerald-300 px-2 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                          />
                          <span class="text-sm font-bold text-emerald-700">{{ (form.action.params.profitPercent * 100).toFixed(0) }}%</span>
                          <input v-model.number="form.action.params.profitPercent" type="range" min="0" max="1" step="0.01" class="flex-1 accent-emerald-600" />
                        </div>
                      </label>
                    </div>

                    <div class="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2.5">
                      <p class="text-xs font-medium text-emerald-900">
                        ✓ 用户接下来 {{ form.action.params.nextPositionCount }} 笔订单将强制盈利 <strong class="text-base">{{ (form.action.params.profitPercent * 100).toFixed(0) }}%</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </section>
          </div>

          <footer class="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button type="button" class="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-white hover:shadow-sm" @click="close">取消</button>
            <button
              type="button"
              class="rounded-lg px-5 py-2.5 text-sm font-medium text-white transition shadow-sm"
              :class="form.name.trim() && Number(form.trigger.threshold) > 0 ? 'bg-violet-600 hover:bg-violet-700 hover:shadow-md' : 'bg-violet-300 cursor-not-allowed'"
              :disabled="!form.name.trim() || Number(form.trigger.threshold) <= 0"
              @click="save"
            >
              <span class="flex items-center gap-2">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                保存规则
              </span>
            </button>
          </footer>
        </div>

        <!-- 右侧帮助区域 -->
        <div class="flex w-2/5 flex-col bg-gradient-to-br from-slate-50 to-slate-100">
          <header class="border-b border-slate-200 px-5 py-4">
            <h3 class="text-lg font-semibold text-slate-900">配置预览</h3>
            <p class="mt-1 text-xs text-slate-500">右侧实时展示当前配置的主要参数和期望收益</p>
          </header>
          <div class="flex-1 overflow-y-auto px-5 py-4">
            <div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 class="text-sm font-semibold text-blue-900 mb-2">主要参数</h4>
              <ul class="text-xs text-slate-700 space-y-1">
                <li>盈利概率：<span class="font-mono">{{ ((form.action.params.profitControl.winProbability || 0) * 100).toFixed(1) }}%</span></li>
                <li>单笔盈利：<span class="font-mono">+{{ form.action.params.profitControl.avgWinAmount || 0 }}%</span></li>
                <li>单笔亏损：<span class="font-mono">{{ form.action.params.profitControl.avgLossAmount || 0 }}%</span></li>
                <li>盈利波动：<span class="font-mono">±{{ form.action.params.profitControl.winFluctuationPercent || 0 }}%</span></li>
                <li>亏损波动：<span class="font-mono">±{{ form.action.params.profitControl.lossFluctuationPercent || 0 }}%</span></li>
              </ul>
              <div class="mt-4 border-t border-blue-100 pt-3">
                <div class="text-xs text-slate-600 mb-1">期望收益（长期平均）：</div>
                <div class="text-xl font-bold" :class="calculatedExpectedValue > 0 ? 'text-green-600' : calculatedExpectedValue < 0 ? 'text-red-600' : 'text-slate-700'">
                  {{ calculatedExpectedValue > 0 ? '+' : '' }}{{ calculatedExpectedValue.toFixed(2) }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </Transition>
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

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 600px;
  opacity: 1;
  transform: translateY(0);
}
</style>
