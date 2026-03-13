import {
  DELIVERY_RULE_TRIGGER_TYPE,
  DELIVERY_RULE_ACTION,
  DELIVERY_RULE_STATUS,
  DELIVERY_RULE_PRIORITY,
  DELIVERY_RULE_TIME_PERIOD,
  PROFIT_CONTROL_STRATEGY
} from '../constants/deliveryControl'

const clone = (value) => JSON.parse(JSON.stringify(value))

// 自动规则列表
const deliveryAutoRules = [
  {
    id: 'rule_001',
    name: '高频交易用户控盈',
    description: '1小时内交易超过20次且累计盈利超过1000的用户，控制胜率20%',
    status: DELIVERY_RULE_STATUS.ENABLED,
    priority: DELIVERY_RULE_PRIORITY.HIGH,
    trigger: {
      type: DELIVERY_RULE_TRIGGER_TYPE.TRADE_COUNT,
      period: DELIVERY_RULE_TIME_PERIOD.LAST_1H,
      threshold: 20
    },
    action: {
      type: DELIVERY_RULE_ACTION.PROFIT_CONTROL,
      params: {
        profitControl: {
          winProbability: 0.2,
          avgWinAmount: 25,
          avgLossAmount: -18,
          winFluctuationPercent: 2,
          lossFluctuationPercent: 2,
          strategy: PROFIT_CONTROL_STRATEGY.TIME_WINDOW
        },
        applyToNewPositions: true,
        duration: 0
      }
    },
    hitCount: 34,
    lastHitAt: '2026-03-10 14:35:22',
    totalAffectedUsers: 156,
    createdAt: '2026-03-01 10:00:00',
    updatedAt: '2026-03-10 08:00:00'
  },
  {
    id: 'rule_002',
    name: '单日盈利过高强制亏损',
    description: '用户当日累计盈利超过 5000 USDT 时，后续 3 单强制亏损 30%',
    status: DELIVERY_RULE_STATUS.ENABLED,
    priority: DELIVERY_RULE_PRIORITY.HIGH,
    trigger: {
      type: DELIVERY_RULE_TRIGGER_TYPE.PROFIT_LOSS,
      period: DELIVERY_RULE_TIME_PERIOD.TODAY,
      threshold: 5000
    },
    action: {
      type: DELIVERY_RULE_ACTION.FORCE_LOSS,
      params: {
        nextPositionCount: 3,
        lossPercent: 0.3,
        applyToNewPositions: true,
        duration: 60
      }
    },
    hitCount: 12,
    lastHitAt: '2026-03-10 16:20:10',
    totalAffectedUsers: 45,
    createdAt: '2026-03-01 10:00:00',
    updatedAt: '2026-03-09 15:00:00'
  },
  {
    id: 'rule_003',
    name: '连续盈利自动阻断',
    description: '用户最近 24 小时连续盈利 >= 5 次时，下一单强制亏损 25%',
    status: DELIVERY_RULE_STATUS.ENABLED,
    priority: DELIVERY_RULE_PRIORITY.MEDIUM,
    trigger: {
      type: DELIVERY_RULE_TRIGGER_TYPE.CONSECUTIVE_WINS,
      period: DELIVERY_RULE_TIME_PERIOD.LAST_24H,
      threshold: 5
    },
    action: {
      type: DELIVERY_RULE_ACTION.FORCE_LOSS,
      params: {
        nextPositionCount: 1,
        lossPercent: 0.25,
        applyToNewPositions: true,
        duration: 0
      }
    },
    hitCount: 89,
    lastHitAt: '2026-03-10 17:05:33',
    totalAffectedUsers: 234,
    createdAt: '2026-02-28 10:00:00',
    updatedAt: '2026-03-10 09:00:00'
  },
  {
    id: 'rule_004',
    name: '连续亏损用户保护',
    description: '用户最近 4 小时连续亏损 >= 5 次时，后续 2 单强制盈利 15%',
    status: DELIVERY_RULE_STATUS.ENABLED,
    priority: DELIVERY_RULE_PRIORITY.HIGH,
    trigger: {
      type: DELIVERY_RULE_TRIGGER_TYPE.CONSECUTIVE_LOSS,
      period: DELIVERY_RULE_TIME_PERIOD.LAST_4H,
      threshold: 5
    },
    action: {
      type: DELIVERY_RULE_ACTION.FORCE_WIN,
      params: {
        nextPositionCount: 2,
        profitPercent: 0.15,
        applyToNewPositions: true,
        duration: 0
      }
    },
    hitCount: 67,
    lastHitAt: '2026-03-10 17:18:45',
    totalAffectedUsers: 289,
    createdAt: '2026-03-02 10:00:00',
    updatedAt: '2026-03-10 10:00:00'
  },
  {
    id: 'rule_005',
    name: '亏损用户控盈',
    description: '用户最近 7 天累计亏损超过 8000 USDT 时，提高胜率到 65%',
    status: DELIVERY_RULE_STATUS.PAUSED,
    priority: DELIVERY_RULE_PRIORITY.LOW,
    trigger: {
      type: DELIVERY_RULE_TRIGGER_TYPE.PROFIT_LOSS,
      period: DELIVERY_RULE_TIME_PERIOD.LAST_7D,
      threshold: 8000
    },
    action: {
      type: DELIVERY_RULE_ACTION.PROFIT_CONTROL,
      params: {
        profitControl: {
          winProbability: 0.65,
          avgWinAmount: 18,
          avgLossAmount: -10,
          winFluctuationPercent: 2,
          lossFluctuationPercent: 2,
          strategy: PROFIT_CONTROL_STRATEGY.NONE
        },
        applyToNewPositions: true,
        duration: 1440 // 24小时（分钟）
      }
    },
    hitCount: 8,
    lastHitAt: '2026-03-09 12:30:00',
    totalAffectedUsers: 23,
    createdAt: '2026-03-05 10:00:00',
    updatedAt: '2026-03-09 10:00:00'
  },
  {
    id: 'rule_006',
    name: '盈利异常自动干预',
    description: '4小时内累计盈利超过2000，控制胜率降至15%',
    status: DELIVERY_RULE_STATUS.ENABLED,
    priority: DELIVERY_RULE_PRIORITY.MEDIUM,
    trigger: {
      type: DELIVERY_RULE_TRIGGER_TYPE.PROFIT_LOSS,
      period: DELIVERY_RULE_TIME_PERIOD.LAST_4H,
      threshold: 2000
    },
    action: {
      type: DELIVERY_RULE_ACTION.PROFIT_CONTROL,
      params: {
        profitControl: {
          winProbability: 0.15,
          avgWinAmount: 30,
          avgLossAmount: -20,
          winFluctuationPercent: 2,
          lossFluctuationPercent: 2,
          strategy: PROFIT_CONTROL_STRATEGY.TIME_WINDOW
        },
        applyToNewPositions: true,
        duration: 0
      }
    },
    hitCount: 156,
    lastHitAt: '2026-03-10 17:42:12',
    totalAffectedUsers: 512,
    createdAt: '2026-02-25 10:00:00',
    updatedAt: '2026-03-08 10:00:00'
  }
]

