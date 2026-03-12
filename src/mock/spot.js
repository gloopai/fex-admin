// 现货交易产品 Mock 数据

export const mockSpotProducts = [
  {
    productId: 'SPOT001',
    productName: 'BTC/USDT',
    baseCurrency: 'BTC',
    quoteCurrency: 'USDT',
    pricePrecision: 2,
    quantityPrecision: 6,
    minOrderQuantity: 0.00001,
    minOrderValue: 10,
    maxOrderValue: 1000000,
    buyFee: 0.1,
    sellFee: 0.1,
    status: 'trading',
    volume24h: 125000000,
    priceChange24h: 2.5,
    bidDepth: 5000000,
    askDepth: 4800000
  },
  {
    productId: 'SPOT002',
    productName: 'ETH/USDT',
    baseCurrency: 'ETH',
    quoteCurrency: 'USDT',
    pricePrecision: 2,
    quantityPrecision: 6,
    minOrderQuantity: 0.0001,
    minOrderValue: 10,
    maxOrderValue: 500000,
    buyFee: 0.1,
    sellFee: 0.1,
    status: 'trading',
    volume24h: 85000000,
    priceChange24h: -1.2,
    bidDepth: 3500000,
    askDepth: 3200000
  },
  {
    productId: 'SPOT003',
    productName: 'BNB/USDT',
    baseCurrency: 'BNB',
    quoteCurrency: 'USDT',
    pricePrecision: 2,
    quantityPrecision: 4,
    minOrderQuantity: 0.001,
    minOrderValue: 10,
    maxOrderValue: 300000,
    buyFee: 0.1,
    sellFee: 0.1,
    status: 'trading',
    volume24h: 45000000,
    priceChange24h: 3.8,
    bidDepth: 2000000,
    askDepth: 1900000
  },
  {
    productId: 'SPOT004',
    productName: 'SOL/USDT',
    baseCurrency: 'SOL',
    quoteCurrency: 'USDT',
    pricePrecision: 3,
    quantityPrecision: 4,
    minOrderQuantity: 0.01,
    minOrderValue: 10,
    maxOrderValue: 200000,
    buyFee: 0.1,
    sellFee: 0.1,
    status: 'trading',
    volume24h: 32000000,
    priceChange24h: 5.6,
    bidDepth: 1500000,
    askDepth: 1400000
  },
  {
    productId: 'SPOT005',
    productName: 'XRP/USDT',
    baseCurrency: 'XRP',
    quoteCurrency: 'USDT',
    pricePrecision: 4,
    quantityPrecision: 2,
    minOrderQuantity: 1,
    minOrderValue: 10,
    maxOrderValue: 100000,
    buyFee: 0.1,
    sellFee: 0.1,
    status: 'trading',
    volume24h: 28000000,
    priceChange24h: -0.5,
    bidDepth: 1200000,
    askDepth: 1100000
  },
  {
    productId: 'SPOT006',
    productName: 'BTC/USD',
    baseCurrency: 'BTC',
    quoteCurrency: 'USD',
    pricePrecision: 2,
    quantityPrecision: 6,
    minOrderQuantity: 0.00001,
    minOrderValue: 100,
    maxOrderValue: 2000000,
    buyFee: 0.08,
    sellFee: 0.1,
    status: 'trading',
    volume24h: 65000000,
    priceChange24h: 1.8,
    bidDepth: 3000000,
    askDepth: 2800000
  },
  {
    productId: 'SPOT007',
    productName: 'ETH/BTC',
    baseCurrency: 'ETH',
    quoteCurrency: 'BTC',
    pricePrecision: 6,
    quantityPrecision: 6,
    minOrderQuantity: 0.001,
    minOrderValue: 0.001,
    maxOrderValue: 100,
    buyFee: 0.1,
    sellFee: 0.1,
    status: 'trading',
    volume24h: 15000,
    priceChange24h: -0.8,
    bidDepth: 800,
    askDepth: 750
  },
  {
    productId: 'SPOT008',
    productName: 'DOGE/USDT',
    baseCurrency: 'DOGE',
    quoteCurrency: 'USDT',
    pricePrecision: 6,
    quantityPrecision: 1,
    minOrderQuantity: 10,
    minOrderValue: 10,
    maxOrderValue: 50000,
    buyFee: 0.1,
    sellFee: 0.1,
    status: 'suspended',
    volume24h: 8000000,
    priceChange24h: -5.2,
    bidDepth: 300000,
    askDepth: 280000
  }
]

