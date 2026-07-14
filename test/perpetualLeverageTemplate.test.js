import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('perpetual leverage template editor includes contract template settings', () => {
  const source = readFileSync(
    new URL('../src/pages/admin/perpetual/PerpetualLeverageTemplatePage.vue', import.meta.url),
    'utf8'
  )
  const mockSource = readFileSync(new URL('../src/admin/mock/perpetual.js', import.meta.url), 'utf8')

  assert.match(source, /activeTemplateTab/)
  assert.match(source, /'leverage', '杠杆档位'/)
  assert.match(source, /'contract', '合约模板'/)
  assert.match(source, /templateOrderMode/)
  assert.match(source, /templateContractFaceValueUsdt/)
  assert.match(source, /下单模式/)
  assert.match(source, /按成本\(USDT\)下单/)
  assert.match(source, /按数量\(张数=币价\)下单/)
  assert.match(source, /合约面值/)
  assert.match(source, /value="cost"/)
  assert.match(source, /value="quantity"/)
  assert.match(source, /templateOrderMode\.value = template\.orderMode \?\? 'cost'/)
  assert.match(source, /templateContractFaceValueUsdt\.value = Number\(template\.contractFaceValueUsdt \?\? 1000\)/)
  assert.match(source, /orderMode: templateOrderMode\.value/)
  assert.match(source, /contractFaceValueUsdt: Number\(templateContractFaceValueUsdt\.value\) \|\| 1000/)

  assert.match(mockSource, /orderMode: 'cost'/)
  assert.match(mockSource, /contractFaceValueUsdt: 1000/)
})

test('perpetual contract template settings explain order mode impact and margin formula', () => {
  const source = readFileSync(
    new URL('../src/pages/admin/perpetual/PerpetualLeverageTemplatePage.vue', import.meta.url),
    'utf8'
  )

  assert.match(source, /模式影响/)
  assert.match(source, /按成本\(USDT\)下单：用户输入的是保证金成本/)
  assert.match(source, /按数量\(张数=币价\)下单：用户输入的是张数，张数按币价口径填写/)
  assert.match(source, /保证金计算规则/)
  assert.match(source, /按成本模式：保证金 = 用户输入成本/)
  assert.match(source, /按数量模式：保证金 = 张数\(币价口径\) × 合约面值 ÷ 杠杆倍数/)
  assert.match(source, /合约面值用于张数\(币价口径\)与 USDT 名义价值之间的换算/)
})
