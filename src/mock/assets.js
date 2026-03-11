import {
  ASSET_ADDRESS_LOG_STATUS,
  ASSET_ADDRESS_LOG_TYPE,
  ASSET_COLLECT_MODE,
  ASSET_COLLECT_RECORD_STATUS,
  ASSET_STATUS,
  ASSET_WALLET_STATUS,
  EXCHANGE_RATE_SOURCE,
  EXCHANGE_RATE_TYPE,
  USER_LEVEL_TIER,
  FEE_TEMPLATE_TYPE
} from '../constants/assets'

const clone = (value) => JSON.parse(JSON.stringify(value))

const assetsCoins = [
  {
    id: 'usdt',
    name: 'Tether',
    symbol: 'USDT',
    precision: 6,
    status: ASSET_STATUS.ENABLED,
    autoCollect: true,
    intervalMin: 60,
    networks: [
      {
        id: 'erc20',
        name: 'Ethereum (ERC20)',
        contract: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        collectAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        threshold: 100,
        gasLimit: 60000,
        status: ASSET_STATUS.ENABLED
      },
      {
        id: 'trc20',
        name: 'TRON (TRC20)',
        contract: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
        collectAddress: 'TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax',
        threshold: 50,
        gasLimit: 1,
        status: ASSET_STATUS.ENABLED
      },
      {
        id: 'bep20',
        name: 'BSC (BEP20)',
        contract: '0x55d398326f99059fF775485246999027B3197955',
        collectAddress: '0x8e23Ee67f9A0A1f57A13Af11f4f66f6E7c5eA1A3',
        threshold: 50,
        gasLimit: 45000,
        status: ASSET_STATUS.DISABLED
      }
    ]
  },
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    precision: 8,
    status: ASSET_STATUS.ENABLED,
    autoCollect: true,
    intervalMin: 120,
    networks: [
      {
        id: 'btc-native',
        name: 'Bitcoin (Native)',
        contract: '-',
        collectAddress: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
        threshold: 0.01,
        gasLimit: 1,
        status: ASSET_STATUS.ENABLED
      }
    ]
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    precision: 8,
    status: ASSET_STATUS.DISABLED,
    autoCollect: false,
    intervalMin: 120,
    networks: [
      {
        id: 'eth-native',
        name: 'Ethereum (Native)',
        contract: '-',
        collectAddress: '0xabcd12ef34567890abcd12ef34567890abcd12ef',
        threshold: 0.1,
        gasLimit: 21000,
        status: ASSET_STATUS.DISABLED
      }
    ]
  }
]

const assetsCollectRecords = [
  {
    id: 'r1',
    coin: 'USDT',
    network: 'Ethereum (ERC20)',
    mode: ASSET_COLLECT_MODE.AUTO,
    status: ASSET_COLLECT_RECORD_STATUS.DONE,
    amount: 5234.5,
    fee: 2.5,
    from: '0x123456...345678',
    to: '0x742d35...5f0bEb',
    txHash: '0xabc123...123456',
    createdAt: '03/06 20:30',
    finishedAt: '03/06 20:35',
    related: [
      { address: '0x123456...345678', amount: 1500, status: ASSET_COLLECT_RECORD_STATUS.DONE },
      { address: '0x234567...456789', amount: 2234.5, status: ASSET_COLLECT_RECORD_STATUS.DONE },
      { address: '0x345678...567890', amount: 1500, status: ASSET_COLLECT_RECORD_STATUS.DONE },
      { address: '0x456789...678901', amount: 820, status: ASSET_COLLECT_RECORD_STATUS.DONE },
      { address: '0x567890...789012', amount: 640, status: ASSET_COLLECT_RECORD_STATUS.DONE },
      { address: '0x678901...890123', amount: 520, status: ASSET_COLLECT_RECORD_STATUS.DONE },
      { address: '0x789012...901234', amount: 410, status: ASSET_COLLECT_RECORD_STATUS.DONE },
      { address: '0x890123...012345', amount: 360, status: ASSET_COLLECT_RECORD_STATUS.DONE }
    ]
  },
  {
    id: 'r2',
    coin: 'USDT',
    network: 'TRON (TRC20)',
    mode: ASSET_COLLECT_MODE.MANUAL,
    status: ASSET_COLLECT_RECORD_STATUS.PROCESSING,
    amount: 12500,
    fee: 1,
    from: 'TRX12345...abcdef',
    to: 'TKzxdSv2...KMg2Ax',
    txHash: 'trx78901...ef7890',
    createdAt: '03/06 19:20',
    finishedAt: '-',
    related: [
      { address: 'TRX12345...abcdef', amount: 3500, status: ASSET_COLLECT_RECORD_STATUS.PROCESSING },
      { address: 'TRX23456...bcdef1', amount: 9000, status: ASSET_COLLECT_RECORD_STATUS.PROCESSING },
      { address: 'TRX34567...cdef12', amount: 1200, status: ASSET_COLLECT_RECORD_STATUS.PROCESSING },
      { address: 'TRX45678...def123', amount: 840, status: ASSET_COLLECT_RECORD_STATUS.PROCESSING }
    ]
  }
]

