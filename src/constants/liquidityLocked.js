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