// 现货订单 Mock 数据
export const mockSpotOrders = [
  {
    orderId: 'SO20240101001',
    userId: 'U001',
    userEmail: 'user1@example.com',
    productCode: 'BTCUSDT',
    productName: 'BTC/USDT',
    baseCurrency: 'BTC',
    quoteCurrency: 'USDT',
    type: 'buy',
    status: 'filled',
    price: 42500.00,
    quantity: 0.5,
    filledQuantity: 0.5,
    remainingQuantity: 0,
    totalValue: 21250.00,
    filledValue: 21250.00,
    avgFilledPrice: 42500.00,
    fee: 2.125,
    feeRate: 0.1,
    createTime: '2024-01-01 10:30:00',
    updateTime: '2024-01-01 10:30:05',
    trades: [
      { price: 42500.00, quantity: 0.5, value: 21250.00, time: '2024-01-01 10:30:05' }
    ]
  },
  {
    orderId: 'SO20240101002',
    userId: 'U002',
    userEmail: 'user2@example.com',
    productCode: 'ETHUSDT',
    productName: 'ETH/USDT',
    baseCurrency: 'ETH',
    quoteCurrency: 'USDT',
    type: 'sell',
    status: 'filled',
    price: 2250.50,
    quantity: 10,
    filledQuantity: 10,
    remainingQuantity: 0,
    totalValue: 22505.00,
    filledValue: 22505.00,
    avgFilledPrice: 2250.50,
    fee: 2.251,
    feeRate: 0.1,
    createTime: '2024-01-01 11:15:00',
    updateTime: '2024-01-01 11:15:08',
    trades: [
      { price: 2250.50, quantity: 10, value: 22505.00, time: '2024-01-01 11:15:08' }
    ]
  },
  {
    orderId: 'SO20240101003',
    userId: 'U003',
    userEmail: 'user3@example.com',
    productCode: 'BNBUSDT',
    productName: 'BNB/USDT',
    baseCurrency: 'BNB',
    quoteCurrency: 'USDT',
    type: 'buy',
    status: 'pending',
    price: 315.80,
    quantity: 50,
    filledQuantity: 0,
    remainingQuantity: 50,
    totalValue: 15790.00,
    filledValue: 0,
    avgFilledPrice: 0,
    fee: 0,
    feeRate: 0.1,
    createTime: '2024-01-01 14:20:00',
    updateTime: '2024-01-01 14:20:00',
    trades: []
  },
  {
    orderId: 'SO20240101004',
    userId: 'U001',
    userEmail: 'user1@example.com',
    productCode: 'SOLUSDT',
    productName: 'SOL/USDT',
    baseCurrency: 'SOL',
    quoteCurrency: 'USDT',
    type: 'buy',
    status: 'filled',
    price: 98.50,
    quantity: 100,
    filledQuantity: 100,
    remainingQuantity: 0,
    totalValue: 9850.00,
    filledValue: 9850.00,
    avgFilledPrice: 98.50,
    fee: 0.985,
    feeRate: 0.1,
    createTime: '2024-01-01 15:00:00',
    updateTime: '2024-01-01 15:00:10',
    trades: [
      { price: 98.50, quantity: 100, value: 9850.00, time: '2024-01-01 15:00:10' }
    ]
  },
  {
    orderId: 'SO20240101005',
    userId: 'U004',
    userEmail: 'user4@example.com',
    productCode: 'XRPUSDT',
    productName: 'XRP/USDT',
    baseCurrency: 'XRP',
    quoteCurrency: 'USDT',
    type: 'sell',
    status: 'cancelled',
    price: 0.62,
    quantity: 5000,
    filledQuantity: 0,
    remainingQuantity: 5000,
    totalValue: 3100.00,
    filledValue: 0,
    avgFilledPrice: 0,
    fee: 0,
    feeRate: 0.1,
    createTime: '2024-01-01 16:30:00',
    updateTime: '2024-01-01 16:35:00',
    trades: []
  },
  {
    orderId: 'SO20240101006',
    userId: 'U005',
    userEmail: 'user5@example.com',
    productCode: 'BTCUSDT',
    productName: 'BTC/USDT',
    baseCurrency: 'BTC',
    quoteCurrency: 'USDT',
    type: 'sell',
    status: 'filled',
    price: 42800.00,
    quantity: 0.25,
    filledQuantity: 0.25,
    remainingQuantity: 0,
    totalValue: 10700.00,
    filledValue: 10700.00,
    avgFilledPrice: 42800.00,
    fee: 1.07,
    feeRate: 0.1,
    createTime: '2024-01-02 09:15:00',
    updateTime: '2024-01-02 09:15:08',
    trades: [
      { price: 42800.00, quantity: 0.25, value: 10700.00, time: '2024-01-02 09:15:08' }
    ]
  },
  {
    orderId: 'SO20240101007',
    userId: 'U002',
    userEmail: 'user2@example.com',
    productCode: 'ETHUSDT',
    productName: 'ETH/USDT',
    baseCurrency: 'ETH',
    quoteCurrency: 'USDT',
    type: 'buy',
    status: 'filled',
    price: 2245.00,
    quantity: 8,
    filledQuantity: 8,
    remainingQuantity: 0,
    totalValue: 17960.00,
    filledValue: 17960.00,
    avgFilledPrice: 2245.00,
    fee: 1.796,
    feeRate: 0.1,
    createTime: '2024-01-02 10:00:00',
    updateTime: '2024-01-02 10:00:12',
    trades: [
      { price: 2245.00, quantity: 8, value: 17960.00, time: '2024-01-02 10:00:12' }
    ]
  },
  {
    orderId: 'SO20240101008',
    userId: 'U006',
    userEmail: 'user6@example.com',
    productCode: 'DOGEUSDT',
    productName: 'DOGE/USDT',
    baseCurrency: 'DOGE',
    quoteCurrency: 'USDT',
    type: 'buy',
    status: 'pending',
    price: 0.085,
    quantity: 10000,
    filledQuantity: 0,
    remainingQuantity: 10000,
    totalValue: 850.00,
    filledValue: 0,
    avgFilledPrice: 0,
    fee: 0,
    feeRate: 0.1,
    createTime: '2024-01-02 11:30:00',
    updateTime: '2024-01-02 11:30:00',
    trades: []
  },
  {
    orderId: 'SO20240101009',
    userId: 'U003',
    userEmail: 'user3@example.com',
    productCode: 'ADAUSDT',
    productName: 'ADA/USDT',
    baseCurrency: 'ADA',
    quoteCurrency: 'USDT',
    type: 'sell',
    status: 'filled',
    price: 0.58,
    quantity: 2000,
    filledQuantity: 2000,
    remainingQuantity: 0,
    totalValue: 1160.00,
    filledValue: 1160.00,
    avgFilledPrice: 0.58,
    fee: 0.116,
    feeRate: 0.1,
    createTime: '2024-01-02 13:00:00',
    updateTime: '2024-01-02 13:00:12',
    trades: [
      { price: 0.58, quantity: 2000, value: 1160.00, time: '2024-01-02 13:00:12' }
    ]
  },
  {
    orderId: 'SO20240101010',
    userId: 'U007',
    userEmail: 'user7@example.com',
    productCode: 'DOTUSDT',
    productName: 'DOT/USDT',
    baseCurrency: 'DOT',
    quoteCurrency: 'USDT',
    type: 'buy',
    status: 'pending',
    price: 7.85,
    quantity: 500,
    filledQuantity: 0,
    remainingQuantity: 500,
    totalValue: 3925.00,
    filledValue: 0,
    avgFilledPrice: 0,
    fee: 0,
    feeRate: 0.1,
    createTime: '2024-01-02 14:45:00',
    updateTime: '2024-01-02 14:45:00',
    trades: []
  }
]

