export const CUSTOMER_SERVICE_SENDER = Object.freeze({ USER: 'user', AGENT: 'agent' })
export const WELCOME_MESSAGE_TEXT = '你好，请问有什么需要帮助的吗？'
export const MAX_CUSTOMER_SERVICE_IMAGE_BYTES = 1024 * 1024

const VALID_SENDERS = new Set(Object.values(CUSTOMER_SERVICE_SENDER))

function asString(value, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function asNonNegativeInteger(value) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function normalizeUser(user, userId = '') {
  const source = user && typeof user === 'object' ? user : {}
  return {
    email: asString(source.email),
    nickname: asString(source.nickname),
    vip: asNonNegativeInteger(source.vip),
    kyc: asString(source.kyc, '未认证'),
    creditScore: asNonNegativeInteger(source.creditScore),
    registeredAt: asString(source.registeredAt),
    lastLoginAt: asString(source.lastLoginAt),
    accountStatus: asString(source.accountStatus, '正常'),
    uid: asString(source.uid, asString(userId))
  }
}

export function createCustomerServiceMessage({ id, sender, text = '', imageDataUrl = '', createdAt = '' }) {
  const normalizedText = String(text ?? '').trim()
  const normalizedImage = String(imageDataUrl ?? '').trim()
  if (!normalizedText && !normalizedImage) return null
  if (!VALID_SENDERS.has(sender)) throw new Error('无效的消息发送方')
  return { id: String(id), sender, text: normalizedText, imageDataUrl: normalizedImage, createdAt: String(createdAt) }
}

function normalizeMessage(raw) {
  if (!raw || typeof raw !== 'object') return null
  try {
    return createCustomerServiceMessage({
      id: raw.id ?? '',
      sender: raw.sender,
      text: raw.text,
      imageDataUrl: raw.imageDataUrl ?? raw.imageUrl,
      createdAt: raw.createdAt ?? ''
    })
  } catch {
    return null
  }
}

function normalizeThread(raw) {
  if (!raw || typeof raw !== 'object' || raw.userId == null) return null
  const userId = String(raw.userId)
  const messages = Array.isArray(raw.messages) ? raw.messages.map(normalizeMessage).filter(Boolean) : []
  return {
    id: `user-${userId}`,
    userId,
    user: normalizeUser(raw.user, userId),
    messages,
    adminUnread: asNonNegativeInteger(raw.adminUnread),
    userUnread: asNonNegativeInteger(raw.userUnread),
    createdAt: asString(raw.createdAt, messages[0]?.createdAt || ''),
    updatedAt: asString(raw.updatedAt, messages.at(-1)?.createdAt || asString(raw.createdAt))
  }
}

function mergeThreads(items) {
  const byUser = new Map()
  for (const raw of items) {
    const thread = normalizeThread(raw)
    if (!thread) continue
    const existing = byUser.get(thread.userId)
    if (!existing) {
      byUser.set(thread.userId, thread)
      continue
    }
    existing.user = { ...existing.user, ...thread.user }
    existing.messages = [...existing.messages, ...thread.messages]
      .filter((message, index, all) => all.findIndex((item) => item.id === message.id) === index)
      .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))
    existing.adminUnread += thread.adminUnread
    existing.userUnread += thread.userUnread
    existing.createdAt = [existing.createdAt, thread.createdAt].filter(Boolean).sort()[0] || ''
    existing.updatedAt = [existing.updatedAt, thread.updatedAt].filter(Boolean).sort().at(-1) || ''
  }
  return [...byUser.values()]
}

export function normalizeCustomerServiceState(raw) {
  const source = raw && typeof raw === 'object' ? raw : {}
  const items = Array.isArray(source.threads)
    ? source.threads
    : (Array.isArray(source.conversations) ? source.conversations : [])
  return { version: 2, threads: mergeThreads(items) }
}

function updateThread(state, threadId, updater) {
  const normalized = normalizeCustomerServiceState(state)
  const index = normalized.threads.findIndex((item) => item.id === String(threadId))
  if (index === -1) throw new Error('用户消息不存在')
  const threads = normalized.threads.slice()
  threads[index] = updater(clone(threads[index]))
  return { ...normalized, threads }
}

export function sendUserMessage(state, input) {
  const normalized = normalizeCustomerServiceState(state)
  const message = createCustomerServiceMessage({
    id: input.messageId,
    sender: CUSTOMER_SERVICE_SENDER.USER,
    text: input.text,
    imageDataUrl: input.imageDataUrl,
    createdAt: input.now
  })
  if (!message) return normalized

  const userId = String(input.userId)
  const existing = normalized.threads.find((item) => item.userId === userId)
  if (existing) {
    return updateThread(normalized, existing.id, (thread) => ({
      ...thread,
      user: normalizeUser(input.user, userId),
      messages: [...thread.messages, message],
      adminUnread: thread.adminUnread + 1,
      updatedAt: String(input.now)
    }))
  }

  return {
    ...normalized,
    threads: [{
      id: `user-${userId}`,
      userId,
      user: normalizeUser(input.user, userId),
      messages: [message],
      adminUnread: 1,
      userUnread: 0,
      createdAt: String(input.now),
      updatedAt: String(input.now)
    }, ...normalized.threads]
  }
}

export function sendAgentMessage(state, input) {
  const message = createCustomerServiceMessage({
    id: input.messageId,
    sender: CUSTOMER_SERVICE_SENDER.AGENT,
    text: input.text,
    imageDataUrl: input.imageDataUrl,
    createdAt: input.now
  })
  if (!message) return normalizeCustomerServiceState(state)
  return updateThread(state, input.threadId, (thread) => ({
    ...thread,
    messages: [...thread.messages, message],
    userUnread: thread.userUnread + 1,
    adminUnread: 0,
    updatedAt: String(input.now)
  }))
}

export function markCustomerServiceThreadRead(state, { threadId, reader }) {
  return updateThread(state, threadId, (thread) => ({
    ...thread,
    ...(reader === 'user' ? { userUnread: 0 } : { adminUnread: 0 })
  }))
}

export function filterCustomerServiceThreads(threads, filters = {}) {
  const query = String(filters.query ?? '').trim().toLowerCase()
  return (Array.isArray(threads) ? threads : [])
    .filter((thread) => !filters.unreadOnly || thread.adminUnread > 0)
    .filter((thread) => {
      if (!query) return true
      return [thread.userId, thread.user?.email, thread.user?.nickname, ...thread.messages.map((message) => message.text)]
        .some((value) => String(value ?? '').toLowerCase().includes(query))
    })
    .slice()
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
}

export function summarizeCustomerServiceThreads(threads) {
  const list = Array.isArray(threads) ? threads : []
  return { all: list.length, unread: list.filter((thread) => thread.adminUnread > 0).length }
}
