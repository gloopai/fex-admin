import { 
  DELIVERY_RISK_LEVEL, 
  DELIVERY_POSITION_SIDE, 
  DELIVERY_USER_TYPE,
  DELIVERY_CYCLE_TYPE,
  DELIVERY_CONTRACT_STATUS,
  SUGGESTION_PRIORITY,
  DELIVERY_CONTROL_ACTION
} from '../constants/deliveryReport'

// 市场概览数据
export const deliveryMarketOverview = {
  totalVolume24h: 68500000,      // 24h总交易量 (USDT)
  totalPosition: 4250000,        // 总持仓 (USDT)
  totalUsers: 2850,              // 总用户数
  activeUsers24h: 1890,          // 24h活跃用户
  platformPnl24h: 156800,        // 24h平台盈亏 (USDT)
  userPnl24h: -156800,           // 24h用户盈亏 (USDT)
  longShortRatio: 1.28,          // 多空比
  nearExpiryContracts: 3,        // 临近交割合约数
  todaySettlements: 2,           // 今日交割数
  riskLevel: DELIVERY_RISK_LEVEL.MEDIUM // 整体风险等级
}

// 各合约数据（按交割时间排序）
export const deliveryContractsData = [
  {
    symbol: 'BTC60S',
    name: 'BTC/USDT 60秒',
    baseSymbol: 'BTCUSDT',
    cycleType: DELIVERY_CYCLE_TYPE.SEC_60,
    expiryDate: '2026-03-09 14:31:00',
    daysToExpiry: 0,
    hoursToExpiry: 0,
    status: DELIVERY_CONTRACT_STATUS.TRADING,
    volume24h: 28500000,
    position: 1680000,
    longPosition: 980000,
    shortPosition: 700000,
    netPosition: 280000,
    longShortRatio: 1.40,
    activeUsers: 685,
    platformPnl24h: 68500,
    userPnl24h: -68500,
    controlActive: true,
    riskLevel: DELIVERY_RISK_LEVEL.MEDIUM
  },
  {
    symbol: 'ETH120S',
    name: 'ETH/USDT 2分钟',
    baseSymbol: 'ETHUSDT',
    cycleType: DELIVERY_CYCLE_TYPE.SEC_120,
    expiryDate: '2026-03-09 14:32:00',
    daysToExpiry: 0,
    hoursToExpiry: 0,
    status: DELIVERY_CONTRACT_STATUS.TRADING,
    volume24h: 15800000,
    position: 880000,
    longPosition: 520000,
    shortPosition: 360000,
    netPosition: 160000,
    longShortRatio: 1.44,
    activeUsers: 428,
    platformPnl24h: 42500,
    userPnl24h: -42500,
    controlActive: true,
    riskLevel: DELIVERY_RISK_LEVEL.HIGH
  },
  {
    symbol: 'SOL300S',
    name: 'SOL/USDT 5分钟',
    baseSymbol: 'SOLUSDT',
    cycleType: DELIVERY_CYCLE_TYPE.SEC_300,
    expiryDate: '2026-03-09 14:35:00',
    daysToExpiry: 0,
    hoursToExpiry: 0,
    status: DELIVERY_CONTRACT_STATUS.TRADING,
    volume24h: 8900000,
    position: 620000,
    longPosition: 240000,
    shortPosition: 380000,
    netPosition: -140000,
    longShortRatio: 0.63,
    activeUsers: 325,
    platformPnl24h: -38000,
    userPnl24h: 38000,
    controlActive: true,
    riskLevel: DELIVERY_RISK_LEVEL.HIGH
  },
  {
    symbol: 'XRP180S',
    name: 'XRP/USDT 3分钟',
    baseSymbol: 'XRPUSDT',
    cycleType: DELIVERY_CYCLE_TYPE.SEC_180,
    expiryDate: '2026-03-09 14:33:00',
    daysToExpiry: 0,
    hoursToExpiry: 0,
    status: DELIVERY_CONTRACT_STATUS.TRADING,
    volume24h: 6800000,
    position: 485000,
    longPosition: 280000,
    shortPosition: 205000,
    netPosition: 75000,
    longShortRatio: 1.37,
    activeUsers: 268,
    platformPnl24h: 28500,
    userPnl24h: -28500,
    controlActive: false,
    riskLevel: DELIVERY_RISK_LEVEL.LOW
  },
  {
    symbol: 'DOGE30S',
    name: 'DOGE/USDT 30秒',
    baseSymbol: 'DOGEUSDT',
    cycleType: DELIVERY_CYCLE_TYPE.SEC_30,
    expiryDate: '2026-03-09 14:30:30',
    daysToExpiry: 0,
    hoursToExpiry: 0,
    status: DELIVERY_CONTRACT_STATUS.TRADING,
    volume24h: 4200000,
    position: 325000,
    longPosition: 165000,
    shortPosition: 160000,
    netPosition: 5000,
    longShortRatio: 1.03,
    activeUsers: 184,
    platformPnl24h: 18200,
    userPnl24h: -18200,
    controlActive: false,
    riskLevel: DELIVERY_RISK_LEVEL.LOW
  },
  {
    symbol: 'ARB600S',
    name: 'ARB/USDT 10分钟',
    baseSymbol: 'ARBUSDT',
    cycleType: DELIVERY_CYCLE_TYPE.SEC_600,
    expiryDate: '2026-03-09 14:40:00',
    daysToExpiry: 0,
    hoursToExpiry: 0,
    status: DELIVERY_CONTRACT_STATUS.TRADING,
    volume24h: 3800000,
    position: 260000,
    longPosition: 195000,
    shortPosition: 65000,
    netPosition: 130000,
    longShortRatio: 3.00,
    activeUsers: 158,
    platformPnl24h: -48000,
    userPnl24h: 48000,
    controlActive: true,
    riskLevel: DELIVERY_RISK_LEVEL.CRITICAL
  }
]

