import { ref } from 'vue'
import {
  LENDING_OP_ACTION,
  LENDING_OP_MODULE
} from '../constants/lendingOperationLog'

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

const INITIAL_LENDING_OPERATION_LOGS = [
  {
    id: 'lend-op-001',
    module: LENDING_OP_MODULE.CREDIT_LIMITS,
    action: LENDING_OP_ACTION.SAVE_LIMITS,
    refId: null,
    targetLabel: '额度模板',
    summary: '保存：低分保底比例 minScale=0.35，账户总授信（满分时）= 2,500,000',
    operator: 'admin',
    createdAt: '2026-04-20 10:12:08'
  },
  {
    id: 'lend-op-002',
    module: LENDING_OP_MODULE.CREDIT_SCORECARD,
    action: LENDING_OP_ACTION.SAVE_SCORECARD,
    refId: 'identity_compliance',
    targetLabel: '实名认证',
    summary: '保存评分维度「实名认证」规则与权重（卡内权重 20）',
    operator: 'risk_ops',
    createdAt: '2026-04-19 16:40:22'
  },
  {
    id: 'lend-op-003',
    module: LENDING_OP_MODULE.PRODUCT,
    action: LENDING_OP_ACTION.PRODUCT_UPDATE,
    refId: 'PROD001',
    targetLabel: 'USDT 灵活借',
    summary: '编辑产品：调整年化利率与可用流动性',
    operator: 'admin',
    createdAt: '2026-04-18 11:05:00'
  },
  {
    id: 'lend-op-004',
    module: LENDING_OP_MODULE.PRODUCT,
    action: LENDING_OP_ACTION.PRODUCT_STATUS,
    refId: 'PROD002',
    targetLabel: 'BTC 定期借',
    summary: '产品状态：active → suspended（暂停申购）',
    operator: 'admin',
    createdAt: '2026-04-17 09:30:15'
  },
  {
    id: 'lend-op-005',
    module: LENDING_OP_MODULE.ORDER,
    action: LENDING_OP_ACTION.ORDER_APPROVE,
    refId: 'LOAN-2026-0412-008',
    targetLabel: '借款单审核',
    summary: '批准放款；审核意见：资料齐全，授信在档',
    operator: 'admin',
    createdAt: '2026-04-16 14:22:41'
  },
  {
    id: 'lend-op-006',
    module: LENDING_OP_MODULE.ORDER,
    action: LENDING_OP_ACTION.ORDER_REJECT,
    refId: 'LOAN-2026-0411-003',
    targetLabel: '借款单审核',
    summary: '拒绝申请；原因：负债率偏高，建议补充资产证明',
    operator: 'risk_ops',
    createdAt: '2026-04-15 10:18:33'
  }
]

export const lendingOperationLogs = ref(clone(INITIAL_LENDING_OPERATION_LOGS))

let _seq = 0

/**
 * @param {Omit<(typeof INITIAL_LENDING_OPERATION_LOGS)[0], 'id' | 'createdAt'> & { id?: string, createdAt?: string }} entry
 */
export function appendLendingOperationLog(entry) {
  const id = entry.id || `lend-op-${Date.now()}-${++_seq}`
  const row = {
    operator: 'admin',
    refId: null,
    targetLabel: '—',
    ...entry,
    id,
    createdAt: entry.createdAt || formatNowShanghai()
  }
  lendingOperationLogs.value = [row, ...lendingOperationLogs.value]
}
