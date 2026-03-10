<script setup>
import { computed, reactive, ref, watch } from 'vue'
import {
  DELIVERY_RULE_TRIGGER_TYPE,
  DELIVERY_RULE_ACTION,
  DELIVERY_RULE_STATUS,
  DELIVERY_RULE_PRIORITY,
  DELIVERY_RULE_TIME_PERIOD,
  USER_RISK_LEVEL,
  PROFIT_CONTROL_MODE,
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

// 帮助面板状态
const showTriggerHelp = ref(false)

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
      // 盈亏控制（线控）- 简化版
      profitControl: {
        mode: 'simple',                            // 'simple' 简单模式 | 'advanced' 高级模式
        preset: 'light_control',                   // 预设方案
        targetExpectedValue: -50,                  // 目标期望值（每单平均盈亏）
        strategy: PROFIT_CONTROL_STRATEGY.SETTLEMENT_PRICE,  // 技术策略
        avgWinAmount: 200,                         // 赢时金额
        avgLossAmount: -150,                       // 输时金额
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
    icon: '📊',
    description: '监测用户在指定时间内的交易次数',
    unit: '次',
    needsPeriod: true,
    defaultThreshold: 20
  },
  {
    value: DELIVERY_RULE_TRIGGER_TYPE.PROFIT_LOSS,
    label: '累计盈亏',
    icon: '📈',
    description: '监测用户在指定时间内的累计盈亏金额',
    unit: 'USDT',
    needsPeriod: true,
    defaultThreshold: 1000
  },
  {
    value: DELIVERY_RULE_TRIGGER_TYPE.CONSECUTIVE_WINS,
    label: '连续盈利',
    icon: '🎯',
    description: '监测用户连续盈利的次数',
    unit: '次',
    needsPeriod: true,
    defaultThreshold: 5
  },
  {
    value: DELIVERY_RULE_TRIGGER_TYPE.CONSECUTIVE_LOSS,
    label: '连续亏损',
    icon: '📉',
    description: '监测用户连续亏损的次数',
    unit: '次',
    needsPeriod: true,
    defaultThreshold: 5
  }
]

