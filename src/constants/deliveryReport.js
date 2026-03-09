// 报表时间范围
export const DELIVERY_REPORT_TIME_RANGE = {
  REALTIME: 'realtime',      // 实时
  TODAY: 'today',            // 今日
  YESTERDAY: 'yesterday',    // 昨日
  LAST_7_DAYS: 'last_7_days', // 近7天
  LAST_30_DAYS: 'last_30_days', // 近30天
  CUSTOM: 'custom'           // 自定义
}

// 报表时间范围选项
export const DELIVERY_REPORT_TIME_RANGE_OPTIONS = [
  { value: DELIVERY_REPORT_TIME_RANGE.REALTIME, label: '实时' },
  { value: DELIVERY_REPORT_TIME_RANGE.TODAY, label: '今日' },
  { value: DELIVERY_REPORT_TIME_RANGE.YESTERDAY, label: '昨日' },
  { value: DELIVERY_REPORT_TIME_RANGE.LAST_7_DAYS, label: '近7天' },
  { value: DELIVERY_REPORT_TIME_RANGE.LAST_30_DAYS, label: '近30天' },
  { value: DELIVERY_REPORT_TIME_RANGE.CUSTOM, label: '自定义' }
]

// 风险等级
export const DELIVERY_RISK_LEVEL = {
  LOW: 'low',           // 低风险
  MEDIUM: 'medium',     // 中风险
  HIGH: 'high',         // 高风险
  CRITICAL: 'critical'  // 严重风险
}

// 风险等级配置
export const DELIVERY_RISK_LEVEL_CONFIG = {
  [DELIVERY_RISK_LEVEL.LOW]: {
    text: '低风险',
    class: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    color: 'emerald'
  },
  [DELIVERY_RISK_LEVEL.MEDIUM]: {
    text: '中风险',
    class: 'bg-amber-100 text-amber-700 border-amber-200',
    color: 'amber'
  },
  [DELIVERY_RISK_LEVEL.HIGH]: {
    text: '高风险',
    class: 'bg-orange-100 text-orange-700 border-orange-200',
    color: 'orange'
  },
  [DELIVERY_RISK_LEVEL.CRITICAL]: {
    text: '严重风险',
    class: 'bg-rose-100 text-rose-700 border-rose-200',
    color: 'rose'
  }
}

// 持仓方向
export const DELIVERY_POSITION_SIDE = {
  LONG: 'long',   // 多头
  SHORT: 'short'  // 空头
}

// 持仓方向配置
export const DELIVERY_POSITION_SIDE_CONFIG = {
  [DELIVERY_POSITION_SIDE.LONG]: {
    text: '多头',
    class: 'bg-blue-100 text-blue-700',
    color: 'blue'
  },
  [DELIVERY_POSITION_SIDE.SHORT]: {
    text: '空头',
    class: 'bg-rose-100 text-rose-700',
    color: 'rose'
  }
}

// 用户分类
export const DELIVERY_USER_TYPE = {
  WHALE: 'whale',         // 大户
  ACTIVE: 'active',       // 活跃用户
  HIGH_FREQ: 'high_freq', // 高频交易
  NORMAL: 'normal'        // 普通用户
}

// 用户分类配置
export const DELIVERY_USER_TYPE_CONFIG = {
  [DELIVERY_USER_TYPE.WHALE]: {
    text: '大户',
    class: 'bg-purple-100 text-purple-700',
    icon: '🐋'
  },
  [DELIVERY_USER_TYPE.ACTIVE]: {
    text: '活跃',
    class: 'bg-blue-100 text-blue-700',
    icon: '⚡'
  },
  [DELIVERY_USER_TYPE.HIGH_FREQ]: {
    text: '高频',
    class: 'bg-orange-100 text-orange-700',
    icon: '🔥'
  },
  [DELIVERY_USER_TYPE.NORMAL]: {
    text: '普通',
    class: 'bg-slate-100 text-slate-700',
    icon: '👤'
  }
}

// 交割周期类型
export const DELIVERY_CYCLE_TYPE = {
  DAILY: 'daily',       // 日合约
  WEEKLY: 'weekly',     // 周合约
  BI_WEEKLY: 'bi_weekly', // 双周合约
  MONTHLY: 'monthly',   // 月合约
  QUARTERLY: 'quarterly' // 季度合约
}

