export const guideTabs = [
  { key: 'overview', label: '功能概览' },
  { key: 'terms', label: '名词解释' },
  { key: 'contract-control', label: '合约线控' },
  { key: 'examples', label: '操作示例' },
  { key: 'faq', label: '常见问题' }
]

export const basicConceptTerms = [
  { zh: '永续合约', en: 'Perpetual Contract', desc: '一种没有到期日的衍生品合约，交易者可以无限期持有仓位，通过资金费率机制使合约价格锚定现货价格。' },
  { zh: '线控', en: 'Line Control', desc: '针对永续合约用户或合约本身进行的精细化控制，通过调整价格展示、成交参数等方式影响交易体验和盈亏结果。' },
  { zh: '持仓级线控', en: 'Position-Level Control', desc: '针对用户某个特定持仓的精准控制，仅影响该持仓，不影响其他仓位。' },
  { zh: '合约级线控', en: 'Contract-Level Control', desc: '针对整份合约（如 BTCUSDT）的全局控制，会影响所有交易该合约的用户。' }
]

export const lineParamTerms = [
  {
    zh: '价格偏移',
    en: 'Price Offset',
    unit: '点',
    desc: '给用户展示的价格与真实市场价格之间的差值，影响用户看到的盈亏和开平仓价格。',
    example: '设置 +10 点：用户看到的 BTC 价格比实际高 10 点。'
  },
  {
    zh: '点差',
    en: 'Spread',
    unit: '点',
    desc: '买入价（Ask）与卖出价（Bid）之间的差价，点差越大交易成本越高。',
    example: '正常点差 2 点，调整为 1.5x 后点差变为 3 点。'
  },
  {
    zh: '点差倍数',
    en: 'Spread Multiplier',
    unit: 'x',
    desc: '在原始点差基础上的放大倍数，1.0x 表示正常点差。',
    example: '原始点差 2 点 × 2.0x = 实际点差 4 点。'
  },
  {
    zh: '滑点',
    en: 'Slippage',
    unit: '%',
    desc: '订单实际成交价格与预期价格之间的差异，滑点注入会人为增加偏差。',
    example: '0.5% 滑点：买入 $100,000 仓位，实际成交价比预期高 $500。'
  },
  {
    zh: '滑点率',
    en: 'Slippage Rate',
    unit: '%',
    desc: '滑点占成交金额的百分比，滑点率越高成交价格越不利。',
    example: '滑点率 0.3%，做多 10 BTC @ $67,000，滑点成本 = $2,010。'
  },
  {
    zh: '成交延迟',
    en: 'Execution Delay',
    unit: 'ms（毫秒）',
    desc: '订单从提交到实际成交之间人为增加的等待时间。',
    example: '设置 500ms 延迟：用户下单后需要等待 0.5 秒才成交。'
  },
  {
    zh: '拒单率',
    en: 'Reject Rate',
    unit: '%',
    desc: '用户订单被系统拒绝的概率，被拒绝订单不会成交。',
    example: '5% 拒单率：每 100 个订单中平均有 5 个会被拒绝。'
  },
  {
    zh: '杠杆上限',
    en: 'Max Leverage Limit',
    unit: 'x',
    desc: '限制用户可使用的最大杠杆倍数，超过限制的杠杆无法使用。',
    example: '设置 50x 上限：用户无法开 100x 杠杆仓位。'
  }
]

