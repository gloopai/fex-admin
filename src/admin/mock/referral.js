import {
  REFERRAL_MAX_LEVELS,
  REFERRAL_TYPE,
  COMMISSION_STATUS,
  DEFAULT_REFERRAL_CONFIG,
  REFERRAL_COMMISSION_CREDIT_TO,
  REFERRAL_SETTLEMENT_CYCLE,
  normalizeReferralSettlementTimeLocal,
  getReferralCreditToLabel,
  getReferralSettlementCycleLabel,
  getReferralSettlementScheduleLine,
  getReferralSettlementNotifyLine,
  getReferralSettlementNotifyShort
} from '../constants/referral'

const VALID_REFERRAL_CREDIT_TO = new Set(Object.values(REFERRAL_COMMISSION_CREDIT_TO))

function formatCompletedAt() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100
}

function computeCommissionAggregates(list) {
  let pendingCount = 0
  let completedCount = 0
  let totalCommission = 0
  let completedCommission = 0
  for (const r of list) {
    const c = Number(r.commission) || 0
    totalCommission += c
    switch (r.status) {
      case COMMISSION_STATUS.PENDING:
        pendingCount++
        break
      case COMMISSION_STATUS.COMPLETED:
        completedCount++
        completedCommission += c
        break
      default:
        break
    }
  }
  return {
    totalRecords: list.length,
    pendingCount,
    completedCount,
    totalCommission: round2(totalCommission),
    completedCommission: round2(completedCommission)
  }
}

function enrichCommissionRecord(record, cfg) {
  const creditKey = record.appliedCreditTo ?? cfg.referralCommissionCreditTo
  const cycleKey = record.appliedSettlementCycle ?? cfg.referralSettlementCycle

  return {
    ...record,
    _settlement: {
      creditLabel: getReferralCreditToLabel(creditKey),
      settlementCycleLabel: getReferralSettlementCycleLabel(cycleKey),
      settlementScheduleLabel: getReferralSettlementScheduleLine(cfg),
      settlementNotifyShort: getReferralSettlementNotifyShort(cfg),
      creditTxnId: record.creditTxnId ?? record.mockCreditTxnId ?? null
    }
  }
}

function buildExecuteSuccessMessage(cfg, rec) {
  const credit = getReferralCreditToLabel(cfg.referralCommissionCreditTo)
  const time = normalizeReferralSettlementTimeLocal(cfg.referralSettlementTimeLocal)
  return `发放成功，已入账「${credit}」（每自然日，${time} 日切）。流水号：${rec.creditTxnId}。`
}

const COMMISSION_RATE_KEYS = [
  'depositCommissionRates',
  'perpetualCommissionRates',
  'deliveryCommissionRates',
  'spotCommissionRates',
  'aiQuantCommissionRates',
  'lendingCommissionRates',
  'borrowingCommissionRates'
]

/** 将任意旧格式规范为恰好三级比例（超出部分丢弃，不足补 0） */
export function normalizeCommissionRatesTriple(val) {
  const parts = String(val ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s !== '')
  const nums = []
  for (let i = 0; i < REFERRAL_MAX_LEVELS; i++) {
    if (i < parts.length) {
      const n = parseFloat(parts[i])
      nums.push(Number.isFinite(n) && n >= 0 && n <= 1 ? n : 0)
    } else {
      nums.push(0)
    }
  }
  return nums.join(',')
}

/** 合并默认、迁移旧版 periodic → delivery、补齐布尔开关；比例固定三级 */
export function normalizeReferralConfig(raw) {
  const o = { ...DEFAULT_REFERRAL_CONFIG, ...(raw && typeof raw === 'object' ? raw : {}) }
  const legacy = o.periodicCommissionRates
  if (
    (!o.deliveryCommissionRates || !String(o.deliveryCommissionRates).trim()) &&
    typeof legacy === 'string' &&
    legacy.trim()
  ) {
    o.deliveryCommissionRates = legacy
  }
  const boolKeys = [
    'commissionDepositEnabled',
    'commissionPerpetualEnabled',
    'commissionDeliveryEnabled',
    'commissionSpotEnabled',
    'commissionAiQuantEnabled',
    'commissionLendingEnabled',
    'commissionBorrowingEnabled'
  ]
  for (const k of boolKeys) {
    if (typeof o[k] !== 'boolean') o[k] = DEFAULT_REFERRAL_CONFIG[k]
  }
  if (!VALID_REFERRAL_CREDIT_TO.has(o.referralCommissionCreditTo)) {
    o.referralCommissionCreditTo = DEFAULT_REFERRAL_CONFIG.referralCommissionCreditTo
  }
  o.referralSettlementCycle = REFERRAL_SETTLEMENT_CYCLE.CALENDAR_DAY
  o.referralSettlementTimeLocal = normalizeReferralSettlementTimeLocal(o.referralSettlementTimeLocal)
  const notifyKeys = [
    'referralNotifyAfterSettlementEmail',
    'referralNotifyAfterSettlementSite',
    'referralNotifyAfterSettlementSms'
  ]
  for (const k of notifyKeys) {
    o[k] = o[k] === true
  }
  if ('referralWithdrawMode' in o) delete o.referralWithdrawMode
  if ('periodicCommissionRates' in o) delete o.periodicCommissionRates
  for (const k of COMMISSION_RATE_KEYS) {
    if (k in o) {
      o[k] = normalizeCommissionRatesTriple(o[k])
    }
  }
  return o
}

