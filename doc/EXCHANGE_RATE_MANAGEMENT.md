# 汇率管理模块 (Exchange Rate Management)

## 概述

汇率管理模块隶属于资金管理系统，负责定义平台内所有资产对（如 USDT/BTC, USD/USDT 等）的结算标准，并根据外部市场数据（Oracle/API）自动叠加业务手续费。

## 核心功能

### 1. 交易对配置 (Market Pair Configuration)

#### 双向资产定义
- **基础资产 (Base Asset)**: 交易的基准货币，如 USDT
- **目标资产 (Quote Asset)**: 交易的目标货币，如 BTC
- 示例：USDT/BTC 表示用 USDT 购买 BTC 的汇率

#### 反向汇率自动映射
- 当添加 USDT → BTC 时，系统可自动推导或可选配置 BTC → USDT 的反向逻辑
- 防止出现套利空间
- 可通过 `autoReverse` 字段控制是否启用反向映射

#### 数据源绑定
支持多种外部数据源：
- **Binance (币安)**: 全球最大交易所，实时行情数据
- **OKX**: 主流交易所，提供丰富的交易对数据
- **CoinGecko**: 加密货币数据聚合平台
- **Custom (自定义)**: 手动设置固定汇率

每个交易对可指定不同的外部接口，实现多源数据支持。

### 2. 动态手续费与价差 (Fee & Spread Logic)

#### 溢价/贴现设置 (Markup)
在真实汇率基础上，增加一个百分比或固定值的"点差"：

**计算公式：**
```
买入方向汇率 = 市场汇率 × (1 + 手续费率)
卖出方向汇率 = 市场汇率 × (1 - 手续费率)
```

**示例：**
- 市场价：1 BTC = 43,500 USDT
- 买入费率：0.5%
- 卖出费率：0.5%
- 平台买入价：43,500 × (1 + 0.005) = 43,935 USDT
- 平台卖出价：43,500 × (1 - 0.005) = 43,065 USDT
- 点差收益：870 USDT

#### 分级费率 (Tier-based Fee Structure)
支持根据用户等级应用不同的汇率：

| 用户等级 | 买入费率 | 卖出费率 | 优惠幅度 |
|---------|---------|---------|---------|
| BASIC (普通) | 0.5% | 0.5% | 无 |
| SILVER (白银) | 0.4% | 0.4% | 20% |
| GOLD (黄金) | 0.3% | 0.3% | 40% |
| PLATINUM (白金) | 0.2% | 0.2% | 60% |
| VIP | 0.1% | 0.1% | 80% |

## 数据结构

### ExchangeRatePair

```javascript
{
  id: 'usdt-btc',                    // 唯一标识
  baseAsset: 'USDT',                 // 基础资产
  quoteAsset: 'BTC',                 // 目标资产
  source: 'binance',                 // 数据源
  type: 'floating',                  // 汇率类型：floating/fixed
  marketRate: 0.000023,              // 市场汇率
  buyMarkup: 0.005,                  // 买入费率
  sellMarkup: 0.005,                 // 卖出费率
  buyRate: 0.000023115,              // 平台买入价
  sellRate: 0.000022885,             // 平台卖出价
  enabled: true,                     // 是否启用
  autoReverse: true,                 // 自动反向映射
  userLevelRates: {                  // 分级费率
    basic: { buy: 0.005, sell: 0.005 },
    silver: { buy: 0.004, sell: 0.004 },
    gold: { buy: 0.003, sell: 0.003 },
    platinum: { buy: 0.002, sell: 0.002 },
    vip: { buy: 0.001, sell: 0.001 }
  },
  lastUpdate: '2026-03-11 10:30:00'  // 最后更新时间
}
```

## 使用场景

### 1. 货币兑换业务
用户在平台进行不同货币之间的兑换，系统根据配置的汇率自动计算兑换金额。

### 2. 跨境支付
支持法币与稳定币之间的汇率转换，如 USD ↔ USDT。

### 3. 交易结算
永续合约、交割合约等业务的盈亏结算，使用配置的汇率进行本位币折算。

