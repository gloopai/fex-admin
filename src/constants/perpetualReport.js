// 报表时间范围
export const REPORT_TIME_RANGE = {
  REALTIME: 'realtime',      // 实时
  TODAY: 'today',            // 今日
  YESTERDAY: 'yesterday',    // 昨日
  LAST_7_DAYS: 'last_7_days', // 近7天
  LAST_30_DAYS: 'last_30_days', // 近30天
  CUSTOM: 'custom'           // 自定义
}

// 报表时间范围选项
export const REPORT_TIME_RANGE_OPTIONS = [
  // { value: REPORT_TIME_RANGE.REALTIME, label: '实时' },
  { value: REPORT_TIME_RANGE.TODAY, label: '今日' },
  { value: REPORT_TIME_RANGE.YESTERDAY, label: '昨日' },
  { value: REPORT_TIME_RANGE.LAST_7_DAYS, label: '近7天' },
  { value: REPORT_TIME_RANGE.LAST_30_DAYS, label: '近30天' },
  { value: REPORT_TIME_RANGE.CUSTOM, label: '自定义' }
]

// 风险等级
export const RISK_LEVEL = {
  LOW: 'low',           // 低风险
  MEDIUM: 'medium',     // 中风险
  HIGH: 'high',         // 高风险
  CRITICAL: 'critical'  // 严重风险
}

// 风险等级配置
export const RISK_LEVEL_CONFIG = {
  [RISK_LEVEL.LOW]: {
    text: '低风险',
    class: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    color: 'emerald'
  },
  [RISK_LEVEL.MEDIUM]: {
    text: '中风险',
    class: 'bg-amber-100 text-amber-700 border-amber-200',
    color: 'amber'
  },
  [RISK_LEVEL.HIGH]: {
    text: '高风险',
    class: 'bg-orange-100 text-orange-700 border-orange-200',
    color: 'orange'
  },
  [RISK_LEVEL.CRITICAL]: {
    text: '严重风险',
    class: 'bg-rose-100 text-rose-700 border-rose-200',
    color: 'rose'
  }
}

// 报表指标类型
export const METRIC_TYPE = {
  POSITION: 'position',           // 持仓相关
  PNL: 'pnl',                    // 盈亏相关
  VOLUME: 'volume',              // 成交量相关
  RISK: 'risk',                  // 风险相关
  USER: 'user',                  // 用户相关
  CONTROL: 'control'             // 线控相关
}

// 持仓方向
export const POSITION_SIDE = {
  LONG: 'long',   // 多头
  SHORT: 'short'  // 空头
}

// 用户分类
export const USER_TYPE = {
  WHALE: 'whale',         // 大户
  ACTIVE: 'active',       // 活跃用户
  HIGH_FREQ: 'high_freq', // 高频交易
  NORMAL: 'normal'        // 普通用户
}

// 用户分类配置
export const USER_TYPE_CONFIG = {
  [USER_TYPE.WHALE]: {
    text: '大户',
    class: 'bg-purple-100 text-purple-700',
    icon: '🐋'
  },
  [USER_TYPE.ACTIVE]: {
    text: '活跃',
    class: 'bg-blue-100 text-blue-700',
    icon: '⚡'
  },
  [USER_TYPE.HIGH_FREQ]: {
    text: '高频',
    class: 'bg-orange-100 text-orange-700',
    icon: '🔥'
  },
  [USER_TYPE.NORMAL]: {
    text: '普通',
    class: 'bg-slate-100 text-slate-700',
    icon: '👤'
  }
}

// 风险评估标准
export const RISK_ASSESSMENT_CRITERIA = {
  [RISK_LEVEL.LOW]: {
    level: '低风险',
    description: '平台稳定盈利，市场状况良好',
    criteria: [
      { label: '平台盈亏率', range: '> 5%', desc: '平台稳定盈利，收益可观' },
      { label: '多空比', range: '0.9 - 1.1', desc: '多空平衡，风险对冲充分' },
      { label: '大户持仓占比', range: '< 15%', desc: '持仓分散，无集中风险' },
      { label: '用户盈利集中度', range: '< 40%', desc: '用户盈利分散，平台风险可控' },
      { label: '高杠杆持仓占比', range: '< 10%', desc: '低杠杆为主，爆仓风险小' }
    ],
    actions: [
      '保持现有线控策略，确保持续盈利',
      '适度放宽交易限制，吸引更多交易量',
      '优化用户体验，提升用户粘性',
      '关注市场趋势，提前布局潜在风险'
    ]
  },
  [RISK_LEVEL.MEDIUM]: {
    level: '中风险',
    description: '平台盈利收窄或出现小幅亏损，需加强管控',
    criteria: [
      { label: '平台盈亏率', range: '-5% - 5%', desc: '盈亏平衡附近，需加强线控' },
      { label: '多空比', range: '1.1 - 1.5 或 0.67 - 0.9', desc: '多空失衡，单边风险增加' },
      { label: '大户持仓占比', range: '15% - 25%', desc: '持仓集中度上升' },
      { label: '用户盈利集中度', range: '40% - 60%', desc: '少数用户盈利较多，平台承压' },
      { label: '高杠杆持仓占比', range: '10% - 20%', desc: '高杠杆持仓增加，风险上升' }
    ],
    actions: [
      '启动线控规则，调整价格偏移至盈利方向',
      '提高滑点，增加交易成本',
      '重点监控大户和高盈利用户动向',
      '增加成交延迟，为线控争取调整时间'
    ]
  },
  [RISK_LEVEL.HIGH]: {
    level: '高风险',
    description: '平台亏损明显，需立即采取强力措施',
    criteria: [
      { label: '平台盈亏率', range: '-10% - -5%', desc: '平台持续亏损，风险加剧' },
      { label: '多空比', range: '> 1.5 或 < 0.67', desc: '多空严重失衡，单边风险极大' },
      { label: '大户持仓占比', range: '25% - 40%', desc: '持仓高度集中于少数大户' },
      { label: '用户盈利集中度', range: '60% - 80%', desc: '少数用户赚走大部分利润' },
      { label: '高杠杆持仓占比', range: '20% - 35%', desc: '高杠杆盛行，爆仓难度大' }
    ],
    actions: [
      '立即启用强力线控，最大化价格偏移',
      '大幅提高滑点率',
      '限制高杠杆开仓，降低最大杠杆倍数',
      '针对大户和盈利用户增加交易摩擦',
      '考虑实施账户级别的交易限制',
      '密切关注资金流动，防止集中提币'
    ]
  },
  [RISK_LEVEL.CRITICAL]: {
    level: '严重风险',
    description: '平台面临严重亏损，需紧急止损',
    criteria: [
      { label: '平台盈亏率', range: '< -10%', desc: '平台严重亏损，资金安全受威胁' },
      { label: '多空比', range: '> 2.0 或 < 0.5', desc: '极端单边行情，对冲失效' },
      { label: '大户持仓占比', range: '> 40%', desc: '持仓极度集中，风险不可控' },
      { label: '用户盈利集中度', range: '> 80%', desc: '极少数用户掌控盈利' },
      { label: '高杠杆持仓占比', range: '> 35%', desc: '高杠杆泛滥，风险极高' }
    ],
    actions: [
      '紧急启用所有线控规则，不计代价止损',
      '最大化价格偏移和滑点',
      '暂停高风险合约交易或强制降低杠杆',
      '限制或冻结高风险账户交易权限',
      '主动联系大户协商平仓或对冲',
      '启动风控预案，必要时强平部分头寸',
      '暂停提币或设置提币风控审核',
      '向技术团队申请紧急支持'
    ]
  }
}