// 持仓分布数据（按到期时间）
export const deliveryExpiryDistribution = [
  { 
    range: '已过期',
    longCount: 0,
    shortCount: 0,
    longVolume: 0,
    shortVolume: 0
  },
  { 
    range: '1分钟内',
    longCount: 385,
    shortCount: 298,
    longVolume: 980000,
    shortVolume: 700000
  },
  { 
    range: '1-3分钟',
    longCount: 425,
    shortCount: 348,
    longVolume: 800000,
    shortVolume: 565000
  },
  { 
    range: '3-5分钟',
    longCount: 268,
    shortCount: 185,
    longVolume: 520000,
    shortVolume: 360000
  },
  { 
    range: '5-10分钟',
    longCount: 325,
    shortCount: 268,
    longVolume: 620000,
    shortVolume: 485000
  },
  { 
    range: '10-30分钟',
    longCount: 285,
    shortCount: 225,
    longVolume: 455000,
    shortVolume: 325000
  }
]

// 用户盈亏分布
export const deliveryPnlDistribution = [
  { range: '亏损>50%', count: 98, percentage: 5.2, totalPnl: -142000 },
  { range: '亏损20-50%', count: 178, percentage: 9.4, totalPnl: -98500 },
  { range: '亏损5-20%', count: 328, percentage: 17.4, totalPnl: -48000 },
  { range: '盈亏±5%', count: 785, percentage: 41.5, totalPnl: 4200 },
  { range: '盈利5-20%', count: 348, percentage: 18.4, totalPnl: 52000 },
  { range: '盈利20-50%', count: 118, percentage: 6.2, totalPnl: 78500 },
  { range: '盈利>50%', count: 35, percentage: 1.9, totalPnl: 154700 }
]

