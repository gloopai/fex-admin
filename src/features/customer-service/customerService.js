export const CUSTOMER_SERVICE_STATUS = Object.freeze({
  WAITING: 'waiting',
  ACTIVE: 'active',
  WAITING_USER: 'waiting-user',
  CLOSED: 'closed'
})

export const CUSTOMER_SERVICE_SENDER = Object.freeze({
  USER: 'user',
  AGENT: 'agent'
})

export const WELCOME_MESSAGE_TEXT = '你好，请问有什么需要帮助的吗？'
export const MAX_CUSTOMER_SERVICE_IMAGE_BYTES = 1024 * 1024

const VALID_STATUSES = new Set(Object.values(CUSTOMER_SERVICE_STATUS))
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

export function createCustomerServiceMessage({
  id,
  sender,
  text = '',
  imageDataUrl = '',
  createdAt = ''
}) {
  const normalizedText = String(text ?? '').trim()
  const normalizedImage = String(imageDataUrl ?? '').trim()
  if (!normalizedText && !normalizedImage) return null
  if (!VALID_SENDERS.has(sender)) throw new Error('无效的消息发送方')

  return {
    id: String(id),
    sender,
    text: normalizedText,
    imageDataUrl: normalizedImage,
    createdAt: String(createdAt)
  }
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

function normalizeConversation(raw) {
  if (!raw || typeof raw !== 'object' || raw.id == null || raw.userId == null) return null
  const status = VALID_STATUSES.has(raw.status) ? raw.status : CUSTOMER_SERVICE_STATUS.WAITING
  const messages = Array.isArray(raw.messages) ? raw.messages.map(normalizeMessage).filter(Boolean) : []
  return {
    id: String(raw.id),
    userId: String(raw.userId),
    user: normalizeUser(raw.user, raw.userId),
    status,
    messages,
    adminUnread: asNonNegativeInteger(raw.adminUnread),
    userUnread: asNonNegativeInteger(raw.userUnread),
    internalNote: asString(raw.internalNote),
    createdAt: asString(raw.createdAt),
    updatedAt: asString(raw.updatedAt, asString(raw.createdAt)),
    closedAt: status === CUSTOMER_SERVICE_STATUS.CLOSED ? asString(raw.closedAt) : ''
  }
}

export function normalizeCustomerServiceState(raw) {
  const source = raw && typeof raw === 'object' ? raw : {}
  const conversations = Array.isArray(source.conversations)
    ? source.conversations.map(normalizeConversation).filter(Boolean)
    : []
  return { version: 1, conversations }
}

function updateConversation(state, conversationId, updater) {
  const normalized = normalizeCustomerServiceState(state)
  const index = normalized.conversations.findIndex((item) => item.id === String(conversationId))
  if (index === -1) throw new Error('会话不存在')
  const conversations = normalized.conversations.slice()
  conversations[index] = updater(clone(conversations[index]))
  return { ...normalized, conversations }
}

function findOpenConversation(conversations, userId) {
  return conversations.find(
    (item) => item.userId === String(userId) && item.status !== CUSTOMER_SERVICE_STATUS.CLOSED
  )
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

  const open = findOpenConversation(normalized.conversations, input.userId)
  if (open) {
    return updateConversation(normalized, open.id, (conversation) => ({
      ...conversation,
      user: normalizeUser(input.user, input.userId),
      status: CUSTOMER_SERVICE_STATUS.WAITING,
      messages: [...conversation.messages, message],
      adminUnread: conversation.adminUnread + 1,
      updatedAt: String(input.now),
      closedAt: ''
    }))
  }

  const conversation = {
    id: String(input.conversationId),
    userId: String(input.userId),
    user: normalizeUser(input.user, input.userId),
    status: CUSTOMER_SERVICE_STATUS.WAITING,
    messages: [message],
    adminUnread: 1,
    userUnread: 0,
    internalNote: '',
    createdAt: String(input.now),
    updatedAt: String(input.now),
    closedAt: ''
  }
  return { ...normalized, conversations: [conversation, ...normalized.conversations] }
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
  return updateConversation(state, input.conversationId, (conversation) => {
    if (conversation.status === CUSTOMER_SERVICE_STATUS.CLOSED) throw new Error('会话已结束')
    return {
      ...conversation,
      status: CUSTOMER_SERVICE_STATUS.WAITING_USER,
      messages: [...conversation.messages, message],
      userUnread: conversation.userUnread + 1,
      adminUnread: 0,
      updatedAt: String(input.now)
    }
  })
}

export function markConversationRead(state, { conversationId, reader }) {
  return updateConversation(state, conversationId, (conversation) => ({
    ...conversation,
    ...(reader === 'user' ? { userUnread: 0 } : { adminUnread: 0 })
  }))
}

export function markConversationActive(state, { conversationId, now }) {
  return updateConversation(state, conversationId, (conversation) => {
    if (conversation.status === CUSTOMER_SERVICE_STATUS.CLOSED) throw new Error('会话已结束')
    return { ...conversation, status: CUSTOMER_SERVICE_STATUS.ACTIVE, updatedAt: String(now) }
  })
}

export function closeConversation(state, { conversationId, now }) {
  return updateConversation(state, conversationId, (conversation) => ({
    ...conversation,
    status: CUSTOMER_SERVICE_STATUS.CLOSED,
    adminUnread: 0,
    closedAt: String(now),
    updatedAt: String(now)
  }))
}

export function saveConversationNote(state, { conversationId, note, now }) {
  return updateConversation(state, conversationId, (conversation) => ({
    ...conversation,
    internalNote: String(note ?? '').trim(),
    updatedAt: String(now)
  }))
}

export function filterCustomerServiceConversations(conversations, filters = {}) {
  const query = String(filters.query ?? '').trim().toLowerCase()
  const status = String(filters.status ?? '')
  return (Array.isArray(conversations) ? conversations : [])
    .filter((conversation) => !status || status === 'all' || conversation.status === status)
    .filter((conversation) => !filters.unreadOnly || conversation.adminUnread > 0)
    .filter((conversation) => {
      if (!query) return true
      const lastMessage = conversation.messages.at(-1)
      return [
        conversation.userId,
        conversation.user?.email,
        conversation.user?.nickname,
        lastMessage?.text
      ].some((value) => String(value ?? '').toLowerCase().includes(query))
    })
    .slice()
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
}

export function summarizeCustomerServiceConversations(conversations) {
  const summary = { all: 0, waiting: 0, active: 0, 'waiting-user': 0, closed: 0, unread: 0 }
  for (const conversation of Array.isArray(conversations) ? conversations : []) {
    summary.all += 1
    if (Object.hasOwn(summary, conversation.status)) summary[conversation.status] += 1
    if (conversation.adminUnread > 0) summary.unread += 1
  }
  return summary
}
