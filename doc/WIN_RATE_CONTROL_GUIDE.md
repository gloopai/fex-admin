# 胜率控制详细指南

## 概述
交割合约自动化规则系统的胜率控制功能已全面升级，提供了更灵活、更精细的控制选项。新版本支持多种控制模式，让风控策略更加自然且难以察觉。

## 📊 控制模式

### 1. 固定胜率模式 (Fixed)
**图标：** 🎯  
**适用场景：** 需要明确控制用户胜率的场景

**配置参数：**
- **目标胜率** (0-100%): 设置一个固定的胜率目标
- **应用范围**: 可选择仅应用于新开仓位或所有仓位

**工作原理：**
所有触发此规则的用户订单将严格按照设定的胜率进行结算。例如设置35%，则系统会确保用户每100笔订单中约有35笔盈利。

**示例配置：**
```javascript
{
  mode: 'fixed',
  targetWinRate: 0.35,  // 35% 胜率
  applyToNewPositions: true
}
```

**优点：**
- 控制精确
- 效果可预测
- 配置简单

**注意事项：**
- 固定胜率可能较容易被识别
- 建议配合时间周期使用
- 适合短期干预

---

### 2. 胜率区间模式 (Range)
**图标：** 📊  
**适用场景：** 需要更自然、更难察觉的胜率控制

**配置参数：**
- **最小胜率** (0-100%): 区间下限
- **最大胜率** (0-100%): 区间上限
- **分布策略**: 在区间内随机分布

**工作原理：**
系统不会设置一个固定的胜率，而是让用户的胜率在指定区间内随机波动。这样更接近真实交易场景，不易被用户察觉。

**示例配置：**
```javascript
{
  mode: 'range',
  minWinRate: 0.30,  // 最小 30%
  maxWinRate: 0.40,  // 最大 40%
  strategy: 'random_in_range'
}
```

**优点：**
- 更加自然，难以察觉
- 避免固定模式被识别
- 灵活性高

**推荐配置：**
- 高频交易用户: 30%-40%
- 普通用户: 40%-50%
- VIP用户: 50%-60%

---

### 3. 动态调整模式 (Dynamic)
**图标：** 📈  
**适用场景：** 需要根据用户行为实时调整策略

**配置参数：**
- **基准胜率** (0-100%): 胜率中心值
- **波动范围** (±%): 允许的波动幅度
- **调整因子**: 根据用户表现动态调整

**工作原理：**
系统会根据用户的交易频率、单笔金额、累计盈利等因素，在基准胜率的基础上进行动态调整。例如：
- 用户交易越频繁 → 胜率越低
- 单笔金额越大 → 胜率越低
- 累计盈利越多 → 胜率越低

**示例配置：**
```javascript
{
  mode: 'dynamic',
  targetWinRate: 0.45,    // 基准 45%
  adjustStep: 0.05,       // 波动 ±5%
  strategy: 'gradual'
}
```

**调整策略：**
```
实际胜率 = 基准胜率 - (交易频率系数 × 0.05)
                     - (持仓金额系数 × 0.03)
                     - (累计盈利系数 × 0.02)
```

**优点：**
- 智能化程度高
- 能够针对不同用户采取不同策略
- 风控效果更好

---

### 4. 渐进式模式 (Gradual)
**图标：** 🔄  
**适用场景：** 需要平滑过渡，避免突变被察觉

**配置参数：**
- **目标胜率** (0-100%): 最终要达到的胜率
- **调整步长** (%): 每次调整的幅度
- **调整间隔** (分钟): 多久调整一次

**工作原理：**
系统不会立即将用户胜率调整到目标值，而是分多次逐步调整。例如要从50%降到35%，可以：
- 第1次：降到45% (5分钟后)
- 第2次：降到40% (10分钟后)
- 第3次：降到35% (15分钟后)

**示例配置：**
```javascript
{
  mode: 'gradual',
  targetWinRate: 0.35,    // 目标 35%
  adjustStep: 0.05,       // 每次 5%
  adjustInterval: 5       // 间隔 5 分钟
}
```

**调整过程可视化：**
```
当前胜率: 50%
↓ 5分钟后
45% (-5%)
↓ 5分钟后
40% (-5%)
↓ 5分钟后
35% (-5%) ← 达到目标
```

**优点：**
- 过渡平滑，不易被察觉
- 给用户适应时间
- 降低投诉风险

---

## 🎯 执行操作详解

### 1. 胜率控制 (Win Rate Control)
**动作代码：** `WIN_RATE_CONTROL`

**完整配置示例：**
```javascript
{
  type: 'win_rate_control',
  params: {
    winRateControl: {
      mode: 'range',              // 使用区间模式
      minWinRate: 0.30,
      maxWinRate: 0.40,
      strategy: 'random_in_range'
    },
    applyToNewPositions: true,    // 仅新仓位
    duration: 60                  // 持续60分钟
  }
}
```

---

### 2. 强制亏损 (Force Loss)
**动作代码：** `FORCE_LOSS`

**配置参数：**
- **亏损比例** (0-100%): 订单亏损的百分比
- **影响订单数** (1-10): 接下来多少笔订单执行此策略

**示例配置：**
```javascript
{
  type: 'force_loss',
  params: {
    lossPercent: 0.30,        // 亏损 30%
    nextPositionCount: 1      // 下1笔订单
  }
}
```

**效果预览：**
用户下单 10,000 USDT → 结算时亏损 3,000 USDT

---

### 3. 强制盈利 (Force Win)
**动作代码：** `FORCE_WIN`

