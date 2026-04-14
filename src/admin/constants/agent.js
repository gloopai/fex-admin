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

/** 后台仅一种代理身份，无多级「代理等级」；记佣字段见 constants/agentCommission.js（与裂变独立） */
export const AGENT_ROLE_LABEL = '代理'

// 代理业绩类型
export const AGENT_PERFORMANCE_TYPE = {
  DEPOSIT: 'deposit',
  TRADING: 'trading',
  LENDING: 'lending',
  AI_QUANT: 'ai_quant',
  PERIODIC: 'periodic'
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
  { key: 'status', label: '状态', width: 100 },
  { key: 'totalReferrals', label: '推荐人数', width: 120 },
  { key: 'totalCommission', label: '累计佣金（USDT）', width: 150 },
  { key: 'createdAt', label: '成为代理时间', width: 180 },
  { key: 'actions', label: '操作', width: 240, fixed: 'right' }
]