const unixNowSec = () => Math.floor(Date.now() / 1000)

const createSymbolMocks = () => {
  const now = unixNowSec()
  const base = [
    { base_coin_id: 1, base_coin_name: 'BTC', base_coin_prec: 8, quote_coin_id: 2, quote_coin_name: 'USDT', quote_coin_prec: 2, pair_type: 1 },
    { base_coin_id: 3, base_coin_name: 'ETH', base_coin_prec: 8, quote_coin_id: 2, quote_coin_name: 'USDT', quote_coin_prec: 2, pair_type: 1 },
    { base_coin_id: 4, base_coin_name: 'BNB', base_coin_prec: 8, quote_coin_id: 2, quote_coin_name: 'USDT', quote_coin_prec: 2, pair_type: 1 },
    { base_coin_id: 5, base_coin_name: 'SOL', base_coin_prec: 8, quote_coin_id: 2, quote_coin_name: 'USDT', quote_coin_prec: 2, pair_type: 1 },
    { base_coin_id: 6, base_coin_name: 'XRP', base_coin_prec: 6, quote_coin_id: 2, quote_coin_name: 'USDT', quote_coin_prec: 2, pair_type: 1 },
    { base_coin_id: 7, base_coin_name: 'EUR', base_coin_prec: 2, quote_coin_id: 8, quote_coin_name: 'USD', quote_coin_prec: 2, pair_type: 2 },
    { base_coin_id: 9, base_coin_name: 'XAU', base_coin_prec: 3, quote_coin_id: 8, quote_coin_name: 'USD', quote_coin_prec: 2, pair_type: 3 }
  ]

  const items = []
  for (let i = 0; i < 18; i++) {
    const t = base[i % base.length]
    const baseName = t.base_coin_name
    const quoteName = t.quote_coin_name
    items.push({
      id: i + 1,
      symbol_name: `${baseName}/${quoteName}`,
      symbol_id: 1000 + i + 1,
      base_coin_id: t.base_coin_id,
      base_coin_name: t.base_coin_name,
      base_coin_prec: t.base_coin_prec,
      quote_coin_id: t.quote_coin_id,
      quote_coin_name: t.quote_coin_name,
      quote_coin_prec: t.quote_coin_prec,
      created_at: now - (i + 1) * 86400,
      updated_at: now - (i + 1) * 3600,
      deleted_at: 0,
      is_table_create: i % 4 === 0 ? 0 : 1,
      is_open: i % 6 === 0 ? 0 : 1,
      pair_type: t.pair_type
    })
  }
  return items
}

