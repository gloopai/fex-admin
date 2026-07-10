import test from 'node:test'
import assert from 'node:assert/strict'

import {
  closeConversation,
  createCustomerServiceMessage,
  CUSTOMER_SERVICE_STATUS,
  filterCustomerServiceConversations,
  markConversationActive,
  markConversationRead,
  normalizeCustomerServiceState,
  saveConversationNote,
  sendAgentMessage,
  sendUserMessage,
  summarizeCustomerServiceConversations
} from '../src/features/customer-service/customerService.js'

const user = {
  email: 'demo@fex.local',
  nickname: '演示账户',
  vip: 2,
  kyc: '初级认证',
  creditScore: 72,
  registeredAt: '2026-01-01T00:00:00.000Z',
  lastLoginAt: '2026-07-10T08:00:00.000Z',
  accountStatus: '正常'
}

function firstUserSend(overrides = {}) {
  return sendUserMessage({ version: 1, conversations: [] }, {
    userId: '143',
    user,
    text: '  需要人工帮助  ',
    imageDataUrl: '',
    now: '2026-07-10T09:00:00.000Z',
    conversationId: 'c1',
    messageId: 'm1',
    ...overrides
  })
}

test('creates normalized messages and rejects blank content', () => {
  assert.equal(createCustomerServiceMessage({ id: 'm0', sender: 'user', text: '  ' }), null)
  assert.deepEqual(
    createCustomerServiceMessage({
      id: 'm1',
      sender: 'user',
      text: '  需要帮助  ',
      imageDataUrl: '',
      createdAt: '2026-07-10T09:00:00.000Z'
    }),
    {
      id: 'm1',
      sender: 'user',
      text: '需要帮助',
      imageDataUrl: '',
      createdAt: '2026-07-10T09:00:00.000Z'
    }
  )
})

test('creates a waiting conversation for the first user message', () => {
  const next = firstUserSend()
  const conversation = next.conversations[0]

  assert.equal(conversation.id, 'c1')
  assert.equal(conversation.status, CUSTOMER_SERVICE_STATUS.WAITING)
  assert.equal(conversation.adminUnread, 1)
  assert.equal(conversation.userUnread, 0)
  assert.equal(conversation.messages[0].text, '需要人工帮助')
  assert.equal(conversation.user.email, user.email)
})

test('reuses an open conversation and increments admin unread', () => {
  const initial = firstUserSend()
  const next = sendUserMessage(initial, {
    userId: '143',
    user,
    text: '还有一个问题',
    now: '2026-07-10T09:05:00.000Z',
    conversationId: 'unused',
    messageId: 'm2'
  })

  assert.equal(next.conversations.length, 1)
  assert.equal(next.conversations[0].messages.length, 2)
  assert.equal(next.conversations[0].adminUnread, 2)
  assert.equal(next.conversations[0].status, CUSTOMER_SERVICE_STATUS.WAITING)
})

test('agent actions update read state, status, reply unread, and notes', () => {
  const initial = firstUserSend()
  const read = markConversationRead(initial, { conversationId: 'c1', reader: 'admin' })
  const active = markConversationActive(read, {
    conversationId: 'c1',
    now: '2026-07-10T09:02:00.000Z'
  })
  const replied = sendAgentMessage(active, {
    conversationId: 'c1',
    text: '您好，正在为您查询。',
    now: '2026-07-10T09:03:00.000Z',
    messageId: 'm2'
  })
  const noted = saveConversationNote(replied, {
    conversationId: 'c1',
    note: '  高优先级用户  ',
    now: '2026-07-10T09:04:00.000Z'
  })

  assert.equal(read.conversations[0].adminUnread, 0)
  assert.equal(active.conversations[0].status, CUSTOMER_SERVICE_STATUS.ACTIVE)
  assert.equal(replied.conversations[0].status, CUSTOMER_SERVICE_STATUS.WAITING_USER)
  assert.equal(replied.conversations[0].userUnread, 1)
  assert.equal(noted.conversations[0].internalNote, '高优先级用户')
})

test('closing is agent-read-only and the next user send creates a new conversation', () => {
  const initial = firstUserSend()
  const closed = closeConversation(initial, {
    conversationId: 'c1',
    now: '2026-07-10T09:10:00.000Z'
  })

  assert.throws(
    () => sendAgentMessage(closed, {
      conversationId: 'c1',
      text: '不能发送',
      now: '2026-07-10T09:11:00.000Z',
      messageId: 'm2'
    }),
    /已结束/
  )

  const reopened = sendUserMessage(closed, {
    userId: '143',
    user,
    text: '新的问题',
    now: '2026-07-10T09:12:00.000Z',
    conversationId: 'c2',
    messageId: 'm3'
  })

  assert.equal(closed.conversations[0].closedAt, '2026-07-10T09:10:00.000Z')
  assert.equal(reopened.conversations.length, 2)
  assert.equal(reopened.conversations[0].id, 'c2')
})

test('normalizes corrupted state and repairs missing fields', () => {
  assert.deepEqual(normalizeCustomerServiceState(null), { version: 1, conversations: [] })

  const normalized = normalizeCustomerServiceState({
    conversations: [{ id: 'c1', userId: '143', user: { email: 'demo@fex.local' }, messages: 'bad' }]
  })

  assert.equal(normalized.conversations[0].status, CUSTOMER_SERVICE_STATUS.WAITING)
  assert.deepEqual(normalized.conversations[0].messages, [])
  assert.equal(normalized.conversations[0].adminUnread, 0)
})

test('sorts, filters, searches, and summarizes conversations', () => {
  const a = firstUserSend()
  const b = sendUserMessage(a, {
    userId: '200',
    user: { ...user, email: 'alice@example.com', nickname: 'Alice' },
    text: '提现问题',
    now: '2026-07-10T10:00:00.000Z',
    conversationId: 'c2',
    messageId: 'm2'
  })
  const closed = closeConversation(b, { conversationId: 'c1', now: '2026-07-10T10:05:00.000Z' })

  assert.deepEqual(filterCustomerServiceConversations(closed.conversations, {}).map((c) => c.id), ['c1', 'c2'])
  assert.deepEqual(
    filterCustomerServiceConversations(closed.conversations, { query: 'alice', status: 'waiting', unreadOnly: true }).map((c) => c.id),
    ['c2']
  )
  assert.deepEqual(summarizeCustomerServiceConversations(closed.conversations), {
    all: 2,
    waiting: 1,
    active: 0,
    'waiting-user': 0,
    closed: 1,
    unread: 1
  })
})
