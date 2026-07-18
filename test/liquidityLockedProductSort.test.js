import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import * as liquidityConstants from '../src/admin/constants/liquidityLocked.js'

const readSource = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')
const adminSource = readSource('../src/pages/admin/liquidity/LiquidityLockedProductsPage.vue')
const clientSource = readSource('../src/pages/front/finance/liquidity/FinanceLiquidityListPage.vue')
const mockSource = readSource('../src/admin/mock/liquidityLocked.js')

test('liquidity locked products sort descending without mutating source', () => {
  assert.equal(typeof liquidityConstants.sortLiquidityLockedProducts, 'function')
  const rows = [
    { id: 'low', sortOrder: 10 },
    { id: 'missing' },
    { id: 'high', sortOrder: 90 },
    { id: 'same', sortOrder: 90 }
  ]
  assert.deepEqual(
    liquidityConstants.sortLiquidityLockedProducts(rows).map((row) => row.id),
    ['high', 'same', 'low', 'missing']
  )
  assert.deepEqual(rows.map((row) => row.id), ['low', 'missing', 'high', 'same'])
})

test('liquidity product sorting is configured in admin and applied to client list', () => {
  assert.match(adminSource, /产品状态[\s\S]*产品排序/)
  assert.match(adminSource, /v-model\.number="productForm\.sortOrder"/)
  assert.match(adminSource, /productForm\.sortOrder = Number\(product\.sortOrder/)
  assert.match(adminSource, /sortOrder: Number\(productForm\.sortOrder\)/)
  assert.match(adminSource, /Math\.max\([\s\S]*sortOrder[\s\S]*\+ 10/)
  assert.match(adminSource, /sortLiquidityLockedProducts/)
  assert.match(clientSource, /sortLiquidityLockedProducts/)
  assert.match(mockSource, /sortOrder:/)
})