// 触发类型详细帮助文档
const triggerTypeHelpDocs = {
  [DELIVERY_RULE_TRIGGER_TYPE.TRADE_COUNT]: {
    title: '交易次数触发',
    definition: '当用户在指定时间周期内完成的交易笔数达到设定阈值时触发规则。',
    explanation: '系统会实时统计用户在选定时间窗口内的交易次数（包括已平仓和当前持仓）。每当完成一笔交易后，系统会重新计算该时间段内的总交易次数，如果达到或超过设定的阈值，则立即触发规则执行相应动作。',
    useCases: [
      {
        scenario: '高频交易控盈',
        config: '时间周期：最近1小时 | 阈值：20次',
        purpose: '限制在1小时内交易超过20次的高频用户的盈利表现，防止通过快速交易获取超额收益'
      },
      {
        scenario: '日交易量限制',
        config: '时间周期：今日 | 阈值：50次',
        purpose: '对当天交易频繁的用户进行风控干预，避免日内过度交易带来的风险'
      },
      {
        scenario: '短期频繁操作监测',
        config: '时间周期：最近4小时 | 阈值：30次',
        purpose: '识别短时间内频繁交易的用户，可能的套利行为或异常交易模式'
      }
    ],
    notes: [
      '交易次数统计包括所有已结算的订单',
      '未结算的持仓不计入交易次数',
      '时间窗口为滑动窗口，会实时更新'
    ]
  },
  [DELIVERY_RULE_TRIGGER_TYPE.PROFIT_LOSS]: {
    title: '累计盈亏触发',
    definition: '当用户在指定时间周期内的累计盈亏金额达到设定阈值时触发规则。',
    explanation: '系统持续追踪用户在时间窗口内所有交易的盈亏总和。盈利为正数，亏损为负数。阈值可以设置为正值（监测盈利）或负值（监测亏损）。当累计金额触达阈值时立即触发规则。',
    useCases: [
      {
        scenario: '盈利过高干预',
        config: '时间周期：最近4小时 | 阈值：+2000 USDT',
        purpose: '当用户4小时内累计盈利超过2000 USDT时，启动盈亏控制降低后续盈利概率'
      },
      {
        scenario: '亏损保护',
        config: '时间周期：今日 | 阈值：-5000 USDT',
        purpose: '当用户当日累计亏损超过5000 USDT时，触发保护机制提升盈利概率'
      },
      {
        scenario: '短期波动监控',
        config: '时间周期：最近1小时 | 阈值：+1000 USDT',
        purpose: '监控短时间内快速盈利的用户，可能存在市场异常或套利行为'
      }
    ],
    notes: [
      '盈亏金额包含所有已结算订单的净盈亏',
      '正数表示盈利，负数表示亏损',
      '时间窗口为滑动窗口，实时计算累计值',
      '可使用「今日」时间周期来替代原日盈利功能'
    ]
  },
  [DELIVERY_RULE_TRIGGER_TYPE.CONSECUTIVE_WINS]: {
    title: '连续盈利触发',
    definition: '当用户在指定时间周期内连续盈利的次数达到设定阈值时触发规则。',
    explanation: '系统追踪用户连续平仓盈利的订单数量。只要有一笔订单亏损，计数器重置为0。当连续盈利次数达到阈值时触发规则，通常用于打断用户的连胜状态。',
    useCases: [
      {
        scenario: '连胜阻断',
        config: '时间周期：最近1小时 | 阈值：5次',
        purpose: '当用户连续5次盈利后，强制下一单亏损，避免持续盈利影响平台收益'
      },
      {
        scenario: '适度控盈',
        config: '时间周期：最近4小时 | 阈值：8次',
        purpose: '连续盈利8次后启动盈亏控制，降低期望值但不强制亏损'
      },
      {
        scenario: '异常盈利监测',
        config: '时间周期：今日 | 阈值：10次',
        purpose: '识别当日连续盈利超过10次的异常用户，可能存在策略漏洞'
      }
    ],
    notes: [
      '只统计连续盈利，中间有亏损则重置计数',
      '盈利判断标准：结算金额 > 开仓成本',
      '时间窗口限制统计范围'
    ]
  },
  [DELIVERY_RULE_TRIGGER_TYPE.CONSECUTIVE_LOSS]: {
    title: '连续亏损触发',
    definition: '当用户在指定时间周期内连续亏损的次数达到设定阈值时触发规则。',
    explanation: '系统追踪用户连续平仓亏损的订单数量。只要有一笔订单盈利，计数器重置为0。当连续亏损次数达到阈值时触发规则，通常用于用户保护或挽留策略。',
    useCases: [
      {
        scenario: '用户保护',
        config: '时间周期：最近1小时 | 阈值：5次',
        purpose: '当用户连续亏损5次后，强制下一单盈利或提升盈利概率，避免流失'
      },
      {
        scenario: '挽留机制',
        config: '时间周期：今日 | 阈值：8次',
        purpose: '识别当日连续亏损8次的用户，给予补偿性盈利机会'
      },
      {
        scenario: '新手保护',
        config: '时间周期：最近24小时 | 阈值：3次',
        purpose: '对新用户放宽标准，连续3次亏损即触发保护，提升留存率'
      }
    ],
    notes: [
      '只统计连续亏损，中间有盈利则重置计数',
      '亏损判断标准：结算金额 < 开仓成本',
      '通常用于用户体验优化和留存提升'
    ]
  }
}

// 时间周期选项
const timePeriodOptions = [
  { value: DELIVERY_RULE_TIME_PERIOD.REAL_TIME, label: '实时', description: '立即触发' },
  { value: DELIVERY_RULE_TIME_PERIOD.LAST_1H, label: '最近1小时', description: '统计最近1小时数据' },
  { value: DELIVERY_RULE_TIME_PERIOD.LAST_4H, label: '最近4小时', description: '统计最近4小时数据' },
  { value: DELIVERY_RULE_TIME_PERIOD.LAST_24H, label: '最近24小时', description: '统计最近24小时数据' },
  { value: DELIVERY_RULE_TIME_PERIOD.TODAY, label: '今日', description: '统计当日数据' },
  { value: DELIVERY_RULE_TIME_PERIOD.LAST_7D, label: '最近7天', description: '统计最近7天数据' }
]

