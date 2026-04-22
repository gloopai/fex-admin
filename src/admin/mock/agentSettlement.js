import {
  AGENT_SETTLEMENT_ACTION,
  AGENT_SETTLEMENT_STATUS
} from '../constants/agentSettlement'

const ST = AGENT_SETTLEMENT_STATUS

function sleep(ms = 220) {
  return new Promise((r) => setTimeout(r, ms))
}

function nowStr() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

/** 内存态：代理账期结算批次（演示用，刷新页面重置） */
let settlementBatches = [
  {
    id: 'as-100001-202603',
    batchNo: 'AC-202603-100001',
    period: '2026-03',
    agentUid: 100001,
    agentEmail: 'zhang@example.com',
    agentName: 'agent_zhang',
    amount: 6230.12,
    status: ST.COMPLETED,
    lockedAt: '2026-04-01 00:05',
    reviewedAt: '2026-04-02 10:12',
    payoutStartedAt: '2026-04-03 09:30',
    completedAt: '2026-04-05 14:22',
    creditTxnId: 'TXN-AG-202604051422-100001',
    rejectReason: null
  },
  {
    id: 'as-100001-202604',
    batchNo: 'AC-202604-100001',
    period: '2026-04',
    agentUid: 100001,
    agentEmail: 'zhang@example.com',
    agentName: 'agent_zhang',
    amount: 8420.55,
    status: ST.PENDING_REVIEW,
    lockedAt: '2026-05-01 00:08',
    reviewedAt: null,
    payoutStartedAt: null,
    completedAt: null,
    creditTxnId: null,
    rejectReason: null
  },
  {
    id: 'as-100002-202604',
    batchNo: 'AC-202604-100002',
    period: '2026-04',
    agentUid: 100002,
    agentEmail: 'wang@example.com',
    agentName: 'agent_wang',
    amount: 5120.4,
    status: ST.APPROVED,
    lockedAt: '2026-05-01 00:08',
    reviewedAt: '2026-05-01 11:20',
    payoutStartedAt: null,
    completedAt: null,
    creditTxnId: null,
    rejectReason: null
  },
  {
    id: 'as-100004-202604',
    batchNo: 'AC-202604-100004',
    period: '2026-04',
    agentUid: 100004,
    agentEmail: 'zhao@example.com',
    agentName: 'agent_zhao',
    amount: 19880.0,
    status: ST.PAYING,
    lockedAt: '2026-05-01 00:08',
    reviewedAt: '2026-05-01 10:05',
    payoutStartedAt: '2026-05-02 15:40',
    completedAt: null,
    creditTxnId: null,
    rejectReason: null
  },
  {
    id: 'as-100002-202603',
    batchNo: 'AC-202603-100002',
    period: '2026-03',
    agentUid: 100002,
    agentEmail: 'wang@example.com',
    agentName: 'agent_wang',
    amount: 4890.0,
    status: ST.COMPLETED,
    lockedAt: '2026-04-01 00:05',
    reviewedAt: '2026-04-02 09:00',
    payoutStartedAt: '2026-04-03 11:00',
    completedAt: '2026-04-06 10:10',
    creditTxnId: 'TXN-AG-202604061010-100002',
    rejectReason: null
  }
]

function normalizeUid(uid) {
  if (uid === null || uid === undefined || uid === '') return null
  const n = Number(uid)
  return Number.isFinite(n) ? n : null
}

function buildSteps(b) {
  const rejected = b.status === ST.REJECTED
  const completed = b.status === ST.COMPLETED
  const steps = [
    { key: 'lock', label: '账期汇总锁定', at: b.lockedAt, done: !!b.lockedAt, current: false },
    {
      key: 'review',
      label: '运营复核',
      at: b.reviewedAt,
      done: (!!b.reviewedAt && b.status !== ST.PENDING_REVIEW) || rejected,
      current: b.status === ST.PENDING_REVIEW,
      failed: rejected
    },
    {
      key: 'payout',
      label: '财务出款',
      at: b.payoutStartedAt,
      done: completed,
      current: b.status === ST.APPROVED || b.status === ST.PAYING,
      skipped: rejected
    },
    {
      key: 'credit',
      label: '佣金入账',
      at: b.completedAt,
      txnId: b.creditTxnId,
      done: completed,
      current: false,
      skipped: rejected
    }
  ]
  if (b.status === ST.PAYING) {
    steps[2].current = true
    steps[3].current = false
  }
  if (completed) {
    steps[2].done = true
    steps[2].current = false
    steps[3].current = false
  }
  if (rejected && b.rejectReason) {
    steps[1].note = b.rejectReason
  }
  return steps
}

function enrich(b) {
  return { ...b, steps: buildSteps(b) }
}

function filterBatches({ status, agentUid, keyword }) {
  let rows = [...settlementBatches]
  const uid = normalizeUid(agentUid)
  if (uid !== null) rows = rows.filter((r) => r.agentUid === uid)
  if (status && status !== 'all') rows = rows.filter((r) => r.status === status)
  if (keyword) {
    const k = String(keyword).trim().toLowerCase()
    rows = rows.filter(
      (r) =>
        r.batchNo.toLowerCase().includes(k) ||
        String(r.agentUid).includes(k) ||
        (r.agentEmail && r.agentEmail.toLowerCase().includes(k)) ||
        (r.agentName && r.agentName.toLowerCase().includes(k)) ||
        r.period.includes(k)
    )
  }
  rows.sort((a, b) => {
    if (a.period !== b.period) return b.period.localeCompare(a.period)
    return b.agentUid - a.agentUid
  })
  return rows
}

