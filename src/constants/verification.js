// 认证等级
export const VERIFICATION_LEVEL = {
  NONE: 'none',
  BASIC: 'basic',
  ADVANCED: 'advanced'
}

// 认证等级选项
export const VERIFICATION_LEVEL_OPTIONS = [
  { value: VERIFICATION_LEVEL.NONE, label: '未认证' },
  { value: VERIFICATION_LEVEL.BASIC, label: '普通认证' },
  { value: VERIFICATION_LEVEL.ADVANCED, label: '高级认证' }
]

// 认证审核状态
export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  RESUBMIT: 'resubmit'
}

// 认证审核状态选项
export const VERIFICATION_STATUS_OPTIONS = [
  { value: VERIFICATION_STATUS.PENDING, label: '待审核' },
  { value: VERIFICATION_STATUS.APPROVED, label: '已通过' },
  { value: VERIFICATION_STATUS.REJECTED, label: '已拒绝' },
  { value: VERIFICATION_STATUS.RESUBMIT, label: '需补件' }
]

// 认证文件类型
export const VERIFICATION_DOC_TYPE = {
  ID_CARD: 'id_card',
  ID_CARD_HOLD: 'id_card_hold',
  INCOME_PROOF: 'income_proof',
  BANK_STATEMENT: 'bank_statement',
  ADDRESS_PROOF: 'address_proof'
}

// 认证文件类型选项
export const VERIFICATION_DOC_TYPE_OPTIONS = [
  { value: VERIFICATION_DOC_TYPE.ID_CARD, label: '身份证件' },
  { value: VERIFICATION_DOC_TYPE.ID_CARD_HOLD, label: '手持身份证' },
  { value: VERIFICATION_DOC_TYPE.INCOME_PROOF, label: '收入证明' },
  { value: VERIFICATION_DOC_TYPE.BANK_STATEMENT, label: '银行流水' },
  { value: VERIFICATION_DOC_TYPE.ADDRESS_PROOF, label: '地址证明' }
]

// 权限类型
export const PERMISSION_TYPE = {
  DEPOSIT: 'deposit',
  TRADE: 'trade',
  WITHDRAW: 'withdraw'
}

// 权限类型选项
export const PERMISSION_TYPE_OPTIONS = [
  { value: PERMISSION_TYPE.DEPOSIT, label: '入金' },
  { value: PERMISSION_TYPE.TRADE, label: '交易' },
  { value: PERMISSION_TYPE.WITHDRAW, label: '提币' }
]

// 日志操作类型
export const LOG_ACTION_TYPE = {
  CONFIG_UPDATE: 'config_update',
  AUDIT_APPROVED: 'audit_approved',
  AUDIT_REJECTED: 'audit_rejected',
  AUDIT_RESUBMIT: 'audit_resubmit',
  LEVEL_UPGRADE: 'level_upgrade',
  LEVEL_DOWNGRADE: 'level_downgrade'
}

// 日志操作类型选项
export const LOG_ACTION_TYPE_OPTIONS = [
  { value: LOG_ACTION_TYPE.CONFIG_UPDATE, label: '配置更新' },
  { value: LOG_ACTION_TYPE.AUDIT_APPROVED, label: '审核通过' },
  { value: LOG_ACTION_TYPE.AUDIT_REJECTED, label: '审核拒绝' },
  { value: LOG_ACTION_TYPE.AUDIT_RESUBMIT, label: '要求补件' },
  { value: LOG_ACTION_TYPE.LEVEL_UPGRADE, label: '等级升级' },
  { value: LOG_ACTION_TYPE.LEVEL_DOWNGRADE, label: '等级降级' }
]
