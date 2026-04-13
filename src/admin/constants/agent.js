// 代理状态
export const AGENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
}

export const AGENT_STATUS_OPTIONS = [
  { value: AGENT_STATUS.ACTIVE, label: '激活', color: 'green' },
  { value: AGENT_STATUS.INACTIVE, label: '未激活', color: 'gray' },
  { value: AGENT_STATUS.SUSPENDED, label: '已暂停', color: 'red' }
]

// 代理等级
export const AGENT_LEVEL = {
  LEVEL_1: 'level_1',
  LEVEL_2: 'level_2',
  LEVEL_3: 'level_3',
  LEVEL_4: 'level_4',
  LEVEL_5: 'level_5'
}

/** 等级展示名（佣金比例由后台「代理等级佣金」配置或接口下发，见 DEFAULT_AGENT_LEVEL_COMMISSION_RATES） */
export const AGENT_LEVEL_OPTIONS = [
  { value: AGENT_LEVEL.LEVEL_1, label: '一级代理' },
  { value: AGENT_LEVEL.LEVEL_2, label: '二级代理' },
  { value: AGENT_LEVEL.LEVEL_3, label: '三级代理' },
  { value: AGENT_LEVEL.LEVEL_4, label: '四级代理' },
  { value: AGENT_LEVEL.LEVEL_5, label: '五级代理' }
]

/** 默认各等级佣金比例（0～1，与业务约定一致后可仅作种子数据） */
export const DEFAULT_AGENT_LEVEL_COMMISSION_RATES = {
  [AGENT_LEVEL.LEVEL_1]: 0.5,
  [AGENT_LEVEL.LEVEL_2]: 0.4,
  [AGENT_LEVEL.LEVEL_3]: 0.3,
  [AGENT_LEVEL.LEVEL_4]: 0.2,
  [AGENT_LEVEL.LEVEL_5]: 0.1
}

/** 将后台下发的比例与默认合并，供下拉展示「佣金比例」等 */
export function mergeAgentLevelCommissionOptions(ratesByLevel = {}) {
  const merged = { ...DEFAULT_AGENT_LEVEL_COMMISSION_RATES, ...ratesByLevel }
  return AGENT_LEVEL_OPTIONS.map((o) => ({
    ...o,
    commissionRate: merged[o.value] ?? 0
  }))
}

// 代理业绩类型
export const AGENT_PERFORMANCE_TYPE = {
  DEPOSIT: 'deposit',          // 充值
  TRADING: 'trading',           // 交易
  LENDING: 'lending',           // 理财
  AI_QUANT: 'ai_quant',         // AI量化
  PERIODIC: 'periodic'          // 周期产品
}

export const AGENT_PERFORMANCE_TYPE_OPTIONS = [
  { value: AGENT_PERFORMANCE_TYPE.DEPOSIT, label: '充值分销' },
  { value: AGENT_PERFORMANCE_TYPE.TRADING, label: '交易返佣' },
  { value: AGENT_PERFORMANCE_TYPE.LENDING, label: '理财返佣' },
  { value: AGENT_PERFORMANCE_TYPE.AI_QUANT, label: 'AI量化返佣' },
  { value: AGENT_PERFORMANCE_TYPE.PERIODIC, label: '周期产品返佣' }
]

// 表格列配置
export const AGENT_TABLE_COLUMNS = [
  { key: 'uid', label: 'UID', width: 120 },
  { key: 'username', label: '用户名', width: 150 },
  { key: 'email', label: '邮箱', width: 200 },
  { key: 'level', label: '代理等级', width: 120 },
  { key: 'status', label: '状态', width: 100 },
  { key: 'totalReferrals', label: '推荐人数', width: 120 },
  { key: 'totalCommission', label: '累计佣金（USDT）', width: 150 },
  { key: 'createdAt', label: '成为代理时间', width: 180 },
  { key: 'actions', label: '操作', width: 200, fixed: 'right' }
]
