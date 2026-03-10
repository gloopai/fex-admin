// 交割合约场控架构 - 三层控制体系

/**
 * 第一层：合约级基础场控
 * 作用范围：整个合约的所有用户
 * 优先级：最低
 * 适用场景：整体风险控制、市场波动应对
 */
export const contractLevelControl = {
  contractId: 'BTC_USDT_30s',
  contractName: 'BTC/USDT 30秒交割',
  
  // 默认参数
  defaultSettings: {
    winRate: 0.45,              // 整体默认胜率
    largeOrderThreshold: 5000,  // 大额订单阈值
    largeOrderWinRate: 0.35     // 大额订单胜率
  },
  
  // 自动触发规则
  autoRules: [
    {
      id: 'contract_rule_001',
      name: '合约整体盈利过高',
      trigger: {
        type: 'contract_total_profit',
        period: '1hour',
        threshold: 10000
      },
      action: {
        adjustWinRate: 0.35,
        duration: 3600
      }
    },
    {
      id: 'contract_rule_002',
      name: '合约交易量激增',
      trigger: {
        type: 'volume_spike',
        multiplier: 3  // 交易量是平均值的3倍
      },
      action: {
        adjustWinRate: 0.40,
        increaseLargeOrderControl: true
      }
    }
  ]
}

/**
 * 第二层：用户分组策略
 * 作用范围：特定分组的用户
 * 优先级：中
 * 适用场景：基于用户画像的批量策略
 */
export const userGroupStrategy = {
  groups: {
    // VIP用户组
    vip: {
      priority: 'high',
      winRate: 0.55,
      maxDailyLoss: null,  // 不限制
      specialRules: [
        {
          name: 'VIP保护',
          trigger: { type: 'daily_loss', threshold: -5000 },
          action: { boostWinRate: 0.60, duration: 7200 }
        }
      ]
    },
    
    // 高风险用户组
    high_risk: {
      priority: 'high',
      winRate: 0.30,
      maxDailyLoss: -3000,
      specialRules: [
        {
          name: '高风险限制',
          trigger: { type: 'consecutive_wins', count: 3 },
          action: { forceNextLoss: true }
        }
      ]
    },
    
    // 新用户组
    new_user: {
      priority: 'medium',
      winRate: 0.50,
      initialBoost: {
        firstNTrades: 20,
        boostedWinRate: 0.60
      }
    },
    
    // 普通用户组
    normal: {
      priority: 'low',
      winRate: 0.45,  // 继承合约默认值
      followContractRules: true
    }
  }
}

/**
 * 第三层：用户级精准控制
 * 作用范围：单个用户
 * 优先级：最高（覆盖前两层）
 * 适用场景：特殊用户的个性化控制
 */
export const userLevelControl = {
  userId: 'U100001',
  userName: '张三',
  
  // 覆盖模式
  override: true,  // true=完全覆盖，false=在分组基础上调整
  
  // 用户特定设置
  customSettings: {
    winRate: 0.35,
    maxDailyProfit: 5000,
    forceNextLoss: false,
    lockNewPositions: false
  },
  
  // 用户级规则
  customRules: [
    {
      name: '单日盈利限制',
      trigger: { type: 'daily_profit', threshold: 5000 },
      action: { lockNewPositions: true }
    }
  ],
  
  // 有效期
  validUntil: '2026-03-11 23:59:59'
}

/**
 * 控制优先级决策树
 */
export const controlPriorityTree = {
  decision: function(userId, contractId) {
    // 1. 检查是否有用户级精准控制
    const userControl = getUserLevelControl(userId)
    if (userControl && userControl.override) {
      return userControl.customSettings
    }
    
    // 2. 检查用户所属分组
    const userGroup = getUserGroup(userId)
    const groupStrategy = userGroupStrategy.groups[userGroup]
    if (groupStrategy && groupStrategy.priority !== 'low') {
      return applyGroupStrategy(groupStrategy, userControl)
    }
    
    // 3. 应用合约级基础场控
    const contractControl = getContractLevelControl(contractId)
    return contractControl.defaultSettings
  }
}

/**
 * 实时场控执行引擎
 */
export const controlEngine = {
  // 开仓前检查
  beforeOpenPosition: function(userId, contractId, orderAmount) {
    const settings = controlPriorityTree.decision(userId, contractId)
    
    // 检查是否锁定
    if (settings.lockNewPositions) {
      return { allowed: false, reason: '用户已锁定新开仓' }
    }
    
    // 检查大额订单
    if (orderAmount > settings.largeOrderThreshold) {
      settings.winRate = settings.largeOrderWinRate
    }
    
    return { allowed: true, settings }
  },
  
  // 结算时控制
  onSettlement: function(positionId, marketPrice) {
    const position = getPosition(positionId)
    const settings = controlPriorityTree.decision(position.userId, position.contractId)
    
    // 检查是否强制下一单亏损
    if (settings.forceNextLoss) {
      return {
        settlementPrice: calculateLossPrice(position, marketPrice),
        reason: 'force_next_loss'
      }
    }
    
    // 检查是否触发自动规则
    const triggeredRules = checkTriggeredRules(position.userId, position.contractId)
    if (triggeredRules.length > 0) {
      return applyRuleAction(triggeredRules[0], position, marketPrice)
    }
    
    // 应用基于胜率的结算
    const shouldWin = Math.random() < settings.winRate
    return {
      settlementPrice: shouldWin ? 
        calculateWinPrice(position, marketPrice) : 
        calculateLossPrice(position, marketPrice),
      reason: `win_rate_${settings.winRate}`
    }
  }
}

/**
 * 使用示例
 */
export const usageExample = {
  // 场景1：设置合约级默认参数
  setContractDefault: function() {
    updateContractControl('BTC_USDT_30s', {
      defaultWinRate: 0.45,
      largeOrderWinRate: 0.35
    })
  },
  
  // 场景2：给用户打标签加入分组
  assignUserToGroup: function(userId, risk) {
    if (risk === 'high') {
      updateUserGroup(userId, 'high_risk')
    }
  },
  
  // 场景3：临时针对某用户精准控制
  applyUserControl: function(userId) {
    setUserLevelControl(userId, {
      override: true,
      customSettings: {
        winRate: 0.35,
        forceNextLoss: true
      },
      validUntil: Date.now() + 3600000  // 1小时后失效
    })
  }
}
