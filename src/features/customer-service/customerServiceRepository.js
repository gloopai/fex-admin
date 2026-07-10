import {
  markCustomerServiceThreadRead,
  normalizeCustomerServiceState,
  sendAgentMessage,
  sendUserMessage
} from './customerService.js'

export const CUSTOMER_SERVICE_STORAGE_KEY = 'fex-customer-service-v1'
export const CUSTOMER_SERVICE_UPDATED_EVENT = 'fex-customer-service-updated'

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function createFallbackStorage() {
  const values = new Map()
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key) }
}

function defaultId(prefix) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return `${prefix}-${crypto.randomUUID()}`
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function createCustomerServiceRepository({
  storage = typeof localStorage === 'undefined' ? createFallbackStorage() : localStorage,
  eventTarget = typeof window === 'undefined' ? new EventTarget() : window,
  now = () => new Date().toISOString(),
  createId = defaultId
} = {}) {
  const listeners = new Set()

  function read() {
    const raw = storage.getItem(CUSTOMER_SERVICE_STORAGE_KEY)
    if (!raw) return normalizeCustomerServiceState(null)
    try { return normalizeCustomerServiceState(JSON.parse(raw)) } catch { return normalizeCustomerServiceState(null) }
  }

  function notify() {
    const snapshot = read()
    for (const listener of listeners) listener(clone(snapshot))
  }

  function write(next) {
    const normalized = normalizeCustomerServiceState(next)
    storage.setItem(CUSTOMER_SERVICE_STORAGE_KEY, JSON.stringify(normalized))
    notify()
    eventTarget.dispatchEvent?.(new Event(CUSTOMER_SERVICE_UPDATED_EVENT))
    return clone(normalized)
  }

  function mutate(operation) {
    return write(operation(read()))
  }

  function onStorage(event) {
    if (event?.key && event.key !== CUSTOMER_SERVICE_STORAGE_KEY) return
    notify()
  }
  eventTarget.addEventListener?.('storage', onStorage)

  return {
    getSnapshot: () => clone(read()),
    subscribe(listener) {
      listeners.add(listener)
      listener(clone(read()))
      return () => listeners.delete(listener)
    },
    sendUserMessage(input) {
      return mutate((state) => sendUserMessage(state, { ...input, now: input.now ?? now(), messageId: input.messageId ?? createId('message') }))
    },
    sendAgentMessage(input) {
      return mutate((state) => sendAgentMessage(state, { ...input, now: input.now ?? now(), messageId: input.messageId ?? createId('message') }))
    },
    markRead(input) {
      return mutate((state) => markCustomerServiceThreadRead(state, input))
    },
    seedDemoData() {
      const current = read()
      if (current.threads.length) return clone(current)
      const seededAt = now()
      let seeded = sendUserMessage(current, {
        userId: '20018', user: { uid: '20018', email: 'alice@example.com', nickname: 'Alice', vip: 3, kyc: '高级认证', creditScore: 86, accountStatus: '正常' },
        text: '您好，我的提币审核已经等待一段时间了。', now: seededAt, messageId: createId('message')
      })
      seeded = sendUserMessage(seeded, {
        userId: '30526', user: { uid: '30526', email: 'martin@example.com', nickname: 'Martin', vip: 1, kyc: '初级认证', creditScore: 68, accountStatus: '正常' },
        text: '请问永续合约的资金费率在哪里查看？', now: seededAt, messageId: createId('message')
      })
      return write(seeded)
    },
    dispose() {
      listeners.clear()
      eventTarget.removeEventListener?.('storage', onStorage)
    }
  }
}

export const customerServiceRepository = createCustomerServiceRepository()
