import { RISK_LEVEL, POSITION_SIDE, USER_TYPE } from '../constants/perpetualReport'

// 市场概览数据
export const marketOverviewData = {
  totalVolume24h: 158600000,     // 24h总交易量 (USDT)
  totalPosition: 9850000,        // 总持仓 (USDT)
  totalUsers: 4850,              // 总用户数
  activeUsers24h: 3420,          // 24h活跃用户
  platformPnl24h: 285400,        // 24h平台盈亏 (USDT)
  userPnl24h: -285400,           // 24h用户盈亏 (USDT)
  longShortRatio: 1.35,          // 多空比
  avgLeverage: 16.8,             // 平均杠杆
  riskLevel: RISK_LEVEL.MEDIUM   // 整体风险等级
}

// 各合约数据
export const contractsData = [
  {
    symbol: 'BTCUSDT',
    name: 'BTC/USDT 永续',
    volume24h: 45600000,
    position: 2850000,
    longPosition: 1680000,
    shortPosition: 1170000,
    netPosition: 510000,
    longShortRatio: 1.44,
    activeUsers: 1245,
    platformPnl24h: 125000,
    userPnl24h: -125000,
    avgLeverage: 18.2,
    controlActive: true,
    riskLevel: RISK_LEVEL.MEDIUM
  },
  {
    symbol: 'ETHUSDT',
    name: 'ETH/USDT 永续',
    volume24h: 28400000,
    position: 1950000,
    longPosition: 1100000,
    shortPosition: 850000,
    netPosition: 250000,
    longShortRatio: 1.29,
    activeUsers: 980,
    platformPnl24h: 88500,
    userPnl24h: -88500,
    avgLeverage: 15.3,
    controlActive: true,
    riskLevel: RISK_LEVEL.LOW
  },
  {
    symbol: 'SOLUSDT',
    name: 'SOL/USDT 永续',
    volume24h: 18900000,
    position: 1250000,
    longPosition: 480000,
    shortPosition: 770000,
    netPosition: -290000,
    longShortRatio: 0.62,
    activeUsers: 645,
    platformPnl24h: -78000,
    userPnl24h: 78000,
    avgLeverage: 22.5,
    controlActive: true,
    riskLevel: RISK_LEVEL.HIGH
  },
  {
    symbol: 'DOGEUSDT',
    name: 'DOGE/USDT 永续',
    volume24h: 15200000,
    position: 850000,
    longPosition: 440000,
    shortPosition: 410000,
    netPosition: 30000,
    longShortRatio: 1.07,
    activeUsers: 520,
    platformPnl24h: 42000,
    userPnl24h: -42000,
    avgLeverage: 8.5,
    controlActive: false,
    riskLevel: RISK_LEVEL.LOW
  },
  {
    symbol: 'XRPUSDT',
    name: 'XRP/USDT 永续',
    volume24h: 22800000,
    position: 1450000,
    longPosition: 850000,
    shortPosition: 600000,
    netPosition: 250000,
    longShortRatio: 1.42,
    activeUsers: 725,
    platformPnl24h: 12500,
    userPnl24h: -12500,
    avgLeverage: 14.2,
    controlActive: true,
    riskLevel: RISK_LEVEL.MEDIUM
  },
  {
    symbol: 'ARBUSDT',
    name: 'ARB/USDT 永续',
    volume24h: 12500000,
    position: 980000,
    longPosition: 720000,
    shortPosition: 260000,
    netPosition: 460000,
    longShortRatio: 2.77,
    activeUsers: 425,
    platformPnl24h: -125000,
    userPnl24h: 125000,
    avgLeverage: 35.8,
    controlActive: true,
    riskLevel: RISK_LEVEL.CRITICAL
  },
  {
    symbol: 'OPUSDT',
    name: 'OP/USDT 永续',
    volume24h: 5800000,
    position: 420000,
    longPosition: 215000,
    shortPosition: 205000,
    netPosition: 10000,
    longShortRatio: 1.05,
    activeUsers: 285,
    platformPnl24h: 28600,
    userPnl24h: -28600,
    avgLeverage: 9.2,
    controlActive: false,
    riskLevel: RISK_LEVEL.LOW
  },
  {
    symbol: 'MATICUSDT',
    name: 'MATIC/USDT 永续',
    volume24h: 9400000,
    position: 1100000,
    longPosition: 420000,
    shortPosition: 680000,
    netPosition: -260000,
    longShortRatio: 0.62,
    activeUsers: 595,
    platformPnl24h: -91200,
    userPnl24h: 91200,
    avgLeverage: 19.7,
    controlActive: true,
    riskLevel: RISK_LEVEL.HIGH
  }
]

