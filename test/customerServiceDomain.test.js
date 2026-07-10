import test from 'node:test'
import assert from 'node:assert/strict'

import {
  createCustomerServiceMessage,
  filterCustomerServiceThreads,
  markCustomerServiceThreadRead,
  normalizeCustomerServiceState,
  sendAgentMessage,
  sendUserMessage,
  summarizeCustomerServiceThreads
} from '../src/features/customer-service/customerService.js'

const user = {
  email: 'demo@fex.local',
  nickname: '演示账户',
  vip: 2,
  kyc: '初级认证',
  creditScore: 72,
  accountStatus: '正常'
}

function firstUserSend(overrides = {}) {
  return sendUserMessage({ version: 2, threads: [] }, {
    userId: '143',
    user,
    text: '  需要人工帮助  ',
    now: '2026-07-10T09:00:00.000Z',
    messageId: 'm1',
    ...overrides
  })
}

test('creates normalized messages and rejects blank content', () => {
  assert.equal(createCustomerServiceMessage({ id: 'm0', sender: 'user', text: '  ' }), null)
  assert.equal(createCustomerServiceMessage({ id: 'm1', sender: 'user', text: '  需要帮助  ' }).text, '需要帮助')
})

test('creates one message thread per user and only tracks unread state', () => {
  const initial = firstUserSend()
  const next = sendUserMessage(initial, {
    userId: '143',
    user,
    text: '还有一个问题',
    now: '2026-07-10T09:05:00.000Z',
    messageId: 'm2'
  })

  assert.equal(next.threads.length, 1)
  assert.equal(next.threads[0].id, 'user-143')
  assert.equal(next.threads[0].messages.length, 2)
  assert.equal(next.threads[0].adminUnread, 2)
  assert.equal('status' in next.threads[0], false)
  assert.equal('closedAt' in next.threads[0], false)
})

test('agent replies remain available forever and update user unread state', () => {
  const initial = firstUserSend()
  const read = markCustomerServiceThreadRead(initial, { threadId: 'user-143', reader: 'admin' })
  const replied = sendAgentMessage(read, {
    threadId: 'user-143',
    text: '您好，正在为您查询。',
    now: '2026-07-10T09:03:00.000Z',
    messageId: 'm2'
  })
  const next = sendUserMessage(replied, {
    userId: '143',
    user,
    text: '谢谢',
    now: '2026-07-10T09:04:00.000Z',
    messageId: 'm3'
  })

  assert.equal(read.threads[0].adminUnread, 0)
  assert.equal(replied.threads[0].userUnread, 1)
  assert.equal(next.threads.length, 1)
  assert.deepEqual(next.threads[0].messages.map((message) => message.id), ['m1', 'm2', 'm3'])
})

test('migrates and merges legacy conversations by user id', () => {
  const normalized = normalizeCustomerServiceState({
    version: 1,
    conversations: [
      { id: 'c2', userId: '143', user, status: 'waiting', adminUnread: 1, createdAt: '2026-07-10T10:00:00.000Z', updatedAt: '2026-07-10T10:00:00.000Z', messages: [{ id: 'm2', sender: 'user', text: '新问题', createdAt: '2026-07-10T10:00:00.000Z' }] },
      { id: 'c1', userId: '143', user, status: 'closed', createdAt: '2026-07-10T09:00:00.000Z', updatedAt: '2026-07-10T09:10:00.000Z', messages: [{ id: 'm1', sender: 'agent', text: '历史回复', createdAt: '2026-07-10T09:05:00.000Z' }] }
    ]
  })

  assert.equal(normalized.version, 2)
  assert.equal(normalized.threads.length, 1)
  assert.equal(normalized.threads[0].id, 'user-143')
  assert.deepEqual(normalized.threads[0].messages.map((message) => message.id), ['m1', 'm2'])
  assert.equal(normalized.threads[0].adminUnread, 1)
})

test('sorts, searches, filters unread users, and summarizes threads', () => {
  const a = firstUserSend()
  const b = sendUserMessage(a, {
    userId: '200',
    user: { ...user, email: 'alice@example.com', nickname: 'Alice' },
    text: '提现问题',
    now: '2026-07-10T10:00:00.000Z',
    messageId: 'm2'
  })
  const read = markCustomerServiceThreadRead(b, { threadId: 'user-143', reader: 'admin' })

  assert.deepEqual(filterCustomerServiceThreads(read.threads, {}).map((thread) => thread.id), ['user-200', 'user-143'])
  assert.deepEqual(filterCustomerServiceThreads(read.threads, { query: 'alice', unreadOnly: true }).map((thread) => thread.id), ['user-200'])
  assert.deepEqual(summarizeCustomerServiceThreads(read.threads), { all: 2, unread: 1 })
})
