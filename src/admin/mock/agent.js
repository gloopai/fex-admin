import { AGENT_STATUS, AGENT_LEVEL, DEFAULT_AGENT_LEVEL_COMMISSION_RATES } from '../constants/agent'

let agentLevelCommissionRates = { ...DEFAULT_AGENT_LEVEL_COMMISSION_RATES }

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

// 模拟代理统计数据
export const mockAgentStats = {
  totalAgents: 1245,
  activeAgents: 987,
  inactiveAgents: 203,
  suspendedAgents: 55,
  totalReferrals: 45678,
  totalCommission: 1256780.50,
  monthCommission: 98450.30,
  todayCommission: 3520.80
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
      level: Object.values(AGENT_LEVEL)[Math.floor(Math.random() * Object.values(AGENT_LEVEL).length)],
      status: Object.values(AGENT_STATUS)[Math.floor(Math.random() * Object.values(AGENT_STATUS).length)],
      totalReferrals: Math.floor(Math.random() * 300),
      directReferrals: Math.floor(Math.random() * 100),
      totalCommission: Math.floor(Math.random() * 20000),
      monthCommission: Math.floor(Math.random() * 3000),
      createdAt: `2025-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1} 10:00:00`,
      lastActiveAt: '2026-03-08 14:20:00'
    })
  }
  return agents
}

const extendedAgentList = generateMockAgents()

// API 模拟函数
export const agentApi = {
  // 获取代理列表
  getAgentList: (params) => {
    const { page = 1, pageSize = 10, searchKeyword = '', status = 'all', level = 'all' } = params

    return new Promise((resolve) => {
      setTimeout(() => {
        let list = [...extendedAgentList]

        // 搜索关键词
        if (searchKeyword.trim()) {
          const keyword = searchKeyword.toLowerCase()
          list = list.filter(agent =>
            agent.username.toLowerCase().includes(keyword) ||
            agent.email.toLowerCase().includes(keyword) ||
            agent.uid.toString().includes(keyword)
          )
        }

        // 状态筛选
        if (status !== 'all') {
          list = list.filter(agent => agent.status === status)
        }

        // 等级筛选
        if (level !== 'all') {
          list = list.filter(agent => agent.level === level)
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

  // 将指定用户设为代理（后台手动添加）
  upgradeToAgent: (uid, level) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: '已将该用户设为代理'
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
  },

  /** 各代理等级对应的佣金比例（0～1），供后台配置与添加代理时展示 */
  getAgentLevelCommissionRates: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { ...agentLevelCommissionRates }
        })
      }, 200)
    })
  },

  saveAgentLevelCommissionRates: (rates) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const next = { ...DEFAULT_AGENT_LEVEL_COMMISSION_RATES, ...rates }
        for (const key of Object.values(AGENT_LEVEL)) {
          const v = next[key]
          if (typeof v !== 'number' || Number.isNaN(v) || v < 0 || v > 1) {
            reject(new Error(`等级 ${key} 的比例须为 0～1 之间的数字`))
            return
          }
        }
        agentLevelCommissionRates = next
        resolve({
          success: true,
          message: '代理等级佣金比例已保存'
        })
      }, 400)
    })
  }
}
