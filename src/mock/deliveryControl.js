import {
  DELIVERY_RULE_TRIGGER_TYPE,
  DELIVERY_RULE_ACTION,
  DELIVERY_RULE_STATUS,
  DELIVERY_RULE_PRIORITY,
  DELIVERY_RULE_TIME_PERIOD,
  USER_RISK_LEVEL,
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
      threshold: 20,
      conditions: {
        totalProfit: { operator: '>', value: 1000 }
      }
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
          strategy: PROFIT_CONTROL_STRATEGY.SETTLEMENT_PRICE,
          enableRiskLimits: true,
          maxProfit: 5000,
          maxLossRatio: 0.4
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
    name: '单日盈利过高自动干预',
    description: '用户单日盈利超过5000 USDT时，禁止新开仓并调整现有持仓盈亏目标',
    status: DELIVERY_RULE_STATUS.ENABLED,
    priority: DELIVERY_RULE_PRIORITY.HIGH,
    trigger: {
      type: DELIVERY_RULE_TRIGGER_TYPE.DAILY_PROFIT,
      period: DELIVERY_RULE_TIME_PERIOD.TODAY,
      threshold: 5000
    },
    action: {
      type: DELIVERY_RULE_ACTION.REJECT_ORDER,
      params: {
        lockNewPosition: true,
        existingWinRate: 0.3,
        notifyUser: false
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
    name: '大额持仓自动控制',
    description: '单笔持仓价值超过10000 USDT时，自动采用不利结算价',
    status: DELIVERY_RULE_STATUS.ENABLED,
    priority: DELIVERY_RULE_PRIORITY.MEDIUM,
    trigger: {
      type: DELIVERY_RULE_TRIGGER_TYPE.POSITION_VALUE,
      threshold: 10000
    },
    action: {
      type: DELIVERY_RULE_ACTION.PRICE_ADJUST,
      params: {
        settlePriceMode: 'unfavorable',
        offsetPercent: 0.5
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
    name: '连胜自动阻断',
    description: '用户30分钟内连续5次盈利后，下一单自动强制亏损',
    status: DELIVERY_RULE_STATUS.ENABLED,
    priority: DELIVERY_RULE_PRIORITY.HIGH,
    trigger: {
      type: DELIVERY_RULE_TRIGGER_TYPE.CONSECUTIVE_WINS,
      period: DELIVERY_RULE_TIME_PERIOD.LAST_1H,
      threshold: 5
    },
    action: {
      type: DELIVERY_RULE_ACTION.FORCE_LOSS,
      params: {
        nextPositionCount: 1,
        lossPercent: 0.3,
        lossFluctuationPercent: 2
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
    name: '高净入金用户保护',
    description: '净入金超过50000 USDT的用户，提升胜率到65%',
    status: DELIVERY_RULE_STATUS.PAUSED,
    priority: DELIVERY_RULE_PRIORITY.LOW,
    trigger: {
      type: DELIVERY_RULE_TRIGGER_TYPE.NET_DEPOSIT,
      threshold: 50000
    },
    action: {
      type: DELIVERY_RULE_ACTION.PROFIT_CONTROL,
      params: {
        profitControl: {
          winProbability: 0.65,
          avgWinAmount: 20,
          avgLossAmount: -10,
          winFluctuationPercent: 2,
          lossFluctuationPercent: 2,
          strategy: PROFIT_CONTROL_STRATEGY.SETTLEMENT_PRICE,
          enableRiskLimits: false,
          maxProfit: 10000,
          maxLossRatio: 0.3
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
          strategy: PROFIT_CONTROL_STRATEGY.SETTLEMENT_PRICE,
          enableRiskLimits: true,
          maxProfit: 3000,
          maxLossRatio: 0.5
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
    triggerValue: '22次交易，盈利 +1200 USDT',
    action: '调整盈亏目标至 -50 USDT/单',
    result: 'success',
    affectedPositions: 3
  },
  {
    id: 'hit_002',
    ruleId: 'rule_004',
    ruleName: '连胜自动阻断',
    userId: 'U100005',
    userName: '赵六',
    triggerTime: '2026-03-10 17:18:45',
    triggerValue: '连续5次盈利',
    action: '下一单强制亏损',
    result: 'success',
    affectedPositions: 1
  },
  {
    id: 'hit_003',
    ruleId: 'rule_003',
    ruleName: '大额持仓自动控制',
    userId: 'U100003',
    userName: '王五',
    triggerTime: '2026-03-10 17:05:33',
    triggerValue: '持仓价值 $12,500',
    action: '采用不利结算价 0.5%',
    result: 'success',
    affectedPositions: 1
  },
  {
    id: 'hit_004',
    ruleId: 'rule_002',
    ruleName: '单日盈利过高自动干预',
    userId: 'U100007',
    userName: '钱八',
    triggerTime: '2026-03-10 16:20:10',
    triggerValue: '今日盈利 $5,200',
    action: '锁定新开仓，现有持仓盈亏目标 -100 USDT',
    result: 'success',
    affectedPositions: 2
  },
  {
    id: 'hit_005',
    ruleId: 'rule_006',
    ruleName: '盈亏异常监控',
    userId: 'U100012',
    userName: '孙七',
    triggerTime: '2026-03-10 15:42:12',
    triggerValue: '4小时盈利 +850 USDT',
    action: '仅预警',
    result: 'success',
    affectedPositions: 0
  }
]

// 规则统计数据
const ruleStatistics = {
  totalRules: 6,
  enabledRules: 5,
  pausedRules: 1,
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
