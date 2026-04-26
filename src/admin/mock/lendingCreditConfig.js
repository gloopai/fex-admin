import { reactive } from 'vue'
import { applyScorecardCaps } from '../constants/lendingCredit'
import { SCORE_RULE_EVALUATOR } from '../constants/lendingCreditScoreRule'

/**
 * 信用借贷 — 授信策略（内存配置；与运营端「授信中心」同源结构，可后续落库）。
 * 前台列表与授信管理页共用同一 reactive 对象。
 *
 * 每项 dimensions[].scoreRule：启用开关、数值分档或枚举映射；
 * 得分由规则与运行时指标（见 lendingCreditDemoMetricSnapshot）计算；前台进入借贷页时折算 policy。
 */
export const lendingCreditPolicy = reactive({
  accountTotalCapNotional: 2_500_000,
  capByLoanCurrency: {
    USDT: 2_000_000,
    USDC: 900_000
  }
})

/** 评分卡分组 key（与 dimensions[].group 对应） */
export const LENDING_SCORECARD_GROUP = {
  KYC: 'KYC',
  ASSET: 'ASSET',
  TRADING: 'TRADING',
  VIP: 'VIP',
  OTHER: 'OTHER'
}

export const LENDING_SCORECARD_GROUP_LABEL = {
  [LENDING_SCORECARD_GROUP.KYC]: '认证与合规',
  [LENDING_SCORECARD_GROUP.ASSET]: '资金与资产',
  [LENDING_SCORECARD_GROUP.TRADING]: '交易与活跃',
  [LENDING_SCORECARD_GROUP.VIP]: '会员与权益',
  [LENDING_SCORECARD_GROUP.OTHER]: '信用与其他'
}

/** 页面展示顺序 */
export const LENDING_SCORECARD_GROUP_ORDER = [
  LENDING_SCORECARD_GROUP.KYC,
  LENDING_SCORECARD_GROUP.ASSET,
  LENDING_SCORECARD_GROUP.TRADING,
  LENDING_SCORECARD_GROUP.VIP,
  LENDING_SCORECARD_GROUP.OTHER
]

/** 各维度当期指标取值（与 dimensions[].key 对应）；对接后由风控/画像服务下发。 */
export const lendingCreditDemoMetricSnapshot = Object.freeze({
  identity_compliance: 'ADVANCED',
  assets_strength: 120000,
  trading_activity: 180000,
  membership_tier: '3'
})

