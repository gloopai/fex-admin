/**
 * 窄屏壳层「快捷入口」仅展示这些（其余入口保留在 PC 侧栏或总览页内链）。
 */
export const PERSONAL_CENTER_SHELL_MOBILE_PRIMARY_KEYS = new Set([
  'assets',
  'ledger',
  'security',
  'verify',
  'withdraw-addresses',
  'referral',
  'preferences'
])

/**
 * @param {'/front'} prefix
 */
export function getPersonalCenterShellMobileNavItems(prefix) {
  return getPersonalCenterNavItems(prefix).filter((item) =>
    PERSONAL_CENTER_SHELL_MOBILE_PRIMARY_KEYS.has(item.key)
  )
}

/**
 * 个人中心侧栏（PC）与快捷入口（移动）共用配置。
 * @param {'/front'} prefix
 */
export function getPersonalCenterNavItems(prefix) {
  return [
    {
      key: 'overview',
      label: '账户总览',
      description: '资料与资产概览',
      to: `${prefix}/personal-center`,
      match: 'exact'
    },
    {
      key: 'assets',
      label: '资产',
      description: '充提、划转与账户分布',
      to: `${prefix}/personal-center/assets`,
      match: 'prefix'
    },
    {
      key: 'ledger',
      label: '账变记录',
      description: '资金流水与账务变动',
      to: `${prefix}/personal-center/ledger`,
      match: 'prefix'
    },
    {
      key: 'security',
      label: '安全中心',
      description: '手机、邮箱与两步验证',
      to: `${prefix}/personal-center/security`,
      match: 'prefix'
    },
    {
      key: 'verify',
      label: '身份认证',
      description: 'KYC 等级与材料',
      to: `${prefix}/personal-center/verification`,
      match: 'prefix'
    },
    {
      key: 'withdraw-addresses',
      label: '提币地址',
      description: '链上白名单地址',
      to: `${prefix}/personal-center/withdraw-addresses`,
      match: 'prefix'
    },
    {
      key: 'fees-vip',
      label: '费率与 VIP',
      description: '手续费与交易量',
      to: `${prefix}/personal-center/fees-vip`,
      match: 'prefix'
    },
    {
      key: 'referral',
      label: '邀请返佣',
      description: '邀请码与奖励',
      to: `${prefix}/personal-center/referral`,
      match: 'prefix'
    },
    {
      key: 'notifications',
      label: '消息通知',
      description: '系统与安全提醒',
      to: `${prefix}/personal-center/notifications`,
      match: 'prefix'
    },
    {
      key: 'preferences',
      label: '账户设置',
      description: '语言、时区与交易偏好',
      to: `${prefix}/personal-center/preferences`,
      match: 'prefix'
    }
  ]
}
