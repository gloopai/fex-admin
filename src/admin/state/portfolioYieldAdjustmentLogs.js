import { ref } from 'vue'

const clone = (v) => JSON.parse(JSON.stringify(v))

const INITIAL_PORTFOLIO_YIELD_ADJUSTMENT_LOGS = [
  {
    id: 'pfyalog-001',
    productId: 'pf-btc-shib-xrp-5d',
    productName: 'BTC + SHIB + XRP 进取组合',
    assetsLabel: 'BTC + SHIB + XRP',
    beforeRate: 0,
    afterRate: 20,
    beforeMultiplier: 1,
    afterMultiplier: 1.2,
    beforeRange: '0.40% - 0.80%/天',
    afterRange: '0.48% - 0.96%/天',
    durationLabel: '持续生效',
    actionType: 'adjust',
    operator: 'admin',
    reason: '活动期提高组合收益展示',
    createdAt: '2026-07-11 10:30:00'
  },
  {
    id: 'pfyalog-002',
    productId: 'pf-usdt-eth-btc-3d',
    productName: 'USDT + ETH + BTC 稳健组合',
    assetsLabel: 'USDT + ETH + BTC',
    beforeRate: 15,
    afterRate: 0,
    beforeMultiplier: 1.15,
    afterMultiplier: 1,
    beforeRange: '0.23% - 0.69%/天',
    afterRange: '0.20% - 0.60%/天',
    durationLabel: '—',
    actionType: 'reset',
    operator: 'admin',
    reason: '活动结束，恢复基准收益',
    createdAt: '2026-07-10 18:00:00'
  }
]

export const portfolioYieldAdjustmentLogs = ref(clone(INITIAL_PORTFOLIO_YIELD_ADJUSTMENT_LOGS))

let seq = 0

export function appendPortfolioYieldAdjustmentLog(entry) {
  const id = entry.id || `pfyalog-${Date.now()}-${++seq}`
  portfolioYieldAdjustmentLogs.value = [{ ...entry, id }, ...portfolioYieldAdjustmentLogs.value]
}
