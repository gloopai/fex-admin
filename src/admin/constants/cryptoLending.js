// 平台信用借贷（场内对手盘、无链上抵押）常量配置

// 产品状态
export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
}

export const PRODUCT_STATUS_LABELS = {
  [PRODUCT_STATUS.ACTIVE]: '活跃',
  [PRODUCT_STATUS.INACTIVE]: '停用',
  [PRODUCT_STATUS.SUSPENDED]: '暂停'
}

export const PRODUCT_STATUS_COLORS = {
  [PRODUCT_STATUS.ACTIVE]: 'green',
  [PRODUCT_STATUS.INACTIVE]: 'gray',
  [PRODUCT_STATUS.SUSPENDED]: 'orange'
}

// 借贷订单状态
export const LOAN_ORDER_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  REPAYING: 'repaying',
  OVERDUE: 'overdue',
  COMPLETED: 'completed',
  LIQUIDATED: 'liquidated',
  CANCELLED: 'cancelled'
}

export const LOAN_ORDER_STATUS_LABELS = {
  [LOAN_ORDER_STATUS.PENDING]: '待审核',
  [LOAN_ORDER_STATUS.ACTIVE]: '借贷中',
  [LOAN_ORDER_STATUS.REPAYING]: '还款中',
  [LOAN_ORDER_STATUS.OVERDUE]: '逾期',
  [LOAN_ORDER_STATUS.COMPLETED]: '已完成',
  [LOAN_ORDER_STATUS.LIQUIDATED]: '违约结清',
  [LOAN_ORDER_STATUS.CANCELLED]: '已取消'
}

export const LOAN_ORDER_STATUS_COLORS = {
  [LOAN_ORDER_STATUS.PENDING]: 'blue',
  [LOAN_ORDER_STATUS.ACTIVE]: 'green',
  [LOAN_ORDER_STATUS.REPAYING]: 'cyan',
  [LOAN_ORDER_STATUS.OVERDUE]: 'orange',
  [LOAN_ORDER_STATUS.COMPLETED]: 'gray',
  [LOAN_ORDER_STATUS.LIQUIDATED]: 'red',
  [LOAN_ORDER_STATUS.CANCELLED]: 'gray'
}

// 还款状态
export const REPAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  OVERDUE: 'overdue'
}

export const REPAYMENT_STATUS_LABELS = {
  [REPAYMENT_STATUS.PENDING]: '待还款',
  [REPAYMENT_STATUS.PROCESSING]: '处理中',
  [REPAYMENT_STATUS.COMPLETED]: '已完成',
  [REPAYMENT_STATUS.FAILED]: '失败',
  [REPAYMENT_STATUS.OVERDUE]: '逾期'
}

export const REPAYMENT_STATUS_COLORS = {
  [REPAYMENT_STATUS.PENDING]: 'blue',
  [REPAYMENT_STATUS.PROCESSING]: 'cyan',
  [REPAYMENT_STATUS.COMPLETED]: 'green',
  [REPAYMENT_STATUS.FAILED]: 'red',
  [REPAYMENT_STATUS.OVERDUE]: 'orange'
}

// 还款类型
export const REPAYMENT_TYPE = {
  PARTIAL: 'partial',
  FULL: 'full',
  AUTO: 'auto'
}

export const REPAYMENT_TYPE_LABELS = {
  [REPAYMENT_TYPE.PARTIAL]: '部分还款',
  [REPAYMENT_TYPE.FULL]: '全额还款',
  [REPAYMENT_TYPE.AUTO]: '自动还款'
}

/** 管理端还款提醒触达方式（演示） */
export const REPAYMENT_REMINDER_CHANNEL = {
  IN_APP: 'in_app',
  SMS: 'sms',
  EMAIL: 'email',
  ALL: 'all'
}

export const REPAYMENT_REMINDER_CHANNEL_LABELS = {
  [REPAYMENT_REMINDER_CHANNEL.IN_APP]: '站内消息',
  [REPAYMENT_REMINDER_CHANNEL.SMS]: '短信',
  [REPAYMENT_REMINDER_CHANNEL.EMAIL]: '邮件',
  [REPAYMENT_REMINDER_CHANNEL.ALL]: '全部渠道'
}

