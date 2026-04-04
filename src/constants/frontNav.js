/**
 * 前台导航链接（/front）。「更多」演示入口在右下角 CrossPlatformFloatNav。
 * @param {'/front'} prefix
 */

/** 左侧主导航：首页、行情、资产 */
export function getFrontMainNavLinks(prefix) {
  return [
    { key: 'home', label: '首页', to: `${prefix}/home` },
    { key: 'market', label: '行情', to: `${prefix}/market` },
    { key: 'assets', label: '资产', to: `${prefix}/personal-center/assets` }
  ]
}

/** 交易下拉 */
export function getFrontTradeNavLinks(prefix) {
  return [
    { key: 'trade-spot', label: '现货', to: `${prefix}/trade/spot` },
    { key: 'trade-perp', label: '永续合约', to: `${prefix}/trade/perpetual` },
    { key: 'trade-delivery', label: '交割合约', to: `${prefix}/trade/delivery` }
  ]
}

/**
 * 底部 Tab（窄屏 <lg）
 * @param {'/front'} prefix
 */
export function getFrontBottomTabs(prefix) {
  return [
    { key: 'home', label: '首页', to: `${prefix}/home` },
    { key: 'market', label: '行情', to: `${prefix}/market` },
    { key: 'trade', label: '交易', to: `${prefix}/trade/perpetual` },
    { key: 'assets', label: '资产', to: `${prefix}/personal-center/assets` },
    { key: 'me', label: '我的', to: `${prefix}/personal-center` }
  ]
}

/** 演示 / 工具入口（更多） */
export function getFrontMoreDemoLinks(prefix) {
  return [
    { key: 'verify', label: '身份认证', to: `${prefix}/personal-center/verification` },
    { key: 'perm', label: '账户权限', to: `${prefix}/verification-permission-demo` },
    { key: 'popup', label: '安全与验证', to: `${prefix}/verification-popup-demo` }
  ]
}

/** @deprecated 仅兼容旧用法 */
export function getFrontNavItems(prefix) {
  return [
    ...getFrontMainNavLinks(prefix).map((i) => ({ ...i, primary: true })),
    { key: 'personal', label: '个人中心', to: `${prefix}/personal-center`, primary: true },
    ...getFrontMoreDemoLinks(prefix).map((i) => ({ ...i, primary: false }))
  ]
}
