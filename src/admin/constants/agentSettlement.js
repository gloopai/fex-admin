/** 代理佣金账期结算（运营侧流程，与裂变单笔分佣不同） */

export const AGENT_SETTLEMENT_STATUS = {
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  PAYING: 'paying',
  COMPLETED: 'completed',
  REJECTED: 'rejected'
}

export const AGENT_SETTLEMENT_STATUS_OPTIONS = [
  { value: 'all', label: '全部', color: 'gray' },
  {
    value: AGENT_SETTLEMENT_STATUS.PENDING_REVIEW,
    label: '待复核',
    color: 'yellow',
    badgeClass: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200'
  },
  {
    value: AGENT_SETTLEMENT_STATUS.APPROVED,
    label: '已复核待出款',
    color: 'blue',
    badgeClass: 'bg-blue-50 text-blue-800 ring-1 ring-inset ring-blue-200'
  },
  {
    value: AGENT_SETTLEMENT_STATUS.PAYING,
    label: '出款中',
    color: 'blue',
    badgeClass: 'bg-indigo-50 text-indigo-800 ring-1 ring-inset ring-indigo-200'
  },
  {
    value: AGENT_SETTLEMENT_STATUS.COMPLETED,
    label: '已结算',
    color: 'green',
    badgeClass: 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200'
  },
  {
    value: AGENT_SETTLEMENT_STATUS.REJECTED,
    label: '已驳回',
    color: 'red',
    badgeClass: 'bg-red-50 text-red-800 ring-1 ring-inset ring-red-200'
  }
]

/** 管理后台可操作 */
export const AGENT_SETTLEMENT_ACTION = {
  APPROVE: 'approve',
  REJECT: 'reject',
  START_PAYOUT: 'start_payout',
  MARK_COMPLETED: 'mark_completed'
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
    [AGENT_SETTLEMENT_STATUS.PENDING_REVIEW]: '待运营复核',
    [AGENT_SETTLEMENT_STATUS.APPROVED]: '待财务出款',
    [AGENT_SETTLEMENT_STATUS.PAYING]: '出款处理中',
    [AGENT_SETTLEMENT_STATUS.COMPLETED]: '本期已入账',
    [AGENT_SETTLEMENT_STATUS.REJECTED]: '本期已驳回'
  }
  return map[status] || '—'
}
