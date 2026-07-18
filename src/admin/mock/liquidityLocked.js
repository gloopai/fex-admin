import { ADJUSTMENT_STATUS, ADJUSTMENT_TYPE, ORDER_STATUS, PRODUCT_STATUS, PURCHASE_LIMIT_TYPE } from '../constants/liquidityLocked'

const clone = (v) => JSON.parse(JSON.stringify(v))

/** 时间锚：假定「当前」为 2026-04-10，与到期日、剩余天数等演示数据一致 */

// 锁仓产品
const products = [
  {
    id: 'prod-1',
    sortOrder: 50,
    name: 'USDT 定期理财',
    currency: 'USDT',
    icon: '₮',
    periods: [
      { days: 2, annualRate: 109.5, minAmount: 50, maxAmount: 3000 },
      { days: 5, annualRate: 123.662, minAmount: 100, maxAmount: 5000 },
      { days: 10, annualRate: 141.912, minAmount: 200, maxAmount: 8000 },
      { days: 20, annualRate: 164.25, minAmount: 500, maxAmount: 12000 }
    ],
    earlyRedeemEnabled: true,
    earlyRedeemFee: 4,
    minVipLevel: 0,
    minKycLevel: 'none',
    purchaseLimitType: PURCHASE_LIMIT_TYPE.LIFETIME,
    lifetimeLimit: 50000,
    periodLimit: 10000,
    periodDays: 30,
    totalLocked: 2850000,
    totalOrders: 1247,
    lendableRatio: 70,
    status: PRODUCT_STATUS.ENABLED,
    createdAt: '2026-01-15'
  },
  {
    id: 'prod-2',
    sortOrder: 40,
    name: 'BTC 锁仓挖矿',
    currency: 'BTC',
    icon: '₿',
    periods: [
      { days: 10, annualRate: 91.25, minAmount: 0.001, maxAmount: 0.5 },
      { days: 30, annualRate: 127.75, minAmount: 0.005, maxAmount: 1 },
      { days: 90, annualRate: 182.5, minAmount: 0.01, maxAmount: 2 }
    ],
    earlyRedeemEnabled: true,
    earlyRedeemFee: 4,
    minVipLevel: 2,
    minKycLevel: 'basic',
    purchaseLimitType: PURCHASE_LIMIT_TYPE.PERIOD,
    lifetimeLimit: 5,
    periodLimit: 2,
    periodDays: 30,
    totalLocked: 125.5,
    totalOrders: 423,
    lendableRatio: 65,
    status: PRODUCT_STATUS.ENABLED,
    createdAt: '2026-02-01'
  },
  {
    id: 'prod-3',
    sortOrder: 30,
    name: 'ETH 流动性质押',
    currency: 'ETH',
    icon: 'Ξ',
    periods: [
      { days: 5, annualRate: 102.2, minAmount: 0.05, maxAmount: 10 },
      { days: 20, annualRate: 146, minAmount: 0.1, maxAmount: 20 }
    ],
    earlyRedeemEnabled: false,
    earlyRedeemFee: 0,
    minVipLevel: 3,
    minKycLevel: 'advanced',
    purchaseLimitType: PURCHASE_LIMIT_TYPE.NONE,
    lifetimeLimit: 0,
    periodLimit: 0,
    periodDays: 0,
    totalLocked: 3420.8,
    totalOrders: 856,
    lendableRatio: 60,
    status: PRODUCT_STATUS.SOLD_OUT,
    createdAt: '2026-02-20'
  },
  {
    id: 'prod-4',
    sortOrder: 20,
    name: 'USDC 体验档（已下架）',
    currency: 'USDC',
    icon: '$',
    periods: [{ days: 2, annualRate: 72, minAmount: 10, maxAmount: 500 }],
    earlyRedeemEnabled: true,
    earlyRedeemFee: 4,
    minVipLevel: 0,
    minKycLevel: 'none',
    purchaseLimitType: PURCHASE_LIMIT_TYPE.NONE,
    lifetimeLimit: 0,
    periodLimit: 0,
    periodDays: 0,
    totalLocked: 0,
    totalOrders: 0,
    totalYield: 0,
    lendableRatio: 0,
    status: PRODUCT_STATUS.DISABLED,
    createdAt: '2025-11-01'
  },
  /** 与信用借贷 LND-003（借 USDC）一致：上架 USDC 锁仓池，便于 borrowableLiquidityFromLocked 有值 */
  {
    id: 'prod-5',
    sortOrder: 10,
    name: 'USDC 定期理财',
    currency: 'USDC',
    icon: '$',
    periods: [{ days: 7, annualRate: 88, minAmount: 100, maxAmount: 50000 }],
    earlyRedeemEnabled: true,
    earlyRedeemFee: 4,
    minVipLevel: 0,
    minKycLevel: 'none',
    purchaseLimitType: PURCHASE_LIMIT_TYPE.NONE,
    lifetimeLimit: 0,
    periodLimit: 0,
    periodDays: 0,
    totalLocked: 2000000,
    totalOrders: 88,
    lendableRatio: 70,
    status: PRODUCT_STATUS.ENABLED,
    createdAt: '2026-03-01'
  }
]

