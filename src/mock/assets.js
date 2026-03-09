import {
  ASSET_ADDRESS_LOG_STATUS,
  ASSET_ADDRESS_LOG_TYPE,
  ASSET_COLLECT_MODE,
  ASSET_COLLECT_RECORD_STATUS,
  ASSET_STATUS,
  ASSET_WALLET_STATUS
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

export const createAssetsCoinsMock = () => clone(assetsCoins)
export const createAssetsCollectRecordsMock = () => clone(assetsCollectRecords)
export const createAssetsAddressLogsMock = () => clone(assetsAddressLogs)

export const createManualCollectConfigMock = () =>
  clone({
    coinOptions: manualCollectCoinOptions,
    networkOptionsMap: manualCollectNetworkOptionsMap,
    networkMap: manualCollectNetworkMap,
    walletSource: manualCollectWalletSource
  })
