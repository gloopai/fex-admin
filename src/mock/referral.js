import { REFERRAL_TYPE, COMMISSION_STATUS } from '../constants/referral'

// 模拟分销配置
export const mockReferralConfig = {
  autoExecute: true,
  depositFirstOnly: false,
  depositCommissionRates: '0.1',
  periodicCommissionRates: '',
  lendingCommissionRates: '',
  aiQuantCommissionRates: ''
}

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
    status: COMMISSION_STATUS.PROCESSING,
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
    status: COMMISSION_STATUS.FAILED,
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
    { level: 1, count: 8234, commission: 780450.30, rate: 62.1 },
    { level: 2, count: 4567, commission: 320180.20, rate: 25.5 },
    { level: 3, count: 2345, commission: 120100.00, rate: 9.5 },
    { level: 4, count: 432, commission: 28050.00, rate: 2.2 },
    { level: 5, count: 100, commission: 8000.00, rate: 0.7 }
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

// API 模拟函数
export const referralApi = {
  // 获取分销配置
  getReferralConfig: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: mockReferralConfig
        })
      }, 300)
    })
  },

  // 更新分销配置
  updateReferralConfig: (config) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        Object.assign(mockReferralConfig, config)
        resolve({
          success: true,
          message: '配置已保存'
        })
      }, 500)
    })
  },

  // 获取分佣记录列表
  getCommissionRecords: (params) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            list: mockCommissionRecords,
            total: mockCommissionRecords.length,
            page: params.page || 1,
            pageSize: params.pageSize || 10
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

  // 手动执行分佣
  executeCommission: (recordId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: '分佣执行成功'
        })
      }, 500)
    })
  },

  // 批量执行分佣
  batchExecuteCommission: (recordIds) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: `成功执行${recordIds.length}条分佣记录`
        })
      }, 800)
    })
  }
}
