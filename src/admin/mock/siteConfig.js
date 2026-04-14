import {
  DEFAULT_I18N_BLOCK,
  FRONT_LOCALE_CATALOG,
  PHONE_DIAL_PRESETS
} from '../constants/i18nCatalog'

export const SITE_CONFIG_STORAGE_KEY = 'fex-admin-site-config'

const STORAGE_KEY = SITE_CONFIG_STORAGE_KEY

const VALID_LOCALE_CODES = new Set(FRONT_LOCALE_CATALOG.map((x) => x.code))
const VALID_DIAL = new Set(PHONE_DIAL_PRESETS.map((x) => x.dial))

/** SMTP 默认结构（演示持久化；生产环境密码应由后端加密存储） */
export const DEFAULT_SMTP_CONFIG = {
  /** 是否启用系统发信 */
  enabled: false,
  host: '',
  port: 587,
  /** none | tls | ssl */
  encryption: 'tls',
  username: '',
  password: '',
  /** 发件人显示名 */
  fromName: '',
  /** 发件人邮箱 */
  fromEmail: '',
  /** 可选，回复地址 */
  replyTo: ''
}

export const DEFAULT_SITE_CONFIG = {
  siteName: 'CryptoX Pro',
  /** PC 端 Logo（完整 URL 或 data URL） */
  logoUrlPc: '',
  /** 移动端 Logo；未设置时前台侧栏等会回退为 PC Logo */
  logoUrlMobile: '',
  /** 浏览器默认标题，留空则使用站点名称 */
  documentTitle: '',
  /** 管理台侧栏等处的展示副标题 */
  tagline: '',
  /** Meta description */
  seoDescription: '',
  /** Meta keywords，逗号分隔 */
  seoKeywords: '',
  /** Open Graph / 分享预览图 URL */
  seoOgImage: '',
  /** 是否在前台登录页展示区块链钱包登录入口 */
  walletLoginEnabled: true,
  /** 邮箱登录/注册是否显示图形验证码（前端演示校验，接入后端后替换为真实验证码） */
  loginCaptchaEnabled: false,
  /** 登录与注册是否必填邀请码 */
  inviteCodeRequired: false,
  /** 启用后，以下登录与手机区号配置才会应用到前台；关闭则使用内置默认 */
  loginSettingsEnabled: true,
  /** 手机登录/安全绑定可选区号（loginSettingsEnabled 为 true 时生效） */
  allowedDialCodes: ['+86'],
  /** 启用后，以下多语言配置才会应用到前台；关闭则固定简体中文并隐藏语言切换 */
  languageSettingsEnabled: true,
  /** 邮件服务器（SMTP） */
  smtp: { ...DEFAULT_SMTP_CONFIG },
  /** 多语言（languageSettingsEnabled 为 true 时生效） */
  i18n: { ...DEFAULT_I18N_BLOCK }
}

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed ? parsed : null
  } catch {
    return null
  }
}

function normalizeSmtp(raw) {
  const d = { ...DEFAULT_SMTP_CONFIG }
  if (!raw || typeof raw !== 'object') return d
  const portNum = Number(raw.port)
  return {
    enabled: typeof raw.enabled === 'boolean' ? raw.enabled : d.enabled,
    host: typeof raw.host === 'string' ? raw.host.trim() : '',
    port: Number.isFinite(portNum) ? Math.min(65535, Math.max(1, Math.round(portNum))) : d.port,
    encryption: ['none', 'tls', 'ssl'].includes(raw.encryption) ? raw.encryption : d.encryption,
    username: typeof raw.username === 'string' ? raw.username : '',
    password: typeof raw.password === 'string' ? raw.password : '',
    fromName: typeof raw.fromName === 'string' ? raw.fromName.trim() : '',
    fromEmail: typeof raw.fromEmail === 'string' ? raw.fromEmail.trim() : '',
    replyTo: typeof raw.replyTo === 'string' ? raw.replyTo.trim() : ''
  }
}

function normalizeAllowedDialCodes(raw) {
  if (!Array.isArray(raw)) return ['+86']
  const d = [...new Set(raw.filter((x) => VALID_DIAL.has(x)))]
  return d.length ? d : ['+86']
}

function normalizeI18n(raw) {
  const d = { ...DEFAULT_I18N_BLOCK }
  if (!raw || typeof raw !== 'object') return d
  let enabled = Array.isArray(raw.enabledLocales)
    ? raw.enabledLocales.filter((c) => VALID_LOCALE_CODES.has(c))
    : d.enabledLocales
  if (enabled.length === 0) enabled = [...d.enabledLocales]
  let def = typeof raw.defaultLocale === 'string' && VALID_LOCALE_CODES.has(raw.defaultLocale)
    ? raw.defaultLocale
    : d.defaultLocale
  if (!enabled.includes(def)) def = enabled[0]

  return {
    enabledLocales: enabled,
    defaultLocale: def,
    languageSwitcherEnabled:
      typeof raw.languageSwitcherEnabled === 'boolean' ? raw.languageSwitcherEnabled : d.languageSwitcherEnabled
  }
}