// 执行动作配置（精简版 - 只保留核心功能）
const actionTypeOptions = [
  {
    value: DELIVERY_RULE_ACTION.PROFIT_CONTROL,
    label: '盈亏控制',
    icon: '🎚️',
    description: '精确调整用户的交易盈亏金额（线控）',
    color: 'blue',
    recommended: true
  },
  {
    value: DELIVERY_RULE_ACTION.FORCE_WIN,
    label: '强制盈利',
    icon: '✅',
    description: '强制下N单结算为盈利',
    color: 'emerald'
  },
  {
    value: DELIVERY_RULE_ACTION.FORCE_LOSS,
    label: '强制亏损',
    icon: '❌',
    description: '强制下N单结算为亏损',
    color: 'rose'
  }
]

// 优先级选项
const priorityOptions = [
  { value: DELIVERY_RULE_PRIORITY.HIGH, label: '高优先级', color: 'rose', icon: '🔴' },
  { value: DELIVERY_RULE_PRIORITY.MEDIUM, label: '中优先级', color: 'amber', icon: '🟡' },
  { value: DELIVERY_RULE_PRIORITY.LOW, label: '低优先级', color: 'slate', icon: '⚪' }
]

// 状态选项
const statusOptions = [
  { value: DELIVERY_RULE_STATUS.ENABLED, label: '运行中', color: 'emerald' },
  { value: DELIVERY_RULE_STATUS.PAUSED, label: '已暂停', color: 'amber' },
  { value: DELIVERY_RULE_STATUS.DISABLED, label: '已禁用', color: 'slate' }
]

// 风险等级选项
const riskLevelOptions = [
  { value: USER_RISK_LEVEL.VERY_HIGH, label: '极高风险', color: 'rose' },
  { value: USER_RISK_LEVEL.HIGH, label: '高风险', color: 'orange' },
  { value: USER_RISK_LEVEL.MEDIUM, label: '中风险', color: 'amber' },
  { value: USER_RISK_LEVEL.LOW, label: '低风险', color: 'blue' },
  { value: USER_RISK_LEVEL.SAFE, label: '安全', color: 'emerald' }
]

// 盈亏控制预设方案
const profitControlPresets = [
  {
    id: 'light_control',
    name: '轻度控盈',
    icon: '🟢',
    description: '用户平均每单小亏',
    targetExpectedValue: -30,
    avgWinAmount: 200,
    avgLossAmount: -120,
    color: 'emerald'
  },
  {
    id: 'medium_control',
    name: '中度控盈',
    icon: '🟡',
    description: '用户平均每单中等亏损',
    targetExpectedValue: -80,
    avgWinAmount: 180,
    avgLossAmount: -180,
    color: 'amber'
  },
  {
    id: 'strong_control',
    name: '强力控盈',
    icon: '🔴',
    description: '用户平均每单大幅亏损',
    targetExpectedValue: -150,
    avgWinAmount: 150,
    avgLossAmount: -250,
    color: 'rose'
  },
  {
    id: 'balanced',
    name: '盈亏平衡',
    icon: '⚖️',
    description: '用户整体不赚不亏',
    targetExpectedValue: 0,
    avgWinAmount: 200,
    avgLossAmount: -200,
    color: 'slate'
  },
  {
    id: 'profit_boost',
    name: '盈利提升',
    icon: '💰',
    description: '帮助用户盈利（VIP用户）',
    targetExpectedValue: 50,
    avgWinAmount: 300,
    avgLossAmount: -100,
    color: 'blue'
  },
  {
    id: 'custom',
    name: '自定义',
    icon: '⚙️',
    description: '手动设置所有参数',
    targetExpectedValue: -50,
    avgWinAmount: 200,
    avgLossAmount: -150,
    color: 'violet'
  }
]

