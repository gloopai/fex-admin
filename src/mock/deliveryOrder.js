import { DELIVERY_STATUS } from '../constants/delivery'

const clone = (value) => JSON.parse(JSON.stringify(value))

export const DELIVERY_ORDER_STATUS = {
  PENDING: 'pending',    // 待结算
  SETTLED: 'settled',    // 已结算
  EXERCISED: 'exercised' // 已行权
}

export const DELIVERY_ORDER_RESULT = {
  WIN: 'win',   // 赢利
  LOSS: 'loss'  // 亏损
}

// 生成 mock 订单数据
const generateDeliveryOrders = () => {
  const orders = []
  const users = [
    { userId: 'U100001', userName: '张三', vipLevel: 'VIP1' },
    { userId: 'U100002', userName: '李四', vipLevel: 'VIP2' },
    { userId: 'U100003', userName: '王五', vipLevel: 'VIP3' },
    { userId: 'U100004', userName: '赵六', vipLevel: 'VIP0' },
    { userId: 'U100005', userName: '钱七', vipLevel: 'VIP1' }
  ]
  
  const products = [
    { 
      id: 'btc-opt', 
      name: 'BTC 期权', 
      code: 'BTC_OPT',
      basePrice: 67500,
      cycles: [
        { durationSec: 30, payoutPct: 7 },
        { durationSec: 60, payoutPct: 14 },
        { durationSec: 120, payoutPct: 28 }
      ]
    },
    { 
      id: 'eth-opt', 
      name: 'ETH 期权', 
      code: 'ETH_OPT',
      basePrice: 3520,
      cycles: [
        { durationSec: 60, payoutPct: 10 },
        { durationSec: 180, payoutPct: 30 },
        { durationSec: 300, payoutPct: 50 }
      ]
    }
  ]

  const statuses = [DELIVERY_ORDER_STATUS.PENDING, DELIVERY_ORDER_STATUS.SETTLED, DELIVERY_ORDER_STATUS.EXERCISED]
  const results = [DELIVERY_ORDER_RESULT.WIN, DELIVERY_ORDER_RESULT.LOSS]

  for (let i = 0; i < 40; i++) {
    const user = users[Math.floor(Math.random() * users.length)]
    const product = products[Math.floor(Math.random() * products.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const cycle = product.cycles[Math.floor(Math.random() * product.cycles.length)]
    
    const investAmount = Math.random() * 1000 + 10
    const expectedPayout = investAmount * (cycle.payoutPct / 100)
    const expectedReturn = investAmount + expectedPayout
    
    const betTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    const expiryTime = new Date(betTime.getTime() + cycle.durationSec * 1000)
    
    let settleTime = null
    let actualPayout = 0
    let actualReturn = 0
    let result = null
    let settlementPrice = 0
    
    if (status === DELIVERY_ORDER_STATUS.SETTLED || status === DELIVERY_ORDER_STATUS.EXERCISED) {
      settleTime = new Date(expiryTime.getTime() + Math.random() * 60 * 1000)
      result = results[Math.floor(Math.random() * results.length)]
      
      if (result === DELIVERY_ORDER_RESULT.WIN) {
        actualPayout = expectedPayout * (0.9 + Math.random() * 0.2)
        actualReturn = investAmount + actualPayout
      } else {
        actualPayout = 0
        actualReturn = 0
      }
      
      settlementPrice = product.basePrice * (1 + (Math.random() - 0.5) * 0.02)
    }
    
    const entryPrice = product.basePrice * (1 + (Math.random() - 0.5) * 0.01)
    const strikePrice = entryPrice * (1 + (Math.random() - 0.5) * 0.02)
    
    orders.push({
      id: `DO${String(i + 1).padStart(6, '0')}`,
      orderId: `DO${String(i + 1).padStart(6, '0')}`,
      userId: user.userId,
      userName: user.userName,
      vipLevel: user.vipLevel,
      productId: product.id,
      productName: product.name,
      productCode: product.code,
      status,
      result,
      investAmount: Number(investAmount.toFixed(2)),
      expectedPayout: Number(expectedPayout.toFixed(2)),
      expectedReturn: Number(expectedReturn.toFixed(2)),
      expectedYield: cycle.payoutPct,
      actualPayout: Number(actualPayout.toFixed(2)),
      actualReturn: Number(actualReturn.toFixed(2)),
      actualYield: Number(((actualReturn - investAmount) / investAmount * 100).toFixed(2)),
      cycleSeconds: cycle.durationSec,
      entryPrice: Number(entryPrice.toFixed(2)),
      strikePrice: Number(strikePrice.toFixed(2)),
      settlementPrice: settlementPrice ? Number(settlementPrice.toFixed(2)) : null,
      betTime: betTime.toISOString().replace('T', ' ').substring(0, 19),
      expiryTime: expiryTime.toISOString().replace('T', ' ').substring(0, 19),
      settleTime: settleTime ? settleTime.toISOString().replace('T', ' ').substring(0, 19) : null,
      direction: Math.random() > 0.5 ? 'CALL' : 'PUT', // CALL:看涨，PUT:看跌
      fee: Number((investAmount * 0.001).toFixed(2))
    })
  }
  
  return orders
}

const deliveryOrders = generateDeliveryOrders()

export const deliveryOrderStatusMeta = {
  [DELIVERY_ORDER_STATUS.PENDING]: {
    text: '待结算',
    badgeClass: 'bg-amber-50 text-amber-700'
  },
  [DELIVERY_ORDER_STATUS.SETTLED]: {
    text: '已结算',
    badgeClass: 'bg-slate-100 text-slate-600'
  },
  [DELIVERY_ORDER_STATUS.EXERCISED]: {
    text: '已行权',
    badgeClass: 'bg-blue-50 text-blue-700'
  }
}

export const deliveryOrderResultMeta = {
  [DELIVERY_ORDER_RESULT.WIN]: {
    text: '赢利',
    badgeClass: 'bg-emerald-50 text-emerald-700'
  },
  [DELIVERY_ORDER_RESULT.LOSS]: {
    text: '亏损',
    badgeClass: 'bg-rose-50 text-rose-700'
  }
}

export const deliveryOrderDirectionMeta = {
  CALL: {
    text: '看涨',
    badgeClass: 'bg-emerald-50 text-emerald-700'
  },
  PUT: {
    text: '看跌',
    badgeClass: 'bg-rose-50 text-rose-700'
  }
}

export const createDeliveryOrdersMock = () => clone(deliveryOrders)
