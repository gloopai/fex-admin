import { AGENT_STATUS, AGENT_LEVEL, AGENT_APPLICATION_STATUS } from '../constants/agent'

// 模拟代理列表数据
export const mockAgentList = [
  {
    id: 1,
    uid: 100001,
    username: 'agent_zhang',
    email: 'zhang@example.com',
    phone: '+86 138****8888',
    level: AGENT_LEVEL.LEVEL_1,
    status: AGENT_STATUS.ACTIVE,
    totalReferrals: 156,
    directReferrals: 45,
    totalCommission: 12580.50,
    monthCommission: 1280.30,
    createdAt: '2025-01-15 10:30:00',
    lastActiveAt: '2026-03-08 14:20:00'
  },
  {
    id: 2,
    uid: 100002,
    username: 'agent_wang',
    email: 'wang@example.com',
    phone: '+86 139****6666',
    level: AGENT_LEVEL.LEVEL_2,
    status: AGENT_STATUS.ACTIVE,
    totalReferrals: 89,
    directReferrals: 28,
    totalCommission: 8450.80,
    monthCommission: 950.60,
    createdAt: '2025-02-10 09:15:00',
    lastActiveAt: '2026-03-07 16:45:00'
  },
  {
    id: 3,
    uid: 100003,
    username: 'agent_li',
    email: 'li@example.com',
    phone: '+86 137****5555',
    level: AGENT_LEVEL.LEVEL_1,
    status: AGENT_STATUS.INACTIVE,
    totalReferrals: 23,
    directReferrals: 12,
    totalCommission: 2340.20,
    monthCommission: 0,
    createdAt: '2025-03-05 14:20:00',
    lastActiveAt: '2026-01-20 10:30:00'
  },
  {
    id: 4,
    uid: 100004,
    username: 'agent_zhao',
    email: 'zhao@example.com',
    phone: '+86 136****9999',
    level: AGENT_LEVEL.LEVEL_3,
    status: AGENT_STATUS.ACTIVE,
    totalReferrals: 201,
    directReferrals: 65,
    totalCommission: 18760.40,
    monthCommission: 2150.90,
    createdAt: '2024-12-01 08:00:00',
    lastActiveAt: '2026-03-09 09:10:00'
  },
  {
    id: 5,
    uid: 100005,
    username: 'agent_sun',
    email: 'sun@example.com',
    phone: '+86 135****7777',
    level: AGENT_LEVEL.LEVEL_2,
    status: AGENT_STATUS.SUSPENDED,
    totalReferrals: 45,
    directReferrals: 18,
    totalCommission: 4520.10,
    monthCommission: 0,
    createdAt: '2025-02-20 11:30:00',
    lastActiveAt: '2026-02-15 13:20:00'
  }
]

// 模拟代理申请列表
export const mockAgentApplications = [
  {
    id: 1,
    uid: 200001,
    username: 'user_chen',
    email: 'chen@example.com',
    phone: '+86 188****1234',
    reason: '有丰富的行业资源和推广渠道，希望成为平台代理，推广产品。',
    status: AGENT_APPLICATION_STATUS.PENDING,
    appliedAt: '2026-03-08 10:30:00',
    reviewedAt: null,
    reviewedBy: null,
    reviewNote: null
  },
  {
    id: 2,
    uid: 200002,
    username: 'user_huang',
    email: 'huang@example.com',
    phone: '+86 188****5678',
    reason: '拥有大型社区用户群体，日活跃用户超过5000人。',
    status: AGENT_APPLICATION_STATUS.PENDING,
    appliedAt: '2026-03-07 15:20:00',
    reviewedAt: null,
    reviewedBy: null,
    reviewNote: null
  },
  {
    id: 3,
    uid: 200003,
    username: 'user_zhou',
    email: 'zhou@example.com',
    phone: '+86 188****9012',
    reason: '目前运营多个加密货币相关的自媒体账号，粉丝累计超10万。',
    status: AGENT_APPLICATION_STATUS.APPROVED,
    appliedAt: '2026-03-05 09:15:00',
    reviewedAt: '2026-03-06 10:30:00',
    reviewedBy: 'admin001',
    reviewNote: '资质符合要求，批准成为代理'
  },
  {
    id: 4,
    uid: 200004,
    username: 'user_wu',
    email: 'wu@example.com',
    phone: '+86 188****3456',
    reason: '想试试做代理赚点钱。',
    status: AGENT_APPLICATION_STATUS.REJECTED,
    appliedAt: '2026-03-04 14:40:00',
    reviewedAt: '2026-03-05 09:00:00',
    reviewedBy: 'admin001',
    reviewNote: '申请理由不充分，资源不足'
  }
]

// 模拟代理统计数据
export const mockAgentStats = {
  totalAgents: 1245,
  activeAgents: 987,
  inactiveAgents: 203,
  suspendedAgents: 55,
  totalReferrals: 45678,
  totalCommission: 1256780.50,
  monthCommission: 98450.30,
  todayCommission: 3520.80,
  pendingApplications: 23
}

// 模拟代理详情
export const mockAgentDetail = (uid) => {
  const agent = mockAgentList.find(a => a.uid === uid) || mockAgentList[0]
  return {
    ...agent,
    referralTree: [
      {
        level: 1,
        count: agent.directReferrals,
        commission: agent.totalCommission * 0.5
      },
      {
        level: 2,
        count: Math.floor(agent.totalReferrals * 0.3),
        commission: agent.totalCommission * 0.3
      },
      {
        level: 3,
        count: Math.floor(agent.totalReferrals * 0.2),
        commission: agent.totalCommission * 0.2
      }
    ],
    performanceByType: [
      { type: 'deposit', amount: 45000, commission: 4500, count: 120 },
      { type: 'trading', amount: 230000, commission: 2300, count: 450 },
      { type: 'lending', amount: 78000, commission: 3120, count: 89 },
      { type: 'ai_quant', amount: 56000, commission: 2240, count: 67 }
    ]
  }
}

// API 模拟函数
export const agentApi = {
  // 获取代理列表
  getAgentList: (params) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            list: mockAgentList,
            total: mockAgentList.length,
            page: params.page || 1,
            pageSize: params.pageSize || 10
          }
        })
      }, 300)
    })
  },

  // 获取代理申请列表
  getApplicationList: (params) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            list: mockAgentApplications,
            total: mockAgentApplications.length,
            page: params.page || 1,
            pageSize: params.pageSize || 10
          }
        })
      }, 300)
    })
  },

  // 审批代理申请
  reviewApplication: (id, action, note) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: action === 'approve' ? '申请已通过' : '申请已拒绝'
        })
      }, 500)
    })
  },

  // 升级用户为代理
  upgradeToAgent: (uid, level) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: '用户已成功升级为代理'
        })
      }, 500)
    })
  },

  // 更新代理状态
  updateAgentStatus: (uid, status) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: '代理状态已更新'
        })
      }, 500)
    })
  },

  // 更新代理等级
  updateAgentLevel: (uid, level) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: '代理等级已更新'
        })
      }, 500)
    })
  },

  // 获取代理详情
  getAgentDetail: (uid) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: mockAgentDetail(uid)
        })
      }, 300)
    })
  },

  // 获取代理统计
  getAgentStats: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: mockAgentStats
        })
      }, 300)
    })
  }
}