// 盈亏控制策略选项（技术实现方式）
const profitControlStrategyOptions = [
  { 
    value: PROFIT_CONTROL_STRATEGY.SETTLEMENT_PRICE, 
    label: '结算价格选择', 
    description: '在市场价格范围内选择有利价格（推荐）'
  },
  { 
    value: PROFIT_CONTROL_STRATEGY.TIME_WINDOW, 
    label: '时间窗口选择', 
    description: '利用秒级价格波动选择结算时间点'
  },
  { 
    value: PROFIT_CONTROL_STRATEGY.SLIPPAGE, 
    label: '滑点控制', 
    description: '通过开仓和平仓滑点影响盈亏'
  },
  { 
    value: PROFIT_CONTROL_STRATEGY.KLINE_OFFSET, 
    label: 'K线显示偏移', 
    description: '轻微调整显示价格（< 0.1%）'
  }
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

const currentActionConfig = computed(() => {
  return actionTypeOptions.find(opt => opt.value === form.action.type)
})

const needsTimePeriod = computed(() => {
  return currentTriggerConfig.value?.needsPeriod
})

const currentTriggerHelp = computed(() => {
  return triggerTypeHelpDocs[form.trigger.type] || null
})

const formattedThreshold = computed(() => {
  const config = currentTriggerConfig.value
  if (!config) return ''
  
  const value = currentTriggerConfig.value.isPercentage 
    ? form.trigger.threshold 
    : form.trigger.threshold
    
  return `${value}${config.unit || ''}`
})

// 方法
const close = () => {
  emit('close')
}

const applyProfitControlPreset = (preset) => {
  if (preset.id === 'custom') {
    form.action.params.profitControl.mode = 'advanced'
    form.action.params.profitControl.preset = 'custom'
  } else {
    form.action.params.profitControl.mode = 'simple'
    form.action.params.profitControl.preset = preset.id
    form.action.params.profitControl.targetExpectedValue = preset.targetExpectedValue
    form.action.params.profitControl.avgWinAmount = preset.avgWinAmount
    form.action.params.profitControl.avgLossAmount = preset.avgLossAmount
  }
}

const currentProfitControlPreset = computed(() => {
  const presetId = form.action.params.profitControl.preset
  return profitControlPresets.find(p => p.id === presetId) || profitControlPresets[0]
})

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
              mode: 'simple',
              preset: 'light_control',
              strategy: PROFIT_CONTROL_STRATEGY.SETTLEMENT_PRICE,
              targetExpectedValue: -30,
              avgWinAmount: 200,
              avgLossAmount: -120,
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

// 实时计算预览
const mockOrderAmount = 10000 // 模拟订单金额 10000 USDT

const previewSummary = computed(() => {
  const parts = []
  const action = form.action
  
  if (action.type === DELIVERY_RULE_ACTION.PROFIT_CONTROL) {
    const profitCtrl = action.params.profitControl
    const expectedValue = profitCtrl.targetExpectedValue || 0
    parts.push(`目标期望值: ${expectedValue > 0 ? '+' : ''}${expectedValue} USDT`)
    
    const avgWin = profitCtrl.avgWinAmount || 0
    const avgLoss = profitCtrl.avgLossAmount || 0
    parts.push(`盈亏: +${avgWin} / ${avgLoss} USDT`)
  } else if (action.type === DELIVERY_RULE_ACTION.FORCE_LOSS) {
    parts.push(`强制亏损: ${(action.params.lossPercent * 100).toFixed(0)}%`)
  } else if (action.type === DELIVERY_RULE_ACTION.FORCE_WIN) {
    parts.push(`强制盈利: ${(action.params.profitPercent * 100).toFixed(0)}%`)
  }
  
  const duration = action.params.duration || 0
  parts.push(duration === 0 ? '持续生效' : `${duration} 分钟`)
  
  return parts.join(' | ')
})

const impactAnalysis = computed(() => {
  const action = form.action
  let impactPercent = 0
  let description = ''
  
  if (action.type === DELIVERY_RULE_ACTION.PROFIT_CONTROL) {
    const profitCtrl = action.params.profitControl
    const expectedValue = profitCtrl.targetExpectedValue || 0
    const avgWin = profitCtrl.avgWinAmount || 0
    const avgLoss = Math.abs(profitCtrl.avgLossAmount || 0)
    
    // 计算对用户的盈亏影响（负数表示用户亏损）
    impactPercent = (expectedValue / mockOrderAmount) * 100
    
    if (expectedValue < 0) {
      description = `预期用户平均每单亏损 ${Math.abs(expectedValue).toFixed(2)} USDT（盈利 ${avgWin} USDT 时盈，亏损 ${avgLoss} USDT 时亏）`
    } else if (expectedValue > 0) {
      description = `预期用户平均每单盈利 ${expectedValue.toFixed(2)} USDT（盈利 ${avgWin} USDT 时盈，亏损 ${avgLoss} USDT 时亏）`
    } else {
      description = `预期用户盈亏平衡（盈利 ${avgWin} USDT 时盈，亏损 ${avgLoss} USDT 时亏）`
    }
  } else if (action.type === DELIVERY_RULE_ACTION.FORCE_LOSS) {
    impactPercent = (action.params.lossPercent || 0) * 100
    description = `用户下 ${action.params.nextPositionCount} 单将强制亏损 ${impactPercent.toFixed(1)}%`
  } else if (action.type === DELIVERY_RULE_ACTION.FORCE_WIN) {
    impactPercent = -(action.params.profitPercent || 0) * 100
    description = `用户下 ${action.params.nextPositionCount} 单将强制盈利 ${Math.abs(impactPercent).toFixed(1)}%`
  }
  
  const costImpact = (mockOrderAmount * Math.abs(impactPercent) / 100).toFixed(2)
  
  return {
    impactPercent,
    description,
    costImpact
  }
})
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
                      <option v-for="priority in priorityOptions" :key="priority.value" :value="priority.value">{{ priority.icon }} {{ priority.label }}</option>
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
                <button 
                  type="button"
                  @click="showTriggerHelp = !showTriggerHelp"
                  class="flex items-center gap-1.5 rounded-lg bg-white/80 px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm transition-all hover:bg-white hover:shadow"
                  :class="{ 'ring-2 ring-blue-400': showTriggerHelp }"
                >
                  <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ showTriggerHelp ? '关闭帮助' : '查看帮助' }}
                </button>
              </div>

              <div class="space-y-3.5">
                <label class="block space-y-2">
                  <span class="text-sm font-medium text-slate-700">触发类型</span>
                  <select v-model="form.trigger.type" class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                    <option v-for="option in triggerTypeOptions" :key="option.value" :value="option.value">
                      {{ option.icon }} {{ option.label }}
                    </option>
                  </select>
                </label>

                <div class="grid gap-3.5 sm:grid-cols-2">
                  <label class="block space-y-2">
                    <span class="text-sm font-medium text-slate-700">{{ currentTriggerConfig?.thresholdLabel || '阈值' }} <span class="text-rose-500">*</span></span>
                    <input
                      v-model.number="form.trigger.threshold"
                      type="number"
                      min="0"
                      class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>

                  <label v-if="needsTimePeriod" class="block space-y-2">
                    <span class="text-sm font-medium text-slate-700">时间周期</span>
                    <select v-model="form.trigger.period" class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                      <option v-for="period in timePeriodOptions" :key="period.value" :value="period.value">{{ period.label }}</option>
                    </select>
                  </label>
                </div>
              </div>

              <!-- 触发类型帮助面板 -->
              <Transition name="slide-down">
                <div v-if="showTriggerHelp && currentTriggerHelp" class="rounded-lg border border-blue-300 bg-white p-4 shadow-sm">
                  <div class="mb-3 flex items-start gap-2 border-b border-blue-100 pb-3">
                    <span class="text-2xl">{{ currentTriggerConfig?.icon }}</span>
                    <div class="flex-1">
                      <h4 class="text-sm font-bold text-blue-900">{{ currentTriggerHelp.title }}</h4>
                      <p class="mt-1 text-xs leading-relaxed text-slate-600">{{ currentTriggerHelp.definition }}</p>
                    </div>
                  </div>

                  <div class="space-y-3">
                    <div>
                      <h5 class="mb-1.5 text-xs font-semibold text-slate-700">📖 详细说明</h5>
                      <p class="text-xs leading-relaxed text-slate-600">{{ currentTriggerHelp.explanation }}</p>
                    </div>

                    <div>
                      <h5 class="mb-2 text-xs font-semibold text-slate-700">💡 典型用例</h5>
                      <div class="space-y-2">
                        <div 
                          v-for="(useCase, index) in currentTriggerHelp.useCases" 
                          :key="index"
                          class="rounded-md bg-slate-50 p-2.5"
                        >
                          <div class="mb-1 flex items-center gap-2">
                            <span class="text-xs font-semibold text-slate-800">{{ useCase.scenario }}</span>
                            <span class="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">{{ useCase.config }}</span>
                          </div>
                          <p class="text-xs text-slate-600">{{ useCase.purpose }}</p>
                        </div>
                      </div>
                    </div>

                    <div v-if="currentTriggerHelp.notes && currentTriggerHelp.notes.length > 0">
                      <h5 class="mb-1.5 text-xs font-semibold text-slate-700">⚠️ 注意事项</h5>
                      <ul class="space-y-1 pl-3">
                        <li v-for="(note, index) in currentTriggerHelp.notes" :key="index" class="text-xs text-slate-600">
                          <span class="mr-1 text-amber-500">•</span>{{ note }}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Transition>
            </section>

            <!-- 执行动作 -->
            <section class="space-y-4 rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-5 shadow-sm">
              <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
                  <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 class="text-base font-semibold text-slate-900">执行动作</h3>
              </div>

              <div class="space-y-3.5">
                <label class="block space-y-2">
                  <span class="text-sm font-medium text-slate-700">动作类型</span>
                  <select v-model="form.action.type" class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100">
                    <option v-for="action in actionTypeOptions" :key="action.value" :value="action.value">
                      {{ action.icon }} {{ action.label }}
                    </option>
                  </select>
                </label>

                <!-- 盈亏控制参数 -->
                <div v-if="form.action.type === DELIVERY_RULE_ACTION.PROFIT_CONTROL" class="space-y-4 rounded-lg border border-blue-200 bg-white p-4">
                  <div class="flex items-center gap-2 pb-3 border-b border-blue-100">
                    <span class="text-2xl">🎚️</span>
                    <div class="flex-1">
                      <h4 class="text-sm font-semibold text-blue-900">盈亏控制配置</h4>
                      <p class="text-xs text-blue-600">选择预设方案，自动调整用户交易盈亏</p>
                    </div>
                  </div>

                  <!-- 预设方案选择（简化版） -->
                  <div class="space-y-3">
                    <label class="block">
                      <span class="text-sm font-medium text-slate-700">选择控制方案</span>
                      <p class="text-xs text-slate-500 mt-1">根据你的需求选择合适的控制强度</p>
                    </label>
                    
                    <div class="grid gap-2.5 sm:grid-cols-2">
                      <button
                        v-for="preset in profitControlPresets"
                        :key="preset.id"
                        type="button"
                        class="flex items-start gap-3 rounded-lg border-2 p-3 text-left transition-all"
                        :class="[
                          form.action.params.profitControl.preset === preset.id 
                            ? {
                                'border-emerald-500 bg-emerald-50': preset.color === 'emerald',
                                'border-amber-500 bg-amber-50': preset.color === 'amber',
                                'border-rose-500 bg-rose-50': preset.color === 'rose',
                                'border-slate-500 bg-slate-50': preset.color === 'slate',
                                'border-blue-500 bg-blue-50': preset.color === 'blue',
                                'border-violet-500 bg-violet-50': preset.color === 'violet'
                              }
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        ]"
                        @click="applyProfitControlPreset(preset)"
                      >
                        <span class="text-xl">{{ preset.icon }}</span>
                        <div class="flex-1">
                          <p class="text-sm font-semibold text-slate-900">{{ preset.name }}</p>
                          <p class="mt-0.5 text-xs text-slate-600">{{ preset.description }}</p>
                          <div v-if="preset.id !== 'custom'" class="mt-1.5 flex items-center gap-2 text-xs">
                            <span class="rounded px-1.5 py-0.5 font-mono" 
                              :class="preset.targetExpectedValue > 0 ? 'bg-emerald-100 text-emerald-700' : preset.targetExpectedValue < 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'">
                              {{ preset.targetExpectedValue > 0 ? '+' : '' }}{{ preset.targetExpectedValue }}
                            </span>
                            <span class="text-slate-400">|</span>
                            <span class="text-slate-600">+{{ preset.avgWinAmount }} / {{ preset.avgLossAmount }}</span>
                          </div>
                        </div>
                        <div v-if="form.action.params.profitControl.preset === preset.id" 
                          class="flex h-5 w-5 items-center justify-center rounded-full"
                          :class="{
                            'bg-emerald-500': preset.color === 'emerald',
                            'bg-amber-500': preset.color === 'amber',
                            'bg-rose-500': preset.color === 'rose',
                            'bg-slate-500': preset.color === 'slate',
                            'bg-blue-500': preset.color === 'blue',
                            'bg-violet-500': preset.color === 'violet'
                          }">
                          <svg class="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </button>
                    </div>

                    <!-- 效果说明 -->
                    <div class="rounded-md bg-blue-50 border border-blue-200 px-3 py-2.5">
                      <div class="flex items-start gap-2">
                        <span class="text-lg">💡</span>
                        <div class="flex-1 space-y-1">
                          <p class="text-xs font-medium text-blue-900">
                            {{ currentProfitControlPreset.name }} - 效果说明
                          </p>
                          <p class="text-xs text-blue-800">
                            • 目标：用户平均每单{{ form.action.params.profitControl.targetExpectedValue >= 0 ? '盈利' : '亏损' }} <strong class="font-mono">{{ Math.abs(form.action.params.profitControl.targetExpectedValue) }} USDT</strong>
                          </p>
                          <p class="text-xs text-blue-800">
                            • 当用户盈利时，金额约 <strong class="font-mono">{{ form.action.params.profitControl.avgWinAmount }} USDT</strong>
                          </p>
                          <p class="text-xs text-blue-800">
                            • 当用户亏损时，金额约 <strong class="font-mono">{{ form.action.params.profitControl.avgLossAmount }} USDT</strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 高级选项（仅自定义模式显示） -->
                  <div v-if="form.action.params.profitControl.preset === 'custom'" class="space-y-4 pt-4 border-t border-blue-100">
                    <div class="flex items-center gap-2">
                      <svg class="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                      <span class="text-sm font-medium text-slate-700">自定义参数</span>
                    </div>

                    <div class="grid gap-3 sm:grid-cols-3">
                      <label class="block space-y-2">
                        <span class="text-sm text-slate-600">目标期望值</span>
                        <div class="flex items-center gap-1">
                          <input
                            v-model.number="form.action.params.profitControl.targetExpectedValue"
                            type="number"
                            step="10"
                            class="flex-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                          />
                          <span class="text-xs text-slate-500">USDT</span>
                        </div>
                      </label>
                      <label class="block space-y-2">
                        <span class="text-sm text-slate-600">赢时金额</span>
                        <div class="flex items-center gap-1">
                          <input
                            v-model.number="form.action.params.profitControl.avgWinAmount"
                            type="number"
                            step="10"
                            class="flex-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                          />
                          <span class="text-xs text-slate-500">USDT</span>
                        </div>
                      </label>
                      <label class="block space-y-2">
                        <span class="text-sm text-slate-600">输时金额</span>
                        <div class="flex items-center gap-1">
                          <input
                            v-model.number="form.action.params.profitControl.avgLossAmount"
                            type="number"
                            step="10"
                            class="flex-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                          />
                          <span class="text-xs text-slate-500">USDT</span>
                        </div>
                      </label>
                    </div>

                    <div class="grid gap-3 sm:grid-cols-2">
                      <label class="block space-y-2">
                        <span class="text-sm text-slate-600">最大累计盈利</span>
                        <div class="flex items-center gap-1">
                          <input
                            v-model.number="form.action.params.profitControl.maxProfit"
                            type="number"
                            step="1000"
                            class="flex-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                          />
                          <span class="text-xs text-slate-500">USDT</span>
                        </div>
                      </label>
                      <label class="block space-y-2">
                        <span class="text-sm text-slate-600">最大亏损比例</span>
                        <div class="flex items-center gap-1">
                          <input
                            v-model.number="form.action.params.profitControl.maxLossRatio"
                            type="number"
                            min="0"
                            max="1"
                            step="0.05"
                            class="flex-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                          />
                          <span class="text-xs text-slate-500">{{ (form.action.params.profitControl.maxLossRatio * 100).toFixed(0) }}%</span>
                        </div>
                      </label>
                    </div>

                    <label class="block space-y-2">
                      <span class="text-sm text-slate-600">技术实现策略</span>
                      <select
                        v-model="form.action.params.profitControl.strategy"
                        class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      >
                        <option v-for="strategy in profitControlStrategyOptions" :key="strategy.value" :value="strategy.value">
                          {{ strategy.label }} - {{ strategy.description }}
                        </option>
                      </select>
                    </label>
                  </div>

                  <!-- 通用选项 -->
                  <div class="space-y-3 pt-3 border-t border-blue-100">
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

        <!-- 右侧预览区域 -->
        <div class="flex w-2/5 flex-col bg-gradient-to-br from-slate-50 to-slate-100">
          <header class="border-b border-slate-200 px-5 py-4">
            <h3 class="text-lg font-semibold text-slate-900">实时预览</h3>
            <p class="mt-0.5 text-xs text-slate-500">调整参数后即时显示效果</p>
          </header>

          <div class="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            <!-- 规则概览 -->
            <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div class="flex items-center justify-between">
                <h4 class="text-sm font-semibold text-slate-900">规则概览</h4>
                <span class="rounded-md px-2 py-1 text-xs font-medium" :class="form.status === DELIVERY_RULE_STATUS.ENABLED ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'">
                  {{ statusOptions.find(s => s.value === form.status)?.label || '未知' }}
                </span>
              </div>
              <div class="mt-3 space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-slate-500">规则名称</span>
                  <span class="font-medium text-slate-900">{{ form.name || '未命名规则' }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-slate-500">优先级</span>
                  <span class="font-medium text-slate-900">{{ priorityOptions.find(p => p.value === form.priority)?.label || '-' }}</span>
                </div>
                <div class="pt-2 border-t border-slate-100">
                  <div class="text-xs text-slate-600">
                    <span class="font-medium">触发: </span>{{ currentTriggerConfig?.label || '-' }} ({{ form.trigger.threshold }}{{ currentTriggerConfig?.unit || '' }})
                  </div>
                  <div class="mt-1 text-xs text-slate-600">
                    <span class="font-medium">动作: </span>{{ currentActionConfig?.label || '-' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 影响分析 -->
            <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <h4 class="text-sm font-semibold text-emerald-900">影响分析</h4>
              <div class="mt-3 space-y-2">
                <div class="rounded-md border border-emerald-200 bg-white p-3">
                  <p class="text-xs font-medium text-slate-500">基于 10,000 USDT 订单</p>
                  <div class="mt-2 flex items-center justify-between">
                    <span class="text-xs text-slate-600">预估影响成本</span>
                    <span class="text-sm font-bold" :class="impactAnalysis.impactPercent > 0 ? 'text-rose-600' : impactAnalysis.impactPercent < 0 ? 'text-emerald-600' : 'text-slate-900'">
                      ${{ impactAnalysis.costImpact }} ({{ Math.abs(impactAnalysis.impactPercent).toFixed(2) }}%)
                    </span>
                  </div>
                </div>
                <p class="text-xs text-slate-700">{{ impactAnalysis.description }}</p>
              </div>
            </div>

            <!-- 规则摘要 -->
            <div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 class="text-sm font-semibold text-blue-900">规则摘要</h4>
              <p class="mt-2 text-xs text-blue-700">{{ previewSummary }}</p>
            </div>

            <!-- 提示信息 -->
            <div class="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div class="flex items-start gap-2">
                <svg class="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                <div class="text-xs text-amber-900">
                  <p class="font-medium">提示</p>
                  <p class="mt-1">规则触发后将自动执行设定的动作，请谨慎配置各项参数。建议先在测试环境验证效果。</p>
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
