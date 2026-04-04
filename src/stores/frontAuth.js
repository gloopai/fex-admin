import { defineStore } from 'pinia'

const SESSION_KEY = 'fex-front-session-v1'
const USERS_KEY = 'fex-front-users-v1'

/**
 * 内置演示账号（仅本地 mock）。每次恢复会话前会合并进用户表，无需先注册即可登录。
 * 对接真实接口后可整段删除。
 */
export const FRONT_DEMO_SEED_USERS = [
  { email: 'demo@fex.local', password: 'Demo123456', nickname: '演示账户' },
  { email: 'trader@fex.local', password: 'Demo123456', nickname: '交易员演示' }
]

function loadJson(key, fallback) {
  if (typeof localStorage === 'undefined') return fallback
  try {
    const s = localStorage.getItem(key)
    return s ? JSON.parse(s) : fallback
  } catch {
    return fallback
  }
}

/** 示例用户表：仅本地演示，对接真实接口后删除 */
function loadUsers() {
  return loadJson(USERS_KEY, [])
}

function saveUsers(users) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function normalizeEmail(email) {
  return String(email).trim().toLowerCase()
}

/** 保证演示账号存在于本地用户表并与种子一致（幂等） */
function mergeDemoUsersIntoStorage() {
  if (typeof localStorage === 'undefined') return
  const users = loadUsers()
  let changed = false
  for (const d of FRONT_DEMO_SEED_USERS) {
    const e = normalizeEmail(d.email)
    const row = { email: e, password: d.password, nickname: d.nickname }
    const i = users.findIndex((u) => u.email === e)
    if (i === -1) {
      users.push(row)
      changed = true
    } else {
      const prev = users[i]
      if (prev.password !== row.password || prev.nickname !== row.nickname) {
        users[i] = row
        changed = true
      }
    }
  }
  if (changed) saveUsers(users)
}

export const useFrontAuthStore = defineStore('frontAuth', {
  state: () => ({
    email: null,
    nickname: null,
    token: null,
    _ready: false
  }),
  getters: {
    isLoggedIn: (s) => Boolean(s.token)
  },
  actions: {
    ensureHydrated() {
      mergeDemoUsersIntoStorage()
      if (this._ready) return
      const data = loadJson(SESSION_KEY, null)
      if (data?.token && data?.email) {
        this.email = data.email
        this.nickname = data.nickname ?? null
        this.token = data.token
      }
      this._ready = true
    },
    persistSession() {
      if (typeof localStorage === 'undefined') return
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          email: this.email,
          nickname: this.nickname,
          token: this.token
        })
      )
    },
    login(email, password) {
      mergeDemoUsersIntoStorage()
      const e = normalizeEmail(email)
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
        return { ok: false, message: '请输入有效邮箱' }
      }
      if (!password || String(password).length < 6) {
        return { ok: false, message: '密码至少 6 位' }
      }
      const users = loadUsers()
      const row = users.find((u) => u.email === e)
      if (!row) {
        return { ok: false, message: '该邮箱尚未注册' }
      }
      if (row.password !== String(password)) {
        return { ok: false, message: '密码错误' }
      }
      this.email = e
      this.nickname = row.nickname || e.split('@')[0]
      this.token = `mock_${Date.now()}`
      this.persistSession()
      return { ok: true }
    },
    register(email, password, confirmPassword, nickname) {
      mergeDemoUsersIntoStorage()
      const e = normalizeEmail(email)
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
        return { ok: false, message: '请输入有效邮箱' }
      }
      if (!password || String(password).length < 6) {
        return { ok: false, message: '密码至少 6 位' }
      }
      if (password !== confirmPassword) {
        return { ok: false, message: '两次密码不一致' }
      }
      const users = loadUsers()
      if (users.some((u) => u.email === e)) {
        return { ok: false, message: '该邮箱已注册，请直接登录' }
      }
      const nick = (nickname && String(nickname).trim()) || e.split('@')[0]
      users.push({ email: e, password: String(password), nickname: nick })
      saveUsers(users)
      this.email = e
      this.nickname = nick
      this.token = `mock_${Date.now()}`
      this.persistSession()
      return { ok: true }
    },
    logout() {
      this.email = null
      this.nickname = null
      this.token = null
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(SESSION_KEY)
      }
    }
  }
})
