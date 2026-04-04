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

/** 站内划转：子账户 + 资金账户（演示） */
export const FRONT_TRANSFER_ACCOUNT_OPTIONS = [
  { value: 'spot', label: '币币账户' },
  { value: 'perpetual', label: '永续合约账户' },
  { value: 'delivery', label: '交割合约账户' },
  { value: 'earn', label: '理财账户' },
  { value: 'funding', label: '资金账户' }
]

const TRANSFER_BALANCE_DEMO = {
  spot: { USDC: '1250.50', ETH: '0.42', BTC: '0.015' },
  perpetual: { USDC: '320.00', ETH: '0', BTC: '0' },
  delivery: { USDC: '0', ETH: '0', BTC: '0' },
  earn: { USDC: '5000.00', ETH: '1.2', BTC: '0.05' },
  funding: { USDC: '888.88', ETH: '0.1', BTC: '0' }
}

export function demoTransferAvailable(accountValue, symbol) {
  const bucket = TRANSFER_BALANCE_DEMO[accountValue]
  if (!bucket) return '0'
  return bucket[symbol] ?? '0'
}

/** 闪兑参考价（USD）；演示用不对接盘口 */
const FLASH_USD_PRICE = {
  USDC: 1,
  USDT: 1,
  DAI: 1,
  ETH: 3200,
  BTC: 98000,
  SHIB: 0.000015,
  XRP: 0.62,
  TRX: 0.23,
  SOL: 145,
  BNB: 620,
  DOGE: 0.15
}

function formatFlashRateNumber(n) {
  if (!Number.isFinite(n) || n === 0) return '—'
  const abs = Math.abs(n)
  if (abs >= 1e9) return n.toExponential(4)
  if (abs >= 1_000_000) return n.toLocaleString('en-US', { maximumFractionDigits: 2 })
  if (abs >= 1_000)
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (abs >= 1) return n.toFixed(6).replace(/\.?0+$/, '')
  if (abs >= 0.0001) return n.toFixed(8).replace(/\.?0+$/, '')
  return n.toPrecision(8).replace(/\.?0+$/, '')
}

/**
 * 当前币对参考汇率（与数量无关）。对接盘后仍可用同一结构替换 forward / inverse 文案。
 * @returns {{ ok: true, forward: number, inverse: number, forwardText: string, inverseText: string } | { ok: false, message: string }}
 */
export function demoFlashConvertRate(fromSymbol, toSymbol) {
  if (!fromSymbol || !toSymbol || fromSymbol === toSymbol) {
    return { ok: false, message: '请选择不同的两个币种' }
  }
  const pf = FLASH_USD_PRICE[fromSymbol]
  const pt = FLASH_USD_PRICE[toSymbol]
  if (pf == null || pt == null || pt === 0 || pf === 0) {
    return { ok: false, message: '演示暂无该币种参考价' }
  }
  const forward = pf / pt
  const inverse = pt / pf
  return {
    ok: true,
    forward,
    inverse,
    forwardText: `1 ${fromSymbol} = ${formatFlashRateNumber(forward)} ${toSymbol}`,
    inverseText: `1 ${toSymbol} = ${formatFlashRateNumber(inverse)} ${fromSymbol}`
  }
}

export function demoFlashConvertEstimate(fromSymbol, toSymbol, payAmountStr) {
  const rate = demoFlashConvertRate(fromSymbol, toSymbol)
  const pay = parseFloat(String(payAmountStr || '').replace(/,/g, ''))
  if (!rate.ok) {
    return { receive: '', rateLabel: rate.message }
  }
  if (!Number.isFinite(pay) || pay <= 0) {
    return { receive: '', rateLabel: rate.forwardText + ' · 输入数量查看预计获得' }
  }
  const pf = FLASH_USD_PRICE[fromSymbol]
  const pt = FLASH_USD_PRICE[toSymbol]
  const recv = (pay * pf) / pt
  const d = recv >= 1 ? 6 : 8
  return {
    receive: recv.toFixed(d),
    rateLabel: rate.forwardText + '（演示）'
  }
}
