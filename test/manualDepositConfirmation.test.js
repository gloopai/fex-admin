import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { DEPOSIT_ORDER_STATUS, fundOrderApi } from '../src/admin/mock/fundOrders.js'

async function listDepositOrders() {
  const response = await fundOrderApi.listDepositOrders({ page: 1, pageSize: 100 })
  assert.equal(response.success, true)
  return response.data.list
}

test('credits a review order from the three required manual confirmation fields', async () => {
  const order = (await listDepositOrders()).find((row) => row.status === DEPOSIT_ORDER_STATUS.REVIEW)
  assert.ok(order)

  const response = await fundOrderApi.updateDepositOrder(
    order.id,
    'credit',
    '人工核对凭证',
    '',
    {
      txHash: '0xmanual-confirmation-unique-001',
      fromAddress: '0xmanual-payer-001',
      amount: 299.75
    }
  )

  assert.equal(response.success, true)
  const updated = (await listDepositOrders()).find((row) => row.id === order.id)
  assert.equal(updated.status, DEPOSIT_ORDER_STATUS.CREDITED)
  assert.equal(updated.linkedChainEvent.source, 'manual')
  assert.equal(updated.linkedChainEvent.txHash, '0xmanual-confirmation-unique-001')
  assert.equal(updated.linkedChainEvent.fromAddress, '0xmanual-payer-001')
  assert.equal(updated.linkedChainEvent.amount, 299.75)
  assert.equal(updated.linkedChainEvent.coin, order.coin)
  assert.equal(updated.linkedChainEvent.network, order.network)
  assert.equal(updated.linkedChainEvent.toAddress, order.toAddress)
})

test('rejects a manual confirmation when a required field is missing', async () => {
  const order = (await listDepositOrders()).find((row) => row.status === DEPOSIT_ORDER_STATUS.REVIEW)
  assert.ok(order)

  const response = await fundOrderApi.updateDepositOrder(
    order.id,
    'credit',
    '',
    '',
    { txHash: '', fromAddress: '0xpayer', amount: 100 }
  )

  assert.equal(response.success, false)
  assert.match(response.message, /TxHash/)
})

test('rejects a manual confirmation whose TxHash has already been used', async () => {
  const order = (await listDepositOrders()).find((row) => row.status === DEPOSIT_ORDER_STATUS.REVIEW)
  assert.ok(order)

  const response = await fundOrderApi.updateDepositOrder(
    order.id,
    'credit',
    '',
    '',
    {
      txHash: '0xmanual-confirmation-unique-001',
      fromAddress: '0xanother-payer',
      amount: 500
    }
  )

  assert.equal(response.success, false)
  assert.match(response.message, /TxHash.*使用/)
})

test('deposit review exposes chain-event and three-field manual confirmation modes', () => {
  const source = readFileSync(
    new URL('../src/pages/admin/user/DepositOrdersPage.vue', import.meta.url),
    'utf8'
  )

  assert.match(source, /选择链上通知/)
  assert.match(source, /手动输入确认/)
  assert.match(source, /manualConfirmation\.txHash/)
  assert.match(source, /manualConfirmation\.fromAddress/)
  assert.match(source, /manualConfirmation\.amount/)
  assert.match(source, /人工确认/)
})
