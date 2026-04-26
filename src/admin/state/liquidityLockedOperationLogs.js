import { ref } from 'vue'
import {
  LIQUIDITY_LOCKED_OP_ACTION,
  LIQUIDITY_LOCKED_OP_MODULE
} from '../constants/liquidityLockedOperationLog'

const clone = (v) => JSON.parse(JSON.stringify(v))

function formatNowShanghai() {
  const d = new Date()
  const parts = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(d)
  const get = (t) => parts.find((x) => x.type === t)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`
}

const INITIAL_LIQUIDITY_LOCKED_OPERATION_LOGS = [
  {
    id: 'liq-op-001',
    module: LIQUIDITY_LOCKED_OP_MODULE.PRODUCT,
    action: LIQUIDITY_LOCKED_OP_ACTION.PRODUCT_UPDATE,
    refId: 'prod-001',
    targetLabel: 'USDT活期宝',
    summary: '编辑产品：更新锁定期档位与年化展示',
    operator: 'admin',
    createdAt: '2026-04-21 15:08:22'
  },
  {
    id: 'liq-op-002',
    module: LIQUIDITY_LOCKED_OP_MODULE.PRODUCT,
    action: LIQUIDITY_LOCKED_OP_ACTION.PRODUCT_STATUS,
    refId: 'prod-002',
    targetLabel: 'BTC定期宝',
    summary: '产品状态：已启用 → 已禁用',
    operator: 'admin',
    createdAt: '2026-04-20 10:45:00'
  },
  {
    id: 'liq-op-003',
    module: LIQUIDITY_LOCKED_OP_MODULE.YIELD_CONTROL,
    action: LIQUIDITY_LOCKED_OP_ACTION.YIELD_ADJUST,
    refId: 'prod-003',
    targetLabel: 'ETH增益计划',
    summary: '调整收益：加成 0% → 20%；倍数 1.00 → 1.20；持续生效',
    operator: 'admin',
    createdAt: '2026-04-19 14:30:25'
  }
]

export const liquidityLockedOperationLogs = ref(clone(INITIAL_LIQUIDITY_LOCKED_OPERATION_LOGS))

let _seq = 0

/**
 * @param {Omit<(typeof INITIAL_LIQUIDITY_LOCKED_OPERATION_LOGS)[0], 'id' | 'createdAt'> & { id?: string, createdAt?: string }} entry
 */
export function appendLiquidityLockedOperationLog(entry) {
  const id = entry.id || `liq-op-${Date.now()}-${++_seq}`
  const row = {
    operator: 'admin',
    refId: null,
    targetLabel: '—',
    ...entry,
    id,
    createdAt: entry.createdAt || formatNowShanghai()
  }
  liquidityLockedOperationLogs.value = [row, ...liquidityLockedOperationLogs.value]
}
