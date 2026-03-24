// 加密货币抵押借贷常量配置

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
  COMPLETED: 'completed',
  LIQUIDATED: 'liquidated',
  CANCELLED: 'cancelled'
}

export const LOAN_ORDER_STATUS_LABELS = {
  [LOAN_ORDER_STATUS.PENDING]: '待审核',
  [LOAN_ORDER_STATUS.ACTIVE]: '借贷中',
  [LOAN_ORDER_STATUS.REPAYING]: '还款中',
  [LOAN_ORDER_STATUS.COMPLETED]: '已完成',
  [LOAN_ORDER_STATUS.LIQUIDATED]: '已清算',
  [LOAN_ORDER_STATUS.CANCELLED]: '已取消'
}

export const LOAN_ORDER_STATUS_COLORS = {
  [LOAN_ORDER_STATUS.PENDING]: 'blue',
  [LOAN_ORDER_STATUS.ACTIVE]: 'green',
  [LOAN_ORDER_STATUS.REPAYING]: 'cyan',
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
  INTEREST_ONLY: 'interest_only',
  AUTO: 'auto'
}

export const REPAYMENT_TYPE_LABELS = {
  [REPAYMENT_TYPE.PARTIAL]: '部分还款',
  [REPAYMENT_TYPE.FULL]: '全额还款',
  [REPAYMENT_TYPE.INTEREST_ONLY]: '仅还利息',
  [REPAYMENT_TYPE.AUTO]: '自动还款'
}

// 清算状态
export const LIQUIDATION_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  PARTIAL: 'partial'
}

export const LIQUIDATION_STATUS_LABELS = {
  [LIQUIDATION_STATUS.PENDING]: '待清算',
  [LIQUIDATION_STATUS.IN_PROGRESS]: '清算中',
  [LIQUIDATION_STATUS.COMPLETED]: '已完成',
  [LIQUIDATION_STATUS.FAILED]: '失败',
  [LIQUIDATION_STATUS.PARTIAL]: '部分清算'
}

export const LIQUIDATION_STATUS_COLORS = {
  [LIQUIDATION_STATUS.PENDING]: 'orange',
  [LIQUIDATION_STATUS.IN_PROGRESS]: 'blue',
  [LIQUIDATION_STATUS.COMPLETED]: 'green',
  [LIQUIDATION_STATUS.FAILED]: 'red',
  [LIQUIDATION_STATUS.PARTIAL]: 'yellow'
}

// 清算触发类型
export const LIQUIDATION_TRIGGER = {
  LTV_THRESHOLD: 'ltv_threshold',
  MANUAL: 'manual',
  OVERDUE: 'overdue',
  PRICE_DROP: 'price_drop'
}

export const LIQUIDATION_TRIGGER_LABELS = {
  [LIQUIDATION_TRIGGER.LTV_THRESHOLD]: 'LTV阈值触发',
  [LIQUIDATION_TRIGGER.MANUAL]: '手动清算',
  [LIQUIDATION_TRIGGER.OVERDUE]: '逾期清算',
  [LIQUIDATION_TRIGGER.PRICE_DROP]: '价格暴跌'
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

// 抵押品类型
export const COLLATERAL_TYPE = {
  BTC: 'BTC',
  ETH: 'ETH',
  USDT: 'USDT',
  USDC: 'USDC',
  BNB: 'BNB'
}

// 借出币种
export const LOAN_CURRENCY = {
  USDT: 'USDT',
  USDC: 'USDC',
  BUSD: 'BUSD',
  DAI: 'DAI'
}

// 产品列配置
export const PRODUCT_COLUMNS = [
  { key: 'productId', label: '产品ID', sortable: true },
  { key: 'productName', label: '产品名称', sortable: true },
  { key: 'collateralType', label: '抵押币种', sortable: true },
  { key: 'loanCurrency', label: '借出币种', sortable: true },
  { key: 'minLoanAmount', label: '最小借贷额', sortable: true },
  { key: 'maxLoanAmount', label: '最大借贷额', sortable: true },
  { key: 'interestRate', label: '年化利率', sortable: true },
  { key: 'ltvRatio', label: 'LTV比率', sortable: true },
  { key: 'liquidationThreshold', label: '清算阈值', sortable: true },
  { key: 'status', label: '状态', sortable: true },
  { key: 'actions', label: '操作', sortable: false }
]

// 订单列配置
export const ORDER_COLUMNS = [
  { key: 'orderId', label: '订单ID', sortable: true },
  { key: 'userId', label: '用户ID', sortable: true },
  { key: 'productName', label: '产品名称', sortable: true },
  { key: 'collateralAmount', label: '抵押数量', sortable: true },
  { key: 'loanAmount', label: '借贷数量', sortable: true },
  { key: 'currentLtv', label: '当前LTV', sortable: true },
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
  { key: 'repaymentType', label: '还款类型', sortable: true },
  { key: 'amount', label: '还款金额', sortable: true },
  { key: 'interestPaid', label: '利息', sortable: true },
  { key: 'principalPaid', label: '本金', sortable: true },
  { key: 'status', label: '状态', sortable: true },
  { key: 'repaymentTime', label: '还款时间', sortable: true },
  { key: 'actions', label: '操作', sortable: false }
]

// 清算列配置
export const LIQUIDATION_COLUMNS = [
  { key: 'liquidationId', label: '清算ID', sortable: true },
  { key: 'orderId', label: '订单ID', sortable: true },
  { key: 'userId', label: '用户ID', sortable: true },
  { key: 'triggerType', label: '触发类型', sortable: true },
  { key: 'collateralSold', label: '清算数量', sortable: true },
  { key: 'liquidationValue', label: '清算价值', sortable: true },
  { key: 'debtRecovered', label: '收回债务', sortable: true },
  { key: 'penalty', label: '清算罚金', sortable: true },
  { key: 'status', label: '状态', sortable: true },
  { key: 'liquidationTime', label: '清算时间', sortable: true },
  { key: 'actions', label: '操作', sortable: false }
]

// 用户监控列配置
export const USER_MONITORING_COLUMNS = [
  { key: 'userId', label: '用户ID', sortable: true },
  { key: 'totalCollateral', label: '总抵押', sortable: true },
  { key: 'totalDebt', label: '总债务', sortable: true },
  { key: 'averageLtv', label: '平均LTV', sortable: true },
  { key: 'riskLevel', label: '风险等级', sortable: true },
  { key: 'activeOrders', label: '活跃订单', sortable: true },
  { key: 'overdueAmount', label: '逾期金额', sortable: true },
  { key: 'creditScore', label: '信用评分', sortable: true },
  { key: 'lastActivity', label: '最后活动', sortable: true },
  { key: 'actions', label: '操作', sortable: false }
]
