import test from 'node:test'
import assert from 'node:assert/strict'

import {
  createCustomerServiceMessage,
  WELCOME_MESSAGE_TEXT
} from '../src/features/customer-service/customerService.js'

test('rejects a message with only blank text and no image', () => {
  assert.equal(
    createCustomerServiceMessage({ id: '1', sender: 'user', text: '   ', imageDataUrl: '' }),
    null
  )
})

test('normalizes a text message', () => {
  assert.deepEqual(
    createCustomerServiceMessage({ id: '2', sender: 'user', text: '  需要帮助  ', imageDataUrl: '' }),
    { id: '2', sender: 'user', text: '需要帮助', imageDataUrl: '', createdAt: '' }
  )
})

test('accepts an image-only message', () => {
  assert.deepEqual(
    createCustomerServiceMessage({ id: '3', sender: 'user', text: '', imageDataUrl: 'data:image/png;base64,demo' }),
    { id: '3', sender: 'user', text: '', imageDataUrl: 'data:image/png;base64,demo', createdAt: '' }
  )
})

test('exposes the required welcome copy', () => {
  assert.equal(WELCOME_MESSAGE_TEXT, '你好，请问有什么需要帮助的吗？')
})