**配置参数：**
- **盈利比例** (0-100%): 订单盈利的百分比
- **影响订单数** (1-10): 接下来多少笔订单执行此策略

**示例配置：**
```javascript
{
  type: 'force_win',
  params: {
    profitPercent: 0.20,      // 盈利 20%
    nextPositionCount: 2      // 下2笔订单
  }
}
```

**使用场景：**
- VIP用户保护
- 补偿机制
- 营销活动

---

### 4. 价格调整 (Price Adjust)
**动作代码：** `PRICE_ADJUST`

**配置参数：**
- **结算模式**: 
  - `unfavorable`: 对用户不利
  - `favorable`: 对用户有利
  - `market`: 市场真实价格
- **偏移百分比** (0-10%): 价格偏移幅度

**示例配置：**
```javascript
{
  type: 'price_adjust',
  params: {
    settlePriceMode: 'unfavorable',
    offsetPercent: 0.5         // 偏移 0.5%
  }
}
```

**工作原理：**
- BTC价格 $50,000
- 用户做多
- 结算时使用 $49,750 (0.5% 不利偏移)
- 用户因此亏损

---

### 5. 订单拒绝 (Reject Order)
**动作代码：** `REJECT_ORDER`

**配置参数：**
- **禁止新开仓**: 是否阻止新订单
- **已有持仓胜率** (0-100%): 现有持仓按此胜率结算
- **通知用户**: 是否显示提示消息
- **提示消息**: 自定义拒绝原因

**示例配置：**
```javascript
{
  type: 'reject_order',
  params: {
    lockNewPosition: true,
    existingWinRate: 0.30,
    notifyUser: true,
    notifyMessage: '由于市场波动较大，暂时无法开仓'
  }
}
```

---

### 6. 仓位限制 (Limit Position)
**动作代码：** `LIMIT_POSITION`

**配置参数：**
- **最大持仓价值** (USDT): 单笔订单上限
- **最大杠杆倍数** (1-125x): 允许的最大杠杆

**示例配置：**
```javascript
{
  type: 'limit_position',
  params: {
    maxPositionValue: 5000,   // 最多 5000 USDT
    maxLeverage: 20           // 最大 20x
  }
}
```

---

## 💡 最佳实践

### 1. 胜率控制建议

**高频交易用户 (>20笔/小时):**
```javascript
{
  mode: 'range',
  minWinRate: 0.30,
  maxWinRate: 0.40
}
```

**中频交易用户 (5-20笔/小时):**
```javascript
{
  mode: 'dynamic',
  targetWinRate: 0.45,
  adjustStep: 0.05
}
```

**低频交易用户 (<5笔/小时):**
```javascript
{
  mode: 'fixed',
  targetWinRate: 0.50
}
```

**VIP用户 (高净入金):**
```javascript
{
  mode: 'range',
  minWinRate: 0.50,
  maxWinRate: 0.60
}
```

---

### 2. 组合策略示例

**策略A：高频交易控盈**
```javascript
{
  name: '高频交易用户风控',
  trigger: {
    type: 'trade_count',
    threshold: 20,
    period: 'last_1h',
    conditions: {
      winRate: { operator: '>', value: 0.6 }
    }
  },
  action: {
    type: 'win_rate_control',
    params: {
      winRateControl: {
        mode: 'range',
        minWinRate: 0.30,
        maxWinRate: 0.40
      },
      duration: 60  // 持续1小时
    }
  }
}
```

**策略B：大额止盈**
```javascript
{
  name: '单日盈利封顶',
  trigger: {
    type: 'daily_profit',
    threshold: 5000  // 5000 USDT
  },
  action: {
    type: 'reject_order',
    params: {
      lockNewPosition: true,
      notifyUser: false
    }
  }
}
```

**策略C：连胜阻断**
```javascript
{
  name: '连续盈利干预',
  trigger: {
    type: 'consecutive_wins',
    threshold: 5
  },
  action: {
    type: 'force_loss',
    params: {
      lossPercent: 0.30,
      nextPositionCount: 1
    }
  }
}
```

---

## 🎨 UI 功能说明

### 实时预览
右侧预览面板会实时显示：
1. **规则概览**: 触发条件和执行动作
2. **风险评估**: 0-10分的风险评分
3. **影响分析**: 基于10,000 USDT订单的预估影响
4. **规则摘要**: 一句话总结规则效果

### 快速模板
提供6个预设模板，一键应用：
- 高频交易控盈
- 日盈利封顶
- 大额持仓控制
- 连胜阻断
- VIP用户保护
- 胜率异常干预

### 可视化元素
- **胜率滑块**: 直观调整目标胜率
- **区间显示**: 可视化胜率范围
- **渐进图表**: 显示调整过程
- **影响预测**: 实时计算成本影响

---

## ⚠️ 注意事项

1. **测试环境验证**
   - 所有规则上线前必须在测试环境充分验证
   - 观察至少24小时的效果

2. **风险监控**
   - 高风险规则(评分>7)需要审批
   - 每日检查规则触发情况
   - 关注用户投诉率

3. **合规要求**
   - 确保操作符合当地法规
   - 保留完整的操作日志
   - 定期审计规则配置

4. **用户体验**
   - 避免突然的大幅度调整
   - 优先使用渐进式和区间模式
   - VIP用户需要特殊保护

---

## 📞 技术支持

如有问题，请联系风控团队：
- 邮箱: risk-control@example.com
- 文档: https://docs.example.com/risk-control
- 值班电话: 400-XXX-XXXX

---

**最后更新：** 2026年3月10日  
**文档版本：** v2.0
