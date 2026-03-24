export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  BANNED: 'banned'
}

export const USER_ROLE = {
  USER: 'user',
  AGENT: 'agent'
}

export const USER_KYC_STATUS = {
  NOT_VERIFIED: 'not_verified',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
}

export const USER_FILTER_ALL = 'all'

export const USER_STATUS_OPTIONS = [
  { value: USER_STATUS.ACTIVE, label: '活跃' },
  { value: USER_STATUS.INACTIVE, label: '不活跃' },
  { value: USER_STATUS.SUSPENDED, label: '暂停' },
  { value: USER_STATUS.BANNED, label: '禁用' }
]

export const USER_ROLE_OPTIONS = [
  { value: USER_ROLE.USER, label: '普通用户' },
  { value: USER_ROLE.AGENT, label: '代理' }
]

export const USER_KYC_STATUS_OPTIONS = [
  { value: USER_KYC_STATUS.NOT_VERIFIED, label: '未认证' },
  { value: USER_KYC_STATUS.PENDING, label: '审核中' },
  { value: USER_KYC_STATUS.VERIFIED, label: '已认证' },
  { value: USER_KYC_STATUS.REJECTED, label: '已拒绝' }
]

export const USER_TAG_RULE_STATUS = {
  ENABLED: 'enabled',
  DISABLED: 'disabled'
}

export const USER_TAG_RULE_MATCH_MODE = {
  ALL: 'all',
  ANY: 'any'
}

export const USER_TAG_RULE_STATUS_OPTIONS = [
  { value: USER_TAG_RULE_STATUS.ENABLED, label: '启用' },
  { value: USER_TAG_RULE_STATUS.DISABLED, label: '禁用' }
]
