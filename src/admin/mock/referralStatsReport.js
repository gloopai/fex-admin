import { mockReferralStats } from './referral'

/** 与裂变统计 Top 排行同源，便于演示数据一致 */
const INVITER_POOL = mockReferralStats.topAgents.map((a) => ({
  uid: a.uid,
  username: a.username,
  email: `${String(a.username).replace(/[^a-zA-Z0-9_]/g, '') || 'user'}@invite.demo`
}))

function seedFromDate(dateStr) {
  let h = 0
  for (let i = 0; i < dateStr.length; i += 1) {
    h = (Math.imul(31, h) + dateStr.charCodeAt(i)) | 0
  }
  return Math.abs(h) + 1
}

function rand01(seed, salt) {
  const x = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

const breakdownByDate = new Map()

function buildDayBreakdown(dateStr) {
  if (breakdownByDate.has(dateStr)) return breakdownByDate.get(dateStr)

  const seed = seedFromDate(dateStr)
  const n = 1 + Math.floor(rand01(seed, 2) * Math.min(5, INVITER_POOL.length))
  const shuffled = [...INVITER_POOL].sort((a, b) => rand01(seed, a.uid) - rand01(seed, b.uid))

  const inviters = []
  let totalCommission = 0
  let recordCount = 0

  for (let i = 0; i < n; i += 1) {
    const u = shuffled[i]
    const commission = Math.round((20 + rand01(seed, i + 20) * 3200) * 100) / 100
    const orders = 1 + Math.floor(rand01(seed, i + 120) * 18)
    totalCommission += commission
    recordCount += orders
    inviters.push({
      uid: u.uid,
      username: u.username,
      email: u.email,
      commission,
      orderCount: orders
    })
  }

  inviters.sort((x, y) => y.commission - x.commission)

  const row = {
    date: dateStr,
    totalCommission: Math.round(totalCommission * 100) / 100,
    inviterCount: inviters.length,
    recordCount,
    inviters
  }
  breakdownByDate.set(dateStr, row)
  return row
}

function parseYmd(s) {
  const d = new Date(`${s}T12:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

function formatYmd(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function eachDateInclusive(startStr, endStr) {
  const start = parseYmd(startStr)
  const end = parseYmd(endStr)
  if (!start || !end || start > end) return []
  const out = []
  const cur = new Date(start)
  while (cur <= end) {
    out.push(formatYmd(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return out
}

export const referralStatsReportApi = {
  /**
   * @param {{ startDate: string, endDate: string }} params YYYY-MM-DD
   */
  getDailySummary: (params) =>
    new Promise((resolve) => {
      setTimeout(() => {
        const startDate = String(params?.startDate || '').trim()
        const endDate = String(params?.endDate || '').trim()
        if (!startDate || !endDate) {
          resolve({ success: false, message: '请选择起止日期' })
          return
        }
        const dates = eachDateInclusive(startDate, endDate)
        const list = dates.map((d) => {
          const day = buildDayBreakdown(d)
          return {
            date: day.date,
            totalCommission: day.totalCommission,
            inviterCount: day.inviterCount,
            recordCount: day.recordCount
          }
        })
        list.sort((a, b) => b.date.localeCompare(a.date))
        resolve({ success: true, data: { list } })
      }, 280)
    }),

  /**
   * @param {string} date YYYY-MM-DD
   */
  getInvitersForDate: (date) =>
    new Promise((resolve) => {
      setTimeout(() => {
        const dateStr = String(date || '').trim()
        if (!dateStr) {
          resolve({ success: false, message: '缺少日期' })
          return
        }
        const day = buildDayBreakdown(dateStr)
        resolve({
          success: true,
          data: {
            date: day.date,
            list: day.inviters
          }
        })
      }, 220)
    })
}
