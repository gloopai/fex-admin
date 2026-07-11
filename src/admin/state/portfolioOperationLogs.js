import { ref } from 'vue'
import { createPortfolioOperationLogsMock } from '../mock/portfolio'

export const portfolioOperationLogs = ref(createPortfolioOperationLogsMock())

export function appendPortfolioOperationLog(row) {
  portfolioOperationLogs.value = [
    {
      id: `pflog-${Date.now()}`,
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      ...row
    },
    ...portfolioOperationLogs.value
  ]
}