// 持仓分布数据 (按杠杆倍数)
export const leverageDistribution = [
  { leverage: '1-5x', longCount: 485, shortCount: 398, longVolume: 1120000, shortVolume: 880000 },
  { leverage: '5-10x', longCount: 768, shortCount: 615, longVolume: 1780000, shortVolume: 1320000 },
  { leverage: '10-20x', longCount: 892, shortCount: 768, longVolume: 2450000, shortVolume: 1880000 },
  { leverage: '20-50x', longCount: 568, shortCount: 485, longVolume: 1650000, shortVolume: 1420000 },
  { leverage: '50-100x', longCount: 285, shortCount: 228, longVolume: 920000, shortVolume: 760000 },
  { leverage: '100x+', longCount: 45, shortCount: 35, longVolume: 245000, shortVolume: 195000 }
]

// 用户盈亏分布
export const pnlDistribution = [
  { range: '亏损>50%', count: 185, percentage: 5.4, totalPnl: -285000 },
  { range: '亏损20-50%', count: 328, percentage: 9.6, totalPnl: -198000 },
  { range: '亏损5-20%', count: 585, percentage: 17.1, totalPnl: -92000 },
  { range: '盈亏±5%', count: 1405, percentage: 41.1, totalPnl: 8500 },
  { range: '盈利5-20%', count: 625, percentage: 18.3, totalPnl: 106000 },
  { range: '盈利20-50%', count: 215, percentage: 6.3, totalPnl: 152000 },
  { range: '盈利>50%', count: 77, percentage: 2.2, totalPnl: 308500 }
]

// 大户监控列表
export const whalesList = [
  {
    userId: 'user_whale_001',
    username: 'whale_alpha',
    type: USER_TYPE.WHALE,
    totalPosition: 250000,
    longPosition: 150000,
    shortPosition: 100000,
    leverage: 25,
    pnl24h: 18500,
    pnlRate: 7.4,
    contracts: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'],
    riskLevel: RISK_LEVEL.HIGH
  },
  {
    userId: 'user_whale_002',
    username: 'whale_beta',
    type: USER_TYPE.WHALE,
    totalPosition: 320000,
    longPosition: 320000,
    shortPosition: 0,
    leverage: 50,
    pnl24h: -28000,
    pnlRate: -8.8,
    contracts: ['ARBUSDT', 'XRPUSDT'],
    riskLevel: RISK_LEVEL.CRITICAL
  },
  {
    userId: 'user_hf_001',
    username: 'hf_trader',
    type: USER_TYPE.HIGH_FREQ,
    totalPosition: 85000,
    longPosition: 45000,
    shortPosition: 40000,
    leverage: 10,
    pnl24h: 8200,
    pnlRate: 9.6,
    contracts: ['BTCUSDT', 'ETHUSDT', 'DOGEUSDT'],
    riskLevel: RISK_LEVEL.MEDIUM
  },
  {
    userId: 'user_whale_003',
    username: 'whale_gamma',
    type: USER_TYPE.WHALE,
    totalPosition: 220000,
    longPosition: 80000,
    shortPosition: 140000,
    leverage: 20,
    pnl24h: 15800,
    pnlRate: 7.2,
    contracts: ['SOLUSDT', 'MATICUSDT'],
    riskLevel: RISK_LEVEL.HIGH
  }
]

// 时间序列数据 - 持仓趋势 (近24小时，每小时一个点)
export const positionTrendData = Array.from({ length: 24 }, (_, i) => {
  const hour = i
  const time = `${hour.toString().padStart(2, '0')}:00`
  return {
    time,
    longPosition: 1600000 + Math.sin(i / 3) * 200000 + Math.random() * 100000,
    shortPosition: 1150000 + Math.cos(i / 4) * 180000 + Math.random() * 80000,
    netPosition: 450000 + Math.sin(i / 2) * 150000
  }
})

// 时间序列数据 - 盈亏趋势 (近24小时)
export const pnlTrendData = Array.from({ length: 24 }, (_, i) => {
  const hour = i
  const time = `${hour.toString().padStart(2, '0')}:00`
  return {
    time,
    platformPnl: 5000 + Math.random() * 8000,
    userPnl: -5000 - Math.random() * 8000,
    cumulativePnl: 125000 + i * 5000 + Math.random() * 10000
  }
})

// 时间序列数据 - 交易量趋势 (近24小时)
export const volumeTrendData = Array.from({ length: 24 }, (_, i) => {
  const hour = i
  const time = `${hour.toString().padStart(2, '0')}:00`
  const baseVolume = 1800000
  const peakHours = [9, 10, 14, 15, 20, 21] // 交易高峰时段
  const multiplier = peakHours.includes(hour) ? 1.5 : 1.0
  return {
    time,
    volume: baseVolume * multiplier + Math.random() * 400000,
    orderCount: 850 * multiplier + Math.random() * 200,
    activeUsers: 65 * multiplier + Math.random() * 15
  }
})

