/** 评分项规则：数值区间（左闭右开）或枚举映射 */
export const SCORE_RULE_EVALUATOR = {
  RANGE: 'range',
  ENUM: 'enum'
}

/**
 * @param {Array<{ min?: number, max?: number|null, points?: number }>|undefined} ranges
 * @param {unknown} value 待匹配的指标值
 * @param {number} cap 不超过本项满分
 */
export function evaluateRangeRule(ranges, value, cap) {
  const raw = matchRangeRulePoints(ranges, value)
  return Math.min(Math.max(0, cap), raw)
}

/**
 * @param {Array<{ min?: number, max?: number|null, points?: number }>|undefined} ranges
 * @param {unknown} value 待匹配的指标值
 * @returns {number} 命中档位的表内得分（不夹本项满分）
 */
export function matchRangeRulePoints(ranges, value) {
  const v = Number(value)
  if (!Number.isFinite(v) || !Array.isArray(ranges) || ranges.length === 0) return 0
  const sorted = [...ranges].sort((a, b) => (Number(a.min) || 0) - (Number(b.min) || 0))
  for (const row of sorted) {
    const lo = Number(row.min) || 0
    const hiRaw = row.max
    const hi = hiRaw == null || hiRaw === '' ? Infinity : Number(hiRaw)
    const hiOk = Number.isFinite(hi) ? hi : Infinity
    if (v >= lo && v < hiOk) {
      return Math.max(0, Number(row.points) || 0)
    }
  }
  return 0
}

/**
 * @param {Array<{ value?: string|number, points?: number }>|undefined} cases
 * @param {unknown} value 待匹配的指标值
 * @param {number} cap
 */
export function evaluateEnumRule(cases, value, cap) {
  const raw = matchEnumRulePoints(cases, value)
  return Math.min(Math.max(0, cap), raw)
}

/**
 * @param {Array<{ value?: string|number, points?: number }>|undefined} cases
 * @param {unknown} value 待匹配的指标值
 */
export function matchEnumRulePoints(cases, value) {
  if (!Array.isArray(cases) || cases.length === 0) return 0
  const needle = String(value ?? '').trim()
  for (const row of cases) {
    if (String(row.value ?? '').trim() === needle) {
      return Math.max(0, Number(row.points) || 0)
    }
  }
  return 0
}

/**
 * 按维度上配置的 scoreRule 与运行时指标值计算应得得分（命中档位表内得分，超过本项满分则截断）。
 * @param {{ maxPoints?: number, scoreRule?: { enabled?: boolean, evaluator?: string, ranges?: unknown[], enumCases?: unknown[] }}} dimension
 * @param {unknown} [metricValue] 该维度运行时指标取值；缺省则视为未命中（演示可用快照表注入）。
 */
export function evaluateConfiguredScoreRule(dimension, metricValue) {
  const cap = Math.max(0, Number(dimension?.maxPoints) || 0)
  const r = dimension?.scoreRule
  if (!r || !cap || r.enabled === false) return 0

  const raw =
    r.evaluator === SCORE_RULE_EVALUATOR.ENUM
      ? matchEnumRulePoints(r.enumCases, metricValue)
      : matchRangeRulePoints(r.ranges, metricValue)

  return Math.min(cap, Math.max(0, raw))
}
