import test from 'node:test'
import assert from 'node:assert/strict'

import {
  CUSTOMER_SERVICE_STORAGE_KEY,
  createCustomerServiceRepository
} from '../src/features/customer-service/customerServiceRepository.js'

function createMemoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial))
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null
    },
    setItem(key, value) {
      values.set(key, String(value))
    },
    removeItem(key) {
      values.delete(key)
    }
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

test('persists user messages and returns cloned snapshots', () => {
  const repository = createRepository()
  repository.sendUserMessage(userInput)

  const first = repository.getSnapshot()
  first.conversations[0].messages[0].text = 'mutated'
  const second = repository.getSnapshot()

  assert.equal(second.conversations[0].messages[0].text, '需要帮助')
  assert.equal(second.conversations[0].adminUnread, 1)
  repository.dispose()
})

test('notifies subscribers for same-tab writes and storage events', () => {
  const storage = createMemoryStorage()
  const eventTarget = new EventTarget()
  const repository = createRepository({ storage, eventTarget })
  const snapshots = []
  const unsubscribe = repository.subscribe((snapshot) => snapshots.push(snapshot))

  repository.sendUserMessage(userInput)
  storage.setItem(CUSTOMER_SERVICE_STORAGE_KEY, JSON.stringify({ version: 1, conversations: [] }))
  eventTarget.dispatchEvent(new Event('storage'))

  assert.equal(snapshots.length, 3)
  assert.equal(snapshots[1].conversations.length, 1)
  assert.equal(snapshots[2].conversations.length, 0)
  unsubscribe()
  repository.dispose()
})

test('recovers from corrupt JSON and seeds demo data only once', () => {
  const storage = createMemoryStorage({ [CUSTOMER_SERVICE_STORAGE_KEY]: '{bad json' })
  const repository = createRepository({ storage })

  assert.deepEqual(repository.getSnapshot(), { version: 1, conversations: [] })
  repository.seedDemoData()
  const seeded = repository.getSnapshot()
  repository.seedDemoData()

  assert.ok(seeded.conversations.length >= 2)
  assert.equal(repository.getSnapshot().conversations.length, seeded.conversations.length)
  repository.dispose()
})

test('propagates storage quota failures', () => {
  const storage = createMemoryStorage()
  storage.setItem = () => {
    const error = new Error('quota exceeded')
    error.name = 'QuotaExceededError'
    throw error
  }
  const repository = createRepository({ storage })

  assert.throws(() => repository.sendUserMessage(userInput), /quota exceeded/)
  repository.dispose()
})

test('supports agent actions through the repository API', () => {
  const repository = createRepository()
  repository.sendUserMessage(userInput)
  const conversationId = repository.getSnapshot().conversations[0].id

  repository.markRead({ conversationId, reader: 'admin' })
  repository.markActive({ conversationId })
  repository.sendAgentMessage({ conversationId, text: '正在处理' })
  repository.saveNote({ conversationId, note: '内部备注' })
  repository.close({ conversationId })

  const conversation = repository.getSnapshot().conversations[0]
  assert.equal(conversation.messages.at(-1).text, '正在处理')
  assert.equal(conversation.internalNote, '内部备注')
  assert.equal(conversation.status, 'closed')
  repository.dispose()
})
