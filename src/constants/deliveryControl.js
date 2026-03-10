// 自动规则触发类型
export const DELIVERY_RULE_TRIGGER_TYPE = {
  TRADE_COUNT: 'trade_count',           // 交易次数触发
  PROFIT_LOSS: 'profit_loss',           // 盈亏触发（累计盈亏）
  DAILY_PROFIT: 'daily_profit',         // 日盈利触发
  POSITION_VALUE: 'position_value',     // 持仓价值触发
  CONSECUTIVE_WINS: 'consecutive_wins', // 连续盈利触发
  CONSECUTIVE_LOSS: 'consecutive_loss', // 连续亏损触发
  NET_DEPOSIT: 'net_deposit'            // 净入金触发
}

// 自动规则执行动作
export const DELIVERY_RULE_ACTION = {
  PROFIT_CONTROL: 'profit_control',     // 盈亏控制（线控）- 核心
  FORCE_WIN: 'force_win',               // 强制盈利结算
  FORCE_LOSS: 'force_loss'              // 强制亏损结算
}

// 盈亏控制模式（线控）
export const PROFIT_CONTROL_MODE = {
  EXPECTED_VALUE: 'expected_value',     // 期望值控制（推荐）
  PROFIT_RATIO: 'profit_ratio',         // 盈亏比控制
  CUMULATIVE: 'cumulative',             // 累计盈亏控制
  STAGED: 'staged'                      // 阶段性策略（新用户让赚->老用户小亏）
}

// 盈亏调整策略
export const PROFIT_CONTROL_STRATEGY = {
  SETTLEMENT_PRICE: 'settlement_price', // 结算价格选择（主要方法）
  TIME_WINDOW: 'time_window',           // 时间窗口选择
  SLIPPAGE: 'slippage',                 // 滑点控制
  KLINE_OFFSET: 'kline_offset'          // K线显示偏移
}

// 自动规则执行动作配置
export const DELIVERY_RULE_ACTION_CONFIG = {
  [DELIVERY_RULE_ACTION.PROFIT_CONTROL]: {
    text: '盈亏控制',
    class: 'bg-blue-100 text-blue-700',
    color: 'blue'
  },
  [DELIVERY_RULE_ACTION.FORCE_WIN]: {
    text: '强制盈利',
    class: 'bg-emerald-100 text-emerald-700',
    color: 'emerald'
  },
  [DELIVERY_RULE_ACTION.FORCE_LOSS]: {
    text: '强制亏损',
    class: 'bg-rose-100 text-rose-700',
    color: 'rose'
  }
}

// 规则状态
export const DELIVERY_RULE_STATUS = {
  ENABLED: 'enabled',
  DISABLED: 'disabled',
  PAUSED: 'paused'
}

// 规则优先级
export const DELIVERY_RULE_PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
}

// 时间周期
export const DELIVERY_RULE_TIME_PERIOD = {
  REAL_TIME: 'real_time',
  LAST_1H: 'last_1h',
  LAST_4H: 'last_4h',
  LAST_24H: 'last_24h',
  TODAY: 'today',
  LAST_7D: 'last_7d'
}

// 用户风险等级
export const USER_RISK_LEVEL = {
  VERY_HIGH: 'very_high',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  SAFE: 'safe'
}