/** 用户在前台主动还款并确认时写入的支付方式（场内记账） */
export const REPAYMENT_PAYMENT_METHOD_USER = '站内账户'

/**
 * 与前台还款提交逻辑一致：结清为全额，否则均为部分还款（含只冲减已计利息的情形）。
 */
export function deriveRepaymentType({ newDebt }) {
  const nd = Number(newDebt)
  if (Number.isFinite(nd) && nd <= 0) return REPAYMENT_TYPE.FULL
  return REPAYMENT_TYPE.PARTIAL
}

// 风险等级
export const RISK_LEVEL = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

export const RISK_LEVEL_LABELS = {
  [RISK_LEVEL.LOW]: '低风险',
  [RISK_LEVEL.MEDIUM]: '中风险',
  [RISK_LEVEL.HIGH]: '高风险',
  [RISK_LEVEL.CRITICAL]: '极高风险'
}

export const RISK_LEVEL_COLORS = {
  [RISK_LEVEL.LOW]: 'green',
  [RISK_LEVEL.MEDIUM]: 'yellow',
  [RISK_LEVEL.HIGH]: 'orange',
  [RISK_LEVEL.CRITICAL]: 'red'
}

// 利率类型
export const INTEREST_RATE_TYPE = {
  FIXED: 'fixed',
  FLOATING: 'floating',
  TIERED: 'tiered'
}

export const INTEREST_RATE_TYPE_LABELS = {
  [INTEREST_RATE_TYPE.FIXED]: '固定利率',
  [INTEREST_RATE_TYPE.FLOATING]: '浮动利率',
  [INTEREST_RATE_TYPE.TIERED]: '阶梯利率'
}

// 借出币种
export const LOAN_CURRENCY = {
  USDT: 'USDT',
  USDC: 'USDC',
  BUSD: 'BUSD',
  DAI: 'DAI'
}

export const LENDING_COLLATERAL_CURRENCIES = ['BTC', 'ETH', 'BNB', 'SOL', 'USDT', 'USDC']

export const DEFAULT_OVERDUE_PENALTY_RATE = 4

export const DEFAULT_COLLATERAL_WARNING_THRESHOLD = 85

export const DEFAULT_COLLATERAL_DISPOSAL_THRESHOLD = 95

export const LENDING_COLLATERAL_PRICE_USD = {
  BTC: 50000,
  ETH: 3000,
  BNB: 400,
  SOL: 150,
  XRP: 0.62,
  DOGE: 0.12,
  USDT: 1,
  USDC: 1,
  USD: 1,
  EUR: 1.08,
  XAU: 2300
}

export function uniqueCollateralCurrencies(currencies = []) {
  return [...new Set(
    currencies
      .map((c) => String(c || '').trim().toUpperCase())
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b))
}

export function collateralCurrenciesFromSpotProducts(spotProducts = []) {
  if (!Array.isArray(spotProducts)) return []
  const currencies = []
  for (const p of spotProducts) {
    if (p?.status !== 'trading') continue
    currencies.push(p.baseCurrency, p.quoteCurrency)
  }
  return uniqueCollateralCurrencies(currencies)
}

export function collateralCurrenciesFromOpenSpotSymbols(spotSymbols = []) {
  if (!Array.isArray(spotSymbols)) return []
  const currencies = []
  for (const s of spotSymbols) {
    if (Number(s?.deleted_at)) continue
    if (Number(s?.is_open) !== 1) continue
    currencies.push(s.base_coin_name, s.quote_coin_name)
  }
  return uniqueCollateralCurrencies(currencies)
}

