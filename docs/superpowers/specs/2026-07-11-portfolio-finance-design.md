# 投资组合产品模块设计

日期：2026-07-11

## 背景与目标

在现有交易所前台金融模块中新增“投资组合”产品频道，并在管理台新增对应配置与运营页面。该模块参考用户提供的竞品截图，但界面风格必须贴合当前项目已有的 AI 量化、锁仓、借贷模块，不直接复制竞品的低保真移动端样式。

本期只制作前端功能界面与本地 mock 数据，不做服务端、接口、真实钱包扣款、链上执行或真实调仓。

## 产品定位

本期采用“定期投资组合收益产品”定位：

- 用户以 USDT 申购一个包含多个币种的组合产品。
- 产品有固定运行周期，例如 3 天、5 天、7 天。
- 前台展示日收益率区间，例如 0.20% - 0.60%/天。
- 到期后按订单实际收益结算，前端本期使用 mock 数据模拟。
- 提前赎回是否支持由后台按产品配置。

不做 OKX Smart Portfolio 那类真实比例调仓机器人，也不做 Binance Auto-Invest 那类定投计划。原因是参考图的核心信息是投资区间、运行天数、收益区间、剩余额度和认购流程，更接近固定期限理财产品，与当前项目已有 AI 量化模块的业务和视觉结构更一致。

## 外部调研结论

调研到的主流交易所组合类产品大致分三类：

- 智能调仓组合：用户选择多币种权重，系统按阈值或时间周期自动再平衡，例如 OKX Smart Portfolio。
- 定投组合：用户按周期买入一组资产，强调长期累积与平均成本，例如 Binance Auto-Invest。
- 固定期限收益产品：用户投入单一计价币种，平台展示组合资产、周期、收益区间、费用和赎回规则，运营后台控制产品参数。

本项目采用第三类，主要因为它和用户截图、现有 AI 量化产品、后台产品配置模型最匹配。

## 前台信息架构

新增金融频道：

- 路由：`/front/finance/portfolio`
- 详情路由：`/front/finance/portfolio/:productId`
- 顶部金融下拉、移动端抽屉、金融首页卡片都增加“投资组合”入口。

页面结构：

- 投资组合列表页
- 投资组合详情/认购页
- 我的组合订单区
- 认购弹窗
- 提前赎回弹窗

前台页面使用当前金融模块深色风格，参考 `FinanceAiQuantListPage.vue` 和 `FinanceAiQuantDetailPage.vue`：

- 黑色背景、lime/emerald 作为强调色。
- 卡片、表格、状态胶囊、分页样式沿用 AI 量化。
- 列表页提供“组合市场 / 我的组合”切换。
- 卡片内展示组合币种、周期、日收益区间、金额区间、剩余份额、状态和 CTA。

## 前台列表页

列表页展示：

- 组合名称，例如“USDT + ETH + BTC 稳健组合”
- 组合币种 chips，例如 `USDT`、`ETH`、`BTC`
- 运行周期，例如 `3 天`
- 日收益区间，例如 `0.20% - 0.60%/天`
- 投资区间，例如 `1,000 - 30,000 USDT`
- 剩余份额/可参与次数，例如 `剩余 3 份`
- 手续费率，例如 `0.30%`
- 提前赎回规则摘要，例如 `支持提前赎回，扣除全部收益`
- 产品状态：已启用、已售罄、维护中、已禁用

交互：

- 点击卡片或“查看详情”进入详情页。
- 点击“参与使用”打开认购弹窗。
- 未启用、售罄、维护中的产品不可认购，按钮展示对应状态。
- 我的组合区展示运行中、已到期、已赎回、已取消订单。

## 详情与认购

详情页展示：

- 面包屑：金融 / 投资组合 / 产品名称
- 产品头部：组合名称、状态、币种组合、风险提示
- 核心指标：运行周期、日收益区间、投资区间、手续费、剩余份额
- 收益模拟：输入申购金额后展示最低收益、最高收益、手续费、预计到账区间
- 规则说明：计息方式、到期结算、提前赎回、费用说明
- 操作区：认购按钮、返回列表按钮

认购弹窗字段：

- 申购金额，单位固定为 USDT
- 当前可用余额，本期 mock 展示
- 投资区间校验
- 手续费
- 预估最低收益
- 预估最高收益
- 预计到账区间
- 确认认购按钮

## 计算规则

输入金额单位统一为 USDT。

收益率配置使用百分比，例如 `0.20` 表示 `0.20%/天`。

预估最低收益：

```text
minYield = principal * (minDailyRatePct / 100) * durationDays
```

预估最高收益：

```text
maxYield = principal * (maxDailyRatePct / 100) * durationDays
```

认购手续费：

```text
fee = principal * (subscriptionFeePct / 100)
```

预计到账区间：

```text
minSettlement = principal + minYield - fee
maxSettlement = principal + maxYield - fee
```

示例：

```text
申购金额：1,000 USDT
周期：3 天
日收益区间：0.20% - 0.60%
手续费率：0.30%

最低收益 = 1000 * 0.20% * 3 = 6 USDT
最高收益 = 1000 * 0.60% * 3 = 18 USDT
手续费 = 1000 * 0.30% = 3 USDT
预计到账区间 = 1003 - 1015 USDT
```

## 提前赎回规则

提前赎回做成后台产品级配置，前台只展示和执行当前产品配置。

配置字段：

- `earlyRedeemEnabled`：是否允许提前赎回。
- `earlyRedeemMode`：提前赎回处理方式。
- `earlyRedeemFeePct`：提前赎回手续费率。
- `minHoldingDays`：最短持有天数。
- `redeemArrivalMode`：赎回到账时间。

