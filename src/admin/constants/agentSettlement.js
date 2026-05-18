/** 代理佣金账期结算（运营侧流程，与裂变单笔分佣不同） */

export const AGENT_SETTLEMENT_STATUS = {
  PENDING_REVIEW: 'pending_review',
  COMPLETED: 'completed'
}

export const AGENT_SETTLEMENT_STATUS_OPTIONS = [
  { value: 'all', label: '全部', color: 'gray' },
  {
    value: AGENT_SETTLEMENT_STATUS.PENDING_REVIEW,
    label: '待审核',
    color: 'yellow',
    badgeClass: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200'
  },
  {
    value: AGENT_SETTLEMENT_STATUS.COMPLETED,
    label: '已入账',
    color: 'green',
    badgeClass: 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200'
  }
]

/** 管理后台可操作 */
export const AGENT_SETTLEMENT_ACTION = {
  APPROVE: 'approve'
}

const STATUS_LABEL_MAP = Object.fromEntries(
  AGENT_SETTLEMENT_STATUS_OPTIONS.filter((o) => o.value !== 'all').map((o) => [o.value, o.label])
)

export function agentSettlementStatusLabel(status) {
  return STATUS_LABEL_MAP[status] || status
}

/** 代理端当前账期一句话状态（与后台状态对应） */
export function agentPortalSettlementHeadline(status) {
  const map = {
    [AGENT_SETTLEMENT_STATUS.PENDING_REVIEW]: '待运营审核',
    [AGENT_SETTLEMENT_STATUS.COMPLETED]: '本期已入账'
  }
  return map[status] || '—'
}
