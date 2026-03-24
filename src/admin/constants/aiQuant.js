// AI量化交易常量配置

// 产品状态
export const PRODUCT_STATUS = {
  ENABLED: 'enabled',
  DISABLED: 'disabled',
  SOLD_OUT: 'sold_out',
  MAINTENANCE: 'maintenance'
}

export const productStatusMeta = {
  [PRODUCT_STATUS.ENABLED]: { label: '已启用', color: 'text-green-600 bg-green-50' },
  [PRODUCT_STATUS.DISABLED]: { label: '已禁用', color: 'text-gray-600 bg-gray-50' },
  [PRODUCT_STATUS.SOLD_OUT]: { label: '已售罄', color: 'text-orange-600 bg-orange-50' },
  [PRODUCT_STATUS.MAINTENANCE]: { label: '维护中', color: 'text-blue-600 bg-blue-50' }
}

// 订单状态
export const ORDER_STATUS = {
  RUNNING: 'running',
  COMPLETED: 'completed',
  SETTLED: 'settled',
  EARLY_REDEEMED: 'early_redeemed',
  LOCKED: 'locked',
  CANCELLED: 'cancelled'
}

export const orderStatusMeta = {
  [ORDER_STATUS.RUNNING]: { label: '运行中', class: 'bg-blue-100 text-blue-700' },
  [ORDER_STATUS.COMPLETED]: { label: '已完成', class: 'bg-emerald-100 text-emerald-700' },
  [ORDER_STATUS.SETTLED]: { label: '已结算', class: 'bg-slate-100 text-slate-600' },
  [ORDER_STATUS.EARLY_REDEEMED]: { label: '提前赎回', class: 'bg-purple-100 text-purple-700' },
  [ORDER_STATUS.LOCKED]: { label: '锁定中', class: 'bg-amber-100 text-amber-700' },
  [ORDER_STATUS.CANCELLED]: { label: '已取消', class: 'bg-rose-100 text-rose-700' }
}

// 收益调整类型
export const ADJUSTMENT_TYPE = {
  INCREASE: 'increase',
  DECREASE: 'decrease',
  BONUS: 'bonus',
  PENALTY: 'penalty',
  CORRECTION: 'correction'
}

export const adjustmentTypeMeta = {
  [ADJUSTMENT_TYPE.BONUS]: {
    label: '奖励补发',
    desc: '为用户补发额外奖励或活动收益',
    class: 'bg-green-100 text-green-700'
  },
  [ADJUSTMENT_TYPE.PENALTY]: {
    label: '违规惩罚',
    desc: '因违规行为扣减用户收益',
    class: 'bg-red-100 text-red-700'
  },
  [ADJUSTMENT_TYPE.CORRECTION]: {
    label: '数据修正',
    desc: '修正系统错误导致的收益偏差',
    class: 'bg-blue-100 text-blue-700'
  },
  [ADJUSTMENT_TYPE.INCREASE]: {
    label: '收益提升',
    desc: '临时或永久提高收益率',
    class: 'bg-purple-100 text-purple-700'
  },
  [ADJUSTMENT_TYPE.DECREASE]: {
    label: '收益降低',
    desc: '临时或永久降低收益率',
    class: 'bg-orange-100 text-orange-700'
  }
}

// 调整状态
export const ADJUSTMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXECUTED: 'executed'
}

export const adjustmentStatusMeta = {
  [ADJUSTMENT_STATUS.PENDING]: { label: '待处理', class: 'bg-amber-100 text-amber-700' },
  [ADJUSTMENT_STATUS.APPROVED]: { label: '已批准', class: 'bg-blue-100 text-blue-700' },
  [ADJUSTMENT_STATUS.REJECTED]: { label: '已拒绝', class: 'bg-slate-100 text-slate-600' },
  [ADJUSTMENT_STATUS.EXECUTED]: { label: '已执行', class: 'bg-emerald-100 text-emerald-700' }
}

// 调控干预类型
export const CONTROL_TYPE = {
  USER_YIELD: 'user_yield',
  PRODUCT_YIELD: 'product_yield',
  PRODUCT_STOP: 'product_stop',
  SYSTEM_STOP: 'system_stop',
  LIQUIDITY_INJECT: 'liquidity_inject'
}

