import { CREDIT_SCORE_CHANGE_TYPE, CREDIT_SCORE_CONFIG_KEYS, CREDIT_SCORE_AUDIT_STATUS } from '../constants/creditScore'

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
  [CREDIT_SCORE_CONFIG_KEYS.MIN_SCORE]: 0,
  
  // 人工审核配置
  [CREDIT_SCORE_CONFIG_KEYS.MANUAL_AUDIT_ENABLED]: true,
  [CREDIT_SCORE_CONFIG_KEYS.MANUAL_AUDIT_THRESHOLD]: 10,  // 变动超过10分需审核
  [CREDIT_SCORE_CONFIG_KEYS.MANUAL_AUDIT_TYPES]: [
    CREDIT_SCORE_CHANGE_TYPE.MANUAL_ADJUST,
    CREDIT_SCORE_CHANGE_TYPE.PENALTY,
    CREDIT_SCORE_CHANGE_TYPE.REWARD
  ]
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


// 信用分审核列表（待审核的积分变动）
export const creditScoreAuditList = [
  {
    id: 'audit_001',
    userId: 'user_008',
    username: 'henry_trader',
    email: 'henry@example.com',
    changeType: CREDIT_SCORE_CHANGE_TYPE.MANUAL_ADJUST,
    beforeScore: 65,
    afterScore: 80,
    changeAmount: 15,
    relatedAmount: null,
    reason: '忠诚用户奖励，交易活跃',
    applyOperatorId: 'admin_001',
    applyOperatorName: '管理员张三',
    auditStatus: CREDIT_SCORE_AUDIT_STATUS.PENDING,
    applyTime: '2026-03-09T11:00:00Z',
    auditTime: null,
    auditorId: null,
    auditorName: null,
    auditNote: null
  },
  {
    id: 'audit_002',
    userId: 'user_009',
    username: 'ivy_investor',
    email: 'ivy@example.com',
    changeType: CREDIT_SCORE_CHANGE_TYPE.PENALTY,
    beforeScore: 70,
    afterScore: 55,
    changeAmount: -15,
    relatedAmount: null,
    reason: '多次违规交易，风控预警',
    applyOperatorId: 'admin_002',
    applyOperatorName: '管理员李四',
    auditStatus: CREDIT_SCORE_AUDIT_STATUS.PENDING,
    applyTime: '2026-03-09T10:15:00Z',
    auditTime: null,
    auditorId: null,
    auditorName: null,
    auditNote: null
  },
  {
    id: 'audit_003',
    userId: 'user_010',
    username: 'jack_pro',
    email: 'jack@example.com',
    changeType: CREDIT_SCORE_CHANGE_TYPE.REWARD,
    beforeScore: 75,
    afterScore: 85,
    changeAmount: 10,
    relatedAmount: null,
    reason: '成功推荐5位活跃用户',
    applyOperatorId: 'system',
    applyOperatorName: '系统',
    auditStatus: CREDIT_SCORE_AUDIT_STATUS.PENDING,
    applyTime: '2026-03-09T09:30:00Z',
    auditTime: null,
    auditorId: null,
    auditorName: null,
    auditNote: null
  },
  {
    id: 'audit_004',
    userId: 'user_011',
    username: 'karen_whale',
    email: 'karen@example.com',
    changeType: CREDIT_SCORE_CHANGE_TYPE.MANUAL_ADJUST,
    beforeScore: 82,
    afterScore: 95,
    changeAmount: 13,
    relatedAmount: null,
    reason: '大户VIP特殊奖励',
    applyOperatorId: 'admin_001',
    applyOperatorName: '管理员张三',
    auditStatus: CREDIT_SCORE_AUDIT_STATUS.APPROVED,
    applyTime: '2026-03-08T16:00:00Z',
    auditTime: '2026-03-08T17:30:00Z',
    auditorId: 'admin_003',
    auditorName: '管理员王五',
    auditNote: '大户奖励，审核通过'
  },
  {
    id: 'audit_005',
    userId: 'user_012',
    username: 'leo_trader',
    email: 'leo@example.com',
    changeType: CREDIT_SCORE_CHANGE_TYPE.PENALTY,
    beforeScore: 68,
    afterScore: 48,
    changeAmount: -20,
    relatedAmount: null,
    reason: '恶意刷单行为',
    applyOperatorId: 'admin_002',
    applyOperatorName: '管理员李四',
    auditStatus: CREDIT_SCORE_AUDIT_STATUS.REJECTED,
    applyTime: '2026-03-08T14:00:00Z',
    auditTime: '2026-03-08T15:20:00Z',
    auditorId: 'admin_003',
    auditorName: '管理员王五',
    auditNote: '证据不足，需要进一步调查'
  }
]
// 更新配置值
export const updateCreditScoreConfig = (key, value) => {
  creditScoreConfig[key] = value
}

// 批量更新配置
export const updateCreditScoreConfigs = (configs) => {
  Object.assign(creditScoreConfig, configs)
}