提前赎回处理方式：

- `forfeit_yield`：扣除全部收益，只返还本金并扣赎回手续费。
- `fee_only`：保留已产生收益，额外扣赎回手续费。
- `accrued_days`：按已持有天数计息，再扣赎回手续费。

默认 mock 产品使用：

- 大部分产品支持提前赎回。
- 默认模式为 `forfeit_yield`。
- 最短持有天数为 1 天。
- 赎回到账为 T+1。

## 管理台信息架构

新增后台菜单：“投资组合”。

子页面：

- 产品管理：配置组合产品、收益区间、费用、份额、状态和赎回规则。
- 订单管理：查看用户认购订单、运行状态、收益、赎回状态。
- 收益记录：展示每日收益、订单收益和调整记录。
- 操作日志：记录产品新增、编辑、上下架、收益调整、赎回配置修改。
- 规则说明：给运营人员查看产品逻辑、公式和字段含义。

后台视觉与交互参考 `src/pages/admin/aiQuant`：

- 产品管理为筛选器 + 表格 + 编辑弹窗。
- 编辑弹窗采用左侧配置、右侧实时预览。
- 配置分 Tab：基础信息、组合资产、收益与费用、限额与赎回、展示文案。

## 管理台产品配置字段

基础信息：

- 产品 ID
- 产品名称
- 组合标签
- 计价币种，固定为 USDT
- 状态：已启用、已禁用、已售罄、维护中
- 最低 VIP 等级
- 风险等级

组合资产：

- 币种列表，例如 `USDT`、`ETH`、`BTC`
- 每个币种展示权重，仅用于前台说明，本期不做真实调仓
- 组合说明

收益与费用：

- 运行周期天数
- 最低日收益率
- 最高日收益率
- 认购手续费率
- 结算方式，本期固定为到期结算

限额与份额：

- 单笔最低申购金额
- 单笔最高申购金额
- 单用户持仓上限
- 总份额
- 剩余份额
- 每月申购次数

提前赎回：

- 是否允许提前赎回
- 提前赎回模式
- 提前赎回手续费率
- 最短持有天数
- 到账时间

展示文案：

- 产品亮点
- 风险提示
- 操作说明
- 规则说明

## 本地数据与模块边界

新增本地 mock 和状态：

- `src/admin/constants/portfolio.js`
- `src/admin/mock/portfolio.js`
- `src/admin/state/portfolioOrders.js`
- `src/admin/state/portfolioOperationLogs.js`
- `src/admin/state/financeCatalogs.js` 增加 `portfolioProductsCatalog`

新增前台页面：

- `src/pages/front/finance/portfolio/FinancePortfolioListPage.vue`
- `src/pages/front/finance/portfolio/FinancePortfolioDetailPage.vue`

新增后台页面：

- `src/pages/admin/portfolio/PortfolioProductPage.vue`
- `src/pages/admin/portfolio/PortfolioOrderPage.vue`
- `src/pages/admin/portfolio/PortfolioYieldRecordsPage.vue`
- `src/pages/admin/portfolio/PortfolioOperationLogPage.vue`
- `src/pages/admin/portfolio/PortfolioRulePage.vue`

更新现有入口：

- `src/constants/frontNav.js`
- `src/pages/front/finance/FinanceHomePage.vue`
- `src/router/modules/front.js`
- `src/router/modules/console.js`
- `src/admin/config/nav.js`

## 状态与订单

产品状态：

- `enabled`
- `disabled`
- `sold_out`
- `maintenance`

订单状态：

- `running`
- `completed`
- `settled`
- `early_redeemed`
- `cancelled`

前端本期通过本地 `ref` 和 mock 数据模拟订单新增、赎回和状态展示。刷新页面后数据不要求持久化。

## 校验与异常状态

认购金额校验：

- 必填。
- 必须为正数。
- 必须大于等于产品最低申购金额。
- 必须小于等于产品最高申购金额。
- 产品剩余份额必须大于 0。
- 产品状态必须为已启用。

提前赎回校验：

- 产品必须开启提前赎回。
- 订单必须处于运行中。
- 当前持有天数必须大于等于最短持有天数。

异常展示：

- 空列表展示缺省态。
- 无产品展示返回金融首页入口。
- 产品不可认购时按钮禁用并显示原因。
- 表格长数据使用分页。

## 测试与验证

实现完成后需要验证：

- `npm run build`
- 前台金融首页出现投资组合入口。
- `/front/finance/portfolio` 可打开并展示产品列表。
- `/front/finance/portfolio/:productId` 可打开并展示详情。
- 认购弹窗的收益和手续费计算正确。
- 我的组合区能展示 mock 订单。
- 提前赎回弹窗能根据产品配置切换可用和不可用状态。
- 后台投资组合菜单出现并可进入产品、订单、收益记录、日志、规则页。
- 后台产品编辑弹窗能修改 mock 产品并影响前台展示。

## 非目标

本期不做：

- 服务端接口。
- 数据库存储。
- 真实钱包余额扣减。
- 真实收益结算任务。
- 真实多币种调仓。
- 真实链上交易。
- KYC、风控审核、权限体系新增。
- 真实图表行情接入。

## 待实现顺序

1. 新增 portfolio 常量、mock、状态文件。
2. 接入前台导航、金融首页和路由。
3. 实现前台列表页与详情/认购流程。
4. 接入后台菜单和路由。
5. 实现后台产品管理、订单管理、收益记录、操作日志和规则页。
6. 运行构建与页面人工检查。
