/**
 * 前台金融列表：在基础 mock 上追加列表行（分页与压力展示用，字段与主数据同源结构）。
 */
import {
  LOAN_ORDER_STATUS,
  REPAYMENT_STATUS,
  REPAYMENT_TYPE,
  REPAYMENT_PAYMENT_METHOD_USER,
  RISK_LEVEL
} from '../constants/cryptoLending'
import { ORDER_STATUS as LOCKED_ORDER_STATUS } from '../constants/liquidityLocked'
import { ADJUSTMENT_TYPE, ORDER_STATUS as AIQ_ORDER_STATUS, VIP_LEVEL } from '../constants/aiQuant'

const bulkUserNames = ['陈明', '林悦', '王磊', '张楠', '刘洋']

export function buildLendingDemoExtraOrders(count = 28) {
  const currentStatuses = [LOAN_ORDER_STATUS.ACTIVE, LOAN_ORDER_STATUS.REPAYING, LOAN_ORDER_STATUS.PENDING, LOAN_ORDER_STATUS.OVERDUE]
  const histStatuses = [LOAN_ORDER_STATUS.COMPLETED, LOAN_ORDER_STATUS.CANCELLED, LOAN_ORDER_STATUS.LIQUIDATED]
  const rows = []
  for (let i = 0; i < count; i++) {
    const useCurrent = i < Math.ceil(count * 0.42)
    const st = useCurrent ? currentStatuses[i % currentStatuses.length] : histStatuses[i % histStatuses.length]
    const cur = ['USDT', 'USDC', 'USDT'][i % 3]
    const day = String((i % 26) + 1).padStart(2, '0')
    rows.push({
      orderId: `ORD-DEMO-${String(800 + i).padStart(4, '0')}`,
      userId: `USR-DEMO-${i}`,
      userName: bulkUserNames[i % bulkUserNames.length],
      email: `user${String(i).padStart(3, '0')}@example.com`,
      phone: '+86 138****0000',
      creditScore: 650 + (i % 80),
      productId: 'LND-001',
      productName: 'BTC标准借贷',
      collateralType: 'BTC',
      collateralAmount: Number((0.45 + i * 0.012).toFixed(4)),
      collateralValue: 22000 + i * 400,
      loanCurrency: cur,
      loanAmount: 8000 + i * 420,
      requestedAmount: 8000 + i * 420,
      initialLtv: 70,
      currentLtv: 66 + (i % 8),
      interestRate: 8.5,
      interestAccrued: i * 11,
      totalDebt: 8000 + i * 420 + i * 11,
      liquidationPrice: 32000,
      currentPrice: 50000,
      liquidationThreshold: 85,
      status: st,
      loanDuration: 90,
      daysElapsed: i % 35,
      daysRemaining: Math.max(0, 90 - (i % 35)),
      createTime: `2024-02-${day} 10:00:00`,
      updateTime: `2024-03-${String((i % 8) + 1).padStart(2, '0')} 12:00:00`,
      maturityDate: '2025-08-15 10:00:00',
      riskLevel: RISK_LEVEL.LOW,
      purpose: '资金周转',
      remarks: ''
    })
  }
  return rows
}

export function buildLendingDemoExtraRepayments(count = 22) {
  const orderIdx = (i) => i % 28
  const loanCur = (i) => ['USDT', 'USDC', 'USDT'][orderIdx(i) % 3]
  const types = [REPAYMENT_TYPE.PARTIAL, REPAYMENT_TYPE.PARTIAL, REPAYMENT_TYPE.FULL]
  const stats = [REPAYMENT_STATUS.COMPLETED, REPAYMENT_STATUS.COMPLETED, REPAYMENT_STATUS.PENDING, REPAYMENT_STATUS.PROCESSING]
  const out = []
  for (let i = 0; i < count; i++) {
    const d = String((i % 9) + 1).padStart(2, '0')
    const ip = Math.min(200, 15 + i * 3)
    const pp = 200 + i * 20
    const rt = types[i % types.length]
    const interestOnlyRow = i % 3 === 0 && rt === REPAYMENT_TYPE.PARTIAL
    const interestPaid = interestOnlyRow ? 320 + i * 65 : ip
    const principalPaid = interestOnlyRow ? 0 : pp
    out.push({
      repaymentId: `REP-DEMO-${String(400 + i).padStart(4, '0')}`,
      orderId: `ORD-DEMO-${String(800 + orderIdx(i)).padStart(4, '0')}`,
      userId: `USR-R-${i}`,
      userName: `用户_${i}`,
      productName: i % 2 === 0 ? 'BTC标准借贷' : 'ETH灵活借贷',
      loanCurrency: loanCur(i),
      repaymentType: rt,
      amount: interestPaid + principalPaid,
      interestPaid,
      principalPaid,
      remainingDebt: Math.max(0, 7000 - i * 180),
      status: stats[i % stats.length],
      paymentMethod: REPAYMENT_PAYMENT_METHOD_USER,
      transactionId: i % 5 === 0 ? null : `TXN-DEMO-${i}`,
      repaymentTime: i % 3 === 0 ? null : `2024-03-${d} 14:00:00`,
      createTime: `2024-03-${d} 13:50:00`
    })
  }
  return out
}

