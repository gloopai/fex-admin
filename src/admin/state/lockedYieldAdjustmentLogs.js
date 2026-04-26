import { ref } from 'vue'

const clone = (v) => JSON.parse(JSON.stringify(v))

/** 初始演示数据（独立于此文件，避免与 mock/liquidityLocked 循环或缓存导致导出不一致） */
const INITIAL_YIELD_ADJUSTMENT_LOGS = [
  {
    id: 'log-001',
    productId: 'prod-002',
    productName: 'BTC定期宝',
    currency: 'BTC',
    beforeRate: 0,
    afterRate: 20,
    beforeMultiplier: 1,
    afterMultiplier: 1.2,
    durationLabel: '持续生效',
    actionType: 'adjust',
    operator: 'admin',
    reason: '市场利率上升，调高收益吸引用户',
    createdAt: '2026-03-07 14:30:25'
  },
  {
    id: 'log-002',
    productId: 'prod-003',
    productName: 'ETH增益计划',
    currency: 'ETH',
    beforeRate: 0,
    afterRate: -10,
    beforeMultiplier: 1,
    afterMultiplier: 0.9,
    durationLabel: '次自然日恢复',
    actionType: 'adjust',
    operator: 'admin',
    reason: '成本控制，降低收益',
    createdAt: '2026-03-06 10:15:10'
  },
  {
    id: 'log-003',
    productId: 'prod-001',
    productName: 'USDT活期宝',
    currency: 'USDT',
    beforeRate: 15,
    afterRate: 0,
    beforeMultiplier: 1.15,
    afterMultiplier: 1,
    durationLabel: '—',
    actionType: 'reset',
    operator: 'admin',
    reason: '活动结束，恢复基准',
    createdAt: '2026-03-05 09:00:00'
  }
]

/** 与「收益调控」页保存/重置、本日志列表共用 */
export const lockedYieldAdjustmentLogs = ref(clone(INITIAL_YIELD_ADJUSTMENT_LOGS))

let _seq = 0
export function appendLockedYieldAdjustmentLog(entry) {
  const id = entry.id || `log-${Date.now()}-${++_seq}`
  lockedYieldAdjustmentLogs.value = [{ ...entry, id }, ...lockedYieldAdjustmentLogs.value]
}
