import { PERPETUAL_STATUS } from '../constants/perpetual'

const clone = (value) => JSON.parse(JSON.stringify(value))

export const perpetualLeverageLevels = [1, 2, 3, 5, 10, 20, 25, 50, 75, 100, 125]

export const createDefaultPerpetualControlConfig = () => ({
  priceOffset: 5,
  offsetDirection: 'random',
  spreadMultiplier: 1.2,
  slippagePct: 0.15,
  latencyMs: 50,
  rejectRatePct: 2,
  maxLeverage: 100,
  autoTriggerEnabled: true
})

const perpetualTemplates = [
  {
    id: 'all-levels',
    name: '全档位 杠杆模板',
    status: PERPETUAL_STATUS.ENABLED,
    leverageRange: '1x - 125x',
    leverageCount: 11,
    inUseCount: 1,
    levels: ['1x', '2x', '3x', '5x', '10x', '20x', '25x', '50x', '75x', '100x', '125x'],
    contracts: ['BTC永续']
  },
  {
    id: 'standard',
    name: '标准 杠杆模板',
    status: PERPETUAL_STATUS.ENABLED,
    leverageRange: '1x - 100x',
    leverageCount: 10,
    inUseCount: 1,
    levels: ['1x', '2x', '3x', '5x', '10x', '20x', '25x', '50x', '75x', '100x'],
    contracts: ['ETH永续']
  }
]

const perpetualProducts = [
  {
    id: 'btc-perp',
    sortOrder: 1,
    name: 'BTC永续',
    code: 'BTC_PERP',
    pair: 'BTC/USDT',
    status: PERPETUAL_STATUS.ENABLED,
    templateId: 'all-levels',
    templateName: '全档位 杠杆模板',
    leverageRange: '1x - 125x',
    buyRange: '10 - 100,000 USDT',
    maxPosition: '500,000 USDT',
    minBuy: '10 USDT',
    maxBuy: '100,000 USDT',
    buyFee: '0.020%',
    sellFee: '0.050%',
    leverageBadges: ['1x', '2x', '3x', '5x', '10x', '20x', '+5']
  },
  {
    id: 'eth-perp',
    sortOrder: 2,
    name: 'ETH永续',
    code: 'ETH_PERP',
    pair: 'ETH/USDT',
    status: PERPETUAL_STATUS.ENABLED,
    templateId: 'standard',
    templateName: '标准 杠杆模板',
    leverageRange: '1x - 100x',
    buyRange: '10 - 50,000 USDT',
    maxPosition: '300,000 USDT',
    minBuy: '10 USDT',
    maxBuy: '50,000 USDT',
    buyFee: '0.020%',
    sellFee: '0.050%',
    leverageBadges: ['1x', '2x', '3x', '5x', '10x', '20x', '+4']
  }
]

const perpetualControlConfigs = {
  BTCUSDT: createDefaultPerpetualControlConfig(),
  ETHUSDT: {
    priceOffset: 2,
    offsetDirection: 'random',
    spreadMultiplier: 1.1,
    slippagePct: 0.1,
    latencyMs: 30,
    rejectRatePct: 1,
    maxLeverage: 75,
    autoTriggerEnabled: false
  }
}

export const perpetualProductStatusMeta = {
  [PERPETUAL_STATUS.ENABLED]: {
    text: '已启用',
    badgeClass: 'bg-emerald-100 text-emerald-700'
  },
  [PERPETUAL_STATUS.DISABLED]: {
    text: '已禁用',
    badgeClass: 'bg-rose-100 text-rose-700'
  }
}

export const createPerpetualTemplatesMock = () => clone(perpetualTemplates)
export const createPerpetualProductsMock = () => clone(perpetualProducts)
export const createPerpetualControlConfigsMock = () => clone(perpetualControlConfigs)
