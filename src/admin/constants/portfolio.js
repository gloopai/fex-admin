// 投资组合产品常量与计算规则

export const PRODUCT_STATUS = {
  ENABLED: 'enabled',
  DISABLED: 'disabled'
}

export const productStatusMeta = {
  [PRODUCT_STATUS.ENABLED]: { label: '已启用', color: 'text-green-600 bg-green-50' },
  [PRODUCT_STATUS.DISABLED]: { label: '已禁用', color: 'text-gray-600 bg-gray-50' }
}

export const ORDER_STATUS = {
  RUNNING: 'running',
  COMPLETED: 'completed',
  SETTLED: 'settled',
  EARLY_REDEEMED: 'early_redeemed',
  CANCELLED: 'cancelled'
}

export const orderStatusMeta = {
  [ORDER_STATUS.RUNNING]: { label: '运行中', class: 'bg-blue-100 text-blue-700' },
  [ORDER_STATUS.COMPLETED]: { label: '已到期', class: 'bg-emerald-100 text-emerald-700' },
  [ORDER_STATUS.SETTLED]: { label: '已结算', class: 'bg-slate-100 text-slate-600' },
  [ORDER_STATUS.EARLY_REDEEMED]: { label: '提前赎回', class: 'bg-purple-100 text-purple-700' },
  [ORDER_STATUS.CANCELLED]: { label: '已取消', class: 'bg-rose-100 text-rose-700' }
}

export const EARLY_REDEEM_MODE = {
  FORFEIT_YIELD: 'forfeit_yield',
  FEE_ONLY: 'fee_only',
  ACCRUED_DAYS: 'accrued_days'
}

export const earlyRedeemModeMeta = {
  [EARLY_REDEEM_MODE.FORFEIT_YIELD]: {
    label: '扣除全部收益',
    desc: '提前赎回只返还本金，并扣除提前赎回手续费'
  },
  [EARLY_REDEEM_MODE.FEE_ONLY]: {
    label: '保留收益扣手续费',
    desc: '保留已产生收益，额外扣除提前赎回手续费'
  },
  [EARLY_REDEEM_MODE.ACCRUED_DAYS]: {
    label: '按持有天数计息',
    desc: '按实际持有天数计算收益，再扣除提前赎回手续费'
  }
}

export const REDEEM_ARRIVAL_MODE = {
  IMMEDIATE: 'immediate',
  T_PLUS_1: 't_plus_1'
}

export const redeemArrivalModeMeta = {
  [REDEEM_ARRIVAL_MODE.IMMEDIATE]: { label: '立即到账' },
  [REDEEM_ARRIVAL_MODE.T_PLUS_1]: { label: 'T+1 到账' }
}

export const COMMON_FILTER_ALL = 'all'

export function roundMoney(value, decimals = 2) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  const factor = 10 ** decimals
  return Math.round((n + Number.EPSILON) * factor) / factor
}

export function calculatePortfolioEstimate(principal, product) {
  const amount = Math.max(0, Number(principal) || 0)
  const durationDays = Math.max(0, Number(product?.durationDays) || 0)
  const minDailyRatePct = Number(product?.minDailyRatePct) || 0
  const maxDailyRatePct = Number(product?.maxDailyRatePct) || 0
  const subscriptionFeePct = Number(product?.subscriptionFeePct) || 0
  const minYield = roundMoney(amount * (minDailyRatePct / 100) * durationDays)
  const maxYield = roundMoney(amount * (maxDailyRatePct / 100) * durationDays)
  const fee = roundMoney(amount * (subscriptionFeePct / 100))

  return {
    principal: roundMoney(amount),
    minYield,
    maxYield,
    fee,
    minSettlement: roundMoney(amount + minYield - fee),
    maxSettlement: roundMoney(amount + maxYield - fee)
  }
}

export function canSubscribePortfolio(product, principal, options = {}) {
  if (!product || product.status !== PRODUCT_STATUS.ENABLED) return { ok: false, reason: '产品当前不可认购' }

  const amount = Number(principal)
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, reason: '请输入有效申购金额' }
  if (amount < Number(product.minAmount || 0)) return { ok: false, reason: '金额低于最低申购金额' }
  if (amount > Number(product.maxAmount || 0)) return { ok: false, reason: '金额高于最高申购金额' }
  if (options.availableBalance != null && amount > Number(options.availableBalance || 0)) {
    return { ok: false, reason: '可用余额不足' }
  }

  return { ok: true, reason: '' }
}

export function formatPortfolioRateRange(product) {
  if (!product) return '—'
  return `${Number(product.minDailyRatePct || 0).toFixed(2)}% - ${Number(product.maxDailyRatePct || 0).toFixed(2)}%/天`
}

export function formatPortfolioDuration(durationDays) {
  const n = Number(durationDays)
  if (!Number.isFinite(n) || n <= 0) return '—'
  return `${n} 天`
}

export function formatPortfolioAmount(value, currency = 'USDT') {
  const n = Number(value)
  if (!Number.isFinite(n)) return `0 ${currency}`
  return `${n.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency}`
}
