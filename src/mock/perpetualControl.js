import {
  PERP_CONTROL_CONTRACT_STATUS,
  PERP_CONTROL_OFFSET_DIRECTION,
  PERP_CONTROL_RULE_DIRECTION,
  PERP_CONTROL_RULE_TRIGGER_TYPE,
  PERP_CONTROL_TIME_WINDOW
} from '../constants/perpetualControl'
import { createDefaultPerpetualControlConfig } from './perpetual'

const clone = (value) => JSON.parse(JSON.stringify(value))

const perpetualControlContracts = [
  {
    id: 'BTCUSDT',
    symbol: 'BTCUSDT',
    alias: 'BTC/USDT 永续',
    status: PERP_CONTROL_CONTRACT_STATUS.RUNNING,
    config: createDefaultPerpetualControlConfig(),
    metrics: [
      { label: '多头持仓', value: '$2.85M', tone: 'up' },
      { label: '空头持仓', value: '$2.15M', tone: 'down' },
      { label: '净持仓', value: '+$700K', tone: 'up' },
      { label: '多空比', value: '1.33', tone: 'neutral' },
      { label: '活跃用户', value: '1245', tone: 'neutral' },
      { label: '24h交易量', value: '$45.6M', tone: 'neutral' },
      { label: '平台盈亏', value: '+$125.0K', tone: 'up' },
      { label: '用户盈亏', value: '-$125.0K', tone: 'down' }
    ],
    rules: [
      {
        id: 'r1',
        name: '多头过重自动调整',
        triggerType: PERP_CONTROL_RULE_TRIGGER_TYPE.NET_POSITION,
        thresholdValue: 500000,
        triggerDirection: PERP_CONTROL_RULE_DIRECTION.LONG_HEAVY,
        positionRatio: 65,
        priceOffset: 10,
        offsetDirection: PERP_CONTROL_OFFSET_DIRECTION.AGAINST,
        slippagePct: 0.3,
        durationSec: 7200,
        enabled: true,
        hitCount: 23,
        lastHitAt: '2026-03-07 17:30:00'
      },
      {
        id: 'r2',
        name: '用户盈利过高干预',
        triggerType: PERP_CONTROL_RULE_TRIGGER_TYPE.PNL_RATIO,
        thresholdValue: 15,
        triggerDirection: PERP_CONTROL_RULE_DIRECTION.PROFIT_HIGH,
        timeWindow: PERP_CONTROL_TIME_WINDOW.LAST_15MIN,
        priceOffset: 5,
        offsetDirection: PERP_CONTROL_OFFSET_DIRECTION.AGAINST,
        slippagePct: 0.2,
        durationSec: 3600,
        enabled: true,
        hitCount: 8,
        lastHitAt: '2026-03-07 16:15:00'
      }
    ]
  },
  {
    id: 'ETHUSDT',
    symbol: 'ETHUSDT',
    alias: 'ETH/USDT 永续',
    status: PERP_CONTROL_CONTRACT_STATUS.RUNNING,
    config: {
      priceOffset: 2,
      offsetDirection: PERP_CONTROL_OFFSET_DIRECTION.RANDOM,
      slippagePct: 0.1,
      latencyMs: 30,
      maxLeverage: 75,
      autoTriggerEnabled: false
    },
    metrics: [
      { label: '多头持仓', value: '$1.15M', tone: 'up' },
      { label: '空头持仓', value: '$1.04M', tone: 'down' },
      { label: '净持仓', value: '+$110K', tone: 'up' },
      { label: '多空比', value: '1.10', tone: 'neutral' },
      { label: '活跃用户', value: '870', tone: 'neutral' },
      { label: '24h交易量', value: '$18.2M', tone: 'neutral' },
      { label: '平台盈亏', value: '+$44.2K', tone: 'up' },
      { label: '用户盈亏', value: '-$44.2K', tone: 'down' }
    ],
    rules: [
      {
        id: 'r3',
        name: '短时成交异常保护',
        triggerType: PERP_CONTROL_RULE_TRIGGER_TYPE.VOLUME_SPIKE,
        thresholdValue: 3,
        triggerDirection: PERP_CONTROL_RULE_DIRECTION.VOLUME_UP,
        timeWindow: PERP_CONTROL_TIME_WINDOW.LAST_1MIN,
        priceOffset: 3,
        offsetDirection: PERP_CONTROL_OFFSET_DIRECTION.RANDOM,
        slippagePct: 0.15,
        durationSec: 1800,
        enabled: false,
        hitCount: 2,
        lastHitAt: '2026-03-05 11:20:00'
      }
    ]
  }
]