export const positionTerms = [
  { zh: '做多 / 多头', en: 'Long Position', desc: '买入合约，预期价格上涨后卖出获利。价格上涨盈利，价格下跌亏损。' },
  { zh: '做空 / 空头', en: 'Short Position', desc: '卖出合约，预期价格下跌后买入获利。价格下跌盈利，价格上涨亏损。' },
  { zh: '杠杆', en: 'Leverage', desc: '使用借入资金放大交易头寸，10x 杠杆表示 $1,000 本金可控制 $10,000 仓位。' },
  { zh: '保证金', en: 'Margin', desc: '开仓时需要抵押的资金，用于承担亏损风险。' },
  { zh: '保证金率', en: 'Margin Ratio', desc: '当前保证金占仓位价值的比例，过低时会触发强平。' },
  { zh: '开仓价', en: 'Entry Price', desc: '建立持仓时的成交价格，用于计算持仓盈亏。' },
  { zh: '标记价格', en: 'Mark Price', desc: '用于计算未实现盈亏和强平价格的公允价格，比最新成交价更平滑。' },
  { zh: '强平价格 / 爆仓价', en: 'Liquidation Price', desc: '标记价格达到该价格时，系统会执行强制平仓。' },
  { zh: '强制平仓 / 爆仓', en: 'Liquidation', desc: '保证金不足时系统自动平掉持仓，用户将损失全部或大部分保证金。' },
  { zh: '未实现盈亏', en: 'Unrealized PnL', desc: '当前持仓按标记价格计算的浮动盈亏，平仓前不会实际结算。' },
  { zh: '已实现盈亏', en: 'Realized PnL', desc: '仓位平仓后实际结算的盈亏金额，直接反映到账户余额。' },
  { zh: '净持仓', en: 'Net Position', desc: '多头持仓总量减去空头持仓总量。正数表示净多头，负数表示净空头。' },
  { zh: '多空比', en: 'Long/Short Ratio', desc: '多头持仓与空头持仓的比例，用于反映多空力量对比。' }
]

export const feeTerms = [
  { zh: '资金费率', en: 'Funding Rate', desc: '永续合约特有机制，多空双方定期支付费用，通常每 8 小时结算一次。' },
  { zh: '资金费用', en: 'Funding Fee', desc: '根据持仓价值和资金费率计算的实际支付金额。' },
  { zh: '手续费', en: 'Trading Fee', desc: '每笔交易按成交金额百分比收取，通常分 Maker / Taker 费率。' },
  { zh: '指数价格', en: 'Index Price', desc: '多个主流交易所现货价格加权平均值，用于计算标记价格和资金费率。' }
]

export const triggerTerms = [
  { zh: '净持仓触发', en: 'Net Position Trigger', desc: '当合约净持仓超过阈值时触发，用于平衡多空力量。' },
  { zh: '盈亏比触发', en: 'PnL Ratio Trigger', desc: '当用户整体盈利率超过阈值时触发，用于控制盈利过高场景。' },
  { zh: '交易量突增触发', en: 'Volume Spike Trigger', desc: '交易量相对历史均值异常放大时触发。' },
  { zh: '波动率触发', en: 'Volatility Trigger', desc: '价格波动率超过设定阈值时触发。' },
  { zh: '时间段触发', en: 'Time-Based Trigger', desc: '在指定高风险时间段自动启用线控。' },
  { zh: '大户活动触发', en: 'Whale Activity Trigger', desc: '大户开仓或平仓时自动触发线控。' }
]

export const controlStateTerms = [
  { zh: '无线控', en: 'No Control', desc: '用户处于正常状态，不受任何线控影响。', cls: 'bg-slate-100 text-slate-700' },
  { zh: '价格控制', en: 'Price Control', desc: '仅启用价格偏移和点差调整。', cls: 'bg-blue-100 text-blue-700' },
  { zh: '成交控制', en: 'Execution Control', desc: '仅启用滑点注入和成交延迟。', cls: 'bg-violet-100 text-violet-700' },
  { zh: '全面控制', en: 'Full Control', desc: '同时启用价格控制和成交控制参数。', cls: 'bg-amber-100 text-amber-700' },
  { zh: '已锁定', en: 'Locked', desc: '禁止用户进行任何交易操作。', cls: 'bg-rose-100 text-rose-700' },
  { zh: '持仓冻结', en: 'Position Frozen', desc: '特定持仓被冻结，无法进行加仓、减仓或平仓。', cls: 'bg-red-100 text-red-700' }
]

export const contractTriggers = [
  ['净持仓触发', '净持仓超过阈值时触发，例如净多头 > $500K。'],
  ['盈亏比触发', '用户整体盈利率超过阈值时触发，例如盈利率 > 15%。'],
  ['交易量突增触发', '短时交易量超过历史均值倍数时触发。'],
  ['波动率触发', '短时波动超过阈值时触发，例如 5 分钟波动 > 2%。'],
  ['时间段触发', '在指定高风险时段自动启用线控。'],
  ['大户活动触发', '大额用户开平仓动作触发规则。']
]