// 大户监控列表
export const deliveryWhalesList = [
  {
    userId: 'user_whale_d001',
    username: 'whale_delivery_01',
    type: DELIVERY_USER_TYPE.WHALE,
    totalPosition: 185000,
    longPosition: 125000,
    shortPosition: 60000,
    pnl24h: 12800,
    pnlRate: 6.9,
    contracts: ['BTC60S', 'ETH120S'],
    nearExpiryPositions: 85000,
    riskLevel: DELIVERY_RISK_LEVEL.HIGH
  },
  {
    userId: 'user_whale_d002',
    username: 'whale_delivery_02',
    type: DELIVERY_USER_TYPE.WHALE,
    totalPosition: 225000,
    longPosition: 225000,
    shortPosition: 0,
    pnl24h: -18500,
    pnlRate: -8.2,
    contracts: ['ARB600S', 'SOL300S'],
    nearExpiryPositions: 140000,
    riskLevel: DELIVERY_RISK_LEVEL.CRITICAL
  },
  {
    userId: 'user_hf_d001',
    username: 'highfreq_delivery',
    type: DELIVERY_USER_TYPE.HIGH_FREQ,
    totalPosition: 148000,
    longPosition: 85000,
    shortPosition: 63000,
    pnl24h: 8500,
    pnlRate: 5.7,
    contracts: ['BTC60S', 'ETH120S', 'XRP180S'],
    nearExpiryPositions: 45000,
    riskLevel: DELIVERY_RISK_LEVEL.MEDIUM
  },
  {
    userId: 'user_active_d001',
    username: 'active_trader_d',
    type: DELIVERY_USER_TYPE.ACTIVE,
    totalPosition: 92000,
    longPosition: 48000,
    shortPosition: 44000,
    pnl24h: 3200,
    pnlRate: 3.5,
    contracts: ['ETH120S', 'DOGE30S'],
    nearExpiryPositions: 28000,
    riskLevel: DELIVERY_RISK_LEVEL.MEDIUM
  },
  {
    userId: 'user_whale_d003',
    username: 'whale_delivery_03',
    type: DELIVERY_USER_TYPE.WHALE,
    totalPosition: 168000,
    longPosition: 48000,
    shortPosition: 120000,
    pnl24h: 15800,
    pnlRate: 9.4,
    contracts: ['SOL300S', 'BTC60S'],
    nearExpiryPositions: 0,
    riskLevel: DELIVERY_RISK_LEVEL.HIGH
  }
]

// 交割风险预警
export const deliveryRiskAlerts = [
  {
    id: 'alert_001',
    priority: SUGGESTION_PRIORITY.URGENT,
    contract: 'ARB600S',
    type: '极端多头持仓',
    description: 'ARB600S合约多空比3.00，距离交割仅10分钟，存在极高交割风险',
    metric: '多空比: 3.00',
    threshold: '正常范围: 0.8-1.5',
    impact: '预计交割亏损: $48,000',
    timestamp: '2026-03-09 14:30:00',
    riskLevel: DELIVERY_RISK_LEVEL.CRITICAL
  },
  {
    id: 'alert_002',
    priority: SUGGESTION_PRIORITY.HIGH,
    contract: 'ETH120S',
    type: '临近交割高持仓',
    description: 'ETH120S合约2分钟内交割，当前持仓$880,000，建议启动交割预控制',
    metric: '持仓量: $880,000',
    threshold: '预警阈值: $500,000',
    impact: '潜在风险: $42,500',
    timestamp: '2026-03-09 14:15:00',
    riskLevel: DELIVERY_RISK_LEVEL.HIGH
  },
  {
    id: 'alert_003',
    priority: SUGGESTION_PRIORITY.HIGH,
    contract: 'SOL300S',
    type: '空头偏重',
    description: 'SOL300S合约空头持仓占比62%，用户整体盈利$38,000，平台亏损',
    metric: '多空比: 0.63',
    threshold: '正常范围: 0.8-1.5',
    impact: '平台亏损: $38,000',
    timestamp: '2026-03-09 13:50:00',
    riskLevel: DELIVERY_RISK_LEVEL.HIGH
  },
  {
    id: 'alert_004',
    priority: SUGGESTION_PRIORITY.MEDIUM,
    contract: 'BTC60S',
    type: '大户持仓集中',
    description: 'BTC60S合约大户持仓集中度较高，建议加强监控',
    metric: '大户持仓: $980,000',
    threshold: '预警阈值: $800,000',
    impact: '风险敞口: $1,680,000',
    timestamp: '2026-03-09 13:20:00',
    riskLevel: DELIVERY_RISK_LEVEL.MEDIUM
  }
]

// 场控操作统计（24小时）
export const deliveryControlStats = {
  totalActions: 38,
  successActions: 35,
  failedActions: 3,
  totalImpact: -125000,
  actionsByType: [
    { action: DELIVERY_CONTROL_ACTION.FORCE_LOSS, count: 15, impact: -85000 },
    { action: DELIVERY_CONTROL_ACTION.FORCE_PROFIT, count: 8, impact: 42000 },
    { action: DELIVERY_CONTROL_ACTION.LOCK_POSITION, count: 10, impact: -58000 },
    { action: DELIVERY_CONTROL_ACTION.ADJUST_PRICE, count: 3, impact: -18000 },
    { action: DELIVERY_CONTROL_ACTION.DELAY_SETTLEMENT, count: 2, impact: -6000 }
  ],
  actionsByContract: deliveryContractsData.map(c => ({
    contract: c.symbol,
    count: Math.floor(Math.random() * 15) + 2,
    impact: Math.floor(Math.random() * 50000) - 25000
  }))
}

