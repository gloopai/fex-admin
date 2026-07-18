import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import * as perpetualConstants from '../src/admin/constants/perpetual.js'

const pageSource = readFileSync(
  new URL('../src/pages/admin/perpetual/PerpetualManagementPage.vue', import.meta.url),
  'utf8'
)

test('perpetual products sort by descending configured number without mutating source', () => {
  assert.equal(typeof perpetualConstants.sortPerpetualProducts, 'function')

  const products = [
    { id: 'low', sortOrder: 10 },
    { id: 'missing' },
    { id: 'high', sortOrder: 90 },
    { id: 'same', sortOrder: 90 }
  ]

  assert.deepEqual(
    perpetualConstants.sortPerpetualProducts(products).map((product) => product.id),
    ['high', 'same', 'low', 'missing']
  )
  assert.deepEqual(products.map((product) => product.id), ['low', 'missing', 'high', 'same'])
})

test('perpetual product editor places numeric sort input beside status and saves it', () => {
  assert.match(pageSource, /产品状态[\s\S]*产品排序/)
  assert.match(pageSource, /v-model\.number="contractForm\.sortOrder"/)
  assert.match(pageSource, /数字越大越靠前/)
  assert.match(pageSource, /sortOrder: Number\(contractForm\.sortOrder\)/)
  assert.match(pageSource, /contractForm\.sortOrder = Number\(item\.sortOrder/)
  assert.match(pageSource, /sortPerpetualProducts/)
})
