# 交割合约文档中心

## 📚 文档索引

### 🎯 核心概念（必读）

#### [WIN_RATE_VS_LINE_CONTROL.md](./WIN_RATE_VS_LINE_CONTROL.md)
**⚠️ 重要认知纠正**
- 说明为什么交割合约不应该用"胜率"控制
- 解释"线控"（价格线控制）才是正确方式
- 对比二元期权 vs 交割合约的本质区别
- **适合人群**：所有开发和运营人员必读

#### [LINE_CONTROL_IMPLEMENTATION.md](./LINE_CONTROL_IMPLEMENTATION.md)
**线控技术实现方案**
- 正确的控制目标：期望值、盈亏比、累计控制
- 4种技术手段：结算价格选择、时间窗口、滑点、K线偏移
- 3种控制策略：动态期望值、累计限制、盈亏比控制
- 完整代码示例和流程演示
- **适合人群**：技术开发人员

---

### 📖 详细文档（参考）

#### [WIN_RATE_CONTROL_GUIDE.md](./WIN_RATE_CONTROL_GUIDE.md)
**用户配置指南**
- 4种控制模式：固定、区间、动态、渐进
- 每种模式的配置说明和最佳实践
- 适用场景分析
- **注意**：术语需要更新为"盈亏控制"

#### [WIN_RATE_CONTROL_IMPLEMENTATION.md](./WIN_RATE_CONTROL_IMPLEMENTATION.md)
**技术实现细节**
- 完整的代码实现
- 订单生命周期
- 多交易所价格聚合
- **注意**：算法逻辑需要按照"线控"方式调整

#### [CRYPTO_WIN_RATE_CONTROL_EXPLAINED.md](./CRYPTO_WIN_RATE_CONTROL_EXPLAINED.md)
**法律和业务解释**
- 为什么交割合约可以控制价格
- 多交易所加权平均的合法性
- 与二元期权的区别
- **注意**：核心概念正确，但术语需要更新

#### [WIN_RATE_CONTROL_CASES.md](./WIN_RATE_CONTROL_CASES.md)
**案例研究**
- 8个可视化案例
- 不同市场情况下的处理方式
- 带流程图和时间线
- **注意**：案例有效，但说明需要更新

#### [WIN_RATE_CONTROL_README.md](./WIN_RATE_CONTROL_README.md)
**导航文档**
- 所有文档的快速索引
- FAQ 常见问题
- **注意**：需要更新文档路径和术语

---

### 🏗️ 架构和设计

#### [DELIVERY_CONTROL_ARCHITECTURE.js](./DELIVERY_CONTROL_ARCHITECTURE.js)
**系统架构文档**
- 交割合约自动化控制系统架构
- 模块设计和数据流
- 代码注释形式的文档

#### [RULE_MODAL_DESIGN.md](./RULE_MODAL_DESIGN.md)
**规则模态框设计**
- DeliveryRuleModal 组件设计文档
- UI/UX 规范
- 交互流程

#### [VERIFICATION_MODULE.md](./VERIFICATION_MODULE.md)
**用户验证模块**
- 用户身份验证功能
- KYC 流程设计

---

## 🔄 文档状态

### ✅ 最新（推荐阅读）
1. **WIN_RATE_VS_LINE_CONTROL.md** - 核心概念纠正
2. **LINE_CONTROL_IMPLEMENTATION.md** - 正确的实现方案

### ⚠️ 需要更新术语
以下文档的核心逻辑正确，但术语需要从"胜率控制"更新为"盈亏控制/线控"：
- WIN_RATE_CONTROL_GUIDE.md
- WIN_RATE_CONTROL_IMPLEMENTATION.md
- CRYPTO_WIN_RATE_CONTROL_EXPLAINED.md
- WIN_RATE_CONTROL_CASES.md
- WIN_RATE_CONTROL_README.md

### 🔧 待调整
- 代码实现需要按照"线控"方式重构
- UI 界面需要更新术语和控制目标

---

## 🎯 快速开始

### 如果你是新手
1. 先读 [WIN_RATE_VS_LINE_CONTROL.md](./WIN_RATE_VS_LINE_CONTROL.md) 理解核心概念
2. 再读 [LINE_CONTROL_IMPLEMENTATION.md](./LINE_CONTROL_IMPLEMENTATION.md) 了解实现方式

### 如果你是开发人员
1. 阅读 [LINE_CONTROL_IMPLEMENTATION.md](./LINE_CONTROL_IMPLEMENTATION.md) 了解技术方案
2. 参考 [DELIVERY_CONTROL_ARCHITECTURE.js](./DELIVERY_CONTROL_ARCHITECTURE.js) 了解系统架构
3. 查看 [RULE_MODAL_DESIGN.md](./RULE_MODAL_DESIGN.md) 了解 UI 设计

### 如果你是产品/运营
1. 阅读 [WIN_RATE_VS_LINE_CONTROL.md](./WIN_RATE_VS_LINE_CONTROL.md) 理解业务逻辑
2. 参考 [WIN_RATE_CONTROL_CASES.md](./WIN_RATE_CONTROL_CASES.md) 了解实际案例
3. 阅读 [CRYPTO_WIN_RATE_CONTROL_EXPLAINED.md](./CRYPTO_WIN_RATE_CONTROL_EXPLAINED.md) 了解合规性

---

## 📊 关键概念速查

### ❌ 错误概念
- "胜率控制" - 不适用于交割合约
- "目标胜率35%" - 只看赢输次数，忽略盈亏金额
- 简单的二元判断（赢/输）

### ✅ 正确概念
- **线控** - 通过价格线控制盈亏
- **期望值控制** - 目标：每单平均盈亏 -$50
- **盈亏比控制** - 赢$200 vs 输$150
- **累计控制** - 总盈利/亏损限制
- **阶段策略** - 新用户让赚 → 老用户小亏

### 🔧 技术手段
1. **结算价格选择** - 在市场范围内选择有利价格
2. **时间窗口选择** - 利用秒级价格波动
3. **滑点控制** - 开仓和平仓时的价格差异
4. **K线显示偏移** - 轻微调整显示价格（< 0.1%）

### 📈 监控指标
- 平台日盈利
- 用户平均期望值
- 盈亏比（赢金额/输金额）
- 用户累计盈亏分布
- 风险用户数量

---

## 🔗 相关资源

### 代码文件
- `/src/components/DeliveryRuleModal.vue` - 规则配置界面
- `/src/constants/deliveryControl.js` - 控制模式常量
- `/src/services/winRateControl.js` - 控制引擎实现
- `/src/mock/deliveryControl.js` - 模拟数据

### 外部参考
- 加密货币交易所 API 文档
- 期货合约交易规则
- 风险控制最佳实践

---

**最后更新：2026年3月10日**

*文档整理完成，下一步：按照"线控"概念重构代码和UI*
