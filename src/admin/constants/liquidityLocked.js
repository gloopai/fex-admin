// 模块分区
export const LOCKED_SECTION = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  ADJUSTMENTS: 'adjustments',
  ALERTS: 'alerts',
  RULES: 'rules'
}

// 产品状态
export const PRODUCT_STATUS = {
  ENABLED: 'enabled',
  DISABLED: 'disabled',
  SOLD_OUT: 'sold_out'
}

// 订单状态
export const ORDER_STATUS = {
  LOCKED: 'locked',
  COMPLETED: 'completed',
  EARLY_REDEEMED: 'early_redeemed'
}

// 调整类型
export const ADJUSTMENT_TYPE = {
  ADD_INTEREST: 'add_interest',
  DEDUCT_INTEREST: 'deduct_interest',
  EXTEND: 'extend',
  EARLY_REDEEM: 'early_redeem'
}

// 调整状态
export const ADJUSTMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXECUTED: 'executed'
}

// 预警级别
export const ALERT_LEVEL = {
  INFO: 'info',
  WARNING: 'warning',
  URGENT: 'urgent'
}

// 限购类型
export const PURCHASE_LIMIT_TYPE = {
  LIFETIME: 'lifetime',
  PERIOD: 'period',
  NONE: 'none'
}

// 币种
export const SUPPORTED_CURRENCIES = ['USDT', 'BTC', 'ETH', 'USDC', 'BNB']

// 锁仓周期选项（天）
export const LOCK_PERIODS = [2, 5, 10, 20, 30, 60, 90]

// 提前赎回违约费率
export const EARLY_REDEMPTION_FEE = 0.04

// 通用筛选器
export const COMMON_FILTER_ALL = 'all'

// 状态样式映射
export const productStatusMeta = {
  [PRODUCT_STATUS.ENABLED]: { label: '上架中', class: 'bg-emerald-100 text-emerald-700' },
  [PRODUCT_STATUS.DISABLED]: { label: '已下架', class: 'bg-slate-200 text-slate-600' },
  [PRODUCT_STATUS.SOLD_OUT]: { label: '已售罄', class: 'bg-amber-100 text-amber-700' }
}

export const orderStatusMeta = {
  [ORDER_STATUS.LOCKED]: { label: '锁定中', class: 'bg-blue-100 text-blue-700' },
  [ORDER_STATUS.COMPLETED]: { label: '已完成', class: 'bg-emerald-100 text-emerald-700' },
  [ORDER_STATUS.EARLY_REDEEMED]: { label: '提前赎回', class: 'bg-rose-100 text-rose-700' }
}

export const adjustmentTypeMeta = {
  [ADJUSTMENT_TYPE.ADD_INTEREST]: { label: '补息', class: 'bg-emerald-100 text-emerald-700' },
  [ADJUSTMENT_TYPE.DEDUCT_INTEREST]: { label: '扣息', class: 'bg-rose-100 text-rose-700' },
  [ADJUSTMENT_TYPE.EXTEND]: { label: '展期', class: 'bg-blue-100 text-blue-700' },
  [ADJUSTMENT_TYPE.EARLY_REDEEM]: { label: '提前赎回', class: 'bg-amber-100 text-amber-700' }
}

export const adjustmentStatusMeta = {
  [ADJUSTMENT_STATUS.PENDING]: { label: '待处理', class: 'bg-amber-100 text-amber-700' },
  [ADJUSTMENT_STATUS.APPROVED]: { label: '已批准', class: 'bg-blue-100 text-blue-700' },
  [ADJUSTMENT_STATUS.REJECTED]: { label: '已拒绝', class: 'bg-slate-200 text-slate-600' },
  [ADJUSTMENT_STATUS.EXECUTED]: { label: '已执行', class: 'bg-emerald-100 text-emerald-700' }
}

export const alertLevelMeta = {
  [ALERT_LEVEL.INFO]: { label: '信息', class: 'bg-blue-100 text-blue-700' },
  [ALERT_LEVEL.WARNING]: { label: '警告', class: 'bg-amber-100 text-amber-700' },
  [ALERT_LEVEL.URGENT]: { label: '紧急', class: 'bg-rose-100 text-rose-700' }
}

// 申购门槛：最低 VIP（0 为无要求）
export const LOCKED_MIN_VIP_OPTIONS = [
  { value: 0, label: '无要求' },
  { value: 1, label: 'VIP 1' },
  { value: 2, label: 'VIP 2' },
  { value: 3, label: 'VIP 3' },
  { value: 4, label: 'VIP 4' },
  { value: 5, label: 'VIP 5' }
]

// 申购门槛：最低认证等级（值 none/basic/advanced 与后端约定一致）
export const LOCKED_MIN_KYC_OPTIONS = [
  { value: 'none', label: '无认证' },
  { value: 'basic', label: '普通认证' },
  { value: 'advanced', label: '高级认证' }
]

/** 展示/编辑用年化 %：优先 annualRate；否则由旧字段 dailyRate（日化 %）×365 推算 */
export function lockYieldAnnualPct(row) {
  if (row == null) return 0
  if (row.annualRate != null && row.annualRate !== '') return Number(row.annualRate)
  if (row.dailyRate != null && row.dailyRate !== '') return Number(row.dailyRate) * 365
  return 0
}

export function lockedMinKycLabel(code) {
  const hit = LOCKED_MIN_KYC_OPTIONS.find((o) => o.value === code)
  if (hit) return hit.label
  if (code === 'institution') return '机构认证'
  return LOCKED_MIN_KYC_OPTIONS[0].label
}

/** 前台展示：无认证门槛时写「无认证限制」，其余同 {@link lockedMinKycLabel} */
export function lockedMinKycRequirementPhrase(code) {
  if (code == null || code === '' || code === 'none') return '无认证限制'
  return lockedMinKycLabel(code)
}

/** 未配置「可借贷比例」时的默认百分数（0–100） */
export const DEFAULT_LOCKED_LENDABLE_RATIO = 70

/**
 * 按借贷币种汇总：上架中锁仓产品的可借池规模 = Σ(totalLocked × 可借贷比例/100)。
 * @param {string} loanCurrency 与锁仓产品 `currency` 一致，如 USDT
 * @param {Array<{ currency: string, status: string, totalLocked?: number, lendableRatio?: number }>} lockedProducts
 */
export function borrowableLiquidityFromLocked(loanCurrency, lockedProducts) {
  if (!loanCurrency || !Array.isArray(lockedProducts)) return 0
  return lockedProducts.reduce((sum, p) => {
    if (p.currency !== loanCurrency || p.status !== PRODUCT_STATUS.ENABLED) return sum
    const raw = p.lendableRatio
    const ratio =
      raw == null || raw === ''
        ? DEFAULT_LOCKED_LENDABLE_RATIO
        : Math.min(100, Math.max(0, Number(raw)))
    if (!Number.isFinite(ratio)) return sum
    return sum + Number(p.totalLocked || 0) * (ratio / 100)
  }, 0)
}
