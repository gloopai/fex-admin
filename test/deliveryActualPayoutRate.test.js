import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const deliveryMockSource = readFileSync(
  new URL('../src/admin/mock/delivery.js', import.meta.url),
  'utf8'
)
const templatePageSource = readFileSync(
  new URL('../src/pages/admin/delivery/DeliveryTemplatePage.vue', import.meta.url),
  'utf8'
)
const managementPageSource = readFileSync(
  new URL('../src/pages/admin/delivery/DeliveryManagementPage.vue', import.meta.url),
  'utf8'
)
const orderMockSource = readFileSync(
  new URL('../src/admin/mock/deliveryOrder.js', import.meta.url),
  'utf8'
)

test('delivery template cycles contain actual payout rates', () => {
  const configuredCycles = deliveryMockSource.match(/durationSec:\s*\d+,\s*payoutPct:\s*[\d.]+,\s*actualPayoutPct:\s*[\d.]+/g) || []

  assert.equal(configuredCycles.length, 9)
})

test('period template editor saves and displays the actual payout rate', () => {
  assert.match(templatePageSource, /周期配置 <span class="text-rose-500">\*<\/span>/)
  assert.match(templatePageSource, /周期\{\{ index \+ 1 \}\}/)
  assert.match(templatePageSource, /实际收益率/)
  assert.match(templatePageSource, /v-model\.number="cycle\.actualPayoutPct"/)
  assert.match(templatePageSource, /actualPayoutPct: Number\(c\.actualPayoutPct\)/)
  assert.doesNotMatch(templatePageSource, /<table class="w-full text-left border-collapse ant-table">/)
})

test('existing template and contract previews keep their original display layout', () => {
  assert.doesNotMatch(managementPageSource, /cycle\.actualPayoutPct/)
  assert.match(templatePageSource, /<span class="text-slate-500">收益:<\/span>/)
  assert.doesNotMatch(templatePageSource, /<span class="text-slate-500">展示:<\/span>/)
})

test('demo orders use the actual payout rate', () => {
  assert.match(orderMockSource, /cycle\.actualPayoutPct \/ 100/)
  assert.doesNotMatch(orderMockSource, /expectedPayout = investAmount \* \(cycle\.payoutPct \/ 100\)/)
  assert.match(orderMockSource, /actualPayoutPct: cycle\.actualPayoutPct/)
})