export const contractModeCards = [
  {
    title: '手动模式',
    className: 'border-amber-200 bg-amber-50',
    badgeClass: 'bg-amber-100 text-amber-700',
    points: ['管理员手动设置线控参数', '参数立即生效，持续有效', '适合已知需要干预的情况', '需要人工监控和调整']
  },
  {
    title: '自动模式',
    className: 'border-violet-200 bg-violet-50',
    badgeClass: 'bg-violet-100 text-violet-700',
    points: ['配置触发规则，系统自动执行', '支持多种触发条件', '可设置持续时间，自动过期', '7x24 小时自动监控']
  }
]

export const contractTriggerCards = [
  { title: '净持仓触发', cls: 'bg-blue-100 text-blue-700', desc: '当多空净持仓超过设定阈值时触发', example: '净多头 > $500K 时触发' },
  { title: '盈亏比触发', cls: 'bg-emerald-100 text-emerald-700', desc: '当用户整体盈亏比超过阈值时触发', example: '用户盈利率 > 15% 时触发' },
  { title: '交易量突增', cls: 'bg-orange-100 text-orange-700', desc: '当交易量异常放大时触发', example: '5 分钟交易量 > 平均值 3 倍' },
  { title: '波动率触发', cls: 'bg-violet-100 text-violet-700', desc: '当价格波动率超过阈值时触发', example: '5 分钟波动 > 2% 时触发' },
  { title: '时间段触发', cls: 'bg-slate-200 text-slate-700', desc: '在特定时间段内自动启用', example: '每日 00:00-02:00 时启用' },
  { title: '大户活动触发', cls: 'bg-rose-100 text-rose-700', desc: '当大户开仓或平仓时触发', example: '单笔持仓 > $100K 时触发' }
]

export const contractRuleExamples = [
  {
    labelCls: 'bg-blue-100 text-blue-700',
    name: '多头过重自动调整',
    trigger: ['触发类型: 净持仓触发', '净持仓阈值: $500,000', '触发方向: 多头过重时'],
    action: ['价格偏移: 10 点（向下）', '滑点率: 0.3%', '持续时间: 2 小时'],
    effect: '当 BTCUSDT 合约净多头超过 $500K 时，系统自动将价格向下偏移 10 点并注入 0.3% 滑点，持续 2 小时后自动恢复。'
  },
  {
    labelCls: 'bg-emerald-100 text-emerald-700',
    name: '用户盈利过高干预',
    trigger: ['触发类型: 盈亏比触发', '盈亏阈值: 15%', '触发方向: 用户盈利过高'],
    action: ['点差倍数: 1.5x', '成交延迟: 100ms', '拒单率: 5%'],
    effect: '当该合约用户整体盈利率超过 15% 时，系统自动扩大点差并增加成交延迟，同时以 5% 概率拒单。'
  }
]

export const contractHelpNotes = [
  '合约线控会影响所有交易该合约的用户，请谨慎设置参数。',
  '自动规则优先级按数字从小到大执行，多个规则可能同时触发。',
  '建议自动规则设置持续时间，避免长期影响正常交易。',
  '所有操作都会记录日志，可在「合约线控日志」中查看。'
]

export const operationScenarios = [
  {
    title: '场景 1：净多头过重快速降温',
    trigger: '净持仓触发：净多头 > $500,000',
    action: '价格偏移 10 点（向下） + 滑点率 0.30% + 持续时间 2 小时',
    effect: '削弱做多成交质量，抑制单边拥挤并降低短时风险敞口。',
    duration: '建议时长：60-120 分钟'
  },
  {
    title: '场景 2：用户盈利率过高干预',
    trigger: '盈亏比触发：整体盈利率 > 15%',
    action: '点差倍数 1.5x + 成交延迟 100ms + 拒单率 5%',
    effect: '降低高盈利用户交易效率，减缓盈利扩张速度。',
    duration: '建议时长：30-90 分钟'
  },
  {
    title: '场景 3：波动率异常扩大保护',
    trigger: '波动率触发：5 分钟波动 > 2%',
    action: '点差倍数 1.8x + 滑点率 0.25% + 杠杆上限降至 50x',
    effect: '在剧烈波动时减少高杠杆冲击，保护撮合与风控稳定性。',
    duration: '建议时长：15-45 分钟'
  },
  {
    title: '场景 4：交易量突增防刷单',
    trigger: '交易量突增触发：5 分钟交易量 > 均值 3 倍',
    action: '拒单率 3% + 成交延迟 80ms + 滑点率 0.15%',
    effect: '提高异常高频策略成本，缓解撮合拥堵和异常交易行为。',
    duration: '建议时长：20-60 分钟'
  },
  {
    title: '场景 5：高风险时段预防性启用',
    trigger: '时间段触发：每日 00:00-02:00 自动启用',
    action: '点差倍数 1.3x + 价格偏移 3 点（随机）',
    effect: '在已知高风险时段提前降低套利与突发波动带来的冲击。',
    duration: '建议时长：固定时段内生效'
  },
  {
    title: '场景 6：大户开仓活动应对',
    trigger: '大户活动触发：单笔持仓 > $100K',
    action: '价格偏移 6 点（逆势） + 滑点率 0.20% + 成交延迟 120ms',
    effect: '降低大额单边开仓冲击，避免被大户行为放大市场偏移。',
    duration: '建议时长：30-60 分钟'
  }
]