export const mockReferralConfig = normalizeReferralConfig({})

// 模拟分佣记录
export const mockCommissionRecords = [
  {
    id: 'COM20260308001',
    agentUid: 100001,
    agentUsername: 'agent_zhang',
    referralUid: 300001,
    referralUsername: 'user_test1',
    type: REFERRAL_TYPE.DEPOSIT,
    level: 1,
    amount: 1000.00,
    commissionRate: 0.1,
    commission: 100.00,
    status: COMMISSION_STATUS.COMPLETED,
    createdAt: '2026-03-08 10:30:00',
    completedAt: '2026-03-08 10:31:00'
  },
  {
    id: 'COM20260308002',
    agentUid: 100001,
    agentUsername: 'agent_zhang',
    referralUid: 300002,
    referralUsername: 'user_test2',
    type: REFERRAL_TYPE.AI_QUANT,
    level: 1,
    amount: 5000.00,
    commissionRate: 0.08,
    commission: 400.00,
    status: COMMISSION_STATUS.COMPLETED,
    createdAt: '2026-03-08 11:20:00',
    completedAt: '2026-03-08 11:21:00'
  },
  {
    id: 'COM20260308003',
    agentUid: 100002,
    agentUsername: 'agent_wang',
    referralUid: 300003,
    referralUsername: 'user_test3',
    type: REFERRAL_TYPE.LENDING,
    level: 1,
    amount: 2000.00,
    commissionRate: 0.06,
    commission: 120.00,
    status: COMMISSION_STATUS.PENDING,
    createdAt: '2026-03-08 14:15:00',
    completedAt: null
  },
  {
    id: 'COM20260308004',
    agentUid: 100001,
    agentUsername: 'agent_zhang',
    referralUid: 300001,
    referralUsername: 'user_test1',
    type: REFERRAL_TYPE.DEPOSIT,
    level: 2,
    amount: 800.00,
    commissionRate: 0.05,
    commission: 40.00,
    status: COMMISSION_STATUS.PENDING,
    createdAt: '2026-03-08 15:30:00',
    completedAt: null
  },
  {
    id: 'COM20260307001',
    agentUid: 100004,
    agentUsername: 'agent_zhao',
    referralUid: 300005,
    referralUsername: 'user_test5',
    type: REFERRAL_TYPE.PERIODIC,
    level: 1,
    amount: 3000.00,
    commissionRate: 0.07,
    commission: 210.00,
    status: COMMISSION_STATUS.COMPLETED,
    createdAt: '2026-03-07 09:00:00',
    completedAt: '2026-03-07 09:01:00'
  },
  {
    id: 'COM20260307002',
    agentUid: 100002,
    agentUsername: 'agent_wang',
    referralUid: 300006,
    referralUsername: 'user_test6',
    type: REFERRAL_TYPE.DEPOSIT,
    level: 1,
    amount: 1500.00,
    commissionRate: 0.1,
    commission: 150.00,
    status: COMMISSION_STATUS.PENDING,
    createdAt: '2026-03-07 16:20:00',
    completedAt: null
  }
]

