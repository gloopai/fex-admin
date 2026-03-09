import { VIP_LEVEL_STATUS } from '../constants/vip'

export const vipLevels = [
  {
    id: 'vip_0',
    level: 0,
    name: '普通用户',
    displayName: '普通用户',
    iconUrl: '',
    status: VIP_LEVEL_STATUS.ENABLED,
    minCreditScore: 0,
    benefits: ['基础交易功能', '标准手续费'],
    description: '平台所有新注册用户默认等级',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'vip_1',
    level: 1,
    name: 'VIP1',
    displayName: '青铜会员',
    iconUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23D97706"%3E%3Cpath d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/%3E%3C/svg%3E',
    status: VIP_LEVEL_STATUS.ENABLED,
    minCreditScore: 600,
    benefits: ['95折手续费', '优先客服', '基础数据分析'],
    description: '入门级VIP会员，享受基础特权',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z'
  },
  {
    id: 'vip_2',
    level: 2,
    name: 'VIP2',
    displayName: '白银会员',
    iconUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2393C5FD"%3E%3Cpath d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/%3E%3C/svg%3E',
    status: VIP_LEVEL_STATUS.ENABLED,
    minCreditScore: 650,
    benefits: ['9折手续费', '专属客服', '高级数据分析', '每月空投奖励'],
    description: '白银级VIP会员，享受更多特权',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z'
  },
  {
    id: 'vip_3',
    level: 3,
    name: 'VIP3',
    displayName: '黄金会员',
    iconUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FCD34D"%3E%3Cpath d="M12 2L4 9h4v11h8V9h4l-8-7z"/%3E%3C/svg%3E',
    status: VIP_LEVEL_STATUS.ENABLED,
    minCreditScore: 700,
    benefits: ['85折手续费', '专属客服', '专业数据分析', '每月空投奖励', 'API接入'],
    description: '黄金级VIP会员，享受高级特权',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z'
  },
  {
    id: 'vip_4',
    level: 4,
    name: 'VIP4',
    displayName: '铂金会员',
    iconUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23A78BFA"%3E%3Cpath d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/%3E%3C/svg%3E',
    status: VIP_LEVEL_STATUS.ENABLED,
    minCreditScore: 750,
    benefits: ['8折手续费', '一对一客服', '全方位数据分析', '每周空投奖励', 'API接入', '优先提现'],
    description: '铂金级VIP会员，尊享顶级特权',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z'
  },
  {
    id: 'vip_5',
    level: 5,
    name: 'VIP5',
    displayName: '钻石会员',
    iconUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2310B981"%3E%3Cpath d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/%3E%3C/svg%3E',
    status: VIP_LEVEL_STATUS.ENABLED,
    minCreditScore: 780,
    benefits: ['75折手续费', '专属客户经理', '定制化服务', '每日空投奖励', 'API接入', '优先提现', '线下活动邀请'],
    description: '钻石级VIP会员，至尊无上特权',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z'
  }
]

export const getVipLevelById = (id) => {
  return vipLevels.find(level => level.id === id)
}

export const getVipLevelByLevel = (level) => {
  return vipLevels.find(vip => vip.level === level)
}

export const getActiveVipLevels = () => {
  return vipLevels.filter(vip => vip.status === VIP_LEVEL_STATUS.ENABLED)
}

// 根据信用分获取对应的VIP等级
export const getVipLevelByCreditScore = (creditScore) => {
  const activeLevels = getActiveVipLevels().sort((a, b) => b.minCreditScore - a.minCreditScore)
  return activeLevels.find(level => creditScore >= level.minCreditScore) || vipLevels[0]
}