// 锁仓订单。收益字段由 createLockedOrdersMock 统一补齐，避免手工调整直接覆盖基础收益。
const orders = [
  {
    id: 'ord-1001',
    userId: 'user-8821',
    userName: 'alice@example.com',
    productId: 'prod-1',
    productName: 'USDT 定期理财',
    currency: 'USDT',
    amount: 5000,
    lockDays: 10,
    dailyRate: 0.3888,
    totalInterest: 244.4,
    status: ORDER_STATUS.LOCKED,
    lockedAt: '2026-03-01 14:22:10',
    unlockAt: '2026-03-11 14:22:10',
    completedAt: null,
    daysRemaining: 0
  },
  {
    id: 'ord-1002',
    userId: 'user-6623',
    userName: 'bob_trader',
    productId: 'prod-2',
    productName: 'BTC 锁仓挖矿',
    currency: 'BTC',
    amount: 0.5,
    lockDays: 30,
    dailyRate: 0.35,
    totalInterest: 0.00525,
    status: ORDER_STATUS.LOCKED,
    lockedAt: '2026-03-12 09:15:33',
    unlockAt: '2026-04-11 09:15:33',
    completedAt: null,
    daysRemaining: 1
  },
  {
    id: 'ord-1003',
    userId: 'user-9234',
    userName: 'charlie_vip',
    productId: 'prod-1',
    productName: 'USDT 定期理财',
    currency: 'USDT',
    amount: 10000,
    lockDays: 5,
    dailyRate: 0.3388,
    totalInterest: 169.4,
    status: ORDER_STATUS.COMPLETED,
    lockedAt: '2026-02-28 16:45:22',
    unlockAt: '2026-03-05 16:45:22',
    completedAt: '2026-03-05 16:46:01',
    daysRemaining: 0
  },
  {
    id: 'ord-1004',
    userId: 'user-5512',
    userName: 'diana_user',
    productId: 'prod-1',
    productName: 'USDT 定期理财',
    currency: 'USDT',
    amount: 2880,
    lockDays: 20,
    dailyRate: 0.45,
    totalInterest: 0,
    earlyRedeemFeeApplied: 120,
    status: ORDER_STATUS.EARLY_REDEEMED,
    lockedAt: '2026-02-15 11:20:45',
    unlockAt: '2026-03-06 11:20:45',
    completedAt: '2026-02-25 09:12:33',
    daysRemaining: 0
  },
  {
    id: 'ord-1005',
    userId: 'user-7821',
    userName: 'evan_whale',
    productId: 'prod-3',
    productName: 'ETH 流动性质押',
    currency: 'ETH',
    amount: 15,
    lockDays: 20,
    dailyRate: 0.4,
    totalInterest: 1.2,
    status: ORDER_STATUS.LOCKED,
    lockedAt: '2026-03-23 08:30:12',
    unlockAt: '2026-04-12 08:30:12',
    completedAt: null,
    daysRemaining: 2
  },
  /** 与 alerts.alert-302 对齐；未到期 + 可提前赎回，便于与 ord-1001（到期领取）对照 */
  {
    id: 'ord-1006',
    userId: 'user-4421',
    userName: 'frank_investor',
    productId: 'prod-1',
    productName: 'USDT 定期理财',
    currency: 'USDT',
    amount: 8000,
    lockDays: 5,
    dailyRate: 0.3388,
    totalInterest: 320,
    status: ORDER_STATUS.LOCKED,
    lockedAt: '2026-04-08 10:15:30',
    unlockAt: '2026-04-13 10:15:30',
    completedAt: null,
    daysRemaining: 3
  }
]