const assetsAddressLogs = [
  {
    id: 'l1',
    type: ASSET_ADDRESS_LOG_TYPE.DEPOSIT,
    coin: 'USDT',
    network: 'Ethereum (ERC20)',
    address: '0x123456...345678',
    amount: '+2,500 USDT',
    txHash: '0xlog123...123456',
    block: '19,234,567 (35 确认)',
    status: ASSET_ADDRESS_LOG_STATUS.CONFIRMED,
    time: '03/06 18:30:00'
  },
  {
    id: 'l2',
    type: ASSET_ADDRESS_LOG_TYPE.COLLECT,
    coin: 'USDT',
    network: 'Ethereum (ERC20)',
    address: '0x123456...345678',
    amount: '-5,234.5 USDT',
    txHash: '0xabc123...123456',
    block: '19,234,890 (20 确认)',
    status: ASSET_ADDRESS_LOG_STATUS.CONFIRMED,
    time: '03/06 20:30:00'
  },
  {
    id: 'l3',
    type: ASSET_ADDRESS_LOG_TYPE.DEPOSIT,
    coin: 'USDT',
    network: 'TRON (TRC20)',
    address: 'TRX12345...abcdef',
    amount: '+5,000 USDT',
    txHash: 'trxlog12...cdef12',
    block: '58,912,345 (50 确认)',
    status: ASSET_ADDRESS_LOG_STATUS.CONFIRMED,
    time: '03/06 17:15:00'
  },
  {
    id: 'l4',
    type: ASSET_ADDRESS_LOG_TYPE.COLLECT,
    coin: 'BTC',
    network: 'Bitcoin (Native)',
    address: '1BvBMSEY...JaNVN2',
    amount: '-0.523 BTC',
    txHash: 'btc45678...abcdef',
    block: '830,234 (2 确认)',
    status: ASSET_ADDRESS_LOG_STATUS.PENDING,
    time: '03/06 22:10:00'
  },
  {
    id: 'l5',
    type: ASSET_ADDRESS_LOG_TYPE.WITHDRAW,
    coin: 'USDT',
    network: 'BSC (BEP20)',
    address: '0xbsc123...ef1234',
    amount: '-1,000 USDT',
    txHash: '0xbsclog...abcdef',
    block: '-',
    status: ASSET_ADDRESS_LOG_STATUS.FAILED,
    time: '03/06 18:10:00'
  }
]

const manualCollectCoinOptions = ['USDT', 'BTC']

const manualCollectNetworkOptionsMap = {
  USDT: ['Ethereum (ERC20)', 'TRON (TRC20)', 'BSC (BEP20)'],
  BTC: ['Bitcoin (Native)']
}

const manualCollectNetworkMap = {
  'USDT|Ethereum (ERC20)': { collectAddress: '0x742d35Cc...595f0bEb', threshold: 100, gasLimit: '60,000' },
  'USDT|TRON (TRC20)': { collectAddress: 'TKzxdSv2FZ...KMg2Ax', threshold: 50, gasLimit: '1' },
  'USDT|BSC (BEP20)': { collectAddress: '0x8e23Ee67...eA1A3', threshold: 50, gasLimit: '45,000' },
  'BTC|Bitcoin (Native)': { collectAddress: '1BvBMSEY...JaNVN2', threshold: 0.01, gasLimit: '1' }
}

const buildWallets = (prefix, count, threshold, coin) =>
  Array.from({ length: count }).map((_, i) => {
    const idx = i + 1
    const base = Math.max(0, Number((threshold * (0.3 + ((idx * 7) % 19) / 10)).toFixed(6)))
    const balance = Number((coin === 'BTC' ? base : base * 12.5).toFixed(coin === 'BTC' ? 6 : 2))
    return {
      id: `${prefix}-${idx}`,
      name: `钱包 ${idx}`,
      address: `${prefix}${String(idx).padStart(4, '0')}...${String(idx * 17).padStart(8, '0')}`,
      balance,
      status: balance >= threshold ? ASSET_WALLET_STATUS.COLLECTABLE : ASSET_WALLET_STATUS.BELOW,
      checked: balance >= threshold
    }
  })

