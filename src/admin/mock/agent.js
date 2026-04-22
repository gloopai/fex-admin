import { AGENT_STATUS } from '../constants/agent'
import { normalizeAgentProductCommission } from './agentCommission'

// 模拟代理列表数据
export const mockAgentList = [
  {
    id: 1,
    uid: 100001,
    username: 'agent_zhang',
    /** 直邀注册用推广码（与后台代理档案一致；演示数据） */
    inviteCode: 'AGNT_ZHANG',
    email: 'zhang@example.com',
    phone: '+86 138****8888',
    status: AGENT_STATUS.ACTIVE,
    totalReferrals: 156,
    totalCommission: 12580.5,
    monthCommission: 1280.3,
    createdAt: '2025-01-15 10:30:00',
    lastActiveAt: '2026-03-08 14:20:00',
    productCommission: normalizeAgentProductCommission({
      agentDepositCommissionEnabled: true,
      agentDepositCommissionRate: '0.12',
      agentPerpetualCommissionEnabled: true,
      agentPerpetualCommissionRate: '0.35',
      agentDeliveryCommissionEnabled: true,
      agentDeliveryCommissionRate: '0.28',
      agentSpotCommissionEnabled: true,
      agentSpotCommissionRate: '0.22',
      agentAiQuantCommissionEnabled: true,
      agentAiQuantCommissionRate: '0.15',
      agentLendingCommissionEnabled: true,
      agentLendingCommissionRate: '0.10',
      agentBorrowingCommissionEnabled: false,
      agentBorrowingCommissionRate: '0'
    })
  },
  {
    id: 2,
    uid: 100002,
    username: 'agent_wang',
    inviteCode: 'AGNT_WANG',
    email: 'wang@example.com',
    phone: '+86 139****6666',
    status: AGENT_STATUS.ACTIVE,
    totalReferrals: 89,
    totalCommission: 8450.8,
    monthCommission: 950.6,
    createdAt: '2025-02-10 09:15:00',
    lastActiveAt: '2026-03-07 16:45:00',
    productCommission: normalizeAgentProductCommission({})
  },
  {
    id: 3,
    uid: 100003,
    username: 'agent_li',
    inviteCode: 'AGNT_LI',
    email: 'li@example.com',
    phone: '+86 137****5555',
    status: AGENT_STATUS.INACTIVE,
    totalReferrals: 23,
    totalCommission: 2340.2,
    monthCommission: 0,
    createdAt: '2025-03-05 14:20:00',
    lastActiveAt: '2026-01-20 10:30:00',
    productCommission: normalizeAgentProductCommission({})
  },
  {
    id: 4,
    uid: 100004,
    username: 'agent_zhao',
    inviteCode: 'AGNT_ZHAO',
    email: 'zhao@example.com',
    phone: '+86 136****9999',
    status: AGENT_STATUS.ACTIVE,
    totalReferrals: 201,
    totalCommission: 18760.4,
    monthCommission: 2150.9,
    createdAt: '2024-12-01 08:00:00',
    lastActiveAt: '2026-03-09 09:10:00',
    productCommission: normalizeAgentProductCommission({
      agentPerpetualCommissionEnabled: true,
      agentPerpetualCommissionRate: '0.05'
    })
  },
  {
    id: 5,
    uid: 100005,
    username: 'agent_sun',
    inviteCode: 'AGNT_SUN',
    email: 'sun@example.com',
    phone: '+86 135****7777',
    status: AGENT_STATUS.SUSPENDED,
    totalReferrals: 45,
    totalCommission: 4520.1,
    monthCommission: 0,
    createdAt: '2025-02-20 11:30:00',
    lastActiveAt: '2026-02-15 13:20:00',
    productCommission: normalizeAgentProductCommission({})
  }
]

// 模拟代理统计数据
export const mockAgentStats = {
  totalAgents: 1245,
  activeAgents: 987,
  inactiveAgents: 203,
  suspendedAgents: 55,
  totalReferrals: 45678,
  totalCommission: 1256780.5,
  monthCommission: 98450.3,
  todayCommission: 3520.8
}

// 模拟代理详情
export const mockAgentDetail = (uid) => {
  const agent = mockAgentList.find((a) => a.uid === uid) || mockAgentList[0]
  return {
    ...agent,
    productCommission: normalizeAgentProductCommission(agent.productCommission),
    /** 代理仅一级，名下推荐用户总数即 totalReferrals */
    referralTree: [
      {
        level: 1,
        count: agent.totalReferrals,
        commission: agent.totalCommission
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

// 模拟更多代理数据以便测试分页
const generateMockAgents = () => {
  const agents = [...mockAgentList]
  for (let i = 6; i <= 25; i++) {
    agents.push({
      id: i,
      uid: 100000 + i,
      username: `agent_user_${i}`,
      email: `user${i}@example.com`,
      phone: `+86 13${Math.floor(Math.random() * 10)}****${Math.floor(Math.random() * 9000) + 1000}`,
      status: Object.values(AGENT_STATUS)[Math.floor(Math.random() * Object.values(AGENT_STATUS).length)],
      totalReferrals: Math.floor(Math.random() * 300),
      totalCommission: Math.floor(Math.random() * 20000),
      monthCommission: Math.floor(Math.random() * 3000),
      createdAt: `2025-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1} 10:00:00`,
      lastActiveAt: '2026-03-08 14:20:00',
      productCommission: normalizeAgentProductCommission({})
    })
  }
  return agents
}

const extendedAgentList = generateMockAgents()

function patchAgentListItem(a) {
  return {
    ...a,
    productCommission: normalizeAgentProductCommission(a.productCommission)
  }
}

// API 模拟函数
export const agentApi = {
  getAgentList: (params) => {
    const { page = 1, pageSize = 10, searchKeyword = '', status = 'all' } = params

    return new Promise((resolve) => {
      setTimeout(() => {
        let list = extendedAgentList.map(patchAgentListItem)

        if (searchKeyword.trim()) {
          const keyword = searchKeyword.toLowerCase()
          list = list.filter(
            (agent) =>
              agent.username.toLowerCase().includes(keyword) ||
              agent.email.toLowerCase().includes(keyword) ||
              agent.uid.toString().includes(keyword)
          )
        }

        if (status !== 'all') {
          list = list.filter((agent) => agent.status === status)
        }

        const total = list.length
        const start = (page - 1) * pageSize
        const end = start + pageSize
        const paginatedList = list.slice(start, end)

        resolve({
          success: true,
          data: {
            list: paginatedList,
            total: total,
            page: page,
            pageSize: pageSize
          }
        })
      }, 300)
    })
  },

  upgradeToAgent: (uid) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: '已将该用户设为代理'
        })
      }, 500)
    })
  },

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

  updateAgentProductCommission: (uid, productCommission) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const agent = extendedAgentList.find((a) => a.uid === uid)
        if (!agent) {
          reject(new Error('未找到该代理'))
          return
        }
        try {
          agent.productCommission = normalizeAgentProductCommission(productCommission)
        } catch (e) {
          reject(e)
          return
        }
        resolve({
          success: true,
          message: '代理产品线记佣已保存',
          data: { ...agent, productCommission: agent.productCommission }
        })
      }, 400)
    })
  },

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

export { normalizeAgentProductCommission } from './agentCommission'
