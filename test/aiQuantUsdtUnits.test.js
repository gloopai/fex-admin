import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const adminProductSource = readFileSync(
  new URL('../src/pages/admin/aiQuant/AiQuantProductPage.vue', import.meta.url),
  'utf8'
)
const frontListSource = readFileSync(
  new URL('../src/pages/front/finance/aiQuant/FinanceAiQuantListPage.vue', import.meta.url),
  'utf8'
)
const frontDetailSource = readFileSync(
  new URL('../src/pages/front/finance/aiQuant/FinanceAiQuantDetailPage.vue', import.meta.url),
  'utf8'
)
const mockCatalogSource = readFileSync(new URL('../src/admin/mock/aiQuant.js', import.meta.url), 'utf8')

test('AI quant admin displays subscription ranges and monetary limits in USDT', () => {
  assert.match(adminProductSource, /tier\.minAmount \}\}-\{\{ tier\.maxAmount \}\} USDT/)
  assert.match(adminProductSource, /适用申购金额区间（USDT）/)
  assert.match(adminProductSource, /单用户最大持仓（USDT）/)
  assert.match(adminProductSource, /产品总限额（USDT）/)
  assert.match(adminProductSource, /产品总限额：\{\{ productForm\.limitCount \}\} USDT/)
  assert.match(adminProductSource, /每月限购次数：\{\{ productForm\.monthlyLimitCount \}\} 次/)
  assert.match(adminProductSource, /tier\.minAmount \* tier\.dailyRate \/ 100\)\.toFixed\(2\) \}\} USDT/)
  assert.match(adminProductSource, /tier\.minAmount \* tier\.dailyRate \/ 100 \* previewYieldDays\)\.toFixed\(2\) \}\} USDT/)
})

test('AI quant customer pages display subscription ranges and monetary limits in USDT', () => {
  assert.match(frontListSource, /formatAmountSpan\(row\.tier\.minAmount, row\.tier\.maxAmount, 'USDT'\)/)
  assert.match(frontDetailSource, /区间（USDT）/)
  assert.match(frontDetailSource, /单用户持仓上限约 \{\{ product\.limitAmount \}\} USDT/)
  assert.match(frontDetailSource, /产品总限额 \{\{ product\.limitCount \}\} USDT/)
  assert.match(frontDetailSource, /每月申购上限 \{\{ product\.monthlyLimitCount \}\} 笔/)
})

test('AI quant aggregate operating amounts are displayed in USDT', () => {
  assert.match(adminProductSource, /锁定: \{\{ product\.totalLocked \}\} USDT/)
  assert.match(adminProductSource, /收益: \{\{ product\.totalYield \}\} USDT/)
  assert.match(adminProductSource, /订单: \{\{ product\.totalOrders \}\} 笔/)
  assert.match(frontDetailSource, /\{\{ product\.totalLocked \}\} USDT/)
  assert.match(frontDetailSource, /\{\{ product\.totalYield \}\} USDT/)
})

test('AI quant mock products use coherent USDT subscription ranges and monetary limits', () => {
  const products = [...mockCatalogSource.matchAll(/id: '(aiq-prod-\d+)'[\s\S]*?tiers: \[([\s\S]*?)\],[\s\S]*?limitAmount: ([\d.]+),\s*limitCount: ([\d.]+),/g)]
  assert.equal(products.length, 9)

  for (const [, id, tiersSource, userLimitRaw, totalLimitRaw] of products) {
    const maximums = [...tiersSource.matchAll(/maxAmount: ([\d.]+)/g)].map((match) => Number(match[1]))
    const highestTierAmount = Math.max(...maximums)
    const userLimit = Number(userLimitRaw)
    const totalLimit = Number(totalLimitRaw)

    assert.ok(userLimit >= highestTierAmount, `${id} user limit must cover its highest tier`)
    assert.ok(totalLimit >= userLimit, `${id} product total must cover its user limit`)
  }
})
