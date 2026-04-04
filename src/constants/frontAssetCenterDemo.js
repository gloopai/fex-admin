/** 资产中心充提页演示数据；对接链上 / 后台后替换 */

/** 提币可选划出账户；演示用，对接资产分账户后替换 */
export const FRONT_ACCOUNT_TYPE_OPTIONS = [
  { value: 'spot', label: '币币' },
  { value: 'perpetual', label: '永续合约' },
  { value: 'delivery', label: '交割合约' },
  { value: 'earn', label: '理财账户' }
]

export const FRONT_WITHDRAW_NETWORKS = [
  { key: 'ethereum', label: 'Ethereum' },
  { key: 'polygon', label: 'Polygon' },
  { key: 'tron', label: 'Tron' },
  { key: 'solana', label: 'Solana' }
]

export const FRONT_DEPOSIT_COINS = [
  { symbol: 'USDC' },
  { symbol: 'ETH' },
  { symbol: 'BTC' },
  { symbol: 'DAI' },
  { symbol: 'SHIB' },
  { symbol: 'XRP' },
  { symbol: 'TRX' },
  { symbol: 'SOL' },
  { symbol: 'BNB' },
  { symbol: 'DOGE' }
]

/** 资产页等入口「充币」直达详情的默认币种（与列表首项一致） */
export const FRONT_DEPOSIT_DEFAULT_SYMBOL_LOWER = FRONT_DEPOSIT_COINS[0].symbol.toLowerCase()

/** 提币可选币种（与充币列表可对齐） */
export const FRONT_WITHDRAW_ASSETS = FRONT_DEPOSIT_COINS.map((c) => ({
  symbol: c.symbol,
  /** 演示可用余额 */
  balance: c.symbol === 'USDC' ? '2.512345' : '0'
}))

const ADDR = {
  ethereum: '0x068b94aB79A1234567890abcdef1234567890ab',
  polygon: '0xPolygon1a2b3c4d5e6f7890abcdef1234567890ab',
  tron: 'TXYZdemo1234567890WithdrawTronAddress42',
  solana: 'So1anaDemoAddr11111234567890123456789012'
}

export function demoDepositAddress(_symbol, networkKey) {
  return ADDR[networkKey] || ADDR.ethereum
}

export function networkHintWithdraw(networkLabel) {
  return `${networkLabel} 提币，请输入 ${networkLabel} 钱包地址`
}

export function networkHintDeposit(networkLabel) {
  return `请确认充值网络为 ${networkLabel}，与提币方所选网络一致`
}
