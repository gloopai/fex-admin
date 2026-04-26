import { ref } from 'vue'
import { mockProducts } from '../mock/cryptoLending'
import { createLockedProductsMock } from '../mock/liquidityLocked'
import { createAiQuantProductsMock } from '../mock/aiQuant'

/**
 * 信用借贷（平台对手盘）/ 锁仓 / AI 量化 产品目录（单例）。
 * 运营后台产品页与前台列表、详情共用，保证配置与展示一致。
 */
export const lendingProductsCatalog = ref(mockProducts)

export const lockedProductsCatalog = ref(createLockedProductsMock())

export const aiQuantProductsCatalog = ref(createAiQuantProductsMock())
