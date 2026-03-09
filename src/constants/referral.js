// 分销类型
export const REFERRAL_TYPE = {
  DEPOSIT: 'deposit',           // 充值
  PERIODIC: 'periodic',         // 周期产品
  LENDING: 'lending',           // 理财
  AI_QUANT: 'ai_quant'          // AI量化
}

export const REFERRAL_TYPE_OPTIONS = [
  { value: REFERRAL_TYPE.DEPOSIT, label: '充值分销' },
  { value: REFERRAL_TYPE.PERIODIC, label: '周期产品' },
  { value: REFERRAL_TYPE.LENDING, label: '理财产品' },
  { value: REFERRAL_TYPE.AI_QUANT, label: 'AI量化' }
]

// 分佣状态
export const COMMISSION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
}

export const COMMISSION_STATUS_OPTIONS = [
  { value: COMMISSION_STATUS.PENDING, label: '待发放', color: 'yellow' },
  { value: COMMISSION_STATUS.PROCESSING, label: '发放中', color: 'blue' },
  { value: COMMISSION_STATUS.COMPLETED, label: '已完成', color: 'green' },
  { value: COMMISSION_STATUS.FAILED, label: '失败', color: 'red' },
  { value: COMMISSION_STATUS.CANCELLED, label: '已取消', color: 'gray' }
]

// 分销层级
export const REFERRAL_LEVEL = {
  LEVEL_1: 1,
  LEVEL_2: 2,
  LEVEL_3: 3,
  LEVEL_4: 4,
  LEVEL_5: 5
}

// 分佣记录表格列
export const COMMISSION_TABLE_COLUMNS = [
  { key: 'id', label: '记录ID', width: 120 },
  { key: 'agentUid', label: '代理UID', width: 120 },
  { key: 'agentUsername', label: '代理用户名', width: 150 },
  { key: 'referralUid', label: '被推荐人UID', width: 120 },
  { key: 'referralUsername', label: '被推荐人', width: 150 },
  { key: 'type', label: '分销类型', width: 120 },
  { key: 'level', label: '分销层级', width: 100 },
  { key: 'amount', label: '订单金额（USDT）', width: 150 },
  { key: 'commissionRate', label: '佣金比例', width: 100 },
  { key: 'commission', label: '佣金（USDT）', width: 130 },
  { key: 'status', label: '状态', width: 100 },
  { key: 'createdAt', label: '生成时间', width: 180 },
  { key: 'completedAt', label: '完成时间', width: 180 }
]

// 分销统计数据类型
export const STATS_PERIOD = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
  ALL: 'all'
}

export const STATS_PERIOD_OPTIONS = [
  { value: STATS_PERIOD.TODAY, label: '今日' },
  { value: STATS_PERIOD.YESTERDAY, label: '昨日' },
  { value: STATS_PERIOD.WEEK, label: '本周' },
  { value: STATS_PERIOD.MONTH, label: '本月' },
  { value: STATS_PERIOD.YEAR, label: '本年' },
  { value: STATS_PERIOD.ALL, label: '全部' }
]

// 分销配置字段
export const REFERRAL_CONFIG_FIELDS = {
  AUTO_EXECUTE: 'autoExecute',                    // 是否自动执行分佣
  DEPOSIT_FIRST_ONLY: 'depositFirstOnly',         // 充值分销第一次才有
  DEPOSIT_COMMISSION_RATES: 'depositCommissionRates',     // 充值佣金比例
  PERIODIC_COMMISSION_RATES: 'periodicCommissionRates',   // 周期产品佣金比例
  LENDING_COMMISSION_RATES: 'lendingCommissionRates',     // 理财佣金比例
  AI_QUANT_COMMISSION_RATES: 'aiQuantCommissionRates'     // AI量化佣金比例
}

// 默认分销配置
export const DEFAULT_REFERRAL_CONFIG = {
  autoExecute: true,
  depositFirstOnly: false,
  depositCommissionRates: '0.1',
  periodicCommissionRates: '',
  lendingCommissionRates: '',
  aiQuantCommissionRates: ''
}
