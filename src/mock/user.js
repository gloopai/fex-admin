import { USER_STATUS, USER_ROLE, USER_KYC_STATUS } from '../constants/user'

const generateUser = (id, overrides = {}) => ({
  id: `user_${id}`,
  username: `user${id}`,
  email: `user${id}@example.com`,
  phone: `+86 138${String(id).padStart(8, '0')}`,
  role: USER_ROLE.USER,
  status: USER_STATUS.ACTIVE,
  kycStatus: USER_KYC_STATUS.VERIFIED,
  isVip: false,
  creditScore: Math.floor(Math.random() * 200) + 600, // 600-800分
  balance: Math.floor(Math.random() * 100000),
  frozenBalance: Math.floor(Math.random() * 10000),
  totalProfit: Math.floor(Math.random() * 50000) - 10000,
  tradingVolume: Math.floor(Math.random() * 1000000),
  parentId: null,
  parentUsername: null,
  registerTime: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
  lastLoginTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  lastLoginIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
  remark: '',
  ...overrides
})

export const usersList = [
  generateUser(1001, {
    username: 'agent_wang',
    email: 'wang@agent.com',
    role: USER_ROLE.AGENT,
    status: USER_STATUS.ACTIVE,
    kycStatus: USER_KYC_STATUS.VERIFIED,
    isVip: true,
    creditScore: 780,
    balance: 500000,
    frozenBalance: 0,
    totalProfit: 125000,
    tradingVolume: 5000000,
    parentId: null,
    parentUsername: null,
    remark: '顶级代理'
  }),
  generateUser(1002, {
    username: 'vip_zhang',
    email: 'zhang@vip.com',
    role: USER_ROLE.USER,
    status: USER_STATUS.ACTIVE,
    kycStatus: USER_KYC_STATUS.VERIFIED,
    isVip: true,
    creditScore: 750,
    balance: 350000,
    frozenBalance: 50000,
    totalProfit: 88000,
    tradingVolume: 3200000,
    parentId: 'user_1001',
    parentUsername: 'agent_wang'
  }),
  generateUser(1003, {
    username: 'agent_li',
    email: 'li@agent.com',
    role: USER_ROLE.AGENT,
    status: USER_STATUS.ACTIVE,
    kycStatus: USER_KYC_STATUS.VERIFIED,
    isVip: false,
    creditScore: 720,
    balance: 128000,
    frozenBalance: 22000,
    totalProfit: 45000,
    tradingVolume: 1800000,
    parentId: 'user_1001',
    parentUsername: 'agent_wang'
  }),
  generateUser(1004, {
    username: 'user_chen',
    email: 'chen@example.com',
    role: USER_ROLE.USER,
    status: USER_STATUS.ACTIVE,
    kycStatus: USER_KYC_STATUS.VERIFIED,
    isVip: false,
    creditScore: 680,
    balance: 56000,
    frozenBalance: 8000,
    totalProfit: 12000,
    tradingVolume: 680000,
    parentId: 'user_1003',
    parentUsername: 'agent_li'
  }),
  generateUser(1005, {
    username: 'user_liu',
    email: 'liu@example.com',
    role: USER_ROLE.USER,
    status: USER_STATUS.INACTIVE,
    kycStatus: USER_KYC_STATUS.VERIFIED,
    isVip: false,
    creditScore: 620,
    balance: 8500,
    frozenBalance: 0,
    totalProfit: -3200,
    tradingVolume: 120000,
    parentId: 'user_1001',
    parentUsername: 'agent_wang'
  }),
  generateUser(1006, {
    username: 'new_user_wang',
    email: 'newwang@example.com',
    role: USER_ROLE.USER,
    status: USER_STATUS.ACTIVE,
    kycStatus: USER_KYC_STATUS.PENDING,
    isVip: false,
    creditScore: 650,
    balance: 5000,
    frozenBalance: 0,
    totalProfit: 200,
    tradingVolume: 15000,
    parentId: 'user_1003',
    parentUsername: 'agent_li',
    registerTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }),
  generateUser(1007, {
    username: 'suspended_user',
    email: 'suspended@example.com',
    role: USER_ROLE.USER,
    status: USER_STATUS.SUSPENDED,
    kycStatus: USER_KYC_STATUS.VERIFIED,
    isVip: false,
    creditScore: 580,
    balance: 42000,
    frozenBalance: 42000,
    totalProfit: 18000,
    tradingVolume: 450000,
    parentId: 'user_1001',
    parentUsername: 'agent_wang',
    remark: '异常交易行为，暂时冻结'
  }),
  generateUser(1008, {
    username: 'banned_user',
    email: 'banned@example.com',
    role: USER_ROLE.USER,
    status: USER_STATUS.BANNED,
    kycStatus: USER_KYC_STATUS.VERIFIED,
    isVip: false,
    creditScore: 450,
    balance: 0,
    frozenBalance: 0,
    totalProfit: -5000,
    tradingVolume: 80000,
    parentId: 'user_1003',
    parentUsername: 'agent_li',
    remark: '违规操作，永久封禁'
  }),
  generateUser(1009, {
    username: 'agent_zhao',
    email: 'zhao@agent.com',
    role: USER_ROLE.AGENT,
    status: USER_STATUS.ACTIVE,
    kycStatus: USER_KYC_STATUS.VERIFIED,
    isVip: true,
    creditScore: 760,
    balance: 268000,
    frozenBalance: 35000,
    totalProfit: 72000,
    tradingVolume: 2100000,
    parentId: null,
    parentUsername: null
  }),
  generateUser(1010, {
    username: 'vip_qian',
    email: 'qian@vip.com',
    role: USER_ROLE.USER,
    status: USER_STATUS.ACTIVE,
    kycStatus: USER_KYC_STATUS.VERIFIED,
    isVip: true,
    creditScore: 790,
    balance: 520000,
    frozenBalance: 80000,
    totalProfit: 156000,
    tradingVolume: 4200000,
    parentId: 'user_1009',
    parentUsername: 'agent_zhao'
  })
]

