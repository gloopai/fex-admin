import { ref } from 'vue'
import { createPortfolioOrdersMock, createPortfolioYieldRecordsMock } from '../mock/portfolio'

export const portfolioOrders = ref(createPortfolioOrdersMock())

export const portfolioYieldRecords = ref(createPortfolioYieldRecordsMock())