// 模拟分销统计数据
export const mockReferralStats = {
  today: {
    totalCommission: 3520.80,
    totalOrders: 45,
    avgCommission: 78.24,
    completedOrders: 32
  },
  yesterday: {
    totalCommission: 4180.50,
    totalOrders: 58,
    avgCommission: 72.08,
    completedOrders: 52
  },
  week: {
    totalCommission: 28450.30,
    totalOrders: 356,
    avgCommission: 79.92,
    completedOrders: 312
  },
  month: {
    totalCommission: 98450.30,
    totalOrders: 1245,
    avgCommission: 79.08,
    completedOrders: 1098
  },
  all: {
    totalCommission: 1256780.50,
    totalOrders: 15678,
    avgCommission: 80.15,
    completedOrders: 14234
  },
  byType: [
    { type: REFERRAL_TYPE.DEPOSIT, count: 5678, commission: 456780.50, rate: 36.3 },
    { type: REFERRAL_TYPE.AI_QUANT, count: 4567, commission: 380450.30, rate: 30.3 },
    { type: REFERRAL_TYPE.LENDING, count: 3234, commission: 280340.20, rate: 22.3 },
    { type: REFERRAL_TYPE.PERIODIC, count: 2199, commission: 139209.50, rate: 11.1 }
  ],
  byLevel: [
    { level: 1, count: 8234, commission: 780450.3, rate: 62.1 },
    { level: 2, count: 4567, commission: 320180.2, rate: 25.5 },
    { level: 3, count: 2877, commission: 156150.0, rate: 12.4 }
  ],
  topAgents: [
    { uid: 100004, username: 'agent_zhao', commission: 18760.40, orders: 201 },
    { uid: 100001, username: 'agent_zhang', commission: 12580.50, orders: 156 },
    { uid: 100002, username: 'agent_wang', commission: 8450.80, orders: 89 },
    { uid: 100005, username: 'agent_sun', commission: 4520.10, orders: 45 },
    { uid: 100003, username: 'agent_li', commission: 2340.20, orders: 23 }
  ]
}

// 模拟分销层级数据
export const mockReferralTree = (agentUid) => {
  return {
    agentUid: agentUid,
    levels: [
      {
        level: 1,
        users: [
          { uid: 300001, username: 'user_test1', joinedAt: '2026-01-15', orders: 12, commission: 450.00 },
          { uid: 300002, username: 'user_test2', joinedAt: '2026-01-20', orders: 8, commission: 320.00 },
          { uid: 300003, username: 'user_test3', joinedAt: '2026-02-01', orders: 15, commission: 580.00 }
        ]
      },
      {
        level: 2,
        users: [
          { uid: 300010, username: 'user_test10', joinedAt: '2026-01-25', orders: 5, commission: 180.00 },
          { uid: 300011, username: 'user_test11', joinedAt: '2026-02-10', orders: 7, commission: 240.00 }
        ]
      },
      {
        level: 3,
        users: [
          { uid: 300020, username: 'user_test20', joinedAt: '2026-02-15', orders: 3, commission: 90.00 }
        ]
      }
    ]
  }
}

// 模拟更多分佣记录数据以便测试分页
const generateMockCommissionRecords = () => {
  const records = [...mockCommissionRecords]
  for (let i = 7; i <= 25; i++) {
    const amount = Math.floor(Math.random() * 5000) + 100
    const rate = 0.1
    const status = i % 3 === 0 ? COMMISSION_STATUS.PENDING : COMMISSION_STATUS.COMPLETED
    records.push({
      id: `COM2026030${Math.floor(Math.random() * 9) + 1}${i.toString().padStart(3, '0')}`,
      agentUid: 100000 + (i % 5 + 1),
      agentUsername: `agent_user_${i % 5 + 1}`,
      referralUid: 300000 + i,
      referralUsername: `user_test${i}`,
      type: Object.values(REFERRAL_TYPE)[Math.floor(Math.random() * Object.values(REFERRAL_TYPE).length)],
      level: Math.floor(Math.random() * 3) + 1,
      amount: amount,
      commissionRate: rate,
      commission: amount * rate,
      status,
      createdAt: `2026-03-08 ${Math.floor(Math.random() * 23).toString().padStart(2, '0')}:30:00`,
      completedAt: status === COMMISSION_STATUS.COMPLETED ? `2026-03-08 ${Math.floor(Math.random() * 23).toString().padStart(2, '0')}:45:00` : null
    })
  }
  return records
}

const extendedCommissionRecords = generateMockCommissionRecords()

