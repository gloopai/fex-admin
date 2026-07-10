import test from 'node:test'
import assert from 'node:assert/strict'

import { CUSTOMER_SERVICE_STORAGE_KEY, createCustomerServiceRepository } from '../src/features/customer-service/customerServiceRepository.js'

function createMemoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial))
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  }
}

function createRepository(overrides = {}) {
  let sequence = 0
  return createCustomerServiceRepository({
    storage: createMemoryStorage(),
    eventTarget: new EventTarget(),
    now: () => '2026-07-10T10:00:00.000Z',
    createId: (prefix) => `${prefix}-${++sequence}`,
    ...overrides
  })
}

const userInput = {
  userId: '143',
  user: { email: 'demo@fex.local', nickname: '演示账户' },
  text: '需要帮助'
}

test('persists one cloned message thread per user', () => {
  const repository = createRepository()
  repository.sendUserMessage(userInput)
  repository.sendUserMessage({ ...userInput, text: '第二条消息' })

  const first = repository.getSnapshot()
  first.threads[0].messages[0].text = 'mutated'
  const second = repository.getSnapshot()

  assert.equal(second.threads.length, 1)
  assert.equal(second.threads[0].messages[0].text, '需要帮助')
  assert.equal(second.threads[0].adminUnread, 2)
  repository.dispose()
})

test('notifies subscribers and migrates legacy storage', () => {
  const storage = createMemoryStorage({
    [CUSTOMER_SERVICE_STORAGE_KEY]: JSON.stringify({ version: 1, conversations: [{ id: 'c1', userId: '143', user: userInput.user, messages: [] }] })
  })
  const eventTarget = new EventTarget()
  const repository = createRepository({ storage, eventTarget })
  const snapshots = []
  const unsubscribe = repository.subscribe((snapshot) => snapshots.push(snapshot))

  repository.sendUserMessage(userInput)
  eventTarget.dispatchEvent(new Event('storage'))

  assert.equal(repository.getSnapshot().version, 2)
  assert.equal(repository.getSnapshot().threads.length, 1)
  assert.equal(snapshots.length, 3)
  unsubscribe()
  repository.dispose()
})

test('recovers from corrupt JSON and seeds demo users only once', () => {
  const storage = createMemoryStorage({ [CUSTOMER_SERVICE_STORAGE_KEY]: '{bad json' })
  const repository = createRepository({ storage })

  assert.deepEqual(repository.getSnapshot(), { version: 2, threads: [] })
  repository.seedDemoData()
  const seeded = repository.getSnapshot()
  repository.seedDemoData()

  assert.equal(seeded.threads.length, 2)
  assert.equal(repository.getSnapshot().threads.length, 2)
  repository.dispose()
})

test('supports agent reply and read actions without lifecycle actions', () => {
  const repository = createRepository()
  repository.sendUserMessage(userInput)
  const threadId = repository.getSnapshot().threads[0].id

  repository.markRead({ threadId, reader: 'admin' })
  repository.sendAgentMessage({ threadId, text: '正在处理' })

  const thread = repository.getSnapshot().threads[0]
  assert.equal(thread.messages.at(-1).text, '正在处理')
  assert.equal(thread.adminUnread, 0)
  assert.equal(typeof repository.close, 'undefined')
  assert.equal(typeof repository.markActive, 'undefined')
  repository.dispose()
})
