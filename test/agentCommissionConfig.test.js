import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('agent commission product strategy includes portfolio configuration', () => {
  const source = readFileSync(new URL('../src/admin/constants/agentCommission.js', import.meta.url), 'utf8')

  assert.match(source, /key: 'portfolio'/)
  assert.match(source, /enabledKey: 'agentPortfolioCommissionEnabled'/)
  assert.match(source, /rateKey: 'agentPortfolioCommissionRate'/)
  assert.match(source, /title: '投资组合'/)
  assert.match(source, /group: 'fin'/)
  assert.match(source, /lineKeys: \['aiQuant', 'portfolio', 'lending', 'borrowing'\]/)
  assert.match(source, /agentPortfolioCommissionEnabled: false/)
  assert.match(source, /agentPortfolioCommissionRate: '0'/)
})

test('agent commission config page renders portfolio product strategy card', () => {
  const source = readFileSync(
    new URL('../src/pages/admin/agent/AgentCommissionConfigPage.vue', import.meta.url),
    'utf8'
  )

  assert.match(source, /key: 'portfolio'/)
  assert.match(source, /agentPortfolioCommissionEnabled/)
  assert.match(source, /agentPortfolioCommissionRate/)
  assert.match(source, /title: '投资组合'/)
  assert.match(source, /投资组合订单/)
})