// 手工调整记录
const adjustments = [
  {
    id: 'adj-501',
    orderId: 'ord-1001',
    userId: 'user-8821',
    userName: 'alice@example.com',
    type: ADJUSTMENT_TYPE.ADD_INTEREST,
    amount: 50,
    currency: 'USDT',
    reason: '补偿系统故障期间利息损失',
    status: ADJUSTMENT_STATUS.EXECUTED,
    requestedBy: 'admin@platform.com',
    requestedAt: '2026-03-05 10:30:00',
    executedAt: '2026-03-05 11:15:22'
  },
  {
    id: 'adj-502',
    orderId: 'ord-1004',
    userId: 'user-5512',
    userName: 'diana_user',
    type: ADJUSTMENT_TYPE.EARLY_REDEEM,
    amount: 2880,
    currency: 'USDT',
    reason: '用户申请紧急赎回，扣除4%违约金',
    status: ADJUSTMENT_STATUS.EXECUTED,
    requestedBy: 'support@platform.com',
    requestedAt: '2026-02-25 08:45:12',
    executedAt: '2026-02-25 09:12:33'
  },
  {
    id: 'adj-503',
    orderId: 'ord-1002',
    userId: 'user-6623',
    userName: 'bob_trader',
    type: ADJUSTMENT_TYPE.EXTEND,
    amount: 0,
    currency: 'BTC',
    reason: '用户申请展期30天，维持原收益率',
    status: ADJUSTMENT_STATUS.APPROVED,
    requestedBy: 'support@platform.com',
    requestedAt: '2026-03-07 14:20:18',
    executedAt: null
  },
  {
    id: 'adj-504',
    orderId: 'ord-1005',
    userId: 'user-7821',
    userName: 'evan_whale',
    type: ADJUSTMENT_TYPE.DEDUCT_INTEREST,
    amount: 0.2,
    currency: 'ETH',
    reason: '风控扣除：检测到异常交易行为',
    status: ADJUSTMENT_STATUS.PENDING,
    requestedBy: 'risk@platform.com',
    requestedAt: '2026-03-08 09:00:00',
    executedAt: null
  }
]

function roundByCurrency(value, currency) {
  const n = Number(value) || 0
  const decimals = currency === 'BTC' || currency === 'ETH' ? 8 : 4
  return Number(n.toFixed(decimals))
}

function baseInterestForOrder(order) {
  const amount = Number(order.amount) || 0
  const dailyRate = Number(order.dailyRate) || 0
  const days = Number(order.lockDays) || 0
  return roundByCurrency(amount * (dailyRate / 100) * days, order.currency)
}

function executedInterestAdjustmentForOrder(orderId) {
  return adjustments.reduce((sum, adj) => {
    if (adj.orderId !== orderId || adj.status !== ADJUSTMENT_STATUS.EXECUTED) return sum
    if (adj.type === ADJUSTMENT_TYPE.ADD_INTEREST) return sum + Number(adj.amount || 0)
    if (adj.type === ADJUSTMENT_TYPE.DEDUCT_INTEREST) return sum - Number(adj.amount || 0)
    return sum
  }, 0)
}

function enrichOrderYield(order) {
  const baseInterest = baseInterestForOrder(order)
  const executedInterestAdjustment = roundByCurrency(
    executedInterestAdjustmentForOrder(order.id),
    order.currency
  )
  const payableInterest =
    order.status === ORDER_STATUS.EARLY_REDEEMED
      ? 0
      : roundByCurrency(Math.max(0, baseInterest + executedInterestAdjustment), order.currency)
  return {
    ...order,
    baseInterest,
    executedInterestAdjustment,
    payableInterest,
    totalInterest: payableInterest
  }
}

// 规则配置
const rules = {
  positioning: {
    title: '产品定位',
    description: '本产品为定期锁仓理财型流动性挖矿，与 AMM 对赌模型不同，更接近固定收益类理财产品。用户存入资产后按固定周期锁定，到期返还本金 + 利息。',
    note: '所谓"流动性"本质是用户向平台提供现金流流动性。平台拿到资产后，可作为合约交易或现货交易的底层保证金，或用于其他套利操作。',
    capitalUsage: [
      '作为永续/交割合约底层保证金池',
      '用于现货做市与库存平衡',
      '用于低风险跨市场套利策略'
    ]
  },
  earlyRedeem: {
    enabled: true,
    feePct: 4,
    minHoldDays: 1,
    note: '未到期赎回，按本金扣除违约金后返还；利息不发放。'
  },
  purchaseLimit: {
    lifetimeEnabled: true,
    lifetimeAmount: 50000,
    cycleEnabled: true,
    cycleDays: 30,
    cycleAmount: 10000,
    userRiskCapEnabled: true,
    riskCaps: [
      { level: '新用户', maxAmount: 3000 },
      { level: '普通用户', maxAmount: 15000 },
      { level: 'VIP', maxAmount: 50000 }
    ]
  },
  riskAlert: {
    payoutWarningEnabled: true,
    payoutWarningAmount: 200000,
    liquidityWarningEnabled: true,
    liquidityWarningRatio: 70,
    maturityWarningEnabled: true,
    maturityWindowHours: 24
  }
}

export const createLockedProductsMock = () => clone(products)
export const createLockedOrdersMock = () => clone(orders.map(enrichOrderYield))
export const createLockedAdjustmentsMock = () => clone(adjustments)
export const createLockedRulesMock = () => clone(rules)