export function buildLockedDemoExtraOrders(count = 24) {
  const products = [
    { id: 'prod-1', name: 'USDT 定期理财', cur: 'USDT' },
    { id: 'prod-2', name: 'BTC 锁仓挖矿', cur: 'BTC' },
    { id: 'prod-3', name: 'ETH 流动性质押', cur: 'ETH' },
    { id: 'prod-5', name: 'USDC 定期理财', cur: 'USDC' }
  ]
  const out = []
  for (let i = 0; i < count; i++) {
    const p = products[i % products.length]
    const mod = i % 5
    const locked = mod === 0 || mod === 1 || mod === 2
    const status = locked
      ? LOCKED_ORDER_STATUS.LOCKED
      : mod === 3
        ? LOCKED_ORDER_STATUS.COMPLETED
        : LOCKED_ORDER_STATUS.EARLY_REDEEMED
    out.push({
      id: `ord-bulk-${2000 + i}`,
      userId: `user-bulk-${i}`,
      userName: `用户_${i}`,
      productId: p.id,
      productName: p.name,
      currency: p.cur,
      amount: p.cur === 'BTC' ? Number((0.02 + i * 0.001).toFixed(5)) : 1000 + i * 200,
      lockDays: [5, 10, 20, 30][i % 4],
      dailyRate: 0.32 + (i % 10) * 0.01,
      totalInterest: i * 2,
      status,
      lockedAt: `2026-03-${String((i % 28) + 1).padStart(2, '0')} 10:00:00`,
      unlockAt: `2026-04-${String((i % 20) + 1).padStart(2, '0')} 10:00:00`,
      completedAt: locked ? null : `2026-04-${String((i % 15) + 1).padStart(2, '0')} 11:00:00`,
      daysRemaining: locked ? (i % 7) + 1 : 0
    })
  }
  return out
}

export function buildAiQuantDemoExtraOrders(count = 18) {
  const currencies = ['USDT', 'ETH', 'BTC', 'SOL', 'DOGE', 'XRP', 'TRX', 'BNB']
  const products = [
    { id: 'aiq-prod-003', name: 'USDT 高频量化套利' },
    { id: 'aiq-prod-002', name: 'ETH 稳健量化策略' },
    { id: 'aiq-prod-001', name: 'BTC 智能量化基金 A' },
    { id: 'aiq-prod-005', name: 'SOL 均衡增长基金' },
    { id: 'aiq-prod-006', name: 'DOGE 社区量化计划' },
    { id: 'aiq-prod-007', name: 'XRP 跨境套利策略' },
    { id: 'aiq-prod-008', name: 'TRX 能量质押量化' },
    { id: 'aiq-prod-004', name: 'BNB 智能网格策略' }
  ]
  const stCycle = [
    AIQ_ORDER_STATUS.RUNNING,
    AIQ_ORDER_STATUS.COMPLETED,
    AIQ_ORDER_STATUS.EARLY_REDEEMED,
    AIQ_ORDER_STATUS.RUNNING
  ]
  const out = []
  for (let i = 0; i < count; i++) {
    const ccy = currencies[i % currencies.length]
    const pr = products[i % products.length]
    const st = stCycle[i % stCycle.length]
    const isRun = st === AIQ_ORDER_STATUS.RUNNING
    out.push({
      id: `aiq-ord-bulk-${500 + i}`,
      userId: `user-bulk-${i}`,
      userName: `托管用户_${i}`,
      userEmail: `custody${i}@example.com`,
      vipLevel: VIP_LEVEL.VIP1 + (i % 3),
      productId: pr.id,
      productName: pr.name,
      currency: ccy,
      principal: ccy === 'BTC' ? 0.05 + i * 0.01 : 2000 + i * 300,
      dailyRate: 0.16 + (i % 5) * 0.02,
      expectedDailyYield: ccy === 'BTC' ? 0.0001 * (i + 1) : 3 + i,
      accumulatedYield: i * 1.2,
      totalReturn: ccy === 'BTC' ? 0.05 + i * 0.01 + i * 0.001 : 2000 + i * 300 + i * 2,
      startDate: '2026-03-15',
      endDate: '2026-04-20',
      daysElapsed: i % 20,
      totalDays: 30,
      status: st,
      settledAt: isRun ? null : '2026-03-28 09:00:00'
    })
  }
  return out
}

export function buildAiQuantDemoExtraAdjustments(count = 20) {
  const types = [ADJUSTMENT_TYPE.BONUS, ADJUSTMENT_TYPE.PENALTY, ADJUSTMENT_TYPE.CORRECTION, ADJUSTMENT_TYPE.INCREASE]
  const currencies = ['USDT', 'ETH', 'BTC', 'SOL', 'DOGE', 'XRP', 'TRX', 'BNB']
  const out = []
  for (let i = 0; i < count; i++) {
    const ccy = currencies[i % currencies.length]
    out.push({
      id: `adj-bulk-${800 + i}`,
      type: types[i % types.length],
      targetType: 'user',
      targetId: `user-bulk-${i}`,
      targetName: `用户_${i}`,
      orderId: i % 2 === 0 ? `aiq-ord-bulk-${500 + (i % 18)}` : null,
      productName: '收益调整',
      currency: ccy,
      amount: ccy === 'BTC' ? 0.001 * (i + 1) : 50 + i * 10,
      reason: '收益复核调整',
      operator: 'ops-system',
      operatorName: '系统运营',
      createdAt: `2026-03-${String((i % 28) + 1).padStart(2, '0')} 08:${String(i % 60).padStart(2, '0')}:00`
    })
  }
  return out
}