// 生成更多模拟用户
const agentIds = ['user_1001', 'user_1003', 'user_1009']
const agentNames = ['agent_wang', 'agent_li', 'agent_zhao']

for (let i = 1011; i <= 1050; i++) {
  const roles = [USER_ROLE.USER, USER_ROLE.AGENT]
  const statuses = [USER_STATUS.ACTIVE, USER_STATUS.INACTIVE]
  const kycStatuses = [USER_KYC_STATUS.VERIFIED, USER_KYC_STATUS.PENDING, USER_KYC_STATUS.NOT_VERIFIED]
  const role = roles[Math.floor(Math.random() * roles.length)]
  const parentIndex = Math.floor(Math.random() * agentIds.length)
  
  usersList.push(generateUser(i, {
    role: role,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    kycStatus: kycStatuses[Math.floor(Math.random() * kycStatuses.length)],
    isVip: Math.random() > 0.8, // 20% VIP
    parentId: role === USER_ROLE.AGENT ? null : agentIds[parentIndex],
    parentUsername: role === USER_ROLE.AGENT ? null : agentNames[parentIndex]
  }))
}

export const getUserById = (userId) => {
  return usersList.find(user => user.id === userId)
}

export const getUsersByStatus = (status) => {
  if (status === 'all') return usersList
  return usersList.filter(user => user.status === status)
}

export const getUsersByRole = (role) => {
  if (role === 'all') return usersList
  return usersList.filter(user => user.role === role)
}

export const getUsersByKycStatus = (kycStatus) => {
  if (kycStatus === 'all') return usersList
  return usersList.filter(user => user.kycStatus === kycStatus)
}

export const searchUsers = (keyword) => {
  return usersList.filter(user => 
    user.username.toLowerCase().includes(keyword.toLowerCase()) ||
    user.email.toLowerCase().includes(keyword.toLowerCase()) ||
    user.phone.includes(keyword) ||
    user.id.toLowerCase().includes(keyword.toLowerCase())
  )
}
