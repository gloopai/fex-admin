/**
 * 代理产品线记佣字段（与裂变多级无关：代理线仅一级比例）
 */
export const AGENT_PRODUCT_LINE_DEFS = [
  {
    key: 'deposit',
    enabledKey: 'agentDepositCommissionEnabled',
    rateKey: 'agentDepositCommissionRate',
    title: '充值',
    theme: 'blue',
    group: 'fund'
  },
  {
    key: 'perpetual',
    enabledKey: 'agentPerpetualCommissionEnabled',
    rateKey: 'agentPerpetualCommissionRate',
    title: '永续合约',
    theme: 'indigo',
    group: 'trade'
  },
  {
    key: 'delivery',
    enabledKey: 'agentDeliveryCommissionEnabled',
    rateKey: 'agentDeliveryCommissionRate',
    title: '交割合约',
    theme: 'violet',
    group: 'trade'
  },
  {
    key: 'spot',
    enabledKey: 'agentSpotCommissionEnabled',
    rateKey: 'agentSpotCommissionRate',
    title: '现货',
    theme: 'orange',
    group: 'trade'
  },
  {
    key: 'aiQuant',
    enabledKey: 'agentAiQuantCommissionEnabled',
    rateKey: 'agentAiQuantCommissionRate',
    title: 'AI 量化',
    theme: 'amber',
    group: 'fin'
  },
  {
    key: 'lending',
    enabledKey: 'agentLendingCommissionEnabled',
    rateKey: 'agentLendingCommissionRate',
    title: '理财产品',
    theme: 'emerald',
    group: 'fin'
  },
  {
    key: 'borrowing',
    enabledKey: 'agentBorrowingCommissionEnabled',
    rateKey: 'agentBorrowingCommissionRate',
    title: '借贷产品',
    theme: 'rose',
    group: 'fin'
  }
]

export const AGENT_PRODUCT_GROUPS = [
  { id: 'fund', name: '入金', blurb: '含链上与站内 USDT 充值', lineKeys: ['deposit'] },
  { id: 'trade', name: '交易', blurb: '合约与现货订单', lineKeys: ['perpetual', 'delivery', 'spot'] },
  { id: 'fin', name: '产品与策略', blurb: '量化、理财、借贷', lineKeys: ['aiQuant', 'lending', 'borrowing'] }
]

/**
 * 代理记佣全局默认（一级比例；与裂变 DEFAULT_REFERRAL_CONFIG 独立）
 * 比例存为字符串，与表单/JSON 一致，归一化见 normalizeAgentLineRate
 */
export const DEFAULT_AGENT_GLOBAL_COMMISSION = {
  agentCommissionAutoExecute: true,
  agentCommissionDepositFirstOnly: false,

  agentDepositCommissionEnabled: true,
  agentDepositCommissionRate: '0.08',

  agentPerpetualCommissionEnabled: false,
  agentPerpetualCommissionRate: '0',

  agentDeliveryCommissionEnabled: false,
  agentDeliveryCommissionRate: '0',

  agentSpotCommissionEnabled: false,
  agentSpotCommissionRate: '0',

  agentAiQuantCommissionEnabled: false,
  agentAiQuantCommissionRate: '0',

  agentLendingCommissionEnabled: false,
  agentLendingCommissionRate: '0',

  agentBorrowingCommissionEnabled: false,
  agentBorrowingCommissionRate: '0'
}

/** 单级比例 0～1；若历史为逗号串则取第一段 */
export function normalizeAgentLineRate(val) {
  const s = String(val ?? '').trim()
  const first = (s.split(',')[0] ?? '').trim()
  const n = parseFloat(first)
  if (!Number.isFinite(n) || Number.isNaN(n)) return '0'
  const c = Math.max(0, Math.min(1, n))
  return String(c)
}

/** 仅从全局配置对象中取出各产品线开关与一级比例 */
export function sliceAgentProductCommissionFromGlobal(global = DEFAULT_AGENT_GLOBAL_COMMISSION) {
  const o = {}
  for (const line of AGENT_PRODUCT_LINE_DEFS) {
    o[line.enabledKey] = global[line.enabledKey]
    o[line.rateKey] = global[line.rateKey]
  }
  return o
}