// 线控触发统计
export const controlTriggerStats = [
  {
    contractSymbol: 'BTCUSDT',
    contractName: 'BTC/USDT 永续',
    ruleName: '多头过重自动调整',
    triggerCount: 23,
    lastTriggerTime: '2026-03-09 14:30:00',
    avgDuration: 1850,  // 秒
    effectRating: 'good', // good, normal, poor
    pnlImprovement: 28500 // 预估改善的平台盈亏
  },
  {
    contractSymbol: 'BTCUSDT',
    contractName: 'BTC/USDT 永续',
    ruleName: '用户盈利过高干预',
    triggerCount: 8,
    lastTriggerTime: '2026-03-09 12:15:00',
    avgDuration: 3200,
    effectRating: 'good',
    pnlImprovement: 15800
  },
  {
    contractSymbol: 'ETHUSDT',
    contractName: 'ETH/USDT 永续',
    ruleName: '短时成交异常保护',
    triggerCount: 12,
    lastTriggerTime: '2026-03-09 13:45:00',
    avgDuration: 1200,
    effectRating: 'normal',
    pnlImprovement: 8200
  },
  {
    contractSymbol: 'ARBUSDT',
    contractName: 'ARB/USDT 永续',
    ruleName: '极端多头紧急线控',
    triggerCount: 35,
    lastTriggerTime: '2026-03-09 14:50:00',
    avgDuration: 2800,
    effectRating: 'poor',
    pnlImprovement: -8500
  },
  {
    contractSymbol: 'SOLUSDT',
    contractName: 'SOL/USDT 永续',
    ruleName: '空头占优价格调整',
    triggerCount: 18,
    lastTriggerTime: '2026-03-09 14:10:00',
    avgDuration: 2100,
    effectRating: 'normal',
    pnlImprovement: 12000
  },
  {
    contractSymbol: 'XRPUSDT',
    contractName: 'XRP/USDT 永续',
    ruleName: '多空平衡维护',
    triggerCount: 6,
    lastTriggerTime: '2026-03-09 11:20:00',
    avgDuration: 1500,
    effectRating: 'good',
    pnlImprovement: 5200
  }
]

// 风险预警列表
export const riskAlerts = [
  {
    id: 'alert_001',
    time: '2026-03-09 14:55:00',
    level: RISK_LEVEL.CRITICAL,
    type: '平台严重亏损',
    contract: 'ARBUSDT',
    message: 'ARB合约平台亏损 $125K，多空比 2.77，用户大量盈利',
    suggestion: '紧急启用所有线控规则，最大化价格偏移和点差，考虑限制高杠杆'
  },
  {
    id: 'alert_002',
    time: '2026-03-09 14:35:00',
    level: RISK_LEVEL.HIGH,
    type: '持仓集中风险',
    contract: 'ARBUSDT',
    message: '大户 whale_beta 持仓 $320K，全部做多，杠杆50倍',
    suggestion: '立即启用针对性线控，主动联系用户协商降低仓位或杠杆'
  },
  {
    id: 'alert_003',
    time: '2026-03-09 14:28:00',
    level: RISK_LEVEL.HIGH,
    type: '平台亏损',
    contract: 'MATICUSDT',
    message: 'MATIC合约平台亏损 $91.2K，空头占优，高杠杆盛行',
    suggestion: '启用强力线控，提高点差和滑点，限制高杠杆开仓'
  },
  {
    id: 'alert_004',
    time: '2026-03-09 14:20:00',
    level: RISK_LEVEL.HIGH,
    type: '平台亏损',
    contract: 'SOLUSDT',
    message: 'SOL合约平台亏损 $78K，空头占优 0.62，高杠杆 22.5x',
    suggestion: '调整价格偏移至做空方向，提高拒单率和成交延迟'
  },
  {
    id: 'alert_005',
    time: '2026-03-09 14:10:00',
    level: RISK_LEVEL.MEDIUM,
    type: '多空失衡',
    contract: 'BTCUSDT',
    message: '多空比达到 1.44，多头持仓显著高于空头',
    suggestion: '建议调整价格偏移方向，向下偏移以平衡多空'
  },
  {
    id: 'alert_006',
    time: '2026-03-09 13:50:00',
    level: RISK_LEVEL.MEDIUM,
    type: '用户盈利集中',
    contract: 'ETHUSDT',
    message: '前10名盈利用户占总盈利的 68%',
    suggestion: '监控盈利大户的交易行为，必要时启用线控'
  },
  {
    id: 'alert_007',
    time: '2026-03-09 13:30:00',
    level: RISK_LEVEL.MEDIUM,
    type: '高杠杆集中',
    contract: 'ARBUSDT',
    message: '超过 42% 的持仓使用 20x 以上杠杆，平均杠杆 35.8x',
    suggestion: '限制新增高杠杆开仓，考虑降低最大杠杆倍数'
  },
  {
    id: 'alert_008',
    time: '2026-03-09 13:15:00',
    level: RISK_LEVEL.LOW,
    type: '交易量激增',
    contract: 'BTCUSDT',
    message: '13:00-14:00 交易量较平均水平增长 85%',
    suggestion: '持续监控，可能有大户活动或市场波动'
  }
]