### 4. 风险管理
通过调整不同用户等级的费率，实现风险控制和利润最大化。

## 操作流程

### 新增交易对

1. 点击「+ 新增交易对」按钮
2. 填写基本信息：
   - 基础资产（如 USDT）
   - 目标资产（如 BTC）
   - 选择数据源
   - 汇率类型（浮动/固定）
   - 市场汇率
3. 配置手续费：
   - 买入费率
   - 卖出费率
   - 系统自动计算买入价和卖出价
4. 设置分级费率（可选）：
   - 为不同用户等级设置优惠费率
5. 启用交易对和反向映射
6. 通过 MFA 安全验证后保存

### 编辑交易对

1. 在列表中找到目标交易对
2. 点击「编辑」按钮
3. 修改相关配置
4. 通过 MFA 验证后保存

### 查看和筛选

- **状态筛选**: 全部 / 已启用 / 已禁用
- **搜索**: 支持按交易对名称搜索（如 USDT/BTC）

## 安全机制

### MFA 验证
所有汇率配置的修改操作都需要通过 MFA（多因素认证）验证，确保操作安全性。

### 审计日志
每次配置变更都会记录：
- 操作时间
- 操作人员
- 变更前后的值
- MFA 验证记录

## 技术实现

### 前端文件
- **页面组件**: `/src/pages/assets/AssetsExchangeRatePage.vue`
- **常量定义**: `/src/constants/assets.js`
- **模拟数据**: `/src/mock/assets.js`
- **导航配置**: `/src/config/nav.js`
- **路由配置**: `/src/router/index.js`

### 关键代码逻辑

#### 汇率计算
```javascript
const calculateRates = () => {
  form.buyRate = form.marketRate * (1 + form.buyMarkup)
  form.sellRate = form.marketRate * (1 - form.sellMarkup)
}
```

#### 分级费率初始化
```javascript
const initUserLevelRates = () => {
  form.userLevelRates = {
    [USER_LEVEL_TIER.BASIC]: { buy: form.buyMarkup, sell: form.sellMarkup },
    [USER_LEVEL_TIER.SILVER]: { buy: form.buyMarkup * 0.8, sell: form.sellMarkup * 0.8 },
    [USER_LEVEL_TIER.GOLD]: { buy: form.buyMarkup * 0.6, sell: form.sellMarkup * 0.6 },
    [USER_LEVEL_TIER.PLATINUM]: { buy: form.buyMarkup * 0.4, sell: form.sellMarkup * 0.4 },
    [USER_LEVEL_TIER.VIP]: { buy: form.buyMarkup * 0.2, sell: form.sellMarkup * 0.2 }
  }
}
```

## 扩展功能建议

### 1. 实时数据同步
- 接入 WebSocket 实现实时行情推送
- 定时轮询更新市场汇率
- 设置汇率波动阈值告警

### 2. 历史汇率查询
- 记录每次汇率变更历史
- 支持按时间范围查询
- 生成汇率走势图表

### 3. 批量操作
- 批量启用/禁用交易对
- 批量调整费率
- 导入导出配置

### 4. 自动化策略
- 根据市场波动自动调整费率
- 高峰时段动态加价
- 竞争对价格自动跟随

## 注意事项

1. **套利风险防范**: 启用反向映射时，确保买卖价格合理，避免出现套利空间
2. **汇率更新频率**: 浮动汇率应定期更新，避免与市场脱节
3. **费率合理性**: 手续费率应在合理范围内，过高影响用户体验，过低影响利润
4. **数据安全**: 汇率配置属于敏感操作，必须通过 MFA 验证
5. **备份机制**: 当外部数据源失效时，应有备用方案（如切换到固定汇率）

## 相关文件

- 主页面：`/src/pages/assets/AssetsExchangeRatePage.vue`
- 常量：`/src/constants/assets.js`
- Mock 数据：`/src/mock/assets.js`
- 导航：`/src/config/nav.js`
- 路由：`/src/router/index.js`
