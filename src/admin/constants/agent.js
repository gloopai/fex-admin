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

// 代理申请状态
export const AGENT_APPLICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
}

export const AGENT_APPLICATION_STATUS_OPTIONS = [
  { value: AGENT_APPLICATION_STATUS.PENDING, label: '待审核', color: 'yellow' },
  { value: AGENT_APPLICATION_STATUS.APPROVED, label: '已通过', color: 'green' },
  { value: AGENT_APPLICATION_STATUS.REJECTED, label: '已拒绝', color: 'red' }
]

// 代理等级
export const AGENT_LEVEL = {
  LEVEL_1: 'level_1',
  LEVEL_2: 'level_2',
  LEVEL_3: 'level_3',
  LEVEL_4: 'level_4',
  LEVEL_5: 'level_5'
}

export const AGENT_LEVEL_OPTIONS = [
  { value: AGENT_LEVEL.LEVEL_1, label: '一级代理', commissionRate: 0.5 },
  { value: AGENT_LEVEL.LEVEL_2, label: '二级代理', commissionRate: 0.4 },
  { value: AGENT_LEVEL.LEVEL_3, label: '三级代理', commissionRate: 0.3 },
  { value: AGENT_LEVEL.LEVEL_4, label: '四级代理', commissionRate: 0.2 },
  { value: AGENT_LEVEL.LEVEL_5, label: '五级代理', commissionRate: 0.1 }
]

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

export const AGENT_APPLICATION_TABLE_COLUMNS = [
  { key: 'uid', label: 'UID', width: 120 },
  { key: 'username', label: '用户名', width: 150 },
  { key: 'email', label: '邮箱', width: 200 },
  { key: 'phone', label: '手机号', width: 150 },
  { key: 'reason', label: '申请理由', width: 250 },
  { key: 'status', label: '状态', width: 100 },
  { key: 'appliedAt', label: '申请时间', width: 180 },
  { key: 'actions', label: '操作', width: 150, fixed: 'right' }
]