// 场控效果对比数据
export const deliveryControlEffectComparison = [
  {
    contract: 'BTC60S',
    beforeControl: {
      platformPnl: -45000,
      userPnl: 45000,
      longShortRatio: 1.85,
      riskLevel: DELIVERY_RISK_LEVEL.HIGH
    },
    afterControl: {
      platformPnl: 68500,
      userPnl: -68500,
      longShortRatio: 1.40,
      riskLevel: DELIVERY_RISK_LEVEL.MEDIUM
    },
    improvement: 113500
  },
  {
    contract: 'ETH120S',
    beforeControl: {
      platformPnl: -28000,
      userPnl: 28000,
      longShortRatio: 2.10,
      riskLevel: DELIVERY_RISK_LEVEL.CRITICAL
    },
    afterControl: {
      platformPnl: 42500,
      userPnl: -42500,
      longShortRatio: 1.44,
      riskLevel: DELIVERY_RISK_LEVEL.HIGH
    },
    improvement: 70500
  },
  {
    contract: 'SOL300S',
    beforeControl: {
      platformPnl: -52000,
      userPnl: 52000,
      longShortRatio: 0.48,
      riskLevel: DELIVERY_RISK_LEVEL.CRITICAL
    },
    afterControl: {
      platformPnl: -38000,
      userPnl: 38000,
      longShortRatio: 0.63,
      riskLevel: DELIVERY_RISK_LEVEL.HIGH
    },
    improvement: 14000
  }
]

// 操作建议列表
export const deliveryActionSuggestions = [
  {
    id: 'suggestion_001',
    priority: SUGGESTION_PRIORITY.URGENT,
    contract: 'ARB600S',
    title: '紧急启动交割前平仓控制',
    description: 'ARB600S距离交割仅10分钟，多空比3.00严重失衡，建议：1) 对大户whale_delivery_02锁定持仓并限制开仓；2) 启动价格微调机制促使部分多头平仓；3) 准备交割时价格控制预案',
    expectedImpact: '预计减少交割亏损$35,000-$45,000',
    actionType: [DELIVERY_CONTROL_ACTION.LOCK_POSITION, DELIVERY_CONTROL_ACTION.ADJUST_PRICE],
    targetUsers: ['user_whale_d002'],
    riskLevel: DELIVERY_RISK_LEVEL.CRITICAL
  },
  {
    id: 'suggestion_002',
    priority: SUGGESTION_PRIORITY.HIGH,
    contract: 'ETH120S',
    title: '启动2分钟交割预控制',
    description: 'ETH120S 2分钟内交割，当前持仓$880,000，建议启动交割前控制：1) 对大额持仓进行风险提示；2) 逐步引导部分用户提前平仓；3) 准备交割价格锚定机制',
    expectedImpact: '预计优化交割结果$20,000-$30,000',
    actionType: [DELIVERY_CONTROL_ACTION.LOCK_POSITION, DELIVERY_CONTROL_ACTION.ADJUST_PRICE],
    targetUsers: ['user_whale_d001'],
    riskLevel: DELIVERY_RISK_LEVEL.HIGH
  },
  {
    id: 'suggestion_003',
    priority: SUGGESTION_PRIORITY.HIGH,
    contract: 'SOL300S',
    title: '空头偏重调控',
    description: 'SOL300S空头占比62%，平台亏损$38,000，建议：1) 对空头大户whale_delivery_03进行持仓监控；2) 适当调整开仓费率鼓励多头建仓；3) 必要时启动价格引导机制',
    expectedImpact: '预计改善盈亏$15,000-$25,000',
    actionType: [DELIVERY_CONTROL_ACTION.ADJUST_PRICE, DELIVERY_CONTROL_ACTION.FORCE_LOSS],
    targetUsers: ['user_whale_d003'],
    riskLevel: DELIVERY_RISK_LEVEL.HIGH
  },
  {
    id: 'suggestion_004',
    priority: SUGGESTION_PRIORITY.MEDIUM,
    contract: 'BTC60S',
    title: '大户持仓监控',
    description: 'BTC60S大户持仓集中，距离交割1分钟，建议：1) 对大额持仓用户进行风险提示；2) 监控大户持仓变化；3) 根据市场波动适时调整风控策略',
    expectedImpact: '预计降低风险，保护平台资金安全',
    actionType: [DELIVERY_CONTROL_ACTION.LOCK_POSITION],
    targetUsers: [],
    riskLevel: DELIVERY_RISK_LEVEL.MEDIUM
  },
  {
    id: 'suggestion_005',
    priority: SUGGESTION_PRIORITY.LOW,
    contract: 'DOGE30S',
    title: '维持当前策略',
    description: 'DOGE30S多空比1.03，较为平衡，距离交圢30秒，当前风险可控，建议继续观察，暂不需要特殊干预',
    expectedImpact: '维持平稳运行',
    actionType: [],
    targetUsers: [],
    riskLevel: DELIVERY_RISK_LEVEL.LOW
  }
]