// API 模拟函数
export const referralApi = {
  // 获取分销配置
  getReferralConfig: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = normalizeReferralConfig(mockReferralConfig)
        Object.assign(mockReferralConfig, data)
        resolve({
          success: true,
          data: { ...data }
        })
      }, 300)
    })
  },

  // 更新分销配置
  updateReferralConfig: (config) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const next = normalizeReferralConfig(config)
        Object.assign(mockReferralConfig, next)
        resolve({
          success: true,
          message: '配置已保存'
        })
      }, 500)
    })
  },

  // 获取分佣记录列表
  getCommissionRecords: (params) => {
    const { page = 1, pageSize = 10, searchKeyword = '', status = 'all', type = 'all', level = 'all' } = params
    
    return new Promise((resolve) => {
      setTimeout(() => {
        let list = [...extendedCommissionRecords]
        
        // 搜索关键词
        if (searchKeyword.trim()) {
          const keyword = searchKeyword.toLowerCase()
          list = list.filter(record => 
            record.id.toLowerCase().includes(keyword) ||
            record.agentUsername.toLowerCase().includes(keyword) ||
            record.referralUsername.toLowerCase().includes(keyword) ||
            record.agentUid.toString().includes(keyword)
          )
        }
        
        // 状态筛选
        if (status !== 'all') {
          list = list.filter(record => record.status === status)
        }
        
        // 类型筛选
        if (type !== 'all') {
          list = list.filter(record => record.type === type)
        }
        
        // 层级筛选
        if (level !== 'all') {
          list = list.filter(record => record.level === parseInt(level))
        }

        const total = list.length
        const start = (page - 1) * pageSize
        const end = start + pageSize
        const cfg = normalizeReferralConfig(mockReferralConfig)
        const aggregates = computeCommissionAggregates(list)
        const paginatedList = list
          .slice(start, end)
          .map((r) => enrichCommissionRecord(r, cfg))

        resolve({
          success: true,
          data: {
            list: paginatedList,
            total,
            page,
            pageSize,
            aggregates,
            settlementGlobal: {
              referralCommissionCreditTo: cfg.referralCommissionCreditTo,
              creditLabel: getReferralCreditToLabel(cfg.referralCommissionCreditTo),
              referralSettlementCycle: cfg.referralSettlementCycle,
              referralSettlementTimeLocal: cfg.referralSettlementTimeLocal,
              referralNotifyAfterSettlementEmail: cfg.referralNotifyAfterSettlementEmail,
              referralNotifyAfterSettlementSite: cfg.referralNotifyAfterSettlementSite,
              referralNotifyAfterSettlementSms: cfg.referralNotifyAfterSettlementSms,
              settlementCycleLabel: getReferralSettlementCycleLabel(cfg.referralSettlementCycle),
              settlementScheduleLabel: getReferralSettlementScheduleLine(cfg),
              settlementNotifyLine: getReferralSettlementNotifyLine(cfg),
              settlementNotifyShort: getReferralSettlementNotifyShort(cfg)
            }
          }
        })
      }, 300)
    })
  },

  // 获取分销统计
  getReferralStats: (period = 'all') => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: mockReferralStats
        })
      }, 300)
    })
  },

  // 获取分销层级树
  getReferralTree: (agentUid) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: mockReferralTree(agentUid)
        })
      }, 300)
    })
  },

  // 手动执行分佣：写入入账快照与调账流水号
  executeCommission: (recordId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const rec = extendedCommissionRecords.find((r) => r.id === recordId)
        if (!rec) {
          resolve({ success: false, message: '未找到该分佣记录' })
          return
        }
        if (rec.status !== COMMISSION_STATUS.PENDING) {
          resolve({ success: false, message: '仅「待发放」状态可执行' })
          return
        }
        const cfg = normalizeReferralConfig(mockReferralConfig)
        rec.status = COMMISSION_STATUS.COMPLETED
        rec.completedAt = formatCompletedAt()
        rec.appliedCreditTo = cfg.referralCommissionCreditTo
        rec.appliedSettlementCycle = cfg.referralSettlementCycle
        rec.creditTxnId = `RF-CR-${Date.now()}`
        resolve({
          success: true,
          message: buildExecuteSuccessMessage(cfg, rec),
          data: { recordId, creditTxnId: rec.creditTxnId }
        })
      }, 450)
    })
  },

  // 批量发放分佣
  batchExecuteCommission: (recordIds) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const cfg = normalizeReferralConfig(mockReferralConfig)
        let n = 0
        const txns = []
        for (const id of recordIds) {
          const rec = extendedCommissionRecords.find((r) => r.id === id)
          if (
            !rec ||
            rec.status !== COMMISSION_STATUS.PENDING
          ) {
            continue
          }
          rec.status = COMMISSION_STATUS.COMPLETED
          rec.completedAt = formatCompletedAt()
          rec.appliedCreditTo = cfg.referralCommissionCreditTo
          rec.appliedSettlementCycle = cfg.referralSettlementCycle
          rec.creditTxnId = `RF-CR-${Date.now()}-${n}`
          txns.push(rec.creditTxnId)
          n++
        }
        const credit = getReferralCreditToLabel(cfg.referralCommissionCreditTo)
        const time = normalizeReferralSettlementTimeLocal(cfg.referralSettlementTimeLocal)
        const preview = txns.slice(0, 2).join('、')
        resolve({
          success: true,
          message:
            n > 0
              ? `已批量发放 ${n} 笔，入账「${credit}」（每自然日 ${time} 日切）。流水号示例：${preview}${txns.length > 2 ? '…' : ''}`
              : '没有可执行的记录（需为待发放状态）',
          data: { count: n, creditTxnIds: txns }
        })
      }, 600)
    })
  }
}
