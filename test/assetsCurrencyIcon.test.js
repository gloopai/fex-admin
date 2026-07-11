import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('currency management exposes coin icon upload UI', () => {
  const source = readFileSync(
    new URL('../src/pages/admin/assets/AssetsCurrencyPage.vue', import.meta.url),
    'utf8'
  )

  assert.match(source, /币种 Icon/)
  assert.match(source, /上传 Icon/)
  assert.match(source, /建议 120x120/)
})