// 交割历史统计（近30天）
export const deliveryHistoryStats = {
  totalSettlements: 45,
  avgPlatformPnl: 125000,
  totalVolume: 1850000000,
  successRate: 95.6,
  settlementsByType: [
    { type: DELIVERY_CYCLE_TYPE.SEC_30, count: 580, avgPnl: 1200 },
    { type: DELIVERY_CYCLE_TYPE.SEC_60, count: 480, avgPnl: 1850 },
    { type: DELIVERY_CYCLE_TYPE.SEC_120, count: 420, avgPnl: 2800 },
    { type: DELIVERY_CYCLE_TYPE.SEC_180, count: 380, avgPnl: 3500 },
    { type: DELIVERY_CYCLE_TYPE.SEC_300, count: 320, avgPnl: 5200 },
    { type: DELIVERY_CYCLE_TYPE.SEC_600, count: 280, avgPnl: 8500 },
    { type: DELIVERY_CYCLE_TYPE.SEC_900, count: 240, avgPnl: 12000 },
    { type: DELIVERY_CYCLE_TYPE.SEC_1800, count: 180, avgPnl: 18000 }
  ],
  topProfitableContracts: [
    { contract: 'BTC60S', settlementPnl: 2850, settlementDate: '2026-03-09 14:00:00' },
    { contract: 'ETH120S', settlementPnl: 2150, settlementDate: '2026-03-09 13:58:00' },
    { contract: 'SOL300S', settlementPnl: 1850, settlementDate: '2026-03-09 13:55:00' }
  ],
  topLossContracts: [
    { contract: 'ARB600S', settlementPnl: -1250, settlementDate: '2026-03-09 13:50:00' },
    { contract: 'DOGE30S', settlementPnl: -850, settlementDate: '2026-03-09 13:29:30' },
    { contract: 'XRP180S', settlementPnl: -650, settlementDate: '2026-03-09 13:30:00' }
  ]
}

// 趋势数据（最近7天）
export const deliveryPositionTrendData = [
  { date: '03-03', longPosition: 3250000, shortPosition: 2580000, netPosition: 670000 },
  { date: '03-04', longPosition: 3420000, shortPosition: 2680000, netPosition: 740000 },
  { date: '03-05', longPosition: 3580000, shortPosition: 2750000, netPosition: 830000 },
  { date: '03-06', longPosition: 3680000, shortPosition: 2820000, netPosition: 860000 },
  { date: '03-07', longPosition: 3850000, shortPosition: 2920000, netPosition: 930000 },
  { date: '03-08', longPosition: 4120000, shortPosition: 3150000, netPosition: 970000 },
  { date: '03-09', longPosition: 4250000, shortPosition: 3320000, netPosition: 930000 }
]

export const deliveryPnlTrendData = [
  { date: '03-03', platformPnl: 128000, userPnl: -128000 },
  { date: '03-04', platformPnl: 145000, userPnl: -145000 },
  { date: '03-05', platformPnl: 98000, userPnl: -98000 },
  { date: '03-06', platformPnl: 165000, userPnl: -165000 },
  { date: '03-07', platformPnl: 185000, userPnl: -185000 },
  { date: '03-08', platformPnl: 142000, userPnl: -142000 },
  { date: '03-09', platformPnl: 156800, userPnl: -156800 }
]

export const deliveryVolumeTrendData = [
  { date: '03-03', volume: 52000000, contracts: 8 },
  { date: '03-04', volume: 58000000, contracts: 9 },
  { date: '03-05', volume: 48000000, contracts: 8 },
  { date: '03-06', volume: 62000000, contracts: 10 },
  { date: '03-07', volume: 72000000, contracts: 11 },
  { date: '03-08', volume: 65000000, contracts: 9 },
  { date: '03-09', volume: 68500000, contracts: 8 }
]