function normalizeSiteConfig(raw) {
  const merged = { ...DEFAULT_SITE_CONFIG, ...(raw && typeof raw === 'object' ? raw : {}) }
  const nestedDials = raw?.i18n && Array.isArray(raw.i18n.allowedDialCodes) ? raw.i18n.allowedDialCodes : null
  if (nestedDials && nestedDials.length && (!raw?.allowedDialCodes || !Array.isArray(raw.allowedDialCodes))) {
    merged.allowedDialCodes = nestedDials
  }
  merged.loginSettingsEnabled =
    typeof merged.loginSettingsEnabled === 'boolean' ? merged.loginSettingsEnabled : DEFAULT_SITE_CONFIG.loginSettingsEnabled
  merged.languageSettingsEnabled =
    typeof merged.languageSettingsEnabled === 'boolean'
      ? merged.languageSettingsEnabled
      : DEFAULT_SITE_CONFIG.languageSettingsEnabled
  merged.allowedDialCodes = normalizeAllowedDialCodes(merged.allowedDialCodes)
  merged.smtp = normalizeSmtp(merged.smtp)
  merged.i18n = normalizeI18n(merged.i18n)
  const legacy = merged.logoUrl
  if (typeof legacy === 'string' && legacy && !merged.logoUrlPc && !merged.logoUrlMobile) {
    merged.logoUrlPc = legacy
    merged.logoUrlMobile = legacy
  }
  if ('logoUrl' in merged) delete merged.logoUrl
  return merged
}

/** 同步读取当前站点配置（侧栏等组件使用） */
export function getSiteConfigSnapshot() {
  return normalizeSiteConfig(readStored())
}

let memory = normalizeSiteConfig(readStored())

export const siteConfigApi = {
  getSiteConfig: () =>
    new Promise((resolve) => {
      setTimeout(() => {
        memory = normalizeSiteConfig(readStored())
        resolve({
          success: true,
          data: { ...memory }
        })
      }, 200)
    }),

  updateSiteConfig: (config) =>
    new Promise((resolve) => {
      setTimeout(() => {
        memory = normalizeSiteConfig({
          ...DEFAULT_SITE_CONFIG,
          siteName: String(config.siteName ?? '').trim() || DEFAULT_SITE_CONFIG.siteName,
          logoUrlPc: typeof config.logoUrlPc === 'string' ? config.logoUrlPc : '',
          logoUrlMobile: typeof config.logoUrlMobile === 'string' ? config.logoUrlMobile : '',
          documentTitle: typeof config.documentTitle === 'string' ? config.documentTitle.trim() : '',
          tagline: typeof config.tagline === 'string' ? config.tagline.trim() : '',
          seoDescription: typeof config.seoDescription === 'string' ? config.seoDescription.trim() : '',
          seoKeywords: typeof config.seoKeywords === 'string' ? config.seoKeywords.trim() : '',
          seoOgImage: typeof config.seoOgImage === 'string' ? config.seoOgImage.trim() : '',
          walletLoginEnabled:
            typeof config.walletLoginEnabled === 'boolean'
              ? config.walletLoginEnabled
              : DEFAULT_SITE_CONFIG.walletLoginEnabled,
          loginCaptchaEnabled:
            typeof config.loginCaptchaEnabled === 'boolean'
              ? config.loginCaptchaEnabled
              : DEFAULT_SITE_CONFIG.loginCaptchaEnabled,
          inviteCodeRequired:
            typeof config.inviteCodeRequired === 'boolean'
              ? config.inviteCodeRequired
              : DEFAULT_SITE_CONFIG.inviteCodeRequired,
          loginSettingsEnabled:
            typeof config.loginSettingsEnabled === 'boolean'
              ? config.loginSettingsEnabled
              : DEFAULT_SITE_CONFIG.loginSettingsEnabled,
          languageSettingsEnabled:
            typeof config.languageSettingsEnabled === 'boolean'
              ? config.languageSettingsEnabled
              : DEFAULT_SITE_CONFIG.languageSettingsEnabled,
          allowedDialCodes: normalizeAllowedDialCodes(config.allowedDialCodes),
          smtp: normalizeSmtp(config.smtp),
          i18n: normalizeI18n(config.i18n)
        })
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(memory))
        } catch {
          /* ignore quota */
        }
        resolve({
          success: true,
          message: '站点配置已保存'
        })
      }, 400)
    }),

  /**
   * 发送测试邮件（演示：不真正连接 SMTP，仅校验必填项）
   * @param {{ to: string }} params
   */
  testSmtp: (params) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        const to = String(params?.to ?? '').trim()
        if (!to) {
          reject(new Error('请填写收件人邮箱'))
          return
        }
        const s = memory.smtp || normalizeSmtp(null)
        if (!s.enabled) {
          reject(new Error('请先在上方开启「启用 SMTP」并保存配置'))
          return
        }
        if (!s.host) {
          reject(new Error('请填写 SMTP 服务器地址'))
          return
        }
        resolve({
          success: true,
          message: `测试邮件已模拟发送至 ${to}（演示环境未真实投递，接入后端后由服务端发送）`
        })
      }, 600)
    })
}