export const lendingCreditScorecard = reactive({
  scorecardMeta: {
    id: 'LEND_SCORECARD_DEFAULT',
    version: '2026.04',
    title: '信用借贷 · 默认评分卡',
    note: '评分卡与用户/客群绑定；版本发布需审批。以下为全站默认配置。'
  },
  minScale: 0.35,
  baseAccountCapMax: 2_500_000,
  baseCapByLoanCurrency: {
    USDT: 2_000_000,
    USDC: 900_000
  },
  dimensions: [
    {
      key: 'identity_compliance',
      group: LENDING_SCORECARD_GROUP.KYC,
      label: '实名认证',
      description:
        '按字段 kyc_tier 取值，须与下表「取值」列完全一致：NONE=未实名，BASIC=初级，ADVANCED=高级。',
      maxPoints: 20,
      inputSignals: ['kyc_level', 'aml_case_state', 'sanctions_screen'],
      howScored:
        '按认证等级与 AML/名单筛查结论映射到 0～本项满分；状态变更时由风控服务重算并下发得分。',
      scoreRule: {
        enabled: true,
        evaluator: SCORE_RULE_EVALUATOR.ENUM,
        enumCases: [
          { value: 'NONE', points: 0, caption: '未实名（取值 NONE）' },
          { value: 'BASIC', points: 8, caption: '初级（取值 BASIC）' },
          { value: 'ADVANCED', points: 20, caption: '高级（取值 ADVANCED）' }
        ]
      }
    },
    {
      key: 'assets_strength',
      group: LENDING_SCORECARD_GROUP.ASSET,
      label: '资产与资金',
      description:
        '按「近 90 日净充值」折算为 USDT 后的金额分档；下表「下限 ≥」「上限 <」均为 USDT 数值（左闭右开）。',
      maxPoints: 25,
      inputSignals: ['net_deposit_90d', 'wallet_avg_30d', 'earn_locked_usd'],
      howScored:
        '近 N 日净充值、日均余额、理财/锁仓等归一化后加权，按档给分；档与权重由风控配置表维护。',
      scoreRule: {
        enabled: true,
        evaluator: SCORE_RULE_EVALUATOR.RANGE,
        ranges: [
          { min: 0, max: 50000, points: 5, caption: '0 ≤ 净充值(USDT) < 5万' },
          { min: 50000, max: 200000, points: 15, caption: '5万 ≤ 净充值(USDT) < 20万' },
          { min: 200000, max: null, points: 25, caption: '净充值(USDT) ≥ 20万' }
        ]
      }
    },
    {
      key: 'trading_activity',
      group: LENDING_SCORECARD_GROUP.TRADING,
      label: '交易活跃',
      description:
        '按「近 30 日现货、永续、交割三类成交额之和」统一折算为 USDT 后分档；下表「下限 ≥」「上限 <」均为该合计值的 USDT 数额（左闭右开）。',
      maxPoints: 20,
      inputSignals: [
        'spot_volume_30d',
        'perp_volume_30d',
        'delivery_volume_30d',
        'spot_trades_30d',
        'login_activity'
      ],
      howScored:
        '统计周期内现货、永续、交割成交量（及笔数、登录活跃等辅助信号）分档计分；可与反作弊规则裁剪异常流量。',
      scoreRule: {
        enabled: true,
        evaluator: SCORE_RULE_EVALUATOR.RANGE,
        ranges: [
          { min: 0, max: 50000, points: 4, caption: '0 ≤ 现货+永续+交割成交额(USDT) < 5万' },
          { min: 50000, max: 150000, points: 10, caption: '5万 ≤ 现货+永续+交割成交额(USDT) < 15万' },
          { min: 150000, max: null, points: 20, caption: '现货+永续+交割成交额(USDT) ≥ 15万' }
        ]
      }
    },
    {
      key: 'membership_tier',
      group: LENDING_SCORECARD_GROUP.VIP,
      label: '会员等级',
      description:
        '按字段 vip_level 的整数等级 0～5 与下表「取值」列一致（字符串 "0"～"5"）；数字越大档位越高。',
      maxPoints: 15,
      inputSignals: ['vip_tier', 'fee_tier'],
      howScored: 'VIP 等级、做市/吃单费率档位等查表给分；表项与会员/费率中心配置联动。',
      scoreRule: {
        enabled: true,
        evaluator: SCORE_RULE_EVALUATOR.ENUM,
        enumCases: [
          { value: '0', points: 2, caption: '普通（等级 0，取值 "0"）' },
          { value: '1', points: 4, caption: 'VIP1（取值 "1"）' },
          { value: '2', points: 7, caption: 'VIP2（取值 "2"）' },
          { value: '3', points: 10, caption: 'VIP3（取值 "3"）' },
          { value: '4', points: 13, caption: 'VIP4（取值 "4"）' },
          { value: '5', points: 15, caption: 'VIP5（取值 "5"）' }
        ]
      }
    }
  ]
})

/** 将评分卡折算写入 lendingCreditPolicy（前台进入借贷列表时调用） */
export function applyScorecardToPolicy() {
  applyScorecardCaps(lendingCreditScorecard, lendingCreditPolicy, lendingCreditDemoMetricSnapshot)
}

/**
 * @param {Partial<{ accountTotalCapNotional: number, capByLoanCurrency: Record<string, number> }>} patch
 */
export function patchLendingCreditPolicy(patch) {
  if (patch == null || typeof patch !== 'object') return
  if (patch.accountTotalCapNotional != null) {
    const n = Number(patch.accountTotalCapNotional)
    if (Number.isFinite(n) && n >= 0) lendingCreditPolicy.accountTotalCapNotional = n
  }
  if (patch.capByLoanCurrency != null && typeof patch.capByLoanCurrency === 'object') {
    for (const [k, v] of Object.entries(patch.capByLoanCurrency)) {
      const num = Number(v)
      if (k && Number.isFinite(num) && num >= 0) lendingCreditPolicy.capByLoanCurrency[k] = num
    }
  }
}

applyScorecardToPolicy()
