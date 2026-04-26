import { ref } from 'vue'
import { createYieldAdjustmentsMock } from '../mock/aiQuant'

/** 与订单页调整弹窗、收益调整记录页共用同一份 mock 数据 */
export const aiQuantYieldAdjustments = ref(createYieldAdjustmentsMock())
