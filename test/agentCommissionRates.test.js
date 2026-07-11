import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('agent commission rates lists an enabled 10% portfolio row in products and strategies', () => {
  const page = readFileSync(
    new URL('../src/pages/agent-system/AgentCommissionRatesPage.vue', import.meta.url),
    'utf8'
  )
  const agents = readFileSync(new URL('../src/admin/mock/agent.js', import.meta.url), 'utf8')

  const constants = readFileSync(new URL('../src/admin/constants/agentCommission.js', import.meta.url), 'utf8')

  assert.match(constants, /title: '投资组合'/)
  assert.match(constants, /lineKeys: \['aiQuant', 'portfolio', 'lending', 'borrowing'\]/)
  assert.match(page, /AGENT_PRODUCT_GROUPS/)
  assert.match(page, /AGENT_PRODUCT_LINE_DEFS/)
  assert.match(agents, /agentPortfolioCommissionEnabled: true/)
  assert.match(agents, /agentPortfolioCommissionRate: '0\.10'/)
})