// 规则触发历史记录
const ruleHitHistory = [
  {
    id: 'hit_001',
    ruleId: 'rule_001',
    ruleName: '高频交易用户控盈',
    userId: 'U100001',
    userName: '张三',
    triggerTime: '2026-03-10 17:35:22',
    triggerValue: '22 次交易',
    action: '盈亏控制：胜率 20%，EV 预估偏向亏损',
    operator: 'system',
    result: 'success',
    affectedPositions: 3
  },
  {
    id: 'hit_002',
    ruleId: 'rule_004',
    ruleName: '连续亏损用户保护',
    userId: 'U100005',
    userName: '赵六',
    triggerTime: '2026-03-10 17:18:45',
    triggerValue: '连续 5 次亏损',
    action: '后续 2 单强制盈利 15%',
    operator: 'risk_admin',
    result: 'success',
    affectedPositions: 1
  },
  {
    id: 'hit_003',
    ruleId: 'rule_002',
    ruleName: '单日盈利过高强制亏损',
    userId: 'U100003',
    userName: '王五',
    triggerTime: '2026-03-10 17:05:33',
    triggerValue: '今日累计盈利 $5,200',
    action: '后续 3 单强制亏损 30%',
    operator: 'ops_admin',
    result: 'success',
    affectedPositions: 1
  },
  {
    id: 'hit_004',
    ruleId: 'rule_003',
    ruleName: '连续盈利自动阻断',
    userId: 'U100007',
    userName: '钱八',
    triggerTime: '2026-03-10 16:20:10',
    triggerValue: '连续 5 次盈利',
    action: '下一单强制亏损 25%',
    operator: 'system',
    result: 'success',
    affectedPositions: 2
  },
  {
    id: 'hit_005',
    ruleId: 'rule_006',
    ruleName: '盈利异常自动干预',
    userId: 'U100012',
    userName: '孙七',
    triggerTime: '2026-03-10 15:42:12',
    triggerValue: '4 小时盈利 +2,350 USDT',
    action: '盈亏控制：胜率 15%',
    operator: 'risk_manager',
    result: 'success',
    affectedPositions: 0
  }
]

// 规则统计数据
const ruleStatistics = {
  totalRules: 18,
  enabledRules: 9,
  pausedRules: 5,
  totalHits: 366,
  todayHits: 45,
  totalAffectedUsers: 1259,
  todayAffectedUsers: 67,
  avgHitRate: 61,
  performanceData: [
    { date: '03-04', hits: 52, affected: 23 },
    { date: '03-05', hits: 48, affected: 19 },
    { date: '03-06', hits: 61, affected: 28 },
    { date: '03-07', hits: 55, affected: 21 },
    { date: '03-08', hits: 58, affected: 25 },
    { date: '03-09', hits: 47, affected: 18 },
    { date: '03-10', hits: 45, affected: 22 }
  ]
}

export const createDeliveryAutoRulesMock = () => {
  const rules = clone(deliveryAutoRules)
  // 生成更多数据用于测试分页
  for (let i = 1; i <= 12; i++) {
    rules.push({
      ...rules[0],
      id: `rule_test_${i}`,
      name: `自动控盈规则 ${i}`,
      status: i % 3 === 0 ? DELIVERY_RULE_STATUS.PAUSED : (i % 2 === 0 ? DELIVERY_RULE_STATUS.ENABLED : DELIVERY_RULE_STATUS.DISABLED)
    })
  }
  return rules
}
export const createRuleHitHistoryMock = () => clone(ruleHitHistory)
export const createRuleStatisticsMock = () => clone(ruleStatistics)