let symbolStore = createSymbolMocks()
let symbolAutoId = symbolStore.reduce((m, it) => Math.max(m, Number(it.id) || 0), 0)

const normalizeFilterFlag = (v) => (v === 'all' || v === undefined || v === null || v === '' ? null : Number(v))

export const symbolApi = {
  getSymbolList: (params = {}) => {
    const {
      page = 1,
      pageSize = 10,
      keyword = '',
      is_open = 'all',
      pair_type = 'all',
      is_table_create = 'all',
      includeDeleted = false
    } = params

    const kw = String(keyword || '').trim().toLowerCase()
    const openFilter = normalizeFilterFlag(is_open)
    const typeFilter = normalizeFilterFlag(pair_type)
    const tableFilter = normalizeFilterFlag(is_table_create)

    return new Promise((resolve) => {
      setTimeout(() => {
        let list = [...symbolStore]

        if (!includeDeleted) {
          list = list.filter((s) => !Number(s.deleted_at))
        }

        if (kw) {
          list = list.filter((s) => {
            const blob = `${s.symbol_name} ${s.symbol_id} ${s.base_coin_name} ${s.quote_coin_name}`.toLowerCase()
            return blob.includes(kw)
          })
        }

        if (openFilter !== null) list = list.filter((s) => Number(s.is_open) === openFilter)
        if (typeFilter !== null) list = list.filter((s) => Number(s.pair_type) === typeFilter)
        if (tableFilter !== null) list = list.filter((s) => Number(s.is_table_create) === tableFilter)

        list.sort((a, b) => (Number(b.updated_at) || 0) - (Number(a.updated_at) || 0))

        const total = list.length
        const start = (Number(page) - 1) * Number(pageSize)
        const end = start + Number(pageSize)

        resolve({
          success: true,
          data: {
            list: list.slice(start, end),
            total,
            page: Number(page),
            pageSize: Number(pageSize)
          }
        })
      }, 250)
    })
  },

  createSymbol: (payload) => {
    const input = { ...(payload || {}) }
    const symbol_name = String(input.symbol_name || '').trim()
    const symbol_id = Number(input.symbol_id)

    return new Promise((resolve) => {
      setTimeout(() => {
        if (!symbol_name) return resolve({ success: false, message: 'symbol_name 不能为空' })
        if (!Number.isFinite(symbol_id) || symbol_id <= 0) return resolve({ success: false, message: 'symbol_id 不合法' })

        if (symbolStore.some((s) => !Number(s.deleted_at) && s.symbol_name === symbol_name)) {
          return resolve({ success: false, message: '交易对名称已存在' })
        }
        if (symbolStore.some((s) => !Number(s.deleted_at) && Number(s.symbol_id) === symbol_id)) {
          return resolve({ success: false, message: '交易对ID已存在' })
        }

        symbolAutoId += 1
        const now = unixNowSec()
        const row = {
          id: symbolAutoId,
          symbol_name,
          symbol_id,
          base_coin_id: Number(input.base_coin_id) || 0,
          base_coin_name: String(input.base_coin_name || '').trim(),
          base_coin_prec: Number(input.base_coin_prec) || 0,
          quote_coin_id: Number(input.quote_coin_id) || 0,
          quote_coin_name: String(input.quote_coin_name || '').trim(),
          quote_coin_prec: Number(input.quote_coin_prec) || 0,
          created_at: now,
          updated_at: now,
          deleted_at: 0,
          is_table_create: Number(input.is_table_create) ? 1 : 0,
          is_open: Number(input.is_open) ? 1 : 0,
          pair_type: Number(input.pair_type) || 1
        }

        symbolStore.unshift(row)
        resolve({ success: true, data: row })
      }, 250)
    })
  },

  updateSymbol: (payload) => {
    const input = { ...(payload || {}) }
    const id = Number(input.id)
    if (!Number.isFinite(id) || id <= 0) return Promise.resolve({ success: false, message: 'id 不合法' })

    return new Promise((resolve) => {
      setTimeout(() => {
        const idx = symbolStore.findIndex((s) => Number(s.id) === id)
        if (idx === -1) return resolve({ success: false, message: '记录不存在' })

        const next = { ...symbolStore[idx] }

        if (input.symbol_name !== undefined) next.symbol_name = String(input.symbol_name || '').trim()
        if (input.symbol_id !== undefined) next.symbol_id = Number(input.symbol_id)
        if (input.base_coin_id !== undefined) next.base_coin_id = Number(input.base_coin_id)
        if (input.base_coin_name !== undefined) next.base_coin_name = String(input.base_coin_name || '').trim()
        if (input.base_coin_prec !== undefined) next.base_coin_prec = Number(input.base_coin_prec)
        if (input.quote_coin_id !== undefined) next.quote_coin_id = Number(input.quote_coin_id)
        if (input.quote_coin_name !== undefined) next.quote_coin_name = String(input.quote_coin_name || '').trim()
        if (input.quote_coin_prec !== undefined) next.quote_coin_prec = Number(input.quote_coin_prec)
        if (input.is_table_create !== undefined) next.is_table_create = Number(input.is_table_create) ? 1 : 0
        if (input.is_open !== undefined) next.is_open = Number(input.is_open) ? 1 : 0
        if (input.pair_type !== undefined) next.pair_type = Number(input.pair_type)

        if (!next.symbol_name) return resolve({ success: false, message: 'symbol_name 不能为空' })
        if (!Number.isFinite(next.symbol_id) || next.symbol_id <= 0) return resolve({ success: false, message: 'symbol_id 不合法' })

        if (symbolStore.some((s) => Number(s.id) !== id && !Number(s.deleted_at) && s.symbol_name === next.symbol_name)) {
          return resolve({ success: false, message: '交易对名称已存在' })
        }
        if (symbolStore.some((s) => Number(s.id) !== id && !Number(s.deleted_at) && Number(s.symbol_id) === Number(next.symbol_id))) {
          return resolve({ success: false, message: '交易对ID已存在' })
        }

        next.updated_at = unixNowSec()
        symbolStore[idx] = next
        resolve({ success: true, data: next })
      }, 250)
    })
  },

  deleteSymbol: ({ id }) => {
    const sid = Number(id)
    if (!Number.isFinite(sid) || sid <= 0) return Promise.resolve({ success: false, message: 'id 不合法' })

    return new Promise((resolve) => {
      setTimeout(() => {
        const idx = symbolStore.findIndex((s) => Number(s.id) === sid)
        if (idx === -1) return resolve({ success: false, message: '记录不存在' })
        if (Number(symbolStore[idx].deleted_at)) return resolve({ success: true })
        symbolStore[idx] = { ...symbolStore[idx], deleted_at: unixNowSec(), updated_at: unixNowSec(), is_open: 0 }
        resolve({ success: true })
      }, 250)
    })
  }
}
