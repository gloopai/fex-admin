import { ref } from 'vue'
import {
  AI_QUANT_OP_ACTION,
  AI_QUANT_OP_MODULE
} from '../constants/aiQuantOperationLog'

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

const INITIAL_AI_QUANT_OPERATION_LOGS = [
  {
    id: 'aiq-op-001',
    module: AI_QUANT_OP_MODULE.PRODUCT,
    action: AI_QUANT_OP_ACTION.PRODUCT_UPDATE,
    refId: 'aiq-prod-demo-1',
    targetLabel: 'USDT 稳健智盈',
    summary: '编辑产品：调整收益阶梯与单用户持仓上限',
    operator: 'admin',
    createdAt: '2026-04-22 11:20:05'
  },
  {
    id: 'aiq-op-002',
    module: AI_QUANT_OP_MODULE.PRODUCT,
    action: AI_QUANT_OP_ACTION.PRODUCT_STATUS,
    refId: 'aiq-prod-demo-2',
    targetLabel: 'ETH 量化增强',
    summary: '产品状态：已启用 → 维护中',
    operator: 'ops',
    createdAt: '2026-04-21 09:15:40'
  },
  {
    id: 'aiq-op-003',
    module: AI_QUANT_OP_MODULE.YIELD_ADJUSTMENT,
    action: AI_QUANT_OP_ACTION.YIELD_ADJUSTMENT_SUBMIT,
    refId: 'AIQ-ORD-2026-0418-003',
    targetLabel: '订单收益调整',
    summary: '类型：奖励补发；金额 500 USDT；原因：活动奖励补发',
    operator: 'admin-001',
    createdAt: '2026-04-18 16:02:18'
  }
]

export const aiQuantOperationLogs = ref(clone(INITIAL_AI_QUANT_OPERATION_LOGS))

let _seq = 0

/**
 * @param {Omit<(typeof INITIAL_AI_QUANT_OPERATION_LOGS)[0], 'id' | 'createdAt'> & { id?: string, createdAt?: string }} entry
 */
export function appendAiQuantOperationLog(entry) {
  const id = entry.id || `aiq-op-${Date.now()}-${++_seq}`
  const row = {
    operator: 'admin',
    refId: null,
    targetLabel: '—',
    ...entry,
    id,
    createdAt: entry.createdAt || formatNowShanghai()
  }
  aiQuantOperationLogs.value = [row, ...aiQuantOperationLogs.value]
}
