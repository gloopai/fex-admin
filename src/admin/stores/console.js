import { defineStore } from 'pinia'

export const useConsoleStore = defineStore('console', {
  state: () => ({
    summary: [
      { label: 'Total Revenue', value: '$82,340', trend: '+12.3%', good: true },
      { label: 'Conversion', value: '6.81%', trend: '+1.1%', good: true },
      { label: 'Open Tickets', value: '17', trend: '-2', good: true },
      { label: 'Refund Rate', value: '1.6%', trend: '+0.3%', good: false }
    ],
    orders: [
      { id: 'OR-1209', customer: 'Aster Lane', status: 'Paid', amount: '$240.00', date: '2026-03-06' },
      { id: 'OR-1208', customer: 'Mori Foods', status: 'Pending', amount: '$118.50', date: '2026-03-06' },
      { id: 'OR-1207', customer: 'Bluewalk', status: 'Shipped', amount: '$980.00', date: '2026-03-05' },
      { id: 'OR-1206', customer: 'Kobo Labs', status: 'Refunded', amount: '$45.00', date: '2026-03-05' }
    ]
  })
})
