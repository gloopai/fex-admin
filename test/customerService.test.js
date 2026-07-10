import test from 'node:test'
import assert from 'node:assert/strict'

import {
  createCustomerMessage,
  DEMO_REPLY_TEXT,
  WELCOME_MESSAGE_TEXT
} from '../src/features/customer-service/customerService.js'

test('rejects a message with only blank text and no image', () => {
  assert.equal(
    createCustomerMessage({ id: 1, sender: 'user', text: '   ', imageUrl: '' }),
    null
  )
})

test('normalizes a text message', () => {
  assert.deepEqual(
    createCustomerMessage({ id: 2, sender: 'user', text: '  需要帮助  ', imageUrl: '' }),
    { id: 2, sender: 'user', text: '需要帮助', imageUrl: '' }
  )
})

test('accepts an image-only message', () => {
  assert.deepEqual(
    createCustomerMessage({ id: 3, sender: 'user', text: '', imageUrl: 'blob:preview' }),
    { id: 3, sender: 'user', text: '', imageUrl: 'blob:preview' }
  )
})

test('exposes the required demo copy', () => {
  assert.equal(WELCOME_MESSAGE_TEXT, '你好，请问有什么需要帮助的吗？')
  assert.match(DEMO_REPLY_TEXT, /收到/)
})
