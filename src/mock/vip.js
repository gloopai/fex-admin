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

// VIP升级日志
export const vipUpgradeLogs = [
  {
    id: 'vip_upgrade_001',
    userId: 'user_003',
    username: 'carol_whale',
    fromVipLevel: 3,
    fromVipName: 'VIP3',
    toVipLevel: 4,
    toVipName: 'VIP4',
    upgradeReason: 'recharge',
    creditScore: 80,
    rechargeAmount: 500000,
    remarks: '充值 500,000 USDT，自动升级',
    createdAt: '2026-03-09T08:45:00Z'
  },
  {
    id: 'vip_upgrade_002',
    userId: 'user_006',
    username: 'frank_vip',
    fromVipLevel: 0,
    fromVipName: '普通用户',
    toVipLevel: 1,
    toVipName: 'VIP1',
    upgradeReason: 'credit_score',
    creditScore: 62,
    rechargeAmount: null,
    remarks: '信用分达到 61，自动升级 VIP1',
    createdAt: '2026-03-07T15:20:00Z'
  },
  {
    id: 'vip_upgrade_003',
    userId: 'user_007',
    username: 'grace_investor',
    fromVipLevel: 2,
    fromVipName: 'VIP2',
    toVipLevel: 3,
    toVipName: 'VIP3',
    upgradeReason: 'credit_score',
    creditScore: 77,
    rechargeAmount: null,
    remarks: '推荐新用户获得奖励，信用分达标',
    createdAt: '2026-03-07T10:00:00Z'
  },
  {
    id: 'vip_upgrade_004',
    userId: 'user_003',
    username: 'carol_whale',
    fromVipLevel: 2,
    fromVipName: 'VIP2',
    toVipLevel: 3,
    toVipName: 'VIP3',
    upgradeReason: 'recharge',
    creditScore: 75,
    rechargeAmount: 500000,
    remarks: '充值 500,000 USDT，自动升级',
    createdAt: '2026-03-06T18:30:00Z'
  },
  {
    id: 'vip_upgrade_005',
    userId: 'user_004',
    username: 'david_pro',
    fromVipLevel: 1,
    fromVipName: 'VIP1',
    toVipLevel: 2,
    toVipName: 'VIP2',
    upgradeReason: 'manual',
    creditScore: 75,
    rechargeAmount: null,
    remarks: '手动调整信用分，达到升级条件',
    createdAt: '2026-03-08T14:30:00Z'
  },
  {
    id: 'vip_upgrade_006',
    userId: 'user_008',
    username: 'henry_whale',
    fromVipLevel: 3,
    fromVipName: 'VIP3',
    toVipLevel: 4,
    toVipName: 'VIP4',
    upgradeReason: 'recharge',
    creditScore: 80,
    rechargeAmount: 1000000,
    remarks: '充值 1,000,000 USDT，自动升级',
    createdAt: '2026-03-05T14:20:00Z'
  },
  {
    id: 'vip_upgrade_007',
    userId: 'user_009',
    username: 'ivy_investor',
    fromVipLevel: 0,
    fromVipName: '普通用户',
    toVipLevel: 1,
    toVipName: 'VIP1',
    upgradeReason: 'credit_score',
    creditScore: 65,
    rechargeAmount: null,
    remarks: '信用分达到 61，自动升级 VIP1',
    createdAt: '2026-03-04T09:15:00Z'
  },
  {
    id: 'vip_upgrade_008',
    userId: 'user_010',
    username: 'jack_pro',
    fromVipLevel: 4,
    fromVipName: 'VIP4',
    toVipLevel: 5,
    toVipName: 'VIP5',
    upgradeReason: 'recharge',
    creditScore: 88,
    rechargeAmount: 2000000,
    remarks: '充值 2,000,000 USDT，自动升级',
    createdAt: '2026-03-03T16:40:00Z'
  },
  {
    id: 'vip_upgrade_009',
    userId: 'user_011',
    username: 'kate_trader',
    fromVipLevel: 1,
    fromVipName: 'VIP1',
    toVipLevel: 2,
    toVipName: 'VIP2',
    upgradeReason: 'recharge',
    creditScore: 70,
    rechargeAmount: 300000,
    remarks: '充值 300,000 USDT，自动升级',
    createdAt: '2026-03-02T11:20:00Z'
  },
  {
    id: 'vip_upgrade_010',
    userId: 'user_001',
    username: 'alice_trader',
    fromVipLevel: 0,
    fromVipName: '普通用户',
    toVipLevel: 1,
    toVipName: 'VIP1',
    upgradeReason: 'credit_score',
    creditScore: 65,
    rechargeAmount: null,
    remarks: '初始充值后信用分达标，自动升级 VIP1',
    createdAt: '2026-03-01T08:00:00Z'
  }
]