// 线控效果对比数据 (线控开启前后对比)
export const controlEffectComparison = {
  beforeControl: {
    period: '线控前 (2026-03-01 ~ 03-04)',
    platformPnl: 285000,
    userPnl: -285000,
    avgLongShortRatio: 1.58,
    maxDrawdown: -45000,
    volatility: 0.28
  },
  afterControl: {
    period: '线控后 (2026-03-05 ~ 03-09)',
    platformPnl: 452000,
    userPnl: -452000,
    avgLongShortRatio: 1.32,
    maxDrawdown: -28000,
    volatility: 0.19
  },
  improvement: {
    pnlIncrease: 58.6,       // 盈亏改善百分比
    ratioImprove: 16.5,      // 多空比改善
    drawdownReduce: 37.8,    // 回撤减少
    volatilityReduce: 32.1   // 波动率降低
  }
}

// 操作建议
export const actionSuggestions = [
  {
    priority: 'critical',
    contract: 'ARBUSDT',
    title: '紧急启用所有线控规则',
    reason: 'ARB合约严重风险：平台亏损 $125K，极端多头 2.77，超高杠杆 35.8x',
    expectedEffect: '紧急止损，预计可减少 50-80K 进一步亏损',
    action: '立即启用所有线控规则，最大化价格偏移和点差，限制高杠杆开仓'
  },
  {
    priority: 'critical',
    contract: 'ARBUSDT',
    title: '限制大户 whale_beta 交易',
    reason: '该用户持仓 $320K，全部做多 50x 杠杆，风险极高',
    expectedEffect: '控制最大风险敞口',
    action: '主动联系用户协商平仓或降低杠杆，必要时实施账户限制'
  },
  {
    priority: 'high',
    contract: 'MATICUSDT',
    title: '启用强力线控规则',
    reason: 'MATIC合约平台亏损 $91.2K，空头占优 0.62，高杠杆 19.7x',
    expectedEffect: '预计可改善平台盈亏 40-60K USDT/天',
    action: '提高点差倍数 3-5x，大幅提升拒单率和滑点'
  },
  {
    priority: 'high',
    contract: 'SOLUSDT',
    title: '调整价格偏移至空头方向',
    reason: 'SOL合约平台亏损 $78K，空头占优，需要向做空方向偏移',
    expectedEffect: '平衡多空比，减少平台对冲成本',
    action: '设置价格向空头方向偏移 0.1-0.2%，提高拒单率'
  },
  {
    priority: 'high',
    contract: 'BTCUSDT',
    title: '启用"多头过重自动调整"规则',
    reason: '当前多空比 1.44，多头持仓过重，建议启用此规则平衡持仓',
    expectedEffect: '预计可改善平台盈亏 20-30K USDT/天',
    action: '前往线控页面启用规则'
  },
  {
    priority: 'medium',
    contract: 'XRPUSDT',
    title: '维持当前线控策略',
    reason: 'XRP合约盈亏接近平衡，多空比 1.42 略微失衡',
    expectedEffect: '稳定当前盈利状况',
    action: '保持现有线控规则，密切监控变化'
  },
  {
    priority: 'medium',
    contract: 'ETHUSDT',
    title: '优化现有线控参数',
    reason: 'ETH合约盈利稳定 $88.5K，可通过参数优化进一步提升',
    expectedEffect: '预计可提升 10-15% 收益',
    action: '微调价格偏移和点差倍数，在用户体验和收益间找平衡'
  },
  {
    priority: 'low',
    contract: 'DOGEUSDT',
    title: '保持低风险运营',
    reason: 'DOGE合约运行良好：低风险，平台盈利，多空平衡，低杠杆',
    expectedEffect: '维持稳定收益',
    action: '继续观察，无需调整'
  },
  {
    priority: 'low',
    contract: 'OPUSDT',
    title: '考虑开启适度线控',
    reason: 'OP合约虽然低风险，但交易量较小，可通过线控优化收益',
    expectedEffect: '在不影响用户体验前提下提升 5-10% 收益',
    action: '启用轻量级线控规则，避免过度干预'
  }
]