function findBatch(id) {
  return settlementBatches.find((b) => b.id === id) || null
}

function applyAction(batch, action) {
  const b = batch
  if (action === AGENT_SETTLEMENT_ACTION.APPROVE) {
    if (b.status !== ST.PENDING_REVIEW) return { ok: false, message: '仅「待复核」可操作通过' }
    b.status = ST.APPROVED
    b.reviewedAt = b.reviewedAt || nowStr()
    return { ok: true, message: '已复核通过，待财务出款' }
  }
  if (action === AGENT_SETTLEMENT_ACTION.REJECT) {
    if (b.status !== ST.PENDING_REVIEW) return { ok: false, message: '仅「待复核」可驳回' }
    b.status = ST.REJECTED
    b.reviewedAt = nowStr()
    b.rejectReason = b.rejectReason || '账期内存在异常交易，请联络渠道经理'
    return { ok: true, message: '已驳回该账期结算' }
  }
  if (action === AGENT_SETTLEMENT_ACTION.START_PAYOUT) {
    if (b.status !== ST.APPROVED) return { ok: false, message: '仅「已复核待出款」可发起出款' }
    b.status = ST.PAYING
    b.payoutStartedAt = nowStr()
    return { ok: true, message: '已标记为出款中' }
  }
  if (action === AGENT_SETTLEMENT_ACTION.MARK_COMPLETED) {
    if (b.status !== ST.PAYING) return { ok: false, message: '仅「出款中」可确认入账完成' }
    b.status = ST.COMPLETED
    b.completedAt = nowStr()
    b.creditTxnId = `TXN-AG-${String(b.completedAt).replace(/\D/g, '').slice(0, 12)}-${b.agentUid}`
    return { ok: true, message: '已确认佣金入账完成' }
  }
  return { ok: false, message: '未知操作' }
}

export const agentSettlementApi = {
  async listBatches(params = {}) {
    await sleep()
    const page = Math.max(1, Number(params.page) || 1)
    const pageSize = Math.min(50, Math.max(5, Number(params.pageSize) || 10))
    const all = filterBatches({
      status: params.status,
      agentUid: params.agentUid,
      keyword: params.searchKeyword
    })
    const total = all.length
    const start = (page - 1) * pageSize
    const list = all.slice(start, start + pageSize).map(enrich)
    const aggregates = {
      totalBatches: settlementBatches.length,
      pendingReview: settlementBatches.filter((b) => b.status === ST.PENDING_REVIEW).length,
      paying: settlementBatches.filter((b) => b.status === ST.PAYING).length,
      completed: settlementBatches.filter((b) => b.status === ST.COMPLETED).length,
      totalAmount: settlementBatches.reduce((s, b) => s + (Number(b.amount) || 0), 0)
    }
    return { success: true, data: { list, total, page, pageSize, aggregates } }
  },

  async listForAgent(agentUid) {
    await sleep(120)
    const uid = normalizeUid(agentUid)
    if (uid === null) return { success: true, data: { list: [] } }
    const list = filterBatches({ agentUid: uid }).map(enrich)
    return { success: true, data: { list } }
  },

  /** 代理概览卡片：取当前自然月账期批次状态（演示固定 2026-04） */
  async getCurrentPeriodSummary(agentUid) {
    await sleep(80)
    const uid = normalizeUid(agentUid)
    const period = '2026-04'
    if (uid === null) {
      return { success: true, data: { period, status: null, amount: null } }
    }
    const b = settlementBatches.find((x) => x.agentUid === uid && x.period === period)
    if (!b) {
      return { success: true, data: { period, status: null, amount: null } }
    }
    return {
      success: true,
      data: {
        period,
        status: b.status,
        amount: b.amount,
        batchNo: b.batchNo,
        nextSettlementDate: '2026-04-20'
      }
    }
  },

  async advanceBatch(batchId, action) {
    await sleep()
    const b = findBatch(batchId)
    if (!b) return { success: false, message: '记录不存在' }
    const r = applyAction(b, action)
    if (!r.ok) return { success: false, message: r.message }
    return { success: true, message: r.message, data: enrich(b) }
  },

  async batchAdvance(batchIds, action) {
    await sleep()
    const ids = Array.isArray(batchIds) ? batchIds : []
    if (!ids.length) return { success: false, message: '请选择记录' }
    let ok = 0
    const errors = []
    for (const id of ids) {
      const b = findBatch(id)
      if (!b) {
        errors.push(`${id}: 不存在`)
        continue
      }
      const r = applyAction(b, action)
      if (r.ok) ok += 1
      else errors.push(`${b.batchNo}: ${r.message}`)
    }
    return {
      success: errors.length === 0,
      message: `成功 ${ok} 条${errors.length ? `；${errors.join('；')}` : ''}`
    }
  }
}
