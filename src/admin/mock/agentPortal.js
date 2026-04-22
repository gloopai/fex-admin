/**
 * 代理系统占位数据（可对接接口替换）
 */

import { AGENT_PRODUCT_LINE_DEFS } from '../constants/agentCommission'

export const agentDashboardSummary = {
  monthVolume: 1284000,
  monthVolumeUnit: 'USDT',
  activeClients: 186,
  newClientsThisMonth: 24,
  pendingKyc: 5,
  monthCommission: 8420.55,
  settlementStatus: '待结算',
  nextSettlementDate: '2026-04-20'
}

/** 一级代理：仅直邀用户，无多级分润链 */
export const agentDataQueryRows = [
  {
    id: 'u-1001',
    uid: '8839201',
    registerAt: '2026-03-12',
    monthTrade: 42000,
    status: '正常'
  },
  {
    id: 'u-1002',
    uid: '8839202',
    registerAt: '2026-02-28',
    monthTrade: 128800,
    status: '正常'
  },
  {
    id: 'u-1003',
    uid: '8839203',
    registerAt: '2026-04-02',
    monthTrade: 9600,
    status: '正常'
  }
]

/** 与 AGENT_PRODUCT_LINE_DEFS 顺序、key 对齐；拆分量之和等于当日 tradeVolume / estCommission（末项吃余数） */
const AGENT_DAILY_VOLUME_WEIGHTS = {
  deposit: 0.02,
  perpetual: 0.4,
  delivery: 0.2,
  spot: 0.2,
  aiQuant: 0.08,
  lending: 0.06,
  borrowing: 0.04
}

function buildAgentDailyModuleSplit(tradeVolume, estCommission) {
  const keys = AGENT_PRODUCT_LINE_DEFS.map((d) => d.key)
  const volumeByModule = {}
  let assignedVol = 0
  keys.forEach((k, i) => {
    if (i === keys.length - 1) {
      volumeByModule[k] = Math.max(0, Math.round(tradeVolume - assignedVol))
    } else {
      const w = AGENT_DAILY_VOLUME_WEIGHTS[k] ?? 0
      const v = Math.round(tradeVolume * w)
      volumeByModule[k] = v
      assignedVol += v
    }
  })
  const commissionByModule = {}
  keys.forEach((k) => {
    const v = volumeByModule[k]
    commissionByModule[k] =
      tradeVolume > 0 ? Math.round(estCommission * (v / tradeVolume) * 100) / 100 : 0
  })
  return { volumeByModule, commissionByModule }
}

const AGENT_DAILY_REPORT_RAW = [
  { date: '2026-04-13', tradeVolume: 184200, newInvites: 2, activeUsers: 51, estCommission: 152.34 },
  { date: '2026-04-12', tradeVolume: 162800, newInvites: 4, activeUsers: 48, estCommission: 138.92 },
  { date: '2026-04-11', tradeVolume: 171300, newInvites: 1, activeUsers: 46, estCommission: 141.05 },
  { date: '2026-04-10', tradeVolume: 158900, newInvites: 3, activeUsers: 45, estCommission: 132.18 },
  { date: '2026-04-09', tradeVolume: 149200, newInvites: 0, activeUsers: 44, estCommission: 125.4 },
  { date: '2026-04-08', tradeVolume: 165400, newInvites: 5, activeUsers: 47, estCommission: 139.22 },
  { date: '2026-04-07', tradeVolume: 142100, newInvites: 2, activeUsers: 43, estCommission: 118.76 },
  { date: '2026-04-06', tradeVolume: 138800, newInvites: 1, activeUsers: 42, estCommission: 115.9 },
  { date: '2026-04-05', tradeVolume: 151000, newInvites: 3, activeUsers: 44, estCommission: 126.33 },
  { date: '2026-04-04', tradeVolume: 129600, newInvites: 0, activeUsers: 41, estCommission: 108.15 },
  { date: '2026-04-03', tradeVolume: 144300, newInvites: 2, activeUsers: 42, estCommission: 120.08 },
  { date: '2026-04-02', tradeVolume: 136700, newInvites: 4, activeUsers: 40, estCommission: 114.22 },
  { date: '2026-04-01', tradeVolume: 131200, newInvites: 1, activeUsers: 39, estCommission: 109.5 },
  { date: '2026-03-31', tradeVolume: 128400, newInvites: 2, activeUsers: 38, estCommission: 106.88 },
  { date: '2026-03-30', tradeVolume: 119800, newInvites: 0, activeUsers: 37, estCommission: 99.42 },
  { date: '2026-03-29', tradeVolume: 125500, newInvites: 3, activeUsers: 38, estCommission: 104.6 },
  { date: '2026-03-28', tradeVolume: 117200, newInvites: 1, activeUsers: 36, estCommission: 97.15 },
  { date: '2026-03-27', tradeVolume: 122000, newInvites: 2, activeUsers: 37, estCommission: 101.3 }
]

/**
 * 按日汇总（直邀维度占位；对接接口后由服务端按代理 UID 与产品线聚合）
 * volumeByModule / commissionByModule 的 key 与后台「代理管理 → 记佣」产品线一致
 */
export const agentDailyReportRows = AGENT_DAILY_REPORT_RAW.map((r) => {
  const { volumeByModule, commissionByModule } = buildAgentDailyModuleSplit(r.tradeVolume, r.estCommission)
  return { ...r, volumeByModule, commissionByModule }
})

export const agentVerificationQueue = [
  {
    id: 'kyc-501',
    uid: '8839205',
    name: '王**',
    idType: '身份证',
    submitAt: '2026-04-11 14:22',
    channel: '下级用户',
    status: 'pending'
  },
  {
    id: 'kyc-502',
    uid: '8839208',
    name: '李**',
    idType: '护照',
    submitAt: '2026-04-10 09:05',
    channel: '下级用户',
    status: 'pending'
  }
]

/** 直邀成员列表（一级代理，无子代理/多级） */
export const agentTeamMembers = [
  {
    id: 'm1',
    uid: '8839201',
    registerAt: '2025-11-08',
    userStatus: '活跃',
    monthTrade: 210000,
    totalTrade: 1820000
  },
  {
    id: 'm2',
    uid: '8839204',
    registerAt: '2026-01-19',
    userStatus: '活跃',
    monthTrade: 88000,
    totalTrade: 420000
  },
  {
    id: 'm3',
    uid: '8839207',
    registerAt: '2026-04-01',
    userStatus: '新开',
    monthTrade: 42000,
    totalTrade: 42000
  },
  {
    id: 'm4',
    uid: '8839210',
    registerAt: '2025-08-30',
    userStatus: '沉默',
    monthTrade: 12000,
    totalTrade: 960000
  }
]

