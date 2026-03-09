import { CREDIT_SCORE_CHANGE_TYPE, CREDIT_SCORE_CONFIG_KEYS } from '../constants/creditScore'

// 信用分配置
export const creditScoreConfig = {
  [CREDIT_SCORE_CONFIG_KEYS.ENABLED]: true,
  [CREDIT_SCORE_CONFIG_KEYS.MAX_SCORE]: 100,
  [CREDIT_SCORE_CONFIG_KEYS.INITIAL_SCORE]: 60,
  [CREDIT_SCORE_CONFIG_KEYS.RECHARGE_AMOUNT]: 100000,
  [CREDIT_SCORE_CONFIG_KEYS.PRIMARY_KYC_SCORE]: 0,
  [CREDIT_SCORE_CONFIG_KEYS.ADVANCED_KYC_SCORE]: 0,
  [CREDIT_SCORE_CONFIG_KEYS.AUTO_UPGRADE_VIP1_ENABLED]: true,
  [CREDIT_SCORE_CONFIG_KEYS.AUTO_UPGRADE_VIP1_SCORE]: 61,
  [CREDIT_SCORE_CONFIG_KEYS.VIP_UPGRADE_RECHARGE_AMOUNT]: 100000,
  
  // 扣除规则
  [CREDIT_SCORE_CONFIG_KEYS.DEDUCTION_ENABLED]: true,
  [CREDIT_SCORE_CONFIG_KEYS.VIOLATION_SCORE]: 10,
  [CREDIT_SCORE_CONFIG_KEYS.ABNORMAL_TRADE_SCORE]: 5,
  [CREDIT_SCORE_CONFIG_KEYS.INACTIVE_DAYS]: 90,
  [CREDIT_SCORE_CONFIG_KEYS.INACTIVE_SCORE]: 3,
  [CREDIT_SCORE_CONFIG_KEYS.WITHDRAW_FAIL_SCORE]: 2,
  [CREDIT_SCORE_CONFIG_KEYS.DISPUTE_SCORE]: 8,
  [CREDIT_SCORE_CONFIG_KEYS.MALICIOUS_SCORE]: 20,
  [CREDIT_SCORE_CONFIG_KEYS.RISK_ALERT_SCORE]: 5,
  [CREDIT_SCORE_CONFIG_KEYS.MIN_SCORE]: 0
}

// 信用分变动日志
export const creditScoreChanges = [
  {
    id: 'cs_change_001',
    userId: 'user_001',
    username: 'alice_trader',
    changeType: CREDIT_SCORE_CHANGE_TYPE.RECHARGE,
    beforeScore: 60,
    afterScore: 65,
    changeAmount: 5,
    relatedAmount: 500000, // USDT
    reason: '充值 500,000 USDT',
    operatorId: 'system',
    operatorName: '系统',
    createdAt: '2026-03-09T10:30:00Z'
  },
  {
    id: 'cs_change_002',
    userId: 'user_002',
    username: 'bob_investor',
    changeType: CREDIT_SCORE_CHANGE_TYPE.PRIMARY_KYC,
    beforeScore: 60,
    afterScore: 60,
    changeAmount: 0,
    relatedAmount: null,
    reason: '完成初级认证',
    operatorId: 'system',
    operatorName: '系统',
    createdAt: '2026-03-09T09:15:00Z'
  },
  {
    id: 'cs_change_003',
    userId: 'user_003',
    username: 'carol_whale',
    changeType: CREDIT_SCORE_CHANGE_TYPE.RECHARGE,
    beforeScore: 75,
    afterScore: 80,
    changeAmount: 5,
    relatedAmount: 500000,
    reason: '充值 500,000 USDT',
    operatorId: 'system',
    operatorName: '系统',
    createdAt: '2026-03-09T08:45:00Z'
  },
  {
    id: 'cs_change_004',
    userId: 'user_001',
    username: 'alice_trader',
    changeType: CREDIT_SCORE_CHANGE_TYPE.ADVANCED_KYC,
    beforeScore: 65,
    afterScore: 65,
    changeAmount: 0,
    relatedAmount: null,
    reason: '完成高级认证',
    operatorId: 'system',
    operatorName: '系统',
    createdAt: '2026-03-08T16:20:00Z'
  },
  {
    id: 'cs_change_005',
    userId: 'user_004',
    username: 'david_pro',
    changeType: CREDIT_SCORE_CHANGE_TYPE.MANUAL_ADJUST,
    beforeScore: 70,
    afterScore: 75,
    changeAmount: 5,
    relatedAmount: null,
    reason: '活动奖励',
    operatorId: 'admin_001',
    operatorName: '管理员张三',
    createdAt: '2026-03-08T14:30:00Z'
  },
  {
    id: 'cs_change_006',
    userId: 'user_005',
    username: 'emma_trader',
    changeType: CREDIT_SCORE_CHANGE_TYPE.PENALTY,
    beforeScore: 68,
    afterScore: 63,
    changeAmount: -5,
    relatedAmount: null,
    reason: '异常交易行为',
    operatorId: 'admin_002',
    operatorName: '管理员李四',
    createdAt: '2026-03-08T11:00:00Z'
  },
  {
    id: 'cs_change_007',
    userId: 'user_006',
    username: 'frank_vip',
    changeType: CREDIT_SCORE_CHANGE_TYPE.RECHARGE,
    beforeScore: 60,
    afterScore: 62,
    changeAmount: 2,
    relatedAmount: 200000,
    reason: '充值 200,000 USDT',
    operatorId: 'system',
    operatorName: '系统',
    createdAt: '2026-03-07T15:20:00Z'
  },
  {
    id: 'cs_change_008',
    userId: 'user_007',
    username: 'grace_investor',
    changeType: CREDIT_SCORE_CHANGE_TYPE.REWARD,
    beforeScore: 72,
    afterScore: 77,
    changeAmount: 5,
    relatedAmount: null,
    reason: '推荐新用户奖励',
    operatorId: 'system',
    operatorName: '系统',
    createdAt: '2026-03-07T10:00:00Z'
  },
  {
    id: 'cs_change_009',
    userId: 'user_003',
    username: 'carol_whale',
    changeType: CREDIT_SCORE_CHANGE_TYPE.RECHARGE,
    beforeScore: 70,
    afterScore: 75,
    changeAmount: 5,
    relatedAmount: 500000,
    reason: '充值 500,000 USDT',
    operatorId: 'system',
    operatorName: '系统',
    createdAt: '2026-03-06T18:30:00Z'
  },
  {
    id: 'cs_change_010',
    userId: 'user_001',
    username: 'alice_trader',
    changeType: CREDIT_SCORE_CHANGE_TYPE.RECHARGE,
    beforeScore: 60,
    afterScore: 60,
    changeAmount: 0,
    relatedAmount: 50000,
    reason: '充值 50,000 USDT（未达标）',
    operatorId: 'system',
    operatorName: '系统',
    createdAt: '2026-03-06T12:00:00Z'
  }
]

// 获取配置值
export const getCreditScoreConfig = (key) => {
  return creditScoreConfig[key]
}

// 获取所有配置
export const getAllCreditScoreConfig = () => {
  return { ...creditScoreConfig }
}

// 更新配置值
export const updateCreditScoreConfig = (key, value) => {
  creditScoreConfig[key] = value
}

// 批量更新配置
export const updateCreditScoreConfigs = (configs) => {
  Object.assign(creditScoreConfig, configs)
}