export const controlTypeMeta = {
  [CONTROL_TYPE.USER_YIELD]: { 
    label: '用户收益干预', 
    class: 'bg-blue-100 text-blue-700',
    targetType: 'user',
    targetLabel: '用户ID',
    targetPlaceholder: '输入用户ID，如：user-12345',
    description: '针对特定用户进行收益调整，可用于个人奖励或处罚'
  },
  [CONTROL_TYPE.PRODUCT_YIELD]: { 
    label: '产品收益调整', 
    class: 'bg-emerald-100 text-emerald-700',
    targetType: 'product',
    targetLabel: '产品ID',
    targetPlaceholder: '输入产品ID，如：aiq-prod-001',
    description: '调整整个产品的收益率配置，影响该产品下所有用户'
  },
  [CONTROL_TYPE.PRODUCT_STOP]: { 
    label: '产品紧急暂停', 
    class: 'bg-rose-100 text-rose-700',
    targetType: 'product',
    targetLabel: '产品ID',
    targetPlaceholder: '输入要暂停的产品ID',
    description: '紧急暂停指定产品的申购和赎回操作，用于风险控制'
  },
  [CONTROL_TYPE.SYSTEM_STOP]: { 
    label: '系统紧急暂停', 
    class: 'bg-red-100 text-red-800',
    targetType: 'system',
    targetLabel: '系统级操作',
    targetPlaceholder: '系统级操作，无需填写',
    description: '暂停整个AI量化系统的所有交易操作，仅用于极端风险场景'
  },
  [CONTROL_TYPE.LIQUIDITY_INJECT]: { 
    label: '流动性注入', 
    class: 'bg-amber-100 text-amber-700',
    targetType: 'system',
    targetLabel: '系统级操作',
    targetPlaceholder: '系统级操作，无需填写',
    description: '向流动性池注入资金，应对大额赎回或流动性危机'
  }
}

// 调控操作状态
export const CONTROL_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

export const controlStatusMeta = {
  [CONTROL_STATUS.PENDING]: { label: '待生效', class: 'bg-amber-100 text-amber-700' },
  [CONTROL_STATUS.ACTIVE]: { label: '生效中', class: 'bg-emerald-100 text-emerald-700' },
  [CONTROL_STATUS.COMPLETED]: { label: '已完成', class: 'bg-slate-100 text-slate-600' },
  [CONTROL_STATUS.CANCELLED]: { label: '已取消', class: 'bg-rose-100 text-rose-700' }
}

// VIP等级
export const VIP_LEVEL = {
  VIP0: 0,
  VIP1: 1,
  VIP2: 2,
  VIP3: 3,
  VIP4: 4,
  VIP5: 5
}

export const vipLevelMeta = {
  [VIP_LEVEL.VIP0]: { label: 'VIP0', class: 'bg-slate-100 text-slate-600', requirement: '无要求' },
  [VIP_LEVEL.VIP1]: { label: 'VIP1', class: 'bg-blue-100 text-blue-700', requirement: '累计入金 1,000 USDT' },
  [VIP_LEVEL.VIP2]: { label: 'VIP2', class: 'bg-emerald-100 text-emerald-700', requirement: '累计入金 10,000 USDT' },
  [VIP_LEVEL.VIP3]: { label: 'VIP3', class: 'bg-purple-100 text-purple-700', requirement: '累计入金 50,000 USDT' },
  [VIP_LEVEL.VIP4]: { label: 'VIP4', class: 'bg-amber-100 text-amber-700', requirement: '累计入金 100,000 USDT' },
  [VIP_LEVEL.VIP5]: { label: 'VIP5', class: 'bg-rose-100 text-rose-700', requirement: '累计入金 500,000 USDT' }
}

// 支持的币种
export const SUPPORTED_CURRENCIES = ['USDT', 'BTC', 'ETH', 'BNB', 'SOL']

export const currencyMeta = {
  USDT: { symbol: '₮', name: 'Tether USD', decimals: 2 },
  BTC: { symbol: '₿', name: 'Bitcoin', decimals: 8 },
  ETH: { symbol: 'Ξ', name: 'Ethereum', decimals: 6 },
  BNB: { symbol: 'BNB', name: 'Binance Coin', decimals: 4 },
  SOL: { symbol: 'SOL', name: 'Solana', decimals: 4 }
}

// 运营模式
export const OPERATION_MODE = {
  REAL_HEDGE: 'real_hedge',
  INTERNAL: 'internal',
  HYBRID: 'hybrid'
}

export const operationModeMeta = {
  [OPERATION_MODE.REAL_HEDGE]: { label: '真实对冲', description: '通过API接入外部交易所，执行真实量化策略' },
  [OPERATION_MODE.INTERNAL]: { label: '内盘运作', description: '根据配置收益率在数据库跑数，无真实交易' },
  [OPERATION_MODE.HYBRID]: { label: '混合模式', description: '部分资金真实交易，部分内盘运作' }
}

// 限购类型
export const LIMIT_TYPE = {
  AMOUNT: 'amount',
  COUNT: 'count',
  BOTH: 'both'
}

// 结算周期
export const SETTLEMENT_PERIOD = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  CUSTOM: 'custom'
}

export const settlementPeriodMeta = {
  [SETTLEMENT_PERIOD.DAILY]: { label: '每日结算', days: 1 },
  [SETTLEMENT_PERIOD.WEEKLY]: { label: '每周结算', days: 7 },
  [SETTLEMENT_PERIOD.MONTHLY]: { label: '每月结算', days: 30 },
  [SETTLEMENT_PERIOD.CUSTOM]: { label: '自定义周期', days: null }
}

// 公共过滤选项
export const COMMON_FILTER_ALL = 'all'
