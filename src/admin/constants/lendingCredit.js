import { LOAN_ORDER_STATUS } from './cryptoLending'
import { evaluateConfiguredScoreRule } from './lendingCreditScoreRule'

/** 在贷状态：计入「已用授信」的订单 */
export const LENDING_CREDIT_ACTIVE_ORDER_STATUSES = [
  LOAN_ORDER_STATUS.PENDING,
  LOAN_ORDER_STATUS.ACTIVE,
  LOAN_ORDER_STATUS.REPAYING,
  LOAN_ORDER_STATUS.OVERDUE
]

/**
 * @typedef {object} LendingCreditPolicy
 * @property {number} accountTotalCapNotional 账户级总授信（展示币种名义值，如 USDT）
 * @property {Record<string, number>} capByLoanCurrency 各「借出币种」子额度上限
 */

/**
 * 在贷债务合计（演示：可选按面值直加；生产应对各币种折算到 notional 币种再求和）。
 * @param {Array<{ status: string, totalDebt?: number }>} orders
 * @param {string[]} activeStatuses
 */
export function sumActiveDebt(orders, activeStatuses = LENDING_CREDIT_ACTIVE_ORDER_STATUSES) {
  if (!Array.isArray(orders)) return 0
  return orders
    .filter((o) => activeStatuses.includes(o.status))
    .reduce((s, o) => s + (Number(o.totalDebt) || 0), 0)
}

/**
 * 某借出币种下在贷债务合计。
 * @param {Array<{ status: string, loanCurrency?: string, totalDebt?: number }>} orders
 * @param {string} loanCurrency
 */
export function sumActiveDebtForLoanCurrency(orders, loanCurrency, activeStatuses = LENDING_CREDIT_ACTIVE_ORDER_STATUSES) {
  if (!loanCurrency || !Array.isArray(orders)) return 0
  return orders
    .filter((o) => activeStatuses.includes(o.status))
    .filter((o) => o.loanCurrency === loanCurrency)
    .reduce((s, o) => s + (Number(o.totalDebt) || 0), 0)
}

/**
 * 账户级「剩余授信」= max(0, 总授信名义值 − 在贷债务合计)。
 * 生产常见扩展：债务先按行情/牌价折算为 notional 币种再减；或按用户维度过滤 orders。
 * @param {LendingCreditPolicy} policy
 * @param {object[]} orders
 */
export function accountCreditRemaining(policy, orders) {
  const cap = Number(policy?.accountTotalCapNotional)
  if (!Number.isFinite(cap) || cap < 0) return 0
  const used = sumActiveDebt(orders)
  return Math.max(0, Math.round(cap - used))
}

/**
 * 单笔可借上限（借某币产品时）= min(账户剩余, 该币种子额度 − 该币种在贷)。
 * @param {LendingCreditPolicy} policy
 * @param {object[]} orders
 * @param {string} loanCurrency 产品借出币种
 */
export function borrowCreditRemaining(policy, orders, loanCurrency) {
  const accountRem = accountCreditRemaining(policy, orders)
  if (!loanCurrency) return accountRem
  const map = policy?.capByLoanCurrency && typeof policy.capByLoanCurrency === 'object' ? policy.capByLoanCurrency : {}
  const subCap = map[loanCurrency]
  const notionalCap = Number(policy?.accountTotalCapNotional)
  const ccyCap =
    Number.isFinite(Number(subCap)) && Number(subCap) >= 0
      ? Number(subCap)
      : Number.isFinite(notionalCap) && notionalCap >= 0
        ? notionalCap
        : 0
  const usedCcy = sumActiveDebtForLoanCurrency(orders, loanCurrency)
  const byCurrency = Math.max(0, Math.round(ccyCap - usedCcy))
  return Math.min(accountRem, byCurrency)
}

/**
 * @typedef {{
 *   key?: string,
 *   group?: string,
 *   label?: string,
 *   description?: string,
 *   maxPoints?: number,
 *   points?: number,
 *   howScored?: string,
 *   inputSignals?: string[],
 *   scoreRule?: {
 *     enabled?: boolean,
 *     evaluator?: string,
 *     ranges?: Array<{ min?: number, max?: number|null, points?: number, caption?: string }>,
 *     enumCases?: Array<{ value?: string|number, points?: number, caption?: string }>
 *   }
 * }} LendingScorecardDimension
 * @typedef {{
 *   id?: string,
 *   version?: string,
 *   title?: string,
 *   note?: string
 * }} LendingScorecardMeta
 * @typedef {{
 *   scorecardMeta?: LendingScorecardMeta,
 *   dimensions: LendingScorecardDimension[],
 *   minScale?: number,
 *   baseAccountCapMax?: number,
 *   baseCapByLoanCurrency?: Record<string, number>
 * }} LendingScorecard
 */

/**
 * 单项得分：有 scoreRule 时按规则与给定指标值计算（表内得分封顶于本项满分）；否则回退 legacy `points`。
 * @param {{ maxPoints?: number, points?: number, scoreRule?: unknown }} d
 * @param {unknown} [metricValue] 该维度运行时指标取值（缺省则未命中档）
 */
export function getScorecardDimensionEarned(d, metricValue) {
  if (d?.scoreRule != null) {
    return evaluateConfiguredScoreRule(d, metricValue)
  }
  const m = Math.max(0, Number(d?.maxPoints) || 0)
  return Math.min(m, Math.max(0, Number(d?.points) || 0))
}

/**
 * 评分卡得分率 = Σ 单项得分 / Σ maxPoints。
 * @param {LendingScorecard} scorecard
 * @param {Record<string, unknown>} [metricByKey] dimensions[].key → 运行时指标值
 * @returns {{ earned: number, max: number, ratio: number }}
 */
export function computeScorecardRatio(scorecard, metricByKey) {
  const dims = scorecard?.dimensions
  if (!Array.isArray(dims) || dims.length === 0) return { earned: 0, max: 0, ratio: 0 }
  let earned = 0
  let max = 0
  for (const d of dims) {
    const m = Math.max(0, Number(d.maxPoints) || 0)
    const p = getScorecardDimensionEarned(d, metricByKey?.[d.key])
    max += m
    earned += p
  }
  return { earned, max, ratio: max > 0 ? earned / max : 0 }
}

/**
 * 按评分卡将「运营配置的满分额度上限」缩放到当前用户档位：
 * scale = minScale + (1 − minScale) × 得分率，再乘以各模板上限写入 policy。
 * @param {LendingScorecard} scorecard
 * @param {LendingCreditPolicy} policy
 * @param {Record<string, unknown>} [metricByKey] dimensions[].key → 运行时指标值（演示可传固定快照）
 */
export function applyScorecardCaps(scorecard, policy, metricByKey) {
  if (!scorecard || !policy) return
  const { ratio } = computeScorecardRatio(scorecard, metricByKey)
  const floor = Math.min(0.95, Math.max(0.05, Number(scorecard.minScale) ?? 0.35))
  const scale = floor + (1 - floor) * ratio
  const baseMax = Number(scorecard.baseAccountCapMax)
  if (Number.isFinite(baseMax) && baseMax >= 0) {
    policy.accountTotalCapNotional = Math.round(baseMax * scale)
  }
  const bases = scorecard.baseCapByLoanCurrency
  const caps = policy.capByLoanCurrency
  if (bases && caps && typeof caps === 'object') {
    for (const ccy of Object.keys(caps)) {
      const t = Number(bases[ccy])
      if (Number.isFinite(t) && t >= 0) caps[ccy] = Math.round(t * scale)
    }
  }
}