export const faqItems = [
  {
    q: '线控设置后多久生效？',
    a: '用户级线控设置后立即生效，影响用户的所有新订单。持仓级线控对已有持仓立即生效。'
  },
  {
    q: '用户级线控和持仓级线控哪个优先级更高？',
    a: '持仓级线控优先级更高。如果用户被设置了价格偏移 5 点，但某个持仓被单独设置了 10 点，则该持仓使用 10 点的设置。'
  },
  {
    q: '价格偏移对做多和做空的影响是什么？',
    a: '正数偏移会使展示价格上调，对做多有利（显示盈利更多）但平仓时不利；负数偏移相反。建议根据用户持仓方向设置合适的偏移方向。'
  },
  {
    q: '成交延迟会影响限价单吗？',
    a: '成交延迟主要影响市价单。限价单会在触发后增加延迟时间才成交，可能导致价格已经离开触发价。'
  },
  {
    q: '滑点注入如何计算？',
    a: '滑点按成交金额的百分比计算。例如 0.5% 滑点，做多 10 BTC @ $67,000，滑点成本 = 10 × 67,000 × 0.5% = $3,350。'
  },
  {
    q: '强制爆仓后用户会收到通知吗？',
    a: '用户会收到正常的强平通知，显示原因为“保证金不足”。系统不会显示是人工触发的强平。'
  },
  {
    q: '线控操作会被记录吗？',
    a: '所有线控操作都会完整记录在操作日志中，包括操作人、时间、参数、影响等信息，可供审计和追溯。'
  },
  {
    q: '如何快速解除所有线控？',
    a: '在用户的线控设置中选择「解除线控」即可清除该用户的所有线控参数。持仓级线控需要单独解除。'
  },
  {
    q: '资金费率调整对用户的影响？',
    a: '资金费率每 8 小时结算一次。调整用户的个性化费率后，该用户会按调整后的费率支付或收取资金费用，不影响其他用户。'
  },
  {
    q: '杠杆上限设置后，已有高杠杆持仓怎么办？',
    a: '已有持仓不受影响，但用户无法开新的高杠杆仓位，也无法对现有仓位加仓。用户需要降低杠杆或平仓后才能继续交易。'
  }
]

export const positionControls = [
  '价格偏移: 仅影响该持仓的展示价格',
  '滑点注入: 该持仓平仓时的额外滑点',
  '强制爆仓: 立即执行该持仓的强平',
  '冻结持仓: 禁止该持仓的任何操作'
]

export const paramCards = [
  { name: '价格偏移', unit: '点', range: '-50 ~ +50', desc: '正数对做多不利，负数对做空不利' },
  { name: '点差倍数', unit: 'x', range: '1.0 ~ 5.0', desc: '1.5x 表示点差扩大 50%' },
  { name: '滑点率', unit: '%', range: '0 ~ 2.0', desc: '成交时的额外滑点比例' },
  { name: '成交延迟', unit: 'ms', range: '0 ~ 5000', desc: '订单成交前的等待时间' },
  { name: '杠杆上限', unit: 'x', range: '1 ~ 125', desc: '限制用户可使用的最大杠杆' },
  { name: '资金费率', unit: '%', range: '-0.5 ~ +0.5', desc: '针对用户的个性化费率' }
]