// 交割周期配置
export const DELIVERY_CYCLE_TYPE_CONFIG = {
  [DELIVERY_CYCLE_TYPE.DAILY]: {
    text: '日合约',
    class: 'bg-sky-100 text-sky-700',
    color: 'sky'
  },
  [DELIVERY_CYCLE_TYPE.WEEKLY]: {
    text: '周合约',
    class: 'bg-cyan-100 text-cyan-700',
    color: 'cyan'
  },
  [DELIVERY_CYCLE_TYPE.BI_WEEKLY]: {
    text: '双周合约',
    class: 'bg-teal-100 text-teal-700',
    color: 'teal'
  },
  [DELIVERY_CYCLE_TYPE.MONTHLY]: {
    text: '月合约',
    class: 'bg-indigo-100 text-indigo-700',
    color: 'indigo'
  },
  [DELIVERY_CYCLE_TYPE.QUARTERLY]: {
    text: '季度合约',
    class: 'bg-violet-100 text-violet-700',
    color: 'violet'
  }
}

// 交割状态
export const DELIVERY_CONTRACT_STATUS = {
  TRADING: 'trading',         // 交易中
  NEAR_EXPIRY: 'near_expiry', // 临近交割
  SETTLING: 'settling',       // 交割中
  SETTLED: 'settled'          // 已交割
}

// 交割状态配置
export const DELIVERY_CONTRACT_STATUS_CONFIG = {
  [DELIVERY_CONTRACT_STATUS.TRADING]: {
    text: '交易中',
    class: 'bg-emerald-100 text-emerald-700',
    color: 'emerald'
  },
  [DELIVERY_CONTRACT_STATUS.NEAR_EXPIRY]: {
    text: '临近交割',
    class: 'bg-amber-100 text-amber-700',
    color: 'amber'
  },
  [DELIVERY_CONTRACT_STATUS.SETTLING]: {
    text: '交割中',
    class: 'bg-orange-100 text-orange-700',
    color: 'orange'
  },
  [DELIVERY_CONTRACT_STATUS.SETTLED]: {
    text: '已交割',
    class: 'bg-slate-100 text-slate-700',
    color: 'slate'
  }
}

// 场控操作类型
export const DELIVERY_CONTROL_ACTION = {
  FORCE_LOSS: 'force_loss',       // 强制亏损
  FORCE_PROFIT: 'force_profit',   // 强制盈利
  LOCK_POSITION: 'lock_position', // 锁定持仓
  ADJUST_PRICE: 'adjust_price',   // 价格调整
  DELAY_SETTLEMENT: 'delay_settlement' // 延迟交割
}

// 场控操作类型配置
export const DELIVERY_CONTROL_ACTION_CONFIG = {
  [DELIVERY_CONTROL_ACTION.FORCE_LOSS]: {
    text: '强制亏损',
    class: 'bg-rose-100 text-rose-700',
    color: 'rose'
  },
  [DELIVERY_CONTROL_ACTION.FORCE_PROFIT]: {
    text: '强制盈利',
    class: 'bg-emerald-100 text-emerald-700',
    color: 'emerald'
  },
  [DELIVERY_CONTROL_ACTION.LOCK_POSITION]: {
    text: '锁定持仓',
    class: 'bg-violet-100 text-violet-700',
    color: 'violet'
  },
  [DELIVERY_CONTROL_ACTION.ADJUST_PRICE]: {
    text: '价格调整',
    class: 'bg-amber-100 text-amber-700',
    color: 'amber'
  },
  [DELIVERY_CONTROL_ACTION.DELAY_SETTLEMENT]: {
    text: '延迟交割',
    class: 'bg-blue-100 text-blue-700',
    color: 'blue'
  }
}

// 操作建议优先级
export const SUGGESTION_PRIORITY = {
  URGENT: 'urgent',     // 紧急
  HIGH: 'high',         // 高
  MEDIUM: 'medium',     // 中
  LOW: 'low'            // 低
}

// 操作建议优先级配置
export const SUGGESTION_PRIORITY_CONFIG = {
  [SUGGESTION_PRIORITY.URGENT]: {
    text: '紧急',
    class: 'bg-rose-100 text-rose-700 border-rose-300',
    color: 'rose',
    icon: '🚨'
  },
  [SUGGESTION_PRIORITY.HIGH]: {
    text: '高优先级',
    class: 'bg-orange-100 text-orange-700 border-orange-300',
    color: 'orange',
    icon: '⚠️'
  },
  [SUGGESTION_PRIORITY.MEDIUM]: {
    text: '中优先级',
    class: 'bg-amber-100 text-amber-700 border-amber-300',
    color: 'amber',
    icon: 'ℹ️'
  },
  [SUGGESTION_PRIORITY.LOW]: {
    text: '低优先级',
    class: 'bg-blue-100 text-blue-700 border-blue-300',
    color: 'blue',
    icon: '💡'
  }
}
