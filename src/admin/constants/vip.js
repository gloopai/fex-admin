export const VIP_LEVEL_STATUS = {
  ENABLED: 'enabled',
  DISABLED: 'disabled'
}

export const VIP_STATUS_OPTIONS = [
  { value: VIP_LEVEL_STATUS.ENABLED, label: '启用' },
  { value: VIP_LEVEL_STATUS.DISABLED, label: '禁用' }
]

// VIP升级原因
export const VIP_UPGRADE_REASON = {
  CREDIT_SCORE: 'credit_score',   // 信用分达标
  RECHARGE: 'recharge',           // 充值升级
  MANUAL: 'manual'                // 手动升级
}

// VIP升级原因选项
export const VIP_UPGRADE_REASON_OPTIONS = [
  { value: VIP_UPGRADE_REASON.CREDIT_SCORE, label: '信用分达标' },
  { value: VIP_UPGRADE_REASON.RECHARGE, label: '充值升级' },
  { value: VIP_UPGRADE_REASON.MANUAL, label: '手动升级' }
]