// 生成更多模拟日志
for (let i = 11; i <= 60; i++) {
  const changeTypes = Object.values(CREDIT_SCORE_CHANGE_TYPE)
  const type = changeTypes[Math.floor(Math.random() * changeTypes.length)]
  const amount = type === CREDIT_SCORE_CHANGE_TYPE.PENALTY ? -Math.floor(Math.random() * 10) - 1 : Math.floor(Math.random() * 10)
  const before = 60 + Math.floor(Math.random() * 30)
  
  creditScoreChanges.push({
    id: `cs_change_${String(i).padStart(3, '0')}`,
    userId: `user_${String(100 + i).padStart(3, '0')}`,
    username: `user_${i}_trader`,
    changeType: type,
    beforeScore: before,
    afterScore: before + amount,
    changeAmount: amount,
    relatedAmount: type === CREDIT_SCORE_CHANGE_TYPE.RECHARGE ? (Math.floor(Math.random() * 10) + 1) * 50000 : null,
    reason: type === CREDIT_SCORE_CHANGE_TYPE.RECHARGE ? '充值奖励积分' : '系统自动调整',
    operatorId: 'system',
    operatorName: '系统',
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  })
}

// 生成更多模拟审核数据
for (let i = 6; i <= 50; i++) {
  const changeTypes = [CREDIT_SCORE_CHANGE_TYPE.MANUAL_ADJUST, CREDIT_SCORE_CHANGE_TYPE.PENALTY, CREDIT_SCORE_CHANGE_TYPE.REWARD]
  const type = changeTypes[Math.floor(Math.random() * changeTypes.length)]
  const statusList = Object.values(CREDIT_SCORE_AUDIT_STATUS)
  const status = statusList[Math.floor(Math.random() * statusList.length)]
  const amount = type === CREDIT_SCORE_CHANGE_TYPE.PENALTY ? -Math.floor(Math.random() * 20) - 5 : Math.floor(Math.random() * 20) + 5
  const before = 60 + Math.floor(Math.random() * 20)
  const applyTime = new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString()
  
  creditScoreAuditList.push({
    id: `audit_${String(i).padStart(3, '0')}`,
    userId: `user_${String(200 + i).padStart(3, '0')}`,
    username: `user_${i}_audit`,
    email: `user${i}@example.com`,
    changeType: type,
    beforeScore: before,
    afterScore: before + amount,
    changeAmount: amount,
    relatedAmount: null,
    reason: type === CREDIT_SCORE_CHANGE_TYPE.REWARD ? '活动达标奖励' : '人工风险调整',
    applyOperatorId: 'admin_001',
    applyOperatorName: '管理员张三',
    auditStatus: status,
    applyTime: applyTime,
    auditTime: status !== CREDIT_SCORE_AUDIT_STATUS.PENDING ? new Date(new Date(applyTime).getTime() + 3600000).toISOString() : null,
    auditorId: status !== CREDIT_SCORE_AUDIT_STATUS.PENDING ? 'admin_003' : null,
    auditorName: status !== CREDIT_SCORE_AUDIT_STATUS.PENDING ? '管理员王五' : null,
    auditNote: status !== CREDIT_SCORE_AUDIT_STATUS.PENDING ? '审核通过' : null
  })
}

export const getCreditScoreAudits = ({
  page,
  pageSize,
  searchKeyword,
  changeType,
  auditStatus,
  dateRange
}) => {
  let filteredAudits = [...creditScoreAuditList]

  if (searchKeyword && searchKeyword.trim()) {
    const keyword = searchKeyword.toLowerCase()
    filteredAudits = filteredAudits.filter(
      (audit) =>
        audit.username.toLowerCase().includes(keyword) ||
        audit.userId.toLowerCase().includes(keyword) ||
        audit.email.toLowerCase().includes(keyword) ||
        (audit.reason && audit.reason.toLowerCase().includes(keyword))
    )
  }

  if (changeType && changeType !== 'all') {
    filteredAudits = filteredAudits.filter(audit => audit.changeType === changeType)
  }

  if (auditStatus && auditStatus !== 'all') {
    filteredAudits = filteredAudits.filter(audit => audit.auditStatus === auditStatus)
  }

  if (dateRange && dateRange.start && dateRange.end) {
    const start = new Date(dateRange.start).getTime()
    const end = new Date(dateRange.end).getTime()
    filteredAudits = filteredAudits.filter(audit => {
      const time = new Date(audit.applyTime).getTime()
      return time >= start && time <= end
    })
  }

  // 按申请时间倒序
  filteredAudits.sort((a, b) => new Date(b.applyTime) - new Date(a.applyTime))

  const total = filteredAudits.length
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = filteredAudits.slice(start, end)

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ list, total })
    }, 300)
  })
}

export const getCreditScoreChanges = ({
  page,
  pageSize,
  searchKeyword,
  changeType,
  dateRange
}) => {
  let filteredChanges = [...creditScoreChanges]

  if (searchKeyword && searchKeyword.trim()) {
    const keyword = searchKeyword.toLowerCase()
    filteredChanges = filteredChanges.filter(
      (change) =>
        change.username.toLowerCase().includes(keyword) ||
        change.userId.toLowerCase().includes(keyword) ||
        (change.reason && change.reason.toLowerCase().includes(keyword)) ||
        (change.operatorName && change.operatorName.toLowerCase().includes(keyword))
    )
  }

  if (changeType && changeType !== 'all') {
    filteredChanges = filteredChanges.filter(change => change.changeType === changeType)
  }

  if (dateRange && dateRange.start && dateRange.end) {
    const start = new Date(dateRange.start).getTime()
    const end = new Date(dateRange.end).getTime()
    filteredChanges = filteredChanges.filter(change => {
      const time = new Date(change.createdAt).getTime()
      return time >= start && time <= end
    })
  }

  // 按时间倒序
  filteredChanges.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const total = filteredChanges.length
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = filteredChanges.slice(start, end)

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ list, total })
    }, 300)
  })
}