const manualCollectWalletSource = {
  'USDT|Ethereum (ERC20)': buildWallets('0xErc', 68, 100, 'USDT'),
  'USDT|TRON (TRC20)': buildWallets('TRX', 43, 50, 'USDT'),
  'USDT|BSC (BEP20)': buildWallets('0xBsc', 31, 50, 'USDT'),
  'BTC|Bitcoin (Native)': buildWallets('1BTC', 19, 0.01, 'BTC')
}

const exchangeRatePairs = [
  {
    id: 'usdt-btc',
    baseAsset: 'USDT',
    quoteAsset: 'BTC',
    source: EXCHANGE_RATE_SOURCE.BINANCE,
    type: EXCHANGE_RATE_TYPE.FLOATING,
    marketRate: 0.000023,
    buyMarkup: 0.005,
    sellMarkup: 0.005,
    buyRate: 0.000023115,
    sellRate: 0.000022885,
    enabled: true,
    autoReverse: true,
    feeTemplateId: 'template-standard',
    userLevelRates: {
      [USER_LEVEL_TIER.BASIC]: { buy: 0.005, sell: 0.005 },
      [USER_LEVEL_TIER.SILVER]: { buy: 0.004, sell: 0.004 },
      [USER_LEVEL_TIER.GOLD]: { buy: 0.003, sell: 0.003 },
      [USER_LEVEL_TIER.PLATINUM]: { buy: 0.002, sell: 0.002 },
      [USER_LEVEL_TIER.VIP]: { buy: 0.001, sell: 0.001 }
    },
    lastUpdate: '2026-03-11 10:30:00'
  },
  {
    id: 'usd-usdt',
    baseAsset: 'USD',
    quoteAsset: 'USDT',
    source: EXCHANGE_RATE_SOURCE.OKX,
    type: EXCHANGE_RATE_TYPE.FLOATING,
    marketRate: 1.0002,
    buyMarkup: 0.003,
    sellMarkup: 0.003,
    buyRate: 1.0032,
    sellRate: 0.9972,
    enabled: true,
    autoReverse: false,
    feeTemplateId: 'template-premium',
    userLevelRates: {
      [USER_LEVEL_TIER.BASIC]: { buy: 0.003, sell: 0.003 },
      [USER_LEVEL_TIER.SILVER]: { buy: 0.0025, sell: 0.0025 },
      [USER_LEVEL_TIER.GOLD]: { buy: 0.002, sell: 0.002 },
      [USER_LEVEL_TIER.PLATINUM]: { buy: 0.0015, sell: 0.0015 },
      [USER_LEVEL_TIER.VIP]: { buy: 0.001, sell: 0.001 }
    },
    lastUpdate: '2026-03-11 10:29:45'
  },
  {
    id: 'eth-usdt',
    baseAsset: 'ETH',
    quoteAsset: 'USDT',
    source: EXCHANGE_RATE_SOURCE.COINGECKO,
    type: EXCHANGE_RATE_TYPE.FLOATING,
    marketRate: 3250.50,
    buyMarkup: 0.008,
    sellMarkup: 0.008,
    buyRate: 3276.50,
    sellRate: 3224.50,
    enabled: true,
    autoReverse: true,
    userLevelRates: {
      [USER_LEVEL_TIER.BASIC]: { buy: 0.008, sell: 0.008 },
      [USER_LEVEL_TIER.SILVER]: { buy: 0.006, sell: 0.006 },
      [USER_LEVEL_TIER.GOLD]: { buy: 0.004, sell: 0.004 },
      [USER_LEVEL_TIER.PLATINUM]: { buy: 0.003, sell: 0.003 },
      [USER_LEVEL_TIER.VIP]: { buy: 0.002, sell: 0.002 }
    },
    lastUpdate: '2026-03-11 10:30:15'
  },
  {
    id: 'btc-usd',
    baseAsset: 'BTC',
    quoteAsset: 'USD',
    source: EXCHANGE_RATE_SOURCE.CUSTOM,
    type: EXCHANGE_RATE_TYPE.FIXED,
    marketRate: 43500.00,
    buyMarkup: 0.01,
    sellMarkup: 0.01,
    buyRate: 43935.00,
    sellRate: 43065.00,
    enabled: false,
    autoReverse: true,
    userLevelRates: {
      [USER_LEVEL_TIER.BASIC]: { buy: 0.01, sell: 0.01 },
      [USER_LEVEL_TIER.SILVER]: { buy: 0.008, sell: 0.008 },
      [USER_LEVEL_TIER.GOLD]: { buy: 0.006, sell: 0.006 },
      [USER_LEVEL_TIER.PLATINUM]: { buy: 0.004, sell: 0.004 },
      [USER_LEVEL_TIER.VIP]: { buy: 0.002, sell: 0.002 }
    },
    lastUpdate: '2026-03-11 09:00:00'
  }
]

