import { createAiQuantOrdersMock } from '../mock/aiQuant'

/**
 * 生成订单列表快照（每次调用新数组）。运营后台订单页应使用本地 ref 持有结果，勿用全局单例 ref，以免 HMR/热更新把列表清空。
 */
export function getAiQuantAdminOrdersSnapshot() {
	try {
		const data = createAiQuantOrdersMock()
		return Array.isArray(data) ? data.slice() : []
	} catch (e) {
		console.warn('[aiQuant] createAiQuantOrdersMock failed', e)
		return []
	}
}