export const perpetualControlRuleTriggers = {
  [PERP_CONTROL_RULE_TRIGGER_TYPE.NET_POSITION]: {
    label: '净持仓触发',
    thresholdLabel: '净持仓阈值 (USDT)',
    thresholdUnit: 'USDT',
    description: '当合约当前净持仓（多头持仓 - 空头持仓）超过设定阈值且单边占比达到指定比例时触发',
    directionOptions: [
      { value: PERP_CONTROL_RULE_DIRECTION.LONG_HEAVY, label: '多头过重时' },
      { value: PERP_CONTROL_RULE_DIRECTION.SHORT_HEAVY, label: '空头过重时' }
    ]
  },
  [PERP_CONTROL_RULE_TRIGGER_TYPE.PNL_RATIO]: {
    label: '盈亏比触发',
    thresholdLabel: '盈亏比阈值 (%)',
    thresholdUnit: '%',
    description: '当指定时间区间内用户盈亏比例达到设定阈值时触发（需配置时间区间）',
    directionOptions: [
      { value: PERP_CONTROL_RULE_DIRECTION.PROFIT_HIGH, label: '盈利过高时' },
      { value: PERP_CONTROL_RULE_DIRECTION.LOSS_HIGH, label: '亏损过高时' }
    ]
  },
  [PERP_CONTROL_RULE_TRIGGER_TYPE.VOLUME_SPIKE]: {
    label: '交易量突增触发',
    thresholdLabel: '交易量倍数阈值 (x)',
    thresholdUnit: 'x',
    description: '当指定时间区间内的交易量超过平均水平的N倍时触发（需配置时间区间）',
    directionOptions: [{ value: PERP_CONTROL_RULE_DIRECTION.VOLUME_UP, label: '交易量突增时' }]
  },
  [PERP_CONTROL_RULE_TRIGGER_TYPE.VOLATILITY]: {
    label: '波动率触发',
    thresholdLabel: '波动率阈值 (%)',
    thresholdUnit: '%',
    description: '当指定时间区间内的市场价格波动率超过设定阈值时触发（需配置时间区间）',
    directionOptions: [{ value: PERP_CONTROL_RULE_DIRECTION.VOLATILITY_UP, label: '波动过高时' }]
  }
}

export const perpetualControlOffsetDirections = [
  { value: PERP_CONTROL_OFFSET_DIRECTION.AGAINST, label: '逆势 (对抗趋势)' },
  { value: PERP_CONTROL_OFFSET_DIRECTION.FOLLOW, label: '顺势 (跟随趋势)' },
  { value: PERP_CONTROL_OFFSET_DIRECTION.RANDOM, label: '随机偏移' }
]

export const perpetualControlTimeWindows = [
  { value: PERP_CONTROL_TIME_WINDOW.REALTIME, label: '实时数据' },
  { value: PERP_CONTROL_TIME_WINDOW.LAST_1MIN, label: '过去 1 分钟' },
  { value: PERP_CONTROL_TIME_WINDOW.LAST_5MIN, label: '过去 5 分钟' },
  { value: PERP_CONTROL_TIME_WINDOW.LAST_15MIN, label: '过去 15 分钟' },
  { value: PERP_CONTROL_TIME_WINDOW.LAST_30MIN, label: '过去 30 分钟' },
  { value: PERP_CONTROL_TIME_WINDOW.LAST_1HOUR, label: '过去 1 小时' },
  { value: PERP_CONTROL_TIME_WINDOW.LAST_4HOUR, label: '过去 4 小时' }
]

export const createPerpetualControlContractsMock = () => clone(perpetualControlContracts)
