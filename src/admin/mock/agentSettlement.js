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
    sourceDetailCount: 128,
    invitedUserCount: 43,
    rechargeAmount: 58200,
    tradeFeeAmount: 2134.56,
    autoCredit: true,
    status: ST.COMPLETED,
    lockedAt: '2026-04-01 00:05',
    reviewedAt: null,
    completedAt: '2026-04-01 00:06',
    creditTxnId: 'TXN-AG-202604051422-100001'
  },
  {
    id: 'as-100001-202604',
    batchNo: 'AC-202604-100001',
    period: '2026-04',
    agentUid: 100001,
    agentEmail: 'zhang@example.com',
    agentName: 'agent_zhang',
    amount: 8420.55,
    sourceDetailCount: 156,
    invitedUserCount: 51,
    rechargeAmount: 76450,
    tradeFeeAmount: 3288.42,
    autoCredit: false,
    status: ST.PENDING_REVIEW,
    lockedAt: '2026-05-01 00:08',
    reviewedAt: null,
    completedAt: null,
    creditTxnId: null
  },
  {
    id: 'as-100002-202604',
    batchNo: 'AC-202604-100002',
    period: '2026-04',
    agentUid: 100002,
    agentEmail: 'wang@example.com',
    agentName: 'agent_wang',
    amount: 5120.4,
    sourceDetailCount: 93,
    invitedUserCount: 28,
    rechargeAmount: 42900,
    tradeFeeAmount: 1675.2,
    autoCredit: false,
    status: ST.PENDING_REVIEW,
    lockedAt: '2026-05-01 00:08',
    reviewedAt: null,
    completedAt: null,
    creditTxnId: null
  },
  {
    id: 'as-100004-202604',
    batchNo: 'AC-202604-100004',
    period: '2026-04',
    agentUid: 100004,
    agentEmail: 'zhao@example.com',
    agentName: 'agent_zhao',
    amount: 19880.0,
    sourceDetailCount: 241,
    invitedUserCount: 74,
    rechargeAmount: 210600,
    tradeFeeAmount: 9820.8,
    autoCredit: true,
    status: ST.COMPLETED,
    lockedAt: '2026-05-01 00:08',
    reviewedAt: null,
    completedAt: '2026-05-01 00:10',
    creditTxnId: 'TXN-AG-202605010010-100004'
  },
  {
    id: 'as-100002-202603',
    batchNo: 'AC-202603-100002',
    period: '2026-03',
    agentUid: 100002,
    agentEmail: 'wang@example.com',
    agentName: 'agent_wang',
    amount: 4890.0,
    sourceDetailCount: 86,
    invitedUserCount: 24,
    rechargeAmount: 38400,
    tradeFeeAmount: 1528.1,
    autoCredit: false,
    status: ST.COMPLETED,
    lockedAt: '2026-04-01 00:05',
    reviewedAt: '2026-04-02 09:00',
    completedAt: '2026-04-02 09:01',
    creditTxnId: 'TXN-AG-202604061010-100002'
  }
]

const detailTypeLabel = {
  deposit: '充值返佣',
  perpetual: '永续手续费返佣',
  spot: '现货手续费返佣',
  lending: '理财返佣',
  aiQuant: 'AI 量化返佣'
}

function buildDetailRows(batch) {
  const baseUsers = [
    { uid: 300018, email: 'invitee18@example.com' },
    { uid: 300024, email: 'invitee24@example.com' },
    { uid: 300031, email: 'invitee31@example.com' },
    { uid: 300046, email: 'invitee46@example.com' },
    { uid: 300052, email: 'invitee52@example.com' }
  ]
  const types = ['deposit', 'perpetual', 'spot', 'lending', 'aiQuant']
  return baseUsers.map((u, idx) => {
    const type = types[idx % types.length]
    const rate = type === 'deposit' ? 0.08 : type === 'perpetual' ? 0.12 : 0.06
    const baseAmount = Math.round((batch.amount / 4.8 + idx * 180.35) * 100) / 100
    return {
      id: `${batch.id}-d${idx + 1}`,
      occurredAt: `${batch.period}-${String(8 + idx * 3).padStart(2, '0')} ${String(10 + idx).padStart(2, '0')}:20`,
      invitedUid: u.uid,
      invitedEmail: u.email,
      type,
      typeLabel: detailTypeLabel[type],
      baseAmount,
      commissionRate: rate,
      commission: Math.round(baseAmount * rate * 100) / 100,
      sourceOrderNo: `${type.toUpperCase()}-${batch.period.replace('-', '')}-${u.uid}`
    }
  })
}

function normalizeUid(uid) {
  if (uid === null || uid === undefined || uid === '') return null
  const n = Number(uid)
  return Number.isFinite(n) ? n : null
}

function buildSteps(b) {
  const completed = b.status === ST.COMPLETED
  const steps = [
    { key: 'details', label: '返佣明细生成', at: b.lockedAt, done: !!b.lockedAt, current: false },
    { key: 'summary', label: '按结算配置汇总成单', at: b.lockedAt, done: !!b.lockedAt, current: false },
    {
      key: 'review',
      label: b.autoCredit ? '自动入账，无需审核' : '运营审核',
      at: b.reviewedAt,
      done: completed,
      current: !b.autoCredit && b.status === ST.PENDING_REVIEW,
      failed: false
    },
    {
      key: 'credit',
      label: '划转到代理账户',
      at: b.completedAt,
      txnId: b.creditTxnId,
      done: completed,
      current: false,
      skipped: false
    }
  ]
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
    if (b.status !== ST.PENDING_REVIEW) return { ok: false, message: '仅「待审核」可审核通过' }
    b.status = ST.COMPLETED
    b.reviewedAt = b.reviewedAt || nowStr()
    b.completedAt = b.completedAt || nowStr()
    b.creditTxnId = `TXN-AG-${String(b.completedAt).replace(/\D/g, '').slice(0, 12)}-${b.agentUid}`
    return { ok: true, message: '审核通过，佣金已划转至代理账户' }
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
      autoCompleted: settlementBatches.filter((b) => b.status === ST.COMPLETED && b.autoCredit).length,
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

  async listBatchDetails(batchId) {
    await sleep(160)
    const b = findBatch(batchId)
    if (!b) return { success: false, message: '记录不存在', data: { list: [] } }
    return { success: true, data: { batch: enrich(b), list: buildDetailRows(b) } }
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