export function normalizeCollateralConfig(product = {}) {
  const enabled = product.collateralEnabled !== false
  const multiplier = Number(product.collateralMultiplier)
  const currencies = Array.isArray(product.collateralCurrencies)
    ? product.collateralCurrencies.filter(Boolean)
    : product.collateralType
      ? [product.collateralType]
      : ['BTC', 'ETH', 'USDT']
  return {
    enabled,
    multiplier: Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1.5,
    currencies: currencies.length ? currencies : ['USDT'],
    overdueDeductEnabled: product.overdueDeductEnabled !== false
  }
}

export function normalizeOverduePenaltyRate(product = {}) {
  const rate = Number(product.overduePenaltyRate ?? product.liquidationPenalty)
  return Number.isFinite(rate) && rate >= 0 ? rate : DEFAULT_OVERDUE_PENALTY_RATE
}

export function normalizeCollateralDisposalThreshold(product = {}) {
  const threshold = Number(product.collateralDisposalThreshold)
  return Number.isFinite(threshold) && threshold > 0
    ? threshold
    : DEFAULT_COLLATERAL_DISPOSAL_THRESHOLD
}

export function normalizeCollateralWarningThreshold(product = {}) {
  const threshold = Number(product.collateralWarningThreshold)
  if (Number.isFinite(threshold) && threshold > 0) {
    return threshold
  }
  const disposal = normalizeCollateralDisposalThreshold(product)
  return Math.min(DEFAULT_COLLATERAL_WARNING_THRESHOLD, Math.max(1, disposal - 10))
}

export function collateralRequiredValue(loanAmount, product = {}) {
  const amount = Number(loanAmount) || 0
  const cfg = normalizeCollateralConfig(product)
  return amount * cfg.multiplier
}

export function collateralRequiredAmount(loanAmount, product = {}, currency) {
  const price = Number(LENDING_COLLATERAL_PRICE_USD[currency]) || 1
  return collateralRequiredValue(loanAmount, product) / price
}

// 产品列配置
export const PRODUCT_COLUMNS = [
  { key: 'productId', label: '产品ID', sortable: true },
  { key: 'productName', label: '产品名称', sortable: true },
  { key: 'loanCurrency', label: '借出币种', sortable: true },
  { key: 'collateralMultiplier', label: '质押倍数', sortable: true },
  { key: 'minLoanAmount', label: '最小借贷额', sortable: true },
  { key: 'maxLoanAmount', label: '最大借贷额', sortable: true },
  { key: 'interestRate', label: '年化利率', sortable: true },
  { key: 'status', label: '状态', sortable: true },
  { key: 'actions', label: '操作', sortable: false }
]

// 订单列配置
export const ORDER_COLUMNS = [
  { key: 'orderId', label: '订单ID', sortable: true },
  { key: 'userId', label: '用户ID', sortable: true },
  { key: 'productName', label: '产品名称', sortable: true },
  { key: 'loanAmount', label: '借贷金额', sortable: true },
  { key: 'totalDebt', label: '总债务', sortable: true },
  { key: 'overduePenaltyAccrued', label: '逾期利息', sortable: true },
  { key: 'interestAccrued', label: '累计利息', sortable: true },
  { key: 'status', label: '状态', sortable: true },
  { key: 'createTime', label: '创建时间', sortable: true },
  { key: 'actions', label: '操作', sortable: false }
]

// 还款列配置
export const REPAYMENT_COLUMNS = [
  { key: 'repaymentId', label: '还款ID', sortable: true },
  { key: 'orderId', label: '订单ID', sortable: true },
  { key: 'userId', label: '用户ID', sortable: true },
  { key: 'loanCurrency', label: '借出币种', sortable: true },
  { key: 'repaymentType', label: '还款类型', sortable: true },
  { key: 'amount', label: '还款金额', sortable: true },
  { key: 'overduePenaltyPaid', label: '逾期利息', sortable: true },
  { key: 'interestPaid', label: '利息', sortable: true },
  { key: 'principalPaid', label: '本金', sortable: true },
  { key: 'status', label: '状态', sortable: true },
  { key: 'repaymentTime', label: '还款时间', sortable: true },
  { key: 'actions', label: '操作', sortable: false }
]