const feeTemplates = [
  {
    id: 'template-standard',
    name: '标准费率模板',
    type: FEE_TEMPLATE_TYPE.STANDARD,
    description: '适用于主流交易对的标准费率配置',
    baseMarkup: { buy: 0.005, sell: 0.005 },
    userLevelRates: {
      [USER_LEVEL_TIER.BASIC]: { buy: 0.005, sell: 0.005 },
      [USER_LEVEL_TIER.SILVER]: { buy: 0.004, sell: 0.004 },
      [USER_LEVEL_TIER.GOLD]: { buy: 0.003, sell: 0.003 },
      [USER_LEVEL_TIER.PLATINUM]: { buy: 0.002, sell: 0.002 },
      [USER_LEVEL_TIER.VIP]: { buy: 0.001, sell: 0.001 }
    },
    enabled: true,
    usageCount: 12,
    createdAt: '2026-02-01 10:00:00',
    updatedAt: '2026-03-10 15:30:00'
  },
  {
    id: 'template-premium',
    name: '优惠费率模板',
    type: FEE_TEMPLATE_TYPE.PREMIUM,
    description: '适用于高流动性交易对的优惠费率',
    baseMarkup: { buy: 0.003, sell: 0.003 },
    userLevelRates: {
      [USER_LEVEL_TIER.BASIC]: { buy: 0.003, sell: 0.003 },
      [USER_LEVEL_TIER.SILVER]: { buy: 0.0025, sell: 0.0025 },
      [USER_LEVEL_TIER.GOLD]: { buy: 0.002, sell: 0.002 },
      [USER_LEVEL_TIER.PLATINUM]: { buy: 0.0015, sell: 0.0015 },
      [USER_LEVEL_TIER.VIP]: { buy: 0.001, sell: 0.001 }
    },
    enabled: true,
    usageCount: 8,
    createdAt: '2026-02-05 14:20:00',
    updatedAt: '2026-03-09 11:45:00'
  },
  {
    id: 'template-vip',
    name: 'VIP 专属费率模板',
    type: FEE_TEMPLATE_TYPE.VIP,
    description: '适用于高端用户的极低费率配置',
    baseMarkup: { buy: 0.002, sell: 0.002 },
    userLevelRates: {
      [USER_LEVEL_TIER.BASIC]: { buy: 0.002, sell: 0.002 },
      [USER_LEVEL_TIER.SILVER]: { buy: 0.0015, sell: 0.0015 },
      [USER_LEVEL_TIER.GOLD]: { buy: 0.001, sell: 0.001 },
      [USER_LEVEL_TIER.PLATINUM]: { buy: 0.0008, sell: 0.0008 },
      [USER_LEVEL_TIER.VIP]: { buy: 0.0005, sell: 0.0005 }
    },
    enabled: true,
    usageCount: 5,
    createdAt: '2026-02-10 09:15:00',
    updatedAt: '2026-03-08 16:20:00'
  },
  {
    id: 'template-custom-high',
    name: '高收益费率模板',
    type: FEE_TEMPLATE_TYPE.CUSTOM,
    description: '适用于长尾交易对的高费率配置',
    baseMarkup: { buy: 0.01, sell: 0.01 },
    userLevelRates: {
      [USER_LEVEL_TIER.BASIC]: { buy: 0.01, sell: 0.01 },
      [USER_LEVEL_TIER.SILVER]: { buy: 0.008, sell: 0.008 },
      [USER_LEVEL_TIER.GOLD]: { buy: 0.006, sell: 0.006 },
      [USER_LEVEL_TIER.PLATINUM]: { buy: 0.004, sell: 0.004 },
      [USER_LEVEL_TIER.VIP]: { buy: 0.002, sell: 0.002 }
    },
    enabled: false,
    usageCount: 3,
    createdAt: '2026-02-15 11:30:00',
    updatedAt: '2026-03-05 10:00:00'
  }
]

export const createAssetsCoinsMock = () => clone(assetsCoins)
export const createAssetsCollectRecordsMock = () => clone(assetsCollectRecords)
export const createAssetsAddressLogsMock = () => clone(assetsAddressLogs)
export const createExchangeRatePairsMock = () => clone(exchangeRatePairs)
export const createFeeTemplatesMock = () => clone(feeTemplates)

export const createManualCollectConfigMock = () =>
  clone({
    coinOptions: manualCollectCoinOptions,
    networkOptionsMap: manualCollectNetworkOptionsMap,
    networkMap: manualCollectNetworkMap,
    walletSource: manualCollectWalletSource
  })
