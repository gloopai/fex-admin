import { defineStore } from 'pinia'
import { frontDemoSecuritySeedEmails, useFrontAuthStore } from './frontAuth'

const STORAGE_KEY = 'fex-front-security-bindings-v1'

const emptyBindings = () => ({
  phoneBound: false,
  emailBound: false,
  mfaBound: false
})

function loadJson(key, fallback) {
  if (typeof localStorage === 'undefined') return fallback
  try {
    const s = localStorage.getItem(key)
    return s ? JSON.parse(s) : fallback
  } catch {
    return fallback
  }
}

export const useFrontSecurityStore = defineStore('frontSecurity', {
  state: () => ({
    byEmail: {},
    _ready: false
  }),
  getters: {
    currentBindings() {
      const auth = useFrontAuthStore()
      const email = auth.email
      if (!email) return emptyBindings()
      const row = this.byEmail[email]
      return row ? { ...emptyBindings(), ...row } : emptyBindings()
    },
    hasAnyVerifyChannel() {
      const b = this.currentBindings
      return Boolean(b.phoneBound || b.emailBound || b.mfaBound)
    }
  },
  actions: {
    ensureHydrated() {
      if (this._ready) return
      const raw = loadJson(STORAGE_KEY, null)
      this.byEmail = raw && typeof raw === 'object' ? { ...raw } : {}
      const demoFull = { phoneBound: true, emailBound: true, mfaBound: true }
      for (const email of frontDemoSecuritySeedEmails()) {
        this.byEmail[email] = { ...demoFull }
      }
      this.persist()
      this._ready = true
    },
    persist() {
      if (typeof localStorage === 'undefined') return
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.byEmail))
    },
    updateBindings(partial) {
      const auth = useFrontAuthStore()
      const email = auth.email
      if (!email) return
      const cur = this.byEmail[email] ?? emptyBindings()
      this.byEmail[email] = { ...cur, ...partial }
      this.persist()
    },
    /** 按邮箱读取（登录流程中在写入 auth 会话后即可调用） */
    bindingsForEmail(email) {
      if (!email) return emptyBindings()
      const row = this.byEmail[email]
      return row ? { ...emptyBindings(), ...row } : emptyBindings()
    },
    hasAnyVerifyChannelForEmail(email) {
      const b = this.bindingsForEmail(email)
      return Boolean(b.phoneBound || b.emailBound || b.mfaBound)
    }
  }
})
