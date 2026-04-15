import { defineStore } from 'pinia'
import { mockAgentList } from '../admin/mock/agent'

const SESSION_KEY = 'fex-agent-session-v1'
const PROFILES_KEY = 'fex-agent-profiles-v1'

/** 新代理账号默认登录密码（未在本地改过密码时生效） */
export const AGENT_DEFAULT_LOGIN_PASSWORD = 'Agent123456'

function normalizeEmail(email) {
  return String(email).trim().toLowerCase()
}

function loadJson(key, fallback) {
  if (typeof localStorage === 'undefined') return fallback
  try {
    const s = localStorage.getItem(key)
    return s ? JSON.parse(s) : fallback
  } catch {
    return fallback
  }
}

function loadProfiles() {
  return loadJson(PROFILES_KEY, {})
}

function saveProfiles(profiles) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
}

function getProfile(email) {
  if (!email) return null
  const e = normalizeEmail(email)
  const all = loadProfiles()
  return all[e] || null
}

function setProfile(email, patch) {
  const e = normalizeEmail(email)
  const all = loadProfiles()
  all[e] = { ...(all[e] || {}), ...patch }
  saveProfiles(all)
}

function getEffectivePassword(email) {
  const p = getProfile(email)
  if (p?.password && String(p.password).length >= 6) return String(p.password)
  return AGENT_DEFAULT_LOGIN_PASSWORD
}

/** 与 mockAgentList 对齐的可登录代理 */
function resolveAgentAccountByEmail(email) {
  const e = normalizeEmail(email)
  const row = mockAgentList.find((a) => normalizeEmail(a.email) === e)
  if (!row) return null
  return {
    email: e,
    nickname: row.username,
    uid: row.uid
  }
}

/** 手机号展示：+86 138****5678 */
export function formatAgentPhoneMask(dial, nationalDigits) {
  const d = String(nationalDigits).replace(/\D/g, '')
  if (d.length < 4) return `${dial} ${d || '—'}`
  return `${dial} ${d.slice(0, 3)}****${d.slice(-4)}`
}

export const useAgentAuthStore = defineStore('agentAuth', {
  state: () => ({
    email: null,
    nickname: null,
    uid: null,
    token: null,
    _ready: false
  }),
  getters: {
    isLoggedIn: (s) => Boolean(s.token),
    securityProfile(state) {
      if (!state.email) return null
      return getProfile(state.email)
    },
    isPhoneBound(state) {
      const p = getProfile(state.email)
      return Boolean(p?.phone?.dial && p?.phone?.nationalDigits)
    },
    phoneDisplay(state) {
      const p = getProfile(state.email)?.phone
      if (!p?.nationalDigits) return ''
      return formatAgentPhoneMask(p.dial || '+86', p.nationalDigits)
    }
  },
  actions: {
    ensureHydrated() {
      if (this._ready) return
      const data = loadJson(SESSION_KEY, null)
      if (data?.token && data?.email) {
        this.email = data.email
        this.nickname = data.nickname ?? null
        this.token = data.token
        const acc = resolveAgentAccountByEmail(data.email)
        this.uid = data.uid ?? acc?.uid ?? null
        if (acc && !this.nickname) this.nickname = acc.nickname
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
          uid: this.uid,
          token: this.token
        })
      )
    },
    login(email, password) {
      const e = normalizeEmail(email)
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
        return { ok: false, message: '请输入有效邮箱' }
      }
      if (!password || String(password).length < 6) {
        return { ok: false, message: '密码至少 6 位' }
      }
      const account = resolveAgentAccountByEmail(e)
      if (!account) {
        return {
          ok: false,
          message: '该邮箱尚未开通代理。请先在平台完成注册，并由运营在管理后台「代理管理」中将您升级为代理。'
        }
      }
      const expected = getEffectivePassword(e)
      if (String(password) !== expected) {
        return { ok: false, message: '账号或密码错误' }
      }
      this.email = account.email
      this.nickname = account.nickname
      this.uid = account.uid
      this.token = `agent_${Date.now()}`
      this.persistSession()
      return { ok: true }
    },
    logout() {
      this.email = null
      this.nickname = null
      this.uid = null
      this.token = null
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(SESSION_KEY)
      }
    },
    /**
     * @returns {{ ok: boolean, message?: string }}
     */
    changePassword({ oldPassword, newPassword, confirmPassword }) {
      if (!this.email) return { ok: false, message: '未登录' }
      const e = normalizeEmail(this.email)
      const old = String(oldPassword ?? '')
      const next = String(newPassword ?? '')
      const c = String(confirmPassword ?? '')
      if (old !== getEffectivePassword(e)) {
        return { ok: false, message: '当前密码不正确' }
      }
      if (next.length < 6) {
        return { ok: false, message: '新密码至少 6 位' }
      }
      if (next !== c) {
        return { ok: false, message: '两次输入的新密码不一致' }
      }
      if (next === old) {
        return { ok: false, message: '新密码不能与当前密码相同' }
      }
      setProfile(e, { password: next })
      return { ok: true, message: '登录密码已更新，下次请使用新密码登录。' }
    },
    /**
     * 发送短信验证码（本地模拟：生成 6 位数字并短时缓存）
     * @returns {{ ok: boolean, message?: string, previewCode?: string }}
     */
    sendPhoneBindSms() {
      if (!this.email) return { ok: false, message: '未登录' }
      const code = String(Math.floor(100000 + Math.random() * 900000))
      const key = `fex-agent-sms-${normalizeEmail(this.email)}`
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(
          key,
          JSON.stringify({ code, exp: Date.now() + 5 * 60 * 1000 })
        )
      }
      return { ok: true, message: '验证码已发送', previewCode: code }
    },
    /**
     * @returns {{ ok: boolean, message?: string }}
     */
    bindPhone({ dial, nationalDigits, smsCode }) {
      if (!this.email) return { ok: false, message: '未登录' }
      const e = normalizeEmail(this.email)
      const dc = String(dial || '+86').trim() || '+86'
      const digits = String(nationalDigits).replace(/\D/g, '')
      if (digits.length < 5 || digits.length > 15) {
        return { ok: false, message: '请输入有效的手机号码' }
      }
      const c = String(smsCode ?? '').trim()
      if (!/^\d{6}$/.test(c)) {
        return { ok: false, message: '请输入 6 位数字验证码' }
      }
      const key = `fex-agent-sms-${e}`
      let valid = false
      if (typeof sessionStorage !== 'undefined') {
        try {
          const raw = sessionStorage.getItem(key)
          if (raw) {
            const { code, exp } = JSON.parse(raw)
            if (Date.now() <= exp && String(code) === c) valid = true
          }
        } catch {
          valid = false
        }
      }
      if (!valid) {
        return { ok: false, message: '验证码无效或已过期，请重新获取' }
      }
      setProfile(e, {
        phone: {
          dial: dc,
          nationalDigits: digits,
          verifiedAt: new Date().toISOString()
        }
      })
      sessionStorage.removeItem(key)
      return { ok: true, message: '手机号已绑定' }
    }
  }
})
