import { DELIVERY_CONTROL_STATUS, DELIVERY_LOG_STATUS, DELIVERY_STATUS } from '../constants/delivery'

const clone = (value) => JSON.parse(JSON.stringify(value))

const deliveryTemplates = [
  {
    id: 'tpl-standard',
    name: '标准周期',
    status: DELIVERY_STATUS.ENABLED,
    cycles: [
      { id: 'c1', durationSec: 30, payoutPct: 7 },
      { id: 'c2', durationSec: 60, payoutPct: 14 },
      { id: 'c3', durationSec: 120, payoutPct: 28 }
    ]
  },
  {
    id: 'tpl-fast',
    name: '快速周期',
    status: DELIVERY_STATUS.ENABLED,
    cycles: [
      { id: 'c1', durationSec: 60, payoutPct: 10 },
      { id: 'c2', durationSec: 180, payoutPct: 30 },
      { id: 'c3', durationSec: 300, payoutPct: 50 }
    ]
  },
  {
    id: 'tpl-long',
    name: '长线周期',
    status: DELIVERY_STATUS.DISABLED,
    cycles: [
      { id: 'c1', durationSec: 600, payoutPct: 80 },
      { id: 'c2', durationSec: 900, payoutPct: 120 },
      { id: 'c3', durationSec: 1800, payoutPct: 220 }
    ]
  }
]

const deliveryProducts = [
  {
    id: 'btc-opt',
    name: 'BTC期权',
    code: 'BTC_OPT',
    pair: 'BTC/USDT',
    status: DELIVERY_STATUS.ENABLED,
    templateId: 'tpl-standard',
    templateName: '标准周期',
    buyRange: '10 - 10,000 USDT',
    maxPosition: '50,000 USDT',
    minBuy: '10',
    maxBuy: '10000',
    maxHold: '50000',
    buyFee: '0.1',
    sellFee: '0.2'
  },
  {
    id: 'eth-opt',
    name: 'ETH期权',
    code: 'ETH_OPT',
    pair: 'ETH/USDT',
    status: DELIVERY_STATUS.ENABLED,
    templateId: 'tpl-fast',
    templateName: '快速周期',
    buyRange: '5 - 5,000 USDT',
    maxPosition: '30,000 USDT',
    minBuy: '5',
    maxBuy: '5000',
    maxHold: '30000',
    buyFee: '0.1',
    sellFee: '0.2'
  }
]

const deliveryControlUsers = [
  {
    id: 'U100001',
    name: '张三',
    phone: '138****1234',
    tags: ['控盈', '高风险', '大户', '高频'],
    lockStatus: DELIVERY_CONTROL_STATUS.CONTROLLED,
    balance: 125000,
    netDeposit: 150000,
    positionsCount: 3,
    positionsValue: 45000,
    unrealizedPnl: 2350,
    tradeCount: 156,
    winRate: '39.7%',
    totalPnl: 28500,
    ruleText: '场控模式: 自动  盈亏目标: -50 USDT/单  盈利上限: $50,000',
    positions: [
      {
        id: 'p1',
        symbol: 'BTC/USDT 交割',
        side: 'long',
        leverage: '20x',
        controlled: true,
        liquidated: true,
        entryPrice: 67500,
        currentPrice: 67850,
        qty: 0.5,
        margin: 1687.5,
        pnl: 175,
        cycleSec: 60,
        remainSec: 35
      },
      {
        id: 'p2',
        symbol: 'ETH/USDT 交割',
        side: 'short',
        leverage: '10x',
        controlled: true,
        liquidated: false,
        entryPrice: 3520,
        currentPrice: 3505,
        qty: 2,
        margin: 704,
        pnl: 30,
        cycleSec: 300,
        remainSec: 180
      }
    ]
  },
  {
    id: 'U100002',
    name: '李四',
    phone: '139****5678',
    tags: ['控亏', '中风险', '新用户'],
    lockStatus: DELIVERY_CONTROL_STATUS.CONTROLLED,
    balance: 85000,
    netDeposit: 90000,
    positionsCount: 1,
    positionsValue: 20000,
    unrealizedPnl: -1200,
    tradeCount: 89,
    winRate: '50.6%',
    totalPnl: -15000,
    ruleText: '场控模式: 手动  亏损下限: $-30,000',
    positions: []
  },
  {
    id: 'U100003',
    name: '王五',
    phone: '137****9012',
    tags: ['已锁定', 'VIP', '大户'],
    lockStatus: DELIVERY_CONTROL_STATUS.LOCKED,
    balance: 230000,
    netDeposit: 200000,
    positionsCount: 6,
    positionsValue: 98000,
    unrealizedPnl: -4200,
    tradeCount: 310,
    winRate: '34.1%',
    totalPnl: -125000,
    ruleText: '锁定中: 禁止开仓，允许平仓',
    positions: []
  }
]

const deliveryOperationLogs = [
  {
    id: 'd1',
    time: '03/08 10:21:11',
    operator: 'admin01',
    action: '编辑交割合约',
    target: 'BTC_OPT',
    detail: '买入费率 0.08% -> 0.10%',
    status: DELIVERY_LOG_STATUS.SUCCESS
  },
  {
    id: 'd2',
    time: '03/08 10:35:02',
    operator: 'admin02',
    action: '编辑周期模板',
    target: '快速周期',
    detail: '新增周期 300s / 50%',
    status: DELIVERY_LOG_STATUS.SUCCESS
  },
  {
    id: 'd3',
    time: '03/08 11:03:44',
    operator: 'risk01',
    action: '持仓场控',
    target: 'U100001 / BTC',
    detail: '强制亏损目标价 67200',
    status: DELIVERY_LOG_STATUS.SUCCESS
  },
  {
    id: 'd4',
    time: '03/08 11:10:19',
    operator: 'risk01',
    action: '持仓场控',
    target: 'U100003 / ETH',
    detail: '冻结持仓',
    status: DELIVERY_LOG_STATUS.FAILED
  }
]

export const createDeliveryTemplatesMock = () => clone(deliveryTemplates)
export const createDeliveryProductsMock = () => clone(deliveryProducts)
export const createDeliveryControlUsersMock = () => clone(deliveryControlUsers)
export const createDeliveryOperationLogsMock = () => clone(deliveryOperationLogs)
