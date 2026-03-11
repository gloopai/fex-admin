import { PERPETUAL_STATUS } from '../constants/perpetual'

const clone = (value) => JSON.parse(JSON.stringify(value))

export const PERPETUAL_ORDER_STATUS = {
  HOLDING: 'holding',      // 持仓中
  CLOSED: 'closed',        // 已平仓
  LIQUIDATED: 'liquidated' // 已爆仓
}

export const PERPETUAL_ORDER_SIDE = {
  LONG: 'long',  // 多
  SHORT: 'short' // 空
}

// 生成 mock 订单数据
const generatePerpetualOrders = () => {
  const orders = []
  const users = [
    { userId: 'U100001', userName: '张三', vipLevel: 'VIP1' },
    { userId: 'U100002', userName: '李四', vipLevel: 'VIP2' },
    { userId: 'U100003', userName: '王五', vipLevel: 'VIP3' },
    { userId: 'U100004', userName: '赵六', vipLevel: 'VIP0' },
    { userId: 'U100005', userName: '钱七', vipLevel: 'VIP1' }
  ]
  
  const products = [
    { symbol: 'BTC/USDT', name: 'BTC 永续', basePrice: 67500 },
    { symbol: 'ETH/USDT', name: 'ETH 永续', basePrice: 3520 },
    { symbol: 'BNB/USDT', name: 'BNB 永续', basePrice: 580 },
    { symbol: 'SOL/USDT', name: 'SOL 永续', basePrice: 145 }
  ]

  const statuses = [PERPETUAL_ORDER_STATUS.HOLDING, PERPETUAL_ORDER_STATUS.CLOSED, PERPETUAL_ORDER_STATUS.LIQUIDATED]
  const sides = [PERPETUAL_ORDER_SIDE.LONG, PERPETUAL_ORDER_SIDE.SHORT]
  const leverages = [1, 2, 3, 5, 10, 20, 25, 50, 75, 100]

  for (let i = 0; i < 40; i++) {
    const user = users[Math.floor(Math.random() * users.length)]
    const product = products[Math.floor(Math.random() * products.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const side = sides[Math.floor(Math.random() * sides.length)]
    const leverage = leverages[Math.floor(Math.random() * leverages.length)]
    
    const basePrice = product.basePrice
    const entryPrice = basePrice * (1 + (Math.random() - 0.5) * 0.02)
    const currentPrice = basePrice * (1 + (Math.random() - 0.5) * 0.03)
    
    const margin = Math.random() * 5000 + 100
    const positionSize = (margin * leverage) / entryPrice
    
    let unrealizedPnl = 0
    if (side === PERPETUAL_ORDER_SIDE.LONG) {
      unrealizedPnl = (currentPrice - entryPrice) * positionSize
    } else {
      unrealizedPnl = (entryPrice - currentPrice) * positionSize
    }
    
    const unrealizedPnlRate = (unrealizedPnl / margin) * 100
    
    let liquidationPrice = 0
    if (side === PERPETUAL_ORDER_SIDE.LONG) {
      liquidationPrice = entryPrice * (1 - 0.95 / leverage)
    } else {
      liquidationPrice = entryPrice * (1 + 0.95 / leverage)
    }
    
    const positionValue = positionSize * currentPrice
    const openTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    
    let closeTime = null
    let realizedPnl = 0
    
    if (status === PERPETUAL_ORDER_STATUS.CLOSED || status === PERPETUAL_ORDER_STATUS.LIQUIDATED) {
      closeTime = new Date(openTime.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000)
      realizedPnl = unrealizedPnl * (1 + Math.random() * 0.5)
    }
    
    const fundingFee = Math.random() * 50
    const tradingFee = (positionValue * 0.0002).toFixed(2)
    
    orders.push({
      id: `PO${String(i + 1).padStart(6, '0')}`,
      orderId: `PO${String(i + 1).padStart(6, '0')}`,
      userId: user.userId,
      userName: user.userName,
      vipLevel: user.vipLevel,
      symbol: product.symbol,
      productName: product.name,
      side,
      status,
      leverage,
      margin: Number(margin.toFixed(2)),
      positionSize: Number(positionSize.toFixed(4)),
      positionValue: Number(positionValue.toFixed(2)),
      entryPrice: Number(entryPrice.toFixed(2)),
      currentPrice: Number(currentPrice.toFixed(2)),
      markPrice: Number((currentPrice * (1 + (Math.random() - 0.5) * 0.001)).toFixed(2)),
      liquidationPrice: Number(liquidationPrice.toFixed(2)),
      unrealizedPnl: Number(unrealizedPnl.toFixed(2)),
      unrealizedPnlRate: Number(unrealizedPnlRate.toFixed(2)),
      realizedPnl: Number(realizedPnl.toFixed(2)),
      openTime: openTime.toISOString().replace('T', ' ').substring(0, 19),
      closeTime: closeTime ? closeTime.toISOString().replace('T', ' ').substring(0, 19) : null,
      fundingFee: Number(fundingFee.toFixed(2)),
      tradingFee: Number(tradingFee),
      marginRatio: Number(((margin / positionValue) * 100).toFixed(2))
    })
  }
  
  return orders
}

const perpetualOrders = generatePerpetualOrders()

export const perpetualOrderStatusMeta = {
  [PERPETUAL_ORDER_STATUS.HOLDING]: {
    text: '持仓中',
    badgeClass: 'bg-blue-50 text-blue-700'
  },
  [PERPETUAL_ORDER_STATUS.CLOSED]: {
    text: '已平仓',
    badgeClass: 'bg-slate-100 text-slate-600'
  },
  [PERPETUAL_ORDER_STATUS.LIQUIDATED]: {
    text: '已爆仓',
    badgeClass: 'bg-rose-50 text-rose-700'
  }
}

export const perpetualOrderSideMeta = {
  [PERPETUAL_ORDER_SIDE.LONG]: {
    text: '多',
    badgeClass: 'bg-emerald-50 text-emerald-700'
  },
  [PERPETUAL_ORDER_SIDE.SHORT]: {
    text: '空',
    badgeClass: 'bg-rose-50 text-rose-700'
  }
}

export const createPerpetualOrdersMock = () => clone(perpetualOrders)
