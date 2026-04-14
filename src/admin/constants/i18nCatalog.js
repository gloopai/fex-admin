/**
 * 前台可选语言（与顶栏、localStorage 偏好 code 一致）
 */
export const FRONT_LOCALE_CATALOG = [
  { code: 'zh-CN', label: '简体中文', short: '简中' },
  { code: 'zh-TW', label: '繁體中文', short: '繁中' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ja', label: '日本語', short: 'JA' },
  { code: 'ko', label: '한국어', short: 'KO' }
]

/** 国际电话区号（后台勾选「允许的区号」） */
export const PHONE_DIAL_PRESETS = [
  { dial: '+86', label: '中国 +86' },
  { dial: '+852', label: '中国香港 +852' },
  { dial: '+853', label: '中国澳门 +853' },
  { dial: '+886', label: '中国台湾 +886' },
  { dial: '+65', label: '新加坡 +65' },
  { dial: '+81', label: '日本 +81' },
  { dial: '+82', label: '韩国 +82' },
  { dial: '+1', label: '美国/加拿大 +1' },
  { dial: '+44', label: '英国 +44' },
  { dial: '+61', label: '澳大利亚 +61' },
  { dial: '+971', label: '阿联酋 +971' }
]

export const DEFAULT_I18N_BLOCK = {
  /** 前台启用的语言 code 列表（languageSettingsEnabled 为 true 时生效） */
  enabledLocales: ['zh-CN', 'en'],
  /** 默认语言 */
  defaultLocale: 'zh-CN',
  /** 顶栏是否显示语言切换 */
  languageSwitcherEnabled: true
}
